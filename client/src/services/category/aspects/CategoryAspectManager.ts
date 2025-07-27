/**
 * Category Aspect Manager
 * Enterprise AOP implementation for cross-cutting concerns in category management
 * Coordinates all aspects with proper separation of concerns
 */

import { CategoryStrategy, CategorySelection, RawListingData, ValidationResult } from '../CategoryDomainTypes';

// Aspect Interface Definition
export interface IAspect {
  readonly name: string;
  readonly priority: number;
  before?(target: any, methodName: string, args: any[]): Promise<void> | void;
  after?(target: any, methodName: string, args: any[], result: any): Promise<any> | any;
  onError?(target: any, methodName: string, args: any[], error: Error): Promise<void> | void;
}

// Logging Aspect
export class CategoryLoggingAspect implements IAspect {
  readonly name = 'CategoryLogging';
  readonly priority = 1;
  
  private logStore: Map<string, any[]> = new Map();

  before(target: any, methodName: string, args: any[]): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      method: methodName,
      target: target.constructor.name,
      args: this.sanitizeArgs(args),
      phase: 'before'
    };
    
    this.addLog('method_calls', logEntry);
    console.log(`[CategoryAspect] BEFORE ${target.constructor.name}.${methodName}`, logEntry);
  }

  after(target: any, methodName: string, args: any[], result: any): any {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      method: methodName,
      target: target.constructor.name,
      result: this.sanitizeResult(result),
      phase: 'after'
    };
    
    this.addLog('method_results', logEntry);
    console.log(`[CategoryAspect] AFTER ${target.constructor.name}.${methodName}`, logEntry);
    
    return result;
  }

  onError(target: any, methodName: string, args: any[], error: Error): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      method: methodName,
      target: target.constructor.name,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      args: this.sanitizeArgs(args),
      phase: 'error'
    };
    
    this.addLog('errors', logEntry);
    console.error(`[CategoryAspect] ERROR ${target.constructor.name}.${methodName}`, logEntry);
  }

  private sanitizeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return { ...arg, _sanitized: true };
      }
      return arg;
    });
  }

  private sanitizeResult(result: any): any {
    if (typeof result === 'object' && result !== null) {
      return { ...result, _sanitized: true };
    }
    return result;
  }

  private addLog(category: string, entry: any): void {
    if (!this.logStore.has(category)) {
      this.logStore.set(category, []);
    }
    
    const logs = this.logStore.get(category)!;
    logs.push(entry);
    
    // Keep only last 100 entries per category
    if (logs.length > 100) {
      logs.shift();
    }
  }

  getLogs(category?: string): any[] {
    if (category) {
      return this.logStore.get(category) || [];
    }
    
    const allLogs: any[] = [];
    this.logStore.forEach((logs, key) => {
      allLogs.push(...logs);
    });
    
    return allLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}

// Validation Aspect
export class CategoryValidationAspect implements IAspect {
  readonly name = 'CategoryValidation';
  readonly priority = 2;

