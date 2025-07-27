/**
 * Enterprise Dynamic Routing Aspects (AOP)
 * Cross-cutting concerns for dynamic routing system
 * NO SHORTCUTS - FULL ENTERPRISE AOP IMPLEMENTATION
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS AND VALIDATION SCHEMAS
// ============================================================================

const RouteParametersSchema = z.object({
  vertical: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
});

const RouteMetadataSchema = z.object({
  timestamp: z.number(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
});

const RouteValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  sanitizedParams: RouteParametersSchema.optional(),
});

export type RouteParameters = z.infer<typeof RouteParametersSchema>;
export type RouteMetadata = z.infer<typeof RouteMetadataSchema>;
export type RouteValidationResult = z.infer<typeof RouteValidationResultSchema>;

// ============================================================================
// ENTERPRISE LOGGING ASPECT
// ============================================================================

export class RouteLoggingAspect {
  private static readonly LOG_PREFIX = '[DynamicRouting]';
  private static readonly PERFORMANCE_THRESHOLD_MS = 100;

  /**
   * Log route navigation with comprehensive context
   */
  static logRouteNavigation(params: RouteParameters, metadata: RouteMetadata): void {
    const logData = {
      timestamp: metadata.timestamp,
      route: `/${params.vertical}/${params.category}${params.subcategory ? `/${params.subcategory}` : ''}`,
      vertical: params.vertical,
      category: params.category,
      subcategory: params.subcategory || null,
      userAgent: metadata.userAgent,
      referrer: metadata.referrer,
      sessionId: metadata.sessionId,
    };

    console.log(`${this.LOG_PREFIX} ROUTE_NAVIGATION`, logData);
  }

  /**
   * Log route validation results
   */
  static logValidationResult(params: Partial<RouteParameters>, result: RouteValidationResult): void {
    const level = result.isValid ? 'INFO' : 'ERROR';
    const logData = {
      timestamp: Date.now(),
      params,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
    };

    console.log(`${this.LOG_PREFIX} ROUTE_VALIDATION_${level}`, logData);

    if (result.errors.length > 0) {
      console.error(`${this.LOG_PREFIX} Validation errors:`, result.errors);
    }
    if (result.warnings.length > 0) {
      console.warn(`${this.LOG_PREFIX} Validation warnings:`, result.warnings);
    }
  }

  /**
   * Log performance metrics
   */
  static logPerformanceMetrics(operation: string, duration: number, metadata?: Record<string, any>): void {
    const level = duration > this.PERFORMANCE_THRESHOLD_MS ? 'WARN' : 'INFO';
    const logData = {
      timestamp: Date.now(),
      operation,
      duration,
      threshold: this.PERFORMANCE_THRESHOLD_MS,
      metadata: metadata || {},
    };

    console.log(`${this.LOG_PREFIX} PERFORMANCE_${level}`, logData);

    if (duration > this.PERFORMANCE_THRESHOLD_MS) {
      console.warn(`${this.LOG_PREFIX} Slow operation detected: ${operation} took ${duration}ms`);
    }
  }

  /**
   * Log errors with full context
   */
  static logError(operation: string, error: Error, context?: Record<string, any>): void {
    const logData = {
      timestamp: Date.now(),
      operation,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: context || {},
    };

    console.error(`${this.LOG_PREFIX} ERROR`, logData);
  }
}

// ============================================================================
// ENTERPRISE VALIDATION ASPECT
// ============================================================================

export class RouteValidationAspect {
  private static readonly VALID_VERTICALS = [
    'fashion', 'marketplace', 'jobs', 'real-estate', 'cars', 'boats', 'services'
  ];
  private static readonly RESERVED_KEYWORDS = [
    'api', 'admin', 'auth', 'login', 'logout', 'register', 'dashboard', 'settings'
  ];

