/**
 * Configuration Aspect Manager
 * Enterprise AOP-compliant aspect management for configuration services
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles configuration-specific aspect orchestration:
 * - Registers all six configuration aspects
 * - Weaves aspects into ConfigurationDomainService
 * - Manages aspect lifecycle and dependencies
 * - Provides unified interface for configuration aspect management
 * - Monitors and reports aspect health and performance
 */

import BaseAspectManager, { type IAspectManager, type AspectRegistrationConfig } from './BaseAspectManager';
import AspectWeavingEngine from './AspectWeavingEngine';

// Import all configuration aspects
import ConfigurationValidationAspect from '../aspects/ConfigurationValidationAspect';
import ConfigurationCachingAspect from '../aspects/ConfigurationCachingAspect';
import ConfigurationPerformanceAspect from '../aspects/ConfigurationPerformanceAspect';
import ConfigurationSecurityAspect from '../aspects/ConfigurationSecurityAspect';
import ConfigurationLoggingAspect from '../aspects/ConfigurationLoggingAspect';
import ConfigurationAnalyticsAspect from '../aspects/ConfigurationAnalyticsAspect';

// ===== CONFIGURATION ASPECT MANAGEMENT TYPES =====

/**
 * Configuration Aspect Registry
 * Defines all configuration aspects and their metadata
 */
export interface ConfigurationAspectRegistry {
  validation: string;
  caching: string;
  performance: string;
  security: string;
  logging: string;
  analytics: string;
}

/**
 * Aspect Health Summary Value Object
 * Aggregated health information for all configuration aspects
 */
export class AspectHealthSummary {
  constructor(
    public readonly totalAspects: number,
    public readonly healthyAspects: number,
    public readonly unhealthyAspects: number,
    public readonly criticalIssues: number,
    public readonly averagePerformance: number,
    public readonly aspectDetails: Map<string, AspectHealthDetail>
  ) {}

  get overallHealthGrade(): 'excellent' | 'good' | 'warning' | 'critical' {
    if (this.criticalIssues > 0 || this.unhealthyAspects > 2) return 'critical';
    if (this.unhealthyAspects > 0 || this.averagePerformance < 0.7) return 'warning';
    if (this.averagePerformance < 0.9) return 'good';
    return 'excellent';
  }

  get healthPercentage(): number {
    return this.totalAspects > 0 ? (this.healthyAspects / this.totalAspects) * 100 : 0;
  }
}

/**
 * Aspect Health Detail Value Object
 * Detailed health information for individual aspect
 */
export class AspectHealthDetail {
  constructor(
    public readonly aspectName: string,
    public readonly aspectId: string,
    public readonly isHealthy: boolean,
    public readonly performance: number,
    public readonly executionCount: number,
    public readonly errorCount: number,
    public readonly issues: readonly string[]
  ) {}
}

/**
 * Configuration Service Proxy
 * Type-safe proxy wrapper for configuration services
 */
export interface ConfigurationServiceProxy<T> {
  readonly service: T;
  readonly aspectManager: ConfigurationAspectManager;
  readonly isWoven: boolean;
  getAspectHealth(): AspectHealthSummary;
  getWeavingStatistics(): any;
}

// ===== CONFIGURATION DOMAIN SERVICE INTERFACE =====

/**
 * Configuration Domain Service Interface
 * Defines the contract for configuration domain services
 * This interface represents the target service that will be woven with aspects
 */
export interface IConfigurationDomainService {
  getConfiguration(key: string): Promise<any>;
  getAllConfigurations(): Promise<any[]>;
  updateConfiguration?(key: string, config: any): Promise<void>;
  deleteConfiguration?(key: string): Promise<void>;
  healthCheck?(): boolean;
}

// ===== CONFIGURATION ASPECT MANAGER ERRORS =====

/**
 * Configuration Aspect Manager Error
 * Domain-specific error for configuration aspect management
 */
export class ConfigurationAspectManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly aspectName?: string
  ) {
    super(message);
    this.name = 'ConfigurationAspectManagerError';
  }
}

/**
 * Aspect Weaving Error
 * Specific error for aspect weaving failures
 */
export class AspectWeavingError extends ConfigurationAspectManagerError {
  constructor(serviceName: string, reason: string) {
    super(`Failed to weave aspects into ${serviceName}: ${reason}`, 'WEAVING_FAILED');
  }
}

