/**
 * AuthenticationLoggingAspect - Enterprise AOP Implementation
 * Comprehensive logging aspect for all authentication operations
 */

import {
  IAuthenticationAspect,
  BaseAuthenticationAspect,
  AspectConfiguration,
  AspectContext,
  JoinPoint,
  AspectExecutionContext,
  AspectError
} from './IAuthenticationAspect';
import { ValidationResult, ValidationError } from '../domain/AuthenticationStrategy';
import { Result } from '../domain/Hostname';

// Logging Level Enum
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Log Entry Interface
export interface LogEntry {
  readonly timestamp: Date;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: AspectContext;
  readonly metadata: Record<string, any>;
  readonly operation: string;
  readonly duration?: number;
  readonly success?: boolean;
  readonly error?: string;
  readonly stackTrace?: string;
}

// Logger Interface
export interface ILogger {
  debug(message: string, context?: Record<string, any>): Promise<void>;
  info(message: string, context?: Record<string, any>): Promise<void>;
  warn(message: string, context?: Record<string, any>): Promise<void>;
  error(message: string, context?: Record<string, any>): Promise<void>;
  log(level: LogLevel, message: string, context?: Record<string, any>): Promise<void>;
}

// Sensitive Data Filter
export class SensitiveDataFilter {
  private static readonly SENSITIVE_FIELDS = [
    'password', 'secret', 'token', 'key', 'credentials',
    'authorization', 'cookie', 'session', 'refresh_token',
    'access_token', 'client_secret', 'private_key'
  ];

  static filter(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filter(item));
    }

    const filtered: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitive(key)) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = this.filter(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  private static isSensitive(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.SENSITIVE_FIELDS.some(sensitive => 
      lowerField.includes(sensitive) || sensitive.includes(lowerField)
    );
  }
}

// Console Logger Implementation
export class ConsoleLogger implements ILogger {
  constructor(private enableColors: boolean = true) {}

