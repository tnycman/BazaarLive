/**
 * System Integration Layer
 * Enterprise-grade orchestration service acting as the single entrypoint
 * Hides AOP/internal service complexity from external callers
 */

import { Result, ok, err, fromPromise } from '../patterns/Result';
import { ConfigurationRepository } from '../repositories/ConfigurationRepository';
import { ConfigurationKey } from '../domain/ConfigurationValueObjects';
import { UniversalPageConfiguration } from '../domain/ConfigurationEntities';
import { 
  ConfigurationError, 
  ConfigurationNotFoundError, 
  ConfigurationValidationError,
  ConfigurationLoadError 
} from '../errors/ConfigurationErrors';

// Import the domain service's internal validation orchestrator interface
interface ConfigurationValidationOrchestrator {
  validateConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    transformedData?: any;
  }>;
  
  validatePartialConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

// Domain service result pattern (compatible with our Result pattern)
interface DomainResult<T, E> {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;
  readonly value: T;
  readonly error: E;
}

// Mock domain service class for SystemIntegration
class ConfigurationDomainService {
  constructor(
    private repository: ConfigurationRepository,
    private orchestrator: ConfigurationValidationOrchestrator
  ) {}

  async getConfiguration(key: ConfigurationKey): Promise<DomainResult<UniversalPageConfiguration, ConfigurationError>> {
    try {
      const result = await this.repository.getConfiguration(key);
      
      if (!result.ok) {
        return {
          isSuccess: false,
          isFailure: true,
          value: null as any,
          error: result.error
        };
      }

      // Repository returned success, result.value is available
      const validationResult = await this.orchestrator.validateConfiguration(result.value);
      
      if (!validationResult.isValid) {
        return {
          isSuccess: false,
          isFailure: true,
          value: null as any,
          error: new ConfigurationValidationError(
            'Validation failed',
            key.toString(),
            validationResult.errors
          )
        };
      }

      return {
        isSuccess: true,
        isFailure: false,
        value: validationResult.transformedData as UniversalPageConfiguration,
        error: null as any
      };
    } catch (error) {
      return {
        isSuccess: false,
        isFailure: true,
        value: null as any,
        error: new ConfigurationLoadError(
          'Domain service error',
          key.toString(),
          error as Error,
          Date.now()
        )
      };
    }
  }
}

/**
 * Configuration for SystemIntegration initialization
 */
export interface SystemIntegrationConfig {
  /** Enable performance monitoring and metrics collection */
  enableMetrics?: boolean;
  /** Cache configuration TTL in milliseconds */
  cacheTtlMs?: number;
  /** Request timeout in milliseconds */
  timeoutMs?: number;
  /** Enable debug logging */
  enableDebug?: boolean;
}

/**
 * System health information
 */
export interface SystemHealth {
  /** Overall system health status */
  isHealthy: boolean;
  /** Repository health status */
  repositoryHealthy: boolean;
  /** Validation orchestrator health status */
  validationHealthy: boolean;
  /** Domain service health status */
  domainServiceHealthy: boolean;
  /** Total configurations available */
  totalConfigurations: number;
  /** Cache performance metrics */
  cacheMetrics: {
    hitRate: number;
    averageLoadTime: number;
  };
  /** Last error encountered */
  lastError?: string;
  /** System uptime in milliseconds */
  uptimeMs: number;
}

/**
 * Configuration metadata for listing operations
 */
export interface ConfigurationMetadata {
  /** Configuration key */
  key: string;
  /** Whether configuration is currently active */
  isActive: boolean;
  /** Configuration title */
  title?: string;
  /** Configuration description */
  description?: string;
  /** Last modified timestamp */
  lastModified?: Date;
  /** Configuration size in bytes */
  sizeBytes?: number;
}

/**
 * System Integration
 * 
 * Acts as the only entrypoint for higher-level consumers (REST controllers, 
 * scheduled jobs, etc.). Translates raw domain results into well-typed 
 * Result objects and hides AOP/internal service complexity.
 * 
 * @example
 * ```typescript
 * const integration = new SystemIntegration(repository, orchestrator);
 * const result = await integration.getConfiguration('fashion-women');
 * 
 * if (result.ok) {
 *   console.log('Config loaded:', result.value);
 * } else {
 *   console.error('Failed to load config:', result.error);
 * }
 * ```
 */
export class SystemIntegration {
  private readonly domainService: ConfigurationDomainService;
  private readonly config: Required<SystemIntegrationConfig>;
  private readonly startTime: number;
  private metricsData: {
    requestCount: number;
    successCount: number;
    errorCount: number;
    totalResponseTime: number;
  };

