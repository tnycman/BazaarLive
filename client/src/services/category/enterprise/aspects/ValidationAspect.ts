/**
 * Enterprise Validation Aspect
 * 
 * Provides cross-cutting concern for validation operations with:
 * - Pure validation logic separation
 * - Performance monitoring and caching
 * - Validation result analytics
 * - Health monitoring for validation rules
 * - Comprehensive validation context preservation
 * 
 * @fileoverview Enterprise-grade validation with AOP compliance
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Result } from '../patterns/Result';

// ===== VALIDATION TYPES =====

export interface ValidationContext {
  readonly configKey: string;
  readonly contextId?: string;
  readonly validationType: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

export interface ValidationRule {
  readonly name: string;
  readonly description: string;
  readonly validator: (value: unknown) => ValidationRuleResult;
  readonly priority: number;
  readonly category: string;
}

export interface ValidationRuleResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly executionTime: number;
  readonly ruleName: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly passedRules: string[];
  readonly failedRules: string[];
  readonly executionTime: number;
  readonly context: ValidationContext;
}

export interface ValidationMetrics {
  readonly totalValidations: number;
  readonly successfulValidations: number;
  readonly failedValidations: number;
  readonly averageExecutionTime: number;
  readonly ruleMetrics: Map<string, {
    executions: number;
    failures: number;
    averageTime: number;
  }>;
  readonly lastHealthCheck: number;
}

// ===== VALIDATION CACHE =====

interface ValidationCacheEntry {
  readonly result: ValidationResult;
  readonly timestamp: number;
  readonly accessCount: number;
  readonly lastAccess: number;
}

// ===== VALIDATION ASPECT =====

/**
 * Enterprise Validation Aspect
 * 
 * Handles pure validation logic with comprehensive cross-cutting concerns:
 * - Validation rule management and execution
 * - Performance monitoring and caching
 * - Validation analytics and health monitoring
 * - Context preservation and audit trails
 */
export class ValidationAspect {
  private static readonly instance = new ValidationAspect();
  
  // Cache Configuration
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
  private static readonly CACHE_CLEANUP_INTERVAL = 30 * 1000; // 30 seconds
  
  // Internal State
  private readonly validationRules = new Map<string, ValidationRule>();
  private readonly validationCache = new Map<string, ValidationCacheEntry>();
  private readonly metrics: ValidationMetrics = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    averageExecutionTime: 0,
    ruleMetrics: new Map(),
    lastHealthCheck: Date.now()
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.initializeDefaultRules();
    this.startCacheCleanup();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ValidationAspect {
    return ValidationAspect.instance;
  }
  
