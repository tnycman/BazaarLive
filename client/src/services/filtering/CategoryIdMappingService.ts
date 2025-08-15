/**
 * Category ID Mapping Service - ID Format Reconciliation
 * Handles ID format differences between navigation and filter systems
 * 100% best practices, enterprise-grade ID mapping and validation
 */

import { slugify } from '../routing/RouteUtils';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface IdMappingRule {
  readonly source: string;
  readonly target: string;
  readonly direction: 'bidirectional' | 'source-to-target' | 'target-to-source';
  readonly context: 'navigation' | 'filter' | 'universal';
}

export interface IdMappingContext {
  readonly category?: string;
  readonly subcategory?: string;
  readonly leaf?: string;
  readonly level: number;
}

export interface MappingResult {
  readonly mappedId: string;
  readonly confidence: number;
  readonly ruleApplied?: IdMappingRule;
  readonly context: IdMappingContext;
}

export interface MappingValidationResult {
  readonly isValid: boolean;
  readonly issues: readonly string[];
  readonly suggestions: readonly string[];
}

export interface MappingStats {
  readonly totalMappings: number;
  readonly successfulMappings: number;
  readonly failedMappings: number;
  readonly averageConfidence: number;
  readonly rulesUsed: number;
}

// ===== CUSTOM ERROR CLASSES =====
export class IdMappingError extends Error {
  constructor(message: string, public readonly sourceId: string, public readonly context?: IdMappingContext) {
    super(`ID mapping error for '${sourceId}': ${message}`);
    this.name = 'IdMappingError';
  }
}

export class IdMappingValidationError extends Error {
  constructor(message: string, public readonly issues: readonly string[]) {
    super(`ID mapping validation failed: ${message}. Issues: ${issues.join(', ')}`);
    this.name = 'IdMappingValidationError';
  }
}

/**
 * Category ID Mapping Service - Enterprise ID Reconciliation
 * Provides bidirectional mapping between different ID formats
 */
export class CategoryIdMappingService {
  private static instance: CategoryIdMappingService;
  private readonly mappingRules: Map<string, IdMappingRule[]> = new Map();
  private readonly mappingCache: Map<string, MappingResult> = new Map();
  private readonly stats: MappingStats = {
    totalMappings: 0,
    successfulMappings: 0,
    failedMappings: 0,
    averageConfidence: 0,
    rulesUsed: 0
  };

  private constructor() {
    this.initializeMappingRules();
  }

  public static getInstance(): CategoryIdMappingService {
    if (!CategoryIdMappingService.instance) {
      CategoryIdMappingService.instance = new CategoryIdMappingService();
    }
    return CategoryIdMappingService.instance;
  }

  /**
   * Initialize predefined mapping rules
   */
  private initializeMappingRules(): void {
    // Navigation context to filter context mappings
    this.addMappingRule({
      source: 'men',
      target: 'men',
      direction: 'bidirectional',
      context: 'universal'
    });

    this.addMappingRule({
      source: 'women',
      target: 'women',
      direction: 'bidirectional',
      context: 'universal'
    });

    this.addMappingRule({
      source: 'kids',
      target: 'kids',
      direction: 'bidirectional',
      context: 'universal'
    });

    // Compound ID mappings (navigation format: "men-accessories" to filter format: "accessories")
    this.addCompoundIdMappings();
    
    // Common subcategory mappings
    this.addSubcategoryMappings();
  }

  /**
   * Add compound ID mapping rules
   */
  private addCompoundIdMappings(): void {
    const commonSubcategories = [
      'accessories', 'bags', 'clothing', 'shoes', 'jewelry', 'makeup',
      'jackets-coats', 'jeans', 'dresses', 'intimates-sleepwear',
      'activewear', 'grooming', 'underwear-socks', 'suits-blazers',
      'watches', 'belts', 'ties', 'global-traditional'
    ];

    const categories = ['men', 'women', 'kids'];

    for (const category of categories) {
      for (const subcategory of commonSubcategories) {
        // Navigation format: "men-accessories" -> Filter format: "accessories"
        this.addMappingRule({
          source: `${category}-${subcategory}`,
          target: subcategory,
          direction: 'source-to-target',
          context: 'navigation'
        });

        // Reverse mapping: "accessories" -> "men-accessories" (requires context)
        this.addMappingRule({
          source: subcategory,
          target: `${category}-${subcategory}`,
          direction: 'target-to-source',
          context: 'filter'
        });
      }
    }
  }

  /**
   * Add subcategory specific mappings
   */
  private addSubcategoryMappings(): void {
    // Handle special cases and synonyms
    const specialMappings: Array<{ source: string; target: string; context: 'navigation' | 'filter' | 'universal' }> = [
      { source: 'jackets-coats', target: 'jackets-coats', context: 'universal' },
      { source: 'intimates-sleepwear', target: 'intimates-sleepwear', context: 'universal' },
      { source: 'suits-blazers', target: 'suits-blazers', context: 'universal' },
      { source: 'underwear-socks', target: 'underwear-socks', context: 'universal' },
      { source: 'global-traditional', target: 'global-traditional', context: 'universal' }
    ];

    for (const mapping of specialMappings) {
      this.addMappingRule({
        source: mapping.source,
        target: mapping.target,
        direction: 'bidirectional',
        context: mapping.context
      });
    }
  }

