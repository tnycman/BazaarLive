/**
 * AuthenticationAspectManager - Enterprise AOP Implementation
 * Comprehensive aspect orchestration and lifecycle management
 */

import {
  IAuthenticationAspect,
  AspectConfiguration,
  AspectContext,
  JoinPoint,
  AspectError,
  AspectHealthStatus,
  AspectStatistics
} from './IAuthenticationAspect';
import { ValidationResult } from '../domain/AuthenticationStrategy';
import { ValidationError, Result } from '../domain/Hostname';

// Aspect Registration
export interface AspectRegistration {
  readonly aspect: IAuthenticationAspect;
  readonly priority: number;
  readonly enabled: boolean;
  readonly registeredAt: Date;
  readonly metadata: Record<string, any>;
}

// Orchestration Result
export interface OrchestrationResult {
  success: boolean;
  readonly aspectsExecuted: string[];
  readonly aspectsSkipped: string[];
  readonly aspectsErrored: string[];
  totalDuration: number;
  readonly errors: AspectError[];
  readonly results: Map<string, any>;
}

// Manager Health Status
export interface ManagerHealthStatus {
  readonly isHealthy: boolean;
  readonly registeredAspects: number;
  readonly activeAspects: number;
  readonly failingAspects: number;
  readonly totalExecutions: number;
  readonly successRate: number;
  readonly lastExecution?: Date;
  readonly aspectHealth: Map<string, AspectHealthStatus>;
}

// Manager Configuration
export interface AspectManagerConfiguration {
  readonly enableParallelExecution: boolean;
  readonly enableFailFast: boolean;
  readonly enableAspectRecovery: boolean;
  readonly maxExecutionTime: number;
  readonly maxConcurrentAspects: number;
  readonly retryAttempts: number;
  readonly enableHealthMonitoring: boolean;
  readonly enableStatisticsTracking: boolean;
  readonly enableAspectIsolation: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Execution Strategy
export enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  PIPELINE = 'pipeline',
  PRIORITY_BASED = 'priority_based'
}

// Aspect Event Types
export enum AspectEventType {
  ASPECT_REGISTERED = 'aspect_registered',
  ASPECT_UNREGISTERED = 'aspect_unregistered',
  ASPECT_ENABLED = 'aspect_enabled',
  ASPECT_DISABLED = 'aspect_disabled',
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_FAILED = 'execution_failed',
  HEALTH_CHECK_COMPLETED = 'health_check_completed'
}

// Aspect Event
export interface AspectEvent {
  readonly type: AspectEventType;
  readonly timestamp: Date;
  readonly aspectName?: string;
  readonly context?: AspectContext;
  readonly data?: any;
  readonly error?: AspectError;
}

// Aspect Event Listener
export type AspectEventListener = (event: AspectEvent) => Promise<void>;

/**
 * Authentication Aspect Manager
 * Orchestrates all authentication aspects with enterprise patterns
 */
export class AuthenticationAspectManager {
  private aspects: Map<string, AspectRegistration> = new Map();
  private eventListeners: Map<AspectEventType, AspectEventListener[]> = new Map();
  private executionStats: Map<string, { executions: number; successes: number; failures: number }> = new Map();
  private configuration: AspectManagerConfiguration;
  private isInitialized: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(configuration?: Partial<AspectManagerConfiguration>) {
    this.configuration = {
      enableParallelExecution: false,
      enableFailFast: true,
      enableAspectRecovery: true,
      maxExecutionTime: 30000, // 30 seconds
      maxConcurrentAspects: 5,
      retryAttempts: 2,
      enableHealthMonitoring: true,
      enableStatisticsTracking: true,
      enableAspectIsolation: true,
      logLevel: 'info',
      ...configuration
    };

    this.initializeEventListeners();
  }

  // Lifecycle Management

