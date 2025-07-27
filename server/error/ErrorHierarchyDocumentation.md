# Error Hierarchy Documentation - Phase 4 Task 4.1

## Overview

This document describes the comprehensive domain error hierarchy implemented for the BazaarLive marketplace platform. The error system follows enterprise-grade patterns with comprehensive context, classification, and recovery strategies.

## Architecture Overview

### Base Error Structure

```typescript
DomainError (abstract)
├── AuthenticationError
├── ConfigurationError  
├── ValidationError
├── SecurityError
└── AspectError
```

## Core Components

### 1. DomainError (Base Class)

**Location**: `server/error/DomainError.ts`

**Purpose**: Abstract base class providing comprehensive error infrastructure with enterprise-grade features.

**Key Features**:
- **Error Classification**: Severity, category, retryability, user-facing flags
- **Context Management**: Rich error context with metadata, timestamps, and correlation IDs
- **Recovery Suggestions**: Prioritized recovery actions with automation flags
- **Error Metrics**: Occurrence tracking, performance monitoring, and analytics
- **Error Relationships**: Parent-child error chains with root cause analysis
- **Serialization**: JSON serialization for API responses and logging

**Error Severities**:
- `LOW`: Minor issues that don't affect functionality
- `MEDIUM`: Issues that may impact user experience
- `HIGH`: Significant issues requiring attention
- `CRITICAL`: Severe issues that may cause system instability

**Error Categories**:
- `DOMAIN`: Business logic errors
- `AUTHENTICATION`: Identity and access management errors
- `AUTHORIZATION`: Permission and access control errors
- `VALIDATION`: Data validation and constraint errors
- `CONFIGURATION`: System configuration errors
- `SECURITY`: Security-related errors and threats
- `PERFORMANCE`: Performance degradation errors
- `INTEGRATION`: External service integration errors
- `INFRASTRUCTURE`: System infrastructure errors

### 2. AuthenticationError

**Location**: `server/error/AuthenticationError.ts`

**Purpose**: Comprehensive authentication and authorization error handling with security context.

**Error Types**:
- `INVALID_CREDENTIALS`: Wrong username/password
- `EXPIRED_TOKEN`: Authentication token has expired
- `INVALID_TOKEN`: Malformed or invalid token
- `INSUFFICIENT_PERMISSIONS`: Lack of required permissions
- `ACCOUNT_LOCKED`: User account is locked
- `ACCOUNT_DISABLED`: User account is disabled
- `SESSION_EXPIRED`: User session has expired
- `MFA_REQUIRED`: Multi-factor authentication required
- `MFA_INVALID`: Invalid multi-factor authentication
- `AUTHENTICATION_TIMEOUT`: Authentication process timed out
- `RATE_LIMITED`: Too many authentication attempts
- `STRATEGY_NOT_FOUND`: Authentication strategy not found
- `PROVIDER_ERROR`: OAuth/OIDC provider error
- `CALLBACK_ERROR`: Authentication callback error
- `OIDC_ERROR`: OpenID Connect specific error

**Security Features**:
- **Security Event Logging**: Comprehensive security event data for SIEM systems
- **Suspicious Activity Detection**: Automatic detection of potential attacks
- **Audit Trails**: Complete authentication event tracking
- **Threat Assessment**: Risk scoring and escalation triggers

**Specific Error Classes**:
- `InvalidCredentialsError`: Wrong credentials with attempt tracking
- `TokenExpiredError`: Expired tokens with refresh suggestions
- `InsufficientPermissionsError`: Authorization failures with permission context
- `RateLimitedError`: Rate limiting with reset time information
- `SessionExpiredError`: Session expiration with renewal options
- `AccountLockedError`: Account lockouts with expiry information
- `ProviderError`: OAuth/OIDC provider failures with provider context

### 3. ConfigurationError

**Location**: `server/error/ConfigurationError.ts`

**Purpose**: Configuration management errors with validation context and recovery strategies.

