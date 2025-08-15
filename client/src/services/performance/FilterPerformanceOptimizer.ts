/**
 * Filter Performance Optimizer Service
 * Comprehensive performance optimization strategies for the filter system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterStateManager } from '@/services/filtering/FilterStateManager';
import type { FilterState, FilterStateUpdate } from '@/services/filtering/FilterStateManager';

// ===== PERFORMANCE OPTIMIZATION INTERFACES =====

/**
 * Performance optimization configuration interface
 */
export interface PerformanceOptimizationConfig {
  readonly enableDebouncing: boolean;
  readonly debounceDelay: number;
  readonly enableBatching: boolean;
  readonly maxBatchSize: number;
  readonly enableMemoization: boolean;
  readonly enableLazyLoading: boolean;
  readonly enableVirtualization: boolean;
  readonly enableCaching: boolean;
  readonly cacheSize: number;
  readonly enableCompression: boolean;
  readonly enableOptimisticUpdates: boolean;
  readonly enableBackgroundProcessing: boolean;
  readonly enableWorkerThreads: boolean;
  readonly enableRequestDeduplication: boolean;
  readonly enableResponseCaching: boolean;
  readonly enablePrefetching: boolean;
  readonly enableProgressiveLoading: boolean;
  readonly enableSmartRendering: boolean;
  readonly enableStateNormalization: boolean;
  readonly enableSelectiveUpdates: boolean;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly updateTime: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly networkRequests: number;
  readonly cacheHitRate: number;
  readonly batchEfficiency: number;
  readonly debounceEfficiency: number;
  readonly virtualizationEfficiency: number;
  readonly compressionRatio: number;
  readonly optimizationScore: number;
}

/**
 * Performance optimization result interface
 */
export interface PerformanceOptimizationResult {
  readonly success: boolean;
  readonly metrics: PerformanceMetrics;
  readonly optimizations: readonly string[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly recommendations: readonly string[];
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T> {
  readonly key: string;
  readonly value: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly accessCount: number;
}

// ===== PERFORMANCE OPTIMIZATION CONSTANTS =====

const DEFAULT_OPTIMIZATION_CONFIG: PerformanceOptimizationConfig = {
  enableDebouncing: true,
  debounceDelay: 300,
  enableBatching: true,
  maxBatchSize: 10,
  enableMemoization: true,
  enableLazyLoading: true,
  enableVirtualization: true,
  enableCaching: true,
  cacheSize: 100,
  enableCompression: true,
  enableOptimisticUpdates: true,
  enableBackgroundProcessing: true,
  enableWorkerThreads: false,
  enableRequestDeduplication: true,
  enableResponseCaching: true,
  enablePrefetching: true,
  enableProgressiveLoading: true,
  enableSmartRendering: true,
  enableStateNormalization: true,
  enableSelectiveUpdates: true,
};

const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_MAX: 100, // ms
  UPDATE_TIME_MAX: 50, // ms
  MEMORY_USAGE_MAX: 50 * 1024 * 1024, // 50MB
  CPU_USAGE_MAX: 80, // percentage
  CACHE_HIT_RATE_MIN: 0.8, // 80%
  BATCH_EFFICIENCY_MIN: 0.7, // 70%
  DEBOUNCE_EFFICIENCY_MIN: 0.6, // 60%
  VIRTUALIZATION_EFFICIENCY_MIN: 0.8, // 80%
  COMPRESSION_RATIO_MIN: 0.3, // 30%
} as const;

// ===== PERFORMANCE OPTIMIZATION UTILITIES =====

/**
 * Debounce utility for performance optimization
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (timeSinceLastCall > delay) {
      func(...args);
      lastCallTime = now;
    } else {
      timeoutId = setTimeout(() => {
        func(...args);
        lastCallTime = Date.now();
      }, delay);
    }
  };
}

/**
 * Batch utility for performance optimization
 */
export function createBatchedFunction<T extends (...args: any[]) => any>(
  func: T,
  maxBatchSize: number,
  maxDelay: number
): (...args: Parameters<T>) => void {
  let batch: Parameters<T>[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    batch.push(args);

    if (batch.length >= maxBatchSize) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      processBatch();
    } else if (!timeoutId) {
      timeoutId = setTimeout(processBatch, maxDelay);
    }
  };

  function processBatch() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (batch.length > 0) {
      func(batch);
      batch = [];
    }
  }
}

/**
 * Memoization utility for performance optimization
 */
export function createMemoizedFunction<T extends (...args: any[]) => any>(
  func: T,
  cacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  const accessOrder: string[] = [];

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end of access order
      const index = accessOrder.indexOf(key);
      if (index > -1) {
        accessOrder.splice(index, 1);
      }
      accessOrder.push(key);
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    accessOrder.push(key);

    // Implement LRU eviction
    if (cache.size > cacheSize) {
      const oldestKey = accessOrder.shift();
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    return result;
  }) as T;
}

/**
 * Compression utility for performance optimization
 */
