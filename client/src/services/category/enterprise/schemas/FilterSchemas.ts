/**
 * Enterprise Filter Schemas
 * Comprehensive type-safe schemas for all filtering operations
 * Zero shortcuts, complete validation coverage
 */

import { z } from 'zod';
import { 
  FilterTypeSchema, 
  FilterOptionSchema,
  ConditionTypeSchema,
  AvailabilityTypeSchema,
  ColorTypeSchema 
} from './ConfigurationSchemas';

// ===== FILTER STATE SCHEMAS =====

export const FilterStateSchema = z.object({
  selectedSubcategories: z.array(z.string()).default([]),
  selectedSizes: z.array(z.string()).default([]),
  selectedBrands: z.array(z.string()).default([]),
  selectedColors: z.array(ColorTypeSchema).default([]),
  selectedConditions: z.array(ConditionTypeSchema).default([]),
  selectedAvailability: z.array(AvailabilityTypeSchema).default([]),
  selectedPrices: z.array(z.string()).default([]),
  priceRange: z.object({
    min: z.number().min(0).default(0),
    max: z.number().min(0).default(1000)
  }).optional(),
  searchTerm: z.string().default(''),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).default('newest'),
  viewMode: z.enum(['grid', 'list']).default('grid'),
  itemsPerPage: z.number().int().min(1).max(100).default(20),
  currentPage: z.number().int().min(1).default(1)
});

// ===== FILTER CRITERIA SCHEMAS =====

export const FilterCriteriaSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  filters: FilterStateSchema,
  appliedAt: z.string().datetime(),
  userId: z.string().optional(),
  sessionId: z.string().optional()
});

// ===== FILTER RESULT SCHEMAS =====

export const FilterResultSchema = z.object({
  totalItems: z.number().int().min(0),
  filteredItems: z.number().int().min(0),
  currentPage: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  appliedFilters: FilterStateSchema,
  filterExecutionTime: z.number().min(0),
  cacheHit: z.boolean(),
  resultQuality: z.enum(['excellent', 'good', 'fair', 'poor']).default('good')
});

// ===== FILTER VALIDATION SCHEMAS =====

export const FilterValidationContextSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.unknown(),
  filterType: FilterTypeSchema,
  validationRules: z.array(z.string()),
  strictValidation: z.boolean().default(true),
  allowEmpty: z.boolean().default(false)
});

export const FilterValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  sanitizedValue: z.unknown().optional(),
  validationContext: FilterValidationContextSchema
});

// ===== SIZE FILTER SCHEMAS =====

export const SizeFilterSchema = z.object({
  category: z.enum(['women', 'men', 'kids', 'unisex']),
  sizeType: z.enum(['clothing', 'shoes', 'accessories']),
  availableSizes: z.array(z.object({
    id: z.string().min(1),
    display: z.string().min(1),
    order: z.number().int().min(0),
    international: z.record(z.string(), z.string()).optional()
  })),
  sizeChart: z.object({
    measurements: z.record(z.string(), z.object({
      unit: z.enum(['inches', 'cm']),
      ranges: z.record(z.string(), z.object({
        min: z.number().min(0),
        max: z.number().min(0)
      }))
    }))
  }).optional()
});

// ===== BRAND FILTER SCHEMAS =====

export const BrandFilterSchema = z.object({
  brands: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: z.string().min(1),
    tier: z.enum(['luxury', 'premium', 'mid-range', 'budget']),
    popularity: z.number().min(0).max(100),
    itemCount: z.number().int().min(0),
    verified: z.boolean().default(false),
    logo: z.string().url().optional()
  })),
  featuredBrands: z.array(z.string()),
  brandCategories: z.record(z.string(), z.array(z.string()))
});

// ===== PRICE FILTER SCHEMAS =====

export const PriceFilterSchema = z.object({
  currency: z.string().length(3).default('USD'),
  ranges: z.array(z.object({
    id: z.string().min(1),
    display: z.string().min(1),
    min: z.number().min(0),
    max: z.number().min(0),
    popular: z.boolean().default(false)
  })),
  customRange: z.object({
    enabled: z.boolean().default(true),
    min: z.number().min(0).default(0),
    max: z.number().min(0).default(10000),
    step: z.number().min(1).default(5)
  }),
  discountFilters: z.object({
    onSale: z.boolean().default(false),
    minDiscountPercent: z.number().min(0).max(100).optional()
  }).optional()
});

