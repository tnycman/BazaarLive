/**
 * Authentication Middleware AOP Integration - Phase 2 Task 3.1
 * Enterprise-grade middleware integration with aspect orchestration
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationAspectManager, OrchestrationResult } from './AuthenticationAspectManager';
import { AspectRegistrationBootstrap, AspectBootstrapResult } from './AspectRegistrationBootstrap';
import {
  AspectContext,
  JoinPoint,
  AspectError,
  AspectConfiguration
} from './IAuthenticationAspect';
import { Result } from '../domain/Hostname';
import { ValidationError } from '../domain/Hostname';

// Middleware Integration Types
export interface MiddlewareIntegrationContext extends AspectContext {
  readonly request: Request;
  readonly response: Response;
  readonly next: NextFunction;
  readonly middleware: string;
  readonly phase: 'before' | 'after' | 'error' | 'finally';
  readonly startTime: number;
  readonly requestId: string;
  readonly userAgent?: string;
  readonly sourceIP?: string;
}

export interface MiddlewareJoinPoint extends JoinPoint {
  readonly context: MiddlewareIntegrationContext;
  readonly args: [Request, Response, NextFunction];
  readonly target: Function;
  readonly proceed: () => Promise<any>;
}

export interface MiddlewareIntegrationConfiguration {
  readonly enableAspectOrchestration: boolean;
  readonly enablePreProcessing: boolean;
  readonly enablePostProcessing: boolean;
  readonly enableErrorHandling: boolean;
  readonly enablePerformanceTracking: boolean;
  readonly middlewareTimeout: number;
  readonly aspectTimeout: number;
  readonly enableFailsafe: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly bootstrapConfiguration: {
    enableLogging: boolean;
    enableValidation: boolean;
    enableSecurity: boolean;
    enablePerformance: boolean;
  };
}

export interface MiddlewareIntegrationResult {
  readonly success: boolean;
  readonly orchestrationResults: {
    before?: OrchestrationResult;
    after?: OrchestrationResult;
    error?: OrchestrationResult;
    finally?: OrchestrationResult;
  };
  readonly totalDuration: number;
  readonly errors: AspectError[];
  readonly middlewareExecuted: boolean;
  readonly aspectsExecuted: number;
}

// Integration Health Status
export interface MiddlewareIntegrationHealth {
  readonly isHealthy: boolean;
  readonly aspectManager: {
    isInitialized: boolean;
    registeredAspects: number;
    activeAspects: number;
    failingAspects: number;
  };
  readonly bootstrap: {
    isCompleted: boolean;
    success: boolean;
    registeredAspects: string[];
    failedAspects: string[];
  };
  readonly integration: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgProcessingTime: number;
  };
  readonly lastHealthCheck: Date;
}

// Integration Statistics
export interface MiddlewareIntegrationStatistics {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly avgProcessingTime: number;
  readonly aspectExecutionStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgExecutionTime: number;
  };
  readonly errorsByType: Record<string, number>;
  readonly performanceMetrics: {
    fastest: number;
    slowest: number;
    p95: number;
    p99: number;
  };
  readonly period: {
    start: Date;
    end: Date;
  };
}

/**
 * Authentication Middleware AOP Integration Service
 * Enterprise integration of aspect manager with Express middleware
 */
export class AuthenticationMiddlewareIntegration {
  private static instance: AuthenticationMiddlewareIntegration | null = null;
  private aspectManager: AuthenticationAspectManager | null = null;
  private bootstrap: AspectRegistrationBootstrap;
  private configuration: MiddlewareIntegrationConfiguration;
  private statistics: MiddlewareIntegrationStatistics;
  private health: MiddlewareIntegrationHealth;
  private isInitialized: boolean = false;
  private requestCounter: number = 0;

