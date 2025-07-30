/**
 * Configuration Performance Aspect
 * Enterprise AOP-compliant performance monitoring cross-cutting concern
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles all performance monitoring for configuration operations:
 * - Execution time measurement and profiling
 * - Resource utilization tracking
 * - Performance bottleneck detection
 * - Real-time performance analytics
 * - Performance optimization recommendations
 */

import { JoinPoint, Aspect, AspectMetadata, Before, AfterReturning } from './ConfigurationValidationAspect';

// ===== PERFORMANCE DOMAIN TYPES =====

/**
 * Performance Metric Value Object
 * Immutable performance measurement data
 */
export class PerformanceMetric {
  constructor(
    public readonly operation: string,
    public readonly executionTime: number,
    public readonly timestamp: number,
    public readonly memoryUsage: MemoryUsage,
    public readonly metadata: Record<string, unknown>
  ) {}

  get isSlowOperation(): boolean {
    return this.executionTime > 1000; // 1 second threshold
  }

  get performanceGrade(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.executionTime < 50) return 'excellent';
    if (this.executionTime < 200) return 'good';
    if (this.executionTime < 1000) return 'fair';
    return 'poor';
  }
}

/**
 * Memory Usage Value Object
 * Captures memory consumption at specific point in time
 */
export class MemoryUsage {
  constructor(
    public readonly heapUsed: number,
    public readonly heapTotal: number,
    public readonly external: number,
    public readonly rss: number
  ) {}

  get heapUtilization(): number {
    return this.heapTotal > 0 ? this.heapUsed / this.heapTotal : 0;
  }

  get memoryPressure(): 'low' | 'medium' | 'high' {
    if (this.heapUtilization < 0.6) return 'low';
    if (this.heapUtilization < 0.8) return 'medium';
    return 'high';
  }
}

/**
 * Performance Threshold Configuration
 * Defines performance expectations and warning levels
 */
export class PerformanceThresholds {
  constructor(
    public readonly excellentThreshold: number = 50,
    public readonly goodThreshold: number = 200,
    public readonly fairThreshold: number = 1000,
    public readonly criticalThreshold: number = 5000,
    public readonly memoryWarningThreshold: number = 0.8
  ) {}
}

/**
 * Performance Analytics Value Object
 * Aggregated performance statistics and insights
 */
export class PerformanceAnalytics {
  constructor(
    public readonly totalOperations: number,
    public readonly averageExecutionTime: number,
    public readonly medianExecutionTime: number,
    public readonly p95ExecutionTime: number,
    public readonly p99ExecutionTime: number,
    public readonly slowOperationCount: number,
    public readonly errorRate: number,
    public readonly throughput: number,
    public readonly memoryTrend: 'increasing' | 'stable' | 'decreasing'
  ) {}

  get overallHealthGrade(): 'excellent' | 'good' | 'warning' | 'critical' {
    if (this.p95ExecutionTime < 200 && this.errorRate < 0.01) return 'excellent';
    if (this.p95ExecutionTime < 500 && this.errorRate < 0.05) return 'good';
    if (this.p95ExecutionTime < 2000 && this.errorRate < 0.1) return 'warning';
    return 'critical';
  }
}

/**
 * Performance Recommendation Value Object
 * AI-generated performance optimization suggestions
 */
export class PerformanceRecommendation {
  constructor(
    public readonly category: 'caching' | 'optimization' | 'scaling' | 'architecture',
    public readonly priority: 'low' | 'medium' | 'high' | 'critical',
    public readonly title: string,
    public readonly description: string,
    public readonly expectedImprovement: string,
    public readonly implementationEffort: 'low' | 'medium' | 'high'
  ) {}
}

// ===== PERFORMANCE PROFILER =====

/**
 * Method Profiler
 * Detailed profiling for individual method executions
 */
export class MethodProfiler {
  private readonly startTime: number;
  private readonly startMemory: MemoryUsage;
  private checkpoints: Array<{ name: string; time: number; memory: MemoryUsage }> = [];

  constructor(public readonly methodName: string) {
    this.startTime = this.getHighResolutionTime();
    this.startMemory = this.captureMemoryUsage();
  }

  /**
   * Add profiling checkpoint
   */
  checkpoint(name: string): void {
    this.checkpoints.push({
      name,
      time: this.getHighResolutionTime(),
      memory: this.captureMemoryUsage()
    });
  }

