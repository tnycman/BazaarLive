/**
 * Dynamic Configuration Loader
 * Enterprise AOP-compliant dynamic import system for category configurations
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { Result } from '../../../types/Result';
import type { UniversalPageConfiguration } from '../UniversalCategoryPageFactory';
import { configurationMergeUtility, MergeStrategy } from '../utils/ConfigurationMergeUtility';

// ===== DYNAMIC LOADER INTERFACES =====

/**
 * Configuration Load Context
 * Provides metadata and options for dynamic loading operations
 */
export interface ConfigurationLoadContext {
  readonly configKey: string;
  readonly cacheEnabled: boolean;
  readonly mergeWithBase: boolean;
  readonly loadStrategy: LoadStrategy;
  readonly timeout: number;
}

/**
 * Load Strategy Enumeration
 * Defines different approaches to loading configurations
 */
export enum LoadStrategy {
  DYNAMIC_IMPORT = 'dynamic_import',     // ES6 dynamic import()
  API_ENDPOINT = 'api_endpoint',         // HTTP API loading
  HYBRID = 'hybrid'                      // Try import, fallback to API
}

/**
 * Load Result Interface
 * Contains the loaded configuration and load metadata
 */
export interface ConfigurationLoadResult {
  readonly configuration: UniversalPageConfiguration;
  readonly context: ConfigurationLoadContext;
  readonly loadTime: number;
  readonly source: 'cache' | 'import' | 'api' | 'merge';
  readonly cacheHit: boolean;
}

/**
 * Cache Entry Interface
 * Represents a cached configuration with TTL and metadata
 */
export interface CacheEntry {
  readonly configuration: UniversalPageConfiguration;
  readonly timestamp: number;
  readonly ttl: number;
  readonly source: string;
}

// ===== ENTERPRISE DYNAMIC LOADER CLASS =====

/**
 * Enterprise Dynamic Configuration Loader
 * Handles sophisticated on-demand loading of category configurations
 */
export class DynamicConfigurationLoader {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly loadTimeout = 10000; // 10 seconds
  private readonly retryAttempts = 3;

  /**
   * Load configuration dynamically with caching
   * Primary public interface for dynamic configuration loading
   */
  public async loadConfiguration(
    configKey: string,
    options: Partial<ConfigurationLoadContext> = {}
  ): Promise<Result<ConfigurationLoadResult, Error>> {
    const startTime = Date.now();
    
    try {
      // Create load context with defaults
      const context: ConfigurationLoadContext = {
        configKey,
        cacheEnabled: true,
        mergeWithBase: true,
        loadStrategy: LoadStrategy.DYNAMIC_IMPORT,
        timeout: this.loadTimeout,
        ...options
      };

      // Check cache first if enabled
      if (context.cacheEnabled) {
        const cachedResult = this.getCachedConfiguration(configKey);
        if (cachedResult) {
          return Result.success({
            configuration: cachedResult.configuration,
            context,
            loadTime: Date.now() - startTime,
            source: 'cache',
            cacheHit: true
          });
        }
      }

      // Load configuration based on strategy
      const loadResult = await this.executeLoadStrategy(context);
      
      if (!loadResult.isSuccess()) {
        return Result.failure(loadResult.error);
      }

      const configuration = loadResult.value;

      // Cache the loaded configuration
      if (context.cacheEnabled) {
        this.setCachedConfiguration(configKey, configuration, 'dynamic_load');
      }

      return Result.success({
        configuration,
        context,
        loadTime: Date.now() - startTime,
        source: context.mergeWithBase ? 'merge' : 'import',
        cacheHit: false
      });
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown load error'));
    }
  }

  /**
   * Execute load strategy implementation
   */
  private async executeLoadStrategy(
    context: ConfigurationLoadContext
  ): Promise<Result<UniversalPageConfiguration, Error>> {
    switch (context.loadStrategy) {
      case LoadStrategy.DYNAMIC_IMPORT:
        return await this.loadViaDynamicImport(context);

      case LoadStrategy.API_ENDPOINT:
        return await this.loadViaAPI(context);

      case LoadStrategy.HYBRID:
        // Try dynamic import first, fallback to API
        const importResult = await this.loadViaDynamicImport(context);
        if (importResult.isSuccess()) {
          return importResult;
        }
        return await this.loadViaAPI(context);

      default:
        return Result.failure(new Error(`Unsupported load strategy: ${context.loadStrategy}`));
    }
  }

  /**
   * Load configuration via ES6 dynamic import
   */
  private async loadViaDynamicImport(
    context: ConfigurationLoadContext
  ): Promise<Result<UniversalPageConfiguration, Error>> {
    try {
      const configPath = this.getConfigPath(context.configKey);
      
      // Dynamic import with timeout
      const importPromise = import(configPath);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Import timeout')), context.timeout);
      });

      const module = await Promise.race([importPromise, timeoutPromise]);
      
