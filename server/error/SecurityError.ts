/**
 * Security Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade security-specific errors with audit context
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorClassification,
  ErrorRecoverySuggestion 
} from './DomainError';

// Security Error Types
export enum SecurityErrorType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_OPERATION = 'FORBIDDEN_OPERATION',
  SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',
  SUSPICIOUS_ACTIVITY_DETECTED = 'SUSPICIOUS_ACTIVITY_DETECTED',
  ATTACK_ATTEMPT_DETECTED = 'ATTACK_ATTEMPT_DETECTED',
  DATA_BREACH_SUSPECTED = 'DATA_BREACH_SUSPECTED',
  PRIVILEGE_ESCALATION_ATTEMPT = 'PRIVILEGE_ESCALATION_ATTEMPT',
  MALICIOUS_INPUT_DETECTED = 'MALICIOUS_INPUT_DETECTED',
  SECURITY_TOKEN_COMPROMISED = 'SECURITY_TOKEN_COMPROMISED',
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  SIGNATURE_VERIFICATION_FAILED = 'SIGNATURE_VERIFICATION_FAILED',
  CERTIFICATE_VALIDATION_FAILED = 'CERTIFICATE_VALIDATION_FAILED',
  SECURE_COMMUNICATION_FAILED = 'SECURE_COMMUNICATION_FAILED',
  AUDIT_LOG_TAMPERING = 'AUDIT_LOG_TAMPERING',
  SECURITY_CONFIGURATION_ERROR = 'SECURITY_CONFIGURATION_ERROR'
}

// Security Threat Levels
export enum SecurityThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Attack Types
export enum AttackType {
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  BRUTE_FORCE = 'brute_force',
  DOS = 'dos',
  DDOS = 'ddos',
  PHISHING = 'phishing',
  MALWARE = 'malware',
  SOCIAL_ENGINEERING = 'social_engineering',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  UNKNOWN = 'unknown'
}

// Security Context Extensions
export interface SecurityErrorContext extends ErrorContext {
  readonly threatLevel?: SecurityThreatLevel;
  readonly attackType?: AttackType;
  readonly sourceIp?: string;
  readonly userAgent?: string;
  readonly affectedResources?: string[];
  readonly securityPolicyViolated?: string;
  readonly evidenceFingerprint?: string;
  readonly incidentId?: string;
  readonly alertTriggered?: boolean;
  readonly blockingAction?: string;
  readonly suspiciousPatterns?: string[];
  readonly riskScore?: number;
  readonly geoLocation?: string;
  readonly deviceFingerprint?: string;
}

/**
 * Base Security Error
 * Enterprise-grade security error with threat assessment and audit context
 */
export class SecurityError extends DomainError {
  public readonly securityErrorType: SecurityErrorType;
  public readonly securityContext: SecurityErrorContext;
  public readonly threatLevel: SecurityThreatLevel;
  public readonly incidentId: string;

  constructor(
    message: string,
    securityErrorType: SecurityErrorType,
    securityContext: Partial<SecurityErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    // Determine threat level
    const threatLevel = securityContext.threatLevel || 
                       SecurityError.determineThreatLevel(securityErrorType);

    // Default security error classification
    const defaultClassification: ErrorClassification = {
      severity: SecurityError.mapThreatLevelToSeverity(threatLevel),
      category: ErrorCategory.SECURITY,
      retryable: false,
      userFacing: false,
      requiresEscalation: threatLevel === SecurityThreatLevel.HIGH || 
                          threatLevel === SecurityThreatLevel.CRITICAL ||
                          threatLevel === SecurityThreatLevel.EMERGENCY,
      automatedRecovery: false,
      ...classification
    };

    // Generate incident ID
    const incidentId = SecurityError.generateIncidentId(securityErrorType);

    // Default recovery suggestions for security
    const defaultRecoveryConfig = SecurityError.getDefaultRecoveryConfig(securityErrorType);
    const combinedSuggestions = [...defaultRecoveryConfig, ...recoverySuggestions];

    super(
      message,
      securityErrorType,
      {
        component: 'SecuritySystem',
        ...securityContext,
        metadata: {
          incidentId,
          threatLevel,
          ...securityContext.metadata
        }
      },
      defaultClassification,
      combinedSuggestions
    );

    this.securityErrorType = securityErrorType;
    this.threatLevel = threatLevel;
    this.incidentId = incidentId;
    this.securityContext = {
      ...this.context,
      threatLevel,
      incidentId,
      ...securityContext
    } as SecurityErrorContext;

    // Log security incident
    this.logSecurityIncident();
    
    // Trigger security alerts for high-risk events
    this.triggerSecurityAlerts();
  }

