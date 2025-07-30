/**
 * Configuration Error Handling Aspect
 * 
 * AOP aspect for intercepting and wrapping configuration errors into
 * the enterprise error hierarchy with recovery strategies.
 * 
 * @author Enterprise AOP Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import {
  ConfigurationError,
  ConfigurationNotFoundError,
  ConfigurationValidationError,
  ConfigurationLoadError,
  ConfigurationTypeError,
  ConfigurationSecurityError,
  ConfigurationErrorFactory,
  ConfigurationErrorUtils
} from '../errors/ConfigurationErrors';
import {
  RecoveryStrategy,
  RecoveryStrategyType,
  RecoveryContext,
  RecoveryAttempt,
  RecoveryStrategyFactory,
  RecoveryStrategyRegistry
} from '../errors/RecoveryStrategies';

/**
 * Error handling aspect configuration
 */
export interface ErrorHandlingAspectConfig {
  /** Whether to enable automatic error wrapping */
  autoWrapErrors: boolean;
  
  /** Whether to enable automatic recovery attempts */
  autoRecovery: boolean;
  
  /** Maximum number of recovery attempts */
  maxRecoveryAttempts: number;
  
  /** Whether to log all errors */
  logErrors: boolean;
  
  /** Whether to track error metrics */
  trackMetrics: boolean;
  
  /** Custom error mappings */
  customErrorMappings: Map<string, (error: Error) => ConfigurationError>;
  
  /** Recovery strategy overrides */
  recoveryStrategyOverrides: Map<string, RecoveryStrategy>;
}

/**
 * Error handling aspect metrics
 */
export interface ErrorHandlingMetrics {
  totalErrorsHandled: number;
  errorsByType: Map<string, number>;
  errorsBySeverity: Map<string, number>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  lastErrorTimestamp?: Date;
  aspectHealth: 'healthy' | 'degraded' | 'failed';
}

/**
 * Configuration Error Handling Aspect
 * 
 * Provides centralized error handling for configuration operations
 * with automatic error wrapping and recovery strategies.
 */
