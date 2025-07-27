/**
 * Validation Recovery Strategy - Phase 4 Task 4.2
 * Enterprise-grade validation error recovery with data sanitization and constraint handling
 */

import {
  BaseRecoveryStrategy,
  RecoveryContext,
  RecoveryAction,
  RecoveryStrategyType
} from '../RecoveryStrategy';

import {
  ValidationError,
  ValidationErrorType,
  RequiredFieldMissingError,
  InvalidFormatError,
  OutOfRangeError,
  SchemaValidationFailedError,
  BusinessRuleViolationError,
  UniqueConstraintViolationError
} from '../../error/ValidationError';

// Validation Recovery Actions
export enum ValidationRecoveryAction {
  SANITIZE_INPUT = 'sanitize_input',
  PROVIDE_DEFAULT_VALUE = 'provide_default_value',
  ADJUST_CONSTRAINTS = 'adjust_constraints',
  REPAIR_BUSINESS_RULE = 'repair_business_rule',
  RESOLVE_UNIQUENESS_CONFLICT = 'resolve_uniqueness_conflict',
  NORMALIZE_FORMAT = 'normalize_format',
  VALIDATE_CROSS_FIELDS = 'validate_cross_fields',
  APPLY_DATA_TRANSFORMATION = 'apply_data_transformation',
  GENERATE_ALTERNATIVE_VALUE = 'generate_alternative_value',
  REQUEST_USER_CORRECTION = 'request_user_correction',
  FALLBACK_TO_SAFE_VALUE = 'fallback_to_safe_value',
  UPDATE_VALIDATION_SCHEMA = 'update_validation_schema'
}

// Data Sanitizer Interface
interface DataSanitizer {
  sanitizeString(value: string, options?: SanitizationOptions): string;
  sanitizeNumber(value: any, options?: NumberSanitizationOptions): number | null;
  sanitizeEmail(email: string): string | null;
  sanitizeUrl(url: string): string | null;
  sanitizePhone(phone: string): string | null;
}

// Sanitization Options
interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  trimWhitespace?: boolean;
  removeSpecialChars?: boolean;
}

interface NumberSanitizationOptions {
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  precision?: number;
}

// Value Generator Interface
interface ValueGenerator {
  generateDefaultValue(fieldName: string, fieldType: string): any;
  generateUniqueValue(fieldName: string, existingValues: any[]): any;
  generateSafeValue(fieldName: string, constraints: any): any;
}

// Business Rule Engine Interface
interface BusinessRuleEngine {
  validateBusinessRule(ruleName: string, data: any): Promise<boolean>;
  getBusinessRuleConstraints(ruleName: string): Promise<any>;
  adjustBusinessRule(ruleName: string, data: any): Promise<any>;
}

/**
 * Validation Recovery Strategy
 * Handles recovery from validation errors with comprehensive data sanitization and constraint management
 */
export class ValidationRecoveryStrategy extends BaseRecoveryStrategy<ValidationError> {
  private dataSanitizer?: DataSanitizer;
  private valueGenerator?: ValueGenerator;
  private businessRuleEngine?: BusinessRuleEngine;

  constructor(
    dataSanitizer?: DataSanitizer,
    valueGenerator?: ValueGenerator,
    businessRuleEngine?: BusinessRuleEngine
  ) {
    super(
      'ValidationRecoveryStrategy',
      RecoveryStrategyType.AUTOMATED,
      80, // High priority
      '1.0.0'
    );
    
    this.dataSanitizer = dataSanitizer;
    this.valueGenerator = valueGenerator;
    this.businessRuleEngine = businessRuleEngine;
  }

  /**
   * Check if strategy can handle the validation error
   */
  canHandle(error: ValidationError): boolean {
    return error instanceof ValidationError;
  }

  /**
   * Get maximum recovery attempts for validation errors
   */
  getMaxAttempts(): number {
    return 3;
  }

  /**
   * Get timeout for validation recovery operations
   */
  getTimeout(): number {
    return 8000; // 8 seconds
  }

  /**
   * Get required permissions for validation recovery
   */
  getRequiredPermissions(): string[] {
    return ['data:sanitize', 'validation:adjust', 'business_rules:modify'];
  }

