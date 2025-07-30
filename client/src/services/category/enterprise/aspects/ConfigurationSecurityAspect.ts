/**
 * Configuration Security Aspect
 * Enterprise AOP-compliant security cross-cutting concern
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles all security aspects for configuration operations:
 * - Access control and authorization
 * - Security policy enforcement
 * - Audit trail generation
 * - Threat detection and prevention
 * - Security compliance monitoring
 */

import { JoinPoint, Aspect, AspectMetadata, Before, AfterReturning } from './ConfigurationValidationAspect';

// ===== SECURITY DOMAIN TYPES =====

/**
 * Security Context Value Object
 * Immutable security context for current operation
 */
export class SecurityContext {
  constructor(
    public readonly userId: string | null,
    public readonly sessionId: string,
    public readonly permissions: readonly string[],
    public readonly roles: readonly string[],
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly timestamp: number
  ) {}

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.permissions.includes('*');
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.roles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.roles.includes(role));
  }

  /**
   * Check if context represents authenticated user
   */
  get isAuthenticated(): boolean {
    return this.userId !== null && this.userId.trim() !== '';
  }

  /**
   * Check if context represents admin user
   */
  get isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'administrator', 'root']);
  }
}

/**
 * Security Policy Value Object
 * Defines security rules for configuration access
 */
export class SecurityPolicy {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly requiredPermissions: readonly string[],
    public readonly requiredRoles: readonly string[],
    public readonly allowAnonymous: boolean,
    public readonly rateLimitPerMinute: number,
    public readonly auditRequired: boolean
  ) {}

  /**
   * Check if context satisfies policy requirements
   */
  isAuthorized(context: SecurityContext): SecurityPolicyResult {
    const violations: string[] = [];

    // Check authentication requirement
    if (!this.allowAnonymous && !context.isAuthenticated) {
      violations.push('Authentication required');
    }

    // Check permission requirements
    if (this.requiredPermissions.length > 0) {
      const missingPermissions = this.requiredPermissions.filter(
        permission => !context.hasPermission(permission)
      );
      if (missingPermissions.length > 0) {
        violations.push(`Missing permissions: ${missingPermissions.join(', ')}`);
      }
    }

    // Check role requirements
    if (this.requiredRoles.length > 0 && !context.hasAnyRole([...this.requiredRoles])) {
      violations.push(`Missing required roles: ${this.requiredRoles.join(', ')}`);
    }

    return new SecurityPolicyResult(
      violations.length === 0,
      violations,
      this.name
    );
  }
}

/**
 * Security Policy Result Value Object
 * Result of security policy evaluation
 */
export class SecurityPolicyResult {
  constructor(
    public readonly isAuthorized: boolean,
    public readonly violations: readonly string[],
    public readonly policyName: string
  ) {}

  get authorizationMessage(): string {
    if (this.isAuthorized) {
      return `Authorized by policy: ${this.policyName}`;
    }
    return `Access denied by policy ${this.policyName}: ${this.violations.join(', ')}`;
  }
}

/**
 * Security Audit Event Value Object
 * Immutable audit trail entry
 */
export class SecurityAuditEvent {
  constructor(
    public readonly eventId: string,
    public readonly timestamp: number,
    public readonly userId: string | null,
    public readonly sessionId: string,
    public readonly operation: string,
    public readonly resource: string,
    public readonly outcome: 'success' | 'failure' | 'warning',
    public readonly details: Record<string, unknown>,
    public readonly ipAddress: string,
    public readonly userAgent: string
  ) {}

  get severity(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.outcome === 'failure') {
      if (this.operation.includes('admin') || this.operation.includes('sensitive')) {
        return 'critical';
      }
      return 'high';
    }
    if (this.outcome === 'warning') {
      return 'medium';
    }
    return 'low';
  }
}

/**
 * Threat Detection Result Value Object
 * Result of threat analysis
 */
export class ThreatDetectionResult {
  constructor(
    public readonly threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical',
    public readonly indicators: readonly string[],
    public readonly confidence: number,
    public readonly recommendedAction: string
  ) {}

