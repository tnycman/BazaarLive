/**
 * Configuration Registry
 * Enterprise AOP-compliant registry for modular category configurations
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import type { UniversalPageConfiguration } from '../UniversalCategoryPageFactory';
import { CONFIG_MANIFEST, type ConfigKey } from './generated/configManifest';
import { dynamicConfigurationLoader, LoadStrategy } from '../loaders/DynamicConfigurationLoader';
import { configurationMetrics } from '../metrics/ConfigurationMetrics';

/**
 * Configuration Registry Interface
 * Defines the contract for configuration registration and retrieval
 */
export interface ConfigurationRegistry {
  readonly getConfiguration: (key: string) => Promise<UniversalPageConfiguration | null>;
  readonly getAllKeys: () => readonly string[];
  readonly hasConfiguration: (key: string) => boolean;
  readonly getConfigurationCount: () => number;
}

/**
 * Configuration Mapping Table
 * Maps configuration keys to their respective modular configuration objects
 */
// Generated manifest is the single source of truth. We keep a small runtime cache.

/**
 * Enterprise Configuration Registry Implementation
 * Provides centralized access to all modular category configurations
 */
let policyOverride: ('dynamic-first' | 'static-first') | null = null;

class EnterpriseConfigurationRegistry implements ConfigurationRegistry {
  private readonly configurationKeys: readonly string[];
  private readonly cache: Map<string, UniversalPageConfiguration> = new Map();

  constructor() {
    this.configurationKeys = Object.keys(CONFIG_MANIFEST);
  }

  /**
   * Get configuration by key using direct mapping
   * HYBRID APPROACH: Simplified direct mapping for reliability
   */
  public async getConfiguration(key: string): Promise<UniversalPageConfiguration | null> {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    const envPolicy = (process.env.CONFIG_RESOLUTION_POLICY as 'dynamic-first' | 'static-first' | undefined)
      || (isDev ? 'dynamic-first' : 'static-first');
    const resolutionPolicy = policyOverride ?? envPolicy;
    if (this.cache.has(key)) {
      const start = performance.now();
      const value = this.cache.get(key)!;
      configurationMetrics.record({ key, pathTried: 'cache', durationMs: performance.now() - start, success: true, timestamp: Date.now() });
      return value;
    }

    const hasManifest = (CONFIG_MANIFEST as Record<string, unknown>)[key] !== undefined;
    const tryManifestLoad = async (): Promise<UniversalPageConfiguration | null> => {
      if (!hasManifest) return null;
      try {
        const start = performance.now();
        const loader = (CONFIG_MANIFEST as Record<string, () => Promise<any>>)[key as ConfigKey];
        const mod = await loader();
        const config = (mod.default || mod) as UniversalPageConfiguration;
        if (config) {
          this.cache.set(key, config);
          configurationMetrics.record({ key, pathTried: 'manifest', durationMs: performance.now() - start, success: true, timestamp: Date.now() });
          return config;
        }
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        console.warn(`[ConfigRegistry] Manifest load failed for ${key}:`, err);
        configurationMetrics.record({ key, pathTried: 'manifest', durationMs: 0, success: false, timestamp: Date.now(), errorMessage: err });
      }
      return null;
    };

    const tryApiLoad = async (): Promise<UniversalPageConfiguration | null> => {
      try {
        const start = performance.now();
        const { unifiedConfigurationAPI } = await import('../enterprise/integration/StrategyPatternIntegration');
        // Hardened API load with retries/backoff via strategy options
        const cfg = await unifiedConfigurationAPI.getConfiguration(key, {
          timeout: 8000,
          retryAttempts: 3,
          fallbackEnabled: true,
          cachingEnabled: true,
          validationRequired: true,
          environment: isDev ? 'development' : 'production'
        });
        configurationMetrics.record({ key, pathTried: 'api', durationMs: performance.now() - start, success: !!cfg, timestamp: Date.now(), errorMessage: cfg ? undefined : 'null' });
        return cfg;
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        console.warn(`[ConfigRegistry] API fallback failed for ${key}:`, err);
        configurationMetrics.record({ key, pathTried: 'api', durationMs: 0, success: false, timestamp: Date.now(), errorMessage: err });
        return null;
      }
    };

    if (resolutionPolicy === 'dynamic-first') {
      const apiCfg = await tryApiLoad();
      if (apiCfg) return apiCfg;
      const manifestCfg = await tryManifestLoad();
      if (manifestCfg) return manifestCfg;
      return null;
    }

    // static-first
    const manifestCfg = await tryManifestLoad();
    if (manifestCfg) return manifestCfg;
    const apiCfg = await tryApiLoad();
    if (apiCfg) return apiCfg;
    return null;
  }

