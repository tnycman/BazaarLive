/**
 * Navigation Filter Provider Component
 * Context provider for navigation filters with comprehensive error boundaries and enterprise-grade patterns
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useFilterState } from '@/hooks/useFilterState';
import { useFilterActions } from '@/hooks/useFilterActions';
import type { FilterState, FilterStateUpdate } from '@/services/filtering/FilterStateManager';

// ===== CONTEXT INTERFACES =====

/**
 * Navigation filter context value interface
 */
export interface NavigationFilterContextValue {
  readonly state: FilterState;
  readonly actions: {
    readonly updateState: (updates: FilterStateUpdate) => void;
    readonly clearFilters: () => void;
    readonly updateCategories: (categories: readonly string[]) => void;
    readonly updateBrands: (brands: readonly string[]) => void;
    readonly updateSizes: (sizes: readonly string[]) => void;
    readonly updateColors: (colors: readonly string[]) => void;
    readonly updatePrices: (prices: readonly string[]) => void;
    readonly updateAvailability: (availability: readonly string[]) => void;
    readonly updateTypes: (types: readonly string[]) => void;
    readonly updateBrandSearch: (query: string) => void;
    readonly updateSearchQuery: (query: string) => void;
    readonly updateSortBy: (sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating') => void;
    readonly updateViewMode: (viewMode: 'grid' | 'list') => void;
    readonly updatePage: (page: number) => void;
    readonly updateItemsPerPage: (itemsPerPage: number) => void;
    readonly updatePriceRange: (min?: number, max?: number) => void;
    readonly toggleCategory: (category: string) => void;
    readonly toggleBrand: (brand: string) => void;
    readonly toggleSize: (size: string) => void;
    readonly toggleColor: (color: string) => void;
    readonly togglePrice: (price: string) => void;
    readonly toggleAvailability: (availability: string) => void;
    readonly toggleType: (type: string) => void;
    readonly toggleExpandedSection: (section: string) => void;
    readonly batchUpdate: (updates: readonly FilterStateUpdate[]) => void;
    readonly resetToDefaults: () => void;
    readonly applyPreset: (preset: FilterStateUpdate) => void;
  };
  readonly computed: {
    readonly hasAppliedFilters: boolean;
    readonly appliedFiltersCount: number;
    readonly isLoading: boolean;
    readonly error: Error | null;
    readonly performanceMetrics: readonly FilterStatePerformanceMetrics[];
    readonly analyticsEvents: readonly FilterStateAnalyticsEvent[];
  };
  readonly utilities: {
    readonly clearPerformanceMetrics: () => void;
    readonly clearAnalyticsEvents: () => void;
    readonly setURLSyncEnabled: (enabled: boolean) => void;
    readonly validateState: (state: unknown) => FilterStateValidationResult;
    readonly validateUpdate: (update: unknown) => FilterStateValidationResult;
  };
}

/**
 * Filter state performance metrics interface
 */
export interface FilterStatePerformanceMetrics {
  readonly updateTime: number;
  readonly validationTime: number;
  readonly urlSyncTime: number;
  readonly subscriberNotificationTime: number;
  readonly cacheHit: boolean;
  readonly timestamp: number;
}

/**
 * Filter state analytics event interface
 */
export interface FilterStateAnalyticsEvent {
  readonly eventType: 'state_update' | 'validation_error' | 'url_sync' | 'subscriber_notification';
  readonly stateSnapshot: Partial<FilterState>;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Filter state validation result interface
 */
export interface FilterStateValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly sanitizedState?: FilterState;
}

/**
 * Navigation filter provider props interface
 */
export interface NavigationFilterProviderProps {
  readonly children: ReactNode;
  readonly subscriberId?: string;
  readonly priority?: number;
  readonly enableURLSync?: boolean;
  readonly enableValidation?: boolean;
  readonly enablePerformanceMonitoring?: boolean;
  readonly enableAnalytics?: boolean;
  readonly onError?: (error: Error) => void;
  readonly onStateChange?: (state: FilterState) => void;
  readonly debounceDelay?: number;
  readonly enableOptimisticUpdates?: boolean;
  readonly enableBatchUpdates?: boolean;
  readonly maxBatchSize?: number;
}

// ===== CONTEXT CREATION =====

/**
 * Navigation filter context
 */
const NavigationFilterContext = createContext<NavigationFilterContextValue | null>(null);

// ===== ERROR BOUNDARY COMPONENT =====

/**
 * Navigation filter error boundary component
 */
class NavigationFilterErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('NavigationFilterErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="navigation-filter-error-boundary p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Navigation Filter Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>An error occurred while managing navigation filters.</p>
                {this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===== NAVIGATION FILTER PROVIDER COMPONENT =====

/**
 * Enterprise-grade navigation filter provider component
 * Provides comprehensive filter state management with error boundaries and performance optimization
 */
export function NavigationFilterProvider({
  children,
  subscriberId,
  priority = 0,
  enableURLSync = true,
  enableValidation = true,
  enablePerformanceMonitoring = true,
  enableAnalytics = true,
  onError,
  onStateChange,
  debounceDelay = 300,
  enableOptimisticUpdates = true,
  enableBatchUpdates = true,
  maxBatchSize = 10,
}: NavigationFilterProviderProps): JSX.Element {
  // ===== HOOKS =====

  const filterState = useFilterState({
    subscriberId,
    priority,
    enableURLSync,
    enableValidation,
    enablePerformanceMonitoring,
    enableAnalytics,
    onError,
    onStateChange,
  });

  const filterActions = useFilterActions({
    debounceDelay,
    enableOptimisticUpdates,
    enableBatchUpdates,
    maxBatchSize,
    onError,
  });

  // ===== CONTEXT VALUE =====

  const contextValue = useMemo((): NavigationFilterContextValue => {
    return {
      state: filterState.state,
      actions: {
        updateState: filterState.updateState,
        clearFilters: filterState.clearFilters,
        updateCategories: filterActions.updateCategories,
        updateBrands: filterActions.updateBrands,
        updateSizes: filterActions.updateSizes,
        updateColors: filterActions.updateColors,
        updatePrices: filterActions.updatePrices,
        updateAvailability: filterActions.updateAvailability,
        updateTypes: filterActions.updateTypes,
        updateBrandSearch: filterActions.updateBrandSearch,
        updateSearchQuery: filterActions.updateSearchQuery,
        updateSortBy: filterActions.updateSortBy,
        updateViewMode: filterActions.updateViewMode,
        updatePage: filterActions.updatePage,
        updateItemsPerPage: filterActions.updateItemsPerPage,
        updatePriceRange: filterActions.updatePriceRange,
        toggleCategory: filterActions.toggleCategory,
        toggleBrand: filterActions.toggleBrand,
        toggleSize: filterActions.toggleSize,
        toggleColor: filterActions.toggleColor,
        togglePrice: filterActions.togglePrice,
        toggleAvailability: filterActions.toggleAvailability,
        toggleType: filterActions.toggleType,
        toggleExpandedSection: filterActions.toggleExpandedSection,
        batchUpdate: filterActions.batchUpdate,
        resetToDefaults: filterActions.resetToDefaults,
        applyPreset: filterActions.applyPreset,
      },
      computed: {
        hasAppliedFilters: filterState.hasAppliedFilters,
        appliedFiltersCount: filterState.appliedFiltersCount,
        isLoading: filterState.isLoading,
        error: filterState.error,
        performanceMetrics: filterState.performanceMetrics,
        analyticsEvents: filterState.analyticsEvents,
      },
      utilities: {
        clearPerformanceMetrics: filterState.clearPerformanceMetrics,
        clearAnalyticsEvents: filterState.clearAnalyticsEvents,
        setURLSyncEnabled: filterState.setURLSyncEnabled,
        validateState: filterState.validateState,
        validateUpdate: filterState.validateUpdate,
      },
    };
  }, [filterState, filterActions]);

  // ===== ERROR HANDLER =====

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('NavigationFilterProvider error:', error, errorInfo);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // ===== MAIN RENDER =====

  return (
    <NavigationFilterErrorBoundary onError={handleError}>
      <NavigationFilterContext.Provider value={contextValue}>
        {children}
      </NavigationFilterContext.Provider>
    </NavigationFilterErrorBoundary>
  );
}

// ===== HOOK FOR CONSUMING CONTEXT =====

/**
 * Hook for consuming navigation filter context
 * Provides type-safe access to navigation filter state and actions
 */
export function useNavigationFilter(): NavigationFilterContextValue {
  const context = useContext(NavigationFilterContext);
  
  if (!context) {
    throw new Error(
      'useNavigationFilter must be used within a NavigationFilterProvider. ' +
      'Make sure you have wrapped your component tree with NavigationFilterProvider.'
    );
  }
  
  return context;
}

// ===== EXPORTS =====

export { NavigationFilterProvider, useNavigationFilter, NavigationFilterErrorBoundary };
export type { 
  NavigationFilterContextValue,
  NavigationFilterProviderProps,
  FilterStatePerformanceMetrics,
  FilterStateAnalyticsEvent,
  FilterStateValidationResult 
}; 