/**
 * Validation Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade validation-specific errors with field context
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorClassification,
  ErrorRecoverySuggestion 
} from './DomainError';

// Validation Error Types
export enum ValidationErrorType {
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_TYPE = 'INVALID_TYPE',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  CROSS_FIELD_VALIDATION_FAILED = 'CROSS_FIELD_VALIDATION_FAILED',
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION',
  FOREIGN_KEY_CONSTRAINT_VIOLATION = 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
  DATA_INTEGRITY_VIOLATION = 'DATA_INTEGRITY_VIOLATION',
  CUSTOM_VALIDATION_FAILED = 'CUSTOM_VALIDATION_FAILED'
}

// Validation Rule Types
export enum ValidationRuleType {
  REQUIRED = 'required',
  FORMAT = 'format',
  LENGTH = 'length',
  RANGE = 'range',
  TYPE = 'type',
  PATTERN = 'pattern',
  ENUM = 'enum',
  CUSTOM = 'custom',
  BUSINESS = 'business',
  CROSS_FIELD = 'cross_field',
  UNIQUENESS = 'uniqueness',
  REFERENCE = 'reference'
}

// Field Validation Error
export interface FieldValidationError {
  readonly field: string;
  readonly value: any;
  readonly ruleType: ValidationRuleType;
  readonly constraint: any;
  readonly message: string;
  readonly path?: string[];
}

// Validation Context Extensions
export interface ValidationErrorContext extends ErrorContext {
  readonly validationTarget?: string;
  readonly validationSchema?: string;
  readonly fieldErrors?: FieldValidationError[];
  readonly crossFieldErrors?: string[];
  readonly businessRules?: string[];
  readonly validationRules?: ValidationRuleType[];
  readonly inputData?: any;
  readonly validatedData?: any;
  readonly validationStage?: string;
  readonly validatorName?: string;
}

/**
 * Base Validation Error
 * Enterprise-grade validation error with field-level context
 */
export class ValidationError extends DomainError {
  public readonly validationErrorType: ValidationErrorType;
  public readonly validationContext: ValidationErrorContext;
  public readonly fieldErrors: FieldValidationError[];

  constructor(
    message: string,
    validationErrorType: ValidationErrorType,
    fieldErrors: FieldValidationError[] = [],
    validationContext: Partial<ValidationErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    // Default validation error classification
    const defaultClassification: ErrorClassification = {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.VALIDATION,
      retryable: true,
      userFacing: true,
      requiresEscalation: false,
      automatedRecovery: false,
      ...classification
    };

    // Default recovery suggestions for validation
    const defaultRecoveryConfig = ValidationError.getDefaultRecoveryConfig(validationErrorType);
    const combinedSuggestions = [...defaultRecoveryConfig, ...recoverySuggestions];

    super(
      message,
      validationErrorType,
      {
        component: 'ValidationSystem',
        fieldErrors,
        ...validationContext
      },
      defaultClassification,
      combinedSuggestions
    );

    this.validationErrorType = validationErrorType;
    this.fieldErrors = fieldErrors;
    this.validationContext = {
      ...this.context,
      fieldErrors,
      ...validationContext
    } as ValidationErrorContext;

    // Log validation event
    this.logValidationEvent();
  }

  /**
   * Get validation error type
   */
  getValidationErrorType(): ValidationErrorType {
    return this.validationErrorType;
  }

  /**
   * Get validation context
   */
  getValidationContext(): ValidationErrorContext {
    return this.validationContext;
  }

  /**
   * Get field errors
   */
  getFieldErrors(): FieldValidationError[] {
    return this.fieldErrors;
  }

  /**
   * Get errors for specific field
   */
  getFieldError(fieldName: string): FieldValidationError | undefined {
    return this.fieldErrors.find(error => error.field === fieldName);
  }

  /**
   * Get all field names with errors
   */
  getErrorFields(): string[] {
    return this.fieldErrors.map(error => error.field);
  }

  /**
   * Check if error affects multiple fields
   */
  hasMultipleFieldErrors(): boolean {
    return this.fieldErrors.length > 1;
  }

  /**
   * Check if error is business rule violation
   */
  isBusinessRuleViolation(): boolean {
    return this.validationErrorType === ValidationErrorType.BUSINESS_RULE_VIOLATION ||
           this.fieldErrors.some(error => error.ruleType === ValidationRuleType.BUSINESS);
  }

  /**
   * Check if error is data integrity violation
   */
  isDataIntegrityViolation(): boolean {
    const integrityTypes = [
      ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION,
      ValidationErrorType.FOREIGN_KEY_CONSTRAINT_VIOLATION,
      ValidationErrorType.DATA_INTEGRITY_VIOLATION
    ];
    return integrityTypes.includes(this.validationErrorType);
  }

