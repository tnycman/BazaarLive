/**
 * Unified Filter Sidebar Component
 * Enterprise-grade filter sidebar with unified state management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useUnifiedFilterState } from '@/hooks/useUnifiedFilterState';
import { useUnifiedFilterActions } from '@/hooks/useUnifiedFilterActions';
import type { UnifiedFilterState } from '@/services/filtering/UnifiedFilterStateManager';

// ===== COMPONENT INTERFACES =====

/**
 * Unified filter sidebar props interface
 */
export interface UnifiedFilterSidebarProps {
  readonly isOpen?: boolean;
  readonly onToggle?: (isOpen: boolean) => void;
  readonly className?: string;
  readonly title?: string;
  readonly showClearButton?: boolean;
  readonly showAppliedCount?: boolean;
  readonly showPerformanceMetrics?: boolean;
  readonly showAnalytics?: boolean;
  readonly enableURLSync?: boolean;
  readonly enableValidation?: boolean;
  readonly enablePerformanceMonitoring?: boolean;
  readonly enableAnalytics?: boolean;
  readonly onError?: (error: Error) => void;
  readonly onStateChange?: (state: UnifiedFilterState) => void;
  readonly children?: React.ReactNode;
}

/**
 * Unified filter section props interface
 */
export interface UnifiedFilterSectionProps {
  readonly id: string;
  readonly title: string;
  readonly isExpanded?: boolean;
  readonly onToggle?: (isExpanded: boolean) => void;
  readonly className?: string;
  readonly children: React.ReactNode;
}

/**
 * Unified filter option props interface
 */
export interface UnifiedFilterOptionProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly isSelected?: boolean;
  readonly count?: number;
  readonly disabled?: boolean;
  readonly onToggle?: (value: string, isSelected: boolean) => void;
  readonly className?: string;
}

// ===== UNIFIED FILTER SIDEBAR COMPONENT =====

/**
 * Enterprise-grade unified filter sidebar component
 * Provides comprehensive filter management with accessibility and performance optimization
 */
