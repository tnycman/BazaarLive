/**
 * Aspect Interception Framework - Phase 2 Task 3.3
 * Enterprise-grade aspect interception with method-level control
 */

import { 
  IAuthenticationAspect,
  AspectContext,
  JoinPoint,
  AspectError
} from './IAuthenticationAspect';
import { Result } from '../domain/Hostname';

// Method Interception Types
export enum InterceptionType {
  BEFORE_METHOD = 'before_method',
  AFTER_METHOD = 'after_method',
  AROUND_METHOD = 'around_method',
  ON_EXCEPTION = 'on_exception',
  ON_SUCCESS = 'on_success',
  CONDITIONAL = 'conditional'
}

export interface MethodInterceptor {
  readonly id: string;
  readonly name: string;
  readonly interceptionType: InterceptionType;
  readonly targetMethods: MethodSelector[];
  readonly priority: number;
  readonly conditions: InterceptionCondition[];
  intercept(joinPoint: JoinPoint, context: AspectContext): Promise<InterceptionResult>;
  canIntercept(joinPoint: JoinPoint): boolean;
}

export interface MethodSelector {
  readonly pattern: string;
  readonly type: 'exact' | 'wildcard' | 'regex' | 'annotation';
  readonly scope: 'class' | 'method' | 'package';
  matches(methodSignature: string): boolean;
}

export interface InterceptionCondition {
  readonly type: 'parameter' | 'return_type' | 'annotation' | 'runtime';
  readonly expression: string;
  readonly negate: boolean;
  evaluate(joinPoint: JoinPoint, context: AspectContext): Promise<boolean>;
}

export interface InterceptionResult {
  readonly interceptorId: string;
  readonly interceptionType: InterceptionType;
  readonly success: boolean;
  readonly executionTime: number;
  readonly modifiedArgs?: any[];
  readonly modifiedResult?: any;
  readonly metadata: Record<string, any>;
  readonly errors: AspectError[];
}

// Aspect Proxy Framework
export interface AspectProxy<T = any> {
  readonly targetObject: T;
  readonly aspectInterceptors: MethodInterceptor[];
  readonly proxyMetadata: ProxyMetadata;
  createProxy(): T;
  addInterceptor(interceptor: MethodInterceptor): void;
  removeInterceptor(interceptorId: string): void;
  getInterceptionHistory(): InterceptionHistoryEntry[];
}

export interface ProxyMetadata {
  readonly proxyId: string;
  readonly createdAt: Date;
  readonly targetType: string;
  readonly interceptorCount: number;
  readonly totalInterceptions: number;
  readonly lastInterceptionAt?: Date;
}

export interface InterceptionHistoryEntry {
  readonly timestamp: Date;
  readonly interceptorId: string;
  readonly methodName: string;
  readonly interceptionType: InterceptionType;
  readonly executionTime: number;
  readonly success: boolean;
}

// Aspect Weaving Framework
export interface AspectWeaver {
  readonly weaverId: string;
  readonly weavingStrategy: WeavingStrategy;
  weaveAspects(target: any, aspects: IAuthenticationAspect[]): Promise<Result<WeavedObject, AspectError>>;
  unweaveAspects(weavedObject: WeavedObject): Promise<Result<any, AspectError>>;
  getWeavingMetadata(target: any): WeavingMetadata | null;
}

export interface WeavingStrategy {
  readonly name: string;
  readonly type: 'compile_time' | 'load_time' | 'runtime';
  readonly priority: number;
  weave(target: any, aspects: IAuthenticationAspect[]): Promise<WeavedObject>;
  canWeave(target: any, aspect: IAuthenticationAspect): boolean;
}

export interface WeavedObject {
  readonly weavingId: string;
  readonly originalObject: any;
  readonly weavedObject: any;
  readonly weavedAspects: IAuthenticationAspect[];
  readonly weavingMetadata: WeavingMetadata;
}

export interface WeavingMetadata {
  readonly weavingId: string;
  readonly weavedAt: Date;
  readonly weavingStrategy: string;
  readonly aspectCount: number;
  readonly methodsWeaved: string[];
  readonly weavingTime: number;
}

