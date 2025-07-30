/**
 * Enterprise Error Loading Aspect
 * 
 * Provides cross-cutting concern for dynamic error class loading with:
 * - Intelligent caching with LRU eviction
 * - Circuit breaker pattern for failure protection
 * - Performance monitoring and metrics
 * - Fallback strategies for import failures
 * - Health monitoring and diagnostics
 * 
 * @fileoverview Enterprise-grade error class loading with AOP compliance
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Result } from '../patterns/Result';
import { ConfigurationError } from '../errors/ConfigurationErrors';

// ===== ERROR LOADING TYPES =====

export interface ErrorClassMetadata {
  readonly className: string;
  readonly modulePath: string;
  readonly loadTimestamp: number;
  readonly accessCount: number;
  readonly lastAccessTime: number;
  readonly loadDuration: number;
}

export interface ErrorLoadingMetrics {
  readonly totalLoads: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly failedLoads: number;
  readonly averageLoadTime: number;
  readonly circuitBreakerTrips: number;
  readonly lastHealthCheck: number;
}

export interface CircuitBreakerState {
  readonly isOpen: boolean;
  readonly failureCount: number;
  readonly lastFailureTime: number;
  readonly nextRetryTime: number;
  readonly state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// ===== ERROR LOADING ASPECT =====

/**
 * Enterprise Error Loading Aspect
 * 
 * Handles dynamic error class loading with comprehensive cross-cutting concerns:
 * - Caching strategy with intelligent eviction
 * - Circuit breaker protection against cascade failures
 * - Performance monitoring and health checks
 * - Fallback error creation for import failures
 */
export class ErrorLoadingAspect {
  private static readonly instance = new ErrorLoadingAspect();
  
  // Cache Configuration
  private static readonly MAX_CACHE_SIZE = 50;
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly LRU_CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  
  // Circuit Breaker Configuration
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly TIMEOUT_MS = 30 * 1000; // 30 seconds
  private static readonly RETRY_DELAY_MS = 5 * 1000; // 5 seconds
  
  // Internal State
  private readonly errorClassCache = new Map<string, {
    errorClass: any;
    metadata: ErrorClassMetadata;
  }>();
  
