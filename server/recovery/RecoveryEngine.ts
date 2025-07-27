/**
 * Recovery Engine - Phase 4 Task 4.2
 * Enterprise-grade recovery orchestration and circuit breaker system
 */

import { 
  DomainError,
  ErrorSeverity 
} from '../error/DomainError';

import {
  RecoveryStrategy,
  RecoveryStrategyRegistry,
  RecoveryContext,
  RecoveryResult,
  RecoveryResultType,
  RecoveryAttempt,
  RecoveryAction,
  RecoveryMetrics
} from './RecoveryStrategy';

// Circuit Breaker States
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

// Recovery Engine Configuration
export interface RecoveryEngineConfig {
  readonly maxConcurrentRecoveries: number;
  readonly defaultTimeout: number;
  readonly maxRetryAttempts: number;
  readonly circuitBreakerThreshold: number;
  readonly circuitBreakerTimeout: number;
  readonly circuitBreakerResetTimeout: number;
  readonly enableMetrics: boolean;
  readonly enableHealthCheck: boolean;
}

// Recovery Session
export interface RecoverySession {
  readonly sessionId: string;
  readonly errorId: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly status: RecoverySessionStatus;
  readonly attempts: RecoveryAttempt[];
  readonly totalDuration?: number;
  readonly finalResult?: RecoveryResult;
  readonly metadata: Record<string, any>;
}

// Recovery Session Status
export enum RecoverySessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILURE = 'failure',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

// Circuit Breaker for Recovery Strategies
export class RecoveryCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(
    private readonly strategyName: string,
    private readonly failureThreshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly resetTimeout: number = 300000 // 5 minutes
  ) {}

  /**
   * Check if recovery attempt is allowed
   */
  canAttemptRecovery(): boolean {
    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        return true;
        
      case CircuitBreakerState.OPEN:
        if (this.nextAttemptTime && new Date() >= this.nextAttemptTime) {
          this.state = CircuitBreakerState.HALF_OPEN;
          return true;
        }
        return false;
        
      case CircuitBreakerState.HALF_OPEN:
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Record recovery attempt result
   */
  recordAttempt(success: boolean): void {
    if (success) {
      this.onSuccess();
    } else {
      this.onFailure();
    }
  }

  /**
   * Handle successful recovery
   */
  private onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    this.state = CircuitBreakerState.CLOSED;
    
    console.log(`[CIRCUIT-BREAKER] ${this.strategyName}: Success - Circuit closed`);
  }

  /**
   * Handle failed recovery
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Half-open failure goes back to open
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.resetTimeout);
    } else if (this.failureCount >= this.failureThreshold) {
      // Threshold reached, open circuit
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.resetTimeout);
    }
    
    console.warn(`[CIRCUIT-BREAKER] ${this.strategyName}: Failure ${this.failureCount}/${this.failureThreshold} - State: ${this.state}`);
  }

  /**
   * Get circuit breaker status
   */
  getStatus(): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime?: Date;
    nextAttemptTime?: Date;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    
    console.log(`[CIRCUIT-BREAKER] ${this.strategyName}: Reset to closed state`);
  }
}

/**
 * Recovery Engine
 * Orchestrates error recovery using registered strategies with circuit breaker protection
 */
export class RecoveryEngine {
  private readonly config: RecoveryEngineConfig;
  private readonly registry: RecoveryStrategyRegistry;
  private readonly sessions: Map<string, RecoverySession> = new Map();
  private readonly circuitBreakers: Map<string, RecoveryCircuitBreaker> = new Map();
  private readonly activeRecoveries: Set<string> = new Set();

  // Engine metrics
  private metrics = {
    totalRecoveries: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    timeoutRecoveries: 0,
    averageRecoveryTime: 0,
    lastRecoveryTime?: Date
  };

  constructor(
    registry: RecoveryStrategyRegistry,
    config: Partial<RecoveryEngineConfig> = {}
  ) {
    this.registry = registry;
    this.config = {
      maxConcurrentRecoveries: 10,
      defaultTimeout: 30000, // 30 seconds
      maxRetryAttempts: 3,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      circuitBreakerResetTimeout: 300000,
      enableMetrics: true,
      enableHealthCheck: true,
      ...config
    };

    // Initialize circuit breakers for registered strategies
    this.initializeCircuitBreakers();

    // Start health check if enabled
    if (this.config.enableHealthCheck) {
      this.startHealthCheck();
    }

    console.log('[RECOVERY-ENGINE] Initialized with config:', this.config);
  }

