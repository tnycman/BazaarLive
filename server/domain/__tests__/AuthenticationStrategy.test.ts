/**
 * AuthenticationStrategy Domain Entity Unit Tests
 * Complete test coverage for authentication strategy business logic
 */

import { describe, it, expect } from '@jest/globals';
import {
  AuthenticationStrategy,
  StrategyConfiguration,
  ValidationResult,
  AuthenticationContext,
  AuthenticationCapabilityLevel,
  AuthenticationStatus
} from '../AuthenticationStrategy';
import { Environment, EnvironmentType } from '../Environment';
import { Hostname } from '../Hostname';
import { StrategyName } from '../StrategyName';

// Test fixtures
const createValidConfiguration = (): StrategyConfiguration => ({
  scope: ['openid', 'email', 'profile'],
  callbackURL: 'https://example.com/callback',
  clientId: 'test-client-id',
  issuerURL: 'https://auth.example.com',
  timeout: 30000,
  retryAttempts: 3,
  securityLevel: 'standard'
});

const createDevelopmentEnvironment = () => Environment.create('development').value;
const createProductionEnvironment = () => Environment.create('production').value;

describe('AuthenticationStrategy Domain Entity', () => {
  describe('Factory Method - create()', () => {
    describe('Valid Strategy Creation', () => {
      it('should create strategy with valid configuration', async () => {
        const config = createValidConfiguration();
        const environment = createDevelopmentEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:localhost',
          config,
          environment
        );
        
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getName().toString()).toBe('replitauth:localhost');
        expect(result.value.getEnvironment().equals(environment)).toBe(true);
      });

      it('should create production strategy with enhanced security', async () => {
        const config: StrategyConfiguration = {
          ...createValidConfiguration(),
          securityLevel: 'enhanced'
        };
        const environment = createProductionEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:api.example.com',
          config,
          environment
        );
        
        expect(result.isSuccess()).toBe(true);
        expect(result.value.getConfiguration().securityLevel).toBe('enhanced');
      });
    });

    describe('Invalid Strategy Creation', () => {
      it('should reject invalid strategy name', async () => {
        const config = createValidConfiguration();
        const environment = createDevelopmentEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'invalid-name',
          config,
          environment
        );
        
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('must follow format');
      });

      it('should reject configuration with missing scope', async () => {
        const config = { ...createValidConfiguration(), scope: [] };
        const environment = createDevelopmentEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:localhost',
          config,
          environment
        );
        
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('scope is required');
      });

      it('should reject configuration with invalid timeout', async () => {
        const config = { ...createValidConfiguration(), timeout: 500 };
        const environment = createDevelopmentEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:localhost',
          config,
          environment
        );
        
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('Timeout must be between');
      });

      it('should reject basic security in production', async () => {
        const config: StrategyConfiguration = {
          ...createValidConfiguration(),
          securityLevel: 'basic'
        };
        const environment = createProductionEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:api.example.com',
          config,
          environment
        );
        
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('Basic security level not allowed');
      });

      it('should reject HTTP callback URL in production', async () => {
        const config: StrategyConfiguration = {
          ...createValidConfiguration(),
          callbackURL: 'http://example.com/callback'
        };
        const environment = createProductionEnvironment();
        
        const result = await AuthenticationStrategy.create(
          'replitauth:api.example.com',
          config,
          environment
        );
        
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('HTTPS callback URL required');
      });
    });
  });

  describe('Authentication Capability Assessment', () => {
    let strategy: AuthenticationStrategy;

    beforeEach(async () => {
      const config = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        config,
        environment
      );
      
      strategy = result.value;
    });

    it('should provide full capability for compatible hostname', async () => {
      const hostname = Hostname.create('localhost').value;
      const capability = await strategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(true);
      expect(capability.getCapabilityLevel()).toBe(AuthenticationCapabilityLevel.FULL);
      expect(capability.getRestrictions()).toHaveLength(0);
    });

    it('should reject incompatible hostname', async () => {
      const hostname = Hostname.create('different.com').value;
      const capability = await strategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(false);
      expect(capability.getRestrictions().length).toBeGreaterThan(0);
    });

    it('should reject IP addresses', async () => {
      const hostname = Hostname.create('192.168.1.1').value;
      const capability = await strategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(false);
      expect(capability.getRestrictions()).toContain('IP addresses are not allowed for authentication strategies');
    });

    it('should detect suspicious hostname patterns', async () => {
      const hostname = Hostname.create('admin.localhost').value;
      const capability = await strategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(false);
      expect(capability.getRestrictions().some(r => r.includes('suspicious pattern'))).toBe(true);
    });
  });

  describe('Context Validation', () => {
    let strategy: AuthenticationStrategy;

    beforeEach(async () => {
      const config = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        config,
        environment
      );
      
      strategy = result.value;
    });

    it('should validate correct authentication context', async () => {
      const contextResult = AuthenticationContext.create(
        'localhost',
        'development',
        'test-request-id',
        'test-client',
        'Mozilla/5.0 Test Browser'
      );
      
      expect(contextResult.isSuccess()).toBe(true);
      
      const validation = await strategy.validate(contextResult.value);
      expect(validation.isValid).toBe(true);
    });

    it('should reject context with missing request ID', async () => {
      const contextResult = AuthenticationContext.create(
        'localhost',
        'development',
        '',
        'test-client',
        'Mozilla/5.0 Test Browser'
      );
      
      expect(contextResult.isError()).toBe(true);
      expect(contextResult.error.message).toContain('Request ID and client identifier are required');
    });

    it('should reject context with environment mismatch', async () => {
      const contextResult = AuthenticationContext.create(
        'localhost',
        'production',
        'test-request-id',
        'test-client',
        'Mozilla/5.0 Test Browser'
      );
      
      expect(contextResult.isSuccess()).toBe(true);
      
      const validation = await strategy.validate(contextResult.value);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('environment'))).toBe(true);
    });
  });

  describe('Production Strategy Validation', () => {
    let productionStrategy: AuthenticationStrategy;

    beforeEach(async () => {
      const config: StrategyConfiguration = {
        ...createValidConfiguration(),
        securityLevel: 'strict',
        callbackURL: 'https://api.example.com/callback'
      };
      const environment = createProductionEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:api.example.com',
        config,
        environment
      );
      
      productionStrategy = result.value;
    });

    it('should provide enhanced capability for production strategy', async () => {
      const hostname = Hostname.create('api.example.com').value;
      const capability = await productionStrategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(true);
      expect(capability.getCapabilityLevel()).toBe(AuthenticationCapabilityLevel.ENHANCED);
    });

    it('should reject development hostnames in production', async () => {
      const hostname = Hostname.create('localhost').value;
      const capability = await productionStrategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(false);
      expect(capability.getRestrictions().some(r => r.includes('Development hostnames not allowed'))).toBe(true);
    });

    it('should require proper domain structure', async () => {
      const hostname = Hostname.create('invalid').value;
      const capability = await productionStrategy.canAuthenticate(hostname);
      
      expect(capability.canAuthenticate()).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should return immutable configuration copy', async () => {
      const originalConfig = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        originalConfig,
        environment
      );
      
      const strategy = result.value;
      const retrievedConfig = strategy.getConfiguration();
      
      // Modify retrieved config
      retrievedConfig.timeout = 99999;
      
      // Original should be unchanged
      const freshConfig = strategy.getConfiguration();
      expect(freshConfig.timeout).toBe(originalConfig.timeout);
    });

    it('should preserve validation rules', async () => {
      const config = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        config,
        environment
      );
      
      const strategy = result.value;
      const rules = strategy.getValidationRules();
      
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(rule => rule.name && rule.description)).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize strategy to JSON', async () => {
      const config = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        config,
        environment
      );
      
      const strategy = result.value;
      const json = strategy.toJSON();
      
      expect(json.name).toBe('replitauth:localhost');
      expect(json.configuration).toEqual(config);
      expect(json.environment).toBe('development');
      expect(Array.isArray(json.validationRules)).toBe(true);
    });
  });

  describe('Zod Schema Validation', () => {
    it('should validate configuration with Zod schema', () => {
      const schema = AuthenticationStrategy.createConfigurationSchema();
      const config = createValidConfiguration();
      
      const result = schema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid configuration with Zod schema', () => {
      const schema = AuthenticationStrategy.createConfigurationSchema();
      const invalidConfig = { ...createValidConfiguration(), scope: [] };
      
      const result = schema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should validate URL formats', () => {
      const schema = AuthenticationStrategy.createConfigurationSchema();
      const invalidConfig = {
        ...createValidConfiguration(),
        callbackURL: 'not-a-url'
      };
      
      const result = schema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should validate timeout ranges', () => {
      const schema = AuthenticationStrategy.createConfigurationSchema();
      const invalidConfig = {
        ...createValidConfiguration(),
        timeout: 500
      };
      
      const result = schema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation rule failures gracefully', async () => {
      const config = createValidConfiguration();
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        config,
        environment
      );
      
      const strategy = result.value;
      
      // Test with various invalid hostnames
      const testCases = [
        'invalid@hostname',
        'admin.system.internal',
        '192.168.1.1'
      ];
      
      for (const testHostname of testCases) {
        const hostnameResult = Hostname.create(testHostname);
        if (hostnameResult.isSuccess()) {
          const capability = await strategy.canAuthenticate(hostnameResult.value);
          expect(capability.canAuthenticate()).toBe(false);
          expect(capability.getRestrictions().length).toBeGreaterThan(0);
        }
      }
    });

    it('should provide detailed error context', async () => {
      const invalidConfig = {
        ...createValidConfiguration(),
        scope: [],
        timeout: 500,
        callbackURL: 'not-a-url'
      };
      const environment = createDevelopmentEnvironment();
      
      const result = await AuthenticationStrategy.create(
        'replitauth:localhost',
        invalidConfig,
        environment
      );
      
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('Configuration validation failed');
    });
  });
});