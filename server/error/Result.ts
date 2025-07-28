/**
 * Result Pattern Implementation
 * Provides type-safe error handling for enterprise applications
 */

export class Result<T, E> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isSuccess: boolean = false
  ) {}

  static success<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isError(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot access error of successful result');
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success(fn(this.value));
    }
    return Result.failure(this.error);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this.value);
    }
    return Result.failure(this.error);
  }
}