  /**
   * Attempt to recover from an error
   */
  async recoverFromError<TError extends DomainError>(
    error: TError,
    contextOptions: Partial<RecoveryContext> = {}
  ): Promise<RecoveryResult> {
    // Check concurrent recovery limit
    if (this.activeRecoveries.size >= this.config.maxConcurrentRecoveries) {
      return {
        type: RecoveryResultType.FAILURE,
        success: false,
        message: 'Maximum concurrent recoveries reached',
        actions: [],
        duration: 0,
        metadata: {
          reason: 'concurrent_limit_exceeded',
          activeRecoveries: this.activeRecoveries.size,
          maxConcurrentRecoveries: this.config.maxConcurrentRecoveries
        }
      };
    }

    // Create recovery session
    const sessionId = this.generateSessionId();
    const session = this.createRecoverySession(sessionId, error, contextOptions);
    
    this.sessions.set(sessionId, session);
    this.activeRecoveries.add(sessionId);

    console.log(`[RECOVERY-ENGINE] Starting recovery session ${sessionId} for error: ${error.constructor.name}`);

    try {
      const result = await this.executeRecoverySession(session, error, contextOptions);
      
      // Update session with final result
      const finalSession: RecoverySession = {
        ...session,
        endTime: new Date(),
        status: this.mapResultToSessionStatus(result),
        totalDuration: Date.now() - session.startTime.getTime(),
        finalResult: result
      };
      
      this.sessions.set(sessionId, finalSession);
      
      // Update metrics
      if (this.config.enableMetrics) {
        this.updateEngineMetrics(result);
      }

      console.log(`[RECOVERY-ENGINE] Completed recovery session ${sessionId}: ${result.type}`);
      
      return result;

    } catch (error) {
      console.error(`[RECOVERY-ENGINE] Recovery session ${sessionId} failed with exception:`, error);
      
      const failureResult: RecoveryResult = {
        type: RecoveryResultType.FAILURE,
        success: false,
        message: `Recovery engine error: ${error}`,
        actions: [],
        duration: Date.now() - session.startTime.getTime(),
        metadata: {
          sessionId,
          engineError: true,
          originalError: error instanceof Error ? error.message : String(error)
        }
      };

      // Update session with failure
      const failedSession: RecoverySession = {
        ...session,
        endTime: new Date(),
        status: RecoverySessionStatus.FAILURE,
        totalDuration: Date.now() - session.startTime.getTime(),
        finalResult: failureResult
      };
      
      this.sessions.set(sessionId, failedSession);
      
      return failureResult;

    } finally {
      this.activeRecoveries.delete(sessionId);
    }
  }