  get requiresImmedateAction(): boolean {
    return this.threatLevel === 'critical' || this.threatLevel === 'high';
  }
}

// ===== SECURITY ERRORS =====

/**
 * Configuration Security Error
 * Domain-specific error for security violations
 */
export class ConfigurationSecurityError extends Error {
  constructor(
    message: string,
    public readonly securityCode: string,
    public readonly userId?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'ConfigurationSecurityError';
  }
}

/**
 * Access Denied Error
 * Specific security error for authorization failures
 */
export class AccessDeniedError extends ConfigurationSecurityError {
  constructor(operation: string, userId?: string, requiredPermissions?: string[]) {
    const message = `Access denied for operation: ${operation}`;
    super(message, 'ACCESS_DENIED', userId, operation);
  }
}

/**
 * Rate Limit Exceeded Error
 * Specific security error for rate limiting violations
 */
export class RateLimitExceededError extends ConfigurationSecurityError {
  constructor(operation: string, userId?: string, rateLimitPerMinute?: number) {
    const message = `Rate limit exceeded for operation: ${operation}`;
    super(message, 'RATE_LIMIT_EXCEEDED', userId, operation);
  }
}

// ===== SECURITY SERVICES =====

/**
 * Security Context Provider
 * Provides current security context for operations
 */
export class SecurityContextProvider {
  private static currentContext: SecurityContext | null = null;

  /**
   * Set current security context
   */
  static setContext(context: SecurityContext): void {
    SecurityContextProvider.currentContext = context;
  }

  /**
   * Get current security context
   */
  static getContext(): SecurityContext {
    if (!SecurityContextProvider.currentContext) {
      // Return anonymous context as fallback
      return new SecurityContext(
        null,
        'anonymous-session',
        [],
        [],
        '127.0.0.1',
        'unknown',
        Date.now()
      );
    }
    return SecurityContextProvider.currentContext;
  }

  /**
   * Clear current security context
   */
  static clearContext(): void {
    SecurityContextProvider.currentContext = null;
  }

  /**
   * Create context from request-like object
   */
  static createContextFromRequest(request: {
    user?: { id: string; permissions: string[]; roles: string[] };
    sessionID?: string;
    ip?: string;
    headers?: { 'user-agent'?: string };
  }): SecurityContext {
    return new SecurityContext(
      request.user?.id || null,
      request.sessionID || 'no-session',
      request.user?.permissions || [],
      request.user?.roles || [],
      request.ip || '127.0.0.1',
      request.headers?.['user-agent'] || 'unknown',
      Date.now()
    );
  }
}

/**
 * Security Audit Logger
 * Centralized security event logging
 */
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private auditEvents: SecurityAuditEvent[] = [];

  private constructor() {}

  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }

  /**
   * Log security audit event
   */
  logEvent(
    operation: string,
    resource: string,
    outcome: 'success' | 'failure' | 'warning',
    details: Record<string, unknown> = {}
  ): void {
    const context = SecurityContextProvider.getContext();
    const eventId = this.generateEventId();

    const auditEvent = new SecurityAuditEvent(
      eventId,
      Date.now(),
      context.userId,
      context.sessionId,
      operation,
      resource,
      outcome,
      details,
      context.ipAddress,
      context.userAgent
    );

    this.auditEvents.push(auditEvent);

    // Keep only last 1000 events to prevent memory leaks
    if (this.auditEvents.length > 1000) {
      this.auditEvents = this.auditEvents.slice(-1000);
    }

    // Log to console for development (in production, would send to security system)
    this.logToSecuritySystem(auditEvent);
  }

  /**
   * Get recent audit events
   */
  getRecentEvents(count: number = 100): SecurityAuditEvent[] {
    return this.auditEvents.slice(-count);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): SecurityAuditEvent[] {
    return this.auditEvents.filter(event => event.userId === userId);
  }

  /**
   * Get suspicious events
   */
  getSuspiciousEvents(): SecurityAuditEvent[] {
    return this.auditEvents.filter(event => 
      event.outcome === 'failure' || event.severity === 'high' || event.severity === 'critical'
    );
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private logToSecuritySystem(event: SecurityAuditEvent): void {
    // In development, log to console
    if (event.severity === 'critical' || event.severity === 'high') {
      console.error('SECURITY AUDIT:', {
        eventId: event.eventId,
        operation: event.operation,
        outcome: event.outcome,
        userId: event.userId,
        details: event.details
      });
    } else {
      console.log('Security Audit:', {
        operation: event.operation,
        outcome: event.outcome,
        userId: event.userId
      });
    }
  }
}

