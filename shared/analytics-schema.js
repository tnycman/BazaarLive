// Analytics schema definitions with comprehensive metrics tracking
import { pgTable, varchar, integer, timestamp, decimal, jsonb, index, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// User analytics and engagement metrics
export const userAnalytics = pgTable("user_analytics", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    userId: varchar("user_id").notNull(),
    period: varchar("period").notNull(), // daily, weekly, monthly, yearly
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // Engagement metrics
    listingsCreated: integer("listings_created").default(0),
    listingsViewed: integer("listings_viewed").default(0),
    listingsLiked: integer("listings_liked").default(0),
    commentsPosted: integer("comments_posted").default(0),
    messagesReceived: integer("messages_received").default(0),
    messagesSent: integer("messages_sent").default(0),
    followersGained: integer("followers_gained").default(0),
    followingAdded: integer("following_added").default(0),
    // Revenue metrics
    totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
    totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).default("0.00"),
    commissionEarned: decimal("commission_earned", { precision: 10, scale: 2 }).default("0.00"),
    // Activity metrics
    sessionsCount: integer("sessions_count").default(0),
    avgSessionDuration: integer("avg_session_duration").default(0), // in seconds
    pagesViewed: integer("pages_viewed").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("user_analytics_user_period_idx").on(table.userId, table.period, table.periodStart),
    index("user_analytics_period_idx").on(table.period, table.periodStart),
]);
// Platform-wide analytics
export const platformAnalytics = pgTable("platform_analytics", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    period: varchar("period").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // User metrics
    totalUsers: integer("total_users").default(0),
    activeUsers: integer("active_users").default(0),
    newUsers: integer("new_users").default(0),
    returningUsers: integer("returning_users").default(0),
    // Content metrics
    totalListings: integer("total_listings").default(0),
    newListings: integer("new_listings").default(0),
    featuredListings: integer("featured_listings").default(0),
    soldListings: integer("sold_listings").default(0),
    // Engagement metrics
    totalViews: integer("total_views").default(0),
    totalLikes: integer("total_likes").default(0),
    totalComments: integer("total_comments").default(0),
    totalMessages: integer("total_messages").default(0),
    totalFollows: integer("total_follows").default(0),
    // Revenue metrics
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
    totalCommissions: decimal("total_commissions", { precision: 12, scale: 2 }).default("0.00"),
    avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }).default("0.00"),
    // Performance metrics
    avgPageLoadTime: integer("avg_page_load_time").default(0), // in milliseconds
    bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
    conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("platform_analytics_period_idx").on(table.period, table.periodStart),
]);
// Category performance analytics
export const categoryAnalytics = pgTable("category_analytics", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    vertical: varchar("vertical").notNull(),
    category: varchar("category").notNull(),
    period: varchar("period").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // Performance metrics
    totalListings: integer("total_listings").default(0),
    newListings: integer("new_listings").default(0),
    soldListings: integer("sold_listings").default(0),
    activeListings: integer("active_listings").default(0),
    // Engagement metrics
    totalViews: integer("total_views").default(0),
    totalLikes: integer("total_likes").default(0),
    totalComments: integer("total_comments").default(0),
    avgViewsPerListing: decimal("avg_views_per_listing", { precision: 8, scale: 2 }).default("0.00"),
    // Revenue metrics
    totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
    avgPrice: decimal("avg_price", { precision: 8, scale: 2 }).default("0.00"),
    medianPrice: decimal("median_price", { precision: 8, scale: 2 }).default("0.00"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("category_analytics_vertical_category_idx").on(table.vertical, table.category, table.period),
    index("category_analytics_period_idx").on(table.period, table.periodStart),
]);
// Event tracking for detailed analytics
export const analyticsEvents = pgTable("analytics_events", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    userId: varchar("user_id"),
    sessionId: varchar("session_id"),
    eventType: varchar("event_type").notNull(), // page_view, listing_view, like, comment, purchase, etc.
    eventCategory: varchar("event_category").notNull(), // engagement, commerce, navigation, etc.
    eventAction: varchar("event_action").notNull(),
    eventLabel: varchar("event_label"),
    eventValue: integer("event_value"),
    // Context data
    page: varchar("page"),
    referrer: varchar("referrer"),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address"),
    // Custom properties
    properties: jsonb("properties"),
    timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
    index("analytics_events_user_idx").on(table.userId, table.timestamp),
    index("analytics_events_type_idx").on(table.eventType, table.timestamp),
    index("analytics_events_session_idx").on(table.sessionId, table.timestamp),
]);
// User session tracking
export const userSessions = pgTable("user_sessions", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    userId: varchar("user_id"),
    sessionId: varchar("session_id").notNull(),
    startTime: timestamp("start_time").defaultNow(),
    endTime: timestamp("end_time"),
    duration: integer("duration"), // in seconds
    // Session metrics
    pagesViewed: integer("pages_viewed").default(0),
    actionsPerformed: integer("actions_performed").default(0),
    // Device/Browser info
    userAgent: text("user_agent"),
    deviceType: varchar("device_type"), // mobile, tablet, desktop
    browserName: varchar("browser_name"),
    operatingSystem: varchar("operating_system"),
    // Location info
    ipAddress: varchar("ip_address"),
    country: varchar("country"),
    city: varchar("city"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("user_sessions_user_idx").on(table.userId, table.startTime),
    index("user_sessions_session_idx").on(table.sessionId),
]);
// Performance metrics tracking
export const performanceMetrics = pgTable("performance_metrics", {
    id: varchar("id").primaryKey().default("gen_random_uuid()"),
    page: varchar("page").notNull(),
    period: varchar("period").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    // Core Web Vitals
    avgFirstContentfulPaint: integer("avg_first_contentful_paint").default(0), // ms
    avgLargestContentfulPaint: integer("avg_largest_contentful_paint").default(0), // ms
    avgFirstInputDelay: integer("avg_first_input_delay").default(0), // ms
    avgCumulativeLayoutShift: decimal("avg_cumulative_layout_shift", { precision: 5, scale: 3 }).default("0.000"),
    // Loading metrics
    avgPageLoadTime: integer("avg_page_load_time").default(0), // ms
    avgServerResponseTime: integer("avg_server_response_time").default(0), // ms
    avgDomContentLoaded: integer("avg_dom_content_loaded").default(0), // ms
    // Engagement metrics
    avgTimeOnPage: integer("avg_time_on_page").default(0), // seconds
    bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
    exitRate: decimal("exit_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
    samplesCount: integer("samples_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("performance_metrics_page_period_idx").on(table.page, table.period, table.periodStart),
]);
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics);
export const insertPlatformAnalyticsSchema = createInsertSchema(platformAnalytics);
export const insertCategoryAnalyticsSchema = createInsertSchema(categoryAnalytics);
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const insertUserSessionSchema = createInsertSchema(userSessions);
export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics);
// Analytics period enum
export const AnalyticsPeriod = z.enum(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']);
