/**
 * Navigation Context Manager - Enterprise Context Resolution Service
 * Provides unified context management for navigation and filtering systems
 * 100% best practices, no shortcuts, complete type safety
 */

import { TOP_NAV_CONFIG, type TopNavCategory } from './TopNavConfig';
import { slugify } from '../routing/RouteUtils';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface NavigationContext {
  readonly url: string;
  readonly category: string;
  readonly subcategory?: string;
  readonly leaf?: string;
  readonly breadcrumbs: readonly string[];
  readonly expandedSections: readonly string[];
  readonly metadata: NavigationMetadata;
}

export interface NavigationMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly hierarchyLevel: number;
  readonly parentPath?: string;
  readonly categoryConfig?: TopNavCategory;
}

export interface ContextResolutionRequest {
  readonly url: string;
  readonly category: string;
  readonly subcategory?: string;
  readonly subSubcategory?: string;
  readonly leaf?: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

// ===== CUSTOM ERROR CLASSES =====
export class NavigationContextError extends Error {
  constructor(errors: readonly string[]) {
    super(`Navigation context validation failed: ${errors.join(', ')}`);
    this.name = 'NavigationContextError';
  }
}

export class NavigationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NavigationConfigurationError';
  }
}

/**
 * Navigation Context Manager - Singleton Service
 * Manages unified context resolution for navigation and filtering
 */
export class NavigationContextManager {
  private static instance: NavigationContextManager;
  private readonly categoryConfigMap: Map<string, TopNavCategory>;

  private constructor() {
    // Build category configuration map for fast lookups
    this.categoryConfigMap = new Map();
    
    for (const categoryConfig of TOP_NAV_CONFIG) {
      // Map by fashionSectionId (women, men, kids)
      if (categoryConfig.fashionSectionId) {
        this.categoryConfigMap.set(categoryConfig.fashionSectionId, categoryConfig);
      }
      
      // Map by slugified label (home, electronics, pets, etc.)
      const sluggedLabel = slugify(categoryConfig.label);
      this.categoryConfigMap.set(sluggedLabel, categoryConfig);
      
      // Map by label for direct lookup
      this.categoryConfigMap.set(categoryConfig.label, categoryConfig);
    }
  }

  public static getInstance(): NavigationContextManager {
    if (!NavigationContextManager.instance) {
      NavigationContextManager.instance = new NavigationContextManager();
    }
    return NavigationContextManager.instance;
  }

  /**
   * Resolve complete navigation context from URL parameters
   */
  public resolveContext(request: ContextResolutionRequest): NavigationContext {
    // Validate input parameters
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      throw new NavigationContextError(validation.errors);
    }

    // Get category configuration
    const categoryConfig = this.getCategoryConfig(request.category);
    
    // Build hierarchical context
    const breadcrumbs = this.buildBreadcrumbs(request, categoryConfig);
    const expandedSections = this.calculateExpansions(request);
    const metadata = this.buildMetadata(request, categoryConfig);

