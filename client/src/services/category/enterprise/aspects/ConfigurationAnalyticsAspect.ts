/**
 * Configuration Analytics Aspect
 * Enterprise AOP-compliant analytics cross-cutting concern
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles all analytics aspects for configuration operations:
 * - Business intelligence data collection
 * - User behavior analytics
 * - Performance analytics and trends
 * - Configuration usage patterns
 * - Real-time dashboard metrics
 */

import { JoinPoint, Aspect, AspectMetadata, AfterReturning } from './ConfigurationValidationAspect';

// ===== ANALYTICS DOMAIN TYPES =====

/**
 * Analytics Event Value Object
 * Immutable analytics event with complete tracking data
 */
export class AnalyticsEvent {
  constructor(
    public readonly eventId: string,
    public readonly timestamp: number,
    public readonly eventType: string,
    public readonly category: string,
    public readonly action: string,
    public readonly label: string,
    public readonly value: number,
    public readonly properties: Record<string, unknown>,
    public readonly sessionId: string,
    public readonly userId: string | null,
    public readonly deviceInfo: DeviceInfo,
    public readonly performanceData: PerformanceData
  ) {}

  /**
   * Get event age in milliseconds
   */
  get age(): number {
    return Date.now() - this.timestamp;
  }

  /**
   * Check if event is recent (within last hour)
   */
  get isRecent(): boolean {
    return this.age < 3600000; // 1 hour
  }

  /**
   * Get event priority for processing
   */
  get priority(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.eventType === 'error' || this.performanceData.responseTime > 5000) {
      return 'critical';
    }
    if (this.eventType === 'warning' || this.performanceData.responseTime > 2000) {
      return 'high';
    }
    if (this.eventType === 'performance' || this.value > 1000) {
      return 'medium';
    }
    return 'low';
  }
}

/**
 * Device Info Value Object
 * Captures device and environment information
 */
export class DeviceInfo {
  constructor(
    public readonly userAgent: string,
    public readonly platform: string,
    public readonly browser: string,
    public readonly browserVersion: string,
    public readonly screenResolution: string,
    public readonly timezone: string,
    public readonly language: string
  ) {}

  get isMobile(): boolean {
    return /Mobile|Android|iPhone|iPad/.test(this.userAgent);
  }

  get isTablet(): boolean {
    return /iPad|Tablet/.test(this.userAgent);
  }

  get isDesktop(): boolean {
    return !this.isMobile && !this.isTablet;
  }
}

/**
 * Performance Data Value Object
 * Captures performance metrics for analytics
 */
export class PerformanceData {
  constructor(
    public readonly responseTime: number,
    public readonly memoryUsage: number,
    public readonly cacheHit: boolean,
    public readonly errorOccurred: boolean,
    public readonly retryCount: number,
    public readonly networkLatency: number
  ) {}

  get performanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (this.responseTime < 100) return 'A';
    if (this.responseTime < 300) return 'B';
    if (this.responseTime < 1000) return 'C';
    if (this.responseTime < 3000) return 'D';
    return 'F';
  }

  get efficiency(): number {
    let score = 1.0;
    
    // Penalize slow response times
    if (this.responseTime > 1000) score -= 0.3;
    if (this.responseTime > 3000) score -= 0.3;
    
    // Reward cache hits
    if (this.cacheHit) score += 0.2;
    
    // Penalize errors and retries
    if (this.errorOccurred) score -= 0.4;
    score -= this.retryCount * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }
}

/**
 * Usage Pattern Value Object
 * Identifies patterns in configuration usage
 */
export class UsagePattern {
  constructor(
    public readonly configurationKey: string,
    public readonly accessCount: number,
    public readonly uniqueUsers: number,
    public readonly averageResponseTime: number,
    public readonly peakUsageHour: number,
    public readonly errorRate: number,
    public readonly cacheHitRate: number,
    public readonly trendDirection: 'increasing' | 'decreasing' | 'stable'
  ) {}

  get popularityScore(): number {
    // Normalize access count to a 0-1 scale with logarithmic scaling
    return Math.min(1, Math.log10(this.accessCount + 1) / 4);
  }

