import {
  users,
  listings,
  follows,
  likes,
  comments,
  messages,
  transactions,
  type User,
  type UpsertUser,
  type Listing,
  type InsertListing,
  type Follow,
  type InsertFollow,
  type Like,
  type InsertLike,
  type Comment,
  type InsertComment,
  type Message,
  type InsertMessage,
  type Transaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, count, sql, ne, not, exists, isNotNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  searchUsers(query: string): Promise<User[]>;
  
  // Listing operations
  createListing(listing: InsertListing & { sellerId: string }): Promise<Listing>;
  getListings(options?: { 
    category?: string; 
    search?: string; 
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  incrementListingViews(id: string): Promise<void>;
  
  // Social operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  
  // Like operations
  likeListing(userId: string, listingId: string): Promise<Like>;
  unlikeListing(userId: string, listingId: string): Promise<void>;
  isLiked(userId: string, listingId: string): Promise<boolean>;
  getLikedListings(userId: string): Promise<Listing[]>;
  
  // Comment operations
  addComment(comment: InsertComment): Promise<Comment>;
  getComments(listingId: string): Promise<Comment[]>;
  deleteComment(id: string): Promise<void>;
  
  // Message operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  getConversations(userId: string): Promise<any[]>;
  markMessageAsRead(id: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;
  
  // Feed operations
  getFeedData(userId: string): Promise<{
    forYouListings: Listing[];
    followingListings: Listing[];
    likedListings: Listing[];
    recentlyViewed: Listing[];
    trendingItems: Listing[];
    suggestedUsers: User[];
  }>;
  getBrandCounts(): Promise<Record<string, number>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.firstName, `%${query}%`),
          ilike(users.lastName, `%${query}%`)
        )
      )
      .limit(20);
  }
  
  // Listing operations
  
  async createListing(listing: InsertListing & { sellerId: string }): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    
    // Update user's listings count
    await db
      .update(users)
      .set({ 
        listingsCount: sql`${users.listingsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, listing.sellerId));
    
    return newListing;
  }
  
  async getListings(options: { 
    category?: string; 
    search?: string; 
    sellerId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Listing[]> {
    const { category, search, sellerId, limit = 50, offset = 0 } = options;
    
    let conditions = [eq(listings.status, 'active')];
    
    if (category) {
      conditions.push(eq(listings.category, category as any));
    }
    
    if (search) {
      const searchCondition = or(
        ilike(listings.title, `%${search}%`),
        ilike(listings.description, `%${search}%`),
        ilike(listings.brand, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    if (sellerId) {
      conditions.push(eq(listings.sellerId, sellerId));
    }
    
    return await db
      .select({
        id: listings.id,
        sellerId: listings.sellerId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        brand: listings.brand,
        size: listings.size,
        color: listings.color,
        condition: listings.condition,
        price: listings.price,
        originalPrice: listings.originalPrice,
        images: listings.images,
        tags: listings.tags,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewsCount: listings.viewsCount,
        likesCount: listings.likesCount,
        sharesCount: listings.sharesCount,
        commentsCount: listings.commentsCount,
        location: listings.location,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        }
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(listings.isPromoted), desc(listings.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db
      .select({
        id: listings.id,
        sellerId: listings.sellerId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        brand: listings.brand,
        size: listings.size,
        color: listings.color,
        condition: listings.condition,
        price: listings.price,
        originalPrice: listings.originalPrice,
        images: listings.images,
        tags: listings.tags,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewsCount: listings.viewsCount,
        likesCount: listings.likesCount,
        sharesCount: listings.sharesCount,
        commentsCount: listings.commentsCount,
        location: listings.location,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
          followersCount: users.followersCount,
          listingsCount: users.listingsCount,
          salesCount: users.salesCount,
        }
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.id, id));
    
    return listing;
  }
  
  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }
  
  async deleteListing(id: string): Promise<void> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    if (listing) {
      await db.delete(listings).where(eq(listings.id, id));
      
      // Update user's listings count
      await db
        .update(users)
        .set({ 
          listingsCount: sql`${users.listingsCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(users.id, listing.sellerId));
    }
  }
  
  async incrementListingViews(id: string): Promise<void> {
    await db
      .update(listings)
      .set({ viewsCount: sql`${listings.viewsCount} + 1` })
      .where(eq(listings.id, id));
  }
  
  // Social operations
  
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    
    // Update follower and following counts
    await Promise.all([
      db.update(users).set({ 
        followingCount: sql`${users.followingCount} + 1`,
        updatedAt: new Date()
      }).where(eq(users.id, followerId)),
      db.update(users).set({ 
        followersCount: sql`${users.followersCount} + 1`,
        updatedAt: new Date()
      }).where(eq(users.id, followingId))
    ]);
    
    return follow;
  }
  
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    
    // Update follower and following counts
    await Promise.all([
      db.update(users).set({ 
        followingCount: sql`${users.followingCount} - 1`,
        updatedAt: new Date()
      }).where(eq(users.id, followerId)),
      db.update(users).set({ 
        followersCount: sql`${users.followersCount} - 1`,
        updatedAt: new Date()
      }).where(eq(users.id, followingId))
    ]);
  }
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }
  
  async getFollowers(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        bio: users.bio,
        isVerified: users.isVerified,
        followersCount: users.followersCount,
        followingCount: users.followingCount,
        listingsCount: users.listingsCount,
        salesCount: users.salesCount,
        role: users.role,
        analyticsAccess: users.analyticsAccess,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followerId))
      .where(eq(follows.followingId, userId));
  }
  
  async getFollowing(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        bio: users.bio,
        isVerified: users.isVerified,
        followersCount: users.followersCount,
        followingCount: users.followingCount,
        listingsCount: users.listingsCount,
        salesCount: users.salesCount,
        role: users.role,
        analyticsAccess: users.analyticsAccess,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followingId))
      .where(eq(follows.followerId, userId));
  }
  
  // Like operations
  
  async likeListing(userId: string, listingId: string): Promise<Like> {
    const [like] = await db.insert(likes).values({ userId, listingId }).returning();
    
    // Update listing likes count
    await db
      .update(listings)
      .set({ likesCount: sql`${listings.likesCount} + 1` })
      .where(eq(listings.id, listingId));
    
    return like;
  }
  
  async unlikeListing(userId: string, listingId: string): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.listingId, listingId)));
    
    // Update listing likes count
    await db
      .update(listings)
      .set({ likesCount: sql`${listings.likesCount} - 1` })
      .where(eq(listings.id, listingId));
  }
  
  async isLiked(userId: string, listingId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.listingId, listingId)));
    return !!like;
  }
  
  async getLikedListings(userId: string): Promise<Listing[]> {
    return await db
      .select({
        id: listings.id,
        sellerId: listings.sellerId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        brand: listings.brand,
        size: listings.size,
        color: listings.color,
        condition: listings.condition,
        price: listings.price,
        originalPrice: listings.originalPrice,
        images: listings.images,
        tags: listings.tags,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewsCount: listings.viewsCount,
        likesCount: listings.likesCount,
        sharesCount: listings.sharesCount,
        commentsCount: listings.commentsCount,
        location: listings.location,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
      })
      .from(listings)
      .innerJoin(likes, eq(listings.id, likes.listingId))
      .where(eq(likes.userId, userId))
      .orderBy(desc(likes.createdAt));
  }
  
  // Comment operations
  
  async addComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update listing comments count
    await db
      .update(listings)
      .set({ commentsCount: sql`${listings.commentsCount} + 1` })
      .where(eq(listings.id, comment.listingId));
    
    return newComment;
  }
  
  async getComments(listingId: string): Promise<Comment[]> {
    return await db
      .select({
        id: comments.id,
        userId: comments.userId,
        listingId: comments.listingId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.listingId, listingId))
      .orderBy(desc(comments.createdAt));
  }
  
  async deleteComment(id: string): Promise<void> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    if (comment) {
      await db.delete(comments).where(eq(comments.id, id));
      
      // Update listing comments count
      await db
        .update(listings)
        .set({ commentsCount: sql`${listings.commentsCount} - 1` })
        .where(eq(listings.id, comment.listingId));
    }
  }
  
  // Message operations
  
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        listingId: messages.listingId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }
  
  async getConversations(userId: string): Promise<any[]> {
    return await db
      .select({
        partnerId: sql<string>`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`,
        partnerUsername: users.username,
        partnerFirstName: users.firstName,
        partnerLastName: users.lastName,
        partnerProfileImageUrl: users.profileImageUrl,
        lastMessage: messages.content,
        lastMessageTime: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .leftJoin(users, sql`${users.id} = CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }
  
  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }
  
  // Transaction operations
  
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update seller's sales count when transaction is completed
    if (transaction.status === 'completed') {
      await db
        .update(users)
        .set({ 
          salesCount: sql`${users.salesCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(users.id, transaction.sellerId));
    }
    
    return newTransaction;
  }
  
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(or(eq(transactions.buyerId, userId), eq(transactions.sellerId, userId)))
      .orderBy(desc(transactions.createdAt));
  }
  
  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    
    // Update seller's sales count when transaction is completed
    if (status === 'completed') {
      await db
        .update(users)
        .set({ 
          salesCount: sql`${users.salesCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(users.id, transaction.sellerId));
    }
    
    return transaction;
  }
  
  // Feed operations
  
  async getFeedData(userId: string): Promise<{
    forYouListings: Listing[];
    followingListings: Listing[];
    likedListings: Listing[];
    recentlyViewed: Listing[];
    trendingItems: Listing[];
    suggestedUsers: User[];
  }> {
    // Get for you listings (trending and recommended)
    const forYouListings = await this.getListings({ limit: 20 });
    
    // Get listings from users that the current user follows
    const followingUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
      
    const followingUserIds = followingUsers.map(f => f.followingId);
    
    let followingListings: Listing[] = [];
    if (followingUserIds.length > 0) {
      followingListings = await db
        .select({
          id: listings.id,
          sellerId: listings.sellerId,
          title: listings.title,
          description: listings.description,
          category: listings.category,
          subcategory: listings.subcategory,
          brand: listings.brand,
          size: listings.size,
          color: listings.color,
          condition: listings.condition,
          price: listings.price,
          originalPrice: listings.originalPrice,
          images: listings.images,
          tags: listings.tags,
          status: listings.status,
          isPromoted: listings.isPromoted,
          viewsCount: listings.viewsCount,
          likesCount: listings.likesCount,
          sharesCount: listings.sharesCount,
          commentsCount: listings.commentsCount,
          location: listings.location,
          createdAt: listings.createdAt,
          updatedAt: listings.updatedAt,
          seller: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            isVerified: users.isVerified,
          }
        })
        .from(listings)
        .leftJoin(users, eq(listings.sellerId, users.id))
        .where(
          and(
            eq(listings.status, 'active'),
            or(...followingUserIds.map(id => eq(listings.sellerId, id)))
          )
        )
        .orderBy(desc(listings.createdAt))
        .limit(20);
    }
    
    // Get user's liked listings
    const likedListings = await this.getLikedListings(userId);
    
    // Get trending items (most liked/viewed recently)
    const trendingItems = await db
      .select({
        id: listings.id,
        sellerId: listings.sellerId,
        title: listings.title,
        description: listings.description,
        category: listings.category,
        subcategory: listings.subcategory,
        brand: listings.brand,
        size: listings.size,
        color: listings.color,
        condition: listings.condition,
        price: listings.price,
        originalPrice: listings.originalPrice,
        images: listings.images,
        tags: listings.tags,
        status: listings.status,
        isPromoted: listings.isPromoted,
        viewsCount: listings.viewsCount,
        likesCount: listings.likesCount,
        sharesCount: listings.sharesCount,
        commentsCount: listings.commentsCount,
        location: listings.location,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        }
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.status, 'active'))
      .orderBy(desc(listings.likesCount), desc(listings.viewsCount))
      .limit(10);
    
    // Get suggested users (users with similar interests or popular users)
    const suggestedUsers = await db
      .select()
      .from(users)
      .where(and(
        ne(users.id, userId),
        // Users not already followed
        not(
          exists(
            db.select()
              .from(follows)
              .where(
                and(
                  eq(follows.followerId, userId),
                  eq(follows.followingId, users.id)
                )
              )
          )
        )
      ))
      .orderBy(desc(users.followersCount))
      .limit(10);
    
    return {
      forYouListings,
      followingListings,
      likedListings: likedListings.slice(0, 10),
      recentlyViewed: [], // TODO: Track user views
      trendingItems,
      suggestedUsers,
    };
  }
  
  async getBrandCounts(): Promise<Record<string, number>> {
    const result = await db
      .select({
        brand: listings.brand,
        count: count()
      })
      .from(listings)
      .where(and(eq(listings.status, 'active'), isNotNull(listings.brand)))
      .groupBy(listings.brand)
      .orderBy(desc(count()))
      .limit(20);
      
    return result.reduce((acc, { brand, count }) => {
      if (brand) acc[brand] = Number(count);
      return acc;
    }, {} as Record<string, number>);
  }
}

export const storage = new DatabaseStorage();
