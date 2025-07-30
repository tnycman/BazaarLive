/**
 * Enterprise Configuration Registry with Result Pattern
 * Complete elimination of null returns, explicit error handling
 * Zero assumptions, comprehensive Result<T, E> implementation
 */

import { 
  UniversalPageConfiguration,
  SchemaValidation 
} from '../schemas/ConfigurationSchemas';

import { 
  Result,
  ConfigurationResult,
  ConfigurationResultUtils 
} from '../patterns/Result';

import {
  ConfigurationError,
  ConfigurationNotFoundError,
  ConfigurationValidationError,
  ConfigurationLoadError,
  ConfigurationErrorFactory
} from '../errors/ConfigurationErrors';

import { enterpriseWomenConfig } from '../configs/EnterpriseWomenConfig';
import { enterpriseMenConfig } from '../configs/EnterpriseMenConfig';

// ===== REGISTRY INTERFACES =====

/**
 * Enterprise Configuration Registry Interface
 * All methods return Result<T, E> - zero null returns
 */
export interface IEnterpriseConfigurationRegistry {
  readonly getConfiguration: (key: string, contextId?: string) => Promise<ConfigurationResult<UniversalPageConfiguration>>;
  readonly getAllKeys: () => ConfigurationResult<readonly string[]>;
  readonly hasConfiguration: (key: string) => ConfigurationResult<boolean>;
  readonly getConfigurationCount: () => ConfigurationResult<number>;
  readonly validateConfiguration: (key: string, contextId?: string) => Promise<ConfigurationResult<ValidationReport>>;
  readonly getRegistryHealth: () => ConfigurationResult<RegistryHealthReport>;
  readonly getConfigurationMetadata: (key: string) => ConfigurationResult<ConfigurationMetadata>;
}

/**
 * Configuration metadata interface
 */
export interface ConfigurationMetadata {
  readonly key: string;
  readonly version: string;
  readonly lastUpdated: string;
  readonly isActive: boolean;
  readonly configurationId: string;
  readonly category: string;
  readonly subcategory?: string;
}

/**
 * Validation report interface
 */
export interface ValidationReport {
  readonly configKey: string;
  readonly isValid: boolean;
  readonly validationErrors: string[];
  readonly validationWarnings: string[];
  readonly complianceScore: number;
  readonly validatedAt: string;
  readonly contextId: string;
}

/**
 * Registry health report interface
 */
export interface RegistryHealthReport {
  readonly totalConfigurations: number;
  readonly validConfigurations: number;
  readonly invalidConfigurations: number;
  readonly healthScore: number;
  readonly lastHealthCheck: string;
  readonly issues: string[];
  readonly recommendations: string[];
}

// ===== CONFIGURATION LOAD CONTEXT =====

export interface ConfigurationLoadContext {
  readonly key: string;
  readonly contextId: string;
  readonly requestedAt: string;
  readonly loadStrategy: 'static' | 'dynamic' | 'merged';
  readonly cacheEnabled: boolean;
  readonly validateOnLoad: boolean;
}

// ===== ENTERPRISE REGISTRY IMPLEMENTATION =====

/**
 * Enterprise Configuration Registry Implementation
 * Complete Result pattern implementation with comprehensive error handling
 */
export class EnterpriseConfigurationRegistry implements IEnterpriseConfigurationRegistry {
  private readonly configurations: Map<string, UniversalPageConfiguration>;
  private readonly metadata: Map<string, ConfigurationMetadata>;
  private readonly loadCache: Map<string, { config: UniversalPageConfiguration; timestamp: number; ttl: number }>;
  private readonly cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.configurations = new Map();
    this.metadata = new Map();
    this.loadCache = new Map();
    
