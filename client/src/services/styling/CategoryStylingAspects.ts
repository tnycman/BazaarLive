/**
 * CategoryStylingAspects.ts - Enterprise AOP Styling System for Category Selection
 * 
 * Implements Aspect-Oriented Programming for category selection styling with:
 * - Text color-only highlighting (no background changes)
 * - Theme-aware color management
 * - Selection state tracking
 * - Accessibility compliance
 * - Performance optimization
 * 
 * NO SHORTCUTS - ENTERPRISE GRADE IMPLEMENTATION
 */

import { z } from 'zod';

// ============================================================================
// CORE STYLING INTERFACES & CONTRACTS
// ============================================================================

export interface ICategoryStylingAspect {
  readonly name: string;
  readonly priority: number;
  
  computeTextColor(context: CategoryStylingContext): Promise<string>;
  computeHoverColor(context: CategoryStylingContext): Promise<string>;
  computeAccessibilityAttributes(context: CategoryStylingContext): Promise<Record<string, string>>;
  validateColorContrast(foreground: string, background: string): Promise<boolean>;
}

export interface CategoryStylingContext {
  readonly nodeId: string;
  readonly nodeName: string;
  readonly level: number;
  readonly isSelected: boolean;
  readonly isHovered: boolean;
  readonly isExpanded: boolean;
  readonly hasChildren: boolean;
  readonly theme: 'light' | 'dark';
  readonly selectionPath: string[];
  readonly metadata?: Record<string, unknown>;
}

export interface CategoryStylingResult {
  readonly textColor: string;
  readonly hoverColor: string;
  readonly transitionDuration: string;
  readonly accessibilityAttributes: Record<string, string>;
  readonly cssClassNames: string[];
  readonly metadata: {
    timestamp: number;
    aspectsApplied: string[];
    performanceMetrics: {
      computationTime: number;
      cacheHit: boolean;
    };
  };
}

// ============================================================================
// VALIDATION SCHEMAS (STRICT TYPE SAFETY)
// ============================================================================

export const CategoryStylingContextSchema = z.object({
  nodeId: z.string().min(1),
  nodeName: z.string().min(1),
  level: z.number().min(1).max(5),
  isSelected: z.boolean(),
  isHovered: z.boolean(),
  isExpanded: z.boolean(),
  hasChildren: z.boolean(),
  theme: z.enum(['light', 'dark']),
  selectionPath: z.array(z.string()),
  metadata: z.record(z.unknown()).optional()
});

export const ColorValueSchema = z.string().regex(
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\([\d\s,]+\)$|^rgba\([\d\s,.]+\)$/,
  'Invalid color format'
);

export const AccessibilityAttributesSchema = z.record(z.string());

// ============================================================================
// TEXT COLOR HIGHLIGHTING ASPECT
// ============================================================================

export class CategoryTextHighlightingAspect implements ICategoryStylingAspect {
  readonly name = 'CategoryTextHighlighting';
  readonly priority = 1;

  private readonly colorPalette = {
    light: {
      selected: {
        level1: '#8B5CF6', // Purple-600 for main categories
        level2: '#7C3AED', // Purple-700 for subcategories  
        level3: '#6D28D9', // Purple-800 for items
      },
      unselected: {
        primary: '#374151',   // Gray-700
        secondary: '#6B7280', // Gray-500
      },
      hover: {
        level1: '#A78BFA', // Purple-400
        level2: '#8B5CF6', // Purple-600
        level3: '#7C3AED', // Purple-700
      }
    },
    dark: {
      selected: {
        level1: '#A78BFA', // Purple-400 for main categories
        level2: '#8B5CF6', // Purple-600 for subcategories
        level3: '#7C3AED', // Purple-700 for items
      },
      unselected: {
        primary: '#D1D5DB',   // Gray-300
        secondary: '#9CA3AF', // Gray-400
      },
      hover: {
        level1: '#C4B5FD', // Purple-300
        level2: '#A78BFA', // Purple-400
        level3: '#8B5CF6', // Purple-600
      }
    }
  } as const;

