import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
// Role and analytics access enums
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const analyticsAccessEnum = pgEnum('analytics_access', ['personal', 'category', 'platform']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  listingsCount: integer("listings_count").default(0),
  salesCount: integer("sales_count").default(0),
  role: userRoleEnum("role").default("user").notNull(),
  analyticsAccess: analyticsAccessEnum("analytics_access").default("personal").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories enum
export const categoryEnum = pgEnum('category', [
  'fashion',
  'jobs', 
  'real_estate',
  'cars',
  'boats',
  'services',
  'electronics',
  'home',
  'beauty',
  'sports',
  'books',
  'toys'
]);

// Condition enum
export const conditionEnum = pgEnum('condition', [
  'new_with_tags',
  'new_without_tags', 
  'excellent',
  'good',
  'fair',
  'poor'
]);

// Status enum
export const statusEnum = pgEnum('status', [
  'active',
  'sold',
  'pending',
  'draft',
  'archived'
]);

// Listings table
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  subcategory: varchar("subcategory"),
  brand: varchar("brand"),
  size: varchar("size"),
  color: varchar("color"),
  condition: conditionEnum("condition"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  images: text("images").array().notNull(),
  tags: varchar("tags").array(),
  status: statusEnum("status").default('active'),
  isPromoted: boolean("is_promoted").default(false),
  viewsCount: integer("views_count").default(0),
  likesCount: integer("likes_count").default(0),
  sharesCount: integer("shares_count").default(0),
  commentsCount: integer("comments_count").default(0),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follows table
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table  
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: varchar("listing_id").notNull().references(() => listings.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: 'set null' }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  followers: many(follows, { relationName: "userFollowers" }),
  following: many(follows, { relationName: "userFollowing" }),
  likes: many(likes),
  comments: many(comments),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  purchases: many(transactions, { relationName: "purchases" }),
  sales: many(transactions, { relationName: "sales" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  likes: many(likes),
  comments: many(comments),
  messages: many(messages),
  transaction: one(transactions),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "userFollowers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "userFollowing",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [likes.listingId],
    references: [listings.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [comments.listingId],
    references: [listings.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  listing: one(listings, {
    fields: [transactions.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "purchases",
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
    relationName: "sales",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  sellerId: true,
  viewsCount: true,
  likesCount: true,
  sharesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Transaction = typeof transactions.$inferSelect;

// Export analytics tables
export * from './analytics-schema';
