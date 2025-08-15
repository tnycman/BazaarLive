/**
 * Error Monitoring Service
 * Integration with external monitoring systems
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import type { FilterError } from '@/services/error/FilterErrorHandler';
import type { ErrorMonitoringEvent } from '@/types/error/FilterErrorTypes';

export interface MonitoringEvent {
  type: string;
  severity: string;
  message: string;
  code: string;
  timestamp: number;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface MonitoringConfig {
  enabled: boolean;
  endpoint: string;
  apiKey: string;
  environment: string;
  version: string;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  flushInterval: number;
}

export interface MonitoringBatch {
  events: MonitoringEvent[];
  timestamp: number;
  batchId: string;
}

export class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private monitoringEndpoint: string;
  private apiKey: string;
  private isEnabled: boolean = true;
  private config: MonitoringConfig;
  private eventQueue: MonitoringEvent[] = [];
  private isProcessing: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.monitoringEndpoint = process.env.MONITORING_ENDPOINT || '';
    this.apiKey = process.env.MONITORING_API_KEY || '';
    
    this.config = {
      enabled: this.isEnabled,
      endpoint: this.monitoringEndpoint,
      apiKey: this.apiKey,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      maxRetries: 3,
      retryDelay: 1000,
      batchSize: 10,
      flushInterval: 5000
    };

    this.initializeMonitoring();
  }

  static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  /**
   * Initialize monitoring service
   */
  private initializeMonitoring(): void {
    if (this.config.enabled && this.config.endpoint) {
      this.startFlushTimer();
      console.log('[ErrorMonitoringService] Monitoring initialized');
    } else {
      console.warn('[ErrorMonitoringService] Monitoring disabled or endpoint not configured');
    }
  }

  /**
   * Send error to monitoring service
   */
  public async sendError(error: FilterError): Promise<void> {
    if (!this.isEnabled || !this.monitoringEndpoint) {
      return;
    }

    try {
      const event: MonitoringEvent = {
        type: error.type,
        severity: error.severity,
        message: error.message,
        code: error.code,
        timestamp: error.timestamp,
        context: {
          componentId: error.componentId,
          userId: error.userId,
          sessionId: error.sessionId
        },
        metadata: {
          details: error.details,
          stackTrace: error.stackTrace,
          recoverable: error.recoverable,
          retryCount: error.retryCount,
          maxRetries: error.maxRetries
        }
      };

      this.queueEvent(event);
    } catch (monitoringError) {
      console.error('[ErrorMonitoringService] Failed to send error:', monitoringError);
    }
  }

  /**
   * Queue event for batch processing
   */
  private queueEvent(event: MonitoringEvent): void {
    this.eventQueue.push(event);

    // Flush immediately if batch is full
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Start flush timer for periodic sending
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Flush queued events to monitoring service
   */
  private async flushEvents(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      const batch: MonitoringBatch = {
        events,
        timestamp: Date.now(),
        batchId: this.generateBatchId()
      };

      await this.sendBatch(batch);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('[ErrorMonitoringService] Failed to flush events:', error);
      this.handleFlushError();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send batch of events to monitoring service
   */
  private async sendBatch(batch: MonitoringBatch): Promise<void> {
    const response = await fetch(this.monitoringEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Environment': this.config.environment,
        'X-Version': this.config.version,
        'X-Batch-Id': batch.batchId
      },
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      throw new Error(`Monitoring request failed: ${response.status} ${response.statusText}`);
    }

    console.log(`[ErrorMonitoringService] Sent ${batch.events.length} events to monitoring`);
  }

  /**
   * Handle flush errors with retry logic
   */
  private handleFlushError(): void {
    this.retryCount++;

    if (this.retryCount <= this.maxRetries) {
      console.warn(`[ErrorMonitoringService] Retrying flush (${this.retryCount}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.flushEvents();
      }, this.config.retryDelay * this.retryCount);
    } else {
      console.error('[ErrorMonitoringService] Max retries exceeded, dropping events');
      this.eventQueue = []; // Clear queue to prevent memory leaks
    }
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set monitoring configuration
   */
  public setConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && this.config.endpoint) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Enable or disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.config.enabled = enabled;
    
    if (enabled && this.config.endpoint) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Set monitoring endpoint
   */
  public setEndpoint(endpoint: string): void {
    this.monitoringEndpoint = endpoint;
    this.config.endpoint = endpoint;
    
    if (endpoint && this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Set API key for authentication
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.config.apiKey = apiKey;
  }

  /**
   * Get monitoring statistics
   */
  public getStats(): MonitoringStats {
    return {
      enabled: this.isEnabled,
      endpoint: this.monitoringEndpoint,
      queueSize: this.eventQueue.length,
      isProcessing: this.isProcessing,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval
    };
  }

  /**
   * Force flush of current events
   */
  public async forceFlush(): Promise<void> {
    await this.flushEvents();
  }

  /**
   * Clear all queued events
   */
  public clearQueue(): void {
    this.eventQueue = [];
    console.log('[ErrorMonitoringService] Event queue cleared');
  }

  /**
   * Cleanup monitoring service
   */
  public cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush any remaining events
    this.flushEvents();
    
    console.log('[ErrorMonitoringService] Cleanup completed');
  }
}

export interface MonitoringStats {
  enabled: boolean;
  endpoint: string;
  queueSize: number;
  isProcessing: boolean;
  retryCount: number;
  maxRetries: number;
  batchSize: number;
  flushInterval: number;
}

// ===== MONITORING UTILITIES =====

export const createMonitoringEvent = (error: FilterError): MonitoringEvent => {
  return {
    type: error.type,
    severity: error.severity,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    context: {
      componentId: error.componentId,
      userId: error.userId,
      sessionId: error.sessionId
    },
    metadata: {
      details: error.details,
      stackTrace: error.stackTrace,
      recoverable: error.recoverable,
      retryCount: error.retryCount,
      maxRetries: error.maxRetries
    }
  };
};

export const validateMonitoringEvent = (event: MonitoringEvent): boolean => {
  return !!(
    event.type &&
    event.severity &&
    event.message &&
    event.code &&
    event.timestamp &&
    typeof event.timestamp === 'number'
  );
};

export const formatMonitoringEvent = (event: MonitoringEvent): string => {
  return `[Monitoring] ${event.type} (${event.severity}): ${event.message} [${event.code}] at ${new Date(event.timestamp).toISOString()}`;
}; 