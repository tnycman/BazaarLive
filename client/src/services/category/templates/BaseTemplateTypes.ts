/**
 * Base Template Type Definitions
 * Enterprise AOP-compliant base templates for category configuration optimization
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { z } from 'zod';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// ===== CORE BASE INTERFACES =====

/**
 * Base Category Metadata Template
 * Common metadata structure shared across all categories
 */
export interface BaseCategoryMetadata {
  readonly title: string;
  readonly description: string;
  readonly gradient: string;
  readonly placeholder: string;
  readonly icon?: string;
  readonly seoKeywords?: readonly string[];
}

/**
 * Base Filter Configuration Template
 * Common filter structure with category-specific extensions
 */
export interface BaseFilterConfiguration {
  readonly availableFilters: readonly string[];
  readonly defaultFilters: Record<string, any>;
  readonly filterValidationRules: Record<string, z.ZodSchema>;
}

/**
 * Base Product Schema Template
 * Universal product structure used across all categories
 */
export interface BaseProductSchema {
  readonly id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: string;
  readonly originalPrice?: string;
  readonly size?: string;
  readonly images: readonly string[];
  readonly seller: {
    readonly id: string;
    readonly username: string;
    readonly avatar: string;
  };
  readonly stats: {
    readonly likes: number;
    readonly comments: number;
    readonly shares: number;
  };
  readonly condition: 'new_with_tags' | 'excellent' | 'new_without_tags' | 'good' | 'fair';
  readonly isLiked: boolean;
  readonly createdAt: string;
}

/**
 * Base Category Configuration Template
 * Root template that all specific categories extend
 */
export interface BaseCategoryConfiguration {
  readonly category: string;
  readonly subcategory?: string;
  readonly subSubcategory?: string;
  readonly metadata: BaseCategoryMetadata;
  readonly filterConfiguration: BaseFilterConfiguration;
  readonly sampleProducts: readonly BaseProductSchema[];
}

// ===== SPECIALIZED BASE TEMPLATES =====

/**
 * Fashion Category Base Template
 * Specialized base for all fashion-related categories
 */
export interface FashionCategoryBase extends BaseCategoryConfiguration {
  readonly category: 'fashion';
  readonly filterConfiguration: BaseFilterConfiguration & {
    readonly categorySpecificFilters: readonly FashionFilter[];
  };
}

/**
 * Fashion Filter Structure
 * Common filter types for fashion categories
 */
export interface FashionFilter {
  readonly id: string;
  readonly name: string;
  readonly type: 'checkbox' | 'select' | 'range' | 'search';
  readonly options?: readonly FilterOption[];
  readonly validation: z.ZodSchema;
}

/**
 * Marketplace Category Base Template
 * Specialized base for marketplace verticals (cars, jobs, real estate)
 */
export interface MarketplaceCategoryBase extends BaseCategoryConfiguration {
  readonly category: string; // varies: 'cars', 'jobs', 'real-estate', etc.
  readonly filterConfiguration: BaseFilterConfiguration & {
    readonly categorySpecificFilters: readonly MarketplaceFilter[];
  };
}

/**
 * Marketplace Filter Structure
 * Common filter types for marketplace categories
 */
export interface MarketplaceFilter {
  readonly id: string;
  readonly name: string;
  readonly type: 'checkbox' | 'select' | 'range' | 'search' | 'location';
  readonly options?: readonly FilterOption[];
  readonly validation: z.ZodSchema;
}

/**
 * Electronics Category Base Template
 * Specialized base for technology and electronics categories
 */
export interface ElectronicsCategoryBase extends BaseCategoryConfiguration {
  readonly filterConfiguration: BaseFilterConfiguration & {
    readonly categorySpecificFilters: readonly ElectronicsFilter[];
  };
}

/**
 * Electronics Filter Structure
 * Common filter types for electronics categories
 */
export interface ElectronicsFilter {
  readonly id: string;
  readonly name: string;
  readonly type: 'checkbox' | 'select' | 'range' | 'search';
  readonly options?: readonly FilterOption[];
  readonly validation: z.ZodSchema;
}

/**
 * Services Category Base Template
 * Specialized base for service-based categories
 */
export interface ServicesCategoryBase extends BaseCategoryConfiguration {
  readonly filterConfiguration: BaseFilterConfiguration & {
    readonly categorySpecificFilters: readonly ServicesFilter[];
  };
}

/**
 * Services Filter Structure
 * Common filter types for service categories
 */
