/**
 * Error Handling Filter Operations
 * Base classes and implementations with comprehensive error handling
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';
import type { FilterCriteriaType } from '@/services/filtering/FilterService';

// ===== BASE ERROR HANDLING CLASS =====

export abstract class ErrorHandlingFilterOperation {
  protected errorHandler: FilterErrorHandler;
  protected operationName: string;

  constructor(operationName: string) {
    this.errorHandler = FilterErrorHandler.getInstance();
    this.operationName = operationName;
  }

  /**
   * Execute filter operation with comprehensive error handling
   */
  protected executeWithErrorHandling<T>(
    operation: () => T,
    context: FilterErrorContext,
    errorCode: string
  ): T | null {
    try {
      // Validate input before operation
      if (!this.validateInput()) {
        this.handleValidationError(context, errorCode);
        return null;
      }

      // Execute operation
      const result = operation();

      // Validate output after operation
      if (!this.validateOutput(result)) {
        this.handleValidationError(context, errorCode);
        return null;
      }

      return result;

    } catch (error) {
      this.handleOperationError(error as Error, context, errorCode);
      return null;
    }
  }

  /**
   * Execute async filter operation with error handling
   */
  protected async executeAsyncWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: FilterErrorContext,
    errorCode: string
  ): Promise<T | null> {
    try {
      // Validate input before operation
      if (!this.validateInput()) {
        this.handleValidationError(context, errorCode);
        return null;
      }

      // Execute operation
      const result = await operation();

      // Validate output after operation
      if (!this.validateOutput(result)) {
        this.handleValidationError(context, errorCode);
        return null;
      }

      return result;

    } catch (error) {
      this.handleOperationError(error as Error, context, errorCode);
      return null;
    }
  }

  /**
   * Validate input data before operation
   */
  protected validateInput(): boolean {
    try {
      // Base validation - override in subclasses
      return true;
    } catch (error) {
      this.handleValidationError(
        FilterErrorContext.CATEGORY_FILTER,
        'INPUT_VALIDATION_FAILED'
      );
      return false;
    }
  }

  /**
   * Validate output data after operation
   */
  protected validateOutput(result: unknown): boolean {
    try {
      // Base validation - override in subclasses
      return result !== null && result !== undefined;
    } catch (error) {
      this.handleValidationError(
        FilterErrorContext.CATEGORY_FILTER,
        'OUTPUT_VALIDATION_FAILED'
      );
      return false;
    }
  }

  /**
   * Handle validation errors
   */
  protected handleValidationError(
    context: FilterErrorContext,
    errorCode: string,
    details?: Record<string, unknown>
  ): void {
    this.errorHandler.handleError(
      FilterErrorType.VALIDATION_ERROR,
      FilterErrorSeverity.MEDIUM,
      context,
      `Validation failed in ${this.operationName}`,
      errorCode,
      {
        operationName: this.operationName,
        ...details
      }
    );
  }

  /**
   * Handle operation errors
   */
  protected handleOperationError(
    error: Error,
    context: FilterErrorContext,
    errorCode: string,
    details?: Record<string, unknown>
  ): void {
    this.errorHandler.handleError(
      FilterErrorType.DATA_ERROR,
      FilterErrorSeverity.HIGH,
      context,
      `Operation failed in ${this.operationName}: ${error.message}`,
      errorCode,
      {
        operationName: this.operationName,
        originalError: error.message,
        stackTrace: error.stack,
        ...details
      }
    );
  }

  /**
   * Handle performance errors
   */
  protected handlePerformanceError(
    context: FilterErrorContext,
    errorCode: string,
    duration: number,
    threshold: number
  ): void {
    this.errorHandler.handleError(
      FilterErrorType.PERFORMANCE_ERROR,
      FilterErrorSeverity.MEDIUM,
      context,
      `Performance threshold exceeded in ${this.operationName}: ${duration}ms > ${threshold}ms`,
      errorCode,
      {
        operationName: this.operationName,
        duration,
        threshold
      }
    );
  }

  /**
   * Log operation start for performance monitoring
   */
  protected logOperationStart(): number {
    return performance.now();
  }

  /**
   * Log operation end and check performance
   */
  protected logOperationEnd(startTime: number, threshold: number = 1000): void {
    const duration = performance.now() - startTime;
    
    if (duration > threshold) {
      this.handlePerformanceError(
        FilterErrorContext.CATEGORY_FILTER,
        'PERFORMANCE_THRESHOLD_EXCEEDED',
        duration,
        threshold
      );
    }
  }
}

// ===== CONCRETE ERROR HANDLING OPERATIONS =====

