import { z } from 'zod';

// Filter Schema Definitions using Zod
export const FilterCriteria = z.object({
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  condition: z.array(z.enum([
    'new_with_tags',
    'new_without_tags', 
    'excellent',
    'good',
    'fair'
  ])).optional(),
  availability: z.array(z.enum([
    'available',
    'available_with_discount',
    'dropping_soon'
  ])).optional(),
  shipping: z.array(z.enum([
    'all_items',
    'free',
    'discounted_free'
  ])).optional(),
  type: z.array(z.enum([
    'all_types',
    'closet',
    'boutique'
  ])).optional(),
  sortBy: z.enum([
    'just_shared',
    'newest',
    'price_low_to_high',
    'price_high_to_low',
    'size',
    'most_liked'
  ]).optional(),
  searchQuery: z.string().optional(),
});

export type FilterCriteriaType = z.infer<typeof FilterCriteria>;

// Filter State Management Interface
export interface IFilterState {
  criteria: FilterCriteriaType;
  isLoading: boolean;
  hasChanges: boolean;
  appliedFilters: FilterCriteriaType;
}

// Filter Operations Interface (Strategy Pattern)
export interface IFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[];
  validate(criteria: FilterCriteriaType): boolean;
  getDisplayName(): string;
}

// Abstract Filter Operation Base Class
export abstract class BaseFilterOperation implements IFilterOperation {
  abstract apply(listings: any[], criteria: FilterCriteriaType): any[];
  
  validate(criteria: FilterCriteriaType): boolean {
    try {
      FilterCriteria.parse(criteria);
      return true;
    } catch {
      return false;
    }
  }
  
  abstract getDisplayName(): string;
}

// Concrete Filter Operations
export class CategoryFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.categories?.length) return listings;
    
    return listings.filter(listing => 
      criteria.categories!.some(category => 
        listing.subcategory === category || 
        listing.category === category
      )
    );
  }
  
  getDisplayName(): string {
    return 'Category Filter';
  }
}

export class BrandFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.brands?.length) return listings;
    
    return listings.filter(listing => 
      criteria.brands!.some(brand => 
        listing.brand?.toLowerCase().includes(brand.toLowerCase())
      )
    );
  }
  
  getDisplayName(): string {
    return 'Brand Filter';
  }
}

export class SizeFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.sizes?.length) return listings;
    
    return listings.filter(listing => 
      criteria.sizes!.includes(listing.size)
    );
  }
  
  getDisplayName(): string {
    return 'Size Filter';
  }
}

export class ColorFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.colors?.length) return listings;
    
    return listings.filter(listing => 
      criteria.colors!.some(color => 
        listing.color?.toLowerCase().includes(color.toLowerCase()) ||
        listing.description?.toLowerCase().includes(color.toLowerCase())
      )
    );
  }
  
  getDisplayName(): string {
    return 'Color Filter';
  }
}

export class PriceFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.priceRange) return listings;
    
    const { min, max } = criteria.priceRange;
    
    return listings.filter(listing => {
      const price = parseFloat(listing.price.replace(/[^0-9.]/g, ''));
      const matchesMin = min === undefined || price >= min;
      const matchesMax = max === undefined || price <= max;
      return matchesMin && matchesMax;
    });
  }
  
  getDisplayName(): string {
    return 'Price Filter';
  }
}

export class ConditionFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.condition?.length) return listings;
    
    return listings.filter(listing => 
      criteria.condition!.includes(listing.condition)
    );
  }
  
  getDisplayName(): string {
    return 'Condition Filter';
  }
}

export class SearchFilterOperation extends BaseFilterOperation {
  apply(listings: any[], criteria: FilterCriteriaType): any[] {
    if (!criteria.searchQuery?.trim()) return listings;
    
    const query = criteria.searchQuery.toLowerCase().trim();
    
    return listings.filter(listing => 
      listing.title?.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      listing.brand?.toLowerCase().includes(query) ||
      listing.category?.toLowerCase().includes(query)
    );
  }
  
  getDisplayName(): string {
    return 'Search Filter';
  }
}

