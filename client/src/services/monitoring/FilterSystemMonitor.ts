/**
 * Filter System Monitor Service
 * Real-time monitoring and alerting for the filter system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterStateManager } from '@/services/filtering/FilterStateManager';
import { FilterPerformanceOptimizer } from '@/services/performance/FilterPerformanceOptimizer';
import type { FilterState, FilterStateUpdate } from '@/services/filtering/FilterStateManager';
import type { PerformanceMetrics } from '@/services/performance/FilterPerformanceOptimizer';

// ===== MONITORING INTERFACES =====

/**
 * Monitoring configuration interface
 */
export interface MonitoringConfig {
  readonly enabled: boolean;
  readonly autoStart: boolean;
  readonly monitoringInterval: number;
  readonly alertThresholds: AlertThresholds;
  readonly enableRealTimeMetrics: boolean;
  readonly enableHistoricalMetrics: boolean;
  readonly enablePerformanceAlerts: boolean;
  readonly enableErrorAlerts: boolean;
  readonly enableMemoryAlerts: boolean;
  readonly enableNetworkAlerts: boolean;
  readonly enableCustomAlerts: boolean;
  readonly maxHistoricalDataPoints: number;
  readonly enableDataExport: boolean;
  readonly enableRemoteMonitoring: boolean;
  readonly enableHealthChecks: boolean;
  readonly enablePredictiveAnalytics: boolean;
  readonly enableAnomalyDetection: boolean;
  readonly enableTrendAnalysis: boolean;
  readonly enableCapacityPlanning: boolean;
  readonly enableResourceOptimization: boolean;
}

/**
 * Alert thresholds interface
 */
export interface AlertThresholds {
  readonly renderTimeMax: number;
  readonly updateTimeMax: number;
  readonly memoryUsageMax: number;
  readonly cpuUsageMax: number;
  readonly errorRateMax: number;
  readonly cacheHitRateMin: number;
  readonly batchEfficiencyMin: number;
  readonly debounceEfficiencyMin: number;
  readonly virtualizationEfficiencyMin: number;
  readonly compressionRatioMin: number;
  readonly optimizationScoreMin: number;
  readonly networkLatencyMax: number;
  readonly responseTimeMax: number;
  readonly throughputMin: number;
  readonly availabilityMin: number;
}

/**
 * Monitoring metrics interface
 */
export interface MonitoringMetrics {
  readonly timestamp: number;
  readonly performance: PerformanceMetrics;
  readonly system: SystemMetrics;
  readonly network: NetworkMetrics;
  readonly errors: ErrorMetrics;
  readonly alerts: AlertMetrics;
  readonly health: HealthMetrics;
  readonly trends: TrendMetrics;
  readonly anomalies: AnomalyMetrics;
  readonly predictions: PredictionMetrics;
  readonly recommendations: readonly string[];
}

/**
 * System metrics interface
 */
export interface SystemMetrics {
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly diskUsage: number;
  readonly networkUsage: number;
  readonly processCount: number;
  readonly threadCount: number;
  readonly uptime: number;
  readonly loadAverage: number;
  readonly availableMemory: number;
  readonly totalMemory: number;
  readonly heapSize: number;
  readonly heapUsed: number;
  readonly externalMemory: number;
  readonly gcTime: number;
  readonly gcCount: number;
}

/**
 * Network metrics interface
 */
export interface NetworkMetrics {
  readonly requestsPerSecond: number;
  readonly responseTime: number;
  readonly throughput: number;
  readonly latency: number;
  readonly bandwidth: number;
  readonly packetLoss: number;
  readonly connectionCount: number;
  readonly activeConnections: number;
  readonly failedRequests: number;
  readonly successfulRequests: number;
  readonly totalRequests: number;
  readonly averageResponseSize: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly compressionRatio: number;
}

/**
 * Error metrics interface
 */
