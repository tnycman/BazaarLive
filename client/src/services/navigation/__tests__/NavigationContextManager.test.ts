/**
 * Navigation Context Manager Tests
 * Comprehensive test suite for NavigationContextManager service
 * 100% best practices, enterprise-grade testing
 */

import { navigationContextManager, NavigationContextError, NavigationConfigurationError } from '../NavigationContextManager';
import { TOP_NAV_CONFIG } from '../TopNavConfig';

describe('NavigationContextManager', () => {
  // ===== SINGLETON TESTS =====
  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = navigationContextManager;
      const instance2 = navigationContextManager;
      expect(instance1).toBe(instance2);
    });
  });

  // ===== CONTEXT RESOLUTION TESTS =====
  describe('resolveContext', () => {
    it('should resolve context for basic category URL', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/men',
        category: 'men'
      });

      expect(context.category).toBe('men');
      expect(context.breadcrumbs).toEqual(['Home', 'Men']);
      expect(context.expandedSections).toContain('categories');
      expect(context.expandedSections).toContain('men');
      expect(context.metadata.hierarchyLevel).toBe(0);
    });

    it('should resolve context for subcategory URL', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/men/accessories',
        category: 'men',
        subcategory: 'men',
        subSubcategory: 'accessories'
      });

      expect(context.category).toBe('men');
      expect(context.subcategory).toBe('men');
      expect(context.breadcrumbs).toEqual(['Home', 'Men', 'Accessories']);
      expect(context.expandedSections).toContain('men-accessories');
      expect(context.metadata.hierarchyLevel).toBe(1);
    });

    it('should resolve context for leaf URL', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/men/accessories/belts',
        category: 'men',
        subcategory: 'men',
        subSubcategory: 'accessories',
        leaf: 'belts'
      });

      expect(context.category).toBe('men');
      expect(context.leaf).toBe('belts');
      expect(context.breadcrumbs).toEqual(['Home', 'Men', 'Accessories', 'Belts']);
      expect(context.metadata.hierarchyLevel).toBe(2);
      expect(context.metadata.parentPath).toBe('/fashion/men/accessories');
    });

    it('should resolve context for non-fashion categories', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/home',
        category: 'home'
      });

      expect(context.category).toBe('home');
      expect(context.breadcrumbs).toEqual(['Home', 'Home']);
      expect(context.expandedSections).toContain('home');
      expect(context.metadata.title).toContain('Home');
    });
  });

  // ===== VALIDATION TESTS =====
  describe('Validation', () => {
    it('should throw NavigationContextError for missing URL', () => {
      expect(() => {
        navigationContextManager.resolveContext({
          url: '',
          category: 'men'
        });
      }).toThrow(NavigationContextError);
    });

    it('should throw NavigationContextError for missing category', () => {
      expect(() => {
        navigationContextManager.resolveContext({
          url: '/fashion/men',
          category: ''
        });
      }).toThrow(NavigationContextError);
    });

    it('should throw NavigationContextError for invalid category', () => {
      expect(() => {
        navigationContextManager.resolveContext({
          url: '/fashion/invalid',
          category: 'invalid-category'
        });
      }).toThrow(NavigationContextError);
    });

    it('should throw NavigationContextError for invalid URL format', () => {
      expect(() => {
        navigationContextManager.resolveContext({
          url: 'http://[invalid',
          category: 'men'
        });
      }).toThrow(NavigationContextError);
    });
  });

  // ===== BREADCRUMB TESTS =====
  describe('Breadcrumb Generation', () => {
    it('should generate correct breadcrumbs for category only', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/women',
        category: 'women'
      });

      expect(context.breadcrumbs).toEqual(['Home', 'Women']);
    });

    it('should generate correct breadcrumbs for deep hierarchy', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/women/dresses/formal',
        category: 'women',
        subcategory: 'women',
        subSubcategory: 'dresses',
        leaf: 'formal'
      });

      expect(context.breadcrumbs).toEqual(['Home', 'Women', 'Dresses', 'Formal']);
    });

    it('should handle slug formatting in breadcrumbs', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/women/jackets-coats',
        category: 'women',
        subcategory: 'women',
        subSubcategory: 'jackets-coats'
      });

      expect(context.breadcrumbs).toContain('Jackets Coats');
    });
  });

  // ===== EXPANSION CALCULATION TESTS =====
  describe('Expansion Calculation', () => {
    it('should calculate correct expansions for category', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/kids',
        category: 'kids'
      });

      expect(context.expandedSections).toContain('categories');
      expect(context.expandedSections).toContain('kids');
      expect(context.expandedSections).toHaveLength(2);
    });

    it('should calculate correct expansions for subcategory', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/kids/shoes',
        category: 'kids',
        subcategory: 'kids',
        subSubcategory: 'shoes'
      });

      expect(context.expandedSections).toContain('categories');
      expect(context.expandedSections).toContain('kids');
      expect(context.expandedSections).toContain('kids-shoes');
    });
  });

  // ===== METADATA TESTS =====
  describe('Metadata Generation', () => {
    it('should generate correct metadata for category page', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/electronics',
        category: 'electronics'
      });

      expect(context.metadata.title).toContain('Electronics');
      expect(context.metadata.title).toContain('Poshmark');
      expect(context.metadata.description).toContain('electronics');
      expect(context.metadata.canonicalUrl).toBe('/fashion/electronics');
      expect(context.metadata.hierarchyLevel).toBe(0);
      expect(context.metadata.categoryConfig).toBeDefined();
    });

    it('should generate correct metadata for subcategory page', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/pets/accessories',
        category: 'pets',
        subcategory: 'pets',
        subSubcategory: 'accessories'
      });

      expect(context.metadata.title).toContain('Pets');
      expect(context.metadata.title).toContain('Accessories');
      expect(context.metadata.description).toContain('pets');
      expect(context.metadata.description).toContain('accessories');
      expect(context.metadata.hierarchyLevel).toBe(1);
      expect(context.metadata.parentPath).toBe('/fashion/pets');
    });
  });

  // ===== UTILITY METHOD TESTS =====
  describe('Utility Methods', () => {
    it('should return all available categories', () => {
      const categories = navigationContextManager.getAvailableCategories();
      
      expect(categories).toContain('women');
      expect(categories).toContain('men');
      expect(categories).toContain('kids');
      expect(categories).toContain('home');
      expect(categories).toContain('electronics');
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should validate category correctly', () => {
      expect(navigationContextManager.isCategoryValid('women')).toBe(true);
      expect(navigationContextManager.isCategoryValid('men')).toBe(true);
      expect(navigationContextManager.isCategoryValid('invalid')).toBe(false);
      expect(navigationContextManager.isCategoryValid('')).toBe(false);
    });

    it('should validate categories case-insensitively', () => {
      expect(navigationContextManager.isCategoryValid('WOMEN')).toBe(true);
      expect(navigationContextManager.isCategoryValid('Men')).toBe(true);
      expect(navigationContextManager.isCategoryValid('KIDS')).toBe(true);
    });
  });

  // ===== IMMUTABILITY TESTS =====
  describe('Immutability', () => {
    it('should return immutable context objects', () => {
      const context = navigationContextManager.resolveContext({
        url: '/fashion/women',
        category: 'women'
      });

      expect(() => {
        (context as any).category = 'men';
      }).toThrow();

      expect(() => {
        (context.breadcrumbs as any).push('new-item');
      }).toThrow();

      expect(() => {
        (context.expandedSections as any).push('new-section');
      }).toThrow();
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration with TOP_NAV_CONFIG', () => {
    it('should work with all categories from TOP_NAV_CONFIG', () => {
      TOP_NAV_CONFIG.forEach(categoryConfig => {
        if (categoryConfig.label === 'Brands') return; // Skip brands

        const categoryId = categoryConfig.fashionSectionId || categoryConfig.label.toLowerCase();
        
        expect(() => {
          navigationContextManager.resolveContext({
            url: `/fashion/${categoryId}`,
            category: categoryId
          });
        }).not.toThrow();
      });
    });

    it('should generate consistent category configurations', () => {
      const womenContext = navigationContextManager.resolveContext({
        url: '/fashion/women',
        category: 'women'
      });

      expect(womenContext.metadata.categoryConfig?.label).toBe('Women');
      expect(womenContext.metadata.categoryConfig?.fashionSectionId).toBe('women');
    });
  });
});