// Filter Chain Manager (Chain of Responsibility Pattern)
export class FilterChainManager {
  private operations: IFilterOperation[] = [];
  
  constructor() {
    this.initializeDefaultOperations();
  }
  
  private initializeDefaultOperations(): void {
    this.operations = [
      new SearchFilterOperation(),
      new CategoryFilterOperation(),
      new BrandFilterOperation(),
      new SizeFilterOperation(),
      new ColorFilterOperation(),
      new PriceFilterOperation(),
      new ConditionFilterOperation(),
    ];
  }
  
  addOperation(operation: IFilterOperation): void {
    this.operations.push(operation);
  }
  
  removeOperation(operationName: string): void {
    this.operations = this.operations.filter(
      op => op.getDisplayName() !== operationName
    );
  }
  
  applyFilters(listings: any[], criteria: FilterCriteriaType): any[] {
    let filteredListings = [...listings];
    
    for (const operation of this.operations) {
      if (operation.validate(criteria)) {
        filteredListings = operation.apply(filteredListings, criteria);
      }
    }
    
    return this.applySorting(filteredListings, criteria.sortBy);
  }
  
  private applySorting(listings: any[], sortBy?: string): any[] {
    if (!sortBy || sortBy === 'just_shared') {
      return listings.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - 
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    }
    
    switch (sortBy) {
      case 'newest':
        return listings.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'price_low_to_high':
        return listings.sort((a, b) => 
          parseFloat(a.price.replace(/[^0-9.]/g, '')) - 
          parseFloat(b.price.replace(/[^0-9.]/g, ''))
        );
      case 'price_high_to_low':
        return listings.sort((a, b) => 
          parseFloat(b.price.replace(/[^0-9.]/g, '')) - 
          parseFloat(a.price.replace(/[^0-9.]/g, ''))
        );
      case 'most_liked':
        return listings.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'size':
        return listings.sort((a, b) => {
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const aIndex = sizeOrder.indexOf(a.size) || 999;
          const bIndex = sizeOrder.indexOf(b.size) || 999;
          return aIndex - bIndex;
        });
      default:
        return listings;
    }
  }
}

// Filter Service (Facade Pattern)
export class FilterService {
  private chainManager: FilterChainManager;
  private state: IFilterState;
  
  constructor() {
    this.chainManager = new FilterChainManager();
    this.state = {
      criteria: {},
      isLoading: false,
      hasChanges: false,
      appliedFilters: {}
    };
  }
  
  updateCriteria(newCriteria: Partial<FilterCriteriaType>): void {
    this.state.criteria = { ...this.state.criteria, ...newCriteria };
    this.state.hasChanges = true;
  }
  
  clearCriteria(): void {
    this.state.criteria = {};
    this.state.hasChanges = true;
  }
  
  applyFilters(listings: any[]): any[] {
    this.state.isLoading = true;
    
    try {
      const filtered = this.chainManager.applyFilters(listings, this.state.criteria);
      this.state.appliedFilters = { ...this.state.criteria };
      this.state.hasChanges = false;
      return filtered;
    } finally {
      this.state.isLoading = false;
    }
  }
  
  getState(): IFilterState {
    return { ...this.state };
  }
  
  getCriteria(): FilterCriteriaType {
    return { ...this.state.criteria };
  }
  
  getAppliedFiltersCount(): number {
    const criteria = this.state.appliedFilters;
    let count = 0;
    
    if (criteria.categories?.length) count += criteria.categories.length;
    if (criteria.brands?.length) count += criteria.brands.length;
    if (criteria.sizes?.length) count += criteria.sizes.length;
    if (criteria.colors?.length) count += criteria.colors.length;
    if (criteria.priceRange?.min !== undefined || criteria.priceRange?.max !== undefined) count += 1;
    if (criteria.condition?.length) count += criteria.condition.length;
    if (criteria.availability?.length) count += criteria.availability.length;
    if (criteria.shipping?.length) count += criteria.shipping.length;
    if (criteria.type?.length) count += criteria.type.length;
    if (criteria.searchQuery?.trim()) count += 1;
    
    return count;
  }
}

// Singleton instance
export const filterService = new FilterService();