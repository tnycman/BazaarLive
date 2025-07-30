/**
 * FileSystemConfigurationRepository - Enterprise File System Repository
 * 
 * @fileoverview Safe dynamic import-based configuration repository with
 * transaction-safe concurrent fetch handling and comprehensive error handling
 * 
 * @author Enterprise AOP Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import { ConfigurationRepository } from './ConfigurationRepository';
import { ConfigurationKey } from '../domain/ConfigurationValueObjects';
import { UniversalPageConfiguration } from '../domain/ConfigurationEntities';
import { Result } from '../patterns/Result';
import { 
  ConfigurationError, 
  ConfigurationNotFoundError, 
  ConfigurationLoadError 
} from '../errors/ConfigurationErrors';

// Mock Result implementation for repository
class MockResult<T, E extends Error> {
  constructor(
    private _success: boolean,
    private _value?: T,
    private _error?: E
  ) {}

  get ok(): boolean { return this._success; }
  get success(): boolean { return this._success; }
  get isSuccess(): boolean { return this._success; }
  get isFailure(): boolean { return !this._success; }
  
  get value(): T {
    if (!this._success) throw new Error('Cannot access value of failed result');
    return this._value!;
  }
  
  get error(): E {
    if (this._success) throw new Error('Cannot access error of successful result');
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._success ? 
      new MockResult<U, E>(true, fn(this._value!)) : 
      new MockResult<U, E>(false, undefined, this._error);
  }

  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    return this._success ? 
      new MockResult<T, F>(true, this._value) : 
      new MockResult<T, F>(false, undefined, fn(this._error!));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._success ? 
      fn(this._value!) : 
      new MockResult<U, E>(false, undefined, this._error);
  }

  match<R>(onSuccess: (value: T) => R, onFailure: (error: E) => R): R {
    return this._success ? onSuccess(this._value!) : onFailure(this._error!);
  }

  unwrap(): T {
    if (!this._success) throw this._error!;
    return this._value!;
  }

  unwrapOr(defaultValue: T): T {
    return this._success ? this._value! : defaultValue;
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return this._success ? this._value! : fn(this._error!);
  }

  tap(fn: (value: T) => void): Result<T, E> {
    if (this._success) fn(this._value!);
    return this;
  }

  tapError(fn: (error: E) => void): Result<T, E> {
    if (!this._success) fn(this._error!);
    return this;
  }

  static success<T, E extends Error>(value: T): Result<T, E> {
    return new MockResult<T, E>(true, value);
  }

  static failure<T, E extends Error>(error: E): Result<T, E> {
    return new MockResult<T, E>(false, undefined, error);
  }
}

/**
 * Configuration loader function type
 */
type ConfigurationLoader = () => Promise<any>;

/**
 * In-flight request tracking for deduplication
 */
interface InFlightRequest {
  promise: Promise<any>;
  timestamp: number;
}

/**
 * Repository health metrics
 */
interface RepositoryHealthMetrics {
  totalLoads: number;
  successfulLoads: number;
  failedLoads: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTimeMs: number;
  lastErrorMessage?: string;
  lastErrorTimestamp?: number;
}

/**
 * FileSystem-based configuration repository implementation
 * 
 * Features:
 * - Safe dynamic imports using explicit loader map
 * - Transaction-safe concurrent fetch deduplication
 * - Domain-specific error handling
 * - Performance metrics tracking
 * - In-memory caching with TTL
 */
export class FileSystemConfigurationRepository implements ConfigurationRepository {
  private readonly _loaderMap = new Map<string, ConfigurationLoader>();
  private readonly _inFlightRequests = new Map<string, InFlightRequest>();
  private readonly _cache = new Map<string, { data: any; expiry: number }>();
  private readonly _metrics: RepositoryHealthMetrics;
  private readonly _cacheTtlMs: number;
  private readonly _requestTimeoutMs: number;

  constructor(options: {
    cacheTtlMs?: number;
    requestTimeoutMs?: number;
  } = {}) {
    this._cacheTtlMs = options.cacheTtlMs ?? 300000; // 5 minutes
    this._requestTimeoutMs = options.requestTimeoutMs ?? 10000; // 10 seconds
    
    this._metrics = {
      totalLoads: 0,
      successfulLoads: 0,
      failedLoads: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTimeMs: 0
    };

    this._initializeLoaderMap();
  }

