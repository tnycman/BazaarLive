/**
 * Category ID Mapping Service Tests
 * Comprehensive test suite for CategoryIdMappingService
 * 100% best practices, enterprise-grade testing
 */

import { categoryIdMappingService, IdMappingError, IdMappingValidationError } from '../CategoryIdMappingService';

describe('CategoryIdMappingService', () => {
  beforeEach(() => {
    // Clear cache before each test
    categoryIdMappingService.clearCache();
  });

  // ===== SINGLETON TESTS =====
  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = categoryIdMappingService;
      const instance2 = categoryIdMappingService;
      expect(instance1).toBe(instance2);
    });
  });

  // ===== BASIC MAPPING TESTS =====
  describe('Basic ID Mapping', () => {
    it('should map navigation ID to filter ID', () => {
      const result = categoryIdMappingService.mapNavigationToFilter('men');
      
      expect(result.mappedId).toBe('men');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.context).toBeDefined();
    });

    it('should map filter ID to navigation ID', () => {
      const result = categoryIdMappingService.mapFilterToNavigation('accessories', {
        category: 'men',
        level: 1
      });
      
      expect(result.mappedId).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.context.category).toBe('men');
    });

    it('should handle bidirectional mappings', () => {
      const forwardResult = categoryIdMappingService.mapNavigationToFilter('women');
      const backwardResult = categoryIdMappingService.mapFilterToNavigation(forwardResult.mappedId);
      
      expect(backwardResult.mappedId).toBe('women');
    });
  });

  // ===== COMPOUND ID MAPPING TESTS =====
  describe('Compound ID Mapping', () => {
    it('should map compound navigation ID to filter ID', () => {
      const result = categoryIdMappingService.mapNavigationToFilter('men-accessories');
      
      expect(result.mappedId).toBe('accessories');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.context.category).toBe('men');
      expect(result.context.subcategory).toBe('accessories');
    });

    it('should map filter ID to compound navigation ID with context', () => {
      const result = categoryIdMappingService.mapFilterToNavigation('accessories', {
        category: 'women',
        level: 1
      });
      
      expect(result.mappedId).toBe('women-accessories');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.context.category).toBe('women');
    });

    it('should handle multiple compound ID patterns', () => {
      const testCases = [
        { input: 'men-jackets-coats', expected: 'jackets-coats' },
        { input: 'women-intimates-sleepwear', expected: 'intimates-sleepwear' },
        { input: 'kids-shoes', expected: 'shoes' }
      ];

      for (const testCase of testCases) {
        const result = categoryIdMappingService.mapNavigationToFilter(testCase.input);
        expect(result.mappedId).toBe(testCase.expected);
      }
    });
  });

  // ===== CONTEXTUAL MAPPING TESTS =====
  describe('Contextual Mapping', () => {
    it('should use category context for better mapping', () => {
      const result = categoryIdMappingService.mapFilterToNavigation('bags', {
        category: 'women',
        level: 1
      });
      
      expect(result.context.category).toBe('women');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle different hierarchy levels', () => {
      const level0Result = categoryIdMappingService.mapNavigationToFilter('men', { level: 0 });
      const level1Result = categoryIdMappingService.mapNavigationToFilter('men-accessories', { level: 1 });
      
      expect(level0Result.context.level).toBe(0);
      expect(level1Result.context.level).toBe(1);
    });

    it('should provide meaningful context in results', () => {
      const result = categoryIdMappingService.mapNavigationToFilter('women-dresses', {
        category: 'women',
        subcategory: 'dresses',
        level: 1
      });
      
      expect(result.context.category).toBe('women');
      expect(result.context.subcategory).toBe('dresses');
      expect(result.context.level).toBe(1);
    });
  });

  // ===== ARRAY MAPPING TESTS =====
  describe('Array Mapping', () => {
    it('should map array of navigation IDs to filter IDs', () => {
      const navigationIds = ['men', 'women', 'kids'];
      const results = categoryIdMappingService.mapIds(navigationIds, 'navigation', 'filter');
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.mappedId)).toBe(true);
      expect(results.every(r => r.confidence > 0)).toBe(true);
    });

    it('should map array of filter IDs to navigation IDs', () => {
      const filterIds = ['accessories', 'bags', 'shoes'];
      const context = { category: 'women', level: 1 };
      const results = categoryIdMappingService.mapIds(filterIds, 'filter', 'navigation', context);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.context.category === 'women')).toBe(true);
    });

    it('should handle empty arrays', () => {
      const results = categoryIdMappingService.mapIds([], 'navigation', 'filter');
      expect(results).toHaveLength(0);
    });
  });

  // ===== VALIDATION TESTS =====
  describe('ID Validation', () => {
    it('should validate correct ID mappings', () => {
      const validation = categoryIdMappingService.validateMapping('men', 'men');
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect empty source ID', () => {
      const validation = categoryIdMappingService.validateMapping('', 'target');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('Source ID cannot be empty'))).toBe(true);
    });

    it('should detect empty target ID', () => {
      const validation = categoryIdMappingService.validateMapping('source', '');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('Target ID cannot be empty'))).toBe(true);
    });

    it('should validate ID format', () => {
      const validationValid = categoryIdMappingService.validateMapping('valid-id', 'another-valid-id');
      const validationInvalid = categoryIdMappingService.validateMapping('Invalid ID!', 'valid-id');
      
      expect(validationValid.isValid).toBe(true);
      expect(validationInvalid.isValid).toBe(false);
    });

    it('should provide suggestions for improvement', () => {
      const validation = categoryIdMappingService.validateMapping('Invalid Format!', 'valid-id');
      
      expect(validation.suggestions.length).toBeGreaterThan(0);
      expect(validation.suggestions.some(s => s.includes('lowercase'))).toBe(true);
    });
  });

  // ===== CUSTOM MAPPING RULES TESTS =====
  describe('Custom Mapping Rules', () => {
    it('should allow adding custom mapping rules', () => {
      const customRule = {
        source: 'custom-source',
        target: 'custom-target',
        direction: 'bidirectional' as const,
        context: 'universal' as const
      };

      expect(() => {
        categoryIdMappingService.addCustomMappingRule(customRule);
      }).not.toThrow();
    });

    it('should reject invalid custom mapping rules', () => {
      const invalidRule = {
        source: '',
        target: 'valid-target',
        direction: 'bidirectional' as const,
        context: 'universal' as const
      };

      expect(() => {
        categoryIdMappingService.addCustomMappingRule(invalidRule);
      }).toThrow(IdMappingValidationError);
    });

    it('should use custom mapping rules', () => {
      const customRule = {
        source: 'special-category',
        target: 'mapped-category',
        direction: 'bidirectional' as const,
        context: 'universal' as const
      };

      categoryIdMappingService.addCustomMappingRule(customRule);
      
      const result = categoryIdMappingService.mapNavigationToFilter('special-category');
      expect(result.mappedId).toBe('mapped-category');
      expect(result.ruleApplied).toBeDefined();
    });
  });

  // ===== STATISTICS TESTS =====
  describe('Statistics and Metrics', () => {
    it('should provide mapping statistics', () => {
      // Perform some mappings
      categoryIdMappingService.mapNavigationToFilter('men');
      categoryIdMappingService.mapNavigationToFilter('women');
      
      const stats = categoryIdMappingService.getStats();
      
      expect(stats.totalMappings).toBeGreaterThan(0);
      expect(stats.successfulMappings).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeGreaterThan(0);
    });

    it('should track failed mappings', () => {
      try {
        categoryIdMappingService.mapNavigationToFilter('non-existent-category');
      } catch (error) {
        // Expected to potentially fail
      }
      
      const stats = categoryIdMappingService.getStats();
      expect(stats.totalMappings).toBeGreaterThan(0);
    });

    it('should provide cache statistics', () => {
      categoryIdMappingService.mapNavigationToFilter('men');
      const cacheStats = categoryIdMappingService.getCacheStats();
      
      expect(cacheStats.size).toBeGreaterThan(0);
      expect(cacheStats.keys.length).toBeGreaterThan(0);
    });
  });

  // ===== CACHING TESTS =====
  describe('Caching', () => {
    it('should cache mapping results', () => {
      const firstResult = categoryIdMappingService.mapNavigationToFilter('women');
      const secondResult = categoryIdMappingService.mapNavigationToFilter('women');
      
      // Results should be consistent
      expect(firstResult.mappedId).toBe(secondResult.mappedId);
      expect(firstResult.confidence).toBe(secondResult.confidence);
    });

    it('should clear cache manually', () => {
      categoryIdMappingService.mapNavigationToFilter('men');
      expect(categoryIdMappingService.getCacheStats().size).toBeGreaterThan(0);
      
      categoryIdMappingService.clearCache();
      expect(categoryIdMappingService.getCacheStats().size).toBe(0);
    });

    it('should use cache for better performance', () => {
      const startTime1 = performance.now();
      categoryIdMappingService.mapNavigationToFilter('women-accessories');
      const endTime1 = performance.now();
      const firstCallTime = endTime1 - startTime1;
      
      const startTime2 = performance.now();
      categoryIdMappingService.mapNavigationToFilter('women-accessories');
      const endTime2 = performance.now();
      const secondCallTime = endTime2 - startTime2;
      
      // Second call should be faster due to caching
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe('Error Handling', () => {
    it('should handle invalid mapping contexts gracefully', () => {
      const result = categoryIdMappingService.mapNavigationToFilter('unknown-category');
      
      // Should return fallback result instead of throwing
      expect(result.mappedId).toBeDefined();
      expect(result.confidence).toBeLessThanOrEqual(0.2); // Unknown categories get very low confidence
    });

    it('should provide meaningful error messages', () => {
      try {
        categoryIdMappingService.addCustomMappingRule({
          source: '',
          target: 'valid',
          direction: 'bidirectional',
          context: 'universal'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(IdMappingValidationError);
        expect(error.message).toContain('source cannot be empty');
      }
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration Tests', () => {
    it('should work with common category patterns', () => {
      const commonCategories = ['men', 'women', 'kids', 'home', 'electronics'];
      
      for (const category of commonCategories) {
        const result = categoryIdMappingService.mapNavigationToFilter(category);
        expect(result.mappedId).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      }
    });

    it('should handle subcategory mapping patterns', () => {
      const subcategoryPatterns = [
        { input: 'men-accessories', expected: 'accessories' },
        { input: 'women-bags', expected: 'bags' },
        { input: 'kids-shoes', expected: 'shoes' }
      ];

      for (const pattern of subcategoryPatterns) {
        const result = categoryIdMappingService.mapNavigationToFilter(pattern.input);
        expect(result.mappedId).toBe(pattern.expected);
      }
    });

    it('should maintain consistency across multiple operations', () => {
      const testId = 'men-jackets-coats';
      
      // Forward mapping
      const forwardResult = categoryIdMappingService.mapNavigationToFilter(testId);
      expect(forwardResult.mappedId).toBe('jackets-coats');
      expect(forwardResult.context.category).toBe('men');
      
      // Reverse mapping with proper context from forward result
      const backwardResult = categoryIdMappingService.mapFilterToNavigation(
        forwardResult.mappedId,
        forwardResult.context
      );
      
      // Should be able to reconstruct the original compound ID
      expect(backwardResult.mappedId).toBe(testId);
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance', () => {
    it('should perform mapping efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        categoryIdMappingService.mapNavigationToFilter('men-accessories');
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 100 mappings in reasonable time (less than 100ms)
      expect(totalTime).toBeLessThan(100);
    });

    it('should scale well with multiple mapping rules', () => {
      // Add multiple custom rules
      for (let i = 0; i < 50; i++) {
        categoryIdMappingService.addCustomMappingRule({
          source: `test-source-${i}`,
          target: `test-target-${i}`,
          direction: 'bidirectional',
          context: 'universal'
        });
      }
      
      // Mapping should still be fast
      const startTime = performance.now();
      categoryIdMappingService.mapNavigationToFilter('test-source-25');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
