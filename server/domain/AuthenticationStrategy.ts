/**
 * AuthenticationStrategy Domain Entity - Enterprise Implementation
 * Complete domain logic for authentication strategy management
 */

import { z } from 'zod';
import { ValidationError, Result } from './Hostname';
import { Hostname } from './Hostname';
import { StrategyName } from './StrategyName';
import { Environment, EnvironmentType } from './Environment';

// Domain Enums
export enum AuthenticationCapabilityLevel {
  NONE = 'none',
  LIMITED = 'limited',
  FULL = 'full',
  ENHANCED = 'enhanced'
}

export enum AuthenticationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

// Strategy Configuration Interface
export interface StrategyConfiguration {
  readonly scope: string[];
  readonly callbackURL: string;
  readonly clientId: string;
  readonly issuerURL: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly securityLevel: 'basic' | 'standard' | 'enhanced' | 'strict';
}

// Validation Rule Interface
export interface ValidationRule {
  readonly name: string;
  readonly description: string;
  validate(input: any): Promise<ValidationResult>;
}

// Validation Result
export class ValidationResult {
  private constructor(
    private readonly _isValid: boolean,
    private readonly _errors: ValidationError[] = []
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static failure(errors: ValidationError[]): ValidationResult {
    return new ValidationResult(false, errors);
  }

  get isValid(): boolean {
    return this._isValid;
  }

  get errors(): ValidationError[] {
    return [...this._errors];
  }

  and(other: ValidationResult): ValidationResult {
    if (this._isValid && other._isValid) {
      return ValidationResult.success();
    }
    
    return ValidationResult.failure([
      ...this._errors,
      ...other.errors
    ]);
  }

  static combine(results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(result => result.errors);
    const allValid = results.every(result => result.isValid);
    
    return allValid 
      ? ValidationResult.success()
      : ValidationResult.failure(allErrors);
  }
}

// Authentication Context
export class AuthenticationContext {
  private readonly timers: Map<string, number> = new Map();

  constructor(
    public readonly hostname: Hostname,
    public readonly environment: Environment,
    public readonly requestId: string,
    public readonly clientIdentifier: string,
    public readonly sanitizedUserAgent: string,
    public readonly timestamp: Date = new Date()
  ) {}

  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  stopTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      throw new Error(`Timer not started for operation: ${operation}`);
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    return duration;
  }

  getDuration(): number {
    return Date.now() - this.timestamp.getTime();
  }

  static create(
    hostname: string,
    environment: string,
    requestId: string,
    clientIdentifier: string,
    userAgent: string
  ): Result<AuthenticationContext, ValidationError> {
    const hostnameResult = Hostname.create(hostname);
    if (hostnameResult.isError()) {
      return Result.error(hostnameResult.error);
    }

    const environmentResult = Environment.create(environment);
    if (environmentResult.isError()) {
      return Result.error(environmentResult.error);
    }

    if (!requestId || !clientIdentifier) {
      return Result.error(new ValidationError('Request ID and client identifier are required'));
    }

    // Sanitize user agent
    const sanitizedUserAgent = userAgent.replace(/[<>'"&]/g, '').substring(0, 200);

    return Result.ok(new AuthenticationContext(
      hostnameResult.value,
      environmentResult.value,
      requestId,
      clientIdentifier,
      sanitizedUserAgent
    ));
  }
}

// Authentication Capability
export class AuthenticationCapability {
  constructor(
    public readonly strategyName: StrategyName,
    public readonly hostname: Hostname,
    public readonly validationResult: ValidationResult,
    public readonly level: AuthenticationCapabilityLevel = AuthenticationCapabilityLevel.NONE
  ) {}

  canAuthenticate(): boolean {
    return this.validationResult.isValid && this.level !== AuthenticationCapabilityLevel.NONE;
  }

  getCapabilityLevel(): AuthenticationCapabilityLevel {
    return this.canAuthenticate() ? this.level : AuthenticationCapabilityLevel.NONE;
  }

  getRestrictions(): string[] {
    if (this.canAuthenticate()) {
      return [];
    }
    
    return this.validationResult.errors.map(error => error.message);
  }
}

// Authentication Result
export class AuthenticationResult {
  constructor(
    public readonly strategy: string,
    public readonly context: AuthenticationContext,
    public readonly status: AuthenticationStatus,
    public readonly metadata: Record<string, any> = {},
    public readonly expiresAt?: Date
  ) {}

  isSuccess(): boolean {
    return this.status === AuthenticationStatus.SUCCESS;
  }

  isExpired(): boolean {
    return this.status === AuthenticationStatus.EXPIRED || 
           (this.expiresAt && this.expiresAt < new Date());
  }

  getRemainingTime(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }
}

// Validation Rule Factory
export class ValidationRuleFactory {
  static createForEnvironment(environment: Environment): ValidationRule[] {
    const baseRules: ValidationRule[] = [
      new RequiredFieldsValidationRule(),
      new HostnameFormatValidationRule(),
      new SecurityValidationRule()
    ];

    if (environment.requiresStrictSecurity()) {
      baseRules.push(
        new StrictSecurityValidationRule(),
        new ProductionDomainValidationRule()
      );
    }

    if (environment.allowsDebugFeatures()) {
      baseRules.push(
        new DevelopmentHostnameValidationRule()
      );
    }

    return baseRules;
  }
}

// Validation Rule Implementations
class RequiredFieldsValidationRule implements ValidationRule {
  readonly name = 'required-fields';
  readonly description = 'Validates that all required fields are present';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    if (!hostname) {
      return ValidationResult.failure([
        new ValidationError('Hostname is required')
      ]);
    }

    return ValidationResult.success();
  }
}

class HostnameFormatValidationRule implements ValidationRule {
  readonly name = 'hostname-format';
  readonly description = 'Validates hostname format compliance';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    // Hostname validation is already done in Hostname.create()
    // This rule validates business logic around hostname usage
    
