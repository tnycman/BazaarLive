/**
 * Result Pattern Implementation
 * Enterprise-grade Result<T,E> type for uniform success/failure handling
 * Prevents null/undefined returns and makes error recovery explicit
 */

/**
 * Result type union representing either success with value or failure with error
 * @template T - The success value type
 * @template E - The error type
 */
export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Creates a successful Result wrapping the provided value
 * @template T - The success value type
 * @template E - The error type (inferred)
 * @param value - The success value to wrap
 * @returns Result<T,E> with ok: true and the value
 * 
 * @example
 * ```typescript
 * const result = ok<string, Error>("Hello World");
 * if (result.ok) {
 *   console.log(result.value); // "Hello World"
 * }
 * ```
 */
export function ok<T, E = Error>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Creates a failed Result wrapping the provided error
 * @template T - The success value type (inferred)
 * @template E - The error type
 * @param error - The error to wrap
 * @returns Result<T,E> with ok: false and the error
 * 
 * @example
 * ```typescript
 * const result = err<string, Error>(new Error("Something went wrong"));
 * if (!result.ok) {
 *   console.error(result.error.message); // "Something went wrong"
 * }
 * ```
 */
export function err<T = unknown, E = Error>(error: E): Result<T, E> {
  return { ok: false, error };
}

/**
 * Type guard to check if a Result is successful
 * @param result - The Result to check
 * @returns true if the Result represents success
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

/**
 * Type guard to check if a Result is an error
 * @param result - The Result to check
 * @returns true if the Result represents failure
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Maps a successful Result's value through a transformation function
 * @template T - The original success value type
 * @template U - The transformed success value type
 * @template E - The error type
 * @param result - The Result to map
 * @param fn - The transformation function
 * @returns New Result with transformed value or original error
 * 
 * @example
 * ```typescript
 * const result = ok<number, Error>(42);
 * const mapped = mapOk(result, x => x.toString()); // Result<string, Error>
 * ```
 */
export function mapOk<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Maps a failed Result's error through a transformation function
 * @template T - The success value type
 * @template E - The original error type
 * @template F - The transformed error type
 * @param result - The Result to map
 * @param fn - The transformation function
 * @returns New Result with transformed error or original value
 * 
 * @example
 * ```typescript
 * const result = err<string, string>("error");
 * const mapped = mapErr(result, msg => new Error(msg)); // Result<string, Error>
 * ```
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Chains Results together, applying a function that returns a Result
 * @template T - The original success value type
 * @template U - The chained success value type
 * @template E - The error type
 * @param result - The Result to chain
 * @param fn - The function that returns a new Result
 * @returns Chained Result or original error
 * 
 * @example
 * ```typescript
 * const result = ok<string, Error>("42");
 * const chained = andThen(result, str => {
 *   const num = parseInt(str);
 *   return isNaN(num) ? err(new Error("Not a number")) : ok(num);
 * });
 * ```
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Provides a default value for failed Results
 * @template T - The success value type
 * @template E - The error type
 * @param result - The Result to unwrap
 * @param defaultValue - The default value to use on error
 * @returns The success value or default value
 * 
 * @example
 * ```typescript
 * const result = err<number, Error>(new Error("Failed"));
 * const value = unwrapOr(result, 0); // 0
 * ```
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Unwraps a successful Result or throws the error
 * @template T - The success value type
 * @template E - The error type (must extend Error)
 * @param result - The Result to unwrap
 * @returns The success value
 * @throws The error if Result is failed
 * 
 * @example
 * ```typescript
 * const result = ok<string, Error>("success");
 * const value = unwrap(result); // "success"
 * 
 * const failed = err<string, Error>(new Error("Failed"));
 * const value2 = unwrap(failed); // throws Error("Failed")
 * ```
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

/**
 * Converts a Promise to a Result, catching any thrown errors
 * @template T - The success value type
 * @template E - The error type
 * @param promise - The Promise to convert
 * @param errorMapper - Optional function to transform caught errors
 * @returns Promise<Result<T, E>>
 * 
 * @example
 * ```typescript
 * const result = await fromPromise(
 *   fetch('/api/data').then(r => r.json()),
 *   (err) => new Error(`API Error: ${err.message}`)
 * );
 * ```
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  errorMapper?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    const mappedError = errorMapper ? errorMapper(error) : (error as E);
    return err(mappedError);
  }
}

/**
 * Combines multiple Results into a single Result containing an array
 * Fails fast - returns the first error encountered
 * @template T - The success value type
 * @template E - The error type
 * @param results - Array of Results to combine
 * @returns Result<T[], E> with all values or first error
 * 
 * @example
 * ```typescript
 * const results = [ok(1), ok(2), ok(3)];
 * const combined = all(results); // ok([1, 2, 3])
 * 
 * const withError = [ok(1), err(new Error("Failed")), ok(3)];
 * const failed = all(withError); // err(Error("Failed"))
 * ```
 */
export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (!result.ok) {
      return result;
    }
    values.push(result.value);
  }
  
  return ok(values);
}

/**
 * Result namespace containing utility types and constants
 */
export namespace Result {
  /**
   * Type alias for successful Result
   */
  export type Ok<T> = { ok: true; value: T };
  
  /**
   * Type alias for failed Result
   */
  export type Err<E> = { ok: false; error: E };
  
  /**
   * Extract the success type from a Result
   */
  export type Success<R> = R extends Result<infer T, any> ? T : never;
  
  /**
   * Extract the error type from a Result
   */
  export type Error<R> = R extends Result<any, infer E> ? E : never;
}