  /**
   * Initialize the explicit loader map for safe dynamic imports
   */
  private _initializeLoaderMap(): void {
    // Mock configurations for development
    this._loaderMap.set('fashion-women', () => 
      Promise.resolve({
        category: 'women',
        metadata: { title: 'Women\'s Fashion', description: 'Women\'s fashion marketplace' },
        filters: [],
        isActive: true
      }));
    
    this._loaderMap.set('fashion-men', () => 
      Promise.resolve({
        category: 'men',
        metadata: { title: 'Men\'s Fashion', description: 'Men\'s fashion marketplace' },
        filters: [],
        isActive: true
      }));
    
    this._loaderMap.set('fashion-kids', () => 
      Promise.resolve({
        category: 'kids',
        metadata: { title: 'Kids Fashion', description: 'Kids fashion marketplace' },
        filters: [],
        isActive: true
      }));

    // Default configuration
    this._loaderMap.set('default', () => 
      Promise.resolve({
        category: 'default',
        metadata: { title: 'Default Configuration', description: 'Default marketplace configuration' },
        filters: [],
        isActive: true
      }));
  }

  /**
   * Fetch raw configuration data with transaction-safe deduplication
   */
  async fetch(keyString: string): Promise<any> {
    const startTime = Date.now();
    this._metrics.totalLoads++;

    try {
      // Check cache first
      const cached = this._getCached(keyString);
      if (cached) {
        this._metrics.cacheHits++;
        return cached;
      }
      this._metrics.cacheMisses++;

      // Check for in-flight request to deduplicate concurrent fetches
      const inFlight = this._inFlightRequests.get(keyString);
      if (inFlight) {
        // Timeout check for stale in-flight requests
        if (Date.now() - inFlight.timestamp < this._requestTimeoutMs) {
          return await inFlight.promise;
        } else {
          // Remove stale request
          this._inFlightRequests.delete(keyString);
        }
      }

      // Get loader for this configuration key
      const loader = this._loaderMap.get(keyString);
      if (!loader) {
        this._metrics.failedLoads++;
        this._updateErrorMetrics(`Configuration not found: ${keyString}`);
        throw new ConfigurationNotFoundError(`No loader registered for key: ${keyString}`);
      }

      // Create and track in-flight request
      const loadPromise = this._executeLoader(loader, keyString);
      this._inFlightRequests.set(keyString, {
        promise: loadPromise,
        timestamp: Date.now()
      });

      try {
        const result = await loadPromise;
        
        // Cache the result
        this._setCache(keyString, result);
        
        // Clean up in-flight tracking
        this._inFlightRequests.delete(keyString);
        
        // Update metrics
        this._metrics.successfulLoads++;
        this._updateAverageLoadTime(Date.now() - startTime);
        
        return result;

      } catch (error) {
        // Clean up in-flight tracking on error
        this._inFlightRequests.delete(keyString);
        throw error;
      }

    } catch (error) {
      this._metrics.failedLoads++;
      this._updateErrorMetrics(error instanceof Error ? error.message : String(error));
      
      if (error instanceof ConfigurationNotFoundError || error instanceof ConfigurationLoadError) {
        throw error;
      }
      
      throw new ConfigurationLoadError(
        'unknown', 
        error instanceof Error ? error.message : 'Unknown loading error'
      );
    }
  }

  /**
   * Execute loader with comprehensive error handling
   */
  private async _executeLoader(loader: ConfigurationLoader, keyString: string): Promise<any> {
    try {
      const result = await Promise.race([
        loader(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Loader timeout')), this._requestTimeoutMs)
        )
      ]);

      if (!result) {
        throw new ConfigurationLoadError(keyString, 'Loader returned null or undefined');
      }

      return result;

    } catch (error) {
      if (error instanceof Error && error.message === 'Loader timeout') {
        throw new ConfigurationLoadError(keyString, `Loader timeout after ${this._requestTimeoutMs}ms`);
      }
      
      throw new ConfigurationLoadError(
        keyString,
        error instanceof Error ? error.message : 'Unknown loader error'
      );
    }
  }

