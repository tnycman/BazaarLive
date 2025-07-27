/**
 * Strategy Resolver Service - Main Service with AOP Integration
 * Complete authentication strategy resolution with enterprise architecture
 */

import { Result } from '../domain/Hostname';
import { Environment } from '../domain/Environment';
import { AuthenticationDomain } from '../domain/AuthenticationDomain';
import { AuthenticationConfiguration } from '../config/ConfigurationSource';
import {
  IResolutionStrategy,
  IResolutionCache,
  IResolutionAspect,
  StrategyResolutionRequest,
  StrategyResolutionResult,
  StrategyResolutionError,
  ResolutionConfidence,
  ExactHostnameResolutionStrategy,
  DomainBasedResolutionStrategy,
  DevelopmentFallbackResolutionStrategy
} from './AuthenticationStrategyResolver';

// Service Configuration
export interface StrategyResolverConfiguration {
  readonly enableCaching: boolean;
  readonly cacheTimeout: number;
  readonly maxConcurrentResolutions: number;
  readonly enablePerformanceMonitoring: boolean;
  readonly enableSecurityAuditing: boolean;
  readonly enableAnalytics: boolean;
  readonly fallbackStrategies: string[];
  readonly resolutionTimeout: number;
}

// Service Health Status
export interface ServiceHealthStatus {
  readonly isHealthy: boolean;
  readonly resolutionStrategiesCount: number;
  readonly cacheStatus: {
    enabled: boolean;
    hitRate: number;
    size: number;
  };
  readonly performanceMetrics: {
    averageResolutionTime: number;
    successRate: number;
    errorRate: number;
  };
  readonly lastHealthCheck: Date;
}

// Resolution Statistics
export interface ResolutionStatistics {
  readonly totalResolutions: number;
  readonly successfulResolutions: number;
  readonly failedResolutions: number;
  readonly averageResolutionTime: number;
  readonly cacheHitRate: number;
  readonly resolutionsByConfidence: Record<ResolutionConfidence, number>;
  readonly resolutionsByEnvironment: Record<string, number>;
  readonly mostResolvedHostnames: Array<{ hostname: string; count: number }>;
  readonly period: {
    start: Date;
    end: Date;
  };
}

// Main Strategy Resolver Service
export class StrategyResolverService {
  private readonly configuration: StrategyResolverConfiguration;
  private readonly resolutionStrategies: Map<string, IResolutionStrategy>;
  private readonly aspects: IResolutionAspect[];
  private readonly cache?: IResolutionCache;
  private readonly statistics: ResolutionStatistics;
  private readonly healthStatus: ServiceHealthStatus;

  private constructor(
    configuration: StrategyResolverConfiguration,
    strategies: IResolutionStrategy[],
    aspects: IResolutionAspect[],
    cache?: IResolutionCache
  ) {
    this.configuration = configuration;
    this.aspects = aspects;
    this.cache = cache;
    
    // Initialize resolution strategies
    this.resolutionStrategies = new Map();
    strategies.forEach(strategy => {
      this.resolutionStrategies.set(strategy.name, strategy);
    });

    // Initialize statistics
    this.statistics = this.initializeStatistics();
    this.healthStatus = this.initializeHealthStatus();
  }

