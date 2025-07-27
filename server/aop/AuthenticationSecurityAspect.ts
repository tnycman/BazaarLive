/**
 * AuthenticationSecurityAspect - Enterprise AOP Implementation
 * Comprehensive security aspect for all authentication operations
 */

import {
  IAuthenticationAspect,
  BaseAuthenticationAspect,
  AspectConfiguration,
  AspectContext,
  JoinPoint,
  AspectError
} from './IAuthenticationAspect';
import { ValidationResult, ValidationError } from '../domain/AuthenticationStrategy';
import { Result } from '../domain/Hostname';

// Security Event Types
export enum SecurityEventType {
  AUTHENTICATION_ATTEMPT = 'authentication_attempt',
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_CREDENTIALS = 'invalid_credentials',
  SESSION_CREATED = 'session_created',
  SESSION_DESTROYED = 'session_destroyed',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_ACCESS = 'data_access',
  SECURITY_VIOLATION = 'security_violation'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Security Event Interface
export interface SecurityEvent {
  readonly id: string;
  readonly type: SecurityEventType;
  readonly severity: SecuritySeverity;
  readonly timestamp: Date;
  readonly context: AspectContext;
  readonly details: Record<string, any>;
  readonly source: string;
  readonly target?: string;
  readonly action: string;
  readonly outcome: 'success' | 'failure' | 'blocked';
  readonly riskScore: number;
  readonly metadata: Record<string, any>;
}

// Security Rule Interface
export interface SecurityRule {
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly severity: SecuritySeverity;
  readonly checker: (context: AspectContext, data: any) => Promise<SecurityViolation | null>;
  readonly remediation?: string;
  readonly tags: string[];
}

// Security Violation Interface
export interface SecurityViolation {
  readonly rule: string;
  readonly message: string;
  readonly severity: SecuritySeverity;
  readonly context: AspectContext;
  readonly evidence: Record<string, any>;
  readonly riskScore: number;
  readonly remediation?: string;
  readonly blocked: boolean;
}

// Rate Limiting Interface
export interface RateLimitRule {
  readonly name: string;
  readonly windowMs: number;
  readonly maxRequests: number;
  readonly keyGenerator: (context: AspectContext) => string;
  readonly skipIf?: (context: AspectContext) => boolean;
  readonly onLimitReached?: (context: AspectContext) => Promise<void>;
}

// Security Monitoring Interface  
export interface SecurityMonitor {
  recordEvent(event: SecurityEvent): Promise<void>;
  recordViolation(violation: SecurityViolation): Promise<void>;
  getEvents(filter?: Partial<SecurityEvent>): Promise<SecurityEvent[]>;
  getViolations(filter?: Partial<SecurityViolation>): Promise<SecurityViolation[]>;
  getSecurityMetrics(): Promise<SecurityMetrics>;
}

// Security Metrics Interface
export interface SecurityMetrics {
  readonly totalEvents: number;
  readonly totalViolations: number;
  readonly eventsByType: Record<SecurityEventType, number>;
  readonly violationsBySeverity: Record<SecuritySeverity, number>;
  readonly averageRiskScore: number;
  readonly blockedRequests: number;
  readonly suspiciousActivities: number;
  readonly lastEvent?: Date;
  readonly lastViolation?: Date;
}

// Security Aspect Configuration
export interface SecurityAspectConfiguration extends AspectConfiguration {
  enableThreatDetection: boolean;
  enableRateLimiting: boolean;
  enableAuditLogging: boolean;
  enableSuspiciousActivityDetection: boolean;
  enableDataSanitization: boolean;
  blockOnCriticalViolations: boolean;
  blockOnHighViolations: boolean;
  maxRiskScore: number;
  auditRetentionDays: number;
  rateLimitingEnabled: boolean;
  threatDetectionSensitivity: 'low' | 'medium' | 'high';
  enableRealTimeMonitoring: boolean;
  enableAutomaticBlocking: boolean;
}

// Simple in-memory security monitor
class InMemorySecurityMonitor implements SecurityMonitor {
  private events: SecurityEvent[] = [];
  private violations: SecurityViolation[] = [];
  private maxEvents = 10000;
  private maxViolations = 1000;

  async recordEvent(event: SecurityEvent): Promise<void> {
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
  }

  async recordViolation(violation: SecurityViolation): Promise<void> {
    this.violations.unshift(violation);
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(0, this.maxViolations);
    }
  }