  /**
   * Get security error type
   */
  getSecurityErrorType(): SecurityErrorType {
    return this.securityErrorType;
  }

  /**
   * Get security context
   */
  getSecurityContext(): SecurityErrorContext {
    return this.securityContext;
  }

  /**
   * Get threat level
   */
  getThreatLevel(): SecurityThreatLevel {
    return this.threatLevel;
  }

  /**
   * Get incident ID
   */
  getIncidentId(): string {
    return this.incidentId;
  }

  /**
   * Check if error represents active attack
   */
  isActiveAttack(): boolean {
    const attackTypes = [
      SecurityErrorType.ATTACK_ATTEMPT_DETECTED,
      SecurityErrorType.MALICIOUS_INPUT_DETECTED,
      SecurityErrorType.PRIVILEGE_ESCALATION_ATTEMPT,
      SecurityErrorType.SUSPICIOUS_ACTIVITY_DETECTED
    ];
    return attackTypes.includes(this.securityErrorType);
  }

  /**
   * Check if error requires immediate response
   */
  requiresImmediateResponse(): boolean {
    return this.threatLevel === SecurityThreatLevel.CRITICAL ||
           this.threatLevel === SecurityThreatLevel.EMERGENCY ||
           this.isActiveAttack();
  }

  /**
   * Check if error should trigger security alerts
   */
  shouldTriggerAlerts(): boolean {
    return this.threatLevel === SecurityThreatLevel.HIGH ||
           this.threatLevel === SecurityThreatLevel.CRITICAL ||
           this.threatLevel === SecurityThreatLevel.EMERGENCY;
  }

  /**
   * Get security incident data for SIEM/SOAR
   */
  getSecurityIncidentData(): Record<string, any> {
    return {
      eventType: 'security_incident',
      incidentId: this.incidentId,
      errorType: this.securityErrorType,
      threatLevel: this.threatLevel,
      attackType: this.securityContext.attackType,
      sourceIp: this.securityContext.sourceIp,
      userAgent: this.securityContext.userAgent,
      affectedResources: this.securityContext.affectedResources,
      evidenceFingerprint: this.securityContext.evidenceFingerprint,
      riskScore: this.securityContext.riskScore,
      geoLocation: this.securityContext.geoLocation,
      timestamp: this.context.timestamp,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      suspiciousPatterns: this.securityContext.suspiciousPatterns,
      blockingAction: this.securityContext.blockingAction,
      requiresEscalation: this.requiresEscalation(),
      activeAttack: this.isActiveAttack()
    };
  }

  /**
   * Log security incident
   */
  private logSecurityIncident(): void {
    const incidentData = this.getSecurityIncidentData();
    console.warn('[SECURITY-INCIDENT] Security error occurred:', incidentData);
    
    // In production, would send to SIEM/SOAR system
    if (this.requiresImmediateResponse()) {
      console.error('[SECURITY-ALERT] Critical security incident:', incidentData);
    }
  }

