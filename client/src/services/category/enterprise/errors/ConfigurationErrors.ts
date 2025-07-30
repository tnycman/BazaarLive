/**
 * Enterprise Configuration Error Hierarchy
 * Comprehensive error classes with detailed context and recovery strategies
 * Zero assumptions, complete error categorization
 */

// ===== BASE ERROR CLASSES =====

/**
 * Abstract base class for all configuration errors
 * Provides common error properties and categorization
 */
export abstract class ConfigurationError extends Error {
  public abstract readonly code: string;
  public abstract readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public abstract readonly category: 'validation' | 'loading' | 'parsing' | 'network' | 'security' | 'business-rule';
  public readonly timestamp: string;
  public readonly contextId: string;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly technicalDetails: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      cause?: Error;
      recoverable?: boolean;
      userMessage?: string;
      technicalDetails?: Record<string, unknown>;
      contextId?: string;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.contextId = options.contextId || crypto.randomUUID();
    this.recoverable = options.recoverable ?? true;
    this.userMessage = options.userMessage || 'A configuration error occurred. Please try again.';
    this.technicalDetails = options.technicalDetails || {};
  }

  /**
   * Get comprehensive error information for logging
   */
  public getErrorInfo(): ConfigurationErrorInfo {
    return {
      code: this.code,
      severity: this.severity,
      category: this.category,
      message: this.message,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      contextId: this.contextId,
      recoverable: this.recoverable,
      technicalDetails: this.technicalDetails,
      stack: this.stack,
      cause: this.cause
    };
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    return this.userMessage;
  }

  /**
   * Check if error is recoverable
   */
  public isRecoverable(): boolean {
    return this.recoverable;
  }
}

// ===== ERROR INFO INTERFACE =====

export interface ConfigurationErrorInfo {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'loading' | 'parsing' | 'network' | 'security' | 'business-rule';
  message: string;
  userMessage: string;
  timestamp: string;
  contextId: string;
  recoverable: boolean;
  technicalDetails: Record<string, unknown>;
  stack?: string;
  cause?: unknown;
}

// ===== VALIDATION ERROR CLASSES =====

/**
 * Configuration not found error
 * When a requested configuration key doesn't exist
 */
export class ConfigurationNotFoundError extends ConfigurationError {
  public readonly code = 'CONFIG_NOT_FOUND';
  public readonly severity = 'high' as const;
  public readonly category = 'loading' as const;

  constructor(
    configKey: string,
    availableKeys: string[] = [],
    options: {
      cause?: Error;
      contextId?: string;
      suggestions?: string[];
    } = {}
  ) {
    const message = `Configuration not found for key: ${configKey}`;
    const userMessage = `The requested configuration "${configKey}" is not available. Please check the configuration name and try again.`;
    
    super(message, {
      ...options,
      recoverable: true,
      userMessage,
      technicalDetails: {
        configKey,
        availableKeys,
        suggestions: options.suggestions || [],
        searchAttempted: true
      }
    });
  }
}

/**
 * Configuration validation error
 * When configuration data fails schema validation
 */
export class ConfigurationValidationError extends ConfigurationError {
  public readonly code = 'CONFIG_VALIDATION_FAILED';
  public readonly severity = 'critical' as const;
  public readonly category = 'validation' as const;

  constructor(
    configKey: string,
    validationErrors: string[],
    options: {
      cause?: Error;
      contextId?: string;
      rawData?: unknown;
    } = {}
  ) {
    const message = `Configuration validation failed for key: ${configKey}`;
    const userMessage = 'The configuration data is invalid and cannot be used. Please contact support if this issue persists.';
    
    super(message, {
      ...options,
      recoverable: false,
      userMessage,
      technicalDetails: {
        configKey,
        validationErrors,
        errorCount: validationErrors.length,
        rawData: options.rawData
      }
    });
  }
}

/**
 * Configuration loading error
 * When configuration fails to load from source
 */
export class ConfigurationLoadError extends ConfigurationError {
  public readonly code = 'CONFIG_LOAD_FAILED';
  public readonly severity = 'high' as const;
  public readonly category = 'loading' as const;

