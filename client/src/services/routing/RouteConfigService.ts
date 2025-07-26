// Service for managing route configuration with AOP principles
import { VerticalRoute, CategoryRoute, NavigationHierarchy } from '@/types/routing';

export class RouteConfigService {
  private static instance: RouteConfigService;
  private verticalRoutes: Map<string, VerticalRoute> = new Map();
  private categoryRoutes: Map<string, CategoryRoute> = new Map();
  private hierarchyCache: Map<string, NavigationHierarchy[]> = new Map();

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): RouteConfigService {
    if (!RouteConfigService.instance) {
      RouteConfigService.instance = new RouteConfigService();
    }
    return RouteConfigService.instance;
  }

  private initializeRoutes(): void {
    // Initialize vertical marketplace routes
    this.registerVerticalRoute({
      vertical: 'fashion',
      path: '/marketplace/fashion',
      displayName: 'Fashion',
      icon: 'shirt',
      metadata: {
        title: 'Fashion Marketplace - Designer Clothes & Accessories',
        description: 'Shop pre-owned designer fashion, clothing, shoes, and accessories from top brands.',
        keywords: ['fashion', 'designer', 'clothing', 'accessories', 'luxury']
      }
    });

    this.registerVerticalRoute({
      vertical: 'jobs',
      path: '/marketplace/jobs',
      displayName: 'Jobs',
      icon: 'briefcase',
      metadata: {
        title: 'Job Marketplace - Find Your Next Opportunity',
        description: 'Browse job listings across all industries and career levels.',
        keywords: ['jobs', 'careers', 'employment', 'hiring', 'opportunities']
      }
    });

    this.registerVerticalRoute({
      vertical: 'real-estate',
      path: '/marketplace/real-estate',
      displayName: 'Real Estate',
      icon: 'home',
      metadata: {
        title: 'Real Estate Marketplace - Buy, Sell, Rent Properties',
        description: 'Find homes, apartments, and commercial properties for sale or rent.',
        keywords: ['real estate', 'homes', 'properties', 'apartments', 'commercial']
      }
    });

    this.registerVerticalRoute({
      vertical: 'cars',
      path: '/marketplace/cars',
      displayName: 'Cars',
      icon: 'car',
      metadata: {
        title: 'Car Marketplace - Buy & Sell Vehicles',
        description: 'Browse used cars, trucks, and motorcycles from verified sellers.',
        keywords: ['cars', 'vehicles', 'automotive', 'trucks', 'motorcycles']
      }
    });

    this.registerVerticalRoute({
      vertical: 'boats',
      path: '/marketplace/boats',
      displayName: 'Boats',
      icon: 'anchor',
      metadata: {
        title: 'Boat Marketplace - Marine Vessels & Watercraft',
        description: 'Find boats, yachts, and marine equipment from trusted dealers.',
        keywords: ['boats', 'yachts', 'marine', 'watercraft', 'sailing']
      }
    });

    this.registerVerticalRoute({
      vertical: 'services',
      path: '/marketplace/services',
      displayName: 'Services',
      icon: 'wrench',
      metadata: {
        title: 'Service Marketplace - Professional Services',
        description: 'Connect with service providers for home, business, and personal needs.',
        keywords: ['services', 'professionals', 'contractors', 'consultants', 'freelancers']
      }
    });

    this.registerVerticalRoute({
      vertical: 'sports',
      path: '/marketplace/sports',
      displayName: 'Sports & Outdoors',
      icon: 'trophy',
      metadata: {
        title: 'Sports & Outdoors Marketplace - Athletic Gear & Equipment',
        description: 'Shop sports equipment, outdoor gear, and athletic apparel.',
        keywords: ['sports', 'outdoors', 'athletic', 'equipment', 'gear']
      }
    });
  }

  private registerVerticalRoute(route: VerticalRoute): void {
    this.verticalRoutes.set(route.vertical, route);
  }

  public getVerticalRoute(vertical: string): VerticalRoute | undefined {
    return this.verticalRoutes.get(vertical);
  }

  public getAllVerticalRoutes(): VerticalRoute[] {
    return Array.from(this.verticalRoutes.values());
  }

  public generateCategoryRoute(vertical: string, category: string): CategoryRoute {
    const verticalRoute = this.getVerticalRoute(vertical);
    const path = `/marketplace/${vertical}/${this.slugify(category)}`;
    
    return {
      path,
      component: 'CategoryPage',
      params: { vertical, category },
      metadata: {
        title: `${this.capitalize(category)} - ${verticalRoute?.displayName || vertical} Marketplace`,
        description: `Shop ${category.toLowerCase()} in our ${vertical} marketplace.`,
        breadcrumbs: ['Home', 'Marketplace', verticalRoute?.displayName || vertical, this.capitalize(category)]
      }
    };
  }

  public buildNavigationHierarchy(vertical: string): NavigationHierarchy[] {
    const cacheKey = `hierarchy_${vertical}`;
    
    if (this.hierarchyCache.has(cacheKey)) {
      return this.hierarchyCache.get(cacheKey)!;
    }

    const hierarchy: NavigationHierarchy[] = [
      {
        level: 0,
        path: '/marketplace',
        name: 'Marketplace'
      },
      {
        level: 1,
        path: `/marketplace/${vertical}`,
        name: this.getVerticalRoute(vertical)?.displayName || vertical,
        parent: '/marketplace'
      }
    ];

    this.hierarchyCache.set(cacheKey, hierarchy);
    return hierarchy;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  public validateRoute(path: string): boolean {
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length < 2 || segments[0] !== 'marketplace') {
      return false;
    }

    if (segments.length >= 2) {
      const vertical = segments[1];
      return this.verticalRoutes.has(vertical);
    }

    return true;
  }
}

export const routeConfigService = RouteConfigService.getInstance();