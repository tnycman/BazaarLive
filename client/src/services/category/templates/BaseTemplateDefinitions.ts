/**
 * Base Template Definitions
 * Enterprise AOP-compliant base configurations that categories extend from
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { z } from 'zod';
import type { 
  BaseCategoryConfiguration, 
  FashionCategoryBase,
  MarketplaceCategoryBase,
  ElectronicsCategoryBase,
  ServicesCategoryBase,
  FashionFilter,
  FilterOption
} from './BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../UniversalCategoryPageFactory';

// ===== FASHION CATEGORY BASE TEMPLATE =====
export const FASHION_CATEGORY_BASE_TEMPLATE: Partial<UniversalPageConfiguration> = {
  category: 'fashion',
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      size: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    },
    categorySpecificFilters: []
  }
};

// ===== MARKETPLACE CATEGORY BASE TEMPLATE =====
export const MARKETPLACE_CATEGORY_BASE_TEMPLATE: Partial<UniversalPageConfiguration> = {
  filterConfiguration: {
    availableFilters: ['location', 'price', 'condition', 'availability', 'date-posted'],
    defaultFilters: {
      condition: ['excellent', 'good'],
      availability: ['all-items']
    },
    filterValidationRules: {
      location: z.array(z.string()),
      price: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }),
      'date-posted': z.string()
    },
    categorySpecificFilters: []
  }
};

// ===== ELECTRONICS CATEGORY BASE TEMPLATE =====
export const ELECTRONICS_CATEGORY_BASE_TEMPLATE: Partial<UniversalPageConfiguration> = {
  filterConfiguration: {
    availableFilters: ['device-type', 'brand', 'condition', 'price', 'availability', 'tech-specs'],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'device-type': z.array(z.string()),
      brand: z.array(z.string()),
      'tech-specs': z.array(z.string())
    },
    categorySpecificFilters: []
  }
};

// ===== SERVICES CATEGORY BASE TEMPLATE =====
export const SERVICES_CATEGORY_BASE_TEMPLATE: Partial<UniversalPageConfiguration> = {
  filterConfiguration: {
    availableFilters: ['service-type', 'location', 'price-range', 'availability', 'rating'],
    defaultFilters: {
      availability: ['all-services'],
      rating: ['4-plus']
    },
    filterValidationRules: {
      'service-type': z.array(z.string()),
      location: z.array(z.string()),
      'price-range': z.object({
        min: z.number().optional(),
        max: z.number().optional()
      })
    },
    categorySpecificFilters: []
  }
};

// ===== BASE TEMPLATE REGISTRY =====
export const BASE_TEMPLATE_REGISTRY = {
  'fashion': FASHION_CATEGORY_BASE_TEMPLATE,
  'marketplace': MARKETPLACE_CATEGORY_BASE_TEMPLATE,
  'electronics': ELECTRONICS_CATEGORY_BASE_TEMPLATE,
  'services': SERVICES_CATEGORY_BASE_TEMPLATE
} as const;

// ===== BASE TEMPLATE UTILITIES =====

/**
 * Get base template by category type
 */
export function getBaseTemplate(category: string): Partial<UniversalPageConfiguration> | null {
  return BASE_TEMPLATE_REGISTRY[category as keyof typeof BASE_TEMPLATE_REGISTRY] || null;
}

/**
 * Get base template key from configuration key
 */
export function extractBaseTemplateKey(configKey: string): string {
  return configKey.split('-')[0];
}

/**
 * Validate base template compatibility
 */
export function validateBaseTemplateCompatibility(
  configKey: string, 
  override: Partial<UniversalPageConfiguration>
): { isCompatible: boolean; errors: string[] } {
  const baseTemplateKey = extractBaseTemplateKey(configKey);
  const baseTemplate = getBaseTemplate(baseTemplateKey);
  
  if (!baseTemplate) {
    return {
      isCompatible: false,
      errors: [`No base template found for category: ${baseTemplateKey}`]
    };
  }

  const errors: string[] = [];
  
  // Validate category consistency
  if (override.category && override.category !== baseTemplateKey) {
    errors.push(`Category mismatch: override has '${override.category}', expected '${baseTemplateKey}'`);
  }

  return {
    isCompatible: errors.length === 0,
    errors
  };
}

// ===== TYPE EXPORTS =====
export type BaseTemplateKey = keyof typeof BASE_TEMPLATE_REGISTRY;