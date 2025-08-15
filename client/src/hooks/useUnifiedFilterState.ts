/**
 * Unified Filter State Hook
 * Enterprise-grade React hook for unified filter state management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UnifiedFilterStateManager, type UnifiedFilterState } from '@/services/filtering/UnifiedFilterStateManager';
import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';
import { MemoryManagementService } from '@/services/memory/MemoryManagementService';

// ===== HOOK INTERFACES =====

export interface UseUnifiedFilterStateOptions {
  readonly subscriberId?: string;
  readonly enableErrorHandling?: boolean;
  readonly enableMemoryManagement?: boolean;
  readonly enableAnalytics?: boolean;
  readonly enablePresets?: boolean;
  readonly enableHistory?: boolean;
  readonly onStateChange?: (state: UnifiedFilterState) => void;
  readonly onError?: (error: Error) => void;
  readonly onPresetSaved?: (presetId: string) => void;
  readonly onPresetLoaded?: (presetId: string) => void;
  readonly onFiltersCleared?: () => void;
}

export interface UseUnifiedFilterStateReturn {
  readonly state: UnifiedFilterState;
  readonly updateState: (updates: Partial<UnifiedFilterState>) => void;
  readonly clearFilters: () => void;
  readonly hasAppliedFilters: boolean;
  readonly appliedFiltersCount: number;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly analytics: any;
  readonly presets: any[];
  readonly history: UnifiedFilterState[];
  readonly clearError: () => void;
  readonly savePreset: (name: string, filters: Record<string, unknown>, isDefault?: boolean) => string;
  readonly loadPreset: (presetId: string) => boolean;
  readonly undo: () => boolean;
  readonly validateState: () => any[];
  readonly getStateHistory: () => UnifiedFilterState[];
  readonly isDirty: boolean;
  readonly lastUpdateTime: number;
  readonly updateCount: number;
}

// ===== UNIFIED FILTER STATE HOOK =====

export function useUnifiedFilterState(
  options: UseUnifiedFilterStateOptions = {}
): UseUnifiedFilterStateReturn {
  const {
    subscriberId = `unified-filter-${Math.random().toString(36).substr(2, 9)}`,
    enableErrorHandling = true,
    enableMemoryManagement = true,
    enableAnalytics = true,
    enablePresets = true,
    enableHistory = true,
    onStateChange,
    onError,
    onPresetSaved,
    onPresetLoaded,
    onFiltersCleared
  } = options;

  // ===== STATE MANAGEMENT =====

  const [state, setState] = useState<UnifiedFilterState>(() => {
    const manager = UnifiedFilterStateManager.getInstance();
    return manager.getState();
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [history, setHistory] = useState<UnifiedFilterState[]>([]);

  // ===== SERVICE INSTANCES =====

  const stateManager = useMemo(() => UnifiedFilterStateManager.getInstance(), []);
  const errorHandler = useMemo(() => FilterErrorHandler.getInstance(), []);
  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);

  // ===== REFS =====

  const isMountedRef = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // ===== ERROR HANDLING =====

  const handleError = useCallback((error: Error) => {
    if (!isMountedRef.current) return;

    setError(error);
    
    if (enableErrorHandling) {
      errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.STATE_MANAGEMENT,
        `Unified filter state error: ${error.message}`,
        'UNIFIED_FILTER_STATE_ERROR',
        { subscriberId, error: error.message }
      );
    }

    if (onError) {
      onError(error);
    }
  }, [enableErrorHandling, errorHandler, subscriberId, onError]);

  // ===== STATE SUBSCRIPTION =====

  useEffect(() => {
    try {
      const unsubscribe = stateManager.subscribe(subscriberId, (newState) => {
        if (!isMountedRef.current) return;

        setState(newState);
        
        if (onStateChange) {
          onStateChange(newState);
        }
      });

      unsubscribeRef.current = unsubscribe;

      // Register with memory manager
      if (enableMemoryManagement) {
        memoryManager.registerSubscription(
          subscriberId,
          'useUnifiedFilterState',
          unsubscribe
        );
      }

    } catch (subscriptionError) {
      handleError(subscriptionError instanceof Error ? subscriptionError : new Error('Subscription failed'));
    }

    return () => {
      isMountedRef.current = false;
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      if (enableMemoryManagement) {
        memoryManager.unregisterSubscription(subscriberId);
      }
    };
  }, [stateManager, subscriberId, enableMemoryManagement, memoryManager, onStateChange, handleError]);

  // ===== EVENT LISTENERS =====

  useEffect(() => {
    const handleStateUpdated = (event: any) => {
      if (!isMountedRef.current) return;
      
      setState(event.currentState);
      setIsLoading(false);
    };

    const handleFiltersCleared = () => {
      if (!isMountedRef.current) return;
      
      if (onFiltersCleared) {
        onFiltersCleared();
      }
    };

    const handlePresetSaved = (event: any) => {
      if (!isMountedRef.current) return;
      
      if (onPresetSaved) {
        onPresetSaved(event.preset.id);
      }
    };

    const handlePresetLoaded = (event: any) => {
      if (!isMountedRef.current) return;
      
      if (onPresetLoaded) {
        onPresetLoaded(event.preset.id);
      }
    };

    const handleStateError = (error: any) => {
      if (!isMountedRef.current) return;
      
      handleError(new Error(error.message || 'State error occurred'));
    };

    // Add event listeners
    stateManager.on('stateUpdated', handleStateUpdated);
    stateManager.on('filtersCleared', handleFiltersCleared);
    stateManager.on('presetSaved', handlePresetSaved);
    stateManager.on('presetLoaded', handlePresetLoaded);
    stateManager.on('stateError', handleStateError);

    return () => {
      stateManager.off('stateUpdated', handleStateUpdated);
      stateManager.off('filtersCleared', handleFiltersCleared);
      stateManager.off('presetSaved', handlePresetSaved);
      stateManager.off('presetLoaded', handlePresetLoaded);
      stateManager.off('stateError', handleStateError);
    };
  }, [stateManager, onFiltersCleared, onPresetSaved, onPresetLoaded, handleError]);

  // ===== ANALYTICS MONITORING =====

  useEffect(() => {
    if (!enableAnalytics) return;

    const updateAnalytics = () => {
      try {
        const currentAnalytics = stateManager.getAnalytics();
        setAnalytics(currentAnalytics);
      } catch (analyticsError) {
        handleError(analyticsError instanceof Error ? analyticsError : new Error('Analytics update failed'));
      }
    };

    // Update analytics immediately
    updateAnalytics();

    // Update analytics periodically
    const analyticsInterval = setInterval(updateAnalytics, 30000); // Every 30 seconds

    return () => {
      clearInterval(analyticsInterval);
    };
  }, [enableAnalytics, stateManager, handleError]);

  // ===== PRESETS MONITORING =====

  useEffect(() => {
    if (!enablePresets) return;

    const updatePresets = () => {
      try {
        const currentState = stateManager.getState();
        setPresets(currentState.filterPresets);
      } catch (presetsError) {
        handleError(presetsError instanceof Error ? presetsError : new Error('Presets update failed'));
      }
    };

    // Update presets immediately
    updatePresets();

    // Update presets when state changes
    const handlePresetUpdate = () => {
      updatePresets();
    };

    stateManager.on('presetSaved', handlePresetUpdate);
    stateManager.on('presetLoaded', handlePresetUpdate);

    return () => {
      stateManager.off('presetSaved', handlePresetUpdate);
      stateManager.off('presetLoaded', handlePresetUpdate);
    };
  }, [enablePresets, stateManager, handleError]);

  // ===== HISTORY MONITORING =====

  useEffect(() => {
    if (!enableHistory) return;

    const updateHistory = () => {
      try {
        const currentHistory = stateManager.getStateHistory();
        setHistory(currentHistory);
      } catch (historyError) {
        handleError(historyError instanceof Error ? historyError : new Error('History update failed'));
      }
    };

    // Update history immediately
    updateHistory();

    // Update history when state changes
    const handleHistoryUpdate = () => {
      updateHistory();
    };

    stateManager.on('stateUpdated', handleHistoryUpdate);

    return () => {
      stateManager.off('stateUpdated', handleHistoryUpdate);
    };
  }, [enableHistory, stateManager, handleError]);

  // ===== COMPUTED VALUES =====

  const hasAppliedFilters = useMemo(() => {
    return (
      state.selectedCategories.length > 0 ||
      state.selectedBrands.length > 0 ||
      state.selectedSizes.length > 0 ||
      state.selectedColors.length > 0 ||
      state.selectedPrices.length > 0 ||
      (state.selectedAvailability.length > 0 && !state.selectedAvailability.includes('all-items')) ||
      (state.selectedTypes.length > 0 && !state.selectedTypes.includes('all-conditions')) ||
      state.brandSearchQuery.length > 0
    );
  }, [state]);

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    
    if (state.selectedCategories.length > 0) count++;
    if (state.selectedBrands.length > 0) count++;
    if (state.selectedSizes.length > 0) count++;
    if (state.selectedColors.length > 0) count++;
    if (state.selectedPrices.length > 0) count++;
    if (state.selectedAvailability.length > 0 && !state.selectedAvailability.includes('all-items')) count++;
    if (state.selectedTypes.length > 0 && !state.selectedTypes.includes('all-conditions')) count++;
    if (state.brandSearchQuery.length > 0) count++;
    
    return count;
  }, [state]);

  // ===== STATE UPDATE FUNCTIONS =====

  const updateState = useCallback((updates: Partial<UnifiedFilterState>) => {
    try {
      setIsLoading(true);
      setError(null);

      stateManager.updateState(updates);

    } catch (updateError) {
      const errorObj = updateError instanceof Error ? updateError : new Error('State update failed');
      handleError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [stateManager, handleError]);

  const clearFilters = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      stateManager.clearFilters();

    } catch (clearError) {
      const errorObj = clearError instanceof Error ? clearError : new Error('Clear filters failed');
      handleError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [stateManager, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const savePreset = useCallback((name: string, filters: Record<string, unknown>, isDefault: boolean = false): string => {
    try {
      return stateManager.savePreset(name, filters, isDefault);
    } catch (presetError) {
      const errorObj = presetError instanceof Error ? presetError : new Error('Save preset failed');
      handleError(errorObj);
      return '';
    }
  }, [stateManager, handleError]);

  const loadPreset = useCallback((presetId: string): boolean => {
    try {
      return stateManager.loadPreset(presetId);
    } catch (presetError) {
      const errorObj = presetError instanceof Error ? presetError : new Error('Load preset failed');
      handleError(errorObj);
      return false;
    }
  }, [stateManager, handleError]);

  const undo = useCallback((): boolean => {
    try {
      return stateManager.undo();
    } catch (undoError) {
      const errorObj = undoError instanceof Error ? undoError : new Error('Undo failed');
      handleError(errorObj);
      return false;
    }
  }, [stateManager, handleError]);

  const validateState = useCallback((): any[] => {
    try {
      return stateManager.validateState();
    } catch (validationError) {
      const errorObj = validationError instanceof Error ? validationError : new Error('State validation failed');
      handleError(errorObj);
      return [];
    }
  }, [stateManager, handleError]);

  const getStateHistory = useCallback((): UnifiedFilterState[] => {
    try {
      return stateManager.getStateHistory();
    } catch (historyError) {
      const errorObj = historyError instanceof Error ? historyError : new Error('Get history failed');
      handleError(errorObj);
      return [];
    }
  }, [stateManager, handleError]);

  // ===== RETURN VALUE =====

  return {
    state,
    updateState,
    clearFilters,
    hasAppliedFilters,
    appliedFiltersCount,
    isLoading,
    error,
    analytics,
    presets,
    history,
    clearError,
    savePreset,
    loadPreset,
    undo,
    validateState,
    getStateHistory,
    isDirty: state.isDirty,
    lastUpdateTime: state.lastUpdateTime,
    updateCount: state.updateCount
  };
}

// ===== UTILITY HOOKS =====

export function useFilterAnalytics() {
  const stateManager = useMemo(() => UnifiedFilterStateManager.getInstance(), []);
  const [analytics, setAnalytics] = useState(() => stateManager.getAnalytics());

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(stateManager.getAnalytics());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [stateManager]);

  return analytics;
}

export function useFilterPresets() {
  const stateManager = useMemo(() => UnifiedFilterStateManager.getInstance(), []);
  const [presets, setPresets] = useState(() => stateManager.getState().filterPresets);

  useEffect(() => {
    const handlePresetUpdate = () => {
      setPresets(stateManager.getState().filterPresets);
    };

    stateManager.on('presetSaved', handlePresetUpdate);
    stateManager.on('presetLoaded', handlePresetUpdate);

    return () => {
      stateManager.off('presetSaved', handlePresetUpdate);
      stateManager.off('presetLoaded', handlePresetUpdate);
    };
  }, [stateManager]);

  return presets;
}

export function useFilterHistory() {
  const stateManager = useMemo(() => UnifiedFilterStateManager.getInstance(), []);
  const [history, setHistory] = useState(() => stateManager.getStateHistory());

  useEffect(() => {
    const handleStateUpdate = () => {
      setHistory(stateManager.getStateHistory());
    };

    stateManager.on('stateUpdated', handleStateUpdate);

    return () => {
      stateManager.off('stateUpdated', handleStateUpdate);
    };
  }, [stateManager]);

  return history;
} 