/**
 * EnvironmentConfigurationSource - Enterprise AOP Implementation
 * Complete environment variable-based configuration with aspect-oriented programming
 */

import { z } from 'zod';
import { ValidationError, Result } from '../domain/Hostname';
import { Environment, EnvironmentType } from '../domain/Environment';
import { ValidationResult } from '../domain/AuthenticationStrategy';
import {
  BaseConfigurationSource,
  AuthenticationConfiguration,
  StrategyConfiguration,
  HostnameMappingConfiguration,
  SecurityConfiguration,
  MonitoringConfiguration,
  ConfigurationError,
  EnvironmentVariableError,
  ConfigurationValidationError,
  IConfigurationAspect,
  IConfigurationCache
} from './ConfigurationSource';

// Environment Variable Schema Definitions
const RequiredEnvironmentSchema = z.object({
  REPLIT_DOMAINS: z.string().min(1, 'REPLIT_DOMAINS is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  REPL_ID: z.string().min(1, 'REPL_ID is required'),
  ISSUER_URL: z.string().url('ISSUER_URL must be a valid URL')
});

const OptionalEnvironmentSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  ENABLE_METRICS: z.string().optional(),
  SESSION_TIMEOUT: z.string().optional(),
  MAX_RETRY_ATTEMPTS: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  CSRF_PROTECTION: z.string().optional(),
  RATE_LIMIT_WINDOW: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  HEALTH_CHECK_INTERVAL: z.string().optional(),
  ALERT_ERROR_RATE_THRESHOLD: z.string().optional(),
  ALERT_RESPONSE_TIME_THRESHOLD: z.string().optional(),
  TRACING_ENABLED: z.string().optional(),
  TRACING_SAMPLE_RATE: z.string().optional()
});

// Configuration Parsing Result
interface ParsedEnvironmentConfig {
  required: z.infer<typeof RequiredEnvironmentSchema>;
  optional: z.infer<typeof OptionalEnvironmentSchema>;
}

// Configuration Defaults by Environment
class ConfigurationDefaults {
  static getForEnvironment(environment: Environment): Record<string, string> {
    const common = {
      LOG_LEVEL: 'info',
      SESSION_TIMEOUT: '86400000', // 24 hours
      MAX_RETRY_ATTEMPTS: '3',
      RATE_LIMIT_WINDOW: '900000', // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: '100',
      HEALTH_CHECK_INTERVAL: '30000', // 30 seconds
      ALERT_ERROR_RATE_THRESHOLD: '0.05', // 5%
      ALERT_RESPONSE_TIME_THRESHOLD: '5000', // 5 seconds
      TRACING_SAMPLE_RATE: '0.1' // 10%
    };

    switch (environment.getType()) {
      case EnvironmentType.DEVELOPMENT:
        return {
          ...common,
          LOG_LEVEL: 'debug',
          ENABLE_METRICS: 'false',
          CORS_ORIGINS: 'http://localhost:*',
          CSRF_PROTECTION: 'false',
          TRACING_ENABLED: 'false'
        };

      case EnvironmentType.STAGING:
        return {
          ...common,
          LOG_LEVEL: 'info',
          ENABLE_METRICS: 'true',
          CSRF_PROTECTION: 'true',
          TRACING_ENABLED: 'true'
        };

      case EnvironmentType.PRODUCTION:
        return {
          ...common,
          LOG_LEVEL: 'warn',
          ENABLE_METRICS: 'true',
          CSRF_PROTECTION: 'true',
          TRACING_ENABLED: 'true',
          RATE_LIMIT_MAX_REQUESTS: '50' // Stricter in production
        };

      case EnvironmentType.TEST:
        return {
          ...common,
          LOG_LEVEL: 'error',
          ENABLE_METRICS: 'false',
          CSRF_PROTECTION: 'false',
          TRACING_ENABLED: 'false',
          SESSION_TIMEOUT: '3600000' // 1 hour for tests
        };

      default:
        return common;
    }
  }
}