  private constructor(configuration?: Partial<MiddlewareIntegrationConfiguration>) {
    this.configuration = {
      enableAspectOrchestration: true,
      enablePreProcessing: true,
      enablePostProcessing: true,
      enableErrorHandling: true,
      enablePerformanceTracking: true,
      middlewareTimeout: 30000,
      aspectTimeout: 5000,
      enableFailsafe: true,
      logLevel: 'info',
      bootstrapConfiguration: {
        enableLogging: true,
        enableValidation: true,
        enableSecurity: true,
        enablePerformance: true
      },
      ...configuration
    };

    this.bootstrap = new AspectRegistrationBootstrap({
      ...this.configuration.bootstrapConfiguration,
      logLevel: this.configuration.logLevel,
      aspectManagerConfig: {
        enableParallelExecution: false,
        enableFailFast: !this.configuration.enableFailsafe,
        maxExecutionTime: this.configuration.aspectTimeout,
        retryAttempts: 1
      }
    });

    this.statistics = this.initializeStatistics();
    this.health = this.initializeHealth();
  }

  /**
   * Get singleton instance
   */
  static getInstance(configuration?: Partial<MiddlewareIntegrationConfiguration>): AuthenticationMiddlewareIntegration {
    if (!AuthenticationMiddlewareIntegration.instance) {
      AuthenticationMiddlewareIntegration.instance = new AuthenticationMiddlewareIntegration(configuration);
    }
    return AuthenticationMiddlewareIntegration.instance;
  }

  /**
   * Initialize the middleware integration
   */
  async initialize(): Promise<Result<void, AspectError>> {
    try {
      console.log('[MIDDLEWARE-AOP] Initializing Authentication Middleware AOP Integration');

      // Bootstrap aspect manager and register aspects
      const bootstrapResult = await this.bootstrap.bootstrap();
      if (!bootstrapResult.success) {
        console.error('[MIDDLEWARE-AOP] Bootstrap failed:', bootstrapResult.errors);
        return Result.error(new AspectError(
          `Middleware integration bootstrap failed: ${bootstrapResult.errors.map(e => e.message).join(', ')}`,
          'MIDDLEWARE_BOOTSTRAP_FAILED',
          { 
            errors: bootstrapResult.errors,
            failedAspects: bootstrapResult.failedAspects 
          }
        ));
      }

      this.aspectManager = bootstrapResult.aspectManager;
      
      // Update health status
      this.health = {
        ...this.health,
        aspectManager: {
          isInitialized: true,
          registeredAspects: bootstrapResult.registeredAspects.length,
          activeAspects: bootstrapResult.registeredAspects.length,
          failingAspects: bootstrapResult.failedAspects.length
        },
        bootstrap: {
          isCompleted: true,
          success: bootstrapResult.success,
          registeredAspects: bootstrapResult.registeredAspects,
          failedAspects: bootstrapResult.failedAspects
        }
      };

      this.isInitialized = true;
      console.log('[MIDDLEWARE-AOP] Authentication Middleware AOP Integration initialized successfully', {
        registeredAspects: bootstrapResult.registeredAspects.length,
        initializationTime: bootstrapResult.initializationTime
      });

      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Middleware integration initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MIDDLEWARE_INIT_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Create AOP-enabled middleware wrapper
   */
  createAOPMiddleware(
    middlewareName: string,
    middlewareFunction: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!this.isInitialized || !this.aspectManager) {
        console.warn('[MIDDLEWARE-AOP] Integration not initialized, executing middleware without AOP');
        return this.executeMiddlewareDirectly(middlewareFunction, req, res, next);
      }

      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      try {
        // Execute middleware with full AOP integration
        const result = await this.executeMiddlewareWithAOP(
          middlewareName,
          middlewareFunction,
          req,
          res,
          next,
          requestId,
          startTime
        );

        // Update statistics
        this.updateStatistics(result, Date.now() - startTime);

        if (!result.success && !this.configuration.enableFailsafe) {
          // Propagate errors if failsafe is disabled
          const error = result.errors[0] || new AspectError('Middleware execution failed', 'MIDDLEWARE_EXECUTION_FAILED');
          throw error;
        }

      } catch (error) {
        this.updateErrorStatistics(error);
        
        if (this.configuration.enableFailsafe) {
          console.warn('[MIDDLEWARE-AOP] Error in AOP middleware, falling back to direct execution:', error);
          await this.executeMiddlewareDirectly(middlewareFunction, req, res, next);
        } else {
          throw error;
        }
      }
    };
  }

