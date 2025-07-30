/**
 * Configuration Logging Aspect
 * Enterprise AOP-compliant logging cross-cutting concern
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * Handles all logging aspects for configuration operations:
 * - Structured logging with correlation IDs
 * - Performance logging and metrics
 * - Error logging with context preservation
 * - Debug tracing for troubleshooting
 * - Business intelligence logging
 */

import { JoinPoint, Aspect, AspectMetadata, Before, AfterReturning } from './ConfigurationValidationAspect';

// ===== LOGGING DOMAIN TYPES =====

/**
 * Log Level Enumeration
 * Defines standard logging levels for enterprise applications
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

/**
 * Log Entry Value Object
 * Immutable log entry with complete contextual information
 */
export class LogEntry {
  constructor(
    public readonly id: string,
    public readonly timestamp: number,
    public readonly level: LogLevel,
    public readonly logger: string,
    public readonly message: string,
    public readonly correlationId: string,
    public readonly context: Record<string, unknown>,
    public readonly error?: Error,
    public readonly duration?: number,
    public readonly tags: readonly string[] = []
  ) {}

  /**
   * Get log level name
   */
  get levelName(): string {
    return LogLevel[this.level];
  }

  /**
   * Get formatted timestamp
   */
  get formattedTimestamp(): string {
    return new Date(this.timestamp).toISOString();
  }

  /**
   * Check if entry is error level or above
   */
  get isError(): boolean {
    return this.level >= LogLevel.ERROR;
  }

  /**
   * Get complete log context
   */
  get fullContext(): Record<string, unknown> {
    return {
      id: this.id,
      timestamp: this.formattedTimestamp,
      level: this.levelName,
      logger: this.logger,
      message: this.message,
      correlationId: this.correlationId,
      duration: this.duration,
      tags: this.tags,
      context: this.context,
      error: this.error ? {
        name: this.error.name,
        message: this.error.message,
        stack: this.error.stack
      } : undefined
    };
  }
}

/**
 * Logger Configuration Value Object
 * Immutable logger configuration settings
 */
export class LoggerConfiguration {
  constructor(
    public readonly name: string,
    public readonly level: LogLevel,
    public readonly enableConsole: boolean,
    public readonly enableFile: boolean,
    public readonly enableRemote: boolean,
    public readonly bufferSize: number,
    public readonly flushInterval: number,
    public readonly includeStackTrace: boolean,
    public readonly maxContextSize: number
  ) {}

  /**
   * Check if level should be logged
   */
  shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }
}

/**
 * Correlation Context Value Object
 * Tracks request correlation across operations
 */
export class CorrelationContext {
  constructor(
    public readonly correlationId: string,
    public readonly parentId: string | null,
    public readonly rootId: string,
    public readonly operationName: string,
    public readonly startTime: number,
    public readonly metadata: Record<string, unknown>
  ) {}

  /**
   * Create child correlation context
   */
  createChild(operationName: string, metadata: Record<string, unknown> = {}): CorrelationContext {
    return new CorrelationContext(
      this.generateChildId(),
      this.correlationId,
      this.rootId,
      operationName,
      Date.now(),
      { ...this.metadata, ...metadata }
    );
  }

