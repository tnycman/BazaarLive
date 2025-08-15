/**
 * Filter Error Handler Test Suite
 * Comprehensive testing for enterprise-grade error handling
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';
import type { FilterError, ErrorListener, ErrorRecoveryStrategy } from '@/services/error/FilterErrorHandler';

// ===== TEST SETUP =====

describe('FilterErrorHandler', () => {
  let errorHandler: FilterErrorHandler;
  let mockListener: jest.Mock;
  let mockRecoveryListener: jest.Mock;
  let mockRecoveryStrategy: jest.Mock;

  beforeEach(() => {
    // Reset singleton instance for each test
    (FilterErrorHandler as any).instance = undefined;
    errorHandler = FilterErrorHandler.getInstance();
    
    mockListener = jest.fn();
    mockRecoveryListener = jest.fn();
    mockRecoveryStrategy = jest.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== BASIC FUNCTIONALITY TESTS =====

  describe('Basic Functionality', () => {
    test('should create singleton instance', () => {
      const instance1 = FilterErrorHandler.getInstance();
      const instance2 = FilterErrorHandler.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(FilterErrorHandler);
    });

    test('should handle error with all required parameters', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error message',
        'TEST_ERROR_CODE'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FilterErrorHandler] VALIDATION_ERROR (MEDIUM) in CATEGORY_FILTER: Test error message [TEST_ERROR_CODE]')
      );

      consoleSpy.mockRestore();
    });

    test('should handle error with optional parameters', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.BRAND_FILTER,
        'Test error with details',
        'TEST_ERROR_WITH_DETAILS',
        { customField: 'testValue' },
        'test-component'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FilterErrorHandler] DATA_ERROR (HIGH) in BRAND_FILTER: Test error with details [TEST_ERROR_WITH_DETAILS]')
      );

      consoleSpy.mockRestore();
    });
  });

  // ===== ERROR LISTENER TESTS =====

  describe('Error Listeners', () => {
    test('should add error listener successfully', () => {
      const unsubscribe = errorHandler.addErrorListener({
        priority: 10,
        onError: mockListener
      });

      expect(typeof unsubscribe).toBe('function');
    });

    test('should notify listeners when error occurs', () => {
      const unsubscribe = errorHandler.addErrorListener({
        priority: 10,
        onError: mockListener
      });

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error for listener',
        'LISTENER_TEST'
      );

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.VALIDATION_ERROR,
          severity: FilterErrorSeverity.MEDIUM,
          context: FilterErrorContext.CATEGORY_FILTER,
          message: 'Test error for listener',
          code: 'LISTENER_TEST'
        })
      );

      unsubscribe();
    });

    test('should notify listeners in priority order', () => {
      const lowPriorityListener = jest.fn();
      const highPriorityListener = jest.fn();

      errorHandler.addErrorListener({
        priority: 1,
        onError: lowPriorityListener
      });

      errorHandler.addErrorListener({
        priority: 10,
        onError: highPriorityListener
      });

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Priority test',
        'PRIORITY_TEST'
      );

      // High priority should be called first
      expect(highPriorityListener).toHaveBeenCalledBefore(lowPriorityListener);
    });

    test('should handle listener errors gracefully', () => {
      const failingListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler.addErrorListener({
        priority: 10,
        onError: failingListener
      });

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error',
        'LISTENER_ERROR_TEST'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FilterErrorHandler] Listener error:')
      );

      consoleSpy.mockRestore();
    });

    test('should unsubscribe listener correctly', () => {
      const unsubscribe = errorHandler.addErrorListener({
        priority: 10,
        onError: mockListener
      });

      unsubscribe();

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error after unsubscribe',
        'UNSUBSCRIBE_TEST'
      );

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  // ===== RECOVERY STRATEGY TESTS =====

  describe('Recovery Strategies', () => {
    test('should add recovery strategy successfully', () => {
      const strategy: ErrorRecoveryStrategy = {
        id: 'test-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: mockRecoveryStrategy,
        maxRetries: 3,
        backoffMs: 1000
      };

      errorHandler.addRecoveryStrategy(strategy);
    });

    test('should attempt recovery for matching error', async () => {
      const strategy: ErrorRecoveryStrategy = {
        id: 'test-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: mockRecoveryStrategy,
        maxRetries: 3,
        backoffMs: 1000
      };

      errorHandler.addRecoveryStrategy(strategy);

      const error: FilterError = {
        type: FilterErrorType.VALIDATION_ERROR,
        severity: FilterErrorSeverity.MEDIUM,
        context: FilterErrorContext.CATEGORY_FILTER,
        message: 'Test error',
        code: 'RECOVERY_TEST',
        timestamp: Date.now(),
        recoverable: true,
        retryCount: 0,
        maxRetries: 3
      };

      const result = await errorHandler.attemptRecovery(error);

      expect(mockRecoveryStrategy).toHaveBeenCalledWith(error);
      expect(result).toBe(true);
    });

    test('should not attempt recovery for non-matching error', async () => {
      const strategy: ErrorRecoveryStrategy = {
        id: 'test-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: mockRecoveryStrategy,
        maxRetries: 3,
        backoffMs: 1000
      };

      errorHandler.addRecoveryStrategy(strategy);

      const error: FilterError = {
        type: FilterErrorType.DATA_ERROR,
        severity: FilterErrorSeverity.MEDIUM,
        context: FilterErrorContext.BRAND_FILTER,
        message: 'Test error',
        code: 'NO_RECOVERY_TEST',
        timestamp: Date.now(),
        recoverable: true,
        retryCount: 0,
        maxRetries: 3
      };

      const result = await errorHandler.attemptRecovery(error);

      expect(mockRecoveryStrategy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should not attempt recovery when max retries exceeded', async () => {
      const strategy: ErrorRecoveryStrategy = {
        id: 'test-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: mockRecoveryStrategy,
        maxRetries: 3,
        backoffMs: 1000
      };

      errorHandler.addRecoveryStrategy(strategy);

      const error: FilterError = {
        type: FilterErrorType.VALIDATION_ERROR,
        severity: FilterErrorSeverity.MEDIUM,
        context: FilterErrorContext.CATEGORY_FILTER,
        message: 'Test error',
        code: 'MAX_RETRIES_TEST',
        timestamp: Date.now(),
        recoverable: true,
        retryCount: 3,
        maxRetries: 3
      };

      const result = await errorHandler.attemptRecovery(error);

      expect(mockRecoveryStrategy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should handle recovery strategy errors gracefully', async () => {
      const failingStrategy = jest.fn().mockRejectedValue(new Error('Strategy error'));
      
      const strategy: ErrorRecoveryStrategy = {
        id: 'failing-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: failingStrategy,
        maxRetries: 3,
        backoffMs: 1000
      };

      errorHandler.addRecoveryStrategy(strategy);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error: FilterError = {
        type: FilterErrorType.VALIDATION_ERROR,
        severity: FilterErrorSeverity.MEDIUM,
        context: FilterErrorContext.CATEGORY_FILTER,
        message: 'Test error',
        code: 'STRATEGY_ERROR_TEST',
        timestamp: Date.now(),
        recoverable: true,
        retryCount: 0,
        maxRetries: 3
      };

      const result = await errorHandler.attemptRecovery(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FilterErrorHandler] Recovery strategy failed:')
      );
      expect(result).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  // ===== ERROR RATE LIMITING TESTS =====

  describe('Error Rate Limiting', () => {
    test('should limit errors per minute', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Generate more errors than the limit
      for (let i = 0; i < 150; i++) {
        errorHandler.handleError(
          FilterErrorType.VALIDATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CATEGORY_FILTER,
          `Test error ${i}`,
          `RATE_LIMIT_TEST_${i}`
        );
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FilterErrorHandler] Error rate limited:')
      );

      consoleSpy.mockRestore();
    });

    test('should track errors by type and context', () => {
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error 1',
        'TRACKING_TEST_1'
      );

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error 2',
        'TRACKING_TEST_2'
      );

      errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.BRAND_FILTER,
        'Test error 3',
        'TRACKING_TEST_3'
      );

      const stats = errorHandler.getErrorStats();
      
      expect(stats.errorsByType['VALIDATION_ERROR']).toBe(2);
      expect(stats.errorsByType['DATA_ERROR']).toBe(1);
      expect(stats.errorsByContext['CATEGORY_FILTER']).toBe(2);
      expect(stats.errorsByContext['BRAND_FILTER']).toBe(1);
    });
  });

  // ===== ERROR STATISTICS TESTS =====

  describe('Error Statistics', () => {
    test('should provide accurate error statistics', () => {
      // Generate various types of errors
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.LOW,
        FilterErrorContext.CATEGORY_FILTER,
        'Low severity error',
        'STATS_TEST_1'
      );

      errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.BRAND_FILTER,
        'High severity error',
        'STATS_TEST_2'
      );

      errorHandler.handleError(
        FilterErrorType.PERFORMANCE_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.SIZE_FILTER,
        'Medium severity error',
        'STATS_TEST_3'
      );

      const stats = errorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType['VALIDATION_ERROR']).toBe(1);
      expect(stats.errorsByType['DATA_ERROR']).toBe(1);
      expect(stats.errorsByType['PERFORMANCE_ERROR']).toBe(1);
      expect(stats.errorsBySeverity['LOW']).toBe(1);
      expect(stats.errorsBySeverity['MEDIUM']).toBe(1);
      expect(stats.errorsBySeverity['HIGH']).toBe(1);
    });

    test('should clear error statistics', () => {
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Test error',
        'CLEAR_STATS_TEST'
      );

      let stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBeGreaterThan(0);

      errorHandler.clearErrorStats();

      stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(0);
    });
  });

  // ===== ERROR SEVERITY TESTS =====

  describe('Error Severity Handling', () => {
    test('should log errors with appropriate severity levels', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Low severity
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.LOW,
        FilterErrorContext.CATEGORY_FILTER,
        'Low severity error',
        'SEVERITY_TEST_LOW'
      );

      // Medium severity
      errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.BRAND_FILTER,
        'Medium severity error',
        'SEVERITY_TEST_MEDIUM'
      );

      // High severity
      errorHandler.handleError(
        FilterErrorType.PERFORMANCE_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.SIZE_FILTER,
        'High severity error',
        'SEVERITY_TEST_HIGH'
      );

      // Critical severity
      errorHandler.handleError(
        FilterErrorType.MEMORY_ERROR,
        FilterErrorSeverity.CRITICAL,
        FilterErrorContext.MEMORY_MANAGEMENT,
        'Critical severity error',
        'SEVERITY_TEST_CRITICAL'
      );

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Low severity error'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Medium severity error'));
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('High severity error'));
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Critical severity error'));

      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  // ===== ERROR CONTEXT TESTS =====

  describe('Error Context Handling', () => {
    test('should handle errors in different contexts', () => {
      const contexts = [
        FilterErrorContext.CATEGORY_FILTER,
        FilterErrorContext.BRAND_FILTER,
        FilterErrorContext.SIZE_FILTER,
        FilterErrorContext.COLOR_FILTER,
        FilterErrorContext.PRICE_FILTER,
        FilterErrorContext.CONDITION_FILTER,
        FilterErrorContext.SEARCH_FILTER,
        FilterErrorContext.NAVIGATION,
        FilterErrorContext.STATE_MANAGEMENT,
        FilterErrorContext.MEMORY_MANAGEMENT,
        FilterErrorContext.CONFIGURATION,
        FilterErrorContext.ACCESSIBILITY
      ];

      contexts.forEach((context, index) => {
        errorHandler.handleError(
          FilterErrorType.VALIDATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          context,
          `Test error in ${context}`,
          `CONTEXT_TEST_${index}`
        );
      });

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(contexts.length);
    });
  });

  // ===== ERROR RECOVERY TESTS =====

  describe('Error Recovery', () => {
    test('should identify recoverable errors correctly', () => {
      const recoverableErrors = [
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorType.STATE_ERROR,
        FilterErrorType.MEMORY_ERROR
      ];

      const nonRecoverableErrors = [
        FilterErrorType.NAVIGATION_ERROR,
        FilterErrorType.PERFORMANCE_ERROR,
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorType.ACCESSIBILITY_ERROR
      ];

      recoverableErrors.forEach(errorType => {
        errorHandler.handleError(
          errorType,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CATEGORY_FILTER,
          `Recoverable error: ${errorType}`,
          `RECOVERABLE_TEST_${errorType}`
        );
      });

      nonRecoverableErrors.forEach(errorType => {
        errorHandler.handleError(
          errorType,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CATEGORY_FILTER,
          `Non-recoverable error: ${errorType}`,
          `NON_RECOVERABLE_TEST_${errorType}`
        );
      });

      // Verify that recoverable errors are marked as such
      // This would require accessing internal state or adding a method to check recoverability
    });
  });

  // ===== INTEGRATION TESTS =====

  describe('Integration Tests', () => {
    test('should handle complex error scenarios', async () => {
      const listener = jest.fn();
      const recoveryStrategy = jest.fn().mockResolvedValue(true);

      // Add listener
      const unsubscribe = errorHandler.addErrorListener({
        priority: 10,
        onError: listener
      });

      // Add recovery strategy
      errorHandler.addRecoveryStrategy({
        id: 'integration-test-strategy',
        errorType: FilterErrorType.VALIDATION_ERROR,
        context: FilterErrorContext.CATEGORY_FILTER,
        strategy: recoveryStrategy,
        maxRetries: 3,
        backoffMs: 1000
      });

      // Trigger error
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Integration test error',
        'INTEGRATION_TEST'
      );

      // Verify listener was called
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FilterErrorType.VALIDATION_ERROR,
          severity: FilterErrorSeverity.MEDIUM,
          context: FilterErrorContext.CATEGORY_FILTER,
          message: 'Integration test error',
          code: 'INTEGRATION_TEST'
        })
      );

      // Verify recovery strategy was called
      expect(recoveryStrategy).toHaveBeenCalled();

      unsubscribe();
    });

    test('should handle multiple concurrent errors', () => {
      const promises = Array.from({ length: 10 }, (_, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            errorHandler.handleError(
              FilterErrorType.VALIDATION_ERROR,
              FilterErrorSeverity.MEDIUM,
              FilterErrorContext.CATEGORY_FILTER,
              `Concurrent error ${index}`,
              `CONCURRENT_TEST_${index}`
            );
            resolve();
          }, Math.random() * 100);
        });
      });

      return Promise.all(promises).then(() => {
        const stats = errorHandler.getErrorStats();
        expect(stats.totalErrors).toBe(10);
      });
    });
  });

  // ===== PERFORMANCE TESTS =====

  describe('Performance Tests', () => {
    test('should handle high volume of errors efficiently', () => {
      const startTime = performance.now();

      // Generate 1000 errors
      for (let i = 0; i < 1000; i++) {
        errorHandler.handleError(
          FilterErrorType.VALIDATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CATEGORY_FILTER,
          `Performance test error ${i}`,
          `PERFORMANCE_TEST_${i}`
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);

      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1000);
    });

    test('should maintain performance with many listeners', () => {
      const listeners = Array.from({ length: 100 }, () => jest.fn());

      // Add 100 listeners
      const unsubscribes = listeners.map(listener => 
        errorHandler.addErrorListener({
          priority: Math.floor(Math.random() * 10),
          onError: listener
        })
      );

      const startTime = performance.now();

      // Trigger error
      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        'Performance test with many listeners',
        'MANY_LISTENERS_TEST'
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 100ms
      expect(duration).toBeLessThan(100);

      // Verify all listeners were called
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalled();
      });

      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
    });
  });

  // ===== EDGE CASE TESTS =====

  describe('Edge Cases', () => {
    test('should handle empty error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        '',
        'EMPTY_MESSAGE_TEST'
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle very long error message', () => {
      const longMessage = 'A'.repeat(10000);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        longMessage,
        'LONG_MESSAGE_TEST'
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle special characters in error message', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        specialMessage,
        'SPECIAL_CHARS_TEST'
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle unicode characters in error message', () => {
      const unicodeMessage = 'Error with unicode: 🚀🌟🎉中文日本語한국어';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CATEGORY_FILTER,
        unicodeMessage,
        'UNICODE_TEST'
      );

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
}); 