  /**
   * Trigger security alerts
   */
  private triggerSecurityAlerts(): void {
    if (this.shouldTriggerAlerts()) {
      const alertData = {
        incidentId: this.incidentId,
        threatLevel: this.threatLevel,
        errorType: this.securityErrorType,
        message: this.message,
        timestamp: this.context.timestamp,
        sourceIp: this.securityContext.sourceIp,
        evidence: this.securityContext.evidenceFingerprint
      };

      console.error('[SECURITY-ALERT] Alert triggered:', alertData);
      
      // In production, would trigger:
      // - SIEM alerts
      // - SOC notifications  
      // - Automated blocking rules
      // - Incident response workflows
    }
  }

  /**
   * Determine threat level from error type
   */
  private static determineThreatLevel(errorType: SecurityErrorType): SecurityThreatLevel {
    const threatLevelMap: Record<SecurityErrorType, SecurityThreatLevel> = {
      [SecurityErrorType.UNAUTHORIZED_ACCESS]: SecurityThreatLevel.MEDIUM,
      [SecurityErrorType.FORBIDDEN_OPERATION]: SecurityThreatLevel.MEDIUM,
      [SecurityErrorType.SECURITY_POLICY_VIOLATION]: SecurityThreatLevel.MEDIUM,
      [SecurityErrorType.SUSPICIOUS_ACTIVITY_DETECTED]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.ATTACK_ATTEMPT_DETECTED]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.DATA_BREACH_SUSPECTED]: SecurityThreatLevel.CRITICAL,
      [SecurityErrorType.PRIVILEGE_ESCALATION_ATTEMPT]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.MALICIOUS_INPUT_DETECTED]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.SECURITY_TOKEN_COMPROMISED]: SecurityThreatLevel.CRITICAL,
      [SecurityErrorType.ENCRYPTION_FAILURE]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.SIGNATURE_VERIFICATION_FAILED]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.CERTIFICATE_VALIDATION_FAILED]: SecurityThreatLevel.HIGH,
      [SecurityErrorType.SECURE_COMMUNICATION_FAILED]: SecurityThreatLevel.MEDIUM,
      [SecurityErrorType.AUDIT_LOG_TAMPERING]: SecurityThreatLevel.CRITICAL,
      [SecurityErrorType.SECURITY_CONFIGURATION_ERROR]: SecurityThreatLevel.MEDIUM
    };

    return threatLevelMap[errorType] || SecurityThreatLevel.MEDIUM;
  }

  /**
   * Map threat level to error severity
   */
  private static mapThreatLevelToSeverity(threatLevel: SecurityThreatLevel): ErrorSeverity {
    const severityMap: Record<SecurityThreatLevel, ErrorSeverity> = {
      [SecurityThreatLevel.LOW]: ErrorSeverity.LOW,
      [SecurityThreatLevel.MEDIUM]: ErrorSeverity.MEDIUM,
      [SecurityThreatLevel.HIGH]: ErrorSeverity.HIGH,
      [SecurityThreatLevel.CRITICAL]: ErrorSeverity.CRITICAL,
      [SecurityThreatLevel.EMERGENCY]: ErrorSeverity.CRITICAL
    };

    return severityMap[threatLevel];
  }

  /**
   * Generate unique incident ID
   */
  private static generateIncidentId(errorType: SecurityErrorType): string {
    const timestamp = Date.now();
    const errorPrefix = errorType.substring(0, 3).toUpperCase();
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `SEC-${errorPrefix}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Get default recovery suggestions by error type
   */
  private static getDefaultRecoveryConfig(errorType: SecurityErrorType): ErrorRecoverySuggestion[] {
    const recoveryConfigs: Record<SecurityErrorType, ErrorRecoverySuggestion[]> = {
      [SecurityErrorType.UNAUTHORIZED_ACCESS]: [
        {
          action: 'verify_authentication',
          description: 'Verify user authentication status and permissions',
          automated: true,
          priority: 100
        },
        {
          action: 'redirect_to_login',
          description: 'Redirect to authentication page',
          automated: true,
          priority: 90
        }
      ],
      [SecurityErrorType.ATTACK_ATTEMPT_DETECTED]: [
        {
          action: 'block_source_ip',
          description: 'Block source IP address temporarily',
          automated: true,
          priority: 100
        },
        {
          action: 'increase_monitoring',
          description: 'Increase monitoring for similar patterns',
          automated: true,
          priority: 90
        },
        {
          action: 'alert_security_team',
          description: 'Alert security operations team',
          automated: true,
          priority: 80
        }
      ],
      [SecurityErrorType.SUSPICIOUS_ACTIVITY_DETECTED]: [
        {
          action: 'rate_limit_user',
          description: 'Apply rate limiting to user actions',
          automated: true,
          priority: 100
        },
        {
          action: 'require_additional_verification',
          description: 'Require additional verification steps',
          automated: true,
          priority: 90
        }
      ],
      [SecurityErrorType.DATA_BREACH_SUSPECTED]: [
        {
          action: 'isolate_affected_systems',
          description: 'Isolate potentially affected systems',
          automated: true,
          priority: 100
        },
        {
          action: 'preserve_evidence',
          description: 'Preserve forensic evidence',
          automated: true,
          priority: 95
        },
        {
          action: 'initiate_incident_response',
          description: 'Initiate formal incident response procedures',
          automated: false,
          priority: 90
        }
      ],
      [SecurityErrorType.MALICIOUS_INPUT_DETECTED]: [
        {
          action: 'sanitize_input',
          description: 'Apply additional input sanitization',
          automated: true,
          priority: 100
        },
        {
          action: 'block_malicious_patterns',
          description: 'Block similar malicious input patterns',
          automated: true,
          priority: 90
        }
      ],
      // Default empty arrays for other types
      [SecurityErrorType.FORBIDDEN_OPERATION]: [],
      [SecurityErrorType.SECURITY_POLICY_VIOLATION]: [],
      [SecurityErrorType.PRIVILEGE_ESCALATION_ATTEMPT]: [],
      [SecurityErrorType.SECURITY_TOKEN_COMPROMISED]: [],
      [SecurityErrorType.ENCRYPTION_FAILURE]: [],
      [SecurityErrorType.SIGNATURE_VERIFICATION_FAILED]: [],
      [SecurityErrorType.CERTIFICATE_VALIDATION_FAILED]: [],
      [SecurityErrorType.SECURE_COMMUNICATION_FAILED]: [],
      [SecurityErrorType.AUDIT_LOG_TAMPERING]: [],
      [SecurityErrorType.SECURITY_CONFIGURATION_ERROR]: []
    };

    return recoveryConfigs[errorType] || [];
  }
}

/**
 * Unauthorized Access Error
 * Specific error for unauthorized access attempts
 */
export class UnauthorizedAccessError extends SecurityError {
  constructor(
    resource: string,
    userId?: string,
    context: Partial<SecurityErrorContext> = {}
  ) {
    super(
      `Unauthorized access attempt to resource: ${resource}${userId ? ` by user ${userId}` : ''}`,
      SecurityErrorType.UNAUTHORIZED_ACCESS,
      {
        affectedResources: [resource],
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        userFacing: true
      }
    );
  }
}

/**
 * Attack Attempt Detected Error
 * Specific error for detected attack attempts
 */
export class AttackAttemptDetectedError extends SecurityError {
  constructor(
    attackType: AttackType,
    sourceIp: string,
    evidence: string,
    context: Partial<SecurityErrorContext> = {}
  ) {
    super(
      `Attack attempt detected: ${attackType} from ${sourceIp}`,
      SecurityErrorType.ATTACK_ATTEMPT_DETECTED,
      {
        attackType,
        sourceIp,
        evidenceFingerprint: evidence,
        alertTriggered: true,
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Malicious Input Detected Error
 * Specific error for malicious input detection
 */
export class MaliciousInputDetectedError extends SecurityError {
  constructor(
    inputField: string,
    maliciousPattern: string,
    context: Partial<SecurityErrorContext> = {}
  ) {
    super(
      `Malicious input detected in field '${inputField}': ${maliciousPattern}`,
      SecurityErrorType.MALICIOUS_INPUT_DETECTED,
      {
        suspiciousPatterns: [maliciousPattern],
        blockingAction: 'input_rejected',
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        userFacing: false
      }
    );
  }
}

/**
 * Privilege Escalation Attempt Error
 * Specific error for privilege escalation attempts
 */
export class PrivilegeEscalationAttemptError extends SecurityError {
  constructor(
    userId: string,
    attemptedPrivilege: string,
    currentPrivileges: string[],
    context: Partial<SecurityErrorContext> = {}
  ) {
    super(
      `Privilege escalation attempt: User ${userId} attempted to access '${attemptedPrivilege}'`,
      SecurityErrorType.PRIVILEGE_ESCALATION_ATTEMPT,
      {
        metadata: {
          attemptedPrivilege,
          currentPrivileges,
          ...context.metadata
        },
        alertTriggered: true,
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Data Breach Suspected Error
 * Specific error for suspected data breaches
 */
export class DataBreachSuspectedError extends SecurityError {
  constructor(
    affectedResources: string[],
    evidenceFingerprint: string,
    context: Partial<SecurityErrorContext> = {}
  ) {
    super(
      `Data breach suspected: ${affectedResources.length} resources potentially affected`,
      SecurityErrorType.DATA_BREACH_SUSPECTED,
      {
        affectedResources,
        evidenceFingerprint,
        alertTriggered: true,
        threatLevel: SecurityThreatLevel.EMERGENCY,
        ...context
      },
      {
        severity: ErrorSeverity.CRITICAL,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Security Error Factory
 * Factory for creating security errors with consistent patterns
 */
export class SecurityErrorFactory {
  /**
   * Create security error from HTTP request analysis
   */
  static fromHttpRequest(
    request: any,
    threatIndicators: string[],
    riskScore: number,
    context: Partial<SecurityErrorContext> = {}
  ): SecurityError {
    const errorType = riskScore > 80 
      ? SecurityErrorType.ATTACK_ATTEMPT_DETECTED
      : SecurityErrorType.SUSPICIOUS_ACTIVITY_DETECTED;

    return new SecurityError(
      `Security threat detected in HTTP request (risk score: ${riskScore})`,
      errorType,
      {
        sourceIp: request.ip,
        userAgent: request.headers?.['user-agent'],
        suspiciousPatterns: threatIndicators,
        riskScore,
        ...context
      }
    );
  }

  /**
   * Create security error from authentication failure
   */
  static fromAuthenticationFailure(
    username: string,
    failureReason: string,
    attemptCount: number,
    context: Partial<SecurityErrorContext> = {}
  ): SecurityError {
    const errorType = attemptCount > 5 
      ? SecurityErrorType.ATTACK_ATTEMPT_DETECTED
      : SecurityErrorType.UNAUTHORIZED_ACCESS;

    const attackType = attemptCount > 5 ? AttackType.BRUTE_FORCE : AttackType.UNAUTHORIZED_ACCESS;

    return new SecurityError(
      `Authentication failure for user '${username}': ${failureReason}`,
      errorType,
      {
        attackType,
        metadata: { username, failureReason, attemptCount },
        riskScore: Math.min(attemptCount * 15, 100),
        ...context
      }
    );
  }

  /**
   * Create security error from input validation
   */
  static fromInputValidation(
    fieldName: string,
    maliciousPattern: string,
    attackType: AttackType,
    context: Partial<SecurityErrorContext> = {}
  ): SecurityError {
    return new MaliciousInputDetectedError(
      fieldName,
      maliciousPattern,
      {
        attackType,
        ...context
      }
    );
  }
}

// Export all security error types
export { SecurityErrorType, SecurityThreatLevel, AttackType };
export type { SecurityErrorContext };