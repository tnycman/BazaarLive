/**
 * Enterprise Authentication Integration - AOP Implementation
 * Complete integration bridge between existing auth and enterprise components
 */

import { Express, Request, Response, NextFunction } from 'express';
import { Result } from '../domain/Hostname';
import { Hostname } from '../domain/Hostname';
import { Environment } from '../domain/Environment';
import { AuthenticationDomain } from '../domain/AuthenticationDomain';
import { 
  StrategyResolverService,
  StrategyResolverConfiguration
} from '../services/StrategyResolverService';
import {
  StrategyResolutionRequest,
  StrategyResolutionResult,
  StrategyResolutionError,
  ResolutionConfidence
} from '../services/AuthenticationStrategyResolver';
import { AuthenticationBootstrap } from './AuthenticationBootstrap';

// Integration Error Types
export class AuthenticationIntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AUTH_INTEGRATION_ERROR',
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthenticationIntegrationError';
  }
}

export class StrategyResolutionIntegrationError extends AuthenticationIntegrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STRATEGY_RESOLUTION_ERROR', context);
    this.name = 'StrategyResolutionIntegrationError';
  }
}

export class HostnameDetectionError extends AuthenticationIntegrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'HOSTNAME_DETECTION_ERROR', context);
    this.name = 'HostnameDetectionError';
  }
}

// Integration Context Types
export interface AuthenticationContext {
  readonly hostname: string;
  readonly environment: string;
  readonly userAgent?: string;
  readonly sourceIP?: string;
  readonly requestId: string;
  readonly timestamp: Date;
  readonly resolvedStrategy?: string;
  readonly resolutionConfidence?: ResolutionConfidence;
  readonly resolutionDuration?: number;
}

export interface IntegrationHealthStatus {
  readonly isHealthy: boolean;
  readonly bootstrap: {
    isInitialized: boolean;
    initTime?: number;
    errorCount: number;
  };
  readonly strategyResolution: {
    isWorking: boolean;
    avgResolutionTime: number;
    successRate: number;
    lastSuccessfulResolution?: Date;
  };
  readonly middleware: {
    isActive: boolean;
    requestCount: number;
    errorCount: number;
  };
  readonly lastHealthCheck: Date;
}

// Integration Statistics
export interface IntegrationStatistics {
  readonly totalRequests: number;
  readonly successfulResolutions: number;
  readonly failedResolutions: number;
  readonly averageResolutionTime: number;
  readonly resolutionsByConfidence: Record<ResolutionConfidence, number>;
  readonly errorsByType: Record<string, number>;
  readonly topHostnames: Array<{ hostname: string; count: number }>;
  readonly period: {
    start: Date;
    end: Date;
  };
}

/**
 * Enterprise Authentication Integration Service
 * Main service for bridging existing auth with enterprise components
 */
export class EnterpriseAuthenticationIntegration {
  private static instance: EnterpriseAuthenticationIntegration | null = null;
  private bootstrap: AuthenticationBootstrap;
  private statistics: IntegrationStatistics;
  private healthStatus: IntegrationHealthStatus;
  private isInitialized: boolean = false;

