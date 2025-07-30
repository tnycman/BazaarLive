/**
 * Enterprise Configuration Error Hierarchy
 * 
 * Comprehensive error system for configuration management with recovery strategies
 * and detailed context for debugging and monitoring.
 * 
 * @author Enterprise AOP Team
 * @version 1.0.0
 * @since 2025-01-30
 */

// Recovery strategies are defined inline to avoid circular import issues
export enum RecoveryStrategyType {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  ALERT_DEVELOPER = 'ALERT_DEVELOPER',
  ABORT = 'ABORT',
  SWITCH_SOURCE = 'SWITCH_SOURCE',
  CLEAR_CACHE_RETRY = 'CLEAR_CACHE_RETRY',
  VALIDATE_AND_FIX = 'VALIDATE_AND_FIX',
  USE_CACHED = 'USE_CACHED',
  RESET_TO_DEFAULT = 'RESET_TO_DEFAULT',
  ESCALATE_TO_ADMIN = 'ESCALATE_TO_ADMIN'
}

export interface RecoveryStrategy {
  readonly type: RecoveryStrategyType;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly automated: boolean;
  readonly description: string;
  readonly actions: string[];
  readonly parameters: Record<string, any>;
  readonly estimatedRecoveryTime: number;
  readonly successRate: number;
  readonly prerequisites?: string[];
  readonly validationSteps?: string[];
  readonly maxAttempts?: number;
  readonly continueOnFailure?: boolean;
}

/**
 * Base domain error interface for consistent error handling
 */
export interface DomainError extends Error {
  readonly code: string;
  readonly context?: Record<string, any>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly timestamp: Date;
  readonly correlationId?: string;
}

/**
 * Abstract base class for all configuration-related errors
 * 
 * Provides consistent error structure, recovery strategy integration,
 * and comprehensive context for debugging and monitoring.
 */
export abstract class ConfigurationError extends Error implements DomainError {
  public readonly code: string;
  public readonly context: Record<string, any>;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly category: string;
  public readonly operation: string;
  public readonly userMessage: string;

  /**
   * Creates a new configuration error
   * 
   * @param message - Technical error message for developers
   * @param code - Unique error code for identification and monitoring
   * @param context - Additional context data for debugging
   * @param severity - Error severity level for alerting and prioritization
   * @param correlationId - Optional correlation ID for request tracking
   * @param userMessage - User-friendly error message for UI display
   */
  constructor(
    message: string,
    code: string,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    correlationId?: string,
    userMessage?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = { ...context };
    this.severity = severity;
    this.timestamp = new Date();
    this.correlationId = correlationId;
    this.category = this.getErrorCategory();
    this.operation = context.operation || 'unknown';
    this.userMessage = userMessage || this.getDefaultUserMessage();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets the recovery strategy for this error type
   * 
   * @returns Recovery strategy with specific actions and parameters
   */
  public abstract getRecoveryStrategy(): RecoveryStrategy;

  /**
   * Gets the error category for monitoring and alerting
   * 
   * @returns Error category string
   */
  protected abstract getErrorCategory(): string;

  /**
   * Gets the default user-friendly message for this error type
   * 
   * @returns User-friendly error message
   */
  protected abstract getDefaultUserMessage(): string;

  /**
   * Converts error to a serializable object for logging and monitoring
   * 
   * @returns Serializable error representation
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      category: this.category,
      operation: this.operation,
      userMessage: this.userMessage,
      stack: this.stack
    };
  }

  /**
   * Creates a detailed error report for monitoring systems
   * 
   * @returns Comprehensive error report
   */
  public createErrorReport(): {
    error: Record<string, any>;
    recovery: RecoveryStrategy;
    metrics: {
      errorCount: number;
      firstOccurrence: Date;
      lastOccurrence: Date;
      impactLevel: string;
    };
  } {
    return {
      error: this.toJSON(),
      recovery: this.getRecoveryStrategy(),
      metrics: {
        errorCount: 1, // Would be tracked by monitoring system
        firstOccurrence: this.timestamp,
        lastOccurrence: this.timestamp,
        impactLevel: this.severity
      }
    };
  }

  /**
   * Checks if this error is recoverable
   * 
   * @returns True if error can be recovered from
   */
  public isRecoverable(): boolean {
    const strategy = this.getRecoveryStrategy();
    return strategy.type !== RecoveryStrategyType.ABORT;
  }

  /**
   * Gets recommended actions for this error
   * 
   * @returns Array of recommended actions
   */
  public getRecommendedActions(): string[] {
    const strategy = this.getRecoveryStrategy();
    return strategy.actions || [];
  }
}

/**
 * Configuration not found error
 * 
 * Thrown when a requested configuration cannot be located
 * in any configured source.
 */
export class ConfigurationNotFoundError extends ConfigurationError {
  constructor(
    configurationKey: string,
    searchedLocations: string[] = [],
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ) {
    const context = {
      configurationKey,
      searchedLocations,
      searchCount: searchedLocations.length,
      operation: 'configuration_lookup',
      ...additionalContext
    };

    super(
      `Configuration not found: ${configurationKey}. Searched locations: ${searchedLocations.join(', ')}`,
      'CONFIG_NOT_FOUND',
      context,
      'medium',
      correlationId,
      `The requested configuration "${configurationKey}" could not be found. Please check the configuration name and try again.`
    );
  }

