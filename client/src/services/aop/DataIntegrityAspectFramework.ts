/**
 * Enterprise Data Integrity Aspect Framework
 * AOP-compliant solution for preventing non-iterable data crashes
 * 100% best practices with comprehensive error handling and validation
 */

import { z } from 'zod';

// ===== ENTERPRISE RESULT PATTERN =====
export interface AspectResult<T, E = AspectError> {
  readonly success: boolean;
  readonly value: T;
  readonly error: E | null;
  readonly metadata: AspectMetadata;
  readonly aspectChain: readonly string[];
}

export interface AspectMetadata {
  readonly aspectName: string;
  readonly executionId: string;
  readonly timestamp: string;
  readonly performance: AspectPerformanceMetrics;
  readonly context: AspectExecutionContext;
  readonly validationRules: readonly string[];
}

export interface AspectPerformanceMetrics {
  readonly executionTime: number;
  readonly memoryUsage: number;
  readonly iterationCount: number;
  readonly validationChecks: number;
}

export interface AspectExecutionContext {
  readonly operation: string;
  readonly source: string;
  readonly dataType: string;
  readonly expectedType: string;
  readonly validationLevel: 'strict' | 'standard' | 'lenient';
}

// ===== ENTERPRISE ERROR HIERARCHY =====
export abstract class AspectError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DataIntegrityViolationError extends AspectError {
  constructor(message: string, context: Record<string, unknown>) {
    super(message, 'DATA_INTEGRITY_VIOLATION', context);
  }
}

export class IterabilityValidationError extends AspectError {
  constructor(message: string, context: Record<string, unknown>) {
    super(message, 'ITERABILITY_VALIDATION_FAILED', context);
  }
}

export class TypeSafetyViolationError extends AspectError {
  constructor(message: string, context: Record<string, unknown>) {
    super(message, 'TYPE_SAFETY_VIOLATION', context);
  }
}

// ===== VALIDATION SCHEMAS =====
const IterableDataSchema = z.union([
  z.array(z.unknown()),
  z.object({}).passthrough()
]);

const ListingDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  condition: z.string().optional(),
  images: z.array(z.string()).optional(),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  metadata: z.object({}).passthrough().optional()
}).passthrough();

// ===== CORE ASPECT INTERFACES =====
export interface DataIntegrityAspect {
  readonly name: string;
  readonly priority: number;
  readonly validationRules: readonly ValidationRule[];
  
  validateDataIntegrity<T>(data: unknown, context: AspectExecutionContext): AspectResult<T[], DataIntegrityViolationError>;
  ensureIterability<T>(data: unknown, context: AspectExecutionContext): AspectResult<T[], IterabilityValidationError>;
  validateTypeConformance<T>(data: T[], expectedSchema: z.ZodSchema, context: AspectExecutionContext): AspectResult<T[], TypeSafetyViolationError>;
  createContext(operation: string, source: string, dataType?: string, validationLevel?: 'strict' | 'standard' | 'lenient'): AspectExecutionContext;
}

export interface ValidationRule {
  readonly name: string;
  readonly description: string;
  readonly severity: 'error' | 'warning' | 'info';
  validate(data: unknown, context: AspectExecutionContext): ValidationResult;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly messages: readonly ValidationMessage[];
  readonly correctedData?: unknown;
  readonly metadata: ValidationMetadata;
}

export interface ValidationMessage {
  readonly level: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly path?: string;
  readonly code: string;
}

export interface ValidationMetadata {
  readonly ruleName: string;
  readonly executionTime: number;
  readonly dataSize: number;
  readonly checksPerformed: number;
}

// ===== VALIDATION RULES IMPLEMENTATION =====
export class ArrayIterabilityRule implements ValidationRule {
  readonly name = 'ArrayIterabilityRule';
  readonly description = 'Ensures data is iterable as an array';
  readonly severity = 'error' as const;

  validate(data: unknown, context: AspectExecutionContext): ValidationResult {
    const startTime = performance.now();
    const messages: ValidationMessage[] = [];

    if (data === null || data === undefined) {
      messages.push({
        level: 'error',
        message: 'Data is null or undefined, cannot iterate',
        code: 'NULL_UNDEFINED_DATA',
        path: context.source
      });
      
      return {
        isValid: false,
        messages,
        correctedData: [],
        metadata: {
          ruleName: this.name,
          executionTime: performance.now() - startTime,
          dataSize: 0,
          checksPerformed: 1
        }
      };
    }

    if (!Array.isArray(data)) {
      messages.push({
        level: 'error',
        message: `Expected array but received ${typeof data}`,
        code: 'NON_ARRAY_DATA',
        path: context.source
      });
      
      return {
        isValid: false,
        messages,
        correctedData: [],
        metadata: {
          ruleName: this.name,
          executionTime: performance.now() - startTime,
          dataSize: 0,
          checksPerformed: 1
        }
      };
    }

    return {
      isValid: true,
      messages: [],
      correctedData: data,
      metadata: {
        ruleName: this.name,
        executionTime: performance.now() - startTime,
        dataSize: data.length,
        checksPerformed: 1
      }
    };
  }
}

