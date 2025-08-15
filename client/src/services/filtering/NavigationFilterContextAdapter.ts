/**
 * Navigation Filter Context Adapter - Context Bridge Service
 * Bridges navigation context with filter data requirements
 * 100% best practices, enterprise-grade context transformation
 */

import type { NavigationContext } from '../navigation/NavigationContextManager';
import { categoryIdMappingService, type MappingResult } from './CategoryIdMappingService';
import { filterDataSourceManager } from './FilterDataSourceManager';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface FilterContextState {
  readonly selectedCategories: readonly string[];
  readonly expandedSections: readonly string[];
  readonly highlightedCategories: readonly string[];
  readonly activePath: readonly string[];
  readonly metadata: FilterContextMetadata;
}

export interface FilterContextMetadata {
  readonly source: 'navigation' | 'filter' | 'hybrid';
  readonly confidence: number;
  readonly transformationApplied: boolean;
  readonly mappingResults: readonly MappingResult[];
  readonly fallbackUsed: boolean;
}

export interface ContextTransformationOptions {
  readonly enableIdMapping: boolean;
  readonly useHighConfidenceOnly: boolean;
  readonly fallbackToOriginal: boolean;
  readonly includeParentCategories: boolean;
  readonly maxExpansionDepth: number;
}

export interface ContextValidationResult {
  readonly isValid: boolean;
  readonly issues: readonly string[];
  readonly transformedSuccessfully: boolean;
  readonly confidence: number;
}

// ===== CUSTOM ERROR CLASSES =====
export class NavigationContextAdapterError extends Error {
  constructor(message: string, public readonly context?: NavigationContext) {
    super(`Navigation context adapter error: ${message}`);
    this.name = 'NavigationContextAdapterError';
  }
}

export class ContextTransformationError extends Error {
  constructor(message: string, public readonly transformationStep: string) {
    super(`Context transformation failed at ${transformationStep}: ${message}`);
    this.name = 'ContextTransformationError';
  }
}

/**
 * Navigation Filter Context Adapter - Enterprise Context Bridge
 * Transforms navigation context to filter-compatible format
 */
export class NavigationFilterContextAdapter {
  private static instance: NavigationFilterContextAdapter;
  private readonly transformationCache: Map<string, FilterContextState> = new Map();
  private readonly transformationStats = {
    total: 0,
    successful: 0,
    fallbacks: 0,
    totalConfidence: 0
  };
  private defaultOptions: ContextTransformationOptions = {
    enableIdMapping: true,
    useHighConfidenceOnly: false,
    fallbackToOriginal: true,
    includeParentCategories: true,
    maxExpansionDepth: 3
  };

  private constructor() {}

  public static getInstance(): NavigationFilterContextAdapter {
    if (!NavigationFilterContextAdapter.instance) {
      NavigationFilterContextAdapter.instance = new NavigationFilterContextAdapter();
    }
    return NavigationFilterContextAdapter.instance;
  }

  /**
   * Transform navigation context to filter context state
   */
  public transformToFilterContext(
    navigationContext: NavigationContext | null,
    options: Partial<ContextTransformationOptions> = {}
  ): FilterContextState {
    const fullOptions = { ...this.defaultOptions, ...options };
    
    // Handle null navigation context
    if (!navigationContext) {
      return this.createFallbackFilterContext(fullOptions);
    }

    // Check cache
    const cacheKey = this.createCacheKey(navigationContext, fullOptions);
    if (this.transformationCache.has(cacheKey)) {
      return this.transformationCache.get(cacheKey)!;
    }

    try {
      const filterContext = this.performTransformation(navigationContext, fullOptions);
      
      // Update stats
      this.transformationStats.total++;
      this.transformationStats.successful++;
      this.transformationStats.totalConfidence += filterContext.metadata.confidence;
      
      // Cache successful transformation
      this.transformationCache.set(cacheKey, filterContext);
      
      return filterContext;
    } catch (error) {
      this.transformationStats.total++;
      
      if (fullOptions.fallbackToOriginal) {
        this.transformationStats.fallbacks++;
        return this.createFallbackFilterContext(fullOptions, navigationContext);
      } else {
        throw error;
      }
    }
  }

