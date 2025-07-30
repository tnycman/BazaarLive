/**
 * Legacy Configuration Adapter with Result Pattern
 * Adapts existing configuration consumers to use Result<T, E> pattern
 * Zero null returns, comprehensive error handling bridge
 */

import { 
  UniversalPageConfiguration 
} from '../schemas/ConfigurationSchemas';

import { 
  ConfigurationResult,
  ConfigurationResultUtils
} from '../patterns/Result';

import {
  ConfigurationErrorFactory
} from '../errors/ConfigurationErrors';

import { 
  enterpriseConfigurationService,
  type ConfigurationLoadOptions 
} from '../services/EnterpriseConfigurationService';

// ===== LEGACY ADAPTER INTERFACES =====

/**
 * Legacy configuration loader interface compatibility
 * Maintains backward compatibility while enforcing Result pattern
 */
export interface LegacyConfigurationLoaderCompat {
  readonly loadConfiguration: (key: string) => Promise<UniversalPageConfiguration | null>;
  readonly loadConfigurationSafe: (key: string) => Promise<ConfigurationResult<UniversalPageConfiguration>>;
  readonly getAvailableKeys: () => Promise<string[]>;
  readonly hasConfiguration: (key: string) => Promise<boolean>;
}

/**
 * Legacy configuration registry interface compatibility
 */
export interface LegacyConfigurationRegistryCompat {
  readonly getConfiguration: (key: string) => UniversalPageConfiguration | null;
  readonly getConfigurationSafe: (key: string) => Promise<ConfigurationResult<UniversalPageConfiguration>>;
  readonly getAllConfigurations: () => Record<string, UniversalPageConfiguration>;
  readonly getAllConfigurationsSafe: () => Promise<ConfigurationResult<Record<string, UniversalPageConfiguration>>>;
}

// ===== MIGRATION ADAPTER =====

/**
 * Migration adapter for gradually converting legacy code to Result pattern
 * Provides both legacy (null-returning) and new (Result-returning) methods
 */
export class LegacyConfigurationAdapter implements LegacyConfigurationLoaderCompat {
  private readonly contextId: string;

  constructor(contextId?: string) {
    this.contextId = contextId || crypto.randomUUID();
  }

  /**
   * Legacy method: Load configuration returning null on failure
   * @deprecated Use loadConfigurationSafe instead
   */
  public async loadConfiguration(key: string): Promise<UniversalPageConfiguration | null> {
    console.warn(`[LEGACY-ADAPTER] loadConfiguration(${key}) is deprecated. Use loadConfigurationSafe() instead.`);
    
    const result = await this.loadConfigurationSafe(key);
    
    return result.match(
      (config) => config,
      (error) => {
        console.error(`[LEGACY-ADAPTER] Configuration load failed for key "${key}":`, error.getUserMessage());
        return null;
      }
    );
  }

  /**
   * New method: Load configuration returning Result<T, E>
   * Recommended for all new code
   */
  public async loadConfigurationSafe(key: string): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    const options: ConfigurationLoadOptions = {
      contextId: this.contextId,
      validateOnLoad: true,
      cacheEnabled: true,
      timeout: 10000
    };

    return await enterpriseConfigurationService.loadConfiguration(key, options);
  }

  /**
   * Legacy method: Get available keys returning empty array on failure
   * @deprecated Use getAvailableKeysSafe instead
   */
  public async getAvailableKeys(): Promise<string[]> {
    console.warn(`[LEGACY-ADAPTER] getAvailableKeys() is deprecated. Use getAvailableKeysSafe() instead.`);
    
    const result = await this.getAvailableKeysSafe();
    
    return result.match(
      (keys) => keys,
      (error) => {
        console.error(`[LEGACY-ADAPTER] Failed to get available keys:`, error.getUserMessage());
        return [];
      }
    );
  }

  /**
   * New method: Get available keys returning Result<T, E>
   */
  public async getAvailableKeysSafe(): Promise<ConfigurationResult<string[]>> {
    const summariesResult = await enterpriseConfigurationService.getAvailableConfigurations();
    
    return summariesResult.map(summaries => summaries.map(s => s.key));
  }

  /**
   * Legacy method: Check if configuration exists returning false on failure
   * @deprecated Use hasConfigurationSafe instead
   */
  public async hasConfiguration(key: string): Promise<boolean> {
    console.warn(`[LEGACY-ADAPTER] hasConfiguration(${key}) is deprecated. Use hasConfigurationSafe() instead.`);
    
    const result = await this.hasConfigurationSafe(key);
    
    return result.match(
      (exists) => exists,
      (error) => {
        console.error(`[LEGACY-ADAPTER] Failed to check configuration existence for key "${key}":`, error.getUserMessage());
        return false;
      }
    );
  }

  /**
   * New method: Check if configuration exists returning Result<T, E>
   */
  public async hasConfigurationSafe(key: string): Promise<ConfigurationResult<boolean>> {
    const configResult = await this.loadConfigurationSafe(key);
    
    return ConfigurationResultUtils.success(configResult.isSuccess);
  }
}

