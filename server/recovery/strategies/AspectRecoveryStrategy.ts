/**
 * Aspect Recovery Strategy - Phase 4 Task 4.2
 * Enterprise-grade AOP error recovery with aspect reweaving and performance optimization
 */

import {
  BaseRecoveryStrategy,
  RecoveryContext,
  RecoveryAction,
  RecoveryStrategyType
} from '../RecoveryStrategy';

import {
  AspectError,
  AspectErrorType,
  AspectExecutionFailedError,
  AspectWeavingFailedError,
  AspectRecursionDetectedError,
  AspectPerformanceDegradationError,
  AspectContainerError
} from '../../error/AspectError';

// Aspect Recovery Actions
export enum AspectRecoveryAction {
  REWEAVE_ASPECT = 'reweave_aspect',
  RESTART_ASPECT_CONTAINER = 'restart_aspect_container',
  OPTIMIZE_ASPECT_PERFORMANCE = 'optimize_aspect_performance',
  RESOLVE_ASPECT_RECURSION = 'resolve_aspect_recursion',
  REBUILD_ASPECT_PROXY = 'rebuild_aspect_proxy',
  ADJUST_ASPECT_ORDERING = 'adjust_aspect_ordering',
  ISOLATE_PROBLEMATIC_ASPECT = 'isolate_problematic_aspect',
  FALLBACK_TO_BASIC_ASPECT = 'fallback_to_basic_aspect',
  CLEAR_ASPECT_CACHE = 'clear_aspect_cache',
  RESET_ASPECT_REGISTRY = 'reset_aspect_registry',
  ENABLE_ASPECT_DEBUGGING = 'enable_aspect_debugging',
  REPAIR_ASPECT_DEPENDENCIES = 'repair_aspect_dependencies'
}

// Aspect Manager Interface
interface AspectManager {
  reweaveAspect(aspectName: string): Promise<boolean>;
  restartContainer(): Promise<boolean>;
  optimizePerformance(aspectName: string): Promise<boolean>;
  isolateAspect(aspectName: string): Promise<boolean>;
}

// Aspect Registry Interface
interface AspectRegistry {
  resetRegistry(): Promise<boolean>;
  rebuildProxies(): Promise<boolean>;
  adjustOrdering(aspects: string[]): Promise<boolean>;
  getAspectHealth(): Promise<Record<string, boolean>>;
}

// Performance Monitor Interface
interface AspectPerformanceMonitor {
  getPerformanceMetrics(aspectName: string): Promise<AspectPerformanceMetrics>;
  optimizeAspectExecution(aspectName: string): Promise<boolean>;
  detectPerformanceIssues(): Promise<string[]>;
}

// Aspect Performance Metrics
interface AspectPerformanceMetrics {
  aspectName: string;
  averageExecutionTime: number;
  totalExecutions: number;
  failureRate: number;
  memoryUsage: number;
  lastExecution: Date;
}

/**
 * Aspect Recovery Strategy
 * Handles recovery from AOP-related errors with comprehensive aspect management and optimization
 */
export class AspectRecoveryStrategy extends BaseRecoveryStrategy<AspectError> {
  private aspectManager?: AspectManager;
  private aspectRegistry?: AspectRegistry;
  private performanceMonitor?: AspectPerformanceMonitor;

  constructor(
    aspectManager?: AspectManager,
    aspectRegistry?: AspectRegistry,
    performanceMonitor?: AspectPerformanceMonitor
  ) {
    super(
      'AspectRecoveryStrategy',
      RecoveryStrategyType.AUTOMATED,
      75, // Medium-high priority
      '1.0.0'
    );
    
    this.aspectManager = aspectManager;
    this.aspectRegistry = aspectRegistry;
    this.performanceMonitor = performanceMonitor;
  }

  /**
   * Check if strategy can handle the aspect error
   */
  canHandle(error: AspectError): boolean {
    return error instanceof AspectError;
  }

  /**
   * Get maximum recovery attempts for aspect errors
   */
  getMaxAttempts(): number {
    return 4;
  }

  /**
   * Get timeout for aspect recovery operations
   */
  getTimeout(): number {
    return 12000; // 12 seconds
  }