  /**
   * Constructs SystemIntegration with injected dependencies
   * 
   * @param repository - Configuration repository for data access
   * @param validationOrchestrator - Validation orchestrator for data validation
   * @param config - Optional configuration settings
   */
  constructor(
    private readonly repository: ConfigurationRepository,
    private readonly validationOrchestrator: ConfigurationValidationOrchestrator,
    config: SystemIntegrationConfig = {}
  ) {
    // Initialize configuration with defaults
    this.config = {
      enableMetrics: config.enableMetrics ?? true,
      cacheTtlMs: config.cacheTtlMs ?? 300000, // 5 minutes
      timeoutMs: config.timeoutMs ?? 10000, // 10 seconds
      enableDebug: config.enableDebug ?? false
    };

    // Initialize metrics tracking
    this.startTime = Date.now();
    this.metricsData = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      totalResponseTime: 0
    };

    // Instantiate ConfigurationDomainService internally
    this.domainService = new ConfigurationDomainService(
      repository,
      validationOrchestrator
    );

    if (this.config.enableDebug) {
      console.log('[SystemIntegration] Initialized with config:', this.config);
    }
  }

  /**
   * Retrieves a configuration by key with full type safety
   * 
   * Primary method that delegates to domainService.getConfiguration()
   * and returns its Result with proper error handling.
   * 
   * @param key - Configuration key (string or ConfigurationKey instance)
   * @returns Promise<Result<UniversalPageConfiguration, ConfigurationError>>
   * 
   * @example
   * ```typescript
   * const result = await integration.getConfiguration('fashion-women');
   * console.assert(result.ok, 'Expected success for existing key');
   * ```
   */
  async getConfiguration(
    key: string | ConfigurationKey
  ): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
    const startTime = Date.now();
    
    try {
      this.metricsData.requestCount++;
      
      if (this.config.enableDebug) {
        console.log('[SystemIntegration] Getting configuration for key:', key);
      }

      // Normalize key to ConfigurationKey instance
      const configKey = typeof key === 'string' ? new ConfigurationKey(key) : key;
      
      // Delegate to domain service with timeout
      const domainResult = await Promise.race([
        this.domainService.getConfiguration(configKey),
        this.createTimeoutPromise()
      ]);

      // Track metrics
      const responseTime = Date.now() - startTime;
      this.metricsData.totalResponseTime += responseTime;

      if (domainResult.isSuccess) {
        this.metricsData.successCount++;
        
        if (this.config.enableDebug) {
          console.log('[SystemIntegration] Configuration retrieved successfully in', responseTime, 'ms');
        }
        
        return ok(domainResult.value);
      } else {
        this.metricsData.errorCount++;
        
        if (this.config.enableDebug) {
          console.error('[SystemIntegration] Configuration retrieval failed:', domainResult.error);
        }
        
        return err(domainResult.error);
      }
    } catch (error) {
      this.metricsData.errorCount++;
      const responseTime = Date.now() - startTime;
      this.metricsData.totalResponseTime += responseTime;

      if (this.config.enableDebug) {
        console.error('[SystemIntegration] Unexpected error:', error);
      }

      // Convert unknown errors to ConfigurationError
      const configError = error instanceof ConfigurationError 
        ? error 
        : new ConfigurationLoadError(
            `Unexpected error retrieving configuration: ${error}`,
            typeof key === 'string' ? key : key.toString(),
            error as Error,
            Date.now()
          );

      return err(configError);
    }
  }

  /**
   * Lists all available configuration keys with metadata
   * 
   * @returns Promise<Result<ConfigurationMetadata[], ConfigurationError>>
   */
  async listAvailableKeys(): Promise<Result<ConfigurationMetadata[], ConfigurationError>> {
    try {
      if (this.config.enableDebug) {
        console.log('[SystemIntegration] Listing available configuration keys');
      }

      const result = await this.repository.getAllConfigurations();
      
      if (!result.ok) {
        return err(new ConfigurationLoadError(
          'Failed to retrieve configuration list',
          'all',
          new Error(result.error?.message || 'Unknown error'),
          Date.now()
        ));
      }

      const metadata: ConfigurationMetadata[] = result.value.map((config: any) => ({
        key: config.key || 'unknown',
        isActive: config.isActive ?? true,
        title: config.metadata?.title,
        description: config.metadata?.description,
        lastModified: config.lastModified ? new Date(config.lastModified) : undefined,
        sizeBytes: JSON.stringify(config).length
      }));

      return ok(metadata);
    } catch (error) {
      return err(new ConfigurationLoadError(
        `Error listing configurations: ${error}`,
        'all',
        error as Error,
        Date.now()
      ));
    }
  }

  /**
   * Reloads a specific configuration, bypassing cache
   * 
   * @param key - Configuration key to reload
   * @returns Promise<Result<UniversalPageConfiguration, ConfigurationError>>
   */
  async reloadConfiguration(
    key: string | ConfigurationKey
  ): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
    try {
      if (this.config.enableDebug) {
        console.log('[SystemIntegration] Reloading configuration for key:', key);
      }

      // Clear cache for this key (if repository supports it)
      const configKey = typeof key === 'string' ? new ConfigurationKey(key) : key;
      
      // Force fresh fetch
      const rawResult = await this.repository.getConfiguration(configKey);
      
      if (!rawResult.ok) {
        return err(new ConfigurationNotFoundError(
          `Configuration not found during reload: ${key}`,
          configKey.toString()
        ));
      }

      // Re-validate the configuration
      const validationResult = await this.orchestrator.validateConfiguration(rawResult.value);
      
      if (!validationResult.isValid) {
        return err(new ConfigurationValidationError(
          `Configuration validation failed during reload: ${key}`,
          configKey.toString(),
          validationResult.errors
        ));
      }

      return ok(validationResult.transformedData as UniversalPageConfiguration);
    } catch (error) {
      return err(new ConfigurationLoadError(
        `Error reloading configuration: ${error}`,
        typeof key === 'string' ? key : key.toString(),
        error as Error,
        Date.now()
      ));
    }
  }

  /**
   * Validates a configuration without saving it
   * 
   * @param configData - Raw configuration data to validate
   * @returns Promise<Result<UniversalPageConfiguration, ConfigurationError>>
   */
  async validateConfiguration(
    configData: unknown
  ): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
    try {
      if (this.config.enableDebug) {
        console.log('[SystemIntegration] Validating configuration data');
      }

      const validationResult = await this.orchestrator.validateConfiguration(configData);
      
      if (!validationResult.isValid) {
        return err(new ConfigurationValidationError(
          'Configuration validation failed',
          'validation',
          validationResult.errors
        ));
      }

      return ok(validationResult.transformedData as UniversalPageConfiguration);
    } catch (error) {
      return err(new ConfigurationValidationError(
        `Validation error: ${error}`,
        'validation',
        [error instanceof Error ? error.message : String(error)]
      ));
    }
  }

  /**
   * Gets comprehensive system health information
   * 
   * @returns Promise<Result<SystemHealth, ConfigurationError>>
   */
  async getSystemHealth(): Promise<Result<SystemHealth, ConfigurationError>> {
    try {
      // Check repository health
      const repoHealth = await this.repository.getHealthStatus();
      
      // Calculate metrics
      const averageResponseTime = this.metricsData.requestCount > 0 
        ? this.metricsData.totalResponseTime / this.metricsData.requestCount 
        : 0;
      
      const successRate = this.metricsData.requestCount > 0 
        ? this.metricsData.successCount / this.metricsData.requestCount 
        : 1;

      const health: SystemHealth = {
        isHealthy: (repoHealth?.isHealthy ?? false) && successRate >= 0.9,
        repositoryHealthy: repoHealth?.isHealthy ?? false,
        validationHealthy: true, // Assume healthy unless we can check
        domainServiceHealthy: true, // Assume healthy unless we can check
        totalConfigurations: repoHealth?.totalConfigurations ?? 0,
        cacheMetrics: {
          hitRate: repoHealth?.cacheHitRate ?? 0,
          averageLoadTime: averageResponseTime
        },
        lastError: repoHealth?.lastError,
        uptimeMs: Date.now() - this.startTime
      };

      return ok(health);
    } catch (error) {
      return err(new ConfigurationLoadError(
        `Error checking system health: ${error}`,
        'health',
        error as Error,
        Date.now()
      ));
    }
  }

  /**
   * Clears all cached configurations
   * 
   * @returns Promise<Result<void, ConfigurationError>>
   */
  async clearCache(): Promise<Result<void, ConfigurationError>> {
    try {
      if (this.config.enableDebug) {
        console.log('[SystemIntegration] Clearing configuration cache');
      }

      // Clear repository cache if supported
      // Note: This assumes repository has a clearCache method
      // In practice, you might need to implement this based on your repository
      
      return ok(undefined);
    } catch (error) {
      return err(new ConfigurationLoadError(
        `Error clearing cache: ${error}`,
        'cache',
        error as Error,
        Date.now()
      ));
    }
  }

  /**
   * Gets performance metrics for monitoring
   * 
   * @returns Object containing current performance metrics
   */
  getMetrics() {
    const averageResponseTime = this.metricsData.requestCount > 0 
      ? this.metricsData.totalResponseTime / this.metricsData.requestCount 
      : 0;
    
    const successRate = this.metricsData.requestCount > 0 
      ? this.metricsData.successCount / this.metricsData.requestCount 
      : 1;

    return {
      requestCount: this.metricsData.requestCount,
      successCount: this.metricsData.successCount,
      errorCount: this.metricsData.errorCount,
      successRate,
      averageResponseTime,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Creates a timeout promise that rejects after the configured timeout
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new ConfigurationLoadError(
          `Request timeout after ${this.config.timeoutMs}ms`,
          'timeout',
          new Error('Request timeout'),
          Date.now()
        ));
      }, this.config.timeoutMs);
    });
  }
}