/**
 * Strategy Resolver Aspects - Enterprise AOP Implementation
 * Cross-cutting concerns for authentication strategy resolution
 */

import { ValidationError } from '../domain/Hostname';
import { Hostname } from '../domain/Hostname';
import { AuthenticationStrategy, ValidationResult } from '../domain/AuthenticationStrategy';
import {
  IResolutionAspect,
  StrategyResolutionRequest,
  StrategyResolutionResult,
  StrategyResolutionError,
  ResolutionConfidence
} from './AuthenticationStrategyResolver';

// Structured Logger Interface for Resolution
export interface IResolutionLogger {
  debug(message: string, context?: Record<string, any>): Promise<void>;
  info(message: string, context?: Record<string, any>): Promise<void>;
  warn(message: string, context?: Record<string, any>): Promise<void>;
  error(message: string, context?: Record<string, any>): Promise<void>;
  
  logResolutionAttempt(request: StrategyResolutionRequest): Promise<void>;
  logResolutionSuccess(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void>;
  logResolutionFailure(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void>;
}

// Performance Monitor Interface for Resolution
export interface IResolutionPerformanceMonitor {
  recordResolutionMetric(metric: {
    name: string;
    value: number;
    tags?: Record<string, string>;
    timestamp?: Date;
  }): Promise<void>;
  
  startResolutionTimer(requestId: string): string;
  endResolutionTimer(timerId: string): Promise<number>;
  
  recordResolutionPerformance(
    hostname: string,
    environment: string,
    duration: number,
    confidence: ResolutionConfidence,
    success: boolean
  ): Promise<void>;
}

// Security Monitor Interface for Resolution
export interface IResolutionSecurityMonitor {
  recordResolutionAccess(
    hostname: string,
    environment: string,
    sourceIP?: string,
    userAgent?: string
  ): Promise<void>;
  
  validateResolutionSecurity(
    request: StrategyResolutionRequest,
    result: StrategyResolutionResult
  ): Promise<ValidationResult>;
  
  detectSuspiciousPatterns(
    hostname: string,
    requestFrequency: number,
    sourceIP?: string
  ): Promise<ValidationResult>;
  
  auditStrategyAccess(
    strategy: AuthenticationStrategy,
    hostname: string,
    requestId: string
  ): Promise<void>;
}

// Analytics Monitor Interface for Resolution
export interface IResolutionAnalyticsMonitor {
  recordResolutionEvent(event: {
    type: 'resolution_attempt' | 'resolution_success' | 'resolution_failure' | 'cache_hit' | 'cache_miss';
    hostname: string;
    environment: string;
    confidence?: ResolutionConfidence;
    duration?: number;
    strategy?: string;
    requestId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }): Promise<void>;
  
  recordHostnamePatterns(
    hostname: string,
    hostnameType: string,
    resolutionPath: string[]
  ): Promise<void>;
  
  recordStrategyUsage(
    strategyName: string,
    hostname: string,
    environment: string,
    success: boolean
  ): Promise<void>;
}

// Resolution Logging Aspect
export class ResolutionLoggingAspect implements IResolutionAspect {
  private readonly logger: IResolutionLogger;
  private readonly verboseMode: boolean;

  constructor(logger: IResolutionLogger, verboseMode: boolean = false) {
    this.logger = logger;
    this.verboseMode = verboseMode;
  }

  async beforeResolution(request: StrategyResolutionRequest): Promise<void> {
    await this.logger.logResolutionAttempt(request);

    if (this.verboseMode) {
      await this.logger.debug('Resolution process starting', {
        requestId: request.requestId,
        hostname: request.hostname,
        environment: request.environment,
        userAgent: request.userAgent,
        sourceIP: request.sourceIP,
        timestamp: request.timestamp.toISOString()
      });
    }
  }

  async afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    await this.logger.logResolutionSuccess(request, result);

    const logContext = {
      requestId: request.requestId,
      hostname: request.hostname,
      environment: request.environment,
      confidence: result.confidence,
      strategyFound: !!result.strategy,
      strategyName: result.strategy?.getName().toString(),
      duration: result.metadata.totalDuration,
      cacheHit: result.metadata.cacheHit,
      warningCount: result.warnings.length,
      alternativeCount: result.alternativeStrategies.length
    };

    if (result.strategy) {
      await this.logger.info('Strategy resolution successful', logContext);
    } else {
      await this.logger.warn('Strategy resolution completed but no strategy found', {
        ...logContext,
        warnings: result.warnings.map(w => ({ code: w.code, message: w.message, severity: w.severity }))
      });
    }

    if (this.verboseMode) {
      await this.logger.debug('Resolution path details', {
        requestId: request.requestId,
        resolutionPath: result.resolutionPath.map(step => ({
          step: step.step,
          description: step.description,
          duration: step.duration,
          success: step.success
        }))
      });
    }
  }

  async onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void> {
    await this.logger.logResolutionFailure(request, error);

    await this.logger.error('Strategy resolution failed', {
      requestId: request.requestId,
      hostname: request.hostname,
      environment: request.environment,
      errorCode: error.code,
      errorMessage: error.message,
      errorContext: error.context,
      timestamp: new Date().toISOString()
    });
  }

  async beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void> {
    if (this.verboseMode) {
      await this.logger.debug('Strategy validation starting', {
        strategyName: strategy.getName().toString(),
        hostname: hostname.toString(),
        strategyEnvironment: strategy.getEnvironment().toString(),
        hostnameType: hostname.getType()
      });
    }
  }

  async afterStrategyValidation(strategy: AuthenticationStrategy, validation: ValidationResult): Promise<void> {
    const logContext = {
      strategyName: strategy.getName().toString(),
      validationSuccess: validation.isValid,
      errorCount: validation.errors.length
    };

    if (validation.isValid) {
      if (this.verboseMode) {
        await this.logger.debug('Strategy validation passed', logContext);
      }
    } else {
      await this.logger.warn('Strategy validation failed', {
        ...logContext,
        errors: validation.errors.map(e => ({ message: e.message, field: e.field }))
      });
    }
  }
}

// Resolution Performance Aspect
export class ResolutionPerformanceAspect implements IResolutionAspect {
  private readonly performanceMonitor: IResolutionPerformanceMonitor;
  private readonly resolutionTimers: Map<string, string> = new Map();

