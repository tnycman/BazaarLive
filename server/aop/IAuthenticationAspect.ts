/**
 * IAuthenticationAspect Interface - Enterprise AOP Foundation
 * Defines the contract for all authentication-related aspects
 */

import { ValidationResult } from '../domain/AuthenticationStrategy';
import { Result } from '../domain/Hostname';

// Aspect Error Types
export class AspectError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'ASPECT_ERROR',
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AspectError';
  }
}

export class AspectExecutionError extends AspectError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'ASPECT_EXECUTION_ERROR', context);
    this.name = 'AspectExecutionError';
  }
}

export class AspectLifecycleError extends AspectError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'ASPECT_LIFECYCLE_ERROR', context);
    this.name = 'AspectLifecycleError';
  }
}

// Aspect Context Types
export interface AspectContext {
  readonly requestId: string;
  readonly timestamp: Date;
  readonly operation: string;
  readonly hostname?: string;
  readonly environment?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly metadata: Record<string, any>;
}

export interface AspectExecutionContext extends AspectContext {
  readonly phase: 'before' | 'after' | 'onError' | 'finally';
  readonly args?: any[];
  readonly result?: any;
  readonly error?: Error;
  readonly duration?: number;
  readonly stackTrace?: string;
}

// Join Point Types
export interface JoinPoint {
  readonly target: any;
  readonly method: string;
  readonly args: any[];
  readonly context: AspectContext;
  readonly proceed: () => Promise<any>;
  readonly getTarget: () => any;
  readonly getMethod: () => string;
  readonly getArgs: () => any[];
  readonly setArgs: (args: any[]) => void;
}

// Advice Types
export type BeforeAdvice = (joinPoint: JoinPoint) => Promise<void>;
export type AfterAdvice = (joinPoint: JoinPoint, result: any) => Promise<void>;
export type AfterThrowingAdvice = (joinPoint: JoinPoint, error: Error) => Promise<void>;
export type AroundAdvice = (joinPoint: JoinPoint) => Promise<any>;
export type FinallyAdvice = (joinPoint: JoinPoint) => Promise<void>;

// Aspect Configuration
export interface AspectConfiguration {
  readonly name: string;
  readonly enabled: boolean;
  readonly priority: number;
  readonly pointcuts: string[];
  readonly options: Record<string, any>;
  readonly timeoutMs?: number;
  readonly retryAttempts?: number;
  readonly fallbackEnabled?: boolean;
}

// Aspect Health Status
export interface AspectHealthStatus {
  readonly isHealthy: boolean;
  readonly aspectName: string;
  readonly executionCount: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly avgExecutionTime: number;
  readonly lastExecution?: Date;
  readonly lastError?: {
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
  };
}

// Aspect Statistics
export interface AspectStatistics {
  readonly aspectName: string;
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly averageExecutionTime: number;
  readonly minExecutionTime: number;
  readonly maxExecutionTime: number;
  readonly executionsByPhase: Record<string, number>;
  readonly errorsByType: Record<string, number>;
  readonly lastExecutions: Array<{
    timestamp: Date;
    duration: number;
    success: boolean;
    operation: string;
  }>;
  readonly period: {
    start: Date;
    end: Date;
  };
}

/**
 * Main Authentication Aspect Interface
 * All authentication aspects must implement this interface
 */
export interface IAuthenticationAspect {
  /**
   * Get aspect configuration
   */
  getConfiguration(): AspectConfiguration;

  /**
   * Get aspect name for identification
   */
  getName(): string;

  /**
   * Get aspect priority for execution ordering
   */
  getPriority(): number;

  /**
   * Check if aspect is enabled
   */
  isEnabled(): boolean;

  /**
   * Initialize the aspect with configuration
   */
  initialize(config?: Partial<AspectConfiguration>): Promise<Result<void, AspectError>>;

  /**
   * Cleanup aspect resources
   */
  cleanup(): Promise<Result<void, AspectError>>;

  /**
   * Validate aspect configuration and dependencies
   */
  validate(): Promise<ValidationResult>;

  /**
   * Get current health status
   */
  getHealthStatus(): Promise<AspectHealthStatus>;

  /**
   * Get execution statistics
   */
  getStatistics(): AspectStatistics;

  /**
   * Reset statistics and counters
   */
  resetStatistics(): void;

  // Lifecycle Advice Methods
  
  /**
   * Execute before target method
   */
  before?(joinPoint: JoinPoint): Promise<void>;

  /**
   * Execute after successful target method completion
   */
  after?(joinPoint: JoinPoint, result: any): Promise<void>;

  /**
   * Execute when target method throws an error
   */
  afterThrowing?(joinPoint: JoinPoint, error: Error): Promise<void>;

  /**
   * Execute around target method (can control execution)
   */
  around?(joinPoint: JoinPoint): Promise<any>;

  /**
   * Execute after target method completion (success or failure)
   */
  finally?(joinPoint: JoinPoint): Promise<void>;

  // Aspect-Specific Methods

  /**
   * Handle aspect-specific events
   */
  handleEvent?(event: string, context: AspectContext, data?: any): Promise<void>;

  /**
   * Process aspect-specific data
   */
  processData?(data: any, context: AspectContext): Promise<any>;

  /**
   * Validate aspect-specific input
   */
  validateInput?(input: any, context: AspectContext): Promise<ValidationResult>;

  /**
   * Transform aspect-specific output
   */
  transformOutput?(output: any, context: AspectContext): Promise<any>;
}

