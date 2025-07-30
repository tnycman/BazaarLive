/**
 * Schema Transformation Engine
 * 
 * Enterprise-grade engine for converting filter definition objects into 
 * fully type-safe Zod schemas with comprehensive validation rules.
 * 
 * @fileoverview Core schema transformation engine for filter validation
 * @version 1.0.0
 * @author BazaarLive Enterprise Team
 */

import { z, ZodSchema, ZodType, ZodArray, ZodObject, ZodString, ZodNumber, ZodBoolean } from 'zod';

/**
 * Raw filter definition interface for schema transformation
 */
export interface FilterDefinitionRaw {
  /** Unique identifier for the filter */
  id: string;
  /** Display name for the filter */
  name: string;
  /** Type of filter control */
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'multiselect';
  /** Available options for selection-based filters */
  options?: Array<{
    id: string;
    name: string;
    value?: any;
  }>;
  /** Whether this filter is required */
  required?: boolean;
  /** Minimum value for numeric filters */
  min?: number;
  /** Maximum value for numeric filters */
  max?: number;
  /** Step increment for numeric filters */
  step?: number;
  /** Regex pattern for string validation */
  pattern?: string;
  /** Custom validation function name */
  customValidator?: string;
  /** Default value for the filter */
  defaultValue?: any;
  /** Help text for users */
  helpText?: string;
  /** Nested filter definitions */
  nested?: FilterDefinitionRaw[];
}

/**
 * Schema transformation error with detailed context
 */
export class SchemaTransformationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly filterDefinition: FilterDefinitionRaw;

  constructor(
    message: string,
    code: string,
    filterDefinition: FilterDefinitionRaw,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'SchemaTransformationError';
    this.code = code;
    this.filterDefinition = filterDefinition;
    this.details = details;
  }

  /**
   * Creates error for unsupported filter types
   */
  static unsupportedType(
    filterDef: FilterDefinitionRaw,
    supportedTypes: string[]
  ): SchemaTransformationError {
    return new SchemaTransformationError(
      `Unsupported filter type '${filterDef.type}' for filter '${filterDef.id}'`,
      'UNSUPPORTED_FILTER_TYPE',
      filterDef,
      { supportedTypes, receivedType: filterDef.type }
    );
  }

  /**
   * Creates error for invalid validation constraints
   */
  static invalidConstraints(
    filterDef: FilterDefinitionRaw,
    constraint: string,
    reason: string
  ): SchemaTransformationError {
    return new SchemaTransformationError(
      `Invalid constraint '${constraint}' for filter '${filterDef.id}': ${reason}`,
      'INVALID_CONSTRAINTS',
      filterDef,
      { constraint, reason }
    );
  }

  /**
   * Creates error for custom validator failures
   */
  static customValidatorError(
    filterDef: FilterDefinitionRaw,
    validatorName: string,
    error: Error
  ): SchemaTransformationError {
    return new SchemaTransformationError(
      `Custom validator '${validatorName}' failed for filter '${filterDef.id}': ${error.message}`,
      'CUSTOM_VALIDATOR_ERROR',
      filterDef,
      { validatorName, originalError: error.message }
    );
  }

  /**
   * Creates error for schema construction failures
   */
  static schemaConstruction(
    filterDef: FilterDefinitionRaw,
    stage: string,
    error: Error
  ): SchemaTransformationError {
    return new SchemaTransformationError(
      `Schema construction failed at stage '${stage}' for filter '${filterDef.id}': ${error.message}`,
      'SCHEMA_CONSTRUCTION_FAILED',
      filterDef,
      { stage, originalError: error.message, stack: error.stack }
    );
  }
}

/**
 * Custom validator registry for reusable validation logic
 */
class CustomValidatorRegistry {
  private static validators: Map<string, (value: any) => boolean | Promise<boolean>> = new Map();

  /**
   * Registers a custom validator function
   */
  static register(name: string, validator: (value: any) => boolean | Promise<boolean>): void {
    this.validators.set(name, validator);
  }