**Error Types**:
- `MISSING_REQUIRED_CONFIG`: Required configuration missing
- `INVALID_CONFIG_VALUE`: Configuration value validation failed
- `CONFIG_VALIDATION_FAILED`: Schema validation failure
- `ENVIRONMENT_NOT_FOUND`: Environment not detected
- `SECRET_NOT_AVAILABLE`: Required secret not available
- `CONFIG_PARSE_ERROR`: Configuration file parsing failed
- `CONFIG_SOURCE_UNAVAILABLE`: Configuration source not accessible
- `CONFIG_PERMISSION_DENIED`: Permission denied for configuration access
- `CONFIG_VERSION_MISMATCH`: Configuration schema version mismatch
- `CONFIG_DEPENDENCY_MISSING`: Configuration dependency not found
- `CONFIG_SCHEMA_INVALID`: Invalid configuration schema
- `CONFIG_OVERRIDE_CONFLICT`: Configuration override conflict

**Configuration Sources**:
- `ENVIRONMENT_VARIABLES`: Environment variable configuration
- `CONFIG_FILE`: File-based configuration
- `DATABASE`: Database-stored configuration
- `REMOTE_SERVICE`: Remote configuration service
- `COMMAND_LINE`: Command line arguments
- `DEFAULT_VALUES`: Default value fallbacks
- `RUNTIME_OVERRIDE`: Runtime configuration overrides

**Specific Error Classes**:
- `MissingRequiredConfigError`: Missing required configuration keys
- `InvalidConfigValueError`: Type validation failures
- `ConfigValidationFailedError`: Schema validation failures
- `SecretNotAvailableError`: Missing secrets with security implications
- `ConfigParseError`: File parsing failures
- `ConfigSourceUnavailableError`: Source accessibility issues
- `ConfigDependencyMissingError`: Missing configuration dependencies

### 4. ValidationError

**Location**: `server/error/ValidationError.ts`

**Purpose**: Data validation errors with field-level context and business rule enforcement.

**Error Types**:
- `REQUIRED_FIELD_MISSING`: Required field not provided
- `INVALID_FORMAT`: Data format validation failed
- `OUT_OF_RANGE`: Value outside acceptable range
- `INVALID_TYPE`: Type validation failed
- `CONSTRAINT_VIOLATION`: General constraint violation
- `SCHEMA_VALIDATION_FAILED`: Schema validation failed
- `BUSINESS_RULE_VIOLATION`: Business rule violated
- `CROSS_FIELD_VALIDATION_FAILED`: Cross-field validation failed
- `UNIQUE_CONSTRAINT_VIOLATION`: Uniqueness constraint violated
- `FOREIGN_KEY_CONSTRAINT_VIOLATION`: Foreign key constraint violated
- `DATA_INTEGRITY_VIOLATION`: General data integrity violation
- `CUSTOM_VALIDATION_FAILED`: Custom validation rule failed

**Validation Rule Types**:
- `REQUIRED`: Required field validation
- `FORMAT`: Format pattern validation
- `LENGTH`: String/array length validation
- `RANGE`: Numeric range validation
- `TYPE`: Data type validation
- `PATTERN`: Regular expression validation
- `ENUM`: Enumeration validation
- `CUSTOM`: Custom validation logic
- `BUSINESS`: Business rule validation
- `CROSS_FIELD`: Multi-field validation
- `UNIQUENESS`: Uniqueness validation
- `REFERENCE`: Reference integrity validation

**Field Validation Context**:
- **Field-Level Errors**: Individual field validation failures
- **Cross-Field Validation**: Multi-field business rules
- **Business Rule Enforcement**: Complex business logic validation
- **Data Integrity**: Database constraint validation

**Specific Error Classes**:
- `RequiredFieldMissingError`: Missing required fields
- `InvalidFormatError`: Format validation failures
- `OutOfRangeError`: Range constraint violations
- `SchemaValidationFailedError`: Comprehensive schema failures
- `BusinessRuleViolationError`: Business rule violations
- `UniqueConstraintViolationError`: Uniqueness violations