export function UnifiedFilterSidebar({
  isOpen = true,
  onToggle,
  className = '',
  title = 'Filters',
  showClearButton = true,
  showAppliedCount = true,
  showPerformanceMetrics = false,
  showAnalytics = false,
  enableURLSync = true,
  enableValidation = true,
  enablePerformanceMonitoring = true,
  enableAnalytics = true,
  onError,
  onStateChange,
  children,
}: UnifiedFilterSidebarProps): JSX.Element {
  // ===== HOOKS =====

  const {
    state,
    updateState,
    clearFilters,
    hasAppliedFilters,
    appliedFiltersCount,
    isLoading,
    error,
    performanceMetrics,
    analyticsEvents,
    clearPerformanceMetrics,
    clearAnalyticsEvents,
  } = useUnifiedFilterState({
    enableURLSync,
    enableValidation,
    enablePerformanceMonitoring,
    enableAnalytics,
    onError,
    onStateChange,
  });

  const {
    toggleCategory,
    toggleBrand,
    toggleSize,
    toggleColor,
    togglePrice,
    toggleAvailability,
    toggleType,
    toggleExpandedSection,
  } = useUnifiedFilterActions({
    onError,
  });

  // ===== LOCAL STATE =====

  const [localIsOpen, setLocalIsOpen] = useState(isOpen);

  // ===== MEMOIZED VALUES =====

  const sidebarClassName = useMemo(() => {
    const baseClasses = [
      'unified-filter-sidebar',
      'bg-white',
      'border-r',
      'border-gray-200',
      'shadow-lg',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ];

    if (!localIsOpen) {
      baseClasses.push('w-0', 'opacity-0', 'overflow-hidden');
    } else {
      baseClasses.push('w-80', 'opacity-100');
    }

    if (className) {
      baseClasses.push(className);
    }

    return baseClasses.join(' ');
  }, [localIsOpen, className]);

  const headerClassName = useMemo(() => {
    return [
      'unified-filter-sidebar-header',
      'flex',
      'items-center',
      'justify-between',
      'p-4',
      'border-b',
      'border-gray-200',
      'bg-gray-50',
    ].join(' ');
  }, []);

  const contentClassName = useMemo(() => {
    return [
      'unified-filter-sidebar-content',
      'flex-1',
      'overflow-y-auto',
      'p-4',
      'space-y-4',
    ].join(' ');
  }, []);

  const footerClassName = useMemo(() => {
    return [
      'unified-filter-sidebar-footer',
      'p-4',
      'border-t',
      'border-gray-200',
      'bg-gray-50',
      'space-y-2',
    ].join(' ');
  }, []);

  // ===== CALLBACK FUNCTIONS =====

  const handleToggle = useCallback(() => {
    const newIsOpen = !localIsOpen;
    setLocalIsOpen(newIsOpen);
    
    if (onToggle) {
      onToggle(newIsOpen);
    }
  }, [localIsOpen, onToggle]);

  const handleClearFilters = useCallback(() => {
    try {
      clearFilters();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Clear filters error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [clearFilters, onError]);

  const handleClearMetrics = useCallback(() => {
    try {
      clearPerformanceMetrics();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Clear metrics error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [clearPerformanceMetrics, onError]);

  const handleClearAnalytics = useCallback(() => {
    try {
      clearAnalyticsEvents();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Clear analytics error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [clearAnalyticsEvents, onError]);

  // ===== ACCESSIBILITY ATTRIBUTES =====

  const sidebarAttributes = useMemo(() => ({
    role: 'complementary',
    'aria-label': title,
    'aria-expanded': localIsOpen,
    'aria-hidden': !localIsOpen,
  }), [title, localIsOpen]);

  const toggleButtonAttributes = useMemo(() => ({
    'aria-label': localIsOpen ? 'Close filters' : 'Open filters',
    'aria-expanded': localIsOpen,
    'aria-controls': 'unified-filter-sidebar-content',
  }), [localIsOpen]);

  const clearButtonAttributes = useMemo(() => ({
    'aria-label': 'Clear all filters',
    'aria-describedby': hasAppliedFilters ? 'applied-filters-count' : undefined,
  }), [hasAppliedFilters]);

  // ===== RENDER FUNCTIONS =====

  const renderHeader = useCallback(() => (
    <div className={headerClassName}>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleToggle}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          {...toggleButtonAttributes}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${localIsOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        
        {showAppliedCount && hasAppliedFilters && (
          <span
            id="applied-filters-count"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {appliedFiltersCount}
          </span>
        )}
      </div>
      
      {showClearButton && hasAppliedFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          disabled={isLoading}
          {...clearButtonAttributes}
        >
          Clear all
        </button>
      )}
    </div>
  ), [
    headerClassName,
    title,
    showAppliedCount,
    hasAppliedFilters,
    appliedFiltersCount,
    showClearButton,
    isLoading,
    localIsOpen,
    handleToggle,
    handleClearFilters,
    toggleButtonAttributes,
    clearButtonAttributes,
  ]);

  const renderContent = useCallback(() => (
    <div className={contentClassName}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
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
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error.message}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="animate-spin h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-blue-700">
                Updating filters...
              </div>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  ), [
    contentClassName,
    error,
    isLoading,
    children,
  ]);

  const renderFooter = useCallback(() => (
    <div className={footerClassName}>
      {showPerformanceMetrics && performanceMetrics.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Performance Metrics
            </span>
            <button
              type="button"
              onClick={handleClearMetrics}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            {performanceMetrics.slice(-3).map((metric, index) => (
              <div key={index} className="flex justify-between">
                <span>Update Time:</span>
                <span>{metric.updateTime.toFixed(2)}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showAnalytics && analyticsEvents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Analytics Events
            </span>
            <button
              type="button"
              onClick={handleClearAnalytics}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            {analyticsEvents.slice(-3).map((event, index) => (
              <div key={index} className="flex justify-between">
                <span>{event.eventType}:</span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ), [
    footerClassName,
    showPerformanceMetrics,
    performanceMetrics,
    showAnalytics,
    analyticsEvents,
    handleClearMetrics,
    handleClearAnalytics,
  ]);

  // ===== MAIN RENDER =====

  return (
    <aside className={sidebarClassName} {...sidebarAttributes}>
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </aside>
  );
}

// ===== UNIFIED FILTER SECTION COMPONENT =====

/**
 * Unified filter section component for organizing filter options
 */
export function UnifiedFilterSection({
  id,
  title,
  isExpanded = true,
  onToggle,
  className = '',
  children,
}: UnifiedFilterSectionProps): JSX.Element {
  const [localIsExpanded, setLocalIsExpanded] = useState(isExpanded);

  const handleToggle = useCallback(() => {
    const newIsExpanded = !localIsExpanded;
    setLocalIsExpanded(newIsExpanded);
    
    if (onToggle) {
      onToggle(newIsExpanded);
    }
  }, [localIsExpanded, onToggle]);

  const sectionClassName = useMemo(() => {
    return [
      'unified-filter-section',
      'border',
      'border-gray-200',
      'rounded-lg',
      'overflow-hidden',
      className,
    ].join(' ');
  }, [className]);

  const headerClassName = useMemo(() => {
    return [
      'unified-filter-section-header',
      'px-4',
      'py-3',
      'bg-gray-50',
      'border-b',
      'border-gray-200',
      'cursor-pointer',
      'hover:bg-gray-100',
      'transition-colors',
      'duration-200',
    ].join(' ');
  }, []);

  const contentClassName = useMemo(() => {
    return [
      'unified-filter-section-content',
      'p-4',
      'space-y-2',
      'transition-all',
      'duration-200',
      localIsExpanded ? 'block' : 'hidden',
    ].join(' ');
  }, [localIsExpanded]);

  return (
    <div className={sectionClassName}>
      <button
        type="button"
        className={headerClassName}
        onClick={handleToggle}
        aria-expanded={localIsExpanded}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              localIsExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      
      <div id={`${id}-content`} className={contentClassName}>
        {children}
      </div>
    </div>
  );
}

// ===== UNIFIED FILTER OPTION COMPONENT =====

/**
 * Individual unified filter option component
 */
export function UnifiedFilterOption({
  id,
  label,
  value,
  isSelected = false,
  count,
  disabled = false,
  onToggle,
  className = '',
}: UnifiedFilterOptionProps): JSX.Element {
  const handleToggle = useCallback(() => {
    if (disabled || !onToggle) return;
    onToggle(value, !isSelected);
  }, [disabled, onToggle, value, isSelected]);

  const optionClassName = useMemo(() => {
    const baseClasses = [
      'unified-filter-option',
      'flex',
      'items-center',
      'justify-between',
      'w-full',
      'px-3',
      'py-2',
      'text-left',
      'text-sm',
      'rounded-md',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',
    ];

    if (isSelected) {
      baseClasses.push('bg-blue-50', 'text-blue-900', 'border', 'border-blue-200');
    } else {
      baseClasses.push('text-gray-700', 'hover:bg-gray-50');
    }

    if (disabled) {
      baseClasses.push('opacity-50', 'cursor-not-allowed');
    } else {
      baseClasses.push('cursor-pointer');
    }

    if (className) {
      baseClasses.push(className);
    }

    return baseClasses.join(' ');
  }, [isSelected, disabled, className]);

  return (
    <button
      type="button"
      className={optionClassName}
      onClick={handleToggle}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-describedby={count ? `${id}-count` : undefined}
    >
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            disabled={disabled}
            className="sr-only"
            aria-hidden="true"
          />
          <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
            {isSelected && (
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        
        <span className="flex-1">{label}</span>
      </div>
      
      {count !== undefined && (
        <span
          id={`${id}-count`}
          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ===== EXPORTS =====

export { UnifiedFilterSidebar, UnifiedFilterSection, UnifiedFilterOption };
export type { UnifiedFilterSidebarProps, UnifiedFilterSectionProps, UnifiedFilterOptionProps }; 