  /**
   * Get validation summary for user display
   */
  getValidationSummary(): {
    totalErrors: number;
    fieldErrors: number;
    businessRuleViolations: number;
    integrityViolations: number;
    errorsByField: Record<string, string[]>;
  } {
    const errorsByField: Record<string, string[]> = {};
    
    this.fieldErrors.forEach(error => {
      if (!errorsByField[error.field]) {
        errorsByField[error.field] = [];
      }
      errorsByField[error.field].push(error.message);
    });

    return {
      totalErrors: this.fieldErrors.length,
      fieldErrors: this.fieldErrors.filter(e => e.ruleType !== ValidationRuleType.BUSINESS).length,
      businessRuleViolations: this.fieldErrors.filter(e => e.ruleType === ValidationRuleType.BUSINESS).length,
      integrityViolations: this.isDataIntegrityViolation() ? 1 : 0,
      errorsByField
    };
  }

  /**
   * Get validation diagnostic data
   */
  getValidationDiagnostic(): Record<string, any> {
    return {
      eventType: 'validation_error',
      errorType: this.validationErrorType,
      validationTarget: this.validationContext.validationTarget,
      validationSchema: this.validationContext.validationSchema,
      fieldCount: this.fieldErrors.length,
      errorFields: this.getErrorFields(),
      businessRuleViolation: this.isBusinessRuleViolation(),
      integrityViolation: this.isDataIntegrityViolation(),
      timestamp: this.context.timestamp,
      severity: this.classification.severity
    };
  }

  /**
   * Log validation event
   */
  private logValidationEvent(): void {
    const diagnostic = this.getValidationDiagnostic();
    console.warn('[VALIDATION-EVENT] Validation error occurred:', diagnostic);
    
    if (this.isDataIntegrityViolation()) {
      console.error('[VALIDATION-ALERT] Data integrity violation:', diagnostic);
    }
  }

  /**
   * Get default recovery suggestions by error type
   */
  private static getDefaultRecoveryConfig(errorType: ValidationErrorType): ErrorRecoverySuggestion[] {
    const recoveryConfigs: Record<ValidationErrorType, ErrorRecoverySuggestion[]> = {
      [ValidationErrorType.REQUIRED_FIELD_MISSING]: [
        {
          action: 'provide_required_fields',
          description: 'Provide values for all required fields',
          automated: false,
          priority: 100
        },
        {
          action: 'use_default_values',
          description: 'Apply default values where available',
          automated: true,
          priority: 80
        }
      ],
      [ValidationErrorType.INVALID_FORMAT]: [
        {
          action: 'check_format_requirements',
          description: 'Verify data format meets requirements',
          automated: false,
          priority: 100
        },
        {
          action: 'auto_format_data',
          description: 'Automatically format data where possible',
          automated: true,
          priority: 90
        }
      ],
      [ValidationErrorType.OUT_OF_RANGE]: [
        {
          action: 'adjust_values_to_range',
          description: 'Adjust values to fall within valid range',
          automated: false,
          priority: 100
        },
        {
          action: 'clamp_to_boundaries',
          description: 'Automatically clamp values to valid boundaries',
          automated: true,
          priority: 80
        }
      ],
      [ValidationErrorType.SCHEMA_VALIDATION_FAILED]: [
        {
          action: 'check_schema_version',
          description: 'Verify data matches current schema version',
          automated: true,
          priority: 100
        },
        {
          action: 'migrate_data_format',
          description: 'Migrate data to current schema format',
          automated: true,
          priority: 90
        }
      ],
      [ValidationErrorType.BUSINESS_RULE_VIOLATION]: [
        {
          action: 'review_business_rules',
          description: 'Review and understand business rule requirements',
          automated: false,
          priority: 100
        },
        {
          action: 'request_exception',
          description: 'Request business rule exception if appropriate',
          automated: false,
          priority: 80
        }
      ],
      [ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION]: [
        {
          action: 'modify_unique_fields',
          description: 'Modify fields to ensure uniqueness',
          automated: false,
          priority: 100
        },
        {
          action: 'check_existing_records',
          description: 'Check if record already exists and handle accordingly',
          automated: true,
          priority: 90
        }
      ],
      // Default empty arrays for other types
      [ValidationErrorType.INVALID_TYPE]: [],
      [ValidationErrorType.CONSTRAINT_VIOLATION]: [],
      [ValidationErrorType.CROSS_FIELD_VALIDATION_FAILED]: [],
      [ValidationErrorType.FOREIGN_KEY_CONSTRAINT_VIOLATION]: [],
      [ValidationErrorType.DATA_INTEGRITY_VIOLATION]: [],
      [ValidationErrorType.CUSTOM_VALIDATION_FAILED]: []
    };

    return recoveryConfigs[errorType] || [];
  }
}

