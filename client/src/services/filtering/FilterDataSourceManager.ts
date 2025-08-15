/**
 * Filter Data Source Manager - Data Source Abstraction Layer
 * Provides unified interface for different data sources (Navigation vs Filter)
 * 100% best practices, enterprise-grade abstraction layer
 */

import { TOP_NAV_CONFIG, type TopNavCategory } from '../navigation/TopNavConfig';
import { slugify } from '../routing/RouteUtils';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface FilterCategory {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly count?: number;
  readonly isExpandable: boolean;
  readonly subcategories?: readonly FilterCategory[];
}

export interface FilterDataSource {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly categories: readonly FilterCategory[];
}

export interface DataSourceConfig {
  readonly preferredSource: 'navigation' | 'filter' | 'hybrid';
  readonly fallbackBehavior: 'graceful' | 'strict';
  readonly enableCaching: boolean;
  readonly validateConsistency: boolean;
}

export interface DataSourceMetrics {
  readonly categoriesCount: number;
  readonly subcategoriesCount: number;
  readonly maxDepth: number;
  readonly loadTime: number;
  readonly cacheHitRate?: number;
}

// ===== CUSTOM ERROR CLASSES =====
export class FilterDataSourceError extends Error {
  constructor(message: string, public readonly sourceId: string) {
    super(`Filter data source error [${sourceId}]: ${message}`);
    this.name = 'FilterDataSourceError';
  }
}

export class DataSourceValidationError extends Error {
  constructor(message: string, public readonly issues: readonly string[]) {
    super(`Data source validation failed: ${message}. Issues: ${issues.join(', ')}`);
    this.name = 'DataSourceValidationError';
  }
}

/**
 * Filter Data Source Manager - Enterprise Data Abstraction Service
 * Manages multiple data sources and provides unified access patterns
 */
export class FilterDataSourceManager {
  private static instance: FilterDataSourceManager;
  private readonly dataSources: Map<string, FilterDataSource> = new Map();
  private readonly sourceMetrics: Map<string, DataSourceMetrics> = new Map();
  private readonly cache: Map<string, FilterCategory[]> = new Map();
  private config: DataSourceConfig = {
    preferredSource: 'filter',
    fallbackBehavior: 'graceful',
    enableCaching: true,
    validateConsistency: true
  };

  private constructor() {
    this.initializeDataSources();
  }

  public static getInstance(): FilterDataSourceManager {
    if (!FilterDataSourceManager.instance) {
      FilterDataSourceManager.instance = new FilterDataSourceManager();
    }
    return FilterDataSourceManager.instance;
  }

  /**
   * Initialize all available data sources
   */
  private initializeDataSources(): void {
    // Initialize navigation-based data source
    this.registerNavigationDataSource();
    
    // Initialize filter-based data source (placeholder for now, will be populated from original data)
    this.registerFilterDataSource();
  }

  /**
   * Register navigation data source from TOP_NAV_CONFIG
   */
  private registerNavigationDataSource(): void {
    const startTime = performance.now();
    
    try {
      const categories = this.mapNavigationToFilterCategories();
      
      const navigationSource: FilterDataSource = {
        id: 'navigation',
        name: 'Navigation Config Data Source',
        description: 'Categories derived from TOP_NAV_CONFIG for navigation consistency',
        categories: Object.freeze(categories)
      };

      this.dataSources.set('navigation', navigationSource);
      
      // Calculate metrics
      const metrics = this.calculateSourceMetrics(categories, performance.now() - startTime);
      this.sourceMetrics.set('navigation', metrics);
      
    } catch (error) {
      throw new FilterDataSourceError(
        `Failed to initialize navigation data source: ${error}`,
        'navigation'
      );
    }
  }

  /**
   * Register filter data source (original working filter data)
   */
  private registerFilterDataSource(): void {
    // This will be populated with the original CATEGORIES_DATA
    // For now, create a placeholder that can be populated later
    const filterSource: FilterDataSource = {
      id: 'filter',
      name: 'Original Filter Data Source',
      description: 'Original purpose-built filter categories with complete hierarchy',
      categories: Object.freeze([]) // Will be populated by setFilterDataSource method
    };

    this.dataSources.set('filter', filterSource);
  }