  /**
   * Add a mapping rule
   */
  private addMappingRule(rule: IdMappingRule): void {
    const key = rule.source;
    const existing = this.mappingRules.get(key) || [];
    existing.push(rule);
    this.mappingRules.set(key, existing);
  }

  /**
   * Map navigation context ID to filter ID
   */
  public mapNavigationToFilter(
    navigationId: string, 
    context: Partial<IdMappingContext> = {}
  ): MappingResult {
    const fullContext: IdMappingContext = {
      level: 0,
      ...context
    };

    const cacheKey = `nav-to-filter:${navigationId}:${JSON.stringify(fullContext)}`;
    
    // Check cache first
    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    try {
      const result = this.performMapping(navigationId, 'navigation', 'filter', fullContext);
      
      // Cache successful mapping
      this.mappingCache.set(cacheKey, result);
      this.updateStats(true, result.confidence);
      
      return result;
    } catch (error) {
      this.updateStats(false, 0);
      throw error;
    }
  }

  /**
   * Map filter ID to navigation context ID
   */
  public mapFilterToNavigation(
    filterId: string,
    context: Partial<IdMappingContext> = {}
  ): MappingResult {
    const fullContext: IdMappingContext = {
      level: 0,
      ...context
    };

    const cacheKey = `filter-to-nav:${filterId}:${JSON.stringify(fullContext)}`;
    
    // Check cache first
    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    try {
      const result = this.performMapping(filterId, 'filter', 'navigation', fullContext);
      
      // Cache successful mapping
      this.mappingCache.set(cacheKey, result);
      this.updateStats(true, result.confidence);
      
      return result;
    } catch (error) {
      this.updateStats(false, 0);
      throw error;
    }
  }

  /**
   * Perform actual ID mapping using rules
   */
  private performMapping(
    sourceId: string,
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter',
    context: IdMappingContext
  ): MappingResult {
    // Try exact rule match first
    const exactMatch = this.findExactRuleMatch(sourceId, sourceContext, targetContext);
    if (exactMatch) {
      return {
        mappedId: exactMatch.rule.target,
        confidence: 1.0,
        ruleApplied: exactMatch.rule,
        context
      };
    }

    // Try pattern-based matching
    const patternMatch = this.findPatternMatch(sourceId, sourceContext, targetContext, context);
    if (patternMatch) {
      return patternMatch;
    }

    // Try contextual mapping
    const contextualMatch = this.findContextualMatch(sourceId, sourceContext, targetContext, context);
    if (contextualMatch) {
      return contextualMatch;
    }

    // Fallback: return original ID with low confidence for unknown categories
    // but higher confidence for exact matches
    const isKnownCategory = ['men', 'women', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports'].includes(sourceId);
    
    return {
      mappedId: sourceId,
      confidence: isKnownCategory ? 0.8 : 0.1,
      context
    };
  }

  /**
   * Find exact rule match
   */
  private findExactRuleMatch(
    sourceId: string,
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter'
  ): { rule: IdMappingRule } | null {
    const rules = this.mappingRules.get(sourceId) || [];
    
    for (const rule of rules) {
      if (this.ruleMatches(rule, sourceContext, targetContext)) {
        return { rule };
      }
    }
    
    return null;
  }

  /**
   * Check if rule matches the mapping direction
   */
  private ruleMatches(
    rule: IdMappingRule,
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter'
  ): boolean {
    if (rule.direction === 'bidirectional') {
      return true;
    }
    
    if (rule.direction === 'source-to-target' && rule.context === sourceContext) {
      return true;
    }
    
    if (rule.direction === 'target-to-source' && rule.context === targetContext) {
      return true;
    }
    
    return false;
  }

  /**
   * Find pattern-based match for compound IDs
   */
  private findPatternMatch(
    sourceId: string,
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter',
    context: IdMappingContext
  ): MappingResult | null {
    // Handle compound navigation IDs (e.g., "men-accessories")
    if (sourceContext === 'navigation' && sourceId.includes('-')) {
      const parts = sourceId.split('-');
      if (parts.length >= 2) {
        const [category, ...subcategoryParts] = parts;
        const subcategory = subcategoryParts.join('-');
        
        // If mapping to filter context, return just the subcategory
        if (targetContext === 'filter') {
          return {
            mappedId: subcategory,
            confidence: 0.9,
            context: { 
              ...context, 
              category, 
              subcategory,
              level: context.level || 1
            }
          };
        }
      }
    }

    // Handle reverse mapping: filter to navigation with context
    if (sourceContext === 'filter' && targetContext === 'navigation' && context.category) {
      // If we have category context, create compound ID
      const compoundId = `${context.category}-${sourceId}`;
      
      return {
        mappedId: compoundId,
        confidence: 0.8,
        context
      };
    }

    return null;
  }

  /**
   * Find contextual match using category information
   */
  private findContextualMatch(
    sourceId: string,
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter',
    context: IdMappingContext
  ): MappingResult | null {
    // Use category context for better mapping
    if (context.category) {
      // Try prefixed versions
      const prefixedId = `${context.category}-${sourceId}`;
      const rules = this.mappingRules.get(prefixedId) || [];
      
      for (const rule of rules) {
        if (this.ruleMatches(rule, sourceContext, targetContext)) {
          return {
            mappedId: rule.target,
            confidence: 0.7,
            ruleApplied: rule,
            context
          };
        }
      }
    }

    return null;
  }

  /**
   * Map array of IDs
   */
  public mapIds(
    ids: readonly string[],
    sourceContext: 'navigation' | 'filter',
    targetContext: 'navigation' | 'filter',
    context: Partial<IdMappingContext> = {}
  ): readonly MappingResult[] {
    return ids.map(id => {
      if (sourceContext === 'navigation') {
        return this.mapNavigationToFilter(id, context);
      } else {
        return this.mapFilterToNavigation(id, context);
      }
    });
  }

  /**
   * Validate ID mapping
   */
  public validateMapping(sourceId: string, targetId: string): MappingValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!sourceId || sourceId.trim().length === 0) {
      issues.push('Source ID cannot be empty');
    }

