/**
 * AspectRegistrationBootstrap - Enterprise AOP Implementation
 * Bootstrap system for registering all authentication aspects in the manager
 */

import { AuthenticationAspectManager } from './AuthenticationAspectManager';
import { AuthenticationLoggingAspect } from './AuthenticationLoggingAspect';
import { AuthenticationValidationAspect } from './AuthenticationValidationAspect';
import { AuthenticationSecurityAspect } from './AuthenticationSecurityAspect';
import { AuthenticationPerformanceAspect } from './AuthenticationPerformanceAspect';
import { Result } from '../domain/Hostname';
import { AspectError } from './IAuthenticationAspect';

// Bootstrap Configuration
export interface AspectBootstrapConfiguration {
  readonly enableLogging: boolean;
  readonly enableValidation: boolean;
  readonly enableSecurity: boolean;
  readonly enablePerformance: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly strictValidation: boolean;
  readonly securityLevel: 'basic' | 'standard' | 'enhanced' | 'strict';
  readonly performanceMonitoring: boolean;
  readonly aspectManagerConfig: {
    enableParallelExecution: boolean;
    enableFailFast: boolean;
    maxExecutionTime: number;
    retryAttempts: number;
  };
}

// Bootstrap Result
export interface AspectBootstrapResult {
  readonly success: boolean;
  readonly aspectManager: AuthenticationAspectManager;
  readonly registeredAspects: string[];
  readonly failedAspects: string[];
  readonly errors: AspectError[];
  readonly initializationTime: number;
}

/**
 * Authentication Aspect Bootstrap
 * Enterprise-grade aspect registration and initialization system
 */
export class AspectRegistrationBootstrap {
  private configuration: AspectBootstrapConfiguration;

  constructor(configuration?: Partial<AspectBootstrapConfiguration>) {
    this.configuration = {
      enableLogging: true,
      enableValidation: true,
      enableSecurity: true,
      enablePerformance: true,
      logLevel: 'info',
      strictValidation: false,
      securityLevel: 'standard',
      performanceMonitoring: true,
      aspectManagerConfig: {
        enableParallelExecution: false,
        enableFailFast: true,
        maxExecutionTime: 30000,
        retryAttempts: 2
      },
      ...configuration
    };
  }

