/**
 * Configuration Recovery Strategy - Phase 4 Task 4.2
 * Enterprise-grade configuration error recovery with environment detection and validation
 */

import {
  BaseRecoveryStrategy,
  RecoveryContext,
  RecoveryAction,
  RecoveryStrategyType
} from '../RecoveryStrategy';

import {
  ConfigurationError,
  ConfigurationErrorType,
  MissingRequiredConfigError,
  InvalidConfigValueError,
  ConfigValidationFailedError,
  SecretNotAvailableError,
  ConfigParseError,
  ConfigSourceUnavailableError,
  ConfigDependencyMissingError
} from '../../error/ConfigurationError';

// Configuration Recovery Actions
export enum ConfigurationRecoveryAction {
  LOAD_DEFAULT_CONFIG = 'load_default_config',
  RELOAD_CONFIG_SOURCE = 'reload_config_source',
  VALIDATE_CONFIG_SCHEMA = 'validate_config_schema',
  REQUEST_MISSING_SECRET = 'request_missing_secret',
  PARSE_CONFIG_FILE = 'parse_config_file',
  DETECT_ENVIRONMENT = 'detect_environment',
  LOAD_FALLBACK_CONFIG = 'load_fallback_config',
  REPAIR_CONFIG_DEPENDENCY = 'repair_config_dependency',
  GENERATE_CONFIG_TEMPLATE = 'generate_config_template',
  VALIDATE_CONFIG_PERMISSIONS = 'validate_config_permissions',
  REFRESH_CONFIG_CACHE = 'refresh_config_cache',
  MERGE_CONFIG_SOURCES = 'merge_config_sources'
}

// Configuration Source Types
export enum ConfigurationSourceType {
  ENVIRONMENT_VARIABLES = 'environment_variables',
  CONFIG_FILE = 'config_file',
  DATABASE = 'database',
  REMOTE_SERVICE = 'remote_service',
  COMMAND_LINE = 'command_line',
  DEFAULT_VALUES = 'default_values',
  RUNTIME_OVERRIDE = 'runtime_override'
}

// Configuration Manager Interface
interface ConfigurationManager {
  loadConfiguration(source: ConfigurationSourceType): Promise<Record<string, any>>;
  validateConfiguration(config: Record<string, any>, schema?: any): Promise<boolean>;
  getDefaultConfiguration(): Promise<Record<string, any>>;
  mergeConfigurations(configs: Record<string, any>[]): Promise<Record<string, any>>;
}

// Environment Manager Interface
interface EnvironmentManager {
  detectEnvironment(): Promise<string>;
  getEnvironmentDefaults(environment: string): Promise<Record<string, any>>;
  validateEnvironmentRequirements(environment: string): Promise<boolean>;
}

// Secret Manager Interface
interface SecretManager {
  requestSecret(secretKey: string): Promise<string | null>;
  validateSecret(secretKey: string, value: string): Promise<boolean>;
  getAvailableSecrets(): Promise<string[]>;
}

/**
 * Configuration Recovery Strategy
 * Handles recovery from configuration-related errors with comprehensive environment and source management
 */
export class ConfigurationRecoveryStrategy extends BaseRecoveryStrategy<ConfigurationError> {
  private configManager?: ConfigurationManager;
  private environmentManager?: EnvironmentManager;
  private secretManager?: SecretManager;

  constructor(
    configManager?: ConfigurationManager,
    environmentManager?: EnvironmentManager,
    secretManager?: SecretManager
  ) {
    super(
      'ConfigurationRecoveryStrategy',
      RecoveryStrategyType.AUTOMATED,
      85, // High priority
      '1.0.0'
    );
    
    this.configManager = configManager;
    this.environmentManager = environmentManager;
    this.secretManager = secretManager;
  }

  /**
   * Check if strategy can handle the configuration error
   */
  canHandle(error: ConfigurationError): boolean {
    return error instanceof ConfigurationError;
  }

  /**
   * Get maximum recovery attempts for configuration errors
   */
  getMaxAttempts(): number {
    return 4;
  }

  /**
   * Get timeout for configuration recovery operations
   */
  getTimeout(): number {
    return 10000; // 10 seconds
  }

