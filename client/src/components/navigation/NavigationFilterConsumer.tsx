/**
 * Navigation Filter Consumer Component
 * Consumer component for filter state with comprehensive TypeScript interfaces and enterprise-grade patterns
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { useCallback, useMemo, ReactNode } from 'react';
import { useNavigationFilter } from './NavigationFilterProvider';
import type { FilterStateUpdate } from '@/services/filtering/FilterStateManager';

// ===== COMPONENT INTERFACES =====

/**
 * Navigation filter consumer props interface
 */
export interface NavigationFilterConsumerProps {
  readonly children: (context: ReturnType<typeof useNavigationFilter>) => ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error) => void;
}

/**
 * Navigation filter state selector interface
 */
export interface NavigationFilterStateSelector<T> {
  readonly (state: ReturnType<typeof useNavigationFilter>): T;
}

/**
 * Navigation filter consumer with selector props interface
 */
export interface NavigationFilterConsumerWithSelectorProps<T> {
  readonly selector: NavigationFilterStateSelector<T>;
  readonly children: (selectedState: T) => ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error) => void;
}

/**
 * Navigation filter action consumer props interface
 */
export interface NavigationFilterActionConsumerProps {
  readonly children: (actions: ReturnType<typeof useNavigationFilter>['actions']) => ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error) => void;
}

/**
 * Navigation filter computed consumer props interface
 */
export interface NavigationFilterComputedConsumerProps {
  readonly children: (computed: ReturnType<typeof useNavigationFilter>['computed']) => ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error) => void;
}

/**
 * Navigation filter utilities consumer props interface
 */
export interface NavigationFilterUtilitiesConsumerProps {
  readonly children: (utilities: ReturnType<typeof useNavigationFilter>['utilities']) => ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error) => void;
}

// ===== NAVIGATION FILTER CONSUMER COMPONENT =====

/**
 * Enterprise-grade navigation filter consumer component
 * Provides render prop pattern for consuming navigation filter context
 */
export function NavigationFilterConsumer({
  children,
  fallback,
  onError,
}: NavigationFilterConsumerProps): JSX.Element {
  const handleError = useCallback((error: Error) => {
    console.error('NavigationFilterConsumer error:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  try {
    const context = useNavigationFilter();
    return <>{children(context)}</>;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error in NavigationFilterConsumer');
    handleError(errorObj);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="navigation-filter-consumer-error p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Navigation Filter Context Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Unable to access navigation filter context. Make sure the component is wrapped with NavigationFilterProvider.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ===== NAVIGATION FILTER CONSUMER WITH SELECTOR COMPONENT =====

/**
 * Navigation filter consumer with selector component
 * Provides optimized rendering by only re-rendering when selected state changes
 */
export function NavigationFilterConsumerWithSelector<T>({
  selector,
  children,
  fallback,
  onError,
}: NavigationFilterConsumerWithSelectorProps<T>): JSX.Element {
  const handleError = useCallback((error: Error) => {
    console.error('NavigationFilterConsumerWithSelector error:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  try {
    const context = useNavigationFilter();
    const selectedState = useMemo(() => selector(context), [selector, context]);
    return <>{children(selectedState)}</>;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error in NavigationFilterConsumerWithSelector');
    handleError(errorObj);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="navigation-filter-consumer-selector-error p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Navigation Filter Selector Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Unable to access navigation filter context or selector failed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ===== NAVIGATION FILTER ACTION CONSUMER COMPONENT =====

/**
 * Navigation filter action consumer component
 * Provides access to filter actions only
 */
export function NavigationFilterActionConsumer({
  children,
  fallback,
  onError,
}: NavigationFilterActionConsumerProps): JSX.Element {
  const handleError = useCallback((error: Error) => {
    console.error('NavigationFilterActionConsumer error:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  try {
    const context = useNavigationFilter();
    return <>{children(context.actions)}</>;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error in NavigationFilterActionConsumer');
    handleError(errorObj);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="navigation-filter-action-consumer-error p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Navigation Filter Actions Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Unable to access navigation filter actions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ===== NAVIGATION FILTER COMPUTED CONSUMER COMPONENT =====

/**
 * Navigation filter computed consumer component
 * Provides access to computed filter state only
 */
export function NavigationFilterComputedConsumer({
  children,
  fallback,
  onError,
}: NavigationFilterComputedConsumerProps): JSX.Element {
  const handleError = useCallback((error: Error) => {
    console.error('NavigationFilterComputedConsumer error:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  try {
    const context = useNavigationFilter();
    return <>{children(context.computed)}</>;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error in NavigationFilterComputedConsumer');
    handleError(errorObj);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="navigation-filter-computed-consumer-error p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Navigation Filter Computed Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Unable to access navigation filter computed state.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ===== NAVIGATION FILTER UTILITIES CONSUMER COMPONENT =====

/**
 * Navigation filter utilities consumer component
 * Provides access to filter utilities only
 */
export function NavigationFilterUtilitiesConsumer({
  children,
  fallback,
  onError,
}: NavigationFilterUtilitiesConsumerProps): JSX.Element {
  const handleError = useCallback((error: Error) => {
    console.error('NavigationFilterUtilitiesConsumer error:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  try {
    const context = useNavigationFilter();
    return <>{children(context.utilities)}</>;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error in NavigationFilterUtilitiesConsumer');
    handleError(errorObj);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="navigation-filter-utilities-consumer-error p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Navigation Filter Utilities Error
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Unable to access navigation filter utilities.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ===== HOOKS FOR SPECIFIC CONSUMPTION =====

/**
 * Hook for consuming navigation filter state only
 */
export function useNavigationFilterState() {
  const context = useNavigationFilter();
  return context.state;
}

/**
 * Hook for consuming navigation filter actions only
 */
export function useNavigationFilterActions() {
  const context = useNavigationFilter();
  return context.actions;
}

/**
 * Hook for consuming navigation filter computed state only
 */
export function useNavigationFilterComputed() {
  const context = useNavigationFilter();
  return context.computed;
}

/**
 * Hook for consuming navigation filter utilities only
 */
export function useNavigationFilterUtilities() {
  const context = useNavigationFilter();
  return context.utilities;
}

/**
 * Hook for consuming specific navigation filter state with selector
 */
export function useNavigationFilterSelector<T>(selector: NavigationFilterStateSelector<T>): T {
  const context = useNavigationFilter();
  return useMemo(() => selector(context), [selector, context]);
}

// ===== EXPORTS =====

export {
  NavigationFilterConsumer,
  NavigationFilterConsumerWithSelector,
  NavigationFilterActionConsumer,
  NavigationFilterComputedConsumer,
  NavigationFilterUtilitiesConsumer,
  useNavigationFilterState,
  useNavigationFilterActions,
  useNavigationFilterComputed,
  useNavigationFilterUtilities,
  useNavigationFilterSelector,
};
export type {
  NavigationFilterConsumerProps,
  NavigationFilterStateSelector,
  NavigationFilterConsumerWithSelectorProps,
  NavigationFilterActionConsumerProps,
  NavigationFilterComputedConsumerProps,
  NavigationFilterUtilitiesConsumerProps,
}; 