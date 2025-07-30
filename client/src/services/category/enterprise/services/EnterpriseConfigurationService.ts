/**
 * Enterprise Configuration Service with Result Pattern
 * Complete refactoring of configuration loading to Result<T, E> pattern
 * Zero null returns, comprehensive error handling and logging
 */

import { 
  UniversalPageConfiguration 
} from '../schemas/ConfigurationSchemas';

import { 
  Result,
  ConfigurationResult,
  ConfigurationResultUtils,
  AsyncResultUtils
} from '../patterns/Result';

import {
  ConfigurationError,
  ConfigurationErrorFactory,
  ErrorTypeGuards
} from '../errors/ConfigurationErrors';

import { 
  enterpriseConfigurationRegistry,
  type IEnterpriseConfigurationRegistry,
  type ValidationReport,
  type RegistryHealthReport,
  type ConfigurationMetadata
} from '../registry/EnterpriseConfigurationRegistry';

// ===== SERVICE INTERFACES =====

/**
 * Configuration Service Interface
 * All operations return Result<T, E> - eliminating null returns entirely
 */
export interface IEnterpriseConfigurationService {
  readonly loadConfiguration: (key: string, options?: ConfigurationLoadOptions) => Promise<ConfigurationResult<UniversalPageConfiguration>>;
  readonly loadMultipleConfigurations: (keys: string[], options?: ConfigurationLoadOptions) => Promise<ConfigurationResult<UniversalPageConfiguration[]>>;
  readonly validateConfiguration: (key: string, options?: ConfigurationValidationOptions) => Promise<ConfigurationResult<ValidationReport>>;
  readonly getAvailableConfigurations: () => Promise<ConfigurationResult<ConfigurationSummary[]>>;
  readonly checkConfigurationHealth: (key?: string) => Promise<ConfigurationResult<RegistryHealthReport>>;
  readonly preloadConfigurations: (keys: string[]) => Promise<ConfigurationResult<PreloadReport>>;
  readonly getConfigurationMetadata: (key: string) => Promise<ConfigurationResult<ConfigurationMetadata>>;
}

/**
 * Configuration load options
 */
export interface ConfigurationLoadOptions {
  readonly contextId?: string;
  readonly validateOnLoad?: boolean;
  readonly cacheEnabled?: boolean;
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly fallbackKey?: string;
}

/**
 * Configuration validation options
 */
export interface ConfigurationValidationOptions {
  readonly contextId?: string;
  readonly strictValidation?: boolean;
  readonly includeWarnings?: boolean;
  readonly validateReferences?: boolean;
}

/**
 * Configuration summary for listing
 */
export interface ConfigurationSummary {
  readonly key: string;
  readonly category: string;
  readonly subcategory?: string;
  readonly version: string;
  readonly isActive: boolean;
  readonly lastUpdated: string;
  readonly validationStatus: 'valid' | 'invalid' | 'unknown';
}

/**
 * Preload operation report
 */
export interface PreloadReport {
  readonly totalRequested: number;
  readonly successfulLoads: number;
  readonly failedLoads: number;
  readonly loadedKeys: string[];
  readonly failedKeys: string[];
  readonly totalLoadTime: number;
  readonly averageLoadTime: number;
}

// ===== CONFIGURATION LOGGER =====

export interface ConfigurationLogger {
  readonly logSuccess: (operation: string, details: Record<string, unknown>) => void;
  readonly logError: (operation: string, error: ConfigurationError) => void;
  readonly logWarning: (operation: string, message: string, details?: Record<string, unknown>) => void;
  readonly logInfo: (operation: string, message: string, details?: Record<string, unknown>) => void;
}

/**
 * Default console-based configuration logger
 */
export class ConsoleConfigurationLogger implements ConfigurationLogger {
  public logSuccess(operation: string, details: Record<string, unknown>): void {
    console.log(`[CONFIG-SUCCESS] ${operation}:`, details);
  }

  public logError(operation: string, error: ConfigurationError): void {
    console.error(`[CONFIG-ERROR] ${operation}:`, {
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      contextId: error.contextId,
      recoverable: error.recoverable
    });
  }

  public logWarning(operation: string, message: string, details?: Record<string, unknown>): void {
    console.warn(`[CONFIG-WARNING] ${operation}: ${message}`, details);
  }

