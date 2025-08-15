/**
 * Filter State Validation Utilities
 * Enterprise-grade validation with comprehensive error handling and sanitization
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { z } from 'zod';
import type { 
  FilterState, 
  FilterStateUpdate, 
  FilterStateValidationResult 
} from './FilterStateManager';

// ===== VALIDATION CONSTANTS =====

const VALIDATION_CONSTANTS = {
  MAX_ID_LENGTH: 100,
  MAX_SEARCH_QUERY_LENGTH: 200,
  MAX_ARRAY_LENGTH: 100,
  MAX_PRICE: 100000,
  MIN_PRICE: 0,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_NUMBER: 10000,
  MIN_PAGE_NUMBER: 1,
} as const;

// ===== VALIDATION SCHEMAS =====

/**
 * Comprehensive filter state validation schema
 */
export const FilterStateValidationSchema = z.object({
  selectedCategories: z.array(
    z.string()
      .min(1, 'Category ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Category ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Category ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected categories`),
  
  selectedBrands: z.array(
    z.string()
      .min(1, 'Brand ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Brand ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Brand ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected brands`),
  
  selectedSizes: z.array(
    z.string()
      .min(1, 'Size ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Size ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Size ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected sizes`),
  
  selectedColors: z.array(
    z.string()
      .min(1, 'Color ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Color ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Color ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected colors`),
  
  selectedPrices: z.array(
    z.string()
      .min(1, 'Price ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Price ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Price ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected prices`),
  
  selectedAvailability: z.array(
    z.string()
      .min(1, 'Availability ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Availability ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Availability ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected availability options`),
  
  selectedTypes: z.array(
    z.string()
      .min(1, 'Type ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Type ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Type ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected types`),
  
  brandSearchQuery: z.string()
    .max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH, `Brand search query must be ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters or less`)
    .trim(),
  
  expandedSections: z.array(
    z.string()
      .min(1, 'Section ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Section ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Section ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} expanded sections`),
  
  priceRange: z.object({
    min: z.number()
      .min(VALIDATION_CONSTANTS.MIN_PRICE, `Minimum price must be at least ${VALIDATION_CONSTANTS.MIN_PRICE}`)
      .max(VALIDATION_CONSTANTS.MAX_PRICE, `Minimum price cannot exceed ${VALIDATION_CONSTANTS.MAX_PRICE}`)
      .optional(),
    max: z.number()
      .min(VALIDATION_CONSTANTS.MIN_PRICE, `Maximum price must be at least ${VALIDATION_CONSTANTS.MIN_PRICE}`)
      .max(VALIDATION_CONSTANTS.MAX_PRICE, `Maximum price cannot exceed ${VALIDATION_CONSTANTS.MAX_PRICE}`)
      .optional(),
  }).optional().refine((data) => {
    if (data?.min !== undefined && data?.max !== undefined) {
      return data.min <= data.max;
    }
    return true;
  }, {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['priceRange'],
  }),
  
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating'], {
    errorMap: () => ({ message: 'Sort by must be one of: newest, price-low, price-high, popular, rating' })
  }),
  
  viewMode: z.enum(['grid', 'list'], {
    errorMap: () => ({ message: 'View mode must be grid or list' })
  }),
  
  itemsPerPage: z.number()
    .int('Items per page must be an integer')
    .min(VALIDATION_CONSTANTS.MIN_PAGE_SIZE, `Items per page must be at least ${VALIDATION_CONSTANTS.MIN_PAGE_SIZE}`)
    .max(VALIDATION_CONSTANTS.MAX_PAGE_SIZE, `Items per page cannot exceed ${VALIDATION_CONSTANTS.MAX_PAGE_SIZE}`),
  
  currentPage: z.number()
    .int('Current page must be an integer')
    .min(VALIDATION_CONSTANTS.MIN_PAGE_NUMBER, `Current page must be at least ${VALIDATION_CONSTANTS.MIN_PAGE_NUMBER}`)
    .max(VALIDATION_CONSTANTS.MAX_PAGE_NUMBER, `Current page cannot exceed ${VALIDATION_CONSTANTS.MAX_PAGE_NUMBER}`),
  
  searchQuery: z.string()
    .max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH, `Search query must be ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters or less`)
    .trim(),
  
  lastUpdated: z.number()
    .int('Last updated timestamp must be an integer')
    .min(0, 'Last updated timestamp must be positive'),
});

/**
 * Filter state update validation schema
 */
export const FilterStateUpdateValidationSchema = z.object({
  selectedCategories: z.array(
    z.string()
      .min(1, 'Category ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Category ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Category ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected categories`).optional(),
  
  selectedBrands: z.array(
    z.string()
      .min(1, 'Brand ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Brand ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Brand ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected brands`).optional(),
  
  selectedSizes: z.array(
    z.string()
      .min(1, 'Size ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Size ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Size ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected sizes`).optional(),
  
  selectedColors: z.array(
    z.string()
      .min(1, 'Color ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Color ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Color ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected colors`).optional(),
  
  selectedPrices: z.array(
    z.string()
      .min(1, 'Price ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Price ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Price ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected prices`).optional(),
  
  selectedAvailability: z.array(
    z.string()
      .min(1, 'Availability ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Availability ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Availability ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected availability options`).optional(),
  
  selectedTypes: z.array(
    z.string()
      .min(1, 'Type ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Type ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Type ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} selected types`).optional(),
  
  brandSearchQuery: z.string()
    .max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH, `Brand search query must be ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters or less`)
    .trim()
    .optional(),
  
  expandedSections: z.array(
    z.string()
      .min(1, 'Section ID cannot be empty')
      .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Section ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Section ID must contain only alphanumeric characters, hyphens, and underscores')
  ).max(VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH, `Cannot have more than ${VALIDATION_CONSTANTS.MAX_ARRAY_LENGTH} expanded sections`).optional(),
  
  priceRange: z.object({
    min: z.number()
      .min(VALIDATION_CONSTANTS.MIN_PRICE, `Minimum price must be at least ${VALIDATION_CONSTANTS.MIN_PRICE}`)
      .max(VALIDATION_CONSTANTS.MAX_PRICE, `Minimum price cannot exceed ${VALIDATION_CONSTANTS.MAX_PRICE}`)
      .optional(),
    max: z.number()
      .min(VALIDATION_CONSTANTS.MIN_PRICE, `Maximum price must be at least ${VALIDATION_CONSTANTS.MIN_PRICE}`)
      .max(VALIDATION_CONSTANTS.MAX_PRICE, `Maximum price cannot exceed ${VALIDATION_CONSTANTS.MAX_PRICE}`)
      .optional(),
  }).optional().refine((data) => {
    if (data?.min !== undefined && data?.max !== undefined) {
      return data.min <= data.max;
    }
    return true;
  }, {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['priceRange'],
  }),
  
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
  viewMode: z.enum(['grid', 'list']).optional(),
  itemsPerPage: z.number()
    .int('Items per page must be an integer')
    .min(VALIDATION_CONSTANTS.MIN_PAGE_SIZE, `Items per page must be at least ${VALIDATION_CONSTANTS.MIN_PAGE_SIZE}`)
    .max(VALIDATION_CONSTANTS.MAX_PAGE_SIZE, `Items per page cannot exceed ${VALIDATION_CONSTANTS.MAX_PAGE_SIZE}`)
    .optional(),
  currentPage: z.number()
    .int('Current page must be an integer')
    .min(VALIDATION_CONSTANTS.MIN_PAGE_NUMBER, `Current page must be at least ${VALIDATION_CONSTANTS.MIN_PAGE_NUMBER}`)
    .max(VALIDATION_CONSTANTS.MAX_PAGE_NUMBER, `Current page cannot exceed ${VALIDATION_CONSTANTS.MAX_PAGE_NUMBER}`)
    .optional(),
  searchQuery: z.string()
    .max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH, `Search query must be ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters or less`)
    .trim()
    .optional(),
});

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate filter state with comprehensive error handling
 */
export function validateFilterState(state: unknown): FilterStateValidationResult {
  const startTime = performance.now();
  
  try {
    const result = FilterStateValidationSchema.safeParse(state);
    
    if (result.success) {
      const duration = performance.now() - startTime;
      console.debug(`Filter state validation completed in ${duration.toFixed(2)}ms`);
      
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedState: result.data,
      };
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        warnings: [],
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}

/**
 * Validate filter state update with comprehensive error handling
 */
export function validateFilterStateUpdate(update: unknown): FilterStateValidationResult {
  const startTime = performance.now();
  
  try {
    const result = FilterStateUpdateValidationSchema.safeParse(update);
    
    if (result.success) {
      const duration = performance.now() - startTime;
      console.debug(`Filter state update validation completed in ${duration.toFixed(2)}ms`);
      
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedState: result.data as FilterState,
      };
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        warnings: [],
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}

/**
 * Validate specific filter state field
 */
export function validateFilterStateField(
  field: keyof FilterState,
  value: unknown
): { isValid: boolean; error?: string } {
  try {
    const schema = FilterStateValidationSchema.shape[field];
    if (!schema) {
      return { isValid: false, error: `Unknown field: ${field}` };
    }
    
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// ===== SANITIZATION FUNCTIONS =====

/**
 * Sanitize filter state
 */
export function sanitizeFilterState(state: FilterState): FilterState {
  return {
    ...state,
    selectedCategories: state.selectedCategories.filter(id => id.trim().length > 0),
    selectedBrands: state.selectedBrands.filter(id => id.trim().length > 0),
    selectedSizes: state.selectedSizes.filter(id => id.trim().length > 0),
    selectedColors: state.selectedColors.filter(id => id.trim().length > 0),
    selectedPrices: state.selectedPrices.filter(id => id.trim().length > 0),
    selectedAvailability: state.selectedAvailability.filter(id => id.trim().length > 0),
    selectedTypes: state.selectedTypes.filter(id => id.trim().length > 0),
    brandSearchQuery: state.brandSearchQuery.trim(),
    expandedSections: state.expandedSections.filter(id => id.trim().length > 0),
    searchQuery: state.searchQuery.trim(),
    priceRange: state.priceRange ? {
      min: state.priceRange.min !== undefined ? Math.max(VALIDATION_CONSTANTS.MIN_PRICE, state.priceRange.min) : undefined,
      max: state.priceRange.max !== undefined ? Math.min(VALIDATION_CONSTANTS.MAX_PRICE, state.priceRange.max) : undefined,
    } : undefined,
    itemsPerPage: Math.max(VALIDATION_CONSTANTS.MIN_PAGE_SIZE, Math.min(VALIDATION_CONSTANTS.MAX_PAGE_SIZE, state.itemsPerPage)),
    currentPage: Math.max(VALIDATION_CONSTANTS.MIN_PAGE_NUMBER, Math.min(VALIDATION_CONSTANTS.MAX_PAGE_NUMBER, state.currentPage)),
    lastUpdated: Math.max(0, state.lastUpdated),
  };
}

/**
 * Sanitize filter state update
 */
export function sanitizeFilterStateUpdate(update: FilterStateUpdate): FilterStateUpdate {
  const sanitized: FilterStateUpdate = { ...update };
  
  if (sanitized.selectedCategories) {
    sanitized.selectedCategories = sanitized.selectedCategories.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedBrands) {
    sanitized.selectedBrands = sanitized.selectedBrands.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedSizes) {
    sanitized.selectedSizes = sanitized.selectedSizes.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedColors) {
    sanitized.selectedColors = sanitized.selectedColors.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedPrices) {
    sanitized.selectedPrices = sanitized.selectedPrices.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedAvailability) {
    sanitized.selectedAvailability = sanitized.selectedAvailability.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.selectedTypes) {
    sanitized.selectedTypes = sanitized.selectedTypes.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.brandSearchQuery !== undefined) {
    sanitized.brandSearchQuery = sanitized.brandSearchQuery.trim();
  }
  
  if (sanitized.expandedSections) {
    sanitized.expandedSections = sanitized.expandedSections.filter(id => id.trim().length > 0);
  }
  
  if (sanitized.searchQuery !== undefined) {
    sanitized.searchQuery = sanitized.searchQuery.trim();
  }
  
  if (sanitized.priceRange) {
    sanitized.priceRange = {
      min: sanitized.priceRange.min !== undefined ? Math.max(VALIDATION_CONSTANTS.MIN_PRICE, sanitized.priceRange.min) : undefined,
      max: sanitized.priceRange.max !== undefined ? Math.min(VALIDATION_CONSTANTS.MAX_PRICE, sanitized.priceRange.max) : undefined,
    };
  }
  
  if (sanitized.itemsPerPage !== undefined) {
    sanitized.itemsPerPage = Math.max(VALIDATION_CONSTANTS.MIN_PAGE_SIZE, Math.min(VALIDATION_CONSTANTS.MAX_PAGE_SIZE, sanitized.itemsPerPage));
  }
  
  if (sanitized.currentPage !== undefined) {
    sanitized.currentPage = Math.max(VALIDATION_CONSTANTS.MIN_PAGE_NUMBER, Math.min(VALIDATION_CONSTANTS.MAX_PAGE_NUMBER, sanitized.currentPage));
  }
  
  return sanitized;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if filter state has any applied filters
 */
export function hasAppliedFilters(state: FilterState): boolean {
  return (
    state.selectedCategories.length > 0 ||
    state.selectedBrands.length > 0 ||
    state.selectedSizes.length > 0 ||
    state.selectedColors.length > 0 ||
    state.selectedPrices.length > 0 ||
    (state.selectedAvailability.length > 0 && !state.selectedAvailability.includes('all-items')) ||
    (state.selectedTypes.length > 0 && !state.selectedTypes.includes('all-conditions')) ||
    state.brandSearchQuery.length > 0 ||
    state.searchQuery.length > 0 ||
    state.sortBy !== 'newest' ||
    state.viewMode !== 'grid' ||
    state.currentPage > 1 ||
    state.itemsPerPage !== 20 ||
    (state.priceRange?.min !== undefined || state.priceRange?.max !== undefined)
  );
}

/**
 * Get applied filters count
 */
export function getAppliedFiltersCount(state: FilterState): number {
  let count = 0;
  
  if (state.selectedCategories.length > 0) count++;
  if (state.selectedBrands.length > 0) count++;
  if (state.selectedSizes.length > 0) count++;
  if (state.selectedColors.length > 0) count++;
  if (state.selectedPrices.length > 0) count++;
  if (state.selectedAvailability.length > 0 && !state.selectedAvailability.includes('all-items')) count++;
  if (state.selectedTypes.length > 0 && !state.selectedTypes.includes('all-conditions')) count++;
  if (state.brandSearchQuery.length > 0) count++;
  if (state.searchQuery.length > 0) count++;
  if (state.sortBy !== 'newest') count++;
  if (state.viewMode !== 'grid') count++;
  if (state.currentPage > 1) count++;
  if (state.itemsPerPage !== 20) count++;
  if (state.priceRange?.min !== undefined || state.priceRange?.max !== undefined) count++;
  
  return count;
}

/**
 * Create default filter state
 */
export function createDefaultFilterState(): FilterState {
  return {
    selectedCategories: [],
    selectedBrands: [],
    selectedSizes: [],
    selectedColors: [],
    selectedPrices: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-conditions'],
    brandSearchQuery: '',
    expandedSections: ['categories'],
    priceRange: undefined,
    sortBy: 'newest',
    viewMode: 'grid',
    itemsPerPage: 20,
    currentPage: 1,
    searchQuery: '',
    lastUpdated: Date.now(),
  };
}

// ===== EXPORTS =====

export {
  FilterStateValidationSchema,
  FilterStateUpdateValidationSchema,
  validateFilterState,
  validateFilterStateUpdate,
  validateFilterStateField,
  sanitizeFilterState,
  sanitizeFilterStateUpdate,
  hasAppliedFilters,
  getAppliedFiltersCount,
  createDefaultFilterState,
  VALIDATION_CONSTANTS,
}; 