  /**
   * Get required permissions for configuration recovery
   */
  getRequiredPermissions(): string[] {
    return ['config:read', 'config:write', 'env:detect', 'secret:request'];
  }

  /**
   * Execute recovery actions based on configuration error type
   */
  async executeRecoveryActions(
    error: ConfigurationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    console.log(`[CONFIG-RECOVERY] Executing recovery for ${error.configErrorType} (attempt ${context.attemptNumber})`);

    // Execute recovery based on specific error type
    switch (error.configErrorType) {
      case ConfigurationErrorType.MISSING_REQUIRED_CONFIG:
        actions.push(...await this.handleMissingRequiredConfig(error as MissingRequiredConfigError, context));
        break;
        
      case ConfigurationErrorType.INVALID_CONFIG_VALUE:
        actions.push(...await this.handleInvalidConfigValue(error as InvalidConfigValueError, context));
        break;
        
      case ConfigurationErrorType.CONFIG_VALIDATION_FAILED:
        actions.push(...await this.handleConfigValidationFailed(error as ConfigValidationFailedError, context));
        break;
        
      case ConfigurationErrorType.SECRET_NOT_AVAILABLE:
        actions.push(...await this.handleSecretNotAvailable(error as SecretNotAvailableError, context));
        break;
        
      case ConfigurationErrorType.CONFIG_PARSE_ERROR:
        actions.push(...await this.handleConfigParseError(error as ConfigParseError, context));
        break;
        
      case ConfigurationErrorType.CONFIG_SOURCE_UNAVAILABLE:
        actions.push(...await this.handleConfigSourceUnavailable(error as ConfigSourceUnavailableError, context));
        break;
        
      case ConfigurationErrorType.CONFIG_DEPENDENCY_MISSING:
        actions.push(...await this.handleConfigDependencyMissing(error as ConfigDependencyMissingError, context));
        break;
        
      case ConfigurationErrorType.ENVIRONMENT_NOT_FOUND:
        actions.push(...await this.handleEnvironmentNotFound(error, context));
        break;
        
      default:
        actions.push(...await this.handleGenericConfigError(error, context));
        break;
    }

    return actions;
  }

  /**
   * Handle missing required configuration recovery
   */
  private async handleMissingRequiredConfig(
    error: MissingRequiredConfigError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to load default value for missing config
    const defaultAction = this.createAction(
      ConfigurationRecoveryAction.LOAD_DEFAULT_CONFIG,
      `Load default value for missing config: ${error.configContext.configKey}`,
      { configKey: error.configContext.configKey }
    );

    const executedDefault = await this.executeAction(defaultAction, async () => {
      if (this.configManager) {
        const defaultConfig = await this.configManager.getDefaultConfiguration();
        const defaultValue = defaultConfig[error.configContext.configKey!];
        
        if (defaultValue !== undefined) {
          return { 
            defaultValue,
            configKey: error.configContext.configKey,
            source: 'default_configuration'
          };
        }
      }
      
      // Try environment-specific defaults
      if (this.environmentManager) {
        const environment = await this.environmentManager.detectEnvironment();
        const envDefaults = await this.environmentManager.getEnvironmentDefaults(environment);
        const envDefault = envDefaults[error.configContext.configKey!];
        
        if (envDefault !== undefined) {
          return {
            defaultValue: envDefault,
            configKey: error.configContext.configKey,
            source: `environment_${environment}_defaults`
          };
        }
      }
      
      return { defaultValue: null, configKey: error.configContext.configKey };
    });

    actions.push(executedDefault);

    // If no default found, try to detect environment and generate appropriate config
    if (!executedDefault.success || !executedDefault.result?.defaultValue) {
      const detectAction = this.createAction(
        ConfigurationRecoveryAction.DETECT_ENVIRONMENT,
        'Detect environment and generate configuration template',
        { configKey: error.configContext.configKey }
      );

      const executedDetect = await this.executeAction(detectAction, async () => {
        if (this.environmentManager) {
          const environment = await this.environmentManager.detectEnvironment();
          const suggestions = this.generateConfigSuggestions(error.configContext.configKey!, environment);
          
          return {
            environment,
            configSuggestions: suggestions,
            templateGenerated: true
          };
        }
        
        return { environment: 'unknown', configSuggestions: [] };
      });

      actions.push(executedDetect);
    }

    return actions;
  }

