/**
 * Configuration Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade configuration-specific errors with validation context
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorClassification,
  ErrorRecoverySuggestion 
} from './DomainError';

// Configuration Error Types
export enum ConfigurationErrorType {
  MISSING_REQUIRED_CONFIG = 'MISSING_REQUIRED_CONFIG',
  INVALID_CONFIG_VALUE = 'INVALID_CONFIG_VALUE',
  CONFIG_VALIDATION_FAILED = 'CONFIG_VALIDATION_FAILED',
  ENVIRONMENT_NOT_FOUND = 'ENVIRONMENT_NOT_FOUND',
  SECRET_NOT_AVAILABLE = 'SECRET_NOT_AVAILABLE',
  CONFIG_PARSE_ERROR = 'CONFIG_PARSE_ERROR',
  CONFIG_SOURCE_UNAVAILABLE = 'CONFIG_SOURCE_UNAVAILABLE',
  CONFIG_PERMISSION_DENIED = 'CONFIG_PERMISSION_DENIED',
  CONFIG_VERSION_MISMATCH = 'CONFIG_VERSION_MISMATCH',
  CONFIG_DEPENDENCY_MISSING = 'CONFIG_DEPENDENCY_MISSING',
  CONFIG_SCHEMA_INVALID = 'CONFIG_SCHEMA_INVALID',
  CONFIG_OVERRIDE_CONFLICT = 'CONFIG_OVERRIDE_CONFLICT'
}

// Configuration Source Types
export enum ConfigurationSource {
  ENVIRONMENT_VARIABLES = 'environment_variables',
  CONFIG_FILE = 'config_file',
  DATABASE = 'database',
  REMOTE_SERVICE = 'remote_service',
  COMMAND_LINE = 'command_line',
  DEFAULT_VALUES = 'default_values',
  RUNTIME_OVERRIDE = 'runtime_override'
}

// Configuration Context Extensions
export interface ConfigurationErrorContext extends ErrorContext {
  readonly configKey?: string;
  readonly configValue?: any;
  readonly expectedType?: string;
  readonly actualType?: string;
  readonly configSource?: ConfigurationSource;
  readonly configPath?: string;
  readonly schemaVersion?: string;
  readonly validationErrors?: string[];
  readonly dependencyChain?: string[];
  readonly environmentName?: string;
  readonly configurationGroup?: string;
}

/**
 * Base Configuration Error
 * Enterprise-grade configuration error with validation context
 */
export class ConfigurationError extends DomainError {
  public readonly configErrorType: ConfigurationErrorType;
  public readonly configContext: ConfigurationErrorContext;

  constructor(
    message: string,
    configErrorType: ConfigurationErrorType,
    configContext: Partial<ConfigurationErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    // Default configuration error classification
    const defaultClassification: ErrorClassification = {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.CONFIGURATION,
      retryable: false,
      userFacing: false,
      requiresEscalation: true,
      automatedRecovery: false,
      ...classification
    };

    // Default recovery suggestions for configuration
    const defaultRecoveryConfig = ConfigurationError.getDefaultRecoveryConfig(configErrorType);
    const combinedSuggestions = [...defaultRecoveryConfig, ...recoverySuggestions];

    super(
      message,
      configErrorType,
      {
        component: 'ConfigurationSystem',
        ...configContext
      },
      defaultClassification,
      combinedSuggestions
    );

    this.configErrorType = configErrorType;
    this.configContext = {
      ...this.context,
      ...configContext
    } as ConfigurationErrorContext;

    // Log configuration event
    this.logConfigurationEvent();
  }

  /**
   * Get configuration error type
   */
  getConfigErrorType(): ConfigurationErrorType {
    return this.configErrorType;
  }

  /**
   * Get configuration context
   */
  getConfigContext(): ConfigurationErrorContext {
    return this.configContext;
  }

  /**
   * Check if error is startup-blocking
   */
  isStartupBlocking(): boolean {
    const blockingTypes = [
      ConfigurationErrorType.MISSING_REQUIRED_CONFIG,
      ConfigurationErrorType.ENVIRONMENT_NOT_FOUND,
      ConfigurationErrorType.SECRET_NOT_AVAILABLE,
      ConfigurationErrorType.CONFIG_DEPENDENCY_MISSING
    ];
    return blockingTypes.includes(this.configErrorType);
  }

  /**
   * Check if error can be resolved with defaults
   */
  canUseDefaults(): boolean {
    const defaultableTypes = [
      ConfigurationErrorType.MISSING_REQUIRED_CONFIG,
      ConfigurationErrorType.CONFIG_SOURCE_UNAVAILABLE
    ];
    return defaultableTypes.includes(this.configErrorType) && 
           this.configContext.configSource !== ConfigurationSource.DEFAULT_VALUES;
  }