  protected getErrorCategory(): string {
    return 'configuration_access';
  }

  protected getDefaultUserMessage(): string {
    return 'The requested configuration could not be found. Please verify the configuration name and try again.';
  }

  public getRecoveryStrategy(): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.FALLBACK,
      priority: 'high',
      automated: true,
      description: 'Use fallback configuration or default values',
      actions: [
        'Try fallback configuration sources',
        'Use default configuration values',
        'Check configuration key spelling',
        'Verify configuration file exists'
      ],
      parameters: {
        maxRetries: 3,
        fallbackConfiguration: 'default',
        notifyDeveloper: this.severity === 'high' || this.severity === 'critical'
      },
      estimatedRecoveryTime: 5000, // 5 seconds
      successRate: 85
    };
  }
}

/**
 * Configuration validation error
 * 
 * Thrown when configuration data fails validation rules
 * or schema requirements.
 */
export class ConfigurationValidationError extends ConfigurationError {
  constructor(
    validationMessage: string,
    field: string,
    value: any,
    expectedType?: string,
    validationRules?: string[],
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ) {
    const context = {
      field,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      expectedType,
      validationRules,
      operation: 'configuration_validation',
      ...additionalContext
    };

    super(
      `Configuration validation failed for field "${field}": ${validationMessage}`,
      'CONFIG_VALIDATION_FAILED',
      context,
      'high',
      correlationId,
      `Configuration validation failed. Please check the "${field}" field and try again.`
    );
  }

  protected getErrorCategory(): string {
    return 'configuration_validation';
  }

  protected getDefaultUserMessage(): string {
    return 'Configuration validation failed. Please check your input and try again.';
  }

  public getRecoveryStrategy(): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.RETRY,
      priority: 'high',
      automated: false,
      description: 'Fix validation errors and retry configuration',
      actions: [
        'Review and correct the invalid field value',
        'Check configuration schema requirements',
        'Validate all required fields are present',
        'Ensure data types match expected formats'
      ],
      parameters: {
        maxRetries: 1,
        requireUserIntervention: true,
        validationDetails: this.context,
        showValidationHelp: true
      },
      estimatedRecoveryTime: 30000, // 30 seconds (user intervention)
      successRate: 95
    };
  }
}

/**
 * Configuration loading error
 * 
 * Thrown when configuration data cannot be loaded from
 * storage or external sources.
 */
export class ConfigurationLoadError extends ConfigurationError {
  constructor(
    source: string,
    loadError: string,
    retryCount: number = 0,
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ) {
    const context = {
      source,
      loadError,
      retryCount,
      operation: 'configuration_load',
      ...additionalContext
    };

    super(
      `Failed to load configuration from source "${source}": ${loadError}`,
      'CONFIG_LOAD_FAILED',
      context,
      retryCount > 2 ? 'high' : 'medium',
      correlationId,
      'Configuration could not be loaded. Please try again or contact support if the problem persists.'
    );
  }

  protected getErrorCategory(): string {
    return 'configuration_loading';
  }

  protected getDefaultUserMessage(): string {
    return 'Configuration could not be loaded. Please try again or contact support if the problem persists.';
  }

  public getRecoveryStrategy(): RecoveryStrategy {
    const retryCount = this.context.retryCount as number || 0;
    
    return {
      type: retryCount < 3 ? RecoveryStrategyType.RETRY : RecoveryStrategyType.FALLBACK,
      priority: 'high',
      automated: true,
      description: retryCount < 3 ? 'Retry loading with exponential backoff' : 'Use fallback configuration source',
      actions: retryCount < 3 ? [
        'Retry loading with exponential backoff',
        'Check network connectivity',
        'Verify source accessibility',
        'Validate file permissions'
      ] : [
        'Switch to fallback configuration source',
        'Use cached configuration if available',
        'Alert system administrators',
        'Monitor source recovery'
      ],
      parameters: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 10000,
        fallbackSource: 'memory',
        alertThreshold: 3
      },
      estimatedRecoveryTime: retryCount < 3 ? 2000 + (retryCount * 1000) : 15000,
      successRate: retryCount < 3 ? 80 : 60
    };
  }
}