  /**
   * Execute recovery actions based on validation error type
   */
  async executeRecoveryActions(
    error: ValidationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    console.log(`[VALIDATION-RECOVERY] Executing recovery for ${error.validationErrorType} (attempt ${context.attemptNumber})`);

    // Execute recovery based on specific error type
    switch (error.validationErrorType) {
      case ValidationErrorType.REQUIRED_FIELD_MISSING:
        actions.push(...await this.handleRequiredFieldMissing(error as RequiredFieldMissingError, context));
        break;
        
      case ValidationErrorType.INVALID_FORMAT:
        actions.push(...await this.handleInvalidFormat(error as InvalidFormatError, context));
        break;
        
      case ValidationErrorType.OUT_OF_RANGE:
        actions.push(...await this.handleOutOfRange(error as OutOfRangeError, context));
        break;
        
      case ValidationErrorType.SCHEMA_VALIDATION_FAILED:
        actions.push(...await this.handleSchemaValidationFailed(error as SchemaValidationFailedError, context));
        break;
        
      case ValidationErrorType.BUSINESS_RULE_VIOLATION:
        actions.push(...await this.handleBusinessRuleViolation(error as BusinessRuleViolationError, context));
        break;
        
      case ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION:
        actions.push(...await this.handleUniqueConstraintViolation(error as UniqueConstraintViolationError, context));
        break;
        
      default:
        actions.push(...await this.handleGenericValidationError(error, context));
        break;
    }

    return actions;
  }

  /**
   * Handle required field missing recovery
   */
  private async handleRequiredFieldMissing(
    error: RequiredFieldMissingError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to provide a default value for the missing field
    const defaultAction = this.createAction(
      ValidationRecoveryAction.PROVIDE_DEFAULT_VALUE,
      `Provide default value for missing field: ${error.validationContext.fieldName}`,
      { 
        fieldName: error.validationContext.fieldName,
        fieldType: error.validationContext.fieldType
      }
    );

    const executedDefault = await this.executeAction(defaultAction, async () => {
      const fieldName = error.validationContext.fieldName!;
      const fieldType = error.validationContext.fieldType;

      // Try to generate appropriate default value
      if (this.valueGenerator) {
        const defaultValue = this.valueGenerator.generateDefaultValue(fieldName, fieldType || 'string');
        return {
          fieldName,
          defaultValue,
          generated: true,
          fieldType
        };
      }

      // Fallback to basic defaults based on field name and type
      const fallbackDefault = this.generateBasicDefault(fieldName, fieldType);
      
      return {
        fieldName,
        defaultValue: fallbackDefault,
        generated: true,
        fallback: true,
        fieldType
      };
    });

    actions.push(executedDefault);

    return actions;
  }

  /**
   * Handle invalid format recovery
   */
  private async handleInvalidFormat(
    error: InvalidFormatError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to normalize the format
    const normalizeAction = this.createAction(
      ValidationRecoveryAction.NORMALIZE_FORMAT,
      `Normalize format for field: ${error.validationContext.fieldName}`,
      { 
        fieldName: error.validationContext.fieldName,
        currentValue: error.validationContext.currentValue,
        expectedFormat: error.validationContext.expectedFormat
      }
    );

    const executedNormalize = await this.executeAction(normalizeAction, async () => {
      const fieldName = error.validationContext.fieldName!;
      const currentValue = error.validationContext.currentValue;
      const expectedFormat = error.validationContext.expectedFormat;

      let normalizedValue = currentValue;
      let normalized = false;

      // Apply format normalization based on expected format
      if (this.dataSanitizer) {
        switch (expectedFormat) {
          case 'email':
            normalizedValue = this.dataSanitizer.sanitizeEmail(String(currentValue));
            normalized = normalizedValue !== null;
            break;
          case 'url':
            normalizedValue = this.dataSanitizer.sanitizeUrl(String(currentValue));
            normalized = normalizedValue !== null;
            break;
          case 'phone':
            normalizedValue = this.dataSanitizer.sanitizePhone(String(currentValue));
            normalized = normalizedValue !== null;
            break;
          case 'string':
            normalizedValue = this.dataSanitizer.sanitizeString(String(currentValue));
            normalized = true;
            break;
        }
      } else {
        // Basic normalization without sanitizer
        normalizedValue = this.applyBasicNormalization(currentValue, expectedFormat);
        normalized = normalizedValue !== currentValue;
      }

      return {
        fieldName,
        originalValue: currentValue,
        normalizedValue,
        normalized,
        expectedFormat
      };
    });

    actions.push(executedNormalize);

    // If normalization failed, try to generate alternative value
    if (!executedNormalize.result?.normalized) {
      const alternativeAction = this.createAction(
        ValidationRecoveryAction.GENERATE_ALTERNATIVE_VALUE,
        `Generate alternative value for invalid format: ${error.validationContext.fieldName}`,
        { 
          fieldName: error.validationContext.fieldName,
          expectedFormat: error.validationContext.expectedFormat
        }
      );

      const executedAlternative = await this.executeAction(alternativeAction, async () => {
        const fieldName = error.validationContext.fieldName!;
        const expectedFormat = error.validationContext.expectedFormat;

        // Generate format-appropriate alternative value
        const alternativeValue = this.generateFormatAppropriateValue(fieldName, expectedFormat);

        return {
          fieldName,
          alternativeValue,
          generated: true,
          expectedFormat
        };
      });

      actions.push(executedAlternative);
    }

    return actions;
  }