/**
 * Abstract Base Authentication Aspect
 * Provides common functionality for all authentication aspects
 */
export abstract class BaseAuthenticationAspect implements IAuthenticationAspect {
  protected configuration: AspectConfiguration;
  protected statistics: AspectStatistics;
  protected healthStatus: AspectHealthStatus;
  protected isInitialized: boolean = false;

  constructor(configuration: AspectConfiguration) {
    this.configuration = configuration;
    this.statistics = this.initializeStatistics();
    this.healthStatus = this.initializeHealthStatus();
  }

  // Abstract methods that must be implemented
  abstract getName(): string;
  abstract validate(): Promise<ValidationResult>;

  // Common implementations
  getConfiguration(): AspectConfiguration {
    return { ...this.configuration };
  }

  getPriority(): number {
    return this.configuration.priority;
  }

  isEnabled(): boolean {
    return this.configuration.enabled;
  }

  async initialize(config?: Partial<AspectConfiguration>): Promise<Result<void, AspectError>> {
    try {
      if (config) {
        this.configuration = { ...this.configuration, ...config };
      }

      const validation = await this.validate();
      if (!validation.isValid) {
        return Result.error(new AspectLifecycleError(
          `Aspect initialization failed: ${validation.errors.map(e => e.message).join(', ')}`,
          { aspectName: this.getName(), errors: validation.errors }
        ));
      }

      await this.onInitialize();
      this.isInitialized = true;

      return Result.ok(undefined);
    } catch (error) {
      return Result.error(new AspectLifecycleError(
        `Aspect initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { aspectName: this.getName(), originalError: error }
      ));
    }
  }

  async cleanup(): Promise<Result<void, AspectError>> {
    try {
      await this.onCleanup();
      this.isInitialized = false;
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(new AspectLifecycleError(
        `Aspect cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { aspectName: this.getName(), originalError: error }
      ));
    }
  }

  async getHealthStatus(): Promise<AspectHealthStatus> {
    this.updateHealthStatus();
    return { ...this.healthStatus };
  }

  getStatistics(): AspectStatistics {
    this.statistics.period.end = new Date();
    return { ...this.statistics };
  }

  resetStatistics(): void {
    this.statistics = this.initializeStatistics();
  }

  // Protected helper methods
  protected async executeWithTracking<T>(
    operation: string,
    context: AspectContext,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.statistics.totalExecutions++;

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      this.statistics.successfulExecutions++;
      this.updateExecutionTime(duration);
      this.recordExecution(operation, duration, true);
      this.healthStatus.successCount++;

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.statistics.failedExecutions++;
      this.updateExecutionTime(duration);
      this.recordExecution(operation, duration, false);
      this.healthStatus.errorCount++;
      this.healthStatus.lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        context: { operation, ...context.metadata }
      };

      throw error;
    } finally {
      this.healthStatus.executionCount++;
      this.healthStatus.lastExecution = new Date();
      this.updateHealthStatus();
    }
  }

  protected createJoinPoint(
    target: any,
    method: string,
    args: any[],
    context: AspectContext
  ): JoinPoint {
    return {
      target,
      method,
      args: [...args], // Clone to prevent mutation
      context,
      proceed: async () => {
        return await target[method](...args);
      },
      getTarget: () => target,
      getMethod: () => method,
      getArgs: () => [...args],
      setArgs: (newArgs: any[]) => {
        args.length = 0;
        args.push(...newArgs);
      }
    };
  }

  // Virtual methods for subclass customization
  protected async onInitialize(): Promise<void> {
    // Override in subclasses for custom initialization
  }

  protected async onCleanup(): Promise<void> {
    // Override in subclasses for custom cleanup
  }

  // Private helper methods
  private initializeStatistics(): AspectStatistics {
    return {
      aspectName: this.getName(),
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      minExecutionTime: Number.MAX_VALUE,
      maxExecutionTime: 0,
      executionsByPhase: {},
      errorsByType: {},
      lastExecutions: [],
      period: {
        start: new Date(),
        end: new Date()
      }
    };
  }

  private initializeHealthStatus(): AspectHealthStatus {
    return {
      isHealthy: true,
      aspectName: this.getName(),
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
      avgExecutionTime: 0
    };
  }

  private updateExecutionTime(duration: number): void {
    this.statistics.minExecutionTime = Math.min(this.statistics.minExecutionTime, duration);
    this.statistics.maxExecutionTime = Math.max(this.statistics.maxExecutionTime, duration);
    
    const total = this.statistics.totalExecutions;
    this.statistics.averageExecutionTime = 
      (this.statistics.averageExecutionTime * (total - 1) + duration) / total;
  }

  private recordExecution(operation: string, duration: number, success: boolean): void {
    this.statistics.lastExecutions.unshift({
      timestamp: new Date(),
      duration,
      success,
      operation
    });

    // Keep only last 100 executions
    if (this.statistics.lastExecutions.length > 100) {
      this.statistics.lastExecutions = this.statistics.lastExecutions.slice(0, 100);
    }
  }

  private updateHealthStatus(): void {
    const total = this.healthStatus.executionCount;
    if (total > 0) {
      const successRate = this.healthStatus.successCount / total;
      this.healthStatus.isHealthy = successRate >= 0.95; // 95% success rate threshold
      this.healthStatus.avgExecutionTime = this.statistics.averageExecutionTime;
    }
  }
}