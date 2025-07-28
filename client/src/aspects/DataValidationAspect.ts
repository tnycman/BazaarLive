/**
 * Enterprise Data Validation Aspect
 * AOP implementation for cross-cutting data validation concerns
 * Provides enterprise-grade null/undefined safety across domain operations
 */

import { DomainSafetyService } from '@/services/domain/DomainSafetyService';

export interface AspectContext {
  methodName: string;
  target: string;
  args: any[];
  timestamp: string;
}

export class DataValidationAspect {
  private static instance: DataValidationAspect;

  private constructor() {}

  static getInstance(): DataValidationAspect {
    if (!DataValidationAspect.instance) {
      DataValidationAspect.instance = new DataValidationAspect();
    }
    return DataValidationAspect.instance;
  }

  /**
   * AOP interceptor for array operations
   * Ensures all array operations are performed safely
   */
  validateArrayOperations<T>(
    operation: () => T[], 
    context: AspectContext
  ): T[] {
    try {
      const result = operation();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error(`[DataValidationAspect] Array operation failed in ${context.target}.${context.methodName}:`, error);
      return [];
    }
  }

  /**
   * AOP interceptor for string operations
   * Ensures all string operations handle null/undefined safely
   */
  validateStringOperations<T>(
    operation: () => T, 
    context: AspectContext,
    defaultValue: T
  ): T {
    try {
      const result = operation();
      return result ?? defaultValue;
    } catch (error) {
      console.error(`[DataValidationAspect] String operation failed in ${context.target}.${context.methodName}:`, error);
      return defaultValue;
    }
  }

  /**
   * Enterprise filtering validation with AOP concerns
   * Applies cross-cutting validation to filtering operations
   */
  validateFilteringOperation<T>(
    items: T[],
    filterFn: (item: T) => boolean,
    context: AspectContext
  ): T[] {
    if (!Array.isArray(items)) {
      console.warn(`[DataValidationAspect] Invalid items array in ${context.target}.${context.methodName}`);
      return [];
    }

    return DomainSafetyService.safeArrayFilter(items, (item: T) => {
      try {
        return filterFn(item);
      } catch (error) {
        console.warn(`[DataValidationAspect] Filter predicate error in ${context.target}.${context.methodName}:`, error);
        return false;
      }
    });
  }

  /**
   * AOP-enhanced style classification validation
   * Applies enterprise validation to style data access
   */
  validateStyleClassificationAccess(
    domainData: any,
    searchQuery: string,
    context: AspectContext
  ): boolean {
    const styleClassification = DomainSafetyService.safePropertyAccess(
      domainData,
      'styleClassification',
      []
    );

    const sanitizedStyles = DomainSafetyService.sanitizeStyleClassification(styleClassification);

    return DomainSafetyService.safeStringArrayOperation(
      sanitizedStyles,
      (style: string) => DomainSafetyService.safeStringIncludes(style, searchQuery)
    ).some(Boolean);
  }

  /**
   * Creates aspect context for logging and debugging
   */
  createContext(target: string, methodName: string, args: any[] = []): AspectContext {
    return {
      target,
      methodName,
      args: args.map(arg => typeof arg === 'object' ? { _sanitized: true } : arg),
      timestamp: new Date().toISOString()
    };
  }
}