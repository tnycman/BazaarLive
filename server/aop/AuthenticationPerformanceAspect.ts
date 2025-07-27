/**
 * AuthenticationPerformanceAspect - Enterprise AOP Implementation
 * Comprehensive performance monitoring aspect for all authentication operations
 */

import {
  IAuthenticationAspect,
  BaseAuthenticationAspect,
  AspectConfiguration,
  AspectContext,
  JoinPoint,
  AspectError
} from './IAuthenticationAspect';
import { ValidationResult } from '../domain/AuthenticationStrategy';
import { ValidationError } from '../domain/Hostname';
import { Result } from '../domain/Hostname';

// Performance Metric Types
export interface PerformanceMetric {
  readonly operation: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly memoryUsage: NodeJS.MemoryUsage;
  readonly cpuUsage?: NodeJS.CpuUsage;
  readonly context: AspectContext;
  readonly success: boolean;
  readonly error?: string;
  readonly metadata: Record<string, any>;
}

export interface PerformanceStats {
  readonly operation: string;
  readonly totalExecutions: number;
  readonly totalDuration: number;
  readonly averageDuration: number;
  readonly minDuration: number;
  readonly maxDuration: number;
  readonly successRate: number;
  readonly errorRate: number;
  readonly memoryStats: {
    averageHeapUsed: number;
    averageHeapTotal: number;
    averageExternal: number;
    peakHeapUsed: number;
  };
  readonly recentExecutions: PerformanceMetric[];
  readonly period: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceThreshold {
  readonly name: string;
  readonly operation: string;
  readonly maxDuration: number;
  readonly maxMemoryUsage: number;
  readonly maxCpuUsage?: number;
  readonly enabled: boolean;
  readonly severity: 'warning' | 'error' | 'critical';
  readonly onViolation?: (metric: PerformanceMetric, threshold: PerformanceThreshold) => Promise<void>;
}

export interface PerformanceAlert {
  readonly id: string;
  readonly type: 'duration' | 'memory' | 'cpu' | 'error_rate';
  readonly severity: 'warning' | 'error' | 'critical';
  readonly operation: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly metric: PerformanceMetric;
  readonly threshold: PerformanceThreshold;
  readonly context: AspectContext;
}

export interface PerformanceReport {
  readonly generatedAt: Date;
  readonly period: { start: Date; end: Date };
  readonly summary: {
    totalOperations: number;
    totalDuration: number;
    averageDuration: number;
    successRate: number;
    alertCount: number;
  };
  readonly operationStats: PerformanceStats[];
  readonly alerts: PerformanceAlert[];
  readonly recommendations: string[];
}

// Performance Aspect Configuration
export interface PerformanceAspectConfiguration extends AspectConfiguration {
  enableMemoryMonitoring: boolean;
  enableCpuMonitoring: boolean;
  enableDurationMonitoring: boolean;
  enableThroughputMonitoring: boolean;
  enableAlerting: boolean;
  trackRecentExecutions: number;
  performanceReportingInterval: number;
  alertingThresholds: PerformanceThreshold[];
  enableAutoOptimization: boolean;
  enableDetailedProfiling: boolean;
  maxMetricRetention: number;
  enableGarbageCollectionTracking: boolean;
  enableResourceLeakDetection: boolean;
}

/**
 * Authentication Performance Aspect
 * Provides comprehensive performance monitoring and optimization for authentication operations
 */
export class AuthenticationPerformanceAspect extends BaseAuthenticationAspect {
  private performanceMetrics: Map<string, PerformanceMetric[]> = new Map();
  private performanceThresholds: Map<string, PerformanceThreshold> = new Map();
  private performanceAlerts: PerformanceAlert[] = [];
  private operationTimers: Map<string, { startTime: number; cpuUsage?: NodeJS.CpuUsage }> = new Map();
  private gcStats: { collections: number; time: number } = { collections: 0, time: 0 };

  constructor(configuration?: Partial<PerformanceAspectConfiguration>) {
    super({
      name: 'AuthenticationPerformanceAspect',
      enabled: true,
      priority: 150, // Medium-high priority for performance
      pointcuts: ['*'], // Monitor all operations
      options: {},
      ...configuration
    } as PerformanceAspectConfiguration);

    this.initializeDefaultThresholds();
    this.setupGarbageCollectionTracking();
  }