  async initialize(): Promise<Result<void, AspectError>> {
    try {
      console.log('[ASPECT-MANAGER] Initializing Authentication Aspect Manager');

      // Initialize all registered aspects
      for (const [name, registration] of Array.from(this.aspects.entries())) {
        if (registration.enabled) {
          const initResult = await registration.aspect.initialize();
          if (initResult.isError()) {
            console.error(`[ASPECT-MANAGER] Failed to initialize aspect ${name}:`, initResult.error);
            if (this.configuration.enableFailFast) {
              return Result.error(new AspectError(
                `Aspect initialization failed: ${name}`,
                'ASPECT_INIT_FAILED',
                { aspectName: name, originalError: initResult.error }
              ));
            }
          }
        }
      }

      // Start health monitoring
      if (this.configuration.enableHealthMonitoring) {
        this.startHealthMonitoring();
      }

      this.isInitialized = true;
      await this.emitEvent({ type: AspectEventType.EXECUTION_STARTED, timestamp: new Date() });

      console.log('[ASPECT-MANAGER] Authentication Aspect Manager initialized successfully');
      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Aspect manager initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MANAGER_INIT_FAILED',
        { originalError: error }
      ));
    }
  }

  async cleanup(): Promise<Result<void, AspectError>> {
    try {
      console.log('[ASPECT-MANAGER] Cleaning up Authentication Aspect Manager');

      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Cleanup all aspects
      const cleanupPromises = Array.from(this.aspects.values()).map(async (registration) => {
        try {
          await registration.aspect.cleanup();
        } catch (error) {
          console.error(`[ASPECT-MANAGER] Failed to cleanup aspect ${registration.aspect.getName()}:`, error);
        }
      });

      await Promise.allSettled(cleanupPromises);

      this.isInitialized = false;
      console.log('[ASPECT-MANAGER] Authentication Aspect Manager cleanup completed');
      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Aspect manager cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MANAGER_CLEANUP_FAILED',
        { originalError: error }
      ));
    }
  }

  // Aspect Registration

  async registerAspect(
    aspect: IAuthenticationAspect,
    options?: {
      enabled?: boolean;
      priority?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<Result<void, AspectError>> {
    try {
      const name = aspect.getName();
      
      if (this.aspects.has(name)) {
        return Result.error(new AspectError(
          `Aspect ${name} is already registered`,
          'ASPECT_ALREADY_REGISTERED',
          { aspectName: name }
        ));
      }

      // Validate aspect
      const validation = await aspect.validate();
      if (!validation.isValid) {
        return Result.error(new AspectError(
          `Aspect validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          'ASPECT_VALIDATION_FAILED',
          { aspectName: name, errors: validation.errors }
        ));
      }

      const registration: AspectRegistration = {
        aspect,
        priority: options?.priority ?? aspect.getPriority(),
        enabled: options?.enabled ?? aspect.isEnabled(),
        registeredAt: new Date(),
        metadata: options?.metadata ?? {}
      };

      this.aspects.set(name, registration);
      this.initializeAspectStats(name);

      await this.emitEvent({
        type: AspectEventType.ASPECT_REGISTERED,
        timestamp: new Date(),
        aspectName: name,
        data: { priority: registration.priority, enabled: registration.enabled }
      });

      console.log(`[ASPECT-MANAGER] Aspect registered: ${name} (priority: ${registration.priority}, enabled: ${registration.enabled})`);
      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ASPECT_REGISTRATION_FAILED',
        { aspectName: aspect.getName(), originalError: error }
      ));
    }
  }

  async unregisterAspect(name: string): Promise<Result<void, AspectError>> {
    try {
      const registration = this.aspects.get(name);
      if (!registration) {
        return Result.error(new AspectError(
          `Aspect ${name} is not registered`,
          'ASPECT_NOT_REGISTERED',
          { aspectName: name }
        ));
      }

      // Cleanup aspect
      await registration.aspect.cleanup();

      this.aspects.delete(name);
      this.executionStats.delete(name);

      await this.emitEvent({
        type: AspectEventType.ASPECT_UNREGISTERED,
        timestamp: new Date(),
        aspectName: name
      });

      console.log(`[ASPECT-MANAGER] Aspect unregistered: ${name}`);
      return Result.ok(undefined);

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to unregister aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ASPECT_UNREGISTRATION_FAILED',
        { aspectName: name, originalError: error }
      ));
    }
  }

  // Aspect Execution Orchestration

  async executeBefore(joinPoint: JoinPoint): Promise<OrchestrationResult> {
    return await this.executeAspectPhase('before', joinPoint, async (aspect, jp) => {
      if (aspect.before) {
        await aspect.before(jp);
      }
    });
  }

  async executeAfter(joinPoint: JoinPoint, result: any): Promise<OrchestrationResult> {
    return await this.executeAspectPhase('after', joinPoint, async (aspect, jp) => {
      if (aspect.after) {
        await aspect.after(jp, result);
      }
    });
  }

  async executeAfterThrowing(joinPoint: JoinPoint, error: Error): Promise<OrchestrationResult> {
    return await this.executeAspectPhase('afterThrowing', joinPoint, async (aspect, jp) => {
      if (aspect.afterThrowing) {
        await aspect.afterThrowing(jp, error);
      }
    });
  }

  async executeAround(joinPoint: JoinPoint): Promise<OrchestrationResult> {
    return await this.executeAspectPhase('around', joinPoint, async (aspect, jp) => {
      if (aspect.around) {
        return await aspect.around(jp);
      }
      return await jp.proceed();
    });
  }

  async executeFinally(joinPoint: JoinPoint): Promise<OrchestrationResult> {
    return await this.executeAspectPhase('finally', joinPoint, async (aspect, jp) => {
      if (aspect.finally) {
        await aspect.finally(jp);
      }
    });
  }

  // Generic Aspect Phase Execution

  private async executeAspectPhase(
    phase: string,
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const result: OrchestrationResult = {
      success: true,
      aspectsExecuted: [],
      aspectsSkipped: [],
      aspectsErrored: [],
      totalDuration: 0,
      errors: [],
      results: new Map()
    };

    try {
      const enabledAspects = this.getEnabledAspectsSorted();

      if (this.configuration.enableParallelExecution && enabledAspects.length > 1) {
        await this.executeAspectsParallel(enabledAspects, joinPoint, executor, result);
      } else {
        await this.executeAspectsSequential(enabledAspects, joinPoint, executor, result);
      }

      result.totalDuration = Date.now() - startTime;
      result.success = result.aspectsErrored.length === 0 || !this.configuration.enableFailFast;

      await this.emitEvent({
        type: result.success ? AspectEventType.EXECUTION_COMPLETED : AspectEventType.EXECUTION_FAILED,
        timestamp: new Date(),
        context: joinPoint.context,
        data: {
          phase,
          duration: result.totalDuration,
          aspectsExecuted: result.aspectsExecuted.length,
          aspectsErrored: result.aspectsErrored.length
        }
      });

      return result;

    } catch (error) {
      result.success = false;
      result.totalDuration = Date.now() - startTime;
      
      const aspectError = new AspectError(
        `Aspect orchestration failed in ${phase}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ORCHESTRATION_FAILED',
        { phase, joinPoint: joinPoint.method, originalError: error }
      );
      
      result.errors.push(aspectError);

      await this.emitEvent({
        type: AspectEventType.EXECUTION_FAILED,
        timestamp: new Date(),
        context: joinPoint.context,
        error: aspectError
      });

      return result;
    }
  }

  private async executeAspectsSequential(
    aspects: AspectRegistration[],
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>,
    result: OrchestrationResult
  ): Promise<void> {
    for (const registration of aspects) {
      await this.executeAspectWithRecovery(registration, joinPoint, executor, result);
      
      if (!result.success && this.configuration.enableFailFast) {
        break;
      }
    }
  }

  private async executeAspectsParallel(
    aspects: AspectRegistration[],
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>,
    result: OrchestrationResult
  ): Promise<void> {
    const concurrentAspects = aspects.slice(0, this.configuration.maxConcurrentAspects);
    
    const promises = concurrentAspects.map(registration => 
      this.executeAspectWithRecovery(registration, joinPoint, executor, result)
    );

    await Promise.allSettled(promises);
  }

  private async executeAspectWithRecovery(
    registration: AspectRegistration,
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>,
    result: OrchestrationResult
  ): Promise<void> {
    const aspectName = registration.aspect.getName();
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= this.configuration.retryAttempts) {
      try {
        if (this.configuration.enableAspectIsolation) {
          await this.executeAspectIsolated(registration, joinPoint, executor, result);
        } else {
          await this.executeAspectDirect(registration, joinPoint, executor, result);
        }

        this.updateAspectStats(aspectName, true);
        result.aspectsExecuted.push(aspectName);
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempts++;

        if (attempts <= this.configuration.retryAttempts && this.configuration.enableAspectRecovery) {
          console.warn(`[ASPECT-MANAGER] Retrying aspect ${aspectName} (attempt ${attempts}/${this.configuration.retryAttempts})`);
          await this.delay(100 * attempts); // Exponential backoff
        }
      }
    }

    // All attempts failed
    this.updateAspectStats(aspectName, false);
    result.aspectsErrored.push(aspectName);
    
    const aspectError = new AspectError(
      `Aspect ${aspectName} failed after ${attempts} attempts: ${lastError?.message}`,
      'ASPECT_EXECUTION_FAILED',
      { aspectName, attempts, originalError: lastError }
    );
    
    result.errors.push(aspectError);
    result.success = false;
  }

  private async executeAspectIsolated(
    registration: AspectRegistration,
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>,
    result: OrchestrationResult
  ): Promise<void> {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Aspect execution timeout')), this.configuration.maxExecutionTime);
    });

    const execution = executor(registration.aspect, joinPoint);
    const aspectResult = await Promise.race([execution, timeout]);
    
    result.results.set(registration.aspect.getName(), aspectResult);
  }

  private async executeAspectDirect(
    registration: AspectRegistration,
    joinPoint: JoinPoint,
    executor: (aspect: IAuthenticationAspect, joinPoint: JoinPoint) => Promise<any>,
    result: OrchestrationResult
  ): Promise<void> {
    const aspectResult = await executor(registration.aspect, joinPoint);
    result.results.set(registration.aspect.getName(), aspectResult);
  }

  // Health Monitoring

  async getHealthStatus(): Promise<ManagerHealthStatus> {
    const aspectHealth = new Map<string, AspectHealthStatus>();
    let activeAspects = 0;
    let failingAspects = 0;

    for (const [name, registration] of Array.from(this.aspects.entries())) {
      if (registration.enabled) {
        activeAspects++;
        try {
          const health = await registration.aspect.getHealthStatus();
          aspectHealth.set(name, health);
          if (!health.isHealthy) {
            failingAspects++;
          }
        } catch (error) {
          failingAspects++;
          aspectHealth.set(name, {
            isHealthy: false,
            aspectName: name,
            executionCount: 0,
            successCount: 0,
            errorCount: 1,
            avgExecutionTime: 0,
            lastError: {
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date()
            }
          });
        }
      }
    }

    const totalExecutions = Array.from(this.executionStats.values())
      .reduce((sum, stats) => sum + stats.executions, 0);
    
    const totalSuccesses = Array.from(this.executionStats.values())
      .reduce((sum, stats) => sum + stats.successes, 0);

    return {
      isHealthy: failingAspects === 0,
      registeredAspects: this.aspects.size,
      activeAspects,
      failingAspects,
      totalExecutions,
      successRate: totalExecutions > 0 ? totalSuccesses / totalExecutions : 1,
      aspectHealth
    };
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        await this.emitEvent({
          type: AspectEventType.HEALTH_CHECK_COMPLETED,
          timestamp: new Date(),
          data: health
        });

        if (!health.isHealthy) {
          console.warn('[ASPECT-MANAGER] Health check detected failing aspects:', {
            failingAspects: health.failingAspects,
            totalAspects: health.registeredAspects
          });
        }
      } catch (error) {
        console.error('[ASPECT-MANAGER] Health check failed:', error);
      }
    }, 30000); // Every 30 seconds
  }

  // Utility Methods

  private getEnabledAspectsSorted(): AspectRegistration[] {
    return Array.from(this.aspects.values())
      .filter(registration => registration.enabled)
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  private initializeAspectStats(name: string): void {
    this.executionStats.set(name, {
      executions: 0,
      successes: 0,
      failures: 0
    });
  }

  private updateAspectStats(name: string, success: boolean): void {
    const stats = this.executionStats.get(name);
    if (stats) {
      stats.executions++;
      if (success) {
        stats.successes++;
      } else {
        stats.failures++;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeEventListeners(): void {
    // Initialize event listener arrays for all event types
    for (const eventType of Object.values(AspectEventType)) {
      this.eventListeners.set(eventType, []);
    }
  }

  private async emitEvent(event: AspectEvent): Promise<void> {
    const listeners = this.eventListeners.get(event.type) || [];
    
    for (const listener of listeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error(`[ASPECT-MANAGER] Event listener failed for ${event.type}:`, error);
      }
    }
  }

  // Public API

  addEventListener(eventType: AspectEventType, listener: AspectEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  removeEventListener(eventType: AspectEventType, listener: AspectEventListener): boolean {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      return true;
    }
    return false;
  }

  getRegisteredAspects(): Map<string, AspectRegistration> {
    return new Map(this.aspects);
  }

  getAspectStatistics(): Map<string, AspectStatistics> {
    const statistics = new Map<string, AspectStatistics>();
    
    for (const [name, registration] of Array.from(this.aspects.entries())) {
      statistics.set(name, registration.aspect.getStatistics());
    }
    
    return statistics;
  }

  isAspectRegistered(name: string): boolean {
    return this.aspects.has(name);
  }

  isAspectEnabled(name: string): boolean {
    const registration = this.aspects.get(name);
    return registration ? registration.enabled : false;
  }

  async enableAspect(name: string): Promise<Result<void, AspectError>> {
    const registration = this.aspects.get(name);
    if (!registration) {
      return Result.error(new AspectError(`Aspect ${name} not registered`, 'ASPECT_NOT_REGISTERED'));
    }

    const updatedRegistration = { ...registration, enabled: true };
    this.aspects.set(name, updatedRegistration);

    await this.emitEvent({
      type: AspectEventType.ASPECT_ENABLED,
      timestamp: new Date(),
      aspectName: name
    });

    return Result.ok(undefined);
  }

  async disableAspect(name: string): Promise<Result<void, AspectError>> {
    const registration = this.aspects.get(name);
    if (!registration) {
      return Result.error(new AspectError(`Aspect ${name} not registered`, 'ASPECT_NOT_REGISTERED'));
    }

    const updatedRegistration = { ...registration, enabled: false };
    this.aspects.set(name, updatedRegistration);

    await this.emitEvent({
      type: AspectEventType.ASPECT_DISABLED,
      timestamp: new Date(),
      aspectName: name
    });

    return Result.ok(undefined);
  }
}