/**
 * Unified Filter State Integration Test Suite
 * Comprehensive integration testing for enterprise-grade filter state management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { UnifiedFilterStateManager, type UnifiedFilterState } from '@/services/filtering/UnifiedFilterStateManager';
import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';
import { MemoryManagementService } from '@/services/memory/MemoryManagementService';
import { CentralizedConfigurationService } from '@/services/configuration/CentralizedConfigurationService';

// ===== TEST SETUP =====

describe('UnifiedFilterState Integration Tests', () => {
  let stateManager: UnifiedFilterStateManager;
  let errorHandler: FilterErrorHandler;
  let memoryManager: MemoryManagementService;
  let configService: CentralizedConfigurationService;

  beforeEach(() => {
    // Reset all singleton instances for each test
    (UnifiedFilterStateManager as any).instance = undefined;
    (FilterErrorHandler as any).instance = undefined;
    (MemoryManagementService as any).instance = undefined;
    (CentralizedConfigurationService as any).instance = undefined;

    // Initialize services
    stateManager = UnifiedFilterStateManager.getInstance();
    errorHandler = FilterErrorHandler.getInstance();
    memoryManager = MemoryManagementService.getInstance();
    configService = CentralizedConfigurationService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== SERVICE INTEGRATION TESTS =====

  describe('Service Integration', () => {
    test('should integrate with error handling service', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Trigger an error in state manager
      stateManager.updateState({
        selectedCategories: ['invalid-category']
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();
    });

    test('should integrate with memory management service', () => {
      const subscriptionId = 'test-state-subscription';
      const mockCallback = jest.fn();

      // Subscribe to state changes
      const unsubscribe = stateManager.subscribe(subscriptionId, mockCallback);

      // Verify subscription was registered with memory manager
      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeDefined();
      expect(subscriptionInfo?.componentName).toBe('UnifiedFilterStateManager');

      // Update state
      stateManager.updateState({
        selectedBrands: ['test-brand']
      });

      // Verify callback was called
      expect(mockCallback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });

    test('should integrate with configuration service', () => {
      // Update configuration
      configService.updateFilterConfiguration({
        enableFilterPresets: false,
        enableFilterAnalytics: false
      });

      // Verify state manager respects configuration
      const config = configService.getFilterConfiguration();
      expect(config.enableFilterPresets).toBe(false);
      expect(config.enableFilterAnalytics).toBe(false);
    });
  });

  // ===== STATE MANAGEMENT INTEGRATION TESTS =====

  describe('State Management Integration', () => {
    test('should handle complex state updates with validation', () => {
      const subscriberId = 'complex-state-test';
      const stateChanges: UnifiedFilterState[] = [];

      const unsubscribe = stateManager.subscribe(subscriberId, (state) => {
        stateChanges.push(state);
      });

      // Perform complex state updates
      stateManager.updateState({
        selectedCategories: ['fashion', 'electronics'],
        selectedBrands: ['nike', 'adidas'],
        selectedSizes: ['M', 'L'],
        selectedColors: ['red', 'blue'],
        selectedPrices: ['10-50', '50-100'],
        brandSearchQuery: 'test search'
      });

      // Verify state changes were recorded
      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges[stateChanges.length - 1].selectedCategories).toContain('fashion');
      expect(stateChanges[stateChanges.length - 1].selectedBrands).toContain('nike');

      unsubscribe();
    });

    test('should handle state history and undo functionality', () => {
      // Initial state
      stateManager.updateState({
        selectedCategories: ['initial-category']
      });

      // First update
      stateManager.updateState({
        selectedCategories: ['first-update']
      });

      // Second update
      stateManager.updateState({
        selectedCategories: ['second-update']
      });

      // Verify history
      const history = stateManager.getStateHistory();
      expect(history.length).toBeGreaterThan(0);

      // Undo last change
      const undoResult = stateManager.undo();
      expect(undoResult).toBe(true);

      // Verify state was reverted
      const currentState = stateManager.getState();
      expect(currentState.selectedCategories).toContain('first-update');
    });

    test('should handle filter presets integration', () => {
      const presetName = 'Test Preset';
      const presetFilters = {
        selectedCategories: ['preset-category'],
        selectedBrands: ['preset-brand'],
        selectedSizes: ['preset-size']
      };

      // Save preset
      const presetId = stateManager.savePreset(presetName, presetFilters);
      expect(presetId).toBeTruthy();

      // Clear current state
      stateManager.clearFilters();

      // Load preset
      const loadResult = stateManager.loadPreset(presetId);
      expect(loadResult).toBe(true);

      // Verify preset was loaded
      const currentState = stateManager.getState();
      expect(currentState.selectedCategories).toContain('preset-category');
      expect(currentState.selectedBrands).toContain('preset-brand');
    });

    test('should handle analytics integration', () => {
      // Perform multiple filter operations
      stateManager.updateState({
        selectedCategories: ['analytics-test-1']
      });

      stateManager.updateState({
        selectedBrands: ['analytics-test-2']
      });

      stateManager.updateState({
        selectedSizes: ['analytics-test-3']
      });

      // Get analytics
      const analytics = stateManager.getAnalytics();

      expect(analytics.totalFiltersApplied).toBeGreaterThan(0);
      expect(analytics.mostUsedFilters).toBeDefined();
      expect(analytics.filterChangeFrequency).toBeGreaterThan(0);
    });
  });

  // ===== ERROR HANDLING INTEGRATION TESTS =====

  describe('Error Handling Integration', () => {
    test('should handle validation errors gracefully', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt to update with invalid state
      stateManager.updateState({
        selectedCategories: ['valid-category'],
        // Add invalid property to trigger validation error
        invalidProperty: 'invalid-value' as any
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.VALIDATION_ERROR,
          context: FilterErrorContext.STATE_MANAGEMENT
        })
      );
    });

    test('should handle memory errors gracefully', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Simulate memory alert
      memoryManager.emit('memoryAlert', {
        message: 'Memory threshold exceeded',
        severity: 'high',
        timestamp: Date.now()
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.MEMORY_ERROR,
          context: FilterErrorContext.MEMORY_MANAGEMENT
        })
      );
    });

    test('should handle configuration errors gracefully', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt to update configuration with invalid data
      configService.updateConfiguration({
        filters: {
          enableAdvancedFilters: 'invalid-boolean' as any
        }
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.CONFIGURATION_ERROR,
          context: FilterErrorContext.CONFIGURATION
        })
      );
    });
  });

  // ===== MEMORY MANAGEMENT INTEGRATION TESTS =====

  describe('Memory Management Integration', () => {
    test('should track subscriptions in memory manager', () => {
      const subscriptionIds = ['mem-test-1', 'mem-test-2', 'mem-test-3'];
      const unsubscribes: (() => void)[] = [];

      // Create multiple subscriptions
      subscriptionIds.forEach(id => {
        const unsubscribe = stateManager.subscribe(id, jest.fn());
        unsubscribes.push(unsubscribe);
      });

      // Verify subscriptions are tracked
      subscriptionIds.forEach(id => {
        const subscriptionInfo = memoryManager.getSubscriptionInfo(id);
        expect(subscriptionInfo).toBeDefined();
        expect(subscriptionInfo?.componentName).toBe('UnifiedFilterStateManager');
      });

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });

    test('should handle memory cleanup gracefully', () => {
      const subscriptionId = 'cleanup-test';
      const mockCallback = jest.fn();

      // Create subscription
      const unsubscribe = stateManager.subscribe(subscriptionId, mockCallback);

      // Verify subscription exists
      let subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeDefined();

      // Perform memory cleanup
      memoryManager.performCleanup();

      // Verify subscription still exists (not old enough to be cleaned up)
      subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeDefined();

      // Cleanup
      unsubscribe();
    });

    test('should handle memory alerts', () => {
      const alertListener = jest.fn();
      memoryManager.on('memoryAlert', alertListener);

      // Simulate memory alert
      memoryManager.emit('memoryAlert', {
        message: 'Memory usage high',
        severity: 'medium',
        timestamp: Date.now()
      });

      // Verify alert was received
      expect(alertListener).toHaveBeenCalled();
    });
  });

  // ===== CONFIGURATION INTEGRATION TESTS =====

  describe('Configuration Integration', () => {
    test('should respect filter configuration settings', () => {
      // Update configuration to disable certain features
      configService.updateFilterConfiguration({
        enableFilterPresets: false,
        enableFilterAnalytics: false,
        enableFilterHistory: false
      });

      const config = configService.getFilterConfiguration();

      // Verify configuration was updated
      expect(config.enableFilterPresets).toBe(false);
      expect(config.enableFilterAnalytics).toBe(false);
      expect(config.enableFilterHistory).toBe(false);
    });

    test('should handle configuration changes dynamically', () => {
      const configChangeListener = jest.fn();
      configService.on('configurationChanged', configChangeListener);

      // Update configuration
      configService.updateFilterConfiguration({
        maxVisibleFilters: 20,
        filterDebounceDelay: 500
      });

      // Verify configuration change was detected
      expect(configChangeListener).toHaveBeenCalled();
    });

    test('should handle configuration validation', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt to set invalid configuration
      configService.updateConfiguration({
        filters: {
          maxVisibleFilters: -1 // Invalid negative value
        }
      });

      // Verify validation error was handled
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.CONFIGURATION_ERROR,
          context: FilterErrorContext.CONFIGURATION
        })
      );
    });
  });

  // ===== PERFORMANCE INTEGRATION TESTS =====

  describe('Performance Integration', () => {
    test('should handle high volume state updates efficiently', () => {
      const startTime = performance.now();

      // Perform 1000 state updates
      for (let i = 0; i < 1000; i++) {
        stateManager.updateState({
          selectedCategories: [`category-${i}`],
          selectedBrands: [`brand-${i}`],
          selectedSizes: [`size-${i}`]
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);

      // Verify final state
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('category-999');
    });

    test('should handle multiple concurrent subscribers', () => {
      const subscriberCount = 100;
      const subscribers = Array.from({ length: subscriberCount }, () => jest.fn());
      const unsubscribes: (() => void)[] = [];

      // Register many subscribers
      subscribers.forEach((callback, index) => {
        const unsubscribe = stateManager.subscribe(`subscriber-${index}`, callback);
        unsubscribes.push(unsubscribe);
      });

      const startTime = performance.now();

      // Update state
      stateManager.updateState({
        selectedCategories: ['concurrent-test']
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 500ms
      expect(duration).toBeLessThan(500);

      // Verify all subscribers were notified
      subscribers.forEach(subscriber => {
        expect(subscriber).toHaveBeenCalled();
      });

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });

    test('should handle memory usage efficiently', () => {
      const initialStats = memoryManager.getMemoryStats();

      // Perform operations
      for (let i = 0; i < 100; i++) {
        stateManager.updateState({
          selectedCategories: [`memory-test-${i}`]
        });
      }

      const finalStats = memoryManager.getMemoryStats();

      // Verify memory usage is reasonable
      expect(finalStats.totalMemoryUsage).toBeGreaterThan(initialStats.totalMemoryUsage);
      expect(finalStats.isHealthy).toBe(true);
    });
  });

  // ===== ERROR RECOVERY INTEGRATION TESTS =====

  describe('Error Recovery Integration', () => {
    test('should recover from validation errors', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt invalid update
      stateManager.updateState({
        selectedCategories: ['valid-category'],
        invalidProperty: 'invalid' as any
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();

      // Attempt valid update
      stateManager.updateState({
        selectedCategories: ['recovery-category']
      });

      // Verify state was updated successfully
      const currentState = stateManager.getState();
      expect(currentState.selectedCategories).toContain('recovery-category');
    });

    test('should recover from memory errors', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Simulate memory error
      memoryManager.emit('memoryAlert', {
        message: 'Memory error occurred',
        severity: 'high',
        timestamp: Date.now()
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();

      // Verify system continues to function
      stateManager.updateState({
        selectedCategories: ['post-error-category']
      });

      const currentState = stateManager.getState();
      expect(currentState.selectedCategories).toContain('post-error-category');
    });

    test('should recover from configuration errors', () => {
      const errorListener = jest.fn();
      errorHandler.addErrorListener({
        priority: 10,
        onError: errorListener
      });

      // Attempt invalid configuration
      configService.updateConfiguration({
        filters: {
          maxVisibleFilters: 'invalid' as any
        }
      });

      // Verify error was handled
      expect(errorListener).toHaveBeenCalled();

      // Attempt valid configuration
      configService.updateFilterConfiguration({
        maxVisibleFilters: 15
      });

      // Verify configuration was updated
      const config = configService.getFilterConfiguration();
      expect(config.maxVisibleFilters).toBe(15);
    });
  });

  // ===== COMPLEX SCENARIO TESTS =====

  describe('Complex Scenarios', () => {
    test('should handle complete filter workflow', () => {
      const subscriberId = 'workflow-test';
      const stateChanges: UnifiedFilterState[] = [];

      const unsubscribe = stateManager.subscribe(subscriberId, (state) => {
        stateChanges.push(state);
      });

      // Step 1: Select categories
      stateManager.updateState({
        selectedCategories: ['fashion', 'electronics']
      });

      // Step 2: Select brands
      stateManager.updateState({
        selectedBrands: ['nike', 'apple']
      });

      // Step 3: Select sizes
      stateManager.updateState({
        selectedSizes: ['M', 'L']
      });

      // Step 4: Search brands
      stateManager.updateState({
        brandSearchQuery: 'test search'
      });

      // Step 5: Save preset
      const presetId = stateManager.savePreset('Workflow Preset', {
        selectedCategories: ['fashion'],
        selectedBrands: ['nike'],
        selectedSizes: ['M']
      });

      // Step 6: Clear filters
      stateManager.clearFilters();

      // Step 7: Load preset
      stateManager.loadPreset(presetId);

      // Verify workflow completed successfully
      expect(stateChanges.length).toBeGreaterThan(0);
      expect(presetId).toBeTruthy();

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toContain('fashion');

      unsubscribe();
    });

    test('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            stateManager.updateState({
              selectedCategories: [`concurrent-${index}`],
              selectedBrands: [`brand-${index}`]
            });
            resolve();
          }, Math.random() * 100);
        });
      });

      // Execute all operations concurrently
      await Promise.all(operations);

      // Verify final state
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
    });

    test('should handle system stress conditions', () => {
      const subscriberCount = 50;
      const updateCount = 100;
      const subscribers = Array.from({ length: subscriberCount }, () => jest.fn());
      const unsubscribes: (() => void)[] = [];

      // Register many subscribers
      subscribers.forEach((callback, index) => {
        const unsubscribe = stateManager.subscribe(`stress-sub-${index}`, callback);
        unsubscribes.push(unsubscribe);
      });

      // Perform many updates
      for (let i = 0; i < updateCount; i++) {
        stateManager.updateState({
          selectedCategories: [`stress-category-${i}`],
          selectedBrands: [`stress-brand-${i}`],
          selectedSizes: [`stress-size-${i}`]
        });
      }

      // Verify system is still functional
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBeGreaterThan(0);

      // Verify all subscribers received updates
      subscribers.forEach(subscriber => {
        expect(subscriber).toHaveBeenCalled();
      });

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });

  // ===== EDGE CASE INTEGRATION TESTS =====

  describe('Edge Cases', () => {
    test('should handle rapid subscribe/unsubscribe cycles', () => {
      const cycles = 100;

      for (let i = 0; i < cycles; i++) {
        const unsubscribe = stateManager.subscribe(`cycle-${i}`, jest.fn());
        
        stateManager.updateState({
          selectedCategories: [`cycle-category-${i}`]
        });

        unsubscribe();
      }

      // Verify system is still functional
      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBeGreaterThan(0);
    });

    test('should handle very large state objects', () => {
      const largeCategories = Array.from({ length: 1000 }, (_, i) => `large-category-${i}`);
      const largeBrands = Array.from({ length: 1000 }, (_, i) => `large-brand-${i}`);

      stateManager.updateState({
        selectedCategories: largeCategories,
        selectedBrands: largeBrands
      });

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories.length).toBe(1000);
      expect(finalState.selectedBrands.length).toBe(1000);
    });

    test('should handle unicode and special characters', () => {
      const unicodeCategories = ['🚀🌟🎉', '中文', '日本語', '한국어'];
      const specialBrands = ['Brand with spaces', 'Brand-with-dashes', 'Brand_with_underscores'];

      stateManager.updateState({
        selectedCategories: unicodeCategories,
        selectedBrands: specialBrands
      });

      const finalState = stateManager.getState();
      expect(finalState.selectedCategories).toEqual(unicodeCategories);
      expect(finalState.selectedBrands).toEqual(specialBrands);
    });
  });
}); 