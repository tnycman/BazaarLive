/**
 * Enterprise Listing Data Validation Orchestrator
 * AOP-compliant orchestration layer for comprehensive data validation
 * Integrates with category strategies using enterprise-grade patterns
 */

import { dataIntegrityAspect, AspectResult, AspectExecutionContext, EnterpriseDataIntegrityAspect } from './DataIntegrityAspectFramework';
import { RawListingData, CategorySpecificListingData, CategoryStrategy } from '../category/CategoryDomainTypes';
import { z } from 'zod';

// ===== ORCHESTRATOR INTERFACES =====
export interface ListingValidationResult<T> {
  readonly success: boolean;
  readonly data: T[];
  readonly validationReport: ValidationReport;
  readonly performanceMetrics: OrchestrationMetrics;
}

export interface ValidationReport {
  readonly totalItems: number;
  readonly validItems: number;
  readonly correctedItems: number;
  readonly removedItems: number;
  readonly warnings: readonly ValidationWarning[];
  readonly errors: readonly ValidationError[];
}

export interface ValidationWarning {
  readonly index: number;
  readonly field: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  readonly index: number;
  readonly field: string;
  readonly message: string;
  readonly recoverable: boolean;
}

export interface OrchestrationMetrics {
  readonly totalExecutionTime: number;
  readonly validationTime: number;
  readonly transformationTime: number;
  readonly aspectExecutionTime: number;
  readonly memoryUsage: number;
  readonly throughput: number;
}

// ===== ENHANCED VALIDATION SCHEMAS =====
const EnhancedRawListingSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty').optional(),
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  price: z.string().regex(/^\$?\d+(\.\d{2})?$/, 'Invalid price format').optional(),
  category: z.string().min(1, 'Category cannot be empty').optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  condition: z.enum(['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair']).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  userId: z.string().min(1, 'User ID cannot be empty').optional(),
  createdAt: z.string().datetime('Invalid date format').optional(),
  updatedAt: z.string().datetime('Invalid date format').optional(),
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    source: z.string().optional(),
    verified: z.boolean().optional()
  }).passthrough().optional()
}).passthrough();

const CategorySpecificListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  price: z.string(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  condition: z.enum(['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair']).optional(),
  images: z.array(z.string()).optional(),
  userId: z.string().min(1),
  createdAt: z.string(),
  domainSpecificData: z.object({}).passthrough().optional(),
  categoryValidation: z.object({
    isValid: z.boolean(),
    confidence: z.number().min(0).max(1),
    inferredCategory: z.string().optional(),
    validationRules: z.array(z.string())
  }).optional(),
  recommendedFilters: z.array(z.string()).optional(),
  metadata: z.object({}).passthrough().optional()
}).passthrough();

// ===== ENTERPRISE LISTING DATA VALIDATION ORCHESTRATOR =====
export class EnterpriseListingDataValidationOrchestrator {
  private readonly name = 'EnterpriseListingDataValidationOrchestrator';
  private readonly version = '1.0.0';
  public readonly dataIntegrityAspect: EnterpriseDataIntegrityAspect;

  constructor() {
    this.dataIntegrityAspect = dataIntegrityAspect;
    console.log(`[${this.name}] Initialized v${this.version} with enterprise AOP compliance`);
  }

