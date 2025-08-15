// Analytics Service - Enterprise-grade analytics tracking
import { db } from '../db.js';
import { analyticsEvents, userSessions } from '@shared/analytics-schema';
import { Logger } from '../middleware/Logger.js';

export interface AnalyticsEvent {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  properties?: Record<string, any>;
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  enableUserSessions: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
  enableDebugLogging: boolean;
}

export class AnalyticsService {
  private logger: Logger;
  private config: AnalyticsConfig;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.logger = new Logger('AnalyticsService');
    this.config = {
      enableTracking: true,
      enableUserSessions: true,
      batchSize: 100,
      flushInterval: 5000, // 5 seconds
      enableDebugLogging: false,
      ...config
    };

    if (this.config.enableTracking) {
      this.startFlushTimer();
    }
  }

  async trackEvent(
    eventType: string,
    properties: Record<string, any> = {},
    context?: {
      userId?: string;
      sessionId?: string;
      page?: string;
      userAgent?: string;
      ipAddress?: string;
    }
  ): Promise<void> {
    if (!this.config.enableTracking) {
      return;
    }

    try {
      const event: AnalyticsEvent = {
        userId: context?.userId,
        sessionId: context?.sessionId || this.generateSessionId(),
        eventType,
        eventCategory: this.deriveEventCategory(eventType),
        eventAction: eventType,
        eventLabel: properties.label,
        eventValue: properties.value,
        page: context?.page,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      };

      if (this.config.enableDebugLogging) {
        this.logger.debug('Tracking event', { eventType, properties });
      }

      // Add to buffer
      this.eventBuffer.push(event);

      // Flush if buffer is full
      if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flushEvents();
      }

    } catch (error) {
      this.logger.error('Failed to track event', {
        eventType,
        properties,
        error: error.message
      });
    }
  }

  async trackPageView(
    page: string,
    context?: {
      userId?: string;
      sessionId?: string;
      referrer?: string;
      userAgent?: string;
      ipAddress?: string;
    }
  ): Promise<void> {
    await this.trackEvent('page_view', { page }, {
      ...context,
      page
    });
  }

  async trackUserAction(
    action: string,
    target: string,
    properties: Record<string, any> = {},
    context?: {
      userId?: string;
      sessionId?: string;
      page?: string;
    }
  ): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      target,
      ...properties
    }, context);
  }

  async trackBusinessEvent(
    event: string,
    data: Record<string, any>,
    context?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<void> {
    await this.trackEvent(event, data, context);
  }

  async startUserSession(
    userId?: string,
    sessionInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceType?: string;
      browserName?: string;
      operatingSystem?: string;
      country?: string;
      city?: string;
    }
  ): Promise<string> {
    if (!this.config.enableUserSessions) {
      return this.generateSessionId();
    }

    try {
      const sessionId = this.generateSessionId();

      await db.insert(userSessions).values({
        userId,
        sessionId,
        startTime: new Date(),
        userAgent: sessionInfo?.userAgent,
        deviceType: sessionInfo?.deviceType,
        browserName: sessionInfo?.browserName,
        operatingSystem: sessionInfo?.operatingSystem,
        ipAddress: sessionInfo?.ipAddress,
        country: sessionInfo?.country,
        city: sessionInfo?.city,
        pagesViewed: 0,
        actionsPerformed: 0,
        createdAt: new Date()
      });

      this.logger.debug('User session started', { userId, sessionId });
      return sessionId;

    } catch (error) {
      this.logger.error('Failed to start user session', {
        userId,
        error: error.message
      });
      return this.generateSessionId();
    }
  }

  async endUserSession(sessionId: string): Promise<void> {
    if (!this.config.enableUserSessions) {
      return;
    }

    try {
      const endTime = new Date();
      
      // Calculate session duration
      const session = await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.sessionId, sessionId))
        .limit(1);

      if (session.length > 0) {
        const startTime = session[0].startTime;
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        await db
          .update(userSessions)
          .set({
            endTime,
            duration
          })
          .where(eq(userSessions.sessionId, sessionId));

        this.logger.debug('User session ended', { sessionId, duration });
      }

    } catch (error) {
      this.logger.error('Failed to end user session', {
        sessionId,
        error: error.message
      });
    }
  }

  async getEventStats(
    eventType?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    eventBreakdown: Array<{ eventType: string; count: number }>;
  }> {
    try {
      // This would implement complex analytics queries
      // For now, return placeholder data
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventBreakdown: []
      };
    } catch (error) {
      this.logger.error('Failed to get event stats', { error: error.message });
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventBreakdown: []
      };
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Insert events in batch
      await db.insert(analyticsEvents).values(
        events.map(event => ({
          userId: event.userId,
          sessionId: event.sessionId,
          eventType: event.eventType,
          eventCategory: event.eventCategory,
          eventAction: event.eventAction,
          eventLabel: event.eventLabel,
          eventValue: event.eventValue,
          page: event.page,
          referrer: event.referrer,
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
          properties: event.properties,
          timestamp: new Date()
        }))
      );

      if (this.config.enableDebugLogging) {
        this.logger.debug('Flushed analytics events', { count: events.length });
      }

    } catch (error) {
      this.logger.error('Failed to flush analytics events', {
        count: events.length,
        error: error.message
      });

      // Re-add events to buffer for retry (with limit to prevent memory issues)
      if (this.eventBuffer.length < this.config.batchSize * 2) {
        this.eventBuffer.unshift(...events);
      }
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents().catch(error => {
        this.logger.error('Scheduled flush failed', { error: error.message });
      });
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private deriveEventCategory(eventType: string): string {
    if (eventType.includes('listing')) return 'listing';
    if (eventType.includes('user')) return 'user';
    if (eventType.includes('search')) return 'search';
    if (eventType.includes('page')) return 'navigation';
    if (eventType.includes('purchase') || eventType.includes('sale')) return 'commerce';
    return 'general';
  }

  async shutdown(): Promise<void> {
    this.stopFlushTimer();
    
    // Flush remaining events
    await this.flushEvents();
    
    this.logger.info('Analytics service shutdown complete');
  }
}

// Factory function
export function createAnalyticsService(config?: Partial<AnalyticsConfig>): AnalyticsService {
  return new AnalyticsService(config);
}
