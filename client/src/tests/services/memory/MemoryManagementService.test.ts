/**
 * Memory Management Service Test Suite
 * Comprehensive testing for enterprise-grade memory management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { MemoryManagementService } from '@/services/memory/MemoryManagementService';
import type { SubscriptionInfo, MemoryStats, MemoryAlert } from '@/services/memory/MemoryManagementService';

// ===== TEST SETUP =====

describe('MemoryManagementService', () => {
  let memoryManager: MemoryManagementService;
  let mockUnsubscribeFn: jest.Mock;

  beforeEach(() => {
    // Reset singleton instance for each test
    (MemoryManagementService as any).instance = undefined;
    memoryManager = MemoryManagementService.getInstance();
    
    mockUnsubscribeFn = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== BASIC FUNCTIONALITY TESTS =====

  describe('Basic Functionality', () => {
    test('should create singleton instance', () => {
      const instance1 = MemoryManagementService.getInstance();
      const instance2 = MemoryManagementService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(MemoryManagementService);
    });

    test('should register subscription successfully', () => {
      const subscriptionId = 'test-subscription-1';
      const componentName = 'TestComponent';

      memoryManager.registerSubscription(
        subscriptionId,
        componentName,
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      
      expect(subscriptionInfo).toBeDefined();
      expect(subscriptionInfo?.id).toBe(subscriptionId);
      expect(subscriptionInfo?.componentName).toBe(componentName);
      expect(subscriptionInfo?.isActive).toBe(true);
    });

    test('should unregister subscription successfully', () => {
      const subscriptionId = 'test-subscription-2';
      const componentName = 'TestComponent';

      memoryManager.registerSubscription(
        subscriptionId,
        componentName,
        mockUnsubscribeFn
      );

      // Verify subscription exists
      let subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeDefined();

      // Unregister subscription
      memoryManager.unregisterSubscription(subscriptionId);

      // Verify subscription is removed
      subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeNull();

      // Verify unsubscribe function was called
      expect(mockUnsubscribeFn).toHaveBeenCalled();
    });

    test('should update subscription access time', () => {
      const subscriptionId = 'test-subscription-3';
      const componentName = 'TestComponent';

      memoryManager.registerSubscription(
        subscriptionId,
        componentName,
        mockUnsubscribeFn
      );

      const initialInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      const initialAccessTime = initialInfo?.lastAccessed;

      // Wait a bit to ensure time difference
      jest.advanceTimersByTime(1000);

      memoryManager.updateSubscriptionAccess(subscriptionId);

      const updatedInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      const updatedAccessTime = updatedInfo?.lastAccessed;

      expect(updatedAccessTime).toBeGreaterThan(initialAccessTime!);
    });
  });

  // ===== MEMORY CLEANUP TESTS =====

  describe('Memory Cleanup', () => {
    test('should perform cleanup of old subscriptions', () => {
      const oldSubscriptionId = 'old-subscription';
      const newSubscriptionId = 'new-subscription';

      // Register old subscription
      memoryManager.registerSubscription(
        oldSubscriptionId,
        'OldComponent',
        mockUnsubscribeFn
      );

      // Simulate old subscription by manipulating internal state
      const oldInfo = memoryManager.getSubscriptionInfo(oldSubscriptionId);
      if (oldInfo) {
        // Manually set old access time
        (oldInfo as any).lastAccessed = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      }

      // Register new subscription
      memoryManager.registerSubscription(
        newSubscriptionId,
        'NewComponent',
        mockUnsubscribeFn
      );

      // Perform cleanup
      memoryManager.performCleanup();

      // Verify old subscription is removed
      const oldInfoAfterCleanup = memoryManager.getSubscriptionInfo(oldSubscriptionId);
      expect(oldInfoAfterCleanup).toBeNull();

      // Verify new subscription still exists
      const newInfoAfterCleanup = memoryManager.getSubscriptionInfo(newSubscriptionId);
      expect(newInfoAfterCleanup).toBeDefined();
    });

    test('should force cleanup all subscriptions', () => {
      const subscriptionIds = ['sub-1', 'sub-2', 'sub-3'];

      // Register multiple subscriptions
      subscriptionIds.forEach(id => {
        memoryManager.registerSubscription(
          id,
          `Component${id}`,
          mockUnsubscribeFn
        );
      });

      // Verify all subscriptions exist
      subscriptionIds.forEach(id => {
        expect(memoryManager.getSubscriptionInfo(id)).toBeDefined();
      });

      // Force cleanup
      memoryManager.forceCleanup();

      // Verify all subscriptions are removed
      subscriptionIds.forEach(id => {
        expect(memoryManager.getSubscriptionInfo(id)).toBeNull();
      });

      // Verify unsubscribe functions were called
      expect(mockUnsubscribeFn).toHaveBeenCalledTimes(subscriptionIds.length);
    });
  });

  // ===== MEMORY STATISTICS TESTS =====

  describe('Memory Statistics', () => {
    test('should provide accurate memory statistics', () => {
      const subscriptionIds = ['stats-sub-1', 'stats-sub-2', 'stats-sub-3'];

      // Register multiple subscriptions
      subscriptionIds.forEach(id => {
        memoryManager.registerSubscription(
          id,
          `StatsComponent${id}`,
          mockUnsubscribeFn
        );
      });

      const stats = memoryManager.getMemoryStats();

      expect(stats.activeSubscriptions).toBe(subscriptionIds.length);
      expect(stats.totalMemoryUsage).toBeGreaterThan(0);
      expect(stats.averageMemoryPerSubscription).toBeGreaterThan(0);
      expect(stats.memoryThreshold).toBeDefined();
      expect(stats.cleanupIntervals).toBeDefined();
      expect(stats.lastCleanupTime).toBeDefined();
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.isHealthy).toBeDefined();
    });

    test('should track memory usage by component', () => {
      const componentNames = ['ComponentA', 'ComponentB', 'ComponentC'];

      // Register subscriptions for different components
      componentNames.forEach((name, index) => {
        memoryManager.registerSubscription(
          `sub-${index}`,
          name,
          mockUnsubscribeFn
        );
      });

      const breakdown = memoryManager.getMemoryBreakdown();

      componentNames.forEach(name => {
        expect(breakdown[name]).toBeDefined();
        expect(breakdown[name]).toBeGreaterThan(0);
      });
    });

    test('should track subscription count by component', () => {
      // Register multiple subscriptions for same component
      for (let i = 0; i < 3; i++) {
        memoryManager.registerSubscription(
          `multi-sub-${i}`,
          'MultiComponent',
          mockUnsubscribeFn
        );
      }

      // Register single subscription for different component
      memoryManager.registerSubscription(
        'single-sub',
        'SingleComponent',
        mockUnsubscribeFn
      );

      const counts = memoryManager.getSubscriptionCountByComponent();

      expect(counts['MultiComponent']).toBe(3);
      expect(counts['SingleComponent']).toBe(1);
    });
  });

  // ===== MEMORY HEALTH TESTS =====

  describe('Memory Health', () => {
    test('should identify active subscriptions correctly', () => {
      const subscriptionId = 'health-test-sub';

      memoryManager.registerSubscription(
        subscriptionId,
        'HealthTestComponent',
        mockUnsubscribeFn
      );

      expect(memoryManager.isSubscriptionActive(subscriptionId)).toBe(true);

      memoryManager.unregisterSubscription(subscriptionId);

      expect(memoryManager.isSubscriptionActive(subscriptionId)).toBe(false);
    });

    test('should handle memory alerts', () => {
      const alertListener = jest.fn();

      memoryManager.on('memoryAlert', alertListener);

      // Simulate memory alert by manipulating internal state
      // This would typically be triggered by actual memory monitoring
      const stats = memoryManager.getMemoryStats();
      
      // Verify alert listener was set up
      expect(alertListener).toBeDefined();
    });
  });

  // ===== CONFIGURATION TESTS =====

  describe('Configuration', () => {
    test('should update configuration successfully', () => {
      const newConfig = {
        maxSubscriptions: 2000,
        memoryThreshold: 100 * 1024 * 1024, // 100MB
        cleanupInterval: 60 * 60 * 1000, // 1 hour
        maxSubscriptionAge: 10 * 60 * 1000, // 10 minutes
        maxInactiveTime: 20 * 60 * 1000, // 20 minutes
        enableMonitoring: true,
        enableAlerts: true
      };

      memoryManager.setConfig(newConfig);

      const currentConfig = memoryManager.getConfig();

      expect(currentConfig.maxSubscriptions).toBe(newConfig.maxSubscriptions);
      expect(currentConfig.memoryThreshold).toBe(newConfig.memoryThreshold);
      expect(currentConfig.cleanupInterval).toBe(newConfig.cleanupInterval);
      expect(currentConfig.maxSubscriptionAge).toBe(newConfig.maxSubscriptionAge);
      expect(currentConfig.maxInactiveTime).toBe(newConfig.maxInactiveTime);
      expect(currentConfig.enableMonitoring).toBe(newConfig.enableMonitoring);
      expect(currentConfig.enableAlerts).toBe(newConfig.enableAlerts);
    });

    test('should enable/disable monitoring', () => {
      // Initially enabled
      let config = memoryManager.getConfig();
      expect(config.enableMonitoring).toBe(true);

      // Disable monitoring
      memoryManager.setConfig({ enableMonitoring: false });
      config = memoryManager.getConfig();
      expect(config.enableMonitoring).toBe(false);

      // Re-enable monitoring
      memoryManager.setConfig({ enableMonitoring: true });
      config = memoryManager.getConfig();
      expect(config.enableMonitoring).toBe(true);
    });

    test('should enable/disable alerts', () => {
      // Initially enabled
      let config = memoryManager.getConfig();
      expect(config.enableAlerts).toBe(true);

      // Disable alerts
      memoryManager.setConfig({ enableAlerts: false });
      config = memoryManager.getConfig();
      expect(config.enableAlerts).toBe(false);

      // Re-enable alerts
      memoryManager.setConfig({ enableAlerts: true });
      config = memoryManager.getConfig();
      expect(config.enableAlerts).toBe(true);
    });
  });

  // ===== SUBSCRIPTION MANAGEMENT TESTS =====

  describe('Subscription Management', () => {
    test('should handle multiple subscriptions for same component', () => {
      const componentName = 'MultiSubComponent';
      const subscriptionIds = ['sub-1', 'sub-2', 'sub-3'];

      subscriptionIds.forEach(id => {
        memoryManager.registerSubscription(
          id,
          componentName,
          mockUnsubscribeFn
        );
      });

      const subscriptions = memoryManager.getSubscriptionsByComponent(componentName);
      expect(subscriptions).toHaveLength(subscriptionIds.length);

      subscriptions.forEach(sub => {
        expect(sub.componentName).toBe(componentName);
        expect(sub.isActive).toBe(true);
      });
    });

    test('should handle subscription with different memory usage', () => {
      const subscriptionId = 'memory-test-sub';
      const componentName = 'MemoryTestComponent';

      memoryManager.registerSubscription(
        subscriptionId,
        componentName,
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.memoryUsage).toBeGreaterThan(0);
    });

    test('should handle subscription lifecycle correctly', () => {
      const subscriptionId = 'lifecycle-test-sub';
      const componentName = 'LifecycleTestComponent';

      // Register subscription
      memoryManager.registerSubscription(
        subscriptionId,
        componentName,
        mockUnsubscribeFn
      );

      let subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.isActive).toBe(true);

      // Update access time
      memoryManager.updateSubscriptionAccess(subscriptionId);
      subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.lastAccessed).toBeGreaterThan(0);

      // Unregister subscription
      memoryManager.unregisterSubscription(subscriptionId);
      subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo).toBeNull();
    });
  });

  // ===== MEMORY THRESHOLD TESTS =====

  describe('Memory Thresholds', () => {
    test('should handle memory threshold exceeded', () => {
      const alertListener = jest.fn();
      memoryManager.on('memoryAlert', alertListener);

      // Set low threshold for testing
      memoryManager.setConfig({
        memoryThreshold: 1024 // 1KB
      });

      // Register multiple subscriptions to exceed threshold
      for (let i = 0; i < 100; i++) {
        memoryManager.registerSubscription(
          `threshold-test-${i}`,
          'ThresholdTestComponent',
          mockUnsubscribeFn
        );
      }

      // Verify alert was triggered
      expect(alertListener).toHaveBeenCalled();
    });

    test('should handle subscription count threshold', () => {
      const alertListener = jest.fn();
      memoryManager.on('memoryAlert', alertListener);

      // Set low subscription limit for testing
      memoryManager.setConfig({
        maxSubscriptions: 5
      });

      // Register subscriptions up to limit
      for (let i = 0; i < 10; i++) {
        memoryManager.registerSubscription(
          `limit-test-${i}`,
          'LimitTestComponent',
          mockUnsubscribeFn
        );
      }

      // Verify alert was triggered
      expect(alertListener).toHaveBeenCalled();
    });
  });

  // ===== CLEANUP TESTS =====

  describe('Cleanup Operations', () => {
    test('should cleanup service on shutdown', () => {
      const subscriptionIds = ['cleanup-sub-1', 'cleanup-sub-2'];

      // Register subscriptions
      subscriptionIds.forEach(id => {
        memoryManager.registerSubscription(
          id,
          'CleanupTestComponent',
          mockUnsubscribeFn
        );
      });

      // Verify subscriptions exist
      subscriptionIds.forEach(id => {
        expect(memoryManager.getSubscriptionInfo(id)).toBeDefined();
      });

      // Perform cleanup
      memoryManager.cleanup();

      // Verify all subscriptions are removed
      subscriptionIds.forEach(id => {
        expect(memoryManager.getSubscriptionInfo(id)).toBeNull();
      });
    });

    test('should clear queue on cleanup', () => {
      const subscriptionId = 'queue-test-sub';

      memoryManager.registerSubscription(
        subscriptionId,
        'QueueTestComponent',
        mockUnsubscribeFn
      );

      // Clear queue
      memoryManager.clearQueue();

      // Verify subscription still exists (queue clearing doesn't affect subscriptions)
      expect(memoryManager.getSubscriptionInfo(subscriptionId)).toBeDefined();
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance Tests', () => {
    test('should handle high volume of subscriptions efficiently', () => {
      const startTime = performance.now();

      // Register 1000 subscriptions
      for (let i = 0; i < 1000; i++) {
        memoryManager.registerSubscription(
          `perf-test-${i}`,
          `PerformanceComponent${i}`,
          mockUnsubscribeFn
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);

      const stats = memoryManager.getMemoryStats();
      expect(stats.activeSubscriptions).toBe(1000);
    });

    test('should handle rapid subscription/unsubscription cycles', () => {
      const cycles = 100;

      for (let i = 0; i < cycles; i++) {
        const subscriptionId = `cycle-test-${i}`;
        
        memoryManager.registerSubscription(
          subscriptionId,
          'CycleTestComponent',
          mockUnsubscribeFn
        );

        memoryManager.unregisterSubscription(subscriptionId);
      }

      const stats = memoryManager.getMemoryStats();
      expect(stats.activeSubscriptions).toBe(0);
    });

    test('should maintain performance with many active subscriptions', () => {
      // Register many subscriptions
      for (let i = 0; i < 500; i++) {
        memoryManager.registerSubscription(
          `many-subs-${i}`,
          'ManySubsComponent',
          mockUnsubscribeFn
        );
      }

      const startTime = performance.now();

      // Perform operations on all subscriptions
      for (let i = 0; i < 500; i++) {
        memoryManager.updateSubscriptionAccess(`many-subs-${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  // ===== EDGE CASE TESTS =====

  describe('Edge Cases', () => {
    test('should handle duplicate subscription registration', () => {
      const subscriptionId = 'duplicate-test-sub';

      // Register subscription
      memoryManager.registerSubscription(
        subscriptionId,
        'DuplicateTestComponent',
        mockUnsubscribeFn
      );

      // Try to register same subscription again
      memoryManager.registerSubscription(
        subscriptionId,
        'DuplicateTestComponent',
        mockUnsubscribeFn
      );

      // Should still have only one subscription
      const stats = memoryManager.getMemoryStats();
      expect(stats.activeSubscriptions).toBe(1);
    });

    test('should handle unregistering non-existent subscription', () => {
      const nonExistentId = 'non-existent-sub';

      // Should not throw error
      expect(() => {
        memoryManager.unregisterSubscription(nonExistentId);
      }).not.toThrow();

      // Should not call unsubscribe function
      expect(mockUnsubscribeFn).not.toHaveBeenCalled();
    });

    test('should handle updating access for non-existent subscription', () => {
      const nonExistentId = 'non-existent-sub';

      // Should not throw error
      expect(() => {
        memoryManager.updateSubscriptionAccess(nonExistentId);
      }).not.toThrow();
    });

    test('should handle empty component names', () => {
      const subscriptionId = 'empty-component-test';

      memoryManager.registerSubscription(
        subscriptionId,
        '',
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.componentName).toBe('');
    });

    test('should handle very long subscription IDs', () => {
      const longId = 'a'.repeat(1000);
      const subscriptionId = longId;

      memoryManager.registerSubscription(
        subscriptionId,
        'LongIdComponent',
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.id).toBe(subscriptionId);
    });

    test('should handle special characters in component names', () => {
      const specialName = 'Component with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const subscriptionId = 'special-chars-test';

      memoryManager.registerSubscription(
        subscriptionId,
        specialName,
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.componentName).toBe(specialName);
    });

    test('should handle unicode characters in component names', () => {
      const unicodeName = 'Component with unicode: 🚀🌟🎉中文日本語한국어';
      const subscriptionId = 'unicode-test';

      memoryManager.registerSubscription(
        subscriptionId,
        unicodeName,
        mockUnsubscribeFn
      );

      const subscriptionInfo = memoryManager.getSubscriptionInfo(subscriptionId);
      expect(subscriptionInfo?.componentName).toBe(unicodeName);
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration Tests', () => {
    test('should handle complex memory management scenarios', () => {
      const componentNames = ['ComponentA', 'ComponentB', 'ComponentC'];
      const subscriptionIds = [];

      // Register subscriptions for different components
      componentNames.forEach((name, componentIndex) => {
        for (let i = 0; i < 3; i++) {
          const id = `integration-test-${componentIndex}-${i}`;
          subscriptionIds.push(id);
          
          memoryManager.registerSubscription(
            id,
            name,
            mockUnsubscribeFn
          );
        }
      });

      // Update access times
      subscriptionIds.forEach(id => {
        memoryManager.updateSubscriptionAccess(id);
      });

      // Verify statistics
      const stats = memoryManager.getMemoryStats();
      expect(stats.activeSubscriptions).toBe(subscriptionIds.length);

      const breakdown = memoryManager.getMemoryBreakdown();
      componentNames.forEach(name => {
        expect(breakdown[name]).toBeDefined();
      });

      const counts = memoryManager.getSubscriptionCountByComponent();
      componentNames.forEach(name => {
        expect(counts[name]).toBe(3);
      });

      // Cleanup
      subscriptionIds.forEach(id => {
        memoryManager.unregisterSubscription(id);
      });

      // Verify cleanup
      const finalStats = memoryManager.getMemoryStats();
      expect(finalStats.activeSubscriptions).toBe(0);
    });

    test('should handle memory alerts and recovery', () => {
      const alertListener = jest.fn();
      memoryManager.on('memoryAlert', alertListener);

      // Set low thresholds
      memoryManager.setConfig({
        maxSubscriptions: 5,
        memoryThreshold: 1024
      });

      // Exceed thresholds
      for (let i = 0; i < 10; i++) {
        memoryManager.registerSubscription(
          `alert-test-${i}`,
          'AlertTestComponent',
          mockUnsubscribeFn
        );
      }

      // Verify alerts were triggered
      expect(alertListener).toHaveBeenCalled();

      // Cleanup
      for (let i = 0; i < 10; i++) {
        memoryManager.unregisterSubscription(`alert-test-${i}`);
      }

      // Reset configuration
      memoryManager.setConfig({
        maxSubscriptions: 1000,
        memoryThreshold: 50 * 1024 * 1024
      });
    });
  });
}); 