  /**
   * Execute recovery session with multiple strategies
   */
  private async executeRecoverySession<TError extends DomainError>(
    session: RecoverySession,
    error: TError,
    contextOptions: Partial<RecoveryContext>
  ): Promise<RecoveryResult> {
    // Get applicable strategies
    const strategies = this.registry.getStrategiesForError(error);
    
    if (strategies.length === 0) {
      return {
        type: RecoveryResultType.FAILURE,
        success: false,
        message: `No recovery strategies available for error type: ${error.constructor.name}`,
        actions: [],
        duration: 0,
        metadata: {
          sessionId: session.sessionId,
          errorType: error.constructor.name,
          availableStrategies: 0
        }
      };
    }

    console.log(`[RECOVERY-ENGINE] Found ${strategies.length} strategies for ${error.constructor.name}`);

    // Try strategies in priority order
    for (let i = 0; i < strategies.length && i < this.config.maxRetryAttempts; i++) {
      const strategy = strategies[i];
      const circuitBreaker = this.getCircuitBreaker(strategy.name);

      // Check circuit breaker
      if (!circuitBreaker.canAttemptRecovery()) {
        console.warn(`[RECOVERY-ENGINE] Circuit breaker open for strategy: ${strategy.name}, skipping`);
        continue;
      }

      // Create recovery context
      const context: RecoveryContext = {
        attemptNumber: i + 1,
        maxAttempts: Math.min(strategies.length, this.config.maxRetryAttempts),
        previousAttempts: session.attempts,
        startTime: new Date(),
        timeout: strategy.getTimeout() || this.config.defaultTimeout,
        environment: process.env.NODE_ENV || 'development',
        correlationId: error.correlationId,
        metadata: {
          sessionId: session.sessionId,
          strategyName: strategy.name,
          ...contextOptions.metadata
        },
        ...contextOptions
      };

      try {
        console.log(`[RECOVERY-ENGINE] Attempting recovery with strategy: ${strategy.name} (${i + 1}/${context.maxAttempts})`);

        // Execute strategy with timeout
        const strategyPromise = strategy.executeRecovery(error, context);
        const timeoutPromise = new Promise<RecoveryResult>((_, reject) => {
          setTimeout(() => reject(new Error('Recovery timeout')), context.timeout);
        });

        const result = await Promise.race([strategyPromise, timeoutPromise]);

        // Record circuit breaker result
        circuitBreaker.recordAttempt(result.success);

        // Update session with attempt
        const attempt: RecoveryAttempt = {
          attemptNumber: context.attemptNumber,
          strategyName: strategy.name,
          startTime: context.startTime,
          endTime: new Date(),
          duration: result.duration,
          result: result.type,
          actions: result.actions,
          metadata: {
            ...context.metadata,
            strategyType: strategy.type,
            strategyPriority: strategy.priority
          }
        };

        session.attempts.push(attempt);

        // Check if recovery was successful
        if (result.success) {
          console.log(`[RECOVERY-ENGINE] Recovery successful with strategy: ${strategy.name}`);
          return result;
        }

        // Check if we should continue with next strategy
        if (result.type === RecoveryResultType.ESCALATION_REQUIRED) {
          console.log(`[RECOVERY-ENGINE] Strategy ${strategy.name} requires escalation, stopping attempts`);
          return result;
        }

        console.warn(`[RECOVERY-ENGINE] Strategy ${strategy.name} failed: ${result.message}`);

      } catch (strategyError) {
        console.error(`[RECOVERY-ENGINE] Strategy ${strategy.name} threw exception:`, strategyError);
        
        // Record circuit breaker failure
        circuitBreaker.recordAttempt(false);

        // Create failed attempt record
        const failedAttempt: RecoveryAttempt = {
          attemptNumber: i + 1,
          strategyName: strategy.name,
          startTime: context.startTime,
          endTime: new Date(),
          duration: Date.now() - context.startTime.getTime(),
          result: RecoveryResultType.FAILURE,
          actions: [],
          metadata: {
            ...context.metadata,
            strategyError: strategyError instanceof Error ? strategyError.message : String(strategyError)
          },
          error: strategyError instanceof Error ? strategyError : new Error(String(strategyError))
        };

        session.attempts.push(failedAttempt);
      }
    }

    // All strategies failed
    return {
      type: RecoveryResultType.FAILURE,
      success: false,
      message: `All ${strategies.length} recovery strategies failed`,
      actions: session.attempts.flatMap(a => a.actions),
      duration: session.attempts.reduce((sum, a) => sum + (a.duration || 0), 0),
      metadata: {
        sessionId: session.sessionId,
        attemptedStrategies: strategies.length,
        totalAttempts: session.attempts.length
      },
      escalationRequired: true
    };
  }

  /**
   * Get or create circuit breaker for strategy
   */
  private getCircuitBreaker(strategyName: string): RecoveryCircuitBreaker {
    if (!this.circuitBreakers.has(strategyName)) {
      const circuitBreaker = new RecoveryCircuitBreaker(
        strategyName,
        this.config.circuitBreakerThreshold,
        this.config.circuitBreakerTimeout,
        this.config.circuitBreakerResetTimeout
      );
      this.circuitBreakers.set(strategyName, circuitBreaker);
    }
    
    return this.circuitBreakers.get(strategyName)!;
  }

  /**
   * Initialize circuit breakers for all registered strategies
   */
  private initializeCircuitBreakers(): void {
    const strategies = this.registry.getAllStrategies();
    
    for (const strategy of strategies) {
      this.getCircuitBreaker(strategy.name);
    }
    
    console.log(`[RECOVERY-ENGINE] Initialized ${strategies.length} circuit breakers`);
  }

  /**
   * Create recovery session
   */
  private createRecoverySession<TError extends DomainError>(
    sessionId: string,
    error: TError,
    contextOptions: Partial<RecoveryContext>
  ): RecoverySession {
    return {
      sessionId,
      errorId: error.errorId,
      startTime: new Date(),
      status: RecoverySessionStatus.IN_PROGRESS,
      attempts: [],
      metadata: {
        errorType: error.constructor.name,
        errorCode: error.errorCode,
        errorSeverity: error.getSeverity(),
        correlationId: error.correlationId,
        ...contextOptions.metadata
      }
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8);
    return `recovery-${timestamp}-${random}`;
  }

  /**
   * Map recovery result to session status
   */
  private mapResultToSessionStatus(result: RecoveryResult): RecoverySessionStatus {
    switch (result.type) {
      case RecoveryResultType.SUCCESS:
        return RecoverySessionStatus.SUCCESS;
      case RecoveryResultType.PARTIAL_SUCCESS:
        return RecoverySessionStatus.PARTIAL_SUCCESS;
      case RecoveryResultType.FAILURE:
        return RecoverySessionStatus.FAILURE;
      case RecoveryResultType.RETRY_REQUIRED:
        return RecoverySessionStatus.IN_PROGRESS;
      case RecoveryResultType.MANUAL_INTERVENTION_REQUIRED:
      case RecoveryResultType.ESCALATION_REQUIRED:
        return RecoverySessionStatus.FAILURE;
      default:
        return RecoverySessionStatus.FAILURE;
    }
  }

