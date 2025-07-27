/**
 * Configuration Aspects - Enterprise AOP Implementation
 * Cross-cutting concerns for configuration loading and management
 */

import { ValidationError } from '../domain/Hostname';
import { Environment } from '../domain/Environment';
import { ValidationResult } from '../domain/AuthenticationStrategy';
import {
  IConfigurationAspect,
  AuthenticationConfiguration,
  ConfigurationError
} from './ConfigurationSource';

// Structured Logger Interface
export interface IStructuredLogger {
  debug(message: string, context?: Record<string, any>): Promise<void>;
  info(message: string, context?: Record<string, any>): Promise<void>;
  warn(message: string, context?: Record<string, any>): Promise<void>;
  error(message: string, context?: Record<string, any>): Promise<void>;
  logSecure(level: string, data: Record<string, any>): Promise<void>;
}

// Performance Monitor Interface
export interface IPerformanceMonitor {
  recordMetric(metric: {
    name: string;
    value: number;
    tags?: Record<string, string>;
    timestamp?: Date;
  }): Promise<void>;
  
  startTimer(operation: string): string;
  endTimer(timerId: string): Promise<number>;
  
  recordConfigurationLoad(
    environment: string,
    duration: number,
    success: boolean,
    size?: number
  ): Promise<void>;
}

// Security Monitor Interface
export interface ISecurityMonitor {
  recordConfigurationAccess(
    environment: string,
    source: string,
    sensitiveFields: string[]
  ): Promise<void>;
  
  validateSecurityRequirements(
    configuration: AuthenticationConfiguration
  ): Promise<ValidationResult>;
  
  auditConfigurationChange(
    before: AuthenticationConfiguration | null,
    after: AuthenticationConfiguration,
    source: string
  ): Promise<void>;
}

// Configuration Logging Aspect
export class ConfigurationLoggingAspect implements IConfigurationAspect {
  private readonly logger: IStructuredLogger;
  private readonly includeConfigDetails: boolean;

  constructor(logger: IStructuredLogger, includeConfigDetails: boolean = false) {
    this.logger = logger;
    this.includeConfigDetails = includeConfigDetails;
  }

  async beforeLoad(environment: Environment, source: string): Promise<void> {
    await this.logger.info('Configuration loading started', {
      environment: environment.toString(),
      source,
      timestamp: new Date().toISOString()
    });
  }

  async afterLoad(
    environment: Environment,
    configuration: AuthenticationConfiguration,
    loadTimeMs: number
  ): Promise<void> {
    const context: Record<string, any> = {
      environment: environment.toString(),
      loadTimeMs,
      strategiesCount: configuration.strategies.length,
      mappingsCount: configuration.mappings.length,
      domainsCount: configuration.domains.length,
      securityLevel: this.getHighestSecurityLevel(configuration),
      timestamp: new Date().toISOString()
    };

    if (this.includeConfigDetails && environment.allowsDebugFeatures()) {
      context.domains = configuration.domains;
      context.securityConfig = {
        enforceHTTPS: configuration.security.enforceHTTPS,
        corsEnabled: configuration.security.corsEnabled,
        csrfProtection: configuration.security.csrfProtection
      };
      context.monitoringConfig = {
        enableMetrics: configuration.monitoring.enableMetrics,
        logLevel: configuration.monitoring.logLevel,
        alertingEnabled: configuration.monitoring.alerting.enabled
      };
    }

    await this.logger.info('Configuration loaded successfully', context);
  }

  async onLoadError(
    environment: Environment,
    error: ConfigurationError,
    source: string
  ): Promise<void> {
    await this.logger.error('Configuration loading failed', {
      environment: environment.toString(),
      source,
      errorCode: error.code,
      errorMessage: error.message,
      errorContext: error.context,
      timestamp: new Date().toISOString()
    });
  }

  async beforeValidation(configuration: AuthenticationConfiguration): Promise<void> {
    await this.logger.debug('Configuration validation started', {
      environment: configuration.environment.toString(),
      componentsToValidate: [
        'domains',
        'strategies', 
        'mappings',
        'security',
        'monitoring'
      ]
    });
  }

  async afterValidation(
    configuration: AuthenticationConfiguration,
    result: ValidationResult
  ): Promise<void> {
    if (result.isValid) {
      await this.logger.info('Configuration validation passed', {
        environment: configuration.environment.toString(),
        validationSuccess: true
      });
    } else {
      await this.logger.warn('Configuration validation failed', {
        environment: configuration.environment.toString(),
        validationSuccess: false,
        errorCount: result.errors.length,
        errors: result.errors.map(e => ({
          message: e.message,
          field: e.field
        }))
      });
    }
  }