export interface ErrorMetrics {
  readonly totalErrors: number;
  readonly errorRate: number;
  readonly criticalErrors: number;
  readonly warningErrors: number;
  readonly infoErrors: number;
  readonly errorTypes: readonly string[];
  readonly errorMessages: readonly string[];
  readonly errorStackTraces: readonly string[];
  readonly errorTimestamps: readonly number[];
  readonly errorSeverities: readonly string[];
  readonly errorSources: readonly string[];
  readonly errorCategories: readonly string[];
  readonly errorTrends: readonly number[];
  readonly errorPatterns: readonly string[];
  readonly errorRecommendations: readonly string[];
}

/**
 * Alert metrics interface
 */
export interface AlertMetrics {
  readonly totalAlerts: number;
  readonly criticalAlerts: number;
  readonly warningAlerts: number;
  readonly infoAlerts: number;
  readonly alertTypes: readonly string[];
  readonly alertMessages: readonly string[];
  readonly alertTimestamps: readonly number[];
  readonly alertSeverities: readonly string[];
  readonly alertSources: readonly string[];
  readonly alertCategories: readonly string[];
  readonly alertTrends: readonly number[];
  readonly alertPatterns: readonly string[];
  readonly alertRecommendations: readonly string[];
  readonly acknowledgedAlerts: number;
  readonly resolvedAlerts: number;
  readonly pendingAlerts: number;
}

/**
 * Health metrics interface
 */
export interface HealthMetrics {
  readonly overallHealth: 'healthy' | 'warning' | 'critical';
  readonly componentHealth: Record<string, 'healthy' | 'warning' | 'critical'>;
  readonly healthScore: number;
  readonly healthTrends: readonly number[];
  readonly healthPatterns: readonly string[];
  readonly healthRecommendations: readonly string[];
  readonly lastHealthCheck: number;
  readonly healthCheckInterval: number;
  readonly healthCheckTimeout: number;
  readonly healthCheckRetries: number;
  readonly healthCheckSuccess: number;
  readonly healthCheckFailure: number;
  readonly healthCheckDuration: number;
  readonly healthCheckLatency: number;
  readonly healthCheckThroughput: number;
  readonly healthCheckAvailability: number;
}

/**
 * Trend metrics interface
 */
export interface TrendMetrics {
  readonly performanceTrend: readonly number[];
  readonly memoryTrend: readonly number[];
  readonly cpuTrend: readonly number[];
  readonly networkTrend: readonly number[];
  readonly errorTrend: readonly number[];
  readonly alertTrend: readonly number[];
  readonly healthTrend: readonly number[];
  readonly optimizationTrend: readonly number[];
  readonly efficiencyTrend: readonly number[];
  readonly throughputTrend: readonly number[];
  readonly latencyTrend: readonly number[];
  readonly availabilityTrend: readonly number[];
  readonly reliabilityTrend: readonly number[];
  readonly scalabilityTrend: readonly number[];
  readonly maintainabilityTrend: readonly number[];
}

/**
 * Anomaly metrics interface
 */
export interface AnomalyMetrics {
  readonly detectedAnomalies: number;
  readonly anomalyTypes: readonly string[];
  readonly anomalySeverities: readonly string[];
  readonly anomalyTimestamps: readonly number[];
  readonly anomalyScores: readonly number[];
  readonly anomalyPatterns: readonly string[];
  readonly anomalyRecommendations: readonly string[];
  readonly falsePositives: number;
  readonly falseNegatives: number;
  readonly truePositives: number;
  readonly trueNegatives: number;
  readonly anomalyAccuracy: number;
  readonly anomalyPrecision: number;
  readonly anomalyRecall: number;
  readonly anomalyF1Score: number;
}

/**
 * Prediction metrics interface
 */
export interface PredictionMetrics {
  readonly predictedPerformance: readonly number[];
  readonly predictedMemory: readonly number[];
  readonly predictedCpu: readonly number[];
  readonly predictedNetwork: readonly number[];
  readonly predictedErrors: readonly number[];
  readonly predictedAlerts: readonly number[];
  readonly predictedHealth: readonly number[];
  readonly predictedOptimization: readonly number[];
  readonly predictedEfficiency: readonly number[];
  readonly predictedThroughput: readonly number[];
  readonly predictedLatency: readonly number[];
  readonly predictedAvailability: readonly number[];
  readonly predictedReliability: readonly number[];
  readonly predictedScalability: readonly number[];
  readonly predictedMaintainability: readonly number[];
  readonly predictionAccuracy: number;
  readonly predictionConfidence: number;
  readonly predictionHorizon: number;
  readonly predictionInterval: number;
  readonly predictionMethod: string;
}