// ===== CONDITION FILTER SCHEMAS =====

export const ConditionFilterSchema = z.object({
  conditions: z.array(z.object({
    type: ConditionTypeSchema,
    display: z.string().min(1),
    description: z.string().min(1),
    qualityScore: z.number().min(0).max(100),
    priceImpact: z.number().min(-50).max(0), // Percentage impact on price
    popular: z.boolean().default(false)
  })),
  qualityThresholds: z.object({
    excellent: z.number().min(90).max(100),
    good: z.number().min(70).max(89),
    fair: z.number().min(50).max(69),
    poor: z.number().min(0).max(49)
  })
});

// ===== ADVANCED FILTER SCHEMAS =====

export const AdvancedFilterSchema = z.object({
  dateFilters: z.object({
    listed: z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    }).optional(),
    updated: z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    }).optional()
  }).optional(),
  sellerFilters: z.object({
    verifiedOnly: z.boolean().default(false),
    minRating: z.number().min(0).max(5).optional(),
    minSales: z.number().int().min(0).optional(),
    location: z.array(z.string()).default([])
  }).optional(),
  itemFilters: z.object({
    hasImages: z.boolean().default(false),
    minImages: z.number().int().min(1).optional(),
    hasDescription: z.boolean().default(false),
    minDescriptionLength: z.number().int().min(10).optional(),
    hasMeasurements: z.boolean().default(false)
  }).optional(),
  socialFilters: z.object({
    minLikes: z.number().int().min(0).optional(),
    minComments: z.number().int().min(0).optional(),
    trending: z.boolean().default(false),
    recentlyViewed: z.boolean().default(false)
  }).optional()
});

// ===== FILTER PERFORMANCE SCHEMAS =====

export const FilterPerformanceSchema = z.object({
  executionTime: z.number().min(0),
  cacheHitRate: z.number().min(0).max(100),
  resultsCount: z.number().int().min(0),
  filterComplexity: z.enum(['simple', 'moderate', 'complex', 'very-complex']),
  indexUsage: z.array(z.string()),
  optimizationSuggestions: z.array(z.string()).default([])
});

// ===== TYPE EXPORTS =====

export type FilterState = z.infer<typeof FilterStateSchema>;
export type FilterCriteria = z.infer<typeof FilterCriteriaSchema>;
export type FilterResult = z.infer<typeof FilterResultSchema>;
export type FilterValidationContext = z.infer<typeof FilterValidationContextSchema>;
export type FilterValidationResult = z.infer<typeof FilterValidationResultSchema>;
export type SizeFilter = z.infer<typeof SizeFilterSchema>;
export type BrandFilter = z.infer<typeof BrandFilterSchema>;
export type PriceFilter = z.infer<typeof PriceFilterSchema>;
export type ConditionFilter = z.infer<typeof ConditionFilterSchema>;
export type AdvancedFilter = z.infer<typeof AdvancedFilterSchema>;
export type FilterPerformance = z.infer<typeof FilterPerformanceSchema>;

// ===== FILTER SCHEMA UTILITIES =====

export const FilterSchemaValidation = {
  /**
   * Validate complete filter state
   */
  validateFilterState: (state: unknown): { isValid: boolean; errors: string[] } => {
    const result = FilterStateSchema.safeParse(state);
    
    if (result.success) {
      return { isValid: true, errors: [] };
    }
    
    const errors = result.error.errors.map(err => 
      `Filter state validation error - ${err.path.join('.')}: ${err.message}`
    );
    
    return { isValid: false, errors };
  },

  /**
   * Validate filter criteria
   */
  validateFilterCriteria: (criteria: unknown): { isValid: boolean; errors: string[] } => {
    const result = FilterCriteriaSchema.safeParse(criteria);
    
    if (result.success) {
      return { isValid: true, errors: [] };
    }
    
    const errors = result.error.errors.map(err => 
      `Filter criteria validation error - ${err.path.join('.')}: ${err.message}`
    );
    
    return { isValid: false, errors };
  },

  /**
   * Validate filter performance metrics
   */
  validateFilterPerformance: (performance: unknown): { isValid: boolean; errors: string[] } => {
    const result = FilterPerformanceSchema.safeParse(performance);
    
    if (result.success) {
      return { isValid: true, errors: [] };
    }
    
    const errors = result.error.errors.map(err => 
      `Filter performance validation error - ${err.path.join('.')}: ${err.message}`
    );
    
    return { isValid: false, errors };
  }
};