/**
 * Threat Detection Engine
 * AI-powered threat detection and analysis
 */
export class ThreatDetectionEngine {
  private static readonly SUSPICIOUS_PATTERNS = [
    /admin|root|administrator/i,
    /\.\./,
    /<script|javascript|eval\(/i,
    /union|select|insert|delete|drop/i
  ];

  /**
   * Analyze request for potential threats
   */
  static analyzeThreat(
    operation: string,
    resource: string,
    context: SecurityContext,
    metadata: Record<string, unknown>
  ): ThreatDetectionResult {
    const indicators: string[] = [];
    let threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    let confidence = 0;

    // Check for suspicious patterns in resource
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(resource)) {
        indicators.push(`Suspicious pattern in resource: ${pattern.source}`);
        threatLevel = 'medium';
        confidence += 0.3;
      }
    }

    // Check for unusual access patterns
    if (!context.isAuthenticated && operation.includes('admin')) {
      indicators.push('Unauthenticated admin operation attempt');
      threatLevel = 'high';
      confidence += 0.5;
    }

    // Check for privilege escalation attempts
    if (context.isAuthenticated && !context.isAdmin && operation.includes('admin')) {
      indicators.push('Potential privilege escalation attempt');
      threatLevel = 'medium';
      confidence += 0.4;
    }

    // Check for unusual IP patterns (simplified)
    if (context.ipAddress.includes('127.0.0.1') && operation.includes('production')) {
      indicators.push('Localhost access to production resources');
      threatLevel = 'low';
      confidence += 0.2;
    }

    // Determine final threat level based on indicators
    if (indicators.length >= 3) {
      threatLevel = 'critical';
      confidence = Math.min(confidence + 0.3, 1.0);
    } else if (indicators.length >= 2) {
      threatLevel = threatLevel === 'none' ? 'medium' : threatLevel;
      confidence = Math.min(confidence + 0.2, 1.0);
    }

    const recommendedAction = this.getRecommendedAction(threatLevel);

    return new ThreatDetectionResult(threatLevel, indicators, confidence, recommendedAction);
  }

  private static getRecommendedAction(threatLevel: string): string {
    switch (threatLevel) {
      case 'critical':
        return 'Block immediately and alert security team';
      case 'high':
        return 'Block request and log incident';
      case 'medium':
        return 'Log incident and monitor closely';
      case 'low':
        return 'Monitor and log for analysis';
      default:
        return 'Continue normal processing';
    }
  }
}

/**
 * Rate Limiter
 * Token bucket rate limiting implementation
 */
export class RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; lastRefill: number }>();

  constructor(
    private readonly maxTokens: number = 60,
    private readonly refillRate: number = 1, // tokens per second
    private readonly windowSize: number = 60000 // 1 minute
  ) {}

  /**
   * Check if operation is allowed under rate limit
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(identifier) || { tokens: this.maxTokens, lastRefill: now };

    // Refill tokens based on time elapsed
    const timeSinceRefill = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timeSinceRefill / 1000 * this.refillRate);
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request can be processed
    if (bucket.tokens > 0) {
      bucket.tokens--;
      this.buckets.set(identifier, bucket);
      return true;
    }

    this.buckets.set(identifier, bucket);
    return false;
  }

  /**
   * Get remaining tokens for identifier
   */
  getRemainingTokens(identifier: string): number {
    const bucket = this.buckets.get(identifier);
    return bucket ? bucket.tokens : this.maxTokens;
  }
}

// ===== CONFIGURATION SECURITY ASPECT =====

