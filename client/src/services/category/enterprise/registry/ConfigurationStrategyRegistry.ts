/**
 * Configuration Strategy Registry Implementation
 * Enterprise registry pattern eliminating all hardcoded configuration logic
 * Zero shortcuts, complete strategy-driven configuration management
 */

import { 
  UniversalPageConfiguration 
} from '../schemas/ConfigurationSchemas';

import { 
  ConfigurationResult,
  ConfigurationResultUtils
} from '../patterns/Result';

import {
  ConfigurationError,
  ConfigurationErrorFactory,
  ErrorTypeGuards
} from '../errors/ConfigurationErrors';

import {
  type IConfigurationLoadStrategy,
  type ConfigurationLoadContext,
  type StrategyLoadResult,
  type StrategyHealthStatus,
  StaticConfigurationStrategy,
  DynamicImportStrategy,
  ApiConfigurationStrategy,
  FallbackConfigurationStrategy
} from '../strategies/ConfigurationLoadStrategy';

// ===== REGISTRY INTERFACES =====

/**
 * Strategy Registry Interface
 * Comprehensive strategy management for configuration loading
 */
export interface IConfigurationStrategyRegistry {
  readonly registerStrategy: (strategy: IConfigurationLoadStrategy) => void;
  readonly unregisterStrategy: (strategyName: string) => boolean;
  readonly getStrategy: (name: string) => IConfigurationLoadStrategy | null;
  readonly getAllStrategies: () => readonly IConfigurationLoadStrategy[];
  readonly getEligibleStrategies: (context: ConfigurationLoadContext) => Promise<IConfigurationLoadStrategy[]>;
  readonly loadConfiguration: (context: ConfigurationLoadContext) => Promise<ConfigurationResult<StrategyLoadResult>>;
  readonly getRegistryHealth: () => Promise<RegistryHealthReport>;
  readonly validateAllStrategies: () => Promise<StrategyValidationReport>;
}

/**
 * Registry health report
 */
export interface RegistryHealthReport {
  readonly totalStrategies: number;
  readonly healthyStrategies: number;
  readonly unhealthyStrategies: number;
  readonly strategyStatuses: Record<string, StrategyHealthStatus>;
  readonly overallHealth: 'healthy' | 'degraded' | 'critical';
  readonly lastHealthCheck: string;
  readonly recommendations: string[];
}

/**
 * Strategy validation report
 */
export interface StrategyValidationReport {
  readonly totalStrategies: number;
  readonly validatedStrategies: number;
  readonly validationErrors: Record<string, string[]>;
  readonly validationWarnings: Record<string, string[]>;
  readonly overallValid: boolean;
  readonly validatedAt: string;
}

/**
 * Load attempt result
 */
export interface LoadAttemptResult {
  readonly strategy: string;
  readonly success: boolean;
  readonly loadTime: number;
  readonly error?: ConfigurationError;
  readonly result?: StrategyLoadResult;
}

// ===== STRATEGY PRIORITY MANAGEMENT =====

/**
 * Strategy Priority Manager
 * Manages strategy execution order and priority-based selection
 */
export class StrategyPriorityManager {
  private readonly strategies: Map<string, IConfigurationLoadStrategy>;
  private readonly priorityIndex: Map<number, string[]>;

  constructor() {
    this.strategies = new Map();
    this.priorityIndex = new Map();
  }

  public addStrategy(strategy: IConfigurationLoadStrategy): void {
    this.strategies.set(strategy.name, strategy);
    
    // Update priority index
    const priorityGroup = this.priorityIndex.get(strategy.priority) || [];
    priorityGroup.push(strategy.name);
    this.priorityIndex.set(strategy.priority, priorityGroup);
  }

  public removeStrategy(strategyName: string): boolean {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) return false;

    // Remove from strategies map
    this.strategies.delete(strategyName);

    // Remove from priority index
    const priorityGroup = this.priorityIndex.get(strategy.priority) || [];
    const updatedGroup = priorityGroup.filter(name => name !== strategyName);
    
    if (updatedGroup.length === 0) {
      this.priorityIndex.delete(strategy.priority);
    } else {
      this.priorityIndex.set(strategy.priority, updatedGroup);
    }

