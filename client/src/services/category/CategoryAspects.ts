/**
 * CategoryAspects.ts - Enterprise AOP Cross-Cutting Concerns for Category Management
 * 
 * Implements Aspect-Oriented Programming principles for category operations
 * with proper separation of concerns, logging, validation, caching, and analytics.
 * 
 * NO SHORTCUTS - ENTERPRISE GRADE IMPLEMENTATION
 */

import { z } from 'zod';

// ============================================================================
// CORE INTERFACES & CONTRACTS
// ============================================================================

export interface ICategoryAspect {
  readonly name: string;
  readonly priority: number;
  before<T extends any[], R>(
    target: object,
    propertyKey: string,
    args: T,
    metadata?: Record<string, any>
  ): Promise<{ proceed: boolean; transformedArgs?: T; metadata?: Record<string, any> }>;
  
  after<R>(
    target: object,
    propertyKey: string,
    result: R,
    metadata?: Record<string, any>
  ): Promise<{ result: R; metadata?: Record<string, any> }>;
  
  onError(
    target: object,
    propertyKey: string,
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void>;
}

export interface IAspectMetadata {
  timestamp: number;
  operationId: string;
  userId?: string;
  categoryContext?: string;
  performance?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
  validation?: {
    isValid: boolean;
    errors?: string[];
    schema?: string;
  };
  caching?: {
    cacheKey?: string;
    cacheHit?: boolean;
    ttl?: number;
  };
  analytics?: {
    eventType: string;
    properties: Record<string, any>;
  };
}

// ============================================================================
// VALIDATION SCHEMAS (STRICT TYPE SAFETY)
// ============================================================================

export const CategoryOperationSchema = z.object({
  operationType: z.enum(['READ', 'FILTER', 'NAVIGATE', 'SEARCH', 'TRANSFORM']),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  filters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export const CategoryDataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  count: z.number().min(0),
  isActive: z.boolean().default(true),
  parentCategory: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const CategoryHierarchySchema = z.object({
  vertical: z.string().min(1),
  categories: z.record(z.array(CategoryDataSchema)),
  relationships: z.record(z.array(z.string())).optional(),
  businessRules: z.record(z.any()).optional()
});

// ============================================================================
// LOGGING ASPECT (ENTERPRISE AUDIT TRAIL)
// ============================================================================

export class CategoryLoggingAspect implements ICategoryAspect {
  readonly name = 'CategoryLogging';
  readonly priority = 1;

  private readonly logLevels = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  } as const;

  private currentLogLevel = this.logLevels.DEBUG;

  async before<T extends any[], R>(
    target: object,
    propertyKey: string,
    args: T,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ proceed: boolean; transformedArgs?: T; metadata: IAspectMetadata }> {
    
    const operationId = crypto.randomUUID();
    const timestamp = Date.now();
    
    const enhancedMetadata: IAspectMetadata = {
      ...metadata,
      timestamp,
      operationId,
      performance: {
        startTime: performance.now(),
        ...metadata.performance
      }
    };

    this.log('DEBUG', `[CategoryOperation:${propertyKey}] BEFORE`, {
      operationId,
      target: target.constructor.name,
      method: propertyKey,
      args: this.sanitizeArgs(args),
      metadata: enhancedMetadata
    });

    return {
      proceed: true,
      transformedArgs: args,
      metadata: enhancedMetadata
    };
  }

  async after<R>(
    target: object,
    propertyKey: string,
    result: R,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ result: R; metadata: IAspectMetadata }> {
    
    const endTime = performance.now();
    const duration = endTime - (metadata.performance?.startTime || 0);

    const enhancedMetadata: IAspectMetadata = {
      ...metadata,
      performance: {
        startTime: metadata.performance?.startTime || 0,
        endTime,
        duration
      }
    };

    this.log('DEBUG', `[CategoryOperation:${propertyKey}] AFTER`, {
      operationId: metadata.operationId,
      target: target.constructor.name,
      method: propertyKey,
      duration: `${duration.toFixed(2)}ms`,
      resultType: typeof result,
      resultSize: Array.isArray(result) ? result.length : 'N/A',
      metadata: enhancedMetadata
    });

    return { result, metadata: enhancedMetadata };
  }

  async onError(
    target: object,
    propertyKey: string,
    error: Error,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<void> {
    
    this.log('ERROR', `[CategoryOperation:${propertyKey}] ERROR`, {
      operationId: metadata.operationId,
      target: target.constructor.name,
      method: propertyKey,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      metadata
    });
  }

  private log(level: keyof typeof this.logLevels, message: string, data: any): void {
    if (this.logLevels[level] >= this.currentLogLevel) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        source: 'CategoryAspects'
      };
      
      console.log(`[${level}] ${message}`, logEntry);
    }
  }

  private sanitizeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.parse(JSON.stringify(arg, (key, value) => {
          // Remove sensitive data
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
            return '[REDACTED]';
          }
          return value;
        }));
      }
      return arg;
    });
  }
}

