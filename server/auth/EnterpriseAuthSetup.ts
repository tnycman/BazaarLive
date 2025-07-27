/**
 * Enterprise Authentication Setup - AOP Implementation
 * Complete replacement for existing setupAuth with enterprise integration
 */

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import { EnterpriseAuthenticationIntegration } from './EnterpriseAuthenticationIntegration';
import { AuthenticationMiddlewareIntegration } from '../aop/AuthenticationMiddlewareIntegration';
import { Result } from '../domain/Hostname';

// Enterprise Auth Setup Error Types
export class EnterpriseAuthSetupError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AUTH_SETUP_ERROR',
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'EnterpriseAuthSetupError';
  }
}

export class PassportConfigurationError extends EnterpriseAuthSetupError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PASSPORT_CONFIG_ERROR', context);
    this.name = 'PassportConfigurationError';
  }
}

export class StrategyRegistrationError extends EnterpriseAuthSetupError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STRATEGY_REGISTRATION_ERROR', context);
    this.name = 'StrategyRegistrationError';
  }
}

// Configuration validation
function validateEnvironmentVariables(): Result<void, EnterpriseAuthSetupError> {
  const requiredVars = ['REPLIT_DOMAINS', 'SESSION_SECRET', 'REPL_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return Result.error(new EnterpriseAuthSetupError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      'ENV_VAR_MISSING',
      { missingVariables: missingVars }
    ));
  }

  return Result.ok(undefined);
}

// Memoized OIDC configuration with enterprise error handling
const getOidcConfig = memoize(
  async () => {
    try {
      console.log('[ENTERPRISE-AUTH] Fetching OIDC configuration...');
      const config = await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
      console.log('[ENTERPRISE-AUTH] OIDC configuration loaded successfully');
      return config;
    } catch (error) {
      console.error('[ENTERPRISE-AUTH] OIDC configuration failed:', error);
      throw new EnterpriseAuthSetupError(
        `OIDC configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OIDC_CONFIG_ERROR',
        { originalError: error }
      );
    }
  },
  { maxAge: 3600 * 1000 }
);

// Enterprise session configuration
export function getEnterpriseSession() {
  try {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });

    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTtl,
      },
    });
  } catch (error) {
    throw new EnterpriseAuthSetupError(
      `Session configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SESSION_CONFIG_ERROR',
      { originalError: error }
    );
  }
}

// Enterprise user session management
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
): void {
  try {
    user.claims = tokens.claims();
    user.access_token = tokens.access_token;
    user.refresh_token = tokens.refresh_token;
    user.expires_at = user.claims?.exp;
    console.log('[ENTERPRISE-AUTH] User session updated successfully');
  } catch (error) {
    console.error('[ENTERPRISE-AUTH] Failed to update user session:', error);
    throw new EnterpriseAuthSetupError(
      `User session update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SESSION_UPDATE_ERROR',
      { originalError: error }
    );
  }
}

// Enterprise user upsert with validation
async function upsertUser(claims: any): Promise<void> {
  try {
    if (!claims.sub) {
      throw new EnterpriseAuthSetupError(
        'User claims missing required "sub" field',
        'INVALID_USER_CLAIMS',
        { claims }
      );
    }

    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
    
    console.log('[ENTERPRISE-AUTH] User upserted successfully:', claims.sub);
  } catch (error) {
    console.error('[ENTERPRISE-AUTH] User upsert failed:', error);
    throw new EnterpriseAuthSetupError(
      `User upsert failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'USER_UPSERT_ERROR',
      { originalError: error, userId: claims?.sub }
    );
  }
}