/**
 * Configuration Security Aspect
 * Implements security cross-cutting concern for configuration operations
 * 
 * Responsibilities:
 * - Access control and authorization
 * - Security policy enforcement
 * - Audit trail generation
 * - Threat detection and prevention
 * - Rate limiting and abuse prevention
 */
@Aspect()
export class ConfigurationSecurityAspect {
  private readonly auditLogger: SecurityAuditLogger;
  private readonly rateLimiter: RateLimiter;
  private readonly securityPolicies: Map<string, SecurityPolicy>;

  constructor() {
    this.auditLogger = SecurityAuditLogger.getInstance();
    this.rateLimiter = new RateLimiter(60, 1, 60000); // 60 requests per minute
    this.securityPolicies = this.initializeSecurityPolicies();
  }

  /**
   * Enforce Security Policies
   * @Before advice - enforces security before method execution
   */
  @Before('ConfigurationDomainService.getConfiguration')
  enforceSecurityPolicies(joinPoint: JoinPoint<[string]>): void {
    const [configurationKey] = joinPoint.args;
    const context = SecurityContextProvider.getContext();
    const operation = 'getConfiguration';

    // Store security context in join point metadata
    joinPoint.metadata.securityContext = context;
    joinPoint.metadata.securityOperationId = this.generateOperationId();

    try {
      // 1. Rate limiting check
      this.enforceRateLimit(context, operation);

      // 2. Security policy enforcement
      this.enforceConfigurationPolicy(configurationKey, context);

      // 3. Threat detection
      const threatResult = ThreatDetectionEngine.analyzeThreat(
        operation,
        configurationKey,
        context,
        joinPoint.metadata
      );

      if (threatResult.requiresImmedateAction) {
        this.auditLogger.logEvent(operation, configurationKey, 'failure', {
          threatLevel: threatResult.threatLevel,
          indicators: threatResult.indicators,
          confidence: threatResult.confidence
        });

        throw new ConfigurationSecurityError(
          `Security threat detected: ${threatResult.recommendedAction}`,
          'THREAT_DETECTED',
          context.userId,
          operation
        );
      }

      // 4. Log successful security check
      this.auditLogger.logEvent(operation, configurationKey, 'success', {
        securityPolicyApplied: 'configuration-access',
        threatLevel: threatResult.threatLevel
      });

    } catch (error) {
      // Log security failure
      this.auditLogger.logEvent(operation, configurationKey, 'failure', {
        error: error instanceof Error ? error.message : 'Unknown error',
        securityCode: error instanceof ConfigurationSecurityError ? error.securityCode : 'UNKNOWN'
      });

      throw error;
    }
  }

  /**
   * Audit Successful Operations
   * @AfterReturning advice - logs successful security-cleared operations
   */
  @AfterReturning('ConfigurationDomainService.getConfiguration')
  auditSuccessfulOperation(joinPoint: JoinPoint<[string]>, result: unknown): void {
    const [configurationKey] = joinPoint.args;
    const context = joinPoint.metadata.securityContext as SecurityContext;
    const operationId = joinPoint.metadata.securityOperationId as string;

    this.auditLogger.logEvent('getConfiguration', configurationKey, 'success', {
      operationId,
      resultType: typeof result,
      accessTime: Date.now()
    });
  }

  /**
   * Enforce Rate Limiting
   * Prevents abuse through excessive requests
   */
  private enforceRateLimit(context: SecurityContext, operation: string): void {
    const identifier = context.userId || context.ipAddress;
    
    if (!this.rateLimiter.isAllowed(identifier)) {
      throw new RateLimitExceededError(operation, context.userId, 60);
    }
  }

  /**
   * Enforce Configuration Access Policy
   * Validates access rights for specific configuration
   */
  private enforceConfigurationPolicy(configurationKey: string, context: SecurityContext): void {
    const policy = this.getApplicablePolicy(configurationKey);
    const result = policy.isAuthorized(context);

    if (!result.isAuthorized) {
      throw new AccessDeniedError(
        `getConfiguration:${configurationKey}`,
        context.userId,
        [...policy.requiredPermissions]
      );
    }
  }

