/**
 * Navigation Aspects - AOP Implementation
 * Separates cross-cutting concerns for navigation system
 */

export interface INavigationAspect {
  before?(context: NavigationContext): void;
  after?(context: NavigationContext, result?: any): void;
  around?(context: NavigationContext, proceed: () => any): any;
}

export interface NavigationContext {
  action: 'hover' | 'click' | 'leave';
  category: string;
  target?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Logging Aspect - Tracks all navigation interactions
 */
export class NavigationLoggingAspect implements INavigationAspect {
  before(context: NavigationContext): void {
    console.debug(`[Navigation] ${context.action.toUpperCase()} on ${context.category}`, {
      timestamp: context.timestamp,
      metadata: context.metadata
    });
  }

  after(context: NavigationContext, result?: any): void {
    console.debug(`[Navigation] ${context.action.toUpperCase()} completed for ${context.category}`, {
      result,
      duration: Date.now() - context.timestamp
    });
  }
}

/**
 * Performance Aspect - Monitors navigation performance
 */
export class NavigationPerformanceAspect implements INavigationAspect {
  private performanceMetrics = new Map<string, number>();

  before(context: NavigationContext): void {
    const key = `${context.action}-${context.category}`;
    this.performanceMetrics.set(key, performance.now());
  }

  after(context: NavigationContext): void {
    const key = `${context.action}-${context.category}`;
    const startTime = this.performanceMetrics.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (duration > 100) { // Alert if navigation takes > 100ms
        console.warn(`[Navigation Performance] Slow navigation detected: ${key} took ${duration.toFixed(2)}ms`);
      }
      this.performanceMetrics.delete(key);
    }
  }
}

/**
 * Security Aspect - Validates navigation security
 */
export class NavigationSecurityAspect implements INavigationAspect {
  private readonly allowedCategories = new Set([
    'Women', 'Men', 'Kids', 'Home', 'Electronics', 'Pets',
    'Sports & Outdoors', 'Beauty & Wellness', 'Brands', ''
  ]);

  before(context: NavigationContext): void {
    // Skip validation for empty category (during leave events)
    if (context.category === '' && context.action === 'leave') {
      return;
    }
    
    if (!this.allowedCategories.has(context.category)) {
      console.warn(`[Navigation Security] Unknown category: ${context.category}. Adding to allowed list.`);
      this.allowedCategories.add(context.category);
    }
    
    // Prevent XSS in category names
    if (this.containsXSS(context.category)) {
      throw new Error(`[Navigation Security] XSS attempt detected in category: ${context.category}`);
    }
  }

  private containsXSS(input: string): boolean {
    const xssPattern = /<script|javascript:|on\w+\s*=/i;
    return xssPattern.test(input);
  }
}

/**
 * Analytics Aspect - Tracks navigation analytics
 */
export class NavigationAnalyticsAspect implements INavigationAspect {
  after(context: NavigationContext): void {
    // Send analytics data (would integrate with analytics service)
    this.trackEvent('navigation_interaction', {
      action: context.action,
      category: context.category,
      target: context.target,
      timestamp: context.timestamp
    });
  }

  private trackEvent(eventName: string, data: Record<string, any>): void {
    // Analytics integration point
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
  }
}

/**
 * AOP Proxy Factory for Navigation
 */
export class NavigationAOPProxy {
  private aspects: INavigationAspect[] = [];

  constructor() {
    // Register default aspects
    this.addAspect(new NavigationLoggingAspect());
    this.addAspect(new NavigationPerformanceAspect());
    this.addAspect(new NavigationSecurityAspect());
    this.addAspect(new NavigationAnalyticsAspect());
  }

  addAspect(aspect: INavigationAspect): void {
    this.aspects.push(aspect);
  }

  executeWithAspects<T>(
    context: NavigationContext, 
    operation: () => T
  ): T {
    // Execute 'before' advice
    this.aspects.forEach(aspect => {
      if (aspect.before) {
        try {
          aspect.before(context);
        } catch (error) {
          console.error(`[Navigation AOP] Before aspect failed:`, error);
          throw error;
        }
      }
    });

    let result: T;
    try {
      // Execute the main operation
      result = operation();
    } catch (error) {
      console.error(`[Navigation AOP] Operation failed:`, error);
      throw error;
    }

    // Execute 'after' advice
    this.aspects.forEach(aspect => {
      if (aspect.after) {
        try {
          aspect.after(context, result);
        } catch (error) {
          console.error(`[Navigation AOP] After aspect failed:`, error);
          // Don't throw here to avoid breaking the main flow
        }
      }
    });

    return result;
  }
}

export const navigationAOP = new NavigationAOPProxy();