  getName(): string {
    return 'AuthenticationPerformanceAspect';
  }

  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const config = this.getTypedConfiguration();

      // Validate configuration
      if (config.trackRecentExecutions <= 0) {
        errors.push(new ValidationError('Track recent executions must be positive', 'INVALID_TRACKING_COUNT'));
      }

      if (config.performanceReportingInterval <= 0) {
        errors.push(new ValidationError('Performance reporting interval must be positive', 'INVALID_INTERVAL'));
      }

      if (config.maxMetricRetention <= 0) {
        errors.push(new ValidationError('Max metric retention must be positive', 'INVALID_RETENTION'));
      }

      // Validate thresholds
      for (const threshold of config.alertingThresholds) {
        if (threshold.maxDuration <= 0) {
          errors.push(new ValidationError(`Invalid max duration for threshold ${threshold.name}`, 'INVALID_THRESHOLD'));
        }
        if (threshold.maxMemoryUsage <= 0) {
          errors.push(new ValidationError(`Invalid max memory usage for threshold ${threshold.name}`, 'INVALID_THRESHOLD'));
        }
      }

      // Test performance monitoring capabilities
      const testStartTime = process.hrtime.bigint();
      process.hrtime.bigint(); // Test high-resolution time
      const memUsage = process.memoryUsage();
      if (typeof memUsage.heapUsed !== 'number') {
        errors.push(new ValidationError('Memory monitoring not available', 'MEMORY_MONITORING_UNAVAILABLE'));
      }