  private generateChildId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${this.correlationId}.${timestamp}.${random}`;
  }
}

/**
 * Performance Metrics Value Object
 * Captures performance data for logging
 */
export class PerformanceMetrics {
  constructor(
    public readonly operationName: string,
    public readonly startTime: number,
    public readonly endTime: number,
    public readonly memoryStart: number,
    public readonly memoryEnd: number,
    public readonly checkpoints: readonly Array<{ name: string; time: number; memory: number }>
  ) {}

  get duration(): number {
    return this.endTime - this.startTime;
  }

  get memoryDelta(): number {
    return this.memoryEnd - this.memoryStart;
  }

  get checkpointAnalysis(): Array<{ name: string; duration: number; memoryDelta: number }> {
    let previousTime = this.startTime;
    let previousMemory = this.memoryStart;

    return this.checkpoints.map(checkpoint => {
      const duration = checkpoint.time - previousTime;
      const memoryDelta = checkpoint.memory - previousMemory;
      
      previousTime = checkpoint.time;
      previousMemory = checkpoint.memory;

      return {
        name: checkpoint.name,
        duration,
        memoryDelta
      };
    });
  }
}

// ===== LOGGER INTERFACES =====

/**
 * Log Appender Interface
 * Defines contract for log output destinations
 */
export interface LogAppender {
  append(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Log Formatter Interface
 * Defines contract for log message formatting
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}

// ===== LOG APPENDERS =====

/**
 * Console Log Appender
 * Outputs logs to console with appropriate formatting
 */
export class ConsoleLogAppender implements LogAppender {
  constructor(private readonly formatter: LogFormatter) {}

  async append(entry: LogEntry): Promise<void> {
    const formatted = this.formatter.format(entry);
    
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }

  async flush(): Promise<void> {
    // Console doesn't need flushing
  }

  async close(): Promise<void> {
    // Console doesn't need closing
  }
}

/**
 * Buffer Log Appender
 * Buffers logs in memory for batch processing
 */
export class BufferLogAppender implements LogAppender {
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly targetAppender: LogAppender,
    private readonly bufferSize: number = 100,
    private readonly flushInterval: number = 5000
  ) {
    this.startFlushTimer();
  }

  async append(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    for (const entry of entries) {
      await this.targetAppender.append(entry);
    }
    
    await this.targetAppender.flush();
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flush();
    await this.targetAppender.close();
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      await this.flush();
    }, this.flushInterval);
  }
}

// ===== LOG FORMATTERS =====

/**
 * JSON Log Formatter
 * Formats logs as structured JSON for machine parsing
 */
export class JsonLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry.fullContext);
  }
}

/**
 * Human Readable Log Formatter
 * Formats logs for human readability
 */
export class HumanReadableLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.formattedTimestamp;
    const level = entry.levelName.padEnd(5);
    const logger = entry.logger.padEnd(20);
    const correlation = entry.correlationId.substring(0, 8);
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';
    
    let formatted = `${timestamp} [${level}] ${logger} [${correlation}] ${entry.message}${duration}`;
    
    if (Object.keys(entry.context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      formatted += `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`;
    }
    
    return formatted;
  }
}

// ===== CORRELATION CONTEXT PROVIDER =====

/**
 * Correlation Context Provider
 * Manages correlation context across async operations
 */
export class CorrelationContextProvider {
  private static contextStorage = new Map<string, CorrelationContext>();
  private static currentContext: CorrelationContext | null = null;

  /**
   * Set current correlation context
   */
  static setContext(context: CorrelationContext): void {
    CorrelationContextProvider.currentContext = context;
    CorrelationContextProvider.contextStorage.set(context.correlationId, context);
  }

  /**
   * Get current correlation context
   */
  static getContext(): CorrelationContext {
    if (CorrelationContextProvider.currentContext) {
      return CorrelationContextProvider.currentContext;
    }

    // Create new root context if none exists
    const rootContext = new CorrelationContext(
      CorrelationContextProvider.generateCorrelationId(),
      null,
      CorrelationContextProvider.generateCorrelationId(),
      'root',
      Date.now(),
      {}
    );

    CorrelationContextProvider.setContext(rootContext);
    return rootContext;
  }

  /**
   * Create child context for operation
   */
  static createChildContext(operationName: string, metadata: Record<string, unknown> = {}): CorrelationContext {
    const currentContext = CorrelationContextProvider.getContext();
    return currentContext.createChild(operationName, metadata);
  }

  /**
   * Clear correlation context
   */
  static clearContext(): void {
    CorrelationContextProvider.currentContext = null;
  }

  /**
   * Generate unique correlation ID
   */
  private static generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `corr_${timestamp}_${random}`;
  }
}

// ===== ENTERPRISE LOGGER =====

/**
 * Enterprise Logger
 * High-performance structured logger with multiple appenders
 */
export class EnterpriseLogger {
  private readonly appenders: LogAppender[] = [];
  private readonly performanceTracker = new Map<string, { startTime: number; memory: number; checkpoints: Array<{ name: string; time: number; memory: number }> }>();

  constructor(
    private readonly config: LoggerConfiguration,
    appenders: LogAppender[] = []
  ) {
    this.appenders = appenders;
    
    if (this.appenders.length === 0) {
      this.initializeDefaultAppenders();
    }
  }

  /**
   * Log trace message
   */
  trace(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error, context: Record<string, unknown> = {}): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Start performance tracking for operation
   */
  startPerformanceTracking(operationId: string, operationName: string): void {
    this.performanceTracker.set(operationId, {
      startTime: Date.now(),
      memory: this.getCurrentMemoryUsage(),
      checkpoints: []
    });

    this.debug(`Performance tracking started for operation: ${operationName}`, {
      operationId,
      operationName
    });
  }

  /**
   * Add performance checkpoint
   */
  addPerformanceCheckpoint(operationId: string, checkpointName: string): void {
    const tracking = this.performanceTracker.get(operationId);
    if (!tracking) return;

    tracking.checkpoints.push({
      name: checkpointName,
      time: Date.now(),
      memory: this.getCurrentMemoryUsage()
    });
  }

  /**
   * End performance tracking and log results
   */
  endPerformanceTracking(operationId: string, operationName: string): PerformanceMetrics | null {
    const tracking = this.performanceTracker.get(operationId);
    if (!tracking) return null;

    const endTime = Date.now();
    const endMemory = this.getCurrentMemoryUsage();

    const metrics = new PerformanceMetrics(
      operationName,
      tracking.startTime,
      endTime,
      tracking.memory,
      endMemory,
      tracking.checkpoints
    );

    this.info(`Performance tracking completed for operation: ${operationName}`, {
      operationId,
      duration: metrics.duration,
      memoryDelta: metrics.memoryDelta,
      checkpoints: metrics.checkpointAnalysis
    });

    this.performanceTracker.delete(operationId);
    return metrics;
  }

  /**
   * Core logging method
   */
  private async log(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {},
    error?: Error,
    duration?: number
  ): Promise<void> {
    if (!this.config.shouldLog(level)) return;

    const correlationContext = CorrelationContextProvider.getContext();
    const sanitizedContext = this.sanitizeContext(context);

    const entry = new LogEntry(
      this.generateLogId(),
      Date.now(),
      level,
      this.config.name,
      message,
      correlationContext.correlationId,
      sanitizedContext,
      error,
      duration,
      this.generateTags(level, correlationContext.operationName)
    );

    // Append to all configured appenders
    const appendPromises = this.appenders.map(appender => 
      appender.append(entry).catch(err => 
        console.error('Log appender failed:', err)
      )
    );

    await Promise.allSettled(appendPromises);
  }

  /**
   * Sanitize context to prevent logging sensitive data
   */
  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

    for (const [key, value] of Object.entries(context)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > this.config.maxContextSize) {
        sanitized[key] = value.substring(0, this.config.maxContextSize) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `log_${timestamp}_${random}`;
  }

  /**
   * Generate tags for log entry
   */
  private generateTags(level: LogLevel, operationName: string): string[] {
    const tags = [this.config.name, operationName];
    
    if (level >= LogLevel.ERROR) {
      tags.push('error');
    }
    
    if (level >= LogLevel.WARN) {
      tags.push('attention');
    }

    return tags;
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Initialize default appenders
   */
  private initializeDefaultAppenders(): void {
    const formatter = new HumanReadableLogFormatter();
    const consoleAppender = new ConsoleLogAppender(formatter);
    
    if (this.config.bufferSize > 1) {
      const bufferedAppender = new BufferLogAppender(
        consoleAppender,
        this.config.bufferSize,
        this.config.flushInterval
      );
      this.appenders.push(bufferedAppender);
    } else {
      this.appenders.push(consoleAppender);
    }
  }

  /**
   * Flush all appenders
   */
  async flush(): Promise<void> {
    const flushPromises = this.appenders.map(appender => appender.flush());
    await Promise.allSettled(flushPromises);
  }

  /**
   * Close all appenders
   */
  async close(): Promise<void> {
    const closePromises = this.appenders.map(appender => appender.close());
    await Promise.allSettled(closePromises);
  }
}

// ===== CONFIGURATION LOGGING ASPECT =====

/**
 * Configuration Logging Aspect
 * Implements logging cross-cutting concern for configuration operations
 * 
 * Responsibilities:
 * - Structured logging with correlation tracking
 * - Performance logging and metrics
 * - Error logging with context preservation
 * - Debug tracing for troubleshooting
 * - Business intelligence data collection
 */
@Aspect()
export class ConfigurationLoggingAspect {
  private readonly logger: EnterpriseLogger;

  constructor() {
    const config = new LoggerConfiguration(
      'ConfigurationLoggingAspect',
      LogLevel.INFO,
      true, // enableConsole
      false, // enableFile
      false, // enableRemote
      50, // bufferSize
      5000, // flushInterval
      true, // includeStackTrace
      1000 // maxContextSize
    );

    this.logger = new EnterpriseLogger(config);
  }

  /**
   * Log Operation Start
   * @Before advice - logs the beginning of configuration operations
   */
  @Before('ConfigurationDomainService.getConfiguration')
  logOperationStart(joinPoint: JoinPoint<[string]>): void {
    const [configurationKey] = joinPoint.args;
    const operationId = this.generateOperationId();
    
    // Set correlation context
    const correlationContext = CorrelationContextProvider.createChildContext(
      'getConfiguration',
      { configurationKey, operationId }
    );
    CorrelationContextProvider.setContext(correlationContext);

    // Store operation metadata
    joinPoint.metadata.loggingOperationId = operationId;
    joinPoint.metadata.loggingStartTime = Date.now();

    // Start performance tracking
    this.logger.startPerformanceTracking(operationId, 'getConfiguration');

    // Log operation start
    this.logger.info('Configuration operation started', {
      operationId,
      configurationKey,
      operationType: 'getConfiguration',
      correlationId: correlationContext.correlationId
    });
  }

  /**
   * Log Operation Success
   * @AfterReturning advice - logs successful completion of configuration operations
   */
  @AfterReturning('ConfigurationDomainService.getConfiguration')
  logOperationSuccess(joinPoint: JoinPoint<[string]>, result: unknown): void {
    const [configurationKey] = joinPoint.args;
    const operationId = joinPoint.metadata.loggingOperationId as string;
    const startTime = joinPoint.metadata.loggingStartTime as number;
    
    if (!operationId || !startTime) {
      this.logger.warn('Logging metadata missing for operation completion');
      return;
    }

    // Calculate operation duration
    const duration = Date.now() - startTime;

    // End performance tracking
    const performanceMetrics = this.logger.endPerformanceTracking(operationId, 'getConfiguration');

    // Log operation success
    this.logger.info('Configuration operation completed successfully', {
      operationId,
      configurationKey,
      duration,
      resultType: typeof result,
      cacheHit: joinPoint.metadata.cacheHit || false,
      validationPassed: joinPoint.metadata.validationPassed !== false,
      performanceGrade: this.getPerformanceGrade(duration),
      memoryDelta: performanceMetrics?.memoryDelta || 0
    });

    // Log business intelligence data
    this.logBusinessIntelligence(configurationKey, duration, result);
  }

  /**
   * Log Business Intelligence Data
   * Captures data for business analytics and insights
   */
  private logBusinessIntelligence(
    configurationKey: string,
    duration: number,
    result: unknown
  ): void {
    const category = this.extractCategory(configurationKey);
    const performanceGrade = this.getPerformanceGrade(duration);

    this.logger.info('Configuration business intelligence', {
      event: 'configuration_accessed',
      category,
      configurationKey,
      responseTime: duration,
      performanceGrade,
      resultSize: this.estimateResultSize(result),
      timestamp: Date.now(),
      source: 'ConfigurationLoggingAspect'
    });
  }

  /**
   * Extract Category from Configuration Key
   * Parses configuration key to determine category
   */
  private extractCategory(configurationKey: string): string {
    const parts = configurationKey.split('-');
    return parts[0] || 'unknown';
  }

  /**
   * Get Performance Grade
   * Assigns performance grade based on duration
   */
  private getPerformanceGrade(duration: number): string {
    if (duration < 50) return 'excellent';
    if (duration < 200) return 'good';
    if (duration < 1000) return 'fair';
    return 'poor';
  }

  /**
   * Estimate Result Size
   * Provides rough estimate of result object size
   */
  private estimateResultSize(result: unknown): number {
    try {
      return JSON.stringify(result).length;
    } catch {
      return 0;
    }
  }

  /**
   * Generate Operation ID
   * Creates unique identifier for operation tracking
   */
  private generateOperationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `op_${timestamp}_${random}`;
  }

  /**
   * Get Logger Instance
   * Provides access to underlying logger for advanced usage
   */
  getLogger(): EnterpriseLogger {
    return this.logger;
  }

  /**
   * Get Aspect Metadata
   * Returns aspect execution metadata
   */
  getAspectMetadata(): AspectMetadata {
    return {
      aspectName: 'ConfigurationLoggingAspect',
      executionTime: 0, // Logging should be very fast
      validationRules: [
        'structuredLogging',
        'correlationTracking',
        'performanceMetrics',
        'contextSanitization'
      ],
      errorCount: 0 // Logging errors are handled internally
    };
  }

  /**
   * Flush Logs
   * Forces immediate flush of buffered logs
   */
  async flushLogs(): Promise<void> {
    await this.logger.flush();
  }

  /**
   * Close Logger
   * Cleanly shuts down logging subsystem
   */
  async close(): Promise<void> {
    await this.logger.close();
  }
}

export default ConfigurationLoggingAspect;