  /**
   * Gets a registered validator by name
   */
  static get(name: string): ((value: any) => boolean | Promise<boolean>) | undefined {
    return this.validators.get(name);
  }

  /**
   * Checks if a validator is registered
   */
  static has(name: string): boolean {
    return this.validators.has(name);
  }

  /**
   * Lists all registered validator names
   */
  static listValidators(): string[] {
    return Array.from(this.validators.keys());
  }
}

// Register common custom validators
CustomValidatorRegistry.register('email', (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
});

CustomValidatorRegistry.register('phone', (value: string) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
});

CustomValidatorRegistry.register('url', (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
});

CustomValidatorRegistry.register('alphanumeric', (value: string) => {
  return /^[a-zA-Z0-9]+$/.test(value);
});

/**
 * Schema Transformation Engine
 * 
 * Converts filter definition objects into fully type-safe Zod schemas.
 * Handles boolean required flags, min/max constraints, regex patterns,
 * custom validators, and nested structures.
 */
export class SchemaTransformationEngine {
  private readonly transformationMetrics: {
    totalTransformations: number;
    successfulTransformations: number;
    failedTransformations: number;
    averageTransformationTime: number;
  };

  /**
   * Creates a new schema transformation engine instance
   */
  constructor() {
    this.transformationMetrics = {
      totalTransformations: 0,
      successfulTransformations: 0,
      failedTransformations: 0,
      averageTransformationTime: 0
    };
  }

