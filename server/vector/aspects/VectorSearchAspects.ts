/**
 * Vector Search Aspects - Phase 5 Task 5.1
 * Enterprise AOP aspects for pgvector integration with comprehensive cross-cutting concerns
 */

import { AspectContext } from '../../aop/IAuthenticationAspect';

// Vector Search Operation Types
export enum VectorSearchOperationType {
  SEMANTIC_SEARCH = 'semantic_search',
  SIMILARITY_SEARCH = 'similarity_search',
  PREFERENCE_UPDATE = 'preference_update',
  EMBEDDING_GENERATION = 'embedding_generation',
  RECOMMENDATION_QUERY = 'recommendation_query',
  BATCH_PROCESSING = 'batch_processing'
}

// Vector Search Context Interface
export interface VectorSearchContext extends AspectContext {
  operation: VectorSearchOperationType;
  query?: string;
  listingId?: string;
  embeddingType?: 'title' | 'description' | 'combined';
  vectorDimensions?: number;
  similarityThreshold?: number;
  resultCount?: number;
  processingTime?: number;
  embeddingModel?: string;
  queryComplexity?: 'simple' | 'complex' | 'batch';
  startTime?: number;
  success?: boolean;
  cachedResult?: any;
  result?: any;
}

// Aspect Interface for Vector Search
export interface VectorSearchAspect {
  readonly name: string;
  readonly priority: number;
  before(context: VectorSearchContext): Promise<void>;
  after(context: VectorSearchContext): Promise<void>;
  onError(context: VectorSearchContext, error: Error): Promise<void>;
}

/**
 * Vector Search Logging Aspect
 * Comprehensive logging for all vector search operations with structured data
 */
export class VectorSearchLoggingAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchLoggingAspect';
  readonly priority = 100;

  async before(context: VectorSearchContext): Promise<void> {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: 'info',
      component: 'VectorSearch',
      operation: context.operation,
      requestId: context.requestId,
      userId: context.userId || 'anonymous',
      metadata: {
        query: context.query?.substring(0, 100), // Truncate for logging
        embeddingType: context.embeddingType,
        vectorDimensions: context.vectorDimensions,
        similarityThreshold: context.similarityThreshold,
        resultCount: context.resultCount,
        queryComplexity: context.queryComplexity,
        embeddingModel: context.embeddingModel
      }
    };

    console.log(`[VECTOR-SEARCH-ASPECT] Starting ${context.operation}:`, JSON.stringify(logData));
  }

  async after(context: VectorSearchContext): Promise<void> {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: 'info',
      component: 'VectorSearch',
      operation: context.operation,
      requestId: context.requestId,
      userId: context.userId || 'anonymous',
      success: context.success || false,
      processingTime: context.processingTime,
      metadata: {
        resultCount: context.resultCount,
        embeddingType: context.embeddingType,
        similarityThreshold: context.similarityThreshold
      }
    };

    console.log(`[VECTOR-SEARCH-ASPECT] Completed ${context.operation}:`, JSON.stringify(logData));
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    const timestamp = new Date().toISOString();
    const errorData = {
      timestamp,
      level: 'error',
      component: 'VectorSearch',
      operation: context.operation,
      requestId: context.requestId,
      userId: context.userId || 'anonymous',
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5)
      },
      metadata: {
        query: context.query?.substring(0, 50),
        embeddingType: context.embeddingType,
        processingTime: context.processingTime
      }
    };

    console.error(`[VECTOR-SEARCH-ASPECT] Error in ${context.operation}:`, JSON.stringify(errorData));
  }
}

/**
 * Vector Search Performance Aspect
 * Performance monitoring and optimization for vector operations
 */
