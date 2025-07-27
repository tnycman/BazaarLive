/**
 * Authentication Error Hierarchy - Phase 4 Task 4.1
 * Enterprise-grade authentication-specific errors with comprehensive context
 */

import { 
  DomainError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorClassification,
  ErrorRecoverySuggestion 
} from './DomainError';

// Authentication Error Types
export enum AuthenticationErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_INVALID = 'MFA_INVALID',
  AUTHENTICATION_TIMEOUT = 'AUTHENTICATION_TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  STRATEGY_NOT_FOUND = 'STRATEGY_NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CALLBACK_ERROR = 'CALLBACK_ERROR',
  OIDC_ERROR = 'OIDC_ERROR'
}

// Authentication Context Extensions
export interface AuthenticationErrorContext extends ErrorContext {
  readonly userId?: string;
  readonly username?: string;
  readonly authStrategy?: string;
  readonly provider?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly sessionId?: string;
  readonly tokenType?: string;
  readonly permissionRequired?: string;
  readonly attemptCount?: number;
  readonly lockoutExpiry?: Date;
  readonly lastSuccessfulAuth?: Date;
}

/**
 * Base Authentication Error
 * Enterprise-grade authentication error with security context
 */
export class AuthenticationError extends DomainError {
  public readonly authErrorType: AuthenticationErrorType;
  public readonly authContext: AuthenticationErrorContext;

  constructor(
    message: string,
    authErrorType: AuthenticationErrorType,
    authContext: Partial<AuthenticationErrorContext> = {},
    classification: Partial<ErrorClassification> = {},
    recoverySuggestions: ErrorRecoverySuggestion[] = []
  ) {
    // Default authentication error classification
    const defaultClassification: ErrorClassification = {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.AUTHENTICATION,
      retryable: false,
      userFacing: true,
      requiresEscalation: false,
      automatedRecovery: false,
      ...classification
    };

    // Default recovery suggestions for authentication
    const defaultRecoveryConfig = AuthenticationError.getDefaultRecoveryConfig(authErrorType);
    const combinedSuggestions = [...defaultRecoveryConfig, ...recoverySuggestions];

    super(
      message,
      authErrorType,
      {
        component: 'AuthenticationSystem',
        ...authContext
      },
      defaultClassification,
      combinedSuggestions
    );

    this.authErrorType = authErrorType;
    this.authContext = {
      ...this.context,
      ...authContext
    } as AuthenticationErrorContext;

    // Log security event for authentication errors
    this.logSecurityEvent();
  }

  /**
   * Get authentication error type
   */
  getAuthErrorType(): AuthenticationErrorType {
    return this.authErrorType;
  }

  /**
   * Get authentication context
   */
  getAuthContext(): AuthenticationErrorContext {
    return this.authContext;
  }

  /**
   * Check if error is security-critical
   */
  isSecurityCritical(): boolean {
    const criticalTypes = [
      AuthenticationErrorType.ACCOUNT_LOCKED,
      AuthenticationErrorType.RATE_LIMITED,
      AuthenticationErrorType.INSUFFICIENT_PERMISSIONS
    ];
    return criticalTypes.includes(this.authErrorType);
  }

  /**
   * Check if error indicates suspicious activity
   */
  isSuspiciousActivity(): boolean {
    const suspiciousTypes = [
      AuthenticationErrorType.INVALID_CREDENTIALS,
      AuthenticationErrorType.INVALID_TOKEN,
      AuthenticationErrorType.RATE_LIMITED
    ];
    return suspiciousTypes.includes(this.authErrorType) && 
           (this.authContext.attemptCount || 0) > 3;
  }

  /**
   * Get security event data
   */
  getSecurityEventData(): Record<string, any> {
    return {
      eventType: 'authentication_error',
      errorType: this.authErrorType,
      userId: this.authContext.userId,
      username: this.authContext.username,
      ipAddress: this.authContext.ipAddress,
      userAgent: this.authContext.userAgent,
      timestamp: this.context.timestamp,
      severity: this.classification.severity,
      suspicious: this.isSuspiciousActivity()
    };
  }

  /**
   * Log security event
   */
  private logSecurityEvent(): void {
    const eventData = this.getSecurityEventData();
    console.warn('[SECURITY-EVENT] Authentication error occurred:', eventData);
    
    // In production, would send to security monitoring system
    if (this.isSecurityCritical()) {
      console.error('[SECURITY-ALERT] Critical authentication error:', eventData);
    }
  }