      return errors.length === 0 
        ? ValidationResult.success()
        : ValidationResult.failure(errors);
    } catch (error) {
      errors.push(new ValidationError(
        `Performance aspect validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      ));

      return ValidationResult.failure(errors);
    }
  }

  // Lifecycle Methods

  async before(joinPoint: JoinPoint): Promise<void> {
    await this.executeWithTracking(
      'before',
      joinPoint.context,
      async () => {
        const config = this.getTypedConfiguration();
        const operationKey = this.getOperationKey(joinPoint);

        // Start performance monitoring
        const startTime = Date.now();
        const cpuUsage = config.enableCpuMonitoring ? process.cpuUsage() : undefined;

        this.operationTimers.set(operationKey, {
          startTime,
          cpuUsage
        });

        // Update context with timing information
        joinPoint.context.metadata.performanceStartTime = startTime;
        joinPoint.context.metadata.performanceTracking = true;
      }
    );
  }

  async after(joinPoint: JoinPoint, result: any): Promise<void> {
    await this.executeWithTracking(
      'after',
      joinPoint.context,
      async () => {
        await this.recordPerformanceMetric(joinPoint, true, undefined, result);
      }
    );
  }

  async afterThrowing(joinPoint: JoinPoint, error: Error): Promise<void> {
    await this.executeWithTracking(
      'afterThrowing',
      joinPoint.context,
      async () => {
        await this.recordPerformanceMetric(joinPoint, false, error);
      }
    );
  }

  async finally(joinPoint: JoinPoint): Promise<void> {
    await this.executeWithTracking(
      'finally',
      joinPoint.context,
      async () => {
        const operationKey = this.getOperationKey(joinPoint);
        
        // Cleanup timer
        this.operationTimers.delete(operationKey);

        // Check for resource leaks
        const config = this.getTypedConfiguration();
        if (config.enableResourceLeakDetection) {
          await this.checkResourceLeaks(joinPoint.context);
        }
      }
    );
  }

  // Performance Monitoring Methods

  async recordPerformanceMetric(
    joinPoint: JoinPoint,
    success: boolean,
    error?: Error,
    result?: any
  ): Promise<void> {
    const config = this.getTypedConfiguration();
    const operationKey = this.getOperationKey(joinPoint);
    const timer = this.operationTimers.get(operationKey);

    if (!timer) {
      return; // No timer found, skip
    }

    const endTime = Date.now();
    const duration = endTime - timer.startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = config.enableCpuMonitoring && timer.cpuUsage 
      ? process.cpuUsage(timer.cpuUsage) 
      : undefined;

    const metric: PerformanceMetric = {
      operation: joinPoint.method,
      startTime: timer.startTime,
      endTime,
      duration,
      memoryUsage,
      cpuUsage,
      context: joinPoint.context,
      success,
      error: error?.message,
      metadata: {
        target: joinPoint.target.constructor.name,
        argsCount: joinPoint.args.length,
        resultType: result ? typeof result : undefined,
        gcCollections: this.gcStats.collections,
        gcTime: this.gcStats.time
      }
    };

    // Store metric
    if (!this.performanceMetrics.has(joinPoint.method)) {
      this.performanceMetrics.set(joinPoint.method, []);
    }

    const metrics = this.performanceMetrics.get(joinPoint.method)!;
    metrics.unshift(metric);

    // Limit stored metrics
    if (metrics.length > config.trackRecentExecutions) {
      metrics.splice(config.trackRecentExecutions);
    }

    // Check thresholds and generate alerts
    if (config.enableAlerting) {
      await this.checkPerformanceThresholds(metric);
    }

    // Auto-optimization if enabled
    if (config.enableAutoOptimization) {
      await this.performAutoOptimization(joinPoint.method, metric);
    }
  }

  async checkPerformanceThresholds(metric: PerformanceMetric): Promise<void> {
    for (const [name, threshold] of Array.from(this.performanceThresholds.entries())) {
      if (!threshold.enabled || threshold.operation !== metric.operation) {
        continue;
      }

      let violation: string | null = null;
      let alertType: 'duration' | 'memory' | 'cpu' | 'error_rate' = 'duration';

      // Check duration threshold
      if (metric.duration > threshold.maxDuration) {
        violation = `Duration ${metric.duration}ms exceeds threshold ${threshold.maxDuration}ms`;
        alertType = 'duration';
      }

      // Check memory threshold
      if (metric.memoryUsage.heapUsed > threshold.maxMemoryUsage) {
        violation = `Memory usage ${metric.memoryUsage.heapUsed} exceeds threshold ${threshold.maxMemoryUsage}`;
        alertType = 'memory';
      }

      // Check CPU threshold (if available)
      if (threshold.maxCpuUsage && metric.cpuUsage) {
        const totalCpuTime = metric.cpuUsage.user + metric.cpuUsage.system;
        if (totalCpuTime > threshold.maxCpuUsage) {
          violation = `CPU usage ${totalCpuTime}μs exceeds threshold ${threshold.maxCpuUsage}μs`;
          alertType = 'cpu';
        }
      }

      if (violation) {
        const alert: PerformanceAlert = {
          id: this.generateAlertId(),
          type: alertType,
          severity: threshold.severity,
          operation: metric.operation,
          message: violation,
          timestamp: new Date(),
          metric,
          threshold,
          context: metric.context
        };

        this.performanceAlerts.unshift(alert);

        // Limit stored alerts
        if (this.performanceAlerts.length > 1000) {
          this.performanceAlerts = this.performanceAlerts.slice(0, 1000);
        }

        // Call threshold violation handler
        if (threshold.onViolation) {
          await threshold.onViolation(metric, threshold);
        }

        // Log alert
        console.warn(`[PERFORMANCE-ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, {
          operation: alert.operation,
          alertType: alert.type,
          context: alert.context.requestId
        });
      }
    }
  }

  async performAutoOptimization(operation: string, metric: PerformanceMetric): Promise<void> {
    // Simple auto-optimization strategies
    const stats = await this.getPerformanceStats(operation);
    
    if (stats.averageDuration > 1000) { // If average duration > 1 second
      console.info(`[PERFORMANCE-OPTIMIZATION] Slow operation detected: ${operation}`, {
        averageDuration: stats.averageDuration,
        recommendation: 'Consider caching or optimization'
      });
    }

    if (stats.memoryStats.averageHeapUsed > 100 * 1024 * 1024) { // If > 100MB
      console.info(`[PERFORMANCE-OPTIMIZATION] High memory usage detected: ${operation}`, {
        averageHeapUsed: stats.memoryStats.averageHeapUsed,
        recommendation: 'Consider memory optimization'
      });
    }
  }

