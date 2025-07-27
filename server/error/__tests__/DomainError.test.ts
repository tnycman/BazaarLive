/**
 * Domain Error Test Suite - Phase 4 Task 4.1
 * Comprehensive tests for domain error hierarchy and error instantiation
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory,
  DomainErrorFactory,
  ErrorContext,
  ErrorClassification,
  ErrorRecoverySuggestion 
} from '../DomainError';

// Test Implementation of DomainError (abstract class)
class TestDomainError extends DomainError {
  constructor(
    message: string,
    errorCode: string,
    context?: Partial<ErrorContext>,
    classification?: Partial<ErrorClassification>,
    recoverySuggestions?: ErrorRecoverySuggestion[]
  ) {
    super(message, errorCode, context, classification, recoverySuggestions);
  }
}

describe('DomainError', () => {
  beforeEach(() => {
    // Clear error metrics before each test
    DomainError.clearErrorMetrics();
  });

  describe('Error Instantiation', () => {
    it('should create domain error with default values', () => {
      const error = new TestDomainError('Test error', 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.name).toBe('TestDomainError');
      expect(error.correlationId).toMatch(/^err-\d+-[a-z0-9]{9}$/);
      expect(error.errorId).toMatch(/^testdomainerror-test_error-\d+$/);
      expect(error.context.timestamp).toBeInstanceOf(Date);
      expect(error.context.component).toBe('TestDomainError');
      expect(error.classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.classification.category).toBe(ErrorCategory.DOMAIN);
      expect(error.classification.retryable).toBe(false);
      expect(error.classification.userFacing).toBe(false);
    });

    it('should create domain error with custom context', () => {
      const context: Partial<ErrorContext> = {
        requestId: 'req-123',
        userId: 'user-456',
        operationName: 'testOperation',
        metadata: { customData: 'test' }
      };

      const error = new TestDomainError('Test error', 'TEST_ERROR', context);

      expect(error.context.requestId).toBe('req-123');
      expect(error.context.userId).toBe('user-456');
      expect(error.context.operationName).toBe('testOperation');
      expect(error.context.metadata?.customData).toBe('test');
    });

    it('should create domain error with custom classification', () => {
      const classification: Partial<ErrorClassification> = {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        retryable: true,
        userFacing: true,
        requiresEscalation: true,
        automatedRecovery: true
      };

      const error = new TestDomainError('Test error', 'TEST_ERROR', {}, classification);

      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.category).toBe(ErrorCategory.SECURITY);
      expect(error.classification.retryable).toBe(true);
      expect(error.classification.userFacing).toBe(true);
      expect(error.classification.requiresEscalation).toBe(true);
      expect(error.classification.automatedRecovery).toBe(true);
    });

    it('should create domain error with recovery suggestions', () => {
      const suggestions: ErrorRecoverySuggestion[] = [
        {
          action: 'retry',
          description: 'Retry the operation',
          automated: true,
          priority: 100
        },
        {
          action: 'fallback',
          description: 'Use fallback mechanism',
          automated: false,
          priority: 80
        }
      ];

      const error = new TestDomainError('Test error', 'TEST_ERROR', {}, {}, suggestions);

      expect(error.recoverySuggestions).toHaveLength(2);
      expect(error.recoverySuggestions[0].action).toBe('retry');
      expect(error.recoverySuggestions[1].action).toBe('fallback');
    });
  });

  describe('Error Properties', () => {
    it('should have correct property getters', () => {
      const error = new TestDomainError(
        'Test error', 
        'TEST_ERROR',
        {},
        {
          severity: ErrorSeverity.HIGH,
          retryable: true,
          userFacing: true,
          requiresEscalation: true,
          automatedRecovery: true
        }
      );

      expect(error.getSeverity()).toBe(ErrorSeverity.HIGH);
      expect(error.getCategory()).toBe(ErrorCategory.DOMAIN);
      expect(error.isRetryable()).toBe(true);
      expect(error.isUserFacing()).toBe(true);
      expect(error.requiresEscalation()).toBe(true);
      expect(error.canAutoRecover()).toBe(true);
    });

    it('should manage recovery suggestions correctly', () => {
      const error = new TestDomainError('Test error', 'TEST_ERROR');

      // Add recovery suggestion
      const suggestion: ErrorRecoverySuggestion = {
        action: 'new_action',
        description: 'New recovery action',
        automated: true,
        priority: 90
      };
      error.addRecoverySuggestion(suggestion);

      const suggestions = error.getRecoverySuggestions();
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].action).toBe('new_action');
      expect(suggestions[0].priority).toBe(90);
    });

    it('should sort recovery suggestions by priority', () => {
      const suggestions: ErrorRecoverySuggestion[] = [
        { action: 'low', description: 'Low priority', automated: true, priority: 50 },
        { action: 'high', description: 'High priority', automated: true, priority: 100 },
        { action: 'medium', description: 'Medium priority', automated: true, priority: 75 }
      ];

      const error = new TestDomainError('Test error', 'TEST_ERROR', {}, {}, suggestions);
      const sortedSuggestions = error.getRecoverySuggestions();

      expect(sortedSuggestions[0].action).toBe('high');
      expect(sortedSuggestions[1].action).toBe('medium');
      expect(sortedSuggestions[2].action).toBe('low');
    });
  });

  describe('Error Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const error = new TestDomainError(
        'Test error',
        'TEST_ERROR',
        { requestId: 'req-123', userId: 'user-456' },
        { severity: ErrorSeverity.HIGH, userFacing: true }
      );

      const json = error.toJSON();

      expect(json.name).toBe('TestDomainError');
      expect(json.message).toBe('Test error');
      expect(json.errorCode).toBe('TEST_ERROR');
      expect(json.errorId).toBeDefined();
      expect(json.correlationId).toBeDefined();
      expect(json.context.requestId).toBe('req-123');
      expect(json.context.userId).toBe('user-456');
      expect(json.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(json.classification.userFacing).toBe(true);
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('Error Metrics', () => {
    it('should track error occurrences', () => {
      const error1 = new TestDomainError('Test error 1', 'TEST_ERROR_001');
      const error2 = new TestDomainError('Test error 2', 'TEST_ERROR_001');
      const error3 = new TestDomainError('Test error 3', 'TEST_ERROR_002');

      const metrics1 = error1.getMetrics();
      const metrics2 = error2.getMetrics();
      const metrics3 = error3.getMetrics();

      expect(metrics1?.occurrenceCount).toBe(2); // Same error code
      expect(metrics2?.occurrenceCount).toBe(2);
      expect(metrics3?.occurrenceCount).toBe(1); // Different error code
    });

    it('should update error metrics for recovery', () => {
      const error = new TestDomainError('Test error', 'TEST_ERROR');
      
      DomainError.updateErrorMetrics('TEST_ERROR', true);
      DomainError.updateErrorMetrics('TEST_ERROR', false);

      const metrics = error.getMetrics();
      expect(metrics?.successfulRecoveries).toBe(1);
      expect(metrics?.failedRecoveries).toBe(1);
    });

    it('should provide error statistics', () => {
      new TestDomainError('Error 1', 'ERROR_001');
      new TestDomainError('Error 2', 'ERROR_001');
      new TestDomainError('Error 3', 'ERROR_002');

      const stats = DomainError.getErrorStatistics();
      expect(stats.totalErrors).toBe(3);
      expect(stats.uniqueErrorCodes).toBe(2);
      expect(stats.averageOccurrences).toBe(1.5);
    });

    it('should clear error metrics', () => {
      new TestDomainError('Test error', 'TEST_ERROR');
      
      expect(DomainError.getAllErrorMetrics().size).toBe(1);
      
      DomainError.clearErrorMetrics();
      
      expect(DomainError.getAllErrorMetrics().size).toBe(0);
    });
  });

  describe('Error Relationships', () => {
    it('should create child errors correctly', () => {
      const parentError = new TestDomainError('Parent error', 'PARENT_ERROR');
      
      const childError = parentError.createChildError(
        TestDomainError,
        'Child error',
        'CHILD_ERROR',
        { userId: 'user-123' }
      );

      expect(childError.context.previousErrors).toHaveLength(1);
      expect(childError.context.previousErrors?.[0]).toBe(parentError);
      expect(childError.context.userId).toBe('user-123');
    });

    it('should detect ancestor errors correctly', () => {
      const grandparentError = new TestDomainError('Grandparent error', 'GRANDPARENT_ERROR');
      const parentError = grandparentError.createChildError(
        TestDomainError,
        'Parent error',
        'PARENT_ERROR'
      );
      const childError = parentError.createChildError(
        TestDomainError,
        'Child error',
        'CHILD_ERROR'
      );

      expect(childError.hasAncestorError(TestDomainError)).toBe(true);
      expect(parentError.hasAncestorError(TestDomainError)).toBe(true);
      expect(grandparentError.hasAncestorError(TestDomainError)).toBe(false);
    });

    it('should calculate error chain depth correctly', () => {
      const error1 = new TestDomainError('Error 1', 'ERROR_001');
      const error2 = error1.createChildError(TestDomainError, 'Error 2', 'ERROR_002');
      const error3 = error2.createChildError(TestDomainError, 'Error 3', 'ERROR_003');

      expect(error1.getErrorChainDepth()).toBe(1);
      expect(error2.getErrorChainDepth()).toBe(2);
      expect(error3.getErrorChainDepth()).toBe(3);
    });

    it('should find root cause correctly', () => {
      const rootError = new TestDomainError('Root error', 'ROOT_ERROR');
      const middleError = rootError.createChildError(TestDomainError, 'Middle error', 'MIDDLE_ERROR');
      const leafError = middleError.createChildError(TestDomainError, 'Leaf error', 'LEAF_ERROR');

      expect(leafError.getRootCause()).toBe(rootError);
      expect(middleError.getRootCause()).toBe(rootError);
      expect(rootError.getRootCause()).toBe(rootError);
    });
  });

  describe('DomainErrorFactory', () => {
    it('should create validation error correctly', () => {
      const error = DomainErrorFactory.createValidationError(
        'Invalid email format',
        'email',
        'invalid-email',
        { requestId: 'req-123' }
      );

      expect(error.message).toBe('Invalid email format');
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.classification.category).toBe(ErrorCategory.VALIDATION);
      expect(error.classification.userFacing).toBe(true);
      expect(error.context.metadata?.field).toBe('email');
      expect(error.context.metadata?.value).toBe('invalid-email');
      expect(error.context.requestId).toBe('req-123');
    });

    it('should create configuration error correctly', () => {
      const error = DomainErrorFactory.createConfigurationError(
        'Missing database URL',
        'DATABASE_URL',
        { environmentName: 'production' }
      );

      expect(error.message).toBe('Missing database URL');
      expect(error.errorCode).toBe('CONFIGURATION_ERROR');
      expect(error.classification.category).toBe(ErrorCategory.CONFIGURATION);
      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.requiresEscalation).toBe(true);
      expect(error.context.metadata?.configKey).toBe('DATABASE_URL');
      expect(error.context.environmentName).toBe('production');
    });

    it('should create performance error correctly', () => {
      const error = DomainErrorFactory.createPerformanceError(
        'Operation timeout',
        'database_query',
        5000,
        { userId: 'user-123' }
      );

      expect(error.message).toBe('Operation timeout');
      expect(error.errorCode).toBe('PERFORMANCE_ERROR');
      expect(error.classification.category).toBe(ErrorCategory.PERFORMANCE);
      expect(error.classification.retryable).toBe(true);
      expect(error.classification.automatedRecovery).toBe(true);
      expect(error.context.metadata?.operation).toBe('database_query');
      expect(error.context.metadata?.duration).toBe(5000);
      expect(error.context.userId).toBe('user-123');
    });
  });

  describe('Error Validation', () => {
    it('should handle validation errors gracefully', () => {
      // Create error with invalid context (should not throw)
      const error = new TestDomainError(
        'Test error',
        'TEST_ERROR',
        {
          // @ts-ignore - Intentionally passing invalid timestamp for testing
          timestamp: 'invalid-date'
        }
      );

      expect(error.message).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      // Error should still be created despite validation failure
    });
  });

  describe('Error Contract Properties', () => {
    it('should maintain error contract properties', () => {
      const error = new TestDomainError('Test error', 'TEST_ERROR');

      // Test Error interface compliance
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBeDefined();
      expect(error.name).toBeDefined();
      expect(error.stack).toBeDefined();

      // Test DomainError-specific properties
      expect(error.errorCode).toBeDefined();
      expect(error.correlationId).toBeDefined();
      expect(error.errorId).toBeDefined();
      expect(error.context).toBeDefined();
      expect(error.classification).toBeDefined();
      expect(error.recoverySuggestions).toBeDefined();

      // Test property types
      expect(typeof error.errorCode).toBe('string');
      expect(typeof error.correlationId).toBe('string');
      expect(typeof error.errorId).toBe('string');
      expect(typeof error.context).toBe('object');
      expect(typeof error.classification).toBe('object');
      expect(Array.isArray(error.recoverySuggestions)).toBe(true);
    });
  });
});