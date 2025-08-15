/**
 * Filter Chip Component
 * Individual filter chip component with comprehensive accessibility and enterprise-grade patterns
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { useCallback, useMemo } from 'react';

// ===== COMPONENT INTERFACES =====

/**
 * Filter chip props interface
 */
export interface FilterChipProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly isSelected?: boolean;
  readonly count?: number;
  readonly disabled?: boolean;
  readonly removable?: boolean;
  readonly variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  readonly size?: 'small' | 'medium' | 'large';
  readonly className?: string;
  readonly onToggle?: (value: string, isSelected: boolean) => void;
  readonly onRemove?: (value: string) => void;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

/**
 * Filter chip group props interface
 */
export interface FilterChipGroupProps {
  readonly id: string;
  readonly label?: string;
  readonly chips: readonly FilterChipProps[];
  readonly layout?: 'horizontal' | 'vertical' | 'grid';
  readonly maxChips?: number;
  readonly showMoreButton?: boolean;
  readonly showCount?: boolean;
  readonly className?: string;
  readonly onChipToggle?: (value: string, isSelected: boolean) => void;
  readonly onChipRemove?: (value: string) => void;
  readonly onShowMore?: () => void;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

// ===== FILTER CHIP COMPONENT =====

/**
 * Enterprise-grade filter chip component
 * Provides individual filter chip functionality with accessibility and performance optimization
 */
export function FilterChip({
  id,
  label,
  value,
  isSelected = false,
  count,
  disabled = false,
  removable = false,
  variant = 'default',
  size = 'medium',
  className = '',
  onToggle,
  onRemove,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: FilterChipProps): JSX.Element {
  // ===== MEMOIZED VALUES =====

  const chipClassName = useMemo(() => {
    const baseClasses = [
      'filter-chip',
      'inline-flex',
      'items-center',
      'rounded-full',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
    ];

    // Size classes
    switch (size) {
      case 'small':
        baseClasses.push('px-2', 'py-1', 'text-xs');
        break;
      case 'large':
        baseClasses.push('px-4', 'py-2', 'text-base');
        break;
      default: // medium
        baseClasses.push('px-3', 'py-1.5', 'text-sm');
    }

    // Variant classes
    switch (variant) {
      case 'primary':
        if (isSelected) {
          baseClasses.push('bg-blue-100', 'text-blue-800', 'border', 'border-blue-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
        break;
      case 'secondary':
        if (isSelected) {
          baseClasses.push('bg-purple-100', 'text-purple-800', 'border', 'border-purple-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
        break;
      case 'success':
        if (isSelected) {
          baseClasses.push('bg-green-100', 'text-green-800', 'border', 'border-green-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
        break;
      case 'warning':
        if (isSelected) {
          baseClasses.push('bg-yellow-100', 'text-yellow-800', 'border', 'border-yellow-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
        break;
      case 'error':
        if (isSelected) {
          baseClasses.push('bg-red-100', 'text-red-800', 'border', 'border-red-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
        break;
      default: // default
        if (isSelected) {
          baseClasses.push('bg-blue-100', 'text-blue-800', 'border', 'border-blue-200');
        } else {
          baseClasses.push('bg-gray-100', 'text-gray-700', 'border', 'border-gray-200', 'hover:bg-gray-200');
        }
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
  }, [isSelected, variant, size, disabled, className]);

  const removeButtonClassName = useMemo(() => {
    return [
      'filter-chip-remove',
      'ml-1',
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'text-gray-400',
      'hover:text-gray-600',
      'focus:outline-none',
      'focus:text-gray-600',
      'transition-colors',
      'duration-150',
    ].join(' ');
  }, []);

  // ===== CALLBACK FUNCTIONS =====

  const handleClick = useCallback(() => {
    if (disabled || !onToggle) return;
    onToggle(value, !isSelected);
  }, [disabled, onToggle, value, isSelected]);

  const handleRemove = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled || !onRemove) return;
    onRemove(value);
  }, [disabled, onRemove, value]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick();
        break;
      case 'Delete':
      case 'Backspace':
        if (removable && onRemove) {
          event.preventDefault();
          onRemove(value);
        }
        break;
    }
  }, [disabled, handleClick, removable, onRemove, value]);

  // ===== ACCESSIBILITY ATTRIBUTES =====

  const chipAttributes = useMemo(() => ({
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    'aria-pressed': isSelected,
    'aria-disabled': disabled,
    'aria-label': ariaLabel || `${isSelected ? 'Remove' : 'Add'} filter: ${label}`,
    'aria-describedby': ariaDescribedby,
  }), [disabled, isSelected, ariaLabel, ariaDescribedby, label]);

  const removeButtonAttributes = useMemo(() => ({
    'aria-label': `Remove ${label} filter`,
    'aria-describedby': ariaDescribedby,
  }), [label, ariaDescribedby]);

  // ===== RENDER FUNCTIONS =====

  const renderCount = useCallback(() => {
    if (count === undefined) return null;

    return (
      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
        {count}
      </span>
    );
  }, [count]);

  const renderRemoveButton = useCallback(() => {
    if (!removable) return null;

    return (
      <button
        type="button"
        className={removeButtonClassName}
        onClick={handleRemove}
        disabled={disabled}
        {...removeButtonAttributes}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
  }, [removable, removeButtonClassName, handleRemove, disabled, removeButtonAttributes]);

  // ===== MAIN RENDER =====

  return (
    <div
      id={id}
      className={chipClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...chipAttributes}
    >
      <span className="truncate">{label}</span>
      {renderCount()}
      {renderRemoveButton()}
    </div>
  );
}

// ===== FILTER CHIP GROUP COMPONENT =====

/**
 * Filter chip group component for organizing multiple filter chips
 */
export function FilterChipGroup({
  id,
  label,
  chips,
  layout = 'horizontal',
  maxChips,
  showMoreButton = false,
  showCount = true,
  className = '',
  onChipToggle,
  onChipRemove,
  onShowMore,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: FilterChipGroupProps): JSX.Element {
  // ===== MEMOIZED VALUES =====

  const visibleChips = useMemo(() => {
    if (maxChips && chips.length > maxChips) {
      return chips.slice(0, maxChips);
    }
    return chips;
  }, [chips, maxChips]);

  const hiddenChipsCount = useMemo(() => {
    if (maxChips && chips.length > maxChips) {
      return chips.length - maxChips;
    }
    return 0;
  }, [chips, maxChips]);

  const containerClassName = useMemo(() => {
    const baseClasses = ['filter-chip-group'];

    switch (layout) {
      case 'vertical':
        baseClasses.push('flex', 'flex-col', 'space-y-2');
        break;
      case 'grid':
        baseClasses.push('grid', 'grid-cols-2', 'gap-2', 'sm:grid-cols-3', 'md:grid-cols-4');
        break;
      default: // horizontal
        baseClasses.push('flex', 'flex-wrap', 'gap-2');
    }

    if (className) {
      baseClasses.push(className);
    }

    return baseClasses.join(' ');
  }, [layout, className]);

  const groupAttributes = useMemo(() => ({
    role: 'group',
    'aria-label': ariaLabel || label || 'Filter options',
    'aria-describedby': ariaDescribedby,
  }), [ariaLabel, ariaDescribedby, label]);

  // ===== CALLBACK FUNCTIONS =====

  const handleChipToggle = useCallback((value: string, isSelected: boolean) => {
    if (onChipToggle) {
      onChipToggle(value, isSelected);
    }
  }, [onChipToggle]);

  const handleChipRemove = useCallback((value: string) => {
    if (onChipRemove) {
      onChipRemove(value);
    }
  }, [onChipRemove]);

  const handleShowMore = useCallback(() => {
    if (onShowMore) {
      onShowMore();
    }
  }, [onShowMore]);

  // ===== RENDER FUNCTIONS =====

  const renderChips = useCallback(() => (
    <>
      {visibleChips.map((chip) => (
        <FilterChip
          key={chip.id}
          {...chip}
          onToggle={handleChipToggle}
          onRemove={handleChipRemove}
        />
      ))}
      
      {showMoreButton && hiddenChipsCount > 0 && (
        <button
          type="button"
          onClick={handleShowMore}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          +{hiddenChipsCount} more
        </button>
      )}
    </>
  ), [visibleChips, hiddenChipsCount, showMoreButton, handleChipToggle, handleChipRemove, handleShowMore]);

  const renderCount = useCallback(() => {
    if (!showCount || chips.length === 0) return null;

    return (
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
        <span className="text-xs text-gray-500">
          {chips.length} {chips.length === 1 ? 'option' : 'options'}
        </span>
      </div>
    );
  }, [showCount, chips.length, label]);

  // ===== MAIN RENDER =====

  return (
    <div id={id} className={containerClassName} {...groupAttributes}>
      {renderCount()}
      {renderChips()}
    </div>
  );
}

// ===== EXPORTS =====

export { FilterChip, FilterChipGroup };
export type { FilterChipProps, FilterChipGroupProps }; 