  /**
   * Complete profiling and return results
   */
  complete(): PerformanceProfile {
    const endTime = this.getHighResolutionTime();
    const endMemory = this.captureMemoryUsage();
    const totalTime = endTime - this.startTime;

    return new PerformanceProfile(
      this.methodName,
      totalTime,
      this.startMemory,
      endMemory,
      [...this.checkpoints]
    );
  }

  private getHighResolutionTime(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private captureMemoryUsage(): MemoryUsage {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return new MemoryUsage(usage.heapUsed, usage.heapTotal, usage.external, usage.rss);
    }
    
    // Fallback for browser environments
    return new MemoryUsage(0, 0, 0, 0);
  }
}

/**
 * Performance Profile
 * Complete profiling result for a method execution
 */
export class PerformanceProfile {
  constructor(
    public readonly methodName: string,
    public readonly executionTime: number,
    public readonly startMemory: MemoryUsage,
    public readonly endMemory: MemoryUsage,
    public readonly checkpoints: Array<{ name: string; time: number; memory: MemoryUsage }>
  ) {}

  get memoryDelta(): number {
    return this.endMemory.heapUsed - this.startMemory.heapUsed;
  }

  get checkpointAnalysis(): Array<{ name: string; duration: number; memoryDelta: number }> {
    let previousTime = 0;
    let previousMemory = this.startMemory.heapUsed;

    return this.checkpoints.map(checkpoint => {
      const duration = checkpoint.time - previousTime;
      const memoryDelta = checkpoint.memory.heapUsed - previousMemory;
      
      previousTime = checkpoint.time;
      previousMemory = checkpoint.memory.heapUsed;

      return {
        name: checkpoint.name,
        duration,
        memoryDelta
      };
    });
  }
}

// ===== PERFORMANCE LOGGER =====

/**
 * Performance Logger
 * Centralized performance data collection and storage
 */
export class PerformanceLogger {
  private static instance: PerformanceLogger;
  private metrics: PerformanceMetric[] = [];
  private profiles: PerformanceProfile[] = [];

  private constructor() {}

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * Record performance metric
   */
  record(operation: string, executionTime: number, metadata: Record<string, unknown> = {}): void {
    const metric = new PerformanceMetric(
      operation,
      executionTime,
      Date.now(),
      this.captureMemoryUsage(),
      metadata
    );

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record performance profile
   */
  recordProfile(profile: PerformanceProfile): void {
    this.profiles.push(profile);
    
    // Keep only last 100 profiles
    if (this.profiles.length > 100) {
      this.profiles = this.profiles.slice(-100);
    }
  }

  /**
   * Get performance analytics
   */
  getAnalytics(operation?: string): PerformanceAnalytics {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return new PerformanceAnalytics(0, 0, 0, 0, 0, 0, 0, 0, 'stable');
    }

    const executionTimes = relevantMetrics.map(m => m.executionTime).sort((a, b) => a - b);
    const totalOperations = relevantMetrics.length;
    const averageExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / totalOperations;
    const medianExecutionTime = this.calculatePercentile(executionTimes, 50);
    const p95ExecutionTime = this.calculatePercentile(executionTimes, 95);
    const p99ExecutionTime = this.calculatePercentile(executionTimes, 99);
    const slowOperationCount = relevantMetrics.filter(m => m.isSlowOperation).length;
    
    // Calculate throughput (operations per second)
    const timespan = relevantMetrics.length > 1 
      ? (relevantMetrics[relevantMetrics.length - 1].timestamp - relevantMetrics[0].timestamp) / 1000
      : 1;
    const throughput = totalOperations / timespan;