  /**
   * Update engine metrics
   */
  private updateEngineMetrics(result: RecoveryResult): void {
    this.metrics.totalRecoveries++;
    this.metrics.lastRecoveryTime = new Date();

    if (result.success) {
      this.metrics.successfulRecoveries++;
    } else {
      this.metrics.failedRecoveries++;
    }

    // Update average recovery time
    const totalTime = (this.metrics.averageRecoveryTime * (this.metrics.totalRecoveries - 1)) + result.duration;
    this.metrics.averageRecoveryTime = totalTime / this.metrics.totalRecoveries;
  }

  /**
   * Get recovery session
   */
  getRecoverySession(sessionId: string): RecoverySession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active recovery sessions
   */
  getActiveRecoverySessions(): RecoverySession[] {
    return Array.from(this.activeRecoveries.values())
      .map(sessionId => this.sessions.get(sessionId))
      .filter((session): session is RecoverySession => 
        session !== undefined && session.status === RecoverySessionStatus.IN_PROGRESS
      );
  }

  /**
   * Get engine metrics
   */
  getEngineMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Get circuit breaker status for all strategies
   */
  getCircuitBreakerStatus(): Record<string, ReturnType<RecoveryCircuitBreaker['getStatus']>> {
    const status: Record<string, ReturnType<RecoveryCircuitBreaker['getStatus']>> = {};
    
    for (const [strategyName, circuitBreaker] of this.circuitBreakers.entries()) {
      status[strategyName] = circuitBreaker.getStatus();
    }
    
    return status;
  }

  /**
   * Reset circuit breaker for strategy
   */
  resetCircuitBreaker(strategyName: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(strategyName);
    
    if (circuitBreaker) {
      circuitBreaker.reset();
      return true;
    }
    
    return false;
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
    
    console.log('[RECOVERY-ENGINE] Reset all circuit breakers');
  }

  /**
   * Start health check interval
   */
  private startHealthCheck(): void {
    // Health check every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 300000);
    
    console.log('[RECOVERY-ENGINE] Health check started');
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    const activeRecoveries = this.getActiveRecoverySessions();
    const circuitBreakerStatus = this.getCircuitBreakerStatus();
    const metrics = this.getEngineMetrics();
    
    // Check for stale sessions (running longer than 10 minutes)
    const staleThreshold = 600000; // 10 minutes
    const staleSessions = activeRecoveries.filter(
      session => Date.now() - session.startTime.getTime() > staleThreshold
    );
    
    if (staleSessions.length > 0) {
      console.warn(`[RECOVERY-ENGINE] Health check: ${staleSessions.length} stale recovery sessions detected`);
    }
    
    // Check circuit breaker health
    const openCircuits = Object.entries(circuitBreakerStatus)
      .filter(([_, status]) => status.state === CircuitBreakerState.OPEN);
    
    if (openCircuits.length > 0) {
      console.warn(`[RECOVERY-ENGINE] Health check: ${openCircuits.length} circuit breakers are open`);
    }
    
    // Log metrics
    console.log(`[RECOVERY-ENGINE] Health check: Total recoveries: ${metrics.totalRecoveries}, Success rate: ${(metrics.successfulRecoveries / Math.max(metrics.totalRecoveries, 1) * 100).toFixed(1)}%`);
  }

  /**
   * Cleanup old sessions
   */
  cleanupOldSessions(maxAge: number = 3600000): number { // 1 hour default
    const cutoffTime = Date.now() - maxAge;
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.endTime && session.endTime.getTime() < cutoffTime) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[RECOVERY-ENGINE] Cleaned up ${cleaned} old recovery sessions`);
    }
    
    return cleaned;
  }

  /**
   * Shutdown recovery engine
   */
  shutdown(): void {
    // Cancel all active recoveries
    for (const sessionId of this.activeRecoveries) {
      const session = this.sessions.get(sessionId);
      if (session) {
        const cancelledSession: RecoverySession = {
          ...session,
          endTime: new Date(),
          status: RecoverySessionStatus.CANCELLED,
          totalDuration: Date.now() - session.startTime.getTime()
        };
        this.sessions.set(sessionId, cancelledSession);
      }
    }
    
    this.activeRecoveries.clear();
    console.log('[RECOVERY-ENGINE] Recovery engine shutdown completed');
  }
}

// Export types and classes
export {
  CircuitBreakerState,
  RecoveryEngineConfig,
  RecoverySession,
  RecoverySessionStatus,
  RecoveryCircuitBreaker,
  RecoveryEngine
};