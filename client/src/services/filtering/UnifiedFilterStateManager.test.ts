/**
 * Unified Filter State Manager Tests
 * Comprehensive test suite for unified filter state management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { UnifiedFilterStateManager } from './UnifiedFilterStateManager';
import { FilterMigrationUtility } from './FilterMigrationUtility';
import type { UnifiedFilterState, UnifiedFilterStateUpdate } from './UnifiedFilterStateManager';

// ===== TEST SETUP =====

describe('UnifiedFilterStateManager', () => {
  let filterManager: UnifiedFilterStateManager;
  let migrationUtility: FilterMigrationUtility;

  beforeEach(() => {
    // Reset singleton instances for each test
    (UnifiedFilterStateManager as any).instance = undefined;
    (FilterMigrationUtility as any).instance = undefined;
    
    filterManager = UnifiedFilterStateManager.getInstance();
    migrationUtility = FilterMigrationUtility.getInstance();
  });

  afterEach(() => {
    // Clean up
    filterManager.clearPerformanceMetrics();
    filterManager.clearAnalyticsEvents();
    migrationUtility.clearMigrationHistory();
  });

  // ===== BASIC FUNCTIONALITY TESTS =====

  describe('Basic Functionality', () => {
    it('should create singleton instance', () => {
      const instance1 = UnifiedFilterStateManager.getInstance();
      const instance2 = UnifiedFilterStateManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should get initial state', () => {
      const state = filterManager.getState();
      expect(state).toBeDefined();
      expect(state.selectedCategories).toEqual([]);
      expect(state.selectedBrands).toEqual([]);
      expect(state.selectedSizes).toEqual([]);
      expect(state.selectedColors).toEqual([]);
      expect(state.selectedPrices).toEqual([]);
      expect(state.selectedAvailability).toEqual(['all-items']);
      expect(state.selectedTypes).toEqual(['all-conditions']);
      expect(state.brandSearchQuery).toBe('');
      expect(state.expandedSections).toEqual(['categories']);
      expect(state.sortBy).toBe('newest');
      expect(state.viewMode).toBe('grid');
      expect(state.itemsPerPage).toBe(20);
      expect(state.currentPage).toBe(1);
      expect(state.searchQuery).toBe('');
      expect(state.currentCategory).toBe('women');
      expect(state.navigationState).toEqual({
        isNavigating: false,
        targetRoute: undefined,
        navigationType: 'filter',
      });
    });

    it('should update state correctly', () => {
      const update: UnifiedFilterStateUpdate = {
        selectedCategories: ['women', 'men'],
        selectedBrands: ['nike', 'adidas'],
        sortBy: 'price-low',
      };

      filterManager.updateState(update);
      const state = filterManager.getState();

      expect(state.selectedCategories).toEqual(['women', 'men']);
      expect(state.selectedBrands).toEqual(['nike', 'adidas']);
      expect(state.sortBy).toBe('price-low');
    });

    it('should clear filters correctly', () => {
      // First set some filters
      filterManager.updateState({
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
        selectedSizes: ['m'],
      });

      // Then clear them
      filterManager.clearFilters();
      const state = filterManager.getState();

      expect(state.selectedCategories).toEqual([]);
      expect(state.selectedBrands).toEqual([]);
      expect(state.selectedSizes).toEqual([]);
      expect(state.selectedColors).toEqual([]);
      expect(state.selectedPrices).toEqual([]);
      expect(state.selectedAvailability).toEqual(['all-items']);
      expect(state.selectedTypes).toEqual(['all-conditions']);
      expect(state.brandSearchQuery).toBe('');
      expect(state.expandedSections).toEqual(['categories']);
    });

    it('should calculate applied filters count correctly', () => {
      expect(filterManager.getAppliedFiltersCount()).toBe(0);

      filterManager.updateState({
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
        selectedSizes: ['m'],
        selectedColors: ['black'],
        selectedPrices: ['25-50'],
        priceRange: { min: 25, max: 50 },
        searchQuery: 'shoes',
      });

      expect(filterManager.getAppliedFiltersCount()).toBe(7);
    });

    it('should check if filters are applied correctly', () => {
      expect(filterManager.hasAppliedFilters()).toBe(false);

      filterManager.updateState({
        selectedCategories: ['women'],
      });

      expect(filterManager.hasAppliedFilters()).toBe(true);
    });
  });

  // ===== VALIDATION TESTS =====

  describe('Validation', () => {
    it('should validate state updates correctly', () => {
      const validUpdate: UnifiedFilterStateUpdate = {
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
        sortBy: 'newest',
      };

      expect(() => filterManager.updateState(validUpdate)).not.toThrow();
    });

    it('should reject invalid state updates', () => {
      const invalidUpdate = {
        selectedCategories: ['invalid-category-with-special-chars!'],
      } as UnifiedFilterStateUpdate;

      expect(() => filterManager.updateState(invalidUpdate)).toThrow();
    });

    it('should handle empty arrays correctly', () => {
      const update: UnifiedFilterStateUpdate = {
        selectedCategories: [],
        selectedBrands: [],
      };

      expect(() => filterManager.updateState(update)).not.toThrow();
    });

    it('should validate price range correctly', () => {
      const validPriceRange = {
        priceRange: { min: 25, max: 100 },
      };

      expect(() => filterManager.updateState(validPriceRange)).not.toThrow();
    });

    it('should reject invalid price range', () => {
      const invalidPriceRange = {
        priceRange: { min: -10, max: 100 },
      };

      expect(() => filterManager.updateState(invalidPriceRange)).toThrow();
    });
  });

  // ===== SUBSCRIBER TESTS =====

  describe('Subscribers', () => {
    it('should subscribe and notify subscribers', () => {
      let notifiedState: UnifiedFilterState | null = null;
      let errorReceived: Error | null = null;

      const subscriber = {
        id: 'test-subscriber',
        onStateChange: (state: UnifiedFilterState) => {
          notifiedState = state;
        },
        onError: (error: Error) => {
          errorReceived = error;
        },
      };

      const unsubscribe = filterManager.subscribe(subscriber);

      // Initial notification
      expect(notifiedState).toBeDefined();
      expect(notifiedState?.selectedCategories).toEqual([]);

      // Update state
      filterManager.updateState({ selectedCategories: ['women'] });

      // Should be notified of the change
      expect(notifiedState?.selectedCategories).toEqual(['women']);

      unsubscribe();
    });

    it('should handle subscriber errors gracefully', () => {
      let errorReceived: Error | null = null;

      const subscriber = {
        id: 'error-subscriber',
        onStateChange: () => {
          throw new Error('Subscriber error');
        },
        onError: (error: Error) => {
          errorReceived = error;
        },
      };

      filterManager.subscribe(subscriber);

      // Should not throw, but should call onError
      expect(() => filterManager.updateState({ selectedCategories: ['women'] })).not.toThrow();
      expect(errorReceived).toBeDefined();
    });

    it('should unsubscribe correctly', () => {
      let notificationCount = 0;

      const subscriber = {
        id: 'unsubscribe-test',
        onStateChange: () => {
          notificationCount++;
        },
      };

      const unsubscribe = filterManager.subscribe(subscriber);
      unsubscribe();

      filterManager.updateState({ selectedCategories: ['women'] });

      // Should only receive initial notification, not the update
      expect(notificationCount).toBe(1);
    });
  });

  // ===== PERFORMANCE AND ANALYTICS TESTS =====

  describe('Performance and Analytics', () => {
    it('should record performance metrics', () => {
      filterManager.updateState({ selectedCategories: ['women'] });

      const metrics = filterManager.getPerformanceMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('updateTime');
      expect(metrics[0]).toHaveProperty('timestamp');
      expect(metrics[0]).toHaveProperty('operationType');
    });

    it('should record analytics events', () => {
      filterManager.updateState({ selectedCategories: ['women'] });

      const events = filterManager.getAnalyticsEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('eventType');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('stateSnapshot');
    });

    it('should clear performance metrics', () => {
      filterManager.updateState({ selectedCategories: ['women'] });
      expect(filterManager.getPerformanceMetrics().length).toBeGreaterThan(0);

      filterManager.clearPerformanceMetrics();
      expect(filterManager.getPerformanceMetrics().length).toBe(0);
    });

    it('should clear analytics events', () => {
      filterManager.updateState({ selectedCategories: ['women'] });
      expect(filterManager.getAnalyticsEvents().length).toBeGreaterThan(0);

      filterManager.clearAnalyticsEvents();
      expect(filterManager.getAnalyticsEvents().length).toBe(0);
    });
  });

  // ===== URL SYNC TESTS =====

  describe('URL Synchronization', () => {
    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/fashion/women',
          search: '',
          pathname: '/fashion/women',
        },
        writable: true,
      });
    });

    it('should sync state to URL', () => {
      const mockReplaceState = jest.fn();
      Object.defineProperty(window, 'history', {
        value: {
          replaceState: mockReplaceState,
        },
        writable: true,
      });

      filterManager.updateState({
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
        sortBy: 'price-low',
      });

      expect(mockReplaceState).toHaveBeenCalled();
    });

    it('should sync from URL', () => {
      // Mock URL with parameters
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/fashion/women?categories=women&brands=nike&sortBy=price-low',
          search: '?categories=women&brands=nike&sortBy=price-low',
          pathname: '/fashion/women',
        },
        writable: true,
      });

      filterManager.syncFromURL();
      const state = filterManager.getState();

      expect(state.selectedCategories).toEqual(['women']);
      expect(state.selectedBrands).toEqual(['nike']);
      expect(state.sortBy).toBe('price-low');
    });
  });

  // ===== MIGRATION TESTS =====

  describe('Migration', () => {
    it('should migrate legacy state correctly', () => {
      const legacyState = {
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
        sortBy: 'price-low',
        currentCategory: 'women',
      };

      const result = migrationUtility.migrateLegacyState(legacyState, {
        validateLegacyData: true,
        enableValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.migratedState).toBeDefined();
      expect(result.migratedState?.selectedCategories).toEqual(['women']);
      expect(result.migratedState?.selectedBrands).toEqual(['nike']);
      expect(result.migratedState?.sortBy).toBe('price-low');
      expect(result.migratedState?.currentCategory).toBe('women');
    });

    it('should handle migration errors', () => {
      const invalidLegacyState = {
        selectedCategories: ['invalid-category-with-special-chars!'],
      };

      const result = migrationUtility.migrateLegacyState(invalidLegacyState, {
        validateLegacyData: true,
        enableValidation: true,
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate migration compatibility', () => {
      const legacyState = {
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
      };

      const compatibility = migrationUtility.validateMigrationCompatibility(legacyState);

      expect(compatibility.compatible).toBe(true);
      expect(compatibility.issues.length).toBe(0);
    });

    it('should detect compatibility issues', () => {
      const problematicLegacyState = {
        selectedCategories: Array(150).fill('category'), // Too many categories
        brandSearchQuery: 'a'.repeat(300), // Too long search query
        priceRange: { min: -10, max: 200000 }, // Invalid price range
      };

      const compatibility = migrationUtility.validateMigrationCompatibility(problematicLegacyState);

      expect(compatibility.compatible).toBe(false);
      expect(compatibility.issues.length).toBeGreaterThan(0);
      expect(compatibility.recommendations.length).toBeGreaterThan(0);
    });
  });

  // ===== ERROR HANDLING TESTS =====

  describe('Error Handling', () => {
    it('should handle invalid state updates gracefully', () => {
      const invalidUpdate = {
        selectedCategories: ['invalid-category-with-special-chars!'],
      } as UnifiedFilterStateUpdate;

      expect(() => filterManager.updateState(invalidUpdate)).toThrow();
    });

    it('should handle subscriber errors without crashing', () => {
      const subscriber = {
        id: 'error-subscriber',
        onStateChange: () => {
          throw new Error('Subscriber error');
        },
      };

      filterManager.subscribe(subscriber);

      // Should not crash the system
      expect(() => filterManager.updateState({ selectedCategories: ['women'] })).not.toThrow();
    });

    it('should handle URL sync errors gracefully', () => {
      // Mock invalid URL
      Object.defineProperty(window, 'location', {
        value: {
          href: 'invalid-url',
          search: '?invalid=params',
          pathname: '/invalid',
        },
        writable: true,
      });

      expect(() => filterManager.syncFromURL()).not.toThrow();
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration', () => {
    it('should handle complex state updates', () => {
      const complexUpdate: UnifiedFilterStateUpdate = {
        selectedCategories: ['women', 'men'],
        selectedBrands: ['nike', 'adidas', 'puma'],
        selectedSizes: ['s', 'm', 'l'],
        selectedColors: ['black', 'white', 'red'],
        selectedPrices: ['25-50', '50-100'],
        priceRange: { min: 25, max: 100 },
        sortBy: 'price-low',
        viewMode: 'list',
        itemsPerPage: 50,
        currentPage: 2,
        searchQuery: 'running shoes',
        brandSearchQuery: 'nike',
        expandedSections: ['categories', 'brands', 'sizes'],
        currentCategory: 'women',
        navigationState: {
          isNavigating: true,
          targetRoute: '/fashion/women/shoes',
          navigationType: 'subcategory',
        },
      };

      expect(() => filterManager.updateState(complexUpdate)).not.toThrow();

      const state = filterManager.getState();
      expect(state.selectedCategories).toEqual(['women', 'men']);
      expect(state.selectedBrands).toEqual(['nike', 'adidas', 'puma']);
      expect(state.selectedSizes).toEqual(['s', 'm', 'l']);
      expect(state.selectedColors).toEqual(['black', 'white', 'red']);
      expect(state.selectedPrices).toEqual(['25-50', '50-100']);
      expect(state.priceRange).toEqual({ min: 25, max: 100 });
      expect(state.sortBy).toBe('price-low');
      expect(state.viewMode).toBe('list');
      expect(state.itemsPerPage).toBe(50);
      expect(state.currentPage).toBe(2);
      expect(state.searchQuery).toBe('running shoes');
      expect(state.brandSearchQuery).toBe('nike');
      expect(state.expandedSections).toEqual(['categories', 'brands', 'sizes']);
      expect(state.currentCategory).toBe('women');
      expect(state.navigationState).toEqual({
        isNavigating: true,
        targetRoute: '/fashion/women/shoes',
        navigationType: 'subcategory',
      });
    });

    it('should maintain state consistency across multiple updates', () => {
      // First update
      filterManager.updateState({
        selectedCategories: ['women'],
        selectedBrands: ['nike'],
      });

      // Second update
      filterManager.updateState({
        selectedSizes: ['m'],
        selectedColors: ['black'],
      });

      // Third update
      filterManager.updateState({
        sortBy: 'price-low',
        viewMode: 'list',
      });

      const state = filterManager.getState();

      // All updates should be preserved
      expect(state.selectedCategories).toEqual(['women']);
      expect(state.selectedBrands).toEqual(['nike']);
      expect(state.selectedSizes).toEqual(['m']);
      expect(state.selectedColors).toEqual(['black']);
      expect(state.sortBy).toBe('price-low');
      expect(state.viewMode).toBe('list');
    });

    it('should handle rapid successive updates', () => {
      const updates: UnifiedFilterStateUpdate[] = [
        { selectedCategories: ['women'] },
        { selectedBrands: ['nike'] },
        { selectedSizes: ['m'] },
        { selectedColors: ['black'] },
        { sortBy: 'price-low' },
        { viewMode: 'list' },
      ];

      updates.forEach(update => {
        expect(() => filterManager.updateState(update)).not.toThrow();
      });

      const state = filterManager.getState();
      expect(state.selectedCategories).toEqual(['women']);
      expect(state.selectedBrands).toEqual(['nike']);
      expect(state.selectedSizes).toEqual(['m']);
      expect(state.selectedColors).toEqual(['black']);
      expect(state.sortBy).toBe('price-low');
      expect(state.viewMode).toBe('list');
    });
  });
}); 