  async checkResourceLeaks(context: AspectContext): Promise<void> {
    const memUsage = process.memoryUsage();
    const threshold = 500 * 1024 * 1024; // 500MB threshold

    if (memUsage.heapUsed > threshold) {
      console.warn(`[PERFORMANCE-LEAK-DETECTION] High memory usage detected`, {
        heapUsed: memUsage.heapUsed,
        threshold,
        context: context.requestId,
        recommendation: 'Possible memory leak'
      });
    }
  }

  // Statistics and Reporting Methods

  async getPerformanceStats(operation: string): Promise<PerformanceStats> {
    const metrics = this.performanceMetrics.get(operation) || [];
    
    if (metrics.length === 0) {
      return {
        operation,
        totalExecutions: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        errorRate: 0,
        memoryStats: {
          averageHeapUsed: 0,
          averageHeapTotal: 0,
          averageExternal: 0,
          peakHeapUsed: 0
        },
        recentExecutions: [],
        period: {
          start: new Date(),
          end: new Date()
        }
      };
    }

    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const successfulMetrics = metrics.filter(m => m.success);
    const heapUsages = metrics.map(m => m.memoryUsage.heapUsed);

    return {
      operation,
      totalExecutions: metrics.length,
      totalDuration,
      averageDuration: totalDuration / metrics.length,
      minDuration: Math.min(...metrics.map(m => m.duration)),
      maxDuration: Math.max(...metrics.map(m => m.duration)),
      successRate: successfulMetrics.length / metrics.length,
      errorRate: (metrics.length - successfulMetrics.length) / metrics.length,
      memoryStats: {
        averageHeapUsed: heapUsages.reduce((sum, h) => sum + h, 0) / heapUsages.length,
        averageHeapTotal: metrics.reduce((sum, m) => sum + m.memoryUsage.heapTotal, 0) / metrics.length,
        averageExternal: metrics.reduce((sum, m) => sum + m.memoryUsage.external, 0) / metrics.length,
        peakHeapUsed: Math.max(...heapUsages)
      },
      recentExecutions: metrics.slice(0, 10), // Last 10 executions
      period: {
        start: new Date(metrics[metrics.length - 1]?.startTime || Date.now()),
        end: new Date(metrics[0]?.endTime || Date.now())
      }
    };
  }

  async getAllPerformanceStats(): Promise<PerformanceStats[]> {
    const allStats: PerformanceStats[] = [];
    
    for (const operation of Array.from(this.performanceMetrics.keys())) {
      const stats = await this.getPerformanceStats(operation);
      allStats.push(stats);
    }

    return allStats;
  }