  /**
   * Handle out of range recovery
   */
  private async handleOutOfRange(
    error: OutOfRangeError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to adjust the value to fit within range
    const adjustAction = this.createAction(
      ValidationRecoveryAction.ADJUST_CONSTRAINTS,
      `Adjust value to fit range for field: ${error.validationContext.fieldName}`,
      { 
        fieldName: error.validationContext.fieldName,
        currentValue: error.validationContext.currentValue,
        minValue: error.validationContext.minValue,
        maxValue: error.validationContext.maxValue
      }
    );

    const executedAdjust = await this.executeAction(adjustAction, async () => {
      const currentValue = error.validationContext.currentValue;
      const minValue = error.validationContext.minValue;
      const maxValue = error.validationContext.maxValue;

      let adjustedValue = currentValue;
      let adjusted = false;

      if (typeof currentValue === 'number') {
        if (minValue !== undefined && currentValue < minValue) {
          adjustedValue = minValue;
          adjusted = true;
        } else if (maxValue !== undefined && currentValue > maxValue) {
          adjustedValue = maxValue;
          adjusted = true;
        }
      } else if (typeof currentValue === 'string') {
        if (minValue !== undefined && currentValue.length < minValue) {
          // Pad string to minimum length
          adjustedValue = currentValue.padEnd(minValue, '0');
          adjusted = true;
        } else if (maxValue !== undefined && currentValue.length > maxValue) {
          // Truncate string to maximum length
          adjustedValue = currentValue.substring(0, maxValue);
          adjusted = true;
        }
      }

      return {
        fieldName: error.validationContext.fieldName,
        originalValue: currentValue,
        adjustedValue,
        adjusted,
        minValue,
        maxValue
      };
    });

    actions.push(executedAdjust);

    return actions;
  }

  /**
   * Handle schema validation failed recovery
   */
  private async handleSchemaValidationFailed(
    error: SchemaValidationFailedError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to sanitize all invalid fields
    const sanitizeAction = this.createAction(
      ValidationRecoveryAction.SANITIZE_INPUT,
      'Sanitize input data to match schema requirements',
      { 
        validationErrors: error.validationContext.validationErrors,
        schema: error.validationContext.schema
      }
    );

    const executedSanitize = await this.executeAction(sanitizeAction, async () => {
      const validationErrors = error.validationContext.validationErrors || [];
      const sanitizedFields: Record<string, any> = {};
      let sanitizationCount = 0;

      for (const validationError of validationErrors) {
        const fieldName = validationError.fieldName;
        const currentValue = validationError.currentValue;
        const ruleType = validationError.ruleType;

        if (this.dataSanitizer && fieldName && currentValue !== undefined) {
          let sanitizedValue = currentValue;

          switch (ruleType) {
            case 'REQUIRED':
              if (!currentValue) {
                sanitizedValue = this.generateBasicDefault(fieldName, 'string');
              }
              break;
            case 'FORMAT':
              sanitizedValue = this.dataSanitizer.sanitizeString(String(currentValue), {
                trimWhitespace: true,
                removeSpecialChars: false
              });
              break;
            case 'LENGTH':
              if (typeof currentValue === 'string') {
                const maxLength = validationError.expectedValue as number;
                if (maxLength && currentValue.length > maxLength) {
                  sanitizedValue = currentValue.substring(0, maxLength);
                }
              }
              break;
            case 'TYPE':
              sanitizedValue = this.coerceToType(currentValue, validationError.expectedValue as string);
              break;
          }

          if (sanitizedValue !== currentValue) {
            sanitizedFields[fieldName] = sanitizedValue;
            sanitizationCount++;
          }
        }
      }

      return {
        sanitizedFields,
        sanitizationCount,
        totalErrors: validationErrors.length
      };
    });

    actions.push(executedSanitize);

    return actions;
  }

