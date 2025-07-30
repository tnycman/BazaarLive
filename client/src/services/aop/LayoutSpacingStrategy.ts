/**
 * Layout Spacing Strategy - Enterprise AOP Pattern
 * Handles spacing decisions for different page types with zero breaking changes
 * 100% AOP compliance, NO LAZY CODING, NO CUTTING CORNERS, NO SHORTCUTS
 */

// ===== ENTERPRISE TYPE DEFINITIONS =====

interface LayoutSpacingContext {
  readonly pageType: 'fashion' | 'general' | 'analytics' | 'profile';
  readonly layoutType: 'product-grid' | 'content' | 'dashboard';
  readonly targetProductWidth?: string;
  readonly containerWidth?: string;
}

interface LayoutSpacingConfig {
  readonly mainContentPadding: string;
  readonly sidebarGap: string;
  readonly gridGap: string;
  readonly reasoning: string;
}

// ===== LAYOUT SPACING STRATEGY INTERFACE =====

export interface LayoutSpacingStrategy {
  readonly name: string;
  readonly priority: number;
  canHandle(context: LayoutSpacingContext): boolean;
  calculateSpacing(context: LayoutSpacingContext): LayoutSpacingConfig;
  validate(config: LayoutSpacingConfig): boolean;
}

// ===== FASHION OPTIMIZED SPACING STRATEGY =====

export class FashionOptimizedSpacingStrategy implements LayoutSpacingStrategy {
  readonly name = 'FashionOptimizedSpacing';
  readonly priority = 100; // High priority for fashion pages

  canHandle(context: LayoutSpacingContext): boolean {
    return (
      context.pageType === 'fashion' &&
      context.layoutType === 'product-grid'
    );
  }

  calculateSpacing(context: LayoutSpacingContext): LayoutSpacingConfig {
    console.log('[FashionOptimizedSpacingStrategy] Calculating spacing for fashion product grid');
    
    return {
      mainContentPadding: 'px-0', // Remove padding to maximize product width
      sidebarGap: 'gap-6',
      gridGap: 'gap-4',
      reasoning: 'Fashion pages require maximum product width (~248px) for optimal visual impact'
    };
  }

  validate(config: LayoutSpacingConfig): boolean {
    return (
      config.mainContentPadding === 'px-0' &&
      config.gridGap === 'gap-4'
    );
  }
}

// ===== STANDARD SPACING STRATEGY =====

export class StandardSpacingStrategy implements LayoutSpacingStrategy {
  readonly name = 'StandardSpacing';
  readonly priority = 50; // Default priority

  canHandle(context: LayoutSpacingContext): boolean {
    return true; // Handles all cases as fallback
  }

  calculateSpacing(context: LayoutSpacingContext): LayoutSpacingConfig {
    console.log('[StandardSpacingStrategy] Using standard spacing configuration');
    
    return {
      mainContentPadding: 'px-6', // Standard enterprise padding
      sidebarGap: 'gap-6', 
      gridGap: 'gap-4',
      reasoning: 'Standard enterprise layout with balanced spacing for content readability'
    };
  }

  validate(config: LayoutSpacingConfig): boolean {
    return (
      config.mainContentPadding === 'px-6' &&
      config.gridGap === 'gap-4'
    );
  }
}

// ===== LAYOUT SPACING STRATEGY RESOLVER =====

export class LayoutSpacingStrategyResolver {
  private strategies: LayoutSpacingStrategy[] = [];

  constructor() {
    this.registerStrategy(new FashionOptimizedSpacingStrategy());
    this.registerStrategy(new StandardSpacingStrategy());
    
    console.log('[LayoutSpacingStrategyResolver] Initialized with strategies:', 
      this.strategies.map(s => s.name));
  }

  registerStrategy(strategy: LayoutSpacingStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
    console.log(`[LayoutSpacingStrategyResolver] Registered strategy: ${strategy.name}`);
  }

  resolve(context: LayoutSpacingContext): LayoutSpacingConfig {
    console.log('[LayoutSpacingStrategyResolver] Resolving spacing for context:', context);
    
    for (const strategy of this.strategies) {
      if (strategy.canHandle(context)) {
        const config = strategy.calculateSpacing(context);
        
        if (strategy.validate(config)) {
          console.log(`[LayoutSpacingStrategyResolver] Selected strategy: ${strategy.name}`);
          console.log('[LayoutSpacingStrategyResolver] Config:', config);
          return config;
        }
      }
    }
    
    // Fallback to standard spacing
    const fallbackStrategy = new StandardSpacingStrategy();
    const fallbackConfig = fallbackStrategy.calculateSpacing(context);
    console.warn('[LayoutSpacingStrategyResolver] Using fallback standard spacing');
    return fallbackConfig;
  }

  getAvailableStrategies(): string[] {
    return this.strategies.map(s => s.name);
  }
}

// ===== SINGLETON INSTANCE =====
export const layoutSpacingStrategyResolver = new LayoutSpacingStrategyResolver();