    return true;
  }

  public getStrategy(name: string): IConfigurationLoadStrategy | null {
    return this.strategies.get(name) || null;
  }

  public getAllStrategies(): IConfigurationLoadStrategy[] {
    return Array.from(this.strategies.values());
  }

  public getStrategiesByPriority(): IConfigurationLoadStrategy[] {
    const sortedPriorities = Array.from(this.priorityIndex.keys()).sort((a, b) => b - a);
    const sortedStrategies: IConfigurationLoadStrategy[] = [];

    for (const priority of sortedPriorities) {
      const strategyNames = this.priorityIndex.get(priority) || [];
      for (const name of strategyNames) {
        const strategy = this.strategies.get(name);
        if (strategy) {
          sortedStrategies.push(strategy);
        }
      }
    }

    return sortedStrategies;
  }
}

// ===== CONFIGURATION STRATEGY REGISTRY =====

/**
 * Configuration Strategy Registry Implementation
 * Complete elimination of hardcoded configuration logic through strategy pattern
 */
export class ConfigurationStrategyRegistry implements IConfigurationStrategyRegistry {
  private readonly priorityManager: StrategyPriorityManager;
  private readonly loadAttempts: Map<string, LoadAttemptResult[]>;
  private readonly performanceMetrics: Map<string, { totalLoads: number; totalTime: number; errors: number }>;

  constructor() {
    this.priorityManager = new StrategyPriorityManager();
    this.loadAttempts = new Map();
    this.performanceMetrics = new Map();
    
    this.initializeDefaultStrategies();
  }

  public registerStrategy(strategy: IConfigurationLoadStrategy): void {
    this.priorityManager.addStrategy(strategy);
    this.initializeStrategyMetrics(strategy.name);
  }

  public unregisterStrategy(strategyName: string): boolean {
    const removed = this.priorityManager.removeStrategy(strategyName);
    if (removed) {
      this.loadAttempts.delete(strategyName);
      this.performanceMetrics.delete(strategyName);
    }
    return removed;
  }

  public getStrategy(name: string): IConfigurationLoadStrategy | null {
    return this.priorityManager.getStrategy(name);
  }

  public getAllStrategies(): readonly IConfigurationLoadStrategy[] {
    return this.priorityManager.getAllStrategies();
  }

  public async getEligibleStrategies(context: ConfigurationLoadContext): Promise<IConfigurationLoadStrategy[]> {
    const allStrategies = this.priorityManager.getStrategiesByPriority();
    const eligibleStrategies: IConfigurationLoadStrategy[] = [];

    for (const strategy of allStrategies) {
      try {
        const canHandle = await strategy.canHandle(context);
        if (canHandle) {
          eligibleStrategies.push(strategy);
        }
      } catch (error) {
        console.warn(`[STRATEGY-REGISTRY] Strategy ${strategy.name} failed eligibility check:`, error);
      }
    }

    return eligibleStrategies;
  }

  public async loadConfiguration(context: ConfigurationLoadContext): Promise<ConfigurationResult<StrategyLoadResult>> {
    const startTime = Date.now();
    const eligibleStrategies = await this.getEligibleStrategies(context);
    
    if (eligibleStrategies.length === 0) {
      const error = ConfigurationErrorFactory.createNotFoundError(
        context.key,
        [],
        context.requestId
      );
      return ConfigurationResultUtils.failure(error);
    }

    const loadAttempts: LoadAttemptResult[] = [];

    // Try each eligible strategy in priority order
    for (const strategy of eligibleStrategies) {
      const attemptStartTime = Date.now();
      
      try {
        const result = await strategy.load(context);
        const loadTime = Date.now() - attemptStartTime;
        
        if (result.isSuccess) {
          const attemptResult: LoadAttemptResult = {
            strategy: strategy.name,
            success: true,
            loadTime,
            result: result.value
          };
          
          loadAttempts.push(attemptResult);
          this.recordLoadAttempts(context.key, loadAttempts);
          this.recordSuccessfulLoad(strategy.name, loadTime);
          
          return result;
        } else {
          const attemptResult: LoadAttemptResult = {
            strategy: strategy.name,
            success: false,
            loadTime,
            error: result.error
          };
          
          loadAttempts.push(attemptResult);
          this.recordFailedLoad(strategy.name, loadTime);
        }
        
      } catch (error) {
        const loadTime = Date.now() - attemptStartTime;
        const configError = ConfigurationErrorFactory.createLoadError(
          context.key,
          strategy.name,
          error as Error,
          0,
          context.requestId
        );
        
        const attemptResult: LoadAttemptResult = {
          strategy: strategy.name,
          success: false,
          loadTime,
          error: configError
        };
        
        loadAttempts.push(attemptResult);
        this.recordFailedLoad(strategy.name, loadTime);
      }
    }

    // All strategies failed
    this.recordLoadAttempts(context.key, loadAttempts);
    
    const lastError = loadAttempts[loadAttempts.length - 1]?.error;
    const allErrors = loadAttempts
      .filter(attempt => attempt.error)
      .map(attempt => `${attempt.strategy}: ${attempt.error!.message}`)
      .join('; ');
    
    const error = ConfigurationErrorFactory.createLoadError(
      context.key,
      'strategy-registry',
      new Error(`All strategies failed. Attempts: ${allErrors}`),
      loadAttempts.length,
      context.requestId
    );
    
    return ConfigurationResultUtils.failure(error);
  }