  /**
   * Set the filter data source with original categories data
   */
  public setFilterDataSource(categories: readonly FilterCategory[]): void {
    const startTime = performance.now();
    
    try {
      // Validate categories structure
      this.validateCategoriesStructure(categories);
      
      const filterSource: FilterDataSource = {
        id: 'filter',
        name: 'Original Filter Data Source',
        description: 'Original purpose-built filter categories with complete hierarchy',
        categories: Object.freeze([...categories])
      };

      this.dataSources.set('filter', filterSource);
      
      // Calculate metrics
      const metrics = this.calculateSourceMetrics(categories, performance.now() - startTime);
      this.sourceMetrics.set('filter', metrics);
      
      // Clear cache when data source changes
      this.clearCache();
      
    } catch (error) {
      throw new FilterDataSourceError(
        `Failed to set filter data source: ${error}`,
        'filter'
      );
    }
  }

  /**
   * Get categories from specified data source
   */
  public getCategories(sourceId: string = this.config.preferredSource): readonly FilterCategory[] {
    const cacheKey = `categories-${sourceId}`;
    
    // Check cache first
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const dataSource = this.dataSources.get(sourceId);
    if (!dataSource) {
      if (this.config.fallbackBehavior === 'graceful') {
        return this.getFallbackCategories();
      } else {
        throw new FilterDataSourceError(`Data source not found: ${sourceId}`, sourceId);
      }
    }

    const categories = dataSource.categories;
    
    // Cache the result
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, [...categories]);
    }

    return categories;
  }

  /**
   * Get fallback categories when preferred source fails
   */
  private getFallbackCategories(): readonly FilterCategory[] {
    // Try filter source first, then navigation source
    const sources = ['filter', 'navigation'];
    
    for (const sourceId of sources) {
      const dataSource = this.dataSources.get(sourceId);
      if (dataSource && dataSource.categories.length > 0) {
        return dataSource.categories;
      }
    }
    
    // Return empty array as last resort
    return Object.freeze([]);
  }

  /**
   * Map navigation config to filter categories
   */
  private mapNavigationToFilterCategories(): FilterCategory[] {
    return TOP_NAV_CONFIG
      .filter(categoryConfig => categoryConfig.label !== 'Brands') // Exclude brands
      .map(categoryConfig => this.mapNavCategoryToFilter(categoryConfig));
  }

  /**
   * Map individual navigation category to filter category
   */
  private mapNavCategoryToFilter(categoryConfig: TopNavCategory): FilterCategory {
    const categoryId = categoryConfig.fashionSectionId || slugify(categoryConfig.label);
    
    return {
      id: categoryId,
      name: categoryConfig.label,
      level: 0,
      count: this.estimateCategoryCount(categoryId),
      isExpandable: categoryConfig.sections.length > 0,
      subcategories: categoryConfig.sections.map(section => 
        this.mapNavSectionToFilter(categoryId, section)
      )
    };
  }

  /**
   * Map navigation section to filter subcategory
   */
  private mapNavSectionToFilter(categoryId: string, section: any): FilterCategory {
    const sectionId = `${categoryId}-${slugify(section.title)}`;
    
    return {
      id: sectionId,
      name: section.title,
      level: 1,
      count: this.estimateSectionCount(categoryId, slugify(section.title)),
      isExpandable: section.items.length > 0,
      subcategories: section.items.map((item: string) => 
        this.mapNavItemToFilter(sectionId, item)
      )
    };
  }

  /**
   * Map navigation item to filter sub-subcategory
   */
  private mapNavItemToFilter(sectionId: string, item: string): FilterCategory {
    const itemId = `${sectionId}-${slugify(item)}`;
    
    return {
      id: itemId,
      name: item,
      level: 2,
      count: this.estimateItemCount(itemId),
      isExpandable: false
    };
  }

  /**
   * Estimate category count (placeholder implementation)
   */
  private estimateCategoryCount(categoryId: string): number {
    // Placeholder implementation - in real system would query actual data
    const estimates: Record<string, number> = {
      'women': 15000,
      'men': 8000,
      'kids': 3000,
      'home': 2000,
      'electronics': 1500,
      'pets': 500,
      'beauty': 1200,
      'sports': 800
    };
    return estimates[categoryId] || 100;
  }

  /**
   * Estimate section count (placeholder implementation)
   */
  private estimateSectionCount(categoryId: string, sectionSlug: string): number {
    // Placeholder implementation
    return Math.floor(this.estimateCategoryCount(categoryId) / 10);
  }

  /**
   * Estimate item count (placeholder implementation)
   */
  private estimateItemCount(itemId: string): number {
    // Placeholder implementation
    return Math.floor(Math.random() * 50) + 10;
  }

  /**
   * Validate categories structure
   */
  private validateCategoriesStructure(categories: readonly FilterCategory[]): void {
    const issues: string[] = [];

    if (!Array.isArray(categories)) {
      issues.push('Categories must be an array');
    }

    if (categories.length === 0) {
      issues.push('Categories array cannot be empty');
    }

    for (const category of categories) {
      if (!category.id || typeof category.id !== 'string') {
        issues.push(`Category missing valid id: ${JSON.stringify(category)}`);
      }
      
      if (!category.name || typeof category.name !== 'string') {
        issues.push(`Category missing valid name: ${category.id}`);
      }
      
      if (typeof category.level !== 'number' || category.level < 0) {
        issues.push(`Category has invalid level: ${category.id}`);
      }
      
      if (typeof category.isExpandable !== 'boolean') {
        issues.push(`Category missing isExpandable boolean: ${category.id}`);
      }

      // Validate subcategories recursively (only if they exist and are not empty)
      if (category.subcategories && category.subcategories.length > 0) {
        try {
          this.validateCategoriesStructure(category.subcategories);
        } catch (error) {
          if (error instanceof DataSourceValidationError) {
            issues.push(...error.issues.map(issue => `Subcategory of ${category.id}: ${issue}`));
          }
        }
      }
    }

    if (issues.length > 0) {
      throw new DataSourceValidationError('Categories structure validation failed', issues);
    }
  }

  /**
   * Calculate metrics for a data source
   */
  private calculateSourceMetrics(categories: readonly FilterCategory[], loadTime: number): DataSourceMetrics {
    let categoriesCount = 0;
    let subcategoriesCount = 0;
    let maxDepth = 0;

    const calculateRecursive = (cats: readonly FilterCategory[], depth: number = 0): void => {
      maxDepth = Math.max(maxDepth, depth);
      
      for (const category of cats) {
        if (depth === 0) {
          categoriesCount++;
        } else {
          subcategoriesCount++;
        }
        
        if (category.subcategories) {
          calculateRecursive(category.subcategories, depth + 1);
        }
      }
    };

    calculateRecursive(categories);

    return {
      categoriesCount,
      subcategoriesCount,
      maxDepth,
      loadTime
    };
  }

  /**
   * Get all available data sources
   */
  public getAvailableDataSources(): readonly string[] {
    return Array.from(this.dataSources.keys());
  }

  /**
   * Get data source information
   */
  public getDataSourceInfo(sourceId: string): FilterDataSource | undefined {
    return this.dataSources.get(sourceId);
  }

  /**
   * Get data source metrics
   */
  public getDataSourceMetrics(sourceId: string): DataSourceMetrics | undefined {
    return this.sourceMetrics.get(sourceId);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<DataSourceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Clear cache if caching was disabled
    if (!this.config.enableCaching) {
      this.clearCache();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): DataSourceConfig {
    return { ...this.config };
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Validate consistency between data sources
   */
  public validateDataSourceConsistency(): { isConsistent: boolean; issues: string[] } {
    const issues: string[] = [];
    
    const navigationSource = this.dataSources.get('navigation');
    const filterSource = this.dataSources.get('filter');
    
    if (!navigationSource || !filterSource) {
      issues.push('Missing required data sources for consistency check');
      return { isConsistent: false, issues };
    }

    // Compare category names and structure
    const navCategories = navigationSource.categories;
    const filterCategories = filterSource.categories;
    
    // Check for missing categories
    const navCategoryNames = new Set(navCategories.map(c => c.name));
    const filterCategoryNames = new Set(filterCategories.map(c => c.name));
    
    for (const navName of navCategoryNames) {
      if (!filterCategoryNames.has(navName)) {
        issues.push(`Navigation category '${navName}' missing in filter data`);
      }
    }
    
    for (const filterName of filterCategoryNames) {
      if (!navCategoryNames.has(filterName)) {
        issues.push(`Filter category '${filterName}' missing in navigation data`);
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const filterDataSourceManager = FilterDataSourceManager.getInstance();