  /**
   * Handle business rule violation recovery
   */
  private async handleBusinessRuleViolation(
    error: BusinessRuleViolationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to repair the business rule violation
    const repairAction = this.createAction(
      ValidationRecoveryAction.REPAIR_BUSINESS_RULE,
      `Repair business rule violation: ${error.validationContext.ruleName}`,
      { 
        ruleName: error.validationContext.ruleName,
        violatedData: error.validationContext.violatedData
      }
    );

    const executedRepair = await this.executeAction(repairAction, async () => {
      const ruleName = error.validationContext.ruleName!;
      const violatedData = error.validationContext.violatedData;

      if (this.businessRuleEngine) {
        try {
          // Try to adjust data to satisfy business rule
          const adjustedData = await this.businessRuleEngine.adjustBusinessRule(ruleName, violatedData);
          const isValid = await this.businessRuleEngine.validateBusinessRule(ruleName, adjustedData);

          return {
            ruleName,
            originalData: violatedData,
            adjustedData,
            repairSuccessful: isValid,
            adjustmentMade: true
          };
        } catch (ruleError) {
          return {
            ruleName,
            originalData: violatedData,
            repairSuccessful: false,
            adjustmentMade: false,
            error: ruleError instanceof Error ? ruleError.message : String(ruleError)
          };
        }
      }

      // Fallback: try common business rule repairs
      const commonRepair = this.applyCommonBusinessRuleRepairs(ruleName, violatedData);

      return {
        ruleName,
        originalData: violatedData,
        adjustedData: commonRepair.adjustedData,
        repairSuccessful: commonRepair.success,
        adjustmentMade: commonRepair.adjustmentMade,
        fallbackRepair: true
      };
    });

    actions.push(executedRepair);

    return actions;
  }

  /**
   * Handle unique constraint violation recovery
   */
  private async handleUniqueConstraintViolation(
    error: UniqueConstraintViolationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to resolve uniqueness conflict
    const resolveAction = this.createAction(
      ValidationRecoveryAction.RESOLVE_UNIQUENESS_CONFLICT,
      `Resolve uniqueness conflict for field: ${error.validationContext.fieldName}`,
      { 
        fieldName: error.validationContext.fieldName,
        conflictingValue: error.validationContext.conflictingValue,
        existingValues: error.validationContext.existingValues
      }
    );

    const executedResolve = await this.executeAction(resolveAction, async () => {
      const fieldName = error.validationContext.fieldName!;
      const conflictingValue = error.validationContext.conflictingValue;
      const existingValues = error.validationContext.existingValues || [];

      // Generate unique value
      if (this.valueGenerator) {
        const uniqueValue = this.valueGenerator.generateUniqueValue(fieldName, existingValues);
        return {
          fieldName,
          originalValue: conflictingValue,
          uniqueValue,
          generated: true
        };
      }

      // Fallback: append timestamp or counter
      const uniqueValue = this.generateUniqueValueFallback(conflictingValue, existingValues);

      return {
        fieldName,
        originalValue: conflictingValue,
        uniqueValue,
        generated: true,
        fallback: true
      };
    });

    actions.push(executedResolve);

    return actions;
  }

  /**
   * Handle generic validation error recovery
   */
  private async handleGenericValidationError(
    error: ValidationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to apply general data transformation
    const transformAction = this.createAction(
      ValidationRecoveryAction.APPLY_DATA_TRANSFORMATION,
      'Apply general data transformation for validation compliance',
      { errorType: error.validationErrorType }
    );

    const executedTransform = await this.executeAction(transformAction, async () => {
      // Apply generic data sanitization
      if (this.dataSanitizer && error.validationContext.fieldName && error.validationContext.currentValue) {
        const sanitizedValue = this.dataSanitizer.sanitizeString(
          String(error.validationContext.currentValue),
          { trimWhitespace: true }
        );

        return {
          fieldName: error.validationContext.fieldName,
          originalValue: error.validationContext.currentValue,
          transformedValue: sanitizedValue,
          transformationApplied: true
        };
      }

      return {
        transformationApplied: false,
        reason: 'no_sanitizer_or_invalid_context'
      };
    });

    actions.push(executedTransform);

    return actions;
  }

  /**
   * Generate basic default value
   */
  private generateBasicDefault(fieldName: string, fieldType?: string): any {
    const defaults: Record<string, any> = {
      'email': 'user@example.com',
      'name': 'Default Name',
      'username': 'user_' + Math.random().toString(36).substr(2, 6),
      'password': 'temporary123',
      'phone': '+1234567890',
      'age': 18,
      'count': 0,
      'price': 0.00,
      'description': 'Default description',
      'title': 'Default title',
      'url': 'https://example.com',
      'id': Math.random().toString(36).substr(2, 9)
    };

    // Check by field name first
    const fieldDefault = defaults[fieldName.toLowerCase()];
    if (fieldDefault !== undefined) {
      return fieldDefault;
    }

    // Check by field type
    switch (fieldType?.toLowerCase()) {
      case 'string':
        return `default_${fieldName}`;
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'date':
        return new Date().toISOString();
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return `default_${fieldName}`;
    }
  }

