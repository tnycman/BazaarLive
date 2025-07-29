/**
 * Enterprise Grid Header Component
 * AOP-compliant header for product grids with title, item count, and sorting
 * 100% enterprise architecture compliance, zero shortcuts
 */

import React, { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

// ===== ENTERPRISE INTERFACES =====
interface GridHeaderProps {
  readonly title: string;
  readonly itemCount: number;
  readonly sortBy: string;
  readonly onSortChange: (sortBy: string) => void;
  readonly sortOptions: readonly SortOption[];
  readonly className?: string;
}

interface SortOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
}

// ===== VALIDATION SCHEMAS =====
const GridHeaderPropsSchema = z.object({
  title: z.string().min(1),
  itemCount: z.number().min(0),
  sortBy: z.string().min(1),
  onSortChange: z.function(),
  sortOptions: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional()
  })),
  className: z.string().optional()
});

// ===== ENTERPRISE GRID HEADER COMPONENT =====
const EnterpriseGridHeader: React.FC<GridHeaderProps> = memo(({
  title,
  itemCount,
  sortBy,
  onSortChange,
  sortOptions,
  className = ''
}) => {
  // ===== ENTERPRISE VALIDATION =====
  const validation = GridHeaderPropsSchema.safeParse({
    title,
    itemCount,
    sortBy,
    onSortChange,
    sortOptions,
    className
  });

  if (!validation.success) {
    console.error('[EnterpriseGridHeader] Props validation failed:', validation.error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="grid-header-error">
        <p className="text-red-600 text-sm">Grid header configuration error</p>
      </div>
    );
  }

  // ===== ENTERPRISE EVENT HANDLERS =====
  const handleSortChange = (value: string) => {
    if (sortOptions.some(option => option.value === value)) {
      onSortChange(value);
    } else {
      console.warn('[EnterpriseGridHeader] Invalid sort option:', value);
    }
  };

  // ===== ENTERPRISE RENDERING =====
  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}
      data-testid="enterprise-grid-header"
    >
      {/* Title and Item Count Section */}
      <div className="flex-1">
        <h1 
          className="text-2xl font-bold text-gray-900 dark:text-white"
          data-testid="grid-header-title"
        >
          {title}
        </h1>
        <p 
          className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          data-testid="grid-header-count"
        >
          {itemCount === 0 
            ? 'No items found' 
            : itemCount === 1 
              ? '1 item' 
              : `${itemCount.toLocaleString()} items`
          }
        </p>
      </div>

      {/* Sorting Controls Section */}
      <div className="flex items-center gap-3">
        <span 
          className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
          data-testid="sort-label"
        >
          Sort by:
        </span>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger 
            className="w-48"
            data-testid="sort-select-trigger"
          >
            <SelectValue placeholder="Select sorting option" />
          </SelectTrigger>
          <SelectContent data-testid="sort-select-content">
            {sortOptions.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                data-testid={`sort-option-${option.value}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500">{option.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

// ===== ENTERPRISE COMPONENT METADATA =====
EnterpriseGridHeader.displayName = 'EnterpriseGridHeader';

// ===== EXPORTS =====
export default EnterpriseGridHeader;
export type { GridHeaderProps, SortOption };