export class SafeCategoryFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeCategoryFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performCategoryFilter(listings, criteria),
      FilterErrorContext.CATEGORY_FILTER,
      'CATEGORY_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performCategoryFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.categories?.length) {
        return listings;
      }

      const filteredListings = listings.filter(listing => {
        try {
          return criteria.categories!.some(category => {
            const listingCategory = listing.subcategory || listing.category;
            return listingCategory === category;
          });
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.CATEGORY_FILTER,
            'CATEGORY_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              categories: criteria.categories
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.CATEGORY_FILTER,
        'CATEGORY_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    // Validate listings array
    if (!Array.isArray(this.currentListings)) {
      return false;
    }

    // Validate criteria object
    if (!this.currentCriteria || typeof this.currentCriteria !== 'object') {
      return false;
    }

    return true;
  }

  protected validateOutput(result: any[]): boolean {
    // Validate result is array
    if (!Array.isArray(result)) {
      return false;
    }

    // Validate all items in result are valid listings
    return result.every(item => 
      item && typeof item === 'object' && item.id
    );
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafeBrandFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeBrandFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performBrandFilter(listings, criteria),
      FilterErrorContext.BRAND_FILTER,
      'BRAND_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performBrandFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.brands?.length) {
        return listings;
      }

      const filteredListings = listings.filter(listing => {
        try {
          return criteria.brands!.some(brand => {
            const listingBrand = listing.brand?.toLowerCase();
            const searchBrand = brand.toLowerCase();
            return listingBrand?.includes(searchBrand);
          });
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.BRAND_FILTER,
            'BRAND_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              brands: criteria.brands
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.BRAND_FILTER,
        'BRAND_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafePriceFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafePriceFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performPriceFilter(listings, criteria),
      FilterErrorContext.PRICE_FILTER,
      'PRICE_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performPriceFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.priceRange) {
        return listings;
      }

      const { min, max } = criteria.priceRange;

      const filteredListings = listings.filter(listing => {
        try {
          const price = this.extractPrice(listing.price);
          const matchesMin = min === undefined || price >= min;
          const matchesMax = max === undefined || price <= max;
          return matchesMin && matchesMax;
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.PRICE_FILTER,
            'PRICE_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              price: listing.price,
              priceRange: criteria.priceRange
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.PRICE_FILTER,
        'PRICE_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  private extractPrice(priceString: string): number {
    try {
      // Remove currency symbols and non-numeric characters
      const cleanPrice = priceString.replace(/[^0-9.]/g, '');
      const price = parseFloat(cleanPrice);
      
      if (isNaN(price)) {
        throw new Error(`Invalid price format: ${priceString}`);
      }
      
      return price;
    } catch (error) {
      throw new Error(`Failed to extract price from: ${priceString}`);
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafeSizeFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeSizeFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performSizeFilter(listings, criteria),
      FilterErrorContext.SIZE_FILTER,
      'SIZE_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performSizeFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.sizes?.length) {
        return listings;
      }

      const filteredListings = listings.filter(listing => {
        try {
          return criteria.sizes!.includes(listing.size);
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.SIZE_FILTER,
            'SIZE_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              size: listing.size,
              sizes: criteria.sizes
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.SIZE_FILTER,
        'SIZE_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafeColorFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeColorFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performColorFilter(listings, criteria),
      FilterErrorContext.COLOR_FILTER,
      'COLOR_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performColorFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.colors?.length) {
        return listings;
      }

      const filteredListings = listings.filter(listing => {
        try {
          return criteria.colors!.some(color => {
            const listingColor = listing.color?.toLowerCase();
            const searchColor = color.toLowerCase();
            return listingColor?.includes(searchColor) ||
                   listing.description?.toLowerCase().includes(searchColor);
          });
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.COLOR_FILTER,
            'COLOR_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              color: listing.color,
              colors: criteria.colors
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.COLOR_FILTER,
        'COLOR_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafeConditionFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeConditionFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performConditionFilter(listings, criteria),
      FilterErrorContext.CONDITION_FILTER,
      'CONDITION_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performConditionFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.condition?.length) {
        return listings;
      }

      const filteredListings = listings.filter(listing => {
        try {
          return criteria.condition!.includes(listing.condition);
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.CONDITION_FILTER,
            'CONDITION_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              condition: listing.condition,
              conditions: criteria.condition
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.CONDITION_FILTER,
        'CONDITION_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
}

export class SafeSearchFilterOperation extends ErrorHandlingFilterOperation {
  constructor() {
    super('SafeSearchFilterOperation');
  }

  public apply(listings: any[], criteria: FilterCriteriaType): any[] {
    return this.executeWithErrorHandling(
      () => this.performSearchFilter(listings, criteria),
      FilterErrorContext.SEARCH_FILTER,
      'SEARCH_FILTER_APPLICATION_FAILED'
    ) || [];
  }

  private performSearchFilter(listings: any[], criteria: FilterCriteriaType): any[] {
    const startTime = this.logOperationStart();

    try {
      if (!criteria.searchQuery?.trim()) {
        return listings;
      }

      const query = criteria.searchQuery.toLowerCase().trim();

      const filteredListings = listings.filter(listing => {
        try {
          return listing.title?.toLowerCase().includes(query) ||
                 listing.description?.toLowerCase().includes(query) ||
                 listing.brand?.toLowerCase().includes(query) ||
                 listing.category?.toLowerCase().includes(query);
        } catch (filterError) {
          this.handleOperationError(
            filterError as Error,
            FilterErrorContext.SEARCH_FILTER,
            'SEARCH_FILTER_ITEM_FAILED',
            {
              listingId: listing.id,
              query: criteria.searchQuery
            }
          );
          return false;
        }
      });

      this.logOperationEnd(startTime);
      return filteredListings;

    } catch (error) {
      this.handleOperationError(
        error as Error,
        FilterErrorContext.SEARCH_FILTER,
        'SEARCH_FILTER_OPERATION_FAILED'
      );
      return [];
    }
  }

  protected validateInput(): boolean {
    return this.currentListings.length > 0 && 
           this.currentCriteria && 
           typeof this.currentCriteria === 'object';
  }

  protected validateOutput(result: any[]): boolean {
    return Array.isArray(result) && 
           result.every(item => item && typeof item === 'object' && item.id);
  }

  private currentListings: any[] = [];
  private currentCriteria: FilterCriteriaType = {};

  public setCurrentData(listings: any[], criteria: FilterCriteriaType): void {
    this.currentListings = listings;
    this.currentCriteria = criteria;
  }
} 