  /**
   * Perform comprehensive validation with caching and analytics
   */
  public validateValue<T>(
    value: unknown,
    validator: (value: unknown) => { isValid: boolean; errors: string[] },
    context: ValidationContext
  ): Result<ValidationResult, Error> {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(value, context);
      
      // Check cache first
      const cachedResult = this.getCachedValidation(cacheKey);
      if (cachedResult.isSuccess) {
        this.updateMetrics('cache_hit', Date.now() - startTime, true);
        return cachedResult;
      }
      
      // Perform validation
      const validationResult = this.performValidation(value, validator, context, startTime);
      
      // Cache result
      this.cacheValidation(cacheKey, validationResult);
      
      // Update metrics
      this.updateMetrics('validation', Date.now() - startTime, validationResult.isValid);
      
      return Result.success(validationResult);
      
    } catch (error) {
      this.updateMetrics('error', Date.now() - startTime, false);
      return Result.failure(
        new Error(`Validation failed for ${context.configKey}: ${(error as Error).message}`)
      );
    }
  }
  
  /**
   * Perform validation with comprehensive rule execution
   */
  private performValidation(
    value: unknown,
    validator: (value: unknown) => { isValid: boolean; errors: string[] },
    context: ValidationContext,
    startTime: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const passedRules: string[] = [];
    const failedRules: string[] = [];
    
    // Execute primary validator
    const primaryResult = validator(value);
    
    if (!primaryResult.isValid) {
      errors.push(...primaryResult.errors);
      failedRules.push('primary_validator');
    } else {
      passedRules.push('primary_validator');
    }
    
    // Execute additional rules based on validation type
    const additionalRules = this.getRelevantRules(context.validationType);
    
    for (const rule of additionalRules) {
      const ruleStartTime = Date.now();
      
      try {
        const ruleResult = rule.validator(value);
        const ruleExecutionTime = Date.now() - ruleStartTime;
        
        // Update rule metrics
        this.updateRuleMetrics(rule.name, ruleExecutionTime, ruleResult.isValid);
        
        if (!ruleResult.isValid) {
          errors.push(...ruleResult.errors);
          failedRules.push(rule.name);
        } else {
          passedRules.push(rule.name);
        }
        
        warnings.push(...ruleResult.warnings);
        
      } catch (error) {
        const ruleExecutionTime = Date.now() - ruleStartTime;
        this.updateRuleMetrics(rule.name, ruleExecutionTime, false);
        
        errors.push(`Rule ${rule.name} execution failed: ${(error as Error).message}`);
        failedRules.push(rule.name);
      }
    }
    
    const executionTime = Date.now() - startTime;
    const isValid = errors.length === 0;
    
    return {
      isValid,
      errors,
      warnings,
      passedRules,
      failedRules,
      executionTime,
      context
    };
  }
  
  /**
   * Get relevant validation rules for type
   */
  private getRelevantRules(validationType: string): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    this.validationRules.forEach((rule) => {
      if (rule.category === validationType || rule.category === 'universal') {
        rules.push(rule);
      }
    });
    
    // Sort by priority (higher priority first)
    return rules.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Generate cache key for validation
   */
  private generateCacheKey(value: unknown, context: ValidationContext): string {
    const valueHash = this.hashValue(value);
    const contextHash = this.hashContext(context);
    return `${valueHash}:${contextHash}`;
  }
  
  /**
   * Hash value for cache key
   */
  private hashValue(value: unknown): string {
    try {
      const serialized = JSON.stringify(value);
      // Simple hash function for demonstration
      let hash = 0;
      for (let i = 0; i < serialized.length; i++) {
        const char = serialized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    } catch {
      return 'unhashable';
    }
  }
  
  /**
   * Hash context for cache key
   */
  private hashContext(context: ValidationContext): string {
    const contextString = `${context.configKey}:${context.validationType}:${context.contextId || ''}`;
    let hash = 0;
    for (let i = 0; i < contextString.length; i++) {
      const char = contextString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  /**
   * Get cached validation result
   */
  private getCachedValidation(cacheKey: string): Result<ValidationResult, Error> {
    const cached = this.validationCache.get(cacheKey);
    
    if (!cached) {
      return Result.failure(new Error('No cached validation found'));
    }
    
    // Check TTL
    const age = Date.now() - cached.timestamp;
    if (age > ValidationAspect.CACHE_TTL_MS) {
      this.validationCache.delete(cacheKey);
      return Result.failure(new Error('Cached validation expired'));
    }
    
    // Update access tracking
    const updatedEntry: ValidationCacheEntry = {
      ...cached,
      accessCount: cached.accessCount + 1,
      lastAccess: Date.now()
    };
    
    this.validationCache.set(cacheKey, updatedEntry);
    
    return Result.success(cached.result);
  }
  
  /**
   * Cache validation result
   */
  private cacheValidation(cacheKey: string, result: ValidationResult): void {
    // Implement LRU eviction if cache is full
    if (this.validationCache.size >= ValidationAspect.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }
    
    const cacheEntry: ValidationCacheEntry = {
      result,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now()
    };
    
    this.validationCache.set(cacheKey, cacheEntry);
  }
  
  /**
   * Evict least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;
    
    this.validationCache.forEach((entry, key) => {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.validationCache.delete(oldestKey);
    }
  }
  
  /**
   * Update validation metrics
   */
  private updateMetrics(operation: string, duration: number, success: boolean): void {
    const mutableMetrics = this.metrics as any;
    
    if (operation === 'validation') {
      mutableMetrics.totalValidations++;
      if (success) {
        mutableMetrics.successfulValidations++;
      } else {
        mutableMetrics.failedValidations++;
      }
      
      // Update average execution time
      const total = mutableMetrics.totalValidations;
      mutableMetrics.averageExecutionTime = 
        (mutableMetrics.averageExecutionTime * (total - 1) + duration) / total;
    }
    
    mutableMetrics.lastHealthCheck = Date.now();
  }
  
  /**
   * Update rule-specific metrics
   */
  private updateRuleMetrics(ruleName: string, duration: number, success: boolean): void {
    const current = this.metrics.ruleMetrics.get(ruleName) || {
      executions: 0,
      failures: 0,
      averageTime: 0
    };
    
    const updated = {
      executions: current.executions + 1,
      failures: current.failures + (success ? 0 : 1),
      averageTime: (current.averageTime * current.executions + duration) / (current.executions + 1)
    };
    
    this.metrics.ruleMetrics.set(ruleName, updated);
  }
  
  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Universal validation rules
    this.registerRule({
      name: 'not_null',
      description: 'Value must not be null or undefined',
      validator: (value) => ({
        isValid: value !== null && value !== undefined,
        errors: value === null || value === undefined ? ['Value cannot be null or undefined'] : [],
        warnings: [],
        executionTime: 0,
        ruleName: 'not_null'
      }),
      priority: 100,
      category: 'universal'
    });
    
    this.registerRule({
      name: 'type_consistency',
      description: 'Value type should be consistent',
      validator: (value) => ({
        isValid: typeof value !== 'undefined',
        errors: typeof value === 'undefined' ? ['Value type is undefined'] : [],
        warnings: [],
        executionTime: 0,
        ruleName: 'type_consistency'
      }),
      priority: 90,
      category: 'universal'
    });
    
    // Configuration-specific rules
    this.registerRule({
      name: 'config_structure',
      description: 'Configuration should have valid structure',
      validator: (value) => {
        const isObject = typeof value === 'object' && value !== null;
        return {
          isValid: isObject,
          errors: !isObject ? ['Configuration must be an object'] : [],
          warnings: [],
          executionTime: 0,
          ruleName: 'config_structure'
        };
      },
      priority: 80,
      category: 'configuration'
    });
  }
  
  /**
   * Register new validation rule
   */
  public registerRule(rule: ValidationRule): void {
    this.validationRules.set(rule.name, rule);
  }
  
  /**
   * Unregister validation rule
   */
  public unregisterRule(ruleName: string): void {
    this.validationRules.delete(ruleName);
  }
  
  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, ValidationAspect.CACHE_CLEANUP_INTERVAL);
  }
  
  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.validationCache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      if (age > ValidationAspect.CACHE_TTL_MS) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.validationCache.delete(key));
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): ValidationMetrics {
    return {
      ...this.metrics,
      ruleMetrics: new Map(this.metrics.ruleMetrics)
    };
  }
  
  /**
   * Get cache statistics
   */
  public getCacheStatistics() {
    return {
      size: this.validationCache.size,
      maxSize: ValidationAspect.MAX_CACHE_SIZE,
      hitRate: this.calculateCacheHitRate(),
      entries: Array.from(this.validationCache.entries()).map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
        lastAccess: entry.lastAccess
      }))
    };
  }
  
  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const total = this.metrics.totalValidations;
    if (total === 0) return 0;
    
    // Approximate hit rate based on cache size and total validations
    const estimatedHits = Math.min(total, this.validationCache.size * 2);
    return estimatedHits / total;
  }
  
  /**
   * Perform health check
   */
  public performHealthCheck(): {
    healthy: boolean;
    issues: string[];
    metrics: ValidationMetrics;
    cacheStats: any;
  } {
    const issues: string[] = [];
    
    // Check failure rate
    const total = this.metrics.totalValidations;
    if (total > 0) {
      const failureRate = this.metrics.failedValidations / total;
      if (failureRate > 0.05) { // 5% failure rate threshold
        issues.push(`High validation failure rate: ${(failureRate * 100).toFixed(1)}%`);
      }
    }
    
    // Check average execution time
    if (this.metrics.averageExecutionTime > 100) { // 100ms threshold
      issues.push(`High average execution time: ${this.metrics.averageExecutionTime.toFixed(1)}ms`);
    }
    
    // Check cache efficiency
    const cacheStats = this.getCacheStatistics();
    if (cacheStats.hitRate < 0.6) { // 60% hit rate threshold
      issues.push(`Low cache hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    }
    
    // Check rule performance
    this.metrics.ruleMetrics.forEach((ruleMetrics, ruleName) => {
      const ruleFailureRate = ruleMetrics.failures / ruleMetrics.executions;
      if (ruleFailureRate > 0.1) { // 10% rule failure threshold
        issues.push(`High failure rate for rule ${ruleName}: ${(ruleFailureRate * 100).toFixed(1)}%`);
      }
    });
    
    return {
      healthy: issues.length === 0,
      issues,
      metrics: this.getMetrics(),
      cacheStats
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
    this.validationCache.clear();
    this.validationRules.clear();
  }
}

// ===== SINGLETON EXPORT =====

/**
 * Singleton instance of ValidationAspect
 */
export const validationAspect = ValidationAspect.getInstance();