/**
 * Express.js type declarations for authentication
 * Enterprise-grade type safety for Passport.js integration
 */

declare global {
  namespace Express {
    interface User {
      id?: string;
      email?: string;
      name?: string;
      expires_at?: number;
      refresh_token?: string;
      access_token?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      logout(done: (err: any) => void): void;
    }
  }
}

export {};