export class VectorSearchPerformanceAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchPerformanceAspect';
  readonly priority = 90;

  private readonly performanceThresholds = {
    [VectorSearchOperationType.SEMANTIC_SEARCH]: 500, // 500ms
    [VectorSearchOperationType.SIMILARITY_SEARCH]: 300, // 300ms
    [VectorSearchOperationType.PREFERENCE_UPDATE]: 200, // 200ms
    [VectorSearchOperationType.EMBEDDING_GENERATION]: 1000, // 1s
    [VectorSearchOperationType.RECOMMENDATION_QUERY]: 400, // 400ms
    [VectorSearchOperationType.BATCH_PROCESSING]: 5000 // 5s
  };

  async before(context: VectorSearchContext): Promise<void> {
    context.startTime = Date.now();
    
    // Set query complexity based on operation and parameters
    if (context.operation === VectorSearchOperationType.BATCH_PROCESSING) {
      context.queryComplexity = 'batch';
    } else if (context.query && context.query.length > 100) {
      context.queryComplexity = 'complex';
    } else {
      context.queryComplexity = 'simple';
    }
  }

  async after(context: VectorSearchContext): Promise<void> {
    const endTime = Date.now();
    const processingTime = endTime - (context.startTime || endTime);
    context.processingTime = processingTime;

    const threshold = this.performanceThresholds[context.operation] || 1000;
    
    if (processingTime > threshold) {
      console.warn(`[VECTOR-PERFORMANCE] Slow ${context.operation}: ${processingTime}ms (threshold: ${threshold}ms)`, {
        requestId: context.requestId,
        operation: context.operation,
        processingTime,
        threshold,
        queryComplexity: context.queryComplexity,
        resultCount: context.resultCount
      });
    }

    // Track performance metrics
    this.recordPerformanceMetric(context.operation, processingTime, context.queryComplexity || 'simple');
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    const endTime = Date.now();
    const processingTime = endTime - (context.startTime || endTime);
    context.processingTime = processingTime;

    console.error(`[VECTOR-PERFORMANCE] Error after ${processingTime}ms in ${context.operation}:`, {
      requestId: context.requestId,
      operation: context.operation,
      processingTime,
      error: error.message
    });
  }

  private recordPerformanceMetric(operation: VectorSearchOperationType, time: number, complexity: string): void {
    // In a real implementation, this would send metrics to monitoring system
    const metric = {
      timestamp: new Date().toISOString(),
      operation,
      processingTime: time,
      complexity,
      component: 'VectorSearch'
    };

    // Store or send metric data
    console.debug(`[VECTOR-METRICS]`, metric);
  }
}

/**
 * Vector Search Security Aspect
 * Security validation and access control for vector operations
 */