  /**
   * Perform the actual context transformation
   */
  private performTransformation(
    navigationContext: NavigationContext,
    options: ContextTransformationOptions
  ): FilterContextState {
    const mappingResults: MappingResult[] = [];
    let transformationApplied = false;
    let overallConfidence = 1.0;

    // Transform selected categories
    const selectedCategories = this.transformSelectedCategories(
      navigationContext,
      options,
      mappingResults
    );

    // Transform expanded sections
    const expandedSections = this.transformExpandedSections(
      navigationContext,
      options,
      mappingResults
    );

    // Create highlighted categories
    const highlightedCategories = this.createHighlightedCategories(
      navigationContext,
      selectedCategories,
      options
    );

    // Create active path
    const activePath = this.createActivePath(navigationContext, options);

    // Calculate overall confidence
    if (mappingResults.length > 0) {
      overallConfidence = mappingResults.reduce((sum, result) => sum + result.confidence, 0) / mappingResults.length;
      transformationApplied = true;
    }

    // Filter out low confidence results if requested
    if (options.useHighConfidenceOnly) {
      const highConfidenceMappings = mappingResults.filter(result => result.confidence >= 0.8);
      if (highConfidenceMappings.length === 0 && options.fallbackToOriginal) {
        return this.createFallbackFilterContext(options, navigationContext);
      }
    }

    const metadata: FilterContextMetadata = {
      source: transformationApplied ? 'hybrid' : 'navigation',
      confidence: overallConfidence,
      transformationApplied,
      mappingResults: Object.freeze(mappingResults),
      fallbackUsed: false
    };

    return Object.freeze({
      selectedCategories: Object.freeze(selectedCategories),
      expandedSections: Object.freeze(expandedSections),
      highlightedCategories: Object.freeze(highlightedCategories),
      activePath: Object.freeze(activePath),
      metadata: Object.freeze(metadata)
    });
  }

  /**
   * Transform selected categories with ID mapping
   */
  private transformSelectedCategories(
    navigationContext: NavigationContext,
    options: ContextTransformationOptions,
    mappingResults: MappingResult[]
  ): string[] {
    const selectedCategories: string[] = [];

    // Always include the primary category
    if (navigationContext.category) {
      if (options.enableIdMapping) {
        try {
          const mappingResult = categoryIdMappingService.mapNavigationToFilter(
            navigationContext.category,
            { 
              category: navigationContext.category,
              level: 0 
            }
          );
          mappingResults.push(mappingResult);
          selectedCategories.push(mappingResult.mappedId);
        } catch (error) {
          // Fallback to original ID
          selectedCategories.push(navigationContext.category);
        }
      } else {
        selectedCategories.push(navigationContext.category);
      }
    }

    return selectedCategories;
  }

  /**
   * Transform expanded sections with proper ID mapping
   */
  private transformExpandedSections(
    navigationContext: NavigationContext,
    options: ContextTransformationOptions,
    mappingResults: MappingResult[]
  ): string[] {
    const expandedSections: string[] = ['categories']; // Always expand categories section

    // Process each expanded section from navigation context
    for (const section of navigationContext.expandedSections) {
      if (section === 'categories') {
        continue; // Already added
      }

      if (options.enableIdMapping) {
        try {
          const mappingResult = categoryIdMappingService.mapNavigationToFilter(
            section,
            {
              category: navigationContext.category,
              subcategory: navigationContext.subcategory,
              level: this.determineSectionLevel(section, navigationContext)
            }
          );
          mappingResults.push(mappingResult);
          expandedSections.push(mappingResult.mappedId);
        } catch (error) {
          // Fallback to original section
          expandedSections.push(section);
        }
      } else {
        expandedSections.push(section);
      }
    }

    // Include parent categories if requested
    if (options.includeParentCategories && navigationContext.category) {
      if (!expandedSections.includes(navigationContext.category)) {
        expandedSections.push(navigationContext.category);
      }
    }

    return expandedSections;
  }

  /**
   * Create highlighted categories for visual feedback
   */
  private createHighlightedCategories(
    navigationContext: NavigationContext,
    selectedCategories: readonly string[],
    options: ContextTransformationOptions
  ): string[] {
    const highlightedCategories: string[] = [...selectedCategories];

    // Add subcategory if present
    if (navigationContext.subcategory && options.enableIdMapping) {
      try {
        const mappingResult = categoryIdMappingService.mapNavigationToFilter(
          navigationContext.subcategory,
          {
            category: navigationContext.category,
            subcategory: navigationContext.subcategory,
            level: 1
          }
        );
        highlightedCategories.push(mappingResult.mappedId);
      } catch (error) {
        // Fallback to original subcategory
        if (navigationContext.subcategory) {
          highlightedCategories.push(navigationContext.subcategory);
        }
      }
    }

    return Array.from(new Set(highlightedCategories)); // Remove duplicates
  }

  /**
   * Create active path for breadcrumb and navigation
   */
  private createActivePath(
    navigationContext: NavigationContext,
    options: ContextTransformationOptions
  ): string[] {
    const activePath: string[] = [];

    if (navigationContext.category) {
      activePath.push(navigationContext.category);
    }

    if (navigationContext.subcategory) {
      activePath.push(navigationContext.subcategory);
    }

    if (navigationContext.leaf) {
      activePath.push(navigationContext.leaf);
    }

    return activePath;
  }

