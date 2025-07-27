/**
 * ConfigurationSource Interface - Enterprise AOP Implementation
 * Complete abstraction for configuration loading with cross-cutting concerns
 */

import { ValidationError, Result } from '../domain/Hostname';
import { Environment } from '../domain/Environment';
import { ValidationResult } from '../domain/AuthenticationStrategy';

// Configuration Domain Types
export interface AuthenticationConfiguration {
  readonly environment: Environment;
  readonly domains: string[];
  readonly strategies: StrategyConfiguration[];
  readonly mappings: HostnameMappingConfiguration[];
  readonly security: SecurityConfiguration;
  readonly monitoring: MonitoringConfiguration;
}

export interface StrategyConfiguration {
  readonly scope: string[];
  readonly callbackURL: string;
  readonly clientId: string;
  readonly issuerURL: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly securityLevel: 'basic' | 'standard' | 'enhanced' | 'strict';
}

export interface HostnameMappingConfiguration {
  readonly hostname: string;
  readonly strategyName: string;
  readonly environment: string;
  readonly priority: number;
}

export interface SecurityConfiguration {
  readonly enforceHTTPS: boolean;
  readonly allowedOrigins: string[];
  readonly sessionTimeout: number;
  readonly maxRetryAttempts: number;
  readonly rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  readonly csrfProtection: boolean;
  readonly corsEnabled: boolean;
}

export interface MonitoringConfiguration {
  readonly enableMetrics: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly alerting: {
    enabled: boolean;
    thresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
  };
  readonly tracing: {
    enabled: boolean;
    sampleRate: number;
  };
  readonly healthChecks: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
}

// Configuration Error Types
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'CONFIG_ERROR',
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class EnvironmentVariableError extends ConfigurationError {
  constructor(
    message: string,
    public readonly missingVariables: string[] = [],
    context?: Record<string, any>
  ) {
    super(message, 'ENV_VAR_ERROR', context);
    this.name = 'EnvironmentVariableError';
  }
}

export class ConfigurationValidationError extends ConfigurationError {
  constructor(
    message: string,
    public readonly validationErrors: ValidationError[] = [],
    context?: Record<string, any>
  ) {
    super(message, 'CONFIG_VALIDATION_ERROR', context);
    this.name = 'ConfigurationValidationError';
  }
}

// Configuration Source Interface
export interface IConfigurationSource {
  /**
   * Load configuration for the specified environment
   */
  load(environment: Environment): Promise<Result<AuthenticationConfiguration, ConfigurationError>>;

  /**
   * Validate that all required configuration is available
   */
  validate(): Promise<ValidationResult>;

  /**
   * Get list of required environment variables
   */
  getRequiredVariables(): string[];

  /**
   * Get optional environment variables with defaults
   */
  getOptionalVariables(): Record<string, string>;

  /**
   * Reload configuration (for hot reloading scenarios)
   */
  reload(): Promise<Result<void, ConfigurationError>>;

  /**
   * Get configuration schema for validation
   */
  getSchema(): Record<string, any>;

  /**
   * Test configuration connectivity (database, external services, etc.)
   */
  testConnectivity(): Promise<ValidationResult>;
}

// Configuration Loading Strategy Interface
export interface IConfigurationLoadingStrategy {
  readonly name: string;
  readonly priority: number;
  
  canHandle(environment: Environment): Promise<boolean>;
  loadConfiguration(environment: Environment): Promise<Result<Partial<AuthenticationConfiguration>, ConfigurationError>>;
  validateConfiguration(config: Partial<AuthenticationConfiguration>): Promise<ValidationResult>;
}

// Configuration Transformation Interface
export interface IConfigurationTransformer {
  readonly name: string;
  
  transform(
    raw: Record<string, any>, 
    environment: Environment
  ): Promise<Result<Partial<AuthenticationConfiguration>, ConfigurationError>>;
  
  validate(transformed: Partial<AuthenticationConfiguration>): Promise<ValidationResult>;
}

// Configuration Aspect Interface (AOP)
export interface IConfigurationAspect {
  /**
   * Execute before configuration loading
   */
  beforeLoad(environment: Environment, source: string): Promise<void>;

  /**
   * Execute after successful configuration loading
   */
  afterLoad(
    environment: Environment, 
    configuration: AuthenticationConfiguration, 
    loadTimeMs: number
  ): Promise<void>;

  /**
   * Execute when configuration loading fails
   */
  onLoadError(
    environment: Environment, 
    error: ConfigurationError, 
    source: string
  ): Promise<void>;

  /**
   * Execute before configuration validation
   */
  beforeValidation(configuration: AuthenticationConfiguration): Promise<void>;

  /**
   * Execute after configuration validation
   */
  afterValidation(
    configuration: AuthenticationConfiguration, 
    result: ValidationResult
  ): Promise<void>;
}

// Configuration Registry Interface
export interface IConfigurationRegistry {
  /**
   * Register a configuration source
   */
  registerSource(name: string, source: IConfigurationSource): void;