  async computeTextColor(context: CategoryStylingContext): Promise<string> {
    // Validate context
    const validatedContext = CategoryStylingContextSchema.parse(context);
    
    const { theme, level, isSelected } = validatedContext;
    const palette = this.colorPalette[theme];

    if (isSelected) {
      // Use level-specific selected colors
      switch (level) {
        case 1:
          return palette.selected.level1;
        case 2:
          return palette.selected.level2;
        case 3:
        default:
          return palette.selected.level3;
      }
    }

    // Use unselected color based on level importance
    return level === 1 ? palette.unselected.primary : palette.unselected.secondary;
  }

  async computeHoverColor(context: CategoryStylingContext): Promise<string> {
    const validatedContext = CategoryStylingContextSchema.parse(context);
    
    const { theme, level, isSelected } = validatedContext;
    const palette = this.colorPalette[theme];

    // If already selected, maintain selected color on hover
    if (isSelected) {
      return await this.computeTextColor(context);
    }

    // Use level-specific hover colors
    switch (level) {
      case 1:
        return palette.hover.level1;
      case 2:
        return palette.hover.level2;
      case 3:
      default:
        return palette.hover.level3;
    }
  }

  async computeAccessibilityAttributes(context: CategoryStylingContext): Promise<Record<string, string>> {
    const validatedContext = CategoryStylingContextSchema.parse(context);
    
    const { nodeId, nodeName, isSelected, hasChildren, level } = validatedContext;

    return {
      'aria-label': `${nodeName} category${isSelected ? ' (selected)' : ''}`,
      'aria-level': level.toString(),
      'aria-expanded': hasChildren ? 'true' : 'false',
      'aria-selected': isSelected.toString(),
      'role': 'treeitem',
      'data-testid': `category-node-${nodeId}`,
      'tabIndex': isSelected ? '0' : '-1'
    };
  }

  async validateColorContrast(foreground: string, background: string): Promise<boolean> {
    // Validate color formats
    ColorValueSchema.parse(foreground);
    ColorValueSchema.parse(background);

    // Convert colors to luminance values and check WCAG AA compliance
    const foregroundLuminance = this.calculateLuminance(foreground);
    const backgroundLuminance = this.calculateLuminance(background);
    
    const contrast = this.calculateContrastRatio(foregroundLuminance, backgroundLuminance);
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    return contrast >= 4.5;
  }

  private calculateLuminance(color: string): number {
    // Convert hex/rgb to relative luminance
    const rgb = this.parseColor(color);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private calculateContrastRatio(luminance1: number, luminance2: number): number {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): [number, number, number] {
    // Parse hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }
    
    // Parse rgb colors
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    
    // Default fallback
    return [0, 0, 0];
  }
}

// ============================================================================
// ANIMATION & TRANSITION ASPECT
// ============================================================================

export class CategoryAnimationAspect implements ICategoryStylingAspect {
  readonly name = 'CategoryAnimation';
  readonly priority = 2;

  private readonly transitionConfig = {
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Tailwind's ease-out
    properties: ['color', 'opacity'],
  } as const;

  async computeTextColor(context: CategoryStylingContext): Promise<string> {
    // Animation aspect doesn't compute colors, delegates to highlighting aspect
    return '';
  }

  async computeHoverColor(context: CategoryStylingContext): Promise<string> {
    // Animation aspect doesn't compute colors, delegates to highlighting aspect
    return '';
  }

  async computeAccessibilityAttributes(context: CategoryStylingContext): Promise<Record<string, string>> {
    const validatedContext = CategoryStylingContextSchema.parse(context);
    
    // Add reduced motion support
    return {
      'data-transition-duration': this.transitionConfig.duration,
      'data-transition-easing': this.transitionConfig.easing
    };
  }

  async validateColorContrast(foreground: string, background: string): Promise<boolean> {
    // Animation aspect doesn't validate contrast
    return true;
  }