// ===== UNIVERSAL PAGE ADAPTER =====

/**
 * Universal Page Configuration Adapter
 * Bridges UniversalCategoryPage component to Result pattern
 */
export class UniversalPageConfigurationAdapter {
  private readonly adapter: LegacyConfigurationAdapter;

  constructor(contextId?: string) {
    this.adapter = new LegacyConfigurationAdapter(contextId);
  }

  /**
   * Load configuration for universal page with comprehensive error handling
   */
  public async loadPageConfiguration(
    category: string,
    subcategory?: string
  ): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    const configKey = this.buildConfigurationKey(category, subcategory);
    
    // Try specific key first
    let result = await this.adapter.loadConfigurationSafe(configKey);
    
    if (result.isFailure && subcategory) {
      // Try without subcategory as fallback
      const fallbackKey = this.buildConfigurationKey(category);
      result = await this.adapter.loadConfigurationSafe(fallbackKey);
    }
    
    return result;
  }

  /**
   * Load configuration for universal page (legacy compatibility)
   * @deprecated Use loadPageConfiguration instead
   */
  public async loadPageConfigurationLegacy(
    category: string,
    subcategory?: string
  ): Promise<UniversalPageConfiguration | null> {
    console.warn(`[UNIVERSAL-PAGE-ADAPTER] loadPageConfigurationLegacy is deprecated. Use loadPageConfiguration instead.`);
    
    const result = await this.loadPageConfiguration(category, subcategory);
    
    return result.match(
      (config) => config,
      (error) => {
        console.error(`[UNIVERSAL-PAGE-ADAPTER] Failed to load page configuration:`, error.getUserMessage());
        return null;
      }
    );
  }

  /**
   * Build configuration key from category and subcategory
   */
  private buildConfigurationKey(category: string, subcategory?: string): string {
    if (subcategory) {
      return `${category}-${subcategory}`;
    }
    return category;
  }
}

// ===== FACTORY ADAPTER =====

/**
 * Configuration Factory Adapter
 * Bridges existing factory patterns to Result pattern
 */
export class ConfigurationFactoryAdapter {
  private readonly adapter: LegacyConfigurationAdapter;

  constructor(contextId?: string) {
    this.adapter = new LegacyConfigurationAdapter(contextId);
  }

  /**
   * Create configuration with validation and error handling
   */
  public async createConfiguration(
    key: string,
    overrides?: Partial<UniversalPageConfiguration>
  ): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    // Load base configuration
    const baseResult = await this.adapter.loadConfigurationSafe(key);
    
    if (baseResult.isFailure) {
      return baseResult;
    }

    // Apply overrides if provided
    if (overrides) {
      return this.mergeConfigurations(baseResult.value, overrides, key);
    }

