/**
 * Recovery Strategies for Enterprise Configuration Error Handling
 * 
 * Comprehensive recovery strategy system providing automated and guided
 * recovery mechanisms for configuration management errors.
 * 
 * @author Enterprise AOP Team
 * @version 1.0.0
 * @since 2025-01-30
 */

/**
 * Recovery strategy types defining different approaches to error recovery
 */
export enum RecoveryStrategyType {
  /** Retry the operation with backoff strategy */
  RETRY = 'RETRY',
  
  /** Use fallback configuration or default values */
  FALLBACK = 'FALLBACK',
  
  /** Alert developer team for manual intervention */
  ALERT_DEVELOPER = 'ALERT_DEVELOPER',
  
  /** Abort operation and return error to user */
  ABORT = 'ABORT',
  
  /** Switch to alternative configuration source */
  SWITCH_SOURCE = 'SWITCH_SOURCE',
  
  /** Clear cache and retry operation */
  CLEAR_CACHE_RETRY = 'CLEAR_CACHE_RETRY',
  
  /** Validate and fix configuration data */
  VALIDATE_AND_FIX = 'VALIDATE_AND_FIX',
  
  /** Use cached configuration if available */
  USE_CACHED = 'USE_CACHED',
  
  /** Reset to default configuration */
  RESET_TO_DEFAULT = 'RESET_TO_DEFAULT',
  
  /** Escalate to system administrator */
  ESCALATE_TO_ADMIN = 'ESCALATE_TO_ADMIN'
}

/**
 * Recovery strategy priority levels
 */
export type RecoveryPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Recovery strategy interface defining the structure
 * for all recovery mechanisms
 */
export interface RecoveryStrategy {
  /** Type of recovery strategy */
  readonly type: RecoveryStrategyType;
  
  /** Priority level for execution ordering */
  readonly priority: RecoveryPriority;
  
  /** Whether this strategy can be executed automatically */
  readonly automated: boolean;
  
  /** Human-readable description of the recovery strategy */
  readonly description: string;
  
  /** Specific actions to take during recovery */
  readonly actions: string[];
  
  /** Strategy-specific parameters and configuration */
  readonly parameters: Record<string, any>;
  
  /** Estimated time for recovery completion (milliseconds) */
  readonly estimatedRecoveryTime: number;
  
  /** Historical success rate percentage (0-100) */
  readonly successRate: number;
  
  /** Optional prerequisites that must be met */
  readonly prerequisites?: string[];
  
  /** Optional post-recovery validation steps */
  readonly validationSteps?: string[];
  
  /** Maximum number of times this strategy can be attempted */
  readonly maxAttempts?: number;
  
  /** Whether to continue with next strategy if this fails */
  readonly continueOnFailure?: boolean;
}

/**
 * Recovery strategy execution context
 */
export interface RecoveryContext {
  /** Original error that triggered recovery */
  readonly originalError: Error;
  
  /** Configuration key being recovered */
  readonly configurationKey?: string;
  
  /** Current attempt number */
  readonly attemptNumber: number;
  
  /** Previous recovery attempts */
  readonly previousAttempts: RecoveryAttempt[];
  
  /** Additional context data */
  readonly context: Record<string, any>;
  
  /** Correlation ID for tracking */
  readonly correlationId?: string;
  
  /** User session information */
  readonly userContext?: Record<string, any>;
  
  /** System state information */
  readonly systemContext?: Record<string, any>;
}

/**
 * Recovery attempt tracking
 */
export interface RecoveryAttempt {
  /** Strategy that was attempted */
  readonly strategy: RecoveryStrategyType;
  
  /** Timestamp of attempt */
  readonly timestamp: Date;
  
  /** Whether attempt was successful */
  readonly successful: boolean;
  
  /** Error message if attempt failed */
  readonly errorMessage?: string;
  
  /** Duration of attempt in milliseconds */
  readonly duration: number;
  
  /** Additional attempt context */
  readonly context: Record<string, any>;
}

/**
 * Recovery strategy factory for creating standardized strategies
 */