    const type = hostname.getType();
    if (type === 'ipv4' || type === 'ipv6') {
      return ValidationResult.failure([
        new ValidationError('IP addresses are not allowed for authentication strategies')
      ]);
    }

    return ValidationResult.success();
  }
}

class SecurityValidationRule implements ValidationRule {
  readonly name = 'security';
  readonly description = 'Validates security requirements';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check for suspicious patterns
    const suspiciousPatterns = ['admin', 'root', 'system', 'internal'];
    const hostnameString = hostname.toString().toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (hostnameString.includes(pattern)) {
        errors.push(new ValidationError(
          `Hostname contains suspicious pattern: ${pattern}`
        ));
      }
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }
}

class StrictSecurityValidationRule implements ValidationRule {
  readonly name = 'strict-security';
  readonly description = 'Enforces strict security requirements for production';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    if (!hostname.isProductionHostname()) {
      return ValidationResult.failure([
        new ValidationError('Non-production hostname not allowed in strict security mode')
      ]);
    }

    // Require proper domain structure
    const parts = hostname.getDomainParts();
    if (parts.length < 2) {
      return ValidationResult.failure([
        new ValidationError('Production hostname must have proper domain structure')
      ]);
    }

    return ValidationResult.success();
  }
}

class ProductionDomainValidationRule implements ValidationRule {
  readonly name = 'production-domain';
  readonly description = 'Validates production domain requirements';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Must be a proper domain (not localhost, IP, etc.)
    if (hostname.isDevelopmentHostname()) {
      errors.push(new ValidationError(
        'Development hostnames not allowed in production environment'
      ));
    }

    // Must have proper TLD
    const parts = hostname.getDomainParts();
    const tld = parts[parts.length - 1];
    
    if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
      errors.push(new ValidationError(
        'Invalid top-level domain for production environment'
      ));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }
}

class DevelopmentHostnameValidationRule implements ValidationRule {
  readonly name = 'development-hostname';
  readonly description = 'Validates development hostname allowances';

  async validate(hostname: Hostname): Promise<ValidationResult> {
    // Allow any valid hostname in development
    return ValidationResult.success();
  }
}

// Main Authentication Strategy Domain Entity
export class AuthenticationStrategy {
  private constructor(
    private readonly name: StrategyName,
    private readonly configuration: StrategyConfiguration,
    private readonly environment: Environment,
    private readonly validationRules: ValidationRule[]
  ) {}

  /**
   * Factory method to create AuthenticationStrategy
   */
  static async create(
    name: string,
    configuration: StrategyConfiguration,
    environment: Environment
  ): Promise<Result<AuthenticationStrategy, ValidationError>> {
    // Validate strategy name
    const strategyNameResult = StrategyName.create(name);
    if (strategyNameResult.isError()) {
      return Result.error(strategyNameResult.error);
    }

    // Validate configuration
    const configValidation = await this.validateConfiguration(configuration, environment);
    if (!configValidation.isValid) {
      return Result.error(new ValidationError(
        `Configuration validation failed: ${configValidation.errors.map(e => e.message).join(', ')}`
      ));
    }

    // Create validation rules for environment
    const validationRules = ValidationRuleFactory.createForEnvironment(environment);

    return Result.ok(new AuthenticationStrategy(
      strategyNameResult.value,
      configuration,
      environment,
      validationRules
    ));
  }

  /**
   * Validate strategy configuration
   */
  private static async validateConfiguration(
    config: StrategyConfiguration,
    environment: Environment
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!config.scope || config.scope.length === 0) {
      errors.push(new ValidationError('Strategy scope is required'));
    }