  /**
   * Handle invalid configuration value recovery
   */
  private async handleInvalidConfigValue(
    error: InvalidConfigValueError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to validate and correct the configuration value
    const validateAction = this.createAction(
      ConfigurationRecoveryAction.VALIDATE_CONFIG_SCHEMA,
      `Validate and correct config value: ${error.configContext.configKey}`,
      { 
        configKey: error.configContext.configKey,
        currentValue: error.configContext.configValue,
        expectedType: error.configContext.expectedType
      }
    );

    const executedValidate = await this.executeAction(validateAction, async () => {
      const configKey = error.configContext.configKey!;
      const currentValue = error.configContext.configValue;
      const expectedType = error.configContext.expectedType;

      // Try type coercion
      let correctedValue: any = currentValue;
      let correctionApplied = false;

      if (expectedType === 'number' && typeof currentValue === 'string') {
        const numValue = Number(currentValue);
        if (!isNaN(numValue)) {
          correctedValue = numValue;
          correctionApplied = true;
        }
      } else if (expectedType === 'boolean' && typeof currentValue === 'string') {
        const boolValue = currentValue.toLowerCase();
        if (['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
          correctedValue = ['true', '1', 'yes'].includes(boolValue);
          correctionApplied = true;
        }
      } else if (expectedType === 'string' && typeof currentValue !== 'string') {
        correctedValue = String(currentValue);
        correctionApplied = true;
      }

      return {
        configKey,
        originalValue: currentValue,
        correctedValue,
        correctionApplied,
        expectedType
      };
    });

    actions.push(executedValidate);

    // If correction didn't work, try to load default
    if (!executedValidate.result?.correctionApplied) {
      const defaultAction = this.createAction(
        ConfigurationRecoveryAction.LOAD_DEFAULT_CONFIG,
        `Load default value for invalid config: ${error.configContext.configKey}`,
        { configKey: error.configContext.configKey }
      );

      const executedDefault = await this.executeAction(defaultAction, async () => {
        if (this.configManager) {
          const defaultConfig = await this.configManager.getDefaultConfiguration();
          const defaultValue = defaultConfig[error.configContext.configKey!];
          
          return {
            defaultValue,
            configKey: error.configContext.configKey,
            replaced: true
          };
        }
        
        return { defaultValue: null, replaced: false };
      });

      actions.push(executedDefault);
    }

    return actions;
  }

  /**
   * Handle configuration validation failure recovery
   */
  private async handleConfigValidationFailed(
    error: ConfigValidationFailedError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to repair configuration by merging with defaults
    const repairAction = this.createAction(
      ConfigurationRecoveryAction.MERGE_CONFIG_SOURCES,
      'Merge current configuration with defaults to fix validation',
      { 
        validationErrors: error.configContext.validationErrors,
        configSource: error.configContext.configSource
      }
    );

    const executedRepair = await this.executeAction(repairAction, async () => {
      if (this.configManager) {
        const currentConfig = error.context.metadata?.currentConfig as Record<string, any> || {};
        const defaultConfig = await this.configManager.getDefaultConfiguration();
        
        // Merge configurations with defaults taking priority for missing/invalid values
        const mergedConfig = await this.configManager.mergeConfigurations([defaultConfig, currentConfig]);
        
        // Validate merged configuration
        const isValid = await this.configManager.validateConfiguration(mergedConfig);
        
        return {
          mergedConfig,
          isValid,
          repairedKeys: Object.keys(defaultConfig).filter(key => 
            currentConfig[key] === undefined || currentConfig[key] === null
          )
        };
      }
      
      return { mergedConfig: null, isValid: false, repairedKeys: [] };
    });

    actions.push(executedRepair);

    return actions;
  }

  /**
   * Handle secret not available recovery
   */
  private async handleSecretNotAvailable(
    error: SecretNotAvailableError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to request the missing secret
    const requestAction = this.createAction(
      ConfigurationRecoveryAction.REQUEST_MISSING_SECRET,
      `Request missing secret: ${error.configContext.secretKey}`,
      { 
        secretKey: error.configContext.secretKey,
        secretType: error.configContext.secretType
      }
    );

    const executedRequest = await this.executeAction(requestAction, async () => {
      if (this.secretManager && error.configContext.secretKey) {
        const secretValue = await this.secretManager.requestSecret(error.configContext.secretKey);
        
        if (secretValue) {
          // Validate the secret if possible
          const isValid = await this.secretManager.validateSecret(
            error.configContext.secretKey,
            secretValue
          );
          
          return {
            secretKey: error.configContext.secretKey,
            secretObtained: true,
            secretValid: isValid
          };
        }
      }
      
      return {
        secretKey: error.configContext.secretKey,
        secretObtained: false,
        secretValid: false,
        requiresManualIntervention: true
      };
    });

    actions.push(executedRequest);

    return actions;
  }

  /**
   * Handle configuration parse error recovery
   */
  private async handleConfigParseError(
    error: ConfigParseError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to reload and reparse the configuration file
    const reparseAction = this.createAction(
      ConfigurationRecoveryAction.PARSE_CONFIG_FILE,
      `Reparse configuration file: ${error.configContext.configSource}`,
      { 
        configSource: error.configContext.configSource,
        parseError: error.configContext.parseError
      }
    );

    const executedReparse = await this.executeAction(reparseAction, async () => {
      if (this.configManager && error.configContext.configSource) {
        try {
          // Try to reload the configuration source
          const reloadedConfig = await this.configManager.loadConfiguration(
            error.configContext.configSource as ConfigurationSourceType
          );
          
          return {
            configSource: error.configContext.configSource,
            reloadSuccessful: true,
            reloadedConfig
          };
        } catch (reloadError) {
          // If reload fails, try fallback sources
          return {
            configSource: error.configContext.configSource,
            reloadSuccessful: false,
            reloadError: reloadError instanceof Error ? reloadError.message : String(reloadError),
            fallbackRequired: true
          };
        }
      }
      
      return { reloadSuccessful: false, fallbackRequired: true };
    });

    actions.push(executedReparse);

    // If reparse failed, try to load fallback configuration
    if (!executedReparse.result?.reloadSuccessful) {
      const fallbackAction = this.createAction(
        ConfigurationRecoveryAction.LOAD_FALLBACK_CONFIG,
        'Load fallback configuration due to parse error',
        { originalSource: error.configContext.configSource }
      );

      const executedFallback = await this.executeAction(fallbackAction, async () => {
        if (this.configManager) {
          // Try loading from environment variables as fallback
          const envConfig = await this.configManager.loadConfiguration(
            ConfigurationSourceType.ENVIRONMENT_VARIABLES
          );
          
          // Merge with defaults
          const defaultConfig = await this.configManager.getDefaultConfiguration();
          const fallbackConfig = await this.configManager.mergeConfigurations([defaultConfig, envConfig]);
          
          return {
            fallbackConfig,
            fallbackSource: 'environment_variables_with_defaults',
            fallbackSuccessful: true
          };
        }
        
        return { fallbackSuccessful: false };
      });

      actions.push(executedFallback);
    }

    return actions;
  }

  /**
   * Handle configuration source unavailable recovery
   */
  private async handleConfigSourceUnavailable(
    error: ConfigSourceUnavailableError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to reload the configuration source
    const reloadAction = this.createAction(
      ConfigurationRecoveryAction.RELOAD_CONFIG_SOURCE,
      `Reload unavailable config source: ${error.configContext.configSource}`,
      { configSource: error.configContext.configSource }
    );

    const executedReload = await this.executeAction(reloadAction, async () => {
      if (this.configManager && error.configContext.configSource) {
        try {
          const reloadedConfig = await this.configManager.loadConfiguration(
            error.configContext.configSource as ConfigurationSourceType
          );
          
          return {
            configSource: error.configContext.configSource,
            reloadSuccessful: true,
            reloadedConfig
          };
        } catch (reloadError) {
          return {
            configSource: error.configContext.configSource,
            reloadSuccessful: false,
            reloadError: reloadError instanceof Error ? reloadError.message : String(reloadError)
          };
        }
      }
      
      return { reloadSuccessful: false };
    });

    actions.push(executedReload);

    // If reload failed, use alternative sources
    if (!executedReload.result?.reloadSuccessful) {
      const alternativeAction = this.createAction(
        ConfigurationRecoveryAction.LOAD_FALLBACK_CONFIG,
        'Use alternative configuration sources',
        { unavailableSource: error.configContext.configSource }
      );

      const executedAlternative = await this.executeAction(alternativeAction, async () => {
        if (this.configManager) {
          // Try multiple fallback sources in order of preference
          const fallbackSources = [
            ConfigurationSourceType.ENVIRONMENT_VARIABLES,
            ConfigurationSourceType.DEFAULT_VALUES
          ];
          
          for (const source of fallbackSources) {
            try {
              const config = await this.configManager.loadConfiguration(source);
              return {
                alternativeSource: source,
                alternativeConfig: config,
                alternativeSuccessful: true
              };
            } catch (error) {
              continue;
            }
          }
        }
        
        return { alternativeSuccessful: false };
      });

      actions.push(executedAlternative);
    }

    return actions;
  }

  /**
   * Handle configuration dependency missing recovery
   */
  private async handleConfigDependencyMissing(
    error: ConfigDependencyMissingError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to repair the missing dependency
    const repairAction = this.createAction(
      ConfigurationRecoveryAction.REPAIR_CONFIG_DEPENDENCY,
      `Repair missing config dependency: ${error.configContext.dependencyName}`,
      { 
        dependencyName: error.configContext.dependencyName,
        configKey: error.configContext.configKey
      }
    );

    const executedRepair = await this.executeAction(repairAction, async () => {
      const dependencyName = error.configContext.dependencyName;
      const configKey = error.configContext.configKey;
      
      // Try to provide default value for the dependency
      const dependencyDefaults: Record<string, any> = {
        'DATABASE_URL': 'sqlite:///tmp/fallback.db',
        'REDIS_URL': 'redis://localhost:6379',
        'API_BASE_URL': 'http://localhost:3000',
        'SESSION_SECRET': 'fallback-session-secret-' + Math.random().toString(36)
      };
      
      const defaultValue = dependencyDefaults[dependencyName!];
      
      if (defaultValue) {
        return {
          dependencyName,
          configKey,
          defaultValue,
          dependencyRepaired: true,
          fallbackUsed: true
        };
      }
      
      return {
        dependencyName,
        configKey,
        dependencyRepaired: false,
        requiresManualConfig: true
      };
    });

    actions.push(executedRepair);

    return actions;
  }

  /**
   * Handle environment not found recovery
   */
  private async handleEnvironmentNotFound(
    error: ConfigurationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to detect the environment
    const detectAction = this.createAction(
      ConfigurationRecoveryAction.DETECT_ENVIRONMENT,
      'Detect and configure environment',
      { currentEnvironment: error.context.metadata?.environment }
    );

    const executedDetect = await this.executeAction(detectAction, async () => {
      if (this.environmentManager) {
        const detectedEnvironment = await this.environmentManager.detectEnvironment();
        const environmentDefaults = await this.environmentManager.getEnvironmentDefaults(detectedEnvironment);
        
        return {
          detectedEnvironment,
          environmentDefaults,
          detectionSuccessful: true
        };
      }
      
      // Fallback environment detection
      const nodeEnv = process.env.NODE_ENV || 'development';
      const fallbackDefaults = this.getFallbackEnvironmentDefaults(nodeEnv);
      
      return {
        detectedEnvironment: nodeEnv,
        environmentDefaults: fallbackDefaults,
        detectionSuccessful: true,
        fallbackDetection: true
      };
    });

    actions.push(executedDetect);

    return actions;
  }

  /**
   * Handle generic configuration error recovery
   */
  private async handleGenericConfigError(
    error: ConfigurationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to refresh configuration cache and reload
    const refreshAction = this.createAction(
      ConfigurationRecoveryAction.REFRESH_CONFIG_CACHE,
      'Refresh configuration cache and reload',
      { errorType: error.configErrorType }
    );

    const executedRefresh = await this.executeAction(refreshAction, async () => {
      if (this.configManager) {
        // Try to reload all configuration sources
        const sources = [
          ConfigurationSourceType.ENVIRONMENT_VARIABLES,
          ConfigurationSourceType.DEFAULT_VALUES
        ];
        
        const configs: Record<string, any>[] = [];
        
        for (const source of sources) {
          try {
            const config = await this.configManager.loadConfiguration(source);
            configs.push(config);
          } catch (error) {
            console.warn(`Failed to load config from ${source}:`, error);
          }
        }
        
        if (configs.length > 0) {
          const mergedConfig = await this.configManager.mergeConfigurations(configs);
          return {
            refreshSuccessful: true,
            mergedConfig,
            sourcesLoaded: configs.length
          };
        }
      }
      
      return { refreshSuccessful: false, sourcesLoaded: 0 };
    });

    actions.push(executedRefresh);

    return actions;
  }

  /**
   * Generate configuration suggestions based on environment
   */
  private generateConfigSuggestions(configKey: string, environment: string): string[] {
    const suggestions: string[] = [];
    
    const commonSuggestions: Record<string, string[]> = {
      'DATABASE_URL': [
        'Set DATABASE_URL environment variable with your database connection string',
        'Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname'
      ],
      'ISSUER_URL': [
        'Set ISSUER_URL environment variable with your OAuth provider URL',
        'Example: ISSUER_URL=https://your-auth-provider.com'
      ],
      'SESSION_SECRET': [
        'Set SESSION_SECRET environment variable with a secure random string',
        'Generate with: openssl rand -hex 32'
      ],
      'API_KEY': [
        'Set API_KEY environment variable with your API key',
        'Obtain from your service provider dashboard'
      ]
    };
    
    const envSpecificSuggestions: Record<string, Record<string, string[]>> = {
      'development': {
        'DATABASE_URL': ['Consider using sqlite:///tmp/dev.db for development'],
        'ISSUER_URL': ['Use localhost URL for development testing']
      },
      'production': {
        'DATABASE_URL': ['Use secure production database URL'],
        'ISSUER_URL': ['Use production OAuth provider URL']
      }
    };
    
    // Add common suggestions
    if (commonSuggestions[configKey]) {
      suggestions.push(...commonSuggestions[configKey]);
    }
    
    // Add environment-specific suggestions
    if (envSpecificSuggestions[environment]?.[configKey]) {
      suggestions.push(...envSpecificSuggestions[environment][configKey]);
    }
    
    return suggestions;
  }

  /**
   * Get fallback environment defaults
   */
  private getFallbackEnvironmentDefaults(environment: string): Record<string, any> {
    const defaults: Record<string, Record<string, any>> = {
      'development': {
        'NODE_ENV': 'development',
        'LOG_LEVEL': 'debug',
        'SESSION_SECRET': 'dev-session-secret-' + Math.random().toString(36)
      },
      'production': {
        'NODE_ENV': 'production',
        'LOG_LEVEL': 'info'
      },
      'test': {
        'NODE_ENV': 'test',
        'LOG_LEVEL': 'error',
        'SESSION_SECRET': 'test-session-secret'
      }
    };
    
    return defaults[environment] || defaults['development'];
  }

  /**
   * Estimate recovery time based on error type
   */
  estimateRecoveryTime(error: ConfigurationError): number {
    switch (error.configErrorType) {
      case ConfigurationErrorType.MISSING_REQUIRED_CONFIG:
        return 1000; // 1 second for loading defaults
      case ConfigurationErrorType.INVALID_CONFIG_VALUE:
        return 500; // 0.5 seconds for type coercion
      case ConfigurationErrorType.CONFIG_VALIDATION_FAILED:
        return 2000; // 2 seconds for validation and repair
      case ConfigurationErrorType.SECRET_NOT_AVAILABLE:
        return 5000; // 5 seconds for secret request
      case ConfigurationErrorType.CONFIG_PARSE_ERROR:
        return 3000; // 3 seconds for reparse attempts
      case ConfigurationErrorType.CONFIG_SOURCE_UNAVAILABLE:
        return 4000; // 4 seconds for source reload
      case ConfigurationErrorType.CONFIG_DEPENDENCY_MISSING:
        return 2000; // 2 seconds for dependency repair
      default:
        return 3000; // 3 seconds default
    }
  }
}

// Export configuration recovery strategy and types
export { 
  ConfigurationRecoveryAction,
  ConfigurationSourceType
};