    return Object.freeze({
      url: request.url,
      category: request.category,
      subcategory: request.subcategory,
      leaf: request.leaf,
      breadcrumbs: Object.freeze(breadcrumbs),
      expandedSections: Object.freeze(expandedSections),
      metadata: Object.freeze(metadata)
    });
  }

  /**
   * Calculate which filter sections should be expanded based on context
   */
  private calculateExpansions(request: ContextResolutionRequest): string[] {
    const expansions = ['categories']; // Always expand categories section
    
    // Add primary category
    if (request.category) {
      expansions.push(request.category);
    }
    
    // Add subcategory if present (Level 2: e.g., "men-accessories")
    if (request.category && request.subSubcategory) {
      const subcategoryId = `${request.category}-${slugify(request.subSubcategory)}`;
      expansions.push(subcategoryId);
    }
    
    return expansions;
  }

  /**
   * Build breadcrumb navigation from context
   */
  private buildBreadcrumbs(request: ContextResolutionRequest, categoryConfig: TopNavCategory): string[] {
    const breadcrumbs = ['Home'];
    
    // Add category display name
    if (categoryConfig) {
      breadcrumbs.push(categoryConfig.label);
    } else if (request.category) {
      breadcrumbs.push(this.formatDisplayName(request.category));
    }
    
    // Add subcategory
    if (request.subSubcategory) {
      breadcrumbs.push(this.formatDisplayName(request.subSubcategory));
    }
    
    // Add leaf item
    if (request.leaf) {
      breadcrumbs.push(this.formatDisplayName(request.leaf));
    }
    
    return breadcrumbs;
  }

  /**
   * Get category configuration from various lookup strategies
   */
  private getCategoryConfig(category: string): TopNavCategory {
    // Try direct lookup
    let categoryConfig = this.categoryConfigMap.get(category);
    
    // Try lowercase lookup
    if (!categoryConfig) {
      categoryConfig = this.categoryConfigMap.get(category.toLowerCase());
    }
    
    // Try slugified lookup
    if (!categoryConfig) {
      categoryConfig = this.categoryConfigMap.get(slugify(category));
    }
    
    if (!categoryConfig) {
      throw new NavigationConfigurationError(`Category configuration not found for: ${category}`);
    }
    
    return categoryConfig;
  }

  /**
   * Validate context resolution request
   */
  private validateRequest(request: ContextResolutionRequest): ValidationResult {
    const errors: string[] = [];
    
    // Validate URL
    if (!request.url || request.url.trim().length === 0) {
      errors.push('URL is required');
    } else {
      try {
        new URL(request.url, 'https://example.com'); // Validate URL format
      } catch {
        errors.push('Invalid URL format provided');
      }
    }
    
    // Validate category
    if (!request.category || request.category.trim().length === 0) {
      errors.push('Category is required');
    } else {
      // Check if category exists in configuration
      const categoryExists = this.categoryConfigMap.has(request.category) ||
                           this.categoryConfigMap.has(request.category.toLowerCase()) ||
                           this.categoryConfigMap.has(slugify(request.category));
      
      if (!categoryExists) {
        errors.push(`Category '${request.category}' not found in TOP_NAV_CONFIG`);
      }
    }
    
    // Validate subcategory format if provided
    if (request.subcategory !== undefined) {
      if (typeof request.subcategory !== 'string' || request.subcategory.trim().length === 0) {
        errors.push('Subcategory must be a non-empty string when provided');
      }
    }
    
    // Validate subSubcategory format if provided
    if (request.subSubcategory !== undefined) {
      if (typeof request.subSubcategory !== 'string' || request.subSubcategory.trim().length === 0) {
        errors.push('SubSubcategory must be a non-empty string when provided');
      }
    }
    
    // Validate leaf format if provided
    if (request.leaf !== undefined) {
      if (typeof request.leaf !== 'string' || request.leaf.trim().length === 0) {
        errors.push('Leaf must be a non-empty string when provided');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    };
  }

  /**
   * Format display names for breadcrumbs
   */
  private formatDisplayName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Build metadata for SEO and navigation
   */
  private buildMetadata(request: ContextResolutionRequest, categoryConfig: TopNavCategory): NavigationMetadata {
    const title = this.buildTitle(request, categoryConfig);
    const description = this.buildDescription(request, categoryConfig);
    const hierarchyLevel = this.calculateHierarchyLevel(request);
    const parentPath = this.buildParentPath(request);
    
    return {
      title,
      description,
      canonicalUrl: request.url,
      hierarchyLevel,
      parentPath,
      categoryConfig
    };
  }

  /**
   * Build page title from context
   */
  private buildTitle(request: ContextResolutionRequest, categoryConfig: TopNavCategory): string {
    const parts: string[] = [];
    
    if (categoryConfig) {
      parts.push(categoryConfig.label);
    }
    
    if (request.subSubcategory) {
      parts.push(this.formatDisplayName(request.subSubcategory));
    }
    
    if (request.leaf) {
      parts.push(this.formatDisplayName(request.leaf));
    }
    
    const title = parts.length > 0 ? parts.join(' - ') : 'Fashion';
    return `${title} | Poshmark`;
  }

  /**
   * Build page description from context
   */
  private buildDescription(request: ContextResolutionRequest, categoryConfig: TopNavCategory): string {
    if (categoryConfig && request.subSubcategory) {
      return `Shop ${categoryConfig.label.toLowerCase()}'s ${this.formatDisplayName(request.subSubcategory).toLowerCase()} from top brands. Find unique ${request.leaf ? this.formatDisplayName(request.leaf).toLowerCase() : 'items'} at great prices.`;
    } else if (categoryConfig) {
      return `Shop ${categoryConfig.label.toLowerCase()}'s fashion from top brands. Find unique items at great prices.`;
    }
    
    return 'Shop fashion from top brands. Find unique items at great prices.';
  }

  /**
   * Calculate hierarchy level (0=category, 1=subcategory, 2=leaf)
   */
  private calculateHierarchyLevel(request: ContextResolutionRequest): number {
    if (request.leaf) return 2;
    if (request.subSubcategory) return 1;
    return 0;
  }

  /**
   * Build parent path for navigation
   */
  private buildParentPath(request: ContextResolutionRequest): string | undefined {
    if (request.leaf && request.subSubcategory) {
      return `/fashion/${request.category}/${request.subSubcategory}`;
    } else if (request.subSubcategory) {
      return `/fashion/${request.category}`;
    }
    
    return undefined;
  }

  /**
   * Get all available categories
   */
  public getAvailableCategories(): readonly string[] {
    return Array.from(this.categoryConfigMap.keys());
  }

  /**
   * Check if category is valid
   */
  public isCategoryValid(category: string): boolean {
    return this.categoryConfigMap.has(category) ||
           this.categoryConfigMap.has(category.toLowerCase()) ||
           this.categoryConfigMap.has(slugify(category));
  }
}

// Export singleton instance
export const navigationContextManager = NavigationContextManager.getInstance();