// Enterprise strategy registration with hostname resolution
async function registerAuthenticationStrategies(
  app: Express,
  config: any,
  verify: VerifyFunction
): Promise<Result<void, StrategyRegistrationError>> {
  try {
    console.log('[ENTERPRISE-AUTH] Registering authentication strategies...');
    
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    let registeredCount = 0;

    for (const domain of domains) {
      try {
        const strategyName = `replitauth:${domain}`;
        const callbackURL = domain === 'localhost' 
          ? `http://${domain}/api/callback`  // HTTP for localhost development
          : `https://${domain}/api/callback`; // HTTPS for production domains

        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL,
          },
          verify,
        );

        passport.use(strategy);
        registeredCount++;
        
        console.log('[ENTERPRISE-AUTH] Strategy registered:', strategyName, 'with callback:', callbackURL);
      } catch (error) {
        console.error(`[ENTERPRISE-AUTH] Failed to register strategy for domain ${domain}:`, error);
        // Continue with other domains rather than failing completely
      }
    }

    if (registeredCount === 0) {
      return Result.error(new StrategyRegistrationError(
        'No authentication strategies could be registered',
        { domains, attempted: domains.length, successful: registeredCount }
      ));
    }

    console.log(`[ENTERPRISE-AUTH] Successfully registered ${registeredCount}/${domains.length} strategies`);
    return Result.ok(undefined);

  } catch (error) {
    return Result.error(new StrategyRegistrationError(
      `Strategy registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    ));
  }
}

// Enhanced passport authentication with enterprise strategy resolution
function createEnterpriseAuthenticateMiddleware(strategyPrefix: string) {
  return async (req: any, res: any, next: any) => {
    try {
      // Get hostname from request (with enterprise integration)
      const hostname = req.hostname || req.get('host')?.split(':')[0] || 'localhost';
      const strategyName = `${strategyPrefix}:${hostname}`;
      
      console.log(`[ENTERPRISE-AUTH] Attempting authentication with strategy: ${strategyName}`);

      // Check if strategy exists
      const strategy = passport._strategy(strategyName);
      if (!strategy) {
        console.warn(`[ENTERPRISE-AUTH] Strategy not found: ${strategyName}, available strategies:`, 
          Object.keys(passport._strategies || {}));
        
        // Fallback to localhost for development
        if (process.env.NODE_ENV === 'development' && hostname !== 'localhost') {
          const fallbackStrategy = `${strategyPrefix}:localhost`;
          console.log(`[ENTERPRISE-AUTH] Attempting fallback strategy: ${fallbackStrategy}`);
          return passport.authenticate(fallbackStrategy, {
            prompt: "login consent",
            scope: ["openid", "email", "profile", "offline_access"],
          })(req, res, next);
        }

        return res.status(500).json({ 
          message: `Authentication strategy not found: ${strategyName}`,
          error: 'STRATEGY_NOT_FOUND',
          hostname,
          availableStrategies: Object.keys(passport._strategies || {})
        });
      }

      // Use the resolved strategy
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);

    } catch (error) {
      console.error('[ENTERPRISE-AUTH] Authentication middleware error:', error);
      res.status(500).json({ 
        message: 'Authentication middleware error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Enhanced callback authentication with enterprise error handling
function createEnterpriseCallbackMiddleware(strategyPrefix: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const hostname = req.hostname || req.get('host')?.split(':')[0] || 'localhost';
      const strategyName = `${strategyPrefix}:${hostname}`;
      
      console.log(`[ENTERPRISE-AUTH] Processing callback with strategy: ${strategyName}`);

      // Check if strategy exists
      const strategy = passport._strategy(strategyName);
      if (!strategy) {
        console.warn(`[ENTERPRISE-AUTH] Callback strategy not found: ${strategyName}`);
        
        // Fallback to localhost for development
        if (process.env.NODE_ENV === 'development' && hostname !== 'localhost') {
          const fallbackStrategy = `${strategyPrefix}:localhost`;
          console.log(`[ENTERPRISE-AUTH] Attempting fallback callback strategy: ${fallbackStrategy}`);
          return passport.authenticate(fallbackStrategy, {
            successReturnToOrRedirect: "/",
            failureRedirect: "/api/login",
          })(req, res, next);
        }

        return res.status(500).json({ 
          message: `Callback strategy not found: ${strategyName}`,
          error: 'CALLBACK_STRATEGY_NOT_FOUND',
          hostname
        });
      }

      passport.authenticate(strategyName, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);

    } catch (error) {
      console.error('[ENTERPRISE-AUTH] Callback middleware error:', error);
      res.status(500).json({ 
        message: 'Callback middleware error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

/**
 * Main Enterprise Authentication Setup Function
 * Replaces existing setupAuth with enterprise integration
 */
export async function setupEnterpriseAuth(app: Express): Promise<Result<void, EnterpriseAuthSetupError>> {
  try {
    console.log('[ENTERPRISE-AUTH] Starting enterprise authentication setup...');

    // Step 1: Validate environment
    const envValidation = validateEnvironmentVariables();
    if (envValidation.isError()) {
      return envValidation;
    }

    // Step 2: Initialize AOP middleware integration
    const aopIntegration = AuthenticationMiddlewareIntegration.getInstance({
      enableAspectOrchestration: true,
      enablePreProcessing: true,
      enablePostProcessing: true,
      enableErrorHandling: true,
      enablePerformanceTracking: true,
      logLevel: 'info',
      bootstrapConfiguration: {
        enableLogging: true,
        enableValidation: true,
        enableSecurity: true,
        enablePerformance: true
      }
    });

    const aopResult = await aopIntegration.initialize();
    if (aopResult.isError()) {
      console.warn('[ENTERPRISE-AUTH] AOP integration failed, continuing with basic setup:', aopResult.error);
    }

    // Step 3: Initialize enterprise integration
    const enterpriseIntegration = EnterpriseAuthenticationIntegration.getInstance();
    const integrationResult = await enterpriseIntegration.initialize(app);
    if (integrationResult.isError()) {
      console.warn('[ENTERPRISE-AUTH] Enterprise integration failed, continuing with basic setup:', integrationResult.error);
      // Continue with setup even if enterprise integration fails
    }

    // Step 4: Configure Express middleware with AOP integration
    app.set("trust proxy", 1);
    
    // Use AOP-enabled session middleware
    const sessionMiddleware = aopResult.isSuccess() 
      ? aopIntegration.createAOPMiddleware('session', getEnterpriseSession())
      : getEnterpriseSession();
    app.use(sessionMiddleware);

    // Use AOP-enabled passport middleware
    const passportInitMiddleware = aopResult.isSuccess()
      ? aopIntegration.createAOPMiddleware('passport-init', passport.initialize())
      : passport.initialize();
    app.use(passportInitMiddleware);

    const passportSessionMiddleware = aopResult.isSuccess()
      ? aopIntegration.createAOPMiddleware('passport-session', passport.session())
      : passport.session();
    app.use(passportSessionMiddleware);

    // Step 5: Add enterprise authentication middleware
    if (integrationResult.isSuccess()) {
      const enterpriseMiddleware = aopResult.isSuccess()
        ? aopIntegration.createAOPMiddleware('enterprise-auth', enterpriseIntegration.createMiddleware())
        : enterpriseIntegration.createMiddleware();
      app.use(enterpriseMiddleware);
    }

    // Step 6: Get OIDC configuration
    const config = await getOidcConfig();

    // Step 7: Configure AOP-enabled passport verify function
    const baseVerify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      } catch (error) {
        console.error('[ENTERPRISE-AUTH] Passport verify error:', error);
        verified(error, null);
      }
    };

    // Wrap verify function with AOP if available
    const verify = aopResult.isSuccess() 
      ? aopIntegration.createAOPMiddleware('passport-verify', baseVerify)
      : baseVerify;

    // Step 8: Register AOP-enabled authentication strategies
    const strategyResult = await registerAuthenticationStrategies(app, config, verify);
    if (strategyResult.isError()) {
      return Result.error(new EnterpriseAuthSetupError(
        `Strategy registration failed: ${strategyResult.error.message}`,
        'STRATEGY_REGISTRATION_FAILED',
        { originalError: strategyResult.error }
      ));
    }

    // Step 8: Configure passport serialization
    passport.serializeUser((user: Express.User, cb) => {
      console.log('[ENTERPRISE-AUTH] Serializing user');
      cb(null, user);
    });
    
    passport.deserializeUser((user: Express.User, cb) => {
      console.log('[ENTERPRISE-AUTH] Deserializing user');
      cb(null, user);
    });

    // Step 9: Setup authentication routes with enterprise middleware
    app.get("/api/login", createEnterpriseAuthenticateMiddleware('replitauth'));
    app.get("/api/callback", createEnterpriseCallbackMiddleware('replitauth'));

    // Step 10: Setup logout route
    app.get("/api/logout", async (req, res) => {
      try {
        req.logout(() => {
          const logoutUrl = client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href;
          
          console.log('[ENTERPRISE-AUTH] User logout, redirecting to:', logoutUrl);
          res.redirect(logoutUrl);
        });
      } catch (error) {
        console.error('[ENTERPRISE-AUTH] Logout error:', error);
        res.status(500).json({ 
          message: 'Logout failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Step 11: Add health check endpoint
    app.get("/api/auth/health", async (req, res) => {
      try {
        const health = await enterpriseIntegration.getHealthStatus();
        const statistics = enterpriseIntegration.getStatistics();
        
        res.json({
          status: 'healthy',
          enterprise: health,
          statistics,
          strategies: Object.keys(passport._strategies || {}),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log('[ENTERPRISE-AUTH] Enterprise authentication setup completed successfully');
    return Result.ok(undefined);

  } catch (error) {
    const setupError = error instanceof EnterpriseAuthSetupError 
      ? error 
      : new EnterpriseAuthSetupError(
          `Enterprise authentication setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'SETUP_FAILED',
          { originalError: error }
        );

    console.error('[ENTERPRISE-AUTH] Setup failed:', setupError);
    return Result.error(setupError);
  }
}

/**
 * Enhanced isAuthenticated middleware with enterprise integration
 */
export const isEnterpriseAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const user = req.user as any;

    if (!req.isAuthenticated() || !user?.expires_at) {
      console.log('[ENTERPRISE-AUTH] Authentication required - no valid session');
      return res.status(401).json({ 
        message: "Unauthorized",
        reason: "No valid session"
      });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      // Token is still valid
      return next();
    }

    // Token expired, attempt refresh
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log('[ENTERPRISE-AUTH] Authentication required - no refresh token');
      return res.status(401).json({ 
        message: "Unauthorized",
        reason: "Token expired and no refresh token available"
      });
    }

    try {
      console.log('[ENTERPRISE-AUTH] Refreshing expired token...');
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      console.log('[ENTERPRISE-AUTH] Token refreshed successfully');
      return next();
    } catch (refreshError) {
      console.error('[ENTERPRISE-AUTH] Token refresh failed:', refreshError);
      return res.status(401).json({ 
        message: "Unauthorized",
        reason: "Token refresh failed"
      });
    }

  } catch (error) {
    console.error('[ENTERPRISE-AUTH] Authentication middleware error:', error);
    return res.status(500).json({ 
      message: "Authentication error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};