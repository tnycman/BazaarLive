/**
 * Memory-Managed Filter State Hook
 * Enterprise-grade React hook with comprehensive memory management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryManagementService } from '@/services/memory/MemoryManagementService';
import type { FilterState } from '@/services/filtering/FilterStateManager';

// ===== HOOK INTERFACES =====

export interface UseMemoryManagedFilterStateOptions {
  readonly subscriberId?: string;
  readonly priority?: number;
  readonly enableMemoryManagement?: boolean;
  readonly enableMonitoring?: boolean;
  readonly enableAlerts?: boolean;
  readonly onMemoryAlert?: (alert: any) => void;
  readonly onCleanup?: (event: any) => void;
  readonly onError?: (error: Error) => void;
  readonly onStateChange?: (state: FilterState) => void;
}

export interface UseMemoryManagedFilterStateReturn {
  readonly state: FilterState;
  readonly updateState: (updates: Partial<FilterState>) => void;
  readonly clearFilters: () => void;
  readonly hasAppliedFilters: boolean;
  readonly appliedFiltersCount: number;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly memoryStats: any;
  readonly clearError: () => void;
  readonly getMemoryBreakdown: () => Record<string, number>;
  readonly isMemoryHealthy: boolean;
}

// ===== MEMORY MANAGED FILTER STATE HOOK =====

export function useMemoryManagedFilterState(
  options: UseMemoryManagedFilterStateOptions = {}
): UseMemoryManagedFilterStateReturn {
  const {
    subscriberId = `memory-managed-filter-${Math.random().toString(36).substr(2, 9)}`,
    priority = 0,
    enableMemoryManagement = true,
    enableMonitoring = true,
    enableAlerts = true,
    onMemoryAlert,
    onCleanup,
    onError,
    onStateChange
  } = options;

  // ===== STATE MANAGEMENT =====

  const [state, setState] = useState<FilterState>({
    selectedCategories: [],
    selectedBrands: [],
    selectedSizes: [],
    selectedColors: [],
    selectedPrices: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-conditions'],
    brandSearchQuery: '',
    expandedSections: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ===== MEMORY MANAGEMENT =====

  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);
  const isMountedRef = useRef<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // ===== MEMORY ALERT HANDLERS =====

  const handleMemoryAlert = useCallback((alert: any) => {
    if (!isMountedRef.current) return;

    console.warn('[useMemoryManagedFilterState] Memory alert:', alert);
    
    if (onMemoryAlert) {
      onMemoryAlert(alert);
    }
  }, [onMemoryAlert]);

  const handleCleanup = useCallback((event: any) => {
    if (!isMountedRef.current) return;

    console.log('[useMemoryManagedFilterState] Cleanup event:', event);
    
    if (onCleanup) {
      onCleanup(event);
    }
  }, [onCleanup]);

  // ===== MEMORY MANAGEMENT SETUP =====

  useEffect(() => {
    if (!enableMemoryManagement) {
      return;
    }

    // Register with memory manager
    const unsubscribe = () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };

    memoryManager.registerSubscription(
      subscriberId,
      'useMemoryManagedFilterState',
      unsubscribe
    );

    // Setup memory alert listeners
    if (enableAlerts) {
      memoryManager.on('memoryAlert', handleMemoryAlert);
      memoryManager.on('cleanup', handleCleanup);
    }

    // Update access time periodically
    const accessInterval = setInterval(() => {
      if (isMountedRef.current) {
        memoryManager.updateSubscriptionAccess(subscriberId);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      isMountedRef.current = false;
      clearInterval(accessInterval);
      memoryManager.unregisterSubscription(subscriberId);
      
      if (enableAlerts) {
        memoryManager.off('memoryAlert', handleMemoryAlert);
        memoryManager.off('cleanup', handleCleanup);
      }
    };
  }, [
    subscriberId,
    enableMemoryManagement,
    enableAlerts,
    memoryManager,
    handleMemoryAlert,
    handleCleanup
  ]);

  // ===== MEMORY MONITORING =====

  useEffect(() => {
    if (!enableMonitoring) {
      return;
    }

    const monitoringInterval = setInterval(() => {
      if (!isMountedRef.current) return;

      try {
        const stats = memoryManager.getMemoryStats();
        
        if (!stats.isHealthy) {
          console.warn('[useMemoryManagedFilterState] Memory health check failed:', stats);
        }
      } catch (monitoringError) {
        console.error('[useMemoryManagedFilterState] Memory monitoring error:', monitoringError);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(monitoringInterval);
    };
  }, [enableMonitoring, memoryManager]);

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

  const memoryStats = useMemo(() => {
    return memoryManager.getMemoryStats();
  }, [memoryManager]);

  const isMemoryHealthy = useMemo(() => {
    return memoryStats.isHealthy;
  }, [memoryStats]);

  // ===== STATE UPDATE FUNCTIONS =====

  const updateState = useCallback((updates: Partial<FilterState>) => {
    try {
      setIsLoading(true);
      setError(null);

      setState(prevState => ({
        ...prevState,
        ...updates
      }));

      // Update memory manager access time
      if (enableMemoryManagement) {
        memoryManager.updateSubscriptionAccess(subscriberId);
      }

      if (onStateChange) {
        onStateChange({ ...state, ...updates });
      }

    } catch (updateError) {
      const errorObj = updateError instanceof Error ? updateError : new Error('State update failed');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [state, enableMemoryManagement, memoryManager, subscriberId, onStateChange, onError]);

  const clearFilters = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      const clearedState: FilterState = {
        selectedCategories: [],
        selectedBrands: [],
        selectedSizes: [],
        selectedColors: [],
        selectedPrices: [],
        selectedAvailability: ['all-items'],
        selectedTypes: ['all-conditions'],
        brandSearchQuery: '',
        expandedSections: []
      };

      setState(clearedState);

      // Update memory manager access time
      if (enableMemoryManagement) {
        memoryManager.updateSubscriptionAccess(subscriberId);
      }

      if (onStateChange) {
        onStateChange(clearedState);
      }

    } catch (clearError) {
      const errorObj = clearError instanceof Error ? clearError : new Error('Clear filters failed');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enableMemoryManagement, memoryManager, subscriberId, onStateChange, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getMemoryBreakdown = useCallback(() => {
    return memoryManager.getMemoryBreakdown();
  }, [memoryManager]);

  // ===== RETURN VALUE =====

  return {
    state,
    updateState,
    clearFilters,
    hasAppliedFilters,
    appliedFiltersCount,
    isLoading,
    error,
    memoryStats,
    clearError,
    getMemoryBreakdown,
    isMemoryHealthy
  };
}

// ===== MEMORY UTILITY HOOKS =====

export function useMemoryMonitoring() {
  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);
  const [memoryStats, setMemoryStats] = useState(() => memoryManager.getMemoryStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryStats(memoryManager.getMemoryStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [memoryManager]);

  return memoryStats;
}

export function useMemoryAlerts() {
  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const handleAlert = (alert: any) => {
      setAlerts(prev => [...prev, alert]);
    };

    memoryManager.on('memoryAlert', handleAlert);

    return () => {
      memoryManager.off('memoryAlert', handleAlert);
    };
  }, [memoryManager]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return { alerts, clearAlerts };
}

export function useMemoryCleanup() {
  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);
  const [cleanupEvents, setCleanupEvents] = useState<any[]>([]);

  useEffect(() => {
    const handleCleanup = (event: any) => {
      setCleanupEvents(prev => [...prev, event]);
    };

    memoryManager.on('cleanup', handleCleanup);
    memoryManager.on('forceCleanup', handleCleanup);

    return () => {
      memoryManager.off('cleanup', handleCleanup);
      memoryManager.off('forceCleanup', handleCleanup);
    };
  }, [memoryManager]);

  const clearCleanupEvents = useCallback(() => {
    setCleanupEvents([]);
  }, []);

  const performCleanup = useCallback(() => {
    memoryManager.performCleanup();
  }, [memoryManager]);

  const forceCleanup = useCallback(() => {
    memoryManager.forceCleanup();
  }, [memoryManager]);

  return {
    cleanupEvents,
    clearCleanupEvents,
    performCleanup,
    forceCleanup
  };
}

// ===== MEMORY DEBUGGING HOOKS =====

export function useMemoryDebug() {
  const memoryManager = useMemo(() => MemoryManagementService.getInstance(), []);
  const [debugInfo, setDebugInfo] = useState(() => ({
    stats: memoryManager.getMemoryStats(),
    breakdown: memoryManager.getMemoryBreakdown(),
    config: memoryManager.getConfig(),
    subscriptionCount: memoryManager.getSubscriptionCountByComponent()
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo({
        stats: memoryManager.getMemoryStats(),
        breakdown: memoryManager.getMemoryBreakdown(),
        config: memoryManager.getConfig(),
        subscriptionCount: memoryManager.getSubscriptionCountByComponent()
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [memoryManager]);

  return debugInfo;
} 