// Advanced Interception Configuration
export interface InterceptionConfiguration {
  readonly enableMethodInterception: boolean;
  readonly enableAspectProxy: boolean;
  readonly enableAspectWeaving: boolean;
  readonly maxInterceptorsPerMethod: number;
  readonly interceptionTimeout: number;
  readonly cacheInterceptionResults: boolean;
  readonly enableInterceptionHistory: boolean;
  readonly historyRetentionPeriod: number;
  readonly performance: {
    enableProfiling: boolean;
    enableOptimization: boolean;
    maxExecutionTime: number;
  };
}

/**
 * Aspect Interception Framework
 * Enterprise-grade method-level aspect interception
 */
export class AspectInterceptionFramework {
  private static instance: AspectInterceptionFramework | null = null;
  private configuration: InterceptionConfiguration;
  
  // Framework Components
  private methodInterceptors: Map<string, MethodInterceptor> = new Map();
  private aspectProxies: Map<string, AspectProxy> = new Map();
  private aspectWeavers: Map<string, AspectWeaver> = new Map();
  private interceptionHistory: Map<string, InterceptionHistoryEntry[]> = new Map();
  
  // Performance and Monitoring
  private frameworkMetrics: InterceptionFrameworkMetrics;
  private isInitialized: boolean = false;

  private constructor(configuration?: Partial<InterceptionConfiguration>) {
    this.configuration = {
      enableMethodInterception: true,
      enableAspectProxy: true,
      enableAspectWeaving: true,
      maxInterceptorsPerMethod: 10,
      interceptionTimeout: 5000,
      cacheInterceptionResults: true,
      enableInterceptionHistory: true,
      historyRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      performance: {
        enableProfiling: true,
        enableOptimization: true,
        maxExecutionTime: 1000
      },
      ...configuration
    };

    this.frameworkMetrics = this.initializeMetrics();
  }

  /**
   * Get singleton instance
   */
  static getInstance(configuration?: Partial<InterceptionConfiguration>): AspectInterceptionFramework {
    if (!AspectInterceptionFramework.instance) {
      AspectInterceptionFramework.instance = new AspectInterceptionFramework(configuration);
    }
    return AspectInterceptionFramework.instance;
  }

  /**
   * Initialize interception framework
   */
  async initialize(): Promise<Result<void, AspectError>> {
    try {
      console.log('[INTERCEPTION] Initializing Aspect Interception Framework...');

      // Initialize default interceptors
      await this.initializeDefaultInterceptors();
      
      // Initialize aspect weavers
      await this.initializeAspectWeavers();
      
      // Start cleanup processes
      if (this.configuration.enableInterceptionHistory) {
        this.startHistoryCleanup();
      }

      this.isInitialized = true;
      console.log('[INTERCEPTION] Aspect Interception Framework initialized successfully', {
        interceptors: this.methodInterceptors.size,
        proxies: this.aspectProxies.size,
        weavers: this.aspectWeavers.size
      });

      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Interception framework initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INTERCEPTION_INIT_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Register method interceptor
   */
  async registerInterceptor(interceptor: MethodInterceptor): Promise<Result<void, AspectError>> {
    try {
      if (this.methodInterceptors.has(interceptor.id)) {
        return Result.error(new AspectError(
          `Interceptor already registered: ${interceptor.id}`,
          'INTERCEPTOR_ALREADY_REGISTERED'
        ));
      }

      this.methodInterceptors.set(interceptor.id, interceptor);
      this.frameworkMetrics.totalInterceptorsRegistered++;

      console.log('[INTERCEPTION] Method interceptor registered:', {
        id: interceptor.id,
        name: interceptor.name,
        type: interceptor.interceptionType,
        priority: interceptor.priority
      });

      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register interceptor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INTERCEPTOR_REGISTRATION_FAILED',
        { interceptorId: interceptor.id, originalError: error }
      ));
    }
  }

