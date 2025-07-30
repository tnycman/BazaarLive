/**
 * Enterprise Result Pattern Implementation
 * Type-safe error handling eliminating all null returns
 * Zero assumptions, comprehensive error context preservation
 */

import { ConfigurationError, ConfigurationErrorInfo } from '../errors/ConfigurationErrors';

// ===== RESULT PATTERN CORE =====

/**
 * Result<T, E> - Enterprise result pattern for type-safe error handling
 * Eliminates null returns and provides explicit success/failure states
 */
export abstract class Result<T, E extends Error> {
  public abstract readonly isSuccess: boolean;
  public abstract readonly isFailure: boolean;
  public abstract readonly value: T;
  public abstract readonly error: E;

  /**
   * Create a successful result
   */
  public static success<T, E extends Error = Error>(value: T): Result<T, E> {
    return new SuccessResult(value);
  }

  /**
   * Create a failure result
   */
  public static failure<T, E extends Error = Error>(error: E): Result<T, E> {
    return new FailureResult(error);
  }

  /**
   * Create a result from a potentially throwing function
   */
  public static from<T, E extends Error = Error>(
    fn: () => T,
    errorHandler?: (error: unknown) => E
  ): Result<T, E> {
    try {
      const value = fn();
      return Result.success(value);
    } catch (error) {
      const handledError = errorHandler ? errorHandler(error) : error as E;
      return Result.failure(handledError);
    }
  }

  /**
   * Create a result from a Promise
   */
  public static async fromAsync<T, E extends Error = Error>(
    promise: Promise<T>,
    errorHandler?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return Result.success(value);
    } catch (error) {
      const handledError = errorHandler ? errorHandler(error) : error as E;
      return Result.failure(handledError);
    }
  }

  /**
   * Combine multiple results into a single result
   */
  public static combine<T, E extends Error = Error>(
    results: Result<T, E>[]
  ): Result<T[], E> {
    const values: T[] = [];
    
    for (const result of results) {
      if (result.isFailure) {
        return Result.failure(result.error);
      }
      values.push(result.value);
    }
    
    return Result.success(values);
  }

  /**
   * Map the success value to a new type
   */
  public abstract map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Map the error to a new type
   */
  public abstract mapError<F extends Error>(fn: (error: E) => F): Result<T, F>;

  /**
   * Chain results together (flatMap)
   */
  public abstract flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Handle both success and failure cases
   */
  public abstract match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U;

  /**
   * Get value or throw error
   */
  public abstract unwrap(): T;

  /**
   * Get value or return default
   */
  public abstract unwrapOr(defaultValue: T): T;

  /**
   * Get value or compute default from error
   */
  public abstract unwrapOrElse(fn: (error: E) => T): T;

  /**
   * Perform side effect on success
   */
  public abstract tap(fn: (value: T) => void): Result<T, E>;

  /**
   * Perform side effect on failure
   */
  public abstract tapError(fn: (error: E) => void): Result<T, E>;
}

// ===== SUCCESS RESULT IMPLEMENTATION =====

class SuccessResult<T, E extends Error> extends Result<T, E> {
  public readonly isSuccess = true;
  public readonly isFailure = false;
  public readonly error!: E; // Will never be accessed due to type guards

  constructor(public readonly value: T) {
    super();
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    return Result.success(fn(this.value));
  }

  public mapError<F extends Error>(_fn: (error: E) => F): Result<T, F> {
    return Result.success(this.value);
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  public match<U>(
    onSuccess: (value: T) => U,
    _onFailure: (error: E) => U
  ): U {
    return onSuccess(this.value);
  }

  public unwrap(): T {
    return this.value;
  }

  public unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  public unwrapOrElse(_fn: (error: E) => T): T {
    return this.value;
  }

  public tap(fn: (value: T) => void): Result<T, E> {
    fn(this.value);
    return this;
  }

  public tapError(_fn: (error: E) => void): Result<T, E> {
    return this;
  }
}

// ===== FAILURE RESULT IMPLEMENTATION =====

class FailureResult<T, E extends Error> extends Result<T, E> {
  public readonly isSuccess = false;
  public readonly isFailure = true;
  public readonly value!: T; // Will never be accessed due to type guards

  constructor(public readonly error: E) {
    super();
  }

  public map<U>(_fn: (value: T) => U): Result<U, E> {
    return Result.failure(this.error);
  }

  public mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    return Result.failure(fn(this.error));
  }

  public flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return Result.failure(this.error);
  }

  public match<U>(
    _onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    return onFailure(this.error);
  }

  public unwrap(): T {
    throw this.error;
  }

  public unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  public unwrapOrElse(fn: (error: E) => T): T {
    return fn(this.error);
  }

  public tap(_fn: (value: T) => void): Result<T, E> {
    return this;
  }

  public tapError(fn: (error: E) => void): Result<T, E> {
    fn(this.error);
    return this;
  }
}

// ===== CONFIGURATION RESULT TYPES =====

/**
 * Specialized result type for configuration operations
 */
export type ConfigurationResult<T> = Result<T, ConfigurationError>;

/**
 * Result utilities for configuration operations
 */
export class ConfigurationResultUtils {
  /**
   * Create successful configuration result
   */
  static success<T>(value: T): ConfigurationResult<T> {
    return Result.success(value);
  }

  /**
   * Create failed configuration result
   */
  static failure<T>(error: ConfigurationError): ConfigurationResult<T> {
    return Result.failure(error);
  }