  /**
   * Get configuration diagnostic data
   */
  getConfigurationDiagnostic(): Record<string, any> {
    return {
      eventType: 'configuration_error',
      errorType: this.configErrorType,
      configKey: this.configContext.configKey,
      configSource: this.configContext.configSource,
      environmentName: this.configContext.environmentName,
      expectedType: this.configContext.expectedType,
      actualType: this.configContext.actualType,
      timestamp: this.context.timestamp,
      severity: this.classification.severity,
      startupBlocking: this.isStartupBlocking()
    };
  }

  /**
   * Log configuration event
   */
  private logConfigurationEvent(): void {
    const diagnostic = this.getConfigurationDiagnostic();
    console.warn('[CONFIG-EVENT] Configuration error occurred:', diagnostic);
    
    if (this.isStartupBlocking()) {
      console.error('[CONFIG-ALERT] Startup-blocking configuration error:', diagnostic);
    }
  }

  /**
   * Get default recovery suggestions by error type
   */
  private static getDefaultRecoveryConfig(errorType: ConfigurationErrorType): ErrorRecoverySuggestion[] {
    const recoveryConfigs: Record<ConfigurationErrorType, ErrorRecoverySuggestion[]> = {
      [ConfigurationErrorType.MISSING_REQUIRED_CONFIG]: [
        {
          action: 'check_environment_variables',
          description: 'Verify required environment variables are set',
          automated: true,
          priority: 100
        },
        {
          action: 'use_default_value',
          description: 'Apply default configuration value if available',
          automated: true,
          priority: 90
        },
        {
          action: 'prompt_for_config',
          description: 'Prompt user for missing configuration',
          automated: false,
          priority: 80
        }
      ],
      [ConfigurationErrorType.INVALID_CONFIG_VALUE]: [
        {
          action: 'validate_config_format',
          description: 'Check configuration value format and constraints',
          automated: true,
          priority: 100
        },
        {
          action: 'reset_to_default',
          description: 'Reset to known good default value',
          automated: true,
          priority: 90
        }
      ],
      [ConfigurationErrorType.CONFIG_VALIDATION_FAILED]: [
        {
          action: 'check_schema_version',
          description: 'Verify configuration schema version compatibility',
          automated: true,
          priority: 100
        },
        {
          action: 'migrate_config_format',
          description: 'Migrate configuration to current schema',
          automated: true,
          priority: 90
        }
      ],
      [ConfigurationErrorType.SECRET_NOT_AVAILABLE]: [
        {
          action: 'check_secret_store',
          description: 'Verify secret is available in secret store',
          automated: true,
          priority: 100
        },
        {
          action: 'request_secret_provisioning',
          description: 'Request secret provisioning from administrator',
          automated: false,
          priority: 80
        }
      ],
      [ConfigurationErrorType.CONFIG_SOURCE_UNAVAILABLE]: [
        {
          action: 'retry_config_source',
          description: 'Retry loading configuration from source',
          automated: true,
          priority: 100
        },
        {
          action: 'fallback_config_source',
          description: 'Use fallback configuration source',
          automated: true,
          priority: 90
        },
        {
          action: 'use_cached_config',
          description: 'Use cached configuration if available',
          automated: true,
          priority: 80
        }
      ],
      [ConfigurationErrorType.CONFIG_DEPENDENCY_MISSING]: [
        {
          action: 'resolve_dependencies',
          description: 'Resolve missing configuration dependencies',
          automated: true,
          priority: 100
        },
        {
          action: 'check_dependency_chain',
          description: 'Verify configuration dependency chain',
          automated: true,
          priority: 90
        }
      ],
      // Default empty arrays for other types
      [ConfigurationErrorType.ENVIRONMENT_NOT_FOUND]: [],
      [ConfigurationErrorType.CONFIG_PARSE_ERROR]: [],
      [ConfigurationErrorType.CONFIG_PERMISSION_DENIED]: [],
      [ConfigurationErrorType.CONFIG_VERSION_MISMATCH]: [],
      [ConfigurationErrorType.CONFIG_SCHEMA_INVALID]: [],
      [ConfigurationErrorType.CONFIG_OVERRIDE_CONFLICT]: []
    };

    return recoveryConfigs[errorType] || [];
  }
}

/**
 * Missing Required Configuration Error
 * Specific error for missing required configuration values
 */
export class MissingRequiredConfigError extends ConfigurationError {
  constructor(
    configKey: string,
    source: ConfigurationSource = ConfigurationSource.ENVIRONMENT_VARIABLES,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Missing required configuration: ${configKey}`,
      ConfigurationErrorType.MISSING_REQUIRED_CONFIG,
      {
        configKey,
        configSource: source,
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Invalid Configuration Value Error
 * Specific error for configuration values that fail validation
 */
export class InvalidConfigValueError extends ConfigurationError {
  constructor(
    configKey: string,
    value: any,
    expectedType: string,
    actualType: string,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Invalid configuration value for '${configKey}': expected ${expectedType}, got ${actualType}`,
      ConfigurationErrorType.INVALID_CONFIG_VALUE,
      {
        configKey,
        configValue: value,
        expectedType,
        actualType,
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: false
      }
    );
  }
}