  private getHighestSecurityLevel(configuration: AuthenticationConfiguration): string {
    const levels = configuration.strategies.map(s => s.securityLevel);
    
    if (levels.includes('strict')) return 'strict';
    if (levels.includes('enhanced')) return 'enhanced';
    if (levels.includes('standard')) return 'standard';
    return 'basic';
  }
}

// Configuration Performance Aspect
export class ConfigurationPerformanceAspect implements IConfigurationAspect {
  private readonly performanceMonitor: IPerformanceMonitor;
  private readonly loadTimers: Map<string, string> = new Map();

  constructor(performanceMonitor: IPerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  async beforeLoad(environment: Environment, source: string): Promise<void> {
    const timerId = this.performanceMonitor.startTimer('config-load');
    this.loadTimers.set(environment.toString(), timerId);

    await this.performanceMonitor.recordMetric({
      name: 'config.load.started',
      value: 1,
      tags: {
        environment: environment.toString(),
        source
      }
    });
  }

  async afterLoad(
    environment: Environment,
    configuration: AuthenticationConfiguration,
    loadTimeMs: number
  ): Promise<void> {
    const timerId = this.loadTimers.get(environment.toString());
    if (timerId) {
      await this.performanceMonitor.endTimer(timerId);
      this.loadTimers.delete(environment.toString());
    }

    await this.performanceMonitor.recordConfigurationLoad(
      environment.toString(),
      loadTimeMs,
      true,
      this.calculateConfigurationSize(configuration)
    );

    await this.performanceMonitor.recordMetric({
      name: 'config.load.duration',
      value: loadTimeMs,
      tags: {
        environment: environment.toString(),
        success: 'true'
      }
    });

    // Performance alerting
    if (loadTimeMs > 5000) { // 5 seconds
      await this.performanceMonitor.recordMetric({
        name: 'config.load.slow',
        value: 1,
        tags: {
          environment: environment.toString(),
          duration: loadTimeMs.toString()
        }
      });
    }
  }

  async onLoadError(
    environment: Environment,
    error: ConfigurationError,
    source: string
  ): Promise<void> {
    const timerId = this.loadTimers.get(environment.toString());
    if (timerId) {
      const duration = await this.performanceMonitor.endTimer(timerId);
      this.loadTimers.delete(environment.toString());

      await this.performanceMonitor.recordConfigurationLoad(
        environment.toString(),
        duration,
        false
      );
    }

    await this.performanceMonitor.recordMetric({
      name: 'config.load.error',
      value: 1,
      tags: {
        environment: environment.toString(),
        errorCode: error.code,
        source
      }
    });
  }

  async beforeValidation(configuration: AuthenticationConfiguration): Promise<void> {
    const timerId = this.performanceMonitor.startTimer('config-validation');
    this.loadTimers.set(`validation-${configuration.environment.toString()}`, timerId);
  }

  async afterValidation(
    configuration: AuthenticationConfiguration,
    result: ValidationResult
  ): Promise<void> {
    const timerId = this.loadTimers.get(`validation-${configuration.environment.toString()}`);
    if (timerId) {
      const duration = await this.performanceMonitor.endTimer(timerId);
      this.loadTimers.delete(`validation-${configuration.environment.toString()}`);

      await this.performanceMonitor.recordMetric({
        name: 'config.validation.duration',
        value: duration,
        tags: {
          environment: configuration.environment.toString(),
          success: result.isValid.toString(),
          errorCount: result.errors.length.toString()
        }
      });
    }
  }

  private calculateConfigurationSize(configuration: AuthenticationConfiguration): number {
    return JSON.stringify(configuration).length;
  }
}

// Configuration Security Aspect
export class ConfigurationSecurityAspect implements IConfigurationAspect {
  private readonly securityMonitor: ISecurityMonitor;
  private readonly sensitiveFields = [
    'SESSION_SECRET',
    'DATABASE_URL',
    'CLIENT_SECRET',
    'PRIVATE_KEY',
    'API_KEY'
  ];

  constructor(securityMonitor: ISecurityMonitor) {
    this.securityMonitor = securityMonitor;
  }