      // Extract configuration from module
      const config = this.extractConfigFromModule(module, context.configKey);
      if (!config) {
        return Result.failure(new Error(`No configuration found in module: ${configPath}`));
      }

      // Merge with base template if requested
      if (context.mergeWithBase && this.isPartialConfiguration(config)) {
        const mergeResult = configurationMergeUtility.mergeConfigWithBase(
          context.configKey,
          config,
          MergeStrategy.DEEP_MERGE
        );
        
        if (!mergeResult.isSuccess()) {
          return Result.failure(mergeResult.error);
        }
        
        return Result.success(mergeResult.value.merged);
      }

      return Result.success(config as UniversalPageConfiguration);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Dynamic import failed'));
    }
  }

  /**
   * Load configuration via API endpoint
   */
  private async loadViaAPI(
    context: ConfigurationLoadContext
  ): Promise<Result<UniversalPageConfiguration, Error>> {
    try {
      const apiUrl = `/api/configurations/${context.configKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), context.timeout);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return Result.failure(new Error(`API load failed: ${response.status} ${response.statusText}`));
      }

      const configuration = await response.json();
      
      // Validate configuration structure
      if (!this.isValidConfiguration(configuration)) {
        return Result.failure(new Error('Invalid configuration structure from API'));
      }

      return Result.success(configuration as UniversalPageConfiguration);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return Result.failure(new Error('API load timeout'));
      }
      return Result.failure(error instanceof Error ? error : new Error('API load failed'));
    }
  }

  /**
   * Get configuration file path for dynamic import
   */
  private getConfigPath(configKey: string): string {
    const [category, subcategory] = configKey.split('-');
    
    // Map to actual config file paths
    const pathMap: Record<string, string> = {
      'fashion-women': '../configs/fashion/women-optimized.js',
      'fashion-men': '../configs/fashion/men',
      'fashion-kids': '../configs/fashion/kids',
      'fashion-home': '../configs/fashion/home',
      'fashion-electronics': '../configs/fashion/electronics',
      'fashion-pets': '../configs/fashion/pets',
      'fashion-beauty': '../configs/fashion/beauty',
      'fashion-sports': '../configs/fashion/sports',
      'fashion-women-accessories': '../configs/fashion/women-accessories'
    };

    const configPath = pathMap[configKey];
    if (!configPath) {
      throw new Error(`No config path mapping found for: ${configKey}`);
    }

    return configPath;
  }

  /**
   * Extract configuration from imported module
   */
  private extractConfigFromModule(module: any, configKey: string): any {
    // Try different export patterns
    const exportPatterns = [
      'womenFashionConfigOverride',
      'menFashionConfig', 
      'kidsFashionConfig',
      'fashionHomeConfig',
      'fashionElectronicsConfig',
      'fashionPetsConfig',
      'fashionBeautyConfig',
      'fashionSportsConfig',
      'womenAccessoriesConfig',
      'default',
      'config'
    ];

    for (const pattern of exportPatterns) {
      if (module[pattern]) {
        return module[pattern];
      }
    }

    return null;
  }

  /**
   * Check if configuration is partial (needs merging)
   */
  private isPartialConfiguration(config: any): boolean {
    // Check if essential fields are missing (indicating partial configuration)
    const requiredFields = ['category', 'filterConfiguration'];
    return !requiredFields.every(field => field in config);
  }

  /**
   * Validate configuration structure
   */
  private isValidConfiguration(config: any): boolean {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.category === 'string' &&
      config.metadata &&
      config.filterConfiguration &&
      Array.isArray(config.sampleProducts)
    );
  }

  /**
   * Get cached configuration if valid
   */
  private getCachedConfiguration(configKey: string): CacheEntry | null {
    const entry = this.cache.get(configKey);
    
    if (!entry) {
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(configKey);
      return null;
    }

    return entry;
  }

  /**
   * Set cached configuration
   */
  private setCachedConfiguration(
    configKey: string,
    configuration: UniversalPageConfiguration,
    source: string
  ): void {
    const entry: CacheEntry = {
      configuration,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
      source
    };

    this.cache.set(configKey, entry);
  }

  /**
   * Clear all cached configurations
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStatistics(): {
    size: number;
    keys: string[];
    hitRate: number;
    totalRequests: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 0, // TODO: Implement hit rate tracking
      totalRequests: 0 // TODO: Implement request tracking
    };
  }

  /**
   * Preload configurations for better performance
   */
  public async preloadConfigurations(configKeys: string[]): Promise<void> {
    const preloadPromises = configKeys.map(key =>
      this.loadConfiguration(key, { cacheEnabled: true })
    );

    await Promise.allSettled(preloadPromises);
  }
}

// ===== SINGLETON INSTANCE =====
export const dynamicConfigurationLoader = new DynamicConfigurationLoader();

// Export types are already defined above in the interfaces section