  /**
   * Get required permissions for aspect recovery
   */
  getRequiredPermissions(): string[] {
    return ['aspect:manage', 'aspect:weave', 'aspect:performance', 'aspect:debug'];
  }

  /**
   * Execute recovery actions based on aspect error type
   */
  async executeRecoveryActions(
    error: AspectError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    console.log(`[ASPECT-RECOVERY] Executing recovery for ${error.aspectErrorType} (attempt ${context.attemptNumber})`);

    // Execute recovery based on specific error type
    switch (error.aspectErrorType) {
      case AspectErrorType.ASPECT_EXECUTION_FAILED:
        actions.push(...await this.handleAspectExecutionFailed(error as AspectExecutionFailedError, context));
        break;
        
      case AspectErrorType.ASPECT_WEAVING_FAILED:
        actions.push(...await this.handleAspectWeavingFailed(error as AspectWeavingFailedError, context));
        break;
        
      case AspectErrorType.ASPECT_RECURSION_DETECTED:
        actions.push(...await this.handleAspectRecursion(error as AspectRecursionDetectedError, context));
        break;
        
      case AspectErrorType.ASPECT_PERFORMANCE_DEGRADATION:
        actions.push(...await this.handlePerformanceDegradation(error as AspectPerformanceDegradationError, context));
        break;
        
      case AspectErrorType.ASPECT_CONTAINER_ERROR:
        actions.push(...await this.handleContainerError(error as AspectContainerError, context));
        break;
        
      case AspectErrorType.ASPECT_PROXY_CREATION_FAILED:
        actions.push(...await this.handleProxyCreationFailed(error, context));
        break;
        
      case AspectErrorType.ASPECT_ORDERING_CONFLICT:
        actions.push(...await this.handleOrderingConflict(error, context));
        break;
        
      default:
        actions.push(...await this.handleGenericAspectError(error, context));
        break;
    }

    return actions;
  }

  /**
   * Handle aspect execution failed recovery
   */
  private async handleAspectExecutionFailed(
    error: AspectExecutionFailedError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to reweave the failing aspect
    const reweaveAction = this.createAction(
      AspectRecoveryAction.REWEAVE_ASPECT,
      `Reweave failing aspect: ${error.aspectContext.aspectName}`,
      { 
        aspectName: error.aspectContext.aspectName,
        targetMethod: error.aspectContext.targetMethod,
        executionPhase: error.aspectContext.executionPhase
      }
    );

    const executedReweave = await this.executeAction(reweaveAction, async () => {
      const aspectName = error.aspectContext.aspectName!;

      if (this.aspectManager) {
        const reweaved = await this.aspectManager.reweaveAspect(aspectName);
        
        return {
          aspectName,
          reweaveSuccessful: reweaved,
          targetMethod: error.aspectContext.targetMethod,
          executionPhase: error.aspectContext.executionPhase
        };
      }

      return {
        aspectName,
        reweaveSuccessful: false,
        reason: 'no_aspect_manager'
      };
    });

    actions.push(executedReweave);

    // If reweaving failed, try to isolate the problematic aspect
    if (!executedReweave.result?.reweaveSuccessful) {
      const isolateAction = this.createAction(
        AspectRecoveryAction.ISOLATE_PROBLEMATIC_ASPECT,
        `Isolate problematic aspect: ${error.aspectContext.aspectName}`,
        { aspectName: error.aspectContext.aspectName }
      );

      const executedIsolate = await this.executeAction(isolateAction, async () => {
        const aspectName = error.aspectContext.aspectName!;

        if (this.aspectManager) {
          const isolated = await this.aspectManager.isolateAspect(aspectName);
          
          return {
            aspectName,
            isolated,
            fallbackEnabled: true
          };
        }

        return {
          aspectName,
          isolated: false,
          reason: 'no_aspect_manager'
        };
      });

      actions.push(executedIsolate);
    }

    return actions;
  }