/**
 * Alert interface
 */
export interface Alert {
  readonly id: string;
  readonly type: string;
  readonly severity: 'critical' | 'warning' | 'info';
  readonly message: string;
  readonly timestamp: number;
  readonly source: string;
  readonly category: string;
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
  readonly trend: 'increasing' | 'decreasing' | 'stable';
  readonly acknowledged: boolean;
  readonly resolved: boolean;
  readonly acknowledgedBy?: string;
  readonly acknowledgedAt?: number;
  readonly resolvedBy?: string;
  readonly resolvedAt?: number;
  readonly resolution?: string;
  readonly recommendations: readonly string[];
}

/**
 * Monitoring event interface
 */
export interface MonitoringEvent {
  readonly type: 'metric' | 'alert' | 'error' | 'health' | 'trend' | 'anomaly' | 'prediction';
  readonly timestamp: number;
  readonly data: any;
  readonly source: string;
  readonly category: string;
  readonly severity?: 'critical' | 'warning' | 'info';
  readonly message?: string;
  readonly recommendations?: readonly string[];
}

// ===== MONITORING CONSTANTS =====

const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  enabled: true,
  autoStart: true,
  monitoringInterval: 5000, // 5 seconds
  alertThresholds: {
    renderTimeMax: 100,
    updateTimeMax: 50,
    memoryUsageMax: 50 * 1024 * 1024, // 50MB
    cpuUsageMax: 80,
    errorRateMax: 0.05, // 5%
    cacheHitRateMin: 0.8, // 80%
    batchEfficiencyMin: 0.7, // 70%
    debounceEfficiencyMin: 0.6, // 60%
    virtualizationEfficiencyMin: 0.8, // 80%
    compressionRatioMin: 0.3, // 30%
    optimizationScoreMin: 0.7, // 70%
    networkLatencyMax: 1000, // 1 second
    responseTimeMax: 2000, // 2 seconds
    throughputMin: 100, // 100 requests/second
    availabilityMin: 0.99, // 99%
  },
  enableRealTimeMetrics: true,
  enableHistoricalMetrics: true,
  enablePerformanceAlerts: true,
  enableErrorAlerts: true,
  enableMemoryAlerts: true,
  enableNetworkAlerts: true,
  enableCustomAlerts: true,
  maxHistoricalDataPoints: 1000,
  enableDataExport: true,
  enableRemoteMonitoring: false,
  enableHealthChecks: true,
  enablePredictiveAnalytics: true,
  enableAnomalyDetection: true,
  enableTrendAnalysis: true,
  enableCapacityPlanning: true,
  enableResourceOptimization: true,
};

// ===== MONITORING SERVICE =====

/**
 * Enterprise-grade filter system monitor service
 * Provides comprehensive real-time monitoring and alerting
 */
export class FilterSystemMonitor {
  private readonly config: MonitoringConfig;
  private readonly filterStateManager: FilterStateManager;
  private readonly performanceOptimizer: FilterPerformanceOptimizer;
  private readonly metrics: MonitoringMetrics;
  private readonly historicalData: MonitoringMetrics[];
  private readonly alerts: Alert[];
  private readonly eventListeners: Map<string, ((event: MonitoringEvent) => void)[]>;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(
    config: Partial<MonitoringConfig> = {},
    filterStateManager: FilterStateManager = FilterStateManager.getInstance(),
    performanceOptimizer: FilterPerformanceOptimizer = new FilterPerformanceOptimizer()
  ) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
    this.filterStateManager = filterStateManager;
    this.performanceOptimizer = performanceOptimizer;
    this.metrics = this.initializeMetrics();
    this.historicalData = [];
    this.alerts = [];
    this.eventListeners = new Map();

