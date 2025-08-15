/**
 * Test Suite for UnifiedCategoryRoutingService
 * Validates unified routing logic and single source of truth implementation
 */

import { 
  UnifiedCategoryRoutingService, 
  CategoryRoutingError, 
  CategoryConfigurationError,
  type CategoryLabel,
  type CategoryRouteRequest 
} from '../UnifiedCategoryRoutingService';
import { TOP_NAV_CONFIG } from '@/services/navigation/TopNavConfig';

describe('UnifiedCategoryRoutingService', () => {
  let service: UnifiedCategoryRoutingService;

  beforeEach(() => {
    service = UnifiedCategoryRoutingService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = UnifiedCategoryRoutingService.getInstance();
      const instance2 = UnifiedCategoryRoutingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateCategoryRoute', () => {
    describe('Fashion Categories (Women/Men/Kids)', () => {
      it('should generate correct route for Women category', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Women'
        });

        expect(result.url).toBe('/fashion/women');
        expect(result.metadata.category).toBe('Women');
        expect(result.metadata.vertical).toBe('fashion');
        expect(result.metadata.isFashionSection).toBe(true);
        expect(result.metadata.fashionSectionId).toBe('women');
        expect(result.validation.isValid).toBe(true);
      });

      it('should generate correct route for Women with section', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Women',
          section: 'ACCESSORIES'
        });

        expect(result.url).toBe('/fashion/women/accessories');
      });

      it('should generate correct route for Women with section and item', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Women',
          section: 'ACCESSORIES',
          item: 'Belts'
        });

        expect(result.url).toBe('/fashion/women/accessories/belts');
      });

      it('should generate correct routes for Men and Kids', () => {
        const menResult = service.generateCategoryRoute({
          categoryLabel: 'Men',
          section: 'CLOTHING'
        });
        expect(menResult.url).toBe('/fashion/men/clothing');

        const kidsResult = service.generateCategoryRoute({
          categoryLabel: 'Kids',
          section: 'TOYS'
        });
        expect(kidsResult.url).toBe('/fashion/kids/toys');
      });
    });

    describe('Non-Fashion Categories', () => {
      it('should generate correct route for Home category', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Home'
        });

        expect(result.url).toBe('/fashion/home');
        expect(result.metadata.category).toBe('Home');
        expect(result.metadata.vertical).toBe('home');
        expect(result.metadata.isFashionSection).toBeUndefined();
        expect(result.metadata.fashionSectionId).toBeUndefined();
      });

      it('should generate correct route for Electronics with section', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Electronics',
          section: 'COMPUTERS, LAPTOPS & PARTS'
        });

        expect(result.url).toBe('/fashion/electronics/computers-laptops-parts');
      });

      it('should generate correct route for Pets with section and item', () => {
        const result = service.generateCategoryRoute({
          categoryLabel: 'Pets',
          section: 'DOG',
          item: 'Beds'
        });

        expect(result.url).toBe('/fashion/pets/dog/beds');
      });

      it('should generate correct routes for Beauty & Wellness and Sports & Outdoors', () => {
        const beautyResult = service.generateCategoryRoute({
          categoryLabel: 'Beauty & Wellness',
          section: 'SKINCARE'
        });
        expect(beautyResult.url).toBe('/fashion/beauty-wellness/skincare');

        const sportsResult = service.generateCategoryRoute({
          categoryLabel: 'Sports & Outdoors',
          section: 'SPORTS'
        });
        expect(sportsResult.url).toBe('/fashion/sports-outdoors/sports');
      });
    });

    describe('URL Consistency', () => {
      it('should maintain /fashion prefix for all categories', () => {
        const categories: CategoryLabel[] = ['Women', 'Men', 'Kids', 'Home', 'Electronics', 'Pets', 'Beauty & Wellness', 'Sports & Outdoors'];
        
        categories.forEach(category => {
          const result = service.generateCategoryRoute({ categoryLabel: category });
          expect(result.url).toMatch(/^\/fashion\//);
        });
      });

      it('should generate consistent URL patterns', () => {
        // Test category-only URLs
        const categoryResult = service.generateCategoryRoute({ categoryLabel: 'Home' });
        expect(categoryResult.url).toMatch(/^\/fashion\/[\w-]+$/);

        // Test category + section URLs
        const sectionResult = service.generateCategoryRoute({ 
          categoryLabel: 'Home', 
          section: 'ACCENTS' 
        });
        expect(sectionResult.url).toMatch(/^\/fashion\/[\w-]+\/[\w-]+$/);

        // Test category + section + item URLs
        const itemResult = service.generateCategoryRoute({ 
          categoryLabel: 'Home', 
          section: 'ACCENTS', 
          item: 'Pillows' 
        });
        expect(itemResult.url).toMatch(/^\/fashion\/[\w-]+\/[\w-]+\/[\w-]+$/);
      });
    });

    describe('Error Handling', () => {
      it('should throw CategoryRoutingError for invalid category label', () => {
        expect(() => {
          service.generateCategoryRoute({
            categoryLabel: 'InvalidCategory' as CategoryLabel
          });
        }).toThrow(CategoryRoutingError);
      });

      it('should throw CategoryRoutingError for empty category label', () => {
        expect(() => {
          service.generateCategoryRoute({
            categoryLabel: '' as CategoryLabel
          });
        }).toThrow(CategoryRoutingError);
      });

      it('should throw CategoryRoutingError for empty section when provided', () => {
        expect(() => {
          service.generateCategoryRoute({
            categoryLabel: 'Women',
            section: ''
          });
        }).toThrow(CategoryRoutingError);
      });

      it('should throw CategoryRoutingError for empty item when provided', () => {
        expect(() => {
          service.generateCategoryRoute({
            categoryLabel: 'Women',
            section: 'ACCESSORIES',
            item: ''
          });
        }).toThrow(CategoryRoutingError);
      });
    });
  });

  describe('Validation Methods', () => {
    describe('getAvailableCategories', () => {
      it('should return all categories from TOP_NAV_CONFIG', () => {
        const categories = service.getAvailableCategories();
        const expectedCategories = TOP_NAV_CONFIG.map(c => c.label);
        
        expect(categories).toEqual(expectedCategories);
        expect(categories.length).toBe(TOP_NAV_CONFIG.length);
      });
    });

    describe('isCategoryValid', () => {
      it('should return true for valid categories', () => {
        expect(service.isCategoryValid('Women')).toBe(true);
        expect(service.isCategoryValid('Home')).toBe(true);
        expect(service.isCategoryValid('Sports & Outdoors')).toBe(true);
      });

      it('should return false for invalid categories', () => {
        expect(service.isCategoryValid('InvalidCategory')).toBe(false);
        expect(service.isCategoryValid('')).toBe(false);
        expect(service.isCategoryValid('women')).toBe(false); // case sensitive
      });
    });
  });

  describe('Single Source of Truth Compliance', () => {
    it('should use TOP_NAV_CONFIG as data source', () => {
      // Test that all categories from TOP_NAV_CONFIG are supported
      TOP_NAV_CONFIG.forEach(categoryConfig => {
        expect(() => {
          service.generateCategoryRoute({
            categoryLabel: categoryConfig.label as CategoryLabel
          });
        }).not.toThrow();
      });
    });

    it('should respect fashionSectionId from configuration', () => {
      const womenResult = service.generateCategoryRoute({ categoryLabel: 'Women' });
      const menResult = service.generateCategoryRoute({ categoryLabel: 'Men' });
      const kidsResult = service.generateCategoryRoute({ categoryLabel: 'Kids' });

      // Should use fashionSectionId for URL slug
      expect(womenResult.url).toBe('/fashion/women'); // fashionSectionId: 'women'
      expect(menResult.url).toBe('/fashion/men');     // fashionSectionId: 'men'
      expect(kidsResult.url).toBe('/fashion/kids');   // fashionSectionId: 'kids'
    });

    it('should fall back to slugified label when no fashionSectionId', () => {
      const homeResult = service.generateCategoryRoute({ categoryLabel: 'Home' });
      const beautyResult = service.generateCategoryRoute({ categoryLabel: 'Beauty & Wellness' });

      // Should use slugified label
      expect(homeResult.url).toBe('/fashion/home');
      expect(beautyResult.url).toBe('/fashion/beauty-wellness');
    });
  });

  describe('Type Safety', () => {
    it('should enforce CategoryLabel type at compile time', () => {
      // This test validates TypeScript compilation
      // Invalid category labels should cause compilation errors
      const validRequest: CategoryRouteRequest = {
        categoryLabel: 'Women' // Valid category
      };

      expect(() => {
        service.generateCategoryRoute(validRequest);
      }).not.toThrow();
    });
  });
});



