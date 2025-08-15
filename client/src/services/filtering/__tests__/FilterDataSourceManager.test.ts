/**
 * Filter Data Source Manager Tests
 * Comprehensive test suite for FilterDataSourceManager service
 * 100% best practices, enterprise-grade testing
 */

import { filterDataSourceManager, FilterDataSourceError, DataSourceValidationError } from '../FilterDataSourceManager';
import { TOP_NAV_CONFIG } from '../../navigation/TopNavConfig';

describe('FilterDataSourceManager', () => {
  beforeEach(() => {
    // Clear cache before each test
    filterDataSourceManager.clearCache();
  });

  // ===== SINGLETON TESTS =====
  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = filterDataSourceManager;
      const instance2 = filterDataSourceManager;
      expect(instance1).toBe(instance2);
    });
  });

  // ===== DATA SOURCE MANAGEMENT TESTS =====
  describe('Data Source Management', () => {
    it('should have navigation data source initialized', () => {
      const availableSources = filterDataSourceManager.getAvailableDataSources();
      expect(availableSources).toContain('navigation');
    });

    it('should have filter data source available', () => {
      const availableSources = filterDataSourceManager.getAvailableDataSources();
      expect(availableSources).toContain('filter');
    });

    it('should provide data source information', () => {
      const navigationInfo = filterDataSourceManager.getDataSourceInfo('navigation');
      expect(navigationInfo).toBeDefined();
      expect(navigationInfo?.id).toBe('navigation');
      expect(navigationInfo?.name).toBe('Navigation Config Data Source');
    });

    it('should provide data source metrics', () => {
      const navigationMetrics = filterDataSourceManager.getDataSourceMetrics('navigation');
      expect(navigationMetrics).toBeDefined();
      expect(navigationMetrics?.categoriesCount).toBeGreaterThan(0);
      expect(navigationMetrics?.loadTime).toBeGreaterThanOrEqual(0);
    });
  });

  // ===== CATEGORY RETRIEVAL TESTS =====
  describe('Category Retrieval', () => {
    it('should get categories from navigation source', () => {
      const categories = filterDataSourceManager.getCategories('navigation');
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should exclude brands from navigation categories', () => {
      const categories = filterDataSourceManager.getCategories('navigation');
      const hasBrands = categories.some(cat => cat.name === 'Brands' || cat.id === 'brands');
      expect(hasBrands).toBe(false);
    });

    it('should create hierarchical structure from navigation config', () => {
      const categories = filterDataSourceManager.getCategories('navigation');
      const womenCategory = categories.find(cat => cat.id === 'women');
      
      expect(womenCategory).toBeDefined();
      expect(womenCategory?.name).toBe('Women');
      expect(womenCategory?.level).toBe(0);
      expect(womenCategory?.isExpandable).toBe(true);
      expect(womenCategory?.subcategories).toBeDefined();
      expect(womenCategory?.subcategories?.length).toBeGreaterThan(0);
    });

    it('should handle filter source when set', () => {
      const testCategories = [
        {
          id: 'test-category',
          name: 'Test Category',
          level: 0,
          isExpandable: false
        }
      ];

      filterDataSourceManager.setFilterDataSource(testCategories);
      const retrievedCategories = filterDataSourceManager.getCategories('filter');
      
      expect(retrievedCategories).toHaveLength(1);
      expect(retrievedCategories[0].id).toBe('test-category');
      expect(retrievedCategories[0].name).toBe('Test Category');
    });
  });

  // ===== FILTER DATA SOURCE TESTS =====
  describe('Filter Data Source', () => {
    it('should validate categories structure', () => {
      const validCategories = [
        {
          id: 'valid-category',
          name: 'Valid Category',
          level: 0,
          isExpandable: true,
          subcategories: []
        }
      ];

      expect(() => {
        filterDataSourceManager.setFilterDataSource(validCategories);
      }).not.toThrow();
    });

    it('should reject invalid categories structure', () => {
      const invalidCategories = [
        {
          id: '', // Invalid empty ID
          name: 'Invalid Category',
          level: 0,
          isExpandable: true
        }
      ] as any;

      expect(() => {
        filterDataSourceManager.setFilterDataSource(invalidCategories);
      }).toThrow(FilterDataSourceError);
    });

    it('should validate subcategories recursively', () => {
      const categoriesWithInvalidSubcategory = [
        {
          id: 'parent',
          name: 'Parent Category',
          level: 0,
          isExpandable: true,
          subcategories: [
            {
              id: '', // Invalid subcategory
              name: 'Invalid Subcategory',
              level: 1,
              isExpandable: false
            }
          ]
        }
      ] as any;

      expect(() => {
        filterDataSourceManager.setFilterDataSource(categoriesWithInvalidSubcategory);
      }).toThrow(FilterDataSourceError);
    });
  });

  // ===== CONFIGURATION TESTS =====
  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        preferredSource: 'navigation' as const,
        enableCaching: false
      };

      filterDataSourceManager.updateConfig(newConfig);
      const currentConfig = filterDataSourceManager.getConfig();
      
      expect(currentConfig.preferredSource).toBe('navigation');
      expect(currentConfig.enableCaching).toBe(false);
    });

    it('should clear cache when caching is disabled', () => {
      // First, populate cache
      filterDataSourceManager.getCategories('navigation');
      expect(filterDataSourceManager.getCacheStats().size).toBeGreaterThan(0);

      // Disable caching
      filterDataSourceManager.updateConfig({ enableCaching: false });
      
      // Cache should be cleared
      expect(filterDataSourceManager.getCacheStats().size).toBe(0);
    });
  });

  // ===== CACHING TESTS =====
  describe('Caching', () => {
    it('should cache category results', () => {
      const firstCall = filterDataSourceManager.getCategories('navigation');
      const secondCall = filterDataSourceManager.getCategories('navigation');
      
      // Should return the same reference (cached)
      expect(firstCall).toBe(secondCall);
    });

    it('should provide cache statistics', () => {
      filterDataSourceManager.getCategories('navigation');
      const cacheStats = filterDataSourceManager.getCacheStats();
      
      expect(cacheStats.size).toBeGreaterThan(0);
      expect(cacheStats.keys).toContain('categories-navigation');
    });

    it('should clear cache manually', () => {
      filterDataSourceManager.getCategories('navigation');
      expect(filterDataSourceManager.getCacheStats().size).toBeGreaterThan(0);
      
      filterDataSourceManager.clearCache();
      expect(filterDataSourceManager.getCacheStats().size).toBe(0);
    });

    it('should clear cache when data source changes', () => {
      filterDataSourceManager.getCategories('navigation');
      const initialCacheSize = filterDataSourceManager.getCacheStats().size;
      
      filterDataSourceManager.setFilterDataSource([
        { id: 'new', name: 'New', level: 0, isExpandable: false }
      ]);
      
      // Cache should be cleared when data source changes
      const newCacheSize = filterDataSourceManager.getCacheStats().size;
      expect(newCacheSize).toBeLessThan(initialCacheSize);
    });
  });

  // ===== FALLBACK BEHAVIOR TESTS =====
  describe('Fallback Behavior', () => {
    it('should use fallback for non-existent source in graceful mode', () => {
      filterDataSourceManager.updateConfig({ fallbackBehavior: 'graceful' });
      
      const categories = filterDataSourceManager.getCategories('non-existent');
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should throw error for non-existent source in strict mode', () => {
      filterDataSourceManager.updateConfig({ fallbackBehavior: 'strict' });
      
      expect(() => {
        filterDataSourceManager.getCategories('non-existent');
      }).toThrow(FilterDataSourceError);
    });
  });

  // ===== DATA CONSISTENCY TESTS =====
  describe('Data Consistency Validation', () => {
    beforeEach(() => {
      // Set up filter data source for consistency tests
      const testFilterCategories = [
        {
          id: 'women',
          name: 'Women',
          level: 0,
          isExpandable: true,
          subcategories: []
        },
        {
          id: 'men',
          name: 'Men',
          level: 0,
          isExpandable: true,
          subcategories: []
        }
      ];
      
      filterDataSourceManager.setFilterDataSource(testFilterCategories);
    });

    it('should validate consistency between data sources', () => {
      const consistencyResult = filterDataSourceManager.validateDataSourceConsistency();
      
      expect(consistencyResult).toHaveProperty('isConsistent');
      expect(consistencyResult).toHaveProperty('issues');
      expect(Array.isArray(consistencyResult.issues)).toBe(true);
    });

    it('should identify common categories', () => {
      const consistencyResult = filterDataSourceManager.validateDataSourceConsistency();
      
      if (consistencyResult.isConsistent) {
        // Should find common categories between sources
        const navigationCategories = filterDataSourceManager.getCategories('navigation');
        const filterCategories = filterDataSourceManager.getCategories('filter');
        
        const commonNames = navigationCategories
          .map(c => c.name)
          .filter(name => filterCategories.some(f => f.name === name));
        
        expect(commonNames.length).toBeGreaterThan(0);
      }
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration with TOP_NAV_CONFIG', () => {
    it('should map all non-brand categories from TOP_NAV_CONFIG', () => {
      const categories = filterDataSourceManager.getCategories('navigation');
      const expectedCategoryCount = TOP_NAV_CONFIG.filter(c => c.label !== 'Brands').length;
      
      expect(categories.length).toBe(expectedCategoryCount);
    });

    it('should preserve category structure from TOP_NAV_CONFIG', () => {
      const categories = filterDataSourceManager.getCategories('navigation');
      
      for (const category of categories) {
        const originalConfig = TOP_NAV_CONFIG.find(c => 
          (c.fashionSectionId === category.id) || 
          (c.label.toLowerCase().replace(/\s+/g, '-') === category.id)
        );
        
        if (originalConfig) {
          expect(category.name).toBe(originalConfig.label);
          expect(category.isExpandable).toBe(originalConfig.sections.length > 0);
        }
      }
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe('Error Handling', () => {
    it('should handle empty categories array', () => {
      expect(() => {
        filterDataSourceManager.setFilterDataSource([]);
      }).toThrow(DataSourceValidationError);
    });

    it('should handle null/undefined categories', () => {
      expect(() => {
        filterDataSourceManager.setFilterDataSource(null as any);
      }).toThrow(FilterDataSourceError);
    });

    it('should provide meaningful error messages', () => {
      try {
        filterDataSourceManager.setFilterDataSource([
          { id: '', name: 'Invalid', level: 0, isExpandable: false }
        ] as any);
      } catch (error) {
        expect(error).toBeInstanceOf(FilterDataSourceError);
        expect(error.message).toContain('Failed to set filter data source');
      }
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance', () => {
    it('should map categories efficiently', () => {
      const startTime = performance.now();
      filterDataSourceManager.getCategories('navigation');
      const endTime = performance.now();
      
      // Should complete in reasonable time (less than 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should benefit from caching on subsequent calls', () => {
      const startTime1 = performance.now();
      filterDataSourceManager.getCategories('navigation');
      const endTime1 = performance.now();
      const firstCallTime = endTime1 - startTime1;
      
      const startTime2 = performance.now();
      filterDataSourceManager.getCategories('navigation');
      const endTime2 = performance.now();
      const secondCallTime = endTime2 - startTime2;
      
      // Second call should be faster due to caching
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });
});
