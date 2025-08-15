/**
 * Centralized Filter State Manager
 * Enterprise-grade filter state management with observer pattern and URL synchronization
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import type { 
  NavigationConfig, 
  NavigationState, 
  NavigationValidationResult,
  NavigationPerformanceMetrics,
  NavigationAnalyticsEvent 
} from '@/types/navigation';
import { 
  validateNavigationState,
  sanitizeNavigationState,
  VALIDATION_CONSTANTS 
} from '@/services/navigation/NavigationValidationSchemas';

// ===== FILTER STATE INTERFACES =====

/**
 * Filter state interface with comprehensive type safety
 */
export interface FilterState {
  readonly selectedCategories: readonly string[];
  readonly selectedBrands: readonly string[];
  readonly selectedSizes: readonly string[];
  readonly selectedColors: readonly string[];
  readonly selectedPrices: readonly string[];
  readonly selectedAvailability: readonly string[];
  readonly selectedTypes: readonly string[];
  readonly brandSearchQuery: string;
  readonly expandedSections: readonly string[];
  readonly priceRange?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
  readonly viewMode: 'grid' | 'list';
  readonly itemsPerPage: number;
  readonly currentPage: number;
  readonly searchQuery: string;
  readonly lastUpdated: number;
}

/**
 * Filter state update interface
 */
export interface FilterStateUpdate {
  readonly selectedCategories?: readonly string[];
  readonly selectedBrands?: readonly string[];
  readonly selectedSizes?: readonly string[];
  readonly selectedColors?: readonly string[];
  readonly selectedPrices?: readonly string[];
  readonly selectedAvailability?: readonly string[];
  readonly selectedTypes?: readonly string[];
  readonly brandSearchQuery?: string;
  readonly expandedSections?: readonly string[];
  readonly priceRange?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
  readonly viewMode?: 'grid' | 'list';
  readonly itemsPerPage?: number;
  readonly currentPage?: number;
  readonly searchQuery?: string;
}

/**
 * Filter state subscriber interface
 */
export interface FilterStateSubscriber {
  readonly id: string;
  readonly onStateChange: (state: FilterState) => void;
  readonly onError?: (error: Error) => void;
  readonly priority?: number;
}

/**
 * Filter state validation result
 */
export interface FilterStateValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly sanitizedState?: FilterState;
}

/**
 * Filter state performance metrics
 */
export interface FilterStatePerformanceMetrics {
  readonly updateTime: number;
  readonly validationTime: number;
  readonly urlSyncTime: number;
  readonly subscriberNotificationTime: number;
  readonly cacheHit: boolean;
  readonly timestamp: number;
}

/**
 * Filter state analytics event
 */
export interface FilterStateAnalyticsEvent {
  readonly eventType: 'state_update' | 'validation_error' | 'url_sync' | 'subscriber_notification';
  readonly stateSnapshot: Partial<FilterState>;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

// ===== VALIDATION SCHEMAS =====

import { z } from 'zod';

/**
 * Filter state validation schema
 */
export const FilterStateSchema = z.object({
  selectedCategories: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedBrands: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedSizes: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedColors: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedPrices: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedAvailability: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  selectedTypes: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  brandSearchQuery: z.string().max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH),
  expandedSections: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']),
  viewMode: z.enum(['grid', 'list']),
  itemsPerPage: z.number().int().min(1).max(100),
  currentPage: z.number().int().min(1),
  searchQuery: z.string().max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH),
  lastUpdated: z.number().int().min(0),
});

/**
 * Filter state update validation schema
 */
export const FilterStateUpdateSchema = z.object({
  selectedCategories: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedBrands: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedSizes: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedColors: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedPrices: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedAvailability: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  selectedTypes: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  brandSearchQuery: z.string().max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH).optional(),
  expandedSections: z.array(z.string().max(VALIDATION_CONSTANTS.MAX_ID_LENGTH)).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
  viewMode: z.enum(['grid', 'list']).optional(),
  itemsPerPage: z.number().int().min(1).max(100).optional(),
  currentPage: z.number().int().min(1).optional(),
  searchQuery: z.string().max(VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH).optional(),
});

