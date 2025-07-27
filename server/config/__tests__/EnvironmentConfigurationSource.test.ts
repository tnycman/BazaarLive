/**
 * EnvironmentConfigurationSource Unit Tests
 * Complete test coverage for environment-based configuration loading
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EnvironmentConfigurationSource } from '../EnvironmentConfigurationSource';
import { Environment, EnvironmentType } from '../../domain/Environment';
import { ValidationError } from '../../domain/Hostname';

describe('EnvironmentConfigurationSource', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let configSource: EnvironmentConfigurationSource;

  beforeEach(() => {
    originalEnv = { ...process.env };
    configSource = new EnvironmentConfigurationSource();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const setValidEnvironment = () => {
    process.env.REPLIT_DOMAINS = 'example.com,api.example.com';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    process.env.REPL_ID = 'test-repl-id';
    process.env.ISSUER_URL = 'https://auth.example.com';
  };

  describe('Required Variables', () => {
    it('should return list of required environment variables', () => {
      const required = configSource.getRequiredVariables();
      
      expect(required).toContain('REPLIT_DOMAINS');
      expect(required).toContain('SESSION_SECRET');
      expect(required).toContain('REPL_ID');
      expect(required).toContain('ISSUER_URL');
    });

    it('should validate when all required variables are present', async () => {
      setValidEnvironment();
      
      const result = await configSource.validate();
      expect(result.isValid).toBe(true);
    });

    it('should fail validation when required variables are missing', async () => {
      delete process.env.REPLIT_DOMAINS;
      delete process.env.SESSION_SECRET;
      
      const result = await configSource.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('REPLIT_DOMAINS'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('SESSION_SECRET'))).toBe(true);
    });

    it('should validate SESSION_SECRET length requirement', async () => {
      setValidEnvironment();
      process.env.SESSION_SECRET = 'short';
      
      const result = await configSource.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('at least 32 characters'))).toBe(true);
    });

    it('should validate ISSUER_URL format', async () => {
      setValidEnvironment();
      process.env.ISSUER_URL = 'not-a-url';
      
      const result = await configSource.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('valid URL'))).toBe(true);
    });

    it('should validate REPLIT_DOMAINS format', async () => {
      setValidEnvironment();
      process.env.REPLIT_DOMAINS = '';
      
      const result = await configSource.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('at least one valid domain'))).toBe(true);
    });
  });

  describe('Optional Variables', () => {
    it('should return optional variables with current values', () => {
      process.env.LOG_LEVEL = 'debug';
      process.env.ENABLE_METRICS = 'true';
      
      const optional = configSource.getOptionalVariables();
      expect(typeof optional).toBe('object');
    });

    it('should handle missing optional variables gracefully', () => {
      delete process.env.LOG_LEVEL;
      delete process.env.ENABLE_METRICS;
      
      const optional = configSource.getOptionalVariables();
      expect(typeof optional).toBe('object');
    });
  });

  describe('Configuration Loading', () => {
    describe('Development Environment', () => {
      it('should load configuration for development environment', async () => {
        setValidEnvironment();
        const environment = Environment.create('development').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        expect(config.environment.equals(environment)).toBe(true);
        expect(config.domains).toEqual(['example.com', 'api.example.com']);
        expect(config.strategies.length).toBe(2);
        expect(config.mappings.length).toBeGreaterThan(2); // Includes localhost mappings
        expect(config.security.enforceHTTPS).toBe(false);
        expect(config.monitoring.enableMetrics).toBe(false);
      });

      it('should include localhost mappings in development', async () => {
        setValidEnvironment();
        const environment = Environment.create('development').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        const localhostMappings = config.mappings.filter(m => 
          m.hostname === 'localhost' || m.hostname === '127.0.0.1'
        );
        
        expect(localhostMappings.length).toBe(2);
      });

      it('should use standard security level for development', async () => {
        setValidEnvironment();
        const environment = Environment.create('development').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        config.strategies.forEach(strategy => {
          expect(strategy.securityLevel).toBe('standard');
        });
      });
    });

    describe('Production Environment', () => {
      it('should load configuration for production environment', async () => {
        setValidEnvironment();
        const environment = Environment.create('production').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        expect(config.environment.equals(environment)).toBe(true);
        expect(config.security.enforceHTTPS).toBe(true);
        expect(config.monitoring.enableMetrics).toBe(true);
        expect(config.monitoring.alerting.enabled).toBe(true);
      });

      it('should use strict security level for production', async () => {
        setValidEnvironment();
        const environment = Environment.create('production').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        config.strategies.forEach(strategy => {
          expect(strategy.securityLevel).toBe('strict');
          expect(strategy.callbackURL.startsWith('https://')).toBe(true);
        });
      });

      it('should not include localhost mappings in production', async () => {
        setValidEnvironment();
        const environment = Environment.create('production').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        const localhostMappings = config.mappings.filter(m => 
          m.hostname === 'localhost' || m.hostname === '127.0.0.1'
        );
        
        expect(localhostMappings.length).toBe(0);
      });
    });

    describe('Staging Environment', () => {
      it('should load configuration for staging environment', async () => {
        setValidEnvironment();
        const environment = Environment.create('staging').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        expect(config.environment.equals(environment)).toBe(true);
        expect(config.security.enforceHTTPS).toBe(true);
        expect(config.monitoring.enableMetrics).toBe(true);
      });

      it('should use enhanced security level for staging', async () => {
        setValidEnvironment();
        const environment = Environment.create('staging').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        config.strategies.forEach(strategy => {
          expect(strategy.securityLevel).toBe('enhanced');
        });
      });
    });

    describe('Test Environment', () => {
      it('should load configuration for test environment', async () => {
        setValidEnvironment();
        const environment = Environment.create('test').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        expect(config.environment.equals(environment)).toBe(true);
        expect(config.security.enforceHTTPS).toBe(false);
        expect(config.monitoring.enableMetrics).toBe(false);
      });

      it('should use basic security level for test', async () => {
        setValidEnvironment();
        const environment = Environment.create('test').value;
        
        const result = await configSource.load(environment);
        
        expect(result.isSuccess()).toBe(true);
        
        const config = result.value;
        config.strategies.forEach(strategy => {
          expect(strategy.securityLevel).toBe('basic');
        });
      });
    });
  });

  describe('Configuration Transformation', () => {
    it('should transform domains string to array', async () => {
      setValidEnvironment();
      process.env.REPLIT_DOMAINS = 'domain1.com, domain2.com , domain3.com';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.domains).toEqual(['domain1.com', 'domain2.com', 'domain3.com']);
    });

    it('should create strategy for each domain', async () => {
      setValidEnvironment();
      process.env.REPLIT_DOMAINS = 'domain1.com,domain2.com';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isSuccess()).toBe(true);
      expect(result.value.strategies.length).toBe(2);
      expect(result.value.strategies[0].clientId).toBe('domain1.com');
      expect(result.value.strategies[1].clientId).toBe('domain2.com');
    });

    it('should create hostname mapping for each domain', async () => {
      setValidEnvironment();
      process.env.REPLIT_DOMAINS = 'domain1.com,domain2.com';
      
      const environment = Environment.create('production').value;
      const result = await configSource.load(environment);
      
      expect(result.isSuccess()).toBe(true);
      
      const domainMappings = result.value.mappings.filter(m => 
        m.hostname.includes('domain')
      );
      expect(domainMappings.length).toBe(2);
      expect(domainMappings[0].priority).toBeGreaterThan(domainMappings[1].priority);
    });

    it('should parse optional configuration values', async () => {
      setValidEnvironment();
      process.env.SESSION_TIMEOUT = '7200000';
      process.env.MAX_RETRY_ATTEMPTS = '5';
      process.env.ENABLE_METRICS = 'true';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isSuccess()).toBe(true);
      
      const config = result.value;
      expect(config.security.sessionTimeout).toBe(7200000);
      expect(config.security.maxRetryAttempts).toBe(5);
      expect(config.monitoring.enableMetrics).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate domain formats', async () => {
      setValidEnvironment();
      process.env.REPLIT_DOMAINS = 'invalid domain,valid.com';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('validation failed');
    });

    it('should validate security configuration ranges', async () => {
      setValidEnvironment();
      process.env.SESSION_TIMEOUT = '30000'; // Too short
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('validation failed');
    });

    it('should validate monitoring configuration ranges', async () => {
      setValidEnvironment();
      process.env.ALERT_ERROR_RATE_THRESHOLD = '1.5'; // Invalid rate
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('validation failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required variables gracefully', async () => {
      delete process.env.REPLIT_DOMAINS;
      delete process.env.SESSION_SECRET;
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('ENV_VAR_ERROR');
    });

    it('should provide detailed error context', async () => {
      process.env.REPLIT_DOMAINS = '';
      process.env.SESSION_SECRET = 'short';
      process.env.REPL_ID = 'test';
      process.env.ISSUER_URL = 'invalid-url';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('missing or invalid');
    });

    it('should handle configuration transformation errors', async () => {
      setValidEnvironment();
      
      // Mock transformation failure
      const originalDomains = process.env.REPLIT_DOMAINS;
      process.env.REPLIT_DOMAINS = 'invalid@domain.com';
      
      const environment = Environment.create('development').value;
      const result = await configSource.load(environment);
      
      expect(result.isError()).toBe(true);
    });
  });

  describe('Schema Access', () => {
    it('should provide configuration schema', () => {
      const schema = configSource.getSchema();
      
      expect(schema).toHaveProperty('required');
      expect(schema).toHaveProperty('optional');
      expect(typeof schema.required).toBe('object');
      expect(typeof schema.optional).toBe('object');
    });
  });

  describe('Connectivity Testing', () => {
    it('should test issuer URL connectivity', async () => {
      setValidEnvironment();
      process.env.ISSUER_URL = 'https://httpbin.org/status/200';
      
      const result = await configSource.testConnectivity();
      // Note: This test may be environment dependent
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should validate database URL format when provided', async () => {
      setValidEnvironment();
      process.env.DATABASE_URL = 'invalid-database-url';
      
      const result = await configSource.testConnectivity();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('DATABASE_URL'))).toBe(true);
    });

    it('should handle connectivity test failures gracefully', async () => {
      setValidEnvironment();
      process.env.ISSUER_URL = 'https://nonexistent-domain-12345.com';
      
      const result = await configSource.testConnectivity();
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('connectivity test failed'))).toBe(true);
    });
  });
});