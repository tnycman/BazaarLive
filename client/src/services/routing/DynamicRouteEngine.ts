/**
 * Enterprise Dynamic Route Engine
 * Core engine for dynamic routing with comprehensive AOP integration
 * NO SHORTCUTS - FULL ENTERPRISE IMPLEMENTATION
 */

import { 
  RouteParameters, 
  RouteMetadata, 
  RouteValidationResult,
  RouteLoggingAspect,
  RouteValidationAspect,
  RouteCachingAspect,
  RouteAnalyticsAspect,
  RouteSecurityAspect 
} from './DynamicRoutingAspects';
import { categoryConfigService, CategoryConfig } from '@/services/category/CategoryConfigService';

// ============================================================================
// ENTERPRISE ROUTE ENGINE INTERFACE
// ============================================================================

export interface RouteResolutionResult {
  isValid: boolean;
  config: CategoryConfig | null;
  params: RouteParameters | null;
  errors: string[];
  warnings: string[];
  metadata: {
    cacheHit: boolean;
    validationTime: number;
    resolutionTime: number;
    securityPassed: boolean;
  };
}

export interface RouteNavigationOptions {
  bypassCache?: boolean;
  bypassSecurity?: boolean;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
}

// ============================================================================
// ENTERPRISE DYNAMIC ROUTE ENGINE
// ============================================================================