export class DataTypeConsistencyRule implements ValidationRule {
  readonly name = 'DataTypeConsistencyRule';
  readonly description = 'Validates consistent data types within array elements';
  readonly severity = 'warning' as const;

  validate(data: unknown, context: AspectExecutionContext): ValidationResult {
    const startTime = performance.now();
    const messages: ValidationMessage[] = [];

    if (!Array.isArray(data)) {
      return {
        isValid: false,
        messages: [{
          level: 'error',
          message: 'Cannot validate type consistency of non-array data',
          code: 'NON_ARRAY_INPUT',
          path: context.source
        }],
        metadata: {
          ruleName: this.name,
          executionTime: performance.now() - startTime,
          dataSize: 0,
          checksPerformed: 1
        }
      };
    }

    const correctedData: unknown[] = [];
    let inconsistencyCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (item === null || item === undefined) {
        messages.push({
          level: 'warning',
          message: `Null/undefined item at index ${i} removed`,
          code: 'NULL_ITEM_REMOVED',
          path: `${context.source}[${i}]`
        });
        inconsistencyCount++;
        continue;
      }

      if (typeof item === 'object' && item !== null) {
        correctedData.push(item);
      } else {
        messages.push({
          level: 'warning',
          message: `Non-object item at index ${i} of type ${typeof item} removed`,
          code: 'NON_OBJECT_ITEM_REMOVED',
          path: `${context.source}[${i}]`
        });
        inconsistencyCount++;
      }
    }

    return {
      isValid: inconsistencyCount === 0,
      messages,
      correctedData,
      metadata: {
        ruleName: this.name,
        executionTime: performance.now() - startTime,
        dataSize: data.length,
        checksPerformed: data.length
      }
    };
  }
}

export class ListingDataStructureRule implements ValidationRule {
  readonly name = 'ListingDataStructureRule';
  readonly description = 'Validates listing data structure conformance';
  readonly severity = 'warning' as const;

  validate(data: unknown, context: AspectExecutionContext): ValidationResult {
    const startTime = performance.now();
    const messages: ValidationMessage[] = [];

    if (!Array.isArray(data)) {
      return {
        isValid: false,
        messages: [{
          level: 'error',
          message: 'Cannot validate listing structure of non-array data',
          code: 'NON_ARRAY_INPUT',
          path: context.source
        }],
        metadata: {
          ruleName: this.name,
          executionTime: performance.now() - startTime,
          dataSize: 0,
          checksPerformed: 1
        }
      };
    }

    const correctedData: unknown[] = [];
    let validationErrors = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      try {
        const validatedItem = ListingDataSchema.parse(item);
        correctedData.push(validatedItem);
      } catch (error) {
        if (error instanceof z.ZodError) {
          messages.push({
            level: 'warning',
            message: `Invalid listing structure at index ${i}: ${error.errors.map(e => e.message).join(', ')}`,
            code: 'INVALID_LISTING_STRUCTURE',
            path: `${context.source}[${i}]`
          });
          validationErrors++;
          
          // Attempt to create a minimal valid structure
          if (typeof item === 'object' && item !== null) {
            correctedData.push({
              id: (item as any).id || `generated-${i}`,
              title: (item as any).title || 'Unknown Item',
              description: (item as any).description || '',
              price: (item as any).price || '$0.00',
              category: (item as any).category || 'unknown',
              ...item
            });
          }
        }
      }
    }

    return {
      isValid: validationErrors === 0,
      messages,
      correctedData,
      metadata: {
        ruleName: this.name,
        executionTime: performance.now() - startTime,
        dataSize: data.length,
        checksPerformed: data.length
      }
    };
  }
}