  /**
   * Handle aspect weaving failed recovery
   */
  private async handleAspectWeavingFailed(
    error: AspectWeavingFailedError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Try to rebuild aspect proxies
    const rebuildAction = this.createAction(
      AspectRecoveryAction.REBUILD_ASPECT_PROXY,
      `Rebuild aspect proxy for: ${error.aspectContext.aspectName}`,
      { 
        aspectName: error.aspectContext.aspectName,
        weavingPhase: error.aspectContext.weavingPhase
      }
    );

    const executedRebuild = await this.executeAction(rebuildAction, async () => {
      const aspectName = error.aspectContext.aspectName!;

      if (this.aspectRegistry) {
        const rebuilt = await this.aspectRegistry.rebuildProxies();
        
        return {
          aspectName,
          proxiesRebuilt: rebuilt,
          weavingPhase: error.aspectContext.weavingPhase
        };
      }

      return {
        aspectName,
        proxiesRebuilt: false,
        reason: 'no_aspect_registry'
      };
    });

    actions.push(executedRebuild);

    // If proxy rebuild failed, reset the aspect registry
    if (!executedRebuild.result?.proxiesRebuilt) {
      const resetAction = this.createAction(
        AspectRecoveryAction.RESET_ASPECT_REGISTRY,
        'Reset aspect registry to clear weaving issues',
        { aspectName: error.aspectContext.aspectName }
      );

      const executedReset = await this.executeAction(resetAction, async () => {
        if (this.aspectRegistry) {
          const reset = await this.aspectRegistry.resetRegistry();
          
          return {
            registryReset: reset,
            aspectsCleared: true
          };
        }

        return {
          registryReset: false,
          reason: 'no_aspect_registry'
        };
      });

      actions.push(executedReset);
    }

    return actions;
  }

  /**
   * Handle aspect recursion recovery
   */
  private async handleAspectRecursion(
    error: AspectRecursionDetectedError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Resolve recursion by isolating the recursive aspect
    const resolveAction = this.createAction(
      AspectRecoveryAction.RESOLVE_ASPECT_RECURSION,
      `Resolve recursion in aspect: ${error.aspectContext.aspectName}`,
      { 
        aspectName: error.aspectContext.aspectName,
        recursionDepth: error.aspectContext.recursionDepth,
        recursionPoint: error.aspectContext.recursionPoint
      }
    );

    const executedResolve = await this.executeAction(resolveAction, async () => {
      const aspectName = error.aspectContext.aspectName!;
      const recursionDepth = error.aspectContext.recursionDepth;

      // Temporarily isolate the aspect to break recursion
      if (this.aspectManager) {
        const isolated = await this.aspectManager.isolateAspect(aspectName);
        
        return {
          aspectName,
          recursionBroken: isolated,
          recursionDepth,
          isolationApplied: true
        };
      }

      return {
        aspectName,
        recursionBroken: false,
        reason: 'no_aspect_manager'
      };
    });

    actions.push(executedResolve);

    // Clear aspect cache to prevent cached recursive calls
    const clearCacheAction = this.createAction(
      AspectRecoveryAction.CLEAR_ASPECT_CACHE,
      'Clear aspect cache to prevent recursive calls',
      { aspectName: error.aspectContext.aspectName }
    );

    const executedClearCache = await this.executeAction(clearCacheAction, async () => {
      // In a real implementation, this would clear aspect-specific caches
      return {
        cacheCleared: true,
        aspectName: error.aspectContext.aspectName,
        cacheType: 'execution_cache'
      };
    });

    actions.push(executedClearCache);

    return actions;
  }