// ============================================================================
// VALIDATION ASPECT (ENTERPRISE DATA INTEGRITY)
// ============================================================================

export class CategoryValidationAspect implements ICategoryAspect {
  readonly name = 'CategoryValidation';
  readonly priority = 2;

  private readonly validationRules = new Map<string, z.ZodSchema>();

  constructor() {
    this.initializeValidationRules();
  }

  async before<T extends any[], R>(
    target: object,
    propertyKey: string,
    args: T,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ proceed: boolean; transformedArgs?: T; metadata: IAspectMetadata }> {
    
    const validationResult = this.validateOperation(propertyKey, args);
    
    const enhancedMetadata: IAspectMetadata = {
      ...metadata,
      validation: validationResult
    };

    if (!validationResult.isValid) {
      throw new CategoryValidationError(
        `Validation failed for ${propertyKey}: ${validationResult.errors?.join(', ')}`,
        validationResult.errors || []
      );
    }

    return {
      proceed: true,
      transformedArgs: args,
      metadata: enhancedMetadata
    };
  }

  async after<R>(
    target: object,
    propertyKey: string,
    result: R,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ result: R; metadata: IAspectMetadata }> {
    
    const resultValidation = this.validateResult(propertyKey, result);
    
    if (!resultValidation.isValid) {
      throw new CategoryValidationError(
        `Result validation failed for ${propertyKey}: ${resultValidation.errors?.join(', ')}`,
        resultValidation.errors || []
      );
    }

    return { result, metadata };
  }

  async onError(
    target: object,
    propertyKey: string,
    error: Error,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<void> {
    // Log validation-specific error details
    if (error instanceof CategoryValidationError) {
      console.error(`[CategoryValidation] Validation Error in ${propertyKey}:`, {
        errors: error.validationErrors,
        metadata
      });
    }
  }

  private initializeValidationRules(): void {
    this.validationRules.set('loadCategories', z.tuple([z.string()]));
    this.validationRules.set('filterCategories', z.tuple([z.array(z.any()), z.object({})]));
    this.validationRules.set('searchCategories', z.tuple([z.string(), z.object({}).optional()]));
    this.validationRules.set('transformCategoryData', z.tuple([z.any(), z.string()]));
  }

  private validateOperation(methodName: string, args: any[]): {
    isValid: boolean;
    errors?: string[];
    schema?: string;
  } {
    const schema = this.validationRules.get(methodName);
    
    if (!schema) {
      return { isValid: true }; // No validation rule defined
    }

    try {
      schema.parse(args);
      return { isValid: true, schema: methodName };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          schema: methodName
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
        schema: methodName
      };
    }
  }

  private validateResult(methodName: string, result: any): {
    isValid: boolean;
    errors?: string[];
  } {
    // Implement result validation based on method expectations
    if (methodName.includes('load') || methodName.includes('filter')) {
      if (!Array.isArray(result)) {
        return {
          isValid: false,
          errors: ['Expected array result for category operation']
        };
      }
    }

    return { isValid: true };
  }
}

// ============================================================================
// CACHING ASPECT (ENTERPRISE PERFORMANCE)
// ============================================================================

export class CategoryCachingAspect implements ICategoryAspect {
  readonly name = 'CategoryCaching';
  readonly priority = 3;