/**
 * Aspect Registration Error
 * Specific error for aspect registration failures
 */
export class AspectRegistrationError extends ConfigurationAspectManagerError {
  constructor(aspectName: string, reason: string) {
    super(`Failed to register aspect ${aspectName}: ${reason}`, 'REGISTRATION_FAILED', aspectName);
  }
}

// ===== CONFIGURATION ASPECT MANAGER =====

/**
 * Configuration Aspect Manager
 * Specialized aspect manager for configuration services
 * 
 * Responsibilities:
 * - Register all six configuration aspects
 * - Weave aspects into configuration domain services
 * - Manage aspect dependencies and execution order
 * - Monitor aspect health and performance
 * - Provide unified configuration aspect interface
 */
export class ConfigurationAspectManager {
  private readonly baseManager: IAspectManager;
  private readonly weavingEngine: AspectWeavingEngine;
  private readonly aspectRegistry: ConfigurationAspectRegistry;
  private isInitialized = false;

  constructor() {
    this.baseManager = new BaseAspectManager();
    this.weavingEngine = new AspectWeavingEngine();
    this.aspectRegistry = {} as ConfigurationAspectRegistry;
  }

  /**
   * Initialize Configuration Aspects
   * Registers all six configuration aspects with proper dependencies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Configuration Aspect Manager already initialized');
      return;
    }

    try {
      console.log('Initializing Configuration Aspect Manager...');

      // Register aspects in dependency order
      await this.registerConfigurationAspects();

      this.isInitialized = true;
      console.log('Configuration Aspect Manager initialization complete');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ConfigurationAspectManagerError(`Initialization failed: ${errorMessage}`, 'INITIALIZATION_FAILED');
    }
  }

  /**
   * Weave Configuration Service
   * Applies all configuration aspects to a configuration service
   */
  weaveConfigurationService<T extends IConfigurationDomainService>(
    service: T
  ): ConfigurationServiceProxy<T> {
    if (!this.isInitialized) {
      throw new ConfigurationAspectManagerError('Manager not initialized', 'NOT_INITIALIZED');
    }

    try {
      // Get all registered aspects
      const aspects = this.baseManager.getAllAspects();
      
      if (aspects.length === 0) {
        throw new AspectWeavingError(service.constructor.name, 'No aspects registered');
      }

      // Weave aspects into service
      const wovenService = this.weavingEngine.weave(service, aspects);

      // Create proxy wrapper
      const proxy: ConfigurationServiceProxy<T> = {
        service: wovenService,
        aspectManager: this,
        isWoven: true,
        getAspectHealth: () => this.getAspectHealthSummary(),
        getWeavingStatistics: () => this.weavingEngine.getWeavingStatistics()
      };

      console.log(`Configuration service ${service.constructor.name} successfully woven with ${aspects.length} aspects`);
      return proxy;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectWeavingError(service.constructor.name, errorMessage);
    }
  }

  /**
   * Get Aspect Health Summary
   * Returns comprehensive health information for all aspects
   */
  getAspectHealthSummary(): AspectHealthSummary {
    const allAspects = this.baseManager.getAllAspects();
    let healthyCount = 0;
    let totalPerformance = 0;
    let criticalIssues = 0;
    const aspectDetails = new Map<string, AspectHealthDetail>();

    for (const aspect of allAspects) {
      const health = this.baseManager.getAspectHealth(aspect.aspectId);
      const isHealthy = health?.isHealthy === true;
      
      if (isHealthy) {
        healthyCount++;
      }

      const performance = health?.performanceMetrics.efficiency || 0;
      totalPerformance += performance;

      if (health?.healthGrade === 'critical') {
        criticalIssues++;
      }

      const detail = new AspectHealthDetail(
        aspect.aspectName,
        aspect.aspectId,
        isHealthy,
        performance,
        health?.performanceMetrics.executionCount || 0,
        health?.errorCount || 0,
        health?.issues || []
      );

      aspectDetails.set(aspect.aspectName, detail);
    }

    const averagePerformance = allAspects.length > 0 ? totalPerformance / allAspects.length : 0;

    return new AspectHealthSummary(
      allAspects.length,
      healthyCount,
      allAspects.length - healthyCount,
      criticalIssues,
      averagePerformance,
      aspectDetails
    );
  }