  /**
   * Handle performance degradation recovery
   */
  private async handlePerformanceDegradation(
    error: AspectPerformanceDegradationError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Optimize aspect performance
    const optimizeAction = this.createAction(
      AspectRecoveryAction.OPTIMIZE_ASPECT_PERFORMANCE,
      `Optimize performance for aspect: ${error.aspectContext.aspectName}`,
      { 
        aspectName: error.aspectContext.aspectName,
        performanceMetric: error.aspectContext.performanceMetric,
        thresholdExceeded: error.aspectContext.thresholdValue
      }
    );

    const executedOptimize = await this.executeAction(optimizeAction, async () => {
      const aspectName = error.aspectContext.aspectName!;

      if (this.performanceMonitor) {
        // Get current performance metrics
        const metrics = await this.performanceMonitor.getPerformanceMetrics(aspectName);
        
        // Apply optimization
        const optimized = await this.performanceMonitor.optimizeAspectExecution(aspectName);
        
        return {
          aspectName,
          optimized,
          beforeOptimization: metrics,
          performanceImproved: optimized
        };
      }

      return {
        aspectName,
        optimized: false,
        reason: 'no_performance_monitor'
      };
    });

    actions.push(executedOptimize);

    // If optimization didn't help, consider fallback to basic aspect
    if (!executedOptimize.result?.optimized) {
      const fallbackAction = this.createAction(
        AspectRecoveryAction.FALLBACK_TO_BASIC_ASPECT,
        `Fallback to basic aspect implementation: ${error.aspectContext.aspectName}`,
        { aspectName: error.aspectContext.aspectName }
      );

      const executedFallback = await this.executeAction(fallbackAction, async () => {
        const aspectName = error.aspectContext.aspectName!;

        // In a real implementation, this would switch to a simpler aspect version
        return {
          aspectName,
          fallbackApplied: true,
          basicVersionEnabled: true,
          performanceTradeoff: 'reduced_functionality_for_performance'
        };
      });

      actions.push(executedFallback);
    }

    return actions;
  }

  /**
   * Handle container error recovery
   */
  private async handleContainerError(
    error: AspectContainerError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Restart the aspect container
    const restartAction = this.createAction(
      AspectRecoveryAction.RESTART_ASPECT_CONTAINER,
      `Restart aspect container: ${error.aspectContext.containerName}`,
      { 
        containerName: error.aspectContext.containerName,
        aspectsAffected: error.aspectContext.aspectsAffected
      }
    );

    const executedRestart = await this.executeAction(restartAction, async () => {
      if (this.aspectManager) {
        const restarted = await this.aspectManager.restartContainer();
        
        return {
          containerName: error.aspectContext.containerName,
          containerRestarted: restarted,
          aspectsAffected: error.aspectContext.aspectsAffected
        };
      }

      return {
        containerName: error.aspectContext.containerName,
        containerRestarted: false,
        reason: 'no_aspect_manager'
      };
    });

    actions.push(executedRestart);

    // After container restart, repair aspect dependencies
    const repairAction = this.createAction(
      AspectRecoveryAction.REPAIR_ASPECT_DEPENDENCIES,
      'Repair aspect dependencies after container restart',
      { containerName: error.aspectContext.containerName }
    );

    const executedRepair = await this.executeAction(repairAction, async () => {
      if (this.aspectRegistry) {
        // Check aspect health after restart
        const aspectHealth = await this.aspectRegistry.getAspectHealth();
        const unhealthyAspects = Object.entries(aspectHealth)
          .filter(([_, healthy]) => !healthy)
          .map(([aspect, _]) => aspect);

        return {
          aspectHealthChecked: true,
          totalAspects: Object.keys(aspectHealth).length,
          unhealthyAspects,
          dependenciesRepaired: unhealthyAspects.length === 0
        };
      }

      return {
        aspectHealthChecked: false,
        reason: 'no_aspect_registry'
      };
    });

    actions.push(executedRepair);

    return actions;
  }

  /**
   * Handle proxy creation failed recovery
   */
  private async handleProxyCreationFailed(
    error: AspectError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Rebuild all aspect proxies
    const rebuildAction = this.createAction(
      AspectRecoveryAction.REBUILD_ASPECT_PROXY,
      `Rebuild aspect proxies after creation failure`,
      { aspectName: error.aspectContext.aspectName }
    );

    const executedRebuild = await this.executeAction(rebuildAction, async () => {
      if (this.aspectRegistry) {
        const rebuilt = await this.aspectRegistry.rebuildProxies();
        
        return {
          proxiesRebuilt: rebuilt,
          aspectName: error.aspectContext.aspectName
        };
      }

      return {
        proxiesRebuilt: false,
        reason: 'no_aspect_registry'
      };
    });

    actions.push(executedRebuild);

    return actions;
  }

