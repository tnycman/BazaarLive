/**
 * Strategy Resolver Service Test Suite - Enterprise AOP Implementation
 * Complete unit tests for authentication strategy resolution
 */

import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { 
  StrategyResolverService,
  StrategyResolverConfiguration,
  ServiceHealthStatus,
  ResolutionStatistics
} from '../StrategyResolverService';
import {
  StrategyResolutionRequest,
  StrategyResolutionResult,
  StrategyResolutionError,
  ResolutionConfidence,
  IResolutionStrategy,
  IResolutionCache,
  IResolutionAspect
} from '../AuthenticationStrategyResolver';
import { Environment } from '../../domain/Environment';
import { Hostname } from '../../domain/Hostname';
import { StrategyName } from '../../domain/StrategyName';
import { AuthenticationStrategy } from '../../domain/AuthenticationStrategy';
import { AuthenticationDomain } from '../../domain/AuthenticationDomain';
import { AuthenticationConfiguration } from '../../config/ConfigurationSource';

// Mock implementations
class MockResolutionStrategy implements IResolutionStrategy {
  readonly name: string;
  readonly priority: number;
  private resolveResult: any;

  constructor(name: string, priority: number, resolveResult?: any) {
    this.name = name;
    this.priority = priority;
    this.resolveResult = resolveResult;
  }

  supportsEnvironment(environment: Environment): boolean {
    return true;
  }

  async resolve(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<any> {
    if (this.resolveResult) {
      return this.resolveResult;
    }
    
    return {
      isSuccess: () => true,
      value: {
        strategy: null,
        confidence: ResolutionConfidence.NO_MATCH,
        matchedMapping: null,
        alternativeStrategies: [],
        resolutionPath: [],
        warnings: [],
        metadata: {
          totalDuration: 100,
          cacheHit: false,
          strategyCount: 0,
          mappingCount: 0,
          environmentType: request.environment,
          resolutionTimestamp: new Date()
        }
      }
    };
  }
}

class MockResolutionCache implements IResolutionCache {
  private cache: Map<string, StrategyResolutionResult> = new Map();
  private stats = { hits: 0, misses: 0, size: 0, hitRate: 0 };

  async get(key: string): Promise<StrategyResolutionResult | null> {
    const result = this.cache.get(key) || null;
    if (result) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    this.updateHitRate();
    return result;
  }

  async set(key: string, result: StrategyResolutionResult, ttlSeconds?: number): Promise<void> {
    this.cache.set(key, result);
    this.stats.size = this.cache.size;
  }

  async invalidate(pattern: string): Promise<void> {
    if (pattern === '*') {
      this.cache.clear();
      this.stats.size = 0;
    } else {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
      this.stats.size = this.cache.size;
    }
  }