export class VectorSearchSecurityAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchSecurityAspect';
  readonly priority = 95;

  private readonly maxQueryLength = 1000;
  private readonly maxResultCount = 100;
  private readonly allowedModels = ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'];

  async before(context: VectorSearchContext): Promise<void> {
    // Validate query length
    if (context.query && context.query.length > this.maxQueryLength) {
      throw new Error(`Query too long: ${context.query.length} chars (max: ${this.maxQueryLength})`);
    }

    // Validate result count
    if (context.resultCount && context.resultCount > this.maxResultCount) {
      throw new Error(`Result count too high: ${context.resultCount} (max: ${this.maxResultCount})`);
    }

    // Validate embedding model
    if (context.embeddingModel && !this.allowedModels.includes(context.embeddingModel)) {
      throw new Error(`Unauthorized embedding model: ${context.embeddingModel}`);
    }

    // Sanitize query for SQL injection prevention
    if (context.query) {
      context.query = this.sanitizeQuery(context.query);
    }

    // Rate limiting check (in production, this would check Redis/cache)
    await this.checkRateLimit(context.userId || 'anonymous', context.operation);

    console.debug(`[VECTOR-SECURITY] Security validation passed for ${context.operation}`, {
      requestId: context.requestId,
      userId: context.userId,
      operation: context.operation
    });
  }

  async after(context: VectorSearchContext): Promise<void> {
    // Log successful security validation
    console.debug(`[VECTOR-SECURITY] Operation ${context.operation} completed securely`, {
      requestId: context.requestId,
      userId: context.userId,
      processingTime: context.processingTime
    });
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    // Log security-related errors
    if (error.message.includes('Query too long') || 
        error.message.includes('Result count too high') ||
        error.message.includes('Rate limit')) {
      console.warn(`[VECTOR-SECURITY] Security violation in ${context.operation}:`, {
        requestId: context.requestId,
        userId: context.userId,
        error: error.message,
        operation: context.operation
      });
    }
  }

  private sanitizeQuery(query: string): string {
    // Remove potentially dangerous SQL characters and patterns
    return query
      .replace(/[;'"\\]/g, '') // Remove SQL injection chars
      .replace(/--.*$/gm, '') // Remove SQL comments
      .replace(/\/\*.*?\*\//g, '') // Remove block comments
      .trim()
      .substring(0, this.maxQueryLength);
  }

  private async checkRateLimit(userId: string, operation: VectorSearchOperationType): Promise<void> {
    // In production, implement proper rate limiting with Redis
    const rateLimits = {
      [VectorSearchOperationType.SEMANTIC_SEARCH]: 100, // per minute
      [VectorSearchOperationType.SIMILARITY_SEARCH]: 200,
      [VectorSearchOperationType.PREFERENCE_UPDATE]: 10,
      [VectorSearchOperationType.EMBEDDING_GENERATION]: 20,
      [VectorSearchOperationType.RECOMMENDATION_QUERY]: 50,
      [VectorSearchOperationType.BATCH_PROCESSING]: 5
    };

    const limit = rateLimits[operation] || 50;
    
    // Mock rate limit check - in production use Redis with sliding window
    console.debug(`[VECTOR-SECURITY] Rate limit check passed for ${userId}: ${operation} (limit: ${limit}/min)`);
  }
}

/**
 * Vector Search Validation Aspect
 * Input validation and data integrity for vector operations
 */
export class VectorSearchValidationAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchValidationAspect';
  readonly priority = 85;

  async before(context: VectorSearchContext): Promise<void> {
    await this.validateOperationContext(context);
    console.debug(`[VECTOR-VALIDATION] Validation passed for ${context.operation}`, {
      requestId: context.requestId,
      operation: context.operation
    });
  }

  async after(context: VectorSearchContext): Promise<void> {
    // Post-operation validation if needed
    if (context.resultCount === 0 && context.operation === VectorSearchOperationType.SEMANTIC_SEARCH) {
      console.warn(`[VECTOR-VALIDATION] No results for semantic search`, {
        requestId: context.requestId,
        query: context.query?.substring(0, 50)
      });
    }
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    console.error(`[VECTOR-VALIDATION] Validation error in ${context.operation}:`, {
      requestId: context.requestId,
      error: error.message,
      operation: context.operation
    });
  }

  private async validateOperationContext(context: VectorSearchContext): Promise<void> {
    switch (context.operation) {
      case VectorSearchOperationType.SEMANTIC_SEARCH:
        this.validateSemanticSearch(context);
        break;
      case VectorSearchOperationType.SIMILARITY_SEARCH:
        this.validateSimilaritySearch(context);
        break;
      case VectorSearchOperationType.PREFERENCE_UPDATE:
        this.validatePreferenceUpdate(context);
        break;
      case VectorSearchOperationType.EMBEDDING_GENERATION:
        this.validateEmbeddingGeneration(context);
        break;
      case VectorSearchOperationType.RECOMMENDATION_QUERY:
        this.validateRecommendationQuery(context);
        break;
      case VectorSearchOperationType.BATCH_PROCESSING:
        this.validateBatchProcessing(context);
        break;
    }
  }

  private validateSemanticSearch(context: VectorSearchContext): void {
    if (!context.query || context.query.trim().length < 3) {
      throw new Error('Semantic search requires query with minimum 3 characters');
    }

    if (context.embeddingType && !['title', 'description', 'combined'].includes(context.embeddingType)) {
      throw new Error(`Invalid embedding type: ${context.embeddingType}`);
    }

    if (context.similarityThreshold && (context.similarityThreshold < 0 || context.similarityThreshold > 1)) {
      throw new Error(`Similarity threshold must be between 0 and 1: ${context.similarityThreshold}`);
    }
  }

  private validateSimilaritySearch(context: VectorSearchContext): void {
    if (!context.listingId) {
      throw new Error('Similarity search requires listingId');
    }

    if (context.resultCount && context.resultCount < 1) {
      throw new Error('Result count must be positive');
    }
  }

  private validatePreferenceUpdate(context: VectorSearchContext): void {
    if (!context.userId) {
      throw new Error('Preference update requires userId');
    }
  }

  private validateEmbeddingGeneration(context: VectorSearchContext): void {
    if (!context.listingId) {
      throw new Error('Embedding generation requires listingId');
    }

    if (context.vectorDimensions && context.vectorDimensions !== 1536) {
      throw new Error(`Unsupported vector dimensions: ${context.vectorDimensions} (expected: 1536)`);
    }
  }

  private validateRecommendationQuery(context: VectorSearchContext): void {
    if (!context.userId) {
      throw new Error('Recommendation query requires userId');
    }

    if (context.resultCount && (context.resultCount < 1 || context.resultCount > 50)) {
      throw new Error('Recommendation result count must be between 1 and 50');
    }
  }

  private validateBatchProcessing(context: VectorSearchContext): void {
    // Batch processing validation
    if (context.resultCount && context.resultCount > 1000) {
      throw new Error('Batch processing limited to 1000 items');
    }
  }
}

/**
 * Vector Search Caching Aspect
 * Intelligent caching for vector search operations with TTL management
 */
export class VectorSearchCachingAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchCachingAspect';
  readonly priority = 70;

  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 300000; // 5 minutes
  
  private readonly cacheTTLs = {
    [VectorSearchOperationType.SEMANTIC_SEARCH]: 300000, // 5 minutes
    [VectorSearchOperationType.SIMILARITY_SEARCH]: 600000, // 10 minutes
    [VectorSearchOperationType.RECOMMENDATION_QUERY]: 180000, // 3 minutes
    [VectorSearchOperationType.EMBEDDING_GENERATION]: 0, // No caching
    [VectorSearchOperationType.PREFERENCE_UPDATE]: 0, // No caching
    [VectorSearchOperationType.BATCH_PROCESSING]: 0 // No caching
  };

  async before(context: VectorSearchContext): Promise<void> {
    const cacheKey = this.generateCacheKey(context);
    const ttl = this.cacheTTLs[context.operation] || this.defaultTTL;

    if (ttl > 0) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        context.cachedResult = cached;
        console.debug(`[VECTOR-CACHE] Cache hit for ${context.operation}`, {
          requestId: context.requestId,
          cacheKey,
          operation: context.operation
        });
      } else {
        console.debug(`[VECTOR-CACHE] Cache miss for ${context.operation}`, {
          requestId: context.requestId,
          cacheKey,
          operation: context.operation
        });
      }
    }
  }

  async after(context: VectorSearchContext): Promise<void> {
    const cacheKey = this.generateCacheKey(context);
    const ttl = this.cacheTTLs[context.operation] || this.defaultTTL;

    if (ttl > 0 && context.result && !context.cachedResult) {
      this.setCache(cacheKey, context.result, ttl);
      console.debug(`[VECTOR-CACHE] Cached result for ${context.operation}`, {
        requestId: context.requestId,
        cacheKey,
        operation: context.operation,
        ttl
      });
    }

    // Clean expired cache entries periodically
    this.cleanExpiredEntries();
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    // Don't cache errors, but log cache statistics
    console.debug(`[VECTOR-CACHE] Error in ${context.operation}, cache stats:`, {
      requestId: context.requestId,
      cacheSize: this.cache.size,
      operation: context.operation
    });
  }

  private generateCacheKey(context: VectorSearchContext): string {
    const keyParts = [
      context.operation,
      context.query || '',
      context.listingId || '',
      context.userId || '',
      context.embeddingType || '',
      context.similarityThreshold || '',
      context.resultCount || ''
    ];
    
    return keyParts.join('|');
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.debug(`[VECTOR-CACHE] Cleaned ${cleaned} expired cache entries`);
    }
  }
}