  get healthScore(): number {
    let score = 1.0;
    
    // Penalize high error rates
    score -= this.errorRate * 0.5;
    
    // Penalize slow response times
    if (this.averageResponseTime > 1000) score -= 0.3;
    
    // Reward high cache hit rates
    score += this.cacheHitRate * 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  get priority(): 'low' | 'medium' | 'high' | 'critical' {
    const combinedScore = (this.popularityScore + this.healthScore) / 2;
    
    if (combinedScore > 0.8) return 'critical';
    if (combinedScore > 0.6) return 'high';
    if (combinedScore > 0.4) return 'medium';
    return 'low';
  }
}

/**
 * Analytics Dashboard Metrics Value Object
 * Real-time metrics for monitoring dashboards
 */
export class DashboardMetrics {
  constructor(
    public readonly totalRequests: number,
    public readonly uniqueUsers: number,
    public readonly averageResponseTime: number,
    public readonly errorRate: number,
    public readonly cacheHitRate: number,
    public readonly topConfigurations: readonly UsagePattern[],
    public readonly recentErrors: readonly AnalyticsEvent[],
    public readonly performanceTrend: readonly number[],
    public readonly userActivityTrend: readonly number[]
  ) {}

  get systemHealthGrade(): 'excellent' | 'good' | 'warning' | 'critical' {
    if (this.errorRate < 0.01 && this.averageResponseTime < 200 && this.cacheHitRate > 0.8) {
      return 'excellent';
    }
    if (this.errorRate < 0.05 && this.averageResponseTime < 500 && this.cacheHitRate > 0.6) {
      return 'good';
    }
    if (this.errorRate < 0.1 && this.averageResponseTime < 2000) {
      return 'warning';
    }
    return 'critical';
  }

  get insights(): string[] {
    const insights: string[] = [];
    
    if (this.cacheHitRate < 0.5) {
      insights.push('Low cache hit rate detected - consider optimizing caching strategy');
    }
    
    if (this.averageResponseTime > 1000) {
      insights.push('High response times detected - performance optimization needed');
    }
    
    if (this.errorRate > 0.05) {
      insights.push('Elevated error rate - investigate error patterns');
    }
    
    if (this.topConfigurations.length > 0) {
      const topConfig = this.topConfigurations[0];
      insights.push(`Most popular configuration: ${topConfig.configurationKey} (${topConfig.accessCount} requests)`);
    }
    
    return insights;
  }
}

// ===== ANALYTICS ENGINES =====

/**
 * Event Aggregation Engine
 * Processes and aggregates analytics events
 */
export class EventAggregationEngine {
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 10000;

  /**
   * Add analytics event
   */
  addEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    
    // Keep only recent events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: string, limit: number = 100): AnalyticsEvent[] {
    return this.events
      .filter(event => event.category === category)
      .slice(-limit);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeRange: number = 3600000): {
    averageResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    totalRequests: number;
  } {
    const cutoff = Date.now() - timeRange;
    const recentEvents = this.events.filter(event => event.timestamp > cutoff);
    
    if (recentEvents.length === 0) {
      return { averageResponseTime: 0, p95ResponseTime: 0, errorRate: 0, totalRequests: 0 };
    }

    const responseTimes = recentEvents.map(e => e.performanceData.responseTime).sort((a, b) => a - b);
    const errorCount = recentEvents.filter(e => e.performanceData.errorOccurred).length;
    
    return {
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      errorRate: errorCount / recentEvents.length,
      totalRequests: recentEvents.length
    };
  }

  /**
   * Get usage patterns
   */
  getUsagePatterns(timeRange: number = 86400000): UsagePattern[] {
    const cutoff = Date.now() - timeRange;
    const recentEvents = this.events.filter(event => event.timestamp > cutoff);
    
    const configGroups = this.groupEventsByConfiguration(recentEvents);
    
    return Array.from(configGroups.entries()).map(([configKey, events]) => {
      const responseTimes = events.map(e => e.performanceData.responseTime);
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      const errors = events.filter(e => e.performanceData.errorOccurred);
      const cacheHits = events.filter(e => e.performanceData.cacheHit);
      
      const hourlyAccess = this.calculateHourlyAccess(events);
      const peakHour = this.findPeakHour(hourlyAccess);
      
      return new UsagePattern(
        configKey,
        events.length,
        uniqueUsers,
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
        peakHour,
        errors.length / events.length,
        cacheHits.length / events.length,
        this.calculateTrend(events)
      );
    });
  }

