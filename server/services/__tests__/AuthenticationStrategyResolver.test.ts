/**
 * Authentication Strategy Resolver Test Suite - Enterprise AOP Implementation
 * Complete unit tests for hostname-to-strategy resolution strategies
 */

import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import {
  ExactHostnameResolutionStrategy,
  DomainBasedResolutionStrategy,
  DevelopmentFallbackResolutionStrategy,
  StrategyResolutionRequest,
  StrategyResolutionResult,
  StrategyResolutionError,
  ResolutionConfidence
} from '../AuthenticationStrategyResolver';
import { Environment } from '../../domain/Environment';
import { Hostname } from '../../domain/Hostname';
import { StrategyName } from '../../domain/StrategyName';
import { AuthenticationStrategy } from '../../domain/AuthenticationStrategy';
import { AuthenticationDomain } from '../../domain/AuthenticationDomain';
import { AuthenticationConfiguration } from '../../config/ConfigurationSource';

// Mock implementations
class MockAuthenticationStrategy {
  private name: StrategyName;
  private environment: Environment;
  private canAuthenticateResult: boolean;

  constructor(name: string, environment: string, canAuthenticate: boolean = true) {
    const nameResult = StrategyName.create(name);
    if (nameResult.isError()) throw new Error(`Invalid strategy name: ${name}`);
    this.name = nameResult.value;

    const envResult = Environment.create(environment);
    if (envResult.isError()) throw new Error(`Invalid environment: ${environment}`);
    this.environment = envResult.value;

    this.canAuthenticateResult = canAuthenticate;
  }

  getName(): StrategyName {
    return this.name;
  }

  getEnvironment(): Environment {
    return this.environment;
  }

  getConfiguration() {
    return {
      securityLevel: 'enhanced' as const,
      callbackURL: 'https://example.com/callback'
    };
  }

  async canAuthenticate(hostname: Hostname): Promise<any> {
    return {
      canAuthenticate: () => this.canAuthenticateResult,
      getRestrictions: () => []
    };
  }
}

