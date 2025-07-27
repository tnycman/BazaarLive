/**
 * Domain Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade domain error with comprehensive context and metadata
 */

import { z } from 'zod';

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error Categories for classification
export enum ErrorCategory {
  DOMAIN = 'domain',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  CONFIGURATION = 'configuration',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  INFRASTRUCTURE = 'infrastructure'
}

// Error Recovery Suggestions
export interface ErrorRecoverySuggestion {
  readonly action: string;
  readonly description: string;
  readonly automated: boolean;
  readonly priority: number;
}

// Error Context for rich debugging information
export interface ErrorContext {
  readonly timestamp: Date;
  readonly requestId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly operationName?: string;
  readonly component?: string;
  readonly metadata?: Record<string, any>;
  readonly stackTrace?: string;
  readonly previousErrors?: DomainError[];
}

// Error Classification for automated handling
export interface ErrorClassification {
  readonly severity: ErrorSeverity;
  readonly category: ErrorCategory;
  readonly retryable: boolean;
  readonly userFacing: boolean;
  readonly requiresEscalation: boolean;
  readonly automatedRecovery: boolean;
}

// Error Metrics for monitoring and analytics
export interface ErrorMetrics {
  readonly errorId: string;
  readonly occurrenceCount: number;
  readonly firstOccurrence: Date;
  readonly lastOccurrence: Date;
  readonly averageResolutionTime?: number;
  readonly successfulRecoveries: number;
  readonly failedRecoveries: number;
}