// ===== ENTERPRISE DATA INTEGRITY ASPECT =====
export class EnterpriseDataIntegrityAspect implements DataIntegrityAspect {
  readonly name = 'EnterpriseDataIntegrityAspect';
  readonly priority = 1000;
  readonly validationRules: readonly ValidationRule[] = [
    new ArrayIterabilityRule(),
    new DataTypeConsistencyRule(),
    new ListingDataStructureRule()
  ];

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createMetadata(
    aspectName: string, 
    executionId: string, 
    context: AspectExecutionContext, 
    validationRules: readonly string[],
    performanceMetrics: AspectPerformanceMetrics
  ): AspectMetadata {
    return {
      aspectName,
      executionId,
      timestamp: new Date().toISOString(),
      performance: performanceMetrics,
      context,
      validationRules
    };
  }

  createContext(
    operation: string, 
    source: string, 
    dataType: string = 'unknown', 
    validationLevel: 'strict' | 'standard' | 'lenient' = 'standard'
  ): AspectExecutionContext {
    return {
      operation,
      source,
      dataType,
      expectedType: 'array',
      validationLevel
    };
  }

  validateDataIntegrity<T>(data: unknown, context: AspectExecutionContext): AspectResult<T[], DataIntegrityViolationError> {
    const executionId = this.generateExecutionId();
    const startTime = performance.now();
    const aspectChain: string[] = [this.name];

    try {
      // Apply all validation rules
      let currentData = data;
      const allMessages: ValidationMessage[] = [];
      let totalChecks = 0;

      for (const rule of this.validationRules) {
        const result = rule.validate(currentData, context);
        allMessages.push(...result.messages);
        totalChecks += result.metadata.checksPerformed;

        if (!result.isValid && rule.severity === 'error') {
          const performanceMetrics: AspectPerformanceMetrics = {
            executionTime: performance.now() - startTime,
            memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
            iterationCount: Array.isArray(currentData) ? currentData.length : 0,
            validationChecks: totalChecks
          };

          return {
            success: false,
            value: [] as T[],
            error: new DataIntegrityViolationError(
              `Data integrity validation failed: ${allMessages.filter(m => m.level === 'error').map(m => m.message).join('; ')}`,
              {
                context,
                validationMessages: allMessages,
                executionId,
                aspectChain
              }
            ),
            metadata: this.createMetadata(this.name, executionId, context, this.validationRules.map(r => r.name), performanceMetrics),
            aspectChain
          };
        }

        if (result.correctedData !== undefined) {
          currentData = result.correctedData;
        }
      }

      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: Array.isArray(currentData) ? currentData.length : 0,
        validationChecks: totalChecks
      };

      // Final type assertion with safety check
      const validatedData = Array.isArray(currentData) ? currentData as T[] : [] as T[];

      console.log(`[${this.name}] Data integrity validation completed for ${context.source}:`, {
        originalSize: Array.isArray(data) ? data.length : 'non-array',
        correctedSize: validatedData.length,
        warnings: allMessages.filter(m => m.level === 'warning').length,
        executionTime: performanceMetrics.executionTime
      });

      return {
        success: true,
        value: validatedData,
        error: null,
        metadata: this.createMetadata(this.name, executionId, context, this.validationRules.map(r => r.name), performanceMetrics),
        aspectChain
      };

    } catch (error) {
      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: 0,
        validationChecks: 0
      };