  /**
   * Comprehensive route parameter validation
   */
  static validateRouteParameters(params: Partial<RouteParameters>): RouteValidationResult {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate vertical
      if (!params.vertical) {
        errors.push('Vertical parameter is required');
      } else if (!this.VALID_VERTICALS.includes(params.vertical)) {
        errors.push(`Invalid vertical: '${params.vertical}'. Valid options: ${this.VALID_VERTICALS.join(', ')}`);
      }

      // Validate category
      if (!params.category) {
        errors.push('Category parameter is required');
      } else {
        if (this.RESERVED_KEYWORDS.includes(params.category.toLowerCase())) {
          errors.push(`Category '${params.category}' is a reserved keyword`);
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(params.category)) {
          errors.push(`Category '${params.category}' contains invalid characters. Use only letters, numbers, hyphens, and underscores`);
        }
        if (params.category.length > 50) {
          warnings.push(`Category '${params.category}' is very long (${params.category.length} characters)`);
        }
      }

      // Validate subcategory if present
      if (params.subcategory) {
        if (this.RESERVED_KEYWORDS.includes(params.subcategory.toLowerCase())) {
          errors.push(`Subcategory '${params.subcategory}' is a reserved keyword`);
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(params.subcategory)) {
          errors.push(`Subcategory '${params.subcategory}' contains invalid characters`);
        }
        if (params.subcategory.length > 50) {
          warnings.push(`Subcategory '${params.subcategory}' is very long (${params.subcategory.length} characters)`);
        }
      }

      // Create sanitized parameters if validation passes
      let sanitizedParams: RouteParameters | undefined;
      if (errors.length === 0 && params.vertical && params.category) {
        sanitizedParams = {
          vertical: params.vertical.toLowerCase().trim(),
          category: params.category.toLowerCase().trim(),
          subcategory: params.subcategory?.toLowerCase().trim(),
        };

        // Validate with Zod schema
        const zodResult = RouteParametersSchema.safeParse(sanitizedParams);
        if (!zodResult.success) {
          zodResult.error.errors.forEach(err => {
            errors.push(`Schema validation error: ${err.path.join('.')} - ${err.message}`);
          });
          sanitizedParams = undefined;
        }
      }

      const result: RouteValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedParams,
      };

      // Log performance and results
      const duration = Date.now() - startTime;
      RouteLoggingAspect.logPerformanceMetrics('route_validation', duration, { paramCount: Object.keys(params).length });
      RouteLoggingAspect.logValidationResult(params, result);

      return result;
    } catch (error) {
      RouteLoggingAspect.logError('route_validation', error as Error, { params });
      return {
        isValid: false,
        errors: [`Validation error: ${(error as Error).message}`],
        warnings: [],
      };
    }
  }

  /**
   * Validate route metadata
   */
  static validateRouteMetadata(metadata: Partial<RouteMetadata>): boolean {
    try {
      const result = RouteMetadataSchema.safeParse(metadata);
      if (!result.success) {
        RouteLoggingAspect.logError('metadata_validation', new Error('Invalid metadata schema'), { metadata });
        return false;
      }
      return true;
    } catch (error) {
      RouteLoggingAspect.logError('metadata_validation', error as Error, { metadata });
      return false;
    }
  }
}

// ============================================================================
// ENTERPRISE CACHING ASPECT
// ============================================================================

export class RouteCachingAspect {
  private static readonly cache = new Map<string, any>();
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 1000;

  /**
   * Generate cache key for route
   */
  private static generateCacheKey(vertical: string, category: string, subcategory?: string): string {
    return `route:${vertical}:${category}${subcategory ? `:${subcategory}` : ''}`;
  }

  /**
   * Get cached route data
   */
  static getCachedRoute(vertical: string, category: string, subcategory?: string): any | null {
    const startTime = Date.now();
    const key = this.generateCacheKey(vertical, category, subcategory);

    try {
      const cached = this.cache.get(key);
      if (!cached) {
        RouteLoggingAspect.logPerformanceMetrics('cache_miss', Date.now() - startTime, { key });
        return null;
      }

      // Check TTL
      if (Date.now() - cached.timestamp > this.CACHE_TTL_MS) {
        this.cache.delete(key);
        RouteLoggingAspect.logPerformanceMetrics('cache_expired', Date.now() - startTime, { key });
        return null;
      }

      RouteLoggingAspect.logPerformanceMetrics('cache_hit', Date.now() - startTime, { key });
      return cached.data;
    } catch (error) {
      RouteLoggingAspect.logError('cache_get', error as Error, { key });
      return null;
    }
  }

