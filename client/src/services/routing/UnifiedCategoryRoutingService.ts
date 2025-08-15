/**
 * Unified Category Routing Service - Single Source of Truth Implementation
 * Replaces FashionRouteService and NavigationService duplication
 * Uses TOP_NAV_CONFIG as the authoritative configuration source
 */

import { TOP_NAV_CONFIG, type TopNavCategory } from '@/services/navigation/TopNavConfig';
import { slugify } from './RouteUtils';

// Strict TypeScript contracts derived from TOP_NAV_CONFIG
const TOP_NAV_LABELS = TOP_NAV_CONFIG.map(c => c.label) as const;
export type CategoryLabel = typeof TOP_NAV_LABELS[number];

export interface CategoryRouteRequest {
  readonly categoryLabel: CategoryLabel;
  readonly section?: string;
  readonly item?: string;
}

export interface CategoryMetadata {
  readonly category: string;
  readonly vertical: string;
  readonly isFashionSection?: boolean;
  readonly fashionSectionId?: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface CategoryRouteResult {
  readonly url: string;
  readonly metadata: CategoryMetadata;
  readonly validation: ValidationResult;
}

interface RouteParts {
  readonly categorySlug: string;
  readonly sectionSlug?: string;
  readonly itemSlug?: string;
}

export class CategoryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryConfigurationError';
  }
}

export class CategoryRoutingError extends Error {
  constructor(errors: readonly string[]) {
    super(`Category routing validation failed: ${errors.join(', ')}`);
    this.name = 'CategoryRoutingError';
  }
}

/**
 * Unified Category Routing Service
 * Single service for all category routing using TOP_NAV_CONFIG
 */
export class UnifiedCategoryRoutingService {
  private static instance: UnifiedCategoryRoutingService;

  private constructor() {}

  public static getInstance(): UnifiedCategoryRoutingService {
    if (!UnifiedCategoryRoutingService.instance) {
      UnifiedCategoryRoutingService.instance = new UnifiedCategoryRoutingService();
    }
    return UnifiedCategoryRoutingService.instance;
  }

  /**
   * Generate category route using TOP_NAV_CONFIG as single source of truth
   */
  public generateCategoryRoute(request: CategoryRouteRequest): CategoryRouteResult {
    // Validate input
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      throw new CategoryRoutingError(validation.errors);
    }

    // Get configuration from single source of truth
    const categoryConfig = this.getCategoryConfig(request.categoryLabel);
    
    // Generate route using configuration
    const route = this.buildRoute({
      categorySlug: this.resolveCategorySlug(categoryConfig),
      sectionSlug: request.section ? slugify(request.section) : undefined,
      itemSlug: request.item ? slugify(request.item) : undefined
    });

    return {
      url: route,
      metadata: {
        category: categoryConfig.label,
        vertical: categoryConfig.vertical,
        isFashionSection: categoryConfig.isFashionSection,
        fashionSectionId: categoryConfig.fashionSectionId
      },
      validation
    };
  }

  /**
   * Validate routing request
   */
  private validateRequest(request: CategoryRouteRequest): ValidationResult {
    const errors: string[] = [];

    // Validate category label
    if (!request.categoryLabel || request.categoryLabel.trim().length === 0) {
      errors.push('Category label is required');
    }

    // Validate category exists in configuration
    const categoryExists = TOP_NAV_CONFIG.some(c => c.label === request.categoryLabel);
    if (!categoryExists) {
      errors.push(`Category '${request.categoryLabel}' not found in TOP_NAV_CONFIG`);
    }

    // Validate section if provided
    if (request.section !== undefined) {
      if (typeof request.section !== 'string' || request.section.trim().length === 0) {
        errors.push('Section must be a non-empty string when provided');
      }
    }

    // Validate item if provided
    if (request.item !== undefined) {
      if (typeof request.item !== 'string' || request.item.trim().length === 0) {
        errors.push('Item must be a non-empty string when provided');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    };
  }

  /**
   * Get category configuration from TOP_NAV_CONFIG
   */
  private getCategoryConfig(label: CategoryLabel): TopNavCategory {
    const config = TOP_NAV_CONFIG.find(c => c.label === label);
    if (!config) {
      throw new CategoryConfigurationError(`Category configuration not found: ${label}`);
    }
    return config;
  }

  /**
   * Resolve category slug using configuration
   */
  private resolveCategorySlug(config: TopNavCategory): string {
    // Use fashionSectionId if available (for Women/Men/Kids), otherwise slugify label
    return config.fashionSectionId || slugify(config.label);
  }

  /**
   * Build route using standardized pattern
   */
  private buildRoute(parts: RouteParts): string {
    // All categories mount under /fashion per product decision
    let route = `/fashion/${parts.categorySlug}`;
    
    if (parts.sectionSlug) {
      route += `/${parts.sectionSlug}`;
    }
    
    if (parts.itemSlug) {
      route += `/${parts.itemSlug}`;
    }
    
    return route;
  }

  /**
   * Get all available category labels
   */
  public getAvailableCategories(): readonly CategoryLabel[] {
    return TOP_NAV_LABELS;
  }

  /**
   * Check if category exists in configuration
   */
  public isCategoryValid(label: string): label is CategoryLabel {
    return TOP_NAV_LABELS.includes(label as CategoryLabel);
  }
}

// Export singleton instance
export const unifiedCategoryRoutingService = UnifiedCategoryRoutingService.getInstance();