/**
 * Vector Search Analytics Aspect
 * Usage analytics and business intelligence for vector operations
 */
export class VectorSearchAnalyticsAspect implements VectorSearchAspect {
  readonly name = 'VectorSearchAnalyticsAspect';
  readonly priority = 60;

  private analyticsEvents: any[] = [];
  private readonly batchSize = 10;

  async before(context: VectorSearchContext): Promise<void> {
    // Track operation start
    const startEvent = {
      eventType: 'vector_search_start',
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      userId: context.userId,
      operation: context.operation,
      metadata: {
        query: context.query?.substring(0, 100),
        embeddingType: context.embeddingType,
        resultCount: context.resultCount,
        queryComplexity: context.queryComplexity
      }
    };

    this.analyticsEvents.push(startEvent);
  }

  async after(context: VectorSearchContext): Promise<void> {
    // Track operation completion
    const completionEvent = {
      eventType: 'vector_search_complete',
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      userId: context.userId,
      operation: context.operation,
      success: context.success || false,
      processingTime: context.processingTime,
      metadata: {
        resultCount: context.resultCount,
        embeddingType: context.embeddingType,
        cached: !!context.cachedResult,
        similarityThreshold: context.similarityThreshold
      }
    };

    this.analyticsEvents.push(completionEvent);

    // Batch analytics events
    if (this.analyticsEvents.length >= this.batchSize) {
      await this.flushAnalytics();
    }

    console.debug(`[VECTOR-ANALYTICS] Tracked ${context.operation} completion`, {
      requestId: context.requestId,
      processingTime: context.processingTime,
      success: context.success
    });
  }