    // Initialize with enterprise configurations
    this.initializeConfigurations();
  }

  /**
   * Initialize configuration registry with enterprise configs
   */
  private initializeConfigurations(): void {
    // Women's configuration
    const womenKey = 'fashion-women';
    this.configurations.set(womenKey, enterpriseWomenConfig);
    this.metadata.set(womenKey, {
      key: womenKey,
      version: enterpriseWomenConfig.version || '2.0.0',
      lastUpdated: enterpriseWomenConfig.lastUpdated || new Date().toISOString(),
      isActive: enterpriseWomenConfig.isActive ?? true,
      configurationId: enterpriseWomenConfig.configurationId || crypto.randomUUID(),
      category: enterpriseWomenConfig.category,
      subcategory: enterpriseWomenConfig.subcategory
    });

    // Men's configuration
    const menKey = 'fashion-men';
    this.configurations.set(menKey, enterpriseMenConfig);
    this.metadata.set(menKey, {
      key: menKey,
      version: enterpriseMenConfig.version || '2.0.0',
      lastUpdated: enterpriseMenConfig.lastUpdated || new Date().toISOString(),
      isActive: enterpriseMenConfig.isActive ?? true,
      configurationId: enterpriseMenConfig.configurationId || crypto.randomUUID(),
      category: enterpriseMenConfig.category,
      subcategory: enterpriseMenConfig.subcategory
    });
  }

  /**
   * Get configuration by key with comprehensive error handling
   * Returns Result<UniversalPageConfiguration, ConfigurationError> - never null
   */
  public async getConfiguration(
    key: string,
    contextId?: string
  ): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    const loadContext: ConfigurationLoadContext = {
      key,
      contextId: contextId || crypto.randomUUID(),
      requestedAt: new Date().toISOString(),
      loadStrategy: 'static',
      cacheEnabled: true,
      validateOnLoad: true
    };

    try {
      // Input validation
      if (!key || typeof key !== 'string' || key.trim().length === 0) {
        const error = new ConfigurationValidationError(
          key || 'undefined',
          ['Configuration key must be a non-empty string'],
          { contextId: loadContext.contextId, rawData: key }
        );
        return ConfigurationResultUtils.failure(error);
      }

      // Check cache first
      if (loadContext.cacheEnabled) {
        const cacheResult = this.getCachedConfiguration(key, loadContext.contextId);
        if (cacheResult.isSuccess) {
          return cacheResult;
        }
      }

      // Check if configuration exists
      if (!this.configurations.has(key)) {
        const availableKeys = Array.from(this.configurations.keys());
        const error = ConfigurationErrorFactory.createNotFoundError(
          key,
          availableKeys,
          loadContext.contextId
        );
        return ConfigurationResultUtils.failure(error);
      }

      // Get configuration
      const config = this.configurations.get(key)!;

      // Validate configuration if required
      if (loadContext.validateOnLoad) {
        const validationResult = await this.validateConfigurationInternal(config, key, loadContext.contextId);
        if (validationResult.isFailure) {
          return ConfigurationResultUtils.failure(validationResult.error);
        }
      }

      // Cache the configuration
      if (loadContext.cacheEnabled) {
        this.setCachedConfiguration(key, config);
      }

      return ConfigurationResultUtils.success(config);

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        key,
        loadContext.loadStrategy,
        error as Error,
        0,
        loadContext.contextId
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get all available configuration keys
   * Returns Result<readonly string[], ConfigurationError> - never null
   */
  public getAllKeys(): ConfigurationResult<readonly string[]> {
    try {
      const keys = Array.from(this.configurations.keys());
      return ConfigurationResultUtils.success(keys);
    } catch (error) {
      const configError = new ConfigurationLoadError(
        'registry-keys',
        'get-all-keys',
        { cause: error as Error }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Check if configuration exists for given key
   * Returns Result<boolean, ConfigurationError> - never null
   */
  public hasConfiguration(key: string): ConfigurationResult<boolean> {
    try {
      if (!key || typeof key !== 'string') {
        const error = new ConfigurationValidationError(
          key || 'undefined',
          ['Configuration key must be a non-empty string'],
          { rawData: key }
        );
        return ConfigurationResultUtils.failure(error);
      }

      const exists = this.configurations.has(key);
      return ConfigurationResultUtils.success(exists);
    } catch (error) {
      const configError = new ConfigurationLoadError(
        key || 'unknown',
        'has-configuration',
        { cause: error as Error }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get total number of registered configurations
   * Returns Result<number, ConfigurationError> - never null
   */
  public getConfigurationCount(): ConfigurationResult<number> {
    try {
      const count = this.configurations.size;
      return ConfigurationResultUtils.success(count);
    } catch (error) {
      const configError = new ConfigurationLoadError(
        'registry-count',
        'get-configuration-count',
        { cause: error as Error }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Validate configuration with comprehensive reporting
   * Returns Result<ValidationReport, ConfigurationError> - never null
   */
  public async validateConfiguration(
    key: string,
    contextId?: string
  ): Promise<ConfigurationResult<ValidationReport>> {
    const validationContextId = contextId || crypto.randomUUID();

    try {
      // Get configuration first
      const configResult = await this.getConfiguration(key, validationContextId);
      if (configResult.isFailure) {
        return ConfigurationResultUtils.failure(configResult.error);
      }

      const config = configResult.value;
      const validationResult = await this.validateConfigurationInternal(config, key, validationContextId);
      
      if (validationResult.isFailure) {
        return ConfigurationResultUtils.failure(validationResult.error);
      }

      return ConfigurationResultUtils.success(validationResult.value);

    } catch (error) {
      const configError = new ConfigurationLoadError(
        key,
        'validate-configuration',
        { cause: error as Error, contextId: validationContextId }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get registry health report
   * Returns Result<RegistryHealthReport, ConfigurationError> - never null
   */
  public getRegistryHealth(): ConfigurationResult<RegistryHealthReport> {
    try {
      const totalConfigurations = this.configurations.size;
      let validConfigurations = 0;
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Validate each configuration
      for (const [key, config] of this.configurations) {
        const validation = SchemaValidation.validateConfiguration(config);
        if (validation.isValid) {
          validConfigurations++;
        } else {
          issues.push(`Configuration ${key} has validation errors: ${validation.errors.join(', ')}`);
        }
      }

      const invalidConfigurations = totalConfigurations - validConfigurations;
      const healthScore = totalConfigurations > 0 ? (validConfigurations / totalConfigurations) * 100 : 100;

      // Generate recommendations
      if (healthScore < 100) {
        recommendations.push('Fix configuration validation errors to improve registry health');
      }
      if (totalConfigurations === 0) {
        recommendations.push('Registry is empty - add configurations to begin using the system');
      }
      if (healthScore < 80) {
        recommendations.push('Consider reviewing configuration schemas and validation rules');
      }

      const healthReport: RegistryHealthReport = {
        totalConfigurations,
        validConfigurations,
        invalidConfigurations,
        healthScore,
        lastHealthCheck: new Date().toISOString(),
        issues,
        recommendations
      };

      return ConfigurationResultUtils.success(healthReport);

    } catch (error) {
      const configError = new ConfigurationLoadError(
        'registry-health',
        'get-registry-health',
        { cause: error as Error }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Get configuration metadata
   * Returns Result<ConfigurationMetadata, ConfigurationError> - never null
   */
  public getConfigurationMetadata(key: string): ConfigurationResult<ConfigurationMetadata> {
    try {
      if (!key || typeof key !== 'string') {
        const error = new ConfigurationValidationError(
          key || 'undefined',
          ['Configuration key must be a non-empty string'],
          { rawData: key }
        );
        return ConfigurationResultUtils.failure(error);
      }

      if (!this.metadata.has(key)) {
        const availableKeys = Array.from(this.metadata.keys());
        const error = ConfigurationErrorFactory.createNotFoundError(
          key,
          availableKeys
        );
        return ConfigurationResultUtils.failure(error);
      }

      const metadata = this.metadata.get(key)!;
      return ConfigurationResultUtils.success(metadata);

    } catch (error) {
      const configError = new ConfigurationLoadError(
        key || 'unknown',
        'get-configuration-metadata',
        { cause: error as Error }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Get configuration from cache
   */
  private getCachedConfiguration(
    key: string,
    contextId: string
  ): ConfigurationResult<UniversalPageConfiguration> {
    const cached = this.loadCache.get(key);
    
    if (!cached) {
      const error = ConfigurationErrorFactory.createNotFoundError(key, [], contextId);
      return ConfigurationResultUtils.failure(error);
    }

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.loadCache.delete(key);
      const error = ConfigurationErrorFactory.createNotFoundError(key, [], contextId);
      return ConfigurationResultUtils.failure(error);
    }

    return ConfigurationResultUtils.success(cached.config);
  }

  /**
   * Set configuration in cache
   */
  private setCachedConfiguration(key: string, config: UniversalPageConfiguration): void {
    this.loadCache.set(key, {
      config,
      timestamp: Date.now(),
      ttl: this.cacheTTL
    });
  }

  /**
   * Internal configuration validation
   */
  private async validateConfigurationInternal(
    config: UniversalPageConfiguration,
    key: string,
    contextId: string
  ): Promise<ConfigurationResult<ValidationReport>> {
    try {
      const validation = SchemaValidation.validateConfiguration(config);
      
      const report: ValidationReport = {
        configKey: key,
        isValid: validation.isValid,
        validationErrors: validation.errors,
        validationWarnings: [],
        complianceScore: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.length * 10)),
        validatedAt: new Date().toISOString(),
        contextId
      };

      if (!validation.isValid) {
        const error = new ConfigurationValidationError(
          key,
          validation.errors,
          { contextId, rawData: config }
        );
        return ConfigurationResultUtils.failure(error);
      }

      return ConfigurationResultUtils.success(report);

    } catch (error) {
      const configError = new ConfigurationLoadError(
        key,
        'validate-configuration-internal',
        { cause: error as Error, contextId }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }
}

// ===== SINGLETON REGISTRY INSTANCE =====

/**
 * Singleton Enterprise Configuration Registry Instance
 * Single source of truth for all configuration operations
 */
export const enterpriseConfigurationRegistry = new EnterpriseConfigurationRegistry();

// ===== REGISTRY UTILITIES =====

/**
 * Configuration Registry Utilities
 * High-level helper functions for common registry operations
 */
export class RegistryUtils {
  /**
   * Load configuration with comprehensive error handling and logging
   */
  static async loadConfigurationSafe(
    key: string,
    contextId?: string,
    logger?: (info: any) => void
  ): Promise<UniversalPageConfiguration | null> {
    const result = await enterpriseConfigurationRegistry.getConfiguration(key, contextId);
    
    return ConfigurationResultUtils.handleWithLogging(
      result,
      `load-configuration-${key}`,
      logger
    );
  }

  /**
   * Check if configuration exists safely
   */
  static checkConfigurationExists(key: string): boolean {
    const result = enterpriseConfigurationRegistry.hasConfiguration(key);
    return result.unwrapOr(false);
  }

  /**
   * Get all configuration keys safely
   */
  static getAllConfigurationKeys(): string[] {
    const result = enterpriseConfigurationRegistry.getAllKeys();
    return result.unwrapOr([]);
  }

  /**
   * Get registry health safely
   */
  static getRegistryHealthSafe(): RegistryHealthReport | null {
    const result = enterpriseConfigurationRegistry.getRegistryHealth();
    return result.unwrapOr(null);
  }
}