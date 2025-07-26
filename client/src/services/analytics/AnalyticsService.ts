// Comprehensive analytics service with enterprise-grade tracking
import { InsertAnalyticsEvent, AnalyticsPeriodType } from '@shared/analytics-schema';

export interface AnalyticsMetrics {
  period: AnalyticsPeriodType;
  startDate: Date;
  endDate: Date;
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    avgSessionDuration: number;
  };
  contentMetrics: {
    totalListings: number;
    newListings: number;
    soldListings: number;
    avgViewsPerListing: number;
  };
  engagementMetrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalMessages: number;
    bounceRate: number;
    conversionRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    avgOrderValue: number;
    commissionEarned: number;
    revenueGrowth: number;
  };
}

export interface CategoryMetrics {
  vertical: string;
  category: string;
  period: AnalyticsPeriodType;
  performance: {
    totalListings: number;
    soldListings: number;
    conversionRate: number;
    avgPrice: number;
    totalRevenue: number;
  };
  engagement: {
    totalViews: number;
    avgViewsPerListing: number;
    totalLikes: number;
    totalComments: number;
  };
  trends: {
    listingsGrowth: number;
    revenueGrowth: number;
    engagementGrowth: number;
  };
}

export interface UserPerformanceMetrics {
  userId: string;
  period: AnalyticsPeriodType;
  sales: {
    totalSales: number;
    itemsSold: number;
    avgSalePrice: number;
    commissionEarned: number;
  };
  engagement: {
    profileViews: number;
    followersGained: number;
    listingsViewed: number;
    messagesReceived: number;
  };
  activity: {
    listingsCreated: number;
    sessionsCount: number;
    avgSessionDuration: number;
    pagesViewed: number;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): void {
    // Initialize session tracking
    this.trackEvent({
      eventType: 'session_start',
      eventCategory: 'engagement',
      eventAction: 'session_initialize',
      properties: {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public async trackEvent(event: Partial<InsertAnalyticsEvent>): Promise<void> {
    try {
      const eventData: InsertAnalyticsEvent = {
        userId: this.userId,
        sessionId: this.sessionId,
        eventType: event.eventType || 'unknown',
        eventCategory: event.eventCategory || 'general',
        eventAction: event.eventAction || 'unknown',
        eventLabel: event.eventLabel,
        eventValue: event.eventValue,
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        properties: event.properties || {},
        ...event
      };

      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  // Page view tracking
  public trackPageView(page: string, title?: string): void {
    this.trackEvent({
      eventType: 'page_view',
      eventCategory: 'navigation',
      eventAction: 'view_page',
      eventLabel: page,
      properties: {
        pageTitle: title || document.title,
        url: window.location.href
      }
    });
  }

  // Listing interaction tracking
  public trackListingView(listingId: string, category: string, vertical: string): void {
    this.trackEvent({
      eventType: 'listing_view',
      eventCategory: 'engagement',
      eventAction: 'view_listing',
      eventLabel: listingId,
      properties: {
        category,
        vertical,
        listingId
      }
    });
  }

  public trackListingLike(listingId: string, action: 'like' | 'unlike'): void {
    this.trackEvent({
      eventType: 'listing_interaction',
      eventCategory: 'engagement',
      eventAction: action,
      eventLabel: listingId,
      properties: {
        listingId,
        interactionType: action
      }
    });
  }

  public trackListingComment(listingId: string, commentLength: number): void {
    this.trackEvent({
      eventType: 'listing_interaction',
      eventCategory: 'engagement',
      eventAction: 'comment',
      eventLabel: listingId,
      eventValue: commentLength,
      properties: {
        listingId,
        commentLength
      }
    });
  }

  // Commerce tracking
  public trackPurchase(transactionId: string, value: number, listingId: string): void {
    this.trackEvent({
      eventType: 'purchase',
      eventCategory: 'commerce',
      eventAction: 'complete_purchase',
      eventLabel: transactionId,
      eventValue: Math.round(value * 100), // Convert to cents
      properties: {
        transactionId,
        listingId,
        value
      }
    });
  }

  public trackListingCreation(listingId: string, category: string, price: number): void {
    this.trackEvent({
      eventType: 'listing_creation',
      eventCategory: 'content',
      eventAction: 'create_listing',
      eventLabel: listingId,
      eventValue: Math.round(price * 100),
      properties: {
        listingId,
        category,
        price
      }
    });
  }

  // User interaction tracking
  public trackUserFollow(targetUserId: string, action: 'follow' | 'unfollow'): void {
    this.trackEvent({
      eventType: 'user_interaction',
      eventCategory: 'social',
      eventAction: action,
      eventLabel: targetUserId,
      properties: {
        targetUserId,
        action
      }
    });
  }

  public trackMessage(recipientId: string, messageLength: number): void {
    this.trackEvent({
      eventType: 'message',
      eventCategory: 'communication',
      eventAction: 'send_message',
      eventLabel: recipientId,
      eventValue: messageLength,
      properties: {
        recipientId,
        messageLength
      }
    });
  }

  // Search tracking
  public trackSearch(query: string, resultsCount: number, filters?: any): void {
    this.trackEvent({
      eventType: 'search',
      eventCategory: 'discovery',
      eventAction: 'perform_search',
      eventLabel: query,
      eventValue: resultsCount,
      properties: {
        query,
        resultsCount,
        filters
      }
    });
  }

  // Performance tracking
  public trackPerformance(metrics: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  }): void {
    this.trackEvent({
      eventType: 'performance',
      eventCategory: 'technical',
      eventAction: 'page_performance',
      properties: {
        ...metrics,
        page: window.location.pathname
      }
    });
  }

  // Error tracking
  public trackError(error: Error, context?: string): void {
    this.trackEvent({
      eventType: 'error',
      eventCategory: 'technical',
      eventAction: 'javascript_error',
      eventLabel: error.message,
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        context,
        page: window.location.pathname
      }
    });
  }

  // API Methods for fetching analytics data
  public async getPlatformMetrics(
    period: AnalyticsPeriodType,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsMetrics> {
    const response = await fetch(`/api/analytics/platform?period=${period}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch platform metrics');
    }
    return response.json();
  }

  public async getCategoryMetrics(
    vertical?: string,
    category?: string,
    period: AnalyticsPeriodType = 'monthly'
  ): Promise<CategoryMetrics[]> {
    const params = new URLSearchParams({ period });
    if (vertical) params.append('vertical', vertical);
    if (category) params.append('category', category);

    const response = await fetch(`/api/analytics/categories?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch category metrics');
    }
    return response.json();
  }

  public async getUserMetrics(
    userId: string,
    period: AnalyticsPeriodType = 'monthly'
  ): Promise<UserPerformanceMetrics> {
    const response = await fetch(`/api/analytics/users/${userId}?period=${period}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user metrics');
    }
    return response.json();
  }

  public async getRealtimeMetrics(): Promise<{
    activeUsers: number;
    currentPageViews: number;
    topPages: Array<{ page: string; views: number }>;
    topSources: Array<{ source: string; users: number }>;
  }> {
    const response = await fetch('/api/analytics/realtime');
    if (!response.ok) {
      throw new Error('Failed to fetch realtime metrics');
    }
    return response.json();
  }
}

export const analyticsService = AnalyticsService.getInstance();