  /**
   * Bootstrap all authentication aspects with enterprise configuration
   */
  async bootstrap(): Promise<AspectBootstrapResult> {
    const startTime = Date.now();
    const registeredAspects: string[] = [];
    const failedAspects: string[] = [];
    const errors: AspectError[] = [];

    try {
      console.log('[ASPECT-BOOTSTRAP] Starting authentication aspect bootstrap');

      // Create aspect manager
      const aspectManager = new AuthenticationAspectManager(this.configuration.aspectManagerConfig);

      // Register logging aspect
      if (this.configuration.enableLogging) {
        const result = await this.registerLoggingAspect(aspectManager);
        if (result.isSuccess()) {
          registeredAspects.push('AuthenticationLoggingAspect');
        } else {
          failedAspects.push('AuthenticationLoggingAspect');
          errors.push(result.error);
        }
      }

      // Register validation aspect
      if (this.configuration.enableValidation) {
        const result = await this.registerValidationAspect(aspectManager);
        if (result.isSuccess()) {
          registeredAspects.push('AuthenticationValidationAspect');
        } else {
          failedAspects.push('AuthenticationValidationAspect');
          errors.push(result.error);
        }
      }

      // Register security aspect
      if (this.configuration.enableSecurity) {
        const result = await this.registerSecurityAspect(aspectManager);
        if (result.isSuccess()) {
          registeredAspects.push('AuthenticationSecurityAspect');
        } else {
          failedAspects.push('AuthenticationSecurityAspect');
          errors.push(result.error);
        }
      }

      // Register performance aspect
      if (this.configuration.enablePerformance) {
        const result = await this.registerPerformanceAspect(aspectManager);
        if (result.isSuccess()) {
          registeredAspects.push('AuthenticationPerformanceAspect');
        } else {
          failedAspects.push('AuthenticationPerformanceAspect');
          errors.push(result.error);
        }
      }

      // Initialize aspect manager
      const initResult = await aspectManager.initialize();
      if (initResult.isError()) {
        console.error('[ASPECT-BOOTSTRAP] Failed to initialize aspect manager:', initResult.error);
        errors.push(initResult.error);
      }

      const initializationTime = Date.now() - startTime;
      const success = failedAspects.length === 0 && initResult.isSuccess();

      console.log(`[ASPECT-BOOTSTRAP] Bootstrap completed in ${initializationTime}ms`, {
        success,
        registeredAspects: registeredAspects.length,
        failedAspects: failedAspects.length,
        errors: errors.length
      });

      return {
        success,
        aspectManager,
        registeredAspects,
        failedAspects,
        errors,
        initializationTime
      };

    } catch (error) {
      const bootstrapError = new AspectError(
        `Aspect bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BOOTSTRAP_FAILED',
        { originalError: error }
      );

      errors.push(bootstrapError);

      return {
        success: false,
        aspectManager: new AuthenticationAspectManager(), // Return empty manager
        registeredAspects,
        failedAspects: ['Bootstrap'],
        errors,
        initializationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Register logging aspect with enterprise configuration
   */
  private async registerLoggingAspect(manager: AuthenticationAspectManager): Promise<Result<void, AspectError>> {
    try {
      const loggingAspect = new AuthenticationLoggingAspect(undefined, {
        name: 'AuthenticationLoggingAspect',
        enabled: true,
        priority: 100,
        pointcuts: ['*'],
        options: {
          logLevel: this.configuration.logLevel,
          enableStructuredLogging: true,
          enableSensitiveDataFiltering: true,
          enablePerformanceLogging: this.configuration.performanceMonitoring,
          enableErrorStackTraces: this.configuration.logLevel === 'debug',
          logRetentionDays: 30,
          maxLogEntrySize: 10000,
          excludeOperations: [],
          includeOperations: []
        }
      });

      return await manager.registerAspect(loggingAspect, {
        enabled: true,
        priority: 100,
        metadata: {
          type: 'logging',
          registeredBy: 'AspectRegistrationBootstrap'
        }
      });

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register logging aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LOGGING_ASPECT_REGISTRATION_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Register validation aspect with enterprise configuration
   */
  private async registerValidationAspect(manager: AuthenticationAspectManager): Promise<Result<void, AspectError>> {
    try {
      const validationAspect = new AuthenticationValidationAspect({
        name: 'AuthenticationValidationAspect',
        enabled: true,
        priority: 200,
        pointcuts: ['*'],
        options: {
          enableStrictValidation: this.configuration.strictValidation,
          enableWarnings: true,
          enableFieldLevelValidation: true,
          enableSchemaValidation: true,
          enableBusinessRuleValidation: true,
          maxValidationTime: 5000,
          treatWarningsAsErrors: this.configuration.strictValidation,
          validationTimeout: 3000,
          enableAsyncValidation: true,
          cacheValidationResults: true,
          validationCacheTTL: 300000
        }
      });

      return await manager.registerAspect(validationAspect, {
        enabled: true,
        priority: 200,
        metadata: {
          type: 'validation',
          registeredBy: 'AspectRegistrationBootstrap'
        }
      });

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register validation aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ASPECT_REGISTRATION_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Register security aspect with enterprise configuration
   */
  private async registerSecurityAspect(manager: AuthenticationAspectManager): Promise<Result<void, AspectError>> {
    try {
      const securityAspect = new AuthenticationSecurityAspect(undefined, {
        name: 'AuthenticationSecurityAspect',
        enabled: true,
        priority: 300,
        pointcuts: ['*'],
        options: {
          enableThreatDetection: true,
          enableRateLimiting: this.configuration.securityLevel !== 'basic',
          enableAuditLogging: true,
          enableSuspiciousActivityDetection: true,
          enableDataSanitization: true,
          blockOnCriticalViolations: this.configuration.securityLevel === 'strict',
          blockOnHighViolations: this.configuration.securityLevel === 'enhanced' || this.configuration.securityLevel === 'strict',
          maxRiskScore: this.getMaxRiskScoreForSecurityLevel(),
          auditRetentionDays: 90,
          rateLimitingEnabled: this.configuration.securityLevel !== 'basic',
          threatDetectionSensitivity: this.getThreatDetectionSensitivity(),
          enableRealTimeMonitoring: true,
          enableAutomaticBlocking: this.configuration.securityLevel === 'strict'
        }
      });

      return await manager.registerAspect(securityAspect, {
        enabled: true,
        priority: 300,
        metadata: {
          type: 'security',
          registeredBy: 'AspectRegistrationBootstrap'
        }
      });

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register security aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SECURITY_ASPECT_REGISTRATION_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Register performance aspect with enterprise configuration
   */
  private async registerPerformanceAspect(manager: AuthenticationAspectManager): Promise<Result<void, AspectError>> {
    try {
      const performanceAspect = new AuthenticationPerformanceAspect({
        name: 'AuthenticationPerformanceAspect',
        enabled: true,
        priority: 150,
        pointcuts: ['*'],
        options: {
          enableMemoryMonitoring: this.configuration.performanceMonitoring,
          enableCpuMonitoring: this.configuration.performanceMonitoring,
          enableDurationMonitoring: true,
          enableThroughputMonitoring: this.configuration.performanceMonitoring,
          enableAlerting: this.configuration.performanceMonitoring,
          trackRecentExecutions: 100,
          performanceReportingInterval: 60000,
          alertingThresholds: [],
          enableAutoOptimization: this.configuration.performanceMonitoring,
          enableDetailedProfiling: this.configuration.logLevel === 'debug',
          maxMetricRetention: 1000,
          enableGarbageCollectionTracking: this.configuration.performanceMonitoring,
          enableResourceLeakDetection: this.configuration.performanceMonitoring
        }
      });

      return await manager.registerAspect(performanceAspect, {
        enabled: true,
        priority: 150,
        metadata: {
          type: 'performance',
          registeredBy: 'AspectRegistrationBootstrap'
        }
      });

    } catch (error) {
      return Result.error(new AspectError(
        `Failed to register performance aspect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PERFORMANCE_ASPECT_REGISTRATION_FAILED',
        { originalError: error }
      ));
    }
  }

  /**
   * Get max risk score based on security level
   */
  private getMaxRiskScoreForSecurityLevel(): number {
    switch (this.configuration.securityLevel) {
      case 'basic':
        return 90;
      case 'standard':
        return 80;
      case 'enhanced':
        return 70;
      case 'strict':
        return 60;
      default:
        return 80;
    }
  }

  /**
   * Get threat detection sensitivity based on security level
   */
  private getThreatDetectionSensitivity(): 'low' | 'medium' | 'high' {
    switch (this.configuration.securityLevel) {
      case 'basic':
        return 'low';
      case 'standard':
        return 'medium';
      case 'enhanced':
      case 'strict':
        return 'high';
      default:
        return 'medium';
    }
  }

  /**
   * Create default bootstrap configuration
   */
  static createDefaultConfiguration(): AspectBootstrapConfiguration {
    return {
      enableLogging: true,
      enableValidation: true,
      enableSecurity: true,
      enablePerformance: true,
      logLevel: 'info',
      strictValidation: false,
      securityLevel: 'standard',
      performanceMonitoring: true,
      aspectManagerConfig: {
        enableParallelExecution: false,
        enableFailFast: true,
        maxExecutionTime: 30000,
        retryAttempts: 2
      }
    };
  }

  /**
   * Create production-optimized configuration
   */
  static createProductionConfiguration(): AspectBootstrapConfiguration {
    return {
      enableLogging: true,
      enableValidation: true,
      enableSecurity: true,
      enablePerformance: true,
      logLevel: 'warn',
      strictValidation: true,
      securityLevel: 'enhanced',
      performanceMonitoring: true,
      aspectManagerConfig: {
        enableParallelExecution: true,
        enableFailFast: false,
        maxExecutionTime: 15000,
        retryAttempts: 3
      }
    };
  }

  /**
   * Create development-optimized configuration
   */
  static createDevelopmentConfiguration(): AspectBootstrapConfiguration {
    return {
      enableLogging: true,
      enableValidation: false, // Disabled for faster development
      enableSecurity: false, // Disabled for faster development
      enablePerformance: false, // Disabled for faster development
      logLevel: 'debug',
      strictValidation: false,
      securityLevel: 'basic',
      performanceMonitoring: false,
      aspectManagerConfig: {
        enableParallelExecution: false,
        enableFailFast: true,
        maxExecutionTime: 60000, // Longer timeout for debugging
        retryAttempts: 1
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<AspectBootstrapConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): AspectBootstrapConfiguration {
    return { ...this.configuration };
  }
}