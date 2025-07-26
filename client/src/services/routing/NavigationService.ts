// Navigation service for generating dynamic routes with AOP principles
import { routeConfigService } from './RouteConfigService';

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
    const categorySlug = this.slugify(category);
    const itemSlug = this.slugify(item);
    
    // Determine vertical based on category context
    const targetVertical = this.determineVertical(category, vertical);
    
    return `/marketplace/${targetVertical}/${itemSlug}`;
  }

  /**
   * Generate brand route
   */
  public generateBrandRoute(brand: string, category?: string): string {
    const brandSlug = this.slugify(brand);
    
    if (category) {
      const categorySlug = this.slugify(category);
      return `/brands/${brandSlug}/${categorySlug}`;
    }
    
    return `/brands/${brandSlug}`;
  }

  /**
   * Generate section route for "Shop All" links
   */
  public generateSectionRoute(sectionTitle: string, vertical?: string): string {
    const sectionSlug = this.slugify(sectionTitle);
    const targetVertical = this.determineVertical(sectionTitle, vertical);
    
    return `/marketplace/${targetVertical}/section/${sectionSlug}`;
  }

  /**
   * Determine appropriate vertical based on category context
   */
  private determineVertical(category: string, explicitVertical?: string): string {
    if (explicitVertical) {
      return explicitVertical;
    }

    // Map categories to verticals using intelligent inference
    const categoryMappings: Record<string, string> = {
      // Fashion-related
      'women': 'fashion',
      'men': 'fashion', 
      'kids': 'fashion',
      'accessories': 'fashion',
      'bags': 'fashion',
      'clothing': 'fashion',
      'jewelry': 'fashion',
      'makeup': 'fashion',
      'shoes': 'fashion',
      'beauty': 'fashion',
      'brands': 'fashion',
      
      // Home-related
      'home': 'fashion', // Default to fashion marketplace
      'accents': 'fashion',
      'bath': 'fashion',
      'bedding': 'fashion',
      'dining': 'fashion',
      'holiday': 'fashion',
      'kitchen': 'fashion',
      
      // Electronics
      'electronics': 'fashion', // Default to fashion marketplace
      'camera': 'fashion',
      'cell phones': 'fashion',
      'computers': 'fashion',
      'tablets': 'fashion',
      'video games': 'fashion',
      
      // Pets
      'pets': 'fashion',
      'bird': 'fashion',
      'cat': 'fashion',
      'dog': 'fashion',
      
      // Sports
      'sports': 'sports',
      'outdoors': 'sports'
    };

    const categoryLower = category.toLowerCase();
    
    // Check for exact matches first
    if (categoryMappings[categoryLower]) {
      return categoryMappings[categoryLower];
    }
    
    // Check for partial matches
    for (const [key, vertical] of Object.entries(categoryMappings)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return vertical;
      }
    }
    
    // Default to fashion marketplace
    return 'fashion';
  }

  /**
   * Create URL-friendly slug from text
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  }

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
    
    if (segments[0] === 'marketplace' && segments.length > 1) {
      return {
        vertical: segments[1],
        category: segments[2],
        subcategory: segments[3]
      };
    }
    
    if (segments[0] === 'brands' && segments.length > 1) {
      return {
        brand: segments[1],
        category: segments[2]
      };
    }
    
    return {};
  }
}

export const navigationService = NavigationService.getInstance();