  constructor(performanceMonitor: IResolutionPerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  async beforeResolution(request: StrategyResolutionRequest): Promise<void> {
    const timerId = this.performanceMonitor.startResolutionTimer(request.requestId);
    this.resolutionTimers.set(request.requestId, timerId);

    await this.performanceMonitor.recordResolutionMetric({
      name: 'resolution.attempt',
      value: 1,
      tags: {
        hostname: request.hostname,
        environment: request.environment,
        hasUserAgent: (!!request.userAgent).toString(),
        hasSourceIP: (!!request.sourceIP).toString()
      },
      timestamp: request.timestamp
    });
  }

  async afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    const timerId = this.resolutionTimers.get(request.requestId);
    if (timerId) {
      await this.performanceMonitor.endResolutionTimer(timerId);
      this.resolutionTimers.delete(request.requestId);
    }

    await this.performanceMonitor.recordResolutionPerformance(
      request.hostname,
      request.environment,
      result.metadata.totalDuration,
      result.confidence,
      !!result.strategy
    );

    await this.performanceMonitor.recordResolutionMetric({
      name: 'resolution.duration',
      value: result.metadata.totalDuration,
      tags: {
        hostname: request.hostname,
        environment: request.environment,
        confidence: result.confidence,
        success: (!!result.strategy).toString(),
        cacheHit: result.metadata.cacheHit.toString()
      }
    });

    // Performance alerting
    if (result.metadata.totalDuration > 1000) { // 1 second
      await this.performanceMonitor.recordResolutionMetric({
        name: 'resolution.slow',
        value: 1,
        tags: {
          hostname: request.hostname,
          environment: request.environment,
          duration: result.metadata.totalDuration.toString()
        }
      });
    }

    // Cache efficiency metrics
    if (result.metadata.cacheHit) {
      await this.performanceMonitor.recordResolutionMetric({
        name: 'resolution.cache.hit',
        value: 1,
        tags: {
          hostname: request.hostname,
          environment: request.environment
        }
      });
    } else {
      await this.performanceMonitor.recordResolutionMetric({
        name: 'resolution.cache.miss',
        value: 1,
        tags: {
          hostname: request.hostname,
          environment: request.environment
        }
      });
    }
  }

  async onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void> {
    const timerId = this.resolutionTimers.get(request.requestId);
    if (timerId) {
      const duration = await this.performanceMonitor.endResolutionTimer(timerId);
      this.resolutionTimers.delete(request.requestId);

      await this.performanceMonitor.recordResolutionPerformance(
        request.hostname,
        request.environment,
        duration,
        ResolutionConfidence.NO_MATCH,
        false
      );
    }

    await this.performanceMonitor.recordResolutionMetric({
      name: 'resolution.error',
      value: 1,
      tags: {
        hostname: request.hostname,
        environment: request.environment,
        errorCode: error.code
      }
    });
  }

  async beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void> {
    await this.performanceMonitor.recordResolutionMetric({
      name: 'strategy.validation.start',
      value: 1,
      tags: {
        strategyName: strategy.getName().toString(),
        hostname: hostname.toString(),
        hostnameType: hostname.getType()
      }
    });
  }

