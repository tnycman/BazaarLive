/**
 * Unified Filter State Manager
 * Enterprise-grade centralized filter state management with comprehensive features
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { EventEmitter } from 'events';
import { z } from 'zod';
import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';
import { MemoryManagementService } from '@/services/memory/MemoryManagementService';

// ===== UNIFIED FILTER STATE SCHEMAS =====

const UnifiedFilterStateSchema = z.object({
  // Core filter state
  selectedCategories: z.array(z.string()).default([]),
  selectedBrands: z.array(z.string()).default([]),
  selectedSizes: z.array(z.string()).default([]),
  selectedColors: z.array(z.string()).default([]),
  selectedPrices: z.array(z.string()).default([]),
  selectedAvailability: z.array(z.string()).default(['all-items']),
  selectedTypes: z.array(z.string()).default(['all-conditions']),
  brandSearchQuery: z.string().default(''),
  
  // UI state
  expandedSections: z.array(z.string()).default([]),
  collapsedSections: z.array(z.string()).default([]),
  
  // Navigation state
  currentCategory: z.string().optional(),
  navigationHistory: z.array(z.string()).default([]),
  breadcrumbPath: z.array(z.string()).default([]),
  
  // Performance state
  lastUpdateTime: z.number().default(0),
  updateCount: z.number().default(0),
  isDirty: z.boolean().default(false),
  
  // Validation state
  validationErrors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string()
  })).default([]),
  
  // Metadata
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  componentId: z.string().optional(),
  
  // Advanced features
  filterPresets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    filters: z.record(z.unknown()),
    createdAt: z.number(),
    isDefault: z.boolean().default(false)
  })).default([]),
  
  // Analytics state
  filterAnalytics: z.object({
    totalFiltersApplied: z.number().default(0),
    mostUsedFilters: z.record(z.number()).default({}),
    filterSessionDuration: z.number().default(0),
    lastFilterAction: z.string().optional()
  }).default({}),
  
  // Caching state
  cacheKey: z.string().optional(),
  cacheExpiry: z.number().optional(),
  isCached: z.boolean().default(false)
});

export interface UnifiedFilterState extends z.infer<typeof UnifiedFilterStateSchema> {}

// ===== FILTER PRESET INTERFACES =====

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: number;
  isDefault: boolean;
  description?: string;
  tags?: string[];
  usageCount?: number;
}

// ===== FILTER ANALYTICS INTERFACES =====

export interface FilterAnalytics {
  totalFiltersApplied: number;
  mostUsedFilters: Record<string, number>;
  filterSessionDuration: number;
  lastFilterAction?: string;
  filterChangeFrequency: number;
  averageFilterCount: number;
  popularCombinations: Array<{
    filters: string[];
    usageCount: number;
  }>;
}

// ===== VALIDATION ERROR INTERFACES =====

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
}

// ===== UNIFIED FILTER STATE MANAGER =====

export class UnifiedFilterStateManager extends EventEmitter {
  private static instance: UnifiedFilterStateManager;
  private state: UnifiedFilterState;
  private subscribers: Map<string, (state: UnifiedFilterState) => void> = new Map();
  private errorHandler: FilterErrorHandler;
  private memoryManager: MemoryManagementService;
  private isUpdating: boolean = false;
  private updateQueue: Array<() => void> = [];
  private lastStateSnapshot: UnifiedFilterState | null = null;
  private stateHistory: UnifiedFilterState[] = [];
  private maxHistorySize: number = 50;

  private constructor() {
    super();
    this.errorHandler = FilterErrorHandler.getInstance();
    this.memoryManager = MemoryManagementService.getInstance();
    
    // Initialize with default state
    this.state = {
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-conditions'],
      brandSearchQuery: '',
      expandedSections: [],
      collapsedSections: [],
      navigationHistory: [],
      breadcrumbPath: [],
      lastUpdateTime: Date.now(),
      updateCount: 0,
      isDirty: false,
      validationErrors: [],
      filterPresets: [],
      filterAnalytics: {
        totalFiltersApplied: 0,
        mostUsedFilters: {},
        filterSessionDuration: 0
      },
      isCached: false
    };

    this.setupMemoryManagement();
    this.setupErrorHandling();
  }

  static getInstance(): UnifiedFilterStateManager {
    if (!UnifiedFilterStateManager.instance) {
      UnifiedFilterStateManager.instance = new UnifiedFilterStateManager();
    }
    return UnifiedFilterStateManager.instance;
  }

  /**
   * Get current state with validation
   */
  public getState(): UnifiedFilterState {
    try {
      const validation = UnifiedFilterStateSchema.safeParse(this.state);
      if (!validation.success) {
        this.errorHandler.handleError(
          FilterErrorType.VALIDATION_ERROR,
          FilterErrorSeverity.HIGH,
          FilterErrorContext.STATE_MANAGEMENT,
          'Invalid filter state detected',
          'STATE_VALIDATION_FAILED',
          { errors: validation.error.errors }
        );
        return this.getDefaultState();
      }
      return validation.data;
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.CRITICAL,
        FilterErrorContext.STATE_MANAGEMENT,
        'Failed to get filter state',
        'GET_STATE_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return this.getDefaultState();
    }
  }

  /**
   * Update state with comprehensive validation and error handling
   */
  public updateState(updates: Partial<UnifiedFilterState>): void {
    try {
      if (this.isUpdating) {
        this.updateQueue.push(() => this.updateState(updates));
        return;
      }

      this.isUpdating = true;

      // Create new state
      const newState: UnifiedFilterState = {
        ...this.state,
        ...updates,
        lastUpdateTime: Date.now(),
        updateCount: this.state.updateCount + 1,
        isDirty: true
      };

      // Validate new state
      const validation = UnifiedFilterStateSchema.safeParse(newState);
      if (!validation.success) {
        this.errorHandler.handleError(
          FilterErrorType.VALIDATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.STATE_MANAGEMENT,
          'State update validation failed',
          'STATE_UPDATE_VALIDATION_FAILED',
          { errors: validation.error.errors, updates }
        );
        return;
      }

      // Store previous state for history
      this.addToHistory(this.state);

      // Update state
      this.state = validation.data;

      // Update analytics
      this.updateAnalytics(updates);

      // Notify subscribers
      this.notifySubscribers();

      // Emit update event
      this.emit('stateUpdated', {
        previousState: this.lastStateSnapshot,
        currentState: this.state,
        updates,
        timestamp: Date.now()
      });

      this.lastStateSnapshot = { ...this.state };

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.STATE_MANAGEMENT,
        'State update failed',
        'STATE_UPDATE_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error', updates }
      );
    } finally {
      this.isUpdating = false;
      
      // Process queued updates
      while (this.updateQueue.length > 0) {
        const queuedUpdate = this.updateQueue.shift();
        if (queuedUpdate) {
          queuedUpdate();
        }
      }
    }
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(id: string, callback: (state: UnifiedFilterState) => void): () => void {
    try {
      this.subscribers.set(id, callback);
      
      // Register with memory manager
      this.memoryManager.registerSubscription(
        id,
        'UnifiedFilterStateManager',
        () => this.subscribers.delete(id)
      );

      // Initial callback with current state
      callback(this.getState());

      return () => {
        this.subscribers.delete(id);
        this.memoryManager.unregisterSubscription(id);
      };
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'Subscription failed',
        'SUBSCRIBE_FAILED',
        { subscriberId: id, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return () => {};
    }
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    try {
      const clearedState: Partial<UnifiedFilterState> = {
        selectedCategories: [],
        selectedBrands: [],
        selectedSizes: [],
        selectedColors: [],
        selectedPrices: [],
        selectedAvailability: ['all-items'],
        selectedTypes: ['all-conditions'],
        brandSearchQuery: '',
        validationErrors: [],
        isDirty: false
      };

      this.updateState(clearedState);

      this.emit('filtersCleared', {
        timestamp: Date.now(),
        previousState: this.lastStateSnapshot
      });

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'Clear filters failed',
        'CLEAR_FILTERS_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Save filter preset
   */
  public savePreset(name: string, filters: Record<string, unknown>, isDefault: boolean = false): string {
    try {
      const presetId = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const preset: FilterPreset = {
        id: presetId,
        name,
        filters,
        createdAt: Date.now(),
        isDefault,
        usageCount: 0
      };

      const currentPresets = this.state.filterPresets;
      const updatedPresets = isDefault 
        ? currentPresets.map(p => ({ ...p, isDefault: false })).concat(preset)
        : currentPresets.concat(preset);

      this.updateState({
        filterPresets: updatedPresets
      });

      this.emit('presetSaved', {
        preset,
        timestamp: Date.now()
      });

      return presetId;

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'Save preset failed',
        'SAVE_PRESET_FAILED',
        { name, isDefault, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return '';
    }
  }

  /**
   * Load filter preset
   */
  public loadPreset(presetId: string): boolean {
    try {
      const preset = this.state.filterPresets.find(p => p.id === presetId);
      if (!preset) {
        this.errorHandler.handleError(
          FilterErrorType.DATA_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.STATE_MANAGEMENT,
          'Preset not found',
          'PRESET_NOT_FOUND',
          { presetId }
        );
        return false;
      }

      // Update usage count
      const updatedPresets = this.state.filterPresets.map(p => 
        p.id === presetId 
          ? { ...p, usageCount: (p.usageCount || 0) + 1 }
          : p
      );

      this.updateState({
        ...preset.filters as Partial<UnifiedFilterState>,
        filterPresets: updatedPresets
      });

      this.emit('presetLoaded', {
        preset,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'Load preset failed',
        'LOAD_PRESET_FAILED',
        { presetId, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Get filter analytics
   */
  public getAnalytics(): FilterAnalytics {
    try {
      const analytics = this.state.filterAnalytics;
      
      // Calculate additional metrics
      const filterChangeFrequency = this.calculateFilterChangeFrequency();
      const averageFilterCount = this.calculateAverageFilterCount();
      const popularCombinations = this.getPopularCombinations();

      return {
        ...analytics,
        filterChangeFrequency,
        averageFilterCount,
        popularCombinations
      };

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.DATA_ERROR,
        FilterErrorSeverity.LOW,
        FilterErrorContext.STATE_MANAGEMENT,
        'Get analytics failed',
        'GET_ANALYTICS_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      return {
        totalFiltersApplied: 0,
        mostUsedFilters: {},
        filterSessionDuration: 0,
        filterChangeFrequency: 0,
        averageFilterCount: 0,
        popularCombinations: []
      };
    }
  }

  /**
   * Get state history
   */
  public getStateHistory(): UnifiedFilterState[] {
    return [...this.stateHistory];
  }

  /**
   * Undo last state change
   */
  public undo(): boolean {
    try {
      if (this.stateHistory.length === 0) {
        return false;
      }

      const previousState = this.stateHistory.pop();
      if (previousState) {
        this.state = { ...previousState };
        this.notifySubscribers();
        
        this.emit('stateUndone', {
          currentState: this.state,
          timestamp: Date.now()
        });
        
        return true;
      }
      
      return false;

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.STATE_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'Undo failed',
        'UNDO_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Validate current state
   */
  public validateState(): ValidationError[] {
    try {
      const validation = UnifiedFilterStateSchema.safeParse(this.state);
      if (!validation.success) {
        return validation.error.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: 'VALIDATION_ERROR',
          severity: 'error' as const,
          timestamp: Date.now()
        }));
      }
      return [];
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.VALIDATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.STATE_MANAGEMENT,
        'State validation failed',
        'STATE_VALIDATION_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return [];
    }
  }

  // ===== PRIVATE METHODS =====

  private setupMemoryManagement(): void {
    this.memoryManager.on('memoryAlert', (alert) => {
      this.errorHandler.handleError(
        FilterErrorType.MEMORY_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.MEMORY_MANAGEMENT,
        `Memory alert in UnifiedFilterStateManager: ${alert.message}`,
        'MEMORY_ALERT',
        { alert }
      );
    });
  }

  private setupErrorHandling(): void {
    this.errorHandler.addErrorListener({
      priority: 10,
      onError: (error) => {
        if (error.context === FilterErrorContext.STATE_MANAGEMENT) {
          this.emit('stateError', error);
        }
      }
    });
  }

  private notifySubscribers(): void {
    const currentState = this.getState();
    for (const [id, callback] of this.subscribers) {
      try {
        callback(currentState);
      } catch (error) {
        this.errorHandler.handleError(
          FilterErrorType.STATE_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.STATE_MANAGEMENT,
          'Subscriber notification failed',
          'SUBSCRIBER_NOTIFICATION_FAILED',
          { subscriberId: id, error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    }
  }

  private addToHistory(state: UnifiedFilterState): void {
    this.stateHistory.push({ ...state });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  private updateAnalytics(updates: Partial<UnifiedFilterState>): void {
    const analytics = { ...this.state.filterAnalytics };
    
    // Track filter usage
    if (updates.selectedCategories || updates.selectedBrands || updates.selectedSizes) {
      analytics.totalFiltersApplied++;
      analytics.lastFilterAction = 'filter_applied';
    }

    // Track most used filters
    const filterKeys = Object.keys(updates).filter(key => 
      key.startsWith('selected') && Array.isArray(updates[key as keyof UnifiedFilterState])
    );

    filterKeys.forEach(key => {
      const filterArray = updates[key as keyof UnifiedFilterState] as string[];
      filterArray?.forEach(filter => {
        analytics.mostUsedFilters[filter] = (analytics.mostUsedFilters[filter] || 0) + 1;
      });
    });

    this.state.filterAnalytics = analytics;
  }

  private calculateFilterChangeFrequency(): number {
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const recentUpdates = this.stateHistory.filter(state => 
      now - state.lastUpdateTime < timeWindow
    );
    return recentUpdates.length / 5; // Changes per minute
  }

  private calculateAverageFilterCount(): number {
    const filterCounts = this.stateHistory.map(state => 
      state.selectedCategories.length +
      state.selectedBrands.length +
      state.selectedSizes.length +
      state.selectedColors.length +
      state.selectedPrices.length
    );
    
    if (filterCounts.length === 0) return 0;
    return filterCounts.reduce((sum, count) => sum + count, 0) / filterCounts.length;
  }

  private getPopularCombinations(): Array<{ filters: string[]; usageCount: number }> {
    const combinations = new Map<string, number>();
    
    this.stateHistory.forEach(state => {
      const activeFilters = [
        ...state.selectedCategories,
        ...state.selectedBrands,
        ...state.selectedSizes,
        ...state.selectedColors,
        ...state.selectedPrices
      ].filter(Boolean);
      
      if (activeFilters.length > 0) {
        const key = activeFilters.sort().join('|');
        combinations.set(key, (combinations.get(key) || 0) + 1);
      }
    });

    return Array.from(combinations.entries())
      .map(([filters, usageCount]) => ({
        filters: filters.split('|'),
        usageCount
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
  }

  private getDefaultState(): UnifiedFilterState {
    return {
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-conditions'],
      brandSearchQuery: '',
      expandedSections: [],
      collapsedSections: [],
      navigationHistory: [],
      breadcrumbPath: [],
      lastUpdateTime: Date.now(),
      updateCount: 0,
      isDirty: false,
      validationErrors: [],
      filterPresets: [],
      filterAnalytics: {
        totalFiltersApplied: 0,
        mostUsedFilters: {},
        filterSessionDuration: 0
      },
      isCached: false
    };
  }
} 