export class RecoveryStrategyFactory {
  /**
   * Creates a retry strategy with exponential backoff
   */
  static createRetryStrategy(
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffMultiplier: number = 2,
    maxDelay: number = 10000,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.RETRY,
      priority: 'medium',
      automated: true,
      description: `Retry operation up to ${maxRetries} times with exponential backoff`,
      actions: [
        `Retry with exponential backoff (${initialDelay}ms initial delay)`,
        `Apply backoff multiplier of ${backoffMultiplier}x between retries`,
        `Maximum delay capped at ${maxDelay}ms`,
        'Log retry attempts for monitoring',
        ...customActions
      ],
      parameters: {
        maxRetries,
        initialDelay,
        backoffMultiplier,
        maxDelay,
        exponentialBackoff: true,
        jitterEnabled: true,
        logRetries: true
      },
      estimatedRecoveryTime: initialDelay * Math.pow(backoffMultiplier, maxRetries),
      successRate: 75,
      maxAttempts: maxRetries,
      continueOnFailure: true,
      prerequisites: ['Network connectivity available', 'Source accessible'],
      validationSteps: ['Verify operation completed successfully', 'Check data integrity']
    };
  }

  /**
   * Creates a fallback strategy using alternative sources
   */
  static createFallbackStrategy(
    fallbackSources: string[] = ['memory', 'cache', 'default'],
    priority: RecoveryPriority = 'high',
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.FALLBACK,
      priority,
      automated: true,
      description: `Use fallback configuration from: ${fallbackSources.join(', ')}`,
      actions: [
        'Attempt fallback configuration sources in priority order',
        'Validate fallback configuration integrity',
        'Apply configuration with fallback indicators',
        'Log fallback usage for monitoring',
        ...customActions
      ],
      parameters: {
        fallbackSources,
        priorityOrder: true,
        validateFallback: true,
        markAsFallback: true,
        notifyMonitoring: true,
        gracefulDegradation: true
      },
      estimatedRecoveryTime: 5000,
      successRate: 90,
      maxAttempts: fallbackSources.length,
      continueOnFailure: true,
      prerequisites: ['Fallback sources available'],
      validationSteps: ['Verify fallback configuration loaded', 'Check functionality intact']
    };
  }

  /**
   * Creates a developer alert strategy for manual intervention
   */
  static createDeveloperAlertStrategy(
    severity: RecoveryPriority = 'high',
    escalationTime: number = 300000, // 5 minutes
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.ALERT_DEVELOPER,
      priority: severity,
      automated: true,
      description: `Alert development team for manual intervention (escalation in ${escalationTime / 1000}s)`,
      actions: [
        'Send immediate alert to development team',
        'Create incident ticket with full context',
        'Log detailed error information',
        'Monitor for manual resolution',
        `Escalate to senior developer after ${escalationTime / 1000} seconds`,
        ...customActions
      ],
      parameters: {
        alertChannels: ['email', 'slack', 'pagerduty'],
        escalationTime,
        includeContext: true,
        createTicket: true,
        monitorResolution: true,
        autoEscalate: true,
        severity: severity
      },
      estimatedRecoveryTime: escalationTime,
      successRate: 95,
      maxAttempts: 1,
      continueOnFailure: false,
      prerequisites: ['Alert system available', 'Developer team reachable'],
      validationSteps: ['Confirm alert sent', 'Track resolution status']
    };
  }

  /**
   * Creates an abort strategy for unrecoverable errors
   */
  static createAbortStrategy(
    reason: string = 'Unrecoverable error',
    logLevel: 'error' | 'critical' = 'error',
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.ABORT,
      priority: 'critical',
      automated: true,
      description: `Abort operation: ${reason}`,
      actions: [
        'Log error with full context',
        'Return error to calling system',
        'Record failure metrics',
        'Alert monitoring systems',
        ...customActions
      ],
      parameters: {
        reason,
        logLevel,
        recordMetrics: true,
        alertMonitoring: true,
        gracefulFailure: true,
        preserveContext: true
      },
      estimatedRecoveryTime: 0,
      successRate: 0,
      maxAttempts: 1,
      continueOnFailure: false,
      prerequisites: [],
      validationSteps: ['Confirm error logged', 'Verify graceful failure']
    };
  }

  /**
   * Creates a cache clearing strategy
   */
  static createClearCacheRetryStrategy(
    cacheTypes: string[] = ['memory', 'redis', 'filesystem'],
    retryAfterClear: boolean = true,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.CLEAR_CACHE_RETRY,
      priority: 'medium',
      automated: true,
      description: `Clear caches (${cacheTypes.join(', ')}) and retry operation`,
      actions: [
        'Clear specified cache types',
        'Verify cache clearing completed',
        retryAfterClear ? 'Retry original operation' : 'Return cache cleared status',
        'Monitor cache performance',
        ...customActions
      ],
      parameters: {
        cacheTypes,
        retryAfterClear,
        verifyClearance: true,
        monitorPerformance: true,
        logCacheStats: true,
        warmUpCache: false
      },
      estimatedRecoveryTime: 3000,
      successRate: 80,
      maxAttempts: 1,
      continueOnFailure: true,
      prerequisites: ['Cache systems accessible'],
      validationSteps: ['Confirm cache cleared', 'Verify operation success if retried']
    };
  }

  /**
   * Creates a validation and fix strategy
   */
  static createValidateAndFixStrategy(
    validationRules: string[] = [],
    autoFix: boolean = true,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.VALIDATE_AND_FIX,
      priority: 'high',
      automated: autoFix,
      description: 'Validate configuration data and apply automatic fixes',
      actions: [
        'Run comprehensive validation checks',
        'Identify specific validation failures',
        autoFix ? 'Apply automatic fixes for known issues' : 'Report validation failures',
        'Re-validate after fixes',
        'Log validation results',
        ...customActions
      ],
      parameters: {
        validationRules,
        autoFix,
        revalidateAfterFix: true,
        logResults: true,
        preserveOriginal: true,
        backupBeforeFix: true
      },
      estimatedRecoveryTime: autoFix ? 10000 : 30000,
      successRate: autoFix ? 85 : 95,
      maxAttempts: 2,
      continueOnFailure: true,
      prerequisites: ['Validation rules available', autoFix ? 'Auto-fix rules configured' : 'Manual intervention available'],
      validationSteps: ['Confirm validation passed', 'Verify data integrity']
    };
  }

  /**
   * Creates a strategy to use cached configuration
   */
  static createUseCachedStrategy(
    maxCacheAge: number = 3600000, // 1 hour
    validateCache: boolean = true,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.USE_CACHED,
      priority: 'medium',
      automated: true,
      description: `Use cached configuration (max age: ${maxCacheAge / 1000}s)`,
      actions: [
        'Check cache for valid configuration',
        'Validate cache age and integrity',
        'Load configuration from cache',
        'Mark as cached configuration',
        'Schedule cache refresh',
        ...customActions
      ],
      parameters: {
        maxCacheAge,
        validateCache,
        markAsCached: true,
        scheduleRefresh: true,
        fallbackIfStale: true,
        logCacheUsage: true
      },
      estimatedRecoveryTime: 500,
      successRate: 70,
      maxAttempts: 1,
      continueOnFailure: true,
      prerequisites: ['Cache available', 'Valid cached data exists'],
      validationSteps: ['Confirm cache loaded', 'Verify configuration validity']
    };
  }

  /**
   * Creates a strategy to reset to default configuration
   */
  static createResetToDefaultStrategy(
    preserveUserSettings: boolean = true,
    backupCurrent: boolean = true,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.RESET_TO_DEFAULT,
      priority: 'low',
      automated: false,
      description: 'Reset to default configuration with optional user setting preservation',
      actions: [
        backupCurrent ? 'Backup current configuration' : 'Skip backup',
        'Load default configuration template',
        preserveUserSettings ? 'Preserve compatible user settings' : 'Reset all settings',
        'Apply default configuration',
        'Validate default configuration',
        ...customActions
      ],
      parameters: {
        preserveUserSettings,
        backupCurrent,
        validateDefault: true,
        notifyUser: true,
        logReset: true,
        allowRevert: backupCurrent
      },
      estimatedRecoveryTime: 15000,
      successRate: 99,
      maxAttempts: 1,
      continueOnFailure: false,
      prerequisites: ['Default configuration available', 'User consent for reset'],
      validationSteps: ['Confirm default loaded', 'Verify system functionality']
    };
  }

  /**
   * Creates a source switching strategy
   */
  static createSwitchSourceStrategy(
    alternativeSources: string[] = ['backup', 'mirror', 'cdn'],
    testConnectivity: boolean = true,
    customActions: string[] = []
  ): RecoveryStrategy {
    return {
      type: RecoveryStrategyType.SWITCH_SOURCE,
      priority: 'high',
      automated: true,
      description: `Switch to alternative configuration source: ${alternativeSources.join(', ')}`,
      actions: [
        testConnectivity ? 'Test connectivity to alternative sources' : 'Skip connectivity test',
        'Select best available alternative source',
        'Switch configuration source',
        'Verify configuration load from new source',
        'Update source preferences',
        ...customActions
      ],
      parameters: {
        alternativeSources,
        testConnectivity,
        selectBest: true,
        updatePreferences: true,
        monitorNewSource: true,
        fallbackToOriginal: false
      },
      estimatedRecoveryTime: 8000,
      successRate: 85,
      maxAttempts: alternativeSources.length,
      continueOnFailure: true,
      prerequisites: ['Alternative sources configured', 'Source switching enabled'],
      validationSteps: ['Confirm source switch', 'Verify configuration loaded']
    };
  }
}

