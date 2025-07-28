/**
 * Enterprise Strategy Validation Layer
 * AOP-compliant validation framework for category strategy operations
 * Ensures type safety and data integrity throughout strategy execution
 */

import { Result, DataFlowContext, ValidationError, TransformationError } from './EnterpriseDataPipelineArchitecture';
import { CategoryStrategy, RawListingData, CategorySpecificListingData, ValidationResult } from '../category/CategoryDomainTypes';

// ===== STRATEGY VALIDATION ASPECTS =====
export interface StrategyValidationAspect {
  readonly name: string;
  readonly priority: number;
  validateBeforeTransformation(strategy: CategoryStrategy, data: RawListingData[], context: DataFlowContext): Result<RawListingData[], ValidationError>;
  validateAfterTransformation(strategy: CategoryStrategy, result: CategorySpecificListingData[], context: DataFlowContext): Result<CategorySpecificListingData[], ValidationError>;
  handleTransformationError(strategy: CategoryStrategy, error: Error, context: DataFlowContext): Result<CategorySpecificListingData[], TransformationError>;
}

export class StrategyDataIntegrityAspect implements StrategyValidationAspect {
  readonly name = 'StrategyDataIntegrityAspect';
  readonly priority = 100;

  validateBeforeTransformation(
    strategy: CategoryStrategy, 
    data: RawListingData[], 
    context: DataFlowContext
  ): Result<RawListingData[], ValidationError> {
    const startTime = performance.now();

    try {
      // Validate input data array
      if (!Array.isArray(data)) {
        return {
          success: false,
          value: [],
          error: new ValidationError(
            `Invalid input data type for strategy ${strategy.domain.category}: expected array, got ${typeof data}`,
            'INVALID_INPUT_TYPE',
            { strategyCategory: strategy.domain.category, inputType: typeof data }
          ),
          metadata: this.createMetadata('validateBeforeTransformation', context, performance.now() - startTime)
        };
      }

      // Validate each item in the array
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item || typeof item !== 'object') {
          console.warn(`[StrategyDataIntegrityAspect] Invalid item at index ${i} for strategy ${strategy.domain.category}: ${typeof item}`);
          // Remove invalid items rather than failing
          data.splice(i, 1);
          i--; // Adjust index after removal
        }
      }

      return {
        success: true,
        value: data,
        error: null,
        metadata: this.createMetadata('validateBeforeTransformation', context, performance.now() - startTime)
      };
    } catch (error) {
      return {
        success: false,
        value: [],
        error: new ValidationError(
          `Validation error in strategy ${strategy.domain.category}: ${(error as Error).message}`,
          'VALIDATION_EXCEPTION',
          { strategyCategory: strategy.domain.category, originalError: error }
        ),
        metadata: this.createMetadata('validateBeforeTransformation', context, performance.now() - startTime)
      };
    }
  }

  validateAfterTransformation(
    strategy: CategoryStrategy, 
    result: CategorySpecificListingData[], 
    context: DataFlowContext
  ): Result<CategorySpecificListingData[], ValidationError> {
    const startTime = performance.now();

    try {
      // Validate result is array
      if (!Array.isArray(result)) {
        console.error(`[StrategyDataIntegrityAspect] Strategy ${strategy.domain.category} returned non-array:`, typeof result);
        
        return {
          success: true, // Recovery: return empty array
          value: [],
          error: null,
          metadata: this.createMetadata('validateAfterTransformation.recovery', context, performance.now() - startTime)
        };
      }

      // Validate each transformed item
      const validItems: CategorySpecificListingData[] = [];
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        
        if (item && typeof item === 'object' && item.id && item.title) {
          validItems.push(item);
        } else {
          console.warn(`[StrategyDataIntegrityAspect] Invalid transformed item at index ${i} for strategy ${strategy.domain.category}`);
        }
      }

      return {
        success: true,
        value: validItems,
        error: null,
        metadata: this.createMetadata('validateAfterTransformation', context, performance.now() - startTime)
      };
    } catch (error) {
      console.error(`[StrategyDataIntegrityAspect] Post-transformation validation error:`, error);
      
      return {
        success: true, // Recovery: return empty array
        value: [],
        error: null,
        metadata: this.createMetadata('validateAfterTransformation.recovery', context, performance.now() - startTime)
      };
    }
  }

  handleTransformationError(
    strategy: CategoryStrategy, 
    error: Error, 
    context: DataFlowContext
  ): Result<CategorySpecificListingData[], TransformationError> {
    const startTime = performance.now();
    
    console.error(`[StrategyDataIntegrityAspect] Transformation error in strategy ${strategy.domain.category}:`, error);

    // Enterprise recovery: return empty array with comprehensive logging
    return {
      success: true,
      value: [],
      error: null,
      metadata: this.createMetadata('handleTransformationError.recovery', context, performance.now() - startTime)
    };
  }

  private createMetadata(operation: string, context: DataFlowContext, executionTime: number) {
    return {
      timestamp: new Date().toISOString(),
      operation,
      context: `${context.pipelineId}.${context.stageId}.${operation}`,
      performance: {
        executionTime,
        memoryUsage: 0,
        operationCount: 1
      }
    };
  }
}