/**
 * Required Field Missing Error
 * Specific error for missing required fields
 */
export class RequiredFieldMissingError extends ValidationError {
  constructor(
    fieldName: string,
    validationTarget?: string,
    context: Partial<ValidationErrorContext> = {}
  ) {
    const fieldError: FieldValidationError = {
      field: fieldName,
      value: undefined,
      ruleType: ValidationRuleType.REQUIRED,
      constraint: { required: true },
      message: `Field '${fieldName}' is required`
    };

    super(
      `Required field missing: ${fieldName}`,
      ValidationErrorType.REQUIRED_FIELD_MISSING,
      [fieldError],
      {
        validationTarget,
        ...context
      },
      {
        severity: ErrorSeverity.MEDIUM,
        userFacing: true
      }
    );
  }
}

/**
 * Invalid Format Error
 * Specific error for format validation failures
 */
export class InvalidFormatError extends ValidationError {
  constructor(
    fieldName: string,
    value: any,
    expectedFormat: string,
    context: Partial<ValidationErrorContext> = {}
  ) {
    const fieldError: FieldValidationError = {
      field: fieldName,
      value,
      ruleType: ValidationRuleType.FORMAT,
      constraint: { format: expectedFormat },
      message: `Field '${fieldName}' has invalid format. Expected: ${expectedFormat}`
    };

    super(
      `Invalid format for field '${fieldName}': Expected ${expectedFormat}`,
      ValidationErrorType.INVALID_FORMAT,
      [fieldError],
      context,
      {
        severity: ErrorSeverity.MEDIUM,
        userFacing: true
      }
    );
  }
}

/**
 * Out of Range Error
 * Specific error for range validation failures
 */
export class OutOfRangeError extends ValidationError {
  constructor(
    fieldName: string,
    value: any,
    min?: number,
    max?: number,
    context: Partial<ValidationErrorContext> = {}
  ) {
    const rangeDescription = min !== undefined && max !== undefined
      ? `between ${min} and ${max}`
      : min !== undefined
      ? `at least ${min}`
      : max !== undefined
      ? `at most ${max}`
      : 'within valid range';

    const fieldError: FieldValidationError = {
      field: fieldName,
      value,
      ruleType: ValidationRuleType.RANGE,
      constraint: { min, max },
      message: `Field '${fieldName}' value must be ${rangeDescription}`
    };

    super(
      `Value out of range for field '${fieldName}': ${value}. Must be ${rangeDescription}`,
      ValidationErrorType.OUT_OF_RANGE,
      [fieldError],
      context,
      {
        severity: ErrorSeverity.MEDIUM,
        userFacing: true
      }
    );
  }
}

/**
 * Schema Validation Failed Error
 * Specific error for schema validation failures
 */
export class SchemaValidationFailedError extends ValidationError {
  constructor(
    schemaName: string,
    fieldErrors: FieldValidationError[],
    context: Partial<ValidationErrorContext> = {}
  ) {
    super(
      `Schema validation failed for '${schemaName}': ${fieldErrors.length} errors`,
      ValidationErrorType.SCHEMA_VALIDATION_FAILED,
      fieldErrors,
      {
        validationSchema: schemaName,
        ...context
      },
      {
        severity: fieldErrors.length > 5 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        userFacing: true
      }
    );
  }
}

/**
 * Business Rule Violation Error
 * Specific error for business rule violations
 */