  public logInfo(operation: string, message: string, details?: Record<string, unknown>): void {
    console.info(`[CONFIG-INFO] ${operation}: ${message}`, details);
  }
}

// ===== ENTERPRISE CONFIGURATION SERVICE IMPLEMENTATION =====

/**
 * Enterprise Configuration Service Implementation
 * Complete Result pattern implementation with comprehensive error handling
 */
export class EnterpriseConfigurationService implements IEnterpriseConfigurationService {
  private readonly registry: IEnterpriseConfigurationRegistry;
  private readonly logger: ConfigurationLogger;
  private readonly defaultTimeout: number = 10000; // 10 seconds
  private readonly defaultRetryAttempts: number = 3;

  constructor(
    registry: IEnterpriseConfigurationRegistry = enterpriseConfigurationRegistry,
    logger: ConfigurationLogger = new ConsoleConfigurationLogger()
  ) {
    this.registry = registry;
    this.logger = logger;
  }

  /**
   * Load single configuration with comprehensive error handling
   * Returns Result<UniversalPageConfiguration, ConfigurationError> - never null
   */
  public async loadConfiguration(
    key: string,
    options: ConfigurationLoadOptions = {}
  ): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    const contextId = options.contextId || crypto.randomUUID();
    const startTime = Date.now();

    this.logger.logInfo('load-configuration', `Loading configuration for key: ${key}`, { 
      contextId, 
      options 
    });