  private constructor() {
    this.bootstrap = AuthenticationBootstrap.getInstance();
    this.statistics = this.initializeStatistics();
    this.healthStatus = this.initializeHealthStatus();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EnterpriseAuthenticationIntegration {
    if (!EnterpriseAuthenticationIntegration.instance) {
      EnterpriseAuthenticationIntegration.instance = new EnterpriseAuthenticationIntegration();
    }
    return EnterpriseAuthenticationIntegration.instance;
  }

  /**
   * Initialize the enterprise authentication integration
   */
  async initialize(app: Express): Promise<Result<void, AuthenticationIntegrationError>> {
    try {
      if (this.isInitialized) {
        console.log('[INTEGRATION] Already initialized, skipping...');
        return Result.ok(undefined);
      }

      console.log('[INTEGRATION] Initializing enterprise authentication integration...');

      // Bootstrap the authentication system
      const bootstrapResult = await this.bootstrap.bootstrap(app, {
        enableLogging: true,
        enablePerformanceMonitoring: true,
        enableSecurityAuditing: true,
        enableAnalytics: true,
        validationStrictMode: false, // Allow for existing system compatibility
        cacheEnabled: true
      });

      if (bootstrapResult.isError()) {
        throw new AuthenticationIntegrationError(
          `Bootstrap failed: ${bootstrapResult.error.message}`,
          'BOOTSTRAP_FAILED',
          { originalError: bootstrapResult.error }
        );
      }

      // Store integration components in app locals
      const result = bootstrapResult.value;
      app.locals.enterpriseAuth = {
        domain: result.domain,
        strategyResolver: result.strategyResolver,
        integration: this
      };

      this.isInitialized = true;
      this.updateHealthStatus({ initTime: result.healthStatus.totalInitTime });

      console.log('[INTEGRATION] Enterprise authentication integration initialized successfully', {
        strategiesCount: result.metadata.strategyCount,
        mappingsCount: result.metadata.mappingCount,
        initTime: result.healthStatus.totalInitTime
      });

      return Result.ok(undefined);

    } catch (error) {
      this.updateHealthStatus({ errorCount: this.healthStatus.bootstrap.errorCount + 1 });
      
      const integrationError = error instanceof AuthenticationIntegrationError 
        ? error 
        : new AuthenticationIntegrationError(
            `Integration initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'INIT_FAILED',
            { originalError: error }
          );

      console.error('[INTEGRATION] Initialization failed:', integrationError);
      return Result.error(integrationError);
    }
  }

  /**
   * Resolve authentication strategy for request
   */
  async resolveStrategy(req: Request): Promise<Result<AuthenticationContext, AuthenticationIntegrationError>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      this.statistics.totalRequests++;

      // Extract hostname from request
      const hostnameResult = this.extractHostname(req);
      if (hostnameResult.isError()) {
        this.statistics.failedResolutions++;
        this.statistics.errorsByType['HOSTNAME_EXTRACTION'] = 
          (this.statistics.errorsByType['HOSTNAME_EXTRACTION'] || 0) + 1;
        return hostnameResult;
      }

      const hostname = hostnameResult.value;

      // Detect environment
      const environmentResult = await this.detectEnvironment(req);
      if (environmentResult.isError()) {
        this.statistics.failedResolutions++;
        this.statistics.errorsByType['ENVIRONMENT_DETECTION'] = 
          (this.statistics.errorsByType['ENVIRONMENT_DETECTION'] || 0) + 1;
        return Result.error(environmentResult.error);
      }

      const environment = environmentResult.value;

      // Create resolution request
      const resolutionRequest: StrategyResolutionRequest = {
        hostname,
        environment,
        userAgent: req.headers['user-agent'],
        sourceIP: this.extractSourceIP(req),
        requestId,
        timestamp: new Date(),
        additionalContext: {
          method: req.method,
          path: req.path,
          protocol: req.protocol
        }
      };

      // Get enterprise components
      const bootstrapResult = this.bootstrap.getBootstrapResult();
      if (!bootstrapResult) {
        throw new AuthenticationIntegrationError(
          'Authentication system not bootstrapped',
          'NOT_BOOTSTRAPPED'
        );
      }

      // Resolve strategy using enterprise service
      const resolutionResult = await bootstrapResult.strategyResolver.resolveStrategy(
        resolutionRequest,
        await this.getConfiguration(bootstrapResult.domain),
        bootstrapResult.domain
      );

      const resolutionDuration = Date.now() - startTime;

      if (resolutionResult.isError()) {
        this.statistics.failedResolutions++;
        this.statistics.errorsByType[resolutionResult.error.code] = 
          (this.statistics.errorsByType[resolutionResult.error.code] || 0) + 1;
        
        throw new StrategyResolutionIntegrationError(
          `Strategy resolution failed: ${resolutionResult.error.message}`,
          { 
            hostname,
            environment,
            requestId,
            originalError: resolutionResult.error
          }
        );
      }

      const resolution = resolutionResult.value;

      // Update statistics
      this.statistics.successfulResolutions++;
      this.statistics.resolutionsByConfidence[resolution.confidence] = 
        (this.statistics.resolutionsByConfidence[resolution.confidence] || 0) + 1;
      
      this.updateAverageResolutionTime(resolutionDuration);
      this.updateTopHostnames(hostname);
      this.updateHealthStatus({ 
        lastSuccessfulResolution: new Date(),
        avgResolutionTime: resolutionDuration
      });

      // Create authentication context
      const authContext: AuthenticationContext = {
        hostname,
        environment,
        userAgent: resolutionRequest.userAgent,
        sourceIP: resolutionRequest.sourceIP,
        requestId,
        timestamp: resolutionRequest.timestamp,
        resolvedStrategy: resolution.strategy?.getName().toString(),
        resolutionConfidence: resolution.confidence,
        resolutionDuration
      };

      return Result.ok(authContext);

    } catch (error) {
      this.statistics.failedResolutions++;
      const duration = Date.now() - startTime;
      this.updateAverageResolutionTime(duration);

      const integrationError = error instanceof AuthenticationIntegrationError 
        ? error 
        : new AuthenticationIntegrationError(
            `Strategy resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'RESOLUTION_FAILED',
            { requestId, duration, originalError: error }
          );

      console.error('[INTEGRATION] Strategy resolution failed:', integrationError);
      return Result.error(integrationError);
    }
  }

  /**
   * Create authentication middleware for Express
   */
  createMiddleware() {
    return async (req: Request & { authContext?: AuthenticationContext }, res: Response, next: NextFunction) => {
      try {
        this.healthStatus.middleware.requestCount++;

        // Initialize if needed
        if (!this.isInitialized) {
          const initResult = await this.initialize(req.app as Express);
          if (initResult.isError()) {
            this.healthStatus.middleware.errorCount++;
            console.error('[INTEGRATION] Middleware initialization failed:', initResult.error);
            return res.status(500).json({ 
              message: 'Authentication system initialization failed',
              error: initResult.error.message 
            });
          }
        }

        // Resolve authentication strategy
        const resolutionResult = await this.resolveStrategy(req);
        if (resolutionResult.isError()) {
          this.healthStatus.middleware.errorCount++;
          
          // For development, allow requests to continue with warning
          if (resolutionResult.error.code === 'HOSTNAME_DETECTION_ERROR' && 
              process.env.NODE_ENV === 'development') {
            console.warn('[INTEGRATION] Development mode: allowing request despite hostname detection error');
            req.authContext = {
              hostname: 'localhost',
              environment: 'development',
              requestId: this.generateRequestId(),
              timestamp: new Date(),
              resolutionConfidence: ResolutionConfidence.DEVELOPMENT_MATCH
            };
            return next();
          }

          console.error('[INTEGRATION] Authentication resolution failed:', resolutionResult.error);
          return res.status(500).json({ 
            message: 'Authentication resolution failed',
            error: resolutionResult.error.message 
          });
        }

        // Add authentication context to request
        req.authContext = resolutionResult.value;

        next();

      } catch (error) {
        this.healthStatus.middleware.errorCount++;
        console.error('[INTEGRATION] Authentication middleware error:', error);
        res.status(500).json({ 
          message: 'Authentication middleware error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
  }

  /**
   * Get integration health status
   */
  async getHealthStatus(): Promise<IntegrationHealthStatus> {
    // Update resolver health if available
    const bootstrapResult = this.bootstrap.getBootstrapResult();
    if (bootstrapResult) {
      const resolverHealth = await bootstrapResult.strategyResolver.getHealthStatus();
      this.healthStatus.strategyResolution.isWorking = resolverHealth.isHealthy;
      this.healthStatus.strategyResolution.successRate = resolverHealth.performanceMetrics.successRate;
    }

    this.healthStatus.lastHealthCheck = new Date();
    return { ...this.healthStatus };
  }

  /**
   * Get integration statistics
   */
  getStatistics(): IntegrationStatistics {
    this.statistics.period.end = new Date();
    return { ...this.statistics };
  }

  /**
   * Extract hostname from request
   */
  private extractHostname(req: Request): Result<string, HostnameDetectionError> {
    try {
      // Try multiple sources for hostname
      const hostname = req.get('host') || 
                     req.hostname || 
                     req.headers['x-forwarded-host'] as string ||
                     'localhost';

      if (!hostname) {
        return Result.error(new HostnameDetectionError(
          'Unable to determine hostname from request',
          { headers: req.headers, hostname: req.hostname }
        ));
      }

      // Clean hostname (remove port if present)
      const cleanHostname = hostname.split(':')[0];

      // Validate hostname format
      const hostnameValidation = Hostname.create(cleanHostname);
      if (hostnameValidation.isError()) {
        return Result.error(new HostnameDetectionError(
          `Invalid hostname format: ${hostnameValidation.error.message}`,
          { hostname: cleanHostname, originalHostname: hostname }
        ));
      }

      return Result.ok(cleanHostname);

    } catch (error) {
      return Result.error(new HostnameDetectionError(
        `Hostname extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      ));
    }
  }

  /**
   * Detect environment from request
   */
  private async detectEnvironment(req: Request): Promise<Result<string, AuthenticationIntegrationError>> {
    try {
      const environmentResult = await Environment.detect();
      if (environmentResult.isError()) {
        return Result.error(new AuthenticationIntegrationError(
          `Environment detection failed: ${environmentResult.error.message}`,
          'ENVIRONMENT_DETECTION_ERROR',
          { originalError: environmentResult.error }
        ));
      }

      return Result.ok(environmentResult.value.toString());

    } catch (error) {
      return Result.error(new AuthenticationIntegrationError(
        `Environment detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ENVIRONMENT_DETECTION_ERROR',
        { originalError: error }
      ));
    }
  }

  /**
   * Extract source IP from request
   */
  private extractSourceIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           '127.0.0.1';
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get configuration from domain
   */
  private async getConfiguration(domain: AuthenticationDomain): Promise<any> {
    // This would typically come from the domain's configuration
    // For now, return a minimal configuration
    return {
      environment: domain.getEnvironment(),
      domains: [], // Will be populated by domain
      strategies: domain.getStrategies().map(s => s.getConfiguration()),
      mappings: domain.getAllMappings(),
      security: {
        enforceHTTPS: false,
        corsEnabled: true,
        csrfProtection: false,
        allowedOrigins: ['*'],
        trustedProxies: []
      },
      monitoring: {
        enableMetrics: true,
        logLevel: 'info' as const,
        alerting: {
          enabled: false,
          channels: []
        }
      }
    };
  }

  /**
   * Initialize statistics
   */
  private initializeStatistics(): IntegrationStatistics {
    return {
      totalRequests: 0,
      successfulResolutions: 0,
      failedResolutions: 0,
      averageResolutionTime: 0,
      resolutionsByConfidence: {
        [ResolutionConfidence.EXACT_MATCH]: 0,
        [ResolutionConfidence.DOMAIN_MATCH]: 0,
        [ResolutionConfidence.DEVELOPMENT_MATCH]: 0,
        [ResolutionConfidence.FALLBACK_MATCH]: 0,
        [ResolutionConfidence.NO_MATCH]: 0
      },
      errorsByType: {},
      topHostnames: [],
      period: {
        start: new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Initialize health status
   */
  private initializeHealthStatus(): IntegrationHealthStatus {
    return {
      isHealthy: true,
      bootstrap: {
        isInitialized: false,
        errorCount: 0
      },
      strategyResolution: {
        isWorking: false,
        avgResolutionTime: 0,
        successRate: 0
      },
      middleware: {
        isActive: true,
        requestCount: 0,
        errorCount: 0
      },
      lastHealthCheck: new Date()
    };
  }

  /**
   * Update health status
   */
  private updateHealthStatus(updates: Partial<any>): void {
    if (updates.initTime !== undefined) {
      this.healthStatus.bootstrap.isInitialized = true;
      this.healthStatus.bootstrap.initTime = updates.initTime;
    }
    if (updates.errorCount !== undefined) {
      this.healthStatus.bootstrap.errorCount = updates.errorCount;
    }
    if (updates.lastSuccessfulResolution !== undefined) {
      this.healthStatus.strategyResolution.lastSuccessfulResolution = updates.lastSuccessfulResolution;
    }
    if (updates.avgResolutionTime !== undefined) {
      this.healthStatus.strategyResolution.avgResolutionTime = updates.avgResolutionTime;
    }

    // Update overall health
    this.healthStatus.isHealthy = 
      this.healthStatus.bootstrap.isInitialized &&
      this.healthStatus.bootstrap.errorCount < 5 &&
      this.healthStatus.middleware.errorCount < 10;
  }

  /**
   * Update average resolution time
   */
  private updateAverageResolutionTime(duration: number): void {
    const total = this.statistics.successfulResolutions + this.statistics.failedResolutions;
    this.statistics.averageResolutionTime = 
      (this.statistics.averageResolutionTime * (total - 1) + duration) / total;
  }

  /**
   * Update top hostnames statistics
   */
  private updateTopHostnames(hostname: string): void {
    const existing = this.statistics.topHostnames.find(h => h.hostname === hostname);
    if (existing) {
      existing.count++;
    } else {
      this.statistics.topHostnames.push({ hostname, count: 1 });
    }

    // Keep only top 10
    this.statistics.topHostnames.sort((a, b) => b.count - a.count);
    this.statistics.topHostnames = this.statistics.topHostnames.slice(0, 10);
  }
}