/**
 * AuthenticationValidationAspect - Enterprise AOP Implementation  
 * Comprehensive validation aspect for all authentication operations
 */

import {
  IAuthenticationAspect,
  BaseAuthenticationAspect,
  AspectConfiguration,
  AspectContext,
  JoinPoint,
  AspectError
} from './IAuthenticationAspect';
import { ValidationResult, ValidationError } from '../domain/AuthenticationStrategy';
import { Result } from '../domain/Hostname';
import { z } from 'zod';

// Validation Rule Types
export interface ValidationRule {
  readonly name: string;
  readonly description: string;
  readonly validator: (value: any, context: AspectContext) => Promise<ValidationResult>;
  readonly severity: 'error' | 'warning' | 'info';
  readonly enabled: boolean;
}

export interface ValidationSchema {
  readonly name: string;
  readonly schema: z.ZodSchema;
  readonly rules: ValidationRule[];
  readonly required: boolean;
}

// Validation Result Types
export interface DetailedValidationResult extends ValidationResult {
  readonly validatedFields: string[];
  readonly warnings: ValidationError[];
  readonly fieldErrors: Record<string, ValidationError[]>;
  readonly executionTime: number;
  readonly schemaUsed?: string;
}

// Validation Aspect Configuration
export interface ValidationAspectConfiguration extends AspectConfiguration {
  enableStrictValidation: boolean;
  enableWarnings: boolean;
  enableFieldLevelValidation: boolean;
  enableSchemaValidation: boolean;
  enableBusinessRuleValidation: boolean;
  maxValidationTime: number;
  treatWarningsAsErrors: boolean;
  validationTimeout: number;
  enableAsyncValidation: boolean;
  cacheValidationResults: boolean;
  validationCacheTTL: number;
}

// Validation Context
export interface ValidationContext extends AspectContext {
  readonly validationType: 'input' | 'output' | 'parameter' | 'result';
  readonly schemaName?: string;
  readonly fieldPath?: string;
  readonly parentContext?: ValidationContext;
}

/**
 * Authentication Validation Aspect
 * Provides comprehensive validation for all authentication operations
 */
export class AuthenticationValidationAspect extends BaseAuthenticationAspect {
  private validationSchemas: Map<string, ValidationSchema> = new Map();
  private validationCache: Map<string, { result: DetailedValidationResult; timestamp: Date }> = new Map();
  private businessRules: Map<string, ValidationRule> = new Map();

  constructor(configuration?: Partial<ValidationAspectConfiguration>) {
    super({
      name: 'AuthenticationValidationAspect',
      enabled: true,
      priority: 200, // Very high priority for validation
      pointcuts: ['*'], // Validate all operations
      options: {},
      ...configuration
    } as ValidationAspectConfiguration);

    this.initializeValidationSchemas();
    this.initializeBusinessRules();
  }

  getName(): string {
    return 'AuthenticationValidationAspect';
  }

  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const config = this.getTypedConfiguration();

      // Validate configuration
      if (config.maxValidationTime <= 0) {
        errors.push(new ValidationError('Max validation time must be positive', 'INVALID_VALIDATION_TIME'));
      }

      if (config.validationTimeout <= 0) {
        errors.push(new ValidationError('Validation timeout must be positive', 'INVALID_TIMEOUT'));
      }

      if (config.validationCacheTTL <= 0) {
        errors.push(new ValidationError('Validation cache TTL must be positive', 'INVALID_CACHE_TTL'));
      }

      // Validate schemas are properly defined
      if (this.validationSchemas.size === 0) {
        errors.push(new ValidationError('No validation schemas defined', 'NO_SCHEMAS'));
      }