  /**
   * Apply basic normalization
   */
  private applyBasicNormalization(value: any, format?: string): any {
    const strValue = String(value);

    switch (format) {
      case 'email':
        return strValue.toLowerCase().trim();
      case 'phone':
        return strValue.replace(/[^\d+\-\(\)\s]/g, '');
      case 'url':
        if (!strValue.startsWith('http://') && !strValue.startsWith('https://')) {
          return `https://${strValue}`;
        }
        return strValue;
      case 'string':
        return strValue.trim();
      default:
        return strValue.trim();
    }
  }

  /**
   * Generate format-appropriate value
   */
  private generateFormatAppropriateValue(fieldName: string, format?: string): any {
    switch (format) {
      case 'email':
        return `${fieldName.toLowerCase()}@example.com`;
      case 'phone':
        return '+1234567890';
      case 'url':
        return `https://example.com/${fieldName.toLowerCase()}`;
      case 'date':
        return new Date().toISOString();
      default:
        return `valid_${fieldName}`;
    }
  }

  /**
   * Coerce value to specific type
   */
  private coerceToType(value: any, targetType: string): any {
    switch (targetType.toLowerCase()) {
      case 'string':
        return String(value);
      case 'number':
        const numValue = Number(value);
        return isNaN(numValue) ? 0 : numValue;
      case 'boolean':
        if (typeof value === 'string') {
          return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
        }
        return Boolean(value);
      case 'date':
        const dateValue = new Date(value);
        return isNaN(dateValue.getTime()) ? new Date() : dateValue;
      default:
        return value;
    }
  }

  /**
   * Apply common business rule repairs
   */
  private applyCommonBusinessRuleRepairs(
    ruleName: string,
    violatedData: any
  ): { adjustedData: any; success: boolean; adjustmentMade: boolean } {
    let adjustedData = { ...violatedData };
    let adjustmentMade = false;

    // Common business rule repairs
    switch (ruleName) {
      case 'minimum_age':
        if (violatedData.age && violatedData.age < 18) {
          adjustedData.age = 18;
          adjustmentMade = true;
        }
        break;
      case 'valid_email_domain':
        if (violatedData.email && !violatedData.email.includes('@')) {
          adjustedData.email = `${violatedData.email}@example.com`;
          adjustmentMade = true;
        }
        break;
      case 'future_date':
        if (violatedData.date && new Date(violatedData.date) <= new Date()) {
          adjustedData.date = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
          adjustmentMade = true;
        }
        break;
      case 'positive_amount':
        if (violatedData.amount && violatedData.amount <= 0) {
          adjustedData.amount = 1;
          adjustmentMade = true;
        }
        break;
      default:
        // No common repair available
        break;
    }

    return {
      adjustedData,
      success: adjustmentMade,
      adjustmentMade
    };
  }

  /**
   * Generate unique value fallback
   */
  private generateUniqueValueFallback(originalValue: any, existingValues: any[]): any {
    const baseValue = String(originalValue);
    let attempt = 1;
    let uniqueValue = baseValue;

    // Try appending numbers until unique
    while (existingValues.includes(uniqueValue) && attempt <= 100) {
      uniqueValue = `${baseValue}_${attempt}`;
      attempt++;
    }

    // If still not unique, append timestamp
    if (existingValues.includes(uniqueValue)) {
      uniqueValue = `${baseValue}_${Date.now()}`;
    }

    return uniqueValue;
  }

  /**
   * Estimate recovery time based on error type
   */
  estimateRecoveryTime(error: ValidationError): number {
    switch (error.validationErrorType) {
      case ValidationErrorType.REQUIRED_FIELD_MISSING:
        return 500; // 0.5 seconds for default value generation
      case ValidationErrorType.INVALID_FORMAT:
        return 1000; // 1 second for format normalization
      case ValidationErrorType.OUT_OF_RANGE:
        return 300; // 0.3 seconds for range adjustment
      case ValidationErrorType.SCHEMA_VALIDATION_FAILED:
        return 2000; // 2 seconds for comprehensive sanitization
      case ValidationErrorType.BUSINESS_RULE_VIOLATION:
        return 3000; // 3 seconds for business rule analysis
      case ValidationErrorType.UNIQUE_CONSTRAINT_VIOLATION:
        return 1500; // 1.5 seconds for uniqueness resolution
      default:
        return 1000; // 1 second default
    }
  }
}

// Export validation recovery strategy and types
export { ValidationRecoveryAction };