/**
 * Result Pattern Unit Tests
 * Comprehensive test suite for Result<T,E> pattern implementation
 */

import { 
  Result, ok, err, isOk, isErr, mapOk, mapErr, andThen, 
  unwrapOr, unwrap, fromPromise, all 
} from '../../patterns/Result';

describe('Result Pattern', () => {
  describe('ok helper', () => {
    it('should create successful Result with value', () => {
      const result = ok<string, Error>('Hello World');
      
      expect(result.ok).toBe(true);
      expect(result.value).toBe('Hello World');
    });

    it('should have proper type narrowing', () => {
      const result = ok<number, string>(42);
      
      if (result.ok) {
        // TypeScript should narrow this to { ok: true; value: number }
        expect(typeof result.value).toBe('number');
        expect(result.value).toBe(42);
      } else {
        fail('Result should be successful');
      }
    });
  });

  describe('err helper', () => {
    it('should create failed Result with error', () => {
      const error = new Error('Something went wrong');
      const result = err<string, Error>(error);
      
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should have proper type narrowing', () => {
      const result = err<string, Error>(new Error('Test error'));
      
      if (!result.ok) {
        // TypeScript should narrow this to { ok: false; error: Error }
        expect(result.error instanceof Error).toBe(true);
        expect(result.error.message).toBe('Test error');
      } else {
        fail('Result should be failed');
      }
    });
  });

  describe('type guards', () => {
    it('isOk should correctly identify successful Results', () => {
      const success = ok('value');
      const failure = err(new Error('error'));
      
      expect(isOk(success)).toBe(true);
      expect(isOk(failure)).toBe(false);
    });

    it('isErr should correctly identify failed Results', () => {
      const success = ok('value');
      const failure = err(new Error('error'));
      
      expect(isErr(success)).toBe(false);
      expect(isErr(failure)).toBe(true);
    });
  });

  describe('mapOk', () => {
    it('should transform successful Result values', () => {
      const result = ok<number, Error>(42);
      const mapped = mapOk(result, x => x.toString());
      
      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.value).toBe('42');
      }
    });

    it('should pass through failed Results unchanged', () => {
      const error = new Error('Failed');
      const result = err<number, Error>(error);
      const mapped = mapOk(result, x => x.toString());
      
      expect(mapped.ok).toBe(false);
      if (!mapped.ok) {
        expect(mapped.error).toBe(error);
      }
    });
  });

  describe('mapErr', () => {
    it('should transform failed Result errors', () => {
      const result = err<string, string>('error message');
      const mapped = mapErr(result, msg => new Error(msg));
      
      expect(mapped.ok).toBe(false);
      if (!mapped.ok) {
        expect(mapped.error instanceof Error).toBe(true);
        expect(mapped.error.message).toBe('error message');
      }
    });

    it('should pass through successful Results unchanged', () => {
      const result = ok<string, string>('success');
      const mapped = mapErr(result, msg => new Error(msg));
      
      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.value).toBe('success');
      }
    });
  });

  describe('andThen', () => {
    it('should chain successful Results', () => {
      const result = ok<string, Error>('42');
      const chained = andThen(result, str => {
        const num = parseInt(str);
        return isNaN(num) ? err(new Error('Not a number')) : ok(num);
      });
      
      expect(chained.ok).toBe(true);
      if (chained.ok) {
        expect(chained.value).toBe(42);
      }
    });

    it('should return error from chained function', () => {
      const result = ok<string, Error>('not-a-number');
      const chained = andThen(result, str => {
        const num = parseInt(str);
        return isNaN(num) ? err(new Error('Not a number')) : ok(num);
      });
      
      expect(chained.ok).toBe(false);
      if (!chained.ok) {
        expect(chained.error.message).toBe('Not a number');
      }
    });

    it('should pass through failed Results', () => {
      const error = new Error('Original error');
      const result = err<string, Error>(error);
      const chained = andThen(result, () => ok(42));
      
      expect(chained.ok).toBe(false);
      if (!chained.ok) {
        expect(chained.error).toBe(error);
      }
    });
  });

  describe('unwrapOr', () => {
    it('should return value for successful Results', () => {
      const result = ok<number, Error>(42);
      const value = unwrapOr(result, 0);
      
      expect(value).toBe(42);
    });

    it('should return default value for failed Results', () => {
      const result = err<number, Error>(new Error('Failed'));
      const value = unwrapOr(result, 0);
      
      expect(value).toBe(0);
    });
  });

  describe('unwrap', () => {
    it('should return value for successful Results', () => {
      const result = ok<string, Error>('success');
      const value = unwrap(result);
      
      expect(value).toBe('success');
    });

    it('should throw error for failed Results', () => {
      const error = new Error('Failed');
      const result = err<string, Error>(error);
      
      expect(() => unwrap(result)).toThrow(error);
    });
  });

  describe('fromPromise', () => {
    it('should convert resolved Promise to ok Result', async () => {
      const promise = Promise.resolve('success');
      const result = await fromPromise(promise);
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('success');
      }
    });

    it('should convert rejected Promise to err Result', async () => {
      const error = new Error('Promise failed');
      const promise = Promise.reject(error);
      const result = await fromPromise(promise);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(error);
      }
    });

    it('should apply error mapper to rejected Promise', async () => {
      const promise = Promise.reject('string error');
      const result = await fromPromise(
        promise,
        (err) => new Error(`Mapped: ${err}`)
      );
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error instanceof Error).toBe(true);
        expect(result.error.message).toBe('Mapped: string error');
      }
    });
  });

  describe('all', () => {
    it('should combine all successful Results', () => {
      const results = [ok(1), ok(2), ok(3)];
      const combined = all(results);
      
      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([1, 2, 3]);
      }
    });

    it('should fail fast on first error', () => {
      const error = new Error('Failed');
      const results = [ok(1), err(error), ok(3)];
      const combined = all(results);
      
      expect(combined.ok).toBe(false);
      if (!combined.ok) {
        expect(combined.error).toBe(error);
      }
    });

    it('should handle empty array', () => {
      const results: Result<number, Error>[] = [];
      const combined = all(results);
      
      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  describe('Result namespace types', () => {
    it('should extract Success type from Result', () => {
      type TestResult = Result<string, Error>;
      type SuccessType = Result.Success<TestResult>;
      
      // This is a compile-time test - if it compiles, the type is correct
      const value: SuccessType = 'test';
      expect(typeof value).toBe('string');
    });

    it('should extract Error type from Result', () => {
      type TestResult = Result<string, Error>;
      type ErrorType = Result.Error<TestResult>;
      
      // This is a compile-time test - if it compiles, the type is correct
      const error: ErrorType = new Error('test');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('TypeScript control-flow analysis', () => {
    it('should narrow types correctly in if statements', () => {
      const result: Result<string, Error> = ok('test');
      
      if (result.ok) {
        // TypeScript should know result.value is string here
        expect(typeof result.value).toBe('string');
        expect(result.value.toUpperCase()).toBe('TEST');
      } else {
        // TypeScript should know result.error is Error here
        expect(result.error instanceof Error).toBe(true);
      }
    });

    it('should work with type guards', () => {
      const result: Result<number, string> = err('error');
      
      if (isErr(result)) {
        // TypeScript should know result.error is string here
        expect(typeof result.error).toBe('string');
        expect(result.error.toUpperCase()).toBe('ERROR');
      }
    });
  });
});