    if (!targetId || targetId.trim().length === 0) {
      issues.push('Target ID cannot be empty');
    }

    // Format validation
    if (sourceId && !this.isValidIdFormat(sourceId)) {
      issues.push(`Source ID has invalid format: ${sourceId}`);
      suggestions.push('Use lowercase letters, numbers, and hyphens only');
    }

    if (targetId && !this.isValidIdFormat(targetId)) {
      issues.push(`Target ID has invalid format: ${targetId}`);
      suggestions.push('Use lowercase letters, numbers, and hyphens only');
    }

    // Check for existing mapping
    const hasMapping = this.mappingRules.has(sourceId);
    if (!hasMapping) {
      suggestions.push(`Consider adding explicit mapping rule for: ${sourceId}`);
    }

    return {
      isValid: issues.length === 0,
      issues: Object.freeze(issues),
      suggestions: Object.freeze(suggestions)
    };
  }

  /**
   * Check if ID format is valid
   */
  private isValidIdFormat(id: string): boolean {
    // Allow lowercase letters, numbers, and hyphens
    return /^[a-z0-9-]+$/.test(id);
  }

  /**
   * Update mapping statistics
   */
  private updateStats(successful: boolean, confidence: number): void {
    this.stats.totalMappings++;
    
    if (successful) {
      this.stats.successfulMappings++;
      
      // Update average confidence
      const totalConfidence = this.stats.averageConfidence * (this.stats.successfulMappings - 1) + confidence;
      this.stats.averageConfidence = totalConfidence / this.stats.successfulMappings;
    } else {
      this.stats.failedMappings++;
    }
  }

  /**
   * Get mapping statistics
   */
  public getStats(): MappingStats {
    return { ...this.stats };
  }

  /**
   * Clear mapping cache
   */
  public clearCache(): void {
    this.mappingCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.mappingCache.size,
      keys: Array.from(this.mappingCache.keys())
    };
  }

  /**
   * Get all available mapping rules
   */
  public getMappingRules(): ReadonlyMap<string, readonly IdMappingRule[]> {
    const result = new Map<string, readonly IdMappingRule[]>();
    for (const [key, rules] of this.mappingRules) {
      result.set(key, Object.freeze([...rules]));
    }
    return result;
  }

  /**
   * Add custom mapping rule
   */
  public addCustomMappingRule(rule: IdMappingRule): void {
    const validation = this.validateMappingRule(rule);
    if (!validation.isValid) {
      throw new IdMappingValidationError('Invalid mapping rule', validation.issues);
    }

    this.addMappingRule(rule);
    this.stats.rulesUsed++;
  }

  /**
   * Validate mapping rule
   */
  private validateMappingRule(rule: IdMappingRule): MappingValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!rule.source || rule.source.trim().length === 0) {
      issues.push('Rule source cannot be empty');
    }

    if (!rule.target || rule.target.trim().length === 0) {
      issues.push('Rule target cannot be empty');
    }

    if (!['bidirectional', 'source-to-target', 'target-to-source'].includes(rule.direction)) {
      issues.push('Rule direction must be bidirectional, source-to-target, or target-to-source');
    }

    if (!['navigation', 'filter', 'universal'].includes(rule.context)) {
      issues.push('Rule context must be navigation, filter, or universal');
    }

    return {
      isValid: issues.length === 0,
      issues: Object.freeze(issues),
      suggestions: Object.freeze(suggestions)
    };
  }
}

// Export singleton instance
export const categoryIdMappingService = CategoryIdMappingService.getInstance();
