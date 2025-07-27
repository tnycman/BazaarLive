/**
 * StrategyName Value Object Unit Tests
 * Complete test coverage for strategy name validation and business logic
 */

import { describe, it, expect } from '@jest/globals';
import { StrategyName, ValidationError } from '../StrategyName';

describe('StrategyName Value Object', () => {
  describe('Factory Method - create()', () => {
    describe('Valid Strategy Names', () => {
      it('should create strategy name with replitauth prefix', () => {
        const result = StrategyName.create('replitauth:example.com');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('replitauth:example.com');
      });

      it('should create strategy name with oauth prefix', () => {
        const result = StrategyName.create('oauth:google');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('oauth:google');
      });

      it('should create strategy name with test prefix', () => {
        const result = StrategyName.create('test:development');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('test:development');
      });

      it('should normalize case and whitespace', () => {
        const result = StrategyName.create('  REPLITAUTH:EXAMPLE.COM  ');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('replitauth:example.com');
      });

      it('should accept strategy with complex identifier', () => {
        const result = StrategyName.create('replitauth:api.staging.example.com');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('replitauth:api.staging.example.com');
      });
    });

    describe('Invalid Strategy Names', () => {
      it('should reject null strategy name', () => {
        const result = StrategyName.create(null as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject undefined strategy name', () => {
        const result = StrategyName.create(undefined as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject non-string strategy name', () => {
        const result = StrategyName.create(123 as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('must be a string');
      });

      it('should reject empty strategy name', () => {
        const result = StrategyName.create('');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('cannot be empty');
      });

      it('should reject strategy name without colon', () => {
        const result = StrategyName.create('replitauth');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('must follow format "prefix:identifier"');
      });

      it('should reject strategy name with reserved prefix', () => {
        const result = StrategyName.create('system:internal');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('reserved prefix');
      });

      it('should reject strategy name with invalid prefix', () => {
        const result = StrategyName.create('invalid:example');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('prefix not recognized');
      });

      it('should reject too short strategy name', () => {
        const result = StrategyName.create('a:b');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('at least 5 characters');
      });

      it('should reject too long strategy name', () => {
        const longName = 'replitauth:' + 'a'.repeat(120);
        const result = StrategyName.create(longName);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('maximum length');
      });

      it('should reject identifier starting with special character', () => {
        const result = StrategyName.create('replitauth:.invalid');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('cannot start with');
      });

      it('should reject identifier ending with special character', () => {
        const result = StrategyName.create('replitauth:invalid.');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('cannot end with');
      });

      it('should reject empty identifier', () => {
        const result = StrategyName.create('replitauth:');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('non-empty identifier');
      });
    });
  });

  describe('Factory Method - fromParts()', () => {
    it('should create strategy from prefix and identifier', () => {
      const result = StrategyName.fromParts('replitauth', 'example.com');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('replitauth:example.com');
    });

    it('should handle prefix with colon', () => {
      const result = StrategyName.fromParts('replitauth:', 'example.com');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('replitauth:example.com');
    });

    it('should reject empty prefix', () => {
      const result = StrategyName.fromParts('', 'example.com');
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('Both prefix and identifier are required');
    });

    it('should reject empty identifier', () => {
      const result = StrategyName.fromParts('replitauth', '');
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('Both prefix and identifier are required');
    });
  });

  describe('Component Access', () => {
    it('should extract prefix correctly', () => {
      const strategyName = StrategyName.create('replitauth:example.com').value;
      expect(strategyName.getPrefix()).toBe('replitauth');
    });

    it('should extract identifier correctly', () => {
      const strategyName = StrategyName.create('replitauth:example.com').value;
      expect(strategyName.getIdentifier()).toBe('example.com');
    });

    it('should get strategy type correctly', () => {
      const replitauth = StrategyName.create('replitauth:example.com').value;
      const oauth = StrategyName.create('oauth:google').value;
      const test = StrategyName.create('test:local').value;

      expect(replitauth.getStrategyType()).toBe('replitauth');
      expect(oauth.getStrategyType()).toBe('oauth');
      expect(test.getStrategyType()).toBe('test');
    });
  });

  describe('Environment Classification', () => {
    it('should identify development strategies', () => {
      const localhost = StrategyName.create('replitauth:localhost').value;
      const dev = StrategyName.create('replitauth:dev.example.com').value;
      const local = StrategyName.create('replitauth:local.test').value;

      expect(localhost.isDevelopmentStrategy()).toBe(true);
      expect(dev.isDevelopmentStrategy()).toBe(true);
      expect(local.isDevelopmentStrategy()).toBe(true);
    });

    it('should identify production strategies', () => {
      const prod = StrategyName.create('replitauth:api.example.com').value;
      expect(prod.isProductionStrategy()).toBe(true);
    });

    it('should identify test strategies', () => {
      const testStrategy = StrategyName.create('test:integration').value;
      const stagingStrategy = StrategyName.create('replitauth:staging.example.com').value;

      expect(testStrategy.isTestStrategy()).toBe(true);
      expect(stagingStrategy.isTestStrategy()).toBe(true);
    });
  });

  describe('Hostname Compatibility', () => {
    it('should be compatible with exact hostname match', () => {
      const strategyName = StrategyName.create('replitauth:example.com').value;
      expect(strategyName.isCompatibleWithHostname('example.com')).toBe(true);
    });

    it('should be compatible with development hostnames for dev strategies', () => {
      const strategyName = StrategyName.create('replitauth:localhost').value;
      expect(strategyName.isCompatibleWithHostname('localhost')).toBe(true);
      expect(strategyName.isCompatibleWithHostname('127.0.0.1')).toBe(true);
    });

    it('should be compatible with domain matching for production', () => {
      const strategyName = StrategyName.create('replitauth:api.example.com').value;
      expect(strategyName.isCompatibleWithHostname('api.example.com')).toBe(true);
    });

    it('should not be compatible with unrelated hostnames', () => {
      const strategyName = StrategyName.create('replitauth:example.com').value;
      expect(strategyName.isCompatibleWithHostname('different.com')).toBe(false);
    });
  });

  describe('Strategy Variants', () => {
    it('should create development variant', () => {
      const prod = StrategyName.create('replitauth:api.example.com').value;
      const devResult = prod.createDevelopmentVariant();
      
      expect(devResult.isSuccess()).toBe(true);
      expect(devResult.value.getIdentifier()).toBe('dev-api.example.com');
      expect(devResult.value.isDevelopmentStrategy()).toBe(true);
    });

    it('should return same strategy if already development', () => {
      const dev = StrategyName.create('replitauth:localhost').value;
      const devResult = dev.createDevelopmentVariant();
      
      expect(devResult.isSuccess()).toBe(true);
      expect(devResult.value.equals(dev)).toBe(true);
    });

    it('should create production variant', () => {
      const dev = StrategyName.create('replitauth:dev-api.example.com').value;
      const prodResult = dev.createProductionVariant();
      
      expect(prodResult.isSuccess()).toBe(true);
      expect(prodResult.value.getIdentifier()).toBe('api.example.com');
      expect(prodResult.value.isProductionStrategy()).toBe(true);
    });

    it('should remove multiple development indicators', () => {
      const dev = StrategyName.create('replitauth:test-dev-local-api.example.com').value;
      const prodResult = dev.createProductionVariant();
      
      expect(prodResult.isSuccess()).toBe(true);
      expect(prodResult.value.getIdentifier()).toBe('api.example.com');
    });
  });

  describe('Equality', () => {
    it('should be equal for same strategy name', () => {
      const strategy1 = StrategyName.create('replitauth:example.com').value;
      const strategy2 = StrategyName.create('replitauth:example.com').value;
      expect(strategy1.equals(strategy2)).toBe(true);
    });

    it('should not be equal for different strategy names', () => {
      const strategy1 = StrategyName.create('replitauth:example.com').value;
      const strategy2 = StrategyName.create('oauth:google').value;
      expect(strategy1.equals(strategy2)).toBe(false);
    });

    it('should not be equal for non-StrategyName objects', () => {
      const strategy = StrategyName.create('replitauth:example.com').value;
      expect(strategy.equals('replitauth:example.com' as any)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const strategyName = StrategyName.create('replitauth:example.com').value;
      const json = strategyName.toJSON();
      expect(json).toBe('replitauth:example.com');
    });

    it('should deserialize from JSON correctly', () => {
      const result = StrategyName.fromJSON('replitauth:example.com');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('replitauth:example.com');
    });

    it('should handle invalid JSON during deserialization', () => {
      const result = StrategyName.fromJSON('invalid');
      expect(result.isError()).toBe(true);
    });
  });

  describe('Zod Schema Integration', () => {
    it('should validate valid strategy name with Zod schema', () => {
      const schema = StrategyName.createZodSchema();
      const result = schema.safeParse('replitauth:example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid strategy name with Zod schema', () => {
      const schema = StrategyName.createZodSchema();
      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const result = StrategyName.create('invalid');
      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('must follow format');
    });

    it('should handle unexpected errors gracefully', () => {
      // Mock an unexpected error scenario
      const originalTest = RegExp.prototype.test;
      RegExp.prototype.test = () => { throw new Error('Unexpected error'); };
      
      const result = StrategyName.create('replitauth:example.com');
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('Unexpected error');
      
      // Restore original function
      RegExp.prototype.test = originalTest;
    });
  });
});