### 5. SecurityError

**Location**: `server/error/SecurityError.ts`

**Purpose**: Security-related errors with threat assessment and incident management.

**Error Types**:
- `UNAUTHORIZED_ACCESS`: Unauthorized access attempt
- `FORBIDDEN_OPERATION`: Forbidden operation attempted
- `SECURITY_POLICY_VIOLATION`: Security policy violated
- `SUSPICIOUS_ACTIVITY_DETECTED`: Suspicious activity detected
- `ATTACK_ATTEMPT_DETECTED`: Active attack detected
- `DATA_BREACH_SUSPECTED`: Potential data breach
- `PRIVILEGE_ESCALATION_ATTEMPT`: Privilege escalation attempt
- `MALICIOUS_INPUT_DETECTED`: Malicious input detected
- `SECURITY_TOKEN_COMPROMISED`: Security token compromised
- `ENCRYPTION_FAILURE`: Encryption operation failed
- `SIGNATURE_VERIFICATION_FAILED`: Digital signature verification failed
- `CERTIFICATE_VALIDATION_FAILED`: Certificate validation failed
- `SECURE_COMMUNICATION_FAILED`: Secure communication failed
- `AUDIT_LOG_TAMPERING`: Audit log tampering detected
- `SECURITY_CONFIGURATION_ERROR`: Security configuration error

**Security Threat Levels**:
- `LOW`: Minor security concerns
- `MEDIUM`: Moderate security issues
- `HIGH`: Significant security threats
- `CRITICAL`: Critical security incidents
- `EMERGENCY`: Emergency security situations

**Attack Types**:
- `SQL_INJECTION`: SQL injection attack
- `XSS`: Cross-site scripting
- `CSRF`: Cross-site request forgery
- `BRUTE_FORCE`: Brute force attack
- `DOS/DDOS`: Denial of service attack
- `PHISHING`: Phishing attempt
- `MALWARE`: Malware detection
- `SOCIAL_ENGINEERING`: Social engineering attack
- `PRIVILEGE_ESCALATION`: Privilege escalation
- `DATA_EXFILTRATION`: Data exfiltration attempt
- `UNAUTHORIZED_ACCESS`: Unauthorized access
- `UNKNOWN`: Unknown attack type

**Security Features**:
- **Threat Assessment**: Automatic threat level determination
- **Incident Management**: Security incident tracking and response
- **Alert System**: Automated security alerting
- **Evidence Collection**: Forensic evidence preservation
- **Risk Scoring**: Automated risk assessment

**Specific Error Classes**:
- `UnauthorizedAccessError`: Unauthorized access attempts
- `AttackAttemptDetectedError`: Active attack detection
- `MaliciousInputDetectedError`: Malicious input detection
- `PrivilegeEscalationAttemptError`: Privilege escalation attempts
- `DataBreachSuspectedError`: Suspected data breaches

### 6. AspectError

**Location**: `server/error/AspectError.ts`

**Purpose**: AOP-specific errors with aspect execution context and performance monitoring.

**Error Types**:
- `ASPECT_EXECUTION_FAILED`: Aspect execution failure
- `ASPECT_WEAVING_FAILED`: Aspect weaving failure
- `POINTCUT_MATCHING_FAILED`: Pointcut matching failure
- `ADVICE_EXECUTION_FAILED`: Advice execution failure
- `ASPECT_DEPENDENCY_FAILED`: Aspect dependency failure
- `ASPECT_CONFIGURATION_INVALID`: Invalid aspect configuration
- `ASPECT_LIFECYCLE_ERROR`: Aspect lifecycle error
- `ASPECT_INTERCEPTION_FAILED`: Aspect interception failure
- `ASPECT_PROXY_CREATION_FAILED`: Aspect proxy creation failure
- `ASPECT_COMPOSITION_FAILED`: Aspect composition failure
- `ASPECT_ORDERING_CONFLICT`: Aspect ordering conflict
- `ASPECT_RECURSION_DETECTED`: Aspect recursion detected
- `ASPECT_PERFORMANCE_DEGRADATION`: Aspect performance degradation
- `ASPECT_CONTAINER_ERROR`: Aspect container error
- `ASPECT_REGISTRY_ERROR`: Aspect registry error