  /**
   * Factory method to create service with default configuration
   */
  static async create(
    configuration: Partial<StrategyResolverConfiguration> = {},
    customStrategies: IResolutionStrategy[] = [],
    aspects: IResolutionAspect[] = [],
    cache?: IResolutionCache
  ): Promise<Result<StrategyResolverService, StrategyResolutionError>> {
    try {
      const fullConfig = this.buildConfiguration(configuration);
      
      // Initialize default resolution strategies
      const defaultStrategies = await this.createDefaultStrategies();
      const allStrategies = [...defaultStrategies, ...customStrategies];
      
      // Sort strategies by priority
      allStrategies.sort((a, b) => b.priority - a.priority);

      const service = new StrategyResolverService(
        fullConfig,
        allStrategies,
        aspects,
        cache
      );

      // Validate service configuration
      const validationResult = await service.validateConfiguration();
      if (validationResult.isError()) {
        return validationResult;
      }

      return Result.ok(service);
    } catch (error) {
      return Result.error(new StrategyResolutionError(
        `Failed to create strategy resolver service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SERVICE_CREATION_ERROR'
      ));
    }
  }

  /**
   * Resolve authentication strategy for hostname
   */
  async resolveStrategy(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<Result<StrategyResolutionResult, StrategyResolutionError>> {
    const startTime = Date.now();

    try {
      // Execute before resolution aspects
      await this.executeBeforeResolutionAspects(request);

      // Check cache first
      let result = await this.checkCache(request);
      if (result) {
        result = { ...result, metadata: { ...result.metadata, cacheHit: true } };
        await this.executeAfterResolutionAspects(request, result);
        this.updateStatistics(request, result, Date.now() - startTime);
        return Result.ok(result);
      }

      // Find appropriate environment
      const environment = Environment.create(request.environment);
      if (environment.isError()) {
        return Result.error(new StrategyResolutionError(
          `Invalid environment: ${environment.error.message}`,
          'INVALID_ENVIRONMENT',
          { environment: request.environment }
        ));
      }

      // Try resolution strategies in priority order
      const applicableStrategies = this.getApplicableStrategies(environment.value);
      let bestResult: StrategyResolutionResult | null = null;
      let bestConfidence = ResolutionConfidence.NO_MATCH;

      for (const strategy of applicableStrategies) {
        try {
          const strategyResult = await strategy.resolve(request, configuration, domain);
          
          if (strategyResult.isSuccess()) {
            const result = strategyResult.value;
            
            // If we found an exact match, use it immediately
            if (result.confidence === ResolutionConfidence.EXACT_MATCH && result.strategy) {
              bestResult = result;
              break;
            }
            
            // Otherwise, keep the best result so far
            if (this.compareConfidence(result.confidence, bestConfidence) > 0) {
              bestResult = result;
              bestConfidence = result.confidence;
            }
          }
        } catch (error) {
          // Log strategy failure but continue with other strategies
          console.warn(`Strategy ${strategy.name} failed:`, error);
        }
      }

      // If no strategy found anything, create a comprehensive no-match result
      if (!bestResult || bestResult.confidence === ResolutionConfidence.NO_MATCH) {
        bestResult = this.createNoMatchResult(request, startTime, applicableStrategies);
      }

      // Set cache hit to false since this was resolved fresh
      bestResult = { ...bestResult, metadata: { ...bestResult.metadata, cacheHit: false } };

      // Cache the result
      await this.cacheResult(request, bestResult);

      // Execute after resolution aspects
      await this.executeAfterResolutionAspects(request, bestResult);

      // Update statistics
      this.updateStatistics(request, bestResult, Date.now() - startTime);

      return Result.ok(bestResult);

    } catch (error) {
      const resolutionError = error instanceof StrategyResolutionError 
        ? error 
        : new StrategyResolutionError(
            `Strategy resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'RESOLUTION_FAILED',
            { hostname: request.hostname, environment: request.environment }
          );

      // Execute error aspects
      await this.executeErrorAspects(request, resolutionError);

      // Update error statistics
      this.updateErrorStatistics(request, resolutionError, Date.now() - startTime);

      return Result.error(resolutionError);
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<ServiceHealthStatus> {
    const cacheStats = this.cache ? await this.cache.getStats() : {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    };

    return {
      isHealthy: this.isServiceHealthy(),
      resolutionStrategiesCount: this.resolutionStrategies.size,
      cacheStatus: {
        enabled: !!this.cache,
        hitRate: cacheStats.hitRate,
        size: cacheStats.size
      },
      performanceMetrics: {
        averageResolutionTime: this.statistics.averageResolutionTime,
        successRate: this.statistics.successfulResolutions / Math.max(this.statistics.totalResolutions, 1),
        errorRate: this.statistics.failedResolutions / Math.max(this.statistics.totalResolutions, 1)
      },
      lastHealthCheck: new Date()
    };
  }

  /**
   * Get resolution statistics
   */
  getStatistics(): ResolutionStatistics {
    return { ...this.statistics };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (this.cache) {
      await this.cache.invalidate('*');
    }
  }

  /**
   * Validate service configuration
   */
  private async validateConfiguration(): Promise<Result<void, StrategyResolutionError>> {
    // Validate resolution strategies
    if (this.resolutionStrategies.size === 0) {
      return Result.error(new StrategyResolutionError(
        'No resolution strategies configured',
        'NO_STRATEGIES_ERROR'
      ));
    }

    // Validate timeout
    if (this.configuration.resolutionTimeout < 1000 || this.configuration.resolutionTimeout > 60000) {
      return Result.error(new StrategyResolutionError(
        'Resolution timeout must be between 1000ms and 60000ms',
        'INVALID_TIMEOUT_ERROR'
      ));
    }

    // Validate cache timeout
    if (this.configuration.enableCaching && this.configuration.cacheTimeout < 60) {
      return Result.error(new StrategyResolutionError(
        'Cache timeout must be at least 60 seconds',
        'INVALID_CACHE_TIMEOUT_ERROR'
      ));
    }

    return Result.ok(undefined);
  }

  /**
   * Build configuration with defaults
   */
  private static buildConfiguration(partial: Partial<StrategyResolverConfiguration>): StrategyResolverConfiguration {
    return {
      enableCaching: partial.enableCaching ?? true,
      cacheTimeout: partial.cacheTimeout ?? 300, // 5 minutes
      maxConcurrentResolutions: partial.maxConcurrentResolutions ?? 100,
      enablePerformanceMonitoring: partial.enablePerformanceMonitoring ?? true,
      enableSecurityAuditing: partial.enableSecurityAuditing ?? true,
      enableAnalytics: partial.enableAnalytics ?? true,
      fallbackStrategies: partial.fallbackStrategies ?? ['development-fallback'],
      resolutionTimeout: partial.resolutionTimeout ?? 5000 // 5 seconds
    };
  }

  /**
   * Create default resolution strategies
   */
  private static async createDefaultStrategies(): Promise<IResolutionStrategy[]> {
    return [
      new ExactHostnameResolutionStrategy(),
      new DomainBasedResolutionStrategy(),
      new DevelopmentFallbackResolutionStrategy()
    ];
  }

  /**
   * Get strategies applicable to environment
   */
  private getApplicableStrategies(environment: Environment): IResolutionStrategy[] {
    return Array.from(this.resolutionStrategies.values())
      .filter(strategy => strategy.supportsEnvironment(environment))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Compare resolution confidence levels
   */
  private compareConfidence(a: ResolutionConfidence, b: ResolutionConfidence): number {
    const confidenceOrder = {
      [ResolutionConfidence.EXACT_MATCH]: 4,
      [ResolutionConfidence.DOMAIN_MATCH]: 3,
      [ResolutionConfidence.DEVELOPMENT_MATCH]: 2,
      [ResolutionConfidence.FALLBACK_MATCH]: 1,
      [ResolutionConfidence.NO_MATCH]: 0
    };

    return confidenceOrder[a] - confidenceOrder[b];
  }

  /**
   * Check cache for existing result
   */
  private async checkCache(request: StrategyResolutionRequest): Promise<StrategyResolutionResult | null> {
    if (!this.cache || !this.configuration.enableCaching) {
      return null;
    }

    const cacheKey = this.generateCacheKey(request);
    return this.cache.get(cacheKey);
  }

  /**
   * Cache resolution result
   */
  private async cacheResult(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    if (!this.cache || !this.configuration.enableCaching) {
      return;
    }

    // Only cache successful resolutions
    if (result.strategy) {
      const cacheKey = this.generateCacheKey(request);
      await this.cache.set(cacheKey, result, this.configuration.cacheTimeout);
    }
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: StrategyResolutionRequest): string {
    return `strategy:${request.hostname}:${request.environment}`;
  }

  /**
   * Create no-match result
   */
  private createNoMatchResult(
    request: StrategyResolutionRequest,
    startTime: number,
    strategies: IResolutionStrategy[]
  ): StrategyResolutionResult {
    return {
      strategy: null,
      confidence: ResolutionConfidence.NO_MATCH,
      matchedMapping: null,
      alternativeStrategies: [],
      resolutionPath: [{
        step: 'strategy-resolution',
        description: 'Attempted resolution with all applicable strategies',
        input: { hostname: request.hostname, environment: request.environment },
        output: { strategiesAttempted: strategies.map(s => s.name) },
        duration: Date.now() - startTime,
        success: false
      }],
      warnings: [{
        code: 'NO_STRATEGY_FOUND',
        message: `No authentication strategy found for hostname ${request.hostname} in environment ${request.environment}`,
        severity: 'high',
        recommendation: 'Configure hostname mapping or check domain registration'
      }],
      metadata: {
        totalDuration: Date.now() - startTime,
        cacheHit: false,
        strategyCount: 0,
        mappingCount: 0,
        environmentType: request.environment,
        resolutionTimestamp: new Date()
      }
    };
  }

  /**
   * Execute before resolution aspects
   */
  private async executeBeforeResolutionAspects(request: StrategyResolutionRequest): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.beforeResolution(request);
      } catch (error) {
        console.warn(`Aspect ${aspect.constructor.name} beforeResolution failed:`, error);
      }
    }
  }

  /**
   * Execute after resolution aspects
   */
  private async executeAfterResolutionAspects(
    request: StrategyResolutionRequest,
    result: StrategyResolutionResult
  ): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.afterResolution(request, result);
      } catch (error) {
        console.warn(`Aspect ${aspect.constructor.name} afterResolution failed:`, error);
      }
    }
  }

  /**
   * Execute error aspects
   */
  private async executeErrorAspects(
    request: StrategyResolutionRequest,
    error: StrategyResolutionError
  ): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.onResolutionError(request, error);
      } catch (aspectError) {
        console.warn(`Aspect ${aspect.constructor.name} onResolutionError failed:`, aspectError);
      }
    }
  }

  /**
   * Initialize statistics
   */
  private initializeStatistics(): ResolutionStatistics {
    return {
      totalResolutions: 0,
      successfulResolutions: 0,
      failedResolutions: 0,
      averageResolutionTime: 0,
      cacheHitRate: 0,
      resolutionsByConfidence: {
        [ResolutionConfidence.EXACT_MATCH]: 0,
        [ResolutionConfidence.DOMAIN_MATCH]: 0,
        [ResolutionConfidence.DEVELOPMENT_MATCH]: 0,
        [ResolutionConfidence.FALLBACK_MATCH]: 0,
        [ResolutionConfidence.NO_MATCH]: 0
      },
      resolutionsByEnvironment: {},
      mostResolvedHostnames: [],
      period: {
        start: new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Initialize health status
   */
  private initializeHealthStatus(): ServiceHealthStatus {
    return {
      isHealthy: true,
      resolutionStrategiesCount: 0,
      cacheStatus: {
        enabled: false,
        hitRate: 0,
        size: 0
      },
      performanceMetrics: {
        averageResolutionTime: 0,
        successRate: 1.0,
        errorRate: 0.0
      },
      lastHealthCheck: new Date()
    };
  }

  /**
   * Update statistics after successful resolution
   */
  private updateStatistics(
    request: StrategyResolutionRequest,
    result: StrategyResolutionResult,
    duration: number
  ): void {
    this.statistics.totalResolutions++;
    
    if (result.strategy) {
      this.statistics.successfulResolutions++;
    }

    // Update average resolution time
    this.statistics.averageResolutionTime = 
      (this.statistics.averageResolutionTime * (this.statistics.totalResolutions - 1) + duration) / 
      this.statistics.totalResolutions;

    // Update confidence statistics
    this.statistics.resolutionsByConfidence[result.confidence]++;

    // Update environment statistics
    this.statistics.resolutionsByEnvironment[request.environment] = 
      (this.statistics.resolutionsByEnvironment[request.environment] || 0) + 1;

    // Update cache hit rate
    if (this.cache) {
      const cacheHits = result.metadata.cacheHit ? 1 : 0;
      this.statistics.cacheHitRate = 
        (this.statistics.cacheHitRate * (this.statistics.totalResolutions - 1) + cacheHits) / 
        this.statistics.totalResolutions;
    }

    this.statistics.period.end = new Date();
  }

  /**
   * Update error statistics
   */
  private updateErrorStatistics(
    request: StrategyResolutionRequest,
    error: StrategyResolutionError,
    duration: number
  ): void {
    this.statistics.totalResolutions++;
    this.statistics.failedResolutions++;

    // Update average resolution time
    this.statistics.averageResolutionTime = 
      (this.statistics.averageResolutionTime * (this.statistics.totalResolutions - 1) + duration) / 
      this.statistics.totalResolutions;

    // Update environment statistics
    this.statistics.resolutionsByEnvironment[request.environment] = 
      (this.statistics.resolutionsByEnvironment[request.environment] || 0) + 1;

    this.statistics.period.end = new Date();
  }

  /**
   * Check if service is healthy
   */
  private isServiceHealthy(): boolean {
    const errorRate = this.statistics.failedResolutions / Math.max(this.statistics.totalResolutions, 1);
    const avgTime = this.statistics.averageResolutionTime;
    
    return errorRate < 0.1 && avgTime < 5000; // Less than 10% error rate and under 5 seconds
  }
}