  /**
   * Enterprise-grade validation of raw listing data with comprehensive AOP aspects
   */
  async validateRawListingData(
    rawData: unknown,
    source: string,
    validationLevel: 'strict' | 'standard' | 'lenient' = 'standard'
  ): Promise<ListingValidationResult<RawListingData>> {
    const startTime = performance.now();
    const context = dataIntegrityAspect.createContext('validateRawListingData', source, 'RawListingData[]', validationLevel);

    console.log(`[${this.name}] Starting raw listing data validation for source: ${source}`);

    // Phase 1: Data Integrity Validation
    const integrityResult = dataIntegrityAspect.validateDataIntegrity<RawListingData>(rawData, context);
    
    if (!integrityResult.success) {
      console.error(`[${this.name}] Data integrity validation failed:`, integrityResult.error?.message);
      
      return {
        success: false,
        data: [],
        validationReport: {
          totalItems: 0,
          validItems: 0,
          correctedItems: 0,
          removedItems: 0,
          warnings: [],
          errors: [{
            index: -1,
            field: 'data_integrity',
            message: integrityResult.error?.message || 'Data integrity validation failed',
            recoverable: false
          }]
        },
        performanceMetrics: {
          totalExecutionTime: performance.now() - startTime,
          validationTime: performance.now() - startTime,
          transformationTime: 0,
          aspectExecutionTime: integrityResult.metadata.performance.executionTime,
          memoryUsage: integrityResult.metadata.performance.memoryUsage,
          throughput: 0
        }
      };
    }

    // Phase 2: Schema-based validation with error recovery
    const validationTime = performance.now();
    const validatedData: RawListingData[] = [];
    const warnings: ValidationWarning[] = [];
    const errors: ValidationError[] = [];
    let correctedItems = 0;

    for (let i = 0; i < integrityResult.value.length; i++) {
      const item = integrityResult.value[i];
      
      try {
        const validatedItem = EnhancedRawListingSchema.parse(item);
        validatedData.push(validatedItem as RawListingData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          let itemRecovered = false;
          
          // Attempt data recovery based on validation level
          if (validationLevel !== 'strict') {
            const recoveredItem = this.attemptDataRecovery(item, error, i);
            
            if (recoveredItem) {
              validatedData.push(recoveredItem);
              correctedItems++;
              itemRecovered = true;
              
              warnings.push({
                index: i,
                field: 'multiple',
                message: `Item corrected with recovery: ${error.errors.map(e => e.message).join(', ')}`,
                severity: 'medium'
              });
            }
          }
          
          if (!itemRecovered) {
            errors.push({
              index: i,
              field: 'schema_validation',
              message: `Schema validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
              recoverable: validationLevel !== 'strict'
            });
          }
        }
      }
    }

    const validationEndTime = performance.now();

    console.log(`[${this.name}] Raw listing validation completed:`, {
      source,
      totalItems: integrityResult.value.length,
      validItems: validatedData.length,
      correctedItems,
      errors: errors.length,
      warnings: warnings.length,
      executionTime: validationEndTime - startTime
    });

    return {
      success: true,
      data: validatedData,
      validationReport: {
        totalItems: integrityResult.value.length,
        validItems: validatedData.length,
        correctedItems,
        removedItems: integrityResult.value.length - validatedData.length,
        warnings,
        errors
      },
      performanceMetrics: {
        totalExecutionTime: validationEndTime - startTime,
        validationTime: validationEndTime - validationTime,
        transformationTime: 0,
        aspectExecutionTime: integrityResult.metadata.performance.executionTime,
        memoryUsage: integrityResult.metadata.performance.memoryUsage,
        throughput: validatedData.length / ((validationEndTime - startTime) / 1000)
      }
    };
  }

  /**
   * Enterprise-grade validation of category-specific listing data with strategy integration
   */
  async validateCategorySpecificData(
    rawData: unknown,
    strategy: CategoryStrategy,
    source: string,
    validationLevel: 'strict' | 'standard' | 'lenient' = 'standard'
  ): Promise<ListingValidationResult<CategorySpecificListingData>> {
    const startTime = performance.now();
    const context = dataIntegrityAspect.createContext(
      'validateCategorySpecificData', 
      `${source}_${strategy.domain.category}`, 
      'CategorySpecificListingData[]', 
      validationLevel
    );

    console.log(`[${this.name}] Starting category-specific validation for ${strategy.domain.category} category`);

    // Phase 1: Raw data validation
    const rawValidationResult = await this.validateRawListingData(rawData, source, validationLevel);
    
    if (!rawValidationResult.success || rawValidationResult.data.length === 0) {
      console.warn(`[${this.name}] Raw validation failed or no valid data for category ${strategy.domain.category}`);
      
      return {
        success: false,
        data: [],
        validationReport: rawValidationResult.validationReport,
        performanceMetrics: {
          ...rawValidationResult.performanceMetrics,
          totalExecutionTime: performance.now() - startTime
        }
      };
    }

    // Phase 2: Strategy transformation with validation
    const transformationStartTime = performance.now();
    let transformedData: CategorySpecificListingData[] = [];
    
    try {
      transformedData = strategy.transformListingData(rawValidationResult.data);
      
      if (!Array.isArray(transformedData)) {
        throw new Error(`Strategy transformation returned non-array data: ${typeof transformedData}`);
      }
    } catch (error) {
      console.error(`[${this.name}] Strategy transformation failed for ${strategy.domain.category}:`, error);
      
      return {
        success: false,
        data: [],
        validationReport: {
          ...rawValidationResult.validationReport,
          errors: [
            ...rawValidationResult.validationReport.errors,
            {
              index: -1,
              field: 'strategy_transformation',
              message: `Strategy transformation failed: ${(error as Error).message}`,
              recoverable: false
            }
          ]
        },
        performanceMetrics: {
          ...rawValidationResult.performanceMetrics,
          transformationTime: performance.now() - transformationStartTime,
          totalExecutionTime: performance.now() - startTime
        }
      };
    }

    // Phase 3: Category-specific data validation
    const categoryValidationResult = dataIntegrityAspect.validateTypeConformance(
      transformedData,
      CategorySpecificListingSchema,
      context
    );

    if (!categoryValidationResult.success) {
      console.error(`[${this.name}] Category-specific validation failed:`, categoryValidationResult.error?.message);
      
      return {
        success: false,
        data: [],
        validationReport: {
          ...rawValidationResult.validationReport,
          errors: [
            ...rawValidationResult.validationReport.errors,
            {
              index: -1,
              field: 'category_validation',
              message: categoryValidationResult.error?.message || 'Category validation failed',
              recoverable: false
            }
          ]
        },
        performanceMetrics: {
          ...rawValidationResult.performanceMetrics,
          transformationTime: performance.now() - transformationStartTime,
          aspectExecutionTime: rawValidationResult.performanceMetrics.aspectExecutionTime + categoryValidationResult.metadata.performance.executionTime,
          totalExecutionTime: performance.now() - startTime
        }
      };
    }

    const finalData = categoryValidationResult.value;
    const transformationEndTime = performance.now();

    console.log(`[${this.name}] Category-specific validation completed for ${strategy.domain.category}:`, {
      rawItems: rawValidationResult.data.length,
      transformedItems: transformedData.length,
      validatedItems: finalData.length,
      strategy: strategy.domain.category,
      executionTime: transformationEndTime - startTime
    });

    return {
      success: true,
      data: finalData,
      validationReport: {
        totalItems: rawValidationResult.data.length,
        validItems: finalData.length,
        correctedItems: rawValidationResult.validationReport.correctedItems,
        removedItems: rawValidationResult.data.length - finalData.length,
        warnings: rawValidationResult.validationReport.warnings,
        errors: rawValidationResult.validationReport.errors
      },
      performanceMetrics: {
        totalExecutionTime: transformationEndTime - startTime,
        validationTime: rawValidationResult.performanceMetrics.validationTime,
        transformationTime: transformationEndTime - transformationStartTime,
        aspectExecutionTime: rawValidationResult.performanceMetrics.aspectExecutionTime + categoryValidationResult.metadata.performance.executionTime,
        memoryUsage: Math.max(rawValidationResult.performanceMetrics.memoryUsage, categoryValidationResult.metadata.performance.memoryUsage),
        throughput: finalData.length / ((transformationEndTime - startTime) / 1000)
      }
    };
  }

  /**
   * Data recovery mechanism for failed validation items
   */
  private attemptDataRecovery(item: unknown, error: z.ZodError, index: number): RawListingData | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const itemObj = item as Record<string, unknown>;
    
    try {
      // Create a minimal valid structure with corrected fields
      const recoveredItem: RawListingData = {
        id: typeof itemObj.id === 'string' ? itemObj.id : `recovered-${index}-${Date.now()}`,
        title: typeof itemObj.title === 'string' && itemObj.title.length > 0 ? itemObj.title : 'Untitled Item',
        description: typeof itemObj.description === 'string' ? itemObj.description : '',
        price: this.normalizePrice(itemObj.price),
        category: typeof itemObj.category === 'string' && itemObj.category.length > 0 ? itemObj.category : 'uncategorized',
        subcategory: typeof itemObj.subcategory === 'string' ? itemObj.subcategory : undefined,
        brand: typeof itemObj.brand === 'string' ? itemObj.brand : undefined,
        size: typeof itemObj.size === 'string' ? itemObj.size : undefined,
        condition: this.normalizeCondition(itemObj.condition),
        images: Array.isArray(itemObj.images) ? itemObj.images.filter(img => typeof img === 'string') : [],
        userId: typeof itemObj.userId === 'string' && itemObj.userId.length > 0 ? itemObj.userId : `user-${index}`,
        createdAt: typeof itemObj.createdAt === 'string' ? itemObj.createdAt : new Date().toISOString(),
        updatedAt: typeof itemObj.updatedAt === 'string' ? itemObj.updatedAt : new Date().toISOString(),
        metadata: typeof itemObj.metadata === 'object' && itemObj.metadata !== null ? itemObj.metadata as Record<string, any> : {}
      };

      // Validate the recovered item
      const validated = EnhancedRawListingSchema.parse(recoveredItem);
      return validated as RawListingData;
      
    } catch (recoveryError) {
      console.warn(`[${this.name}] Data recovery failed for item at index ${index}:`, recoveryError);
      return null;
    }
  }

  private normalizePrice(price: unknown): string {
    if (typeof price === 'string') {
      // Try to extract numeric value and format as currency
      const match = price.match(/\d+(\.\d{2})?/);
      if (match) {
        return `$${match[0]}`;
      }
    }
    
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    
    return '$0.00';
  }

  private normalizeCondition(condition: unknown): 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair' | undefined {
    if (typeof condition !== 'string') {
      return undefined;
    }
    
    const normalized = condition.toLowerCase().trim();
    
    if (['new_with_tags', 'new with tags', 'nwt'].includes(normalized)) {
      return 'new_with_tags';
    }
    
    if (['new_without_tags', 'new without tags', 'nwot', 'new'].includes(normalized)) {
      return 'new_without_tags';
    }
    
    if (['excellent', 'exc', 'like new'].includes(normalized)) {
      return 'excellent';
    }
    
    if (['good', 'gd'].includes(normalized)) {
      return 'good';
    }
    
    if (['fair', 'fr', 'worn'].includes(normalized)) {
      return 'fair';
    }
    
    return undefined;
  }
}

// ===== SINGLETON ORCHESTRATOR INSTANCE =====
export const listingValidationOrchestrator = new EnterpriseListingDataValidationOrchestrator();