    if (!config.callbackURL) {
      errors.push(new ValidationError('Callback URL is required'));
    }

    if (!config.clientId) {
      errors.push(new ValidationError('Client ID is required'));
    }

    if (!config.issuerURL) {
      errors.push(new ValidationError('Issuer URL is required'));
    }

    // Environment-specific validations
    if (environment.requiresStrictSecurity()) {
      if (config.securityLevel === 'basic') {
        errors.push(new ValidationError(
          'Basic security level not allowed in production environment'
        ));
      }

      if (!config.callbackURL.startsWith('https://')) {
        errors.push(new ValidationError(
          'HTTPS callback URL required in production environment'
        ));
      }
    }

    // Timeout validation
    if (config.timeout < 1000 || config.timeout > 60000) {
      errors.push(new ValidationError(
        'Timeout must be between 1000ms and 60000ms'
      ));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  /**
   * Check if strategy can handle authentication for hostname
   */
  async canAuthenticate(hostname: Hostname): Promise<AuthenticationCapability> {
    // Run all validation rules
    const validationResults = await Promise.all(
      this.validationRules.map(rule => rule.validate(hostname))
    );

    const combinedValidation = ValidationResult.combine(validationResults);

    // Determine capability level
    let capabilityLevel = AuthenticationCapabilityLevel.NONE;

    if (combinedValidation.isValid) {
      // Check strategy-hostname compatibility
      if (this.name.isCompatibleWithHostname(hostname.toString())) {
        capabilityLevel = this.getCapabilityLevel();
      } else {
        combinedValidation.errors.push(new ValidationError(
          'Strategy not compatible with hostname'
        ));
      }
    }

    return new AuthenticationCapability(
      this.name,
      hostname,
      combinedValidation,
      capabilityLevel
    );
  }

  /**
   * Get capability level based on environment and configuration
   */
  private getCapabilityLevel(): AuthenticationCapabilityLevel {
    if (this.environment.isProduction()) {
      return this.configuration.securityLevel === 'strict' 
        ? AuthenticationCapabilityLevel.ENHANCED
        : AuthenticationCapabilityLevel.FULL;
    }

    if (this.environment.isDevelopment()) {
      return AuthenticationCapabilityLevel.FULL;
    }

    return AuthenticationCapabilityLevel.LIMITED;
  }

  /**
   * Validate authentication context
   */
  async validate(context: AuthenticationContext): Promise<ValidationResult> {
    const validationResults = await Promise.all([
      this.validateContext(context),
      this.validateEnvironmentCompatibility(context),
      this.validateHostnameCompatibility(context)
    ]);

    return ValidationResult.combine(validationResults);
  }

  private async validateContext(context: AuthenticationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (!context.requestId) {
      errors.push(new ValidationError('Request ID is required'));
    }

    if (!context.clientIdentifier) {
      errors.push(new ValidationError('Client identifier is required'));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  private async validateEnvironmentCompatibility(context: AuthenticationContext): Promise<ValidationResult> {
    if (!this.environment.equals(context.environment)) {
      return ValidationResult.failure([
        new ValidationError(
          `Strategy environment (${this.environment.toString()}) does not match context environment (${context.environment.toString()})`
        )
      ]);
    }

    return ValidationResult.success();
  }

  private async validateHostnameCompatibility(context: AuthenticationContext): Promise<ValidationResult> {
    const capability = await this.canAuthenticate(context.hostname);
    
    if (!capability.canAuthenticate()) {
      return ValidationResult.failure(
        capability.getRestrictions().map(restriction => new ValidationError(restriction))
      );
    }

    return ValidationResult.success();
  }

  // Getters
  getName(): StrategyName {
    return this.name;
  }

  getConfiguration(): StrategyConfiguration {
    return { ...this.configuration };
  }

  getEnvironment(): Environment {
    return this.environment;
  }

  getValidationRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Create Zod schema for StrategyConfiguration
   */
  static createConfigurationSchema() {
    return z.object({
      scope: z.array(z.string()).min(1),
      callbackURL: z.string().url(),
      clientId: z.string().min(1),
      issuerURL: z.string().url(),
      timeout: z.number().min(1000).max(60000),
      retryAttempts: z.number().min(0).max(5),
      securityLevel: z.enum(['basic', 'standard', 'enhanced', 'strict'])
    });
  }

  /**
   * Serialize for JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name.toString(),
      configuration: this.configuration,
      environment: this.environment.toString(),
      validationRules: this.validationRules.map(rule => ({
        name: rule.name,
        description: rule.description
      }))
    };
  }
}

// Export validation schemas
export const strategyConfigurationSchema = AuthenticationStrategy.createConfigurationSchema();