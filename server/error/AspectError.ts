/**
 * Aspect Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade AOP-specific errors with aspect execution context
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorClassification,
  ErrorRecoverySuggestion 
} from './DomainError';

// Aspect Error Types
export enum AspectErrorType {
  ASPECT_EXECUTION_FAILED = 'ASPECT_EXECUTION_FAILED',
  ASPECT_WEAVING_FAILED = 'ASPECT_WEAVING_FAILED',
  POINTCUT_MATCHING_FAILED = 'POINTCUT_MATCHING_FAILED',
  ADVICE_EXECUTION_FAILED = 'ADVICE_EXECUTION_FAILED',
  ASPECT_DEPENDENCY_FAILED = 'ASPECT_DEPENDENCY_FAILED',
  ASPECT_CONFIGURATION_INVALID = 'ASPECT_CONFIGURATION_INVALID',
  ASPECT_LIFECYCLE_ERROR = 'ASPECT_LIFECYCLE_ERROR',
  ASPECT_INTERCEPTION_FAILED = 'ASPECT_INTERCEPTION_FAILED',
  ASPECT_PROXY_CREATION_FAILED = 'ASPECT_PROXY_CREATION_FAILED',
  ASPECT_COMPOSITION_FAILED = 'ASPECT_COMPOSITION_FAILED',
  ASPECT_ORDERING_CONFLICT = 'ASPECT_ORDERING_CONFLICT',
  ASPECT_RECURSION_DETECTED = 'ASPECT_RECURSION_DETECTED',
  ASPECT_PERFORMANCE_DEGRADATION = 'ASPECT_PERFORMANCE_DEGRADATION',
  ASPECT_CONTAINER_ERROR = 'ASPECT_CONTAINER_ERROR',
  ASPECT_REGISTRY_ERROR = 'ASPECT_REGISTRY_ERROR'
}

// Aspect Execution Phases
export enum AspectExecutionPhase {
  BEFORE = 'before',
  AFTER = 'after',
  AROUND = 'around',
  EXCEPTION = 'exception',
  SUCCESS = 'success',
  FINALLY = 'finally',
  WEAVING = 'weaving',
  INITIALIZATION = 'initialization',
  DESTRUCTION = 'destruction'
}

// Aspect Components
export enum AspectComponent {
  ORCHESTRATOR = 'orchestrator',
  INTERCEPTOR = 'interceptor',
  WEAVER = 'weaver',
  CONTAINER = 'container',
  REGISTRY = 'registry',
  PROXY = 'proxy',
  POINTCUT = 'pointcut',
  ADVICE = 'advice',
  ASPECT = 'aspect'
}

// Aspect Context Extensions
export interface AspectErrorContext extends ErrorContext {
  readonly aspectName?: string;
  readonly aspectType?: string;
  readonly executionPhase?: AspectExecutionPhase;
  readonly targetMethod?: string;
  readonly targetClass?: string;
  readonly aspectComponent?: AspectComponent;
  readonly pointcutExpression?: string;
  readonly aspectPriority?: number;
  readonly aspectOrder?: number;
  readonly executionDepth?: number;
  readonly performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  readonly aspectChain?: string[];
  readonly interceptorStack?: string[];
  readonly containerScope?: string;
  readonly dependencyChain?: string[];
}

/**
 * Base Aspect Error
 * Enterprise-grade AOP error with aspect execution context
 */
export class AspectError extends DomainError {
  public readonly aspectErrorType: AspectErrorType;
  public readonly aspectContext: AspectErrorContext;
  public readonly executionPhase: AspectExecutionPhase;

  constructor(
    message: string,
    aspectErrorType: AspectErrorType,
    aspectContext: Partial<AspectErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    // Default aspect error classification
    const defaultClassification: ErrorClassification = {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.INFRASTRUCTURE,
      retryable: false,
      userFacing: false,
      requiresEscalation: true,
      automatedRecovery: true,
      ...classification
    };

    // Default recovery suggestions for aspects
    const defaultRecoveryConfig = AspectError.getDefaultRecoveryConfig(aspectErrorType);
    const combinedSuggestions = [...defaultRecoveryConfig, ...recoverySuggestions];

    super(
      message,
      aspectErrorType,
      {
        component: 'AOPSystem',
        ...aspectContext
      },
      defaultClassification,
      combinedSuggestions
    );

    this.aspectErrorType = aspectErrorType;
    this.executionPhase = aspectContext.executionPhase || AspectExecutionPhase.BEFORE;
    this.aspectContext = {
      ...this.context,
      executionPhase: this.executionPhase,
      ...aspectContext
    } as AspectErrorContext;

    // Log aspect event
    this.logAspectEvent();
  }

