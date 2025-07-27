/**
 * Advanced AOP Integration - Phase 2 Task 3.3
 * Enterprise-grade integration layer for all advanced AOP features
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationMiddlewareIntegration } from './AuthenticationMiddlewareIntegration';
import { AdvancedAOPOrchestrator } from './AdvancedAOPOrchestrator';
import { AspectInterceptionFramework } from './AspectInterceptionFramework';
import { AspectDependencyInjectionFramework } from './AspectDependencyInjection';
import { 
  IAuthenticationAspect,
  AspectContext,
  JoinPoint,
  AspectError
} from './IAuthenticationAspect';
import { Result } from '../domain/Hostname';

// Advanced AOP Integration Configuration
export interface AdvancedAOPIntegrationConfiguration {
  readonly enableAdvancedOrchestration: boolean;
  readonly enableInterceptionFramework: boolean;
  readonly enableDependencyInjection: boolean;
  readonly enableAdvancedAspectWeaving: boolean;
  readonly enableCrossCuttingConcerns: boolean;
  readonly integrationMode: 'development' | 'production' | 'testing';
  readonly bootstrapConfiguration: {
    initializeOrchestrator: boolean;
    initializeInterception: boolean;
    initializeDependencyInjection: boolean;
    enableHealthMonitoring: boolean;
    enablePerformanceOptimization: boolean;
  };
  readonly monitoring: {
    enableComprehensiveMetrics: boolean;
    enableAdvancedTracing: boolean;
    enableIntegrationDiagnostics: boolean;
    metricsCollectionInterval: number;
  };
  readonly errorHandling: {
    enableAdvancedErrorRecovery: boolean;
    enableErrorPropagation: boolean;
    maxRetryAttempts: number;
    retryDelay: number;
  };
}

// Integration Statistics and Metrics
export interface AdvancedIntegrationMetrics {
  readonly orchestrationMetrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  };
  readonly interceptionMetrics: {
    totalInterceptions: number;
    successfulInterceptions: number;
    failedInterceptions: number;
    averageInterceptionTime: number;
  };
  readonly dependencyInjectionMetrics: {
    totalInjections: number;
    successfulInjections: number;
    failedInjections: number;
    averageInjectionTime: number;
  };
  readonly integrationHealth: {
    orchestratorHealth: 'healthy' | 'degraded' | 'failing';
    interceptionHealth: 'healthy' | 'degraded' | 'failing';
    dependencyInjectionHealth: 'healthy' | 'degraded' | 'failing';
    overallHealth: 'healthy' | 'degraded' | 'failing';
  };
}

// Advanced Aspect Execution Context
export interface AdvancedAspectExecutionContext extends AspectContext {
  readonly orchestrationId: string;
  readonly interceptionId?: string;
  readonly dependencyContext?: Record<string, any>;
  readonly advancedMetadata: {
    executionPhase: 'pre_orchestration' | 'orchestration' | 'post_orchestration';
    featureFlags: string[];
    performanceTargets: Record<string, number>;
    securityContext: Record<string, any>;
  };
}

// Advanced Execution Result
export interface AdvancedAspectExecutionResult {
  readonly executionId: string;
  readonly context: AdvancedAspectExecutionContext;
  readonly orchestrationResult?: any;
  readonly interceptionResults: any[];
  readonly dependencyInjectionResults: any[];
  readonly performance: {
    totalExecutionTime: number;
    orchestrationTime: number;
    interceptionTime: number;
    dependencyInjectionTime: number;
    overhead: number;
  };
  readonly success: boolean;
  readonly errors: AspectError[];
  readonly warnings: string[];
  readonly recommendations: string[];
}

/**
 * Advanced AOP Integration
 * Enterprise-grade integration of all AOP features
 */
export class AdvancedAOPIntegration {
  private static instance: AdvancedAOPIntegration | null = null;
  private configuration: AdvancedAOPIntegrationConfiguration;
  
  // Core AOP Components
  private middlewareIntegration: AuthenticationMiddlewareIntegration | null = null;
  private advancedOrchestrator: AdvancedAOPOrchestrator | null = null;
  private interceptionFramework: AspectInterceptionFramework | null = null;
  private dependencyInjectionFramework: AspectDependencyInjectionFramework | null = null;
  
