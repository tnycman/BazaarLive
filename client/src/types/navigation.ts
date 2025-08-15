/**
 * Navigation Type Definitions
 * Enterprise-grade navigation system with type safety and immutability
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { z } from 'zod';

// ===== NAVIGATION TYPE DEFINITIONS =====

/**
 * Navigation item types for proper type safety
 */
export const NavigationTypeSchema = z.enum(['category', 'subcategory', 'filter', 'section']);
export type NavigationType = z.infer<typeof NavigationTypeSchema>;

/**
 * Navigation metadata for extensibility
 */
export interface NavigationMetadata {
  readonly icon?: string;
  readonly description?: string;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly isActive?: boolean;
  readonly isVisible?: boolean;
  readonly sortOrder?: number;
  readonly analyticsId?: string;
  readonly permissions?: readonly string[];
  readonly [key: string]: unknown;
}

/**
 * Core navigation configuration interface
 */
export interface NavigationConfig {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly type: NavigationType;
  readonly children?: readonly NavigationConfig[];
  readonly metadata?: NavigationMetadata;
  readonly parentId?: string;
  readonly level: number;
  readonly isExpandable: boolean;
  readonly isSelectable: boolean;
  readonly isNavigable: boolean;
}

/**
 * Navigation state for runtime management
 */
export interface NavigationState {
  readonly currentPath: string;
  readonly selectedItems: readonly string[];
  readonly expandedItems: readonly string[];
  readonly breadcrumbPath: readonly NavigationConfig[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastUpdated: number;
}

/**
 * Navigation context for component usage
 */
export interface NavigationContext {
  readonly config: NavigationConfig;
  readonly state: NavigationState;
  readonly onNavigate: (path: string) => void;
  readonly onSelect: (itemId: string) => void;
  readonly onExpand: (itemId: string) => void;
  readonly onCollapse: (itemId: string) => void;
}

/**
 * Navigation validation result
 */
export interface NavigationValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly sanitizedConfig?: NavigationConfig;
}

/**
 * Navigation performance metrics
 */
export interface NavigationPerformanceMetrics {
  readonly loadTime: number;
  readonly renderTime: number;
  readonly navigationTime: number;
  readonly cacheHit: boolean;
  readonly timestamp: number;
}

/**
 * Navigation analytics event
 */
export interface NavigationAnalyticsEvent {
  readonly eventType: 'navigation' | 'selection' | 'expansion' | 'error';
  readonly itemId: string;
  readonly path: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

// ===== VALIDATION SCHEMAS =====

/**
 * Navigation config validation schema
 */
export const NavigationConfigSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  path: z.string().min(1).max(500),
  type: NavigationTypeSchema,
  children: z.array(z.lazy(() => NavigationConfigSchema)).optional(),
  metadata: z.object({
    icon: z.string().optional(),
    description: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    analyticsId: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }).optional(),
  parentId: z.string().optional(),
  level: z.number().int().min(0).max(10),
  isExpandable: z.boolean(),
  isSelectable: z.boolean(),
  isNavigable: z.boolean(),
});

/**
 * Navigation state validation schema
 */
export const NavigationStateSchema = z.object({
  currentPath: z.string().min(1),
  selectedItems: z.array(z.string()),
  expandedItems: z.array(z.string()),
  breadcrumbPath: z.array(NavigationConfigSchema),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  lastUpdated: z.number().int().min(0),
});

/**
 * Navigation context validation schema
 */
export const NavigationContextSchema = z.object({
  config: NavigationConfigSchema,
  state: NavigationStateSchema,
  onNavigate: z.function().args(z.string()).returns(z.void()),
  onSelect: z.function().args(z.string()).returns(z.void()),
  onExpand: z.function().args(z.string()).returns(z.void()),
  onCollapse: z.function().args(z.string()).returns(z.void()),
});

// ===== UTILITY TYPES =====

/**
 * Navigation filter options
 */
export interface NavigationFilterOptions {
  readonly includeInactive?: boolean;
  readonly includeHidden?: boolean;
  readonly maxDepth?: number;
  readonly typeFilter?: readonly NavigationType[];
  readonly permissionFilter?: readonly string[];
}

/**
 * Navigation search options
 */
export interface NavigationSearchOptions {
  readonly query: string;
  readonly caseSensitive?: boolean;
  readonly includeMetadata?: boolean;
  readonly maxResults?: number;
}

/**
 * Navigation sort options
 */
export interface NavigationSortOptions {
  readonly sortBy: 'name' | 'path' | 'level' | 'sortOrder';
  readonly sortDirection: 'asc' | 'desc';
}

// ===== EXPORTS =====

export type {
  NavigationConfig,
  NavigationState,
  NavigationContext,
  NavigationValidationResult,
  NavigationPerformanceMetrics,
  NavigationAnalyticsEvent,
  NavigationFilterOptions,
  NavigationSearchOptions,
  NavigationSortOptions,
  NavigationMetadata,
};

export {
  NavigationTypeSchema,
  NavigationConfigSchema,
  NavigationStateSchema,
  NavigationContextSchema,
  NavigationType,
}; 