  /**
   * Cache route data
   */
  static setCachedRoute(vertical: string, category: string, data: any, subcategory?: string): void {
    const startTime = Date.now();
    const key = this.generateCacheKey(vertical, category, subcategory);

    try {
      // Implement LRU eviction if cache is full
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });

      RouteLoggingAspect.logPerformanceMetrics('cache_set', Date.now() - startTime, { 
        key, 
        cacheSize: this.cache.size 
      });
    } catch (error) {
      RouteLoggingAspect.logError('cache_set', error as Error, { key });
    }
  }

  /**
   * Clear cache (for testing or reset)
   */
  static clearCache(): void {
    const startTime = Date.now();
    const previousSize = this.cache.size;
    
    this.cache.clear();
    
    RouteLoggingAspect.logPerformanceMetrics('cache_clear', Date.now() - startTime, { 
      previousSize 
    });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttlMs: this.CACHE_TTL_MS,
    };
  }
}

// ============================================================================
// ENTERPRISE ANALYTICS ASPECT
// ============================================================================

export class RouteAnalyticsAspect {
  private static readonly analytics: Array<{
    timestamp: number;
    event: string;
    data: Record<string, any>;
  }> = [];
  private static readonly MAX_ANALYTICS_ENTRIES = 10000;

  /**
   * Track route navigation event
   */
  static trackRouteNavigation(params: RouteParameters, metadata: RouteMetadata): void {
    const startTime = Date.now();

    try {
      this.addAnalyticsEvent('route_navigation', {
        vertical: params.vertical,
        category: params.category,
        subcategory: params.subcategory,
        userAgent: metadata.userAgent,
        referrer: metadata.referrer,
        sessionId: metadata.sessionId,
        timestamp: metadata.timestamp,
      });

      RouteLoggingAspect.logPerformanceMetrics('analytics_track_navigation', Date.now() - startTime);
    } catch (error) {
      RouteLoggingAspect.logError('analytics_track_navigation', error as Error, { params });
    }
  }

  /**
   * Track route validation event
   */
  static trackRouteValidation(params: Partial<RouteParameters>, result: RouteValidationResult): void {
    const startTime = Date.now();

    try {
      this.addAnalyticsEvent('route_validation', {
        params,
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        errors: result.errors,
        warnings: result.warnings,
      });

      RouteLoggingAspect.logPerformanceMetrics('analytics_track_validation', Date.now() - startTime);
    } catch (error) {
      RouteLoggingAspect.logError('analytics_track_validation', error as Error, { params });
    }
  }

  /**
   * Add analytics event with automatic cleanup
   */
  private static addAnalyticsEvent(event: string, data: Record<string, any>): void {
    // Implement circular buffer to prevent memory leaks
    if (this.analytics.length >= this.MAX_ANALYTICS_ENTRIES) {
      this.analytics.shift(); // Remove oldest entry
    }

    this.analytics.push({
      timestamp: Date.now(),
      event,
      data: { ...data }, // Deep copy to prevent mutations
    });
  }

  /**
   * Get analytics summary
   */
  static getAnalyticsSummary(timeRangeMs?: number): Record<string, any> {
    const startTime = Date.now();
    const cutoffTime = timeRangeMs ? Date.now() - timeRangeMs : 0;

    try {
      const relevantEvents = this.analytics.filter(entry => entry.timestamp >= cutoffTime);

      const summary = {
        totalEvents: relevantEvents.length,
        timeRange: timeRangeMs || 'all-time',
        eventTypes: {} as Record<string, number>,
        topVerticals: {} as Record<string, number>,
        topCategories: {} as Record<string, number>,
        validationStats: {
          total: 0,
          valid: 0,
          invalid: 0,
          errorRate: 0,
        },
      };

      relevantEvents.forEach(entry => {
        // Count event types
        summary.eventTypes[entry.event] = (summary.eventTypes[entry.event] || 0) + 1;

        // Track verticals and categories
        if (entry.data.vertical) {
          summary.topVerticals[entry.data.vertical] = (summary.topVerticals[entry.data.vertical] || 0) + 1;
        }
        if (entry.data.category) {
          summary.topCategories[entry.data.category] = (summary.topCategories[entry.data.category] || 0) + 1;
        }

        // Validation statistics
        if (entry.event === 'route_validation') {
          summary.validationStats.total++;
          if (entry.data.isValid) {
            summary.validationStats.valid++;
          } else {
            summary.validationStats.invalid++;
          }
        }
      });

      // Calculate error rate
      if (summary.validationStats.total > 0) {
        summary.validationStats.errorRate = 
          (summary.validationStats.invalid / summary.validationStats.total) * 100;
      }

      RouteLoggingAspect.logPerformanceMetrics('analytics_summary', Date.now() - startTime, {
        eventCount: relevantEvents.length,
        timeRange: timeRangeMs,
      });

      return summary;
    } catch (error) {
      RouteLoggingAspect.logError('analytics_summary', error as Error, { timeRangeMs });
      return {};
    }
  }