export interface ServicesFilter {
  readonly id: string;
  readonly name: string;
  readonly type: 'checkbox' | 'select' | 'range' | 'search' | 'location' | 'availability';
  readonly options?: readonly FilterOption[];
  readonly validation: z.ZodSchema;
}

// ===== COMMON SUPPORTING TYPES =====

/**
 * Filter Option Template
 * Common structure for filter options across all categories
 */
export interface FilterOption {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
  readonly subcategories?: readonly FilterOption[];
}

/**
 * Size Configuration Template
 * Standardized size configurations for different category types
 */
export interface SizeConfiguration {
  readonly type: 'clothing' | 'shoes' | 'accessories' | 'numeric' | 'universal';
  readonly options: readonly FilterOption[];
}

/**
 * Brand Configuration Template
 * Standardized brand configurations for different category types
 */
export interface BrandConfiguration {
  readonly featured: readonly string[];
  readonly categories: readonly string[];
  readonly luxury: readonly string[];
  readonly mainstream: readonly string[];
}

// ===== VALIDATION SCHEMAS =====

/**
 * Base Category Metadata Validation Schema
 */
export const BaseCategoryMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  gradient: z.string().min(1),
  placeholder: z.string().min(1),
  icon: z.string().optional(),
  seoKeywords: z.array(z.string()).optional()
});

/**
 * Base Filter Configuration Validation Schema
 */
export const BaseFilterConfigurationSchema = z.object({
  availableFilters: z.array(z.string()),
  defaultFilters: z.record(z.any()),
  filterValidationRules: z.record(z.any())
});

/**
 * Base Product Schema Validation Schema
 */
export const BaseProductSchemaValidation = z.object({
  id: z.string(),
  title: z.string(),
  brand: z.string(),
  price: z.string(),
  originalPrice: z.string().optional(),
  size: z.string().optional(),
  images: z.array(z.string()),
  seller: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string()
  }),
  stats: z.object({
    likes: z.number(),
    comments: z.number(),
    shares: z.number()
  }),
  condition: z.enum(['new_with_tags', 'excellent', 'new_without_tags', 'good', 'fair']),
  isLiked: z.boolean(),
  createdAt: z.string()
});

/**
 * Base Category Configuration Validation Schema
 */
export const BaseCategoryConfigurationSchema = z.object({
  category: z.string(),
  subcategory: z.string().optional(),
  subSubcategory: z.string().optional(),
  metadata: BaseCategoryMetadataSchema,
  filterConfiguration: BaseFilterConfigurationSchema,
  sampleProducts: z.array(BaseProductSchemaValidation)
});

// ===== TEMPLATE DEFAULTS =====

/**
 * Default Filter Configuration
 * Common default filters used across most categories
 */
export const DEFAULT_FILTER_CONFIGURATION: BaseFilterConfiguration = {
  availableFilters: ['brand', 'color', 'price', 'condition', 'availability'],
  defaultFilters: {
    condition: ['new_with_tags', 'excellent'],
    availability: ['all-items']
  },
  filterValidationRules: {
    brand: z.array(z.string()),
    color: z.array(z.string()),
    price: z.array(z.string()),
    condition: z.array(z.string()),
    availability: z.array(z.string())
  }
};

/**
 * Default Fashion Filter Configuration
 * Fashion-specific default filters extending base configuration
 */
export const DEFAULT_FASHION_FILTER_CONFIGURATION: BaseFilterConfiguration = {
  ...DEFAULT_FILTER_CONFIGURATION,
  availableFilters: [
    ...DEFAULT_FILTER_CONFIGURATION.availableFilters,
    'size', 'style', 'season'
  ],
  filterValidationRules: {
    ...DEFAULT_FILTER_CONFIGURATION.filterValidationRules,
    size: z.array(z.string()),
    style: z.array(z.string()),
    season: z.array(z.string())
  }
};

/**
 * Default Marketplace Filter Configuration
 * Marketplace-specific default filters extending base configuration
 */
export const DEFAULT_MARKETPLACE_FILTER_CONFIGURATION: BaseFilterConfiguration = {
  ...DEFAULT_FILTER_CONFIGURATION,
  availableFilters: [
    ...DEFAULT_FILTER_CONFIGURATION.availableFilters,
    'location', 'year', 'mileage'
  ],
  filterValidationRules: {
    ...DEFAULT_FILTER_CONFIGURATION.filterValidationRules,
    location: z.array(z.string()),
    year: z.array(z.string()),
    mileage: z.array(z.string())
  }
};

// ===== TYPE EXPORTS =====
// Types already exported via interface declarations above