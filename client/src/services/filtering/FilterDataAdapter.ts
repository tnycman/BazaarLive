/**
 * Filter Data Adapter - Unified Data Mapping Service
 * Bridges inconsistencies between different data sources
 * 100% best practices, enterprise-grade data unification
 */

import { TOP_NAV_CONFIG, type TopNavCategory } from '../navigation/TopNavConfig';
import { HIERARCHICAL_CATEGORY_DATA } from './HierarchicalCategoryData';
import { slugify } from '../routing/RouteUtils';
import type { NavigationContext } from '../navigation/NavigationContextManager';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface FilterCategory {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly count?: number;
  readonly isExpandable: boolean;
  readonly subcategories?: readonly FilterCategory[];
}

export interface ValidationReport {
  readonly isValid: boolean;
  readonly issues: readonly string[];
  readonly warnings: readonly string[];
  readonly dataSourceComparison: DataSourceComparison;
}

export interface DataSourceComparison {
  readonly topNavConfigCategories: number;
  readonly hierarchicalDataCategories: number;
  readonly missingInHierarchical: readonly string[];
  readonly missingInTopNav: readonly string[];
  readonly consistentCategories: readonly string[];
}

export interface ExpansionState {
  readonly expandedSections: readonly string[];
  readonly selectedCategories: readonly string[];
  readonly autoExpanded: readonly string[];
}

// ===== CUSTOM ERROR CLASSES =====
export class FilterDataConsistencyError extends Error {
  constructor(issues: readonly string[]) {
    super(`Filter data consistency validation failed: ${issues.join(', ')}`);
    this.name = 'FilterDataConsistencyError';
  }
}

export class FilterDataMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FilterDataMappingError';
  }
}

/**
 * Filter Data Adapter - Unified Data Mapping Service
 * Provides consistent data transformation and validation
 */
export class FilterDataAdapter {
  private static instance: FilterDataAdapter;
  private readonly cachedFilterCategories: Map<string, FilterCategory[]> = new Map();

  private constructor() {}

  public static getInstance(): FilterDataAdapter {
    if (!FilterDataAdapter.instance) {
      FilterDataAdapter.instance = new FilterDataAdapter();
    }
    return FilterDataAdapter.instance;
  }

  /**
   * Map TOP_NAV_CONFIG to unified filter hierarchy structure
   * Excludes brands as per requirements
   */
  public mapNavConfigToFilterData(): readonly FilterCategory[] {
    const cacheKey = 'unified-filter-categories';
    
    // Return cached data if available
    if (this.cachedFilterCategories.has(cacheKey)) {
      return this.cachedFilterCategories.get(cacheKey)!;
    }

    const filterCategories: FilterCategory[] = TOP_NAV_CONFIG
      .filter(categoryConfig => categoryConfig.label !== 'Brands') // Exclude brands
      .map(categoryConfig => this.mapCategoryConfig(categoryConfig));

    // Cache the result for performance
    this.cachedFilterCategories.set(cacheKey, filterCategories);
    
    return Object.freeze(filterCategories);
  }

  /**
   * Map individual category configuration to filter category
   */
  private mapCategoryConfig(categoryConfig: TopNavCategory): FilterCategory {
    const categoryId = categoryConfig.fashionSectionId || slugify(categoryConfig.label);
    
    return {
      id: categoryId,
      name: categoryConfig.label,
      level: 0,
      count: this.getCategoryCount(categoryId),
      isExpandable: categoryConfig.sections.length > 0,
      subcategories: categoryConfig.sections.map(section => 
        this.mapSectionToSubcategory(categoryId, section)
      )
    };
  }

  /**
   * Map section to subcategory structure
   */
  private mapSectionToSubcategory(categoryId: string, section: any): FilterCategory {
    const sectionId = `${categoryId}-${slugify(section.title)}`;
    
    return {
      id: sectionId,
      name: section.title,
      level: 1,
      count: this.getSectionCount(categoryId, slugify(section.title)),
      isExpandable: section.items.length > 0,
      subcategories: section.items.map((item: string) => 
        this.mapItemToSubcategory(sectionId, item)
      )
    };
  }