  constructor(
    configKey: string,
    loadStrategy: string,
    options: {
      cause?: Error;
      contextId?: string;
      retryAttempts?: number;
      loadTime?: number;
    } = {}
  ) {
    const message = `Failed to load configuration for key: ${configKey} using strategy: ${loadStrategy}`;
    const userMessage = 'Unable to load the requested configuration. Please try again in a moment.';
    
    super(message, {
      ...options,
      recoverable: true,
      userMessage,
      technicalDetails: {
        configKey,
        loadStrategy,
        retryAttempts: options.retryAttempts || 0,
        loadTime: options.loadTime || 0,
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Configuration merge error
 * When configuration merging/inheritance fails
 */
export class ConfigurationMergeError extends ConfigurationError {
  public readonly code = 'CONFIG_MERGE_FAILED';
  public readonly severity = 'medium' as const;
  public readonly category = 'parsing' as const;

  constructor(
    baseConfigKey: string,
    overrideConfigKey: string,
    mergeStrategy: string,
    options: {
      cause?: Error;
      contextId?: string;
      conflictingFields?: string[];
    } = {}
  ) {
    const message = `Failed to merge configurations: ${baseConfigKey} + ${overrideConfigKey}`;
    const userMessage = 'Unable to properly combine configuration settings. Using default configuration instead.';
    
    super(message, {
      ...options,
      recoverable: true,
      userMessage,
      technicalDetails: {
        baseConfigKey,
        overrideConfigKey,
        mergeStrategy,
        conflictingFields: options.conflictingFields || [],
        mergeAttemptTime: new Date().toISOString()
      }
    });
  }
}

/**
 * Configuration parsing error
 * When configuration data cannot be parsed or processed
 */
export class ConfigurationParsingError extends ConfigurationError {
  public readonly code = 'CONFIG_PARSING_FAILED';
  public readonly severity = 'high' as const;
  public readonly category = 'parsing' as const;

  constructor(
    configKey: string,
    parsingStage: string,
    options: {
      cause?: Error;
      contextId?: string;
      rawData?: unknown;
      expectedFormat?: string;
    } = {}
  ) {
    const message = `Failed to parse configuration for key: ${configKey} at stage: ${parsingStage}`;
    const userMessage = 'The configuration data format is incorrect and cannot be processed.';
    
    super(message, {
      ...options,
      recoverable: false,
      userMessage,
      technicalDetails: {
        configKey,
        parsingStage,
        expectedFormat: options.expectedFormat || 'unknown',
        rawDataType: typeof options.rawData,
        parsingAttemptTime: new Date().toISOString()
      }
    });
  }
}

/**
 * Configuration security error
 * When configuration access violates security policies
 */
export class ConfigurationSecurityError extends ConfigurationError {
  public readonly code = 'CONFIG_SECURITY_VIOLATION';
  public readonly severity = 'critical' as const;
  public readonly category = 'security' as const;

  constructor(
    configKey: string,
    securityViolation: string,
    options: {
      cause?: Error;
      contextId?: string;
      userId?: string;
      accessLevel?: string;
    } = {}
  ) {
    const message = `Security violation accessing configuration: ${configKey} - ${securityViolation}`;
    const userMessage = 'Access to this configuration is not permitted.';
    
    super(message, {
      ...options,
      recoverable: false,
      userMessage,
      technicalDetails: {
        configKey,
        securityViolation,
        userId: options.userId || 'unknown',
        accessLevel: options.accessLevel || 'none',
        violationTime: new Date().toISOString(),
        ipAddress: 'redacted-for-security'
      }
    });
  }
}

/**
 * Configuration business rule error
 * When configuration violates business logic rules
 */
export class ConfigurationBusinessRuleError extends ConfigurationError {
  public readonly code = 'CONFIG_BUSINESS_RULE_VIOLATION';
  public readonly severity = 'medium' as const;
  public readonly category = 'business-rule' as const;

  constructor(
    configKey: string,
    ruleViolation: string,
    options: {
      cause?: Error;
      contextId?: string;
      ruleId?: string;
      expectedValue?: unknown;
      actualValue?: unknown;
    } = {}
  ) {
    const message = `Business rule violation in configuration: ${configKey} - ${ruleViolation}`;
    const userMessage = 'This configuration violates business rules and cannot be used.';
    
    super(message, {
      ...options,
      recoverable: true,
      userMessage,
      technicalDetails: {
        configKey,
        ruleViolation,
        ruleId: options.ruleId || 'unknown',
        expectedValue: options.expectedValue,
        actualValue: options.actualValue,
        violationTime: new Date().toISOString()
      }
    });
  }
}

// ===== ERROR FACTORY =====

/**
 * Factory for creating configuration errors with proper context
 */
export class ConfigurationErrorFactory {
  /**
   * Create configuration not found error with suggestions
   */
  static createNotFoundError(
    configKey: string,
    availableKeys: string[] = [],
    contextId?: string
  ): ConfigurationNotFoundError {
    const suggestions = availableKeys
      .filter(key => key.includes(configKey.split('-')[0]))
      .slice(0, 3);
    
    return new ConfigurationNotFoundError(configKey, availableKeys, {
      contextId,
      suggestions
    });
  }

  /**
   * Create validation error from Zod validation results
   */
  static createValidationError(
    configKey: string,
    validationErrors: string[],
    rawData?: unknown,
    contextId?: string
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(configKey, validationErrors, {
      contextId,
      rawData
    });
  }

  /**
   * Create load error with retry information
   */
  static createLoadError(
    configKey: string,
    loadStrategy: string,
    cause?: Error,
    retryAttempts: number = 0,
    contextId?: string
  ): ConfigurationLoadError {
    return new ConfigurationLoadError(configKey, loadStrategy, {
      cause,
      contextId,
      retryAttempts,
      loadTime: Date.now()
    });
  }

  /**
   * Create merge error with conflict details
   */
  static createMergeError(
    baseConfigKey: string,
    overrideConfigKey: string,
    mergeStrategy: string,
    conflictingFields: string[] = [],
    contextId?: string
  ): ConfigurationMergeError {
    return new ConfigurationMergeError(baseConfigKey, overrideConfigKey, mergeStrategy, {
      contextId,
      conflictingFields
    });
  }
}

// ===== ERROR TYPE GUARDS =====

export const ErrorTypeGuards = {
  isConfigurationError: (error: unknown): error is ConfigurationError => {
    return error instanceof ConfigurationError;
  },

  isNotFoundError: (error: unknown): error is ConfigurationNotFoundError => {
    return error instanceof ConfigurationNotFoundError;
  },

  isValidationError: (error: unknown): error is ConfigurationValidationError => {
    return error instanceof ConfigurationValidationError;
  },

  isLoadError: (error: unknown): error is ConfigurationLoadError => {
    return error instanceof ConfigurationLoadError;
  },

  isMergeError: (error: unknown): error is ConfigurationMergeError => {
    return error instanceof ConfigurationMergeError;
  },

  isSecurityError: (error: unknown): error is ConfigurationSecurityError => {
    return error instanceof ConfigurationSecurityError;
  },

  isRecoverableError: (error: unknown): boolean => {
    return error instanceof ConfigurationError && error.isRecoverable();
  },

  isCriticalError: (error: unknown): boolean => {
    return error instanceof ConfigurationError && error.severity === 'critical';
  }
};