/**
 * Configuration type error
 * 
 * Thrown when configuration data has incorrect type
 * or cannot be converted to expected type.
 */
export class ConfigurationTypeError extends ConfigurationError {
  constructor(
    field: string,
    actualType: string,
    expectedType: string,
    value: any,
    conversionAttempted: boolean = false,
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ) {
    const context = {
      field,
      actualType,
      expectedType,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      conversionAttempted,
      operation: 'configuration_type_check',
      ...additionalContext
    };

    super(
      `Configuration type error for field "${field}": expected ${expectedType}, got ${actualType}`,
      'CONFIG_TYPE_MISMATCH',
      context,
      'high',
      correlationId,
      `Configuration format error. The "${field}" field has an incorrect format.`
    );
  }

  protected getErrorCategory(): string {
    return 'configuration_typing';
  }

  protected getDefaultUserMessage(): string {
    return 'Configuration format error. Please check the data format and try again.';
  }

  public getRecoveryStrategy(): RecoveryStrategy {
    const conversionAttempted = this.context.conversionAttempted as boolean;
    
    return {
      type: conversionAttempted ? RecoveryStrategyType.ALERT_DEVELOPER : RecoveryStrategyType.RETRY,
      priority: 'high',
      automated: !conversionAttempted,
      description: conversionAttempted ? 'Alert developer for type conversion fix' : 'Attempt type conversion',
      actions: conversionAttempted ? [
        'Alert development team',
        'Document type conversion failure',
        'Use default value for field',
        'Log detailed type information'
      ] : [
        'Attempt automatic type conversion',
        'Use type coercion rules',
        'Apply default value if conversion fails',
        'Log conversion attempt details'
      ],
      parameters: {
        maxRetries: 1,
        allowTypeCoercion: true,
        defaultValue: this.getDefaultValueForType(),
        strictTypeChecking: false,
        developerAlert: conversionAttempted
      },
      estimatedRecoveryTime: conversionAttempted ? 60000 : 5000,
      successRate: conversionAttempted ? 30 : 75
    };
  }

  /**
   * Gets appropriate default value based on expected type
   * 
   * @returns Default value for the expected type
   */
  private getDefaultValueForType(): any {
    const expectedType = this.context.expectedType as string;
    
    switch (expectedType.toLowerCase()) {
      case 'string': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return null;
    }
  }
}

/**
 * Configuration security error
 * 
 * Thrown when configuration access violates security
 * policies or permissions.
 */
export class ConfigurationSecurityError extends ConfigurationError {
  constructor(
    operation: string,
    requiredPermission: string,
    currentPermissions: string[] = [],
    securityPolicy: string = '',
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ) {
    const context = {
      operation: 'configuration_security_check',
      requiredPermission,
      currentPermissions,
      securityPolicy,
      permissionDenied: true,
      originalOperation: operation,
      ...additionalContext
    };

    super(
      `Configuration security violation: operation "${operation}" requires permission "${requiredPermission}"`,
      'CONFIG_SECURITY_VIOLATION',
      context,
      'critical',
      correlationId,
      'Access denied. You do not have permission to perform this operation.'
    );
  }

  protected getErrorCategory(): string {
    return 'configuration_security';
  }

  protected getDefaultUserMessage(): string {
    return 'Access denied. You do not have permission to perform this operation.';
  }

  public getRecoveryStrategy(): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.ALERT_DEVELOPER,
      priority: 'critical',
      automated: true,
      description: 'Alert security team and log security violation',
      actions: [
        'Log security violation with full context',
        'Alert security team immediately',
        'Block further access attempts',
        'Review user permissions and access patterns',
        'Investigate potential security breach'
      ],
      parameters: {
        maxRetries: 0,
        blockAccess: true,
        securityAlert: true,
        auditLog: true,
        escalateToSecurity: true,
        quarantineUser: this.severity === 'critical'
      },
      estimatedRecoveryTime: 0, // No automatic recovery
      successRate: 0 // Requires manual intervention
    };
  }

  /**
   * Creates a security incident report
   * 
   * @returns Security incident report with full context
   */
  public createSecurityIncidentReport(): {
    incident: {
      id: string;
      timestamp: Date;
      severity: string;
      operation: string;
      requiredPermission: string;
      currentPermissions: string[];
      userContext: Record<string, any>;
    };
    response: {
      action: string;
      automated: boolean;
      alertsSent: string[];
      accessBlocked: boolean;
    };
  } {
    return {
      incident: {
        id: this.correlationId || `security-${Date.now()}`,
        timestamp: this.timestamp,
        severity: this.severity,
        operation: this.context.operation as string,
        requiredPermission: this.context.requiredPermission as string,
        currentPermissions: this.context.currentPermissions as string[],
        userContext: this.context
      },
      response: {
        action: 'BLOCK_AND_ALERT',
        automated: true,
        alertsSent: ['security-team', 'system-admin'],
        accessBlocked: true
      }
    };
  }
}