  /**
   * Get default recovery suggestions by error type
   */
  private static getDefaultRecoveryConfig(errorType: AuthenticationErrorType): ErrorRecoverySuggestion[] {
    const recoveryConfigs: Record<AuthenticationErrorType, ErrorRecoverySuggestion[]> = {
      [AuthenticationErrorType.INVALID_CREDENTIALS]: [
        {
          action: 'verify_credentials',
          description: 'Check username and password are correct',
          automated: false,
          priority: 100
        },
        {
          action: 'reset_password',
          description: 'Initiate password reset process',
          automated: false,
          priority: 80
        }
      ],
      [AuthenticationErrorType.EXPIRED_TOKEN]: [
        {
          action: 'refresh_token',
          description: 'Attempt to refresh authentication token',
          automated: true,
          priority: 100
        },
        {
          action: 'reauthenticate',
          description: 'Re-authenticate with credentials',
          automated: false,
          priority: 80
        }
      ],
      [AuthenticationErrorType.INSUFFICIENT_PERMISSIONS]: [
        {
          action: 'check_permissions',
          description: 'Verify user has required permissions',
          automated: true,
          priority: 100
        },
        {
          action: 'request_access',
          description: 'Request elevated permissions from administrator',
          automated: false,
          priority: 80
        }
      ],
      [AuthenticationErrorType.RATE_LIMITED]: [
        {
          action: 'wait_and_retry',
          description: 'Wait for rate limit to reset and retry',
          automated: true,
          priority: 100
        },
        {
          action: 'verify_source',
          description: 'Check for potential abuse or automation',
          automated: false,
          priority: 80
        }
      ],
      [AuthenticationErrorType.SESSION_EXPIRED]: [
        {
          action: 'renew_session',
          description: 'Attempt to renew expired session',
          automated: true,
          priority: 100
        },
        {
          action: 'redirect_login',
          description: 'Redirect to login page for re-authentication',
          automated: true,
          priority: 90
        }
      ],
      [AuthenticationErrorType.MFA_REQUIRED]: [
        {
          action: 'prompt_mfa',
          description: 'Prompt user for multi-factor authentication',
          automated: true,
          priority: 100
        }
      ],
      [AuthenticationErrorType.ACCOUNT_LOCKED]: [
        {
          action: 'wait_lockout_expiry',
          description: 'Wait for account lockout to expire',
          automated: true,
          priority: 100
        },
        {
          action: 'contact_support',
          description: 'Contact support for account unlock',
          automated: false,
          priority: 80
        }
      ],
      [AuthenticationErrorType.PROVIDER_ERROR]: [
        {
          action: 'retry_provider',
          description: 'Retry authentication with provider',
          automated: true,
          priority: 100
        },
        {
          action: 'fallback_strategy',
          description: 'Use alternative authentication strategy',
          automated: true,
          priority: 80
        }
      ],
      // Default empty arrays for other types
      [AuthenticationErrorType.INVALID_TOKEN]: [],
      [AuthenticationErrorType.ACCOUNT_DISABLED]: [],
      [AuthenticationErrorType.MFA_INVALID]: [],
      [AuthenticationErrorType.AUTHENTICATION_TIMEOUT]: [],
      [AuthenticationErrorType.STRATEGY_NOT_FOUND]: [],
      [AuthenticationErrorType.CALLBACK_ERROR]: [],
      [AuthenticationErrorType.OIDC_ERROR]: []
    };

    return recoveryConfigs[errorType] || [];
  }
}

/**
 * Invalid Credentials Error
 * Specific error for authentication failures due to invalid credentials
 */