// ===== FILTER STATE MANAGER =====

/**
 * Enterprise Filter State Manager
 * Provides centralized filter state management with observer pattern and URL synchronization
 */
export class FilterStateManager {
  private static instance: FilterStateManager;
  private state: FilterState;
  private subscribers: Set<FilterStateSubscriber> = new Set();
  private performanceMetrics: FilterStatePerformanceMetrics[] = [];
  private analyticsEvents: FilterStateAnalyticsEvent[] = [];
  private isUpdating: boolean = false;
  private updateQueue: FilterStateUpdate[] = [];
  private urlSyncEnabled: boolean = true;

  private constructor() {
    this.state = this.getInitialState();
    this.validateInitialState();
    this.syncWithURL();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FilterStateManager {
    if (!FilterStateManager.instance) {
      FilterStateManager.instance = new FilterStateManager();
    }
    return FilterStateManager.instance;
  }

  /**
   * Get initial filter state
   */
  private getInitialState(): FilterState {
    return {
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-conditions'],
      brandSearchQuery: '',
      expandedSections: ['categories'],
      priceRange: undefined,
      sortBy: 'newest',
      viewMode: 'grid',
      itemsPerPage: 20,
      currentPage: 1,
      searchQuery: '',
      lastUpdated: Date.now(),
    };
  }

  /**
   * Validate initial state
   */
  private validateInitialState(): void {
    const startTime = performance.now();
    
    try {
      const validation = this.validateState(this.state);
      if (!validation.isValid) {
        console.error('Initial state validation failed:', validation.errors);
        throw new Error(`Invalid initial state: ${validation.errors.join(', ')}`);
      }
      
      const duration = performance.now() - startTime;
      this.recordPerformanceMetric('initial_validation', duration);
      
      console.debug('Initial filter state validated successfully');
    } catch (error) {
      console.error('Initial state validation error:', error);
      throw error;
    }
  }

  /**
   * Get current filter state
   */
  public getState(): FilterState {
    return { ...this.state };
  }

  /**
   * Update filter state with comprehensive validation and error handling
   */
  public updateState(updates: FilterStateUpdate): void {
    const startTime = performance.now();
    
    try {
      // Validate update
      const validation = this.validateUpdate(updates);
      if (!validation.isValid) {
        console.error('Filter state update validation failed:', validation.errors);
        throw new Error(`Invalid filter state update: ${validation.errors.join(', ')}`);
      }

      // Prevent recursive updates
      if (this.isUpdating) {
        this.updateQueue.push(updates);
        return;
      }

      this.isUpdating = true;

      // Apply updates
      const newState: FilterState = {
        ...this.state,
        ...updates,
        lastUpdated: Date.now(),
      };

      // Validate new state
      const stateValidation = this.validateState(newState);
      if (!stateValidation.isValid) {
        console.error('New state validation failed:', stateValidation.errors);
        throw new Error(`Invalid new state: ${stateValidation.errors.join(', ')}`);
      }

      // Update state
      this.state = newState;

      // Sync with URL
      if (this.urlSyncEnabled) {
        this.syncWithURL();
      }

      // Notify subscribers
      this.notifySubscribers();

      // Process queued updates
      this.processUpdateQueue();

      const duration = performance.now() - startTime;
      this.recordPerformanceMetric('state_update', duration);
      this.recordAnalyticsEvent('state_update', updates);

      console.debug('Filter state updated successfully');
    } catch (error) {
      console.error('Filter state update error:', error);
      this.recordAnalyticsEvent('validation_error', updates, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Process queued updates
   */
  private processUpdateQueue(): void {
    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      if (update) {
        this.updateState(update);
      }
    }
  }

  /**
   * Subscribe to filter state changes
   */
  public subscribe(subscriber: FilterStateSubscriber): () => void {
    this.subscribers.add(subscriber);
    
    // Immediately notify with current state
    try {
      subscriber.onStateChange(this.getState());
    } catch (error) {
      console.error('Subscriber notification error:', error);
      if (subscriber.onError) {
        subscriber.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Unsubscribe from filter state changes
   */
  public unsubscribe(subscriberId: string): void {
    for (const subscriber of this.subscribers) {
      if (subscriber.id === subscriberId) {
        this.subscribers.delete(subscriber);
        break;
      }
    }
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers(): void {
    const startTime = performance.now();
    const currentState = this.getState();
    
    try {
      // Sort subscribers by priority (higher priority first)
      const sortedSubscribers = Array.from(this.subscribers).sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        return priorityB - priorityA;
      });

      for (const subscriber of sortedSubscribers) {
        try {
          subscriber.onStateChange(currentState);
        } catch (error) {
          console.error(`Subscriber ${subscriber.id} notification error:`, error);
          if (subscriber.onError) {
            subscriber.onError(error instanceof Error ? error : new Error('Unknown error'));
          }
        }
      }

      const duration = performance.now() - startTime;
      this.recordPerformanceMetric('subscriber_notification', duration);
      this.recordAnalyticsEvent('subscriber_notification', currentState);
    } catch (error) {
      console.error('Subscriber notification error:', error);
      this.recordAnalyticsEvent('subscriber_notification', currentState, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Validate filter state
   */
  private validateState(state: FilterState): FilterStateValidationResult {
    const startTime = performance.now();
    
    try {
      const result = FilterStateSchema.safeParse(state);
      
      if (result.success) {
        const duration = performance.now() - startTime;
        this.recordPerformanceMetric('state_validation', duration);
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          sanitizedState: result.data,
        };
      } else {
        return {
          isValid: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }

  /**
   * Validate filter state update
   */
  private validateUpdate(update: FilterStateUpdate): FilterStateValidationResult {
    try {
      const result = FilterStateUpdateSchema.safeParse(update);
      
      if (result.success) {
        return {
          isValid: true,
          errors: [],
          warnings: [],
          sanitizedState: result.data as FilterState,
        };
      } else {
        return {
          isValid: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }

  /**
   * Sync state with URL parameters
   */
  private syncWithURL(): void {
    const startTime = performance.now();
    
    try {
      if (typeof window === 'undefined') {
        return; // Server-side rendering
      }

      const url = new URL(window.location.href);
      const searchParams = url.searchParams;

      // Update URL with current state
      if (this.state.selectedCategories.length > 0) {
        searchParams.set('categories', this.state.selectedCategories.join(','));
      } else {
        searchParams.delete('categories');
      }

      if (this.state.selectedBrands.length > 0) {
        searchParams.set('brands', this.state.selectedBrands.join(','));
      } else {
        searchParams.delete('brands');
      }

      if (this.state.selectedSizes.length > 0) {
        searchParams.set('sizes', this.state.selectedSizes.join(','));
      } else {
        searchParams.delete('sizes');
      }

      if (this.state.selectedColors.length > 0) {
        searchParams.set('colors', this.state.selectedColors.join(','));
      } else {
        searchParams.delete('colors');
      }

      if (this.state.selectedPrices.length > 0) {
        searchParams.set('prices', this.state.selectedPrices.join(','));
      } else {
        searchParams.delete('prices');
      }

      if (this.state.selectedAvailability.length > 0) {
        searchParams.set('availability', this.state.selectedAvailability.join(','));
      } else {
        searchParams.delete('availability');
      }

      if (this.state.selectedTypes.length > 0) {
        searchParams.set('types', this.state.selectedTypes.join(','));
      } else {
        searchParams.delete('types');
      }

      if (this.state.brandSearchQuery) {
        searchParams.set('brandSearch', this.state.brandSearchQuery);
      } else {
        searchParams.delete('brandSearch');
      }

      if (this.state.searchQuery) {
        searchParams.set('search', this.state.searchQuery);
      } else {
        searchParams.delete('search');
      }

      if (this.state.sortBy !== 'newest') {
        searchParams.set('sort', this.state.sortBy);
      } else {
        searchParams.delete('sort');
      }

      if (this.state.viewMode !== 'grid') {
        searchParams.set('view', this.state.viewMode);
      } else {
        searchParams.delete('view');
      }

      if (this.state.currentPage > 1) {
        searchParams.set('page', this.state.currentPage.toString());
      } else {
        searchParams.delete('page');
      }

      if (this.state.itemsPerPage !== 20) {
        searchParams.set('perPage', this.state.itemsPerPage.toString());
      } else {
        searchParams.delete('perPage');
      }

      if (this.state.priceRange) {
        if (this.state.priceRange.min !== undefined) {
          searchParams.set('minPrice', this.state.priceRange.min.toString());
        } else {
          searchParams.delete('minPrice');
        }
        if (this.state.priceRange.max !== undefined) {
          searchParams.set('maxPrice', this.state.priceRange.max.toString());
        } else {
          searchParams.delete('maxPrice');
        }
      } else {
        searchParams.delete('minPrice');
        searchParams.delete('maxPrice');
      }

      // Update URL without triggering navigation
      const newUrl = `${url.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);

      const duration = performance.now() - startTime;
      this.recordPerformanceMetric('url_sync', duration);
      this.recordAnalyticsEvent('url_sync', this.state);
    } catch (error) {
      console.error('URL synchronization error:', error);
      this.recordAnalyticsEvent('url_sync', this.state, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Sync state from URL parameters
   */
  public syncFromURL(): void {
    const startTime = performance.now();
    
    try {
      if (typeof window === 'undefined') {
        return; // Server-side rendering
      }

      const url = new URL(window.location.href);
      const searchParams = url.searchParams;

      const updates: FilterStateUpdate = {};

      // Parse URL parameters
      const categories = searchParams.get('categories');
      if (categories) {
        updates.selectedCategories = categories.split(',').filter(Boolean);
      }

      const brands = searchParams.get('brands');
      if (brands) {
        updates.selectedBrands = brands.split(',').filter(Boolean);
      }

      const sizes = searchParams.get('sizes');
      if (sizes) {
        updates.selectedSizes = sizes.split(',').filter(Boolean);
      }

      const colors = searchParams.get('colors');
      if (colors) {
        updates.selectedColors = colors.split(',').filter(Boolean);
      }

      const prices = searchParams.get('prices');
      if (prices) {
        updates.selectedPrices = prices.split(',').filter(Boolean);
      }

      const availability = searchParams.get('availability');
      if (availability) {
        updates.selectedAvailability = availability.split(',').filter(Boolean);
      }

      const types = searchParams.get('types');
      if (types) {
        updates.selectedTypes = types.split(',').filter(Boolean);
      }

      const brandSearch = searchParams.get('brandSearch');
      if (brandSearch) {
        updates.brandSearchQuery = brandSearch;
      }

      const search = searchParams.get('search');
      if (search) {
        updates.searchQuery = search;
      }

      const sort = searchParams.get('sort');
      if (sort && ['newest', 'price-low', 'price-high', 'popular', 'rating'].includes(sort)) {
        updates.sortBy = sort as 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';
      }

      const view = searchParams.get('view');
      if (view && ['grid', 'list'].includes(view)) {
        updates.viewMode = view as 'grid' | 'list';
      }

      const page = searchParams.get('page');
      if (page) {
        const pageNum = parseInt(page, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          updates.currentPage = pageNum;
        }
      }

      const perPage = searchParams.get('perPage');
      if (perPage) {
        const perPageNum = parseInt(perPage, 10);
        if (!isNaN(perPageNum) && perPageNum > 0 && perPageNum <= 100) {
          updates.itemsPerPage = perPageNum;
        }
      }

      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      if (minPrice || maxPrice) {
        updates.priceRange = {};
        if (minPrice) {
          const minPriceNum = parseFloat(minPrice);
          if (!isNaN(minPriceNum) && minPriceNum >= 0) {
            updates.priceRange.min = minPriceNum;
          }
        }
        if (maxPrice) {
          const maxPriceNum = parseFloat(maxPrice);
          if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
            updates.priceRange.max = maxPriceNum;
          }
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        this.urlSyncEnabled = false; // Prevent recursive sync
        this.updateState(updates);
        this.urlSyncEnabled = true;
      }

      const duration = performance.now() - startTime;
      this.recordPerformanceMetric('url_sync_from', duration);
    } catch (error) {
      console.error('URL sync from error:', error);
      this.recordAnalyticsEvent('url_sync', this.state, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.updateState({
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-conditions'],
      brandSearchQuery: '',
      expandedSections: ['categories'],
      priceRange: undefined,
      sortBy: 'newest',
      viewMode: 'grid',
      currentPage: 1,
      searchQuery: '',
    });
  }

  /**
   * Get applied filters count
   */
  public getAppliedFiltersCount(): number {
    let count = 0;
    
    if (this.state.selectedCategories.length > 0) count++;
    if (this.state.selectedBrands.length > 0) count++;
    if (this.state.selectedSizes.length > 0) count++;
    if (this.state.selectedColors.length > 0) count++;
    if (this.state.selectedPrices.length > 0) count++;
    if (this.state.selectedAvailability.length > 0 && !this.state.selectedAvailability.includes('all-items')) count++;
    if (this.state.selectedTypes.length > 0 && !this.state.selectedTypes.includes('all-conditions')) count++;
    if (this.state.brandSearchQuery) count++;
    if (this.state.searchQuery) count++;
    if (this.state.sortBy !== 'newest') count++;
    if (this.state.viewMode !== 'grid') count++;
    if (this.state.currentPage > 1) count++;
    if (this.state.itemsPerPage !== 20) count++;
    if (this.state.priceRange?.min !== undefined || this.state.priceRange?.max !== undefined) count++;
    
    return count;
  }

  /**
   * Record performance metric
   */
  private recordPerformanceMetric(operation: string, duration: number): void {
    this.performanceMetrics.push({
      updateTime: duration,
      validationTime: 0,
      urlSyncTime: 0,
      subscriberNotificationTime: 0,
      cacheHit: false,
      timestamp: Date.now(),
    });
  }

  /**
   * Record analytics event
   */
  private recordAnalyticsEvent(
    eventType: FilterStateAnalyticsEvent['eventType'],
    stateSnapshot: Partial<FilterState>,
    metadata?: Record<string, unknown>
  ): void {
    this.analyticsEvents.push({
      eventType,
      stateSnapshot,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): readonly FilterStatePerformanceMetrics[] {
    return this.performanceMetrics;
  }

  /**
   * Get analytics events
   */
  public getAnalyticsEvents(): readonly FilterStateAnalyticsEvent[] {
    return this.analyticsEvents;
  }

  /**
   * Clear performance metrics
   */
  public clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  /**
   * Clear analytics events
   */
  public clearAnalyticsEvents(): void {
    this.analyticsEvents = [];
  }

  /**
   * Enable/disable URL synchronization
   */
  public setURLSyncEnabled(enabled: boolean): void {
    this.urlSyncEnabled = enabled;
  }

  /**
   * Get subscriber count
   */
  public getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// ===== EXPORTS =====

export { FilterStateManager };
export type { 
  FilterState, 
  FilterStateUpdate, 
  FilterStateSubscriber, 
  FilterStateValidationResult,
  FilterStatePerformanceMetrics,
  FilterStateAnalyticsEvent 
}; 