/**
 * Configuration Registry
 * Enterprise AOP-compliant registry for modular category configurations
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import type { UniversalPageConfiguration } from '../UniversalCategoryPageFactory';

// Fashion category imports
import { womenFashionConfig } from './fashion/women';
import { menFashionConfig } from './fashion/men';
import { kidsFashionConfig } from './fashion/kids';
import { fashionHomeConfig } from './fashion/home';
import { fashionElectronicsConfig } from './fashion/electronics';
import { fashionPetsConfig } from './fashion/pets';
import { fashionBeautyConfig } from './fashion/beauty';
import { fashionSportsConfig } from './fashion/sports';
import { womenAccessoriesConfig } from './fashion/women-accessories';

/**
 * Configuration Registry Interface
 * Defines the contract for configuration registration and retrieval
 */
export interface ConfigurationRegistry {
  readonly getConfiguration: (key: string) => UniversalPageConfiguration | null;
  readonly getAllKeys: () => readonly string[];
  readonly hasConfiguration: (key: string) => boolean;
  readonly getConfigurationCount: () => number;
}

/**
 * Configuration Mapping Table
 * Maps configuration keys to their respective modular configuration objects
 */
const CONFIGURATION_MAP: Record<string, UniversalPageConfiguration> = {
  // Fashion configurations
  'fashion-women': womenFashionConfig,
  'fashion-men': menFashionConfig,
  'fashion-kids': kidsFashionConfig,
  'fashion-home': fashionHomeConfig,
  'fashion-electronics': fashionElectronicsConfig,
  'fashion-pets': fashionPetsConfig,
  'fashion-beauty': fashionBeautyConfig,
  'fashion-sports': fashionSportsConfig,
  'fashion-women-accessories': womenAccessoriesConfig,

  // Placeholder for future configurations
  // 'marketplace-cars': carsMarketplaceConfig,
  // 'marketplace-jobs': jobsMarketplaceConfig,
  // 'electronics-computers': computersElectronicsConfig,
  // 'services-professional': professionalServicesConfig,
} as const;

/**
 * Enterprise Configuration Registry Implementation
 * Provides centralized access to all modular category configurations
 */
class EnterpriseConfigurationRegistry implements ConfigurationRegistry {
  private readonly configurations: Record<string, UniversalPageConfiguration>;
  private readonly configurationKeys: readonly string[];

  constructor() {
    this.configurations = { ...CONFIGURATION_MAP };
    this.configurationKeys = Object.keys(this.configurations);
  }

  /**
   * Get configuration by key
   * Returns null if configuration not found
   */
  public getConfiguration(key: string): UniversalPageConfiguration | null {
    return this.configurations[key] || null;
  }

  /**
   * Get all available configuration keys
   */
  public getAllKeys(): readonly string[] {
    return this.configurationKeys;
  }

  /**
   * Check if configuration exists for given key
   */
  public hasConfiguration(key: string): boolean {
    return key in this.configurations;
  }

  /**
   * Get total number of registered configurations
   */
  public getConfigurationCount(): number {
    return this.configurationKeys.length;
  }

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

/**
 * Configuration Loader Utility Functions
 */
export const ConfigurationLoader = {
  /**
   * Load configuration by key with error handling
   */
  load: (key: string): UniversalPageConfiguration | null => {
    return configurationRegistry.getConfiguration(key);
  },

  /**
   * Load configuration with validation
   */
  loadWithValidation: (key: string): { config: UniversalPageConfiguration | null; error: string | null } => {
    if (!key || typeof key !== 'string') {
      return { config: null, error: 'Invalid configuration key provided' };
    }

    const config = configurationRegistry.getConfiguration(key);
    if (!config) {
      return { config: null, error: `Configuration not found for key: ${key}` };
    }

    return { config, error: null };
  },

  /**
   * Get all available configurations
   */
  loadAll: (): Record<string, UniversalPageConfiguration> => {
    const allConfigs: Record<string, UniversalPageConfiguration> = {};
    
    configurationRegistry.getAllKeys().forEach(key => {
      const config = configurationRegistry.getConfiguration(key);
      if (config) {
        allConfigs[key] = config;
      }
    });

    return allConfigs;
  }
};

/**
 * Export configuration registry and utilities
 */
export { EnterpriseConfigurationRegistry };
export type { UniversalPageConfiguration };