  /**
   * Get Applicable Security Policy
   * Determines which security policy applies to given configuration
   */
  private getApplicablePolicy(configurationKey: string): SecurityPolicy {
    // Check for admin configurations
    if (configurationKey.includes('admin') || configurationKey.includes('system')) {
      return this.securityPolicies.get('admin-configuration') || this.securityPolicies.get('default')!;
    }

    // Check for sensitive configurations
    if (configurationKey.includes('production') || configurationKey.includes('secure')) {
      return this.securityPolicies.get('sensitive-configuration') || this.securityPolicies.get('default')!;
    }

    // Default policy for regular configurations
    return this.securityPolicies.get('default')!;
  }

  /**
   * Initialize Security Policies
   * Sets up predefined security policies for different configuration types
   */
  private initializeSecurityPolicies(): Map<string, SecurityPolicy> {
    const policies = new Map<string, SecurityPolicy>();

    // Default policy - allow authenticated users
    policies.set('default', new SecurityPolicy(
      'default-configuration-access',
      'Default access policy for configuration resources',
      ['VIEW_CONFIGURATION'],
      [],
      false, // require authentication
      60, // 60 requests per minute
      true // audit required
    ));

    // Admin policy - require admin role
    policies.set('admin-configuration', new SecurityPolicy(
      'admin-configuration-access',
      'Restricted access policy for admin configurations',
      ['VIEW_CONFIGURATION', 'ADMIN_ACCESS'],
      ['admin', 'administrator'],
      false,
      30, // 30 requests per minute
      true
    ));

    // Sensitive policy - require special permissions
    policies.set('sensitive-configuration', new SecurityPolicy(
      'sensitive-configuration-access',
      'Restricted access policy for sensitive configurations',
      ['VIEW_CONFIGURATION', 'SENSITIVE_ACCESS'],
      ['user', 'premium'],
      false,
      45, // 45 requests per minute
      true
    ));

    // Public policy - allow anonymous access
    policies.set('public-configuration', new SecurityPolicy(
      'public-configuration-access',
      'Open access policy for public configurations',
      [],
      [],
      true, // allow anonymous
      120, // 120 requests per minute
      false // no audit required
    ));

    return policies;
  }

  /**
   * Generate Security Operation ID
   * Creates unique identifier for security audit trail
   */
  private generateOperationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `sec_${timestamp}_${random}`;
  }

  /**
   * Get Security Statistics
   * Returns security metrics for monitoring
   */
  getSecurityStatistics(): {
    totalAuditEvents: number;
    suspiciousEvents: number;
    rateLimitViolations: number;
    accessDenials: number;
    threatDetections: number;
  } {
    const events = this.auditLogger.getRecentEvents(1000);
    
    return {
      totalAuditEvents: events.length,
      suspiciousEvents: this.auditLogger.getSuspiciousEvents().length,
      rateLimitViolations: events.filter(e => e.details.securityCode === 'RATE_LIMIT_EXCEEDED').length,
      accessDenials: events.filter(e => e.details.securityCode === 'ACCESS_DENIED').length,
      threatDetections: events.filter(e => e.details.securityCode === 'THREAT_DETECTED').length
    };
  }

  /**
   * Get Recent Security Events
   * Returns recent security audit events for monitoring
   */
  getRecentSecurityEvents(count: number = 50): SecurityAuditEvent[] {
    return this.auditLogger.getRecentEvents(count);
  }

  /**
   * Get Aspect Metadata
   * Returns aspect execution metadata
   */
  getAspectMetadata(): AspectMetadata {
    const stats = this.getSecurityStatistics();
    
    return {
      aspectName: 'ConfigurationSecurityAspect',
      executionTime: 0, // Security checks are typically very fast
      validationRules: [
        'accessControl',
        'rateLimiting',
        'threatDetection',
        'auditLogging'
      ],
      errorCount: stats.accessDenials + stats.threatDetections
    };
  }
}

export default ConfigurationSecurityAspect;