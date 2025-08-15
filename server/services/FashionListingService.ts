// Fashion Listing Service - Enterprise-grade service layer
import { eq, and, or, gte, lte, desc, asc, sql, inArray, ilike, count } from 'drizzle-orm';
import { db } from '../db.js';
import { fashionListings, fashionLikes, fashionComments, users } from '@shared/fashion-schema';
import { 
  FashionListing,
  FashionListingCreate,
  FashionListingUpdate,
  FashionListingFilters,
  FashionSearchQuery,
  PaginatedResponse,
  FashionListingWithMetadata,
  FashionSortOption,
  FashionValidationError,
  FashionNotFoundError,
  FashionPermissionError,
  validateFashionCategory,
  validateProductCondition,
  validatePrice,
  validateImages
} from '@shared/types/FashionDomain';
import {
  FashionListingCreateSchema,
  FashionListingUpdateSchema,
  FashionFiltersSchema,
  FashionSearchQuerySchema
} from '@shared/validation/FashionSchemas';
import { getCategoryConfig, validateCategorySubcategory } from '@shared/config/FashionCategoryConfig';
import { Logger } from '../middleware/Logger.js';
import { CacheService } from './CacheService';
import { AnalyticsService } from './AnalyticsService';
import { ImageProcessingService } from './ImageProcessingService';
import { VectorSearchService } from './VectorSearchService';

export interface FashionListingServiceConfig {
  enableCache: boolean;
  enableAnalytics: boolean;
  enableVectorSearch: boolean;
  cacheDefaultTTL: number;
  maxListingsPerUser: number;
  imageValidation: {
    maxSize: number;
    allowedFormats: string[];
    maxCount: number;
  };
}

export class FashionListingService {
  private logger: Logger;
  private config: FashionListingServiceConfig;

