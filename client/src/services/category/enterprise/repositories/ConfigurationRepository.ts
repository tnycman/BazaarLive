/**
 * ConfigurationRepository Interface - Enterprise Repository Pattern
 * 
 * @fileoverview Repository pattern interface for configuration data access
 * with complete separation of concerns and enterprise error handling
 * 
 * @author Enterprise AOP Team
 * @version 1.0.0
 * @since 2025-01-30
 */

import { ConfigurationKey } from '../domain/ConfigurationValueObjects';
import { UniversalPageConfiguration } from '../domain/ConfigurationEntities';
import { Result } from '../patterns/Result';
import { ConfigurationError } from '../errors/ConfigurationErrors';

/**
 * Repository interface for configuration data access
 * 
 * Provides abstraction layer for configuration persistence with:
 * - Type-safe configuration operations
 * - Result pattern for error handling
 * - Transaction-safe concurrent operations
 * - Domain-specific error types
 */
export interface ConfigurationRepository {
  /**
   * Fetch configuration by key
   * 
   * @param key - Configuration key
   * @returns Promise resolving to Result with configuration or error
   */
  getConfiguration(key: ConfigurationKey): Promise<Result<UniversalPageConfiguration, ConfigurationError>>;

  /**
   * Fetch raw configuration data (unvalidated)
   * 
   * @param keyString - Configuration key as string
   * @returns Promise resolving to raw configuration data
   * @throws ConfigurationNotFoundError - When configuration doesn't exist
   * @throws ConfigurationLoadError - When loading fails
   */
  fetch(keyString: string): Promise<any>;

  /**
   * Get all available configurations
   * 
   * @returns Promise resolving to Result with array of configurations
   */
  getAllConfigurations(): Promise<Result<UniversalPageConfiguration[], ConfigurationError>>;

  /**
   * Save configuration
   * 
   * @param key - Configuration key
   * @param config - Configuration to save
   * @returns Promise resolving to Result with void or error
   */
  saveConfiguration(
    key: ConfigurationKey, 
    config: UniversalPageConfiguration
  ): Promise<Result<void, ConfigurationError>>;

  /**
   * Delete configuration
   * 
   * @param key - Configuration key
   * @returns Promise resolving to Result with void or error
   */
  deleteConfiguration(key: ConfigurationKey): Promise<Result<void, ConfigurationError>>;

  /**
   * Check if configuration exists
   * 
   * @param key - Configuration key
   * @returns Promise resolving to boolean indicating existence
   */
  existsConfiguration(key: ConfigurationKey): Promise<boolean>;

  /**
   * Clear all cached configurations (if applicable)
   * 
   * @returns Promise resolving when cache is cleared
   */
  clearCache?(): Promise<void>;

  /**
   * Get repository health status
   * 
   * @returns Promise resolving to health metrics
   */
  getHealthStatus?(): Promise<{
    isHealthy: boolean;
    totalConfigurations: number;
    cacheHitRate?: number;
    averageLoadTime?: number;
    lastError?: string;
  }>;
}

/**
 * Configuration repository factory interface
 */
export interface ConfigurationRepositoryFactory {
  /**
   * Create repository instance
   * 
   * @param options - Repository configuration options
   * @returns Repository instance
   */
  create(options?: {
    basePath?: string;
    cacheEnabled?: boolean;
    cacheTtlMs?: number;
  }): ConfigurationRepository;
}

/**
 * Repository transaction interface for batch operations
 */
export interface ConfigurationRepositoryTransaction {
  /**
   * Begin transaction
   */
  begin(): Promise<void>;

  /**
   * Commit transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute operation within transaction
   */
  execute<T>(operation: () => Promise<T>): Promise<T>;
}