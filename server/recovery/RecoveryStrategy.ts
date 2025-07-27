/**
 * Recovery Strategy Framework - Phase 4 Task 4.2
 * Enterprise-grade error recovery interface and orchestration system
 */

import { DomainError, ErrorRecoverySuggestion } from '../error/DomainError';

// Recovery Result Types
export enum RecoveryResultType {
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILURE = 'failure',
  RETRY_REQUIRED = 'retry_required',
  MANUAL_INTERVENTION_REQUIRED = 'manual_intervention_required',
  ESCALATION_REQUIRED = 'escalation_required'
}

// Recovery Strategy Types
export enum RecoveryStrategyType {
  AUTOMATED = 'automated',
  GUIDED = 'guided',
  MANUAL = 'manual',
  HYBRID = 'hybrid'
}

// Recovery Context
export interface RecoveryContext {
  readonly attemptNumber: number;
  readonly maxAttempts: number;
  readonly previousAttempts: RecoveryAttempt[];
  readonly startTime: Date;
  readonly timeout: number;
  readonly environment: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly correlationId: string;
  readonly metadata: Record<string, any>;
}

// Recovery Attempt
export interface RecoveryAttempt {
  readonly attemptNumber: number;
  readonly strategyName: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly result: RecoveryResultType;
  readonly actions: RecoveryAction[];
  readonly metadata: Record<string, any>;
  readonly error?: Error;
}

// Recovery Action
export interface RecoveryAction {
  readonly actionId: string;
  readonly actionType: string;
  readonly description: string;
  readonly executed: boolean;
  readonly success: boolean;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly result?: any;
  readonly error?: Error;
  readonly metadata: Record<string, any>;
}

// Recovery Result
export interface RecoveryResult {
  readonly type: RecoveryResultType;
  readonly success: boolean;
  readonly message: string;
  readonly actions: RecoveryAction[];
  readonly duration: number;
  readonly metadata: Record<string, any>;
  readonly nextSteps?: string[];
  readonly retryAfter?: number;
  readonly escalationRequired?: boolean;
}

// Recovery Metrics
export interface RecoveryMetrics {
  readonly strategyName: string;
  readonly totalAttempts: number;
  readonly successfulAttempts: number;
  readonly failedAttempts: number;
  readonly successRate: number;
  readonly averageDuration: number;
  readonly lastAttempt?: Date;
  readonly lastSuccess?: Date;
  readonly consecutiveFailures: number;
}

/**
 * Base Recovery Strategy Interface
 * Defines contract for all recovery strategy implementations
 */
export interface RecoveryStrategy<TError extends DomainError = DomainError> {
  /**
   * Strategy identification
   */
  readonly name: string;
  readonly type: RecoveryStrategyType;
  readonly priority: number;
  readonly version: string;

  /**
   * Strategy capabilities
   */
  canHandle(error: TError): boolean;
  isAutomated(): boolean;
  getMaxAttempts(): number;
  getTimeout(): number;

  /**
   * Recovery execution
   */
  executeRecovery(error: TError, context: RecoveryContext): Promise<RecoveryResult>;
  
  /**
   * Strategy management
   */
  validateContext(context: RecoveryContext): boolean;
  estimateRecoveryTime(error: TError): number;
  getRequiredPermissions(): string[];
  
  /**
   * Monitoring and metrics
   */
  getMetrics(): RecoveryMetrics;
  updateMetrics(attempt: RecoveryAttempt): void;
  reset(): void;
}

/**
 * Abstract Base Recovery Strategy
 * Provides common functionality for concrete recovery strategies
 */