  constructor(
    private cacheService: CacheService,
    private analyticsService: AnalyticsService,
    private imageService: ImageProcessingService,
    private vectorService: VectorSearchService,
    config: Partial<FashionListingServiceConfig> = {}
  ) {
    this.logger = new Logger('FashionListingService');
    this.config = {
      enableCache: true,
      enableAnalytics: true,
      enableVectorSearch: true,
      cacheDefaultTTL: 300, // 5 minutes
      maxListingsPerUser: 100,
      imageValidation: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxCount: 10
      },
      ...config
    };
  }

  /**
   * Create a new fashion listing
   */
  async createFashionListing(
    sellerId: string,
    listingData: FashionListingCreate
  ): Promise<FashionListing> {
    const startTime = Date.now();

    try {
      // 1. Validate input data
      const validatedData = FashionListingCreateSchema.parse(listingData);
      this.logger.debug('Input validation passed', { sellerId, title: validatedData.title });

      // 2. Check seller permissions and limits
      await this.validateSellerPermissions(sellerId);
      await this.checkSellerLimits(sellerId);

      // 3. Validate category-subcategory combination
      if (validatedData.subcategory) {
        if (!validateCategorySubcategory(validatedData.fashionCategory, validatedData.subcategory)) {
          throw new FashionValidationError(
            'subcategory',
            'INVALID_SUBCATEGORY',
            `Subcategory '${validatedData.subcategory}' is not valid for category '${validatedData.fashionCategory}'`
          );
        }
      }

      // 4. Validate and process images
      const processedImages = await this.validateAndProcessImages(validatedData.images);

      // 5. Generate AI embeddings if enabled
      let embeddings = {};
      if (this.config.enableVectorSearch) {
        embeddings = await this.generateEmbeddings({
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.fashionCategory,
          brand: validatedData.brand,
          tags: validatedData.tags
        });
      }

      // 6. Create database record
      const [listing] = await db
        .insert(fashionListings)
        .values({
          sellerId,
          title: validatedData.title,
          description: validatedData.description,
          fashionCategory: validatedData.fashionCategory,
          subcategory: validatedData.subcategory,
          subSubcategory: validatedData.subSubcategory,
          brand: validatedData.brand,
          size: validatedData.size,
          color: validatedData.color,
          material: validatedData.material,
          styleTags: validatedData.styleTags,
          condition: validatedData.condition,
          price: validatedData.price,
          originalPrice: validatedData.originalPrice,
          currency: validatedData.currency || 'USD',
          images: processedImages,
          tags: validatedData.tags,
          location: validatedData.location,
          isPriceNegotiable: validatedData.isPriceNegotiable || false,
          isShippingIncluded: validatedData.isShippingIncluded || false,
          ...embeddings,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // 7. Update seller metrics
      await this.updateSellerMetrics(sellerId, 'listing_created');

      // 8. Invalidate relevant caches
      if (this.config.enableCache) {
        await this.invalidateListingCaches(listing.fashionCategory, sellerId);
      }

      // 9. Send analytics events
      if (this.config.enableAnalytics) {
        await this.analyticsService.trackEvent('fashion_listing_created', {
          listingId: listing.id,
          sellerId,
          category: listing.fashionCategory,
          subcategory: listing.subcategory,
          price: listing.price,
          brand: listing.brand
        });
      }

      const duration = Date.now() - startTime;
      this.logger.info('Fashion listing created successfully', {
        listingId: listing.id,
        sellerId,
        category: listing.fashionCategory,
        duration
      });

      return listing;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to create fashion listing', {
        sellerId,
        error: error.message,
        duration
      });

      if (error instanceof FashionValidationError) {
        throw error;
      }

      throw new Error(`Failed to create fashion listing: ${error.message}`);
    }
  }

  /**
   * Get fashion listings with filters and pagination
   */
  async getFashionListings(
    filters: FashionListingFilters = {},
    sortBy: FashionSortOption = 'newest',
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<FashionListing>> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedFilters = FashionFiltersSchema.parse(filters);
      const offset = (page - 1) * limit;

      // Check cache first
      const cacheKey = this.generateCacheKey('listings', { filters: validatedFilters, sortBy, page, limit });
      if (this.config.enableCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          this.logger.debug('Cache hit for fashion listings', { cacheKey });
          return cached;
        }
      }

      // Build query
      const query = this.buildListingsQuery(validatedFilters, sortBy);

      // Execute paginated query
      const [items, totalResult] = await Promise.all([
        query.limit(limit).offset(offset),
        this.getListingsCount(validatedFilters)
      ]);

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: PaginatedResponse<FashionListing> = {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };

      // Cache the result
      if (this.config.enableCache) {
        await this.cacheService.set(cacheKey, result, this.config.cacheDefaultTTL);
      }

      const duration = Date.now() - startTime;
      this.logger.debug('Fashion listings retrieved', {
        count: items.length,
        total,
        page,
        duration
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get fashion listings', {
        filters,
        sortBy,
        page,
        limit,
        error: error.message
      });
      throw new Error(`Failed to retrieve fashion listings: ${error.message}`);
    }
  }

  /**
   * Get a single fashion listing by ID
   */
  async getFashionListing(
    listingId: string,
    userId?: string,
    includeMetadata: boolean = false
  ): Promise<FashionListingWithMetadata> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('listing', { listingId, includeMetadata });
      if (this.config.enableCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          // Still increment view count for cache hits
          if (userId) {
            await this.incrementViewCount(listingId, userId);
          }
          return cached;
        }
      }

      // Query listing with seller info
      const result = await db
        .select({
          // Listing fields
          id: fashionListings.id,
          sellerId: fashionListings.sellerId,
          title: fashionListings.title,
          description: fashionListings.description,
          fashionCategory: fashionListings.fashionCategory,
          subcategory: fashionListings.subcategory,
          subSubcategory: fashionListings.subSubcategory,
          brand: fashionListings.brand,
          size: fashionListings.size,
          color: fashionListings.color,
          material: fashionListings.material,
          styleTags: fashionListings.styleTags,
          condition: fashionListings.condition,
          price: fashionListings.price,
          originalPrice: fashionListings.originalPrice,
          currency: fashionListings.currency,
          images: fashionListings.images,
          tags: fashionListings.tags,
          status: fashionListings.status,
          viewsCount: fashionListings.viewsCount,
          likesCount: fashionListings.likesCount,
          sharesCount: fashionListings.sharesCount,
          commentsCount: fashionListings.commentsCount,
          location: fashionListings.location,
          isPromoted: fashionListings.isPromoted,
          isPriceNegotiable: fashionListings.isPriceNegotiable,
          isShippingIncluded: fashionListings.isShippingIncluded,
          createdAt: fashionListings.createdAt,
          updatedAt: fashionListings.updatedAt,
          // Seller info
          sellerUsername: users.username,
          sellerProfileImageUrl: users.profileImageUrl,
          sellerIsVerified: users.isVerified,
          sellerFollowersCount: users.followersCount,
          sellerSalesCount: users.salesCount
        })
        .from(fashionListings)
        .leftJoin(users, eq(fashionListings.sellerId, users.id))
        .where(eq(fashionListings.id, listingId))
        .limit(1);

      if (result.length === 0) {
        throw new FashionNotFoundError('FashionListing', listingId);
      }

      const listingData = result[0];

      // Build listing with metadata
      const listing: FashionListingWithMetadata = {
        id: listingData.id,
        sellerId: listingData.sellerId,
        title: listingData.title,
        description: listingData.description,
        fashionCategory: listingData.fashionCategory,
        subcategory: listingData.subcategory,
        subSubcategory: listingData.subSubcategory,
        brand: listingData.brand,
        size: listingData.size,
        color: listingData.color,
        material: listingData.material,
        styleTags: listingData.styleTags,
        condition: listingData.condition,
        price: listingData.price,
        originalPrice: listingData.originalPrice,
        currency: listingData.currency,
        images: listingData.images,
        tags: listingData.tags,
        status: listingData.status,
        viewsCount: listingData.viewsCount,
        likesCount: listingData.likesCount,
        sharesCount: listingData.sharesCount,
        commentsCount: listingData.commentsCount,
        location: listingData.location,
        isPromoted: listingData.isPromoted,
        isPriceNegotiable: listingData.isPriceNegotiable,
        isShippingIncluded: listingData.isShippingIncluded,
        createdAt: listingData.createdAt,
        updatedAt: listingData.updatedAt,
        sellerInfo: {
          username: listingData.sellerUsername || '',
          profileImageUrl: listingData.sellerProfileImageUrl,
          isVerified: listingData.sellerIsVerified || false,
          followersCount: listingData.sellerFollowersCount || 0,
          salesCount: listingData.sellerSalesCount || 0
        }
      };

      // Add metadata if requested
      if (includeMetadata && userId) {
        const [isLiked, similarListings] = await Promise.all([
          this.checkIfLiked(listingId, userId),
          this.getSimilarListings(listingId, 4)
        ]);

        listing.isLiked = isLiked;
        listing.similarListings = similarListings;
      }

      // Cache the result
      if (this.config.enableCache) {
        await this.cacheService.set(cacheKey, listing, this.config.cacheDefaultTTL);
      }

      // Increment view count (async)
      if (userId) {
        this.incrementViewCount(listingId, userId).catch(error => {
          this.logger.warn('Failed to increment view count', { listingId, userId, error: error.message });
        });
      }

      const duration = Date.now() - startTime;
      this.logger.debug('Fashion listing retrieved', {
        listingId,
        includeMetadata,
        duration
      });

      return listing;

    } catch (error) {
      this.logger.error('Failed to get fashion listing', {
        listingId,
        userId,
        error: error.message
      });

      if (error instanceof FashionNotFoundError) {
        throw error;
      }

      throw new Error(`Failed to retrieve fashion listing: ${error.message}`);
    }
  }

  /**
   * Update a fashion listing
   */
  async updateFashionListing(
    listingId: string,
    sellerId: string,
    updates: FashionListingUpdate
  ): Promise<FashionListing> {
    const startTime = Date.now();

    try {
      // Validate input
      const validatedUpdates = FashionListingUpdateSchema.parse(updates);

      // Verify ownership
      await this.verifyListingOwnership(listingId, sellerId);

      // Process images if updated
      if (validatedUpdates.images) {
        validatedUpdates.images = await this.validateAndProcessImages(validatedUpdates.images);
      }

      // Generate new embeddings if content changed
      let embeddings = {};
      if (this.config.enableVectorSearch && 
          (validatedUpdates.title || validatedUpdates.description || validatedUpdates.tags)) {
        
        const currentListing = await this.getFashionListing(listingId);
        embeddings = await this.generateEmbeddings({
          title: validatedUpdates.title || currentListing.title,
          description: validatedUpdates.description || currentListing.description,
          category: currentListing.fashionCategory,
          brand: validatedUpdates.brand || currentListing.brand,
          tags: validatedUpdates.tags || currentListing.tags
        });
      }

      // Update database
      const [updatedListing] = await db
        .update(fashionListings)
        .set({
          ...validatedUpdates,
          ...embeddings,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, listingId))
        .returning();

      // Invalidate caches
      if (this.config.enableCache) {
        await this.invalidateListingCaches(updatedListing.fashionCategory, sellerId, listingId);
      }

      // Analytics
      if (this.config.enableAnalytics) {
        await this.analyticsService.trackEvent('fashion_listing_updated', {
          listingId,
          sellerId,
          updatedFields: Object.keys(validatedUpdates)
        });
      }

      const duration = Date.now() - startTime;
      this.logger.info('Fashion listing updated', {
        listingId,
        sellerId,
        updatedFields: Object.keys(validatedUpdates),
        duration
      });

      return updatedListing;

    } catch (error) {
      this.logger.error('Failed to update fashion listing', {
        listingId,
        sellerId,
        error: error.message
      });

      if (error instanceof FashionValidationError || error instanceof FashionPermissionError) {
        throw error;
      }

      throw new Error(`Failed to update fashion listing: ${error.message}`);
    }
  }

  /**
   * Delete a fashion listing
   */
  async deleteFashionListing(listingId: string, sellerId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Verify ownership
      await this.verifyListingOwnership(listingId, sellerId);

      // Get listing for cleanup
      const listing = await this.getFashionListing(listingId);

      // Soft delete (update status to archived)
      await db
        .update(fashionListings)
        .set({
          status: 'archived',
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, listingId));

      // Update seller metrics
      await this.updateSellerMetrics(sellerId, 'listing_deleted');

      // Invalidate caches
      if (this.config.enableCache) {
        await this.invalidateListingCaches(listing.fashionCategory, sellerId, listingId);
      }

      // Analytics
      if (this.config.enableAnalytics) {
        await this.analyticsService.trackEvent('fashion_listing_deleted', {
          listingId,
          sellerId,
          category: listing.fashionCategory
        });
      }

      const duration = Date.now() - startTime;
      this.logger.info('Fashion listing deleted', {
        listingId,
        sellerId,
        duration
      });

    } catch (error) {
      this.logger.error('Failed to delete fashion listing', {
        listingId,
        sellerId,
        error: error.message
      });

      if (error instanceof FashionPermissionError) {
        throw error;
      }

      throw new Error(`Failed to delete fashion listing: ${error.message}`);
    }
  }

  // Private helper methods

  private async validateSellerPermissions(sellerId: string): Promise<void> {
    const seller = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, sellerId))
      .limit(1);

    if (seller.length === 0) {
      throw new FashionPermissionError('create', 'listing - user not found');
    }

    // Add any role-based restrictions here
    // For now, all verified users can create listings
  }

  private async checkSellerLimits(sellerId: string): Promise<void> {
    const activeListingsCount = await db
      .select({ count: count() })
      .from(fashionListings)
      .where(
        and(
          eq(fashionListings.sellerId, sellerId),
          eq(fashionListings.status, 'active')
        )
      );

    const currentCount = activeListingsCount[0]?.count || 0;

    if (currentCount >= this.config.maxListingsPerUser) {
      throw new FashionValidationError(
        'sellerId',
        'LISTING_LIMIT_EXCEEDED',
        `Maximum ${this.config.maxListingsPerUser} active listings allowed per user`
      );
    }
  }

  private async validateAndProcessImages(images: string[]): Promise<string[]> {
    validateImages(images);

    // Additional validation and processing
    const processedImages = [];
    
    for (const imageUrl of images) {
      // Validate image accessibility and format
      const isValid = await this.imageService.validateImage(imageUrl);
      if (!isValid) {
        throw new FashionValidationError(
          'images',
          'INVALID_IMAGE',
          `Image ${imageUrl} is not accessible or in invalid format`
        );
      }

      // Generate thumbnail if needed
      const processedUrl = await this.imageService.processImage(imageUrl, {
        generateThumbnail: true,
        optimizeQuality: true
      });

      processedImages.push(processedUrl);
    }

    return processedImages;
  }

  private async generateEmbeddings(data: {
    title: string;
    description?: string;
    category: string;
    brand?: string;
    tags?: string[];
  }): Promise<{ titleEmbedding?: number[]; descriptionEmbedding?: number[]; combinedEmbedding?: number[] }> {
    try {
      const embeddings: any = {};

      // Generate title embedding
      if (data.title) {
        embeddings.titleEmbedding = await this.vectorService.generateEmbedding(data.title);
      }

      // Generate description embedding
      if (data.description) {
        embeddings.descriptionEmbedding = await this.vectorService.generateEmbedding(data.description);
      }

      // Generate combined embedding
      const combinedText = [
        data.title,
        data.description,
        data.category,
        data.brand,
        ...(data.tags || [])
      ].filter(Boolean).join(' ');

      embeddings.combinedEmbedding = await this.vectorService.generateEmbedding(combinedText);

      return embeddings;
    } catch (error) {
      this.logger.warn('Failed to generate embeddings', { error: error.message });
      return {};
    }
  }

  private buildListingsQuery(filters: FashionListingFilters, sortBy: FashionSortOption) {
    const conditions = [eq(fashionListings.status, 'active')];

    // Apply filters
    if (filters.fashionCategory) {
      conditions.push(eq(fashionListings.fashionCategory, filters.fashionCategory));
    }

    if (filters.subcategories?.length) {
      conditions.push(inArray(fashionListings.subcategory, filters.subcategories));
    }

    if (filters.brands?.length) {
      conditions.push(inArray(fashionListings.brand, filters.brands));
    }

    if (filters.conditions?.length) {
      conditions.push(inArray(fashionListings.condition, filters.conditions));
    }

    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        conditions.push(gte(fashionListings.price, filters.priceRange.min));
      }
      if (filters.priceRange.max > 0) {
        conditions.push(lte(fashionListings.price, filters.priceRange.max));
      }
    }

    if (filters.sizes?.length) {
      conditions.push(inArray(fashionListings.size, filters.sizes));
    }

    if (filters.colors?.length) {
      conditions.push(inArray(fashionListings.color, filters.colors));
    }

    if (filters.location) {
      conditions.push(ilike(fashionListings.location, `%${filters.location}%`));
    }

    if (filters.sellerId) {
      conditions.push(eq(fashionListings.sellerId, filters.sellerId));
    }

    if (filters.isPromoted !== undefined) {
      conditions.push(eq(fashionListings.isPromoted, filters.isPromoted));
    }

    // Build query
    let query = db.select().from(fashionListings).where(and(...conditions));

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.orderBy(desc(fashionListings.createdAt));
        break;
      case 'oldest':
        query = query.orderBy(asc(fashionListings.createdAt));
        break;
      case 'price_low':
        query = query.orderBy(asc(fashionListings.price));
        break;
      case 'price_high':
        query = query.orderBy(desc(fashionListings.price));
        break;
      case 'popularity':
        query = query.orderBy(desc(fashionListings.likesCount));
        break;
      case 'views':
        query = query.orderBy(desc(fashionListings.viewsCount));
        break;
      case 'alphabetical':
        query = query.orderBy(asc(fashionListings.title));
        break;
      default:
        query = query.orderBy(desc(fashionListings.createdAt));
    }

    return query;
  }

  private async getListingsCount(filters: FashionListingFilters): Promise<Array<{ count: number }>> {
    const conditions = [eq(fashionListings.status, 'active')];

    // Apply same filters as in buildListingsQuery
    if (filters.fashionCategory) {
      conditions.push(eq(fashionListings.fashionCategory, filters.fashionCategory));
    }
    // ... other filter conditions

    return db
      .select({ count: count() })
      .from(fashionListings)
      .where(and(...conditions));
  }

  private async verifyListingOwnership(listingId: string, sellerId: string): Promise<void> {
    const listing = await db
      .select({ sellerId: fashionListings.sellerId })
      .from(fashionListings)
      .where(eq(fashionListings.id, listingId))
      .limit(1);

    if (listing.length === 0) {
      throw new FashionNotFoundError('FashionListing', listingId);
    }

    if (listing[0].sellerId !== sellerId) {
      throw new FashionPermissionError('update', `listing ${listingId}`);
    }
  }

  private async updateSellerMetrics(sellerId: string, action: string): Promise<void> {
    // Update seller's listing count and other metrics
    // This would integrate with the user analytics system
    try {
      if (action === 'listing_created') {
        await db
          .update(users)
          .set({
            listingsCount: sql`${users.listingsCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(users.id, sellerId));
      } else if (action === 'listing_deleted') {
        await db
          .update(users)
          .set({
            listingsCount: sql`GREATEST(${users.listingsCount} - 1, 0)`,
            updatedAt: new Date()
          })
          .where(eq(users.id, sellerId));
      }
    } catch (error) {
      this.logger.warn('Failed to update seller metrics', { sellerId, action, error: error.message });
    }
  }

  private async checkIfLiked(listingId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ id: fashionLikes.id })
      .from(fashionLikes)
      .where(
        and(
          eq(fashionLikes.fashionListingId, listingId),
          eq(fashionLikes.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  private async getSimilarListings(listingId: string, limit: number): Promise<FashionListing[]> {
    // This would use vector similarity search in a real implementation
    // For now, return empty array
    return [];
  }

  private async incrementViewCount(listingId: string, userId: string): Promise<void> {
    try {
      await db
        .update(fashionListings)
        .set({
          viewsCount: sql`${fashionListings.viewsCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(fashionListings.id, listingId));

      // Track view event
      if (this.config.enableAnalytics) {
        await this.analyticsService.trackEvent('fashion_listing_viewed', {
          listingId,
          userId
        });
      }
    } catch (error) {
      this.logger.warn('Failed to increment view count', { listingId, userId, error: error.message });
    }
  }

  private generateCacheKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return `fashion:${type}:${JSON.stringify(sortedParams)}`;
  }

  private async invalidateListingCaches(category: string, sellerId?: string, listingId?: string): Promise<void> {
    try {
      const patterns = [
        `fashion:listings:*${category}*`,
        `fashion:listing:*${listingId}*`
      ];

      if (sellerId) {
        patterns.push(`fashion:listings:*${sellerId}*`);
      }

      await Promise.all(patterns.map(pattern => this.cacheService.invalidatePattern(pattern)));
    } catch (error) {
      this.logger.warn('Failed to invalidate caches', { error: error.message });
    }
  }
}

// Factory function for service creation
export function createFashionListingService(
  cacheService: CacheService,
  analyticsService: AnalyticsService,
  imageService: ImageProcessingService,
  vectorService: VectorSearchService,
  config?: Partial<FashionListingServiceConfig>
): FashionListingService {
  return new FashionListingService(
    cacheService,
    analyticsService,
    imageService,
    vectorService,
    config
  );
}
