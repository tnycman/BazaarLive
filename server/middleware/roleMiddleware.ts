// Role-based access control middleware for analytics
import { RequestHandler } from 'express';
import { storage } from '../storage';

export type UserRole = 'user' | 'moderator' | 'admin';
export type AnalyticsAccess = 'personal' | 'category' | 'platform';

export interface AuthenticatedRequest {
  user?: {
    claims: {
      sub: string;
      email?: string;
    };
  };
  userRole?: UserRole;
  analyticsAccess?: AnalyticsAccess;
}

// Middleware to add user role and analytics access to request
export const addUserRole: RequestHandler = async (req: any, res, next) => {
  try {
    if (req.user?.claims?.sub) {
      const user = await storage.getUser(req.user.claims.sub);
      if (user) {
        req.userRole = user.role || 'user';
        req.analyticsAccess = user.analyticsAccess || 'personal';
      }
    }
    next();
  } catch (error) {
    console.error('Error fetching user role:', error);
    next();
  }
};

// Check if user has specific role
export const requireRole = (requiredRole: UserRole): RequestHandler => {
  return (req: any, res, next) => {
    const userRole = req.userRole || 'user';
    
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      moderator: 2,
      admin: 3
    };
    
    if (roleHierarchy[userRole as UserRole] >= roleHierarchy[requiredRole]) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: requiredRole,
        current: userRole
      });
    }
  };
};

// Check if user has specific analytics access level
export const requireAnalyticsAccess = (requiredAccess: AnalyticsAccess): RequestHandler => {
  return (req: any, res, next) => {
    const userAccess = req.analyticsAccess || 'personal';
    
    const accessHierarchy: Record<AnalyticsAccess, number> = {
      personal: 1,
      category: 2,
      platform: 3
    };
    
    if (accessHierarchy[userAccess as AnalyticsAccess] >= accessHierarchy[requiredAccess]) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Insufficient analytics access',
        required: requiredAccess,
        current: userAccess
      });
    }
  };
};

// Combined middleware for analytics endpoints
export const requireAnalyticsRole = (access: AnalyticsAccess) => {
  return [addUserRole, requireAnalyticsAccess(access)];
};