export abstract class BaseRecoveryStrategy<TError extends DomainError = DomainError> 
  implements RecoveryStrategy<TError> {
  
  public readonly name: string;
  public readonly type: RecoveryStrategyType;
  public readonly priority: number;
  public readonly version: string;

  protected metrics: RecoveryMetrics;
  protected attempts: RecoveryAttempt[] = [];

  constructor(
    name: string,
    type: RecoveryStrategyType,
    priority: number,
    version: string = '1.0.0'
  ) {
    this.name = name;
    this.type = type;
    this.priority = priority;
    this.version = version;
    
    this.metrics = {
      strategyName: name,
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      successRate: 0,
      averageDuration: 0,
      consecutiveFailures: 0
    };
  }

  // Abstract methods to be implemented by concrete strategies
  abstract canHandle(error: TError): boolean;
  abstract executeRecoveryActions(error: TError, context: RecoveryContext): Promise<RecoveryAction[]>;
  abstract getMaxAttempts(): number;
  abstract getTimeout(): number;

  /**
   * Default implementations
   */
  isAutomated(): boolean {
    return this.type === RecoveryStrategyType.AUTOMATED || 
           this.type === RecoveryStrategyType.HYBRID;
  }

  validateContext(context: RecoveryContext): boolean {
    return context.attemptNumber <= this.getMaxAttempts() &&
           context.attemptNumber > 0 &&
           context.timeout > 0;
  }

  estimateRecoveryTime(error: TError): number {
    // Base implementation returns average duration or default
    return this.metrics.averageDuration || 5000; // 5 seconds default
  }

  getRequiredPermissions(): string[] {
    return []; // Most strategies don't require special permissions
  }

  /**
   * Main recovery execution method
   */
  async executeRecovery(error: TError, context: RecoveryContext): Promise<RecoveryResult> {
    const startTime = new Date();
    const attemptId = `${this.name}-${context.attemptNumber}-${Date.now()}`;
    
    try {
      // Validate context
      if (!this.validateContext(context)) {
        return this.createFailureResult(
          'Invalid recovery context',
          [],
          Date.now() - startTime.getTime()
        );
      }

      // Check if we can handle this error
      if (!this.canHandle(error)) {
        return this.createFailureResult(
          `Strategy ${this.name} cannot handle error type: ${error.constructor.name}`,
          [],
          Date.now() - startTime.getTime()
        );
      }

      // Execute recovery actions
      const actions = await this.executeRecoveryActions(error, context);
      const duration = Date.now() - startTime.getTime();

      // Analyze results
      const successfulActions = actions.filter(a => a.success);
      const failedActions = actions.filter(a => !a.success);

      let resultType: RecoveryResultType;
      let message: string;

      if (failedActions.length === 0) {
        resultType = RecoveryResultType.SUCCESS;
        message = `Recovery completed successfully with ${successfulActions.length} actions`;
      } else if (successfulActions.length > 0) {
        resultType = RecoveryResultType.PARTIAL_SUCCESS;
        message = `Partial recovery: ${successfulActions.length}/${actions.length} actions succeeded`;
      } else {
        resultType = RecoveryResultType.FAILURE;
        message = `Recovery failed: All ${actions.length} actions failed`;
      }

      // Create recovery attempt record
      const attempt: RecoveryAttempt = {
        attemptNumber: context.attemptNumber,
        strategyName: this.name,
        startTime,
        endTime: new Date(),
        duration,
        result: resultType,
        actions,
        metadata: {
          attemptId,
          errorType: error.constructor.name,
          errorCode: error.errorCode,
          ...context.metadata
        }
      };

      // Update metrics
      this.updateMetrics(attempt);

      // Create result
      const result: RecoveryResult = {
        type: resultType,
        success: resultType === RecoveryResultType.SUCCESS,
        message,
        actions,
        duration,
        metadata: {
          attemptId,
          strategyName: this.name,
          errorType: error.constructor.name
        }
      };

      // Add next steps for partial success or failure
      if (resultType !== RecoveryResultType.SUCCESS) {
        result.nextSteps = this.generateNextSteps(error, context, actions);
        
        if (context.attemptNumber < this.getMaxAttempts()) {
          result.retryAfter = this.calculateRetryDelay(context.attemptNumber);
        } else {
          result.escalationRequired = true;
        }
      }

      return result;

    } catch (executionError) {
      const duration = Date.now() - startTime.getTime();
      
      // Log execution error
      console.error(`[RECOVERY-ERROR] Strategy ${this.name} execution failed:`, {
        error: executionError,
        errorType: error.constructor.name,
        errorCode: error.errorCode,
        attemptNumber: context.attemptNumber,
        duration
      });

      // Create failure attempt record
      const attempt: RecoveryAttempt = {
        attemptNumber: context.attemptNumber,
        strategyName: this.name,
        startTime,
        endTime: new Date(),
        duration,
        result: RecoveryResultType.FAILURE,
        actions: [],
        metadata: { attemptId },
        error: executionError instanceof Error ? executionError : new Error(String(executionError))
      };

      this.updateMetrics(attempt);

      return this.createFailureResult(
        `Strategy execution failed: ${executionError}`,
        [],
        duration
      );
    }
  }

  /**
   * Metrics management
   */
  getMetrics(): RecoveryMetrics {
    return { ...this.metrics };
  }

  updateMetrics(attempt: RecoveryAttempt): void {
    this.attempts.push(attempt);
    
    this.metrics = {
      ...this.metrics,
      totalAttempts: this.metrics.totalAttempts + 1,
      successfulAttempts: attempt.result === RecoveryResultType.SUCCESS ? 
        this.metrics.successfulAttempts + 1 : this.metrics.successfulAttempts,
      failedAttempts: attempt.result === RecoveryResultType.FAILURE ? 
        this.metrics.failedAttempts + 1 : this.metrics.failedAttempts,
      lastAttempt: attempt.endTime || attempt.startTime
    };

    if (attempt.result === RecoveryResultType.SUCCESS) {
      this.metrics = {
        ...this.metrics,
        lastSuccess: attempt.endTime || attempt.startTime,
        consecutiveFailures: 0
      };
    } else if (attempt.result === RecoveryResultType.FAILURE) {
      this.metrics = {
        ...this.metrics,
        consecutiveFailures: this.metrics.consecutiveFailures + 1
      };
    }

    // Calculate success rate
    this.metrics = {
      ...this.metrics,
      successRate: this.metrics.totalAttempts > 0 ? 
        this.metrics.successfulAttempts / this.metrics.totalAttempts : 0
    };

    // Calculate average duration
    const totalDuration = this.attempts
      .filter(a => a.duration !== undefined)
      .reduce((sum, a) => sum + (a.duration || 0), 0);
    
    this.metrics = {
      ...this.metrics,
      averageDuration: this.attempts.length > 0 ? totalDuration / this.attempts.length : 0
    };
  }

  reset(): void {
    this.attempts = [];
    this.metrics = {
      strategyName: this.name,
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      successRate: 0,
      averageDuration: 0,
      consecutiveFailures: 0
    };
  }

  /**
   * Helper methods
   */
  protected createSuccessResult(
    message: string,
    actions: RecoveryAction[],
    duration: number,
    metadata: Record<string, any> = {}
  ): RecoveryResult {
    return {
      type: RecoveryResultType.SUCCESS,
      success: true,
      message,
      actions,
      duration,
      metadata: {
        strategyName: this.name,
        ...metadata
      }
    };
  }

  protected createFailureResult(
    message: string,
    actions: RecoveryAction[],
    duration: number,
    metadata: Record<string, any> = {}
  ): RecoveryResult {
    return {
      type: RecoveryResultType.FAILURE,
      success: false,
      message,
      actions,
      duration,
      metadata: {
        strategyName: this.name,
        ...metadata
      },
      escalationRequired: true
    };
  }

  protected createAction(
    actionType: string,
    description: string,
    metadata: Record<string, any> = {}
  ): RecoveryAction {
    return {
      actionId: `${actionType}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      actionType,
      description,
      executed: false,
      success: false,
      startTime: new Date(),
      metadata
    };
  }

  protected async executeAction(
    action: RecoveryAction,
    executor: () => Promise<any>
  ): Promise<RecoveryAction> {
    const startTime = new Date();
    
    try {
      const result = await executor();
      const endTime = new Date();
      
      return {
        ...action,
        executed: true,
        success: true,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        result,
        metadata: {
          ...action.metadata,
          executionSuccess: true
        }
      };
    } catch (error) {
      const endTime = new Date();
      
      return {
        ...action,
        executed: true,
        success: false,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          ...action.metadata,
          executionSuccess: false,
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  protected generateNextSteps(
    error: TError,
    context: RecoveryContext,
    actions: RecoveryAction[]
  ): string[] {
    const nextSteps: string[] = [];
    
    // Generic next steps based on failure analysis
    const failedActions = actions.filter(a => !a.success);
    
    if (failedActions.length > 0) {
      nextSteps.push(`Review failed actions: ${failedActions.map(a => a.actionType).join(', ')}`);
    }
    
    if (context.attemptNumber < this.getMaxAttempts()) {
      nextSteps.push(`Retry with strategy ${this.name} (attempt ${context.attemptNumber + 1}/${this.getMaxAttempts()})`);
    } else {
      nextSteps.push('Consider alternative recovery strategies');
      nextSteps.push('Escalate to manual intervention');
    }
    
    return nextSteps;
  }

  protected calculateRetryDelay(attemptNumber: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
    
    return Math.floor(delay + jitter);
  }
}

/**
 * Recovery Strategy Registry
 * Manages registration and lookup of recovery strategies
 */
export class RecoveryStrategyRegistry {
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private strategiesByErrorType: Map<string, RecoveryStrategy[]> = new Map();

  /**
   * Register a recovery strategy
   */
  register(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
    
    // Index by error types this strategy can handle
    // This would need to be enhanced with actual error type detection
    console.log(`[RECOVERY-REGISTRY] Registered strategy: ${strategy.name} (${strategy.type})`);
  }

  /**
   * Unregister a recovery strategy
   */
  unregister(strategyName: string): boolean {
    const removed = this.strategies.delete(strategyName);
    
    if (removed) {
      // Remove from error type indexes
      for (const [errorType, strategies] of this.strategiesByErrorType.entries()) {
        const filtered = strategies.filter(s => s.name !== strategyName);
        if (filtered.length !== strategies.length) {
          this.strategiesByErrorType.set(errorType, filtered);
        }
      }
      
      console.log(`[RECOVERY-REGISTRY] Unregistered strategy: ${strategyName}`);
    }
    
    return removed;
  }

  /**
   * Get strategy by name
   */
  getStrategy(name: string): RecoveryStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Get all strategies
   */
  getAllStrategies(): RecoveryStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategies that can handle a specific error
   */
  getStrategiesForError<TError extends DomainError>(error: TError): RecoveryStrategy<TError>[] {
    const compatibleStrategies: RecoveryStrategy<TError>[] = [];
    
    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(error)) {
        compatibleStrategies.push(strategy as RecoveryStrategy<TError>);
      }
    }
    
    // Sort by priority (higher priority first)
    return compatibleStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get strategy statistics
   */
  getRegistryStatistics(): {
    totalStrategies: number;
    strategiesByType: Record<RecoveryStrategyType, number>;
    averageSuccessRate: number;
  } {
    const strategies = this.getAllStrategies();
    const strategiesByType: Record<RecoveryStrategyType, number> = {
      [RecoveryStrategyType.AUTOMATED]: 0,
      [RecoveryStrategyType.GUIDED]: 0,
      [RecoveryStrategyType.MANUAL]: 0,
      [RecoveryStrategyType.HYBRID]: 0
    };

    let totalSuccessRate = 0;
    
    for (const strategy of strategies) {
      strategiesByType[strategy.type]++;
      totalSuccessRate += strategy.getMetrics().successRate;
    }

    return {
      totalStrategies: strategies.length,
      strategiesByType,
      averageSuccessRate: strategies.length > 0 ? totalSuccessRate / strategies.length : 0
    };
  }

  /**
   * Clear all strategies
   */
  clear(): void {
    this.strategies.clear();
    this.strategiesByErrorType.clear();
    console.log('[RECOVERY-REGISTRY] Cleared all strategies');
  }
}

// Export types and classes
export {
  RecoveryResultType,
  RecoveryStrategyType,
  RecoveryContext,
  RecoveryAttempt,
  RecoveryAction,
  RecoveryResult,
  RecoveryMetrics,
  RecoveryStrategy,
  BaseRecoveryStrategy,
  RecoveryStrategyRegistry
};