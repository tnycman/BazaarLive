import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isSimpleAuthenticated } from "./auth/SimpleAuthSetup";
import { marketplaceRouter } from "./routes/marketplace";
import { analyticsRouter } from "./routes/analytics";
import vectorSearchRouter from "./routes/vector-search";
import { registerAiAssistantRoutes } from "./routes/aiAssistantRoutes";
import fashionRouter from "./routes/fashionRoutes";
import { createAnalyticsService } from "./services/AnalyticsService";
import { createLegacyCompatibilityMiddleware } from "./middleware/LegacyCompatibilityMiddleware";
import { 
  insertListingSchema, 
  insertCommentSchema, 
  insertMessageSchema,
  insertFollowSchema,
  insertLikeSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple in-memory cache for brand metadata (TTL 5 minutes)
  const brandMetaCache = new Map<string, { data: any; expiresAt: number }>();
  const BRAND_META_TTL_MS = 5 * 60 * 1000;
  const humanize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Simple Auth setup to get the app working
  await setupSimpleAuth(app);

  // Use simple authentication middleware
  const authMiddleware = isSimpleAuthenticated;

  // Setup legacy compatibility middleware for backward compatibility
  const analyticsService = createAnalyticsService();
  const legacyCompatibility = createLegacyCompatibilityMiddleware(analyticsService, {
    enableDeprecationWarnings: process.env.NODE_ENV !== 'production',
    enableUsageTracking: true,
    enableResponseHeaders: true,
    migrationDeadline: new Date('2024-12-31')
  });

  // Apply legacy compatibility middleware before all routes
  app.use(legacyCompatibility.handleLegacyRequests());

  // API Migration guide endpoint
  app.get('/api/migration-guide', async (req, res) => {
    try {
      const migrationGuide = legacyCompatibility.generateMigrationGuideResponse();
      res.json({
        success: true,
        data: migrationGuide,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching migration guide:", error);
      res.status(500).json({ message: "Failed to fetch migration guide" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.put('/api/users/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/search/:query', async (req, res) => {
    try {
      const { query } = req.params;
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Legacy listing routes (maintained for backward compatibility)
  app.post('/api/listings', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = insertListingSchema.parse(req.body);
      
      // Check if this is a fashion listing - redirect to fashion API
      if (listingData.category === 'fashion') {
        return res.status(400).json({ 
          message: "Fashion listings should use the new fashion API",
          newEndpoint: "POST /api/fashion/listings",
          migrationGuide: "https://docs.bazaarlive.com/api/migration-guide",
          deprecationNotice: "POST /api/listings for fashion items is deprecated and will be removed on 2024-12-31"
        });
      }
      
      // For non-fashion categories, return error for now
      return res.status(400).json({
        message: "Only fashion listings are currently supported",
        supportedCategories: ["fashion"],
        useEndpoint: "POST /api/fashion/listings"
      });
      
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  // Brand metadata route (placeholder – replace with real data source in production)
  app.get('/api/brands/:brandId', async (req, res) => {
    try {
      const brandId = String(req.params.brandId || '').toLowerCase().trim();
      if (!brandId || brandId.length > 64) {
        return res.status(400).json({ message: 'invalid brand id' });
      }
      const now = Date.now();
      const cached = brandMetaCache.get(brandId);
      if (cached && cached.expiresAt > now) {
        return res.json(cached.data);
      }

      // In a real system, fetch from DB/catalog service. For now, synthesize minimal metadata.
      const data = {
        id: brandId,
        name: humanize(brandId),
        description: `Shop ${humanize(brandId)} across categories from verified sellers`,
        logoUrl: `/assets/brands/${brandId}.svg`,
        updatedAt: new Date().toISOString()
      };
      brandMetaCache.set(brandId, { data, expiresAt: now + BRAND_META_TTL_MS });
      return res.json(data);
    } catch (error) {
      console.error('Error reading brand metadata:', error);
      return res.status(500).json({ message: 'Failed to read brand metadata' });
    }
  });

  app.get('/api/listings', async (req, res) => {
    try {
      const { category, search, sellerId, limit, offset, brands } = req.query as Record<string, string>;

      const listings = await storage.getListings({
        category,
        search,
        sellerId,
        limit: limit ? parseInt(String(limit)) : undefined,
        offset: offset ? parseInt(String(offset)) : undefined,
      });

      // Optional server-side brand filtering if 'brands' is provided (comma list)
      if (brands && brands.trim()) {
        const normalized = brands
          .split(',')
          .map((b) => b.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 50);
        const MAX_ITEM_LEN = 64;
        if (normalized.some((b) => b.length > MAX_ITEM_LEN)) {
          return res.status(400).json({ message: 'brand filter value too long' });
        }
        const filtered = listings.filter((l) =>
          typeof (l as any).brand === 'string' && normalized.some((b) => (l as any).brand.toLowerCase().includes(b))
        );
        return res.json(filtered);
      }

      // Default path without brand filter
      
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Aggregate listings across multiple categories with server-side merge/sort/pagination
  app.get('/api/listings/aggregate', async (req, res) => {
    try {
      const started = Date.now();
      const traceId = (req.headers['x-trace-id'] as string) || Math.random().toString(36).slice(2);
      const verticalRaw = String(req.query.vertical || '').trim();
      const categoriesStrRaw = String(req.query.categories || '').trim();
      const subcategoryRaw = req.query.subcategory ? String(req.query.subcategory) : undefined;
      const leafRaw = req.query.leaf ? String(req.query.leaf) : undefined;
      const sortBy = (req.query.sortBy ? String(req.query.sortBy) : 'newest') as 'newest' | 'price_low' | 'price_high' | 'most_liked';
      const limit = Math.max(1, Math.min(100, req.query.limit ? parseInt(String(req.query.limit)) : 60));
      const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
      // Filters
      const { normalizeCommaList, parsePrice, validateConditions } = await import('./config/FiltersValidation');
      const brands = normalizeCommaList(req.query.brands as any);
      const sizes = normalizeCommaList(req.query.sizes as any);
      const minPrice = parsePrice(req.query.minPrice);
      const maxPrice = parsePrice(req.query.maxPrice);
      const conditionsList = normalizeCommaList(req.query.conditions as any);
      const condRes = validateConditions(conditionsList);
      if (!condRes.ok) return res.status(400).json({ message: condRes.reason, traceId });

      if (!verticalRaw) return res.status(400).json({ message: 'vertical is required', traceId });
      if (!categoriesStrRaw) return res.status(400).json({ message: 'categories is required', traceId });

      const { validateVertical, validateCategories, validateSubcategoryForCategories, validateLeafForCategories } = await import('./config/CategoryValidation');

      const vRes = validateVertical(verticalRaw);
      if (!vRes.ok) return res.status(400).json({ message: vRes.reason, traceId });
      const vertical = vRes.value!;

      const rawCategories = categoriesStrRaw.split(',').map((c) => c.trim()).filter(Boolean);
      const cRes = validateCategories(vertical, rawCategories);
      if (!cRes.ok) return res.status(400).json({ message: cRes.reason, traceId });
      const uniqueCategories = cRes.values!;

      // Security hardening: enforce sensible bounds and sizes (after uniqueCategories is defined)
      const MAX_CATEGORIES = 8;
      const MAX_LIST_LENGTH = 50;
      const MAX_ITEM_LENGTH = 64;
      const MAX_SEARCH_LEN = 100;

      if (uniqueCategories.length > MAX_CATEGORIES) {
        return res.status(400).json({ message: 'too many categories', traceId });
      }
      if (brands.length > MAX_LIST_LENGTH || sizes.length > MAX_LIST_LENGTH) {
        return res.status(400).json({ message: 'too many filter values', traceId });
      }
      if (brands.some((b) => b.length > MAX_ITEM_LENGTH) || sizes.some((s) => s.length > MAX_ITEM_LENGTH)) {
        return res.status(400).json({ message: 'filter value too long', traceId });
      }
      if (typeof minPrice === 'number' && typeof maxPrice === 'number' && minPrice > maxPrice) {
        return res.status(400).json({ message: 'minPrice cannot exceed maxPrice', traceId });
      }
      if (req.query.search && String(req.query.search).length > MAX_SEARCH_LEN) {
        return res.status(400).json({ message: 'search too long', traceId });
      }

      const sRes = validateSubcategoryForCategories(uniqueCategories, subcategoryRaw);
      if (!sRes.ok) return res.status(400).json({ message: sRes.reason, traceId });
      const subcategory = sRes.value;

      const lRes = validateLeafForCategories(uniqueCategories, subcategory, leafRaw);
      if (!lRes.ok) return res.status(400).json({ message: lRes.reason, traceId });
      const leaf = lRes.value;

      const { aggregateListings } = await import('./services/ListingAggregationService');
      const { getTracer } = await import('./services/Tracing');
      const tracer = getTracer();
      const span = tracer.startSpan('aggregate_listings', { traceId, vertical, sortBy, limit });
      const { items, nextCursor, apiVersion } = await aggregateListings({
        traceId,
        vertical,
        categories: uniqueCategories,
        subcategory,
        leaf,
        sortBy,
        limit,
        cursor: cursor || null,
        // Pass filters for application at service layer
        // Note: The current storage layer may not support these filters natively; they will be applied in memory.
        searchQuery: req.query.search ? String(req.query.search) : undefined,
        // @ts-expect-error: extend service signature to include filters
        filters: { brands, sizes, minPrice, maxPrice, conditions: condRes.values }
      });
      // Observability: metrics and structured log
      const { metrics } = await import('./services/Metrics');
      const durationMs = Date.now() - started;
      metrics.increment('listings.aggregate.rps', 1);
      metrics.observe('listings.aggregate.duration_ms', durationMs);
      console.log(JSON.stringify({
        level: 'info',
        msg: 'aggregate listings',
        traceId,
        vertical,
        categories: uniqueCategories,
        subcategory,
        sortBy,
        limit,
        returned: items.length,
        nextCursorPresent: !!nextCursor,
        durationMs
      }));

      span.setAttribute('returned', items.length);
      span.setAttribute('hasNext', !!nextCursor);
      span.end('ok');
      return res.json({ apiVersion, traceId, items, nextCursor, pageInfo: { limit, returned: items.length, hasNextPage: !!nextCursor } });
    } catch (error) {
      try { const { getTracer } = await import('./services/Tracing'); getTracer().startSpan('aggregate_listings').end('error'); } catch {}
      console.error('Error aggregating listings:', error);
      return res.status(500).json({ message: 'Failed to aggregate listings' });
    }
  });

  // Internal metrics snapshot for observability and alerting
  app.get('/internal/metrics', async (req, res) => {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const token = process.env.INTERNAL_METRICS_TOKEN;
      if (isProd && token && req.headers['x-internal-token'] !== token) {
        return res.status(401).json({ message: 'unauthorized' });
      }
      const { metrics } = await import('./services/Metrics');
      return res.json({
        counters: metrics.getCounters(),
        histograms: metrics.getHistograms()
      });
    } catch (error) {
      console.error('Error serving internal metrics:', error);
      return res.status(500).json({ message: 'Failed to read metrics' });
    }
  });

  // Restrict :id to UUID-like tokens to avoid clobbering subpaths like 'aggregate'
  app.get('/api/listings/:id([0-9a-fA-F\-]{8,})', async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Increment view count
      await storage.incrementListingViews(id);
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.put('/api/listings/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Check if user owns the listing
      const listing = await storage.getListing(id);
      if (!listing || listing.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }
      
      const updates = req.body;
      const updatedListing = await storage.updateListing(id, updates);
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Check if user owns the listing
      const listing = await storage.getListing(id);
      if (!listing || listing.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }
      
      await storage.deleteListing(id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Follow routes
  app.post('/api/follow', authMiddleware, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = insertFollowSchema.parse({ ...req.body, followerId });
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const follow = await storage.followUser(followerId, followingId);
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/follow/:followingId', authMiddleware, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = req.params;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/users/:userId/followers', async (req, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get('/api/users/:userId/following', async (req, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.get('/api/follow/status/:followingId', authMiddleware, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = req.params;
      const isFollowing = await storage.isFollowing(followerId, followingId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Like routes with AOP integration
  app.post('/api/likes', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = insertLikeSchema.parse({ ...req.body, userId });
      
      const like = await storage.likeListing(userId, listingId);
      res.json(like);
    } catch (error) {
      console.error("Error liking listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid like data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to like listing" });
    }
  });

  app.delete('/api/likes/:listingId', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.params;
      
      await storage.unlikeListing(userId, listingId);
      res.json({ message: "Listing unliked successfully" });
    } catch (error) {
      console.error("Error unliking listing:", error);
      res.status(500).json({ message: "Failed to unlike listing" });
    }
  });

  app.get('/api/likes/:listingId/status', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.params;
      const isLiked = await storage.isLiked(userId, listingId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.get('/api/users/:userId/liked-listings', async (req, res) => {
    try {
      const { userId } = req.params;
      const likedListings = await storage.getLikedListings(userId);
      res.json(likedListings);
    } catch (error) {
      console.error("Error fetching liked listings:", error);
      res.status(500).json({ message: "Failed to fetch liked listings" });
    }
  });

  // Comment routes with AOP integration
  app.post('/api/comments', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({ ...req.body, userId });
      
      const comment = await storage.addComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.get('/api/listings/:listingId/comments', async (req, res) => {
    try {
      const { listingId } = req.params;
      const comments = await storage.getComments(listingId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.delete('/api/comments/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Note: In a production app, you'd check if the user owns the comment
      await storage.deleteComment(id);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Message routes with AOP integration
  app.post('/api/messages', authMiddleware, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/conversations/:partnerId', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId } = req.params;
      
      const conversation = await storage.getConversation(userId, partnerId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get('/api/conversations', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.put('/api/messages/:id/read', authMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Feed routes with AOP integration
  app.get('/api/feed', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feedData = await storage.getFeedData(userId);
      res.json(feedData);
    } catch (error) {
      console.error("Error fetching feed data:", error);
      res.status(500).json({ message: "Failed to fetch feed data" });
    }
  });

  app.get('/api/feed/brand-counts', async (req, res) => {
    try {
      const brandCounts = await storage.getBrandCounts();
      res.json(brandCounts);
    } catch (error) {
      console.error("Error fetching brand counts:", error);
      res.status(500).json({ message: "Failed to fetch brand counts" });
    }
  });

  // Transaction routes with AOP integration
  app.post('/api/transactions', authMiddleware, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const transactionData = { ...req.body, buyerId };
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.put('/api/transactions/:id/status', authMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const transaction = await storage.updateTransactionStatus(id, status);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Fashion routes (new domain-specific API)
  app.use('/api/fashion', fashionRouter);
  
  // Marketplace routes
  app.use('/api/marketplace', marketplaceRouter);
  
  // Analytics routes
  app.use('/api/analytics', analyticsRouter);
  
  // Vector search routes
  app.use('/api/vector-search', vectorSearchRouter);

  // Dynamic Configuration API for Task 3.1: Enable Dynamic Import/API Loading
  app.get('/api/configurations/:configKey', async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { configKey } = req.params;
      
      // Dynamic configuration fallback for on-demand loading
      const fallbackConfig = {
        category: 'fashion',
        metadata: {
          title: configKey.includes('women') ? 'Women\'s Fashion' : 
                 configKey.includes('men') ? 'Men\'s Fashion' :
                 configKey.includes('kids') ? 'Kids Fashion' : 'Fashion',
          description: `Discover ${configKey.split('-')[1]} fashion and accessories`,
          gradient: 'from-pink-50 via-rose-100 to-pink-200',
          placeholder: `Search ${configKey.split('-')[1]} fashion...`
        },
        filterConfiguration: {
          availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition'],
          categorySpecificFilters: [],
          defaultFilters: { condition: ['new_with_tags', 'excellent'] },
          filterValidationRules: {}
        },
        sampleProducts: []
      };

      res.json({
        success: true,
        data: {
          configuration: fallbackConfig,
          metadata: {
            loadTime: Date.now() - startTime,
            source: 'api_dynamic_loading',
            timestamp: Date.now(),
            cacheEnabled: true
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Dynamic configuration load failed'
      });
    }
  });

  // AI Assistant routes
  registerAiAssistantRoutes(app, authMiddleware);

  const httpServer = createServer(app);
  return httpServer;
}
