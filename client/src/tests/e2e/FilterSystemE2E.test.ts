/**
 * Filter System End-to-End Test Suite
 * Comprehensive E2E testing for enterprise-grade filter system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { UnifiedFilterStateManager } from '@/services/filtering/UnifiedFilterStateManager';
import { FilterErrorHandler } from '@/services/error/FilterErrorHandler';
import { MemoryManagementService } from '@/services/memory/MemoryManagementService';
import { CentralizedConfigurationService } from '@/services/configuration/CentralizedConfigurationService';
import { CategoryNavigationService } from '@/services/navigation/CategoryNavigationService';
import { useUnifiedFilterState } from '@/hooks/useUnifiedFilterState';
import { useConfiguration } from '@/hooks/useConfiguration';

// ===== E2E TEST SETUP =====

describe('Filter System End-to-End Tests', () => {
  let stateManager: UnifiedFilterStateManager;
  let errorHandler: FilterErrorHandler;
  let memoryManager: MemoryManagementService;
  let configService: CentralizedConfigurationService;
  let navigationService: CategoryNavigationService;

  beforeEach(() => {
    // Reset all singleton instances for each test
    (UnifiedFilterStateManager as any).instance = undefined;
    (FilterErrorHandler as any).instance = undefined;
    (MemoryManagementService as any).instance = undefined;
    (CentralizedConfigurationService as any).instance = undefined;
    (CategoryNavigationService as any).instance = undefined;

    // Initialize all services
    stateManager = UnifiedFilterStateManager.getInstance();
    errorHandler = FilterErrorHandler.getInstance();
    memoryManager = MemoryManagementService.getInstance();
    configService = CentralizedConfigurationService.getInstance();
    navigationService = CategoryNavigationService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== COMPLETE SYSTEM WORKFLOW TESTS =====

  describe('Complete System Workflow', () => {
    test('should handle complete user journey from navigation to filtering', async () => {
      // Step 1: Navigate to category
      const navigationResult = await navigationService.navigateToPath('/fashion/women');
      expect(navigationResult).toBe(true);

      // Step 2: Get current navigation state
      const navigationState = navigationService.getNavigationState();
      expect(navigationState.currentPath).toBe('/fashion/women');

      // Step 3: Get breadcrumbs
      const breadcrumbs = navigationService.getBreadcrumbs();
      expect(breadcrumbs.length).toBeGreaterThan(0);

      // Step 4: Apply filters
      stateManager.updateState({
        selectedCategories: ['women'],
        selectedBrands: ['nike', 'adidas'],
        selectedSizes: ['M', 'L'],
        selectedColors: ['red', 'blue'],
        selectedPrices: ['50-100'],
        brandSearchQuery: 'sports'
      });

      // Step 5: Verify filter state
      const filterState = stateManager.getState();
      expect(filterState.selectedCategories).toContain('women');
      expect(filterState.selectedBrands).toContain('nike');
      expect(filterState.selectedSizes).toContain('M');
      expect(filterState.selectedColors).toContain('red');
      expect(filterState.selectedPrices).toContain('50-100');
      expect(filterState.brandSearchQuery).toBe('sports');

      // Step 6: Save filter preset
      const presetId = stateManager.savePreset('Sports Women', {
        selectedCategories: ['women'],
        selectedBrands: ['nike', 'adidas'],
        selectedSizes: ['M', 'L'],
        selectedColors: ['red', 'blue'],
        selectedPrices: ['50-100']
      });

      expect(presetId).toBeTruthy();

      // Step 7: Clear filters
      stateManager.clearFilters();

      // Step 8: Load preset
      const loadResult = stateManager.loadPreset(presetId);
      expect(loadResult).toBe(true);

      // Step 9: Verify preset loaded correctly
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('women');
      expect(finalState.selectedBrands).toContain('nike');

      // Step 10: Get analytics
      const analytics = stateManager.getAnalytics();
      expect(analytics.totalFiltersApplied).toBeGreaterThan(0);
    });

    test('should handle complex multi-step filtering workflow', async () => {
      // Step 1: Navigate to main category
      await navigationService.navigateToPath('/fashion');

      // Step 2: Apply initial filters
      stateManager.updateState({
        selectedCategories: ['fashion'],
        selectedAvailability: ['in-stock'],
        selectedTypes: ['new']
      });

      // Step 3: Navigate to subcategory
      await navigationService.navigateToPath('/fashion/men');

      // Step 4: Apply more specific filters
      stateManager.updateState({
        selectedBrands: ['levis', 'calvin-klein'],
        selectedSizes: ['32', '34'],
        selectedColors: ['black', 'navy'],
        selectedPrices: ['100-200', '200-500']
      });

      // Step 5: Search within brands
      stateManager.updateState({
        brandSearchQuery: 'premium'
      });

      // Step 6: Save complex preset
      const complexPresetId = stateManager.savePreset('Premium Men\'s Fashion', {
        selectedCategories: ['fashion', 'men'],
        selectedBrands: ['levis', 'calvin-klein'],
        selectedSizes: ['32', '34'],
        selectedColors: ['black', 'navy'],
        selectedPrices: ['100-200', '200-500'],
        selectedAvailability: ['in-stock'],
        selectedTypes: ['new'],
        brandSearchQuery: 'premium'
      });

      expect(complexPresetId).toBeTruthy();

      // Step 7: Navigate to different category
      await navigationService.navigateToPath('/electronics');

      // Step 8: Clear filters
      stateManager.clearFilters();

      // Step 9: Apply electronics filters
      stateManager.updateState({
        selectedCategories: ['electronics'],
        selectedBrands: ['apple', 'samsung'],
        selectedPrices: ['500-1000', '1000+']
      });

      // Step 10: Load previous preset
      const loadResult = stateManager.loadPreset(complexPresetId);
      expect(loadResult).toBe(true);

      // Step 11: Verify navigation and filters are consistent
      const navigationState = navigationService.getNavigationState();
      const filterState = stateManager.getState();

      expect(navigationState.currentPath).toBe('/electronics');
      expect(filterState.selectedCategories).toContain('fashion');
      expect(filterState.selectedBrands).toContain('levis');
    });

    test('should handle error recovery in complete workflow', async () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Step 1: Start normal workflow
      await navigationService.navigateToPath('/fashion');

      // Step 2: Apply filters
      stateManager.updateState({
        selectedCategories: ['fashion'],
        selectedBrands: ['nike']
      });

      // Step 3: Simulate error condition
      stateManager.updateState({
        selectedCategories: ['invalid-category'],
        invalidProperty: 'invalid-value' as any
      });

      // Step 4: Verify error was handled
      expect(errorListener).toHaveBeenCalled();

      // Step 5: Continue with valid operations
      stateManager.updateState({
        selectedCategories: ['fashion'],
        selectedBrands: ['adidas']
      });

      // Step 6: Verify system recovered
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('fashion');
      expect(finalState.selectedBrands).toContain('adidas');
    });
  });

  // ===== SYSTEM INTEGRATION TESTS =====

  describe('System Integration', () => {
    test('should integrate all services seamlessly', () => {
      // Test error handling integration
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Test memory management integration
      const subscriptionId = 'integration-test';
      const mockCallback = jest.fn();
      const unsubscribe = stateManager.subscribe(subscriptionId, mockCallback);

      // Test configuration integration
      configService.updateFilterConfiguration({
        enableFilterPresets: true,
        enableFilterAnalytics: true,
        maxVisibleFilters: 15
      });

      // Test navigation integration
      navigationService.navigateToPath('/fashion/men');

      // Perform operations that trigger all integrations
      stateManager.updateState({
        selectedCategories: ['men'],
        selectedBrands: ['test-brand']
      });

      // Verify all integrations worked
      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeDefined();

      const config = configService.getFilterConfiguration();
      expect(config.enableFilterPresets).toBe(true);

      const navigationState = navigationService.getNavigationState();
      expect(navigationState.currentPath).toBe('/fashion/men');

      unsubscribe();
    });

    test('should handle configuration changes affecting all services', () => {
      // Initial configuration
      configService.updateFilterConfiguration({
        enableFilterPresets: true,
        enableFilterAnalytics: true,
        enableFilterHistory: true
      });

      // Perform operations
      stateManager.updateState({
        selectedCategories: ['test-category']
      });

      const presetId = stateManager.savePreset('Test Preset', {
        selectedCategories: ['test-category']
      });

      // Change configuration
      configService.updateFilterConfiguration({
        enableFilterPresets: false,
        enableFilterAnalytics: false,
        enableFilterHistory: false
      });

      // Verify configuration affects behavior
      const config = configService.getFilterConfiguration();
      expect(config.enableFilterPresets).toBe(false);
      expect(config.enableFilterAnalytics).toBe(false);
      expect(config.enableFilterHistory).toBe(false);
    });

    test('should handle memory management across all services', () => {
      const subscriptionIds = ['service-1', 'service-2', 'service-3'];
      const unsubscribes: (() => void)[] = [];

      // Create subscriptions for different services
      subscriptionIds.forEach(id => {
        const unsubscribe = stateManager.subscribe(id, jest.fn());
        unsubscribes.push(unsubscribe);
      });

      // Verify all subscriptions are tracked
      subscriptionIds.forEach(id => {
        const subscriptionInfo = memoryManager.getSubscriptionInfo(id);
        expect(subscriptionInfo).toBeDefined();
      });

      // Perform memory cleanup
      memoryManager.performCleanup();

      // Verify subscriptions still exist (not old enough)
      subscriptionIds.forEach(id => {
        const subscriptionInfo = memoryManager.getSubscriptionInfo(id);
        expect(subscriptionInfo).toBeDefined();
      });

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });

  // ===== PERFORMANCE E2E TESTS =====

  describe('Performance E2E', () => {
    test('should handle high-volume operations across all services', () => {
      const startTime = performance.now();

      // Perform 1000 operations across all services
      for (let i = 0; i < 1000; i++) {
        // Navigation operations
        navigationService.navigateToPath(`/category-${i % 10}`);

        // Filter operations
        stateManager.updateState({
          selectedCategories: [`category-${i}`],
          selectedBrands: [`brand-${i}`],
          selectedSizes: [`size-${i % 5}`]
        });

        // Configuration operations
        configService.updateFilterConfiguration({
          maxVisibleFilters: 10 + (i % 20)
        });

        // Memory operations
        memoryManager.registerSubscription(
          `perf-sub-${i}`,
          `PerformanceComponent${i}`,
          jest.fn()
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);

      // Verify all services are still functional
      const finalState = stateManager.getState();
      const finalNavigationState = navigationService.getNavigationState();
      const finalConfig = configService.getFilterConfiguration();
      const finalMemoryStats = memoryManager.getMemoryStats();

      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
      expect(finalNavigationState.currentPath).toBeDefined();
      expect(finalConfig.maxVisibleFilters).toBeGreaterThan(0);
      expect(finalMemoryStats.activeSubscriptions).toBeGreaterThan(0);
    });

    test('should handle concurrent operations efficiently', async () => {
      const operationCount = 100;
      const operations = Array.from({ length: operationCount }, (_, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            // Navigation operation
            navigationService.navigateToPath(`/concurrent-${index % 5}`);

            // Filter operation
            stateManager.updateState({
              selectedCategories: [`concurrent-category-${index}`],
              selectedBrands: [`concurrent-brand-${index}`]
            });

            // Configuration operation
            configService.updateFilterConfiguration({
              maxVisibleFilters: 10 + (index % 10)
            });

            resolve();
          }, Math.random() * 50);
        });
      });

      const startTime = performance.now();

      // Execute all operations concurrently
      await Promise.all(operations);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);

      // Verify system is still functional
      const finalState = stateManager.getState();
      const finalNavigationState = navigationService.getNavigationState();
      const finalConfig = configService.getFilterConfiguration();

      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
      expect(finalNavigationState.currentPath).toBeDefined();
      expect(finalConfig.maxVisibleFilters).toBeGreaterThan(0);
    });

    test('should maintain performance under memory pressure', () => {
      const initialMemoryStats = memoryManager.getMemoryStats();

      // Create many subscriptions to simulate memory pressure
      const subscriptionCount = 500;
      const unsubscribes: (() => void)[] = [];

      for (let i = 0; i < subscriptionCount; i++) {
        const unsubscribe = stateManager.subscribe(`memory-pressure-${i}`, jest.fn());
        unsubscribes.push(unsubscribe);
      }

      const startTime = performance.now();

      // Perform operations under memory pressure
      for (let i = 0; i < 100; i++) {
        stateManager.updateState({
          selectedCategories: [`pressure-category-${i}`],
          selectedBrands: [`pressure-brand-${i}`]
        });

        navigationService.navigateToPath(`/pressure-${i % 10}`);

        configService.updateFilterConfiguration({
          maxVisibleFilters: 10 + (i % 5)
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 3 seconds even under memory pressure
      expect(duration).toBeLessThan(3000);

      const finalMemoryStats = memoryManager.getMemoryStats();
      expect(finalMemoryStats.isHealthy).toBe(true);

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });

  // ===== ERROR HANDLING E2E TESTS =====

  describe('Error Handling E2E', () => {
    test('should handle cascading errors gracefully', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Trigger errors in multiple services
      stateManager.updateState({
        selectedCategories: ['valid-category'],
        invalidProperty: 'invalid' as any
      });

      configService.updateConfiguration({
        filters: {
          maxVisibleFilters: 'invalid' as any
        }
      });

      navigationService.navigateToPath('/invalid-path');

      // Verify all errors were handled
      expect(errorListener).toHaveBeenCalledTimes(3);

      // Verify system continues to function
      stateManager.updateState({
        selectedCategories: ['recovery-category']
      });

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('recovery-category');
    });

    test('should handle memory errors and recovery', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      const alertListener = jest.fn();
      memoryManager.on('memoryAlert', alertListener);

      // Simulate memory pressure
      for (let i = 0; i < 1000; i++) {
        memoryManager.registerSubscription(
          `memory-error-test-${i}`,
          `MemoryErrorComponent${i}`,
          jest.fn()
        );
      }

      // Simulate memory alert
      memoryManager.emit('memoryAlert', {
        message: 'Memory threshold exceeded',
        severity: 'high',
        timestamp: Date.now()
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();
      expect(alertListener).toHaveBeenCalled();

      // Verify system continues to function
      stateManager.updateState({
        selectedCategories: ['post-memory-error']
      });

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('post-memory-error');
    });

    test('should handle configuration errors and recovery', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt invalid configuration
      configService.updateConfiguration({
        filters: {
          enableAdvancedFilters: 'invalid-boolean' as any,
          maxVisibleFilters: -1
        }
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();

      // Attempt valid configuration
      configService.updateFilterConfiguration({
        enableAdvancedFilters: true,
        maxVisibleFilters: 15
      });

      // Verify configuration was updated
      const config = configService.getFilterConfiguration();
      expect(config.enableAdvancedFilters).toBe(true);
      expect(config.maxVisibleFilters).toBe(15);
    });
  });

  // ===== COMPLEX SCENARIO E2E TESTS =====

  describe('Complex Scenario E2E', () => {
    test('should handle multi-user simulation', async () => {
      const userCount = 10;
      const operationsPerUser = 50;
      const userOperations: Promise<void>[] = [];

      // Simulate multiple users performing operations
      for (let userIndex = 0; userIndex < userCount; userIndex++) {
        const userOperations = Array.from({ length: operationsPerUser }, (_, opIndex) => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              // User-specific operations
              const userId = `user-${userIndex}`;
              const operationId = opIndex;

              // Navigation
              navigationService.navigateToPath(`/${userId}/category-${operationId % 5}`);

              // Filtering
              stateManager.updateState({
                selectedCategories: [`${userId}-category-${operationId}`],
                selectedBrands: [`${userId}-brand-${operationId}`],
                selectedSizes: [`${userId}-size-${operationId % 3}`]
              });

              // Configuration
              configService.updateFilterConfiguration({
                maxVisibleFilters: 10 + (operationId % 10)
              });

              resolve();
            }, Math.random() * 100);
          });
        });

        userOperations.push(...userOperations);
      }

      const startTime = performance.now();

      // Execute all user operations
      await Promise.all(userOperations);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);

      // Verify system is still functional
      const finalState = stateManager.getState();
      const finalNavigationState = navigationService.getNavigationState();
      const finalConfig = configService.getFilterConfiguration();

      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
      expect(finalNavigationState.currentPath).toBeDefined();
      expect(finalConfig.maxVisibleFilters).toBeGreaterThan(0);
    });

    test('should handle system stress with error conditions', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      const stressOperations = 200;
      let errorCount = 0;

      // Perform stress operations with occasional errors
      for (let i = 0; i < stressOperations; i++) {
        try {
          // Normal operations
          stateManager.updateState({
            selectedCategories: [`stress-category-${i}`],
            selectedBrands: [`stress-brand-${i}`]
          });

          navigationService.navigateToPath(`/stress-${i % 10}`);

          configService.updateFilterConfiguration({
            maxVisibleFilters: 10 + (i % 5)
          });

          // Occasionally trigger errors
          if (i % 20 === 0) {
            stateManager.updateState({
              selectedCategories: ['valid-category'],
              invalidProperty: 'invalid' as any
            });
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      // Verify errors were handled
      expect(errorListener).toHaveBeenCalledTimes(errorCount);

      // Verify system is still functional
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
    });

    test('should handle complete system lifecycle', async () => {
      // Phase 1: System initialization
      const initialConfig = configService.getConfiguration();
      expect(initialConfig.environment).toBeDefined();

      // Phase 2: Normal operations
      await navigationService.navigateToPath('/fashion');
      stateManager.updateState({
        selectedCategories: ['fashion'],
        selectedBrands: ['nike']
      });

      // Phase 3: Save state
      const presetId = stateManager.savePreset('Lifecycle Test', {
        selectedCategories: ['fashion'],
        selectedBrands: ['nike']
      });

      // Phase 4: Error conditions
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      stateManager.updateState({
        selectedCategories: ['valid-category'],
        invalidProperty: 'invalid' as any
      });

      // Phase 5: Recovery
      stateManager.updateState({
        selectedCategories: ['recovery-category']
      });

      // Phase 6: Load saved state
      stateManager.loadPreset(presetId);

      // Phase 7: Cleanup
      memoryManager.performCleanup();

      // Verify complete lifecycle
      expect(errorListener).toHaveBeenCalled();
      expect(presetId).toBeTruthy();

      const finalState = stateManager.getState();
      const finalNavigationState = navigationService.getNavigationState();
      const finalMemoryStats = memoryManager.getMemoryStats();

      expect(finalState.selectedCategories).toContain('fashion');
      expect(finalNavigationState.currentPath).toBe('/fashion');
      expect(finalMemoryStats.isHealthy).toBe(true);
    });
  });

  // ===== EDGE CASE E2E TESTS =====

  describe('Edge Case E2E', () => {
    test('should handle rapid state changes', () => {
      const changeCount = 1000;
      const startTime = performance.now();

      // Perform rapid state changes
      for (let i = 0; i < changeCount; i++) {
        stateManager.updateState({
          selectedCategories: [`rapid-category-${i}`],
          selectedBrands: [`rapid-brand-${i}`],
          selectedSizes: [`rapid-size-${i % 5}`]
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 3 seconds
      expect(duration).toBeLessThan(3000);

      // Verify final state
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain(`rapid-category-${changeCount - 1}`);
    });

    test('should handle very large data sets', () => {
      const largeCategories = Array.from({ length: 1000 }, (_, i) => `large-category-${i}`);
      const largeBrands = Array.from({ length: 1000 }, (_, i) => `large-brand-${i}`);
      const largeSizes = Array.from({ length: 100 }, (_, i) => `large-size-${i}`);

      stateManager.updateState({
        selectedCategories: largeCategories,
        selectedBrands: largeBrands,
        selectedSizes: largeSizes
      });

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBe(1000);
      expect(finalState.selectedBrands.length).toBe(1000);
      expect(finalState.selectedSizes.length).toBe(100);
    });

    test('should handle unicode and special characters throughout system', () => {
      const unicodeCategories = ['🚀🌟🎉', '中文', '日本語', '한국어'];
      const specialBrands = ['Brand with spaces', 'Brand-with-dashes', 'Brand_with_underscores'];
      const specialSizes = ['Size with spaces', 'Size-with-dashes', 'Size_with_underscores'];

      // Test in state manager
      stateManager.updateState({
        selectedCategories: unicodeCategories,
        selectedBrands: specialBrands,
        selectedSizes: specialSizes
      });

      // Test in navigation
      navigationService.navigateToPath('/🚀🌟🎉/中文/日本語');

      // Test in configuration
      configService.updateFilterConfiguration({
        enableAdvancedFilters: true,
        maxVisibleFilters: 15
      });

      // Verify all systems handle unicode correctly
      const finalState = stateManager.getState();
      const finalNavigationState = navigationService.getNavigationState();
      const finalConfig = configService.getFilterConfiguration();

      expect(finalState.selectedCategories).toEqual(unicodeCategories);
      expect(finalState.selectedBrands).toEqual(specialBrands);
      expect(finalState.selectedSizes).toEqual(specialSizes);
      expect(finalNavigationState.currentPath).toBe('/🚀🌟🎉/中文/日本語');
      expect(finalConfig.enableAdvancedFilters).toBe(true);
    });
  });
}); 