    return baseResult;
  }

  /**
   * Merge configurations with comprehensive error handling
   */
  private mergeConfigurations(
    base: UniversalPageConfiguration,
    overrides: Partial<UniversalPageConfiguration>,
    key: string
  ): ConfigurationResult<UniversalPageConfiguration> {
    try {
      const merged: UniversalPageConfiguration = {
        ...base,
        ...overrides,
        // Ensure required fields are preserved
        category: overrides.category || base.category,
        metadata: {
          ...base.metadata,
          ...overrides.metadata
        },
        filterConfiguration: {
          ...base.filterConfiguration,
          ...overrides.filterConfiguration
        }
      };

      return ConfigurationResultUtils.success(merged);

    } catch (error) {
      const configError = ConfigurationErrorFactory.createMergeError(
        key,
        'overrides',
        'deep-merge',
        [],
        crypto.randomUUID()
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }
}

// ===== REGISTRY BRIDGE =====

/**
 * Registry Bridge for legacy configuration registry compatibility
 */
export class LegacyRegistryBridge implements LegacyConfigurationRegistryCompat {
  private readonly adapter: LegacyConfigurationAdapter;
  private readonly cache: Map<string, UniversalPageConfiguration>;
  private readonly cacheExpiry: Map<string, number>;
  private readonly cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(contextId?: string) {
    this.adapter = new LegacyConfigurationAdapter(contextId);
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Get configuration synchronously (legacy compatibility)
   * @deprecated Use getConfigurationSafe instead
   */
  public getConfiguration(key: string): UniversalPageConfiguration | null {
    console.warn(`[LEGACY-REGISTRY-BRIDGE] getConfiguration(${key}) is deprecated. Use getConfigurationSafe() instead.`);
    
    // Check cache first
    const cached = this.getCachedConfiguration(key);
    if (cached) {
      return cached;
    }

    // Configuration must be preloaded for synchronous access
    console.error(`[LEGACY-REGISTRY-BRIDGE] Configuration "${key}" not preloaded. Use preloadConfiguration() first.`);
    return null;
  }

  /**
   * Get configuration asynchronously with Result pattern
   */
  public async getConfigurationSafe(key: string): Promise<ConfigurationResult<UniversalPageConfiguration>> {
    // Check cache first
    const cached = this.getCachedConfiguration(key);
    if (cached) {
      return ConfigurationResultUtils.success(cached);
    }

    // Load from service
    const result = await this.adapter.loadConfigurationSafe(key);
    
    if (result.isSuccess) {
      this.setCachedConfiguration(key, result.value);
    }
    
    return result;
  }

  /**
   * Get all configurations synchronously (legacy compatibility)
   * @deprecated Use getAllConfigurationsSafe instead
   */
  public getAllConfigurations(): Record<string, UniversalPageConfiguration> {
    console.warn(`[LEGACY-REGISTRY-BRIDGE] getAllConfigurations() is deprecated. Use getAllConfigurationsSafe() instead.`);
    
    const configs: Record<string, UniversalPageConfiguration> = {};
    
    this.cache.forEach((config, key) => {
      if (this.isCacheValid(key)) {
        configs[key] = config;
      }
    });
    
    return configs;
  }

  /**
   * Get all configurations asynchronously with Result pattern
   */
  public async getAllConfigurationsSafe(): Promise<ConfigurationResult<Record<string, UniversalPageConfiguration>>> {
    try {
      const keysResult = await this.adapter.getAvailableKeysSafe();
      
      if (keysResult.isFailure) {
        return ConfigurationResultUtils.failure(keysResult.error);
      }

      const configs: Record<string, UniversalPageConfiguration> = {};
      
      for (const key of keysResult.value) {
        const configResult = await this.getConfigurationSafe(key);
        if (configResult.isSuccess) {
          configs[key] = configResult.value;
        }
      }

      return ConfigurationResultUtils.success(configs);

    } catch (error) {
      const configError = ConfigurationErrorFactory.createLoadError(
        'all-configurations',
        'get-all-configurations-safe',
        error as Error
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }

  /**
   * Preload configuration for synchronous access
   */
  public async preloadConfiguration(key: string): Promise<boolean> {
    const result = await this.adapter.loadConfigurationSafe(key);
    
    if (result.isSuccess) {
      this.setCachedConfiguration(key, result.value);
      return true;
    }
    
    return false;
  }

  // ===== CACHE MANAGEMENT =====

  private getCachedConfiguration(key: string): UniversalPageConfiguration | null {
    if (!this.isCacheValid(key)) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    
    return this.cache.get(key) || null;
  }

  private setCachedConfiguration(key: string, config: UniversalPageConfiguration): void {
    this.cache.set(key, config);
    this.cacheExpiry.set(key, Date.now() + this.cacheTTL);
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry;
  }
}

// ===== SINGLETON ADAPTERS =====

/**
 * Singleton adapter instances for global use
 */
export const legacyConfigurationAdapter = new LegacyConfigurationAdapter();
export const universalPageConfigurationAdapter = new UniversalPageConfigurationAdapter();
export const configurationFactoryAdapter = new ConfigurationFactoryAdapter();
export const legacyRegistryBridge = new LegacyRegistryBridge();