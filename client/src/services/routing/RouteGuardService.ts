// Route guard service implementing AOP security principles
import { RouteParams } from '@/types/routing';

export interface RouteGuard {
  name: string;
  canActivate(params: RouteParams, path: string): Promise<boolean>;
  redirectPath?: string;
  errorMessage?: string;
}

export class AuthenticationGuard implements RouteGuard {
  name = 'authentication';
  redirectPath = '/api/login';
  errorMessage = 'Authentication required to access this page';

  async canActivate(params: RouteParams, path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/user');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class VerticalAccessGuard implements RouteGuard {
  name = 'vertical-access';
  errorMessage = 'Access denied to this marketplace vertical';

  async canActivate(params: RouteParams, path: string): Promise<boolean> {
    // Implement vertical-specific access control if needed
    // For now, all authenticated users can access all verticals
    return true;
  }
}

export class RouteGuardService {
  private static instance: RouteGuardService;
  private guards: Map<string, RouteGuard> = new Map();

  private constructor() {
    this.registerGuard(new AuthenticationGuard());
    this.registerGuard(new VerticalAccessGuard());
  }

  public static getInstance(): RouteGuardService {
    if (!RouteGuardService.instance) {
      RouteGuardService.instance = new RouteGuardService();
    }
    return RouteGuardService.instance;
  }

  private registerGuard(guard: RouteGuard): void {
    this.guards.set(guard.name, guard);
  }

  public async canActivateRoute(
    guardNames: string[],
    params: RouteParams,
    path: string
  ): Promise<{ canActivate: boolean; redirectPath?: string; error?: string }> {
    for (const guardName of guardNames) {
      const guard = this.guards.get(guardName);
      
      if (!guard) {
        console.warn(`Route guard '${guardName}' not found`);
        continue;
      }

      const canActivate = await guard.canActivate(params, path);
      
      if (!canActivate) {
        return {
          canActivate: false,
          redirectPath: guard.redirectPath,
          error: guard.errorMessage
        };
      }
    }

    return { canActivate: true };
  }

  public getGuard(name: string): RouteGuard | undefined {
    return this.guards.get(name);
  }
}

export const routeGuardService = RouteGuardService.getInstance();