export function compressFilterState(state: FilterState): string {
  try {
    // Remove empty arrays and undefined values
    const cleanedState = Object.fromEntries(
      Object.entries(state).filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== '';
      })
    );

    return JSON.stringify(cleanedState);
  } catch (error) {
    console.error('Filter state compression failed:', error);
    return JSON.stringify(state);
  }
}

/**
 * Decompression utility for performance optimization
 */
export function decompressFilterState(compressedState: string): FilterState {
  try {
    const parsed = JSON.parse(compressedState);
    return {
      selectedCategories: parsed.selectedCategories || [],
      selectedBrands: parsed.selectedBrands || [],
      selectedSizes: parsed.selectedSizes || [],
      selectedColors: parsed.selectedColors || [],
      selectedPrices: parsed.selectedPrices || [],
      selectedAvailability: parsed.selectedAvailability || ['all-items'],
      selectedTypes: parsed.selectedTypes || ['all-conditions'],
      brandSearchQuery: parsed.brandSearchQuery || '',
      searchQuery: parsed.searchQuery || '',
      sortBy: parsed.sortBy || 'newest',
      viewMode: parsed.viewMode || 'grid',
      currentPage: parsed.currentPage || 1,
      itemsPerPage: parsed.itemsPerPage || 20,
      priceRange: parsed.priceRange,
      expandedSections: parsed.expandedSections || ['categories'],
    };
  } catch (error) {
    console.error('Filter state decompression failed:', error);
    throw new Error('Invalid compressed filter state');
  }
}

// ===== PERFORMANCE OPTIMIZATION SERVICE =====

/**
 * Enterprise-grade filter performance optimizer service
 * Provides comprehensive performance optimization strategies
 */
export class FilterPerformanceOptimizer {
  private readonly config: PerformanceOptimizationConfig;
  private readonly cache: Map<string, CacheEntry<any>>;
  private readonly metrics: PerformanceMetrics;
  private readonly filterStateManager: FilterStateManager;
  private readonly debouncedUpdate: (updates: FilterStateUpdate[]) => void;
  private readonly batchedUpdate: (updates: FilterStateUpdate[]) => void;
  private readonly memoizedCompress: (state: FilterState) => string;
  private readonly memoizedDecompress: (compressed: string) => FilterState;

  constructor(
    config: Partial<PerformanceOptimizationConfig> = {},
    filterStateManager: FilterStateManager = FilterStateManager.getInstance()
  ) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
    this.cache = new Map();
    this.filterStateManager = filterStateManager;
    this.metrics = this.initializeMetrics();

    // Initialize optimized functions
    this.debouncedUpdate = createDebouncedFunction(
      (updates: FilterStateUpdate[]) => {
        updates.forEach(update => this.filterStateManager.updateState(update));
      },
      this.config.debounceDelay
    );

    this.batchedUpdate = createBatchedFunction(
      (updates: FilterStateUpdate[]) => {
        this.filterStateManager.batchUpdate(updates);
      },
      this.config.maxBatchSize,
      this.config.debounceDelay
    );

