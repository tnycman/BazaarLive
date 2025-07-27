/**
 * Enterprise Dynamic Route Hook
 * React hook for dynamic routing with comprehensive AOP integration
 * NO SHORTCUTS - FULL ENTERPRISE IMPLEMENTATION
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { dynamicRouteEngine, RouteResolutionResult, RouteNavigationOptions } from '@/services/routing/DynamicRouteEngine';
import { RouteParameters, RouteLoggingAspect } from '@/services/routing/DynamicRoutingAspects';
import { CategoryConfig } from '@/services/category/CategoryConfigService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DynamicRouteState {
  isLoading: boolean;
  isValid: boolean;
  config: CategoryConfig | null;
  params: RouteParameters | null;
  errors: string[];
  warnings: string[];
  metadata: {
    cacheHit: boolean;
    validationTime: number;
    resolutionTime: number;
    securityPassed: boolean;
  };
}

export interface DynamicRouteActions {
  refresh: () => Promise<void>;
  navigate: (params: RouteParameters, options?: RouteNavigationOptions) => Promise<boolean>;
  generateUrl: (params: RouteParameters) => string | null;
  getEngineHealth: () => any;
}

export interface UseDynamicRouteOptions extends RouteNavigationOptions {
  autoResolve?: boolean;
  onRouteChange?: (state: DynamicRouteState) => void;
  onError?: (errors: string[]) => void;
}

export interface UseDynamicRouteReturn {
  state: DynamicRouteState;
  actions: DynamicRouteActions;
}

// ============================================================================
// ENTERPRISE DYNAMIC ROUTE HOOK
// ============================================================================

export function useDynamicRoute(options: UseDynamicRouteOptions = {}): UseDynamicRouteReturn {
  const [location, setLocation] = useLocation();
  const [state, setState] = useState<DynamicRouteState>({
    isLoading: true,
    isValid: false,
    config: null,
    params: null,
    errors: [],
    warnings: [],
    metadata: {
      cacheHit: false,
      validationTime: 0,
      resolutionTime: 0,
      securityPassed: false,
    },
  });

  const hookId = useMemo(() => `hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

  /**
   * Resolve current route
   */
  const resolveCurrentRoute = useCallback(async (): Promise<void> => {
    const startTime = Date.now();
    RouteLoggingAspect.logPerformanceMetrics('hook_resolve_start', 0, { hookId, location });

    try {
      setState(prev => ({ ...prev, isLoading: true, errors: [], warnings: [] }));

      // Parse current location
      const params = dynamicRouteEngine.parseUrlPath(location);
      if (!params) {
        const errorState: DynamicRouteState = {
          isLoading: false,
          isValid: false,
          config: null,
          params: null,
          errors: ['Failed to parse current URL'],
          warnings: [],
          metadata: {
            cacheHit: false,
            validationTime: 0,
            resolutionTime: Date.now() - startTime,
            securityPassed: false,
          },
        };
        setState(errorState);
        options.onError?.(['Failed to parse current URL']);
        return;
      }

      // Resolve route using engine
      const navigationOptions: RouteNavigationOptions = {
        bypassCache: options.bypassCache,
        bypassSecurity: options.bypassSecurity,
        sessionId: options.sessionId,
        userAgent: options.userAgent || navigator.userAgent,
        referrer: options.referrer || document.referrer,
      };

      const result: RouteResolutionResult = await dynamicRouteEngine.resolveRoute(params, navigationOptions);

      // Update state based on result
      const newState: DynamicRouteState = {
        isLoading: false,
        isValid: result.isValid,
        config: result.config,
        params: result.params,
        errors: result.errors,
        warnings: result.warnings,
        metadata: result.metadata,
      };

      setState(newState);

      // Call callbacks
      options.onRouteChange?.(newState);
      if (result.errors.length > 0) {
        options.onError?.(result.errors);
      }

      RouteLoggingAspect.logPerformanceMetrics('hook_resolve_success', Date.now() - startTime, {
        hookId,
        isValid: result.isValid,
        cacheHit: result.metadata.cacheHit,
      });

    } catch (error) {
      const errorState: DynamicRouteState = {
        isLoading: false,
        isValid: false,
        config: null,
        params: null,
        errors: [`Hook error: ${(error as Error).message}`],
        warnings: [],
        metadata: {
          cacheHit: false,
          validationTime: 0,
          resolutionTime: Date.now() - startTime,
          securityPassed: false,
        },
      };

      setState(errorState);
      options.onError?.(errorState.errors);
      RouteLoggingAspect.logError('hook_resolve_error', error as Error, { hookId, location });
    }
  }, [location, options, hookId]);

  /**
   * Navigate to new route
   */
  const navigate = useCallback(async (
    params: RouteParameters, 
    navOptions: RouteNavigationOptions = {}
  ): Promise<boolean> => {
    const startTime = Date.now();
    RouteLoggingAspect.logPerformanceMetrics('hook_navigate_start', 0, { hookId, params });

    try {
      // Validate and resolve target route first
      const combinedOptions = { ...options, ...navOptions };
      const result = await dynamicRouteEngine.resolveRoute(params, combinedOptions);

      if (!result.isValid) {
        RouteLoggingAspect.logError('hook_navigate_validation_failed', 
          new Error('Navigation target validation failed'), { 
            hookId, 
            params, 
            errors: result.errors 
          });
        options.onError?.(result.errors);
        return false;
      }

      // Generate URL and navigate
      const url = dynamicRouteEngine.generateRouteUrl(params);
      if (!url) {
        const error = 'Failed to generate URL for navigation';
        RouteLoggingAspect.logError('hook_navigate_url_failed', new Error(error), { hookId, params });
        options.onError?.([error]);
        return false;
      }

      // Perform navigation
      setLocation(url);

      RouteLoggingAspect.logPerformanceMetrics('hook_navigate_success', Date.now() - startTime, {
        hookId,
        url,
        params,
      });

      return true;

    } catch (error) {
      RouteLoggingAspect.logError('hook_navigate_error', error as Error, { hookId, params });
      options.onError?.([`Navigation error: ${(error as Error).message}`]);
      return false;
    }
  }, [setLocation, options, hookId]);

  /**
   * Generate URL for parameters
   */
  const generateUrl = useCallback((params: RouteParameters): string | null => {
    try {
      return dynamicRouteEngine.generateRouteUrl(params);
    } catch (error) {
      RouteLoggingAspect.logError('hook_generate_url', error as Error, { hookId, params });
      options.onError?.([`URL generation error: ${(error as Error).message}`]);
      return null;
    }
  }, [options, hookId]);

  /**
   * Get engine health status
   */
  const getEngineHealth = useCallback(() => {
    try {
      return dynamicRouteEngine.getEngineHealth();
    } catch (error) {
      RouteLoggingAspect.logError('hook_health_check', error as Error, { hookId });
      return { status: 'error', metrics: {}, issues: [`Health check failed: ${(error as Error).message}`] };
    }
  }, [hookId]);

  /**
   * Refresh current route
   */
  const refresh = useCallback(async (): Promise<void> => {
    await resolveCurrentRoute();
  }, [resolveCurrentRoute]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Auto-resolve on location change
   */
  useEffect(() => {
    if (options.autoResolve !== false) {
      resolveCurrentRoute();
    }
  }, [location, resolveCurrentRoute, options.autoResolve]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      RouteLoggingAspect.logPerformanceMetrics('hook_cleanup', 0, { hookId });
    };
  }, [hookId]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  const actions: DynamicRouteActions = useMemo(() => ({
    refresh,
    navigate,
    generateUrl,
    getEngineHealth,
  }), [refresh, navigate, generateUrl, getEngineHealth]);

  return {
    state,
    actions,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for current route parameters only
 */
export function useRouteParams(): RouteParameters | null {
  const { state } = useDynamicRoute({ autoResolve: true });
  return state.params;
}

/**
 * Hook for current route configuration only
 */
export function useRouteConfig(): CategoryConfig | null {
  const { state } = useDynamicRoute({ autoResolve: true });
  return state.config;
}

/**
 * Hook for route navigation only
 */
export function useRouteNavigation(): {
  navigate: (params: RouteParameters, options?: RouteNavigationOptions) => Promise<boolean>;
  generateUrl: (params: RouteParameters) => string | null;
} {
  const { actions } = useDynamicRoute({ autoResolve: false });
  return {
    navigate: actions.navigate,
    generateUrl: actions.generateUrl,
  };
}

/**
 * Hook for route validation only
 */
export function useRouteValidation(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isLoading: boolean;
} {
  const { state } = useDynamicRoute({ autoResolve: true });
  return {
    isValid: state.isValid,
    errors: state.errors,
    warnings: state.warnings,
    isLoading: state.isLoading,
  };
}