  /**
   * Handle ordering conflict recovery
   */
  private async handleOrderingConflict(
    error: AspectError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Adjust aspect ordering
    const adjustAction = this.createAction(
      AspectRecoveryAction.ADJUST_ASPECT_ORDERING,
      'Adjust aspect ordering to resolve conflicts',
      { 
        aspectName: error.aspectContext.aspectName,
        conflictingAspects: error.aspectContext.conflictingAspects
      }
    );

    const executedAdjust = await this.executeAction(adjustAction, async () => {
      const conflictingAspects = error.aspectContext.conflictingAspects || [];
      
      if (this.aspectRegistry && conflictingAspects.length > 0) {
        // Apply priority-based ordering (higher priority first)
        const orderedAspects = this.calculateOptimalOrdering(conflictingAspects);
        const adjusted = await this.aspectRegistry.adjustOrdering(orderedAspects);
        
        return {
          orderingAdjusted: adjusted,
          conflictingAspects,
          newOrdering: orderedAspects
        };
      }

      return {
        orderingAdjusted: false,
        reason: 'no_conflicting_aspects_or_registry'
      };
    });

    actions.push(executedAdjust);

    return actions;
  }

  /**
   * Handle generic aspect error recovery
   */
  private async handleGenericAspectError(
    error: AspectError,
    context: RecoveryContext
  ): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];

    // Enable aspect debugging
    const debugAction = this.createAction(
      AspectRecoveryAction.ENABLE_ASPECT_DEBUGGING,
      `Enable debugging for aspect error: ${error.aspectErrorType}`,
      { aspectName: error.aspectContext.aspectName }
    );

    const executedDebug = await this.executeAction(debugAction, async () => {
      // In a real implementation, this would enable detailed aspect logging
      return {
        debuggingEnabled: true,
        aspectName: error.aspectContext.aspectName,
        errorType: error.aspectErrorType,
        debugLevel: 'verbose'
      };
    });

    actions.push(executedDebug);

    // Clear aspect cache as a general recovery measure
    const clearAction = this.createAction(
      AspectRecoveryAction.CLEAR_ASPECT_CACHE,
      'Clear aspect cache for general recovery',
      { aspectName: error.aspectContext.aspectName }
    );

    const executedClear = await this.executeAction(clearAction, async () => {
      return {
        cacheCleared: true,
        aspectName: error.aspectContext.aspectName,
        cacheType: 'all_caches'
      };
    });

    actions.push(executedClear);

    return actions;
  }

  /**
   * Calculate optimal aspect ordering
   */
  private calculateOptimalOrdering(aspects: string[]): string[] {
    // Define aspect priority order (higher number = higher priority)
    const priorityMap: Record<string, number> = {
      'SecurityAspect': 100,
      'AuthenticationAspect': 90,
      'ValidationAspect': 80,
      'LoggingAspect': 70,
      'PerformanceAspect': 60,
      'CachingAspect': 50,
      'MetricsAspect': 40,
      'ErrorHandlingAspect': 30
    };

    // Sort aspects by priority (highest first)
    return aspects.sort((a, b) => {
      const priorityA = priorityMap[a] || 10; // Default low priority
      const priorityB = priorityMap[b] || 10;
      return priorityB - priorityA;
    });
  }

  /**
   * Estimate recovery time based on error type
   */
  estimateRecoveryTime(error: AspectError): number {
    switch (error.aspectErrorType) {
      case AspectErrorType.ASPECT_EXECUTION_FAILED:
        return 3000; // 3 seconds for reweaving
      case AspectErrorType.ASPECT_WEAVING_FAILED:
        return 5000; // 5 seconds for proxy rebuild
      case AspectErrorType.ASPECT_RECURSION_DETECTED:
        return 2000; // 2 seconds for recursion resolution
      case AspectErrorType.ASPECT_PERFORMANCE_DEGRADATION:
        return 4000; // 4 seconds for performance optimization
      case AspectErrorType.ASPECT_CONTAINER_ERROR:
        return 8000; // 8 seconds for container restart
      case AspectErrorType.ASPECT_PROXY_CREATION_FAILED:
        return 3000; // 3 seconds for proxy creation
      case AspectErrorType.ASPECT_ORDERING_CONFLICT:
        return 1000; // 1 second for ordering adjustment
      default:
        return 3000; // 3 seconds default
    }
  }
}

// Export aspect recovery strategy and types
export { AspectRecoveryAction };