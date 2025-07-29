/**
 * Dynamic Configuration API Routes
 * Enterprise AOP-compliant API endpoints for dynamic configuration loading
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = Router();

// ===== CONFIGURATION API SCHEMAS =====

const ConfigurationRequestSchema = z.object({
  configKey: z.string().min(1),
  includeMetadata: z.boolean().optional().default(false),
  cacheEnabled: z.boolean().optional().default(true)
});

const ConfigurationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    configuration: z.any(),
    metadata: z.object({
      loadTime: z.number(),
      source: z.enum(['cache', 'file', 'fallback']),
      timestamp: z.number()
    }).optional()
  }).optional(),
  error: z.string().optional()
});

// ===== DYNAMIC CONFIGURATION MAPPING =====

const CONFIGURATION_FILE_MAP: Record<string, any> = {
  'fashion-women': () => import('../../client/src/services/category/configs/fashion/women-optimized'),
  'fashion-men': () => import('../../client/src/services/category/configs/fashion/men'),
  'fashion-kids': () => import('../../client/src/services/category/configs/fashion/kids'),
  'fashion-home': () => import('../../client/src/services/category/configs/fashion/home'),
  'fashion-electronics': () => import('../../client/src/services/category/configs/fashion/electronics'),
  'fashion-pets': () => import('../../client/src/services/category/configs/fashion/pets'),
  'fashion-beauty': () => import('../../client/src/services/category/configs/fashion/beauty'),
  'fashion-sports': () => import('../../client/src/services/category/configs/fashion/sports'),
  'fashion-women-accessories': () => import('../../client/src/services/category/configs/fashion/women-accessories')
};

const FALLBACK_CONFIGURATIONS: Record<string, any> = {
  'fashion-women': {
    category: 'fashion',
    metadata: {
      title: 'Women\'s Fashion',
      description: 'Discover women\'s fashion and accessories',
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      placeholder: 'Search women\'s fashion...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition'],
      categorySpecificFilters: [],
      defaultFilters: {},
      filterValidationRules: {}
    },
    sampleProducts: []
  }
};

// ===== CONFIGURATION CACHE =====

interface CacheEntry {
  configuration: any;
  timestamp: number;
  ttl: number;
}

const configurationCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ===== API ENDPOINTS =====

/**
 * GET /api/configurations/:configKey
 * Load specific configuration dynamically
 */
router.get('/configurations/:configKey', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { configKey } = req.params;
    const query = ConfigurationRequestSchema.parse(req.query);

    // Validate configuration key
    if (!CONFIGURATION_FILE_MAP[configKey] && !FALLBACK_CONFIGURATIONS[configKey]) {
      return res.status(404).json({
        success: false,
        error: `Configuration not found: ${configKey}`
      });
    }

    let configuration: any = null;
    let source: 'cache' | 'file' | 'fallback' = 'file';

    // Check cache first
    if (query.cacheEnabled) {
      const cached = getCachedConfiguration(configKey);
      if (cached) {
        configuration = cached.configuration;
        source = 'cache';
      }
    }

    // Load from file if not cached
    if (!configuration) {
      try {
        if (CONFIGURATION_FILE_MAP[configKey]) {
          const module = await CONFIGURATION_FILE_MAP[configKey]();
          configuration = extractConfigFromModule(module, configKey);
          
          if (configuration && query.cacheEnabled) {
            setCachedConfiguration(configKey, configuration);
          }
        }
      } catch (error) {
        console.warn(`Failed to load configuration ${configKey}:`, error);
      }
    }

    // Fallback to static configuration
    if (!configuration && FALLBACK_CONFIGURATIONS[configKey]) {
      configuration = FALLBACK_CONFIGURATIONS[configKey];
      source = 'fallback';
    }

    if (!configuration) {
      return res.status(500).json({
        success: false,
        error: `Failed to load configuration: ${configKey}`
      });
    }

    const response: any = {
      success: true,
      data: {
        configuration
      }
    };

    // Include metadata if requested
    if (query.includeMetadata) {
      response.data.metadata = {
        loadTime: Date.now() - startTime,
        source,
        timestamp: Date.now()
      };
    }

    res.json(ConfigurationResponseSchema.parse(response));
  } catch (error) {
    console.error('Configuration API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/configurations
 * List all available configurations
 */
router.get('/configurations', (req, res) => {
  try {
    const availableConfigs = Object.keys(CONFIGURATION_FILE_MAP);
    const fallbackConfigs = Object.keys(FALLBACK_CONFIGURATIONS);
    
    res.json({
      success: true,
      data: {
        available: availableConfigs,
        fallbacks: fallbackConfigs,
        total: availableConfigs.length,
        cache: {
          size: configurationCache.size,
          keys: Array.from(configurationCache.keys())
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/configurations/preload
 * Preload multiple configurations for performance
 */
router.post('/configurations/preload', async (req, res) => {
  try {
    const { configKeys } = z.object({
      configKeys: z.array(z.string())
    }).parse(req.body);

    const results: Record<string, { success: boolean; error?: string }> = {};
    
    for (const configKey of configKeys) {
      try {
        if (CONFIGURATION_FILE_MAP[configKey]) {
          const module = await CONFIGURATION_FILE_MAP[configKey]();
          const configuration = extractConfigFromModule(module, configKey);
          
          if (configuration) {
            setCachedConfiguration(configKey, configuration);
            results[configKey] = { success: true };
          } else {
            results[configKey] = { success: false, error: 'Configuration not found in module' };
          }
        } else {
          results[configKey] = { success: false, error: 'Configuration mapping not found' };
        }
      } catch (error) {
        results[configKey] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    res.json({
      success: true,
      data: {
        results,
        cached: configKeys.filter(key => results[key].success).length,
        failed: configKeys.filter(key => !results[key].success).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/configurations/cache
 * Clear configuration cache
 */
router.delete('/configurations/cache', (req, res) => {
  try {
    const clearedCount = configurationCache.size;
    configurationCache.clear();
    
    res.json({
      success: true,
      data: {
        message: 'Cache cleared successfully',
        clearedEntries: clearedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== UTILITY FUNCTIONS =====

function getCachedConfiguration(configKey: string): CacheEntry | null {
  const entry = configurationCache.get(configKey);
  
  if (!entry) {
    return null;
  }

  // Check TTL
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    configurationCache.delete(configKey);
    return null;
  }

  return entry;
}

function setCachedConfiguration(configKey: string, configuration: any): void {
  const entry: CacheEntry = {
    configuration,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  };

  configurationCache.set(configKey, entry);
}

function extractConfigFromModule(module: any, configKey: string): any {
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

export default router;