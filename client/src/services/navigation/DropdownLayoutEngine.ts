/**
 * Dropdown Layout Engine - Enterprise Layout Management
 * Implements Strategy Pattern for different dropdown layouts
 */

export interface DropdownDimensions {
  width: number;
  height: number;
  columns: number;
  rows: number;
  gap: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface DropdownLayoutConfig {
  category: string;
  viewportWidth: number;
  viewportHeight: number;
  containerConstraints: {
    maxWidth: number;
    maxHeight: number;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

/**
 * Layout Strategy Interface
 */
export interface IDropdownLayoutStrategy {
  calculateLayout(config: DropdownLayoutConfig): DropdownDimensions;
  getOptimalColumnCount(itemCount: number, viewportWidth: number): number;
  calculateItemDimensions(totalItems: number, layout: DropdownDimensions): {
    itemWidth: number;
    itemHeight: number;
  };
}

/**
 * Full-Width Layout Strategy (Poshmark-style)
 */
export class FullWidthLayoutStrategy implements IDropdownLayoutStrategy {
  calculateLayout(config: DropdownLayoutConfig): DropdownDimensions {
    const { viewportWidth, category, accessibility } = config;
    
    // Base calculations for full-width layout
    const baseColumns = this.getBaseColumnsForCategory(category);
    const columns = this.getOptimalColumnCount(baseColumns, viewportWidth);
    
    // Accessibility adjustments
    const accessibilityMultiplier = accessibility.largeText ? 1.2 : 1;
    const gapSize = accessibility.highContrast ? 32 : 24;
    
    return {
      width: viewportWidth, // True full width
      height: this.calculateHeight(columns, accessibilityMultiplier),
      columns,
      rows: Math.ceil(baseColumns / columns),
      gap: gapSize,
      padding: {
        top: 32 * accessibilityMultiplier,
        bottom: 32 * accessibilityMultiplier,
        left: 0, // No left padding for true edge-to-edge
        right: 0, // No right padding for true edge-to-edge
      }
    };
  }

  getOptimalColumnCount(itemCount: number, viewportWidth: number): number {
    // Responsive column calculation
    if (viewportWidth >= 1400) return Math.min(6, itemCount);
    if (viewportWidth >= 1200) return Math.min(5, itemCount);
    if (viewportWidth >= 1024) return Math.min(4, itemCount);
    if (viewportWidth >= 768) return Math.min(3, itemCount);
    return Math.min(2, itemCount);
  }

  calculateItemDimensions(totalItems: number, layout: DropdownDimensions): {
    itemWidth: number;
    itemHeight: number;
  } {
    const availableWidth = layout.width - layout.padding.left - layout.padding.right;
    const itemWidth = (availableWidth - (layout.gap * (layout.columns - 1))) / layout.columns;
    
    return {
      itemWidth: Math.max(itemWidth, 200), // Minimum width
      itemHeight: 280 // Standard item height
    };
  }

  private getBaseColumnsForCategory(category: string): number {
    const categoryColumnMap: Record<string, number> = {
      'Women': 6,
      'Men': 5,
      'Kids': 4,
      'Brands': 6,
      'Home & Garden': 4,
      'Electronics': 4,
      'Sports & Outdoors': 4,
      'Beauty & Wellness': 4
    };
    
    return categoryColumnMap[category] || 4;
  }

  private calculateHeight(columns: number, accessibilityMultiplier: number): number {
    // Base height calculation considering content density
    const baseHeight = 400;
    const columnAdjustment = Math.max(0, (columns - 4) * 50);
    return (baseHeight + columnAdjustment) * accessibilityMultiplier;
  }
}

/**
 * Compact Layout Strategy
 */
export class CompactLayoutStrategy implements IDropdownLayoutStrategy {
  calculateLayout(config: DropdownLayoutConfig): DropdownDimensions {
    const { viewportWidth, containerConstraints } = config;
    
    return {
      width: Math.min(viewportWidth * 0.9, containerConstraints.maxWidth),
      height: 320,
      columns: this.getOptimalColumnCount(4, viewportWidth),
      rows: 2,
      gap: 16,
      padding: {
        top: 24,
        bottom: 24,
        left: 24,
        right: 24
      }
    };
  }

  getOptimalColumnCount(itemCount: number, viewportWidth: number): number {
    if (viewportWidth >= 1024) return 4;
    if (viewportWidth >= 768) return 3;
    return 2;
  }

  calculateItemDimensions(totalItems: number, layout: DropdownDimensions): {
    itemWidth: number;
    itemHeight: number;
  } {
    const availableWidth = layout.width - layout.padding.left - layout.padding.right;
    
    return {
      itemWidth: (availableWidth - (layout.gap * (layout.columns - 1))) / layout.columns,
      itemHeight: 120
    };
  }
}

/**
 * Layout Engine with Strategy Pattern
 */
export class DropdownLayoutEngine {
  private strategies = new Map<string, IDropdownLayoutStrategy>();
  private currentStrategy: IDropdownLayoutStrategy;
  private layoutCache = new Map<string, DropdownDimensions>();
  private readonly cacheTimeout = 5000; // 5 seconds

  constructor() {
    // Register layout strategies
    this.strategies.set('fullwidth', new FullWidthLayoutStrategy());
    this.strategies.set('compact', new CompactLayoutStrategy());
    
    // Default to full-width strategy (Poshmark-style)
    this.currentStrategy = this.strategies.get('fullwidth')!;
  }

  /**
   * Set layout strategy
   */
  setStrategy(strategyName: string): boolean {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      console.error(`[DropdownLayoutEngine] Unknown strategy: ${strategyName}`);
      return false;
    }
    
    this.currentStrategy = strategy;
    this.clearCache(); // Clear cache when strategy changes
    return true;
  }

  /**
   * Calculate layout with caching
   */
  calculateLayout(config: DropdownLayoutConfig): DropdownDimensions {
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache first
    const cached = this.layoutCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate new layout
    const layout = this.currentStrategy.calculateLayout(config);
    
    // Validate layout
    if (!this.validateLayout(layout)) {
      console.error('[DropdownLayoutEngine] Invalid layout calculated:', layout);
      return this.getFallbackLayout();
    }

    // Cache result
    this.layoutCache.set(cacheKey, layout);
    
    // Clear cache after timeout
    setTimeout(() => {
      this.layoutCache.delete(cacheKey);
    }, this.cacheTimeout);

    return layout;
  }

  /**
   * Get responsive layout for current viewport
   */
  getResponsiveLayout(category: string): DropdownDimensions {
    const config: DropdownLayoutConfig = {
      category,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
      containerConstraints: {
        maxWidth: 1400,
        maxHeight: 600
      },
      accessibility: {
        highContrast: this.detectHighContrast(),
        largeText: this.detectLargeText(),
        reducedMotion: this.detectReducedMotion()
      }
    };

    return this.calculateLayout(config);
  }

  /**
   * Register custom layout strategy
   */
  registerStrategy(name: string, strategy: IDropdownLayoutStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Clear layout cache
   */
  clearCache(): void {
    this.layoutCache.clear();
  }

  /**
   * Generate cache key for layout config
   */
  private generateCacheKey(config: DropdownLayoutConfig): string {
    return `${config.category}-${config.viewportWidth}x${config.viewportHeight}-${JSON.stringify(config.accessibility)}`;
  }

  /**
   * Validate calculated layout
   */
  private validateLayout(layout: DropdownDimensions): boolean {
    return (
      layout.width > 0 &&
      layout.height > 0 &&
      layout.columns > 0 &&
      layout.rows > 0 &&
      layout.gap >= 0 &&
      layout.padding.top >= 0 &&
      layout.padding.bottom >= 0 &&
      layout.padding.left >= 0 &&
      layout.padding.right >= 0
    );
  }

  /**
   * Get fallback layout for error cases
   */
  private getFallbackLayout(): DropdownDimensions {
    return {
      width: 1200,
      height: 400,
      columns: 4,
      rows: 2,
      gap: 24,
      padding: {
        top: 32,
        bottom: 32,
        left: 0,
        right: 0
      }
    };
  }

  /**
   * Detect high contrast preference
   */
  private detectHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Detect large text preference
   */
  private detectLargeText(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-data: reduce)').matches;
  }

  /**
   * Detect reduced motion preference
   */
  private detectReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

export const dropdownLayoutEngine = new DropdownLayoutEngine();