  /**
   * Execute middleware with full AOP integration
   */
  private async executeMiddlewareWithAOP(
    middlewareName: string,
    middlewareFunction: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
    req: Request,
    res: Response,
    next: NextFunction,
    requestId: string,
    startTime: number
  ): Promise<MiddlewareIntegrationResult> {
    
    const context = this.createMiddlewareContext(middlewareName, req, res, next, requestId, startTime);
    const joinPoint = this.createMiddlewareJoinPoint(context, middlewareFunction, [req, res, next]);
    
    const result: MiddlewareIntegrationResult = {
      success: true,
      orchestrationResults: {},
      totalDuration: 0,
      errors: [],
      middlewareExecuted: false,
      aspectsExecuted: 0
    };

    try {
      // Execute BEFORE aspects
      if (this.configuration.enablePreProcessing) {
        const beforeContext = { ...context, phase: 'before' as const };
        const beforeJoinPoint = { ...joinPoint, context: beforeContext };
        
        result.orchestrationResults.before = await this.aspectManager!.executeBefore(beforeJoinPoint);
        result.aspectsExecuted += result.orchestrationResults.before.aspectsExecuted.length;
        
        if (!result.orchestrationResults.before.success && !this.configuration.enableFailsafe) {
          result.success = false;
          result.errors.push(...result.orchestrationResults.before.errors);
          return result;
        }
      }

      // Execute main middleware
      let middlewareError: Error | null = null;
      try {
        await this.executeMiddlewareWithTimeout(middlewareFunction, req, res, next);
        result.middlewareExecuted = true;
      } catch (error) {
        middlewareError = error instanceof Error ? error : new Error('Middleware execution failed');
        result.success = false;
        
        if (this.configuration.enableErrorHandling) {
          const errorContext = { ...context, phase: 'error' as const };
          const errorJoinPoint = { ...joinPoint, context: errorContext };
          
          result.orchestrationResults.error = await this.aspectManager!.executeAfterThrowing(errorJoinPoint, middlewareError);
          result.aspectsExecuted += result.orchestrationResults.error.aspectsExecuted.length;
        }
        
        if (!this.configuration.enableFailsafe) {
          throw middlewareError;
        }
      }

      // Execute AFTER aspects
      if (this.configuration.enablePostProcessing && result.middlewareExecuted) {
        const afterContext = { ...context, phase: 'after' as const };
        const afterJoinPoint = { ...joinPoint, context: afterContext };
        
        result.orchestrationResults.after = await this.aspectManager!.executeAfter(afterJoinPoint, undefined);
        result.aspectsExecuted += result.orchestrationResults.after.aspectsExecuted.length;
        
        if (!result.orchestrationResults.after.success && !this.configuration.enableFailsafe) {
          result.success = false;
          result.errors.push(...result.orchestrationResults.after.errors);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(new AspectError(
        `AOP middleware execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AOP_MIDDLEWARE_FAILED',
        { middlewareName, requestId, originalError: error }
      ));
      return result;

    } finally {
      // Always execute FINALLY aspects
      try {
        const finallyContext = { ...context, phase: 'finally' as const };
        const finallyJoinPoint = { ...joinPoint, context: finallyContext };
        
        result.orchestrationResults.finally = await this.aspectManager!.executeFinally(finallyJoinPoint);
        result.aspectsExecuted += result.orchestrationResults.finally.aspectsExecuted.length;
        
        result.totalDuration = Date.now() - startTime;
      } catch (error) {
        console.error('[MIDDLEWARE-AOP] Error in finally aspects:', error);
      }
    }
  }

  /**
   * Execute middleware with timeout
   */
  private async executeMiddlewareWithTimeout(
    middlewareFunction: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Middleware execution timeout after ${this.configuration.middlewareTimeout}ms`));
      }, this.configuration.middlewareTimeout);

      try {
        const result = middlewareFunction(req, res, (error?: any) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        // Handle async middleware
        if (result && typeof result === 'object' && 'then' in result) {
          result.then(() => {
            clearTimeout(timeout);
            resolve();
          }).catch((error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Execute middleware directly without AOP
   */
  private async executeMiddlewareDirectly(
    middlewareFunction: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = middlewareFunction(req, res, next);
      if (result && typeof result === 'object' && 'then' in result) {
        await result;
      }
    } catch (error) {
      console.error('[MIDDLEWARE-AOP] Direct middleware execution failed:', error);
      throw error;
    }
  }

  /**
   * Create middleware context
   */
  private createMiddlewareContext(
    middlewareName: string,
    req: Request,
    res: Response,
    next: NextFunction,
    requestId: string,
    startTime: number
  ): MiddlewareIntegrationContext {
    return {
      operationId: `middleware:${middlewareName}`,
      userId: (req as any).user?.id || 'anonymous',
      sessionId: (req as any).sessionID || 'no-session',
      timestamp: new Date(),
      metadata: {
        middlewareName,
        method: req.method,
        url: req.url,
        headers: req.headers
      },
      request: req,
      response: res,
      next,
      middleware: middlewareName,
      phase: 'before',
      startTime,
      requestId,
      userAgent: req.get('User-Agent'),
      sourceIP: req.ip || req.connection.remoteAddress
    };
  }

  /**
   * Create middleware join point
   */
  private createMiddlewareJoinPoint(
    context: MiddlewareIntegrationContext,
    middlewareFunction: Function,
    args: [Request, Response, NextFunction]
  ): MiddlewareJoinPoint {
    return {
      method: middlewareFunction.name || 'anonymous',
      target: middlewareFunction,
      args,
      context,
      proceed: async () => {
        // This would be called by around aspects
        await this.executeMiddlewareDirectly(
          middlewareFunction as any,
          args[0],
          args[1],
          args[2]
        );
      }
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    this.requestCounter++;
    return `middleware-${Date.now()}-${this.requestCounter}`;
  }

  /**
   * Update integration statistics
   */
  private updateStatistics(result: MiddlewareIntegrationResult, duration: number): void {
    this.statistics.totalRequests++;
    
    if (result.success) {
      this.statistics.successfulRequests++;
    } else {
      this.statistics.failedRequests++;
      result.errors.forEach(error => {
        this.statistics.errorsByType[error.code] = (this.statistics.errorsByType[error.code] || 0) + 1;
      });
    }

    // Update performance metrics
    this.updatePerformanceMetrics(duration);
    
    // Update aspect execution stats
    this.statistics.aspectExecutionStats.totalExecutions += result.aspectsExecuted;
    if (result.success) {
      this.statistics.aspectExecutionStats.successfulExecutions += result.aspectsExecuted;
    } else {
      this.statistics.aspectExecutionStats.failedExecutions += result.aspectsExecuted;
    }

    // Recalculate averages
    this.statistics.avgProcessingTime = this.calculateAverageProcessingTime();
    this.statistics.aspectExecutionStats.avgExecutionTime = this.calculateAverageAspectExecutionTime();

    // Update health
    this.health.integration.totalRequests = this.statistics.totalRequests;
    this.health.integration.successfulRequests = this.statistics.successfulRequests;
    this.health.integration.failedRequests = this.statistics.failedRequests;
    this.health.integration.avgProcessingTime = this.statistics.avgProcessingTime;
  }

  /**
   * Update error statistics
   */
  private updateErrorStatistics(error: any): void {
    this.statistics.failedRequests++;
    this.statistics.totalRequests++;
    
    const errorType = error?.code || error?.name || 'UNKNOWN_ERROR';
    this.statistics.errorsByType[errorType] = (this.statistics.errorsByType[errorType] || 0) + 1;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(duration: number): void {
    if (duration < this.statistics.performanceMetrics.fastest) {
      this.statistics.performanceMetrics.fastest = duration;
    }
    if (duration > this.statistics.performanceMetrics.slowest) {
      this.statistics.performanceMetrics.slowest = duration;
    }
    
    // Simple approximation for p95 and p99 - in production, use proper percentile tracking
    this.statistics.performanceMetrics.p95 = Math.max(this.statistics.performanceMetrics.p95, duration * 0.95);
    this.statistics.performanceMetrics.p99 = Math.max(this.statistics.performanceMetrics.p99, duration * 0.99);
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(): number {
    // This is a simplified calculation - in production, maintain a sliding window
    return this.statistics.totalRequests > 0 
      ? (this.statistics.performanceMetrics.fastest + this.statistics.performanceMetrics.slowest) / 2
      : 0;
  }

  /**
   * Calculate average aspect execution time
   */
  private calculateAverageAspectExecutionTime(): number {
    // This is a simplified calculation - in production, track actual execution times
    return this.statistics.aspectExecutionStats.totalExecutions > 0
      ? this.statistics.avgProcessingTime * 0.3 // Estimate 30% of time spent in aspects
      : 0;
  }

  /**
   * Initialize statistics
   */
  private initializeStatistics(): MiddlewareIntegrationStatistics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgProcessingTime: 0,
      aspectExecutionStats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        avgExecutionTime: 0
      },
      errorsByType: {},
      performanceMetrics: {
        fastest: Number.MAX_SAFE_INTEGER,
        slowest: 0,
        p95: 0,
        p99: 0
      },
      period: {
        start: new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Initialize health status
   */
  private initializeHealth(): MiddlewareIntegrationHealth {
    return {
      isHealthy: false,
      aspectManager: {
        isInitialized: false,
        registeredAspects: 0,
        activeAspects: 0,
        failingAspects: 0
      },
      bootstrap: {
        isCompleted: false,
        success: false,
        registeredAspects: [],
        failedAspects: []
      },
      integration: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgProcessingTime: 0
      },
      lastHealthCheck: new Date()
    };
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<MiddlewareIntegrationHealth> {
    if (this.aspectManager) {
      const managerHealth = await this.aspectManager.getHealthStatus();
      this.health.aspectManager = {
        isInitialized: true,
        registeredAspects: managerHealth.registeredAspects,
        activeAspects: managerHealth.activeAspects,
        failingAspects: managerHealth.failingAspects
      };
    }

    this.health.isHealthy = this.isInitialized && 
                           this.health.aspectManager.isInitialized && 
                           this.health.bootstrap.success &&
                           this.health.aspectManager.failingAspects === 0;

    this.health.lastHealthCheck = new Date();
    return { ...this.health };
  }

  /**
   * Get current statistics
   */
  getStatistics(): MiddlewareIntegrationStatistics {
    this.statistics.period.end = new Date();
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = this.initializeStatistics();
  }

  /**
   * Cleanup integration
   */
  async cleanup(): Promise<Result<void, AspectError>> {
    try {
      if (this.aspectManager) {
        await this.aspectManager.cleanup();
      }
      
      this.isInitialized = false;
      console.log('[MIDDLEWARE-AOP] Authentication Middleware AOP Integration cleaned up');
      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Middleware integration cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MIDDLEWARE_CLEANUP_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Check if integration is initialized
   */
  isIntegrationInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get aspect manager instance
   */
  getAspectManager(): AuthenticationAspectManager | null {
    return this.aspectManager;
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<MiddlewareIntegrationConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): MiddlewareIntegrationConfiguration {
    return { ...this.configuration };
  }
}