  /**
   * Register a loading strategy
   */
  registerStrategy(strategy: IConfigurationLoadingStrategy): void;

  /**
   * Register a transformer
   */
  registerTransformer(transformer: IConfigurationTransformer): void;

  /**
   * Register an aspect
   */
  registerAspect(aspect: IConfigurationAspect): void;

  /**
   * Get configuration source by name
   */
  getSource(name: string): IConfigurationSource | undefined;

  /**
   * Get all available strategies for environment
   */
  getStrategiesForEnvironment(environment: Environment): Promise<IConfigurationLoadingStrategy[]>;

  /**
   * Get all transformers
   */
  getTransformers(): IConfigurationTransformer[];

  /**
   * Get all aspects
   */
  getAspects(): IConfigurationAspect[];
}

// Configuration Cache Interface
export interface IConfigurationCache {
  /**
   * Get cached configuration
   */
  get(key: string): Promise<AuthenticationConfiguration | null>;

  /**
   * Set configuration in cache
   */
  set(key: string, configuration: AuthenticationConfiguration, ttlSeconds?: number): Promise<void>;

  /**
   * Invalidate cached configuration
   */
  invalidate(key: string): Promise<void>;

  /**
   * Clear all cached configurations
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
    ttl: number;
  }>;
}

// Configuration Watcher Interface
export interface IConfigurationWatcher {
  /**
   * Start watching for configuration changes
   */
  start(): Promise<void>;

  /**
   * Stop watching for configuration changes
   */
  stop(): Promise<void>;

  /**
   * Register callback for configuration changes
   */
  onConfigurationChange(callback: (newConfig: AuthenticationConfiguration) => Promise<void>): void;

  /**
   * Get current watch status
   */
  isWatching(): boolean;
}

// Abstract Base Configuration Source
export abstract class BaseConfigurationSource implements IConfigurationSource {
  protected readonly aspects: IConfigurationAspect[] = [];
  protected readonly cache?: IConfigurationCache;
  protected readonly watcher?: IConfigurationWatcher;

  constructor(
    aspects: IConfigurationAspect[] = [],
    cache?: IConfigurationCache,
    watcher?: IConfigurationWatcher
  ) {
    this.aspects = aspects;
    this.cache = cache;
    this.watcher = watcher;
  }

  abstract load(environment: Environment): Promise<Result<AuthenticationConfiguration, ConfigurationError>>;
  abstract validate(): Promise<ValidationResult>;
  abstract getRequiredVariables(): string[];
  abstract getOptionalVariables(): Record<string, string>;
  abstract getSchema(): Record<string, any>;
  abstract testConnectivity(): Promise<ValidationResult>;

  async reload(): Promise<Result<void, ConfigurationError>> {
    try {
      if (this.cache) {
        await this.cache.clear();
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(new ConfigurationError(
        `Failed to reload configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Execute aspects around configuration loading
   */
  protected async executeWithAspects<T>(
    environment: Environment,
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Before aspects
      await this.executeBeforeAspects(environment, operationName);

      // Execute operation
      const result = await operation();

      // After aspects
      const duration = Date.now() - startTime;
      await this.executeAfterAspects(environment, result as any, duration);

      return result;
    } catch (error) {
      // Error aspects
      await this.executeErrorAspects(environment, error as ConfigurationError, operationName);
      throw error;
    }
  }

  private async executeBeforeAspects(environment: Environment, source: string): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.beforeLoad(environment, source);
      } catch (error) {
        console.warn(`Aspect ${aspect.constructor.name} beforeLoad failed:`, error);
      }
    }
  }

  private async executeAfterAspects(
    environment: Environment, 
    configuration: AuthenticationConfiguration, 
    duration: number
  ): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.afterLoad(environment, configuration, duration);
      } catch (error) {
        console.warn(`Aspect ${aspect.constructor.name} afterLoad failed:`, error);
      }
    }
  }

  private async executeErrorAspects(
    environment: Environment, 
    error: ConfigurationError, 
    source: string
  ): Promise<void> {
    for (const aspect of this.aspects) {
      try {
        await aspect.onLoadError(environment, error, source);
      } catch (aspectError) {
        console.warn(`Aspect ${aspect.constructor.name} onLoadError failed:`, aspectError);
      }
    }
  }

  /**
   * Generate cache key for environment
   */
  protected generateCacheKey(environment: Environment): string {
    return `config:${environment.toString()}:${Date.now()}`;
  }

  /**
   * Load from cache if available
   */
  protected async loadFromCache(environment: Environment): Promise<AuthenticationConfiguration | null> {
    if (!this.cache) {
      return null;
    }

    const cacheKey = this.generateCacheKey(environment);
    return this.cache.get(cacheKey);
  }

  /**
   * Save to cache if available
   */
  protected async saveToCache(
    environment: Environment, 
    configuration: AuthenticationConfiguration,
    ttlSeconds: number = 300
  ): Promise<void> {
    if (!this.cache) {
      return;
    }

    const cacheKey = this.generateCacheKey(environment);
    await this.cache.set(cacheKey, configuration, ttlSeconds);
  }
}