// Validation schemas for error data
const ErrorContextSchema = z.object({
  timestamp: z.date(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  operationName: z.string().optional(),
  component: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  stackTrace: z.string().optional(),
  previousErrors: z.array(z.any()).optional()
});

const ErrorClassificationSchema = z.object({
  severity: z.nativeEnum(ErrorSeverity),
  category: z.nativeEnum(ErrorCategory),
  retryable: z.boolean(),
  userFacing: z.boolean(),
  requiresEscalation: z.boolean(),
  automatedRecovery: z.boolean()
});

/**
 * Base Domain Error Class
 * Enterprise-grade error with comprehensive context and classification
 */
export abstract class DomainError extends Error {
  public readonly errorCode: string;
  public readonly context: ErrorContext;
  public readonly classification: ErrorClassification;
  public readonly recoverySuggestions: ErrorRecoverySuggestion[];
  public readonly correlationId: string;
  public readonly errorId: string;
  
  // Error occurrence tracking
  private static errorOccurrences: Map<string, ErrorMetrics> = new Map();
  
  constructor(
    message: string,
    errorCode: string,
    context: Partial<ErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.correlationId = this.generateCorrelationId();
    this.errorId = this.generateErrorId();
    
    // Build complete context with defaults
    this.context = {
      timestamp: new Date(),
      component: this.constructor.name,
      ...context
    };
    
    // Build complete classification with defaults
    this.classification = {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.DOMAIN,
      retryable: false,
      userFacing: false,
      requiresEscalation: false,
      automatedRecovery: false,
      ...classification
    };
    
    this.recoverySuggestions = recoverySuggestions;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Track error occurrence
    this.trackErrorOccurrence();
    
    // Validate error data
    this.validateErrorData();
  }

  /**
   * Get error as JSON for serialization
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      errorId: this.errorId,
      correlationId: this.correlationId,
      context: this.context,
      classification: this.classification,
      recoverySuggestions: this.recoverySuggestions,
      stack: this.stack,
      timestamp: this.context.timestamp.toISOString()
    };
  }

  /**
   * Get error metrics for monitoring
   */
  getMetrics(): ErrorMetrics | undefined {
    return DomainError.errorOccurrences.get(this.errorCode);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.classification.retryable;
  }

  /**
   * Check if error is user-facing
   */
  isUserFacing(): boolean {
    return this.classification.userFacing;
  }

  /**
   * Check if error requires escalation
   */
  requiresEscalation(): boolean {
    return this.classification.requiresEscalation;
  }

  /**
   * Check if automated recovery is possible
   */
  canAutoRecover(): boolean {
    return this.classification.automatedRecovery;
  }

  /**
   * Get error severity level
   */
  getSeverity(): ErrorSeverity {
    return this.classification.severity;
  }

  /**
   * Get error category
   */
  getCategory(): ErrorCategory {
    return this.classification.category;
  }

  /**
   * Add recovery suggestion
   */
  addRecoverySuggestion(suggestion: ErrorRecoverySuggestion): void {
    this.recoverySuggestions.push(suggestion);
  }

  /**
   * Get ordered recovery suggestions
   */
  getRecoverySuggestions(): ErrorRecoverySuggestion[] {
    return [...this.recoverySuggestions].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create child error with current error as parent
   */
  createChildError(
    childErrorClass: new (...args: any[]) => DomainError,
    message: string,
    errorCode: string,
    additionalContext: Partial<ErrorContext> = {}
  ): DomainError {
    const childContext: Partial<ErrorContext> = {
      ...additionalContext,
      previousErrors: [this, ...(this.context.previousErrors || [])]
    };
    
    return new childErrorClass(message, errorCode, childContext);
  }

  /**
   * Check if error has specific ancestor
   */
  hasAncestorError(errorClass: new (...args: any[]) => DomainError): boolean {
    if (!this.context.previousErrors) return false;
    
    return this.context.previousErrors.some(error => error instanceof errorClass);
  }

  /**
   * Get error chain depth
   */
  getErrorChainDepth(): number {
    return (this.context.previousErrors?.length || 0) + 1;
  }

  /**
   * Get root cause error
   */
  getRootCause(): DomainError {
    if (!this.context.previousErrors || this.context.previousErrors.length === 0) {
      return this;
    }
    
    const lastError = this.context.previousErrors[this.context.previousErrors.length - 1];
    return lastError.getRootCause();
  }

  /**
   * Generate correlation ID for error tracking
   */
  private generateCorrelationId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `${this.constructor.name.toLowerCase()}-${this.errorCode.toLowerCase()}-${Date.now()}`;
  }

  /**
   * Track error occurrence for metrics
   */
  private trackErrorOccurrence(): void {
    const existing = DomainError.errorOccurrences.get(this.errorCode);
    
    if (existing) {
      DomainError.errorOccurrences.set(this.errorCode, {
        ...existing,
        occurrenceCount: existing.occurrenceCount + 1,
        lastOccurrence: new Date()
      });
    } else {
      DomainError.errorOccurrences.set(this.errorCode, {
        errorId: this.errorId,
        occurrenceCount: 1,
        firstOccurrence: new Date(),
        lastOccurrence: new Date(),
        successfulRecoveries: 0,
        failedRecoveries: 0
      });
    }
  }

  /**
   * Validate error data against schemas
   */
  private validateErrorData(): void {
    try {
      ErrorContextSchema.parse(this.context);
      ErrorClassificationSchema.parse(this.classification);
    } catch (validationError) {
      // Log validation error but don't throw to avoid error-in-error scenarios
      console.warn(`[DOMAIN-ERROR] Validation failed for ${this.constructor.name}:`, validationError);
    }
  }

  /**
   * Update error metrics (used by recovery strategies)
   */
  static updateErrorMetrics(errorCode: string, recoverySuccess: boolean): void {
    const metrics = DomainError.errorOccurrences.get(errorCode);
    if (metrics) {
      DomainError.errorOccurrences.set(errorCode, {
        ...metrics,
        successfulRecoveries: recoverySuccess 
          ? metrics.successfulRecoveries + 1 
          : metrics.successfulRecoveries,
        failedRecoveries: !recoverySuccess 
          ? metrics.failedRecoveries + 1 
          : metrics.failedRecoveries
      });
    }
  }

  /**
   * Get all error metrics for monitoring
   */
  static getAllErrorMetrics(): Map<string, ErrorMetrics> {
    return new Map(DomainError.errorOccurrences);
  }

  /**
   * Clear error metrics (for testing or maintenance)
   */
  static clearErrorMetrics(): void {
    DomainError.errorOccurrences.clear();
  }

  /**
   * Get error statistics summary
   */
  static getErrorStatistics(): {
    totalErrors: number;
    uniqueErrorCodes: number;
    criticalErrors: number;
    retryableErrors: number;
    averageOccurrences: number;
  } {
    const metrics = Array.from(DomainError.errorOccurrences.values());
    const totalOccurrences = metrics.reduce((sum, m) => sum + m.occurrenceCount, 0);
    
    return {
      totalErrors: totalOccurrences,
      uniqueErrorCodes: metrics.length,
      criticalErrors: 0, // Would need classification tracking
      retryableErrors: 0, // Would need classification tracking
      averageOccurrences: metrics.length > 0 ? totalOccurrences / metrics.length : 0
    };
  }
}

/**
 * Error factory for creating domain errors with consistent patterns
 */
export class DomainErrorFactory {
  /**
   * Create validation error
   */
  static createValidationError(
    message: string,
    field?: string,
    value?: any,
    context?: Partial<ErrorContext>
  ): DomainError {
    return new (class extends DomainError {
      constructor() {
        super(
          message,
          'VALIDATION_ERROR',
          {
            ...context,
            metadata: {
              field,
              value,
              ...context?.metadata
            }
          },
          {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.VALIDATION,
            userFacing: true,
            retryable: false
          },
          [
            {
              action: 'validate_input',
              description: 'Check input data format and constraints',
              automated: false,
              priority: 100
            }
          ]
        );
      }
    })();
  }

  /**
   * Create configuration error
   */
  static createConfigurationError(
    message: string,
    configKey?: string,
    context?: Partial<ErrorContext>
  ): DomainError {
    return new (class extends DomainError {
      constructor() {
        super(
          message,
          'CONFIGURATION_ERROR',
          {
            ...context,
            metadata: {
              configKey,
              ...context?.metadata
            }
          },
          {
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.CONFIGURATION,
            userFacing: false,
            retryable: false,
            requiresEscalation: true
          },
          [
            {
              action: 'check_configuration',
              description: 'Verify configuration settings and environment variables',
              automated: true,
              priority: 100
            }
          ]
        );
      }
    })();
  }

  /**
   * Create performance error
   */
  static createPerformanceError(
    message: string,
    operation?: string,
    duration?: number,
    context?: Partial<ErrorContext>
  ): DomainError {
    return new (class extends DomainError {
      constructor() {
        super(
          message,
          'PERFORMANCE_ERROR',
          {
            ...context,
            metadata: {
              operation,
              duration,
              ...context?.metadata
            }
          },
          {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.PERFORMANCE,
            userFacing: false,
            retryable: true,
            automatedRecovery: true
          },
          [
            {
              action: 'optimize_performance',
              description: 'Apply performance optimizations and caching',
              automated: true,
              priority: 80
            },
            {
              action: 'scale_resources',
              description: 'Consider scaling system resources',
              automated: false,
              priority: 60
            }
          ]
        );
      }
    })();
  }
}

// Export utility types
export type { ErrorContext, ErrorClassification, ErrorRecoverySuggestion, ErrorMetrics };