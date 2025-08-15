/**
 * useFilterActions Hook
 * Enterprise-grade React hook for specialized filter actions
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { useCallback, useRef } from 'react';
import { useFilterState } from './useFilterState';
import type { FilterStateUpdate } from '@/services/filtering/FilterStateManager';

// ===== HOOK INTERFACES =====

/**
 * Filter actions hook options
 */
export interface UseFilterActionsOptions {
  readonly debounceDelay?: number;
  readonly enableOptimisticUpdates?: boolean;
  readonly enableBatchUpdates?: boolean;
  readonly maxBatchSize?: number;
  readonly onError?: (error: Error) => void;
}

/**
 * Filter actions hook return value
 */
export interface UseFilterActionsReturn {
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
}

// ===== DEBOUNCE UTILITY =====

/**
 * Debounce utility function
 */
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// ===== HOOK IMPLEMENTATION =====

/**
 * Enterprise-grade React hook for specialized filter actions
 * Provides optimized filter action functions with debouncing and batching
 */
export function useFilterActions(options: UseFilterActionsOptions = {}): UseFilterActionsReturn {
  const {
    debounceDelay = 300,
    enableOptimisticUpdates = true,
    enableBatchUpdates = true,
    maxBatchSize = 10,
    onError,
  } = options;

  const {
    state,
    updateState,
    clearFilters,
    error,
  } = useFilterState({
    onError,
  });

  // ===== BATCH UPDATE STATE =====

  const batchUpdatesRef = useRef<FilterStateUpdate[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===== DEBOUNCED UPDATE FUNCTION =====

  const debouncedUpdateState = useDebounce(updateState, debounceDelay);

  // ===== SPECIALIZED UPDATE FUNCTIONS =====

  const updateCategories = useCallback((categories: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedCategories: categories });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedCategories: categories });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update categories error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateBrands = useCallback((brands: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedBrands: brands });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedBrands: brands });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update brands error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateSizes = useCallback((sizes: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedSizes: sizes });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedSizes: sizes });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update sizes error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateColors = useCallback((colors: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedColors: colors });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedColors: colors });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update colors error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updatePrices = useCallback((prices: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedPrices: prices });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedPrices: prices });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update prices error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateAvailability = useCallback((availability: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedAvailability: availability });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedAvailability: availability });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update availability error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateTypes = useCallback((types: readonly string[]) => {
    try {
      if (enableBatchUpdates) {
        batchUpdatesRef.current.push({ selectedTypes: types });
        
        if (batchUpdatesRef.current.length >= maxBatchSize) {
          flushBatchUpdates();
        } else if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(flushBatchUpdates, 100);
        }
      } else {
        debouncedUpdateState({ selectedTypes: types });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update types error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, enableBatchUpdates, maxBatchSize, onError]);

  const updateBrandSearch = useCallback((query: string) => {
    try {
      debouncedUpdateState({ brandSearchQuery: query });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update brand search error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, onError]);

  const updateSearchQuery = useCallback((query: string) => {
    try {
      debouncedUpdateState({ searchQuery: query });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update search query error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [debouncedUpdateState, onError]);

  const updateSortBy = useCallback((sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating') => {
    try {
      updateState({ sortBy });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update sort by error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  const updateViewMode = useCallback((viewMode: 'grid' | 'list') => {
    try {
      updateState({ viewMode });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update view mode error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  const updatePage = useCallback((page: number) => {
    try {
      updateState({ currentPage: page });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update page error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  const updateItemsPerPage = useCallback((itemsPerPage: number) => {
    try {
      updateState({ itemsPerPage, currentPage: 1 }); // Reset to first page when changing items per page
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update items per page error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  const updatePriceRange = useCallback((min?: number, max?: number) => {
    try {
      const priceRange = min !== undefined || max !== undefined ? { min, max } : undefined;
      updateState({ priceRange });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Update price range error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  // ===== TOGGLE FUNCTIONS =====

  const toggleCategory = useCallback((category: string) => {
    try {
      const currentCategories = state.selectedCategories;
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      updateCategories(newCategories);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle category error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedCategories, updateCategories, onError]);

  const toggleBrand = useCallback((brand: string) => {
    try {
      const currentBrands = state.selectedBrands;
      const newBrands = currentBrands.includes(brand)
        ? currentBrands.filter(b => b !== brand)
        : [...currentBrands, brand];
      
      updateBrands(newBrands);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle brand error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedBrands, updateBrands, onError]);

  const toggleSize = useCallback((size: string) => {
    try {
      const currentSizes = state.selectedSizes;
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size];
      
      updateSizes(newSizes);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle size error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedSizes, updateSizes, onError]);

  const toggleColor = useCallback((color: string) => {
    try {
      const currentColors = state.selectedColors;
      const newColors = currentColors.includes(color)
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      
      updateColors(newColors);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle color error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedColors, updateColors, onError]);

  const togglePrice = useCallback((price: string) => {
    try {
      const currentPrices = state.selectedPrices;
      const newPrices = currentPrices.includes(price)
        ? currentPrices.filter(p => p !== price)
        : [...currentPrices, price];
      
      updatePrices(newPrices);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle price error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedPrices, updatePrices, onError]);

  const toggleAvailability = useCallback((availability: string) => {
    try {
      const currentAvailability = state.selectedAvailability;
      const newAvailability = currentAvailability.includes(availability)
        ? currentAvailability.filter(a => a !== availability)
        : [...currentAvailability, availability];
      
      updateAvailability(newAvailability);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle availability error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedAvailability, updateAvailability, onError]);

  const toggleType = useCallback((type: string) => {
    try {
      const currentTypes = state.selectedTypes;
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      updateTypes(newTypes);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle type error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.selectedTypes, updateTypes, onError]);

  const toggleExpandedSection = useCallback((section: string) => {
    try {
      const currentSections = state.expandedSections;
      const newSections = currentSections.includes(section)
        ? currentSections.filter(s => s !== section)
        : [...currentSections, section];
      
      updateState({ expandedSections: newSections });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Toggle expanded section error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [state.expandedSections, updateState, onError]);

  // ===== BATCH UPDATE FUNCTIONS =====

  const flushBatchUpdates = useCallback(() => {
    try {
      if (batchUpdatesRef.current.length === 0) return;

      const updates = batchUpdatesRef.current;
      batchUpdatesRef.current = [];

      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }

      // Merge all updates into a single update
      const mergedUpdate = updates.reduce((acc, update) => ({
        ...acc,
        ...update,
      }), {} as FilterStateUpdate);

      updateState(mergedUpdate);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Flush batch updates error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  const batchUpdate = useCallback((updates: readonly FilterStateUpdate[]) => {
    try {
      if (updates.length === 0) return;

      if (updates.length === 1) {
        updateState(updates[0]);
        return;
      }

      // Merge all updates into a single update
      const mergedUpdate = updates.reduce((acc, update) => ({
        ...acc,
        ...update,
      }), {} as FilterStateUpdate);

      updateState(mergedUpdate);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Batch update error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  // ===== RESET AND PRESET FUNCTIONS =====

  const resetToDefaults = useCallback(() => {
    try {
      clearFilters();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Reset to defaults error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [clearFilters, onError]);

  const applyPreset = useCallback((preset: FilterStateUpdate) => {
    try {
      updateState(preset);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Apply preset error');
      if (onError) {
        onError(errorObj);
      }
    }
  }, [updateState, onError]);

  // ===== RETURN VALUE =====

  return {
    updateCategories,
    updateBrands,
    updateSizes,
    updateColors,
    updatePrices,
    updateAvailability,
    updateTypes,
    updateBrandSearch,
    updateSearchQuery,
    updateSortBy,
    updateViewMode,
    updatePage,
    updateItemsPerPage,
    updatePriceRange,
    toggleCategory,
    toggleBrand,
    toggleSize,
    toggleColor,
    togglePrice,
    toggleAvailability,
    toggleType,
    toggleExpandedSection,
    batchUpdate,
    resetToDefaults,
    applyPreset,
  };
}

// ===== EXPORTS =====

export { useFilterActions };
export type { UseFilterActionsOptions, UseFilterActionsReturn }; 