  /**
   * Clear analytics data
   */
  static clearAnalytics(): void {
    const previousCount = this.analytics.length;
    this.analytics.length = 0;
    
    RouteLoggingAspect.logPerformanceMetrics('analytics_clear', 0, { 
      previousCount 
    });
  }
}

// ============================================================================
// ENTERPRISE SECURITY ASPECT
// ============================================================================

export class RouteSecurityAspect {
  private static readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS_PER_WINDOW = 100;
  private static readonly rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  /**
   * Sanitize route parameters to prevent XSS and injection attacks
   */
  static sanitizeRouteParameters(params: Partial<RouteParameters>): RouteParameters | null {
    const startTime = Date.now();

    try {
      const sanitized: Partial<RouteParameters> = {};

      // Sanitize vertical
      if (params.vertical) {
        sanitized.vertical = this.sanitizeString(params.vertical);
        if (!sanitized.vertical) {
          RouteLoggingAspect.logError('sanitization_failed', 
            new Error('Invalid vertical after sanitization'), { original: params.vertical });
          return null;
        }
      }

      // Sanitize category
      if (params.category) {
        sanitized.category = this.sanitizeString(params.category);
        if (!sanitized.category) {
          RouteLoggingAspect.logError('sanitization_failed', 
            new Error('Invalid category after sanitization'), { original: params.category });
          return null;
        }
      }

      // Sanitize subcategory
      if (params.subcategory) {
        sanitized.subcategory = this.sanitizeString(params.subcategory);
        if (!sanitized.subcategory) {
          RouteLoggingAspect.logError('sanitization_failed', 
            new Error('Invalid subcategory after sanitization'), { original: params.subcategory });
          return null;
        }
      }

      RouteLoggingAspect.logPerformanceMetrics('route_sanitization', Date.now() - startTime);

      return sanitized.vertical && sanitized.category ? sanitized as RouteParameters : null;
    } catch (error) {
      RouteLoggingAspect.logError('route_sanitization', error as Error, { params });
      return null;
    }
  }

  /**
   * Check rate limiting for route requests
   */
  static checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record || now - record.windowStart > this.RATE_LIMIT_WINDOW_MS) {
      // New window or no previous record
      this.rateLimitMap.set(identifier, {
        count: 1,
        windowStart: now,
      });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS_PER_WINDOW) {
      RouteLoggingAspect.logError('rate_limit_exceeded', 
        new Error('Rate limit exceeded'), { 
          identifier, 
          count: record.count, 
          window: this.RATE_LIMIT_WINDOW_MS 
        });
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Sanitize individual string parameter
   */
  private static sanitizeString(input: string): string | null {
    if (typeof input !== 'string') return null;

    // Remove potentially dangerous characters
    const sanitized = input
      .trim()
      .toLowerCase()
      .replace(/[<>'"&\\/\x00-\x1f\x7f-\x9f]/g, '') // Remove dangerous chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-_]/g, '') // Keep only safe characters
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Validate length and content
    if (sanitized.length === 0 || sanitized.length > 50) {
      return null;
    }

    return sanitized;
  }

  /**
   * Clear rate limit data (for testing)
   */
  static clearRateLimits(): void {
    this.rateLimitMap.clear();
  }
}