/**
 * Navigation Validation Schemas
 * Enterprise-grade validation with comprehensive error handling and sanitization
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { z } from 'zod';
import type { 
  NavigationConfig, 
  NavigationState, 
  NavigationValidationResult,
  NavigationFilterOptions,
  NavigationSearchOptions,
  NavigationSortOptions 
} from '@/types/navigation';

// ===== VALIDATION CONSTANTS =====

const VALIDATION_CONSTANTS = {
  MAX_ID_LENGTH: 100,
  MAX_NAME_LENGTH: 200,
  MAX_PATH_LENGTH: 500,
  MAX_DEPTH: 10,
  MAX_CHILDREN: 100,
  MAX_METADATA_KEYS: 50,
  MAX_PERMISSIONS: 20,
  MAX_SEARCH_QUERY_LENGTH: 200,
  MAX_RESULTS: 1000,
} as const;

// ===== CORE VALIDATION SCHEMAS =====

/**
 * Enhanced navigation config validation with comprehensive checks
 */
export const EnhancedNavigationConfigSchema = z.object({
  id: z.string()
    .min(1, 'Navigation ID is required')
    .max(VALIDATION_CONSTANTS.MAX_ID_LENGTH, `Navigation ID must be ${VALIDATION_CONSTANTS.MAX_ID_LENGTH} characters or less`)
    .regex(/^[a-zA-Z0-9-_]+$/, 'Navigation ID must contain only alphanumeric characters, hyphens, and underscores'),
  
  name: z.string()
    .min(1, 'Navigation name is required')
    .max(VALIDATION_CONSTANTS.MAX_NAME_LENGTH, `Navigation name must be ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters or less`)
    .trim(),
  
  path: z.string()
    .min(1, 'Navigation path is required')
    .max(VALIDATION_CONSTANTS.MAX_PATH_LENGTH, `Navigation path must be ${VALIDATION_CONSTANTS.MAX_PATH_LENGTH} characters or less`)
    .regex(/^\/[a-zA-Z0-9-_\/]*$/, 'Navigation path must start with / and contain only valid URL characters'),
  
  type: z.enum(['category', 'subcategory', 'filter', 'section'], {
    errorMap: () => ({ message: 'Navigation type must be one of: category, subcategory, filter, section' })
  }),
  
  children: z.array(z.lazy(() => EnhancedNavigationConfigSchema))
    .max(VALIDATION_CONSTANTS.MAX_CHILDREN, `Navigation cannot have more than ${VALIDATION_CONSTANTS.MAX_CHILDREN} children`)
    .optional(),
  
  metadata: z.object({
    icon: z.string().max(50, 'Icon name must be 50 characters or less').optional(),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
    seoTitle: z.string().max(60, 'SEO title must be 60 characters or less').optional(),
    seoDescription: z.string().max(160, 'SEO description must be 160 characters or less').optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    analyticsId: z.string().max(100, 'Analytics ID must be 100 characters or less').optional(),
    permissions: z.array(z.string().max(50)).max(VALIDATION_CONSTANTS.MAX_PERMISSIONS).optional(),
  }).optional(),
  
  parentId: z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH).optional(),
  
  level: z.number()
    .int('Navigation level must be an integer')
    .min(0, 'Navigation level must be 0 or greater')
    .max(VALIDATION_CONSTANTS.MAX_DEPTH, `Navigation level cannot exceed ${VALIDATION_CONSTANTS.MAX_DEPTH}`),
  
  isExpandable: z.boolean(),
  isSelectable: z.boolean(),
  isNavigable: z.boolean(),
}).refine((data) => {
  // Custom validation: Ensure children have correct parent relationship
  if (data.children && data.children.length > 0) {
    return data.children.every(child => child.parentId === data.id);
  }
  return true;
}, {
  message: 'All children must have the correct parent ID',
  path: ['children']
}).refine((data) => {
  // Custom validation: Ensure expandable items have children or are leaf nodes
  if (data.isExpandable && (!data.children || data.children.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Expandable navigation items must have children',
  path: ['isExpandable']
});

/**
 * Enhanced navigation state validation
 */
export const EnhancedNavigationStateSchema = z.object({
  currentPath: z.string()
    .min(1, 'Current path is required')
    .max(VALIDATION_CONSTANTS.MAX_PATH_LENGTH, `Current path must be ${VALIDATION_CONSTANTS.MAX_PATH_LENGTH} characters or less`),
  
  selectedItems: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH))
    .max(100, 'Cannot have more than 100 selected items'),
  
  expandedItems: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH))
    .max(50, 'Cannot have more than 50 expanded items'),
  
  breadcrumbPath: z.array(EnhancedNavigationConfigSchema)
    .max(10, 'Breadcrumb path cannot exceed 10 levels'),
  
  isLoading: z.boolean(),
  error: z.string().nullable(),
  lastUpdated: z.number()
    .int('Last updated timestamp must be an integer')
    .min(0, 'Last updated timestamp must be positive'),
});

/**
 * Navigation filter options validation
 */
