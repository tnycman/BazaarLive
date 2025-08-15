// Logger Middleware - Enterprise-grade logging system
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableStructured: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

export class Logger {
  private serviceName: string;
  private config: LoggerConfig;

  constructor(serviceName: string, config?: Partial<LoggerConfig>) {
    this.serviceName = serviceName;
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      enableConsole: true,
      enableFile: false,
      enableStructured: true,
      filePath: 'logs/app.log',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.serviceName,
      message,
      metadata
    };

    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    if (this.config.enableFile) {
      this.logToFile(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.level];
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.service}]`;
    
    if (this.config.enableStructured) {
      const structured = {
        ...entry,
        timestamp: entry.timestamp.toISOString()
      };
      console.log(JSON.stringify(structured));
    } else {
      const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      const logMessage = `${prefix} ${entry.message}${metadataStr}`;
      
      switch (entry.level) {
        case 'debug':
          console.debug(logMessage);
          break;
        case 'info':
          console.info(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'error':
          console.error(logMessage);
          break;
      }
    }
  }

  private logToFile(entry: LogEntry): void {
    // File logging would be implemented here
    // For now, we'll skip file logging in this implementation
  }
}
