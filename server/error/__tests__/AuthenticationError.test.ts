/**
 * Authentication Error Test Suite - Phase 4 Task 4.1
 * Comprehensive tests for authentication error hierarchy
 */

import { 
  AuthenticationError,
  AuthenticationErrorType,
  InvalidCredentialsError,
  TokenExpiredError,
  InsufficientPermissionsError,
  RateLimitedError,
  SessionExpiredError,
  AccountLockedError,
  ProviderError,
  AuthenticationErrorFactory,
  AuthenticationErrorContext
} from '../AuthenticationError';
import { ErrorSeverity, ErrorCategory } from '../DomainError';

describe('AuthenticationError', () => {
  describe('Base AuthenticationError', () => {
    it('should create authentication error with default values', () => {
      const error = new AuthenticationError(
        'Authentication failed',
        AuthenticationErrorType.INVALID_CREDENTIALS
      );

      expect(error.message).toBe('Authentication failed');
      expect(error.authErrorType).toBe(AuthenticationErrorType.INVALID_CREDENTIALS);
      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.classification.userFacing).toBe(true);
      expect(error.getAuthErrorType()).toBe(AuthenticationErrorType.INVALID_CREDENTIALS);
    });

    it('should create authentication error with custom context', () => {
      const context: Partial<AuthenticationErrorContext> = {
        userId: 'user-123',
        username: 'testuser',
        authStrategy: 'local',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        attemptCount: 3
      };

      const error = new AuthenticationError(
        'Authentication failed',
        AuthenticationErrorType.INVALID_CREDENTIALS,
        context
      );

      expect(error.authContext.userId).toBe('user-123');
      expect(error.authContext.username).toBe('testuser');
      expect(error.authContext.authStrategy).toBe('local');
      expect(error.authContext.ipAddress).toBe('192.168.1.1');
      expect(error.authContext.userAgent).toBe('Mozilla/5.0');
      expect(error.authContext.attemptCount).toBe(3);
    });

    it('should determine security criticality correctly', () => {
      const criticalError = new AuthenticationError(
        'Account locked',
        AuthenticationErrorType.ACCOUNT_LOCKED
      );
      
      const normalError = new AuthenticationError(
        'Invalid credentials',
        AuthenticationErrorType.INVALID_CREDENTIALS
      );

      expect(criticalError.isSecurityCritical()).toBe(true);
      expect(normalError.isSecurityCritical()).toBe(false);
    });

    it('should detect suspicious activity correctly', () => {
      const suspiciousError = new AuthenticationError(
        'Too many attempts',
        AuthenticationErrorType.INVALID_CREDENTIALS,
        { attemptCount: 5 }
      );
      
      const normalError = new AuthenticationError(
        'Single attempt',
        AuthenticationErrorType.INVALID_CREDENTIALS,
        { attemptCount: 1 }
      );

      expect(suspiciousError.isSuspiciousActivity()).toBe(true);
      expect(normalError.isSuspiciousActivity()).toBe(false);
    });

    it('should generate security event data correctly', () => {
      const error = new AuthenticationError(
        'Authentication failed',
        AuthenticationErrorType.INVALID_CREDENTIALS,
        {
          userId: 'user-123',
          username: 'testuser',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }
      );

      const eventData = error.getSecurityEventData();

      expect(eventData.eventType).toBe('authentication_error');
      expect(eventData.errorType).toBe(AuthenticationErrorType.INVALID_CREDENTIALS);
      expect(eventData.userId).toBe('user-123');
      expect(eventData.username).toBe('testuser');
      expect(eventData.ipAddress).toBe('192.168.1.1');
      expect(eventData.userAgent).toBe('Mozilla/5.0');
      expect(eventData.severity).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('InvalidCredentialsError', () => {
    it('should create invalid credentials error correctly', () => {
      const error = new InvalidCredentialsError('testuser', 3);

      expect(error.message).toBe("Authentication failed: Invalid credentials for user 'testuser'");
      expect(error.authErrorType).toBe(AuthenticationErrorType.INVALID_CREDENTIALS);
      expect(error.authContext.username).toBe('testuser');
      expect(error.authContext.attemptCount).toBe(3);
      expect(error.classification.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should escalate severity for high attempt counts', () => {
      const lowAttempts = new InvalidCredentialsError('testuser', 2);
      const highAttempts = new InvalidCredentialsError('testuser', 5);

      expect(lowAttempts.classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(highAttempts.classification.severity).toBe(ErrorSeverity.HIGH);
    });

    it('should disable retryability for too many attempts', () => {
      const retryable = new InvalidCredentialsError('testuser', 3);
      const notRetryable = new InvalidCredentialsError('testuser', 6);

      expect(retryable.classification.retryable).toBe(true);
      expect(notRetryable.classification.retryable).toBe(false);
    });
  });

  describe('TokenExpiredError', () => {
    it('should create token expired error correctly', () => {
      const expiredAt = new Date('2024-01-01T00:00:00Z');
      const error = new TokenExpiredError('refresh_token', expiredAt);

      expect(error.message).toBe('Authentication token expired: refresh_token');
      expect(error.authErrorType).toBe(AuthenticationErrorType.EXPIRED_TOKEN);
      expect(error.authContext.tokenType).toBe('refresh_token');
      expect(error.authContext.metadata?.expiredAt).toBe(expiredAt);
      expect(error.classification.retryable).toBe(true);
      expect(error.classification.automatedRecovery).toBe(true);
    });

    it('should use default token type', () => {
      const error = new TokenExpiredError();

      expect(error.authContext.tokenType).toBe('access_token');
    });
  });

  describe('InsufficientPermissionsError', () => {
    it('should create insufficient permissions error correctly', () => {
      const userPermissions = ['read', 'write'];
      const error = new InsufficientPermissionsError(
        'admin:delete',
        userPermissions
      );

      expect(error.message).toBe("Insufficient permissions: Required 'admin:delete'");
      expect(error.authErrorType).toBe(AuthenticationErrorType.INSUFFICIENT_PERMISSIONS);
      expect(error.authContext.permissionRequired).toBe('admin:delete');
      expect(error.authContext.metadata?.userPermissions).toEqual(userPermissions);
      expect(error.classification.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(error.classification.retryable).toBe(false);
    });
  });

  describe('RateLimitedError', () => {
    it('should create rate limited error correctly', () => {
      const resetTime = new Date('2024-01-01T01:00:00Z');
      const error = new RateLimitedError(10, resetTime);

      expect(error.message).toBe('Authentication rate limited: 10 attempts');
      expect(error.authErrorType).toBe(AuthenticationErrorType.RATE_LIMITED);
      expect(error.authContext.attemptCount).toBe(10);
      expect(error.authContext.metadata?.resetTime).toBe(resetTime);
      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.category).toBe(ErrorCategory.SECURITY);
      expect(error.classification.retryable).toBe(true);
    });

    it('should require escalation for high attempt counts', () => {
      const normalError = new RateLimitedError(5);
      const escalatedError = new RateLimitedError(15);

      expect(normalError.classification.requiresEscalation).toBe(false);
      expect(escalatedError.classification.requiresEscalation).toBe(true);
    });
  });

  describe('SessionExpiredError', () => {
    it('should create session expired error correctly', () => {
      const lastActivity = new Date('2024-01-01T00:30:00Z');
      const error = new SessionExpiredError('session-123', lastActivity);

      expect(error.message).toBe('User session has expired');
      expect(error.authErrorType).toBe(AuthenticationErrorType.SESSION_EXPIRED);
      expect(error.authContext.sessionId).toBe('session-123');
      expect(error.authContext.metadata?.lastActivity).toBe(lastActivity);
      expect(error.classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.classification.retryable).toBe(true);
      expect(error.classification.automatedRecovery).toBe(true);
    });
  });

  describe('AccountLockedError', () => {
    it('should create account locked error correctly', () => {
      const lockoutExpiry = new Date('2024-01-01T02:00:00Z');
      const error = new AccountLockedError(
        'testuser',
        lockoutExpiry,
        'Suspicious activity detected'
      );

      expect(error.message).toBe('Account locked: testuser - Suspicious activity detected');
      expect(error.authErrorType).toBe(AuthenticationErrorType.ACCOUNT_LOCKED);
      expect(error.authContext.username).toBe('testuser');
      expect(error.authContext.lockoutExpiry).toBe(lockoutExpiry);
      expect(error.authContext.metadata?.lockoutReason).toBe('Suspicious activity detected');
      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.category).toBe(ErrorCategory.SECURITY);
      expect(error.classification.retryable).toBe(false);
      expect(error.classification.requiresEscalation).toBe(true);
    });

    it('should use default lockout reason', () => {
      const error = new AccountLockedError('testuser');

      expect(error.authContext.metadata?.lockoutReason).toBe('Multiple failed authentication attempts');
    });
  });

  describe('ProviderError', () => {
    it('should create provider error correctly', () => {
      const error = new ProviderError(
        'google',
        'Invalid client credentials',
        'OAUTH_INVALID_CLIENT'
      );

      expect(error.message).toBe('Authentication provider error: google - Invalid client credentials');
      expect(error.authErrorType).toBe(AuthenticationErrorType.PROVIDER_ERROR);
      expect(error.authContext.provider).toBe('google');
      expect(error.authContext.metadata?.providerMessage).toBe('Invalid client credentials');
      expect(error.authContext.metadata?.providerCode).toBe('OAUTH_INVALID_CLIENT');
      expect(error.classification.severity).toBe(ErrorSeverity.HIGH);
      expect(error.classification.retryable).toBe(true);
      expect(error.classification.automatedRecovery).toBe(true);
    });

    it('should work without provider message', () => {
      const error = new ProviderError('github');

      expect(error.message).toBe('Authentication provider error: github');
      expect(error.authContext.provider).toBe('github');
      expect(error.authContext.metadata?.providerMessage).toBeUndefined();
    });
  });

  describe('AuthenticationErrorFactory', () => {
    it('should create error from generic error', () => {
      const originalError = new Error('Connection timeout');
      const authError = AuthenticationErrorFactory.fromError(
        originalError,
        { userId: 'user-123' }
      );

      expect(authError.message).toBe('Connection timeout');
      expect(authError.authErrorType).toBe(AuthenticationErrorType.PROVIDER_ERROR);
      expect(authError.authContext.userId).toBe('user-123');
      expect(authError.authContext.metadata?.originalError).toBe('Error');
    });

    it('should create error from HTTP status codes', () => {
      const unauthorizedError = AuthenticationErrorFactory.fromHttpStatus(
        401,
        'Unauthorized access'
      );
      const forbiddenError = AuthenticationErrorFactory.fromHttpStatus(403);
      const rateLimitedError = AuthenticationErrorFactory.fromHttpStatus(429);
      const timeoutError = AuthenticationErrorFactory.fromHttpStatus(408);

      expect(unauthorizedError.authErrorType).toBe(AuthenticationErrorType.INVALID_CREDENTIALS);
      expect(unauthorizedError.message).toBe('Unauthorized access');

      expect(forbiddenError.authErrorType).toBe(AuthenticationErrorType.INSUFFICIENT_PERMISSIONS);
      expect(forbiddenError.message).toBe('Authentication failed with status 403');

      expect(rateLimitedError.authErrorType).toBe(AuthenticationErrorType.RATE_LIMITED);
      expect(timeoutError.authErrorType).toBe(AuthenticationErrorType.AUTHENTICATION_TIMEOUT);
    });

    it('should create error from token validation', () => {
      const expiredTokenError = AuthenticationErrorFactory.fromTokenValidation(
        'access_token',
        'Token has expired',
        { userId: 'user-123' }
      );

      const invalidTokenError = AuthenticationErrorFactory.fromTokenValidation(
        'refresh_token',
        'Invalid signature'
      );

      expect(expiredTokenError.authErrorType).toBe(AuthenticationErrorType.EXPIRED_TOKEN);
      expect(expiredTokenError.authContext.tokenType).toBe('access_token');
      expect(expiredTokenError.authContext.userId).toBe('user-123');

      expect(invalidTokenError.authErrorType).toBe(AuthenticationErrorType.INVALID_TOKEN);
      expect(invalidTokenError.authContext.tokenType).toBe('refresh_token');
    });
  });

  describe('Error Recovery Suggestions', () => {
    it('should provide default recovery suggestions', () => {
      const credentialsError = new InvalidCredentialsError('testuser');
      const tokenError = new TokenExpiredError();
      const permissionsError = new InsufficientPermissionsError('admin:read');

      expect(credentialsError.recoverySuggestions.length).toBeGreaterThan(0);
      expect(tokenError.recoverySuggestions.length).toBeGreaterThan(0);
      expect(permissionsError.recoverySuggestions.length).toBeGreaterThan(0);

      // Check specific suggestions
      const credentialsSuggestions = credentialsError.getRecoverySuggestions();
      expect(credentialsSuggestions.some(s => s.action === 'verify_credentials')).toBe(true);

      const tokenSuggestions = tokenError.getRecoverySuggestions();
      expect(tokenSuggestions.some(s => s.action === 'refresh_token')).toBe(true);
    });
  });

  describe('Error Contract Properties', () => {
    it('should maintain authentication error contract', () => {
      const error = new AuthenticationError(
        'Test error',
        AuthenticationErrorType.INVALID_CREDENTIALS
      );

      // Verify inheritance
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthenticationError);

      // Verify required properties
      expect(error.authErrorType).toBeDefined();
      expect(error.authContext).toBeDefined();
      expect(error.getAuthErrorType()).toBeDefined();
      expect(error.getAuthContext()).toBeDefined();
      expect(error.getSecurityEventData()).toBeDefined();

      // Verify methods
      expect(typeof error.isSecurityCritical).toBe('function');
      expect(typeof error.isSuspiciousActivity).toBe('function');
      expect(typeof error.getSecurityEventData).toBe('function');
    });
  });
});