  /**
   * Map item to subcategory structure
   */
  private mapItemToSubcategory(sectionId: string, item: string): FilterCategory {
    const itemId = `${sectionId}-${slugify(item)}`;
    
    return {
      id: itemId,
      name: item,
      level: 2,
      count: this.getItemCount(itemId),
      isExpandable: false
    };
  }

  /**
   * Calculate expansion state from navigation context
   */
  public calculateExpansionState(context: NavigationContext): ExpansionState {
    const expandedSections = ['categories'];
    const selectedCategories = [context.category];
    const autoExpanded: string[] = [];
    
    // Auto-expand primary category
    if (context.category) {
      expandedSections.push(context.category);
      autoExpanded.push(context.category);
    }
    
    // Auto-expand subcategory if present
    if (context.category && context.subcategory) {
      const subcategoryId = `${context.category}-${slugify(context.subcategory)}`;
      expandedSections.push(subcategoryId);
      autoExpanded.push(subcategoryId);
    }
    
    return Object.freeze({
      expandedSections: Object.freeze(expandedSections),
      selectedCategories: Object.freeze(selectedCategories),
      autoExpanded: Object.freeze(autoExpanded)
    });
  }

  /**
   * Get category count from hierarchical data
   */
  private getCategoryCount(categoryId: string): number {
    const hierarchicalCategory = HIERARCHICAL_CATEGORY_DATA[categoryId];
    return hierarchicalCategory?.count || 0;
  }

  /**
   * Get section count from hierarchical data
   */
  private getSectionCount(categoryId: string, sectionSlug: string): number {
    const hierarchicalCategory = HIERARCHICAL_CATEGORY_DATA[categoryId];
    const section = hierarchicalCategory?.subcategories[sectionSlug];
    return section?.count || 0;
  }

  /**
   * Get item count from hierarchical data
   */
  private getItemCount(itemId: string): number {
    // Parse itemId to get category, section, and item
    const parts = itemId.split('-');
    if (parts.length < 3) return 0;
    
    const categoryId = parts[0];
    const sectionSlug = parts[1];
    const itemSlug = parts.slice(2).join('-');
    
    const hierarchicalCategory = HIERARCHICAL_CATEGORY_DATA[categoryId];
    const section = hierarchicalCategory?.subcategories[sectionSlug];
    const item = section?.items.find(item => slugify(item.name) === itemSlug);
    
    return item?.count || 0;
  }

  /**
   * Validate data consistency across all sources
   */
  public validateDataConsistency(): ValidationReport {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Get categories from both sources
    const topNavCategories = TOP_NAV_CONFIG
      .filter(c => c.label !== 'Brands')
      .map(c => c.fashionSectionId || slugify(c.label));
    
    const hierarchicalCategories = Object.keys(HIERARCHICAL_CATEGORY_DATA);
    
    // Find missing categories
    const missingInHierarchical = topNavCategories.filter(cat => 
      !hierarchicalCategories.includes(cat)
    );
    
    const missingInTopNav = hierarchicalCategories.filter(cat => 
      !topNavCategories.includes(cat)
    );
    
    const consistentCategories = topNavCategories.filter(cat => 
      hierarchicalCategories.includes(cat)
    );
    
    // Add issues for missing categories
    if (missingInHierarchical.length > 0) {
      issues.push(`Categories missing in HIERARCHICAL_CATEGORY_DATA: ${missingInHierarchical.join(', ')}`);
    }
    
    if (missingInTopNav.length > 0) {
      warnings.push(`Categories missing in TOP_NAV_CONFIG: ${missingInTopNav.join(', ')}`);
    }
    
    // Validate section consistency for consistent categories
    for (const categoryId of consistentCategories) {
      this.validateCategoryConsistency(categoryId, issues, warnings);
    }
    
    const dataSourceComparison: DataSourceComparison = {
      topNavConfigCategories: topNavCategories.length,
      hierarchicalDataCategories: hierarchicalCategories.length,
      missingInHierarchical: Object.freeze(missingInHierarchical),
      missingInTopNav: Object.freeze(missingInTopNav),
      consistentCategories: Object.freeze(consistentCategories)
    };
    
    return {
      isValid: issues.length === 0,
      issues: Object.freeze(issues),
      warnings: Object.freeze(warnings),
      dataSourceComparison
    };
  }