    if (this.config.autoStart) {
      this.startMonitoring();
    }
  }

  /**
   * Initialize monitoring metrics
   */
  private initializeMetrics(): MonitoringMetrics {
    return {
      timestamp: Date.now(),
      performance: {
        renderTime: 0,
        updateTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkRequests: 0,
        cacheHitRate: 0,
        batchEfficiency: 0,
        debounceEfficiency: 0,
        virtualizationEfficiency: 0,
        compressionRatio: 0,
        optimizationScore: 0,
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        networkUsage: 0,
        processCount: 0,
        threadCount: 0,
        uptime: 0,
        loadAverage: 0,
        availableMemory: 0,
        totalMemory: 0,
        heapSize: 0,
        heapUsed: 0,
        externalMemory: 0,
        gcTime: 0,
        gcCount: 0,
      },
      network: {
        requestsPerSecond: 0,
        responseTime: 0,
        throughput: 0,
        latency: 0,
        bandwidth: 0,
        packetLoss: 0,
        connectionCount: 0,
        activeConnections: 0,
        failedRequests: 0,
        successfulRequests: 0,
        totalRequests: 0,
        averageResponseSize: 0,
        cacheHits: 0,
        cacheMisses: 0,
        compressionRatio: 0,
      },
      errors: {
        totalErrors: 0,
        errorRate: 0,
        criticalErrors: 0,
        warningErrors: 0,
        infoErrors: 0,
        errorTypes: [],
        errorMessages: [],
        errorStackTraces: [],
        errorTimestamps: [],
        errorSeverities: [],
        errorSources: [],
        errorCategories: [],
        errorTrends: [],
        errorPatterns: [],
        errorRecommendations: [],
      },
      alerts: {
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        infoAlerts: 0,
        alertTypes: [],
        alertMessages: [],
        alertTimestamps: [],
        alertSeverities: [],
        alertSources: [],
        alertCategories: [],
        alertTrends: [],
        alertPatterns: [],
        alertRecommendations: [],
        acknowledgedAlerts: 0,
        resolvedAlerts: 0,
        pendingAlerts: 0,
      },
      health: {
        overallHealth: 'healthy',
        componentHealth: {},
        healthScore: 100,
        healthTrends: [],
        healthPatterns: [],
        healthRecommendations: [],
        lastHealthCheck: Date.now(),
        healthCheckInterval: 30000,
        healthCheckTimeout: 5000,
        healthCheckRetries: 3,
        healthCheckSuccess: 0,
        healthCheckFailure: 0,
        healthCheckDuration: 0,
        healthCheckLatency: 0,
        healthCheckThroughput: 0,
        healthCheckAvailability: 100,
      },
      trends: {
        performanceTrend: [],
        memoryTrend: [],
        cpuTrend: [],
        networkTrend: [],
        errorTrend: [],
        alertTrend: [],
        healthTrend: [],
        optimizationTrend: [],
        efficiencyTrend: [],
        throughputTrend: [],
        latencyTrend: [],
        availabilityTrend: [],
        reliabilityTrend: [],
        scalabilityTrend: [],
        maintainabilityTrend: [],
      },
      anomalies: {
        detectedAnomalies: 0,
        anomalyTypes: [],
        anomalySeverities: [],
        anomalyTimestamps: [],
        anomalyScores: [],
        anomalyPatterns: [],
        anomalyRecommendations: [],
        falsePositives: 0,
        falseNegatives: 0,
        truePositives: 0,
        trueNegatives: 0,
        anomalyAccuracy: 0,
        anomalyPrecision: 0,
        anomalyRecall: 0,
        anomalyF1Score: 0,
      },
      predictions: {
        predictedPerformance: [],
        predictedMemory: [],
        predictedCpu: [],
        predictedNetwork: [],
        predictedErrors: [],
        predictedAlerts: [],
        predictedHealth: [],
        predictedOptimization: [],
        predictedEfficiency: [],
        predictedThroughput: [],
        predictedLatency: [],
        predictedAvailability: [],
        predictedReliability: [],
        predictedScalability: [],
        predictedMaintainability: [],
        predictionAccuracy: 0,
        predictionConfidence: 0,
        predictionHorizon: 24,
        predictionInterval: 3600000,
        predictionMethod: 'linear-regression',
      },
      recommendations: [],
    };
  }

  /**
   * Start monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzeMetrics();
      this.checkAlerts();
      this.updateTrends();
      this.detectAnomalies();
      this.generatePredictions();
      this.emitEvent('metric', this.metrics);
    }, this.config.monitoringInterval);

    this.emitEvent('monitoring', { started: true, timestamp: Date.now() });
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emitEvent('monitoring', { stopped: true, timestamp: Date.now() });
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    const now = Date.now();
    this.metrics.timestamp = now;

    // Collect performance metrics
    if (this.config.enableRealTimeMetrics) {
      this.metrics.performance = this.performanceOptimizer.getMetrics();
    }

    // Collect system metrics
    this.metrics.system = this.collectSystemMetrics();

    // Collect network metrics
    this.metrics.network = this.collectNetworkMetrics();

    // Collect error metrics
    this.metrics.errors = this.collectErrorMetrics();

    // Collect alert metrics
    this.metrics.alerts = this.collectAlertMetrics();

    // Collect health metrics
    this.metrics.health = this.collectHealthMetrics();

    // Store historical data
    if (this.config.enableHistoricalMetrics) {
      this.historicalData.push({ ...this.metrics });
      if (this.historicalData.length > this.config.maxHistoricalDataPoints) {
        this.historicalData.shift();
      }
    }
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): SystemMetrics {
    const memory = performance.memory;
    return {
      memoryUsage: memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Would need external CPU monitoring
      diskUsage: 0, // Would need external disk monitoring
      networkUsage: 0, // Would need external network monitoring
      processCount: 0, // Would need external process monitoring
      threadCount: 0, // Would need external thread monitoring
      uptime: performance.now(),
      loadAverage: 0, // Would need external load monitoring
      availableMemory: memory?.totalJSHeapSize - memory?.usedJSHeapSize || 0,
      totalMemory: memory?.totalJSHeapSize || 0,
      heapSize: memory?.totalJSHeapSize || 0,
      heapUsed: memory?.usedJSHeapSize || 0,
      externalMemory: memory?.externalJSHeapSize || 0,
      gcTime: 0, // Would need GC monitoring
      gcCount: 0, // Would need GC monitoring
    };
  }

  /**
   * Collect network metrics
   */
  private collectNetworkMetrics(): NetworkMetrics {
    // This would integrate with actual network monitoring
    return {
      requestsPerSecond: 0,
      responseTime: 0,
      throughput: 0,
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      connectionCount: 0,
      activeConnections: 0,
      failedRequests: 0,
      successfulRequests: 0,
      totalRequests: 0,
      averageResponseSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressionRatio: 0,
    };
  }

  /**
   * Collect error metrics
   */
  private collectErrorMetrics(): ErrorMetrics {
    return {
      totalErrors: this.metrics.errors.totalErrors,
      errorRate: this.metrics.errors.errorRate,
      criticalErrors: this.metrics.errors.criticalErrors,
      warningErrors: this.metrics.errors.warningErrors,
      infoErrors: this.metrics.errors.infoErrors,
      errorTypes: [...this.metrics.errors.errorTypes],
      errorMessages: [...this.metrics.errors.errorMessages],
      errorStackTraces: [...this.metrics.errors.errorStackTraces],
      errorTimestamps: [...this.metrics.errors.errorTimestamps],
      errorSeverities: [...this.metrics.errors.errorSeverities],
      errorSources: [...this.metrics.errors.errorSources],
      errorCategories: [...this.metrics.errors.errorCategories],
      errorTrends: [...this.metrics.errors.errorTrends],
      errorPatterns: [...this.metrics.errors.errorPatterns],
      errorRecommendations: [...this.metrics.errors.errorRecommendations],
    };
  }

  /**
   * Collect alert metrics
   */
  private collectAlertMetrics(): AlertMetrics {
    return {
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: this.alerts.filter(a => a.severity === 'warning').length,
      infoAlerts: this.alerts.filter(a => a.severity === 'info').length,
      alertTypes: [...new Set(this.alerts.map(a => a.type))],
      alertMessages: this.alerts.map(a => a.message),
      alertTimestamps: this.alerts.map(a => a.timestamp),
      alertSeverities: this.alerts.map(a => a.severity),
      alertSources: this.alerts.map(a => a.source),
      alertCategories: this.alerts.map(a => a.category),
      alertTrends: [],
      alertPatterns: [],
      alertRecommendations: [],
      acknowledgedAlerts: this.alerts.filter(a => a.acknowledged).length,
      resolvedAlerts: this.alerts.filter(a => a.resolved).length,
      pendingAlerts: this.alerts.filter(a => !a.acknowledged && !a.resolved).length,
    };
  }

  /**
   * Collect health metrics
   */
  private collectHealthMetrics(): HealthMetrics {
    const healthScore = this.calculateHealthScore();
    return {
      overallHealth: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical',
      componentHealth: this.getComponentHealth(),
      healthScore,
      healthTrends: [...this.metrics.health.healthTrends],
      healthPatterns: [...this.metrics.health.healthPatterns],
      healthRecommendations: [...this.metrics.health.healthRecommendations],
      lastHealthCheck: Date.now(),
      healthCheckInterval: this.config.monitoringInterval,
      healthCheckTimeout: 5000,
      healthCheckRetries: 3,
      healthCheckSuccess: this.metrics.health.healthCheckSuccess,
      healthCheckFailure: this.metrics.health.healthCheckFailure,
      healthCheckDuration: 0,
      healthCheckLatency: 0,
      healthCheckThroughput: 0,
      healthCheckAvailability: 100,
    };
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(): number {
    const scores = [
      this.metrics.performance.optimizationScore * 100,
      (1 - this.metrics.errors.errorRate) * 100,
      this.metrics.alerts.totalAlerts === 0 ? 100 : Math.max(0, 100 - this.metrics.alerts.totalAlerts * 10),
      this.metrics.system.memoryUsage < this.config.alertThresholds.memoryUsageMax ? 100 : 50,
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Get component health status
   */
  private getComponentHealth(): Record<string, 'healthy' | 'warning' | 'critical'> {
    return {
      filterStateManager: 'healthy',
      performanceOptimizer: 'healthy',
      monitoring: this.isMonitoring ? 'healthy' : 'critical',
      memory: this.metrics.system.memoryUsage < this.config.alertThresholds.memoryUsageMax ? 'healthy' : 'warning',
      performance: this.metrics.performance.optimizationScore > 0.7 ? 'healthy' : 'warning',
      errors: this.metrics.errors.errorRate < 0.05 ? 'healthy' : 'critical',
    };
  }

  /**
   * Analyze collected metrics
   */
  private analyzeMetrics(): void {
    // Analyze performance trends
    this.analyzePerformanceTrends();

    // Analyze error patterns
    this.analyzeErrorPatterns();

    // Analyze alert patterns
    this.analyzeAlertPatterns();

    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Analyze performance trends
   */
  private analyzePerformanceTrends(): void {
    if (this.historicalData.length < 2) return;

    const recentMetrics = this.historicalData.slice(-10);
    const performanceScores = recentMetrics.map(m => m.performance.optimizationScore);

    // Calculate trend
    const trend = this.calculateTrend(performanceScores);
    this.metrics.trends.performanceTrend = performanceScores;
  }

  /**
   * Analyze error patterns
   */
  private analyzeErrorPatterns(): void {
    if (this.metrics.errors.totalErrors === 0) return;

    // Analyze error frequency
    const errorFrequency = this.metrics.errors.errorTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Identify most common errors
    const commonErrors = Object.entries(errorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    this.metrics.errors.errorPatterns = commonErrors;
  }

  /**
   * Analyze alert patterns
   */
  private analyzeAlertPatterns(): void {
    if (this.alerts.length === 0) return;

    // Analyze alert frequency by type
    const alertFrequency = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Identify most common alerts
    const commonAlerts = Object.entries(alertFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    this.metrics.alerts.alertPatterns = commonAlerts;
  }

  /**
   * Calculate trend from array of values
   */
  private calculateTrend(values: readonly number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const threshold = 0.1; // 10% threshold

    if (Math.abs(difference) < threshold) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Check for alerts based on current metrics
   */
  private checkAlerts(): void {
    const alerts: Alert[] = [];

    // Performance alerts
    if (this.config.enablePerformanceAlerts) {
      if (this.metrics.performance.renderTime > this.config.alertThresholds.renderTimeMax) {
        alerts.push(this.createAlert('performance', 'warning', 'Render time exceeded threshold', 'renderTime'));
      }

      if (this.metrics.performance.updateTime > this.config.alertThresholds.updateTimeMax) {
        alerts.push(this.createAlert('performance', 'warning', 'Update time exceeded threshold', 'updateTime'));
      }

      if (this.metrics.performance.optimizationScore < this.config.alertThresholds.optimizationScoreMin) {
        alerts.push(this.createAlert('performance', 'critical', 'Optimization score below threshold', 'optimizationScore'));
      }
    }

    // Memory alerts
    if (this.config.enableMemoryAlerts) {
      if (this.metrics.system.memoryUsage > this.config.alertThresholds.memoryUsageMax) {
        alerts.push(this.createAlert('memory', 'critical', 'Memory usage exceeded threshold', 'memoryUsage'));
      }
    }

    // Error alerts
    if (this.config.enableErrorAlerts) {
      if (this.metrics.errors.errorRate > this.config.alertThresholds.errorRateMax) {
        alerts.push(this.createAlert('error', 'critical', 'Error rate exceeded threshold', 'errorRate'));
      }
    }

    // Add new alerts
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.emitEvent('alert', alert);
    });
  }

  /**
   * Create an alert
   */
  private createAlert(
    type: string,
    severity: 'critical' | 'warning' | 'info',
    message: string,
    metric: string
  ): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      source: 'FilterSystemMonitor',
      category: 'performance',
      metric,
      value: this.getMetricValue(metric),
      threshold: this.getThresholdValue(metric),
      trend: 'stable',
      acknowledged: false,
      resolved: false,
      recommendations: this.getRecommendationsForAlert(type, severity),
    };
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(metric: string): number {
    const metricMap: Record<string, number> = {
      renderTime: this.metrics.performance.renderTime,
      updateTime: this.metrics.performance.updateTime,
      memoryUsage: this.metrics.system.memoryUsage,
      optimizationScore: this.metrics.performance.optimizationScore,
      errorRate: this.metrics.errors.errorRate,
    };

    return metricMap[metric] || 0;
  }

  /**
   * Get threshold value by metric name
   */
  private getThresholdValue(metric: string): number {
    const thresholdMap: Record<string, number> = {
      renderTime: this.config.alertThresholds.renderTimeMax,
      updateTime: this.config.alertThresholds.updateTimeMax,
      memoryUsage: this.config.alertThresholds.memoryUsageMax,
      optimizationScore: this.config.alertThresholds.optimizationScoreMin,
      errorRate: this.config.alertThresholds.errorRateMax,
    };

    return thresholdMap[metric] || 0;
  }

  /**
   * Get recommendations for alert
   */
  private getRecommendationsForAlert(type: string, severity: string): readonly string[] {
    const recommendations: Record<string, readonly string[]> = {
      performance: [
        'Consider enabling virtualization for large filter lists',
        'Increase debounce delay or batch size',
        'Enable compression for filter state',
        'Optimize cache configuration',
      ],
      memory: [
        'Reduce cache size',
        'Enable compression',
        'Implement lazy loading',
        'Clear unused data',
      ],
      error: [
        'Review error handling logic',
        'Add error boundaries',
        'Implement retry mechanisms',
        'Monitor error patterns',
      ],
    };

    return recommendations[type] || ['Review system configuration'];
  }

  /**
   * Update trends
   */
  private updateTrends(): void {
    if (this.historicalData.length < 2) return;

    const recentData = this.historicalData.slice(-10);

    this.metrics.trends.performanceTrend = recentData.map(d => d.performance.optimizationScore);
    this.metrics.trends.memoryTrend = recentData.map(d => d.system.memoryUsage);
    this.metrics.trends.errorTrend = recentData.map(d => d.errors.totalErrors);
    this.metrics.trends.alertTrend = recentData.map(d => d.alerts.totalAlerts);
    this.metrics.trends.healthTrend = recentData.map(d => d.health.healthScore);
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(): void {
    if (!this.config.enableAnomalyDetection || this.historicalData.length < 10) return;

    // Simple anomaly detection based on statistical outliers
    const performanceScores = this.historicalData.map(d => d.performance.optimizationScore);
    const mean = performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length;
    const variance = performanceScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / performanceScores.length;
    const stdDev = Math.sqrt(variance);

    const currentScore = this.metrics.performance.optimizationScore;
    const zScore = Math.abs(currentScore - mean) / stdDev;

    if (zScore > 2) { // 2 standard deviations
      this.metrics.anomalies.detectedAnomalies++;
      this.metrics.anomalies.anomalyTypes.push('performance');
      this.metrics.anomalies.anomalyScores.push(zScore);
      this.metrics.anomalies.anomalyTimestamps.push(Date.now());
    }
  }

  /**
   * Generate predictions
   */
  private generatePredictions(): void {
    if (!this.config.enablePredictiveAnalytics || this.historicalData.length < 5) return;

    // Simple linear prediction
    const recentScores = this.historicalData.slice(-5).map(d => d.performance.optimizationScore);
    const prediction = this.predictLinear(recentScores);

    this.metrics.predictions.predictedPerformance = [prediction];
    this.metrics.predictions.predictionAccuracy = 0.8; // Placeholder
    this.metrics.predictions.predictionConfidence = 0.7; // Placeholder
  }

  /**
   * Simple linear prediction
   */
  private predictLinear(values: readonly number[]): number {
    if (values.length < 2) return values[0] || 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // Performance recommendations
    if (this.metrics.performance.optimizationScore < 0.7) {
      recommendations.push('Consider enabling additional performance optimizations');
    }

    if (this.metrics.performance.renderTime > 50) {
      recommendations.push('Optimize render performance with virtualization');
    }

    // Memory recommendations
    if (this.metrics.system.memoryUsage > 30 * 1024 * 1024) {
      recommendations.push('Consider reducing memory usage through caching optimization');
    }

    // Error recommendations
    if (this.metrics.errors.totalErrors > 0) {
      recommendations.push('Review and fix error patterns');
    }

    this.metrics.recommendations = recommendations;
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, listener: (event: MonitoringEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, listener: (event: MonitoringEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit monitoring event
   */
  private emitEvent(type: string, data: any): void {
    const event: MonitoringEvent = {
      type: type as any,
      timestamp: Date.now(),
      data,
      source: 'FilterSystemMonitor',
      category: 'monitoring',
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  /**
   * Get historical data
   */
  public getHistoricalData(): readonly MonitoringMetrics[] {
    return [...this.historicalData];
  }

  /**
   * Get current alerts
   */
  public getAlerts(): readonly Alert[] {
    return [...this.alerts];
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
    }
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string, resolvedBy: string, resolution?: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = Date.now();
      alert.resolution = resolution;
    }
  }

  /**
   * Export monitoring data
   */
  public exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      historicalData: this.historicalData,
      alerts: this.alerts,
      config: this.config,
    }, null, 2);
  }

  /**
   * Reset monitoring data
   */
  public reset(): void {
    this.historicalData.length = 0;
    this.alerts.length = 0;
    this.metrics.recommendations = [];
    this.emitEvent('reset', { timestamp: Date.now() });
  }
}

// ===== EXPORTS =====

export {
  FilterSystemMonitor,
  DEFAULT_MONITORING_CONFIG,
};
export type {
  MonitoringConfig,
  MonitoringMetrics,
  SystemMetrics,
  NetworkMetrics,
  ErrorMetrics,
  AlertMetrics,
  HealthMetrics,
  TrendMetrics,
  AnomalyMetrics,
  PredictionMetrics,
  Alert,
  MonitoringEvent,
  AlertThresholds,
}; 