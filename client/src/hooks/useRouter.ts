// Advanced router hook with AOP principles and best practices
import { useLocation, useRoute } from 'wouter';
import { useMemo, useCallback } from 'react';
import { RouteParams } from '@/types/routing';
import { routeConfigService } from '@/services/routing/RouteConfigService';
import { routeGuardService } from '@/services/routing/RouteGuardService';

export interface RouterContext {
  params: RouteParams;
  query: URLSearchParams;
  path: string;
  navigate: (path: string, options?: NavigationOptions) => void;
  canNavigate: (path: string) => Promise<boolean>;
  buildPath: (vertical?: string, category?: string, subcategory?: string) => string;
  getBreadcrumbs: () => string[];
  getMetadata: () => { title: string; description: string } | null;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  guards?: string[];
}

export function useRouter(): RouterContext {
  const [path, navigate] = useLocation();

  const { params, query } = useMemo(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const pathSegments = path.split('/').filter(Boolean);

    const extractedParams: RouteParams = {};

    // Parse dynamic route parameters
    if (pathSegments[0] === 'marketplace' && pathSegments.length > 1) {
      extractedParams.vertical = pathSegments[1];
      if (pathSegments.length > 2) {
        extractedParams.category = pathSegments[2];
      }
      if (pathSegments.length > 3) {
        extractedParams.subcategory = pathSegments[3];
      }
    } else if (pathSegments[0] === 'brands' && pathSegments.length > 1) {
      extractedParams.brand = pathSegments[1];
      if (pathSegments.length > 2) {
        extractedParams.category = pathSegments[2];
      }
    }

    // Include query parameters
    if (searchParams.get('vertical')) extractedParams.vertical = searchParams.get('vertical')!;
    if (searchParams.get('category')) extractedParams.category = searchParams.get('category')!;
    if (searchParams.get('subcategory')) extractedParams.subcategory = searchParams.get('subcategory')!;
    if (searchParams.get('brand')) extractedParams.brand = searchParams.get('brand')!;
    if (searchParams.get('section')) extractedParams.section = searchParams.get('section')!;

    return {
      params: extractedParams,
      query: searchParams
    };
  }, [path]);

  const navigateWithGuards = useCallback(async (
    targetPath: string, 
    options: NavigationOptions = {}
  ) => {
    const guards = options.guards || ['authentication'];
    
    const guardResult = await routeGuardService.canActivateRoute(
      guards, 
      params, 
      targetPath
    );

    if (!guardResult.canActivate) {
      if (guardResult.redirectPath) {
        window.location.href = guardResult.redirectPath;
        return;
      }
      throw new Error(guardResult.error || 'Navigation blocked');
    }

    navigate(targetPath, { replace: options.replace });
  }, [navigate, params]);

  const canNavigate = useCallback(async (targetPath: string): Promise<boolean> => {
    try {
      const guardResult = await routeGuardService.canActivateRoute(
        ['authentication'], 
        params, 
        targetPath
      );
      return guardResult.canActivate;
    } catch {
      return false;
    }
  }, [params]);

  const buildPath = useCallback((
    vertical?: string, 
    category?: string, 
    subcategory?: string
  ): string => {
    let path = '/marketplace';
    
    if (vertical) {
      path += `/${vertical}`;
      if (category) {
        path += `/${category.toLowerCase().replace(/\s+/g, '-')}`;
        if (subcategory) {
          path += `/${subcategory.toLowerCase().replace(/\s+/g, '-')}`;
        }
      }
    }
    
    return path;
  }, []);

  const getBreadcrumbs = useCallback((): string[] => {
    const breadcrumbs: string[] = ['Home'];
    
    if (params.vertical) {
      breadcrumbs.push('Marketplace');
      const verticalRoute = routeConfigService.getVerticalRoute(params.vertical);
      breadcrumbs.push(verticalRoute?.displayName || params.vertical);
      
      if (params.category) {
        breadcrumbs.push(params.category);
        
        if (params.subcategory) {
          breadcrumbs.push(params.subcategory);
        }
      }
    } else if (path.includes('marketplace')) {
      breadcrumbs.push('Marketplace');
    }
    
    return breadcrumbs;
  }, [params, path]);

  const getMetadata = useCallback((): { title: string; description: string } | null => {
    if (!params.vertical) return null;
    
    const verticalRoute = routeConfigService.getVerticalRoute(params.vertical);
    if (!verticalRoute) return null;
    
    if (params.category) {
      const categoryRoute = routeConfigService.generateCategoryRoute(params.vertical, params.category);
      return {
        title: categoryRoute.metadata.title,
        description: categoryRoute.metadata.description
      };
    }
    
    return {
      title: verticalRoute.metadata.title,
      description: verticalRoute.metadata.description
    };
  }, [params]);

  return {
    params,
    query,
    path,
    navigate: navigateWithGuards,
    canNavigate,
    buildPath,
    getBreadcrumbs,
    getMetadata
  };
}