/**
 * Error factory for creating configuration errors with consistent structure
 */
export class ConfigurationErrorFactory {
  /**
   * Creates a configuration not found error
   */
  static createNotFoundError(
    configurationKey: string,
    searchedLocations: string[] = [],
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ): ConfigurationNotFoundError {
    return new ConfigurationNotFoundError(configurationKey, searchedLocations, correlationId, additionalContext);
  }

  /**
   * Creates a configuration validation error
   */
  static createValidationError(
    validationMessage: string,
    field: string,
    value: any,
    expectedType?: string,
    validationRules?: string[],
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(
      validationMessage,
      field,
      value,
      expectedType,
      validationRules,
      correlationId,
      additionalContext
    );
  }

  /**
   * Creates a configuration load error
   */
  static createLoadError(
    source: string,
    loadError: string,
    retryCount: number = 0,
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ): ConfigurationLoadError {
    return new ConfigurationLoadError(source, loadError, retryCount, correlationId, additionalContext);
  }

  /**
   * Creates a configuration type error
   */
  static createTypeError(
    field: string,
    actualType: string,
    expectedType: string,
    value: any,
    conversionAttempted: boolean = false,
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ): ConfigurationTypeError {
    return new ConfigurationTypeError(
      field,
      actualType,
      expectedType,
      value,
      conversionAttempted,
      correlationId,
      additionalContext
    );
  }

  /**
   * Creates a configuration security error
   */
  static createSecurityError(
    operation: string,
    requiredPermission: string,
    currentPermissions: string[] = [],
    securityPolicy: string = '',
    correlationId?: string,
    additionalContext: Record<string, any> = {}
  ): ConfigurationSecurityError {
    return new ConfigurationSecurityError(
      operation,
      requiredPermission,
      currentPermissions,
      securityPolicy,
      correlationId,
      additionalContext
    );
  }
}

/**
 * Configuration error utilities for error handling and recovery
 */
export class ConfigurationErrorUtils {
  /**
   * Determines if an error is a configuration error
   */
  static isConfigurationError(error: any): error is ConfigurationError {
    return error instanceof ConfigurationError;
  }

  /**
   * Gets the most appropriate recovery strategy for an error
   */
  static getRecoveryStrategy(error: Error): RecoveryStrategy | null {
    if (ConfigurationErrorUtils.isConfigurationError(error)) {
      return error.getRecoveryStrategy();
    }
    return null;
  }

  /**
   * Creates a standardized error response for APIs
   */
  static createErrorResponse(error: ConfigurationError): {
    success: false;
    error: {
      code: string;
      message: string;
      userMessage: string;
      severity: string;
      recoverable: boolean;
      recommendedActions: string[];
    };
    metadata: {
      timestamp: string;
      correlationId?: string;
      category: string;
    };
  } {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        severity: error.severity,
        recoverable: error.isRecoverable(),
        recommendedActions: error.getRecommendedActions()
      },
      metadata: {
        timestamp: error.timestamp.toISOString(),
        correlationId: error.correlationId,
        category: error.category
      }
    };
  }

  /**
   * Aggregates multiple configuration errors into a summary
   */
  static aggregateErrors(errors: ConfigurationError[]): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recoverableErrors: number;
    criticalErrors: ConfigurationError[];
    recommendedActions: string[];
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const criticalErrors: ConfigurationError[] = [];
    const allActions = new Set<string>();

    errors.forEach(error => {
      // Count by category
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Collect critical errors
      if (error.severity === 'critical') {
        criticalErrors.push(error);
      }
      
      // Collect recommended actions
      error.getRecommendedActions().forEach(action => allActions.add(action));
    });

    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsBySeverity,
      recoverableErrors: errors.filter(e => e.isRecoverable()).length,
      criticalErrors,
      recommendedActions: Array.from(allActions)
    };
  }
}