  /**
   * Create aspect proxy
   */
  async createAspectProxy<T>(
    targetObject: T,
    interceptors: MethodInterceptor[] = []
  ): Promise<Result<AspectProxy<T>, AspectError>> {
    try {
      const proxyId = this.generateProxyId();
      const proxyMetadata: ProxyMetadata = {
        proxyId,
        createdAt: new Date(),
        targetType: targetObject?.constructor?.name || 'Unknown',
        interceptorCount: interceptors.length,
        totalInterceptions: 0
      };

      const aspectProxy: AspectProxy<T> = {
        targetObject,
        aspectInterceptors: [...interceptors],
        proxyMetadata,
        
        createProxy: () => {
          return this.createProxyObject(targetObject, interceptors, proxyMetadata);
        },
        
        addInterceptor: (interceptor: MethodInterceptor) => {
          aspectProxy.aspectInterceptors.push(interceptor);
          proxyMetadata.interceptorCount++;
        },
        
        removeInterceptor: (interceptorId: string) => {
          const index = aspectProxy.aspectInterceptors.findIndex(i => i.id === interceptorId);
          if (index !== -1) {
            aspectProxy.aspectInterceptors.splice(index, 1);
            proxyMetadata.interceptorCount--;
          }
        },
        
        getInterceptionHistory: () => {
          return this.interceptionHistory.get(proxyId) || [];
        }
      };

      this.aspectProxies.set(proxyId, aspectProxy);
      this.frameworkMetrics.totalProxiesCreated++;

      return Result.ok(aspectProxy);

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to create aspect proxy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROXY_CREATION_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Intercept method execution
   */
  async interceptMethodExecution(
    joinPoint: JoinPoint,
    context: AspectContext,
    targetInterceptors: MethodInterceptor[]
  ): Promise<Result<InterceptionExecutionResult, AspectError>> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    try {
      this.frameworkMetrics.totalInterceptions++;

      const result: InterceptionExecutionResult = {
        executionId,
        joinPoint,
        interceptorResults: [],
        modifiedArgs: joinPoint.args,
        modifiedResult: undefined,
        executionTime: 0,
        success: true,
        errors: []
      };

      // Sort interceptors by priority
      const sortedInterceptors = [...targetInterceptors].sort((a, b) => b.priority - a.priority);

      // Execute BEFORE interceptors
      const beforeInterceptors = sortedInterceptors.filter(i => 
        i.interceptionType === InterceptionType.BEFORE_METHOD
      );
      
      for (const interceptor of beforeInterceptors) {
        if (interceptor.canIntercept(joinPoint)) {
          const interceptionResult = await this.executeInterceptor(interceptor, joinPoint, context);
          result.interceptorResults.push(interceptionResult);
          
          if (!interceptionResult.success) {
            result.success = false;
            result.errors.push(...interceptionResult.errors);
          }
          
          // Apply argument modifications
          if (interceptionResult.modifiedArgs) {
            result.modifiedArgs = interceptionResult.modifiedArgs;
            joinPoint.setArgs(interceptionResult.modifiedArgs);
          }
        }
      }

      // Execute AROUND interceptors (would wrap the actual method execution)
      const aroundInterceptors = sortedInterceptors.filter(i => 
        i.interceptionType === InterceptionType.AROUND_METHOD
      );
      
      for (const interceptor of aroundInterceptors) {
        if (interceptor.canIntercept(joinPoint)) {
          const interceptionResult = await this.executeInterceptor(interceptor, joinPoint, context);
          result.interceptorResults.push(interceptionResult);
          
          if (interceptionResult.modifiedResult !== undefined) {
            result.modifiedResult = interceptionResult.modifiedResult;
          }
        }
      }

      // Execute AFTER interceptors
      const afterInterceptors = sortedInterceptors.filter(i => 
        i.interceptionType === InterceptionType.AFTER_METHOD
      );
      
      for (const interceptor of afterInterceptors) {
        if (interceptor.canIntercept(joinPoint)) {
          const interceptionResult = await this.executeInterceptor(interceptor, joinPoint, context);
          result.interceptorResults.push(interceptionResult);
        }
      }

      result.executionTime = Date.now() - startTime;
      
      // Record interception history
      if (this.configuration.enableInterceptionHistory) {
        this.recordInterceptionHistory(executionId, result);
      }

      // Update metrics
      if (result.success) {
        this.frameworkMetrics.successfulInterceptions++;
      } else {
        this.frameworkMetrics.failedInterceptions++;
      }

      return Result.ok(result);

    } catch (error) {
      this.frameworkMetrics.failedInterceptions++;
      return Result.error(new AspectError(
        `Method interception execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INTERCEPTION_EXECUTION_FAILED',
        { executionId, originalError: error }
      ));
    }
  }

  /**
   * Create proxy object with interception
   */
  private createProxyObject<T>(
    target: T,
    interceptors: MethodInterceptor[],
    metadata: ProxyMetadata
  ): T {
    return new Proxy(target as any, {
      get: (obj, prop) => {
        const originalValue = obj[prop];
        
        if (typeof originalValue === 'function') {
          return async (...args: any[]) => {
            const joinPoint: JoinPoint = {
              method: String(prop),
              target: obj,
              args,
              context: {
                operation: `proxy:${String(prop)}`,
                userId: 'system',
                sessionId: 'proxy-session',
                timestamp: new Date(),
                metadata: { proxyId: metadata.proxyId }
              },
              getTarget: () => obj,
              getMethod: () => String(prop),
              getArgs: () => args,
              setArgs: (newArgs: any[]) => {
                args.splice(0, args.length, ...newArgs);
              }
            };

            // Get applicable interceptors for this method
            const applicableInterceptors = interceptors.filter(interceptor =>
              interceptor.canIntercept(joinPoint)
            );

            if (applicableInterceptors.length > 0) {
              const interceptionResult = await this.interceptMethodExecution(
                joinPoint, 
                joinPoint.context, 
                applicableInterceptors
              );

              if (interceptionResult.isSuccess()) {
                const result = interceptionResult.value;
                if (result.modifiedResult !== undefined) {
                  return result.modifiedResult;
                }
                
                // Execute original method with potentially modified arguments
                return originalValue.apply(obj, result.modifiedArgs);
              } else {
                throw interceptionResult.error;
              }
            }

            // No interceptors, execute original method
            return originalValue.apply(obj, args);
          };
        }

        return originalValue;
      }
    });
  }

  /**
   * Execute individual interceptor
   */
  private async executeInterceptor(
    interceptor: MethodInterceptor,
    joinPoint: JoinPoint,
    context: AspectContext
  ): Promise<InterceptionResult> {
    const startTime = Date.now();

    try {
      // Check conditions
      for (const condition of interceptor.conditions) {
        const conditionMet = await condition.evaluate(joinPoint, context);
        if (condition.negate ? conditionMet : !conditionMet) {
          return {
            interceptorId: interceptor.id,
            interceptionType: interceptor.interceptionType,
            success: false,
            executionTime: Date.now() - startTime,
            metadata: { reason: 'condition_not_met', condition: condition.expression },
            errors: []
          };
        }
      }

      // Execute interceptor
      const result = await Promise.race([
        interceptor.intercept(joinPoint, context),
        new Promise<InterceptionResult>((_, reject) => 
          setTimeout(() => reject(new Error('Interception timeout')), this.configuration.interceptionTimeout)
        )
      ]);

      return {
        ...result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        interceptorId: interceptor.id,
        interceptionType: interceptor.interceptionType,
        success: false,
        executionTime: Date.now() - startTime,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        errors: [new AspectError(
          `Interceptor execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'INTERCEPTOR_EXECUTION_FAILED',
          { interceptorId: interceptor.id, originalError: error }
        )]
      };
    }
  }