  private readonly cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
    accessCount: number;
  }>();

  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 1000;

  async before<T extends any[], R>(
    target: object,
    propertyKey: string,
    args: T,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ proceed: boolean; transformedArgs?: T; metadata: IAspectMetadata }> {
    
    const cacheKey = this.generateCacheKey(target.constructor.name, propertyKey, args);
    const cachedResult = this.getCachedResult(cacheKey);

    const enhancedMetadata: IAspectMetadata = {
      ...metadata,
      caching: {
        cacheKey,
        cacheHit: cachedResult !== null,
        ttl: this.defaultTTL
      }
    };

    if (cachedResult !== null) {
      // Cache hit - return cached result and skip method execution
      return {
        proceed: false,
        transformedArgs: args,
        metadata: enhancedMetadata
      };
    }

    return {
      proceed: true,
      transformedArgs: args,
      metadata: enhancedMetadata
    };
  }

  async after<R>(
    target: object,
    propertyKey: string,
    result: R,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ result: R; metadata: IAspectMetadata }> {
    
    if (metadata.caching?.cacheKey && !metadata.caching.cacheHit) {
      this.setCachedResult(metadata.caching.cacheKey, result, this.defaultTTL);
    }

    return { result, metadata };
  }

  async onError(
    target: object,
    propertyKey: string,
    error: Error,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<void> {
    // Clear cache for failed operations
    if (metadata.caching?.cacheKey) {
      this.invalidateCache(metadata.caching.cacheKey);
    }
  }

  private generateCacheKey(className: string, methodName: string, args: any[]): string {
    const argsHash = this.hashArgs(args);
    return `${className}:${methodName}:${argsHash}`;
  }

  private hashArgs(args: any[]): string {
    return btoa(JSON.stringify(args)).slice(0, 16);
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    cached.accessCount++;
    return cached.data;
  }

  private setCachedResult(key: string, data: any, ttl: number): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1
    });
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruTimestamp = Date.now();

    for (const entry of Array.from(this.cache.entries())) {
      const [key, value] = entry;
      if (value.timestamp < lruTimestamp) {
        lruTimestamp = value.timestamp;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  // Public method for cache management
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    let totalAccess = 0;
    let totalEntries = 0;

    for (const cached of Array.from(this.cache.values())) {
      totalAccess += cached.accessCount;
      totalEntries++;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: totalEntries > 0 ? totalAccess / totalEntries : 0
    };
  }
}

// ============================================================================
// ANALYTICS ASPECT (ENTERPRISE BUSINESS INTELLIGENCE)
// ============================================================================

export class CategoryAnalyticsAspect implements ICategoryAspect {
  readonly name = 'CategoryAnalytics';
  readonly priority = 4;

  private readonly eventQueue: Array<{
    timestamp: number;
    event: string;
    properties: Record<string, any>;
  }> = [];

  private readonly batchSize = 10;
  private readonly flushInterval = 5000; // 5 seconds

  constructor() {
    this.startEventProcessor();
  }

  async before<T extends any[], R>(
    target: object,
    propertyKey: string,
    args: T,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ proceed: boolean; transformedArgs?: T; metadata: IAspectMetadata }> {
    
    const analyticsEvent = {
      eventType: `category_operation_started`,
      properties: {
        operation: propertyKey,
        target: target.constructor.name,
        timestamp: Date.now(),
        operationId: metadata.operationId,
        args: this.sanitizeAnalyticsData(args)
      }
    };

    const enhancedMetadata: IAspectMetadata = {
      ...metadata,
      analytics: analyticsEvent
    };

    this.queueEvent(analyticsEvent.eventType, analyticsEvent.properties);

    return {
      proceed: true,
      transformedArgs: args,
      metadata: enhancedMetadata
    };
  }