describe('Authentication Strategy Resolvers', () => {
  let sampleRequest: StrategyResolutionRequest;
  let sampleConfiguration: AuthenticationConfiguration;
  let sampleDomain: AuthenticationDomain;
  let mockStrategy: MockAuthenticationStrategy;

  beforeEach(async () => {
    sampleRequest = {
      hostname: 'test.example.com',
      environment: 'development',
      userAgent: 'test-agent',
      sourceIP: '127.0.0.1',
      requestId: 'test-request-123',
      timestamp: new Date(),
      additionalContext: { test: true }
    };

    mockStrategy = new MockAuthenticationStrategy('replitauth:test', 'development');

    // Create mock configuration
    const environment = Environment.create('development');
    if (environment.isError()) throw new Error('Failed to create environment');

    sampleConfiguration = {
      environment: environment.value,
      domains: ['example.com'],
      strategies: [],
      mappings: [{
        hostname: 'test.example.com',
        strategyName: 'replitauth:test',
        environment: 'development',
        priority: 100,
        metadata: {}
      }],
      security: {
        enforceHTTPS: false,
        corsEnabled: true,
        csrfProtection: false,
        allowedOrigins: ['*'],
        trustedProxies: []
      },
      monitoring: {
        enableMetrics: true,
        logLevel: 'info',
        alerting: {
          enabled: false,
          channels: []
        }
      }
    };

    // Create mock domain with strategy
    const domainResult = await AuthenticationDomain.create(
      environment.value,
      ['example.com'],
      [mockStrategy as any]
    );
    if (domainResult.isError()) throw new Error('Failed to create domain');
    sampleDomain = domainResult.value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ExactHostnameResolutionStrategy', () => {
    let strategy: ExactHostnameResolutionStrategy;

    beforeEach(() => {
      strategy = new ExactHostnameResolutionStrategy();
    });

    it('should have correct metadata', () => {
      expect(strategy.name).toBe('exact-hostname');
      expect(strategy.priority).toBe(100);
      expect(strategy.supportsEnvironment(Environment.create('development').value)).toBe(true);
      expect(strategy.supportsEnvironment(Environment.create('production').value)).toBe(true);
    });

    it('should resolve exact hostname match successfully', async () => {
      const result = await strategy.resolve(sampleRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.EXACT_MATCH);
      expect(resolution.strategy).toBeDefined();
      expect(resolution.matchedMapping).toBeDefined();
      expect(resolution.resolutionPath.length).toBeGreaterThan(0);
    });

    it('should return no match for unmatched hostname', async () => {
      const unmatchedRequest = {
        ...sampleRequest,
        hostname: 'unmatched.example.com'
      };

      const result = await strategy.resolve(unmatchedRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.NO_MATCH);
      expect(resolution.strategy).toBeNull();
      expect(resolution.warnings.length).toBeGreaterThan(0);
    });

    it('should handle invalid hostname gracefully', async () => {
      const invalidRequest = {
        ...sampleRequest,
        hostname: 'invalid..hostname'
      };

      const result = await strategy.resolve(invalidRequest, sampleConfiguration, sampleDomain);

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('HOSTNAME_VALIDATION_ERROR');
    });

    it('should handle missing strategy gracefully', async () => {
      const configWithMissingStrategy = {
        ...sampleConfiguration,
        mappings: [{
          hostname: 'test.example.com',
          strategyName: 'replitauth:missing',
          environment: 'development',
          priority: 100,
          metadata: {}
        }]
      };

      const result = await strategy.resolve(sampleRequest, configWithMissingStrategy, sampleDomain);

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('STRATEGY_NOT_FOUND');
    });

    it('should track resolution path correctly', async () => {
      const result = await strategy.resolve(sampleRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.resolutionPath).toHaveLength(3); // exact-mapping-search, strategy-lookup, strategy-validation
      
      const steps = resolution.resolutionPath.map(step => step.step);
      expect(steps).toContain('exact-mapping-search');
      expect(steps).toContain('strategy-lookup');
      expect(steps).toContain('strategy-validation');
    });
  });

  describe('DomainBasedResolutionStrategy', () => {
    let strategy: DomainBasedResolutionStrategy;

    beforeEach(() => {
      strategy = new DomainBasedResolutionStrategy();
    });

    it('should have correct metadata', () => {
      expect(strategy.name).toBe('domain-based');
      expect(strategy.priority).toBe(80);
      expect(strategy.supportsEnvironment(Environment.create('production').value)).toBe(true);
      expect(strategy.supportsEnvironment(Environment.create('development').value)).toBe(false); // Skips development
    });

    it('should resolve domain-based match successfully', async () => {
      const productionRequest = {
        ...sampleRequest,
        environment: 'production',
        hostname: 'api.example.com'
      };

      const productionConfig = {
        ...sampleConfiguration,
        mappings: [{
          hostname: 'api.example.com',
          strategyName: 'replitauth:test',
          environment: 'production',
          priority: 100,
          metadata: {}
        }]
      };

      // Create production environment
      const prodEnv = Environment.create('production');
      if (prodEnv.isError()) throw new Error('Failed to create production environment');

      const prodDomain = await AuthenticationDomain.create(
        prodEnv.value,
        ['example.com'],
        [new MockAuthenticationStrategy('replitauth:test', 'production') as any]
      );
      if (prodDomain.isError()) throw new Error('Failed to create production domain');

      const result = await strategy.resolve(productionRequest, productionConfig, prodDomain.value);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.DOMAIN_MATCH);
      expect(resolution.strategy).toBeDefined();
    });

    it('should return no match when no domain mappings exist', async () => {
      const productionRequest = {
        ...sampleRequest,
        environment: 'production',
        hostname: 'unmapped.different.com'
      };

      const emptyConfig = {
        ...sampleConfiguration,
        mappings: []
      };

      const prodEnv = Environment.create('production');
      if (prodEnv.isError()) throw new Error('Failed to create production environment');

      const prodDomain = await AuthenticationDomain.create(
        prodEnv.value,
        ['example.com'],
        []
      );
      if (prodDomain.isError()) throw new Error('Failed to create production domain');

      const result = await strategy.resolve(productionRequest, emptyConfig, prodDomain.value);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.NO_MATCH);
      expect(resolution.strategy).toBeNull();
    });

    it('should handle invalid hostname gracefully', async () => {
      const invalidRequest = {
        ...sampleRequest,
        environment: 'production',
        hostname: 'invalid..hostname'
      };

      const result = await strategy.resolve(invalidRequest, sampleConfiguration, sampleDomain);

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('HOSTNAME_VALIDATION_ERROR');
    });

    it('should track resolution path correctly', async () => {
      const productionRequest = {
        ...sampleRequest,
        environment: 'production',
        hostname: 'api.example.com'
      };

      const productionConfig = {
        ...sampleConfiguration,
        mappings: [{
          hostname: 'api.example.com',
          strategyName: 'replitauth:test',
          environment: 'production',
          priority: 100,
          metadata: {}
        }]
      };

      const prodEnv = Environment.create('production');
      if (prodEnv.isError()) throw new Error('Failed to create production environment');

      const prodDomain = await AuthenticationDomain.create(
        prodEnv.value,
        ['example.com'],
        [new MockAuthenticationStrategy('replitauth:test', 'production') as any]
      );
      if (prodDomain.isError()) throw new Error('Failed to create production domain');

      const result = await strategy.resolve(productionRequest, productionConfig, prodDomain.value);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.resolutionPath.length).toBeGreaterThan(0);
      
      const steps = resolution.resolutionPath.map(step => step.step);
      expect(steps).toContain('root-domain-extraction');
      expect(steps).toContain('domain-mapping-search');
    });
  });

  describe('DevelopmentFallbackResolutionStrategy', () => {
    let strategy: DevelopmentFallbackResolutionStrategy;

    beforeEach(() => {
      strategy = new DevelopmentFallbackResolutionStrategy();
    });

    it('should have correct metadata', () => {
      expect(strategy.name).toBe('development-fallback');
      expect(strategy.priority).toBe(60);
      expect(strategy.supportsEnvironment(Environment.create('development').value)).toBe(true);
      expect(strategy.supportsEnvironment(Environment.create('production').value)).toBe(false);
    });

    it('should resolve development hostname successfully', async () => {
      const localhostRequest = {
        ...sampleRequest,
        hostname: 'localhost'
      };

      const result = await strategy.resolve(localhostRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.DEVELOPMENT_MATCH);
      expect(resolution.strategy).toBeDefined();
      expect(resolution.warnings.length).toBeGreaterThan(0);
      expect(resolution.warnings[0].code).toBe('DEVELOPMENT_FALLBACK_USED');
    });

    it('should return no match for non-development hostname', async () => {
      const prodRequest = {
        ...sampleRequest,
        hostname: 'production.example.com'
      };

      const result = await strategy.resolve(prodRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.NO_MATCH);
      expect(resolution.strategy).toBeNull();
    });

    it('should handle missing development mappings', async () => {
      const emptyConfig = {
        ...sampleConfiguration,
        mappings: []
      };

      const localhostRequest = {
        ...sampleRequest,
        hostname: 'localhost'
      };

      const result = await strategy.resolve(localhostRequest, emptyConfig, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.NO_MATCH);
      expect(resolution.strategy).toBeNull();
      expect(resolution.warnings[0].code).toBe('NO_DEVELOPMENT_FALLBACK');
    });

    it('should track resolution path correctly', async () => {
      const localhostRequest = {
        ...sampleRequest,
        hostname: 'localhost'
      };

      const result = await strategy.resolve(localhostRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.resolutionPath.length).toBeGreaterThan(0);
      
      const steps = resolution.resolutionPath.map(step => step.step);
      expect(steps).toContain('development-hostname-check');
      expect(steps).toContain('development-mapping-search');
    });

    it('should select highest priority mapping', async () => {
      const multiMappingConfig = {
        ...sampleConfiguration,
        mappings: [
          {
            hostname: 'test1.example.com',
            strategyName: 'replitauth:test',
            environment: 'development',
            priority: 50,
            metadata: {}
          },
          {
            hostname: 'test2.example.com',
            strategyName: 'replitauth:test',
            environment: 'development',
            priority: 100,
            metadata: {}
          }
        ]
      };

      const localhostRequest = {
        ...sampleRequest,
        hostname: 'localhost'
      };

      const result = await strategy.resolve(localhostRequest, multiMappingConfig, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.confidence).toBe(ResolutionConfidence.DEVELOPMENT_MATCH);
      expect(resolution.matchedMapping?.priority).toBe(100);
    });
  });

  describe('Error Handling', () => {
    let strategy: ExactHostnameResolutionStrategy;

    beforeEach(() => {
      strategy = new ExactHostnameResolutionStrategy();
    });

    it('should handle strategy resolution errors', async () => {
      const errorDomain = {
        getStrategies: () => {
          throw new Error('Domain error');
        }
      } as any;

      const result = await strategy.resolve(sampleRequest, sampleConfiguration, errorDomain);

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('EXACT_RESOLUTION_ERROR');
    });

    it('should handle invalid strategy names', async () => {
      const configWithInvalidStrategy = {
        ...sampleConfiguration,
        mappings: [{
          hostname: 'test.example.com',
          strategyName: 'invalid:strategy:name:format',
          environment: 'development',
          priority: 100,
          metadata: {}
        }]
      };

      const result = await strategy.resolve(sampleRequest, configWithInvalidStrategy, sampleDomain);

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('INVALID_STRATEGY_NAME');
    });
  });

  describe('Resolution Metadata', () => {
    let strategy: ExactHostnameResolutionStrategy;

    beforeEach(() => {
      strategy = new ExactHostnameResolutionStrategy();
    });

    it('should include comprehensive metadata', async () => {
      const result = await strategy.resolve(sampleRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      expect(resolution.metadata).toBeDefined();
      expect(resolution.metadata.totalDuration).toBeGreaterThan(0);
      expect(resolution.metadata.cacheHit).toBe(false);
      expect(resolution.metadata.environmentType).toBe('development');
      expect(resolution.metadata.resolutionTimestamp).toBeInstanceOf(Date);
    });

    it('should track resolution steps with timing', async () => {
      const result = await strategy.resolve(sampleRequest, sampleConfiguration, sampleDomain);

      expect(result.isSuccess()).toBe(true);
      const resolution = result.value;
      
      for (const step of resolution.resolutionPath) {
        expect(step.step).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.duration).toBeGreaterThanOrEqual(0);
        expect(typeof step.success).toBe('boolean');
      }
    });
  });
});