  async getStats(): Promise<{ hits: number; misses: number; size: number; hitRate: number }> {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

class MockResolutionAspect implements IResolutionAspect {
  public calls: string[] = [];

  async beforeResolution(request: StrategyResolutionRequest): Promise<void> {
    this.calls.push('beforeResolution');
  }

  async afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void> {
    this.calls.push('afterResolution');
  }

  async onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void> {
    this.calls.push('onResolutionError');
  }

  async beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void> {
    this.calls.push('beforeStrategyValidation');
  }

  async afterStrategyValidation(strategy: AuthenticationStrategy, validation: any): Promise<void> {
    this.calls.push('afterStrategyValidation');
  }
}

describe('StrategyResolverService', () => {
  let service: StrategyResolverService;
  let mockCache: MockResolutionCache;
  let mockAspect: MockResolutionAspect;
  let mockStrategy: MockResolutionStrategy;
  let sampleRequest: StrategyResolutionRequest;
  let sampleConfiguration: AuthenticationConfiguration;
  let sampleDomain: AuthenticationDomain;

  beforeEach(async () => {
    mockCache = new MockResolutionCache();
    mockAspect = new MockResolutionAspect();
    mockStrategy = new MockResolutionStrategy('test-strategy', 100);
    
    sampleRequest = {
      hostname: 'test.example.com',
      environment: 'development',
      userAgent: 'test-agent',
      sourceIP: '127.0.0.1',
      requestId: 'test-request-123',
      timestamp: new Date(),
      additionalContext: { test: true }
    };

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

    // Create mock domain
    const domainResult = await AuthenticationDomain.create(
      environment.value,
      ['example.com'],
      []
    );
    if (domainResult.isError()) throw new Error('Failed to create domain');
    sampleDomain = domainResult.value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should create service with default configuration', async () => {
      const result = await StrategyResolverService.create();
      
      expect(result.isSuccess()).toBe(true);
      const service = result.value;
      expect(service).toBeInstanceOf(StrategyResolverService);
    });

    it('should create service with custom configuration', async () => {
      const config: Partial<StrategyResolverConfiguration> = {
        enableCaching: false,
        resolutionTimeout: 10000,
        maxConcurrentResolutions: 50
      };

      const result = await StrategyResolverService.create(
        config,
        [mockStrategy],
        [mockAspect],
        mockCache
      );

      expect(result.isSuccess()).toBe(true);
      const service = result.value;
      expect(service).toBeInstanceOf(StrategyResolverService);
    });

    it('should reject invalid configuration', async () => {
      const config: Partial<StrategyResolverConfiguration> = {
        resolutionTimeout: 100 // Too low
      };

      const result = await StrategyResolverService.create(config);
      
      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('INVALID_TIMEOUT_ERROR');
    });

    it('should reject service with no strategies', async () => {
      const result = await StrategyResolverService.create({}, []);
      
      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('NO_STRATEGIES_ERROR');
    });
  });

  describe('Strategy Resolution', () => {
    beforeEach(async () => {
      const result = await StrategyResolverService.create(
        {},
        [mockStrategy],
        [mockAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      service = result.value;
    });

    it('should resolve strategy successfully', async () => {
      const result = await service.resolveStrategy(
        sampleRequest,
        sampleConfiguration,
        sampleDomain
      );

      expect(result.isSuccess()).toBe(true);
      expect(mockAspect.calls).toContain('beforeResolution');
      expect(mockAspect.calls).toContain('afterResolution');
    });

    it('should handle resolution error gracefully', async () => {
      const errorStrategy = new MockResolutionStrategy('error-strategy', 100, {
        isSuccess: () => false,
        error: new StrategyResolutionError('Test error', 'TEST_ERROR')
      });

      const result = await StrategyResolverService.create(
        {},
        [errorStrategy],
        [mockAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      
      const errorService = result.value;
      const resolutionResult = await errorService.resolveStrategy(
        sampleRequest,
        sampleConfiguration,
        sampleDomain
      );

      expect(resolutionResult.isSuccess()).toBe(true); // Service handles errors gracefully
      expect(mockAspect.calls).toContain('beforeResolution');
    });

    it('should use cache when available', async () => {
      // First call - cache miss
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      // Second call - should hit cache
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      const stats = await mockCache.getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('should handle invalid environment', async () => {
      const invalidRequest = {
        ...sampleRequest,
        environment: 'invalid-env'
      };

      const result = await service.resolveStrategy(
        invalidRequest,
        sampleConfiguration,
        sampleDomain
      );

      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('INVALID_ENVIRONMENT');
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      const result = await StrategyResolverService.create(
        {},
        [mockStrategy],
        [mockAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      service = result.value;
    });

    it('should return health status', async () => {
      const health = await service.getHealthStatus();
      
      expect(health).toBeDefined();
      expect(health.isHealthy).toBe(true);
      expect(health.resolutionStrategiesCount).toBeGreaterThan(0);
      expect(health.cacheStatus).toBeDefined();
      expect(health.performanceMetrics).toBeDefined();
      expect(health.lastHealthCheck).toBeInstanceOf(Date);
    });

    it('should track performance metrics', async () => {
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      const stats = service.getStatistics();
      expect(stats.totalResolutions).toBe(1);
      expect(stats.averageResolutionTime).toBeGreaterThan(0);
    });

    it('should handle cache operations', async () => {
      await service.clearCache();
      
      const stats = await mockCache.getStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Statistics Tracking', () => {
    beforeEach(async () => {
      const result = await StrategyResolverService.create(
        {},
        [mockStrategy],
        [mockAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      service = result.value;
    });

    it('should track resolution statistics', async () => {
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      const stats = service.getStatistics();
      expect(stats.totalResolutions).toBe(1);
      expect(stats.resolutionsByEnvironment['development']).toBe(1);
      expect(stats.period.start).toBeInstanceOf(Date);
      expect(stats.period.end).toBeInstanceOf(Date);
    });

    it('should update statistics on multiple resolutions', async () => {
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      const stats = service.getStatistics();
      expect(stats.totalResolutions).toBe(2);
    });
  });

  describe('Aspect Integration', () => {
    beforeEach(async () => {
      const result = await StrategyResolverService.create(
        {},
        [mockStrategy],
        [mockAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      service = result.value;
    });

    it('should execute aspects in correct order', async () => {
      await service.resolveStrategy(sampleRequest, sampleConfiguration, sampleDomain);
      
      expect(mockAspect.calls).toEqual(['beforeResolution', 'afterResolution']);
    });

    it('should handle aspect errors gracefully', async () => {
      const errorAspect = new MockResolutionAspect();
      errorAspect.beforeResolution = jest.fn().mockRejectedValue(new Error('Aspect error'));
      
      const result = await StrategyResolverService.create(
        {},
        [mockStrategy],
        [errorAspect],
        mockCache
      );
      if (result.isError()) throw new Error('Failed to create service');
      
      const errorService = result.value;
      const resolutionResult = await errorService.resolveStrategy(
        sampleRequest,
        sampleConfiguration,
        sampleDomain
      );

      expect(resolutionResult.isSuccess()).toBe(true); // Should handle aspect errors gracefully
    });
  });

  describe('Configuration Validation', () => {
    it('should validate cache timeout', async () => {
      const config: Partial<StrategyResolverConfiguration> = {
        enableCaching: true,
        cacheTimeout: 30 // Too low
      };

      const result = await StrategyResolverService.create(config);
      
      expect(result.isError()).toBe(true);
      expect(result.error.code).toBe('INVALID_CACHE_TIMEOUT_ERROR');
    });

    it('should accept valid timeout values', async () => {
      const config: Partial<StrategyResolverConfiguration> = {
        resolutionTimeout: 5000,
        cacheTimeout: 300
      };

      const result = await StrategyResolverService.create(config, [mockStrategy]);
      
      expect(result.isSuccess()).toBe(true);
    });
  });
});