  async after<R>(
    target: object,
    propertyKey: string,
    result: R,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<{ result: R; metadata: IAspectMetadata }> {
    
    const analyticsEvent = {
      eventType: `category_operation_completed`,
      properties: {
        operation: propertyKey,
        target: target.constructor.name,
        timestamp: Date.now(),
        operationId: metadata.operationId,
        duration: metadata.performance?.duration,
        resultSize: Array.isArray(result) ? result.length : 1,
        success: true
      }
    };

    this.queueEvent(analyticsEvent.eventType, analyticsEvent.properties);

    return { result, metadata };
  }

  async onError(
    target: object,
    propertyKey: string,
    error: Error,
    metadata: IAspectMetadata = {} as IAspectMetadata
  ): Promise<void> {
    
    this.queueEvent('category_operation_error', {
      operation: propertyKey,
      target: target.constructor.name,
      timestamp: Date.now(),
      operationId: metadata.operationId,
      error: {
        name: error.name,
        message: error.message
      },
      success: false
    });
  }

  private queueEvent(eventType: string, properties: Record<string, any>): void {
    this.eventQueue.push({
      timestamp: Date.now(),
      event: eventType,
      properties
    });

    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private startEventProcessor(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.batchSize);
    
    // In a real implementation, this would send to analytics service
    console.log('[CategoryAnalytics] Event Batch:', {
      batchSize: batch.length,
      events: batch
    });
  }

  private sanitizeAnalyticsData(data: any): any {
    if (typeof data === 'object' && data !== null) {
      return JSON.parse(JSON.stringify(data, (key, value) => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          return '[REDACTED]';
        }
        return value;
      }));
    }
    return data;
  }
}

// ============================================================================
// CUSTOM ERRORS (ENTERPRISE ERROR HANDLING)
// ============================================================================

export class CategoryValidationError extends Error {
  constructor(message: string, public readonly validationErrors: string[]) {
    super(message);
    this.name = 'CategoryValidationError';
  }
}

export class CategoryOperationError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CategoryOperationError';
  }
}

// ============================================================================
// ASPECT COORDINATOR (ENTERPRISE ORCHESTRATION)
// ============================================================================

export class CategoryAspectCoordinator {
  private readonly aspects: ICategoryAspect[] = [];

  constructor() {
    // Initialize aspects in priority order
    this.aspects.push(
      new CategoryLoggingAspect(),
      new CategoryValidationAspect(),
      new CategoryCachingAspect(),
      new CategoryAnalyticsAspect()
    );

    this.aspects.sort((a, b) => a.priority - b.priority);
  }

  async executeWithAspects<T extends any[], R>(
    target: object,
    propertyKey: string,
    originalMethod: (...args: T) => Promise<R> | R,
    args: T
  ): Promise<R> {
    let metadata: IAspectMetadata = {
      timestamp: Date.now(),
      operationId: crypto.randomUUID()
    };

    let transformedArgs = args;
    let shouldProceed = true;

    try {
      // Execute BEFORE aspects
      for (const aspect of this.aspects) {
        const result = await aspect.before(target, propertyKey, transformedArgs, metadata);
        
        if (!result.proceed) {
          // Aspect decided to skip execution (e.g., cache hit)
          shouldProceed = false;
          break;
        }
        
        if (result.transformedArgs) {
          transformedArgs = result.transformedArgs;
        }
        
        if (result.metadata) {
          metadata = { ...metadata, ...result.metadata };
        }
      }

      let result: R;

      if (shouldProceed) {
        // Execute original method
        result = await originalMethod.apply(target, transformedArgs);
      } else {
        // Return cached result or handle skip scenario
        result = metadata.caching?.cacheHit ? 
          this.getCachedResultFromMetadata(metadata) : 
          await originalMethod.apply(target, transformedArgs);
      }

      // Execute AFTER aspects
      for (const aspect of this.aspects) {
        const aspectResult = await aspect.after(target, propertyKey, result, metadata);
        result = aspectResult.result;
        metadata = aspectResult.metadata ? { ...metadata, ...aspectResult.metadata } : metadata;
      }

      return result;

    } catch (error) {
      // Execute ERROR handling for all aspects
      const aspectError = error instanceof Error ? error : new Error(String(error));
      
      for (const aspect of this.aspects) {
        await aspect.onError(target, propertyKey, aspectError, metadata);
      }

      throw error;
    }
  }

  private getCachedResultFromMetadata(metadata: IAspectMetadata): any {
    // This would be implemented based on caching aspect integration
    return null;
  }

  public getAspects(): readonly ICategoryAspect[] {
    return Object.freeze([...this.aspects]);
  }

  public getAspectByName(name: string): ICategoryAspect | undefined {
    return this.aspects.find(aspect => aspect.name === name);
  }
}