export class DynamicRouteEngine {
  private static readonly instance = new DynamicRouteEngine();
  private readonly engineId = `route-engine-${Date.now()}`;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    RouteLoggingAspect.logPerformanceMetrics('engine_initialization', 0, { 
      engineId: this.engineId 
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DynamicRouteEngine {
    return this.instance;
  }

  /**
   * Resolve route with comprehensive validation and caching
   */
  async resolveRoute(
    rawParams: Partial<RouteParameters>, 
    options: RouteNavigationOptions = {}
  ): Promise<RouteResolutionResult> {
    const startTime = Date.now();
    const operationId = `resolve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    RouteLoggingAspect.logPerformanceMetrics('route_resolution_start', 0, { 
      operationId,
      params: rawParams,
      options 
    });

    try {
      // Step 1: Security validation
      const securityResult = await this.performSecurityValidation(rawParams, options, operationId);
      if (!securityResult.passed) {
        return this.createFailureResult('Security validation failed', securityResult.errors, startTime);
      }

      // Step 2: Parameter validation and sanitization
      const validationResult = this.performParameterValidation(rawParams, operationId);
      if (!validationResult.isValid || !validationResult.sanitizedParams) {
        return this.createFailureResult('Parameter validation failed', validationResult.errors, startTime);
      }

      const params = validationResult.sanitizedParams;

      // Step 3: Check cache (if not bypassed)
      let config: CategoryConfig | null = null;
      let cacheHit = false;

      if (!options.bypassCache) {
        const cachedResult = this.performCacheCheck(params, operationId);
        if (cachedResult.hit && cachedResult.config) {
          config = cachedResult.config;
          cacheHit = true;
          RouteLoggingAspect.logPerformanceMetrics('cache_hit_success', Date.now() - startTime, { operationId });
        }
      }

      // Step 4: Resolve configuration (if not cached)
      if (!config) {
        const configResult = await this.performConfigurationResolution(params, operationId);
        if (!configResult.success || !configResult.config) {
          return this.createFailureResult('Configuration resolution failed', configResult.errors, startTime);
        }
        
        config = configResult.config;

        // Cache the result
        if (!options.bypassCache) {
          this.performCacheUpdate(params, config, operationId);
        }
      }

      // Step 5: Track analytics
      await this.performAnalyticsTracking(params, options, operationId);

      // Step 6: Create successful result
      const totalTime = Date.now() - startTime;
      const result: RouteResolutionResult = {
        isValid: true,
        config,
        params,
        errors: [],
        warnings: validationResult.warnings,
        metadata: {
          cacheHit,
          validationTime: validationResult.validationTime || 0,
          resolutionTime: totalTime,
          securityPassed: true,
        },
      };

      RouteLoggingAspect.logPerformanceMetrics('route_resolution_success', totalTime, { 
        operationId,
        cacheHit,
        configType: config.title 
      });

      return result;

    } catch (error) {
      const errorResult = this.handleResolutionError(error as Error, rawParams, startTime, operationId);
      RouteLoggingAspect.logError('route_resolution_error', error as Error, { 
        operationId,
        params: rawParams 
      });
      return errorResult;
    }
  }

  /**
   * Generate route URL from parameters
   */
  generateRouteUrl(params: RouteParameters): string {
    const startTime = Date.now();
    
    try {
      // Validate parameters
      const validationResult = RouteValidationAspect.validateRouteParameters(params);
      if (!validationResult.isValid) {
        throw new Error(`Invalid parameters for URL generation: ${validationResult.errors.join(', ')}`);
      }

      // Generate URL
      let url = `/${params.vertical}/${params.category}`;
      if (params.subcategory) {
        url += `/${params.subcategory}`;
      }

      RouteLoggingAspect.logPerformanceMetrics('url_generation', Date.now() - startTime, { 
        params,
        url 
      });

      return url;
    } catch (error) {
      RouteLoggingAspect.logError('url_generation', error as Error, { params });
      throw error;
    }
  }

  /**
   * Parse URL path to route parameters
   */
  parseUrlPath(path: string): RouteParameters | null {
    const startTime = Date.now();
    
    try {
      // Remove leading slash and split path
      const segments = path.replace(/^\/+/, '').split('/').filter(Boolean);
      
      if (segments.length < 2) {
        RouteLoggingAspect.logError('url_parsing', new Error('Insufficient path segments'), { path });
        return null;
      }

      const params: Partial<RouteParameters> = {
        vertical: segments[0],
        category: segments[1],
        subcategory: segments[2] || undefined,
      };

      // Validate parsed parameters
      const validationResult = RouteValidationAspect.validateRouteParameters(params);
      if (!validationResult.isValid || !validationResult.sanitizedParams) {
        RouteLoggingAspect.logError('url_parsing_validation', 
          new Error('Parsed parameters failed validation'), { path, params });
        return null;
      }

      RouteLoggingAspect.logPerformanceMetrics('url_parsing', Date.now() - startTime, { 
        path,
        segments: segments.length 
      });

      return validationResult.sanitizedParams;
    } catch (error) {
      RouteLoggingAspect.logError('url_parsing', error as Error, { path });
      return null;
    }
  }

  /**
   * Get engine health status
   */
  getEngineHealth(): {
    status: 'healthy' | 'degraded' | 'error';
    metrics: Record<string, any>;
    issues: string[];
  } {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      // Check cache health
      const cacheStats = RouteCachingAspect.getCacheStats();
      if (cacheStats.size > cacheStats.maxSize * 0.9) {
        issues.push('Cache utilization is high');
      }

      // Check analytics health
      const analyticsStats = RouteAnalyticsAspect.getAnalyticsSummary(60000); // Last minute
      if (analyticsStats.validationStats && analyticsStats.validationStats.errorRate > 10) {
        issues.push(`High validation error rate: ${analyticsStats.validationStats.errorRate.toFixed(1)}%`);
      }

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'error' = 'healthy';
      if (issues.length > 0) {
        status = issues.some(issue => issue.includes('error')) ? 'error' : 'degraded';
      }

      const metrics = {
        engineId: this.engineId,
        uptime: Date.now() - parseInt(this.engineId.split('-')[2]),
        cache: cacheStats,
        analytics: analyticsStats,
        healthCheckTime: Date.now() - startTime,
      };

      RouteLoggingAspect.logPerformanceMetrics('engine_health_check', Date.now() - startTime, { 
        status,
        issueCount: issues.length 
      });

      return { status, metrics, issues };
    } catch (error) {
      RouteLoggingAspect.logError('engine_health_check', error as Error);
      return {
        status: 'error',
        metrics: {},
        issues: [`Health check failed: ${(error as Error).message}`],
      };
    }
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  /**
   * Perform security validation
   */
  private async performSecurityValidation(
    params: Partial<RouteParameters>,
    options: RouteNavigationOptions,
    operationId: string
  ): Promise<{ passed: boolean; errors: string[] }> {
    const startTime = Date.now();

    try {
      if (options.bypassSecurity) {
        RouteLoggingAspect.logPerformanceMetrics('security_bypass', Date.now() - startTime, { operationId });
        return { passed: true, errors: [] };
      }

      // Rate limiting check
      const clientId = options.sessionId || options.userAgent || 'anonymous';
      if (!RouteSecurityAspect.checkRateLimit(clientId)) {
        return { passed: false, errors: ['Rate limit exceeded'] };
      }

      // Parameter sanitization
      const sanitized = RouteSecurityAspect.sanitizeRouteParameters(params);
      if (!sanitized) {
        return { passed: false, errors: ['Parameter sanitization failed'] };
      }

      RouteLoggingAspect.logPerformanceMetrics('security_validation', Date.now() - startTime, { operationId });
      return { passed: true, errors: [] };
    } catch (error) {
      RouteLoggingAspect.logError('security_validation', error as Error, { operationId });
      return { passed: false, errors: [`Security error: ${(error as Error).message}`] };
    }
  }

  /**
   * Perform parameter validation
   */
  private performParameterValidation(
    params: Partial<RouteParameters>,
    operationId: string
  ): RouteValidationResult & { validationTime: number } {
    const startTime = Date.now();
    
    const result = RouteValidationAspect.validateRouteParameters(params);
    const validationTime = Date.now() - startTime;

    RouteAnalyticsAspect.trackRouteValidation(params, result);
    
    return { ...result, validationTime };
  }

  /**
   * Perform cache check
   */
  private performCacheCheck(
    params: RouteParameters,
    operationId: string
  ): { hit: boolean; config: CategoryConfig | null } {
    const startTime = Date.now();
    
    const cached = RouteCachingAspect.getCachedRoute(params.vertical, params.category, params.subcategory);
    const hit = cached !== null;

    RouteLoggingAspect.logPerformanceMetrics('cache_check', Date.now() - startTime, { 
      operationId,
      hit 
    });

    return { hit, config: cached };
  }

  /**
   * Perform configuration resolution
   */
  private async performConfigurationResolution(
    params: RouteParameters,
    operationId: string
  ): Promise<{ success: boolean; config: CategoryConfig | null; errors: string[] }> {
    const startTime = Date.now();
    
    try {
      const config = categoryConfigService.getConfigWithFallback(params.vertical, params.category);
      
      if (!config) {
        return {
          success: false,
          config: null,
          errors: [`No configuration found for ${params.vertical}/${params.category}`],
        };
      }

      RouteLoggingAspect.logPerformanceMetrics('config_resolution', Date.now() - startTime, { 
        operationId,
        configTitle: config.title 
      });

      return { success: true, config, errors: [] };
    } catch (error) {
      RouteLoggingAspect.logError('config_resolution', error as Error, { operationId });
      return {
        success: false,
        config: null,
        errors: [`Configuration error: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Perform cache update
   */
  private performCacheUpdate(
    params: RouteParameters,
    config: CategoryConfig,
    operationId: string
  ): void {
    try {
      RouteCachingAspect.setCachedRoute(params.vertical, params.category, config, params.subcategory);
    } catch (error) {
      RouteLoggingAspect.logError('cache_update', error as Error, { operationId });
    }
  }

  /**
   * Perform analytics tracking
   */
  private async performAnalyticsTracking(
    params: RouteParameters,
    options: RouteNavigationOptions,
    operationId: string
  ): Promise<void> {
    try {
      const metadata: RouteMetadata = {
        timestamp: Date.now(),
        userAgent: options.userAgent,
        referrer: options.referrer,
        sessionId: options.sessionId,
      };

      RouteAnalyticsAspect.trackRouteNavigation(params, metadata);
    } catch (error) {
      RouteLoggingAspect.logError('analytics_tracking', error as Error, { operationId });
    }
  }

  /**
   * Create failure result
   */
  private createFailureResult(
    reason: string,
    errors: string[],
    startTime: number
  ): RouteResolutionResult {
    return {
      isValid: false,
      config: null,
      params: null,
      errors: [reason, ...errors],
      warnings: [],
      metadata: {
        cacheHit: false,
        validationTime: 0,
        resolutionTime: Date.now() - startTime,
        securityPassed: false,
      },
    };
  }

  /**
   * Handle resolution error
   */
  private handleResolutionError(
    error: Error,
    params: Partial<RouteParameters>,
    startTime: number,
    operationId: string
  ): RouteResolutionResult {
    return {
      isValid: false,
      config: null,
      params: null,
      errors: [`Route resolution error: ${error.message}`],
      warnings: [],
      metadata: {
        cacheHit: false,
        validationTime: 0,
        resolutionTime: Date.now() - startTime,
        securityPassed: false,
      },
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE EXPORT
// ============================================================================

export const dynamicRouteEngine = DynamicRouteEngine.getInstance();
export default dynamicRouteEngine;