  async beforeLoad(environment: Environment, source: string): Promise<void> {
    // Record configuration access for audit
    await this.securityMonitor.recordConfigurationAccess(
      environment.toString(),
      source,
      this.getSensitiveFieldsInEnvironment()
    );

    // Security validation for production environments
    if (environment.requiresStrictSecurity()) {
      await this.validateProductionSecurityRequirements();
    }
  }

  async afterLoad(
    environment: Environment,
    configuration: AuthenticationConfiguration,
    loadTimeMs: number
  ): Promise<void> {
    // Validate security requirements
    const securityValidation = await this.securityMonitor.validateSecurityRequirements(configuration);
    
    if (!securityValidation.isValid) {
      throw new ConfigurationError(
        `Security validation failed: ${securityValidation.errors.map(e => e.message).join(', ')}`,
        'SECURITY_VALIDATION_ERROR',
        { 
          environment: environment.toString(),
          securityErrors: securityValidation.errors 
        }
      );
    }

    // Audit configuration loading
    await this.securityMonitor.auditConfigurationChange(
      null, // No previous config for load operation
      configuration,
      'environment-load'
    );
  }

  async onLoadError(
    environment: Environment,
    error: ConfigurationError,
    source: string
  ): Promise<void> {
    // Security incident logging for configuration failures
    if (error.code === 'ENV_VAR_ERROR' || error.code === 'SECURITY_VALIDATION_ERROR') {
      await this.securityMonitor.recordConfigurationAccess(
        environment.toString(),
        source,
        ['SECURITY_FAILURE']
      );
    }
  }

  async beforeValidation(configuration: AuthenticationConfiguration): Promise<void> {
    // Pre-validation security checks
    if (configuration.environment.requiresStrictSecurity()) {
      await this.validateStrictSecurityConfiguration(configuration);
    }
  }

  async afterValidation(
    configuration: AuthenticationConfiguration,
    result: ValidationResult
  ): Promise<void> {
    // Post-validation security audit
    if (result.isValid) {
      await this.securityMonitor.auditConfigurationChange(
        null,
        configuration,
        'validation-passed'
      );
    }
  }

  private getSensitiveFieldsInEnvironment(): string[] {
    return this.sensitiveFields.filter(field => 
      process.env[field] !== undefined
    );
  }

  private async validateProductionSecurityRequirements(): Promise<void> {
    const errors: string[] = [];

    // Check for development indicators in production
    if (process.env.NODE_ENV !== 'production') {
      errors.push('NODE_ENV must be set to "production" in production environment');
    }

    // Check for secure session secret
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || sessionSecret.length < 64) {
      errors.push('SESSION_SECRET must be at least 64 characters in production');
    }

    // Check for HTTPS enforcement
    if (process.env.FORCE_HTTPS !== 'true') {
      errors.push('HTTPS must be enforced in production (FORCE_HTTPS=true)');
    }

    if (errors.length > 0) {
      throw new ConfigurationError(
        'Production security requirements not met',
        'PRODUCTION_SECURITY_ERROR',
        { securityViolations: errors }
      );
    }
  }

  private async validateStrictSecurityConfiguration(
    configuration: AuthenticationConfiguration
  ): Promise<void> {
    const errors: string[] = [];

    // Validate HTTPS enforcement
    if (!configuration.security.enforceHTTPS) {
      errors.push('HTTPS enforcement required in strict security mode');
    }

    // Validate CSRF protection
    if (!configuration.security.csrfProtection) {
      errors.push('CSRF protection required in strict security mode');
    }

    // Validate callback URLs
    for (const strategy of configuration.strategies) {
      if (!strategy.callbackURL.startsWith('https://')) {
        errors.push(`Strategy callback URL must use HTTPS: ${strategy.callbackURL}`);
      }
    }

    // Validate security levels
    const insecureStrategies = configuration.strategies.filter(s => 
      s.securityLevel === 'basic' || s.securityLevel === 'standard'
    );
    
    if (insecureStrategies.length > 0) {
      errors.push('All strategies must use enhanced or strict security level in production');
    }

    if (errors.length > 0) {
      throw new ConfigurationError(
        'Strict security validation failed',
        'STRICT_SECURITY_ERROR',
        { securityViolations: errors }
      );
    }
  }
}

// Configuration Validation Aspect
export class ConfigurationValidationAspect implements IConfigurationAspect {
  private readonly strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  async beforeLoad(environment: Environment, source: string): Promise<void> {
    // Pre-load validation
    await this.validateEnvironmentVariables(environment);
  }