  /**
   * Validate and create result from configuration data (ASYNC)
   * 
   * Enterprise implementation using ResultFactory with aspect orchestration
   */
  static async validate<T>(
    value: unknown,
    validator: (value: unknown) => { isValid: boolean; errors: string[] },
    configKey: string,
    contextId?: string
  ): Promise<ConfigurationResult<T>> {
    // Use enterprise ResultFactory with aspect orchestration
    const { resultFactory } = await import('../factories/ResultFactory');
    
    const context = {
      operation: 'validate',
      configKey,
      contextId,
      validationType: 'configuration',
      metadata: { source: 'ConfigurationResultUtils' }
    };
    
    return await resultFactory.createValidationResult<T>(value, validator, context);
  }
  
  /**
   * Validate and create result from configuration data (SYNC - DEPRECATED)
   * 
   * @deprecated Use async validate method for enterprise compliance
   */
  static validateSync<T>(
    value: unknown,
    validator: (value: unknown) => { isValid: boolean; errors: string[] },
    configKey: string,
    contextId?: string
  ): ConfigurationResult<T> {
    console.warn(
      `DEPRECATED: ConfigurationResultUtils.validateSync is deprecated. ` +
      `Use async validate method for enterprise AOP compliance.`
    );
    
    // Use backward compatibility bridge
    const { ResultFactoryBridge } = require('../factories/ResultFactory');
    return ResultFactoryBridge.validate<T>(value, validator, configKey, contextId);
  }

  /**
   * Chain multiple configuration operations
   */
  static chain<A, B>(
    resultA: ConfigurationResult<A>,
    fn: (value: A) => ConfigurationResult<B>
  ): ConfigurationResult<B> {
    return resultA.flatMap(fn);
  }

  /**
   * Combine multiple configuration results
   */
  static combineConfigurations<T>(
    results: ConfigurationResult<T>[]
  ): ConfigurationResult<T[]> {
    return Result.combine(results);
  }

  /**
   * Handle configuration result with logging
   */
  static handleWithLogging<T>(
    result: ConfigurationResult<T>,
    operation: string,
    logger?: (info: ConfigurationErrorInfo | { success: true; operation: string; timestamp: string }) => void
  ): T | null {
    return result.match(
      (value) => {
        logger?.({
          success: true,
          operation,
          timestamp: new Date().toISOString()
        });
        return value;
      },
      (error) => {
        logger?.(error.getErrorInfo());
        return null;
      }
    );
  }

  /**
   * Convert result to promise (for async compatibility)
   */
  static toPromise<T>(result: ConfigurationResult<T>): Promise<T> {
    return result.match(
      (value) => Promise.resolve(value),
      (error) => Promise.reject(error)
    );
  }

  /**
   * Create result from promise with error conversion
   */
  static async fromPromise<T>(
    promise: Promise<T>,
    configKey: string,
    operation: string,
    contextId?: string
  ): Promise<ConfigurationResult<T>> {
    try {
      const value = await promise;
      return ConfigurationResultUtils.success(value);
    } catch (error) {
      const { ConfigurationLoadError } = await import('../errors/ConfigurationErrors');
      const configError = new ConfigurationLoadError(
        configKey,
        operation,
        { cause: error as Error, contextId }
      );
      return ConfigurationResultUtils.failure(configError);
    }
  }
}

// ===== ASYNC RESULT UTILITIES =====

/**
 * Utilities for working with async results
 */
export class AsyncResultUtils {
  /**
   * Map over async result
   */
  static async map<T, U, E extends Error>(
    resultPromise: Promise<Result<T, E>>,
    fn: (value: T) => U | Promise<U>
  ): Promise<Result<U, E>> {
    const result = await resultPromise;
    if (result.isFailure) {
      return Result.failure(result.error);
    }
    
    try {
      const mappedValue = await fn(result.value);
      return Result.success(mappedValue);
    } catch (error) {
      return Result.failure(error as E);
    }
  }

  /**
   * FlatMap over async result
   */
  static async flatMap<T, U, E extends Error>(
    resultPromise: Promise<Result<T, E>>,
    fn: (value: T) => Promise<Result<U, E>>
  ): Promise<Result<U, E>> {
    const result = await resultPromise;
    if (result.isFailure) {
      return Result.failure(result.error);
    }
    
    return await fn(result.value);
  }

  /**
   * Sequence multiple async results
   */
  static async sequence<T, E extends Error>(
    resultPromises: Promise<Result<T, E>>[]
  ): Promise<Result<T[], E>> {
    const results: T[] = [];
    
    for (const resultPromise of resultPromises) {
      const result = await resultPromise;
      if (result.isFailure) {
        return Result.failure(result.error);
      }
      results.push(result.value);
    }
    
    return Result.success(results);
  }

  /**
   * Run async results in parallel and collect results
   */
  static async parallel<T, E extends Error>(
    resultPromises: Promise<Result<T, E>>[]
  ): Promise<Result<T[], E>> {
    const results = await Promise.all(resultPromises);
    return Result.combine(results);
  }
}

// ===== RESULT PATTERN EXTENSIONS =====

/**
 * Option-like behavior for results that might not have values
 */
export type Option<T> = Result<T, OptionError>;

class OptionError extends Error {
  constructor() {
    super('No value present');
    this.name = 'OptionError';
  }
}

export class OptionUtils {
  static some<T>(value: T): Option<T> {
    return Result.success(value);
  }

  static none<T>(): Option<T> {
    return Result.failure(new OptionError());
  }

  static fromNullable<T>(value: T | null | undefined): Option<T> {
    return value != null ? OptionUtils.some(value) : OptionUtils.none();
  }
}