export class InvalidCredentialsError extends AuthenticationError {
  constructor(
    username?: string,
    attemptCount: number = 1,
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Authentication failed: Invalid credentials${username ? ` for user '${username}'` : ''}`,
      AuthenticationErrorType.INVALID_CREDENTIALS,
      {
        username,
        attemptCount,
        ...context
      },
      {
        severity: attemptCount > 3 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        retryable: attemptCount < 5
      }
    );
  }
}

/**
 * Token Expired Error
 * Specific error for expired authentication tokens
 */
export class TokenExpiredError extends AuthenticationError {
  constructor(
    tokenType: string = 'access_token',
    expiredAt?: Date,
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Authentication token expired: ${tokenType}`,
      AuthenticationErrorType.EXPIRED_TOKEN,
      {
        tokenType,
        metadata: { expiredAt, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Insufficient Permissions Error
 * Specific error for authorization failures
 */
export class InsufficientPermissionsError extends AuthenticationError {
  constructor(
    requiredPermission: string,
    userPermissions: string[] = [],
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Insufficient permissions: Required '${requiredPermission}'`,
      AuthenticationErrorType.INSUFFICIENT_PERMISSIONS,
      {
        permissionRequired: requiredPermission,
        metadata: { userPermissions, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTHORIZATION,
        retryable: false
      }
    );
  }
}

/**
 * Rate Limited Error
 * Specific error for rate limiting authentication attempts
 */
export class RateLimitedError extends AuthenticationError {
  constructor(
    attemptCount: number,
    resetTime?: Date,
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Authentication rate limited: ${attemptCount} attempts`,
      AuthenticationErrorType.RATE_LIMITED,
      {
        attemptCount,
        metadata: { resetTime, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        retryable: true,
        requiresEscalation: attemptCount > 10
      }
    );
  }
}

/**
 * Session Expired Error
 * Specific error for expired user sessions
 */
export class SessionExpiredError extends AuthenticationError {
  constructor(
    sessionId?: string,
    lastActivity?: Date,
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      'User session has expired',
      AuthenticationErrorType.SESSION_EXPIRED,
      {
        sessionId,
        metadata: { lastActivity, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Account Locked Error
 * Specific error for locked user accounts
 */
export class AccountLockedError extends AuthenticationError {
  constructor(
    username: string,
    lockoutExpiry?: Date,
    reason: string = 'Multiple failed authentication attempts',
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Account locked: ${username} - ${reason}`,
      AuthenticationErrorType.ACCOUNT_LOCKED,
      {
        username,
        lockoutExpiry,
        metadata: { lockoutReason: reason, ...context.metadata },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.SECURITY,
        retryable: false,
        requiresEscalation: true
      }
    );
  }
}

/**
 * Provider Error
 * Specific error for OAuth/OIDC provider failures
 */
export class ProviderError extends AuthenticationError {
  constructor(
    provider: string,
    providerMessage?: string,
    providerCode?: string,
    context: Partial<AuthenticationErrorContext> = {}
  ) {
    super(
      `Authentication provider error: ${provider}${providerMessage ? ` - ${providerMessage}` : ''}`,
      AuthenticationErrorType.PROVIDER_ERROR,
      {
        provider,
        metadata: { 
          providerMessage, 
          providerCode,
          ...context.metadata 
        },
        ...context
      },
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        automatedRecovery: true
      }
    );
  }
}

/**
 * Authentication Error Factory
 * Factory for creating authentication errors with consistent patterns
 */
export class AuthenticationErrorFactory {
  /**
   * Create authentication error from generic error
   */
  static fromError(
    error: Error,
    authContext: Partial<AuthenticationErrorContext> = {}
  ): AuthenticationError {
    return new AuthenticationError(
      error.message,
      AuthenticationErrorType.PROVIDER_ERROR,
      {
        metadata: { originalError: error.name, stack: error.stack },
        ...authContext
      }
    );
  }

  /**
   * Create authentication error from HTTP status
   */
  static fromHttpStatus(
    status: number,
    message?: string,
    authContext: Partial<AuthenticationErrorContext> = {}
  ): AuthenticationError {
    const errorTypeMap: Record<number, AuthenticationErrorType> = {
      401: AuthenticationErrorType.INVALID_CREDENTIALS,
      403: AuthenticationErrorType.INSUFFICIENT_PERMISSIONS,
      429: AuthenticationErrorType.RATE_LIMITED,
      408: AuthenticationErrorType.AUTHENTICATION_TIMEOUT
    };

    const errorType = errorTypeMap[status] || AuthenticationErrorType.PROVIDER_ERROR;
    const errorMessage = message || `Authentication failed with status ${status}`;

    return new AuthenticationError(
      errorMessage,
      errorType,
      {
        metadata: { httpStatus: status },
        ...authContext
      }
    );
  }

  /**
   * Create authentication error from token validation
   */
  static fromTokenValidation(
    tokenType: string,
    validationError: string,
    authContext: Partial<AuthenticationErrorContext> = {}
  ): AuthenticationError {
    const isExpired = validationError.toLowerCase().includes('expired');
    const errorType = isExpired 
      ? AuthenticationErrorType.EXPIRED_TOKEN 
      : AuthenticationErrorType.INVALID_TOKEN;

    return new AuthenticationError(
      `Token validation failed: ${validationError}`,
      errorType,
      {
        tokenType,
        metadata: { validationError },
        ...authContext
      }
    );
  }
}

// Export all authentication error types
export { AuthenticationErrorType };
export type { AuthenticationErrorContext };