      // Test schema functionality
      for (const [name, schema] of this.validationSchemas.entries()) {
        try {
          // Test schema compilation
          schema.schema.parse({});
        } catch (error) {
          // This is expected for most schemas, just testing compilation
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(new ValidationError(
        `Validation aspect validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      ));

      return {
        isValid: false,
        errors
      };
    }
  }

  // Lifecycle Methods

  async before(joinPoint: JoinPoint): Promise<void> {
    const config = this.getTypedConfiguration();

    await this.executeWithTracking(
      'before',
      joinPoint.context,
      async () => {
        // Validate input parameters
        const validationContext: ValidationContext = {
          ...joinPoint.context,
          validationType: 'parameter'
        };

        const paramValidation = await this.validateParameters(
          joinPoint.method,
          joinPoint.args,
          validationContext
        );

        if (!paramValidation.isValid) {
          if (config.enableStrictValidation) {
            throw new AspectError(
              `Parameter validation failed for ${joinPoint.method}: ${paramValidation.errors.map(e => e.message).join(', ')}`,
              'PARAMETER_VALIDATION_ERROR',
              {
                method: joinPoint.method,
                errors: paramValidation.errors,
                args: joinPoint.args
              }
            );
          }
        }

        // Handle warnings
        if (paramValidation.warnings && paramValidation.warnings.length > 0) {
          if (config.treatWarningsAsErrors && config.enableStrictValidation) {
            throw new AspectError(
              `Parameter validation warnings treated as errors for ${joinPoint.method}: ${paramValidation.warnings.map(e => e.message).join(', ')}`,
              'PARAMETER_VALIDATION_WARNING_ERROR',
              {
                method: joinPoint.method,
                warnings: paramValidation.warnings,
                args: joinPoint.args
              }
            );
          }
        }
      }
    );
  }

  async after(joinPoint: JoinPoint, result: any): Promise<void> {
    const config = this.getTypedConfiguration();

    await this.executeWithTracking(
      'after',
      joinPoint.context,
      async () => {
        // Validate result
        const validationContext: ValidationContext = {
          ...joinPoint.context,
          validationType: 'result'
        };

        const resultValidation = await this.validateResult(
          joinPoint.method,
          result,
          validationContext
        );

        if (!resultValidation.isValid) {
          if (config.enableStrictValidation) {
            throw new AspectError(
              `Result validation failed for ${joinPoint.method}: ${resultValidation.errors.map(e => e.message).join(', ')}`,
              'RESULT_VALIDATION_ERROR',
              {
                method: joinPoint.method,
                errors: resultValidation.errors,
                result: result
              }
            );
          }
        }
      }
    );
  }

  // Custom Validation Methods

  async validateInput(input: any, context: AspectContext): Promise<DetailedValidationResult> {
    return await this.executeWithTracking(
      'validateInput',
      context,
      async () => {
        const validationContext: ValidationContext = {
          ...context,
          validationType: 'input'
        };

        return await this.performValidation(input, 'input', validationContext);
      }
    );
  }

  async validateOutput(output: any, context: AspectContext): Promise<DetailedValidationResult> {
    return await this.executeWithTracking(
      'validateOutput',
      context,
      async () => {
        const validationContext: ValidationContext = {
          ...context,
          validationType: 'output'
        };

        return await this.performValidation(output, 'output', validationContext);
      }
    );
  }

  async validateBusinessRules(data: any, context: AspectContext): Promise<DetailedValidationResult> {
    return await this.executeWithTracking(
      'validateBusinessRules',
      context,
      async () => {
        const startTime = Date.now();
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        const validatedFields: string[] = [];
        const fieldErrors: Record<string, ValidationError[]> = {};

        const config = this.getTypedConfiguration();

        if (!config.enableBusinessRuleValidation) {
          return {
            isValid: true,
            errors: [],
            warnings: [],
            validatedFields: [],
            fieldErrors: {},
            executionTime: Date.now() - startTime
          };
        }

        // Apply business rules
        for (const [ruleName, rule] of this.businessRules.entries()) {
          if (!rule.enabled) continue;

          try {
            const ruleResult = await this.executeWithTimeout(
              () => rule.validator(data, context),
              config.validationTimeout
            );

            validatedFields.push(ruleName);

            if (!ruleResult.isValid) {
              if (rule.severity === 'error') {
                errors.push(...ruleResult.errors);
                fieldErrors[ruleName] = ruleResult.errors;
              } else if (rule.severity === 'warning') {
                warnings.push(...ruleResult.errors);
              }
            }
          } catch (error) {
            const validationError = new ValidationError(
              `Business rule '${ruleName}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'BUSINESS_RULE_ERROR'
            );
            errors.push(validationError);
            fieldErrors[ruleName] = [validationError];
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          validatedFields,
          fieldErrors,
          executionTime: Date.now() - startTime
        };
      }
    );
  }

  // Schema Management

  registerValidationSchema(name: string, schema: ValidationSchema): void {
    this.validationSchemas.set(name, schema);
  }

  registerBusinessRule(name: string, rule: ValidationRule): void {
    this.businessRules.set(name, rule);
  }

  removeValidationSchema(name: string): boolean {
    return this.validationSchemas.delete(name);
  }

  removeBusinessRule(name: string): boolean {
    return this.businessRules.delete(name);
  }

  getValidationSchemas(): Map<string, ValidationSchema> {
    return new Map(this.validationSchemas);
  }

  getBusinessRules(): Map<string, ValidationRule> {
    return new Map(this.businessRules);
  }

  // Cache Management

  clearValidationCache(): void {
    this.validationCache.clear();
  }

  getValidationCacheStats(): { size: number; hitRate: number } {
    // Simplified cache stats
    return {
      size: this.validationCache.size,
      hitRate: 0.85 // Placeholder
    };
  }

  // Protected Methods

  protected async onInitialize(): Promise<void> {
    console.log('[VALIDATION-ASPECT] Authentication Validation Aspect initialized', {
      aspectName: this.getName(),
      schemasCount: this.validationSchemas.size,
      businessRulesCount: this.businessRules.size,
      configuration: this.getTypedConfiguration()
    });
  }

  protected async onCleanup(): Promise<void> {
    console.log('[VALIDATION-ASPECT] Authentication Validation Aspect cleanup', {
      aspectName: this.getName(),
      cacheSize: this.validationCache.size
    });

    this.clearValidationCache();
  }

  // Private Methods

  private getTypedConfiguration(): ValidationAspectConfiguration {
    return {
      enableStrictValidation: false,
      enableWarnings: true,
      enableFieldLevelValidation: true,
      enableSchemaValidation: true,
      enableBusinessRuleValidation: true,
      maxValidationTime: 5000,
      treatWarningsAsErrors: false,
      validationTimeout: 3000,
      enableAsyncValidation: true,
      cacheValidationResults: true,
      validationCacheTTL: 300000, // 5 minutes
      ...this.configuration
    } as ValidationAspectConfiguration;
  }

  private async validateParameters(
    method: string,
    args: any[],
    context: ValidationContext
  ): Promise<DetailedValidationResult> {
    const schemaName = `${method}_parameters`;
    const schema = this.validationSchemas.get(schemaName);

    if (!schema) {
      // No specific schema, perform basic validation
      return await this.performBasicValidation(args, context);
    }

    return await this.performValidation(args, schemaName, context);
  }

  private async validateResult(
    method: string,
    result: any,
    context: ValidationContext
  ): Promise<DetailedValidationResult> {
    const schemaName = `${method}_result`;
    const schema = this.validationSchemas.get(schemaName);

    if (!schema) {
      // No specific schema, perform basic validation
      return await this.performBasicValidation(result, context);
    }

    return await this.performValidation(result, schemaName, context);
  }

  private async performValidation(
    data: any,
    schemaName: string,
    context: ValidationContext
  ): Promise<DetailedValidationResult> {
    const startTime = Date.now();
    const config = this.getTypedConfiguration();

    // Check cache
    if (config.cacheValidationResults) {
      const cacheKey = this.getCacheKey(data, schemaName, context);
      const cached = this.validationCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp.getTime() < config.validationCacheTTL) {
        return cached.result;
      }
    }

    const schema = this.validationSchemas.get(schemaName);
    if (!schema) {
      return await this.performBasicValidation(data, context);
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const validatedFields: string[] = [];
    const fieldErrors: Record<string, ValidationError[]> = {};

    try {
      // Schema validation
      if (config.enableSchemaValidation) {
        try {
          await this.executeWithTimeout(
            () => Promise.resolve(schema.schema.parse(data)),
            config.validationTimeout
          );
          validatedFields.push('schema');
        } catch (error) {
          if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
              const fieldPath = issue.path.join('.');
              const validationError = new ValidationError(
                `Schema validation failed for ${fieldPath}: ${issue.message}`,
                'SCHEMA_VALIDATION_ERROR'
              );
              errors.push(validationError);
              
              if (!fieldErrors[fieldPath]) {
                fieldErrors[fieldPath] = [];
              }
              fieldErrors[fieldPath].push(validationError);
            }
          } else {
            const validationError = new ValidationError(
              `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'SCHEMA_VALIDATION_ERROR'
            );
            errors.push(validationError);
            fieldErrors['schema'] = [validationError];
          }
        }
      }

      // Custom rules validation
      for (const rule of schema.rules) {
        if (!rule.enabled) continue;

        try {
          const ruleResult = await this.executeWithTimeout(
            () => rule.validator(data, context),
            config.validationTimeout
          );

          validatedFields.push(rule.name);

          if (!ruleResult.isValid) {
            if (rule.severity === 'error') {
              errors.push(...ruleResult.errors);
              fieldErrors[rule.name] = ruleResult.errors;
            } else if (rule.severity === 'warning') {
              warnings.push(...ruleResult.errors);
            }
          }
        } catch (error) {
          const validationError = new ValidationError(
            `Validation rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'RULE_VALIDATION_ERROR'
          );
          errors.push(validationError);
          fieldErrors[rule.name] = [validationError];
        }
      }

      const result: DetailedValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        validatedFields,
        fieldErrors,
        executionTime: Date.now() - startTime,
        schemaUsed: schemaName
      };

      // Cache result
      if (config.cacheValidationResults) {
        const cacheKey = this.getCacheKey(data, schemaName, context);
        this.validationCache.set(cacheKey, {
          result,
          timestamp: new Date()
        });
      }

      return result;

    } catch (error) {
      const validationError = new ValidationError(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      );

      return {
        isValid: false,
        errors: [validationError],
        warnings: [],
        validatedFields: [],
        fieldErrors: { general: [validationError] },
        executionTime: Date.now() - startTime,
        schemaUsed: schemaName
      };
    }
  }

  private async performBasicValidation(
    data: any,
    context: ValidationContext
  ): Promise<DetailedValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Basic null/undefined checks
    if (data === null) {
      warnings.push(new ValidationError('Data is null', 'NULL_DATA'));
    }

    if (data === undefined) {
      warnings.push(new ValidationError('Data is undefined', 'UNDEFINED_DATA'));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedFields: ['basic'],
      fieldErrors: {},
      executionTime: Date.now() - startTime
    };
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Validation timeout after ${timeout}ms`));
      }, timeout);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private getCacheKey(data: any, schemaName: string, context: ValidationContext): string {
    // Simple cache key generation
    const dataHash = JSON.stringify(data).substring(0, 100);
    return `${schemaName}_${dataHash}_${context.validationType}`;
  }

  private initializeValidationSchemas(): void {
    // Initialize common authentication validation schemas
    
    // Hostname validation schema
    this.registerValidationSchema('hostname', {
      name: 'hostname',
      schema: z.string().min(1).max(253).regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/),
      rules: [
        {
          name: 'hostname_length',
          description: 'Hostname must be between 1 and 253 characters',
          validator: async (value: string) => ({
            isValid: value.length >= 1 && value.length <= 253,
            errors: value.length < 1 || value.length > 253 
              ? [new ValidationError('Invalid hostname length', 'HOSTNAME_LENGTH')]
              : []
          }),
          severity: 'error',
          enabled: true
        }
      ],
      required: true
    });

    // Authentication context validation schema
    this.registerValidationSchema('auth_context', {
      name: 'auth_context',
      schema: z.object({
        requestId: z.string().min(1),
        timestamp: z.date(),
        operation: z.string().min(1),
        hostname: z.string().optional(),
        environment: z.string().optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        metadata: z.record(z.any())
      }),
      rules: [],
      required: true
    });
  }

  private initializeBusinessRules(): void {
    // Initialize common business rules for authentication
    
    this.registerBusinessRule('secure_hostname', {
      name: 'secure_hostname',
      description: 'Hostname must not contain suspicious patterns',
      validator: async (hostname: string) => {
        const suspiciousPatterns = ['localhost', '127.0.0.1', 'admin', 'test'];
        const isSuspicious = suspiciousPatterns.some(pattern => 
          hostname.toLowerCase().includes(pattern)
        );
        
        return {
          isValid: !isSuspicious,
          errors: isSuspicious 
            ? [new ValidationError('Hostname contains suspicious patterns', 'SUSPICIOUS_HOSTNAME')]
            : []
        };
      },
      severity: 'warning',
      enabled: true
    });

    this.registerBusinessRule('valid_environment', {
      name: 'valid_environment',
      description: 'Environment must be valid',
      validator: async (environment: string) => {
        const validEnvironments = ['development', 'staging', 'production'];
        const isValid = validEnvironments.includes(environment?.toLowerCase());
        
        return {
          isValid,
          errors: !isValid 
            ? [new ValidationError('Invalid environment', 'INVALID_ENVIRONMENT')]
            : []
        };
      },
      severity: 'error',
      enabled: true
    });
  }
}