    return new PerformanceAnalytics(
      totalOperations,
      averageExecutionTime,
      medianExecutionTime,
      p95ExecutionTime,
      p99ExecutionTime,
      slowOperationCount,
      0, // errorRate would need error tracking
      throughput,
      this.calculateMemoryTrend()
    );
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(): PerformanceRecommendation[] {
    const analytics = this.getAnalytics();
    const recommendations: PerformanceRecommendation[] = [];

    // Slow performance recommendation
    if (analytics.p95ExecutionTime > 1000) {
      recommendations.push(new PerformanceRecommendation(
        'optimization',
        'high',
        'Optimize slow configuration loading',
        `95% of operations take longer than ${analytics.p95ExecutionTime}ms. Consider implementing configuration preloading or async loading patterns.`,
        '50-70% reduction in load times',
        'medium'
      ));
    }

    // Caching recommendation
    if (analytics.throughput > 10 && analytics.averageExecutionTime > 100) {
      recommendations.push(new PerformanceRecommendation(
        'caching',
        'medium',
        'Implement intelligent caching',
        'High throughput with moderate load times suggests caching would provide significant benefits.',
        '60-80% reduction in response times',
        'low'
      ));
    }

    // Memory pressure recommendation
    const recentMetrics = this.metrics.slice(-10);
    const highMemoryPressure = recentMetrics.some(m => m.memoryUsage.memoryPressure === 'high');
    
    if (highMemoryPressure) {
      recommendations.push(new PerformanceRecommendation(
        'scaling',
        'critical',
        'Address memory pressure',
        'High memory utilization detected. Consider implementing memory optimization or scaling strategies.',
        'Improved stability and performance',
        'high'
      ));
    }

    return recommendations;
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private calculateMemoryTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.metrics.length < 10) return 'stable';

    const recentMetrics = this.metrics.slice(-10);
    const firstMemory = recentMetrics[0].memoryUsage.heapUsed;
    const lastMemory = recentMetrics[recentMetrics.length - 1].memoryUsage.heapUsed;
    
    const changePercentage = (lastMemory - firstMemory) / firstMemory;
    
    if (changePercentage > 0.1) return 'increasing';
    if (changePercentage < -0.1) return 'decreasing';
    return 'stable';
  }

  private captureMemoryUsage(): MemoryUsage {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return new MemoryUsage(usage.heapUsed, usage.heapTotal, usage.external, usage.rss);
    }
    return new MemoryUsage(0, 0, 0, 0);
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.metrics = [];
    this.profiles = [];
  }
}

// ===== CONFIGURATION PERFORMANCE ASPECT =====

/**
 * Configuration Performance Aspect
 * Implements performance monitoring cross-cutting concern for configuration operations
 * 
 * Responsibilities:
 * - Execution time measurement and analysis
 * - Memory usage tracking and optimization
 * - Performance bottleneck identification
 * - Real-time performance analytics
 * - Performance recommendation generation
 */