  async afterStrategyValidation(strategy: AuthenticationStrategy, validation: ValidationResult): Promise<void> {
    await this.performanceMonitor.recordResolutionMetric({
      name: 'strategy.validation.complete',
      value: 1,
      tags: {
        strategyName: strategy.getName().toString(),
        success: validation.isValid.toString(),
        errorCount: validation.errors.length.toString()
      }
    });
  }
}

// Resolution Security Aspect
export class ResolutionSecurityAspect implements IResolutionAspect {
  private readonly securityMonitor: IResolutionSecurityMonitor;
  private readonly requestCounts: Map<string, number> = new Map();

  constructor(securityMonitor: IResolutionSecurityMonitor) {
    this.securityMonitor = securityMonitor;
  }

  async beforeResolution(request: StrategyResolutionRequest): Promise<void> {
    // Record access for audit
    await this.securityMonitor.recordResolutionAccess(
      request.hostname,
      request.environment,
      request.sourceIP,
      request.userAgent
    );

    // Track request frequency for rate limiting/suspicious pattern detection
    const key = `${request.hostname}:${request.sourceIP || 'unknown'}`;
    const currentCount = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, currentCount + 1);

    // Check for suspicious patterns
    if (currentCount > 10) { // More than 10 requests from same IP to same hostname
      const suspiciousPatternCheck = await this.securityMonitor.detectSuspiciousPatterns(
        request.hostname,
        currentCount,
        request.sourceIP
      );

      if (!suspiciousPatternCheck.isValid) {
        throw new StrategyResolutionError(
          'Suspicious resolution pattern detected',
          'SUSPICIOUS_PATTERN',
          { 
            hostname: request.hostname,
            sourceIP: request.sourceIP,
            requestCount: currentCount,
            securityViolations: suspiciousPatternCheck.errors.map(e => e.message)
          }
        );
      }
    }

    // Validate hostname security
    await this.validateHostnameSecurity(request);
  }

  async afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    // Validate resolution security
    const securityValidation = await this.securityMonitor.validateResolutionSecurity(request, result);
    
    if (!securityValidation.isValid) {
      throw new StrategyResolutionError(
        `Resolution security validation failed: ${securityValidation.errors.map(e => e.message).join(', ')}`,
        'RESOLUTION_SECURITY_ERROR',
        { 
          hostname: request.hostname,
          environment: request.environment,
          securityErrors: securityValidation.errors,
          requestId: request.requestId
        }
      );
    }

    // Audit strategy access if strategy was found
    if (result.strategy) {
      await this.securityMonitor.auditStrategyAccess(
        result.strategy,
        request.hostname,
        request.requestId
      );
    }
  }

  async onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void> {
    // Security incident logging for resolution failures
    if (error.code === 'SUSPICIOUS_PATTERN' || error.code === 'HOSTNAME_VALIDATION_ERROR') {
      await this.securityMonitor.recordResolutionAccess(
        request.hostname,
        request.environment,
        request.sourceIP,
        `SECURITY_INCIDENT:${error.code}`
      );
    }
  }

  async beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void> {
    // Pre-validation security checks
    if (strategy.getEnvironment().requiresStrictSecurity()) {
      await this.validateStrictSecurityRequirements(strategy, hostname);
    }
  }

  async afterStrategyValidation(strategy: AuthenticationStrategy, validation: ValidationResult): Promise<void> {
    // Post-validation security audit
    if (validation.isValid) {
      await this.securityMonitor.auditStrategyAccess(
        strategy,
        strategy.getName().getIdentifier(), // Use strategy identifier as hostname for audit
        'validation-passed'
      );
    }
  }

  private async validateHostnameSecurity(request: StrategyResolutionRequest): Promise<void> {
    const errors: string[] = [];

    // Check for suspicious hostname patterns
    const suspiciousPatterns = [
      /admin/i,
      /system/i,
      /internal/i,
      /test.*prod/i,
      /prod.*test/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(request.hostname)) {
        errors.push(`Hostname contains suspicious pattern: ${pattern.source}`);
      }
    }

    // Check for IP addresses in production
    if (request.environment === 'production' && /^\d+\.\d+\.\d+\.\d+$/.test(request.hostname)) {
      errors.push('IP addresses not allowed in production environment');
    }

    // Check for development indicators in production
    if (request.environment === 'production' && /localhost|127\.0\.0\.1|\.local$/i.test(request.hostname)) {
      errors.push('Development hostnames not allowed in production environment');
    }

    if (errors.length > 0) {
      throw new StrategyResolutionError(
        'Hostname security validation failed',
        'HOSTNAME_SECURITY_ERROR',
        { 
          hostname: request.hostname,
          environment: request.environment,
          securityViolations: errors
        }
      );
    }
  }

  private async validateStrictSecurityRequirements(
    strategy: AuthenticationStrategy,
    hostname: Hostname
  ): Promise<void> {
    const errors: string[] = [];

    // Validate strategy security level
    const config = strategy.getConfiguration();
    if (config.securityLevel === 'basic' || config.securityLevel === 'standard') {
      errors.push('Strategy must use enhanced or strict security level');
    }

    // Validate HTTPS callback URL
    if (!config.callbackURL.startsWith('https://')) {
      errors.push('Strategy callback URL must use HTTPS');
    }

    // Validate hostname type for production
    if (hostname.getType() === 'ipv4') {
      errors.push('IP addresses not allowed for strict security strategies');
    }

    if (errors.length > 0) {
      throw new StrategyResolutionError(
        'Strict security validation failed',
        'STRICT_SECURITY_ERROR',
        { 
          strategyName: strategy.getName().toString(),
          hostname: hostname.toString(),
          securityViolations: errors
        }
      );
    }
  }
}