  async debug(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  async warn(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  async error(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  async log(level: LogLevel, message: string, context?: Record<string, any>): Promise<void> {
    const timestamp = new Date().toISOString();
    const filteredContext = context ? SensitiveDataFilter.filter(context) : undefined;
    
    const logMessage = filteredContext 
      ? `[${timestamp}] [${level.toUpperCase()}] [AUTH-ASPECT] ${message} ${JSON.stringify(filteredContext)}`
      : `[${timestamp}] [${level.toUpperCase()}] [AUTH-ASPECT] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        if (process.env.LOG_LEVEL === 'debug') {
          console.debug(logMessage);
        }
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
    }
  }
}

// Logging Aspect Configuration
export interface LoggingAspectConfiguration extends AspectConfiguration {
  logLevel: LogLevel;
  enableStructuredLogging: boolean;
  enableSensitiveDataFiltering: boolean;
  enablePerformanceLogging: boolean;
  enableErrorStackTraces: boolean;
  logRetentionDays: number;
  maxLogEntrySize: number;
  excludeOperations: string[];
  includeOperations: string[];
}

/**
 * Authentication Logging Aspect
 * Provides comprehensive logging for all authentication operations
 */
export class AuthenticationLoggingAspect extends BaseAuthenticationAspect {
  private logger: ILogger;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  constructor(
    logger?: ILogger,
    configuration?: Partial<LoggingAspectConfiguration>
  ) {
    super({
      name: 'AuthenticationLoggingAspect',
      enabled: true,
      priority: 100, // High priority for logging
      pointcuts: ['*'], // Log all operations
      options: {},
      ...configuration
    } as LoggingAspectConfiguration);

    this.logger = logger || new ConsoleLogger();
  }

  getName(): string {
    return 'AuthenticationLoggingAspect';
  }

  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // Validate logger
      if (!this.logger) {
        errors.push(new ValidationError('Logger is required', 'LOGGER_MISSING'));
      }

      // Validate configuration
      const config = this.getTypedConfiguration();
      if (config.maxLogEntrySize <= 0) {
        errors.push(new ValidationError('Max log entry size must be positive', 'INVALID_LOG_SIZE'));
      }

      if (config.logRetentionDays <= 0) {
        errors.push(new ValidationError('Log retention days must be positive', 'INVALID_RETENTION'));
      }

      // Test logger functionality
      if (this.logger) {
        await this.logger.debug('Logging aspect validation test');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(new ValidationError(
        `Logging aspect validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    const config = this.getTypedConfiguration();
    
    if (!this.shouldLog(joinPoint.method, config)) {
      return;
    }

    await this.executeWithTracking(
      'before',
      joinPoint.context,
      async () => {
        const logEntry = this.createLogEntry(
          LogLevel.DEBUG,
          `Starting authentication operation: ${joinPoint.method}`,
          joinPoint.context,
          {
            method: joinPoint.method,
            args: this.sanitizeArgs(joinPoint.args),
            target: joinPoint.target.constructor.name
          }
        );

        await this.writeLog(logEntry);
      }
    );
  }

  async after(joinPoint: JoinPoint, result: any): Promise<void> {
    const config = this.getTypedConfiguration();
    
    if (!this.shouldLog(joinPoint.method, config)) {
      return;
    }

    await this.executeWithTracking(
      'after',
      joinPoint.context,
      async () => {
        const logEntry = this.createLogEntry(
          LogLevel.INFO,
          `Authentication operation completed successfully: ${joinPoint.method}`,
          joinPoint.context,
          {
            method: joinPoint.method,
            success: true,
            result: this.sanitizeResult(result),
            target: joinPoint.target.constructor.name
          }
        );

        await this.writeLog(logEntry);
      }
    );
  }

  async afterThrowing(joinPoint: JoinPoint, error: Error): Promise<void> {
    const config = this.getTypedConfiguration();
    
    await this.executeWithTracking(
      'afterThrowing',
      joinPoint.context,
      async () => {
        const logEntry = this.createLogEntry(
          LogLevel.ERROR,
          `Authentication operation failed: ${joinPoint.method}`,
          joinPoint.context,
          {
            method: joinPoint.method,
            success: false,
            error: error.message,
            errorCode: (error as any).code,
            target: joinPoint.target.constructor.name,
            stackTrace: config.enableErrorStackTraces ? error.stack : undefined
          }
        );

        await this.writeLog(logEntry);
      }
    );
  }

  async finally(joinPoint: JoinPoint): Promise<void> {
    const config = this.getTypedConfiguration();
    
    if (!this.shouldLog(joinPoint.method, config) || !config.enablePerformanceLogging) {
      return;
    }

    await this.executeWithTracking(
      'finally',
      joinPoint.context,
      async () => {
        const duration = joinPoint.context.metadata.endTime - joinPoint.context.metadata.startTime;
        
        const logEntry = this.createLogEntry(
          LogLevel.DEBUG,
          `Authentication operation finished: ${joinPoint.method}`,
          joinPoint.context,
          {
            method: joinPoint.method,
            duration: `${duration}ms`,
            target: joinPoint.target.constructor.name
          }
        );

        await this.writeLog(logEntry);
      }
    );
  }

  // Custom Methods

  async logAuthenticationEvent(
    event: string,
    context: AspectContext,
    level: LogLevel = LogLevel.INFO,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.executeWithTracking(
      'logAuthenticationEvent',
      context,
      async () => {
        const logEntry = this.createLogEntry(
          level,
          `Authentication event: ${event}`,
          context,
          metadata
        );

        await this.writeLog(logEntry);
      }
    );
  }

  async logSecurityEvent(
    event: string,
    context: AspectContext,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>
  ): Promise<void> {
    const level = severity === 'critical' || severity === 'high' 
      ? LogLevel.ERROR 
      : severity === 'medium' 
        ? LogLevel.WARN 
        : LogLevel.INFO;

    await this.executeWithTracking(
      'logSecurityEvent',
      context,
      async () => {
        const logEntry = this.createLogEntry(
          level,
          `Security event: ${event}`,
          context,
          {
            severity,
            ...metadata
          }
        );

        await this.writeLog(logEntry);
      }
    );
  }

  // Get log buffer for analysis
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Clear log buffer
  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  // Protected Methods

  protected async onInitialize(): Promise<void> {
    await this.logger.info('Authentication Logging Aspect initialized', {
      aspectName: this.getName(),
      configuration: this.getTypedConfiguration()
    });
  }

  protected async onCleanup(): Promise<void> {
    await this.logger.info('Authentication Logging Aspect cleanup', {
      aspectName: this.getName(),
      logBufferSize: this.logBuffer.length
    });

    // Flush remaining logs
    this.clearLogBuffer();
  }

  // Private Methods

  private getTypedConfiguration(): LoggingAspectConfiguration {
    return {
      logLevel: LogLevel.INFO,
      enableStructuredLogging: true,
      enableSensitiveDataFiltering: true,
      enablePerformanceLogging: true,
      enableErrorStackTraces: true,
      logRetentionDays: 30,
      maxLogEntrySize: 10000,
      excludeOperations: [],
      includeOperations: [],
      ...this.configuration
    } as LoggingAspectConfiguration;
  }

  private shouldLog(operation: string, config: LoggingAspectConfiguration): boolean {
    // Check exclude list
    if (config.excludeOperations.length > 0 && 
        config.excludeOperations.includes(operation)) {
      return false;
    }

    // Check include list
    if (config.includeOperations.length > 0 && 
        !config.includeOperations.includes(operation)) {
      return false;
    }

    return true;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: AspectContext,
    metadata: Record<string, any> = {}
  ): LogEntry {
    const config = this.getTypedConfiguration();
    
    const filteredMetadata = config.enableSensitiveDataFiltering 
      ? SensitiveDataFilter.filter(metadata)
      : metadata;

    return {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata: filteredMetadata,
      operation: context.operation,
      duration: metadata.duration,
      success: metadata.success,
      error: metadata.error,
      stackTrace: metadata.stackTrace
    };
  }

  private async writeLog(logEntry: LogEntry): Promise<void> {
    const config = this.getTypedConfiguration();

    // Add to buffer
    this.logBuffer.unshift(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(0, this.maxBufferSize);
    }

    // Write to logger
    const logMessage = config.enableStructuredLogging 
      ? this.formatStructuredLog(logEntry)
      : this.formatSimpleLog(logEntry);

    // Truncate if too large
    const finalMessage = logMessage.length > config.maxLogEntrySize 
      ? logMessage.substring(0, config.maxLogEntrySize) + '...[TRUNCATED]'
      : logMessage;

    await this.logger.log(logEntry.level, finalMessage, {
      requestId: logEntry.context.requestId,
      operation: logEntry.operation,
      timestamp: logEntry.timestamp.toISOString()
    });
  }

  private formatStructuredLog(logEntry: LogEntry): string {
    return JSON.stringify({
      timestamp: logEntry.timestamp.toISOString(),
      level: logEntry.level,
      message: logEntry.message,
      operation: logEntry.operation,
      requestId: logEntry.context.requestId,
      hostname: logEntry.context.hostname,
      environment: logEntry.context.environment,
      userId: logEntry.context.userId,
      metadata: logEntry.metadata,
      duration: logEntry.duration,
      success: logEntry.success,
      error: logEntry.error
    });
  }

  private formatSimpleLog(logEntry: LogEntry): string {
    const parts = [
      `[${logEntry.timestamp.toISOString()}]`,
      `[${logEntry.level.toUpperCase()}]`,
      `[${logEntry.operation}]`,
      `[${logEntry.context.requestId}]`,
      logEntry.message
    ];

    if (logEntry.duration) {
      parts.push(`(${logEntry.duration}ms)`);
    }

    if (logEntry.error) {
      parts.push(`ERROR: ${logEntry.error}`);
    }

    return parts.join(' ');
  }

  private sanitizeArgs(args: any[]): any[] {
    const config = this.getTypedConfiguration();
    return config.enableSensitiveDataFiltering 
      ? SensitiveDataFilter.filter(args)
      : args;
  }

  private sanitizeResult(result: any): any {
    const config = this.getTypedConfiguration();
    return config.enableSensitiveDataFiltering 
      ? SensitiveDataFilter.filter(result)
      : result;
  }
}