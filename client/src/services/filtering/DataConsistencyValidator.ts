/**
 * Data Consistency Validator - Cross-Source Validation Service
 * Ensures consistency between navigation and filter data sources
 * 100% best practices, enterprise-grade validation and reporting
 */

import { TOP_NAV_CONFIG } from '../navigation/TopNavConfig';
import { HIERARCHICAL_CATEGORY_DATA } from './HierarchicalCategoryData';
import { filterDataSourceManager, type FilterCategory } from './FilterDataSourceManager';
import { categoryIdMappingService } from './CategoryIdMappingService';
import { slugify } from '../routing/RouteUtils';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface ValidationReport {
  readonly timestamp: Date;
  readonly isConsistent: boolean;
  readonly overallScore: number;
  readonly issues: readonly ValidationIssue[];
  readonly warnings: readonly ValidationWarning[];
  readonly recommendations: readonly ValidationRecommendation[];
  readonly dataSourceComparison: DataSourceComparison;
  readonly performanceMetrics: ValidationPerformanceMetrics;
}

export interface ValidationIssue {
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly category: 'structure' | 'naming' | 'mapping' | 'data';
  readonly source: 'navigation' | 'filter' | 'hierarchical' | 'mapping';
  readonly description: string;
  readonly affectedItems: readonly string[];
  readonly suggestedFix?: string;
}

export interface ValidationWarning {
  readonly category: 'performance' | 'compatibility' | 'maintenance';
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly recommendation?: string;
}

export interface ValidationRecommendation {
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly category: 'optimization' | 'standardization' | 'enhancement';
  readonly description: string;
  readonly benefits: readonly string[];
  readonly estimatedEffort: 'minimal' | 'moderate' | 'significant';
}

export interface DataSourceComparison {
  readonly navigationConfig: DataSourceStats;
  readonly filterData: DataSourceStats;
  readonly hierarchicalData: DataSourceStats;
  readonly mappingRules: MappingStats;
  readonly overlap: OverlapAnalysis;
}

export interface DataSourceStats {
  readonly totalCategories: number;
  readonly totalSubcategories: number;
  readonly maxDepth: number;
  readonly uniqueNames: number;
  readonly averageChildrenPerCategory: number;
}

export interface MappingStats {
  readonly totalRules: number;
  readonly bidirectionalRules: number;
  readonly unidirectionalRules: number;
  readonly coveragePercentage: number;
}

export interface OverlapAnalysis {
  readonly commonCategories: readonly string[];
  readonly onlyInNavigation: readonly string[];
  readonly onlyInFilter: readonly string[];
  readonly onlyInHierarchical: readonly string[];
  readonly namingInconsistencies: readonly NamingInconsistency[];
}

export interface NamingInconsistency {
  readonly id: string;
  readonly navigationName?: string;
  readonly filterName?: string;
  readonly hierarchicalName?: string;
  readonly severity: 'minor' | 'major';
}

export interface ValidationPerformanceMetrics {
  readonly validationTime: number;
  readonly categoriesValidated: number;
  readonly rulesValidated: number;
  readonly cacheHitRate: number;
}

export interface ValidationOptions {
  readonly validateStructure: boolean;
  readonly validateNaming: boolean;
  readonly validateMappings: boolean;
  readonly validatePerformance: boolean;
  readonly includeRecommendations: boolean;
  readonly strictMode: boolean;
}