  private readonly circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextRetryTime: 0,
    state: 'CLOSED'
  };
  
  private readonly metrics: ErrorLoadingMetrics = {
    totalLoads: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failedLoads: 0,
    averageLoadTime: 0,
    circuitBreakerTrips: 0,
    lastHealthCheck: Date.now()
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.startCacheCleanup();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorLoadingAspect {
    return ErrorLoadingAspect.instance;
  }
  
  /**
   * Load error class with comprehensive error handling and caching
   */
  public async loadErrorClass(
    className: string,
    modulePath: string = '../errors/ConfigurationErrors'
  ): Promise<Result<any, Error>> {
    const startTime = Date.now();
    
    try {
      // Check circuit breaker state
      if (this.isCircuitBreakerOpen()) {
        return this.handleCircuitBreakerOpen(className);
      }
      
      // Check cache first
      const cachedResult = this.getCachedErrorClass(className);
      if (cachedResult.isSuccess) {
        this.updateMetrics('cache_hit', Date.now() - startTime);
        return cachedResult;
      }
      
      // Load from module
      const loadResult = await this.loadFromModule(className, modulePath);
      
      if (loadResult.isSuccess) {
        // Cache successful load
        this.cacheErrorClass(className, loadResult.value, modulePath, Date.now() - startTime);
        this.updateMetrics('cache_miss_success', Date.now() - startTime);
        this.resetCircuitBreaker();
        return loadResult;
      } else {
        // Handle load failure
        this.recordCircuitBreakerFailure();
        this.updateMetrics('load_failure', Date.now() - startTime);
        return this.createFallbackError(className, loadResult.error);
      }
      
    } catch (error) {
      this.recordCircuitBreakerFailure();
      this.updateMetrics('load_error', Date.now() - startTime);
      return this.createFallbackError(className, error as Error);
    }
  }
  
  /**
   * Get cached error class
   */
  private getCachedErrorClass(className: string): Result<any, Error> {
    const cached = this.errorClassCache.get(className);
    
    if (!cached) {
      return Result.failure(new Error(`Error class ${className} not found in cache`));
    }
    
    // Check TTL
    const age = Date.now() - cached.metadata.loadTimestamp;
    if (age > ErrorLoadingAspect.CACHE_TTL_MS) {
      this.errorClassCache.delete(className);
      return Result.failure(new Error(`Cached error class ${className} expired`));
    }
    
    // Update access metrics
    cached.metadata = {
      ...cached.metadata,
      accessCount: cached.metadata.accessCount + 1,
      lastAccessTime: Date.now()
    };
    
    return Result.success(cached.errorClass);
  }
  
  /**
   * Load error class from module
   */
  private async loadFromModule(className: string, modulePath: string): Promise<Result<any, Error>> {
    try {
      const module = await import(modulePath);
      
      if (!module[className]) {
        return Result.failure(
          new Error(`Error class ${className} not found in module ${modulePath}`)
        );
      }
      
      return Result.success(module[className]);
      
    } catch (error) {
      return Result.failure(
        new Error(`Failed to load module ${modulePath}: ${(error as Error).message}`)
      );
    }
  }
  
  /**
   * Cache error class with metadata
   */
  private cacheErrorClass(
    className: string,
    errorClass: any,
    modulePath: string,
    loadDuration: number
  ): void {
    // Implement LRU eviction if cache is full
    if (this.errorClassCache.size >= ErrorLoadingAspect.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }
    
    const metadata: ErrorClassMetadata = {
      className,
      modulePath,
      loadTimestamp: Date.now(),
      accessCount: 1,
      lastAccessTime: Date.now(),
      loadDuration
    };
    
    this.errorClassCache.set(className, { errorClass, metadata });
  }
  
  /**
   * Evict least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;
    
    this.errorClassCache.forEach(({ metadata }, key) => {
      if (metadata.lastAccessTime < oldestTime) {
        oldestTime = metadata.lastAccessTime;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.errorClassCache.delete(oldestKey);
    }
  }
  
  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(): boolean {
    const now = Date.now();
    
    if (this.circuitBreaker.state === 'OPEN') {
      if (now >= this.circuitBreaker.nextRetryTime) {
        // Transition to half-open
        (this.circuitBreaker as any).state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle circuit breaker open state
   */
  private handleCircuitBreakerOpen(className: string): Result<any, Error> {
    const error = new Error(
      `Circuit breaker open: Error class loading temporarily disabled for ${className}`
    );
    return this.createFallbackError(className, error);
  }
  
  /**
   * Record circuit breaker failure
   */
  private recordCircuitBreakerFailure(): void {
    const mutableBreaker = this.circuitBreaker as any;
    mutableBreaker.failureCount++;
    mutableBreaker.lastFailureTime = Date.now();
    
    if (mutableBreaker.failureCount >= ErrorLoadingAspect.FAILURE_THRESHOLD) {
      mutableBreaker.isOpen = true;
      mutableBreaker.state = 'OPEN';
      mutableBreaker.nextRetryTime = Date.now() + ErrorLoadingAspect.RETRY_DELAY_MS;
      
      const mutableMetrics = this.metrics as any;
      mutableMetrics.circuitBreakerTrips++;
    }
  }
  
  /**
   * Reset circuit breaker
   */
  private resetCircuitBreaker(): void {
    const mutableBreaker = this.circuitBreaker as any;
    mutableBreaker.isOpen = false;
    mutableBreaker.failureCount = 0;
    mutableBreaker.state = 'CLOSED';
  }
  
  /**
   * Create fallback error when loading fails
   */
  private createFallbackError(className: string, originalError: Error): Result<any, Error> {
    // Create generic error class that matches expected interface
    class FallbackConfigurationError extends Error {
      public readonly code: string;
      public readonly contextId?: string;
      public readonly timestamp: string;
      
      constructor(message: string, code: string = 'FALLBACK_ERROR') {
        super(message);
        this.name = className;
        this.code = code;
        this.timestamp = new Date().toISOString();
      }
      
      getErrorInfo() {
        return {
          success: false,
          error: this.message,
          code: this.code,
          name: this.name,
          timestamp: this.timestamp,
          fallbackReason: `Failed to load ${className}: ${originalError.message}`
        };
      }
    }
    
    return Result.success(FallbackConfigurationError);
  }
  
  /**
   * Update performance metrics
   */
  private updateMetrics(operation: string, duration: number): void {
    const mutableMetrics = this.metrics as any;
    
    switch (operation) {
      case 'cache_hit':
        mutableMetrics.cacheHits++;
        break;
      case 'cache_miss_success':
        mutableMetrics.cacheMisses++;
        mutableMetrics.totalLoads++;
        break;
      case 'load_failure':
      case 'load_error':
        mutableMetrics.failedLoads++;
        break;
    }
    
    // Update average load time
    if (operation !== 'cache_hit') {
      const totalOperations = mutableMetrics.totalLoads + mutableMetrics.failedLoads;
      mutableMetrics.averageLoadTime = 
        (mutableMetrics.averageLoadTime * (totalOperations - 1) + duration) / totalOperations;
    }
    
    mutableMetrics.lastHealthCheck = Date.now();
  }
  
  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, ErrorLoadingAspect.LRU_CLEANUP_INTERVAL);
  }
  
  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.errorClassCache.forEach(({ metadata }, key) => {
      const age = now - metadata.loadTimestamp;
      if (age > ErrorLoadingAspect.CACHE_TTL_MS) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.errorClassCache.delete(key));
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): ErrorLoadingMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get circuit breaker state
   */
  public getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStatistics() {
    return {
      size: this.errorClassCache.size,
      maxSize: ErrorLoadingAspect.MAX_CACHE_SIZE,
      entries: Array.from(this.errorClassCache.entries()).map(([key, { metadata }]) => ({
        key,
        className: metadata.className,
        modulePath: metadata.modulePath,
        loadTimestamp: metadata.loadTimestamp,
        accessCount: metadata.accessCount,
        lastAccessTime: metadata.lastAccessTime,
        loadDuration: metadata.loadDuration
      }))
    };
  }
  
  /**
   * Perform health check
   */
  public performHealthCheck(): {
    healthy: boolean;
    issues: string[];
    metrics: ErrorLoadingMetrics;
    circuitBreaker: CircuitBreakerState;
  } {
    const issues: string[] = [];
    
    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      issues.push('Circuit breaker is open - error loading disabled');
    }
    
    // Check failure rate
    const totalOps = this.metrics.totalLoads + this.metrics.failedLoads;
    if (totalOps > 0) {
      const failureRate = this.metrics.failedLoads / totalOps;
      if (failureRate > 0.1) { // 10% failure rate threshold
        issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
      }
    }
    
    // Check cache efficiency
    const cacheOps = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (cacheOps > 0) {
      const hitRate = this.metrics.cacheHits / cacheOps;
      if (hitRate < 0.7) { // 70% hit rate threshold
        issues.push(`Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
      }
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      metrics: this.getMetrics(),
      circuitBreaker: this.getCircuitBreakerState()
    };
  }
  
  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.errorClassCache.clear();
  }
}

// ===== SINGLETON EXPORT =====

/**
 * Singleton instance of ErrorLoadingAspect
 */
export const errorLoadingAspect = ErrorLoadingAspect.getInstance();