  /**
   * Get Aspect by Name
   * Returns specific aspect instance by name
   */
  getAspect<T>(aspectName: keyof ConfigurationAspectRegistry): T | null {
    const aspectId = this.aspectRegistry[aspectName];
    if (!aspectId) {
      return null;
    }
    return this.baseManager.getAspect<T>(aspectId);
  }

  /**
   * Get All Aspect Instances
   * Returns all registered configuration aspect instances
   */
  getAllAspectInstances(): {
    validation: ConfigurationValidationAspect | null;
    caching: ConfigurationCachingAspect | null;
    performance: ConfigurationPerformanceAspect | null;
    security: ConfigurationSecurityAspect | null;
    logging: ConfigurationLoggingAspect | null;
    analytics: ConfigurationAnalyticsAspect | null;
  } {
    return {
      validation: this.getAspect<ConfigurationValidationAspect>('validation'),
      caching: this.getAspect<ConfigurationCachingAspect>('caching'),
      performance: this.getAspect<ConfigurationPerformanceAspect>('performance'),
      security: this.getAspect<ConfigurationSecurityAspect>('security'),
      logging: this.getAspect<ConfigurationLoggingAspect>('logging'),
      analytics: this.getAspect<ConfigurationAnalyticsAspect>('analytics')
    };
  }