  async afterLoad(
    environment: Environment,
    configuration: AuthenticationConfiguration,
    loadTimeMs: number
  ): Promise<void> {
    // Post-load validation
    await this.validateConfigurationIntegrity(configuration);
    
    if (this.strictMode) {
      await this.validateStrictModeRequirements(configuration);
    }
  }

  async onLoadError(
    environment: Environment,
    error: ConfigurationError,
    source: string
  ): Promise<void> {
    // Error validation and enhancement
    if (error.code === 'CONFIG_VALIDATION_ERROR') {
      await this.enhanceValidationError(error, environment);
    }
  }

  async beforeValidation(configuration: AuthenticationConfiguration): Promise<void> {
    // Pre-validation checks
    await this.validateConfigurationStructure(configuration);
  }

  async afterValidation(
    configuration: AuthenticationConfiguration,
    result: ValidationResult
  ): Promise<void> {
    // Post-validation processing
    if (!result.isValid && this.strictMode) {
      throw new ConfigurationError(
        'Strict validation mode: Configuration must be error-free',
        'STRICT_VALIDATION_ERROR',
        { 
          validationErrors: result.errors.map(e => e.message),
          environment: configuration.environment.toString()
        }
      );
    }
  }

  private async validateEnvironmentVariables(environment: Environment): Promise<void> {
    const requiredVars = ['REPLIT_DOMAINS', 'SESSION_SECRET', 'REPL_ID', 'ISSUER_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables: ${missingVars.join(', ')}`,
        'ENV_VAR_MISSING',
        { missingVariables: missingVars, environment: environment.toString() }
      );
    }
  }

  private async validateConfigurationIntegrity(
    configuration: AuthenticationConfiguration
  ): Promise<void> {
    // Validate cross-references
    const strategyNames = new Set(configuration.strategies.map(s => `replitauth:${s.clientId}`));
    const mappingStrategies = new Set(configuration.mappings.map(m => m.strategyName));
    
    const orphanedMappings = [...mappingStrategies].filter(name => !strategyNames.has(name));
    if (orphanedMappings.length > 0) {
      throw new ConfigurationError(
        `Orphaned hostname mappings found: ${orphanedMappings.join(', ')}`,
        'ORPHANED_MAPPINGS',
        { orphanedMappings, environment: configuration.environment.toString() }
      );
    }
  }

  private async validateStrictModeRequirements(
    configuration: AuthenticationConfiguration
  ): Promise<void> {
    const errors: string[] = [];

    // Validate minimum domain count
    if (configuration.domains.length < 1) {
      errors.push('At least one domain must be configured in strict mode');
    }

    // Validate strategy configuration completeness
    for (const strategy of configuration.strategies) {
      if (!strategy.scope || strategy.scope.length === 0) {
        errors.push(`Strategy ${strategy.clientId} must have defined scope in strict mode`);
      }
    }

    // Validate monitoring configuration
    if (!configuration.monitoring.enableMetrics) {
      errors.push('Metrics must be enabled in strict mode');
    }

    if (errors.length > 0) {
      throw new ConfigurationError(
        'Strict mode validation failed',
        'STRICT_MODE_ERROR',
        { strictModeViolations: errors }
      );
    }
  }

  private async validateConfigurationStructure(
    configuration: AuthenticationConfiguration
  ): Promise<void> {
    if (!configuration.environment) {
      throw new ConfigurationError(
        'Configuration missing environment',
        'STRUCTURE_ERROR'
      );
    }

    if (!Array.isArray(configuration.domains)) {
      throw new ConfigurationError(
        'Configuration domains must be an array',
        'STRUCTURE_ERROR'
      );
    }

    if (!Array.isArray(configuration.strategies)) {
      throw new ConfigurationError(
        'Configuration strategies must be an array',
        'STRUCTURE_ERROR'
      );
    }

    if (!Array.isArray(configuration.mappings)) {
      throw new ConfigurationError(
        'Configuration mappings must be an array',
        'STRUCTURE_ERROR'
      );
    }
  }

  private async enhanceValidationError(
    error: ConfigurationError,
    environment: Environment
  ): Promise<void> {
    // Add environment-specific error context
    if (error.context) {
      error.context.environment = environment.toString();
      error.context.enhancedAt = new Date().toISOString();
    }
  }
}