  /**
   * Get aspect error type
   */
  getAspectErrorType(): AspectErrorType {
    return this.aspectErrorType;
  }

  /**
   * Get aspect context
   */
  getAspectContext(): AspectErrorContext {
    return this.aspectContext;
  }

  /**
   * Get execution phase
   */
  getExecutionPhase(): AspectExecutionPhase {
    return this.executionPhase;
  }

  /**
   * Check if error is AOP infrastructure failure
   */
  isInfrastructureFailure(): boolean {
    const infrastructureTypes = [
      AspectErrorType.ASPECT_WEAVING_FAILED,
      AspectErrorType.ASPECT_CONTAINER_ERROR,
      AspectErrorType.ASPECT_REGISTRY_ERROR,
      AspectErrorType.ASPECT_PROXY_CREATION_FAILED
    ];
    return infrastructureTypes.includes(this.aspectErrorType);
  }

  /**
   * Check if error affects performance
   */
  affectsPerformance(): boolean {
    const performanceTypes = [
      AspectErrorType.ASPECT_PERFORMANCE_DEGRADATION,
      AspectErrorType.ASPECT_RECURSION_DETECTED,
      AspectErrorType.ASPECT_ORDERING_CONFLICT
    ];
    return performanceTypes.includes(this.aspectErrorType) ||
           (this.aspectContext.performanceMetrics?.executionTime || 0) > 1000;
  }

  /**
   * Check if error can cause system instability
   */
  causesSystemInstability(): boolean {
    const unstableTypes = [
      AspectErrorType.ASPECT_RECURSION_DETECTED,
      AspectErrorType.ASPECT_WEAVING_FAILED,
      AspectErrorType.ASPECT_CONTAINER_ERROR
    ];
    return unstableTypes.includes(this.aspectErrorType) ||
           (this.aspectContext.executionDepth || 0) > 10;
  }

  /**
   * Get aspect diagnostic data
   */
  getAspectDiagnostic(): Record<string, any> {
    return {
      eventType: 'aspect_error',
      errorType: this.aspectErrorType,
      aspectName: this.aspectContext.aspectName,
      aspectComponent: this.aspectContext.aspectComponent,
      executionPhase: this.executionPhase,
      targetMethod: this.aspectContext.targetMethod,
      targetClass: this.aspectContext.targetClass,
      aspectPriority: this.aspectContext.aspectPriority,
      executionDepth: this.aspectContext.executionDepth,
      performanceMetrics: this.aspectContext.performanceMetrics,
      aspectChain: this.aspectContext.aspectChain,
      infrastructureFailure: this.isInfrastructureFailure(),
      performanceImpact: this.affectsPerformance(),
      systemInstability: this.causesSystemInstability(),
      timestamp: this.context.timestamp,
      severity: this.classification.severity
    };
  }

  /**
   * Log aspect event
   */
  private logAspectEvent(): void {
    const diagnostic = this.getAspectDiagnostic();
    console.warn('[ASPECT-EVENT] AOP error occurred:', diagnostic);
    
    if (this.causesSystemInstability()) {
      console.error('[ASPECT-ALERT] System instability risk from AOP error:', diagnostic);
    }
    
    if (this.affectsPerformance()) {
      console.warn('[ASPECT-PERFORMANCE] Performance degradation detected:', diagnostic);
    }
  }