  /**
   * Converts a filter definition into a Zod schema
   * 
   * This is the main transformation method that handles all filter types
   * and converts them into appropriate Zod validation schemas with all
   * constraints and custom validation rules applied.
   * 
   * @param definition - Raw filter definition to transform
   * @returns ZodSchema for validating filter values
   * @throws SchemaTransformationError for transformation failures
   */
  toZodSchema(definition: FilterDefinitionRaw): ZodSchema {
    const startTime = Date.now();
    this.transformationMetrics.totalTransformations++;

    try {
      this._validateDefinition(definition);

      let schema: ZodSchema;

      // Transform based on filter type
      switch (definition.type) {
        case 'checkbox':
          schema = this._createCheckboxSchema(definition);
          break;
        case 'radio':
          schema = this._createRadioSchema(definition);
          break;
        case 'range':
          schema = this._createRangeSchema(definition);
          break;
        case 'select':
          schema = this._createSelectSchema(definition);
          break;
        case 'multiselect':
          schema = this._createMultiselectSchema(definition);
          break;
        default:
          throw SchemaTransformationError.unsupportedType(
            definition,
            ['checkbox', 'radio', 'range', 'select', 'multiselect']
          );
      }

      // Apply common constraints
      schema = this._applyCommonConstraints(schema, definition);

      // Apply custom validators
      schema = this._applyCustomValidators(schema, definition);

      // Apply required/optional flag
      schema = this._applyRequiredFlag(schema, definition);

      // Handle nested structures
      if (definition.nested && definition.nested.length > 0) {
        schema = this._applyNestedStructures(schema, definition);
      }

      // Update success metrics
      const transformationTime = Date.now() - startTime;
      this._updateSuccessMetrics(transformationTime);

      return schema;

    } catch (error) {
      this.transformationMetrics.failedTransformations++;

      if (error instanceof SchemaTransformationError) {
        throw error;
      }

      throw SchemaTransformationError.schemaConstruction(
        definition,
        'main_transformation',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Transforms multiple filter definitions in batch
   * 
   * @param definitions - Array of filter definitions to transform
   * @returns Array of corresponding Zod schemas
   */
  toZodSchemaBatch(definitions: FilterDefinitionRaw[]): ZodSchema[] {
    const schemas: ZodSchema[] = [];
    const errors: SchemaTransformationError[] = [];

    for (let i = 0; i < definitions.length; i++) {
      try {
        const schema = this.toZodSchema(definitions[i]);
        schemas.push(schema);
      } catch (error) {
        if (error instanceof SchemaTransformationError) {
          errors.push(error);
        } else {
          errors.push(SchemaTransformationError.schemaConstruction(
            definitions[i],
            `batch_item_${i}`,
            error instanceof Error ? error : new Error(String(error))
          ));
        }
      }
    }

    if (errors.length > 0) {
      throw new SchemaTransformationError(
        `Batch transformation failed: ${errors.length} out of ${definitions.length} schemas failed`,
        'BATCH_TRANSFORMATION_FAILED',
        { id: 'batch', name: 'batch', type: 'checkbox' } as FilterDefinitionRaw,
        { errors: errors.map(e => e.message), totalCount: definitions.length, failedCount: errors.length }
      );
    }

    return schemas;
  }

  /**
   * Gets transformation metrics and performance statistics
   */
  getTransformationMetrics(): {
    totalTransformations: number;
    successfulTransformations: number;
    failedTransformations: number;
    successRate: number;
    averageTransformationTime: number;
  } {
    const successRate = this.transformationMetrics.totalTransformations > 0
      ? (this.transformationMetrics.successfulTransformations / this.transformationMetrics.totalTransformations) * 100
      : 0;

    return {
      ...this.transformationMetrics,
      successRate
    };
  }

  /**
   * Validates the filter definition structure
   */
  private _validateDefinition(definition: FilterDefinitionRaw): void {
    if (!definition.id || typeof definition.id !== 'string') {
      throw new SchemaTransformationError(
        'Filter definition must have a valid string ID',
        'INVALID_DEFINITION',
        definition,
        { field: 'id', value: definition.id }
      );
    }

    if (!definition.name || typeof definition.name !== 'string') {
      throw new SchemaTransformationError(
        'Filter definition must have a valid string name',
        'INVALID_DEFINITION',
        definition,
        { field: 'name', value: definition.name }
      );
    }

    if (!definition.type) {
      throw new SchemaTransformationError(
        'Filter definition must have a valid type',
        'INVALID_DEFINITION',
        definition,
        { field: 'type', value: definition.type }
      );
    }
  }

  /**
   * Creates schema for checkbox filters (boolean or array of strings)
   */
  private _createCheckboxSchema(definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (definition.options && definition.options.length > 0) {
        // Multiple checkboxes - array of selected option IDs
        const optionIds = definition.options.map(opt => opt.id);
        return z.array(z.enum(optionIds as [string, ...string[]]));
      } else {
        // Single checkbox - boolean value
        return z.boolean();
      }
    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'checkbox_schema',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Creates schema for radio button filters (single selection)
   */
  private _createRadioSchema(definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (!definition.options || definition.options.length === 0) {
        throw SchemaTransformationError.invalidConstraints(
          definition,
          'options',
          'Radio filters must have at least one option'
        );
      }

      const optionIds = definition.options.map(opt => opt.id);
      return z.enum(optionIds as [string, ...string[]]);

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'radio_schema',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Creates schema for range filters (numeric values)
   */
  private _createRangeSchema(definition: FilterDefinitionRaw): ZodSchema {
    try {
      let schema = z.number();

      // Apply min/max constraints
      if (typeof definition.min === 'number') {
        schema = schema.min(definition.min, `Value must be at least ${definition.min}`);
      }

      if (typeof definition.max === 'number') {
        schema = schema.max(definition.max, `Value must be at most ${definition.max}`);
      }

      // Validate min/max relationship
      if (typeof definition.min === 'number' && typeof definition.max === 'number') {
        if (definition.min >= definition.max) {
          throw SchemaTransformationError.invalidConstraints(
            definition,
            'min/max',
            `Minimum value (${definition.min}) must be less than maximum value (${definition.max})`
          );
        }
      }

      // Apply step constraint (custom validation)
      if (typeof definition.step === 'number' && definition.step > 0) {
        const refinedSchema = schema.refine(
          (value) => {
            const min = definition.min || 0;
            return (value - min) % definition.step! === 0;
          },
          {
            message: `Value must be in increments of ${definition.step} from ${definition.min || 0}`
          }
        );
        return refinedSchema;
      }

      return schema;

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'range_schema',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Creates schema for select dropdown filters (single selection)
   */
  private _createSelectSchema(definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (!definition.options || definition.options.length === 0) {
        throw SchemaTransformationError.invalidConstraints(
          definition,
          'options',
          'Select filters must have at least one option'
        );
      }

      const optionIds = definition.options.map(opt => opt.id);
      return z.enum(optionIds as [string, ...string[]]);

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'select_schema',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Creates schema for multiselect filters (array of selections)
   */
  private _createMultiselectSchema(definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (!definition.options || definition.options.length === 0) {
        throw SchemaTransformationError.invalidConstraints(
          definition,
          'options',
          'Multiselect filters must have at least one option'
        );
      }

      const optionIds = definition.options.map(opt => opt.id);
      const enumSchema = z.enum(optionIds as [string, ...string[]]);
      
      return z.array(enumSchema).min(0, 'At least zero selections required');

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'multiselect_schema',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Applies common constraints like pattern matching
   */
  private _applyCommonConstraints(schema: ZodSchema, definition: FilterDefinitionRaw): ZodSchema {
    try {
      // Apply regex pattern for string-based schemas
      if (definition.pattern && schema instanceof z.ZodString) {
        try {
          const regex = new RegExp(definition.pattern);
          return (schema as z.ZodString).regex(regex, `Value must match pattern: ${definition.pattern}`);
        } catch (regexError) {
          throw SchemaTransformationError.invalidConstraints(
            definition,
            'pattern',
            `Invalid regex pattern: ${definition.pattern}`
          );
        }
      }

      return schema;

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'common_constraints',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Applies custom validators to the schema
   */
  private _applyCustomValidators(schema: ZodSchema, definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (!definition.customValidator) {
        return schema;
      }

      const validator = CustomValidatorRegistry.get(definition.customValidator);
      if (!validator) {
        throw SchemaTransformationError.customValidatorError(
          definition,
          definition.customValidator,
          new Error(`Custom validator '${definition.customValidator}' not found. Available: ${CustomValidatorRegistry.listValidators().join(', ')}`)
        );
      }

      return schema.refine(
        async (value) => {
          try {
            return await validator(value);
          } catch (error) {
            throw SchemaTransformationError.customValidatorError(
              definition,
              definition.customValidator!,
              error instanceof Error ? error : new Error(String(error))
            );
          }
        },
        {
          message: `Custom validation failed for validator '${definition.customValidator}'`
        }
      );

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'custom_validators',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Applies required/optional flag to the schema
   */
  private _applyRequiredFlag(schema: ZodSchema, definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (definition.required === false) {
        return schema.optional();
      }

      // Required by default, but allow nullable for some filter types
      if (definition.type === 'checkbox' && !definition.options) {
        // Single checkbox can be false, so make it default to false rather than required
        return schema.default(false);
      }

      return schema;

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'required_flag',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Applies nested structure constraints
   */
  private _applyNestedStructures(schema: ZodSchema, definition: FilterDefinitionRaw): ZodSchema {
    try {
      if (!definition.nested || definition.nested.length === 0) {
        return schema;
      }

      // Create schemas for nested filters
      const nestedSchemas: Record<string, ZodSchema> = {};
      for (const nestedDef of definition.nested) {
        nestedSchemas[nestedDef.id] = this.toZodSchema(nestedDef);
      }

      // Create object schema that includes the main filter value and nested values
      return z.object({
        value: schema,
        nested: z.object(nestedSchemas).optional()
      });

    } catch (error) {
      throw SchemaTransformationError.schemaConstruction(
        definition,
        'nested_structures',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Updates success metrics
   */
  private _updateSuccessMetrics(transformationTime: number): void {
    this.transformationMetrics.successfulTransformations++;
    
    // Update rolling average
    const totalTime = this.transformationMetrics.averageTransformationTime * (this.transformationMetrics.successfulTransformations - 1) + transformationTime;
    this.transformationMetrics.averageTransformationTime = totalTime / this.transformationMetrics.successfulTransformations;
  }
}

export { CustomValidatorRegistry };