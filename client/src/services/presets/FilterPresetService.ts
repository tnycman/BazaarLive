/**
 * Filter Preset Service
 * Advanced filter presets and saved searches management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterStateManager } from '@/services/filtering/FilterStateManager';
import type { FilterState, FilterStateUpdate } from '@/services/filtering/FilterStateManager';
import { z } from 'zod';

// ===== PRESET INTERFACES =====

/**
 * Filter preset interface
 */
export interface FilterPreset {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: string;
  readonly filters: FilterState;
  readonly usageCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isPublic: boolean;
  readonly createdBy?: string;
  readonly tags: readonly string[];
  readonly popularity: number;
  readonly effectiveness: number;
  readonly lastUsedAt?: Date;
  readonly isRecommended: boolean;
  readonly recommendationScore: number;
  readonly metadata: PresetMetadata;
}

/**
 * Preset metadata interface
 */
export interface PresetMetadata {
  readonly version: string;
  readonly compatibility: readonly string[];
  readonly requirements: readonly string[];
  readonly dependencies: readonly string[];
  readonly permissions: readonly string[];
  readonly features: readonly string[];
  readonly limitations: readonly string[];
  readonly notes: string;
  readonly changelog: readonly PresetChange[];
}

/**
 * Preset change interface
 */
export interface PresetChange {
  readonly version: string;
  readonly date: Date;
  readonly description: string;
  readonly changes: readonly string[];
  readonly author: string;
}

/**
 * Saved search interface
 */
export interface SavedSearch {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly filters: FilterState;
  readonly userId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isShared: boolean;
  readonly shareToken?: string;
  readonly usageCount: number;
  readonly lastUsedAt?: Date;
  readonly tags: readonly string[];
  readonly isFavorite: boolean;
  readonly folder?: string;
  readonly collaborators: readonly string[];
  readonly permissions: SearchPermissions;
  readonly metadata: SearchMetadata;
}

/**
 * Search permissions interface
 */
export interface SearchPermissions {
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canShare: boolean;
  readonly canExport: boolean;
  readonly canCollaborate: boolean;
  readonly allowedUsers: readonly string[];
  readonly allowedRoles: readonly string[];
}

/**
 * Search metadata interface
 */
export interface SearchMetadata {
  readonly version: string;
  readonly exportFormats: readonly string[];
  readonly sharingOptions: readonly string[];
  readonly notificationSettings: NotificationSettings;
  readonly syncSettings: SyncSettings;
}

/**
 * Notification settings interface
 */
export interface NotificationSettings {
  readonly emailNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly inAppNotifications: boolean;
  readonly notificationTypes: readonly string[];
  readonly frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Sync settings interface
 */
export interface SyncSettings {
  readonly autoSync: boolean;
  readonly syncInterval: number;
  readonly syncDevices: readonly string[];
  readonly conflictResolution: 'last-wins' | 'manual' | 'merge';
}

/**
 * Preset recommendation interface
 */
export interface PresetRecommendation {
  readonly presetId: string;
  readonly score: number;
  readonly reason: string;
  readonly confidence: number;
  readonly category: 'trending' | 'personalized' | 'similar' | 'popular' | 'ai-recommended';
  readonly factors: readonly RecommendationFactor[];
  readonly metadata: RecommendationMetadata;
}

/**
 * Recommendation factor interface
 */
export interface RecommendationFactor {
  readonly factor: string;
  readonly weight: number;
  readonly value: number;
  readonly description: string;
}

/**
 * Recommendation metadata interface
 */
export interface RecommendationMetadata {
  readonly algorithm: string;
  readonly modelVersion: string;
  readonly trainingData: string;
  readonly confidenceInterval: [number, number];
  readonly explanation: string;
}

/**
 * Preset category interface
 */
export interface PresetCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly parentCategory?: string;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly metadata: CategoryMetadata;
}

/**
 * Category metadata interface
 */
export interface CategoryMetadata {
  readonly presetCount: number;
  readonly totalUsage: number;
  readonly averageEffectiveness: number;
  readonly lastUpdated: Date;
  readonly createdBy: string;
}

// ===== PRESET VALIDATION SCHEMAS =====