/**
 * Recovery strategy utilities for managing and executing strategies
 */
export class RecoveryStrategyUtils {
  /**
   * Determines the best recovery strategy for a given error context
   */
  static selectBestStrategy(
    availableStrategies: RecoveryStrategy[],
    context: Partial<RecoveryContext>
  ): RecoveryStrategy | null {
    if (availableStrategies.length === 0) {
      return null;
    }

    // Filter strategies based on prerequisites
    const eligibleStrategies = availableStrategies.filter(strategy => 
      this.checkPrerequisites(strategy, context)
    );

    if (eligibleStrategies.length === 0) {
      return availableStrategies[availableStrategies.length - 1]; // Return last as fallback
    }

    // Sort by priority and success rate
    const sortedStrategies = eligibleStrategies.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return b.successRate - a.successRate;
    });

    return sortedStrategies[0];
  }

  /**
   * Checks if strategy prerequisites are met
   */
  static checkPrerequisites(
    strategy: RecoveryStrategy,
    context: Partial<RecoveryContext>
  ): boolean {
    if (!strategy.prerequisites || strategy.prerequisites.length === 0) {
      return true;
    }

    // In a real implementation, this would check actual system state
    // For now, we'll assume prerequisites are met unless we have context saying otherwise
    return true;
  }

  /**
   * Estimates total recovery time for a sequence of strategies
   */
  static estimateTotalRecoveryTime(strategies: RecoveryStrategy[]): number {
    return strategies.reduce((total, strategy) => {
      return total + strategy.estimatedRecoveryTime;
    }, 0);
  }

  /**
   * Calculates combined success rate for multiple strategies
   */
  static calculateCombinedSuccessRate(strategies: RecoveryStrategy[]): number {
    if (strategies.length === 0) return 0;
    
    // Calculate probability of all strategies failing, then subtract from 100%
    const failureRate = strategies.reduce((rate, strategy) => {
      return rate * ((100 - strategy.successRate) / 100);
    }, 1);
    
    return Math.round((1 - failureRate) * 100);
  }

  /**
   * Creates a recovery plan with multiple strategies
   */
  static createRecoveryPlan(
    primaryStrategy: RecoveryStrategy,
    fallbackStrategies: RecoveryStrategy[] = []
  ): {
    strategies: RecoveryStrategy[];
    estimatedTime: number;
    successRate: number;
    description: string;
  } {
    const allStrategies = [primaryStrategy, ...fallbackStrategies];
    
    return {
      strategies: allStrategies,
      estimatedTime: this.estimateTotalRecoveryTime(allStrategies),
      successRate: this.calculateCombinedSuccessRate(allStrategies),
      description: `Primary: ${primaryStrategy.description}. Fallbacks: ${fallbackStrategies.map(s => s.type).join(', ')}`
    };
  }

  /**
   * Validates a recovery strategy configuration
   */
  static validateStrategy(strategy: RecoveryStrategy): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!strategy.type) errors.push('Strategy type is required');
    if (!strategy.priority) errors.push('Priority is required');
    if (strategy.automated === undefined) errors.push('Automated flag is required');
    if (!strategy.description) errors.push('Description is required');
    if (!Array.isArray(strategy.actions)) errors.push('Actions must be an array');
    if (!strategy.parameters) errors.push('Parameters object is required');

    // Check value ranges
    if (strategy.estimatedRecoveryTime < 0) {
      errors.push('Estimated recovery time cannot be negative');
    }
    
    if (strategy.successRate < 0 || strategy.successRate > 100) {
      errors.push('Success rate must be between 0 and 100');
    }

    // Check warnings
    if (strategy.successRate < 50) {
      warnings.push('Success rate is below 50%');
    }
    
    if (strategy.estimatedRecoveryTime > 60000) {
      warnings.push('Recovery time exceeds 1 minute');
    }
    
    if (strategy.actions.length === 0) {
      warnings.push('No actions defined for strategy');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Recovery strategy registry for managing available strategies
 */
export class RecoveryStrategyRegistry {
  private static strategies = new Map<string, RecoveryStrategy>();
  private static defaultStrategies: RecoveryStrategy[] = [];

  /**
   * Registers a recovery strategy
   */
  static register(name: string, strategy: RecoveryStrategy): void {
    const validation = RecoveryStrategyUtils.validateStrategy(strategy);
    if (!validation.valid) {
      throw new Error(`Invalid strategy "${name}": ${validation.errors.join(', ')}`);
    }
    
    this.strategies.set(name, strategy);
  }

  /**
   * Gets a registered strategy by name
   */
  static get(name: string): RecoveryStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Lists all registered strategy names
   */
  static list(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Gets all registered strategies
   */
  static getAll(): Map<string, RecoveryStrategy> {
    return new Map(this.strategies);
  }

  /**
   * Sets default strategies for error types
   */
  static setDefaults(strategies: RecoveryStrategy[]): void {
    this.defaultStrategies = [...strategies];
  }

  /**
   * Gets default strategies
   */
  static getDefaults(): RecoveryStrategy[] {
    return [...this.defaultStrategies];
  }

  /**
   * Clears all registered strategies
   */
  static clear(): void {
    this.strategies.clear();
    this.defaultStrategies = [];
  }

  /**
   * Initializes registry with common strategies
   */
  static initialize(): void {
    // Register common strategies
    this.register('retry_default', RecoveryStrategyFactory.createRetryStrategy());
    this.register('fallback_default', RecoveryStrategyFactory.createFallbackStrategy());
    this.register('alert_developer', RecoveryStrategyFactory.createDeveloperAlertStrategy());
    this.register('abort_unrecoverable', RecoveryStrategyFactory.createAbortStrategy());
    this.register('clear_cache_retry', RecoveryStrategyFactory.createClearCacheRetryStrategy());
    this.register('validate_and_fix', RecoveryStrategyFactory.createValidateAndFixStrategy());
    this.register('use_cached', RecoveryStrategyFactory.createUseCachedStrategy());
    this.register('reset_to_default', RecoveryStrategyFactory.createResetToDefaultStrategy());
    this.register('switch_source', RecoveryStrategyFactory.createSwitchSourceStrategy());

    // Set default strategy chain
    this.setDefaults([
      this.get('retry_default')!,
      this.get('fallback_default')!,
      this.get('alert_developer')!
    ]);
  }
}

// Initialize the registry
RecoveryStrategyRegistry.initialize();