export const NavigationFilterOptionsSchema = z.object({
  includeInactive: z.boolean().optional(),
  includeHidden: z.boolean().optional(),
  maxDepth: z.number()
    .int('Max depth must be an integer')
    .min(0, 'Max depth must be 0 or greater')
    .max(VALIDATION_CONSTANTS.MAX_DEPTH, `Max depth cannot exceed ${VALIDATION_CONSTANTS.MAX_DEPTH}`)
    .optional(),
  typeFilter: z.array(z.enum(['category', 'subcategory', 'filter', 'section']))
    .max(4, 'Cannot filter by more than 4 types')
    .optional(),
  permissionFilter: z.array(z.string().max(50))
    .max(VALIDATION_CONSTANTS.MAX_PERMISSIONS, `Cannot filter by more than ${VALIDATION_CONSTANTS.MAX_PERMISSIONS} permissions`)
    .optional(),
});

/**
 * Navigation search options validation
 */
export const NavigationSearchOptionsSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH, `Search query must be ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters or less`)
    .trim(),
  caseSensitive: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
  maxResults: z.number()
    .int('Max results must be an integer')
    .min(1, 'Max results must be at least 1')
    .max(VALIDATION_CONSTANTS.MAX_RESULTS, `Max results cannot exceed ${VALIDATION_CONSTANTS.MAX_RESULTS}`)
    .optional(),
});

/**
 * Navigation sort options validation
 */
export const NavigationSortOptionsSchema = z.object({
  sortBy: z.enum(['name', 'path', 'level', 'sortOrder'], {
    errorMap: () => ({ message: 'Sort by must be one of: name, path, level, sortOrder' })
  }),
  sortDirection: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Sort direction must be asc or desc' })
  }),
});

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate navigation configuration with comprehensive error handling
 */
export function validateNavigationConfig(config: unknown): NavigationValidationResult {
  const startTime = performance.now();
  
  try {
    const result = EnhancedNavigationConfigSchema.safeParse(config);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedConfig: result.data,
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
  } finally {
    const duration = performance.now() - startTime;
    console.debug(`Navigation config validation completed in ${duration.toFixed(2)}ms`);
  }
}

/**
 * Validate navigation state with comprehensive error handling
 */
export function validateNavigationState(state: unknown): NavigationValidationResult {
  const startTime = performance.now();
  
  try {
    const result = EnhancedNavigationStateSchema.safeParse(state);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedConfig: result.data as NavigationConfig,
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
  } finally {
    const duration = performance.now() - startTime;
    console.debug(`Navigation state validation completed in ${duration.toFixed(2)}ms`);
  }
}

/**
 * Validate navigation filter options
 */
export function validateNavigationFilterOptions(options: unknown): NavigationValidationResult {
  try {
    const result = NavigationFilterOptionsSchema.safeParse(options);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedConfig: result.data as NavigationConfig,
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
 * Validate navigation search options
 */
export function validateNavigationSearchOptions(options: unknown): NavigationValidationResult {
  try {
    const result = NavigationSearchOptionsSchema.safeParse(options);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedConfig: result.data as NavigationConfig,
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
 * Validate navigation sort options
 */
export function validateNavigationSortOptions(options: unknown): NavigationValidationResult {
  try {
    const result = NavigationSortOptionsSchema.safeParse(options);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedConfig: result.data as NavigationConfig,
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

// ===== SANITIZATION FUNCTIONS =====

/**
 * Sanitize navigation configuration
 */
export function sanitizeNavigationConfig(config: NavigationConfig): NavigationConfig {
  return {
    ...config,
    id: config.id.trim().replace(/[^a-zA-Z0-9-_]/g, ''),
    name: config.name.trim(),
    path: config.path.trim().replace(/\/+/g, '/'),
    metadata: config.metadata ? {
      ...config.metadata,
      description: config.metadata.description?.trim(),
      seoTitle: config.metadata.seoTitle?.trim(),
      seoDescription: config.metadata.seoDescription?.trim(),
      analyticsId: config.metadata.analyticsId?.trim(),
    } : undefined,
  };
}

/**
 * Sanitize navigation state
 */
export function sanitizeNavigationState(state: NavigationState): NavigationState {
  return {
    ...state,
    currentPath: state.currentPath.trim().replace(/\/+/g, '/'),
    selectedItems: state.selectedItems.filter(item => item.trim().length > 0),
    expandedItems: state.expandedItems.filter(item => item.trim().length > 0),
    error: state.error?.trim() || null,
  };
}

// ===== EXPORTS =====

export {
  EnhancedNavigationConfigSchema,
  EnhancedNavigationStateSchema,
  NavigationFilterOptionsSchema,
  NavigationSearchOptionsSchema,
  NavigationSortOptionsSchema,
  validateNavigationConfig,
  validateNavigationState,
  validateNavigationFilterOptions,
  validateNavigationSearchOptions,
  validateNavigationSortOptions,
  sanitizeNavigationConfig,
  sanitizeNavigationState,
  VALIDATION_CONSTANTS,
}; 