**Aspect Execution Phases**:
- `BEFORE`: Before method execution
- `AFTER`: After method execution
- `AROUND`: Around method execution
- `EXCEPTION`: Exception handling
- `SUCCESS`: Success handling
- `FINALLY`: Finally block
- `WEAVING`: Aspect weaving phase
- `INITIALIZATION`: Aspect initialization
- `DESTRUCTION`: Aspect destruction

**Aspect Components**:
- `ORCHESTRATOR`: AOP orchestrator
- `INTERCEPTOR`: Method interceptor
- `WEAVER`: Aspect weaver
- `CONTAINER`: Aspect container
- `REGISTRY`: Aspect registry
- `PROXY`: Aspect proxy
- `POINTCUT`: Pointcut matcher
- `ADVICE`: Aspect advice
- `ASPECT`: Aspect definition

**AOP Features**:
- **Performance Monitoring**: Aspect execution performance tracking
- **Recursion Detection**: Automatic aspect recursion detection
- **Health Monitoring**: Aspect system health tracking
- **Recovery Strategies**: Automated aspect error recovery

**Specific Error Classes**:
- `AspectExecutionFailedError`: Aspect execution failures
- `AspectWeavingFailedError`: Aspect weaving failures
- `AspectRecursionDetectedError`: Recursion detection
- `AspectPerformanceDegradationError`: Performance issues
- `AspectContainerError`: Container failures

## Error Factories

Each error type includes factory methods for common error creation patterns:

### DomainErrorFactory
- `createValidationError()`: Standard validation errors
- `createConfigurationError()`: Configuration errors
- `createPerformanceError()`: Performance-related errors

### AuthenticationErrorFactory
- `fromError()`: Convert generic errors to authentication errors
- `fromHttpStatus()`: Create errors from HTTP status codes
- `fromTokenValidation()`: Token validation failures

### ConfigurationErrorFactory
- `fromValidationResult()`: Validation result errors
- `fromEnvironmentDetection()`: Environment detection errors
- `fromTypeMismatch()`: Type validation errors
- `fromMissingDependency()`: Dependency errors

### ValidationErrorFactory
- `fromZodError()`: Zod validation errors
- `fromFieldValidation()`: Single field validation
- `fromMultipleFields()`: Multi-field validation

### SecurityErrorFactory
- `fromHttpRequest()`: HTTP request analysis
- `fromAuthenticationFailure()`: Authentication failures
- `fromInputValidation()`: Input validation security

### AspectErrorFactory
- `fromExecutionContext()`: Aspect execution errors
- `fromPerformanceMonitoring()`: Performance errors
- `fromWeavingFailure()`: Weaving failures
- `fromRecursionDetection()`: Recursion errors
- `fromContainerFailure()`: Container errors

## Testing

### Test Coverage

Each error type includes comprehensive test suites:

- **Error Instantiation Tests**: Verify correct property contracts
- **Classification Tests**: Verify error classification behavior
- **Context Tests**: Verify context preservation and metadata
- **Recovery Suggestion Tests**: Verify recovery strategies
- **Factory Method Tests**: Verify factory pattern implementations
- **Serialization Tests**: Verify JSON serialization
- **Metrics Tests**: Verify error tracking and metrics
- **Relationship Tests**: Verify error chain relationships

### Test Locations

- `server/error/__tests__/DomainError.test.ts`: Base domain error tests
- `server/error/__tests__/AuthenticationError.test.ts`: Authentication error tests

## Usage Examples

### Basic Error Creation