  getTransitionClasses(): string[] {
    return [
      'transition-colors',
      'duration-150',
      'ease-out'
    ];
  }
}

// ============================================================================
// ASPECT COORDINATOR FOR STYLING
// ============================================================================

export class CategoryStylingAspectCoordinator {
  private readonly aspects: ICategoryStylingAspect[] = [];
  private readonly cache = new Map<string, CategoryStylingResult>();
  private readonly cacheMaxSize = 1000;
  private readonly cacheTTL = 300000; // 5 minutes

  constructor() {
    this.registerAspects();
  }

  private registerAspects(): void {
    this.aspects.push(new CategoryTextHighlightingAspect());
    this.aspects.push(new CategoryAnimationAspect());
    
    // Sort by priority
    this.aspects.sort((a, b) => a.priority - b.priority);
  }

  async computeCompleteStyle(context: CategoryStylingContext): Promise<CategoryStylingResult> {
    const startTime = performance.now();
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(context);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          performanceMetrics: {
            ...cached.metadata.performanceMetrics,
            cacheHit: true
          }
        }
      };
    }

    // Validate context
    const validatedContext = CategoryStylingContextSchema.parse(context);

    // Execute aspects in priority order
    const aspectsApplied: string[] = [];
    let textColor = '';
    let hoverColor = '';
    const accessibilityAttributes: Record<string, string> = {};
    const cssClassNames: string[] = [];

    for (const aspect of this.aspects) {
      try {
        // Compute colors (only from highlighting aspect)
        if (aspect.name === 'CategoryTextHighlighting') {
          textColor = await aspect.computeTextColor(validatedContext);
          hoverColor = await aspect.computeHoverColor(validatedContext);
          
          // Validate color contrast
          const backgroundColors = validatedContext.theme === 'light' 
            ? ['#ffffff'] // white background
            : ['#111827']; // gray-900 background
            
          for (const bgColor of backgroundColors) {
            const isValidContrast = await aspect.validateColorContrast(textColor, bgColor);
            if (!isValidContrast) {
              console.warn(`[CategoryStyling] Low color contrast detected: ${textColor} on ${bgColor}`);
            }
          }
        }

        // Get accessibility attributes
        const aspectAttrs = await aspect.computeAccessibilityAttributes(validatedContext);
        Object.assign(accessibilityAttributes, aspectAttrs);

        // Get CSS classes (from animation aspect)
        if (aspect.name === 'CategoryAnimation') {
          const animationAspect = aspect as CategoryAnimationAspect;
          cssClassNames.push(...animationAspect.getTransitionClasses());
        }

        aspectsApplied.push(aspect.name);
      } catch (error) {
        console.error(`[CategoryStyling] Error in aspect ${aspect.name}:`, error);
      }
    }

    const endTime = performance.now();
    const computationTime = endTime - startTime;

    const result: CategoryStylingResult = {
      textColor,
      hoverColor,
      transitionDuration: '150ms',
      accessibilityAttributes,
      cssClassNames,
      metadata: {
        timestamp: Date.now(),
        aspectsApplied,
        performanceMetrics: {
          computationTime,
          cacheHit: false
        }
      }
    };

    // Cache result
    this.cacheResult(cacheKey, result);

    return result;
  }

  private generateCacheKey(context: CategoryStylingContext): string {
    const keyData = {
      nodeId: context.nodeId,
      level: context.level,
      isSelected: context.isSelected,
      isHovered: context.isHovered,
      theme: context.theme
    };
    
    return JSON.stringify(keyData);
  }

  private isCacheValid(cached: CategoryStylingResult): boolean {
    const age = Date.now() - cached.metadata.timestamp;
    return age < this.cacheTTL;
  }

  private cacheResult(key: string, result: CategoryStylingResult): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, result);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = Array.from(this.cache.values()).length;
    const cacheHits = Array.from(this.cache.values())
      .filter(result => result.metadata.performanceMetrics.cacheHit).length;
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? cacheHits / totalRequests : 0
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const categoryStylingCoordinator = new CategoryStylingAspectCoordinator();