  /**
   * Get configuration using the repository interface
   */
  async getConfiguration(key: ConfigurationKey): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
    try {
      const rawData = await this.fetch(key.value);
      
      // For now, return raw data as UniversalPageConfiguration
      // In production, this would go through validation orchestrator
      return MockResult.success(rawData as UniversalPageConfiguration);

    } catch (error) {
      if (error instanceof ConfigurationError) {
        return MockResult.failure(error);
      }
      
      return MockResult.failure(
        new ConfigurationLoadError(
          key.value,
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }

  /**
   * Get all available configurations
   */
  async getAllConfigurations(): Promise<Result<UniversalPageConfiguration[], ConfigurationError>> {
    try {
      const keys = Array.from(this._loaderMap.keys());
      const configurations: UniversalPageConfiguration[] = [];
      
      for (const keyString of keys) {
        try {
          const config = await this.fetch(keyString);
          configurations.push(config as UniversalPageConfiguration);
        } catch (error) {
          // Log individual failures but continue loading others
          console.warn(`Failed to load configuration ${keyString}:`, error);
        }
      }
      
      return MockResult.success(configurations);

    } catch (error) {
      return MockResult.failure(
        new ConfigurationLoadError(
          'all',
          error instanceof Error ? error.message : 'Failed to load all configurations'
        )
      );
    }
  }

  /**
   * Save configuration (not implemented for file system)
   */
  async saveConfiguration(
    key: ConfigurationKey, 
    config: UniversalPageConfiguration
  ): Promise<Result<void, ConfigurationError>> {
    return MockResult.failure(
      new ConfigurationLoadError(
        key.value,
        'Save operation not supported by FileSystemConfigurationRepository'
      )
    );
  }

  /**
   * Delete configuration (not implemented for file system)
   */
  async deleteConfiguration(key: ConfigurationKey): Promise<Result<void, ConfigurationError>> {
    return MockResult.failure(
      new ConfigurationLoadError(
        key.value,
        'Delete operation not supported by FileSystemConfigurationRepository'
      )
    );
  }

  /**
   * Check if configuration exists
   */
  async existsConfiguration(key: ConfigurationKey): Promise<boolean> {
    return this._loaderMap.has(key.value);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this._cache.clear();
    this._inFlightRequests.clear();
  }

  /**
   * Get repository health status
   */
  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    totalConfigurations: number;
    cacheHitRate?: number;
    averageLoadTime?: number;
    lastError?: string;
  }> {
    const totalRequests = this._metrics.cacheHits + this._metrics.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? this._metrics.cacheHits / totalRequests : 0;
    const successRate = this._metrics.totalLoads > 0 ? 
      this._metrics.successfulLoads / this._metrics.totalLoads : 1;

    return {
      isHealthy: successRate > 0.8, // Consider healthy if >80% success rate
      totalConfigurations: this._loaderMap.size,
      cacheHitRate,
      averageLoadTime: this._metrics.averageLoadTimeMs,
      lastError: this._metrics.lastErrorMessage
    };
  }

  /**
   * Get cached configuration
   */
  private _getCached(key: string): any | null {
    const entry = this._cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this._cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache entry
   */
  private _setCache(key: string, data: any): void {
    this._cache.set(key, {
      data,
      expiry: Date.now() + this._cacheTtlMs
    });
  }

  /**
   * Update error metrics
   */
  private _updateErrorMetrics(errorMessage: string): void {
    this._metrics.lastErrorMessage = errorMessage;
    this._metrics.lastErrorTimestamp = Date.now();
  }

  /**
   * Update average load time
   */
  private _updateAverageLoadTime(loadTimeMs: number): void {
    const totalLoads = this._metrics.successfulLoads;
    if (totalLoads === 1) {
      this._metrics.averageLoadTimeMs = loadTimeMs;
    } else {
      this._metrics.averageLoadTimeMs = 
        (this._metrics.averageLoadTimeMs * (totalLoads - 1) + loadTimeMs) / totalLoads;
    }
  }

  /**
   * Get available configuration keys
   */
  getAvailableKeys(): string[] {
    return Array.from(this._loaderMap.keys());
  }

  /**
   * Register new loader dynamically
   */
  registerLoader(key: string, loader: ConfigurationLoader): void {
    this._loaderMap.set(key, loader);
  }

  /**
   * Unregister loader
   */
  unregisterLoader(key: string): boolean {
    return this._loaderMap.delete(key);
  }
}