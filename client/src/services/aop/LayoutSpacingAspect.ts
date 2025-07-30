/**
 * Layout Spacing Aspect - Enterprise AOP Cross-Cutting Concern
 * Intercepts layout rendering to apply appropriate spacing strategies
 * 100% AOP compliance, NO LAZY CODING, NO CUTTING CORNERS, NO SHORTCUTS
 */

import { layoutSpacingStrategyResolver, type LayoutSpacingStrategy } from './LayoutSpacingStrategy';

// ===== ENTERPRISE TYPE DEFINITIONS =====

interface LayoutSpacingContext {
  readonly pageType: 'fashion' | 'general' | 'analytics' | 'profile';
  readonly layoutType: 'product-grid' | 'content' | 'dashboard';
  readonly targetProductWidth?: string;
  readonly containerWidth?: string;
}

interface LayoutSpacingMetrics {
  readonly strategyUsed: string;
  readonly spacingCalculationTime: number;
  readonly configApplied: boolean;
  readonly timestamp: string;
}

// ===== LAYOUT SPACING ASPECT =====

export class LayoutSpacingAspect {
  private static instance: LayoutSpacingAspect | null = null;
  private metrics: LayoutSpacingMetrics[] = [];

  private constructor() {
    console.log('[LayoutSpacingAspect] Initialized layout spacing cross-cutting concern');
  }

  public static getInstance(): LayoutSpacingAspect {
    if (!LayoutSpacingAspect.instance) {
      LayoutSpacingAspect.instance = new LayoutSpacingAspect();
    }
    return LayoutSpacingAspect.instance;
  }

  /**
   * Apply spacing strategy based on page context
   * Enterprise method with comprehensive logging and metrics
   */
  public applySpacingStrategy(context: LayoutSpacingContext): string {
    const startTime = performance.now();
    
    console.log('[LayoutSpacingAspect] Applying spacing strategy for context:', context);
    
    try {
      // Resolve appropriate spacing strategy
      const spacingConfig = layoutSpacingStrategyResolver.resolve(context);
      
      // Calculate metrics
      const calculationTime = Math.round(performance.now() - startTime);
      
      // Record metrics
      const metrics: LayoutSpacingMetrics = {
        strategyUsed: this.identifyStrategy(context),
        spacingCalculationTime: calculationTime,
        configApplied: true,
        timestamp: new Date().toISOString()
      };
      
      this.metrics.push(metrics);
      
      console.log('[LayoutSpacingAspect] Applied spacing config:', spacingConfig);
      console.log('[LayoutSpacingAspect] Calculation completed in:', `${calculationTime}ms`);
      
      return spacingConfig.mainContentPadding;
      
    } catch (error) {
      console.error('[LayoutSpacingAspect] Error applying spacing strategy:', error);
      
      // Record error metrics
      const errorMetrics: LayoutSpacingMetrics = {
        strategyUsed: 'FALLBACK',
        spacingCalculationTime: Math.round(performance.now() - startTime),
        configApplied: false,
        timestamp: new Date().toISOString()
      };
      
      this.metrics.push(errorMetrics);
      
      // Return safe fallback
      return 'px-6';
    }
  }

  /**
   * Determine page type from component context
   */
  public detectPageType(componentName?: string, props?: any): 'fashion' | 'general' {
    if (!componentName && !props) {
      return 'general';
    }

    // Fashion page detection logic
    const fashionIndicators = [
      'fashion',
      'product',
      'grid',
      'listing',
      'marketplace',
      'category'
    ];

    const componentNameLower = componentName?.toLowerCase() || '';
    const isFashionComponent = fashionIndicators.some(indicator => 
      componentNameLower.includes(indicator)
    );

    // Check props for fashion-related data
    const hasFashionProps = props && (
      props.products ||
      props.listings ||
      props.category ||
      props.gridColumns
    );

    const pageType = (isFashionComponent || hasFashionProps) ? 'fashion' : 'general';
    
    console.log('[LayoutSpacingAspect] Detected page type:', pageType, {
      componentName,
      isFashionComponent,
      hasFashionProps
    });
    
    return pageType;
  }

  /**
   * Create layout context for spacing decisions
   */
  public createLayoutContext(
    pageType: 'fashion' | 'general',
    layoutType: 'product-grid' | 'content' = 'product-grid',
    targetProductWidth?: string
  ): LayoutSpacingContext {
    return {
      pageType,
      layoutType,
      targetProductWidth: targetProductWidth || '248px',
      containerWidth: 'max-w-7xl'
    };
  }

  /**
   * Get spacing metrics for monitoring
   */
  public getSpacingMetrics(): LayoutSpacingMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get current spacing performance statistics
   */
  public getPerformanceStats() {
    const totalMetrics = this.metrics.length;
    const successfulApplications = this.metrics.filter(m => m.configApplied).length;
    const averageCalculationTime = totalMetrics > 0 
      ? this.metrics.reduce((sum, m) => sum + m.spacingCalculationTime, 0) / totalMetrics
      : 0;

    const strategyUsage = this.metrics.reduce((acc, m) => {
      acc[m.strategyUsed] = (acc[m.strategyUsed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications: totalMetrics,
      successRate: totalMetrics > 0 ? (successfulApplications / totalMetrics) * 100 : 0,
      averageCalculationTime: Math.round(averageCalculationTime * 100) / 100,
      strategyUsage,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Identify which strategy would be used for given context
   */
  private identifyStrategy(context: LayoutSpacingContext): string {
    if (context.pageType === 'fashion' && context.layoutType === 'product-grid') {
      return 'FashionOptimizedSpacing';
    }
    return 'StandardSpacing';
  }

  /**
   * Clear metrics (for testing purposes)
   */
  public clearMetrics(): void {
    this.metrics = [];
    console.log('[LayoutSpacingAspect] Metrics cleared');
  }
}

// ===== SINGLETON EXPORT =====
export const layoutSpacingAspect = LayoutSpacingAspect.getInstance();