```typescript
// Create a validation error
const error = new RequiredFieldMissingError('email', 'UserRegistration');

// Create an authentication error
const authError = new InvalidCredentialsError('user123', 3);

// Create a configuration error
const configError = new MissingRequiredConfigError('DATABASE_URL');
```

### Using Factories

```typescript
// Create from Zod validation
const validationError = ValidationErrorFactory.fromZodError(zodResult);

// Create from HTTP status
const httpError = AuthenticationErrorFactory.fromHttpStatus(401, 'Unauthorized');

// Create from generic error
const genericError = AuthenticationErrorFactory.fromError(originalError);
```

### Error Context and Recovery

```typescript
// Error with rich context
const error = new SecurityError(
  'Suspicious activity detected',
  SecurityErrorType.SUSPICIOUS_ACTIVITY_DETECTED,
  {
    sourceIp: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    riskScore: 85,
    suspiciousPatterns: ['sql_injection', 'brute_force']
  }
);

// Get recovery suggestions
const suggestions = error.getRecoverySuggestions();
for (const suggestion of suggestions) {
  if (suggestion.automated) {
    await executeRecoveryAction(suggestion.action);
  }
}
```

### Error Metrics and Monitoring

```typescript
// Get error metrics
const metrics = error.getMetrics();
console.log(`Error occurred ${metrics?.occurrenceCount} times`);

// Update recovery metrics
DomainError.updateErrorMetrics('VALIDATION_ERROR', true);

// Get system-wide error statistics
const stats = DomainError.getErrorStatistics();
console.log(`Total errors: ${stats.totalErrors}`);
```

## Integration Points

### AOP Integration

Error handling is fully integrated with the AOP system:

- **Aspect Error Handling**: Specialized AspectError for AOP-specific failures
- **Cross-Cutting Error Concerns**: Error handling as a cross-cutting concern
- **Error Recovery Aspects**: Automated error recovery through aspects

### API Integration

Error hierarchy integrates seamlessly with API responses:

- **Standardized Error Responses**: Consistent error format across all APIs
- **Error Serialization**: JSON serialization for API consumers
- **HTTP Status Mapping**: Automatic HTTP status code determination

### Monitoring Integration

Comprehensive monitoring and observability:

- **Error Metrics Collection**: Automatic error occurrence tracking
- **Performance Monitoring**: Error-related performance impact tracking
- **Security Event Logging**: Security errors feed into SIEM systems
- **Business Intelligence**: Error analytics for business insights

## Best Practices

### Error Creation

1. **Use Specific Error Types**: Prefer specific error classes over generic DomainError
2. **Provide Rich Context**: Include relevant context for debugging and recovery
3. **Set Appropriate Classification**: Correctly classify severity, category, and flags
4. **Include Recovery Suggestions**: Provide actionable recovery suggestions

### Error Handling

1. **Check Error Properties**: Use error property methods for conditional logic
2. **Implement Recovery**: Execute automated recovery suggestions where possible
3. **Log Appropriately**: Use error severity for logging level determination
4. **Escalate When Needed**: Respect error escalation requirements

### Testing

1. **Test Error Contracts**: Verify all required properties are present
2. **Test Factory Methods**: Ensure factories create errors correctly
3. **Test Recovery Logic**: Verify recovery suggestions are appropriate
4. **Test Integration**: Verify error integration with other systems

## Future Enhancements

### Planned Features

1. **Error Analytics Dashboard**: Real-time error analytics and trending
2. **Automated Recovery Engine**: Enhanced automated error recovery
3. **Machine Learning Integration**: ML-based error prediction and prevention
4. **Custom Error Types**: Support for domain-specific custom error types

### Extension Points

1. **Custom Error Categories**: Support for application-specific categories
2. **Custom Recovery Strategies**: Pluggable recovery strategy implementations
3. **Custom Context Providers**: Rich context from external systems
4. **Custom Metrics Collectors**: Integration with monitoring systems

This error hierarchy provides a comprehensive, enterprise-grade foundation for error handling across the BazaarLive platform, with full integration into the AOP system and extensive testing coverage.