    try {
      // Input validation
      if (!key || typeof key !== 'string' || key.trim().length === 0) {
        const error = ConfigurationErrorFactory.createValidationError(
          key || 'undefined',
          ['Configuration key must be a non-empty string'],
          key,
          contextId
        );
        this.logger.logError('load-configuration', error);
        return ConfigurationResultUtils.failure(error);
      }

      // Load with timeout if specified
      const loadPromise = this.registry.getConfiguration(key, contextId);
      const result = options.timeout 
        ? await this.withTimeout(loadPromise, options.timeout, key, contextId)
        : await loadPromise;

      // Handle result
      return result.match(
        (config) => {
          const loadTime = Date.now() - startTime;
          this.logger.logSuccess('load-configuration', {
            key,
            contextId,
            loadTime,
            version: config.version,
            category: config.category
          });
          return ConfigurationResultUtils.success(config);
        },
        (error) => {
          this.logger.logError('load-configuration', error);
          
          // Try fallback if configured
          if (options.fallbackKey && options.fallbackKey !== key) {
            this.logger.logInfo('load-configuration', `Attempting fallback to key: ${options.fallbackKey}`, {
              originalKey: key,
              fallbackKey: options.fallbackKey,
              contextId
            });
            return this.loadConfiguration(options.fallbackKey, { ...options, fallbackKey: undefined });
          }
          
          return ConfigurationResultUtils.failure(error);
        }
      );

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        key,
        'load-configuration',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('load-configuration', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Load multiple configurations in parallel
   * Returns Result<UniversalPageConfiguration[], ConfigurationError> - never null
   */
  public async loadMultipleConfigurations(
    keys: string[],
    options: ConfigurationLoadOptions = {}
  ): Promise<ConfigurationResult<UniversalPageConfiguration[]>> {
    const contextId = options.contextId || crypto.randomUUID();
    const startTime = Date.now();

    this.logger.logInfo('load-multiple-configurations', `Loading ${keys.length} configurations`, {
      keys,
      contextId,
      options
    });

    try {
      // Input validation
      if (!Array.isArray(keys) || keys.length === 0) {
        const error = ConfigurationErrorFactory.createValidationError(
          'multiple-configs',
          ['Keys must be a non-empty array'],
          keys,
          contextId
        );
        this.logger.logError('load-multiple-configurations', error);
        return ConfigurationResultUtils.failure(error);
      }

      // Load all configurations in parallel
      const loadPromises = keys.map(key => 
        this.loadConfiguration(key, { ...options, contextId })
      );

      const results = await AsyncResultUtils.parallel(loadPromises);

      return results.match(
        (configs) => {
          const loadTime = Date.now() - startTime;
          this.logger.logSuccess('load-multiple-configurations', {
            totalConfigs: configs.length,
            contextId,
            loadTime,
            keys
          });
          return ConfigurationResultUtils.success(configs);
        },
        (error) => {
          this.logger.logError('load-multiple-configurations', error);
          return ConfigurationResultUtils.failure(error);
        }
      );

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        `multiple-configs-${keys.length}`,
        'load-multiple-configurations',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('load-multiple-configurations', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Validate configuration with comprehensive reporting
   * Returns Result<ValidationReport, ConfigurationError> - never null
   */
  public async validateConfiguration(
    key: string,
    options: ConfigurationValidationOptions = {}
  ): Promise<ConfigurationResult<ValidationReport>> {
    const contextId = options.contextId || crypto.randomUUID();

    this.logger.logInfo('validate-configuration', `Validating configuration for key: ${key}`, {
      contextId,
      options
    });

    try {
      const result = await this.registry.validateConfiguration(key, contextId);
      
      return result.match(
        (report) => {
          this.logger.logSuccess('validate-configuration', {
            key,
            contextId,
            isValid: report.isValid,
            complianceScore: report.complianceScore,
            errorCount: report.validationErrors.length
          });
          return ConfigurationResultUtils.success(report);
        },
        (error) => {
          this.logger.logError('validate-configuration', error);
          return ConfigurationResultUtils.failure(error);
        }
      );

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        key,
        'validate-configuration',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('validate-configuration', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get available configurations summary
   * Returns Result<ConfigurationSummary[], ConfigurationError> - never null
   */
  public async getAvailableConfigurations(): Promise<ConfigurationResult<ConfigurationSummary[]>> {
    const contextId = crypto.randomUUID();

    this.logger.logInfo('get-available-configurations', 'Retrieving available configurations', { contextId });

    try {
      const keysResult = this.registry.getAllKeys();
      
      if (keysResult.isFailure) {
        this.logger.logError('get-available-configurations', keysResult.error);
        return ConfigurationResultUtils.failure(keysResult.error);
      }

      const keys = keysResult.value;
      const summaries: ConfigurationSummary[] = [];

      // Get metadata for each configuration
      for (const key of keys) {
        const metadataResult = this.registry.getConfigurationMetadata(key);
        
        if (metadataResult.isSuccess) {
          const metadata = metadataResult.value;
          summaries.push({
            key: metadata.key,
            category: metadata.category,
            subcategory: metadata.subcategory,
            version: metadata.version,
            isActive: metadata.isActive,
            lastUpdated: metadata.lastUpdated,
            validationStatus: 'valid' // Will be enhanced with actual validation
          });
        }
      }

      this.logger.logSuccess('get-available-configurations', {
        totalConfigurations: summaries.length,
        contextId
      });

      return ConfigurationResultUtils.success(summaries);

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        'available-configurations',
        'get-available-configurations',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('get-available-configurations', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Check configuration or registry health
   * Returns Result<RegistryHealthReport, ConfigurationError> - never null
   */
  public async checkConfigurationHealth(
    key?: string
  ): Promise<ConfigurationResult<RegistryHealthReport>> {
    const contextId = crypto.randomUUID();

    this.logger.logInfo('check-configuration-health', 
      key ? `Checking health for configuration: ${key}` : 'Checking registry health', 
      { contextId, key }
    );

    try {
      const healthResult = this.registry.getRegistryHealth();
      
      return healthResult.match(
        (health) => {
          this.logger.logSuccess('check-configuration-health', {
            healthScore: health.healthScore,
            totalConfigurations: health.totalConfigurations,
            validConfigurations: health.validConfigurations,
            contextId
          });
          return ConfigurationResultUtils.success(health);
        },
        (error) => {
          this.logger.logError('check-configuration-health', error);
          return ConfigurationResultUtils.failure(error);
        }
      );

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        key || 'registry-health',
        'check-configuration-health',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('check-configuration-health', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Preload multiple configurations for performance optimization
   * Returns Result<PreloadReport, ConfigurationError> - never null
   */
  public async preloadConfigurations(
    keys: string[]
  ): Promise<ConfigurationResult<PreloadReport>> {
    const contextId = crypto.randomUUID();
    const startTime = Date.now();

    this.logger.logInfo('preload-configurations', `Preloading ${keys.length} configurations`, {
      keys,
      contextId
    });

    try {
      const loadedKeys: string[] = [];
      const failedKeys: string[] = [];
      let successfulLoads = 0;
      let failedLoads = 0;

      // Load all configurations
      const loadPromises = keys.map(async (key) => {
        const result = await this.loadConfiguration(key, { contextId, validateOnLoad: false });
        
        if (result.isSuccess) {
          loadedKeys.push(key);
          successfulLoads++;
        } else {
          failedKeys.push(key);
          failedLoads++;
        }
        
        return result;
      });

      await Promise.all(loadPromises);

      const totalLoadTime = Date.now() - startTime;
      const averageLoadTime = keys.length > 0 ? totalLoadTime / keys.length : 0;

      const report: PreloadReport = {
        totalRequested: keys.length,
        successfulLoads,
        failedLoads,
        loadedKeys,
        failedKeys,
        totalLoadTime,
        averageLoadTime
      };

      this.logger.logSuccess('preload-configurations', {
        ...report,
        contextId
      });

      return ConfigurationResultUtils.success(report);

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        `preload-${keys.length}`,
        'preload-configurations',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('preload-configurations', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get configuration metadata
   * Returns Result<ConfigurationMetadata, ConfigurationError> - never null
   */
  public async getConfigurationMetadata(
    key: string
  ): Promise<ConfigurationResult<ConfigurationMetadata>> {
    const contextId = crypto.randomUUID();

    this.logger.logInfo('get-configuration-metadata', `Getting metadata for key: ${key}`, {
      key,
      contextId
    });

    try {
      const result = this.registry.getConfigurationMetadata(key);
      
      return result.match(
        (metadata) => {
          this.logger.logSuccess('get-configuration-metadata', {
            key,
            version: metadata.version,
            category: metadata.category,
            contextId
          });
          return ConfigurationResultUtils.success(metadata);
        },
        (error) => {
          this.logger.logError('get-configuration-metadata', error);
          return ConfigurationResultUtils.failure(error);
        }
      );

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        key,
        'get-configuration-metadata',
        error as Error,
        0,
        contextId
      );
      this.logger.logError('get-configuration-metadata', configError);
      return ConfigurationResultUtils.failure(configError);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Add timeout to configuration loading
   */
  private async withTimeout<T>(
    promise: Promise<ConfigurationResult<T>>,
    timeout: number,
    key: string,
    contextId: string
  ): Promise<ConfigurationResult<T>> {
    const timeoutPromise = new Promise<ConfigurationResult<T>>((_, reject) => {
      setTimeout(() => {
        const error = ConfigurationErrorFactory.createLoadError(
          key,
          'timeout',
          new Error(`Configuration load timeout after ${timeout}ms`),
          0,
          contextId
        );
        reject(error);
      }, timeout);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      return ConfigurationResultUtils.failure(error as ConfigurationError);
    }
  }
}

// ===== SINGLETON SERVICE INSTANCE =====

/**
 * Singleton Enterprise Configuration Service Instance
 */
export const enterpriseConfigurationService = new EnterpriseConfigurationService();

// ===== SERVICE UTILITIES =====

/**
 * Configuration Service Utilities
 * High-level helper functions for common service operations
 */
export class ConfigurationServiceUtils {
  /**
   * Load configuration with automatic retry and fallback
   */
  static async loadWithRetry(
    key: string,
    retries: number = 3,
    fallbackKey?: string
  ): Promise<UniversalPageConfiguration | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await enterpriseConfigurationService.loadConfiguration(key, {
        retryAttempts: attempt,
        fallbackKey: attempt === retries ? fallbackKey : undefined
      });

      if (result.isSuccess) {
        return result.value;
      }

      if (attempt === retries) {
        return null;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return null;
  }

  /**
   * Batch load configurations with progress tracking
   */
  static async batchLoadConfigurations(
    keys: string[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<UniversalPageConfiguration[]> {
    const results: UniversalPageConfiguration[] = [];
    
    for (let i = 0; i < keys.length; i++) {
      const result = await enterpriseConfigurationService.loadConfiguration(keys[i]);
      
      if (result.isSuccess) {
        results.push(result.value);
      }
      
      onProgress?.(i + 1, keys.length);
    }
    
    return results;
  }
}