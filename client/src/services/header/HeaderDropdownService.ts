/**
 * Header Dropdown Service
 * Enterprise-grade dropdown navigation management
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

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
    this.initializeDropdownCategories();
  }

  /**
   * Initialize all dropdown categories with their subcategories
   */
  private initializeDropdownCategories(): void {
    const categories: DropdownCategory[] = [
      {
        id: 'jobs',
        name: 'Jobs',
        path: '/marketplace/jobs',
        subcategories: [
          { id: 'tech', name: 'Technology', path: '/marketplace/jobs/technology', isPopular: true },
          { id: 'healthcare', name: 'Healthcare', path: '/marketplace/jobs/healthcare', isPopular: true },
          { id: 'finance', name: 'Finance', path: '/marketplace/jobs/finance' },
          { id: 'education', name: 'Education', path: '/marketplace/jobs/education' },
          { id: 'retail', name: 'Retail', path: '/marketplace/jobs/retail' },
          { id: 'remote', name: 'Remote Work', path: '/marketplace/jobs/remote', isPopular: true },
          { id: 'internships', name: 'Internships', path: '/marketplace/jobs/internships' },
          { id: 'freelance', name: 'Freelance', path: '/marketplace/jobs/freelance' }
        ]
      },
      {
        id: 'real-estate',
        name: 'Real Estate',
        path: '/marketplace/real-estate',
        subcategories: [
          { id: 'houses', name: 'Houses for Sale', path: '/marketplace/real-estate/houses', isPopular: true },
          { id: 'apartments', name: 'Apartments', path: '/marketplace/real-estate/apartments', isPopular: true },
          { id: 'condos', name: 'Condos', path: '/marketplace/real-estate/condos' },
          { id: 'rentals', name: 'Rentals', path: '/marketplace/real-estate/rentals', isPopular: true },
          { id: 'commercial', name: 'Commercial', path: '/marketplace/real-estate/commercial' },
          { id: 'land', name: 'Land & Lots', path: '/marketplace/real-estate/land' },
          { id: 'vacation', name: 'Vacation Homes', path: '/marketplace/real-estate/vacation' }
        ]
      },
      {
        id: 'cars',
        name: 'Cars',
        path: '/marketplace/cars',
        subcategories: [
          { id: 'new', name: 'New Cars', path: '/marketplace/cars/new', isPopular: true },
          { id: 'used', name: 'Used Cars', path: '/marketplace/cars/used', isPopular: true },
          { id: 'luxury', name: 'Luxury Cars', path: '/marketplace/cars/luxury' },
          { id: 'electric', name: 'Electric Vehicles', path: '/marketplace/cars/electric', isPopular: true },
          { id: 'trucks', name: 'Trucks & SUVs', path: '/marketplace/cars/trucks' },
          { id: 'motorcycles', name: 'Motorcycles', path: '/marketplace/cars/motorcycles' },
          { id: 'classic', name: 'Classic Cars', path: '/marketplace/cars/classic' }
        ]
      },
      {
        id: 'boats',
        name: 'Boats',
        path: '/marketplace/boats',
        subcategories: [
          { id: 'sailboats', name: 'Sailboats', path: '/marketplace/boats/sailboats', isPopular: true },
          { id: 'motorboats', name: 'Motor Boats', path: '/marketplace/boats/motorboats', isPopular: true },
          { id: 'yachts', name: 'Yachts', path: '/marketplace/boats/yachts' },
          { id: 'fishing', name: 'Fishing Boats', path: '/marketplace/boats/fishing' },
          { id: 'pontoon', name: 'Pontoon Boats', path: '/marketplace/boats/pontoon' },
          { id: 'jetski', name: 'Jet Skis', path: '/marketplace/boats/jetski' },
          { id: 'kayaks', name: 'Kayaks & Canoes', path: '/marketplace/boats/kayaks' }
        ]
      },
      {
        id: 'services',
        name: 'Services',
        path: '/marketplace/services',
        subcategories: [
          { id: 'home', name: 'Home Services', path: '/marketplace/services/home', isPopular: true },
          { id: 'auto', name: 'Auto Services', path: '/marketplace/services/auto', isPopular: true },
          { id: 'professional', name: 'Professional Services', path: '/marketplace/services/professional' },
          { id: 'beauty', name: 'Beauty & Wellness', path: '/marketplace/services/beauty' },
          { id: 'tutoring', name: 'Tutoring', path: '/marketplace/services/tutoring' },
          { id: 'pet', name: 'Pet Services', path: '/marketplace/services/pet' },
          { id: 'event', name: 'Event Planning', path: '/marketplace/services/event' },
          { id: 'cleaning', name: 'Cleaning', path: '/marketplace/services/cleaning', isPopular: true }
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
      const categories = Array.from(this.categoryDropdowns.values());
      return Result.success(categories);
    } catch (error) {
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
export const headerDropdownService = new HeaderDropdownService();