      return {
        success: false,
        value: [] as T[],
        error: new DataIntegrityViolationError(
          `Critical error during data integrity validation: ${(error as Error).message}`,
          {
            context,
            originalError: error,
            executionId,
            aspectChain
          }
        ),
        metadata: this.createMetadata(this.name, executionId, context, this.validationRules.map(r => r.name), performanceMetrics),
        aspectChain
      };
    }
  }

  ensureIterability<T>(data: unknown, context: AspectExecutionContext): AspectResult<T[], IterabilityValidationError> {
    const executionId = this.generateExecutionId();
    const startTime = performance.now();
    const aspectChain: string[] = [this.name, 'ensureIterability'];

    try {
      if (data === null || data === undefined) {
        const performanceMetrics: AspectPerformanceMetrics = {
          executionTime: performance.now() - startTime,
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
          iterationCount: 0,
          validationChecks: 1
        };

        console.warn(`[${this.name}] Null/undefined data received in ${context.source}, returning empty array`);

        return {
          success: true,
          value: [] as T[],
          error: null,
          metadata: this.createMetadata(this.name, executionId, context, ['nullUndefinedHandler'], performanceMetrics),
          aspectChain
        };
      }

      if (!Array.isArray(data)) {
        const performanceMetrics: AspectPerformanceMetrics = {
          executionTime: performance.now() - startTime,
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
          iterationCount: 0,
          validationChecks: 1
        };

        return {
          success: false,
          value: [] as T[],
          error: new IterabilityValidationError(
            `Cannot ensure iterability: expected array but received ${typeof data}`,
            {
              context,
              dataType: typeof data,
              dataValue: data,
              executionId,
              aspectChain
            }
          ),
          metadata: this.createMetadata(this.name, executionId, context, ['arrayTypeChecker'], performanceMetrics),
          aspectChain
        };
      }

      // Validate each element for iterability
      const validatedArray: T[] = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item !== null && item !== undefined) {
          validatedArray.push(item as T);
        }
      }

      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: data.length,
        validationChecks: data.length + 1
      };

      console.log(`[${this.name}] Iterability ensured for ${context.source}:`, {
        originalLength: data.length,
        validatedLength: validatedArray.length,
        nullItemsRemoved: data.length - validatedArray.length
      });

      return {
        success: true,
        value: validatedArray,
        error: null,
        metadata: this.createMetadata(this.name, executionId, context, ['arrayIterabilityValidator'], performanceMetrics),
        aspectChain
      };

    } catch (error) {
      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: 0,
        validationChecks: 0
      };

      return {
        success: false,
        value: [] as T[],
        error: new IterabilityValidationError(
          `Critical error during iterability validation: ${(error as Error).message}`,
          {
            context,
            originalError: error,
            executionId,
            aspectChain
          }
        ),
        metadata: this.createMetadata(this.name, executionId, context, ['errorHandler'], performanceMetrics),
        aspectChain
      };
    }
  }

  validateTypeConformance<T>(
    data: T[], 
    expectedSchema: z.ZodSchema, 
    context: AspectExecutionContext
  ): AspectResult<T[], TypeSafetyViolationError> {
    const executionId = this.generateExecutionId();
    const startTime = performance.now();
    const aspectChain: string[] = [this.name, 'validateTypeConformance'];

    try {
      if (!Array.isArray(data)) {
        const performanceMetrics: AspectPerformanceMetrics = {
          executionTime: performance.now() - startTime,
          memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
          iterationCount: 0,
          validationChecks: 1
        };

        return {
          success: false,
          value: [] as T[],
          error: new TypeSafetyViolationError(
            `Type conformance validation requires array input, received ${typeof data}`,
            {
              context,
              dataType: typeof data,
              executionId,
              aspectChain
            }
          ),
          metadata: this.createMetadata(this.name, executionId, context, ['typeConformanceValidator'], performanceMetrics),
          aspectChain
        };
      }

      const validatedData: T[] = [];
      const invalidItems: Array<{ index: number; error: string }> = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const validatedItem = expectedSchema.parse(data[i]);
          validatedData.push(validatedItem as T);
        } catch (error) {
          if (error instanceof z.ZodError) {
            invalidItems.push({
              index: i,
              error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            });
          }
        }
      }

      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: data.length,
        validationChecks: data.length
      };

      if (invalidItems.length > 0 && context.validationLevel === 'strict') {
        return {
          success: false,
          value: [] as T[],
          error: new TypeSafetyViolationError(
            `Type conformance validation failed for ${invalidItems.length} items: ${invalidItems.map(item => `Index ${item.index}: ${item.error}`).join('; ')}`,
            {
              context,
              invalidItems,
              executionId,
              aspectChain
            }
          ),
          metadata: this.createMetadata(this.name, executionId, context, ['strictTypeConformance'], performanceMetrics),
          aspectChain
        };
      }

      console.log(`[${this.name}] Type conformance validation completed for ${context.source}:`, {
        totalItems: data.length,
        validItems: validatedData.length,
        invalidItems: invalidItems.length,
        validationLevel: context.validationLevel
      });

      return {
        success: true,
        value: validatedData,
        error: null,
        metadata: this.createMetadata(this.name, executionId, context, ['typeConformanceValidator'], performanceMetrics),
        aspectChain
      };

    } catch (error) {
      const performanceMetrics: AspectPerformanceMetrics = {
        executionTime: performance.now() - startTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        iterationCount: 0,
        validationChecks: 0
      };

      return {
        success: false,
        value: [] as T[],
        error: new TypeSafetyViolationError(
          `Critical error during type conformance validation: ${(error as Error).message}`,
          {
            context,
            originalError: error,
            executionId,
            aspectChain
          }
        ),
        metadata: this.createMetadata(this.name, executionId, context, ['errorHandler'], performanceMetrics),
        aspectChain
      };
    }
  }
}

// ===== SINGLETON ASPECT INSTANCE =====
export const dataIntegrityAspect = new EnterpriseDataIntegrityAspect();