  async getEvents(filter?: Partial<SecurityEvent>): Promise<SecurityEvent[]> {
    if (!filter) return [...this.events];
    
    return this.events.filter(event => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.severity && event.severity !== filter.severity) return false;
      if (filter.outcome && event.outcome !== filter.outcome) return false;
      return true;
    });
  }

  async getViolations(filter?: Partial<SecurityViolation>): Promise<SecurityViolation[]> {
    if (!filter) return [...this.violations];
    
    return this.violations.filter(violation => {
      if (filter.rule && violation.rule !== filter.rule) return false;
      if (filter.severity && violation.severity !== filter.severity) return false;
      if (filter.blocked !== undefined && violation.blocked !== filter.blocked) return false;
      return true;
    });
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const eventsByType: Record<SecurityEventType, number> = {} as any;
    const violationsBySeverity: Record<SecuritySeverity, number> = {} as any;

    // Initialize counters
    Object.values(SecurityEventType).forEach(type => {
      eventsByType[type] = 0;
    });
    Object.values(SecuritySeverity).forEach(severity => {
      violationsBySeverity[severity] = 0;
    });

    // Count events
    this.events.forEach(event => {
      eventsByType[event.type]++;
    });

    // Count violations
    this.violations.forEach(violation => {
      violationsBySeverity[violation.severity]++;
    });

    // Calculate average risk score
    const totalRiskScore = this.events.reduce((sum, event) => sum + event.riskScore, 0);
    const averageRiskScore = this.events.length > 0 ? totalRiskScore / this.events.length : 0;

    return {
      totalEvents: this.events.length,
      totalViolations: this.violations.length,
      eventsByType,
      violationsBySeverity,
      averageRiskScore,
      blockedRequests: this.violations.filter(v => v.blocked).length,
      suspiciousActivities: this.events.filter(e => e.type === SecurityEventType.SUSPICIOUS_ACTIVITY).length,
      lastEvent: this.events.length > 0 ? this.events[0].timestamp : undefined,
      lastViolation: this.violations.length > 0 ? this.violations[0].timestamp : undefined
    };
  }
}

/**
 * Authentication Security Aspect
 * Provides comprehensive security monitoring and enforcement for authentication operations
 */
export class AuthenticationSecurityAspect extends BaseAuthenticationAspect {
  private securityMonitor: SecurityMonitor;
  private securityRules: Map<string, SecurityRule> = new Map();
  private rateLimitRules: Map<string, RateLimitRule> = new Map();
  private rateLimitTracking: Map<string, { count: number; resetTime: number }> = new Map();
  private suspiciousPatterns: Set<string> = new Set();

  constructor(
    securityMonitor?: SecurityMonitor,
    configuration?: Partial<SecurityAspectConfiguration>
  ) {
    super({
      name: 'AuthenticationSecurityAspect',
      enabled: true,
      priority: 300, // Very high priority for security
      pointcuts: ['*'], // Monitor all operations
      options: {},
      ...configuration
    } as SecurityAspectConfiguration);

    this.securityMonitor = securityMonitor || new InMemorySecurityMonitor();
    this.initializeSecurityRules();
    this.initializeRateLimitRules();
    this.initializeSuspiciousPatterns();
  }

  getName(): string {
    return 'AuthenticationSecurityAspect';
  }

  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      const config = this.getTypedConfiguration();

      // Validate configuration
      if (config.maxRiskScore < 0 || config.maxRiskScore > 100) {
        errors.push(new ValidationError('Max risk score must be between 0 and 100', 'INVALID_RISK_SCORE'));
      }

      if (config.auditRetentionDays <= 0) {
        errors.push(new ValidationError('Audit retention days must be positive', 'INVALID_RETENTION'));
      }

      // Validate security monitor
      if (!this.securityMonitor) {
        errors.push(new ValidationError('Security monitor is required', 'MONITOR_MISSING'));
      }

      // Test security monitor functionality
      if (this.securityMonitor) {
        const testMetrics = await this.securityMonitor.getSecurityMetrics();
        if (typeof testMetrics.totalEvents !== 'number') {
          errors.push(new ValidationError('Security monitor metrics invalid', 'INVALID_METRICS'));
        }
      }