  public async getRegistryHealth(): Promise<RegistryHealthReport> {
    const strategies = this.getAllStrategies();
    const strategyStatuses: Record<string, StrategyHealthStatus> = {};
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const strategy of strategies) {
      try {
        const status = await strategy.getHealthStatus();
        strategyStatuses[strategy.name] = status;
        
        if (status.isHealthy) {
          healthyCount++;
        } else {
          unhealthyCount++;
        }
      } catch (error) {
        strategyStatuses[strategy.name] = {
          isHealthy: false,
          lastCheck: new Date().toISOString(),
          errors: [`Health check failed: ${error}`],
          warnings: [],
          performance: {
            averageLoadTime: 0,
            successRate: 0,
            cacheHitRate: 0,
            totalLoads: 0
          }
        };
        unhealthyCount++;
      }
    }

    const totalStrategies = strategies.length;
    let overallHealth: 'healthy' | 'degraded' | 'critical';
    
    if (unhealthyCount === 0) {
      overallHealth = 'healthy';
    } else if (healthyCount > unhealthyCount) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'critical';
    }

    const recommendations: string[] = [];
    
    if (overallHealth === 'critical') {
      recommendations.push('Immediate attention required - majority of strategies are unhealthy');
    }
    if (overallHealth === 'degraded') {
      recommendations.push('Some strategies need attention - monitor closely');
    }
    if (totalStrategies === 0) {
      recommendations.push('No strategies registered - registry is non-functional');
    }

    return {
      totalStrategies,
      healthyStrategies: healthyCount,
      unhealthyStrategies: unhealthyCount,
      strategyStatuses,
      overallHealth,
      lastHealthCheck: new Date().toISOString(),
      recommendations
    };
  }

  public async validateAllStrategies(): Promise<StrategyValidationReport> {
    const strategies = this.getAllStrategies();
    const validationErrors: Record<string, string[]> = {};
    const validationWarnings: Record<string, string[]> = {};
    let validatedCount = 0;

    // Create test configuration for validation
    const testConfig: UniversalPageConfiguration = {
      category: 'marketplace',
      metadata: {
        title: 'Test Configuration',
        description: 'Test configuration for strategy validation',
        gradient: 'from-blue-50 to-blue-100',
        placeholder: 'Test...'
      },
      filterConfiguration: {
        availableFilters: [],
        categorySpecificFilters: [],
        defaultFilters: {},
        filterValidationRules: {},
        maxFiltersPerQuery: 10,
        enableAdvancedFiltering: false
      },
      sampleProducts: [],
      version: '1.0.0-test',
      lastUpdated: new Date().toISOString(),
      configurationId: crypto.randomUUID(),
      isActive: true
    };

    for (const strategy of strategies) {
      try {
        const validationResult = await strategy.validateConfiguration(testConfig);
        
        if (validationResult.isSuccess) {
          const validation = validationResult.value;
          validatedCount++;
          
          if (validation.errors.length > 0) {
            validationErrors[strategy.name] = validation.errors;
          }
          if (validation.warnings.length > 0) {
            validationWarnings[strategy.name] = validation.warnings;
          }
        } else {
          validationErrors[strategy.name] = [validationResult.error.message];
        }
      } catch (error) {
        validationErrors[strategy.name] = [`Validation failed: ${error}`];
      }
    }

    return {
      totalStrategies: strategies.length,
      validatedStrategies: validatedCount,
      validationErrors,
      validationWarnings,
      overallValid: Object.keys(validationErrors).length === 0,
      validatedAt: new Date().toISOString()
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private initializeDefaultStrategies(): void {
    // Register strategies in priority order
    this.registerStrategy(new StaticConfigurationStrategy());
    this.registerStrategy(new DynamicImportStrategy());
    this.registerStrategy(new ApiConfigurationStrategy());
    this.registerStrategy(new FallbackConfigurationStrategy());
  }

  private initializeStrategyMetrics(strategyName: string): void {
    if (!this.performanceMetrics.has(strategyName)) {
      this.performanceMetrics.set(strategyName, {
        totalLoads: 0,
        totalTime: 0,
        errors: 0
      });
    }
  }

  private recordLoadAttempts(configKey: string, attempts: LoadAttemptResult[]): void {
    this.loadAttempts.set(configKey, attempts);
  }

  private recordSuccessfulLoad(strategyName: string, loadTime: number): void {
    const metrics = this.performanceMetrics.get(strategyName);
    if (metrics) {
      metrics.totalLoads++;
      metrics.totalTime += loadTime;
      this.performanceMetrics.set(strategyName, metrics);
    }
  }

  private recordFailedLoad(strategyName: string, loadTime: number): void {
    const metrics = this.performanceMetrics.get(strategyName);
    if (metrics) {
      metrics.totalLoads++;
      metrics.totalTime += loadTime;
      metrics.errors++;
      this.performanceMetrics.set(strategyName, metrics);
    }
  }

  // ===== ANALYTICS AND REPORTING =====

  public getLoadAttemptHistory(configKey?: string): Record<string, LoadAttemptResult[]> {
    if (configKey) {
      const attempts = this.loadAttempts.get(configKey);
      return attempts ? { [configKey]: attempts } : {};
    }
    
    return Object.fromEntries(this.loadAttempts);
  }

  public getPerformanceMetrics(): Record<string, { 
    totalLoads: number; 
    averageLoadTime: number; 
    successRate: number; 
    errorRate: number 
  }> {
    const metrics: Record<string, any> = {};
    
    this.performanceMetrics.forEach((data, strategyName) => {
      metrics[strategyName] = {
        totalLoads: data.totalLoads,
        averageLoadTime: data.totalLoads > 0 ? data.totalTime / data.totalLoads : 0,
        successRate: data.totalLoads > 0 ? ((data.totalLoads - data.errors) / data.totalLoads) * 100 : 100,
        errorRate: data.totalLoads > 0 ? (data.errors / data.totalLoads) * 100 : 0
      };
    });
    
    return metrics;
  }
}

// ===== REGISTRY UTILITIES =====

/**
 * Configuration Strategy Registry Utilities
 * Helper functions for common registry operations
 */
export class RegistryUtils {
  /**
   * Create configuration load context with defaults
   */
  static createLoadContext(
    key: string,
    overrides: Partial<ConfigurationLoadContext> = {}
  ): ConfigurationLoadContext {
    return {
      key,
      environment: 'development',
      requestId: crypto.randomUUID(),
      timeout: 10000,
      retryAttempts: 3,
      metadata: {},
      cachingEnabled: true,
      validationRequired: true,
      ...overrides
    };
  }

  /**
   * Extract category and subcategory from configuration key
   */
  static parseConfigurationKey(key: string): { category?: string; subcategory?: string } {
    const parts = key.split('-');
    
    if (parts.length >= 2) {
      return {
        category: parts[0],
        subcategory: parts.slice(1).join('-')
      };
    } else if (parts.length === 1) {
      return {
        category: parts[0]
      };
    }
    
    return {};
  }

  /**
   * Build fallback keys for configuration loading
   */
  static buildFallbackKeys(key: string): string[] {
    const { category, subcategory } = RegistryUtils.parseConfigurationKey(key);
    const fallbacks: string[] = [];
    
    if (category && subcategory) {
      fallbacks.push(category); // Try category only
      fallbacks.push(`${category}-default`); // Try default subcategory
    }
    
    fallbacks.push('default'); // Ultimate fallback
    
    return fallbacks;
  }
}

// ===== SINGLETON REGISTRY INSTANCE =====

/**
 * Singleton Configuration Strategy Registry Instance
 */
export const configurationStrategyRegistry = new ConfigurationStrategyRegistry();