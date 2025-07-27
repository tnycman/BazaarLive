import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { marketplaceRouter } from "./routes/marketplace";
import { analyticsRouter } from "./routes/analytics";
import vectorSearchRouter from "./routes/vector-search";
import { 
  insertListingSchema, 
  insertCommentSchema, 
  insertMessageSchema,
  insertFollowSchema,
  insertLikeSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
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

  // Listing routes
  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing({ ...listingData, sellerId: userId });
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/listings', async (req, res) => {
    try {
      const { category, search, sellerId, limit, offset } = req.query;
      const listings = await storage.getListings({
        category: category as string,
        search: search as string,
        sellerId: sellerId as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
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

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/follow', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/follow/:followingId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/follow/status/:followingId', isAuthenticated, async (req: any, res) => {
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

  // Like routes
  app.post('/api/likes', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/likes/:listingId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/likes/:listingId/status', isAuthenticated, async (req: any, res) => {
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

  // Comment routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/comments/:id', isAuthenticated, async (req: any, res) => {
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

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/conversations/:partnerId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Feed routes
  app.get('/api/feed', isAuthenticated, async (req: any, res) => {
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

  // Transaction routes
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.put('/api/transactions/:id/status', isAuthenticated, async (req: any, res) => {
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

  // Marketplace routes
  app.use('/api/marketplace', marketplaceRouter);
  
  // Analytics routes
  app.use('/api/analytics', analyticsRouter);
  
  // Vector search routes
  app.use('/api/vector-search', vectorSearchRouter);

  const httpServer = createServer(app);
  return httpServer;
}