  /**
   * Get default recovery suggestions by error type
   */
  private static getDefaultRecoveryConfig(errorType: AspectErrorType): ErrorRecoverySuggestion[] {
    const recoveryConfigs: Record<AspectErrorType, ErrorRecoverySuggestion[]> = {
      [AspectErrorType.ASPECT_EXECUTION_FAILED]: [
        {
          action: 'retry_aspect_execution',
          description: 'Retry aspect execution with fallback behavior',
          automated: true,
          priority: 100
        },
        {
          action: 'skip_aspect',
          description: 'Skip failed aspect and continue execution',
          automated: true,
          priority: 90
        },
        {
          action: 'fallback_to_base_method',
          description: 'Execute base method without aspect',
          automated: true,
          priority: 80
        }
      ],
      [AspectErrorType.ASPECT_WEAVING_FAILED]: [
        {
          action: 'reload_aspect_configuration',
          description: 'Reload aspect configuration and retry weaving',
          automated: true,
          priority: 100
        },
        {
          action: 'disable_problematic_aspect',
          description: 'Temporarily disable problematic aspect',
          automated: true,
          priority: 90
        },
        {
          action: 'use_runtime_weaving',
          description: 'Fall back to runtime weaving strategy',
          automated: true,
          priority: 80
        }
      ],
      [AspectErrorType.ASPECT_RECURSION_DETECTED]: [
        {
          action: 'break_recursion_chain',
          description: 'Break detected recursion chain',
          automated: true,
          priority: 100
        },
        {
          action: 'adjust_aspect_ordering',
          description: 'Adjust aspect execution ordering to prevent recursion',
          automated: true,
          priority: 90
        },
        {
          action: 'disable_recursive_aspect',
          description: 'Temporarily disable recursive aspect',
          automated: true,
          priority: 80
        }
      ],
      [AspectErrorType.ASPECT_PERFORMANCE_DEGRADATION]: [
        {
          action: 'optimize_aspect_execution',
          description: 'Apply performance optimizations to aspect',
          automated: true,
          priority: 100
        },
        {
          action: 'cache_aspect_results',
          description: 'Enable caching for aspect results',
          automated: true,
          priority: 90
        },
        {
          action: 'reduce_aspect_complexity',
          description: 'Simplify aspect logic to improve performance',
          automated: false,
          priority: 80
        }
      ],
      [AspectErrorType.ASPECT_CONTAINER_ERROR]: [
        {
          action: 'restart_aspect_container',
          description: 'Restart aspect container with fresh state',
          automated: true,
          priority: 100
        },
        {
          action: 'reinitialize_dependencies',
          description: 'Reinitialize aspect dependencies',
          automated: true,
          priority: 90
        },
        {
          action: 'fallback_to_simple_container',
          description: 'Use simplified container implementation',
          automated: true,
          priority: 80
        }
      ],
      [AspectErrorType.ASPECT_PROXY_CREATION_FAILED]: [
        {
          action: 'retry_proxy_creation',
          description: 'Retry creating aspect proxy with different strategy',
          automated: true,
          priority: 100
        },
        {
          action: 'use_direct_interception',
          description: 'Use direct method interception instead of proxy',
          automated: true,
          priority: 90
        }
      ],
      // Default empty arrays for other types
      [AspectErrorType.POINTCUT_MATCHING_FAILED]: [],
      [AspectErrorType.ADVICE_EXECUTION_FAILED]: [],
      [AspectErrorType.ASPECT_DEPENDENCY_FAILED]: [],
      [AspectErrorType.ASPECT_CONFIGURATION_INVALID]: [],
      [AspectErrorType.ASPECT_LIFECYCLE_ERROR]: [],
      [AspectErrorType.ASPECT_INTERCEPTION_FAILED]: [],
      [AspectErrorType.ASPECT_COMPOSITION_FAILED]: [],
      [AspectErrorType.ASPECT_ORDERING_CONFLICT]: [],
      [AspectErrorType.ASPECT_REGISTRY_ERROR]: []
    };

    return recoveryConfigs[errorType] || [];
  }
}

/**
 * Aspect Execution Failed Error
 * Specific error for aspect execution failures
 */