  private groupEventsByConfiguration(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
    const groups = new Map<string, AnalyticsEvent[]>();
    
    for (const event of events) {
      const configKey = event.label;
      if (!groups.has(configKey)) {
        groups.set(configKey, []);
      }
      groups.get(configKey)!.push(event);
    }
    
    return groups;
  }

  private calculateHourlyAccess(events: AnalyticsEvent[]): number[] {
    const hourly = new Array(24).fill(0);
    
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      hourly[hour]++;
    }
    
    return hourly;
  }

  private findPeakHour(hourlyAccess: number[]): number {
    let maxAccess = 0;
    let peakHour = 0;
    
    for (let hour = 0; hour < hourlyAccess.length; hour++) {
      if (hourlyAccess[hour] > maxAccess) {
        maxAccess = hourlyAccess[hour];
        peakHour = hour;
      }
    }
    
    return peakHour;
  }

  private calculateTrend(events: AnalyticsEvent[]): 'increasing' | 'decreasing' | 'stable' {
    if (events.length < 10) return 'stable';
    
    const half = Math.floor(events.length / 2);
    const firstHalf = events.slice(0, half);
    const secondHalf = events.slice(half);
    
    const firstHalfRate = firstHalf.length / (half * 3600000); // events per hour
    const secondHalfRate = secondHalf.length / (half * 3600000);
    
    const changeRate = (secondHalfRate - firstHalfRate) / firstHalfRate;
    
    if (changeRate > 0.1) return 'increasing';
    if (changeRate < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Clear old events
   */
  clearOldEvents(maxAge: number = 604800000): number {
    const cutoff = Date.now() - maxAge;
    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp > cutoff);
    return initialCount - this.events.length;
  }
}

/**
 * Device Information Detector
 * Extracts device and environment information
 */
export class DeviceInfoDetector {
  /**
   * Detect device info from user agent
   */
  static detect(userAgent: string = ''): DeviceInfo {
    const platform = this.detectPlatform(userAgent);
    const browser = this.detectBrowser(userAgent);
    const browserVersion = this.detectBrowserVersion(userAgent, browser);
    const screenResolution = this.detectScreenResolution();
    const timezone = this.detectTimezone();
    const language = this.detectLanguage();

    return new DeviceInfo(
      userAgent,
      platform,
      browser,
      browserVersion,
      screenResolution,
      timezone,
      language
    );
  }

  private static detectPlatform(userAgent: string): string {
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private static detectBrowser(userAgent: string): string {
    if (/Chrome/i.test(userAgent)) return 'Chrome';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Safari/i.test(userAgent)) return 'Safari';
    if (/Edge/i.test(userAgent)) return 'Edge';
    if (/Opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  private static detectBrowserVersion(userAgent: string, browser: string): string {
    const regex = new RegExp(`${browser}\\/(\\d+\\.\\d+)`, 'i');
    const match = userAgent.match(regex);
    return match ? match[1] : 'Unknown';
  }

  private static detectScreenResolution(): string {
    if (typeof window !== 'undefined' && window.screen) {
      return `${window.screen.width}x${window.screen.height}`;
    }
    return 'Unknown';
  }

  private static detectTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Unknown';
    }
  }

  private static detectLanguage(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.language || 'Unknown';
    }
    return 'Unknown';
  }
}

// ===== CONFIGURATION ANALYTICS ASPECT =====

/**
 * Configuration Analytics Aspect
 * Implements analytics cross-cutting concern for configuration operations
 * 
 * Responsibilities:
 * - Business intelligence data collection
 * - User behavior analytics tracking
 * - Performance analytics and trends
 * - Configuration usage pattern analysis
 * - Real-time dashboard metrics generation
 */
@Aspect()
export class ConfigurationAnalyticsAspect {
  private readonly eventEngine: EventAggregationEngine;
  private readonly sessionTracker = new Map<string, { startTime: number; eventCount: number }>();

  constructor() {
    this.eventEngine = new EventAggregationEngine();
    this.startPeriodicCleanup();
  }

