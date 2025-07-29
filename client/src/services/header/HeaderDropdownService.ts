/**
 * Header Dropdown Service
 * Enterprise-grade dropdown navigation management
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

console.log('[HeaderDropdownService] Module loading...');

import { z } from 'zod';
import { Result } from '../../types/Result';

// ===== ENTERPRISE TYPE DEFINITIONS =====
export interface DropdownCategory {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly subcategories: readonly DropdownSubcategory[];
  readonly isActive?: boolean;
}

export interface DropdownSubcategory {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly description?: string;
  readonly isPopular?: boolean;
}

export interface DropdownState {
  readonly activeDropdown: string | null;
  readonly hoveredCategory: string | null;
  readonly isVisible: boolean;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
}

// ===== VALIDATION SCHEMAS =====
const DropdownSubcategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  description: z.string().optional(),
  isPopular: z.boolean().optional()
});

const DropdownCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  subcategories: z.array(DropdownSubcategorySchema),
  isActive: z.boolean().optional()
});

// ===== ENTERPRISE DROPDOWN SERVICE =====
export class HeaderDropdownService {
  private readonly categoryDropdowns: Map<string, DropdownCategory> = new Map();
  private currentState: DropdownState = {
    activeDropdown: null,
    hoveredCategory: null,
    isVisible: false,
    position: { x: 0, y: 0 }
  };

  constructor() {
    console.log('[HeaderDropdownService] Constructor called, initializing categories...');
    this.initializeDropdownCategories();
    console.log('[HeaderDropdownService] Categories initialized, count:', this.categoryDropdowns.size);
  }

  /**
   * Initialize all dropdown categories with their subcategories
   */
  private initializeDropdownCategories(): void {
    const categories: DropdownCategory[] = [
      {
        id: 'women',
        name: 'Women',
        path: '/fashion/women',
        subcategories: [
          { id: 'dresses', name: 'Dresses', path: '/fashion/women/dresses', isPopular: true },
          { id: 'tops', name: 'Tops & Blouses', path: '/fashion/women/tops', isPopular: true },
          { id: 'bottoms', name: 'Pants & Jeans', path: '/fashion/women/bottoms', isPopular: true },
          { id: 'shoes', name: 'Shoes', path: '/fashion/women/shoes', isPopular: true },
          { id: 'bags', name: 'Handbags', path: '/fashion/women/bags' },
          { id: 'jewelry', name: 'Jewelry', path: '/fashion/women/jewelry' },
          { id: 'accessories', name: 'Accessories', path: '/fashion/women/accessories' },
          { id: 'activewear', name: 'Activewear', path: '/fashion/women/activewear' },
          { id: 'swimwear', name: 'Swimwear', path: '/fashion/women/swimwear' },
          { id: 'outerwear', name: 'Jackets & Coats', path: '/fashion/women/outerwear' }
        ]
      },
      {
        id: 'men',
        name: 'Men',
        path: '/fashion/men',
        subcategories: [
          { id: 'shirts', name: 'Shirts', path: '/fashion/men/shirts', isPopular: true },
          { id: 'pants', name: 'Pants & Jeans', path: '/fashion/men/pants', isPopular: true },
          { id: 'shoes', name: 'Shoes', path: '/fashion/men/shoes', isPopular: true },
          { id: 'suits', name: 'Suits & Blazers', path: '/fashion/men/suits' },
          { id: 'accessories', name: 'Accessories', path: '/fashion/men/accessories' },
          { id: 'activewear', name: 'Activewear', path: '/fashion/men/activewear' },
          { id: 'outerwear', name: 'Jackets & Coats', path: '/fashion/men/outerwear' },
          { id: 'underwear', name: 'Underwear', path: '/fashion/men/underwear' },
          { id: 'watches', name: 'Watches', path: '/fashion/men/watches' }
        ]
      },
      {
        id: 'kids',
        name: 'Kids',
        path: '/fashion/kids',
        subcategories: [
          { id: 'girls', name: 'Girls (2-16)', path: '/fashion/kids/girls', isPopular: true },
          { id: 'boys', name: 'Boys (2-16)', path: '/fashion/kids/boys', isPopular: true },
          { id: 'baby', name: 'Baby (0-24m)', path: '/fashion/kids/baby', isPopular: true },
          { id: 'shoes', name: 'Kids Shoes', path: '/fashion/kids/shoes' },
          { id: 'accessories', name: 'Kids Accessories', path: '/fashion/kids/accessories' },
          { id: 'school', name: 'School Uniforms', path: '/fashion/kids/school' },
          { id: 'toys', name: 'Toys & Games', path: '/fashion/kids/toys' }
        ]
      },
      {
        id: 'home',
        name: 'Home',
        path: '/fashion/home',
        subcategories: [
          { id: 'furniture', name: 'Furniture', path: '/fashion/home/furniture', isPopular: true },
          { id: 'decor', name: 'Home Decor', path: '/fashion/home/decor', isPopular: true },
          { id: 'kitchen', name: 'Kitchen & Dining', path: '/fashion/home/kitchen', isPopular: true },
          { id: 'bedding', name: 'Bedding & Bath', path: '/fashion/home/bedding' },
          { id: 'lighting', name: 'Lighting', path: '/fashion/home/lighting' },
          { id: 'storage', name: 'Storage & Organization', path: '/fashion/home/storage' },
          { id: 'garden', name: 'Garden & Outdoor', path: '/fashion/home/garden' }
        ]
      },
      {
        id: 'electronics',
        name: 'Electronics',
        path: '/fashion/electronics',
        subcategories: [
          { id: 'phones', name: 'Mobile Phones', path: '/fashion/electronics/phones', isPopular: true },
          { id: 'laptops', name: 'Laptops & Computers', path: '/fashion/electronics/laptops', isPopular: true },
          { id: 'gaming', name: 'Gaming', path: '/fashion/electronics/gaming', isPopular: true },
          { id: 'audio', name: 'Audio & Headphones', path: '/fashion/electronics/audio' },
          { id: 'cameras', name: 'Cameras', path: '/fashion/electronics/cameras' },
          { id: 'smart-home', name: 'Smart Home', path: '/fashion/electronics/smart-home' },
          { id: 'wearables', name: 'Wearables', path: '/fashion/electronics/wearables' }
        ]
      },
      {
        id: 'pets',
        name: 'Pets',
        path: '/fashion/pets',
        subcategories: [
          { id: 'dogs', name: 'Dogs', path: '/fashion/pets/dogs', isPopular: true },
          { id: 'cats', name: 'Cats', path: '/fashion/pets/cats', isPopular: true },
          { id: 'food', name: 'Pet Food', path: '/fashion/pets/food', isPopular: true },
          { id: 'toys', name: 'Pet Toys', path: '/fashion/pets/toys' },
          { id: 'accessories', name: 'Pet Accessories', path: '/fashion/pets/accessories' },
          { id: 'care', name: 'Pet Care', path: '/fashion/pets/care' },
          { id: 'other', name: 'Other Pets', path: '/fashion/pets/other' }
        ]
      },
      {
        id: 'beauty',
        name: 'Beauty & Wellness',
        path: '/fashion/beauty',
        subcategories: [
          { id: 'skincare', name: 'Skincare', path: '/fashion/beauty/skincare', isPopular: true },
          { id: 'makeup', name: 'Makeup', path: '/fashion/beauty/makeup', isPopular: true },
          { id: 'haircare', name: 'Hair Care', path: '/fashion/beauty/haircare', isPopular: true },
          { id: 'fragrance', name: 'Fragrance', path: '/fashion/beauty/fragrance' },
          { id: 'wellness', name: 'Wellness', path: '/fashion/beauty/wellness' },
          { id: 'tools', name: 'Beauty Tools', path: '/fashion/beauty/tools' },
          { id: 'nails', name: 'Nail Care', path: '/fashion/beauty/nails' }
        ]
      },
      {
        id: 'sports',
        name: 'Sports & Outdoors',
        path: '/fashion/sports',
        subcategories: [
          { id: 'fitness', name: 'Fitness & Gym', path: '/fashion/sports/fitness', isPopular: true },
          { id: 'running', name: 'Running', path: '/fashion/sports/running', isPopular: true },
          { id: 'outdoor', name: 'Outdoor Activities', path: '/fashion/sports/outdoor', isPopular: true },
          { id: 'team-sports', name: 'Team Sports', path: '/fashion/sports/team-sports' },
          { id: 'water-sports', name: 'Water Sports', path: '/fashion/sports/water-sports' },
          { id: 'winter-sports', name: 'Winter Sports', path: '/fashion/sports/winter-sports' },
          { id: 'yoga', name: 'Yoga & Pilates', path: '/fashion/sports/yoga' }
        ]
      },
      {
        id: 'brands',
        name: 'Brands',
        path: '/fashion/brands',
        subcategories: [
          { id: 'luxury', name: 'Luxury Brands', path: '/fashion/brands/luxury', isPopular: true },
          { id: 'designer', name: 'Designer', path: '/fashion/brands/designer', isPopular: true },
          { id: 'streetwear', name: 'Streetwear', path: '/fashion/brands/streetwear', isPopular: true },
          { id: 'sustainable', name: 'Sustainable Brands', path: '/fashion/brands/sustainable' },
          { id: 'vintage', name: 'Vintage', path: '/fashion/brands/vintage' },
          { id: 'emerging', name: 'Emerging Brands', path: '/fashion/brands/emerging' },
          { id: 'international', name: 'International', path: '/fashion/brands/international' }
        ]
      }
    ];

    categories.forEach(category => {
      this.categoryDropdowns.set(category.id, category);
    });
  }

  /**
   * Get dropdown category configuration
   */
  public getDropdownCategory(categoryId: string): Result<DropdownCategory, Error> {
    try {
      const category = this.categoryDropdowns.get(categoryId);
      if (!category) {
        return Result.failure(new Error(`Dropdown category not found: ${categoryId}`));
      }

      const validation = DropdownCategorySchema.safeParse(category);
      if (!validation.success) {
        return Result.failure(new Error(`Invalid dropdown category: ${validation.error.message}`));
      }

      return Result.success(category);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown dropdown category error'));
    }
  }

  /**
   * Get all dropdown categories
   */
  public getAllDropdownCategories(): Result<readonly DropdownCategory[], Error> {
    try {
      console.log('[HeaderDropdownService] getAllDropdownCategories called, map size:', this.categoryDropdowns.size);
      const categories = Array.from(this.categoryDropdowns.values());
      console.log('[HeaderDropdownService] Categories array created, length:', categories.length, 'categories:', categories.map(c => c.name));
      return Result.success(categories);
    } catch (error) {
      console.error('[HeaderDropdownService] Error in getAllDropdownCategories:', error);
      return Result.failure(error instanceof Error ? error : new Error('Unknown dropdown categories error'));
    }
  }

  /**
   * Show dropdown for category
   */
  public showDropdown(
    categoryId: string, 
    position: { x: number; y: number }
  ): Result<DropdownState, Error> {
    try {
      const categoryResult = this.getDropdownCategory(categoryId);
      if (categoryResult.isError()) {
        return Result.failure(categoryResult.error);
      }

      this.currentState = {
        activeDropdown: categoryId,
        hoveredCategory: categoryId,
        isVisible: true,
        position
      };

      return Result.success(this.currentState);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown show dropdown error'));
    }
  }

  /**
   * Hide dropdown
   */
  public hideDropdown(): Result<DropdownState, Error> {
    try {
      this.currentState = {
        activeDropdown: null,
        hoveredCategory: null,
        isVisible: false,
        position: { x: 0, y: 0 }
      };

      return Result.success(this.currentState);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown hide dropdown error'));
    }
  }

  /**
   * Update hovered category
   */
  public updateHoveredCategory(categoryId: string | null): Result<DropdownState, Error> {
    try {
      this.currentState = {
        ...this.currentState,
        hoveredCategory: categoryId
      };

      return Result.success(this.currentState);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown hover update error'));
    }
  }

  /**
   * Get current dropdown state
   */
  public getCurrentState(): DropdownState {
    return { ...this.currentState };
  }

  /**
   * Get popular subcategories for category
   */
  public getPopularSubcategories(categoryId: string): Result<readonly DropdownSubcategory[], Error> {
    try {
      const categoryResult = this.getDropdownCategory(categoryId);
      if (categoryResult.isError()) {
        return Result.failure(categoryResult.error);
      }

      const popularSubcategories = categoryResult.value.subcategories.filter(sub => sub.isPopular);
      return Result.success(popularSubcategories);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown popular subcategories error'));
    }
  }

  /**
   * Search subcategories within category
   */
  public searchSubcategories(
    categoryId: string, 
    query: string
  ): Result<readonly DropdownSubcategory[], Error> {
    try {
      if (query.length < 2) {
        return Result.success([]);
      }

      const categoryResult = this.getDropdownCategory(categoryId);
      if (categoryResult.isError()) {
        return Result.failure(categoryResult.error);
      }

      const matchingSubcategories = categoryResult.value.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(query.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(query.toLowerCase()))
      );

      return Result.success(matchingSubcategories);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown search subcategories error'));
    }
  }

  /**
   * Get dropdown service statistics
   */
  public getDropdownStatistics(): {
    readonly totalCategories: number;
    readonly totalSubcategories: number;
    readonly popularSubcategoriesCount: number;
    readonly currentActiveDropdown: string | null;
  } {
    let totalSubcategories = 0;
    let popularSubcategoriesCount = 0;

    this.categoryDropdowns.forEach(category => {
      totalSubcategories += category.subcategories.length;
      popularSubcategoriesCount += category.subcategories.filter(sub => sub.isPopular).length;
    });

    return {
      totalCategories: this.categoryDropdowns.size,
      totalSubcategories,
      popularSubcategoriesCount,
      currentActiveDropdown: this.currentState.activeDropdown
    };
  }
}

// ===== ENTERPRISE DROPDOWN SERVICE INSTANCE =====
console.log('[HeaderDropdownService] Creating singleton instance...');
export const headerDropdownService = new HeaderDropdownService();
console.log('[HeaderDropdownService] Singleton instance created, categories count:', headerDropdownService.getDropdownStatistics().totalCategories);