export class BusinessRuleViolationError extends ValidationError {
  constructor(
    ruleName: string,
    ruleDescription: string,
    affectedFields: string[] = [],
    context: Partial<ValidationErrorContext> = {}
  ) {
    const fieldErrors: FieldValidationError[] = affectedFields.map(field => ({
      field,
      value: undefined,
      ruleType: ValidationRuleType.BUSINESS,
      constraint: { rule: ruleName },
      message: `Business rule violation: ${ruleDescription}`
    }));

    super(
      `Business rule violation: ${ruleName} - ${ruleDescription}`,
      ValidationErrorType.BUSINESS_RULE_VIOLATION,
      fieldErrors,
      {
        businessRules: [ruleName],
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        userFacing: true,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Unique Constraint Violation Error
 * Specific error for unique constraint violations
 */
export class UniqueConstraintViolationError extends ValidationError {
  constructor(
    fieldName: string,
    value: any,
    existingId?: string,
    context: Partial<ValidationErrorContext> = {}
  ) {
    const fieldError: FieldValidationError = {
      field: fieldName,
      value,
      ruleType: ValidationRuleType.UNIQUENESS,
      constraint: { unique: true, existingId },
      message: `Field '${fieldName}' must be unique. Value '${value}' already exists`
    };

    super(
      `Unique constraint violation for field '${fieldName}': Value '${value}' already exists`,
      ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION,
      [fieldError],
      context,
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.VALIDATION,
        userFacing: true
      }
    );
  }
}

/**
 * Validation Error Factory
 * Factory for creating validation errors with consistent patterns
 */
export class ValidationErrorFactory {
  /**
   * Create validation error from Zod validation result
   */
  static fromZodError(
    zodError: any,
    validationTarget?: string,
    context: Partial<ValidationErrorContext> = {}
  ): ValidationError {
    const fieldErrors: FieldValidationError[] = zodError.issues?.map((issue: any) => ({
      field: issue.path?.join('.') || 'unknown',
      value: issue.received,
      ruleType: ValidationErrorFactory.mapZodCodeToRuleType(issue.code),
      constraint: { expected: issue.expected },
      message: issue.message,
      path: issue.path
    })) || [];

    return new SchemaValidationFailedError(
      validationTarget || 'ZodSchema',
      fieldErrors,
      context
    );
  }

  /**
   * Create validation error from field validation
   */
  static fromFieldValidation(
    fieldName: string,
    value: any,
    ruleType: ValidationRuleType,
    constraint: any,
    message: string,
    context: Partial<ValidationErrorContext> = {}
  ): ValidationError {
    const fieldError: FieldValidationError = {
      field: fieldName,
      value,
      ruleType,
      constraint,
      message
    };

    const errorTypeMap: Record<ValidationRuleType, ValidationErrorType> = {
      [ValidationRuleType.REQUIRED]: ValidationErrorType.REQUIRED_FIELD_MISSING,
      [ValidationRuleType.FORMAT]: ValidationErrorType.INVALID_FORMAT,
      [ValidationRuleType.RANGE]: ValidationErrorType.OUT_OF_RANGE,
      [ValidationRuleType.TYPE]: ValidationErrorType.INVALID_TYPE,
      [ValidationRuleType.BUSINESS]: ValidationErrorType.BUSINESS_RULE_VIOLATION,
      [ValidationRuleType.UNIQUENESS]: ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION,
      [ValidationRuleType.PATTERN]: ValidationErrorType.INVALID_FORMAT,
      [ValidationRuleType.ENUM]: ValidationErrorType.CONSTRAINT_VIOLATION,
      [ValidationRuleType.CUSTOM]: ValidationErrorType.CUSTOM_VALIDATION_FAILED,
      [ValidationRuleType.CROSS_FIELD]: ValidationErrorType.CROSS_FIELD_VALIDATION_FAILED,
      [ValidationRuleType.LENGTH]: ValidationErrorType.OUT_OF_RANGE,
      [ValidationRuleType.REFERENCE]: ValidationErrorType.FOREIGN_KEY_CONSTRAINT_VIOLATION
    };

    const errorType = errorTypeMap[ruleType] || ValidationErrorType.CONSTRAINT_VIOLATION;

    return new ValidationError(
      message,
      errorType,
      [fieldError],
      context
    );
  }

  /**
   * Create multiple field validation error
   */
  static fromMultipleFields(
    fieldErrors: FieldValidationError[],
    validationTarget?: string,
    context: Partial<ValidationErrorContext> = {}
  ): ValidationError {
    const message = `Validation failed for ${fieldErrors.length} fields in '${validationTarget || 'unknown'}'`;
    
    return new ValidationError(
      message,
      ValidationErrorType.SCHEMA_VALIDATION_FAILED,
      fieldErrors,
      {
        validationTarget,
        ...context
      }
    );
  }

  /**
   * Map Zod error codes to validation rule types
   */
  private static mapZodCodeToRuleType(zodCode: string): ValidationRuleType {
    const codeMap: Record<string, ValidationRuleType> = {
      'invalid_type': ValidationRuleType.TYPE,
      'required': ValidationRuleType.REQUIRED,
      'invalid_string': ValidationRuleType.FORMAT,
      'too_small': ValidationRuleType.RANGE,
      'too_big': ValidationRuleType.RANGE,
      'invalid_enum_value': ValidationRuleType.ENUM,
      'custom': ValidationRuleType.CUSTOM
    };

    return codeMap[zodCode] || ValidationRuleType.CUSTOM;
  }
}

// Export all validation error types
export { ValidationErrorType, ValidationRuleType };
export type { ValidationErrorContext, FieldValidationError };