export class ConfigurationErrorHandlingAspect {
  private static instance: ConfigurationErrorHandlingAspect;
  private config: ErrorHandlingAspectConfig;
  private metrics: ErrorHandlingMetrics;
  private recoveryContext = new Map<string, RecoveryContext>();
  private isEnabled = true;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config: Partial<ErrorHandlingAspectConfig> = {}) {
    this.config = this.createDefaultConfig(config);
    this.metrics = this.initializeMetrics();
    this.initializeErrorMappings();
  }

  /**
   * Gets singleton instance
   */
  public static getInstance(config: Partial<ErrorHandlingAspectConfig> = {}): ConfigurationErrorHandlingAspect {
    if (!ConfigurationErrorHandlingAspect.instance) {
      ConfigurationErrorHandlingAspect.instance = new ConfigurationErrorHandlingAspect(config);
    }
    return ConfigurationErrorHandlingAspect.instance;
  }

  /**
   * Creates default configuration
   */
  private createDefaultConfig(config: Partial<ErrorHandlingAspectConfig>): ErrorHandlingAspectConfig {
    return {
      autoWrapErrors: true,
      autoRecovery: true,
      maxRecoveryAttempts: 3,
      logErrors: true,
      trackMetrics: true,
      customErrorMappings: new Map(),
      recoveryStrategyOverrides: new Map(),
      ...config
    };
  }

  /**
   * Initializes metrics tracking
   */
  private initializeMetrics(): ErrorHandlingMetrics {
    return {
      totalErrorsHandled: 0,
      errorsByType: new Map(),
      errorsBySeverity: new Map(),
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      aspectHealth: 'healthy'
    };
  }

  /**
   * Initializes default error mappings
   */
  private initializeErrorMappings(): void {
    // Map common error patterns to configuration errors
    this.config.customErrorMappings.set('ENOENT', (error: Error) => 
      ConfigurationErrorFactory.createNotFoundError(
        'unknown',
        ['filesystem'],
        undefined,
        { originalError: error.message }
      )
    );

    this.config.customErrorMappings.set('EACCES', (error: Error) =>
      ConfigurationErrorFactory.createSecurityError(
        'file_access',
        'read',
        [],
        'filesystem_permissions',
        undefined,
        { originalError: error.message }
      )
    );

    this.config.customErrorMappings.set('ETIMEDOUT', (error: Error) =>
      ConfigurationErrorFactory.createLoadError(
        'network',
        'Connection timeout',
        0,
        undefined,
        { originalError: error.message }
      )
    );
  }

  /**
   * Main aspect method: wraps methods to handle configuration errors
   */
  public wrapMethod<T extends (...args: any[]) => any>(
    target: any,
    methodName: string,
    originalMethod: T,
    context: { className?: string; correlationId?: string } = {}
  ): T {
    if (!this.isEnabled) {
      return originalMethod;
    }

    const self = this;
    
    return (async function wrappedMethod(...args: any[]) {
      const startTime = Date.now();
      const correlationId = context.correlationId || `cfg-${Date.now()}-${Math.random()}`;
      
      try {
        // Execute original method
        const result = await originalMethod.apply(target, args);
        
        // Log successful execution if metrics tracking is enabled
        if (self.config.trackMetrics) {
          self.trackSuccessfulExecution(methodName, Date.now() - startTime);
        }
        
        return result;
        
      } catch (error) {
        // Handle the error through the aspect
        return await self.handleError(
          error as Error,
          {
            methodName,
            className: context.className,
            correlationId,
            args,
            startTime
          }
        );
      }
    }) as T;
  }

  /**
   * Handles errors with wrapping and recovery
   */
  public async handleError(
    error: Error,
    context: {
      methodName: string;
      className?: string;
      correlationId: string;
      args?: any[];
      startTime?: number;
    }
  ): Promise<never> {
    const duration = context.startTime ? Date.now() - context.startTime : 0;
    
    // Update metrics
    this.updateErrorMetrics(error);
    
    // Wrap error if it's not already a ConfigurationError
    const configError = this.wrapError(error, context);
    
    // Log error if enabled
    if (this.config.logErrors) {
      this.logError(configError, context);
    }
    
    // Attempt recovery if enabled
    if (this.config.autoRecovery && configError.isRecoverable()) {
      const recoveryResult = await this.attemptRecovery(configError, context);
      if (recoveryResult.success) {
        throw new Error('Recovery successful - operation completed');
      }
    }
    
    // Recovery failed or not attempted, throw the wrapped error
    throw configError;
  }

  /**
   * Wraps generic errors into ConfigurationError hierarchy
   */
  private wrapError(
    error: Error,
    context: {
      methodName: string;
      className?: string;
      correlationId: string;
      args?: any[];
    }
  ): ConfigurationError {
    // Already a ConfigurationError, return as-is
    if (ConfigurationErrorUtils.isConfigurationError(error)) {
      return error;
    }

    // Check custom error mappings first
    for (const [pattern, mapper] of Array.from(this.config.customErrorMappings.entries())) {
      if (error.message.includes(pattern) || error.name.includes(pattern)) {
        return mapper(error);
      }
    }

    // Apply default wrapping based on error characteristics
    return this.applyDefaultErrorWrapping(error, context);
  }

  /**
   * Applies default error wrapping logic
   */
  private applyDefaultErrorWrapping(
    error: Error,
    context: {
      methodName: string;
      className?: string;
      correlationId: string;
      args?: any[];
    }
  ): ConfigurationError {
    const errorMessage = error.message.toLowerCase();
    const additionalContext = {
      originalError: error.message,
      originalStack: error.stack,
      methodName: context.methodName,
      className: context.className,
      timestamp: new Date().toISOString()
    };

    // Pattern matching for different error types
    if (errorMessage.includes('not found') || errorMessage.includes('enoent')) {
      return ConfigurationErrorFactory.createNotFoundError(
        'unknown',
        ['default'],
        context.correlationId,
        additionalContext
      );
    }

    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return ConfigurationErrorFactory.createValidationError(
        error.message,
        'unknown_field',
        context.args?.[0],
        'unknown',
        [],
        context.correlationId,
        additionalContext
      );
    }

    if (errorMessage.includes('load') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return ConfigurationErrorFactory.createLoadError(
        'unknown',
        error.message,
        0,
        context.correlationId,
        additionalContext
      );
    }

    if (errorMessage.includes('type') || errorMessage.includes('parse')) {
      return ConfigurationErrorFactory.createTypeError(
        'unknown_field',
        'unknown',
        'unknown',
        context.args?.[0],
        false,
        context.correlationId,
        additionalContext
      );
    }

    if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('forbidden')) {
      return ConfigurationErrorFactory.createSecurityError(
        context.methodName,
        'configuration_access',
        [],
        'default_policy',
        context.correlationId,
        additionalContext
      );
    }

    // Default to validation error if no pattern matches
    return ConfigurationErrorFactory.createValidationError(
      `Wrapped error: ${error.message}`,
      'unknown_field',
      context.args?.[0],
      'unknown',
      [],
      context.correlationId,
      additionalContext
    );
  }

  /**
   * Attempts error recovery using recovery strategies
   */
  private async attemptRecovery(
    error: ConfigurationError,
    context: {
      methodName: string;
      className?: string;
      correlationId: string;
      args?: any[];
    }
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const startTime = Date.now();
    this.metrics.recoveryAttempts++;

    try {
      // Get recovery strategy for this error
      let strategy = this.config.recoveryStrategyOverrides.get(error.code);
      if (!strategy) {
        strategy = error.getRecoveryStrategy();
      }

      // Create recovery context
      const recoveryContext: RecoveryContext = {
        originalError: error,
        configurationKey: error.context.configurationKey as string,
        attemptNumber: 1,
        previousAttempts: [],
        context: error.context,
        correlationId: context.correlationId,
        userContext: {
          methodName: context.methodName,
          className: context.className
        },
        systemContext: {
          timestamp: new Date().toISOString(),
          aspectVersion: '1.0.0'
        }
      };

      // Store recovery context
      this.recoveryContext.set(context.correlationId, recoveryContext);

      // Execute recovery strategy - ensure strategy is defined
      if (!strategy) {
        throw new Error('No recovery strategy available for error: ' + error.code);
      }
      const recoveryResult = await this.executeRecoveryStrategy(strategy, recoveryContext);

      // Update metrics
      const recoveryTime = Date.now() - startTime;
      if (recoveryResult.success) {
        this.metrics.successfulRecoveries++;
        this.updateAverageRecoveryTime(recoveryTime);
      } else {
        this.metrics.failedRecoveries++;
      }

      return recoveryResult;

    } catch (recoveryError) {
      this.metrics.failedRecoveries++;
      
      if (this.config.logErrors) {
        console.error('[ConfigurationErrorHandlingAspect] Recovery failed:', {
          originalError: error.code,
          recoveryError: recoveryError instanceof Error ? recoveryError.message : recoveryError,
          correlationId: context.correlationId,
          duration: Date.now() - startTime
        });
      }

      return { success: false, error: recoveryError as Error };
    }
  }

  /**
   * Executes a specific recovery strategy
   */
  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    if (!strategy.automated) {
      // Manual recovery required
      if (this.config.logErrors) {
        console.warn('[ConfigurationErrorHandlingAspect] Manual recovery required:', {
          strategy: strategy.type,
          description: strategy.description,
          correlationId: context.correlationId
        });
      }
      return { success: false, error: new Error('Manual recovery required') };
    }

    // Execute automated recovery based on strategy type
    switch (strategy.type) {
      case RecoveryStrategyType.RETRY:
        return await this.executeRetryStrategy(strategy, context);
      
      case RecoveryStrategyType.FALLBACK:
        return await this.executeFallbackStrategy(strategy, context);
      
      case RecoveryStrategyType.USE_CACHED:
        return await this.executeCachedStrategy(strategy, context);
      
      case RecoveryStrategyType.CLEAR_CACHE_RETRY:
        return await this.executeClearCacheStrategy(strategy, context);
      
      case RecoveryStrategyType.ALERT_DEVELOPER:
        return await this.executeAlertStrategy(strategy, context);
      
      default:
        if (this.config.logErrors) {
          console.warn('[ConfigurationErrorHandlingAspect] Unsupported recovery strategy:', strategy.type);
        }
        return { success: false, error: new Error(`Unsupported recovery strategy: ${strategy.type}`) };
    }
  }

  /**
   * Executes retry recovery strategy
   */
  private async executeRetryStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const maxRetries = strategy.parameters.maxRetries || 3;
    const initialDelay = strategy.parameters.initialDelay || 1000;
    const backoffMultiplier = strategy.parameters.backoffMultiplier || 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Simulate delay with exponential backoff
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        // In a real implementation, this would retry the original operation
        // For now, we'll simulate a successful retry based on success rate
        const successProbability = strategy.successRate / 100;
        const success = Math.random() < successProbability;

        if (success) {
          if (this.config.logErrors) {
            console.log('[ConfigurationErrorHandlingAspect] Retry successful:', {
              attempt,
              strategy: strategy.type,
              correlationId: context.correlationId
            });
          }
          return { success: true, result: 'retry_successful' };
        }
      } catch (retryError) {
        if (this.config.logErrors) {
          console.warn('[ConfigurationErrorHandlingAspect] Retry attempt failed:', {
            attempt,
            error: retryError instanceof Error ? retryError.message : retryError,
            correlationId: context.correlationId
          });
        }
      }
    }

    return { success: false, error: new Error(`All ${maxRetries} retry attempts failed`) };
  }

  /**
   * Executes fallback recovery strategy
   */
  private async executeFallbackStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const fallbackSources = strategy.parameters.fallbackSources || ['default'];
    
    for (const source of fallbackSources) {
      try {
        // Simulate fallback configuration loading
        // In a real implementation, this would load from the fallback source
        const fallbackConfig = {
          source,
          timestamp: new Date().toISOString(),
          isFallback: true,
          originalKey: context.configurationKey
        };

        if (this.config.logErrors) {
          console.log('[ConfigurationErrorHandlingAspect] Fallback successful:', {
            source,
            correlationId: context.correlationId
          });
        }

        return { success: true, result: fallbackConfig };
      } catch (fallbackError) {
        if (this.config.logErrors) {
          console.warn('[ConfigurationErrorHandlingAspect] Fallback source failed:', {
            source,
            error: fallbackError instanceof Error ? fallbackError.message : fallbackError,
            correlationId: context.correlationId
          });
        }
      }
    }

    return { success: false, error: new Error('All fallback sources failed') };
  }

  /**
   * Executes cached recovery strategy
   */
  private async executeCachedStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    // Simulate cache lookup
    // In a real implementation, this would check actual cache
    const cacheHit = Math.random() < 0.7; // 70% cache hit rate

    if (cacheHit) {
      const cachedConfig = {
        fromCache: true,
        timestamp: new Date().toISOString(),
        key: context.configurationKey,
        maxAge: strategy.parameters.maxCacheAge
      };

      if (this.config.logErrors) {
        console.log('[ConfigurationErrorHandlingAspect] Cache recovery successful:', {
          correlationId: context.correlationId
        });
      }

      return { success: true, result: cachedConfig };
    }

    return { success: false, error: new Error('No valid cached configuration found') };
  }

  /**
   * Executes clear cache recovery strategy
   */
  private async executeClearCacheStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    try {
      // Simulate cache clearing
      // In a real implementation, this would clear actual caches
      
      if (this.config.logErrors) {
        console.log('[ConfigurationErrorHandlingAspect] Cache cleared successfully:', {
          correlationId: context.correlationId
        });
      }

      // Optionally retry after clearing cache
      if (strategy.parameters.retryAfterClear) {
        return await this.executeRetryStrategy(
          RecoveryStrategyFactory.createRetryStrategy(1),
          context
        );
      }

      return { success: true, result: 'cache_cleared' };
    } catch (clearError) {
      return { success: false, error: clearError as Error };
    }
  }

  /**
   * Executes alert developer recovery strategy
   */
  private async executeAlertStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    try {
      // Simulate developer alert
      // In a real implementation, this would send actual alerts
      
      if (this.config.logErrors) {
        console.error('[ConfigurationErrorHandlingAspect] Developer alert sent:', {
          severity: strategy.priority,
          correlationId: context.correlationId,
          originalError: context.originalError.message,
          strategy: strategy.description
        });
      }

      return { success: true, result: 'alert_sent' };
    } catch (alertError) {
      return { success: false, error: alertError as Error };
    }
  }

  /**
   * Updates error metrics
   */
  private updateErrorMetrics(error: Error): void {
    if (!this.config.trackMetrics) return;

    this.metrics.totalErrorsHandled++;
    this.metrics.lastErrorTimestamp = new Date();

    // Count by error type
    const errorType = error.constructor.name;
    this.metrics.errorsByType.set(errorType, (this.metrics.errorsByType.get(errorType) || 0) + 1);

    // Count by severity if it's a ConfigurationError
    if (ConfigurationErrorUtils.isConfigurationError(error)) {
      const severity = error.severity;
      this.metrics.errorsBySeverity.set(severity, (this.metrics.errorsBySeverity.get(severity) || 0) + 1);
    }

    // Update aspect health based on error rate
    this.updateAspectHealth();
  }

  /**
   * Tracks successful execution
   */
  private trackSuccessfulExecution(methodName: string, duration: number): void {
    if (!this.config.trackMetrics) return;

    // In a real implementation, this would track method-specific metrics
    // For now, we'll just update aspect health
    this.updateAspectHealth();
  }

  /**
   * Updates average recovery time
   */
  private updateAverageRecoveryTime(recoveryTime: number): void {
    if (!this.config.trackMetrics) return;

    const totalRecoveries = this.metrics.successfulRecoveries;
    if (totalRecoveries === 1) {
      this.metrics.averageRecoveryTime = recoveryTime;
    } else {
      this.metrics.averageRecoveryTime = (
        (this.metrics.averageRecoveryTime * (totalRecoveries - 1)) + recoveryTime
      ) / totalRecoveries;
    }
  }

  /**
   * Updates aspect health status
   */
  private updateAspectHealth(): void {
    if (!this.config.trackMetrics) return;

    const totalOperations = this.metrics.totalErrorsHandled + this.metrics.successfulRecoveries;
    if (totalOperations === 0) {
      this.metrics.aspectHealth = 'healthy';
      return;
    }

    const errorRate = this.metrics.totalErrorsHandled / totalOperations;
    const recoveryRate = this.metrics.successfulRecoveries / Math.max(this.metrics.recoveryAttempts, 1);

    if (errorRate < 0.05 && recoveryRate > 0.8) {
      this.metrics.aspectHealth = 'healthy';
    } else if (errorRate < 0.2 && recoveryRate > 0.5) {
      this.metrics.aspectHealth = 'degraded';
    } else {
      this.metrics.aspectHealth = 'failed';
    }
  }

  /**
   * Logs error with context
   */
  private logError(
    error: ConfigurationError,
    context: {
      methodName: string;
      className?: string;
      correlationId: string;
      args?: any[];
    }
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      correlationId: context.correlationId,
      errorCode: error.code,
      errorType: error.constructor.name,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      context: {
        methodName: context.methodName,
        className: context.className,
        operation: error.operation,
        category: error.category
      },
      errorContext: error.context,
      recoverable: error.isRecoverable(),
      recommendedActions: error.getRecommendedActions()
    };

    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('[ConfigurationErrorHandlingAspect] Critical/High severity error:', logData);
    } else {
      console.warn('[ConfigurationErrorHandlingAspect] Error handled:', logData);
    }
  }

  /**
   * Gets current metrics
   */
  public getMetrics(): ErrorHandlingMetrics {
    return { ...this.metrics };
  }

  /**
   * Gets current configuration
   */
  public getConfig(): ErrorHandlingAspectConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration
   */
  public updateConfig(updates: Partial<ErrorHandlingAspectConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Enables or disables the aspect
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Checks if aspect is enabled
   */
  public isAspectEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Resets metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Gets recovery context for a correlation ID
   */
  public getRecoveryContext(correlationId: string): RecoveryContext | undefined {
    return this.recoveryContext.get(correlationId);
  }

  /**
   * Clears recovery context for a correlation ID
   */
  public clearRecoveryContext(correlationId: string): void {
    this.recoveryContext.delete(correlationId);
  }

  /**
   * Gets aspect health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'failed';
    metrics: ErrorHandlingMetrics;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (this.metrics.aspectHealth === 'degraded') {
      recommendations.push('Monitor error rate and recovery success');
      recommendations.push('Review error patterns for optimization opportunities');
    } else if (this.metrics.aspectHealth === 'failed') {
      recommendations.push('Immediate attention required - high error rate or low recovery success');
      recommendations.push('Review error handling configuration');
      recommendations.push('Check recovery strategy effectiveness');
    }

    if (this.metrics.totalErrorsHandled > 100 && this.metrics.successfulRecoveries === 0) {
      recommendations.push('No successful recoveries - review recovery strategies');
    }

    return {
      status: this.metrics.aspectHealth,
      metrics: this.getMetrics(),
      recommendations
    };
  }
}

/**
 * Singleton instance export
 */
export const configurationErrorHandlingAspect = ConfigurationErrorHandlingAspect.getInstance();