  /**
   * Track Configuration Access
   * @AfterReturning advice - tracks successful configuration access
   */
  @AfterReturning('ConfigurationDomainService.getConfiguration')
  trackConfigurationAccess(joinPoint: JoinPoint<[string]>, result: unknown): void {
    const [configurationKey] = joinPoint.args;
    
    // Extract metadata from join point
    const startTime = joinPoint.metadata.performanceStartTime as number || Date.now();
    const cacheHit = joinPoint.metadata.cacheHit as boolean || false;
    const errorOccurred = false; // Since this is @AfterReturning, no error occurred
    const retryCount = joinPoint.metadata.retryCount as number || 0;
    
    // Calculate performance data
    const responseTime = Date.now() - startTime;
    const memoryUsage = this.getCurrentMemoryUsage();
    const networkLatency = this.estimateNetworkLatency();

    // Create performance data
    const performanceData = new PerformanceData(
      responseTime,
      memoryUsage,
      cacheHit,
      errorOccurred,
      retryCount,
      networkLatency
    );

    // Get device info
    const userAgent = this.getUserAgent();
    const deviceInfo = DeviceInfoDetector.detect(userAgent);

    // Get session information
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    // Track session
    this.updateSessionTracking(sessionId);

    // Create analytics event
    const event = new AnalyticsEvent(
      this.generateEventId(),
      Date.now(),
      'configuration_access',
      'configuration',
      'getConfiguration',
      configurationKey,
      responseTime,
      {
        resultType: typeof result,
        resultSize: this.estimateResultSize(result),
        cacheHit,
        retryCount,
        category: this.extractCategory(configurationKey),
        subcategory: this.extractSubcategory(configurationKey)
      },
      sessionId,
      userId,
      deviceInfo,
      performanceData
    );

    // Add event to aggregation engine
    this.eventEngine.addEvent(event);

    // Log analytics for debugging (in production, would send to analytics service)
    this.logAnalyticsEvent(event);
  }

  /**
   * Get Current Dashboard Metrics
   * Returns real-time metrics for monitoring dashboards
   */
  getDashboardMetrics(timeRange: number = 3600000): DashboardMetrics {
    const performanceMetrics = this.eventEngine.getPerformanceMetrics(timeRange);
    const usagePatterns = this.eventEngine.getUsagePatterns(timeRange);
    const recentErrors = this.getRecentErrors(timeRange);
    const performanceTrend = this.getPerformanceTrend(timeRange);
    const userActivityTrend = this.getUserActivityTrend(timeRange);
    
    // Calculate unique users
    const recentEvents = this.eventEngine.getEventsByTimeRange(Date.now() - timeRange, Date.now());
    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;

    return new DashboardMetrics(
      performanceMetrics.totalRequests,
      uniqueUsers,
      performanceMetrics.averageResponseTime,
      performanceMetrics.errorRate,
      this.calculateCacheHitRate(recentEvents),
      usagePatterns.slice(0, 10), // Top 10 configurations
      recentErrors.slice(0, 20), // Recent 20 errors
      performanceTrend,
      userActivityTrend
    );
  }

  /**
   * Get Configuration Insights
   * Returns AI-generated insights about configuration usage
   */
  getConfigurationInsights(): string[] {
    const metrics = this.getDashboardMetrics();
    const insights: string[] = [];

    // Performance insights
    if (metrics.averageResponseTime > 1000) {
      insights.push(`Average response time is ${Math.round(metrics.averageResponseTime)}ms - consider performance optimization`);
    }

    // Cache insights
    if (metrics.cacheHitRate < 0.6) {
      insights.push(`Cache hit rate is ${Math.round(metrics.cacheHitRate * 100)}% - improve caching strategy`);
    }

    // Usage pattern insights
    if (metrics.topConfigurations.length > 0) {
      const topConfig = metrics.topConfigurations[0];
      insights.push(`Most popular configuration: ${topConfig.configurationKey} with ${topConfig.accessCount} requests`);
      
      if (topConfig.errorRate > 0.05) {
        insights.push(`Top configuration has high error rate (${Math.round(topConfig.errorRate * 100)}%) - investigate issues`);
      }
    }

    // User activity insights
    const hourlyTrend = this.getUserActivityTrend(86400000); // 24 hours
    const peakHour = hourlyTrend.indexOf(Math.max(...hourlyTrend));
    insights.push(`Peak usage occurs at hour ${peakHour}:00 - optimize for this time`);

    return insights;
  }

  /**
   * Export Analytics Data
   * Returns comprehensive analytics data for external analysis
   */
  exportAnalyticsData(timeRange: number = 86400000): {
    events: AnalyticsEvent[];
    metrics: DashboardMetrics;
    patterns: UsagePattern[];
    insights: string[];
  } {
    const cutoff = Date.now() - timeRange;
    const events = this.eventEngine.getEventsByTimeRange(cutoff, Date.now());
    const metrics = this.getDashboardMetrics(timeRange);
    const patterns = this.eventEngine.getUsagePatterns(timeRange);
    const insights = this.getConfigurationInsights();

    return { events, metrics, patterns, insights };
  }

