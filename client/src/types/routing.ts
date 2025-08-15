// Comprehensive type definitions for dynamic routing system
export interface RouteParams {
  vertical?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  section?: string;
}

export interface CategoryRoute {
  path: string;
  params: RouteParams;
  metadata: {
    title: string;
    description: string;
    breadcrumbs: string[];
  };
}

export interface VerticalRoute {
  vertical: string;
  path: string;
  displayName: string;
  icon: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface NavigationHierarchy {
  level: number;
  path: string;
  name: string;
  parent?: string;
  children?: NavigationHierarchy[];
}

export interface RouteConfig {
  exact?: boolean;
  caseSensitive?: boolean;
  guards?: string[];
  middleware?: string[];
}

// Route patterns for dynamic routing
export const ROUTE_PATTERNS = {
  FASHION_ROOT: '/fashion',
  CATEGORY: '/fashion/:category',
  SUBCATEGORY: '/fashion/:category/:subcategory',
  BRAND: '/fashion/brands/:brand',
  BRAND_CATEGORY: '/fashion/brands/:brand/:category',
  BRAND_SEGMENT: '/fashion/brands/segments/:segment',
  SECTION: '/fashion/section/:section'
} as const;

export type RoutePattern = typeof ROUTE_PATTERNS[keyof typeof ROUTE_PATTERNS];