/**
 * Configuration Validation Failed Error
 * Specific error for configuration schema validation failures
 */
export class ConfigValidationFailedError extends ConfigurationError {
  constructor(
    validationErrors: string[],
    schemaVersion?: string,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Configuration validation failed: ${validationErrors.join(', ')}`,
      ConfigurationErrorType.CONFIG_VALIDATION_FAILED,
      {
        validationErrors,
        schemaVersion,
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: false
      }
    );
  }
}

/**
 * Secret Not Available Error
 * Specific error for missing or inaccessible secrets
 */
export class SecretNotAvailableError extends ConfigurationError {
  constructor(
    secretKey: string,
    source: ConfigurationSource = ConfigurationSource.ENVIRONMENT_VARIABLES,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Secret not available: ${secretKey}`,
      ConfigurationErrorType.SECRET_NOT_AVAILABLE,
      {
        configKey: secretKey,
        configSource: source,
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.SECURITY,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Configuration Parse Error
 * Specific error for configuration file parsing failures
 */
export class ConfigParseError extends ConfigurationError {
  constructor(
    configPath: string,
    parseError: string,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Failed to parse configuration file: ${configPath} - ${parseError}`,
      ConfigurationErrorType.CONFIG_PARSE_ERROR,
      {
        configPath,
        configSource: ConfigurationSource.CONFIG_FILE,
        metadata: { parseError, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: false
      }
    );
  }
}

/**
 * Configuration Source Unavailable Error
 * Specific error for when configuration source is not accessible
 */
export class ConfigSourceUnavailableError extends ConfigurationError {
  constructor(
    source: ConfigurationSource,
    sourceDetails?: string,
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Configuration source unavailable: ${source}${sourceDetails ? ` - ${sourceDetails}` : ''}`,
      ConfigurationErrorType.CONFIG_SOURCE_UNAVAILABLE,
      {
        configSource: source,
        metadata: { sourceDetails, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Configuration Dependency Missing Error
 * Specific error for missing configuration dependencies
 */
export class ConfigDependencyMissingError extends ConfigurationError {
  constructor(
    configKey: string,
    dependencyChain: string[],
    context: Partial<ConfigurationErrorContext> = {}
  ) {
    super(
      `Configuration dependency missing for '${configKey}': ${dependencyChain.join(' -> ')}`,
      ConfigurationErrorType.CONFIG_DEPENDENCY_MISSING,
      {
        configKey,
        dependencyChain,
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Configuration Error Factory
 * Factory for creating configuration errors with consistent patterns
 */
export class ConfigurationErrorFactory {
  /**
   * Create configuration error from validation result
   */
  static fromValidationResult(
    validationResult: any,
    configKey?: string,
    context: Partial<ConfigurationErrorContext> = {}
  ): ConfigurationError {
    if (Array.isArray(validationResult.issues)) {
      const errors = validationResult.issues.map((issue: any) => issue.message);
      return new ConfigValidationFailedError(errors, undefined, context);
    }

    return new ConfigurationError(
      `Configuration validation failed${configKey ? ` for '${configKey}'` : ''}`,
      ConfigurationErrorType.CONFIG_VALIDATION_FAILED,
      {
        configKey,
        metadata: { validationResult },
        ...context
      }
    );
  }

  /**
   * Create configuration error from environment detection
   */
  static fromEnvironmentDetection(
    environmentName: string,
    expectedEnvironments: string[],
    context: Partial<ConfigurationErrorContext> = {}
  ): ConfigurationError {
    return new ConfigurationError(
      `Environment not found: '${environmentName}'. Expected one of: ${expectedEnvironments.join(', ')}`,
      ConfigurationErrorType.ENVIRONMENT_NOT_FOUND,
      {
        environmentName,
        metadata: { expectedEnvironments },
        ...context
      }
    );
  }

  /**
   * Create configuration error from type mismatch
   */
  static fromTypeMismatch(
    configKey: string,
    value: any,
    expectedType: string,
    context: Partial<ConfigurationErrorContext> = {}
  ): ConfigurationError {
    const actualType = typeof value;
    return new InvalidConfigValueError(
      configKey,
      value,
      expectedType,
      actualType,
      context
    );
  }

  /**
   * Create configuration error from missing dependency
   */
  static fromMissingDependency(
    configKey: string,
    dependentConfig: string,
    context: Partial<ConfigurationErrorContext> = {}
  ): ConfigurationError {
    return new ConfigDependencyMissingError(
      configKey,
      [dependentConfig],
      context
    );
  }
}

// Export all configuration error types
export { ConfigurationErrorType, ConfigurationSource };
export type { ConfigurationErrorContext };