export class AspectExecutionFailedError extends AspectError {
  constructor(
    aspectName: string,
    targetMethod: string,
    executionPhase: AspectExecutionPhase,
    originalError?: Error,
    context: Partial<AspectErrorContext> = {}
  ) {
    super(
      `Aspect execution failed: ${aspectName} in ${executionPhase} phase for ${targetMethod}`,
      AspectErrorType.ASPECT_EXECUTION_FAILED,
      {
        aspectName,
        targetMethod,
        executionPhase,
        metadata: { originalError: originalError?.message, stack: originalError?.stack },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Aspect Weaving Failed Error
 * Specific error for aspect weaving failures
 */
export class AspectWeavingFailedError extends AspectError {
  constructor(
    aspectName: string,
    targetClass: string,
    weavingError: string,
    context: Partial<AspectErrorContext> = {}
  ) {
    super(
      `Aspect weaving failed: Cannot weave ${aspectName} into ${targetClass} - ${weavingError}`,
      AspectErrorType.ASPECT_WEAVING_FAILED,
      {
        aspectName,
        targetClass,
        aspectComponent: AspectComponent.WEAVER,
        metadata: { weavingError },
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Aspect Recursion Detected Error
 * Specific error for aspect recursion detection
 */
export class AspectRecursionDetectedError extends AspectError {
  constructor(
    aspectChain: string[],
    executionDepth: number,
    context: Partial<AspectErrorContext> = {}
  ) {
    super(
      `Aspect recursion detected: ${aspectChain.join(' -> ')} (depth: ${executionDepth})`,
      AspectErrorType.ASPECT_RECURSION_DETECTED,
      {
        aspectChain,
        executionDepth,
        aspectComponent: AspectComponent.ORCHESTRATOR,
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Aspect Performance Degradation Error
 * Specific error for performance issues in aspects
 */
export class AspectPerformanceDegradationError extends AspectError {
  constructor(
    aspectName: string,
    executionTime: number,
    threshold: number,
    context: Partial<AspectErrorContext> = {}
  ) {
    super(
      `Aspect performance degradation: ${aspectName} took ${executionTime}ms (threshold: ${threshold}ms)`,
      AspectErrorType.ASPECT_PERFORMANCE_DEGRADATION,
      {
        aspectName,
        performanceMetrics: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        },
        metadata: { threshold },
        ...context
      },
      {
        severity: ErrorSeverity.MEDIUM,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Aspect Container Error
 * Specific error for aspect container failures
 */
export class AspectContainerError extends AspectError {
  constructor(
    containerScope: string,
    containerError: string,
    dependencyChain?: string[],
    context: Partial<AspectErrorContext> = {}
  ) {
    super(
      `Aspect container error in scope '${containerScope}': ${containerError}`,
      AspectErrorType.ASPECT_CONTAINER_ERROR,
      {
        containerScope,
        dependencyChain,
        aspectComponent: AspectComponent.CONTAINER,
        metadata: { containerError },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        requiresEscalation: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Aspect Error Factory
 * Factory for creating aspect errors with consistent patterns
 */
export class AspectErrorFactory {
  /**
   * Create aspect error from execution context
   */
  static fromExecutionContext(
    aspectName: string,
    targetMethod: string,
    phase: AspectExecutionPhase,
    error: Error,
    context: Partial<AspectErrorContext> = {}
  ): AspectError {
    return new AspectExecutionFailedError(
      aspectName,
      targetMethod,
      phase,
      error,
      context
    );
  }

  /**
   * Create aspect error from performance monitoring
   */
  static fromPerformanceMonitoring(
    aspectName: string,
    executionTime: number,
    threshold: number,
    context: Partial<AspectErrorContext> = {}
  ): AspectError {
    return new AspectPerformanceDegradationError(
      aspectName,
      executionTime,
      threshold,
      context
    );
  }

  /**
   * Create aspect error from weaving failure
   */
  static fromWeavingFailure(
    aspectName: string,
    targetClass: string,
    weavingError: string,
    context: Partial<AspectErrorContext> = {}
  ): AspectError {
    return new AspectWeavingFailedError(
      aspectName,
      targetClass,
      weavingError,
      context
    );
  }

  /**
   * Create aspect error from recursion detection
   */
  static fromRecursionDetection(
    aspectChain: string[],
    executionDepth: number,
    context: Partial<AspectErrorContext> = {}
  ): AspectError {
    return new AspectRecursionDetectedError(
      aspectChain,
      executionDepth,
      context
    );
  }

  /**
   * Create aspect error from container failure
   */
  static fromContainerFailure(
    containerScope: string,
    containerError: string,
    dependencyChain?: string[],
    context: Partial<AspectErrorContext> = {}
  ): AspectError {
    return new AspectContainerError(
      containerScope,
      containerError,
      dependencyChain,
      context
    );
  }
}

// Export all aspect error types
export { AspectErrorType, AspectExecutionPhase, AspectComponent };
export type { AspectErrorContext };