  async getPerformanceReport(): Promise<PerformanceReport> {
    const allStats = await this.getAllPerformanceStats();
    const recentAlerts = this.performanceAlerts.slice(0, 50); // Last 50 alerts

    const summary = {
      totalOperations: allStats.reduce((sum, s) => sum + s.totalExecutions, 0),
      totalDuration: allStats.reduce((sum, s) => sum + s.totalDuration, 0),
      averageDuration: allStats.length > 0 
        ? allStats.reduce((sum, s) => sum + s.averageDuration, 0) / allStats.length 
        : 0,
      successRate: allStats.length > 0 
        ? allStats.reduce((sum, s) => sum + s.successRate, 0) / allStats.length 
        : 0,
      alertCount: this.performanceAlerts.length
    };

    const recommendations = this.generateRecommendations(allStats, recentAlerts);

    return {
      generatedAt: new Date(),
      period: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      },
      summary,
      operationStats: allStats,
      alerts: recentAlerts,
      recommendations
    };
  }

  getPerformanceAlerts(filter?: { severity?: string; operation?: string }): PerformanceAlert[] {
    let alerts = [...this.performanceAlerts];

    if (filter?.severity) {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }

    if (filter?.operation) {
      alerts = alerts.filter(a => a.operation === filter.operation);
    }

    return alerts;
  }

  // Threshold Management

  addPerformanceThreshold(threshold: PerformanceThreshold): void {
    this.performanceThresholds.set(threshold.name, threshold);
  }

  removePerformanceThreshold(name: string): boolean {
    return this.performanceThresholds.delete(name);
  }

  getPerformanceThresholds(): Map<string, PerformanceThreshold> {
    return new Map(this.performanceThresholds);
  }

  // Protected Methods

  protected async onInitialize(): Promise<void> {
    console.log('[PERFORMANCE-ASPECT] Authentication Performance Aspect initialized', {
      aspectName: this.getName(),
      thresholdsCount: this.performanceThresholds.size,
      configuration: this.getTypedConfiguration()
    });
  }

  protected async onCleanup(): Promise<void> {
    console.log('[PERFORMANCE-ASPECT] Authentication Performance Aspect cleanup', {
      aspectName: this.getName(),
      metricsCount: Array.from(this.performanceMetrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
      alertsCount: this.performanceAlerts.length
    });

    // Cleanup data
    this.performanceMetrics.clear();
    this.performanceAlerts.length = 0;
    this.operationTimers.clear();
  }

  // Private Methods

  private getTypedConfiguration(): PerformanceAspectConfiguration {
    return {
      enableMemoryMonitoring: true,
      enableCpuMonitoring: true,
      enableDurationMonitoring: true,
      enableThroughputMonitoring: true,
      enableAlerting: true,
      trackRecentExecutions: 100,
      performanceReportingInterval: 60000, // 1 minute
      alertingThresholds: [],
      enableAutoOptimization: true,
      enableDetailedProfiling: false,
      maxMetricRetention: 1000,
      enableGarbageCollectionTracking: true,
      enableResourceLeakDetection: true,
      ...this.configuration
    } as PerformanceAspectConfiguration;
  }

  private getOperationKey(joinPoint: JoinPoint): string {
    return `${joinPoint.target.constructor.name}_${joinPoint.method}_${joinPoint.context.requestId}`;
  }

  private generateAlertId(): string {
    return `perf_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultThresholds(): void {
    // Default authentication operation thresholds
    this.addPerformanceThreshold({
      name: 'auth_duration_warning',
      operation: 'authenticate',
      maxDuration: 1000, // 1 second
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      enabled: true,
      severity: 'warning'
    });

    this.addPerformanceThreshold({
      name: 'auth_duration_error',
      operation: 'authenticate',
      maxDuration: 5000, // 5 seconds
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      enabled: true,
      severity: 'error'
    });

    // General operation thresholds
    this.addPerformanceThreshold({
      name: 'general_duration_warning',
      operation: '*',
      maxDuration: 2000, // 2 seconds
      maxMemoryUsage: 75 * 1024 * 1024, // 75MB
      enabled: true,
      severity: 'warning'
    });
  }

  private setupGarbageCollectionTracking(): void {
    const config = this.getTypedConfiguration();
    
    if (config.enableGarbageCollectionTracking && typeof process.on === 'function') {
      // Track GC events if available
      process.on('exit', () => {
        console.log('[PERFORMANCE-GC] Process exit - GC stats:', this.gcStats);
      });
    }
  }

  private generateRecommendations(stats: PerformanceStats[], alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // Analyze stats for recommendations
    const slowOperations = stats.filter(s => s.averageDuration > 1000);
    if (slowOperations.length > 0) {
      recommendations.push(`Consider optimizing slow operations: ${slowOperations.map(s => s.operation).join(', ')}`);
    }

    const highMemoryOperations = stats.filter(s => s.memoryStats.averageHeapUsed > 100 * 1024 * 1024);
    if (highMemoryOperations.length > 0) {
      recommendations.push(`Consider memory optimization for: ${highMemoryOperations.map(s => s.operation).join(', ')}`);
    }

    const lowSuccessRateOperations = stats.filter(s => s.successRate < 0.95);
    if (lowSuccessRateOperations.length > 0) {
      recommendations.push(`Improve error handling for: ${lowSuccessRateOperations.map(s => s.operation).join(', ')}`);
    }

    // Analyze alerts for recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical performance alerts immediately');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable limits');
    }

    return recommendations;
  }
}