// Configuration Transformation Utilities
class ConfigurationTransformer {
  /**
   * Transform environment variables to typed configuration
   */
  static async transformToConfiguration(
    parsed: ParsedEnvironmentConfig,
    environment: Environment
  ): Promise<Result<AuthenticationConfiguration, ConfigurationError>> {
    try {
      const defaults = ConfigurationDefaults.getForEnvironment(environment);
      
      // Parse domains
      const domains = this.parseDomains(parsed.required.REPLIT_DOMAINS);
      
      // Create strategy configurations
      const strategies = await this.createStrategyConfigurations(parsed, environment, domains);
      
      // Create hostname mappings
      const mappings = this.createHostnameMappings(domains, environment);
      
      // Create security configuration
      const security = this.createSecurityConfiguration(parsed, defaults, environment);
      
      // Create monitoring configuration
      const monitoring = this.createMonitoringConfiguration(parsed, defaults, environment);

      const configuration: AuthenticationConfiguration = {
        environment,
        domains,
        strategies,
        mappings,
        security,
        monitoring
      };

      return Result.ok(configuration);
    } catch (error) {
      return Result.error(new ConfigurationError(
        `Configuration transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  private static parseDomains(domainsString: string): string[] {
    return domainsString
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
  }

  private static async createStrategyConfigurations(
    parsed: ParsedEnvironmentConfig,
    environment: Environment,
    domains: string[]
  ): Promise<StrategyConfiguration[]> {
    const strategies: StrategyConfiguration[] = [];

    for (const domain of domains) {
      const strategy: StrategyConfiguration = {
        scope: ['openid', 'email', 'profile'],
        callbackURL: this.generateCallbackURL(domain, environment),
        clientId: domain, // Use domain as client ID for Replit Auth
        issuerURL: parsed.required.ISSUER_URL,
        timeout: 30000,
        retryAttempts: parseInt(parsed.optional.MAX_RETRY_ATTEMPTS || '3'),
        securityLevel: this.determineSecurityLevel(environment)
      };

      strategies.push(strategy);
    }

    return strategies;
  }

  private static generateCallbackURL(domain: string, environment: Environment): string {
    const protocol = environment.requiresStrictSecurity() ? 'https' : 'http';
    return `${protocol}://${domain}/auth/callback`;
  }

  private static determineSecurityLevel(environment: Environment): 'basic' | 'standard' | 'enhanced' | 'strict' {
    switch (environment.getType()) {
      case EnvironmentType.PRODUCTION:
        return 'strict';
      case EnvironmentType.STAGING:
        return 'enhanced';
      case EnvironmentType.DEVELOPMENT:
        return 'standard';
      case EnvironmentType.TEST:
        return 'basic';
      default:
        return 'standard';
    }
  }

  private static createHostnameMappings(
    domains: string[],
    environment: Environment
  ): HostnameMappingConfiguration[] {
    const mappings: HostnameMappingConfiguration[] = [];

    domains.forEach((domain, index) => {
      mappings.push({
        hostname: domain,
        strategyName: `replitauth:${domain}`,
        environment: environment.toString(),
        priority: 100 - index // Higher priority for first domains
      });
    });

    // Add development-specific mappings
    if (environment.isDevelopment()) {
      mappings.push(
        {
          hostname: 'localhost',
          strategyName: `replitauth:${domains[0]}`, // Map to first domain
          environment: environment.toString(),
          priority: 50
        },
        {
          hostname: '127.0.0.1',
          strategyName: `replitauth:${domains[0]}`,
          environment: environment.toString(),
          priority: 49
        }
      );
    }

    return mappings;
  }

  private static createSecurityConfiguration(
    parsed: ParsedEnvironmentConfig,
    defaults: Record<string, string>,
    environment: Environment
  ): SecurityConfiguration {
    return {
      enforceHTTPS: environment.requiresStrictSecurity(),
      allowedOrigins: this.parseOrigins(parsed.optional.CORS_ORIGINS || defaults.CORS_ORIGINS || ''),
      sessionTimeout: parseInt(parsed.optional.SESSION_TIMEOUT || defaults.SESSION_TIMEOUT),
      maxRetryAttempts: parseInt(parsed.optional.MAX_RETRY_ATTEMPTS || defaults.MAX_RETRY_ATTEMPTS),
      rateLimiting: {
        windowMs: parseInt(parsed.optional.RATE_LIMIT_WINDOW || defaults.RATE_LIMIT_WINDOW),
        maxRequests: parseInt(parsed.optional.RATE_LIMIT_MAX_REQUESTS || defaults.RATE_LIMIT_MAX_REQUESTS)
      },
      csrfProtection: this.parseBoolean(parsed.optional.CSRF_PROTECTION || defaults.CSRF_PROTECTION || 'false'),
      corsEnabled: !!(parsed.optional.CORS_ORIGINS || defaults.CORS_ORIGINS)
    };
  }

  private static createMonitoringConfiguration(
    parsed: ParsedEnvironmentConfig,
    defaults: Record<string, string>,
    environment: Environment
  ): MonitoringConfiguration {
    return {
      enableMetrics: this.parseBoolean(parsed.optional.ENABLE_METRICS || defaults.ENABLE_METRICS || 'false'),
      logLevel: (parsed.optional.LOG_LEVEL || defaults.LOG_LEVEL) as 'debug' | 'info' | 'warn' | 'error',
      alerting: {
        enabled: environment.requiresStrictSecurity(),
        thresholds: {
          errorRate: parseFloat(parsed.optional.ALERT_ERROR_RATE_THRESHOLD || defaults.ALERT_ERROR_RATE_THRESHOLD),
          responseTime: parseInt(parsed.optional.ALERT_RESPONSE_TIME_THRESHOLD || defaults.ALERT_RESPONSE_TIME_THRESHOLD),
          memoryUsage: 0.85, // 85%
          cpuUsage: 0.80 // 80%
        }
      },
      tracing: {
        enabled: this.parseBoolean(parsed.optional.TRACING_ENABLED || defaults.TRACING_ENABLED || 'false'),
        sampleRate: parseFloat(parsed.optional.TRACING_SAMPLE_RATE || defaults.TRACING_SAMPLE_RATE)
      },
      healthChecks: {
        enabled: true,
        interval: parseInt(parsed.optional.HEALTH_CHECK_INTERVAL || defaults.HEALTH_CHECK_INTERVAL),
        timeout: 5000
      }
    };
  }

  private static parseOrigins(originsString: string): string[] {
    if (!originsString) return [];
    
    return originsString
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
  }

  private static parseBoolean(value: string): boolean {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
}

// Configuration Validator
class ConfigurationValidator {
  /**
   * Validate complete configuration
   */
  static async validateConfiguration(
    configuration: AuthenticationConfiguration
  ): Promise<ValidationResult> {
    const validationResults = await Promise.all([
      this.validateDomains(configuration.domains),
      this.validateStrategies(configuration.strategies),
      this.validateMappings(configuration.mappings),
      this.validateSecurity(configuration.security, configuration.environment),
      this.validateMonitoring(configuration.monitoring)
    ]);

    return ValidationResult.combine(validationResults);
  }

  private static async validateDomains(domains: string[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (domains.length === 0) {
      errors.push(new ValidationError('At least one domain must be configured'));
    }

    for (const domain of domains) {
      if (!domain || domain.trim().length === 0) {
        errors.push(new ValidationError('Domain cannot be empty'));
        continue;
      }

      // Basic domain format validation
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
      if (!domainPattern.test(domain.trim())) {
        errors.push(new ValidationError(`Invalid domain format: ${domain}`));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  private static async validateStrategies(strategies: StrategyConfiguration[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (strategies.length === 0) {
      errors.push(new ValidationError('At least one strategy must be configured'));
    }

    for (const strategy of strategies) {
      if (!strategy.scope || strategy.scope.length === 0) {
        errors.push(new ValidationError('Strategy scope cannot be empty'));
      }

      if (!strategy.callbackURL) {
        errors.push(new ValidationError('Strategy callback URL is required'));
      }

      if (!strategy.clientId) {
        errors.push(new ValidationError('Strategy client ID is required'));
      }

      if (!strategy.issuerURL) {
        errors.push(new ValidationError('Strategy issuer URL is required'));
      }

      if (strategy.timeout < 1000 || strategy.timeout > 300000) {
        errors.push(new ValidationError('Strategy timeout must be between 1000ms and 300000ms'));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  private static async validateMappings(mappings: HostnameMappingConfiguration[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (mappings.length === 0) {
      errors.push(new ValidationError('At least one hostname mapping must be configured'));
    }

    const hostnames = new Set<string>();
    for (const mapping of mappings) {
      if (hostnames.has(mapping.hostname)) {
        errors.push(new ValidationError(`Duplicate hostname mapping: ${mapping.hostname}`));
      }
      hostnames.add(mapping.hostname);

      if (mapping.priority < 0 || mapping.priority > 100) {
        errors.push(new ValidationError('Hostname mapping priority must be between 0 and 100'));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  private static async validateSecurity(
    security: SecurityConfiguration,
    environment: Environment
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (environment.requiresStrictSecurity() && !security.enforceHTTPS) {
      errors.push(new ValidationError('HTTPS must be enforced in production/staging environments'));
    }

    if (security.sessionTimeout < 60000) { // 1 minute minimum
      errors.push(new ValidationError('Session timeout must be at least 60 seconds'));
    }

    if (security.rateLimiting.maxRequests < 1) {
      errors.push(new ValidationError('Rate limiting max requests must be at least 1'));
    }

    if (security.rateLimiting.windowMs < 1000) {
      errors.push(new ValidationError('Rate limiting window must be at least 1000ms'));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  private static async validateMonitoring(monitoring: MonitoringConfiguration): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (monitoring.alerting.thresholds.errorRate < 0 || monitoring.alerting.thresholds.errorRate > 1) {
      errors.push(new ValidationError('Error rate threshold must be between 0 and 1'));
    }

    if (monitoring.tracing.sampleRate < 0 || monitoring.tracing.sampleRate > 1) {
      errors.push(new ValidationError('Tracing sample rate must be between 0 and 1'));
    }

    if (monitoring.healthChecks.interval < 1000) {
      errors.push(new ValidationError('Health check interval must be at least 1000ms'));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }
}

// Main Environment Configuration Source Implementation
export class EnvironmentConfigurationSource extends BaseConfigurationSource {
  private readonly requiredVariables: string[];
  private readonly optionalVariables: Record<string, string>;

  constructor(
    aspects: IConfigurationAspect[] = [],
    cache?: IConfigurationCache
  ) {
    super(aspects, cache);
    
    this.requiredVariables = Object.keys(RequiredEnvironmentSchema.shape);
    this.optionalVariables = this.buildOptionalVariables();
  }

  private buildOptionalVariables(): Record<string, string> {
    const optional: Record<string, string> = {};
    const schema = OptionalEnvironmentSchema.shape;
    
    for (const key in schema) {
      optional[key] = process.env[key] || '';
    }
    
    return optional;
  }

  /**
   * Load configuration from environment variables
   */
  async load(environment: Environment): Promise<Result<AuthenticationConfiguration, ConfigurationError>> {
    try {
      const configuration = await this.executeWithAspects(
        environment,
        async (): Promise<AuthenticationConfiguration> => {
          // Check cache first
          const cached = await this.loadFromCache(environment);
          if (cached) {
            return cached;
          }

          // Parse environment variables
          const parseResult = await this.parseEnvironmentVariables();
          if (parseResult.isError()) {
            throw parseResult.error;
          }

          // Transform to configuration
          const transformResult = await ConfigurationTransformer.transformToConfiguration(
            parseResult.value,
            environment
          );
          if (transformResult.isError()) {
            throw transformResult.error;
          }

          const configuration = transformResult.value;

          // Validate configuration
          const validationResult = await ConfigurationValidator.validateConfiguration(configuration);
          if (!validationResult.isValid) {
            throw new ConfigurationValidationError(
              'Configuration validation failed',
              validationResult.errors
            );
          }

          // Cache configuration
          await this.saveToCache(environment, configuration);

          return configuration;
        },
        'load'
      );
      
      return Result.ok(configuration);
    } catch (error) {
      return Result.error(error as ConfigurationError);
    }
  }

  /**
   * Parse and validate environment variables
   */
  private async parseEnvironmentVariables(): Promise<Result<ParsedEnvironmentConfig, ConfigurationError>> {
    try {
      // Parse required variables
      const requiredResult = RequiredEnvironmentSchema.safeParse(process.env);
      if (!requiredResult.success) {
        const missingVars = requiredResult.error.errors.map(err => err.path.join('.'));
        return Result.error(new EnvironmentVariableError(
          'Required environment variables are missing or invalid',
          missingVars,
          { errors: requiredResult.error.errors }
        ));
      }

      // Parse optional variables
      const optionalResult = OptionalEnvironmentSchema.safeParse(process.env);
      const optional = optionalResult.success ? optionalResult.data : {};

      return Result.ok({
        required: requiredResult.data,
        optional
      });
    } catch (error) {
      return Result.error(new ConfigurationError(
        `Environment variable parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Validate that all required environment variables are present
   */
  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check required variables
    for (const variable of this.requiredVariables) {
      const value = process.env[variable];
      if (!value || value.trim().length === 0) {
        errors.push(new ValidationError(`Required environment variable missing: ${variable}`));
      }
    }

    // Validate variable formats
    if (process.env.REPLIT_DOMAINS) {
      const domains = process.env.REPLIT_DOMAINS.split(',').map(d => d.trim());
      if (domains.length === 0 || domains.some(d => d.length === 0)) {
        errors.push(new ValidationError('REPLIT_DOMAINS must contain at least one valid domain'));
      }
    }

    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      errors.push(new ValidationError('SESSION_SECRET must be at least 32 characters long'));
    }

    if (process.env.ISSUER_URL) {
      try {
        new URL(process.env.ISSUER_URL);
      } catch {
        errors.push(new ValidationError('ISSUER_URL must be a valid URL'));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  /**
   * Get required environment variables
   */
  getRequiredVariables(): string[] {
    return [...this.requiredVariables];
  }

  /**
   * Get optional environment variables with defaults
   */
  getOptionalVariables(): Record<string, string> {
    return { ...this.optionalVariables };
  }

  /**
   * Get configuration schema
   */
  getSchema(): Record<string, any> {
    return {
      required: RequiredEnvironmentSchema.shape,
      optional: OptionalEnvironmentSchema.shape
    };
  }

  /**
   * Test connectivity to external services
   */
  async testConnectivity(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Test issuer URL connectivity
    if (process.env.ISSUER_URL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(process.env.ISSUER_URL, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          errors.push(new ValidationError(`Issuer URL unreachable: ${response.status} ${response.statusText}`));
        }
      } catch (error) {
        errors.push(new ValidationError(
          `Issuer URL connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        ));
      }
    }

    // Test database connectivity if configured
    if (process.env.DATABASE_URL) {
      // Database connectivity test would go here
      // For now, just validate URL format
      try {
        new URL(process.env.DATABASE_URL);
      } catch {
        errors.push(new ValidationError('DATABASE_URL format is invalid'));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }
}