  /**
   * Restart Aspect
   * Restarts specific aspect (for recovery scenarios)
   */
  async restartAspect(aspectName: keyof ConfigurationAspectRegistry): Promise<void> {
    const aspectId = this.aspectRegistry[aspectName];
    if (!aspectId) {
      throw new ConfigurationAspectManagerError(`Aspect not found: ${aspectName}`, 'ASPECT_NOT_FOUND', aspectName);
    }

    try {
      await this.baseManager.stopAspect(aspectId);
      await this.baseManager.startAspect(aspectId);
      console.log(`Aspect ${aspectName} restarted successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ConfigurationAspectManagerError(`Failed to restart aspect ${aspectName}: ${errorMessage}`, 'RESTART_FAILED', aspectName);
    }
  }

  /**
   * Get Performance Report
   * Returns comprehensive performance report for all aspects
   */
  getPerformanceReport(): {
    weavingStatistics: any;
    aspectHealth: AspectHealthSummary;
    managerHealth: any;
    recommendations: string[];
  } {
    const weavingStats = this.weavingEngine.getWeavingStatistics();
    const aspectHealth = this.getAspectHealthSummary();
    const managerHealth = this.baseManager.getManagerHealth();
    const recommendations = this.generatePerformanceRecommendations(aspectHealth, weavingStats);

    return {
      weavingStatistics: weavingStats,
      aspectHealth,
      managerHealth,
      recommendations
    };
  }

  /**
   * Shutdown Manager
   * Gracefully shuts down all aspects and cleans up resources
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down Configuration Aspect Manager...');

    try {
      // Shutdown base manager (handles aspect lifecycle)
      if (this.baseManager instanceof BaseAspectManager) {
        await this.baseManager.shutdown();
      }

      // Clear weaving statistics
      this.weavingEngine.clearStatistics();

      this.isInitialized = false;
      console.log('Configuration Aspect Manager shutdown complete');

    } catch (error) {
      console.error('Error during Configuration Aspect Manager shutdown:', error);
      throw error;
    }
  }

  // ===== PRIVATE IMPLEMENTATION METHODS =====

  /**
   * Register Configuration Aspects
   * Registers all six configuration aspects with proper dependencies
   */
  private async registerConfigurationAspects(): Promise<void> {
    try {
      // Register aspects in dependency order (logging first, then others)
      
      // 1. Logging Aspect (no dependencies)
      const loggingId = await this.baseManager.registerAspect(
        ConfigurationLoggingAspect,
        {
          priority: 10,
          dependencies: [],
          autoStart: true,
          metadata: { category: 'infrastructure', criticality: 'high' }
        }
      );
      this.aspectRegistry.logging = loggingId;

      // 2. Performance Aspect (depends on logging)
      const performanceId = await this.baseManager.registerAspect(
        ConfigurationPerformanceAspect,
        {
          priority: 20,
          dependencies: [loggingId],
          autoStart: true,
          metadata: { category: 'monitoring', criticality: 'high' }
        }
      );
      this.aspectRegistry.performance = performanceId;

      // 3. Security Aspect (depends on logging)
      const securityId = await this.baseManager.registerAspect(
        ConfigurationSecurityAspect,
        {
          priority: 30,
          dependencies: [loggingId],
          autoStart: true,
          metadata: { category: 'security', criticality: 'critical' }
        }
      );
      this.aspectRegistry.security = securityId;

      // 4. Validation Aspect (depends on logging and security)
      const validationId = await this.baseManager.registerAspect(
        ConfigurationValidationAspect,
        {
          priority: 40,
          dependencies: [loggingId, securityId],
          autoStart: true,
          metadata: { category: 'validation', criticality: 'high' }
        }
      );
      this.aspectRegistry.validation = validationId;

      // 5. Caching Aspect (depends on validation and performance)
      const cachingId = await this.baseManager.registerAspect(
        ConfigurationCachingAspect,
        {
          priority: 50,
          dependencies: [validationId, performanceId],
          autoStart: true,
          metadata: { category: 'optimization', criticality: 'medium' }
        }
      );
      this.aspectRegistry.caching = cachingId;

      // 6. Analytics Aspect (depends on performance and logging)
      const analyticsId = await this.baseManager.registerAspect(
        ConfigurationAnalyticsAspect,
        {
          priority: 60,
          dependencies: [performanceId, loggingId],
          autoStart: true,
          metadata: { category: 'analytics', criticality: 'low' }
        }
      );
      this.aspectRegistry.analytics = analyticsId;

      console.log('All configuration aspects registered successfully:', {
        validation: validationId,
        caching: cachingId,
        performance: performanceId,
        security: securityId,
        logging: loggingId,
        analytics: analyticsId
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AspectRegistrationError('ConfigurationAspects', errorMessage);
    }
  }

  /**
   * Generate Performance Recommendations
   * Analyzes performance data and generates optimization recommendations
   */
  private generatePerformanceRecommendations(
    aspectHealth: AspectHealthSummary,
    weavingStats: any
  ): string[] {
    const recommendations: string[] = [];

    // Health-based recommendations
    if (aspectHealth.overallHealthGrade === 'critical') {
      recommendations.push('CRITICAL: Multiple aspects are unhealthy - immediate attention required');
    }

    if (aspectHealth.averagePerformance < 0.5) {
      recommendations.push('Performance optimization needed - average aspect efficiency below 50%');
    }

    // Weaving statistics recommendations
    if (weavingStats.errorRate > 0.05) {
      recommendations.push(`High error rate detected (${Math.round(weavingStats.errorRate * 100)}%) - investigate failing advice`);
    }

    if (weavingStats.averageExecutionTime > 100) {
      recommendations.push(`High average execution time (${Math.round(weavingStats.averageExecutionTime)}ms) - consider optimization`);
    }

    // Aspect-specific recommendations
    for (const [aspectName, detail] of aspectHealth.aspectDetails.entries()) {
      if (detail.errorCount > 10) {
        recommendations.push(`${aspectName} aspect has high error count (${detail.errorCount}) - requires investigation`);
      }

      if (detail.performance < 0.3) {
        recommendations.push(`${aspectName} aspect has poor performance (${Math.round(detail.performance * 100)}%) - needs optimization`);
      }
    }

    // Default recommendation if no issues
    if (recommendations.length === 0) {
      recommendations.push('All aspects are performing well - no immediate action required');
    }

    return recommendations;
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Global Configuration Aspect Manager Instance
 * Singleton instance for application-wide aspect management
 */
let globalConfigurationAspectManager: ConfigurationAspectManager | null = null;

/**
 * Get Configuration Aspect Manager
 * Returns singleton instance of configuration aspect manager
 */
export function getConfigurationAspectManager(): ConfigurationAspectManager {
  if (!globalConfigurationAspectManager) {
    globalConfigurationAspectManager = new ConfigurationAspectManager();
  }
  return globalConfigurationAspectManager;
}

/**
 * Initialize Configuration Aspects
 * Convenience function to initialize global configuration aspect manager
 */
export async function initializeConfigurationAspects(): Promise<ConfigurationAspectManager> {
  const manager = getConfigurationAspectManager();
  await manager.initialize();
  return manager;
}

export default ConfigurationAspectManager;