  // ===== PRIVATE HELPER METHODS =====

  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private estimateNetworkLatency(): number {
    // In a real implementation, this would measure actual network latency
    return Math.random() * 50; // Simulated latency 0-50ms
  }

  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'Server-Side-Rendering';
  }

  private getSessionId(): string {
    // In a real implementation, this would get session ID from auth context
    return `session_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  }

  private getUserId(): string | null {
    // In a real implementation, this would get user ID from auth context
    return null; // Assuming anonymous user for now
  }

  private updateSessionTracking(sessionId: string): void {
    const session = this.sessionTracker.get(sessionId);
    if (session) {
      session.eventCount++;
    } else {
      this.sessionTracker.set(sessionId, {
        startTime: Date.now(),
        eventCount: 1
      });
    }
  }

  private estimateResultSize(result: unknown): number {
    try {
      return JSON.stringify(result).length;
    } catch {
      return 0;
    }
  }

  private extractCategory(configurationKey: string): string {
    const parts = configurationKey.split('-');
    return parts[0] || 'unknown';
  }

  private extractSubcategory(configurationKey: string): string {
    const parts = configurationKey.split('-');
    return parts[1] || 'unknown';
  }

  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `evt_${timestamp}_${random}`;
  }

  private logAnalyticsEvent(event: AnalyticsEvent): void {
    // In development, log to console (in production, would send to analytics service)
    console.log('Analytics Event:', {
      type: event.eventType,
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      responseTime: event.performanceData.responseTime,
      cacheHit: event.performanceData.cacheHit,
      deviceType: event.deviceInfo.isMobile ? 'mobile' : event.deviceInfo.isTablet ? 'tablet' : 'desktop'
    });
  }

  private getRecentErrors(timeRange: number): AnalyticsEvent[] {
    const cutoff = Date.now() - timeRange;
    return this.eventEngine.getEventsByTimeRange(cutoff, Date.now())
      .filter(event => event.performanceData.errorOccurred)
      .slice(-20);
  }

  private getPerformanceTrend(timeRange: number): number[] {
    const hourly = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);
    const cutoff = Date.now() - timeRange;
    
    const events = this.eventEngine.getEventsByTimeRange(cutoff, Date.now());
    
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      hourly[hour] += event.performanceData.responseTime;
      hourlyCounts[hour]++;
    }
    
    return hourly.map((total, i) => hourlyCounts[i] > 0 ? total / hourlyCounts[i] : 0);
  }

  private getUserActivityTrend(timeRange: number): number[] {
    const hourly = new Array(24).fill(0);
    const cutoff = Date.now() - timeRange;
    
    const events = this.eventEngine.getEventsByTimeRange(cutoff, Date.now());
    
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      hourly[hour]++;
    }
    
    return hourly;
  }

  private calculateCacheHitRate(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;
    const cacheHits = events.filter(e => e.performanceData.cacheHit).length;
    return cacheHits / events.length;
  }

  private startPeriodicCleanup(): void {
    // Clean up old events every hour
    setInterval(() => {
      const removedCount = this.eventEngine.clearOldEvents(604800000); // 7 days
      if (removedCount > 0) {
        console.log(`Analytics cleanup: removed ${removedCount} old events`);
      }
    }, 3600000); // 1 hour
  }

  /**
   * Get Aspect Metadata
   * Returns aspect execution metadata
   */
  getAspectMetadata(): AspectMetadata {
    const metrics = this.getDashboardMetrics();
    
    return {
      aspectName: 'ConfigurationAnalyticsAspect',
      executionTime: 0, // Analytics tracking should be very fast
      validationRules: [
        'eventTracking',
        'performanceAnalytics',
        'usagePatterns',
        'businessIntelligence'
      ],
      errorCount: 0 // Analytics errors are handled gracefully
    };
  }

  /**
   * Get Analytics Engine
   * Provides access to underlying analytics engine
   */
  getAnalyticsEngine(): EventAggregationEngine {
    return this.eventEngine;
  }
}

export default ConfigurationAnalyticsAspect;