@Aspect()
export class ConfigurationPerformanceAspect {
  private readonly logger: PerformanceLogger;
  private readonly thresholds: PerformanceThresholds;
  private readonly activeProfilers = new Map<string, MethodProfiler>();

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.logger = PerformanceLogger.getInstance();
    this.thresholds = new PerformanceThresholds(
      thresholds?.excellentThreshold,
      thresholds?.goodThreshold,
      thresholds?.fairThreshold,
      thresholds?.criticalThreshold,
      thresholds?.memoryWarningThreshold
    );
  }

  /**
   * Start Performance Tracking
   * @Before advice - begins performance measurement before method execution
   */
  startPerformanceTracking(joinPoint: JoinPoint<[string]>): void {
    const [configurationKey] = joinPoint.args;
    const operationId = this.generateOperationId(joinPoint);
    
    // Create method profiler
    const profiler = new MethodProfiler(`getConfiguration:${configurationKey}`);
    this.activeProfilers.set(operationId, profiler);
    
    // Store operation metadata
    joinPoint.metadata.performanceOperationId = operationId;
    joinPoint.metadata.performanceStartTime = Date.now();
    joinPoint.metadata.performanceProfiler = profiler;
    
    // Add initial checkpoint
    profiler.checkpoint('validation-start');
  }

  /**
   * End Performance Tracking
   * @AfterReturning advice - completes performance measurement after successful execution
   */
  endPerformanceTracking(joinPoint: JoinPoint<[string]>, result: unknown): void {
    const operationId = joinPoint.metadata.performanceOperationId as string;
    const startTime = joinPoint.metadata.performanceStartTime as number;
    const profiler = joinPoint.metadata.performanceProfiler as MethodProfiler;
    
    if (!operationId || !startTime || !profiler) {
      console.warn('Performance tracking metadata missing');
      return;
    }

    // Complete profiling
    profiler.checkpoint('operation-complete');
    const profile = profiler.complete();
    this.logger.recordProfile(profile);
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    const [configurationKey] = joinPoint.args;
    
    // Record performance metric
    this.logger.record('getConfiguration', executionTime, {
      configurationKey,
      cacheHit: joinPoint.metadata.cacheHit || false,
      validationTime: joinPoint.metadata.validationTime || 0,
      memoryDelta: profile.memoryDelta,
      checkpointCount: profile.checkpoints.length
    });

    // Check performance thresholds
    this.checkPerformanceThresholds(configurationKey, executionTime, profile);
    
    // Cleanup
    this.activeProfilers.delete(operationId);
  }

  /**
   * Track Performance Issues
   * Monitors for performance problems and generates alerts
   */
  private checkPerformanceThresholds(
    configurationKey: string, 
    executionTime: number, 
    profile: PerformanceProfile
  ): void {
    // Check execution time thresholds
    if (executionTime > this.thresholds.criticalThreshold) {
      console.error(`CRITICAL: Configuration loading took ${executionTime}ms for key: ${configurationKey}`);
      this.generatePerformanceAlert('critical', configurationKey, executionTime);
    } else if (executionTime > this.thresholds.fairThreshold) {
      console.warn(`WARNING: Slow configuration loading (${executionTime}ms) for key: ${configurationKey}`);
    }

    // Check memory pressure
    if (profile.endMemory.memoryPressure === 'high') {
      console.warn(`WARNING: High memory pressure detected during configuration loading: ${configurationKey}`);
    }

    // Check for memory leaks
    if (profile.memoryDelta > 10 * 1024 * 1024) { // 10MB increase
      console.warn(`WARNING: Significant memory increase (${profile.memoryDelta / 1024 / 1024}MB) for key: ${configurationKey}`);
    }
  }

  /**
   * Generate Performance Alert
   * Creates actionable performance alerts for critical issues
   */
  private generatePerformanceAlert(severity: string, key: string, executionTime: number): void {
    const analytics = this.logger.getAnalytics();
    const recommendations = this.logger.generateRecommendations();
    
    console.error(`PERFORMANCE ALERT [${severity.toUpperCase()}]`, {
      configurationKey: key,
      executionTime,
      overallHealth: analytics.overallHealthGrade,
      recommendations: recommendations.filter(r => r.priority === 'critical' || r.priority === 'high')
    });
  }

  /**
   * Get Performance Analytics
   * Returns comprehensive performance analytics for monitoring
   */
  getPerformanceAnalytics(operation?: string): PerformanceAnalytics {
    return this.logger.getAnalytics(operation);
  }

  /**
   * Get Performance Recommendations
   * Returns AI-generated optimization recommendations
   */
  getPerformanceRecommendations(): PerformanceRecommendation[] {
    return this.logger.generateRecommendations();
  }

  /**
   * Generate Performance Report
   * Creates comprehensive performance report for analysis
   */
  generatePerformanceReport(): {
    analytics: PerformanceAnalytics;
    recommendations: PerformanceRecommendation[];
    recentMetrics: PerformanceMetric[];
    healthStatus: string;
  } {
    const analytics = this.getPerformanceAnalytics();
    const recommendations = this.getPerformanceRecommendations();
    
    // Get recent metrics (last 10)
    const recentMetrics = this.logger['metrics'].slice(-10);
    
    return {
      analytics,
      recommendations,
      recentMetrics,
      healthStatus: analytics.overallHealthGrade
    };
  }

  /**
   * Reset Performance Data
   * Clears all performance tracking data
   */
  resetPerformanceData(): void {
    this.logger.clear();
    this.activeProfilers.clear();
  }

  /**
   * Generate Operation ID
   * Creates unique identifier for tracking individual operations
   */
  private generateOperationId(joinPoint: JoinPoint): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `perf_${timestamp}_${random}`;
  }

  /**
   * Get Aspect Metadata
   * Returns aspect execution metadata
   */
  getAspectMetadata(): AspectMetadata {
    const analytics = this.getPerformanceAnalytics();
    
    return {
      aspectName: 'ConfigurationPerformanceAspect',
      executionTime: analytics.averageExecutionTime,
      validationRules: [
        'executionTimeTracking',
        'memoryUsageMonitoring',
        'performanceThresholds',
        'bottleneckDetection'
      ],
      errorCount: 0 // Performance issues are warnings, not errors
    };
  }
}

export default ConfigurationPerformanceAspect;