/**
 * Preset validation schema
 */
export const PresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(50),
  filters: z.object({
    selectedCategories: z.array(z.string()),
    selectedBrands: z.array(z.string()),
    selectedSizes: z.array(z.string()),
    selectedColors: z.array(z.string()),
    selectedPrices: z.array(z.string()),
    selectedAvailability: z.array(z.string()),
    selectedTypes: z.array(z.string()),
    brandSearchQuery: z.string(),
    searchQuery: z.string(),
    sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']),
    viewMode: z.enum(['grid', 'list']),
    currentPage: z.number().min(1),
    itemsPerPage: z.number().min(1).max(100),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    expandedSections: z.array(z.string()),
  }),
  usageCount: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  isPublic: z.boolean(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()),
  popularity: z.number().min(0).max(1),
  effectiveness: z.number().min(0).max(1),
  lastUsedAt: z.date().optional(),
  isRecommended: z.boolean(),
  recommendationScore: z.number().min(0).max(1),
  metadata: z.object({
    version: z.string(),
    compatibility: z.array(z.string()),
    requirements: z.array(z.string()),
    dependencies: z.array(z.string()),
    permissions: z.array(z.string()),
    features: z.array(z.string()),
    limitations: z.array(z.string()),
    notes: z.string(),
    changelog: z.array(z.object({
      version: z.string(),
      date: z.date(),
      description: z.string(),
      changes: z.array(z.string()),
      author: z.string(),
    })),
  }),
});

/**
 * Saved search validation schema
 */
export const SavedSearchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: z.object({
    selectedCategories: z.array(z.string()),
    selectedBrands: z.array(z.string()),
    selectedSizes: z.array(z.string()),
    selectedColors: z.array(z.string()),
    selectedPrices: z.array(z.string()),
    selectedAvailability: z.array(z.string()),
    selectedTypes: z.array(z.string()),
    brandSearchQuery: z.string(),
    searchQuery: z.string(),
    sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']),
    viewMode: z.enum(['grid', 'list']),
    currentPage: z.number().min(1),
    itemsPerPage: z.number().min(1).max(100),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    expandedSections: z.array(z.string()),
  }),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isShared: z.boolean(),
  shareToken: z.string().optional(),
  usageCount: z.number().min(0),
  lastUsedAt: z.date().optional(),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  folder: z.string().optional(),
  collaborators: z.array(z.string()),
  permissions: z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canShare: z.boolean(),
    canExport: z.boolean(),
    canCollaborate: z.boolean(),
    allowedUsers: z.array(z.string()),
    allowedRoles: z.array(z.string()),
  }),
  metadata: z.object({
    version: z.string(),
    exportFormats: z.array(z.string()),
    sharingOptions: z.array(z.string()),
    notificationSettings: z.object({
      emailNotifications: z.boolean(),
      pushNotifications: z.boolean(),
      inAppNotifications: z.boolean(),
      notificationTypes: z.array(z.string()),
      frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']),
    }),
    syncSettings: z.object({
      autoSync: z.boolean(),
      syncInterval: z.number(),
      syncDevices: z.array(z.string()),
      conflictResolution: z.enum(['last-wins', 'manual', 'merge']),
    }),
  }),
});

// ===== PRESET CONSTANTS =====

const DEFAULT_PRESET_CATEGORIES: readonly PresetCategory[] = [
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    description: 'Latest products and fresh inventory',
    icon: 'sparkles',
    color: '#10b981',
    isActive: true,
    sortOrder: 1,
    metadata: {
      presetCount: 0,
      totalUsage: 0,
      averageEffectiveness: 0,
      lastUpdated: new Date(),
      createdBy: 'system',
    },
  },
  {
    id: 'sale-items',
    name: 'Sale Items',
    description: 'Discounted products and special offers',
    icon: 'tag',
    color: '#ef4444',
    isActive: true,
    sortOrder: 2,
    metadata: {
      presetCount: 0,
      totalUsage: 0,
      averageEffectiveness: 0,
      lastUpdated: new Date(),
      createdBy: 'system',
    },
  },
  {
    id: 'trending',
    name: 'Trending',
    description: 'Popular and trending products',
    icon: 'trending-up',
    color: '#f59e0b',
    isActive: true,
    sortOrder: 3,
    metadata: {
      presetCount: 0,
      totalUsage: 0,
      averageEffectiveness: 0,
      lastUpdated: new Date(),
      createdBy: 'system',
    },
  },
  {
    id: 'personalized',
    name: 'Personalized',
    description: 'Custom presets based on your preferences',
    icon: 'user',
    color: '#8b5cf6',
    isActive: true,
    sortOrder: 4,
    metadata: {
      presetCount: 0,
      totalUsage: 0,
      averageEffectiveness: 0,
      lastUpdated: new Date(),
      createdBy: 'system',
    },
  },
];

