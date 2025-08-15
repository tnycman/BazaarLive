// Fashion Domain Schema - Enterprise-grade fashion marketplace schema
import { sql, relations } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, varchar, text, integer, decimal, boolean, pgEnum, vector, uuid, } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// Fashion-specific enums
export const fashionCategoryEnum = pgEnum('fashion_category', [
    'women',
    'men',
    'kids',
    'home',
    'electronics',
    'pets',
    'beauty',
    'sports'
]);
export const conditionEnum = pgEnum('condition', [
    'new_with_tags',
    'new_without_tags',
    'excellent',
    'good',
    'fair',
    'poor'
]);
export const fashionStatusEnum = pgEnum('fashion_status', [
    'active',
    'sold',
    'pending',
    'draft',
    'archived'
]);
// Fashion listings table - Domain-specific implementation
export const fashionListings = pgTable("fashion_listings", {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    // Basic listing information
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    // Fashion-specific categorization
    fashionCategory: fashionCategoryEnum("fashion_category").notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    subSubcategory: varchar("sub_subcategory", { length: 100 }),
    // Fashion-specific attributes
    brand: varchar("brand", { length: 100 }),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    material: varchar("material", { length: 100 }),
    styleTags: text("style_tags").array(),
    // Common marketplace fields
    condition: conditionEnum("condition").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    images: text("images").array().notNull(),
    tags: text("tags").array(),
    status: fashionStatusEnum("status").default('active'),
    // Engagement metrics
    viewsCount: integer("views_count").default(0),
    likesCount: integer("likes_count").default(0),
    sharesCount: integer("shares_count").default(0),
    commentsCount: integer("comments_count").default(0),
    // Metadata
    location: varchar("location", { length: 200 }),
    isPromoted: boolean("is_promoted").default(false),
    // AI/Search vectors for semantic search
    titleEmbedding: vector("title_embedding", { dimensions: 1536 }),
    descriptionEmbedding: vector("description_embedding", { dimensions: 1536 }),
    combinedEmbedding: vector("combined_embedding", { dimensions: 1536 }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    // Performance-optimized indexes
    index("idx_fashion_listings_category_status").on(table.fashionCategory, table.status),
    index("idx_fashion_listings_seller_status").on(table.sellerId, table.status),
    index("idx_fashion_listings_price_range").on(table.price),
    index("idx_fashion_listings_created_desc").on(table.createdAt.desc()),
    index("idx_fashion_listings_brand_condition").on(table.brand, table.condition),
    index("idx_fashion_listings_category_price_created").on(table.fashionCategory, table.price, table.createdAt.desc()),
    // Vector indexes for AI search
    index("idx_fashion_listings_combined_embedding").using("ivfflat", table.combinedEmbedding.op("vector_cosine_ops")),
    index("idx_fashion_listings_title_embedding").using("ivfflat", table.titleEmbedding.op("vector_cosine_ops")),
    // Partial indexes for performance
    index("idx_fashion_listings_active").on(table.fashionCategory, table.createdAt.desc()).where(sql `${table.status} = 'active'`),
    index("idx_fashion_listings_promoted").on(table.fashionCategory, table.createdAt.desc()).where(sql `${table.status} = 'active' AND ${table.isPromoted} = true`),
]);
// Fashion likes table - Domain-specific likes
export const fashionLikes = pgTable("fashion_likes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    fashionListingId: uuid("fashion_listing_id").notNull().references(() => fashionListings.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_fashion_likes_user").on(table.userId),
    index("idx_fashion_likes_listing").on(table.fashionListingId),
    // Unique constraint to prevent duplicate likes
    index("idx_fashion_likes_unique").on(table.userId, table.fashionListingId).unique(),
]);
// Fashion comments table - Domain-specific comments
export const fashionComments = pgTable("fashion_comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    fashionListingId: uuid("fashion_listing_id").notNull().references(() => fashionListings.id, { onDelete: 'cascade' }),
    content: text("content").notNull(),
    parentCommentId: uuid("parent_comment_id"), // For threaded comments
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_fashion_comments_listing").on(table.fashionListingId, table.createdAt.desc()),
    index("idx_fashion_comments_user").on(table.userId),
    index("idx_fashion_comments_parent").on(table.parentCommentId),
]);
// Fashion messages table - Domain-specific messaging
export const fashionMessages = pgTable("fashion_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    receiverId: uuid("receiver_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    fashionListingId: uuid("fashion_listing_id").references(() => fashionListings.id, { onDelete: 'set null' }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false),
    messageType: varchar("message_type", { length: 50 }).default('text'), // text, offer, question
    offerAmount: decimal("offer_amount", { precision: 10, scale: 2 }), // For price negotiations
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_fashion_messages_conversation").on(table.senderId, table.receiverId, table.createdAt.desc()),
    index("idx_fashion_messages_listing").on(table.fashionListingId),
    index("idx_fashion_messages_unread").on(table.receiverId, table.isRead),
]);
// Fashion transactions table - Domain-specific transactions
export const fashionTransactions = pgTable("fashion_transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    fashionListingId: uuid("fashion_listing_id").notNull().references(() => fashionListings.id),
    buyerId: uuid("buyer_id").notNull().references(() => users.id),
    sellerId: uuid("seller_id").notNull().references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).default('pending'),
    paymentMethod: varchar("payment_method", { length: 50 }),
    shippingAddress: jsonb("shipping_address"),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_fashion_transactions_buyer").on(table.buyerId),
    index("idx_fashion_transactions_seller").on(table.sellerId),
    index("idx_fashion_transactions_listing").on(table.fashionListingId),
    index("idx_fashion_transactions_status").on(table.status, table.createdAt.desc()),
]);
// Fashion analytics table - Domain-specific analytics
export const fashionAnalytics = pgTable("fashion_analytics", {
    id: uuid("id").primaryKey().defaultRandom(),
    fashionCategory: fashionCategoryEnum("fashion_category").notNull(),
    subcategory: varchar("subcategory", { length: 100 }),
    period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // Listing metrics
    totalListings: integer("total_listings").default(0),
    newListings: integer("new_listings").default(0),
    soldListings: integer("sold_listings").default(0),
    activeListings: integer("active_listings").default(0),
    // Engagement metrics
    totalViews: integer("total_views").default(0),
    totalLikes: integer("total_likes").default(0),
    totalComments: integer("total_comments").default(0),
    totalMessages: integer("total_messages").default(0),
    avgViewsPerListing: decimal("avg_views_per_listing", { precision: 8, scale: 2 }).default("0.00"),
    // Revenue metrics
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
    totalCommissions: decimal("total_commissions", { precision: 12, scale: 2 }).default("0.00"),
    avgPrice: decimal("avg_price", { precision: 8, scale: 2 }).default("0.00"),
    medianPrice: decimal("median_price", { precision: 8, scale: 2 }).default("0.00"),
    // Fashion-specific metrics
    topBrands: jsonb("top_brands"), // Brand performance data
    topSizes: jsonb("top_sizes"), // Size distribution
    topColors: jsonb("top_colors"), // Color preferences
    priceDistribution: jsonb("price_distribution"), // Price range analysis
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_fashion_analytics_category_period").on(table.fashionCategory, table.period, table.periodStart),
    index("idx_fashion_analytics_subcategory_period").on(table.subcategory, table.period, table.periodStart),
]);
// Import users table reference (this will be properly referenced in the main schema)
// Note: This is a placeholder for the users table reference
const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
});
// Relations
export const fashionListingsRelations = relations(fashionListings, ({ one, many }) => ({
    seller: one(users, {
        fields: [fashionListings.sellerId],
        references: [users.id],
    }),
    likes: many(fashionLikes),
    comments: many(fashionComments),
    messages: many(fashionMessages),
    transactions: many(fashionTransactions),
}));
export const fashionLikesRelations = relations(fashionLikes, ({ one }) => ({
    user: one(users, {
        fields: [fashionLikes.userId],
        references: [users.id],
    }),
    fashionListing: one(fashionListings, {
        fields: [fashionLikes.fashionListingId],
        references: [fashionListings.id],
    }),
}));
export const fashionCommentsRelations = relations(fashionComments, ({ one, many }) => ({
    user: one(users, {
        fields: [fashionComments.userId],
        references: [users.id],
    }),
    fashionListing: one(fashionListings, {
        fields: [fashionComments.fashionListingId],
        references: [fashionListings.id],
    }),
    parentComment: one(fashionComments, {
        fields: [fashionComments.parentCommentId],
        references: [fashionComments.id],
        relationName: "parentComment",
    }),
    replies: many(fashionComments, {
        relationName: "parentComment",
    }),
}));
export const fashionMessagesRelations = relations(fashionMessages, ({ one }) => ({
    sender: one(users, {
        fields: [fashionMessages.senderId],
        references: [users.id],
        relationName: "fashionSentMessages",
    }),
    receiver: one(users, {
        fields: [fashionMessages.receiverId],
        references: [users.id],
        relationName: "fashionReceivedMessages",
    }),
    fashionListing: one(fashionListings, {
        fields: [fashionMessages.fashionListingId],
        references: [fashionListings.id],
    }),
}));
export const fashionTransactionsRelations = relations(fashionTransactions, ({ one }) => ({
    fashionListing: one(fashionListings, {
        fields: [fashionTransactions.fashionListingId],
        references: [fashionListings.id],
    }),
    buyer: one(users, {
        fields: [fashionTransactions.buyerId],
        references: [users.id],
        relationName: "fashionPurchases",
    }),
    seller: one(users, {
        fields: [fashionTransactions.sellerId],
        references: [users.id],
        relationName: "fashionSales",
    }),
}));
// Validation schemas
export const insertFashionListingSchema = createInsertSchema(fashionListings).omit({
    id: true,
    sellerId: true,
    viewsCount: true,
    likesCount: true,
    sharesCount: true,
    commentsCount: true,
    titleEmbedding: true,
    descriptionEmbedding: true,
    combinedEmbedding: true,
    createdAt: true,
    updatedAt: true,
});
export const selectFashionListingSchema = createSelectSchema(fashionListings);
export const fashionListingUpdateSchema = createInsertSchema(fashionListings).omit({
    id: true,
    sellerId: true,
    viewsCount: true,
    likesCount: true,
    sharesCount: true,
    commentsCount: true,
    titleEmbedding: true,
    descriptionEmbedding: true,
    combinedEmbedding: true,
    createdAt: true,
    updatedAt: true,
}).partial();
export const insertFashionLikeSchema = createInsertSchema(fashionLikes).omit({
    id: true,
    createdAt: true,
});
export const insertFashionCommentSchema = createInsertSchema(fashionComments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertFashionMessageSchema = createInsertSchema(fashionMessages).omit({
    id: true,
    isRead: true,
    createdAt: true,
});
// Fashion category constants and types
export const FASHION_CATEGORIES = [
    'women',
    'men',
    'kids',
    'home',
    'electronics',
    'pets',
    'beauty',
    'sports'
];
export const CONDITION_OPTIONS = [
    'new_with_tags',
    'new_without_tags',
    'excellent',
    'good',
    'fair',
    'poor'
];
export const FASHION_STATUS_OPTIONS = [
    'active',
    'sold',
    'pending',
    'draft',
    'archived'
];