export class StrategyBusinessRuleAspect implements StrategyValidationAspect {
  readonly name = 'StrategyBusinessRuleAspect';
  readonly priority = 90;

  validateBeforeTransformation(
    strategy: CategoryStrategy, 
    data: RawListingData[], 
    context: DataFlowContext
  ): Result<RawListingData[], ValidationError> {
    const startTime = performance.now();

    try {
      // Business rule validation per strategy type
      const validItems = data.filter(item => {
        // Category-specific business rules
        if (strategy.domain.category === 'men' || strategy.domain.category === 'women' || strategy.domain.category === 'kids') {
          // Fashion-specific validation
          return item.category === 'fashion' && item.title && item.price;
        }
        
        return true; // Default allow
      });

      return {
        success: true,
        value: validItems,
        error: null,
        metadata: this.createMetadata('validateBeforeTransformation', context, performance.now() - startTime)
      };
    } catch (error) {
      return {
        success: false,
        value: [],
        error: new ValidationError(
          `Business rule validation failed for strategy ${strategy.domain.category}`,
          'BUSINESS_RULE_ERROR'
        ),
        metadata: this.createMetadata('validateBeforeTransformation', context, performance.now() - startTime)
      };
    }
  }

  validateAfterTransformation(
    strategy: CategoryStrategy, 
    result: CategorySpecificListingData[], 
    context: DataFlowContext
  ): Result<CategorySpecificListingData[], ValidationError> {
    const startTime = performance.now();

    try {
      // Validate domain-specific data enrichment
      const enrichedItems = result.filter(item => {
        // Ensure domain-specific data was added
        if (!item.domainSpecificData) {
          console.warn(`[StrategyBusinessRuleAspect] Missing domain-specific data for item ${item.id}`);
          return false;
        }
        
        return true;
      });

      return {
        success: true,
        value: enrichedItems,
        error: null,
        metadata: this.createMetadata('validateAfterTransformation', context, performance.now() - startTime)
      };
    } catch (error) {
      return {
        success: true, // Recovery
        value: result,
        error: null,
        metadata: this.createMetadata('validateAfterTransformation.recovery', context, performance.now() - startTime)
      };
    }
  }

  handleTransformationError(
    strategy: CategoryStrategy, 
    error: Error, 
    context: DataFlowContext
  ): Result<CategorySpecificListingData[], TransformationError> {
    const startTime = performance.now();
    
    console.error(`[StrategyBusinessRuleAspect] Business rule error in strategy ${strategy.domain.category}:`, error);

    return {
      success: true,
      value: [],
      error: null,
      metadata: this.createMetadata('handleTransformationError.recovery', context, performance.now() - startTime)
    };
  }