  before(target: any, methodName: string, args: any[]): void {
    const validationResult = this.validateMethodCall(target, methodName, args);
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed for ${methodName}: ${validationResult.errors.join(', ')}`);
    }
  }

  private validateMethodCall(target: any, methodName: string, args: any[]): ValidationResult {
    const errors: string[] = [];
    
    // Method-specific validations
    switch (methodName) {
      case 'validateSelection':
        if (!args[0] || typeof args[0] !== 'object') {
          errors.push('Selection argument must be an object');
        }
        break;
        
      case 'transformListingData':
        if (!Array.isArray(args[0])) {
          errors.push('Listing data must be an array');
        }
        break;
        
      case 'getFilterConfiguration':
        // No arguments expected
        if (args.length > 0) {
          errors.push('getFilterConfiguration expects no arguments');
        }
        break;
    }
    
    // Target validations
    if (!target.domain) {
      errors.push('Target must have a domain property');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

// Performance Aspect
export class CategoryPerformanceAspect implements IAspect {
  readonly name = 'CategoryPerformance';
  readonly priority = 3;
  
  private performanceMetrics: Map<string, any[]> = new Map();

  before(target: any, methodName: string, args: any[]): void {
    const key = `${target.constructor.name}.${methodName}`;
    const startTime = performance.now();
    
    // Store start time for this call
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    
    const metrics = this.performanceMetrics.get(key)!;
    metrics.push({
      startTime,
      args: args.length,
      timestamp: Date.now()
    });
  }

  after(target: any, methodName: string, args: any[], result: any): any {
    const key = `${target.constructor.name}.${methodName}`;
    const endTime = performance.now();
    
    const metrics = this.performanceMetrics.get(key);
    if (metrics && metrics.length > 0) {
      const currentCall = metrics[metrics.length - 1];
      const duration = endTime - currentCall.startTime;
      
      currentCall.duration = duration;
      currentCall.endTime = endTime;
      currentCall.resultSize = this.calculateResultSize(result);
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`[CategoryPerformance] Slow operation: ${key} took ${duration.toFixed(2)}ms`);
      }
      
      // Keep only last 50 metrics per method
      if (metrics.length > 50) {
        metrics.shift();
      }
    }
    
    return result;
  }

  private calculateResultSize(result: any): number {
    if (Array.isArray(result)) {
      return result.length;
    }
    if (typeof result === 'object' && result !== null) {
      return Object.keys(result).length;
    }
    return 1;
  }

  getPerformanceStats(methodKey?: string): any {
    if (methodKey) {
      const metrics = this.performanceMetrics.get(methodKey) || [];
      return this.calculateStats(metrics);
    }
    
    const allStats: Record<string, any> = {};
    this.performanceMetrics.forEach((metrics, key) => {
      allStats[key] = this.calculateStats(metrics);
    });
    
    return allStats;
  }

  private calculateStats(metrics: any[]): any {
    if (metrics.length === 0) return null;
    
    const durations = metrics.filter(m => m.duration).map(m => m.duration);
    
    return {
      callCount: metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration: durations.reduce((a, b) => a + b, 0)
    };
  }
}

// Caching Aspect
export class CategoryCachingAspect implements IAspect {
  readonly name = 'CategoryCaching';
  readonly priority = 4;
  
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly defaultTTL = 300000; // 5 minutes

  before(target: any, methodName: string, args: any[]): void {
    if (this.isCacheableMethod(methodName)) {
      const cacheKey = this.generateCacheKey(target, methodName, args);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isValidCache(cached)) {
        // Mark as cache hit for performance aspect
        (target as any)._cacheHit = cached.data;
      }
    }
  }

  after(target: any, methodName: string, args: any[], result: any): any {
    // Return cached result if available
    if ((target as any)._cacheHit) {
      const cachedResult = (target as any)._cacheHit;
      delete (target as any)._cacheHit;
      return cachedResult;
    }
    
    // Cache the result for cacheable methods
    if (this.isCacheableMethod(methodName)) {
      const cacheKey = this.generateCacheKey(target, methodName, args);
      const ttl = this.getTTLForMethod(methodName);
      
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl
      });
    }
    
    return result;
  }

  private isCacheableMethod(methodName: string): boolean {
    const cacheableMethods = [
      'getFilterConfiguration',
      'getAnalyticsConfiguration',
      'transformListingData'
    ];
    
    return cacheableMethods.includes(methodName);
  }

  private generateCacheKey(target: any, methodName: string, args: any[]): string {
    const targetName = target.constructor.name;
    const argsHash = JSON.stringify(args);
    return `${targetName}.${methodName}:${argsHash}`;
  }

  private isValidCache(cached: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private getTTLForMethod(methodName: string): number {
    const methodTTLs: Record<string, number> = {
      'getFilterConfiguration': 600000, // 10 minutes
      'getAnalyticsConfiguration': 1800000, // 30 minutes
      'transformListingData': 60000 // 1 minute
    };
    
    return methodTTLs[methodName] || this.defaultTTL;
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete: string[] = [];
      this.cache.forEach((value, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// Analytics Aspect
export class CategoryAnalyticsAspect implements IAspect {
  readonly name = 'CategoryAnalytics';
  readonly priority = 5;
  
  private events: any[] = [];

  before(target: any, methodName: string, args: any[]): void {
    this.trackEvent('method_call', {
      target: target.constructor.name,
      method: methodName,
      argsCount: args.length,
      timestamp: Date.now(),
      domain: target.domain?.category || 'unknown'
    });
  }

  after(target: any, methodName: string, args: any[], result: any): any {
    this.trackEvent('method_complete', {
      target: target.constructor.name,
      method: methodName,
      success: true,
      resultType: typeof result,
      timestamp: Date.now(),
      domain: target.domain?.category || 'unknown'
    });
    
    return result;
  }

  onError(target: any, methodName: string, args: any[], error: Error): void {
    this.trackEvent('method_error', {
      target: target.constructor.name,
      method: methodName,
      error: error.message,
      timestamp: Date.now(),
      domain: target.domain?.category || 'unknown'
    });
  }

  private trackEvent(eventType: string, data: any): void {
    this.events.push({
      type: eventType,
      ...data
    });
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  getAnalytics(): any {
    return {
      totalEvents: this.events.length,
      eventsByType: this.groupBy(this.events, 'type'),
      eventsByDomain: this.groupBy(this.events, 'domain'),
      recentEvents: this.events.slice(-10)
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
}

// Aspect Manager
export class CategoryAspectManager {
  private aspects: IAspect[] = [];

  constructor() {
    this.initializeDefaultAspects();
  }

  private initializeDefaultAspects(): void {
    this.aspects = [
      new CategoryLoggingAspect(),
      new CategoryValidationAspect(),
      new CategoryPerformanceAspect(),
      new CategoryCachingAspect(),
      new CategoryAnalyticsAspect()
    ].sort((a, b) => a.priority - b.priority);
  }

  addAspect(aspect: IAspect): void {
    this.aspects.push(aspect);
    this.aspects.sort((a, b) => a.priority - b.priority);
  }

  removeAspect(aspectName: string): void {
    this.aspects = this.aspects.filter(aspect => aspect.name !== aspectName);
  }

  async executeWithAspects<T>(
    target: any,
    methodName: string,
    originalMethod: (...args: any[]) => Promise<T> | T,
    args: any[]
  ): Promise<T> {
    try {
      // Execute before aspects
      for (const aspect of this.aspects) {
        if (aspect.before) {
          await aspect.before(target, methodName, args);
        }
      }

      // Execute original method
      const result = await originalMethod.apply(target, args);

      // Execute after aspects (in reverse order)
      let finalResult = result;
      for (let i = this.aspects.length - 1; i >= 0; i--) {
        const aspect = this.aspects[i];
        if (aspect.after) {
          finalResult = await aspect.after(target, methodName, args, finalResult) || finalResult;
        }
      }

      return finalResult;
    } catch (error) {
      // Execute error aspects
      for (const aspect of this.aspects) {
        if (aspect.onError) {
          await aspect.onError(target, methodName, args, error as Error);
        }
      }
      
      throw error;
    }
  }

  getAspectByName(name: string): IAspect | undefined {
    return this.aspects.find(aspect => aspect.name === name);
  }

  getAllAspects(): IAspect[] {
    return [...this.aspects];
  }
}

// Singleton instance
export const categoryAspectManager = new CategoryAspectManager();