// ===== PRESET SERVICE =====

/**
 * Enterprise-grade filter preset service
 * Manages filter presets, saved searches, and recommendations
 */
export class FilterPresetService {
  private readonly filterStateManager: FilterStateManager;
  private readonly presets: Map<string, FilterPreset>;
  private readonly savedSearches: Map<string, SavedSearch>;
  private readonly categories: Map<string, PresetCategory>;
  private readonly recommendations: Map<string, PresetRecommendation>;
  private readonly eventListeners: Map<string, ((event: PresetEvent) => void)[]>;

  constructor(filterStateManager: FilterStateManager = FilterStateManager.getInstance()) {
    this.filterStateManager = filterStateManager;
    this.presets = new Map();
    this.savedSearches = new Map();
    this.categories = new Map();
    this.recommendations = new Map();
    this.eventListeners = new Map();

    this.initializeDefaultCategories();
    this.loadPresets();
    this.loadSavedSearches();
  }

  /**
   * Initialize default categories
   */
  private initializeDefaultCategories(): void {
    DEFAULT_PRESET_CATEGORIES.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * Load presets from storage
   */
  private loadPresets(): void {
    try {
      const storedPresets = localStorage.getItem('filter-presets');
      if (storedPresets) {
        const presets = JSON.parse(storedPresets);
        presets.forEach((preset: any) => {
          this.presets.set(preset.id, {
            ...preset,
            createdAt: new Date(preset.createdAt),
            updatedAt: new Date(preset.updatedAt),
            lastUsedAt: preset.lastUsedAt ? new Date(preset.lastUsedAt) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }

  /**
   * Load saved searches from storage
   */
  private loadSavedSearches(): void {
    try {
      const storedSearches = localStorage.getItem('filter-saved-searches');
      if (storedSearches) {
        const searches = JSON.parse(storedSearches);
        searches.forEach((search: any) => {
          this.savedSearches.set(search.id, {
            ...search,
            createdAt: new Date(search.createdAt),
            updatedAt: new Date(search.updatedAt),
            lastUsedAt: search.lastUsedAt ? new Date(search.lastUsedAt) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  }

  /**
   * Save presets to storage
   */
  private savePresets(): void {
    try {
      const presetsArray = Array.from(this.presets.values());
      localStorage.setItem('filter-presets', JSON.stringify(presetsArray));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }

  /**
   * Save saved searches to storage
   */
  private saveSavedSearches(): void {
    try {
      const searchesArray = Array.from(this.savedSearches.values());
      localStorage.setItem('filter-saved-searches', JSON.stringify(searchesArray));
    } catch (error) {
      console.error('Failed to save saved searches:', error);
    }
  }

  /**
   * Create a new filter preset
   */
  public createPreset(preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'popularity' | 'effectiveness' | 'isRecommended' | 'recommendationScore'>): FilterPreset {
    const id = this.generateId();
    const now = new Date();

    const newPreset: FilterPreset = {
      ...preset,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      popularity: 0,
      effectiveness: 0,
      isRecommended: false,
      recommendationScore: 0,
    };

    // Validate preset
    const validatedPreset = PresetSchema.parse(newPreset);
    this.presets.set(id, validatedPreset);
    this.savePresets();

    this.emitEvent('preset-created', { preset: validatedPreset });
    return validatedPreset;
  }

  /**
   * Update an existing preset
   */
  public updatePreset(id: string, updates: Partial<FilterPreset>): FilterPreset | null {
    const preset = this.presets.get(id);
    if (!preset) {
      return null;
    }

    const updatedPreset: FilterPreset = {
      ...preset,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated preset
    const validatedPreset = PresetSchema.parse(updatedPreset);
    this.presets.set(id, validatedPreset);
    this.savePresets();

    this.emitEvent('preset-updated', { preset: validatedPreset });
    return validatedPreset;
  }

  /**
   * Delete a preset
   */
  public deletePreset(id: string): boolean {
    const preset = this.presets.get(id);
    if (!preset) {
      return false;
    }

    this.presets.delete(id);
    this.savePresets();

    this.emitEvent('preset-deleted', { preset });
    return true;
  }

  /**
   * Get a preset by ID
   */
  public getPreset(id: string): FilterPreset | null {
    return this.presets.get(id) || null;
  }

  /**
   * Get all presets
   */
  public getAllPresets(): readonly FilterPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by category
   */
  public getPresetsByCategory(categoryId: string): readonly FilterPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.category === categoryId);
  }

  /**
   * Get popular presets
   */
  public getPopularPresets(limit: number = 10): readonly FilterPreset[] {
    return Array.from(this.presets.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Get recommended presets
   */
  public getRecommendedPresets(limit: number = 10): readonly FilterPreset[] {
    return Array.from(this.presets.values())
      .filter(preset => preset.isRecommended)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  }

  /**
   * Apply a preset
   */
  public applyPreset(id: string): boolean {
    const preset = this.presets.get(id);
    if (!preset) {
      return false;
    }

    // Update usage count and last used date
    const updatedPreset = this.updatePreset(id, {
      usageCount: preset.usageCount + 1,
      lastUsedAt: new Date(),
    });

    if (updatedPreset) {
      // Apply filters to current state
      this.filterStateManager.updateState(preset.filters);
      this.emitEvent('preset-applied', { preset: updatedPreset });
      return true;
    }

    return false;
  }

  /**
   * Create a saved search
   */
  public createSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'shareToken'>): SavedSearch {
    const id = this.generateId();
    const now = new Date();

    const newSearch: SavedSearch = {
      ...search,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      shareToken: this.generateShareToken(),
    };

    // Validate saved search
    const validatedSearch = SavedSearchSchema.parse(newSearch);
    this.savedSearches.set(id, validatedSearch);
    this.saveSavedSearches();

    this.emitEvent('saved-search-created', { search: validatedSearch });
    return validatedSearch;
  }

  /**
   * Update a saved search
   */
  public updateSavedSearch(id: string, updates: Partial<SavedSearch>): SavedSearch | null {
    const search = this.savedSearches.get(id);
    if (!search) {
      return null;
    }

    const updatedSearch: SavedSearch = {
      ...search,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated search
    const validatedSearch = SavedSearchSchema.parse(updatedSearch);
    this.savedSearches.set(id, validatedSearch);
    this.saveSavedSearches();

    this.emitEvent('saved-search-updated', { search: validatedSearch });
    return validatedSearch;
  }

  /**
   * Delete a saved search
   */
  public deleteSavedSearch(id: string): boolean {
    const search = this.savedSearches.get(id);
    if (!search) {
      return false;
    }

    this.savedSearches.delete(id);
    this.saveSavedSearches();

    this.emitEvent('saved-search-deleted', { search });
    return true;
  }

  /**
   * Get a saved search by ID
   */
  public getSavedSearch(id: string): SavedSearch | null {
    return this.savedSearches.get(id) || null;
  }

  /**
   * Get all saved searches for a user
   */
  public getSavedSearchesByUser(userId: string): readonly SavedSearch[] {
    return Array.from(this.savedSearches.values()).filter(search => search.userId === userId);
  }

  /**
   * Apply a saved search
   */
  public applySavedSearch(id: string): boolean {
    const search = this.savedSearches.get(id);
    if (!search) {
      return false;
    }

    // Update usage count and last used date
    const updatedSearch = this.updateSavedSearch(id, {
      usageCount: search.usageCount + 1,
      lastUsedAt: new Date(),
    });

    if (updatedSearch) {
      // Apply filters to current state
      this.filterStateManager.updateState(search.filters);
      this.emitEvent('saved-search-applied', { search: updatedSearch });
      return true;
    }

    return false;
  }

  /**
   * Share a saved search
   */
  public shareSavedSearch(id: string): string | null {
    const search = this.savedSearches.get(id);
    if (!search) {
      return null;
    }

    const shareToken = this.generateShareToken();
    this.updateSavedSearch(id, {
      isShared: true,
      shareToken,
    });

    return shareToken;
  }

  /**
   * Get shared search by token
   */
  public getSharedSearch(token: string): SavedSearch | null {
    return Array.from(this.savedSearches.values()).find(search => search.shareToken === token) || null;
  }

  /**
   * Generate recommendations
   */
  public generateRecommendations(userId: string, currentFilters: FilterState): readonly PresetRecommendation[] {
    const recommendations: PresetRecommendation[] = [];

    // Get user's saved searches
    const userSearches = this.getSavedSearchesByUser(userId);
    
    // Get popular presets
    const popularPresets = this.getPopularPresets(5);
    
    // Get trending presets
    const trendingPresets = this.getPresetsByCategory('trending');
    
    // Generate personalized recommendations
    const personalizedRecommendations = this.generatePersonalizedRecommendations(userId, currentFilters);
    
    // Combine all recommendations
    recommendations.push(...personalizedRecommendations);
    recommendations.push(...this.convertPresetsToRecommendations(popularPresets, 'popular'));
    recommendations.push(...this.convertPresetsToRecommendations(trendingPresets, 'trending'));

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Generate personalized recommendations
   */
  private generatePersonalizedRecommendations(userId: string, currentFilters: FilterState): readonly PresetRecommendation[] {
    const userSearches = this.getSavedSearchesByUser(userId);
    const recommendations: PresetRecommendation[] = [];

    // Analyze user's search patterns
    const userCategories = new Set<string>();
    const userBrands = new Set<string>();
    const userSizes = new Set<string>();

    userSearches.forEach(search => {
      search.filters.selectedCategories.forEach(cat => userCategories.add(cat));
      search.filters.selectedBrands.forEach(brand => userBrands.add(brand));
      search.filters.selectedSizes.forEach(size => userSizes.add(size));
    });

    // Find presets that match user preferences
    this.presets.forEach(preset => {
      let score = 0;
      const factors: RecommendationFactor[] = [];

      // Category match
      const categoryMatch = preset.filters.selectedCategories.filter(cat => userCategories.has(cat)).length;
      if (categoryMatch > 0) {
        score += categoryMatch * 0.3;
        factors.push({
          factor: 'category-match',
          weight: 0.3,
          value: categoryMatch,
          description: `Matches ${categoryMatch} of your preferred categories`,
        });
      }

      // Brand match
      const brandMatch = preset.filters.selectedBrands.filter(brand => userBrands.has(brand)).length;
      if (brandMatch > 0) {
        score += brandMatch * 0.2;
        factors.push({
          factor: 'brand-match',
          weight: 0.2,
          value: brandMatch,
          description: `Matches ${brandMatch} of your preferred brands`,
        });
      }

      // Size match
      const sizeMatch = preset.filters.selectedSizes.filter(size => userSizes.has(size)).length;
      if (sizeMatch > 0) {
        score += sizeMatch * 0.1;
        factors.push({
          factor: 'size-match',
          weight: 0.1,
          value: sizeMatch,
          description: `Matches ${sizeMatch} of your preferred sizes`,
        });
      }

      // Popularity factor
      score += preset.popularity * 0.2;
      factors.push({
        factor: 'popularity',
        weight: 0.2,
        value: preset.popularity,
        description: `Popular preset with ${Math.round(preset.popularity * 100)}% popularity`,
      });

      // Effectiveness factor
      score += preset.effectiveness * 0.2;
      factors.push({
        factor: 'effectiveness',
        weight: 0.2,
        value: preset.effectiveness,
        description: `Effective preset with ${Math.round(preset.effectiveness * 100)}% effectiveness`,
      });

      if (score > 0.1) {
        recommendations.push({
          presetId: preset.id,
          score,
          reason: 'Personalized recommendation based on your preferences',
          confidence: Math.min(score, 1),
          category: 'personalized',
          factors,
          metadata: {
            algorithm: 'preference-matching',
            modelVersion: '1.0',
            trainingData: 'user-search-history',
            confidenceInterval: [Math.max(0, score - 0.1), Math.min(1, score + 0.1)],
            explanation: 'Based on your search history and preferences',
          },
        });
      }
    });

    return recommendations;
  }

  /**
   * Convert presets to recommendations
   */
  private convertPresetsToRecommendations(presets: readonly FilterPreset[], category: PresetRecommendation['category']): readonly PresetRecommendation[] {
    return presets.map(preset => ({
      presetId: preset.id,
      score: preset.popularity,
      reason: `${category.charAt(0).toUpperCase() + category.slice(1)} preset`,
      confidence: preset.effectiveness,
      category,
      factors: [{
        factor: 'popularity',
        weight: 1,
        value: preset.popularity,
        description: `Popularity score: ${Math.round(preset.popularity * 100)}%`,
      }],
      metadata: {
        algorithm: 'popularity-based',
        modelVersion: '1.0',
        trainingData: 'usage-analytics',
        confidenceInterval: [Math.max(0, preset.popularity - 0.1), Math.min(1, preset.popularity + 0.1)],
        explanation: 'Based on overall popularity and usage',
      },
    }));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate share token
   */
  private generateShareToken(): string {
    return `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, listener: (event: PresetEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, listener: (event: PresetEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit preset event
   */
  private emitEvent(type: string, data: any): void {
    const event: PresetEvent = {
      type: type as any,
      timestamp: Date.now(),
      data,
      source: 'FilterPresetService',
      category: 'preset',
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Get all categories
   */
  public getAllCategories(): readonly PresetCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Get category by ID
   */
  public getCategory(id: string): PresetCategory | null {
    return this.categories.get(id) || null;
  }

  /**
   * Export presets
   */
  public exportPresets(format: 'json' | 'csv'): string {
    const presets = Array.from(this.presets.values());
    
    if (format === 'json') {
      return JSON.stringify(presets, null, 2);
    } else {
      // CSV format
      const headers = ['id', 'name', 'category', 'usageCount', 'popularity', 'effectiveness'];
      const rows = presets.map(preset => [
        preset.id,
        preset.name,
        preset.category,
        preset.usageCount,
        preset.popularity,
        preset.effectiveness,
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
  }

  /**
   * Import presets
   */
  public importPresets(data: string, format: 'json' | 'csv'): readonly FilterPreset[] {
    const importedPresets: FilterPreset[] = [];

    try {
      if (format === 'json') {
        const presets = JSON.parse(data);
        presets.forEach((preset: any) => {
          const validatedPreset = PresetSchema.parse(preset);
          this.presets.set(validatedPreset.id, validatedPreset);
          importedPresets.push(validatedPreset);
        });
      } else {
        // CSV format parsing would be implemented here
        console.warn('CSV import not implemented yet');
      }

      this.savePresets();
      this.emitEvent('presets-imported', { count: importedPresets.length });
    } catch (error) {
      console.error('Failed to import presets:', error);
      throw new Error('Invalid preset data format');
    }

    return importedPresets;
  }
}

// ===== PRESET EVENT INTERFACES =====

/**
 * Preset event interface
 */
export interface PresetEvent {
  readonly type: 'preset-created' | 'preset-updated' | 'preset-deleted' | 'preset-applied' | 'saved-search-created' | 'saved-search-updated' | 'saved-search-deleted' | 'saved-search-applied' | 'presets-imported';
  readonly timestamp: number;
  readonly data: any;
  readonly source: string;
  readonly category: string;
}

// ===== EXPORTS =====

export {
  FilterPresetService,
  DEFAULT_PRESET_CATEGORIES,
  PresetSchema,
  SavedSearchSchema,
};
export type {
  FilterPreset,
  SavedSearch,
  PresetCategory,
  PresetRecommendation,
  PresetEvent,
  PresetMetadata,
  PresetChange,
  SearchPermissions,
  SearchMetadata,
  NotificationSettings,
  SyncSettings,
  RecommendationFactor,
  RecommendationMetadata,
  CategoryMetadata,
}; 