  private createMetadata(operation: string, context: DataFlowContext, executionTime: number) {
    return {
      timestamp: new Date().toISOString(),
      operation,
      context: `${context.pipelineId}.${context.stageId}.${operation}`,
      performance: {
        executionTime,
        memoryUsage: 0,
        operationCount: 1
      }
    };
  }
}

// ===== ENTERPRISE STRATEGY VALIDATION ORCHESTRATOR =====
export class EnterpriseStrategyValidationOrchestrator {
  private aspects: StrategyValidationAspect[] = [];

  constructor() {
    // Initialize core aspects
    this.addAspect(new StrategyDataIntegrityAspect());
    this.addAspect(new StrategyBusinessRuleAspect());
  }

  addAspect(aspect: StrategyValidationAspect): void {
    this.aspects.push(aspect);
    this.aspects.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Enterprise-grade strategy transformation with comprehensive AOP validation
   */
  async executeValidatedTransformation(
    strategy: CategoryStrategy,
    data: RawListingData[],
    context: DataFlowContext
  ): Promise<Result<CategorySpecificListingData[], Error>> {
    const startTime = performance.now();

    try {
      // Before transformation validation
      let validatedData = data;
      for (const aspect of this.aspects) {
        const result = aspect.validateBeforeTransformation(strategy, validatedData, context);
        if (!result.success) {
          const errorResult = aspect.handleTransformationError(strategy, result.error as Error, context);
          if (errorResult.success) {
            return errorResult;
          }
          return result as unknown as Result<CategorySpecificListingData[], Error>;
        }
        validatedData = result.value;
      }

      // Execute strategy transformation with error handling
      let transformedData: CategorySpecificListingData[];
      try {
        transformedData = strategy.transformListingData(validatedData);
      } catch (error) {
        console.error(`[EnterpriseStrategyValidationOrchestrator] Strategy transformation failed:`, error);

        // Handle transformation error through aspects
        for (const aspect of this.aspects) {
          const result = aspect.handleTransformationError(strategy, error as Error, context);
          if (result.success) {
            return result;
          }
        }

        return {
          success: false,
          value: [],
          error: error as Error,
          metadata: this.createMetadata('executeValidatedTransformation.error', context, performance.now() - startTime)
        };
      }

      // After transformation validation
      for (const aspect of this.aspects) {
        const result = aspect.validateAfterTransformation(strategy, transformedData, context);
        if (!result.success) {
          const errorResult = aspect.handleTransformationError(strategy, result.error as Error, context);
          if (errorResult.success) {
            return errorResult;
          }
          return result as Result<CategorySpecificListingData[], Error>;
        }
        transformedData = result.value;
      }

      return {
        success: true,
        value: transformedData,
        error: null,
        metadata: this.createMetadata('executeValidatedTransformation', context, performance.now() - startTime)
      };

    } catch (error) {
      console.error(`[EnterpriseStrategyValidationOrchestrator] Critical error:`, error);

      // Final error recovery
      for (const aspect of this.aspects) {
        const result = aspect.handleTransformationError(strategy, error as Error, context);
        if (result.success) {
          return result;
        }
      }

      return {
        success: false,
        value: [],
        error: error as Error,
        metadata: this.createMetadata('executeValidatedTransformation.critical_error', context, performance.now() - startTime)
      };
    }
  }

  private createMetadata(operation: string, context: DataFlowContext, executionTime: number) {
    return {
      timestamp: new Date().toISOString(),
      operation,
      context: `${context.pipelineId}.${context.stageId}.${operation}`,
      performance: {
        executionTime,
        memoryUsage: 0,
        operationCount: 1
      }
    };
  }
}

// ===== SINGLETON INSTANCE =====
export const enterpriseStrategyValidationOrchestrator = new EnterpriseStrategyValidationOrchestrator();