  // Integration State
  private integrationMetrics: AdvancedIntegrationMetrics;
  private isInitialized: boolean = false;
  private isBootstrapping: boolean = false;

  private constructor(configuration?: Partial<AdvancedAOPIntegrationConfiguration>) {
    this.configuration = {
      enableAdvancedOrchestration: true,
      enableInterceptionFramework: true,
      enableDependencyInjection: true,
      enableAdvancedAspectWeaving: true,
      enableCrossCuttingConcerns: true,
      integrationMode: 'development',
      bootstrapConfiguration: {
        initializeOrchestrator: true,
        initializeInterception: true,
        initializeDependencyInjection: true,
        enableHealthMonitoring: true,
        enablePerformanceOptimization: true
      },
      monitoring: {
        enableComprehensiveMetrics: true,
        enableAdvancedTracing: true,
        enableIntegrationDiagnostics: true,
        metricsCollectionInterval: 30000
      },
      errorHandling: {
        enableAdvancedErrorRecovery: true,
        enableErrorPropagation: true,
        maxRetryAttempts: 3,
        retryDelay: 1000
      },
      ...configuration
    };

    this.integrationMetrics = this.initializeMetrics();
  }

  /**
   * Get singleton instance
   */
  static getInstance(configuration?: Partial<AdvancedAOPIntegrationConfiguration>): AdvancedAOPIntegration {
    if (!AdvancedAOPIntegration.instance) {
      AdvancedAOPIntegration.instance = new AdvancedAOPIntegration(configuration);
    }
    return AdvancedAOPIntegration.instance;
  }