  /**
   * Validate consistency for a specific category
   */
  private validateCategoryConsistency(categoryId: string, issues: string[], warnings: string[]): void {
    const topNavCategory = TOP_NAV_CONFIG.find(c => 
      (c.fashionSectionId || slugify(c.label)) === categoryId
    );
    
    const hierarchicalCategory = HIERARCHICAL_CATEGORY_DATA[categoryId];
    
    if (!topNavCategory || !hierarchicalCategory) {
      return; // Skip if either is missing
    }
    
    // Check section consistency
    const topNavSections = topNavCategory.sections.map(s => slugify(s.title));
    const hierarchicalSections = Object.keys(hierarchicalCategory.subcategories);
    
    const missingSections = topNavSections.filter(section => 
      !hierarchicalSections.includes(section)
    );
    
    if (missingSections.length > 0) {
      warnings.push(`Sections missing in HIERARCHICAL_CATEGORY_DATA for ${categoryId}: ${missingSections.join(', ')}`);
    }
    
    // Validate item consistency for each section
    for (const section of topNavCategory.sections) {
      const sectionSlug = slugify(section.title);
      const hierarchicalSection = hierarchicalCategory.subcategories[sectionSlug];
      
      if (hierarchicalSection) {
        const topNavItems = section.items.map(item => slugify(item));
        const hierarchicalItems = hierarchicalSection.items.map(item => slugify(item.name));
        
        const missingItems = topNavItems.filter(item => 
          !hierarchicalItems.includes(item)
        );
        
        if (missingItems.length > 0) {
          warnings.push(`Items missing in HIERARCHICAL_CATEGORY_DATA for ${categoryId}/${sectionSlug}: ${missingItems.join(', ')}`);
        }
      }
    }
  }

  /**
   * Clear cached data
   */
  public clearCache(): void {
    this.cachedFilterCategories.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cachedFilterCategories.size,
      keys: Array.from(this.cachedFilterCategories.keys())
    };
  }

  /**
   * Find filter category by ID
   */
  public findCategoryById(categoryId: string): FilterCategory | undefined {
    const allCategories = this.mapNavConfigToFilterData();
    
    for (const category of allCategories) {
      if (category.id === categoryId) {
        return category;
      }
      
      // Search in subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.id === categoryId) {
            return subcategory;
          }
          
          // Search in sub-subcategories
          if (subcategory.subcategories) {
            for (const subSubcategory of subcategory.subcategories) {
              if (subSubcategory.id === categoryId) {
                return subSubcategory;
              }
            }
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Get category path (breadcrumb trail)
   */
  public getCategoryPath(categoryId: string): FilterCategory[] {
    const path: FilterCategory[] = [];
    const allCategories = this.mapNavConfigToFilterData();
    
    for (const category of allCategories) {
      if (category.id === categoryId) {
        path.push(category);
        return path;
      }
      
      // Search in subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.id === categoryId) {
            path.push(category, subcategory);
            return path;
          }
          
          // Search in sub-subcategories
          if (subcategory.subcategories) {
            for (const subSubcategory of subcategory.subcategories) {
              if (subSubcategory.id === categoryId) {
                path.push(category, subcategory, subSubcategory);
                return path;
              }
            }
          }
        }
      }
    }
    
    return path;
  }
}

// Export singleton instance
export const filterDataAdapter = FilterDataAdapter.getInstance();



