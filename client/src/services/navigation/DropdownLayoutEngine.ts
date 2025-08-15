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
  /** Horizontal offset from the left edge of the viewport to align container */
  offsetLeft: number;
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
  /** Optional left anchor (px from viewport left) to align the grid under a specific nav item */
  anchorLeft?: number;
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
      },
      offsetLeft: 0
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
      },
      offsetLeft: Math.max(0, (viewportWidth - Math.min(viewportWidth * 0.9, containerConstraints.maxWidth)) / 2)
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
 * Contained Full-Width Strategy
 * Renders full-width backdrop, but constrains inner grid to a site container and centers it
 */
export class ContainedFullWidthStrategy implements IDropdownLayoutStrategy {
  calculateLayout(config: DropdownLayoutConfig): DropdownDimensions {
    const { viewportWidth, category, accessibility, containerConstraints, anchorLeft } = config;

    const baseColumns = this.getBaseColumnsForCategory(category);
    const columns = this.getOptimalColumnCount(baseColumns, viewportWidth);

    const containerWidth = Math.min(viewportWidth, containerConstraints.maxWidth);
    const centeredOffset = Math.max(0, (viewportWidth - containerWidth) / 2);
    // If an anchor is provided (e.g., left edge of "Feed"), align the container's left to that anchor
    const offsetLeft = typeof anchorLeft === 'number' ? Math.max(0, Math.min(anchorLeft, viewportWidth - containerWidth)) : centeredOffset;
    const accessibilityMultiplier = accessibility.largeText ? 1.2 : 1;

    return {
      width: containerWidth,
      height: this.calculateHeight(columns, accessibilityMultiplier),
      columns,
      rows: Math.ceil(baseColumns / columns),
      gap: accessibility.highContrast ? 24 : 20,
      padding: {
        top: 24 * accessibilityMultiplier,
        bottom: 24 * accessibilityMultiplier,
        left: 0,
        right: 0
      },
      offsetLeft
    };
  }

  getOptimalColumnCount(itemCount: number, viewportWidth: number): number {
    if (viewportWidth >= 1400) return Math.min(6, itemCount);
    if (viewportWidth >= 1200) return Math.min(5, itemCount);
    if (viewportWidth >= 1024) return Math.min(4, itemCount);
    return Math.min(3, itemCount);
  }

  calculateItemDimensions(totalItems: number, layout: DropdownDimensions): {
    itemWidth: number;
    itemHeight: number;
  } {
    const availableWidth = layout.width - layout.padding.left - layout.padding.right;
    const itemWidth = (availableWidth - (layout.gap * (layout.columns - 1))) / layout.columns;
    return {
      itemWidth: Math.max(itemWidth, 180),
      itemHeight: 260
    };
  }

  private getBaseColumnsForCategory(category: string): number {
    const map: Record<string, number> = {
      'Women': 6,
      'Men': 5,
      'Kids': 4,
      'Brands': 6,
      'Home & Garden': 4,
      'Electronics': 4,
      'Sports & Outdoors': 4,
      'Beauty & Wellness': 4
    };
    return map[category] || 4;
  }

  private calculateHeight(columns: number, multiplier: number): number {
    const base = 360;
    const adjust = Math.max(0, (columns - 4) * 40);
    return (base + adjust) * multiplier;
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
    this.strategies.set('contained', new ContainedFullWidthStrategy());
    
    // Default to full-width strategy (Poshmark-style)
    this.currentStrategy = this.strategies.get('contained')!;
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
   * Roll back to the default fullwidth strategy
   */
  rollbackToFullWidth(): void {
    const full = this.strategies.get('fullwidth');
    if (full) {
      this.currentStrategy = full;
      this.clearCache();
    } else {
      console.warn('[DropdownLayoutEngine] Fullwidth strategy not registered; rollback skipped');
    }
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
      },
      // Anchor optional; the consumer can call calculateLayout for custom anchoring if needed
    };

    return this.calculateLayout(config);
  }

  /**
   * Compute layout with a specific left anchor to align under a nav item (e.g., "Feed")
   */
  getAnchoredLayout(category: string, anchorLeft: number): DropdownDimensions {
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
      },
      anchorLeft
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
    // There is no broadly supported media query for "large text". This should be
    // wired to an application-level accessibility preference if available.
    // Default to false to avoid incorrect behavior.
    return false;
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