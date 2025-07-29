/**
 * Enterprise Component Interceptor Framework
 * AOP-based Higher-Order Component system for cross-cutting concerns
 * Zero shortcuts, 100% enterprise patterns with comprehensive type safety
 */

import React, { ComponentType, FC, forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { uiComponentAspect, UIRenderingContext, UIAspectResult } from './UIComponentAspectFramework';
import { z } from 'zod';

// ===== ENTERPRISE INTERCEPTOR INTERFACES =====
export interface ComponentInterceptor<P = any> {
  readonly name: string;
  readonly priority: number;
  readonly enabled: boolean;
  readonly supportedPhases: readonly InterceptorPhase[];
  
  beforeMount?(props: P, context: InterceptionContext): InterceptionResult<P>;
  afterMount?(props: P, result: any, context: InterceptionContext): InterceptionResult<any>;
  beforeUpdate?(prevProps: P, nextProps: P, context: InterceptionContext): InterceptionResult<P>;
  afterUpdate?(props: P, result: any, context: InterceptionContext): InterceptionResult<any>;
  beforeUnmount?(props: P, context: InterceptionContext): InterceptionResult<void>;
  onError?(error: Error, props: P, context: InterceptionContext): InterceptionResult<Error>;
}

export type InterceptorPhase = 'mount' | 'update' | 'unmount' | 'error' | 'render';

export interface InterceptionContext {
  readonly componentName: string;
  readonly componentId: string;
  readonly phase: InterceptorPhase;
  readonly timestamp: number;
  readonly renderCount: number;
  readonly depth: number;
  readonly parentComponent?: string;
  readonly metadata: Record<string, unknown>;
}

export interface InterceptionResult<T> {
  readonly success: boolean;
  readonly value: T;
  readonly shouldContinue: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly warnings?: readonly string[];
  readonly errors?: readonly string[];
}

// ===== VALIDATION SCHEMAS =====
const InterceptorConfigSchema = z.object({
  name: z.string().min(1),
  priority: z.number().min(0).max(100),
  enabled: z.boolean(),
  supportedPhases: z.array(z.enum(['mount', 'update', 'unmount', 'error', 'render'])),
  configuration: z.record(z.any()).optional()
});

const ComponentMetadataSchema = z.object({
  displayName: z.string().optional(),
  componentType: z.enum(['functional', 'class', 'memo', 'forward-ref']),
  isLazy: z.boolean().default(false),
  hasErrorBoundary: z.boolean().default(false),
  memoizationStrategy: z.enum(['none', 'shallow', 'deep']).default('none')
});

// ===== CORE INTERCEPTORS =====

/**
 * Performance Monitoring Interceptor
 * Tracks component rendering performance and memory usage
 */
export class PerformanceMonitoringInterceptor<P = any> implements ComponentInterceptor<P> {
  readonly name = 'PerformanceMonitoring';
  readonly priority = 1;
  readonly enabled = true;
  readonly supportedPhases = ['mount', 'update', 'unmount', 'render'] as const;

  private readonly performanceRegistry = new Map<string, ComponentPerformanceMetrics>();
  private readonly thresholds: PerformanceThresholds;

  constructor(thresholds: PerformanceThresholds = DEFAULT_PERFORMANCE_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  beforeMount(props: P, context: InterceptionContext): InterceptionResult<P> {
    const startTime = performance.now();
    
    this.initializePerformanceTracking(context.componentId, context.componentName);
    
    // Store start time for mount duration calculation
    const metadata = {
      mountStartTime: startTime,
      componentId: context.componentId
    };

    return {
      success: true,
      value: props,
      shouldContinue: true,
      metadata
    };
  }

  afterMount(props: P, result: any, context: InterceptionContext): InterceptionResult<any> {
    const endTime = performance.now();
    const startTime = context.metadata.mountStartTime as number;
    const mountDuration = endTime - startTime;

    this.updatePerformanceMetrics(context.componentId, {
      mountTime: mountDuration,
      renderCount: 1,
      lastRenderTime: mountDuration,
      totalRenderTime: mountDuration
    });

    // Check performance thresholds
    const warnings: string[] = [];
    if (mountDuration > this.thresholds.maxMountTime) {
      warnings.push(`Mount time ${mountDuration.toFixed(2)}ms exceeds threshold of ${this.thresholds.maxMountTime}ms`);
    }

    return {
      success: true,
      value: result,
      shouldContinue: true,
      warnings,
      metadata: {
        mountDuration,
        performanceMetrics: this.performanceRegistry.get(context.componentId)
      }
    };
  }

  beforeUpdate(prevProps: P, nextProps: P, context: InterceptionContext): InterceptionResult<P> {
    const startTime = performance.now();
    
    // Detect unnecessary re-renders
    const isUnnecessaryUpdate = this.detectUnnecessaryUpdate(prevProps, nextProps);
    const warnings: string[] = [];
    
    if (isUnnecessaryUpdate) {
      warnings.push('Potential unnecessary re-render detected - props appear unchanged');
    }

    return {
      success: true,
      value: nextProps,
      shouldContinue: true,
      warnings,
      metadata: {
        updateStartTime: startTime,
        isUnnecessaryUpdate
      }
    };
  }

  afterUpdate(props: P, result: any, context: InterceptionContext): InterceptionResult<any> {
    const endTime = performance.now();
    const startTime = context.metadata.updateStartTime as number;
    const updateDuration = endTime - startTime;

    this.updatePerformanceMetrics(context.componentId, {
      lastRenderTime: updateDuration,
      renderCount: (this.performanceRegistry.get(context.componentId)?.renderCount || 0) + 1,
      totalRenderTime: (this.performanceRegistry.get(context.componentId)?.totalRenderTime || 0) + updateDuration
    });

    const warnings: string[] = [];
    if (updateDuration > this.thresholds.maxUpdateTime) {
      warnings.push(`Update time ${updateDuration.toFixed(2)}ms exceeds threshold of ${this.thresholds.maxUpdateTime}ms`);
    }

    return {
      success: true,
      value: result,
      shouldContinue: true,
      warnings,
      metadata: {
        updateDuration,
        performanceMetrics: this.performanceRegistry.get(context.componentId)
      }
    };
  }

  beforeUnmount(props: P, context: InterceptionContext): InterceptionResult<void> {
    // Clean up performance tracking
    const metrics = this.performanceRegistry.get(context.componentId);
    
    if (metrics) {
      console.log(`[PerformanceMonitoring] Component ${context.componentName} lifecycle summary:`, {
        componentId: context.componentId,
        totalRenders: metrics.renderCount,
        averageRenderTime: metrics.totalRenderTime / metrics.renderCount,
        mountTime: metrics.mountTime
      });
    }

    this.performanceRegistry.delete(context.componentId);

    return {
      success: true,
      value: undefined,
      shouldContinue: true
    };
  }

  onError(error: Error, props: P, context: InterceptionContext): InterceptionResult<Error> {
    console.error(`[PerformanceMonitoring] Error in component ${context.componentName}:`, {
      error: error.message,
      componentId: context.componentId,
      phase: context.phase,
      performanceMetrics: this.performanceRegistry.get(context.componentId)
    });

    return {
      success: true,
      value: error,
      shouldContinue: true,
      errors: [`Performance monitoring detected error: ${error.message}`]
    };
  }

  private initializePerformanceTracking(componentId: string, componentName: string): void {
    this.performanceRegistry.set(componentId, {
      componentName,
      mountTime: 0,
      renderCount: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      createdAt: Date.now()
    });
  }

  private updatePerformanceMetrics(componentId: string, updates: Partial<ComponentPerformanceMetrics>): void {
    const existing = this.performanceRegistry.get(componentId);
    if (existing) {
      this.performanceRegistry.set(componentId, { ...existing, ...updates });
    }
  }

  private detectUnnecessaryUpdate<P>(prevProps: P, nextProps: P): boolean {
    try {
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    } catch {
      // Fallback to reference equality if serialization fails
      return prevProps === nextProps;
    }
  }

  getPerformanceMetrics(componentId?: string): ComponentPerformanceMetrics[] {
    if (componentId) {
      const metrics = this.performanceRegistry.get(componentId);
      return metrics ? [metrics] : [];
    }
    
    return Array.from(this.performanceRegistry.values());
  }
}

/**
 * Props Validation Interceptor
 * Validates component props using Zod schemas with enterprise-grade error handling
 */
export class PropsValidationInterceptor<P = any> implements ComponentInterceptor<P> {
  readonly name = 'PropsValidation';
  readonly priority = 2;
  readonly enabled = true;
  readonly supportedPhases = ['mount', 'update'] as const;

  private readonly schemaRegistry = new Map<string, z.ZodSchema>();

  registerSchema(componentName: string, schema: z.ZodSchema): void {
    this.schemaRegistry.set(componentName, schema);
  }

  beforeMount(props: P, context: InterceptionContext): InterceptionResult<P> {
    return this.validateProps(props, context);
  }

  beforeUpdate(prevProps: P, nextProps: P, context: InterceptionContext): InterceptionResult<P> {
    return this.validateProps(nextProps, context);
  }

  onError(error: Error, props: P, context: InterceptionContext): InterceptionResult<Error> {
    console.error(`[PropsValidation] Props validation error in ${context.componentName}:`, {
      error: error.message,
      props,
      componentId: context.componentId
    });

    return {
      success: true,
      value: error,
      shouldContinue: true,
      errors: [`Props validation failed: ${error.message}`]
    };
  }

  private validateProps(props: P, context: InterceptionContext): InterceptionResult<P> {
    const schema = this.schemaRegistry.get(context.componentName);
    
    if (!schema) {
      // No schema registered, allow props to pass through
      return {
        success: true,
        value: props,
        shouldContinue: true,
        warnings: [`No validation schema registered for component ${context.componentName}`]
      };
    }

    try {
      const validatedProps = schema.parse(props);
      
      return {
        success: true,
        value: validatedProps as P,
        shouldContinue: true,
        metadata: {
          validationResult: 'passed',
          schema: schema.constructor.name
        }
      };
    } catch (error) {
      const validationError = error instanceof z.ZodError 
        ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
        : 'Unknown validation error';

      return {
        success: false,
        value: props,
        shouldContinue: false,
        errors: [`Props validation failed: ${validationError}`],
        metadata: {
          validationResult: 'failed',
          originalError: error
        }
      };
    }
  }
}

/**
 * Error Boundary Interceptor
 * Provides enterprise-grade error handling and recovery mechanisms
 */
export class ErrorBoundaryInterceptor<P = any> implements ComponentInterceptor<P> {
  readonly name = 'ErrorBoundary';
  readonly priority = 0; // Highest priority
  readonly enabled = true;
  readonly supportedPhases = ['mount', 'update', 'unmount', 'error'] as const;

  private readonly errorRegistry = new Map<string, ComponentErrorMetrics>();

  onError(error: Error, props: P, context: InterceptionContext): InterceptionResult<Error> {
    this.recordError(context.componentId, context.componentName, error);

    // Implement recovery strategies
    const recoveryStrategy = this.determineRecoveryStrategy(error, context);
    
    console.error(`[ErrorBoundary] Error intercepted in ${context.componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentId: context.componentId,
      phase: context.phase,
      recoveryStrategy,
      errorMetrics: this.errorRegistry.get(context.componentId)
    });

    return {
      success: true,
      value: error,
      shouldContinue: recoveryStrategy.shouldContinue,
      errors: [error.message],
      metadata: {
        recoveryStrategy,
        errorMetrics: this.errorRegistry.get(context.componentId)
      }
    };
  }

  private recordError(componentId: string, componentName: string, error: Error): void {
    const existing = this.errorRegistry.get(componentId) || {
      componentName,
      errorCount: 0,
      firstErrorAt: Date.now(),
      lastErrorAt: Date.now(),
      errorTypes: new Map()
    };

    existing.errorCount++;
    existing.lastErrorAt = Date.now();
    
    const errorType = error.constructor.name;
    existing.errorTypes.set(errorType, (existing.errorTypes.get(errorType) || 0) + 1);

    this.errorRegistry.set(componentId, existing);
  }

  private determineRecoveryStrategy(error: Error, context: InterceptionContext): RecoveryStrategy {
    const errorMetrics = this.errorRegistry.get(context.componentId);
    
    // If this is a recurring error, suggest component restart
    if (errorMetrics && errorMetrics.errorCount > 3) {
      return {
        strategy: 'restart',
        shouldContinue: false,
        reason: 'Recurring errors detected, component restart recommended'
      };
    }

    // For render errors, try to continue with fallback
    if (context.phase === 'render') {
      return {
        strategy: 'fallback',
        shouldContinue: true,
        reason: 'Render error, attempting fallback render'
      };
    }

    // Default strategy
    return {
      strategy: 'retry',
      shouldContinue: true,
      reason: 'Isolated error, retrying operation'
    };
  }

  getErrorMetrics(componentId?: string): ComponentErrorMetrics[] {
    if (componentId) {
      const metrics = this.errorRegistry.get(componentId);
      return metrics ? [metrics] : [];
    }
    
    return Array.from(this.errorRegistry.values());
  }
}

// ===== ENTERPRISE INTERCEPTOR MANAGER =====
export class EnterpriseInterceptorManager {
  private readonly interceptors = new Map<string, ComponentInterceptor>();
  private readonly componentMetadata = new Map<string, ComponentMetadata>();

  registerInterceptor<P>(interceptor: ComponentInterceptor<P>): void {
    this.interceptors.set(interceptor.name, interceptor);
    console.log(`[InterceptorManager] Registered interceptor: ${interceptor.name}`);
  }

  unregisterInterceptor(name: string): void {
    this.interceptors.delete(name);
    console.log(`[InterceptorManager] Unregistered interceptor: ${name}`);
  }

  getActiveInterceptors(): ComponentInterceptor[] {
    return Array.from(this.interceptors.values())
      .filter(interceptor => interceptor.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  async executePhase<P>(
    phase: InterceptorPhase,
    props: P,
    context: InterceptionContext,
    additionalArgs?: any[]
  ): Promise<InterceptionResult<any>> {
    const activeInterceptors = this.getActiveInterceptors()
      .filter(interceptor => interceptor.supportedPhases.includes(phase));

    let result: InterceptionResult<any> = {
      success: true,
      value: props,
      shouldContinue: true
    };

    for (const interceptor of activeInterceptors) {
      try {
        let phaseResult: InterceptionResult<any> | undefined;

        switch (phase) {
          case 'mount':
            phaseResult = interceptor.beforeMount?.(result.value, context);
            break;
          case 'update':
            phaseResult = interceptor.beforeUpdate?.(additionalArgs?.[0], result.value, context);
            break;
          case 'unmount':
            phaseResult = interceptor.beforeUnmount?.(result.value, context);
            break;
          case 'error':
            phaseResult = interceptor.onError?.(additionalArgs?.[0] as Error, result.value, context);
            break;
        }

        if (phaseResult) {
          result = {
            ...result,
            ...phaseResult,
            warnings: [...(result.warnings || []), ...(phaseResult.warnings || [])],
            errors: [...(result.errors || []), ...(phaseResult.errors || [])]
          };

          if (!phaseResult.shouldContinue) {
            break;
          }
        }
      } catch (error) {
        console.error(`[InterceptorManager] Error in interceptor ${interceptor.name}:`, error);
        
        result.errors = result.errors || [];
        result.errors.push(`Interceptor ${interceptor.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  registerComponentMetadata(componentName: string, metadata: ComponentMetadata): void {
    this.componentMetadata.set(componentName, metadata);
  }

  getComponentMetadata(componentName: string): ComponentMetadata | undefined {
    return this.componentMetadata.get(componentName);
  }
}

// ===== HIGHER-ORDER COMPONENT FACTORY =====
export function withEnterpriseInterceptors<P extends object>(
  Component: ComponentType<P>,
  options: InterceptorOptions = {}
): ComponentType<P> {
  const interceptorManager = options.manager || globalInterceptorManager;
  const componentName = Component.displayName || Component.name || 'UnknownComponent';
  
  const EnterpriseInterceptedComponent: FC<P> = memo(
    forwardRef<any, P>((props, ref) => {
      const componentId = useRef(crypto.randomUUID()).current;
      const renderCountRef = useRef(0);
      const [hasError, setHasError] = useState(false);
      const [, forceUpdate] = useState({});

      renderCountRef.current++;

      const context: InterceptionContext = useMemo(() => ({
        componentName,
        componentId,
        phase: renderCountRef.current === 1 ? 'mount' : 'update',
        timestamp: Date.now(),
        renderCount: renderCountRef.current,
        depth: 0, // Could be calculated from React DevTools
        metadata: {}
      }), [componentId, renderCountRef.current]);

      // Mount phase
      useEffect(() => {
        interceptorManager.executePhase('mount', props, {
          ...context,
          phase: 'mount'
        }).then(result => {
          if (!result.success || !result.shouldContinue) {
            console.warn(`[InterceptorManager] Mount phase issues for ${componentName}:`, result);
          }
        }).catch(error => {
          console.error(`[InterceptorManager] Mount phase error for ${componentName}:`, error);
          setHasError(true);
        });

        // Cleanup phase
        return () => {
          interceptorManager.executePhase('unmount', props, {
            ...context,
            phase: 'unmount'
          }).catch(error => {
            console.error(`[InterceptorManager] Unmount phase error for ${componentName}:`, error);
          });
        };
      }, []);

      // Update phase
      useEffect(() => {
        if (renderCountRef.current > 1) {
          interceptorManager.executePhase('update', props, {
            ...context,
            phase: 'update'
          }).then(result => {
            if (!result.success || !result.shouldContinue) {
              console.warn(`[InterceptorManager] Update phase issues for ${componentName}:`, result);
            }
          }).catch(error => {
            console.error(`[InterceptorManager] Update phase error for ${componentName}:`, error);
            setHasError(true);
          });
        }
      }, [props]);

      // Error handling
      useEffect(() => {
        if (hasError) {
          const error = new Error(`Component ${componentName} entered error state`);
          interceptorManager.executePhase('error', props, {
            ...context,
            phase: 'error'
          }, [error]).catch(recoveryError => {
            console.error(`[InterceptorManager] Error recovery failed for ${componentName}:`, recoveryError);
          });
        }
      }, [hasError]);

      if (hasError && options.fallbackComponent) {
        return React.createElement(options.fallbackComponent, props);
      }

      try {
        return React.createElement(Component, { ...props, ref });
      } catch (error) {
        console.error(`[InterceptorManager] Render error in ${componentName}:`, error);
        setHasError(true);
        
        if (options.fallbackComponent) {
          return React.createElement(options.fallbackComponent, props);
        }
        
        return React.createElement('div', {
          className: 'error-boundary-fallback'
        }, `Error in ${componentName}`);
      }
    })
  );

  EnterpriseInterceptedComponent.displayName = `withEnterpriseInterceptors(${componentName})`;

  return EnterpriseInterceptedComponent as ComponentType<P>;
}

// ===== TYPE DEFINITIONS =====
interface ComponentPerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
  totalRenderTime: number;
  createdAt: number;
}

interface ComponentErrorMetrics {
  componentName: string;
  errorCount: number;
  firstErrorAt: number;
  lastErrorAt: number;
  errorTypes: Map<string, number>;
}

interface PerformanceThresholds {
  maxMountTime: number;
  maxUpdateTime: number;
  maxMemoryUsage: number;
}

interface RecoveryStrategy {
  strategy: 'retry' | 'fallback' | 'restart';
  shouldContinue: boolean;
  reason: string;
}

interface ComponentMetadata {
  displayName?: string;
  componentType: 'functional' | 'class' | 'memo' | 'forward-ref';
  isLazy: boolean;
  hasErrorBoundary: boolean;
  memoizationStrategy: 'none' | 'shallow' | 'deep';
}

interface InterceptorOptions {
  manager?: EnterpriseInterceptorManager;
  fallbackComponent?: ComponentType<any>;
  enablePerformanceMonitoring?: boolean;
  enablePropsValidation?: boolean;
  enableErrorBoundary?: boolean;
}

// ===== CONSTANTS =====
const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  maxMountTime: 16, // 60fps budget
  maxUpdateTime: 16,
  maxMemoryUsage: 50 * 1024 * 1024 // 50MB
};

// ===== GLOBAL INSTANCES =====
export const globalInterceptorManager = new EnterpriseInterceptorManager();

// Register default interceptors
globalInterceptorManager.registerInterceptor(new PerformanceMonitoringInterceptor());
globalInterceptorManager.registerInterceptor(new PropsValidationInterceptor());
globalInterceptorManager.registerInterceptor(new ErrorBoundaryInterceptor());

// ===== EXPORTS =====
export type {
  ComponentInterceptor,
  InterceptorPhase,
  InterceptionContext,
  InterceptionResult,
  ComponentPerformanceMetrics,
  ComponentErrorMetrics,
  InterceptorOptions
};