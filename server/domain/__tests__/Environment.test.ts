/**
 * Environment Value Object Unit Tests
 * Complete test coverage for environment detection and validation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Environment, EnvironmentType, ValidationError } from '../Environment';

describe('Environment Value Object', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Factory Method - create()', () => {
    describe('Valid Environments', () => {
      it('should create development environment', () => {
        const result = Environment.create('development');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
      });

      it('should create production environment', () => {
        const result = Environment.create('production');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getType()).toBe(EnvironmentType.PRODUCTION);
      });

      it('should create staging environment', () => {
        const result = Environment.create('staging');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getType()).toBe(EnvironmentType.STAGING);
      });

      it('should create test environment', () => {
        const result = Environment.create('test');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getType()).toBe(EnvironmentType.TEST);
      });

      it('should normalize case and whitespace', () => {
        const result = Environment.create('  DEVELOPMENT  ');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
      });

      it('should handle environment indicators', () => {
        const devResult = Environment.create('dev');
        const prodResult = Environment.create('prod');
        
        expect(devResult.isSuccess()).toBe(true);
        expect(devResult.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
        
        expect(prodResult.isSuccess()).toBe(true);
        expect(prodResult.value.getType()).toBe(EnvironmentType.PRODUCTION);
      });
    });

    describe('Invalid Environments', () => {
      it('should reject null environment', () => {
        const result = Environment.create(null as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject undefined environment', () => {
        const result = Environment.create(undefined as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject non-string environment', () => {
        const result = Environment.create(123 as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('must be a string');
      });

      it('should reject empty environment', () => {
        const result = Environment.create('');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('cannot be empty');
      });

      it('should reject completely invalid environment', () => {
        const result = Environment.create('invalid_environment_xyz');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('Invalid environment');
      });
    });
  });

  describe('Auto-Detection - detect()', () => {
    it('should detect development from NODE_ENV', async () => {
      process.env.NODE_ENV = 'development';
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
    });

    it('should detect production from NODE_ENV', async () => {
      process.env.NODE_ENV = 'production';
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.PRODUCTION);
    });

    it('should detect production from REPLIT_DEPLOYMENT', async () => {
      delete process.env.NODE_ENV;
      process.env.REPLIT_DEPLOYMENT = 'true';
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.PRODUCTION);
    });

    it('should detect development from REPL_ID without deployment', async () => {
      delete process.env.NODE_ENV;
      delete process.env.REPLIT_DEPLOYMENT;
      process.env.REPL_ID = 'test-repl-id';
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
    });

    it('should detect test from CI indicators', async () => {
      delete process.env.NODE_ENV;
      delete process.env.REPLIT_DEPLOYMENT;
      delete process.env.REPL_ID;
      process.env.CI = 'true';
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.TEST);
    });

    it('should default to development when no indicators found', async () => {
      delete process.env.NODE_ENV;
      delete process.env.REPLIT_DEPLOYMENT;
      delete process.env.REPL_ID;
      delete process.env.CI;
      delete process.env.CONTINUOUS_INTEGRATION;
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITLAB_CI;
      
      const result = await Environment.detect();
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.DEVELOPMENT);
    });
  });

  describe('Environment Classification', () => {
    it('should identify development environment correctly', () => {
      const env = Environment.create('development').value;
      expect(env.isDevelopment()).toBe(true);
      expect(env.isProduction()).toBe(false);
      expect(env.isStaging()).toBe(false);
      expect(env.isTest()).toBe(false);
    });

    it('should identify production environment correctly', () => {
      const env = Environment.create('production').value;
      expect(env.isDevelopment()).toBe(false);
      expect(env.isProduction()).toBe(true);
      expect(env.isStaging()).toBe(false);
      expect(env.isTest()).toBe(false);
    });

    it('should identify staging environment correctly', () => {
      const env = Environment.create('staging').value;
      expect(env.isDevelopment()).toBe(false);
      expect(env.isProduction()).toBe(false);
      expect(env.isStaging()).toBe(true);
      expect(env.isTest()).toBe(false);
    });

    it('should identify test environment correctly', () => {
      const env = Environment.create('test').value;
      expect(env.isDevelopment()).toBe(false);
      expect(env.isProduction()).toBe(false);
      expect(env.isStaging()).toBe(false);
      expect(env.isTest()).toBe(true);
    });
  });

  describe('Security and Feature Checks', () => {
    it('should require strict security for production and staging', () => {
      const prod = Environment.create('production').value;
      const staging = Environment.create('staging').value;
      const dev = Environment.create('development').value;
      
      expect(prod.requiresStrictSecurity()).toBe(true);
      expect(staging.requiresStrictSecurity()).toBe(true);
      expect(dev.requiresStrictSecurity()).toBe(false);
    });

    it('should allow debug features for development and test', () => {
      const dev = Environment.create('development').value;
      const test = Environment.create('test').value;
      const prod = Environment.create('production').value;
      
      expect(dev.allowsDebugFeatures()).toBe(true);
      expect(test.allowsDebugFeatures()).toBe(true);
      expect(prod.allowsDebugFeatures()).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should provide development configuration', () => {
      const env = Environment.create('development').value;
      const config = env.getConfiguration();
      
      expect(config.debugMode).toBe(true);
      expect(config.strictValidation).toBe(false);
      expect(config.allowedHosts).toContain('localhost');
      expect(config.logLevel).toBe('debug');
      expect(config.enableMetrics).toBe(false);
      expect(config.requireHTTPS).toBe(false);
    });

    it('should provide production configuration', () => {
      const env = Environment.create('production').value;
      const config = env.getConfiguration();
      
      expect(config.debugMode).toBe(false);
      expect(config.strictValidation).toBe(true);
      expect(config.allowedHosts).toEqual([]);
      expect(config.logLevel).toBe('warn');
      expect(config.enableMetrics).toBe(true);
      expect(config.requireHTTPS).toBe(true);
    });

    it('should provide staging configuration', () => {
      const env = Environment.create('staging').value;
      const config = env.getConfiguration();
      
      expect(config.debugMode).toBe(false);
      expect(config.strictValidation).toBe(true);
      expect(config.allowedHosts).toEqual(['*.staging.*']);
      expect(config.logLevel).toBe('info');
      expect(config.enableMetrics).toBe(true);
      expect(config.requireHTTPS).toBe(true);
    });

    it('should provide test configuration', () => {
      const env = Environment.create('test').value;
      const config = env.getConfiguration();
      
      expect(config.debugMode).toBe(true);
      expect(config.strictValidation).toBe(true);
      expect(config.allowedHosts).toContain('localhost');
      expect(config.logLevel).toBe('error');
      expect(config.enableMetrics).toBe(false);
      expect(config.requireHTTPS).toBe(false);
    });
  });

  describe('Equality', () => {
    it('should be equal for same environment type', () => {
      const env1 = Environment.create('development').value;
      const env2 = Environment.create('development').value;
      expect(env1.equals(env2)).toBe(true);
    });

    it('should not be equal for different environment types', () => {
      const dev = Environment.create('development').value;
      const prod = Environment.create('production').value;
      expect(dev.equals(prod)).toBe(false);
    });

    it('should not be equal for non-Environment objects', () => {
      const env = Environment.create('development').value;
      expect(env.equals('development' as any)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should return correct string representation', () => {
      const env = Environment.create('development').value;
      expect(env.toString()).toBe('development');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const env = Environment.create('production').value;
      const json = env.toJSON();
      expect(json).toBe('production');
    });

    it('should deserialize from JSON correctly', () => {
      const result = Environment.fromJSON('staging');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.getType()).toBe(EnvironmentType.STAGING);
    });

    it('should handle invalid JSON during deserialization', () => {
      const result = Environment.fromJSON('invalid');
      expect(result.isError()).toBe(true);
    });
  });

  describe('Zod Schema Integration', () => {
    it('should validate valid environment with Zod schema', () => {
      const schema = Environment.createZodSchema();
      const result = schema.safeParse('production');
      expect(result.success).toBe(true);
    });

    it('should reject invalid environment with Zod schema', () => {
      const schema = Environment.createZodSchema();
      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide convenience functions for common environments', () => {
      const dev = () => Environment.create(EnvironmentType.DEVELOPMENT).value;
      const staging = () => Environment.create(EnvironmentType.STAGING).value;
      const prod = () => Environment.create(EnvironmentType.PRODUCTION).value;
      const test = () => Environment.create(EnvironmentType.TEST).value;

      expect(dev().isDevelopment()).toBe(true);
      expect(staging().isStaging()).toBe(true);
      expect(prod().isProduction()).toBe(true);
      expect(test().isTest()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const result = Environment.create('');
      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('cannot be empty');
    });

    it('should handle detection errors gracefully', async () => {
      // Mock hostname function to throw error
      const originalRequire = require;
      require = () => {
        throw new Error('Mock error');
      };
      
      try {
        const result = await Environment.detect();
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('Failed to detect environment');
      } finally {
        require = originalRequire;
      }
    });
  });
});