  /** DEV-ONLY: Clear in-memory configuration cache */
  public __clearCache(): void {
    this.cache.clear();
  }

  /** DEV-ONLY: Get current resolution policy (with override if set) */
  public __getResolutionPolicy(): 'dynamic-first' | 'static-first' {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    const envPolicy = (process.env.CONFIG_RESOLUTION_POLICY as 'dynamic-first' | 'static-first' | undefined)
      || (isDev ? 'dynamic-first' : 'static-first');
    return policyOverride ?? envPolicy;
  }

  /** DEV-ONLY: Override resolution policy at runtime */
  public __setResolutionPolicyOverride(policy: 'dynamic-first' | 'static-first' | null): void {
    policyOverride = policy;
  }

  /**
   * Get all available configuration keys
   */
  public getAllKeys(): readonly string[] { return this.configurationKeys; }

  /**
   * Check if configuration exists for given key
   */
  public hasConfiguration(key: string): boolean { return (CONFIG_MANIFEST as Record<string, unknown>)[key] !== undefined; }

  /**
   * Get total number of registered configurations
   */
  public getConfigurationCount(): number { return this.configurationKeys.length; }

  /**
   * Get configuration statistics
   */
  public getStatistics() {
    const categoryStats: Record<string, number> = {};
    
    this.configurationKeys.forEach(key => {
      const category = key.split('-')[0];
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    return {
      totalConfigurations: this.configurationKeys.length,
      categoryBreakdown: categoryStats,
      availableKeys: this.configurationKeys
    };
  }
}

/**
 * Singleton Configuration Registry Instance
 * Single source of truth for all category configurations
 */
export const configurationRegistry = new EnterpriseConfigurationRegistry();
// Start periodic dev reporter (no-op in production)
configurationMetrics.startDevReporter(60000);

/**
 * Configuration Loader Utility Functions
 */
export const ConfigurationLoader = {
  /**
   * Load configuration by key with error handling
   */
  load: async (key: string): Promise<UniversalPageConfiguration | null> => {
    return await configurationRegistry.getConfiguration(key);
  },

  /**
   * Load configuration with validation
   */
  loadWithValidation: async (key: string): Promise<{ config: UniversalPageConfiguration | null; error: string | null }> => {
    if (!key || typeof key !== 'string') {
      return { config: null, error: 'Invalid configuration key provided' };
    }

    const config = await configurationRegistry.getConfiguration(key);
    if (!config) {
      return { config: null, error: `Configuration not found for key: ${key}` };
    }

    return { config, error: null };
  },

  /**
   * Get all available configurations
   */
  loadAll: async (): Promise<Record<string, UniversalPageConfiguration>> => {
    const allConfigs: Record<string, UniversalPageConfiguration> = {};
    
    const keys = configurationRegistry.getAllKeys();
    for (const key of keys) {
      const config = await configurationRegistry.getConfiguration(key);
      if (config) {
        allConfigs[key] = config;
      }
    }

    return allConfigs;
  }
};

/**
 * Export configuration registry and utilities
 */
export { EnterpriseConfigurationRegistry };
export type { UniversalPageConfiguration };