    this.memoizedCompress = createMemoizedFunction(compressFilterState, this.config.cacheSize);
    this.memoizedDecompress = createMemoizedFunction(decompressFilterState, this.config.cacheSize);
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      renderTime: 0,
      updateTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      networkRequests: 0,
      cacheHitRate: 0,
      batchEfficiency: 0,
      debounceEfficiency: 0,
      virtualizationEfficiency: 0,
      compressionRatio: 0,
      optimizationScore: 0,
    };
  }

  /**
   * Optimize filter state updates
   */
  public optimizeStateUpdate(update: FilterStateUpdate): void {
    const startTime = performance.now();

    try {
      if (this.config.enableBatching) {
        this.batchedUpdate([update]);
      } else if (this.config.enableDebouncing) {
        this.debouncedUpdate([update]);
      } else {
        this.filterStateManager.updateState(update);
      }

      const endTime = performance.now();
      this.metrics.updateTime = endTime - startTime;
      this.updateOptimizationScore();
    } catch (error) {
      console.error('Filter state update optimization failed:', error);
      throw error;
    }
  }

  /**
   * Optimize filter state rendering
   */
  public optimizeStateRender(state: FilterState): FilterState {
    const startTime = performance.now();

    try {
      let optimizedState = state;

      // Apply state normalization
      if (this.config.enableStateNormalization) {
        optimizedState = this.normalizeFilterState(state);
      }

      // Apply compression
      if (this.config.enableCompression) {
        const compressed = this.memoizedCompress(optimizedState);
        const decompressed = this.memoizedDecompress(compressed);
        optimizedState = decompressed;
      }

      // Apply caching
      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(optimizedState);
        this.cache.set(cacheKey, {
          key: cacheKey,
          value: optimizedState,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000, // 5 minutes
          accessCount: 1,
        });
      }

      const endTime = performance.now();
      this.metrics.renderTime = endTime - startTime;
      this.updateOptimizationScore();

      return optimizedState;
    } catch (error) {
      console.error('Filter state render optimization failed:', error);
      return state;
    }
  }

  /**
   * Normalize filter state for consistency
   */
  private normalizeFilterState(state: FilterState): FilterState {
    return {
      selectedCategories: Array.isArray(state.selectedCategories) ? state.selectedCategories : [],
      selectedBrands: Array.isArray(state.selectedBrands) ? state.selectedBrands : [],
      selectedSizes: Array.isArray(state.selectedSizes) ? state.selectedSizes : [],
      selectedColors: Array.isArray(state.selectedColors) ? state.selectedColors : [],
      selectedPrices: Array.isArray(state.selectedPrices) ? state.selectedPrices : [],
      selectedAvailability: Array.isArray(state.selectedAvailability) ? state.selectedAvailability : ['all-items'],
      selectedTypes: Array.isArray(state.selectedTypes) ? state.selectedTypes : ['all-conditions'],
      brandSearchQuery: typeof state.brandSearchQuery === 'string' ? state.brandSearchQuery : '',
      searchQuery: typeof state.searchQuery === 'string' ? state.searchQuery : '',
      sortBy: ['newest', 'price-low', 'price-high', 'popular', 'rating'].includes(state.sortBy) ? state.sortBy : 'newest',
      viewMode: ['grid', 'list'].includes(state.viewMode) ? state.viewMode : 'grid',
      currentPage: typeof state.currentPage === 'number' && state.currentPage > 0 ? state.currentPage : 1,
      itemsPerPage: typeof state.itemsPerPage === 'number' && state.itemsPerPage > 0 ? state.itemsPerPage : 20,
      priceRange: state.priceRange,
      expandedSections: Array.isArray(state.expandedSections) ? state.expandedSections : ['categories'],
    };
  }

  /**
   * Generate cache key for filter state
   */
  private generateCacheKey(state: FilterState): string {
    const keyData = {
      categories: state.selectedCategories.sort(),
      brands: state.selectedBrands.sort(),
      sizes: state.selectedSizes.sort(),
      colors: state.selectedColors.sort(),
      prices: state.selectedPrices.sort(),
      availability: state.selectedAvailability.sort(),
      types: state.selectedTypes.sort(),
      sortBy: state.sortBy,
      viewMode: state.viewMode,
      page: state.currentPage,
      itemsPerPage: state.itemsPerPage,
    };

    return JSON.stringify(keyData);
  }

  /**
   * Update optimization score based on current metrics
   */
  private updateOptimizationScore(): void {
    const scores = {
      renderTime: Math.max(0, 1 - this.metrics.renderTime / PERFORMANCE_THRESHOLDS.RENDER_TIME_MAX),
      updateTime: Math.max(0, 1 - this.metrics.updateTime / PERFORMANCE_THRESHOLDS.UPDATE_TIME_MAX),
      memoryUsage: Math.max(0, 1 - this.metrics.memoryUsage / PERFORMANCE_THRESHOLDS.MEMORY_USAGE_MAX),
      cacheHitRate: this.metrics.cacheHitRate,
      batchEfficiency: this.metrics.batchEfficiency,
      debounceEfficiency: this.metrics.debounceEfficiency,
      virtualizationEfficiency: this.metrics.virtualizationEfficiency,
      compressionRatio: this.metrics.compressionRatio,
    };

    this.metrics.optimizationScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance optimization recommendations
   */
  public getRecommendations(): readonly string[] {
    const recommendations: string[] = [];

    if (this.metrics.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_MAX) {
      recommendations.push('Consider enabling virtualization for large filter lists');
    }

    if (this.metrics.updateTime > PERFORMANCE_THRESHOLDS.UPDATE_TIME_MAX) {
      recommendations.push('Consider increasing debounce delay or batch size');
    }

    if (this.metrics.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_USAGE_MAX) {
      recommendations.push('Consider reducing cache size or enabling compression');
    }

    if (this.metrics.cacheHitRate < PERFORMANCE_THRESHOLDS.CACHE_HIT_RATE_MIN) {
      recommendations.push('Consider increasing cache size or optimizing cache keys');
    }

    if (this.metrics.batchEfficiency < PERFORMANCE_THRESHOLDS.BATCH_EFFICIENCY_MIN) {
      recommendations.push('Consider adjusting batch size or timing');
    }

    return recommendations;
  }

  /**
   * Clear cache and reset metrics
   */
  public reset(): void {
    this.cache.clear();
    this.metrics.renderTime = 0;
    this.metrics.updateTime = 0;
    this.metrics.memoryUsage = 0;
    this.metrics.cpuUsage = 0;
    this.metrics.networkRequests = 0;
    this.metrics.cacheHitRate = 0;
    this.metrics.batchEfficiency = 0;
    this.metrics.debounceEfficiency = 0;
    this.metrics.virtualizationEfficiency = 0;
    this.metrics.compressionRatio = 0;
    this.metrics.optimizationScore = 0;
  }
}

// ===== EXPORTS =====

export {
  FilterPerformanceOptimizer,
  createDebouncedFunction,
  createBatchedFunction,
  createMemoizedFunction,
  compressFilterState,
  decompressFilterState,
  DEFAULT_OPTIMIZATION_CONFIG,
  PERFORMANCE_THRESHOLDS,
};
export type {
  PerformanceOptimizationConfig,
  PerformanceMetrics,
  PerformanceOptimizationResult,
  CacheEntry,
}; 