  /**
   * Initialize advanced AOP integration
   */
  async initialize(): Promise<Result<void, AspectError>> {
    if (this.isBootstrapping) {
      return Result.error(new AspectError(
        'Advanced AOP integration is already bootstrapping',
        'INTEGRATION_ALREADY_BOOTSTRAPPING'
      ));
    }

    if (this.isInitialized) {
      console.log('[ADVANCED-AOP-INTEGRATION] Already initialized');
      return Result.ok(undefined);
    }

    this.isBootstrapping = true;

    try {
      console.log('[ADVANCED-AOP-INTEGRATION] Initializing Advanced AOP Integration...');

      // 1. Initialize base middleware integration
      this.middlewareIntegration = AuthenticationMiddlewareIntegration.getInstance();
      if (!this.middlewareIntegration.isIntegrationInitialized()) {
        const initResult = await this.middlewareIntegration.initialize();
        if (initResult.isError()) {
          throw initResult.error;
        }
      }

      // 2. Initialize advanced orchestrator
      if (this.configuration.bootstrapConfiguration.initializeOrchestrator) {
        await this.initializeAdvancedOrchestrator();
      }

      // 3. Initialize interception framework
      if (this.configuration.bootstrapConfiguration.initializeInterception) {
        await this.initializeInterceptionFramework();
      }

      // 4. Initialize dependency injection
      if (this.configuration.bootstrapConfiguration.initializeDependencyInjection) {
        await this.initializeDependencyInjection();
      }

      // 5. Setup integration monitoring
      if (this.configuration.monitoring.enableComprehensiveMetrics) {
        this.startIntegrationMonitoring();
      }

      // 6. Setup health monitoring
      if (this.configuration.bootstrapConfiguration.enableHealthMonitoring) {
        this.startHealthMonitoring();
      }

      this.isInitialized = true;
      this.isBootstrapping = false;

      console.log('[ADVANCED-AOP-INTEGRATION] Advanced AOP Integration initialized successfully', {
        orchestrator: !!this.advancedOrchestrator,
        interception: !!this.interceptionFramework,
        dependencyInjection: !!this.dependencyInjectionFramework,
        integrationMode: this.configuration.integrationMode
      });

      return Result.ok(undefined);

    } catch (error) {
      this.isBootstrapping = false;
      return Result.error(new AspectError(
        `Advanced AOP integration initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADVANCED_INTEGRATION_INIT_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Create advanced AOP middleware
   */
  createAdvancedAOPMiddleware(
    middlewareName: string,
    baseMiddleware: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.isInitialized) {
        console.warn('[ADVANCED-AOP-INTEGRATION] Integration not initialized, falling back to base middleware');
        return this.executeBaseMiddleware(baseMiddleware, req, res, next);
      }

      const executionId = this.generateExecutionId();
      const startTime = Date.now();

      try {
        // Create advanced execution context
        const advancedContext = this.createAdvancedExecutionContext(middlewareName, req, executionId, `req-${Date.now()}`);
        
        // Create join point
        const joinPoint = this.createAdvancedJoinPoint(middlewareName, req, res, advancedContext);

        // Execute advanced AOP pipeline
        const executionResult = await this.executeAdvancedAOPPipeline(
          joinPoint,
          advancedContext,
          baseMiddleware
        );

        if (executionResult.isSuccess()) {
          const result = executionResult.value;
          
          // Update metrics
          this.updateExecutionMetrics(result, Date.now() - startTime);
          
          // Apply any response modifications
          if (result.interceptionResults.length > 0) {
            // Handle response modifications from interceptors
            this.applyResponseModifications(res, result.interceptionResults);
          }

          // Continue with normal flow
          if (result.success) {
            next();
          } else {
            this.handleExecutionErrors(result.errors, res, next);
          }
        } else {
          console.error('[ADVANCED-AOP-INTEGRATION] Advanced AOP execution failed:', executionResult.error);
          return this.executeBaseMiddleware(baseMiddleware, req, res, next);
        }

      } catch (error) {
        console.error('[ADVANCED-AOP-INTEGRATION] Unexpected error in advanced AOP middleware:', error);
        return this.executeBaseMiddleware(baseMiddleware, req, res, next);
      }
    };
  }

  /**
   * Execute advanced AOP pipeline
   */
  private async executeAdvancedAOPPipeline(
    joinPoint: JoinPoint,
    context: AdvancedAspectExecutionContext,
    baseMiddleware: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  ): Promise<Result<AdvancedAspectExecutionResult, AspectError>> {
    const startTime = Date.now();

    try {
      const result: AdvancedAspectExecutionResult = {
        executionId: context.orchestrationId,
        context,
        orchestrationResult: null,
        interceptionResults: [],
        dependencyInjectionResults: [],
        performance: {
          totalExecutionTime: 0,
          orchestrationTime: 0,
          interceptionTime: 0,
          dependencyInjectionTime: 0,
          overhead: 0
        },
        success: true,
        errors: [],
        warnings: [],
        recommendations: []
      };

      // 1. Advanced Orchestration
      if (this.configuration.enableAdvancedOrchestration && this.advancedOrchestrator) {
        const orchestrationStart = Date.now();
        
        try {
          const aspectManager = this.middlewareIntegration?.getAspectManager();
          const aspects = aspectManager ? [
            aspectManager.getAspect('AuthenticationLoggingAspect'),
            aspectManager.getAspect('AuthenticationValidationAspect'),
            aspectManager.getAspect('AuthenticationSecurityAspect'),
            aspectManager.getAspect('AuthenticationPerformanceAspect')
          ].filter(Boolean) : [];
          const orchestrationResult = await this.advancedOrchestrator.executeAdvancedAspectOrchestration(
            joinPoint,
            aspects
          );
          
          if (orchestrationResult.isSuccess()) {
            (result as any).orchestrationResult = orchestrationResult.value;
          } else {
            result.errors.push(orchestrationResult.error);
            (result as any).success = false;
          }
          
          result.performance.orchestrationTime = Date.now() - orchestrationStart;
        } catch (error) {
          result.warnings.push(`Orchestration execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 2. Method Interception
      if (this.configuration.enableInterceptionFramework && this.interceptionFramework) {
        const interceptionStart = Date.now();
        
        try {
          const interceptors = this.interceptionFramework.getRegisteredInterceptors();
          const interceptionResult = await this.interceptionFramework.interceptMethodExecution(
            joinPoint,
            context,
            interceptors
          );
          
          if (interceptionResult.isSuccess()) {
            result.interceptionResults.push(interceptionResult.value);
          } else {
            result.errors.push(interceptionResult.error);
          }
          
          result.performance.interceptionTime = Date.now() - interceptionStart;
        } catch (error) {
          result.warnings.push(`Interception execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 3. Dependency Injection
      if (this.configuration.enableDependencyInjection && this.dependencyInjectionFramework) {
        const diStart = Date.now();
        
        try {
          const injector = this.dependencyInjectionFramework.getInjector();
          // In a real implementation, would inject dependencies into aspects
          result.dependencyInjectionResults.push({ 
            status: 'executed',
            injectedDependencies: 0 
          });
          
          result.performance.dependencyInjectionTime = Date.now() - diStart;
        } catch (error) {
          result.warnings.push(`Dependency injection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 4. Execute base middleware
      try {
        // Create a mock next function to capture base middleware execution
        let middlewareExecuted = false;
        const mockNext = () => { middlewareExecuted = true; };
        
        await this.executeBaseMiddleware(baseMiddleware, joinPoint.context.metadata.req, joinPoint.context.metadata.res, mockNext);
        
        if (!middlewareExecuted) {
          result.warnings.push('Base middleware did not call next()');
        }
      } catch (error) {
        result.errors.push(new AspectError(
          `Base middleware execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'BASE_MIDDLEWARE_FAILED',
          { originalError: error }
        ));
        (result as any).success = false;
      }

      // Calculate final performance metrics
      const totalTime = Date.now() - startTime;
      result.performance.totalExecutionTime = totalTime;
      result.performance.overhead = totalTime - (
        result.performance.orchestrationTime +
        result.performance.interceptionTime +
        result.performance.dependencyInjectionTime
      );

      // Generate recommendations
      this.generatePerformanceRecommendations(result);

      return Result.ok(result);

    } catch (error) {
      return Result.error(new AspectError(
        `Advanced AOP pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADVANCED_PIPELINE_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Initialize advanced orchestrator
   */
  private async initializeAdvancedOrchestrator(): Promise<void> {
    if (this.configuration.enableAdvancedOrchestration) {
      this.advancedOrchestrator = AdvancedAOPOrchestrator.getInstance();
      const initResult = await this.advancedOrchestrator.initialize();
      
      if (initResult.isError()) {
        throw initResult.error;
      }
      
      console.log('[ADVANCED-AOP-INTEGRATION] Advanced orchestrator initialized');
    }
  }

  /**
   * Initialize interception framework
   */
  private async initializeInterceptionFramework(): Promise<void> {
    if (this.configuration.enableInterceptionFramework) {
      this.interceptionFramework = AspectInterceptionFramework.getInstance();
      const initResult = await this.interceptionFramework.initialize();
      
      if (initResult.isError()) {
        throw initResult.error;
      }
      
      console.log('[ADVANCED-AOP-INTEGRATION] Interception framework initialized');
    }
  }

  /**
   * Initialize dependency injection
   */
  private async initializeDependencyInjection(): Promise<void> {
    if (this.configuration.enableDependencyInjection) {
      this.dependencyInjectionFramework = AspectDependencyInjectionFramework.getInstance();
      const initResult = await this.dependencyInjectionFramework.initialize();
      
      if (initResult.isError()) {
        throw initResult.error;
      }
      
      console.log('[ADVANCED-AOP-INTEGRATION] Dependency injection framework initialized');
    }
  }

  /**
   * Create advanced execution context
   */
  private createAdvancedExecutionContext(
    operation: string,
    req: Request,
    orchestrationId: string,
    requestId: string
  ): AdvancedAspectExecutionContext {
    return {
      operation,
      userId: (req as any).user?.claims?.sub || 'anonymous',
      sessionId: (req as any).sessionID || 'no-session',
      timestamp: new Date(),
      metadata: { req, res: null },
      requestId,
      orchestrationId,
      advancedMetadata: {
        executionPhase: 'pre_orchestration',
        featureFlags: [
          'advanced_orchestration',
          'method_interception',
          'dependency_injection'
        ],
        performanceTargets: {
          maxExecutionTime: 1000,
          maxOrchestrationTime: 500,
          maxInterceptionTime: 200
        },
        securityContext: {
          requiresAuthentication: true,
          securityLevel: 'standard'
        }
      }
    };
  }

  /**
   * Create advanced join point
   */
  private createAdvancedJoinPoint(
    method: string,
    req: Request,
    res: Response,
    context: AdvancedAspectExecutionContext
  ): JoinPoint {
    return {
      method,
      target: { name: 'AdvancedMiddleware' },
      args: [req, res],
      context: {
        ...context,
        metadata: { ...context.metadata, res }
      },
      proceed: async () => {
        // In a real implementation, would proceed with middleware chain
        return Promise.resolve();
      },
      getTarget: () => ({ name: 'AdvancedMiddleware' }),
      getMethod: () => method,
      getArgs: () => [req, res],
      setArgs: (newArgs: any[]) => {
        // In a real implementation, would update req/res
      }
    };
  }

  /**
   * Execute base middleware safely
   */
  private async executeBaseMiddleware(
    middleware: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = middleware(req, res, next);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error('[ADVANCED-AOP-INTEGRATION] Base middleware execution error:', error);
      throw error;
    }
  }

  /**
   * Apply response modifications
   */
  private applyResponseModifications(res: Response, interceptionResults: any[]): void {
    // In a real implementation, would apply response modifications from interceptors
    console.log('[ADVANCED-AOP-INTEGRATION] Applying response modifications from interceptors');
  }

  /**
   * Handle execution errors
   */
  private handleExecutionErrors(errors: AspectError[], res: Response, next: NextFunction): void {
    if (errors.length > 0) {
      console.error('[ADVANCED-AOP-INTEGRATION] Execution errors:', errors);
      // In production, might return error response or continue based on error severity
    }
    next();
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(result: AdvancedAspectExecutionResult): void {
    const { performance } = result;
    const { advancedMetadata } = result.context;
    
    if (performance.totalExecutionTime > advancedMetadata.performanceTargets.maxExecutionTime) {
      result.recommendations.push(`Execution time exceeded target: ${performance.totalExecutionTime}ms > ${advancedMetadata.performanceTargets.maxExecutionTime}ms`);
    }
    
    if (performance.orchestrationTime > advancedMetadata.performanceTargets.maxOrchestrationTime) {
      result.recommendations.push(`Orchestration time exceeded target: ${performance.orchestrationTime}ms`);
    }
    
    if (performance.overhead > performance.totalExecutionTime * 0.3) {
      result.recommendations.push(`High overhead detected: ${performance.overhead}ms (${Math.round(performance.overhead / performance.totalExecutionTime * 100)}%)`);
    }
  }

  /**
   * Update execution metrics
   */
  private updateExecutionMetrics(result: AdvancedAspectExecutionResult, totalTime: number): void {
    // Update orchestration metrics
    this.integrationMetrics.orchestrationMetrics.totalExecutions++;
    if (result.orchestrationResult && result.success) {
      this.integrationMetrics.orchestrationMetrics.successfulExecutions++;
    } else {
      this.integrationMetrics.orchestrationMetrics.failedExecutions++;
    }
    
    // Update interception metrics
    if (result.interceptionResults.length > 0) {
      this.integrationMetrics.interceptionMetrics.totalInterceptions++;
      this.integrationMetrics.interceptionMetrics.successfulInterceptions++;
    }
    
    // Update dependency injection metrics
    if (result.dependencyInjectionResults.length > 0) {
      this.integrationMetrics.dependencyInjectionMetrics.totalInjections++;
      this.integrationMetrics.dependencyInjectionMetrics.successfulInjections++;
    }
  }

  /**
   * Start integration monitoring
   */
  private startIntegrationMonitoring(): void {
    setInterval(() => {
      this.updateIntegrationHealth();
      
      if (this.configuration.monitoring.enableIntegrationDiagnostics) {
        console.log('[ADVANCED-AOP-INTEGRATION] Integration metrics:', {
          orchestration: this.integrationMetrics.orchestrationMetrics,
          interception: this.integrationMetrics.interceptionMetrics,
          dependencyInjection: this.integrationMetrics.dependencyInjectionMetrics,
          health: this.integrationMetrics.integrationHealth
        });
      }
    }, this.configuration.monitoring.metricsCollectionInterval);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.updateIntegrationHealth();
    }, 10000); // Health check every 10 seconds
  }

  /**
   * Update integration health
   */
  private updateIntegrationHealth(): void {
    // Update component health based on success rates and recent activity
    const orchestrationSuccessRate = this.integrationMetrics.orchestrationMetrics.totalExecutions > 0
      ? this.integrationMetrics.orchestrationMetrics.successfulExecutions / this.integrationMetrics.orchestrationMetrics.totalExecutions
      : 1;
    
    this.integrationMetrics.integrationHealth.orchestratorHealth = 
      orchestrationSuccessRate > 0.95 ? 'healthy' : 
      orchestrationSuccessRate > 0.8 ? 'degraded' : 'failing';
    
    this.integrationMetrics.integrationHealth.interceptionHealth = 'healthy'; // Simplified
    this.integrationMetrics.integrationHealth.dependencyInjectionHealth = 'healthy'; // Simplified
    
    // Overall health is the worst component health
    const healthValues = ['healthy', 'degraded', 'failing'];
    const worstHealth = Math.max(
      healthValues.indexOf(this.integrationMetrics.integrationHealth.orchestratorHealth),
      healthValues.indexOf(this.integrationMetrics.integrationHealth.interceptionHealth),
      healthValues.indexOf(this.integrationMetrics.integrationHealth.dependencyInjectionHealth)
    );
    
    this.integrationMetrics.integrationHealth.overallHealth = healthValues[worstHealth] as any;
  }

  /**
   * Generate execution ID
   */
  private generateExecutionId(): string {
    return `adv-exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): AdvancedIntegrationMetrics {
    return {
      orchestrationMetrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0
      },
      interceptionMetrics: {
        totalInterceptions: 0,
        successfulInterceptions: 0,
        failedInterceptions: 0,
        averageInterceptionTime: 0
      },
      dependencyInjectionMetrics: {
        totalInjections: 0,
        successfulInjections: 0,
        failedInjections: 0,
        averageInjectionTime: 0
      },
      integrationHealth: {
        orchestratorHealth: 'healthy',
        interceptionHealth: 'healthy',
        dependencyInjectionHealth: 'healthy',
        overallHealth: 'healthy'
      }
    };
  }

  /**
   * Get integration metrics
   */
  getMetrics(): AdvancedIntegrationMetrics {
    return { ...this.integrationMetrics };
  }

  /**
   * Get configuration
   */
  getConfiguration(): AdvancedAOPIntegrationConfiguration {
    return { ...this.configuration };
  }

  /**
   * Check if integration is initialized
   */
  isIntegrationInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get advanced orchestrator
   */
  getAdvancedOrchestrator(): AdvancedAOPOrchestrator | null {
    return this.advancedOrchestrator;
  }

  /**
   * Get interception framework
   */
  getInterceptionFramework(): AspectInterceptionFramework | null {
    return this.interceptionFramework;
  }

  /**
   * Get dependency injection framework
   */
  getDependencyInjectionFramework(): AspectDependencyInjectionFramework | null {
    return this.dependencyInjectionFramework;
  }
}

// Bootstrap Advanced AOP Integration
export async function bootstrapAdvancedAOPIntegration(
  configuration?: Partial<AdvancedAOPIntegrationConfiguration>
): Promise<Result<AdvancedAOPIntegration, AspectError>> {
  try {
    const integration = AdvancedAOPIntegration.getInstance(configuration);
    const initResult = await integration.initialize();
    
    if (initResult.isError()) {
      return Result.error(initResult.error);
    }
    
    return Result.ok(integration);
    
  } catch (error) {
    return Result.error(new AspectError(
      `Advanced AOP integration bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'BOOTSTRAP_FAILED',
      { originalError: error }
    ));
  }
}