  async onError(context: VectorSearchContext, error: Error): Promise<void> {
    // Track operation error
    const errorEvent = {
      eventType: 'vector_search_error',
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      userId: context.userId,
      operation: context.operation,
      error: {
        message: error.message,
        name: error.name
      },
      processingTime: context.processingTime,
      metadata: {
        query: context.query?.substring(0, 50),
        embeddingType: context.embeddingType
      }
    };

    this.analyticsEvents.push(errorEvent);
    console.debug(`[VECTOR-ANALYTICS] Tracked ${context.operation} error`, {
      requestId: context.requestId,
      error: error.message
    });
  }

  private async flushAnalytics(): Promise<void> {
    if (this.analyticsEvents.length === 0) return;

    const eventsToFlush = [...this.analyticsEvents];
    this.analyticsEvents = [];

    try {
      // In production, send to analytics service
      console.debug(`[VECTOR-ANALYTICS] Flushing ${eventsToFlush.length} analytics events`);
      
      // Process analytics events for business intelligence
      this.processBusinessIntelligence(eventsToFlush);
    } catch (error) {
      console.error('[VECTOR-ANALYTICS] Failed to flush analytics:', error);
    }
  }

  private processBusinessIntelligence(events: any[]): void {
    const searchQueries = events
      .filter(e => e.eventType === 'vector_search_complete' && e.operation === VectorSearchOperationType.SEMANTIC_SEARCH)
      .map(e => e.metadata.query)
      .filter(q => q);

    if (searchQueries.length > 0) {
      console.debug(`[VECTOR-BI] Popular search patterns:`, {
        totalSearches: searchQueries.length,
        uniqueQueries: new Set(searchQueries).size
      });
    }
  }
}

// Export all aspects for aspect manager registration
export const vectorSearchAspects = [
  VectorSearchLoggingAspect,
  VectorSearchPerformanceAspect,
  VectorSearchSecurityAspect,
  VectorSearchValidationAspect,
  VectorSearchCachingAspect,
  VectorSearchAnalyticsAspect
];