  /**
   * Initialize default interceptors
   */
  private async initializeDefaultInterceptors(): Promise<void> {
    // Authentication method interceptor
    const authInterceptor: MethodInterceptor = {
      id: 'auth_method_interceptor',
      name: 'Authentication Method Interceptor',
      interceptionType: InterceptionType.BEFORE_METHOD,
      targetMethods: [{
        pattern: '*auth*',
        type: 'wildcard',
        scope: 'method',
        matches: (signature: string) => signature.toLowerCase().includes('auth')
      }],
      priority: 100,
      conditions: [],
      intercept: async (joinPoint, context) => {
        console.log(`[INTERCEPTION] Authentication method intercepted: ${joinPoint.method}`);
        return {
          interceptorId: 'auth_method_interceptor',
          interceptionType: InterceptionType.BEFORE_METHOD,
          success: true,
          executionTime: 1,
          metadata: { 
            interceptedMethod: joinPoint.method,
            timestamp: new Date().toISOString()
          },
          errors: []
        };
      },
      canIntercept: (joinPoint) => joinPoint.method.toLowerCase().includes('auth')
    };

    await this.registerInterceptor(authInterceptor);
  }

  /**
   * Initialize aspect weavers
   */
  private async initializeAspectWeavers(): Promise<void> {
    // Runtime weaving strategy
    const runtimeWeavingStrategy: WeavingStrategy = {
      name: 'runtime_weaving',
      type: 'runtime',
      priority: 1,
      weave: async (target, aspects) => {
        const weavingId = this.generateWeavingId();
        const startTime = Date.now();
        
        // Simple runtime weaving - in production this would be more sophisticated
        const weavedObject = target; // Simplified for now
        
        return {
          weavingId,
          originalObject: target,
          weavedObject,
          weavedAspects: aspects,
          weavingMetadata: {
            weavingId,
            weavedAt: new Date(),
            weavingStrategy: 'runtime_weaving',
            aspectCount: aspects.length,
            methodsWeaved: Object.getOwnPropertyNames(target).filter(prop => 
              typeof (target as any)[prop] === 'function'
            ),
            weavingTime: Date.now() - startTime
          }
        };
      },
      canWeave: (target, aspect) => true
    };

    const runtimeWeaver: AspectWeaver = {
      weaverId: 'runtime_weaver',
      weavingStrategy: runtimeWeavingStrategy,
      weaveAspects: async (target, aspects) => {
        try {
          const weavedObject = await runtimeWeavingStrategy.weave(target, aspects);
          return Result.ok(weavedObject);
        } catch (error) {
          return Result.error(new AspectError(
            `Weaving failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'WEAVING_FAILED',
            { originalError: error }
          ));
        }
      },
      unweaveAspects: async (weavedObject) => {
        return Result.ok(weavedObject.originalObject);
      },
      getWeavingMetadata: (target) => {
        // In production, this would track weaving metadata
        return null;
      }
    };

    this.aspectWeavers.set('runtime_weaver', runtimeWeaver);
  }

  /**
   * Record interception history
   */
  private recordInterceptionHistory(executionId: string, result: InterceptionExecutionResult): void {
    if (!this.interceptionHistory.has(executionId)) {
      this.interceptionHistory.set(executionId, []);
    }

    const history = this.interceptionHistory.get(executionId)!;
    
    result.interceptorResults.forEach(interceptorResult => {
      history.push({
        timestamp: new Date(),
        interceptorId: interceptorResult.interceptorId,
        methodName: result.joinPoint.method,
        interceptionType: interceptorResult.interceptionType,
        executionTime: interceptorResult.executionTime,
        success: interceptorResult.success
      });
    });
  }

  /**
   * Start history cleanup process
   */
  private startHistoryCleanup(): void {
    setInterval(() => {
      const cutoffTime = Date.now() - this.configuration.historyRetentionPeriod;
      
      for (const [executionId, history] of this.interceptionHistory) {
        const filteredHistory = history.filter(entry => 
          entry.timestamp.getTime() > cutoffTime
        );
        
        if (filteredHistory.length === 0) {
          this.interceptionHistory.delete(executionId);
        } else {
          this.interceptionHistory.set(executionId, filteredHistory);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Generate unique IDs
   */
  private generateProxyId(): string {
    return `proxy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWeavingId(): string {
    return `weave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): InterceptionFrameworkMetrics {
    return {
      totalInterceptorsRegistered: 0,
      totalProxiesCreated: 0,
      totalInterceptions: 0,
      successfulInterceptions: 0,
      failedInterceptions: 0,
      averageInterceptionTime: 0
    };
  }

  /**
   * Get framework metrics
   */
  getMetrics(): InterceptionFrameworkMetrics {
    return { ...this.frameworkMetrics };
  }

  /**
   * Get registered interceptors
   */
  getRegisteredInterceptors(): MethodInterceptor[] {
    return Array.from(this.methodInterceptors.values());
  }

  /**
   * Get configuration
   */
  getConfiguration(): InterceptionConfiguration {
    return { ...this.configuration };
  }

  /**
   * Check if framework is initialized
   */
  isFrameworkInitialized(): boolean {
    return this.isInitialized;
  }
}

// Supporting Interfaces
interface InterceptionExecutionResult {
  readonly executionId: string;
  readonly joinPoint: JoinPoint;
  readonly interceptorResults: InterceptionResult[];
  readonly modifiedArgs: any[];
  readonly modifiedResult: any;
  readonly executionTime: number;
  readonly success: boolean;
  readonly errors: AspectError[];
}

interface InterceptionFrameworkMetrics {
  totalInterceptorsRegistered: number;
  totalProxiesCreated: number;
  totalInterceptions: number;
  successfulInterceptions: number;
  failedInterceptions: number;
  averageInterceptionTime: number;
}