// Resolution Analytics Aspect
export class ResolutionAnalyticsAspect implements IResolutionAspect {
  private readonly analyticsMonitor: IResolutionAnalyticsMonitor;

  constructor(analyticsMonitor: IResolutionAnalyticsMonitor) {
    this.analyticsMonitor = analyticsMonitor;
  }

  async beforeResolution(request: StrategyResolutionRequest): Promise<void> {
    await this.analyticsMonitor.recordResolutionEvent({
      type: 'resolution_attempt',
      hostname: request.hostname,
      environment: request.environment,
      requestId: request.requestId,
      timestamp: request.timestamp,
      metadata: {
        hasUserAgent: !!request.userAgent,
        hasSourceIP: !!request.sourceIP,
        hasAdditionalContext: !!request.additionalContext
      }
    });

    // Record hostname patterns
    const hostnameObj = Hostname.create(request.hostname);
    if (hostnameObj.isSuccess()) {
      await this.analyticsMonitor.recordHostnamePatterns(
        request.hostname,
        hostnameObj.value.getType(),
        []
      );
    }
  }

  async afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    // Record resolution success/failure
    const eventType = result.strategy ? 'resolution_success' : 'resolution_failure';
    
    await this.analyticsMonitor.recordResolutionEvent({
      type: eventType,
      hostname: request.hostname,
      environment: request.environment,
      confidence: result.confidence,
      duration: result.metadata.totalDuration,
      strategy: result.strategy?.getName().toString(),
      requestId: request.requestId,
      timestamp: result.metadata.resolutionTimestamp,
      metadata: {
        cacheHit: result.metadata.cacheHit,
        warningCount: result.warnings.length,
        alternativeCount: result.alternativeStrategies.length,
        resolutionStepCount: result.resolutionPath.length
      }
    });

    // Record cache hit/miss
    const cacheEventType = result.metadata.cacheHit ? 'cache_hit' : 'cache_miss';
    await this.analyticsMonitor.recordResolutionEvent({
      type: cacheEventType,
      hostname: request.hostname,
      environment: request.environment,
      requestId: request.requestId,
      timestamp: result.metadata.resolutionTimestamp
    });

    // Record strategy usage if strategy was found
    if (result.strategy) {
      await this.analyticsMonitor.recordStrategyUsage(
        result.strategy.getName().toString(),
        request.hostname,
        request.environment,
        true
      );
    }

    // Record hostname patterns with resolution path
    const resolutionPath = result.resolutionPath.map(step => step.step);
    const hostnameObj = Hostname.create(request.hostname);
    if (hostnameObj.isSuccess()) {
      await this.analyticsMonitor.recordHostnamePatterns(
        request.hostname,
        hostnameObj.value.getType(),
        resolutionPath
      );
    }
  }

  async onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void> {
    await this.analyticsMonitor.recordResolutionEvent({
      type: 'resolution_failure',
      hostname: request.hostname,
      environment: request.environment,
      requestId: request.requestId,
      timestamp: new Date(),
      metadata: {
        errorCode: error.code,
        errorMessage: error.message,
        errorContext: error.context
      }
    });
  }

  async beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void> {
    // Record strategy validation attempt for analytics
    await this.analyticsMonitor.recordStrategyUsage(
      strategy.getName().toString(),
      hostname.toString(),
      strategy.getEnvironment().toString(),
      false // Not yet successful, just attempting validation
    );
  }

  async afterStrategyValidation(strategy: AuthenticationStrategy, validation: ValidationResult): Promise<void> {
    // Record strategy validation result for analytics
    await this.analyticsMonitor.recordStrategyUsage(
      strategy.getName().toString(),
      strategy.getName().getIdentifier(), // Use strategy identifier
      strategy.getEnvironment().toString(),
      validation.isValid
    );
  }
}