      // Validate security rules
      if (this.securityRules.size === 0) {
        errors.push(new ValidationError('No security rules defined', 'NO_SECURITY_RULES'));
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(new ValidationError(
        `Security aspect validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VALIDATION_ERROR'
      ));

      return {
        isValid: false,
        errors
      };
    }
  }

  // Lifecycle Methods

  async before(joinPoint: JoinPoint): Promise<void> {
    await this.executeWithTracking(
      'before',
      joinPoint.context,
      async () => {
        const config = this.getTypedConfiguration();

        // Record authentication attempt
        await this.recordSecurityEvent({
          type: SecurityEventType.AUTHENTICATION_ATTEMPT,
          severity: SecuritySeverity.LOW,
          context: joinPoint.context,
          action: joinPoint.method,
          outcome: 'success',
          riskScore: 10,
          details: {
            method: joinPoint.method,
            target: joinPoint.target.constructor.name
          }
        });

        // Check rate limiting
        if (config.enableRateLimiting) {
          await this.checkRateLimits(joinPoint.context);
        }

        // Check security rules
        if (config.enableThreatDetection) {
          await this.checkSecurityRules(joinPoint.context, joinPoint.args);
        }

        // Check for suspicious activity
        if (config.enableSuspiciousActivityDetection) {
          await this.checkSuspiciousActivity(joinPoint.context, joinPoint.args);
        }
      }
    );
  }

  async after(joinPoint: JoinPoint, result: any): Promise<void> {
    await this.executeWithTracking(
      'after',
      joinPoint.context,
      async () => {
        // Record successful operation
        await this.recordSecurityEvent({
          type: SecurityEventType.AUTHENTICATION_SUCCESS,
          severity: SecuritySeverity.LOW,
          context: joinPoint.context,
          action: joinPoint.method,
          outcome: 'success',
          riskScore: 0,
          details: {
            method: joinPoint.method,
            resultType: typeof result
          }
        });

        // Sanitize output if needed
        const config = this.getTypedConfiguration();
        if (config.enableDataSanitization) {
          await this.sanitizeData(result, joinPoint.context);
        }
      }
    );
  }

  async afterThrowing(joinPoint: JoinPoint, error: Error): Promise<void> {
    await this.executeWithTracking(
      'afterThrowing',
      joinPoint.context,
      async () => {
        // Determine severity based on error type
        const severity = this.classifyErrorSeverity(error);
        const riskScore = this.calculateRiskScore(error, joinPoint.context);

        // Record security event
        await this.recordSecurityEvent({
          type: SecurityEventType.AUTHENTICATION_FAILURE,
          severity,
          context: joinPoint.context,
          action: joinPoint.method,
          outcome: 'failure',
          riskScore,
          details: {
            method: joinPoint.method,
            error: error.message,
            errorCode: (error as any).code
          }
        });

        // Check if this indicates a security violation
        if (severity === SecuritySeverity.HIGH || severity === SecuritySeverity.CRITICAL) {
          await this.recordSecurityViolation({
            rule: 'authentication_failure',
            message: `High-severity authentication failure: ${error.message}`,
            severity,
            context: joinPoint.context,
            evidence: {
              error: error.message,
              method: joinPoint.method,
              stackTrace: error.stack
            },
            riskScore,
            blocked: false
          });
        }
      }
    );
  }

  // Security Methods

  async checkSecurityRules(context: AspectContext, data: any): Promise<void> {
    const config = this.getTypedConfiguration();

    for (const [ruleName, rule] of this.securityRules.entries()) {
      if (!rule.enabled) continue;

      try {
        const violation = await rule.checker(context, data);
        if (violation) {
          await this.recordSecurityViolation(violation);

          // Block if critical or high severity and blocking is enabled
          if ((violation.severity === SecuritySeverity.CRITICAL && config.blockOnCriticalViolations) ||
              (violation.severity === SecuritySeverity.HIGH && config.blockOnHighViolations)) {
            throw new AspectError(
              `Security violation blocked: ${violation.message}`,
              'SECURITY_VIOLATION_BLOCKED',
              {
                rule: ruleName,
                violation: violation,
                context: context
              }
            );
          }
        }
      } catch (error) {
        if (error instanceof AspectError) {
          throw error; // Re-throw security violations
        }

        // Log rule execution error but don't block
        await this.recordSecurityEvent({
          type: SecurityEventType.SECURITY_VIOLATION,
          severity: SecuritySeverity.MEDIUM,
          context,
          action: 'security_rule_check',
          outcome: 'failure',
          riskScore: 20,
          details: {
            rule: ruleName,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  }

  async checkRateLimits(context: AspectContext): Promise<void> {
    for (const [ruleName, rule] of this.rateLimitRules.entries()) {
      if (rule.skipIf && await rule.skipIf(context)) {
        continue;
      }

      const key = `${ruleName}_${rule.keyGenerator(context)}`;
      const now = Date.now();
      
      let tracking = this.rateLimitTracking.get(key);
      if (!tracking || now > tracking.resetTime) {
        tracking = {
          count: 0,
          resetTime: now + rule.windowMs
        };
        this.rateLimitTracking.set(key, tracking);
      }

      tracking.count++;

      if (tracking.count > rule.maxRequests) {
        // Rate limit exceeded
        await this.recordSecurityEvent({
          type: SecurityEventType.RATE_LIMIT_EXCEEDED,
          severity: SecuritySeverity.MEDIUM,
          context,
          action: 'rate_limit_check',
          outcome: 'blocked',
          riskScore: 30,
          details: {
            rule: ruleName,
            count: tracking.count,
            maxRequests: rule.maxRequests,
            windowMs: rule.windowMs
          }
        });

        if (rule.onLimitReached) {
          await rule.onLimitReached(context);
        }

        throw new AspectError(
          `Rate limit exceeded for ${ruleName}`,
          'RATE_LIMIT_EXCEEDED',
          {
            rule: ruleName,
            count: tracking.count,
            maxRequests: rule.maxRequests,
            resetTime: tracking.resetTime
          }
        );
      }
    }
  }

  async checkSuspiciousActivity(context: AspectContext, data: any): Promise<void> {
    const suspiciousIndicators: string[] = [];

    // Check for suspicious hostnames
    if (context.hostname) {
      for (const pattern of this.suspiciousPatterns) {
        if (context.hostname.toLowerCase().includes(pattern)) {
          suspiciousIndicators.push(`suspicious_hostname_${pattern}`);
        }
      }
    }

    // Check for suspicious user agents
    if (context.metadata.userAgent) {
      const userAgent = context.metadata.userAgent.toLowerCase();
      if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
        suspiciousIndicators.push('suspicious_user_agent');
      }
    }

    // Check for unusual request patterns
    if (context.metadata.method === 'POST' && !context.userId) {
      suspiciousIndicators.push('unauthenticated_post');
    }

    if (suspiciousIndicators.length > 0) {
      const riskScore = Math.min(suspiciousIndicators.length * 15, 100);
      
      await this.recordSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: riskScore > 50 ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM,
        context,
        action: 'suspicious_activity_check',
        outcome: 'success',
        riskScore,
        details: {
          indicators: suspiciousIndicators,
          data: this.sanitizeForLogging(data)
        }
      });
    }
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return await this.securityMonitor.getSecurityMetrics();
  }

  async getSecurityEvents(filter?: Partial<SecurityEvent>): Promise<SecurityEvent[]> {
    return await this.securityMonitor.getEvents(filter);
  }

  async getSecurityViolations(filter?: Partial<SecurityViolation>): Promise<SecurityViolation[]> {
    return await this.securityMonitor.getViolations(filter);
  }

  // Protected Methods

  protected async onInitialize(): Promise<void> {
    console.log('[SECURITY-ASPECT] Authentication Security Aspect initialized', {
      aspectName: this.getName(),
      rulesCount: this.securityRules.size,
      rateLimitRulesCount: this.rateLimitRules.size,
      configuration: this.getTypedConfiguration()
    });
  }

  protected async onCleanup(): Promise<void> {
    console.log('[SECURITY-ASPECT] Authentication Security Aspect cleanup', {
      aspectName: this.getName(),
      rateLimitTrackingSize: this.rateLimitTracking.size
    });

    this.rateLimitTracking.clear();
  }

  // Private Methods

  private getTypedConfiguration(): SecurityAspectConfiguration {
    return {
      enableThreatDetection: true,
      enableRateLimiting: true,
      enableAuditLogging: true,
      enableSuspiciousActivityDetection: true,
      enableDataSanitization: true,
      blockOnCriticalViolations: true,
      blockOnHighViolations: false,
      maxRiskScore: 80,
      auditRetentionDays: 90,
      rateLimitingEnabled: true,
      threatDetectionSensitivity: 'medium',
      enableRealTimeMonitoring: true,
      enableAutomaticBlocking: false,
      ...this.configuration
    } as SecurityAspectConfiguration;
  }

  private async recordSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'source' | 'metadata'>): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      source: 'AuthenticationSecurityAspect',
      metadata: {},
      ...eventData
    };

    await this.securityMonitor.recordEvent(event);
  }

  private async recordSecurityViolation(violation: SecurityViolation): Promise<void> {
    await this.securityMonitor.recordViolation(violation);
  }

  private classifyErrorSeverity(error: Error): SecuritySeverity {
    const errorMessage = error.message.toLowerCase();
    const errorCode = (error as any).code;

    // Critical errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return SecuritySeverity.CRITICAL;
    }

    // High severity errors
    if (errorMessage.includes('authentication') || errorMessage.includes('permission')) {
      return SecuritySeverity.HIGH;
    }

    // Medium severity errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return SecuritySeverity.MEDIUM;
    }

    // Default to low
    return SecuritySeverity.LOW;
  }

  private calculateRiskScore(error: Error, context: AspectContext): number {
    let score = 0;

    // Base score for any error
    score += 10;

    // Add score based on error type
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('unauthorized')) score += 40;
    if (errorMessage.includes('forbidden')) score += 35;
    if (errorMessage.includes('authentication')) score += 30;
    if (errorMessage.includes('permission')) score += 25;
    if (errorMessage.includes('validation')) score += 15;

    // Add score for suspicious context
    if (context.hostname && this.suspiciousPatterns.has(context.hostname)) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private async sanitizeData(data: any, context: AspectContext): Promise<any> {
    // Basic data sanitization - remove sensitive fields
    if (typeof data === 'object' && data !== null) {
      const sensitiveFields = ['password', 'secret', 'token', 'key'];
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          delete sanitized[field];
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private sanitizeForLogging(data: any): any {
    // Similar to sanitizeData but for logging purposes
    return this.sanitizeData(data, {} as AspectContext);
  }

  private generateEventId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSecurityRules(): void {
    // Suspicious hostname rule
    this.securityRules.set('suspicious_hostname', {
      name: 'suspicious_hostname',
      description: 'Detect suspicious hostname patterns',
      enabled: true,
      severity: SecuritySeverity.MEDIUM,
      tags: ['hostname', 'detection'],
      checker: async (context: AspectContext, data: any) => {
        if (!context.hostname) return null;
        
        const hostname = context.hostname.toLowerCase();
        const suspiciousPatterns = ['admin', 'test', 'debug', 'internal'];
        
        for (const pattern of suspiciousPatterns) {
          if (hostname.includes(pattern)) {
            return {
              rule: 'suspicious_hostname',
              message: `Suspicious hostname pattern detected: ${pattern}`,
              severity: SecuritySeverity.MEDIUM,
              context,
              evidence: { hostname, pattern },
              riskScore: 25,
              blocked: false
            };
          }
        }
        
        return null;
      }
    });

    // Rapid authentication attempts rule
    this.securityRules.set('rapid_auth_attempts', {
      name: 'rapid_auth_attempts',
      description: 'Detect rapid authentication attempts',
      enabled: true,
      severity: SecuritySeverity.HIGH,
      tags: ['authentication', 'brute-force'],
      checker: async (context: AspectContext, data: any) => {
        // Simplified check - in real implementation would track attempts
        if (context.operation.includes('authenticate') && context.metadata.retryCount > 3) {
          return {
            rule: 'rapid_auth_attempts',
            message: 'Multiple rapid authentication attempts detected',
            severity: SecuritySeverity.HIGH,
            context,
            evidence: { retryCount: context.metadata.retryCount },
            riskScore: 60,
            blocked: false
          };
        }
        
        return null;
      }
    });
  }

  private initializeRateLimitRules(): void {
    // Authentication rate limit
    this.rateLimitRules.set('auth_rate_limit', {
      name: 'auth_rate_limit',
      windowMs: 60000, // 1 minute
      maxRequests: 10,
      keyGenerator: (context: AspectContext) => context.hostname || 'unknown',
      skipIf: (context: AspectContext) => context.environment === 'development'
    });

    // API rate limit
    this.rateLimitRules.set('api_rate_limit', {
      name: 'api_rate_limit',
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      keyGenerator: (context: AspectContext) => context.userId || context.hostname || 'anonymous'
    });
  }

  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns.add('admin');
    this.suspiciousPatterns.add('test');
    this.suspiciousPatterns.add('debug');
    this.suspiciousPatterns.add('internal');
    this.suspiciousPatterns.add('staging');
    this.suspiciousPatterns.add('dev');
    this.suspiciousPatterns.add('localhost');
    this.suspiciousPatterns.add('127.0.0.1');
  }
}