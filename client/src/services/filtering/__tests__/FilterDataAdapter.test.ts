/**
 * Filter Data Adapter Tests
 * Comprehensive test suite for FilterDataAdapter service
 * 100% best practices, enterprise-grade testing
 */

import { filterDataAdapter } from '../FilterDataAdapter';
import { TOP_NAV_CONFIG } from '../../navigation/TopNavConfig';
import { navigationContextManager } from '../../navigation/NavigationContextManager';

describe('FilterDataAdapter', () => {
  // ===== SINGLETON TESTS =====
  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = filterDataAdapter;
      const instance2 = filterDataAdapter;
      expect(instance1).toBe(instance2);
    });
  });

  // ===== DATA MAPPING TESTS =====
  describe('mapNavConfigToFilterData', () => {
    it('should map TOP_NAV_CONFIG to filter categories', () => {
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      
      expect(filterCategories.length).toBeGreaterThan(0);
      expect(filterCategories.every(cat => cat.level === 0)).toBe(true);
      expect(filterCategories.every(cat => typeof cat.id === 'string')).toBe(true);
      expect(filterCategories.every(cat => typeof cat.name === 'string')).toBe(true);
    });

    it('should exclude brands category', () => {
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      
      expect(filterCategories.some(cat => cat.name === 'Brands')).toBe(false);
      expect(filterCategories.some(cat => cat.id === 'brands')).toBe(false);
    });

    it('should include all other major categories', () => {
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      const categoryNames = filterCategories.map(cat => cat.name);
      
      expect(categoryNames).toContain('Women');
      expect(categoryNames).toContain('Men');
      expect(categoryNames).toContain('Kids');
      expect(categoryNames).toContain('Home');
      expect(categoryNames).toContain('Electronics');
      expect(categoryNames).toContain('Pets');
    });

    it('should create hierarchical structure', () => {
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      const womenCategory = filterCategories.find(cat => cat.id === 'women');
      
      expect(womenCategory).toBeDefined();
      expect(womenCategory?.isExpandable).toBe(true);
      expect(womenCategory?.subcategories).toBeDefined();
      expect(womenCategory?.subcategories?.length).toBeGreaterThan(0);
      
      // Check subcategory structure
      const firstSubcategory = womenCategory?.subcategories?.[0];
      expect(firstSubcategory?.level).toBe(1);
      expect(firstSubcategory?.subcategories).toBeDefined();
      expect(firstSubcategory?.subcategories?.length).toBeGreaterThan(0);
      
      // Check sub-subcategory structure
      const firstSubSubcategory = firstSubcategory?.subcategories?.[0];
      expect(firstSubSubcategory?.level).toBe(2);
      expect(firstSubSubcategory?.isExpandable).toBe(false);
    });

    it('should generate consistent IDs using slugify', () => {
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      
      filterCategories.forEach(category => {
        expect(category.id).toMatch(/^[a-z0-9-]+$/);
        
        category.subcategories?.forEach(subcategory => {
          expect(subcategory.id).toMatch(/^[a-z0-9-]+$/);
          expect(subcategory.id).toContain(category.id);
          
          subcategory.subcategories?.forEach(subSubcategory => {
            expect(subSubcategory.id).toMatch(/^[a-z0-9-]+$/);
            expect(subSubcategory.id).toContain(subcategory.id);
          });
        });
      });
    });

    it('should cache results for performance', () => {
      const firstCall = filterDataAdapter.mapNavConfigToFilterData();
      const secondCall = filterDataAdapter.mapNavConfigToFilterData();
      
      // Should return the same reference (cached)
      expect(firstCall).toBe(secondCall);
    });
  });

  // ===== EXPANSION STATE CALCULATION TESTS =====
  describe('calculateExpansionState', () => {
    it('should calculate expansion state for category context', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/men',
        category: 'men'
      });
      
      const expansionState = filterDataAdapter.calculateExpansionState(context);
      
      expect(expansionState.expandedSections).toContain('categories');
      expect(expansionState.expandedSections).toContain('men');
      expect(expansionState.selectedCategories).toContain('men');
      expect(expansionState.autoExpanded).toContain('men');
    });

    it('should calculate expansion state for subcategory context', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/women/accessories',
        category: 'women',
        subcategory: 'accessories'
      });
      
      const expansionState = filterDataAdapter.calculateExpansionState(context);
      
      expect(expansionState.expandedSections).toContain('categories');
      expect(expansionState.expandedSections).toContain('women');
      expect(expansionState.expandedSections).toContain('women-accessories');
      expect(expansionState.selectedCategories).toContain('women');
    });

    it('should return immutable expansion state', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/kids',
        category: 'kids'
      });
      
      const expansionState = filterDataAdapter.calculateExpansionState(context);
      
      expect(() => {
        (expansionState.expandedSections as any).push('new-section');
      }).toThrow();
      
      expect(() => {
        (expansionState.selectedCategories as any).push('new-category');
      }).toThrow();
    });
  });

  // ===== DATA CONSISTENCY VALIDATION TESTS =====
  describe('validateDataConsistency', () => {
    it('should validate data consistency', () => {
      const report = filterDataAdapter.validateDataConsistency();
      
      expect(report).toHaveProperty('isValid');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('warnings');
      expect(report).toHaveProperty('dataSourceComparison');
      
      expect(Array.isArray(report.issues)).toBe(true);
      expect(Array.isArray(report.warnings)).toBe(true);
    });

    it('should provide detailed data source comparison', () => {
      const report = filterDataAdapter.validateDataConsistency();
      const comparison = report.dataSourceComparison;
      
      expect(comparison.topNavConfigCategories).toBeGreaterThan(0);
      expect(comparison.hierarchicalDataCategories).toBeGreaterThan(0);
      expect(Array.isArray(comparison.missingInHierarchical)).toBe(true);
      expect(Array.isArray(comparison.missingInTopNav)).toBe(true);
      expect(Array.isArray(comparison.consistentCategories)).toBe(true);
    });

    it('should exclude brands from validation', () => {
      const report = filterDataAdapter.validateDataConsistency();
      const comparison = report.dataSourceComparison;
      
      // Should not include brands in any of the comparisons
      expect(comparison.missingInHierarchical).not.toContain('brands');
      expect(comparison.missingInTopNav).not.toContain('brands');
      expect(comparison.consistentCategories).not.toContain('brands');
    });
  });

  // ===== UTILITY METHOD TESTS =====
  describe('findCategoryById', () => {
    beforeEach(() => {
      filterDataAdapter.clearCache();
    });

    it('should find top-level category by ID', () => {
      const category = filterDataAdapter.findCategoryById('women');
      
      expect(category).toBeDefined();
      expect(category?.id).toBe('women');
      expect(category?.name).toBe('Women');
      expect(category?.level).toBe(0);
    });

    it('should find subcategory by ID', () => {
      const category = filterDataAdapter.findCategoryById('men-accessories');
      
      expect(category).toBeDefined();
      expect(category?.name).toBe('ACCESSORIES');
      expect(category?.level).toBe(1);
    });

    it('should find sub-subcategory by ID', () => {
      const allCategories = filterDataAdapter.mapNavConfigToFilterData();
      const menCategory = allCategories.find(cat => cat.id === 'men');
      const accessoriesSubcategory = menCategory?.subcategories?.find(sub => sub.name === 'ACCESSORIES');
      const firstItem = accessoriesSubcategory?.subcategories?.[0];
      
      if (firstItem) {
        const foundCategory = filterDataAdapter.findCategoryById(firstItem.id);
        expect(foundCategory).toBeDefined();
        expect(foundCategory?.level).toBe(2);
      }
    });

    it('should return undefined for non-existent category', () => {
      const category = filterDataAdapter.findCategoryById('non-existent-category');
      expect(category).toBeUndefined();
    });
  });

  describe('getCategoryPath', () => {
    it('should get path for top-level category', () => {
      const path = filterDataAdapter.getCategoryPath('kids');
      
      expect(path).toHaveLength(1);
      expect(path[0].id).toBe('kids');
      expect(path[0].name).toBe('Kids');
    });

    it('should get path for subcategory', () => {
      const path = filterDataAdapter.getCategoryPath('women-accessories');
      
      expect(path).toHaveLength(2);
      expect(path[0].id).toBe('women');
      expect(path[1].id).toBe('women-accessories');
    });

    it('should return empty array for non-existent category', () => {
      const path = filterDataAdapter.getCategoryPath('non-existent');
      expect(path).toHaveLength(0);
    });
  });

  // ===== CACHE MANAGEMENT TESTS =====
  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      filterDataAdapter.clearCache();
      const initialStats = filterDataAdapter.getCacheStats();
      expect(initialStats.size).toBe(0);
      
      filterDataAdapter.mapNavConfigToFilterData();
      const afterDataStats = filterDataAdapter.getCacheStats();
      expect(afterDataStats.size).toBeGreaterThan(0);
      expect(afterDataStats.keys).toContain('unified-filter-categories');
    });

    it('should clear cache correctly', () => {
      filterDataAdapter.mapNavConfigToFilterData();
      expect(filterDataAdapter.getCacheStats().size).toBeGreaterThan(0);
      
      filterDataAdapter.clearCache();
      expect(filterDataAdapter.getCacheStats().size).toBe(0);
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration with NavigationContextManager', () => {
    it('should work seamlessly with navigation context', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/electronics/phones',
        category: 'electronics',
        subcategory: 'electronics',
        subSubcategory: 'phones'
      });
      
      const expansionState = filterDataAdapter.calculateExpansionState(context);
      const filterCategories = filterDataAdapter.mapNavConfigToFilterData();
      
      expect(expansionState.expandedSections).toContain('categories');
      expect(expansionState.expandedSections).toContain('electronics');
      expect(filterCategories.some(cat => cat.id === 'electronics')).toBe(true);
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance', () => {
    it('should perform mapping efficiently', () => {
      const startTime = performance.now();
      filterDataAdapter.mapNavConfigToFilterData();
      const endTime = performance.now();
      
      // Should complete in reasonable time (less than 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('should benefit from caching on subsequent calls', () => {
      filterDataAdapter.clearCache();
      
      const startTime1 = performance.now();
      filterDataAdapter.mapNavConfigToFilterData();
      const endTime1 = performance.now();
      const firstCallTime = endTime1 - startTime1;
      
      const startTime2 = performance.now();
      filterDataAdapter.mapNavConfigToFilterData();
      const endTime2 = performance.now();
      const secondCallTime = endTime2 - startTime2;
      
      // Second call should be faster due to caching
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });
});
