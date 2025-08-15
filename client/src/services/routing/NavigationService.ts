// Navigation service for generating dynamic routes with AOP principles
// 
// @deprecated The generateUniversalRoute method is being replaced by UnifiedCategoryRoutingService
// for consistency across all categories. Use UnifiedCategoryRoutingService instead.
// Migration: Replace navigationService.generateUniversalRoute() with 
// unifiedCategoryRoutingService.generateCategoryRoute()
import { slugify } from './RouteUtils';

export class NavigationService {
  private static instance: NavigationService;

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Generate dynamic route for navigation items based on category and vertical
   */
  public generateCategoryRoute(category: string, item: string, vertical?: string): string {
    console.warn('[NavigationService] generateCategoryRoute is deprecated. Use generateUniversalRoute directly.');
    return this.generateUniversalRoute({
      vertical: vertical ?? 'fashion',
      category,
      subcategory: item,
    });
  }

  /**
   * Generate brand route
   */
  public generateBrandRoute(brand: string, category?: string): string {
    const brandSlug = slugify(brand);
    
    if (category) {
      const categorySlug = slugify(category);
      return `/fashion/brands/${brandSlug}/${categorySlug}`;
    }
    
    return `/fashion/brands/${brandSlug}`;
  }

  /**
   * Generate brand segment route (e.g., all women's brands)
   */
  public generateBrandSegmentRoute(segment: 'women' | 'men' | 'kids' | 'home' | 'electronics'): string {
    const segmentSlug = slugify(segment);
    return `/fashion/brands/segments/${segmentSlug}`;
  }

  /**
   * Generate brand index route (/fashion/brands)
   */
  public generateBrandIndexRoute(): string {
    return `/fashion/brands`;
  }

  /**
   * Generate section route for "Shop All" links
   */
  public generateSectionRoute(sectionTitle: string, vertical?: string): string {
    console.warn('[NavigationService] generateSectionRoute is deprecated. Use generateUniversalRoute directly.');
    return this.generateUniversalRoute({ vertical: vertical ?? 'fashion', category: sectionTitle });
  }

  /**
   * Determine appropriate vertical based on category context
   */
  // determineVertical removed; all callers must pass explicit verticals

  /**
   * Generate a universal route compatible with UniversalCategoryPage
   * @deprecated Use UnifiedCategoryRoutingService.generateCategoryRoute() instead
   */
  public generateUniversalRoute(args: {
    vertical: string;
    category?: string;
    subcategory?: string;
  }): string {
    const vertical = slugify(args.vertical);
    const category = args.category ? slugify(args.category) : undefined;
    const subcategory = args.subcategory ? slugify(args.subcategory) : undefined;

    // All categories are mounted under /fashion per product decision
    if (category && subcategory) return `/fashion/${category}/${subcategory}`;
    if (category) return `/fashion/${category}`;
    // Non-categorized vertical root defaults to /fashion
    return `/fashion`;
  }

  /**
   * Create URL-friendly slug from text
   */
  // slugify now centralized in RouteUtils

  /**
   * Parse route parameters from URL path
   */
  public parseRoutePath(path: string): {
    vertical?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
  } {
    const segments = path.split('/').filter(Boolean);
    
    // Handle fashion-first paths
    if (segments[0] === 'fashion') {
      return {
        vertical: 'fashion',
        category: segments[1],
        subcategory: segments[2]
      };
    }

    // marketplace paths are no longer used for category routing
    
    if (segments[0] === 'fashion' && segments[1] === 'brands') {
      // /fashion/brands, /fashion/brands/<brand>, /fashion/brands/<brand>/<category>, /fashion/brands/segments/<segment>
      if (segments[2] === 'segments' && segments[3]) {
        return { brand: undefined, category: segments[3] };
      }
      return {
        brand: segments[2],
        category: segments[3]
      };
    }
    
    return {};
  }
}

export const navigationService = NavigationService.getInstance();