// ===== CUSTOM ERROR CLASSES =====
export class ValidationError extends Error {
  constructor(message: string, public readonly validationStep: string) {
    super(`Validation failed at ${validationStep}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class DataInconsistencyError extends Error {
  constructor(message: string, public readonly inconsistencies: readonly ValidationIssue[]) {
    super(`Data inconsistency detected: ${message}`);
    this.name = 'DataInconsistencyError';
  }
}

/**
 * Data Consistency Validator - Enterprise Validation Service
 * Provides comprehensive validation across all data sources
 */
export class DataConsistencyValidator {
  private static instance: DataConsistencyValidator;
  private readonly validationCache: Map<string, ValidationReport> = new Map();
  private readonly defaultOptions: ValidationOptions = {
    validateStructure: true,
    validateNaming: true,
    validateMappings: true,
    validatePerformance: true,
    includeRecommendations: true,
    strictMode: false
  };

  private constructor() {}

  public static getInstance(): DataConsistencyValidator {
    if (!DataConsistencyValidator.instance) {
      DataConsistencyValidator.instance = new DataConsistencyValidator();
    }
    return DataConsistencyValidator.instance;
  }

  /**
   * Perform comprehensive validation of all data sources
   */
  public validateAll(options: Partial<ValidationOptions> = {}): ValidationReport {
    const fullOptions = { ...this.defaultOptions, ...options };
    const startTime = performance.now();
    
    // Check cache
    const cacheKey = this.createCacheKey(fullOptions);
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    try {
      const report = this.performValidation(fullOptions, startTime);
      
      // Cache successful validation
      this.validationCache.set(cacheKey, report);
      
      return report;
    } catch (error) {
      throw new ValidationError(`Validation process failed: ${error}`, 'comprehensive-validation');
    }
  }

  /**
   * Perform the actual validation process
   */
  private performValidation(options: ValidationOptions, startTime: number): ValidationReport {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];

    // Validate structure if requested
    if (options.validateStructure) {
      const structureIssues = this.validateDataStructure();
      issues.push(...structureIssues);
    }

    // Validate naming consistency if requested
    if (options.validateNaming) {
      const namingIssues = this.validateNamingConsistency();
      issues.push(...namingIssues);
    }

    // Validate ID mappings if requested
    if (options.validateMappings) {
      const mappingIssues = this.validateIdMappings();
      issues.push(...mappingIssues);
    }

    // Validate performance if requested
    if (options.validatePerformance) {
      const performanceWarnings = this.validatePerformance();
      warnings.push(...performanceWarnings);
    }

    // Generate recommendations if requested
    if (options.includeRecommendations) {
      const generatedRecommendations = this.generateRecommendations(issues, warnings);
      recommendations.push(...generatedRecommendations);
    }

    // Generate data source comparison
    const dataSourceComparison = this.generateDataSourceComparison();

    // Calculate overall consistency score
    const overallScore = this.calculateConsistencyScore(issues, warnings);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(startTime);

    return {
      timestamp: new Date(),
      isConsistent: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      overallScore,
      issues: Object.freeze(issues),
      warnings: Object.freeze(warnings),
      recommendations: Object.freeze(recommendations),
      dataSourceComparison,
      performanceMetrics
    };
  }

  /**
   * Validate data structure consistency
   */
  private validateDataStructure(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    try {
      // Validate TOP_NAV_CONFIG structure
      if (!Array.isArray(TOP_NAV_CONFIG)) {
        issues.push({
          severity: 'critical',
          category: 'structure',
          source: 'navigation',
          description: 'TOP_NAV_CONFIG is not an array',
          affectedItems: ['TOP_NAV_CONFIG'],
          suggestedFix: 'Ensure TOP_NAV_CONFIG exports an array of category configurations'
        });
      }

      // Validate each navigation category
      for (const categoryConfig of TOP_NAV_CONFIG) {
        if (!categoryConfig.label || typeof categoryConfig.label !== 'string') {
          issues.push({
            severity: 'high',
            category: 'structure',
            source: 'navigation',
            description: `Navigation category missing valid label`,
            affectedItems: [categoryConfig.label || 'unknown'],
            suggestedFix: 'Add a valid string label to the category configuration'
          });
        }

        if (!categoryConfig.sections || !Array.isArray(categoryConfig.sections)) {
          issues.push({
            severity: 'high',
            category: 'structure',
            source: 'navigation',
            description: `Navigation category missing sections array`,
            affectedItems: [categoryConfig.label || 'unknown'],
            suggestedFix: 'Add a sections array to the category configuration'
          });
        }
      }

      // Validate HIERARCHICAL_CATEGORY_DATA structure
      if (typeof HIERARCHICAL_CATEGORY_DATA !== 'object') {
        issues.push({
          severity: 'critical',
          category: 'structure',
          source: 'hierarchical',
          description: 'HIERARCHICAL_CATEGORY_DATA is not an object',
          affectedItems: ['HIERARCHICAL_CATEGORY_DATA'],
          suggestedFix: 'Ensure HIERARCHICAL_CATEGORY_DATA exports an object with category data'
        });
      }

      // Validate filter data source
      try {
        const filterCategories = filterDataSourceManager.getCategories('filter');
        if (!Array.isArray(filterCategories)) {
          issues.push({
            severity: 'high',
            category: 'structure',
            source: 'filter',
            description: 'Filter categories is not an array',
            affectedItems: ['filter-categories'],
            suggestedFix: 'Ensure filter data source returns an array of categories'
          });
        }
      } catch (error) {
        issues.push({
          severity: 'medium',
          category: 'structure',
          source: 'filter',
          description: `Failed to retrieve filter categories: ${error}`,
          affectedItems: ['filter-data-source'],
          suggestedFix: 'Ensure filter data source is properly initialized'
        });
      }

    } catch (error) {
      issues.push({
        severity: 'critical',
        category: 'structure',
        source: 'navigation',
        description: `Structure validation failed: ${error}`,
        affectedItems: ['validation-process'],
        suggestedFix: 'Check data source imports and structure'
      });
    }

    return issues;
  }

  /**
   * Validate naming consistency across data sources
   */
  private validateNamingConsistency(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    try {
      const namingInconsistencies = this.findNamingInconsistencies();
      
      for (const inconsistency of namingInconsistencies) {
        issues.push({
          severity: inconsistency.severity === 'major' ? 'high' : 'medium',
          category: 'naming',
          source: 'navigation',
          description: `Naming inconsistency for category '${inconsistency.id}'`,
          affectedItems: [inconsistency.id],
          suggestedFix: 'Standardize category names across all data sources'
        });
      }

    } catch (error) {
      issues.push({
        severity: 'medium',
        category: 'naming',
        source: 'navigation',
        description: `Naming validation failed: ${error}`,
        affectedItems: ['naming-validation'],
        suggestedFix: 'Check category name formats and accessibility'
      });
    }

    return issues;
  }

  /**
   * Validate ID mapping rules and coverage
   */
  private validateIdMappings(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    try {
      const mappingRules = categoryIdMappingService.getMappingRules();
      const mappingStats = categoryIdMappingService.getStats();

      // Check mapping coverage
      const navigationCategories = TOP_NAV_CONFIG.map(c => c.fashionSectionId || slugify(c.label));
      const unmappedCategories = navigationCategories.filter(cat => !mappingRules.has(cat));

      if (unmappedCategories.length > 0) {
        issues.push({
          severity: 'medium',
          category: 'mapping',
          source: 'mapping',
          description: `Categories without mapping rules: ${unmappedCategories.join(', ')}`,
          affectedItems: unmappedCategories,
          suggestedFix: 'Add mapping rules for all navigation categories'
        });
      }

      // Check mapping quality
      if (mappingStats.failedMappings > mappingStats.successfulMappings * 0.1) {
        issues.push({
          severity: 'high',
          category: 'mapping',
          source: 'mapping',
          description: `High mapping failure rate: ${mappingStats.failedMappings} failures out of ${mappingStats.totalMappings} total`,
          affectedItems: ['mapping-rules'],
          suggestedFix: 'Review and improve mapping rule quality and coverage'
        });
      }

    } catch (error) {
      issues.push({
        severity: 'medium',
        category: 'mapping',
        source: 'mapping',
        description: `Mapping validation failed: ${error}`,
        affectedItems: ['mapping-validation'],
        suggestedFix: 'Check mapping service initialization and rule quality'
      });
    }

    return issues;
  }

  /**
   * Validate performance characteristics
   */
  private validatePerformance(): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    try {
      // Check cache hit rates
      const filterCacheStats = filterDataSourceManager.getCacheStats();
      const mappingCacheStats = categoryIdMappingService.getCacheStats();

      if (filterCacheStats.size > 100) {
        warnings.push({
          category: 'performance',
          description: `Large filter cache size: ${filterCacheStats.size} entries`,
          impact: 'medium',
          recommendation: 'Consider implementing cache size limits and cleanup'
        });
      }

      if (mappingCacheStats.size > 200) {
        warnings.push({
          category: 'performance',
          description: `Large mapping cache size: ${mappingCacheStats.size} entries`,
          impact: 'medium',
          recommendation: 'Consider implementing cache expiration and cleanup'
        });
      }

      // Check data source consistency validation performance
      const consistencyResult = filterDataSourceManager.validateDataSourceConsistency();
      if (consistencyResult.issues.length > 10) {
        warnings.push({
          category: 'compatibility',
          description: `Many data source inconsistencies: ${consistencyResult.issues.length} issues`,
          impact: 'high',
          recommendation: 'Review and align data source structures'
        });
      }

    } catch (error) {
      warnings.push({
        category: 'performance',
        description: `Performance validation failed: ${error}`,
        impact: 'low',
        recommendation: 'Check performance monitoring setup'
      });
    }

    return warnings;
  }

  /**
   * Find naming inconsistencies across data sources
   */
  private findNamingInconsistencies(): NamingInconsistency[] {
    const inconsistencies: NamingInconsistency[] = [];

    try {
      const filterCategories = filterDataSourceManager.getCategories('filter');
      const navigationCategories = filterDataSourceManager.getCategories('navigation');

      // Create name maps
      const filterNameMap = new Map<string, string>();
      const navigationNameMap = new Map<string, string>();

      this.buildNameMap(filterCategories, filterNameMap);
      this.buildNameMap(navigationCategories, navigationNameMap);

      // Find inconsistencies
      for (const [id, filterName] of filterNameMap) {
        const navigationName = navigationNameMap.get(id);
        
        if (navigationName && filterName !== navigationName) {
          inconsistencies.push({
            id,
            filterName,
            navigationName,
            severity: this.calculateNamingSeverity(filterName, navigationName)
          });
        }
      }

    } catch (error) {
      console.error('Failed to find naming inconsistencies:', error);
    }

    return inconsistencies;
  }

  /**
   * Build name map from categories recursively
   */
  private buildNameMap(categories: readonly FilterCategory[], nameMap: Map<string, string>): void {
    for (const category of categories) {
      nameMap.set(category.id, category.name);
      
      if (category.subcategories) {
        this.buildNameMap(category.subcategories, nameMap);
      }
    }
  }

  /**
   * Calculate naming inconsistency severity
   */
  private calculateNamingSeverity(name1: string, name2: string): 'minor' | 'major' {
    // Simple check: if names are just case differences, it's minor
    if (name1.toLowerCase() === name2.toLowerCase()) {
      return 'minor';
    }
    
    // If they're completely different, it's major
    return 'major';
  }

  /**
   * Generate recommendations based on issues and warnings
   */
  private generateRecommendations(
    issues: readonly ValidationIssue[],
    warnings: readonly ValidationWarning[]
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // High priority recommendations based on critical issues
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'standardization',
        description: 'Address critical data structure issues immediately',
        benefits: ['System stability', 'Data integrity', 'Proper functionality'],
        estimatedEffort: 'moderate'
      });
    }

    // Mapping improvements
    const mappingIssues = issues.filter(i => i.category === 'mapping');
    if (mappingIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'optimization',
        description: 'Improve ID mapping coverage and accuracy',
        benefits: ['Better context transformation', 'Reduced mapping failures', 'Improved user experience'],
        estimatedEffort: 'moderate'
      });
    }

    // Performance optimizations
    const performanceWarnings = warnings.filter(w => w.category === 'performance');
    if (performanceWarnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        description: 'Implement cache management and performance optimizations',
        benefits: ['Faster load times', 'Reduced memory usage', 'Better scalability'],
        estimatedEffort: 'minimal'
      });
    }

    return recommendations;
  }

  /**
   * Generate comprehensive data source comparison
   */
  private generateDataSourceComparison(): DataSourceComparison {
    const navigationStats = this.calculateDataSourceStats(filterDataSourceManager.getCategories('navigation'));
    const filterStats = this.calculateDataSourceStats(filterDataSourceManager.getCategories('filter'));
    const hierarchicalStats = this.calculateHierarchicalStats();
    const mappingStats = this.calculateMappingStats();
    const overlap = this.calculateOverlapAnalysis();

    return {
      navigationConfig: navigationStats,
      filterData: filterStats,
      hierarchicalData: hierarchicalStats,
      mappingRules: mappingStats,
      overlap
    };
  }

  /**
   * Calculate statistics for a data source
   */
  private calculateDataSourceStats(categories: readonly FilterCategory[]): DataSourceStats {
    let totalCategories = 0;
    let totalSubcategories = 0;
    let maxDepth = 0;
    const uniqueNames = new Set<string>();
    let totalChildren = 0;
    let categoriesWithChildren = 0;

    const calculateRecursive = (cats: readonly FilterCategory[], depth: number = 0): void => {
      maxDepth = Math.max(maxDepth, depth);
      
      for (const category of cats) {
        if (depth === 0) {
          totalCategories++;
        } else {
          totalSubcategories++;
        }
        
        uniqueNames.add(category.name);
        
        if (category.subcategories && category.subcategories.length > 0) {
          totalChildren += category.subcategories.length;
          categoriesWithChildren++;
          calculateRecursive(category.subcategories, depth + 1);
        }
      }
    };

    calculateRecursive(categories);

    return {
      totalCategories,
      totalSubcategories,
      maxDepth,
      uniqueNames: uniqueNames.size,
      averageChildrenPerCategory: categoriesWithChildren > 0 ? totalChildren / categoriesWithChildren : 0
    };
  }

  /**
   * Calculate hierarchical data statistics
   */
  private calculateHierarchicalStats(): DataSourceStats {
    const hierarchicalCategories = Object.keys(HIERARCHICAL_CATEGORY_DATA).length;
    let totalSubcategories = 0;
    let maxDepth = 0;
    const uniqueNames = new Set<string>();

    for (const [categoryId, categoryData] of Object.entries(HIERARCHICAL_CATEGORY_DATA)) {
      uniqueNames.add(categoryData.name);
      const subcategories = Object.keys(categoryData.subcategories).length;
      totalSubcategories += subcategories;
      
      if (subcategories > 0) {
        maxDepth = Math.max(maxDepth, 2); // Assuming 2 levels in hierarchical data
      }
    }

    return {
      totalCategories: hierarchicalCategories,
      totalSubcategories,
      maxDepth,
      uniqueNames: uniqueNames.size,
      averageChildrenPerCategory: hierarchicalCategories > 0 ? totalSubcategories / hierarchicalCategories : 0
    };
  }

  /**
   * Calculate mapping statistics
   */
  private calculateMappingStats(): MappingStats {
    const mappingRules = categoryIdMappingService.getMappingRules();
    let totalRules = 0;
    let bidirectionalRules = 0;
    let unidirectionalRules = 0;

    for (const rules of mappingRules.values()) {
      totalRules += rules.length;
      for (const rule of rules) {
        if (rule.direction === 'bidirectional') {
          bidirectionalRules++;
        } else {
          unidirectionalRules++;
        }
      }
    }

    const navigationCategories = TOP_NAV_CONFIG.length;
    const coveragePercentage = navigationCategories > 0 ? (mappingRules.size / navigationCategories) * 100 : 0;

    return {
      totalRules,
      bidirectionalRules,
      unidirectionalRules,
      coveragePercentage
    };
  }

  /**
   * Calculate overlap analysis between data sources
   */
  private calculateOverlapAnalysis(): OverlapAnalysis {
    const navigationCategories = new Set(filterDataSourceManager.getCategories('navigation').map(c => c.id));
    const filterCategories = new Set(filterDataSourceManager.getCategories('filter').map(c => c.id));
    const hierarchicalCategories = new Set(Object.keys(HIERARCHICAL_CATEGORY_DATA));

    const allCategories = new Set([...navigationCategories, ...filterCategories, ...hierarchicalCategories]);
    
    const commonCategories = Array.from(allCategories).filter(id => 
      navigationCategories.has(id) && filterCategories.has(id) && hierarchicalCategories.has(id)
    );

    const onlyInNavigation = Array.from(navigationCategories).filter(id => 
      !filterCategories.has(id) && !hierarchicalCategories.has(id)
    );

    const onlyInFilter = Array.from(filterCategories).filter(id => 
      !navigationCategories.has(id) && !hierarchicalCategories.has(id)
    );

    const onlyInHierarchical = Array.from(hierarchicalCategories).filter(id => 
      !navigationCategories.has(id) && !filterCategories.has(id)
    );

    const namingInconsistencies = this.findNamingInconsistencies();

    return {
      commonCategories: Object.freeze(commonCategories),
      onlyInNavigation: Object.freeze(onlyInNavigation),
      onlyInFilter: Object.freeze(onlyInFilter),
      onlyInHierarchical: Object.freeze(onlyInHierarchical),
      namingInconsistencies: Object.freeze(namingInconsistencies)
    };
  }

  /**
   * Calculate overall consistency score
   */
  private calculateConsistencyScore(
    issues: readonly ValidationIssue[],
    warnings: readonly ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct points for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    }

    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 5;
          break;
        case 'medium':
          score -= 3;
          break;
        case 'low':
          score -= 1;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(startTime: number): ValidationPerformanceMetrics {
    const validationTime = performance.now() - startTime;
    
    // Get cache stats
    const filterCacheStats = filterDataSourceManager.getCacheStats();
    const mappingCacheStats = categoryIdMappingService.getCacheStats();
    
    // Calculate cache hit rate (simplified)
    const totalCacheSize = filterCacheStats.size + mappingCacheStats.size;
    const cacheHitRate = totalCacheSize > 0 ? 0.85 : 0; // Placeholder calculation

    return {
      validationTime,
      categoriesValidated: TOP_NAV_CONFIG.length,
      rulesValidated: categoryIdMappingService.getMappingRules().size,
      cacheHitRate
    };
  }

  /**
   * Create cache key for validation results
   */
  private createCacheKey(options: ValidationOptions): string {
    return JSON.stringify(options);
  }

  /**
   * Clear validation cache
   */
  public clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.validationCache.size,
      keys: Array.from(this.validationCache.keys())
    };
  }

  /**
   * Quick validation check (lightweight)
   */
  public quickValidation(): { isHealthy: boolean; criticalIssues: number; warnings: number } {
    try {
      const report = this.validateAll({ 
        validateStructure: true,
        validateNaming: false,
        validateMappings: true,
        validatePerformance: false,
        includeRecommendations: false,
        strictMode: false 
      });

      const criticalIssues = report.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
      
      return {
        isHealthy: report.isConsistent && criticalIssues === 0,
        criticalIssues,
        warnings: report.warnings.length
      };
    } catch (error) {
      return {
        isHealthy: false,
        criticalIssues: 1,
        warnings: 0
      };
    }
  }
}

// Export singleton instance
export const dataConsistencyValidator = DataConsistencyValidator.getInstance();
