/**
 * Filter Error Type Definitions
 * Comprehensive type definitions for filter error handling
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { z } from 'zod';

// ===== ERROR CONTEXT TYPES =====

export interface ErrorContext {
  componentId?: string;
  operation?: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}

export interface ErrorRecoveryContext {
  originalError: FilterError;
  retryCount: number;
  maxRetries: number;
  backoffMs: number;
  lastAttempt: number;
}

// ===== ERROR VALIDATION SCHEMAS =====

export const ErrorContextSchema = z.object({
  componentId: z.string().optional(),
  operation: z.string().optional(),
  data: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const ErrorRecoveryContextSchema = z.object({
  originalError: z.object({
    type: z.string(),
    message: z.string(),
    code: z.string(),
    timestamp: z.number()
  }),
  retryCount: z.number().int().min(0),
  maxRetries: z.number().int().min(0),
  backoffMs: z.number().int().min(0),
  lastAttempt: z.number()
});

// ===== ERROR UTILITY TYPES =====

export type ErrorHandlerFunction = (error: FilterError) => void | Promise<void>;
export type ErrorRecoveryFunction = (error: FilterError) => Promise<boolean>;
export type ErrorValidationFunction = (data: unknown) => boolean;

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableMonitoring: boolean;
  enableRecovery: boolean;
  maxRetries: number;
  backoffMs: number;
  rateLimitPerMinute: number;
}

// ===== ERROR CONSTANTS =====

export const ERROR_CONSTANTS = {
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_BACKOFF_MS: 1000,
  DEFAULT_RATE_LIMIT: 100,
  ERROR_WINDOW_MS: 60000,
  RECOVERY_TIMEOUT_MS: 5000
} as const;

// ===== ERROR UTILITY INTERFACES =====

export interface FilterError {
  type: string;
  severity: string;
  context: string;
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: number;
  componentId?: string;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorMonitoringEvent {
  type: string;
  severity: string;
  message: string;
  code: string;
  timestamp: number;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== ERROR CATEGORIES =====

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NAVIGATION = 'NAVIGATION',
  STATE = 'STATE',
  PERFORMANCE = 'PERFORMANCE',
  DATA = 'DATA',
  MEMORY = 'MEMORY',
  CONFIGURATION = 'CONFIGURATION',
  ACCESSIBILITY = 'ACCESSIBILITY'
}

export enum ErrorPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

// ===== ERROR REPORTING INTERFACES =====

export interface ErrorReport {
  id: string;
  error: FilterError;
  context: ErrorContext;
  timestamp: number;
  environment: string;
  version: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
}

export interface ErrorReportConfig {
  enableReporting: boolean;
  endpoint?: string;
  apiKey?: string;
  environment: string;
  version: string;
  includeStackTraces: boolean;
  includeUserData: boolean;
  maxReportsPerMinute: number;
}

// ===== ERROR RECOVERY INTERFACES =====

export interface RecoveryStrategy {
  id: string;
  errorType: string;
  context: string;
  condition: (error: FilterError) => boolean;
  action: (error: FilterError) => Promise<boolean>;
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
}

export interface RecoveryResult {
  success: boolean;
  strategyId: string;
  error: FilterError;
  attempts: number;
  duration: number;
  fallbackUsed: boolean;
}

// ===== ERROR METRICS INTERFACES =====

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByContext: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  averageRecoveryTime: number;
  errorRate: number;
  lastErrorTimestamp: number;
}

export interface ErrorMetricsConfig {
  enableMetrics: boolean;
  metricsInterval: number;
  maxMetricsHistory: number;
  enableRealTimeMetrics: boolean;
}

// ===== ERROR VALIDATION UTILITIES =====

export const createErrorValidator = (schema: z.ZodSchema) => {
  return (data: unknown): boolean => {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  };
};

export const validateErrorContext = createErrorValidator(ErrorContextSchema);
export const validateErrorRecoveryContext = createErrorValidator(ErrorRecoveryContextSchema);

// ===== ERROR UTILITY FUNCTIONS =====

export const createErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateErrorRate = (errors: FilterError[], windowMs: number): number => {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recentErrors = errors.filter(error => error.timestamp >= windowStart);
  return recentErrors.length / (windowMs / 1000);
};

export const isErrorRecoverable = (error: FilterError): boolean => {
  const recoverableTypes = [
    'VALIDATION_ERROR',
    'STATE_ERROR',
    'MEMORY_ERROR',
    'DATA_ERROR'
  ];
  return recoverableTypes.includes(error.type);
};

export const shouldRetryError = (error: FilterError): boolean => {
  return error.recoverable && error.retryCount < error.maxRetries;
};

export const calculateBackoffDelay = (retryCount: number, baseDelay: number): number => {
  return baseDelay * Math.pow(2, retryCount);
};

// ===== ERROR FORMATTING UTILITIES =====

export const formatErrorMessage = (error: FilterError): string => {
  return `[${error.type}] ${error.message} (${error.code})`;
};

export const formatErrorForLogging = (error: FilterError): string => {
  return `[FilterError] ${error.type} (${error.severity}) in ${error.context}: ${error.message} [${error.code}] at ${new Date(error.timestamp).toISOString()}`;
};

export const formatErrorForMonitoring = (error: FilterError): ErrorMonitoringEvent => {
  return {
    type: error.type,
    severity: error.severity,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    context: {
      componentId: error.componentId,
      userId: error.userId,
      sessionId: error.sessionId
    },
    metadata: {
      details: error.details,
      stackTrace: error.stackTrace,
      recoverable: error.recoverable,
      retryCount: error.retryCount,
      maxRetries: error.maxRetries
    }
  };
};

// ===== ERROR CLASSIFICATION UTILITIES =====

export const classifyErrorSeverity = (error: FilterError): ErrorPriority => {
  const severityMap: Record<string, ErrorPriority> = {
    'LOW': ErrorPriority.LOW,
    'MEDIUM': ErrorPriority.MEDIUM,
    'HIGH': ErrorPriority.HIGH,
    'CRITICAL': ErrorPriority.CRITICAL
  };
  
  return severityMap[error.severity] || ErrorPriority.MEDIUM;
};

export const classifyErrorCategory = (error: FilterError): ErrorCategory => {
  const categoryMap: Record<string, ErrorCategory> = {
    'VALIDATION_ERROR': ErrorCategory.VALIDATION,
    'NAVIGATION_ERROR': ErrorCategory.NAVIGATION,
    'STATE_ERROR': ErrorCategory.STATE,
    'PERFORMANCE_ERROR': ErrorCategory.PERFORMANCE,
    'DATA_ERROR': ErrorCategory.DATA,
    'MEMORY_ERROR': ErrorCategory.MEMORY,
    'CONFIGURATION_ERROR': ErrorCategory.CONFIGURATION,
    'ACCESSIBILITY_ERROR': ErrorCategory.ACCESSIBILITY
  };
  
  return categoryMap[error.type] || ErrorCategory.DATA;
};

// ===== ERROR COMPARISON UTILITIES =====

export const isSameError = (error1: FilterError, error2: FilterError): boolean => {
  return error1.type === error2.type && 
         error1.context === error2.context && 
         error1.code === error2.code;
};

export const isSimilarError = (error1: FilterError, error2: FilterError): boolean => {
  return error1.type === error2.type && 
         error1.context === error2.context;
};

// ===== ERROR TIMING UTILITIES =====

export const isErrorStale = (error: FilterError, maxAgeMs: number): boolean => {
  const now = Date.now();
  return (now - error.timestamp) > maxAgeMs;
};

export const getErrorAge = (error: FilterError): number => {
  return Date.now() - error.timestamp;
};

// ===== ERROR SERIALIZATION UTILITIES =====

export const serializeError = (error: FilterError): string => {
  return JSON.stringify({
    type: error.type,
    severity: error.severity,
    context: error.context,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    componentId: error.componentId,
    recoverable: error.recoverable,
    retryCount: error.retryCount,
    maxRetries: error.maxRetries
  });
};

export const deserializeError = (serialized: string): FilterError => {
  const parsed = JSON.parse(serialized);
  return {
    ...parsed,
    details: parsed.details || {},
    userId: parsed.userId,
    sessionId: parsed.sessionId,
    stackTrace: parsed.stackTrace
  };
}; 