  /**
   * Determine the level of a section in the hierarchy
   */
  private determineSectionLevel(section: string, navigationContext: NavigationContext): number {
    if (section === navigationContext.category) {
      return 0;
    }
    
    if (section.includes('-') && section.startsWith(navigationContext.category || '')) {
      return 1;
    }
    
    return 2; // Default to leaf level
  }

  /**
   * Create fallback filter context when transformation fails
   */
  private createFallbackFilterContext(
    options: ContextTransformationOptions,
    navigationContext?: NavigationContext
  ): FilterContextState {
    const fallbackCategories = navigationContext?.category ? [navigationContext.category] : ['women'];
    const fallbackExpanded = ['categories', ...fallbackCategories];

    const metadata: FilterContextMetadata = {
      source: 'filter',
      confidence: 0.5,
      transformationApplied: false,
      mappingResults: Object.freeze([]),
      fallbackUsed: true
    };

    return {
      selectedCategories: Object.freeze(fallbackCategories),
      expandedSections: Object.freeze(fallbackExpanded),
      highlightedCategories: Object.freeze(fallbackCategories),
      activePath: Object.freeze(fallbackCategories),
      metadata: Object.freeze(metadata)
    };
  }

  /**
   * Create cache key for transformation results
   */
  private createCacheKey(
    navigationContext: NavigationContext,
    options: ContextTransformationOptions
  ): string {
    const contextKey = `${navigationContext.category || ''}-${navigationContext.subcategory || ''}-${navigationContext.leaf || ''}`;
    const optionsKey = JSON.stringify(options);
    return `${contextKey}:${optionsKey}`;
  }

  /**
   * Validate navigation context for transformation
   */
  public validateNavigationContext(
    navigationContext: NavigationContext | null
  ): ContextValidationResult {
    const issues: string[] = [];
    let confidence = 1.0;
    let transformedSuccessfully = false;

    if (!navigationContext) {
      issues.push('Navigation context is null');
      confidence = 0.0;
    } else {
      // Validate required fields
      if (!navigationContext.category) {
        issues.push('Navigation context missing category');
        confidence *= 0.5;
      }

      if (!navigationContext.expandedSections || navigationContext.expandedSections.length === 0) {
        issues.push('Navigation context missing expanded sections');
        confidence *= 0.7;
      }

      // Test transformation
      try {
        const testResult = this.transformToFilterContext(navigationContext, { 
          enableIdMapping: true,
          fallbackToOriginal: false 
        });
        transformedSuccessfully = testResult.metadata.transformationApplied;
        confidence *= testResult.metadata.confidence;
      } catch (error) {
        issues.push(`Transformation test failed: ${error}`);
        confidence *= 0.3;
      }
    }

    return {
      isValid: issues.length === 0,
      issues: Object.freeze(issues),
      transformedSuccessfully,
      confidence
    };
  }

  /**
   * Update default transformation options
   */
  public updateDefaultOptions(newOptions: Partial<ContextTransformationOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...newOptions };
    this.clearCache(); // Clear cache when options change
  }

  /**
   * Get current default options
   */
  public getDefaultOptions(): ContextTransformationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Clear transformation cache
   */
  public clearCache(): void {
    this.transformationCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.transformationCache.size,
      keys: Array.from(this.transformationCache.keys())
    };
  }

  /**
   * Get transformation statistics
   */
  public getTransformationStats(): {
    totalTransformations: number;
    successfulTransformations: number;
    averageConfidence: number;
    fallbacksUsed: number;
  } {
    return {
      totalTransformations: this.transformationStats.total,
      successfulTransformations: this.transformationStats.successful,
      averageConfidence: this.transformationStats.total > 0 
        ? this.transformationStats.totalConfidence / this.transformationStats.total
        : 0,
      fallbacksUsed: this.transformationStats.fallbacks
    };
  }

  /**
   * Test transformation with different options
   */
  public testTransformation(
    navigationContext: NavigationContext,
    testOptions: Partial<ContextTransformationOptions>[]
  ): Array<{ options: ContextTransformationOptions; result: FilterContextState; error?: string }> {
    const results: Array<{ options: ContextTransformationOptions; result: FilterContextState; error?: string }> = [];

    for (const partialOptions of testOptions) {
      const fullOptions = { ...this.defaultOptions, ...partialOptions };
      
      try {
        const result = this.transformToFilterContext(navigationContext, fullOptions);
        results.push({ options: fullOptions, result });
      } catch (error) {
        const fallbackResult = this.createFallbackFilterContext(fullOptions, navigationContext);
        results.push({ 
          options: fullOptions, 
          result: fallbackResult, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const navigationFilterContextAdapter = NavigationFilterContextAdapter.getInstance();
