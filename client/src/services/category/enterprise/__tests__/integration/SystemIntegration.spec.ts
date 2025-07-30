/**
 * SystemIntegration Unit Tests
 * Comprehensive test suite for SystemIntegration orchestration layer
 */

import { SystemIntegration, SystemIntegrationConfig, SystemHealth } from '../../integration/SystemIntegration';
import { ConfigurationRepository } from '../../repositories/ConfigurationRepository';
import { ConfigurationKey } from '../../domain/ConfigurationValueObjects';
import { UniversalPageConfiguration } from '../../domain/ConfigurationEntities';
import { ConfigurationError, ConfigurationNotFoundError, ConfigurationValidationError } from '../../errors/ConfigurationErrors';
import { Result, ok, err } from '../../patterns/Result';

// Mock repository implementation
class MockConfigurationRepository implements ConfigurationRepository {
  private mockConfigs: Map<string, any> = new Map([
    ['fashion-women', { 
      key: 'fashion-women', 
      category: 'women', 
      metadata: { title: 'Women\'s Fashion' }, 
      filters: [], 
      isActive: true 
    }],
    ['fashion-men', { 
      key: 'fashion-men', 
      category: 'men', 
      metadata: { title: 'Men\'s Fashion' }, 
      filters: [], 
      isActive: true 
    }]
  ]);

  async getConfiguration(key: ConfigurationKey): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
    const config = this.mockConfigs.get(key.toString());
    if (config) {
      return ok(config as UniversalPageConfiguration);
    }
    return err(new ConfigurationNotFoundError(`Configuration not found: ${key}`, key.toString()));
  }

  async getAllConfigurations(): Promise<Result<UniversalPageConfiguration[], ConfigurationError>> {
    const configs = Array.from(this.mockConfigs.values()) as UniversalPageConfiguration[];
    return ok(configs);
  }

  async saveConfiguration(key: ConfigurationKey, config: UniversalPageConfiguration): Promise<Result<void, ConfigurationError>> {
    this.mockConfigs.set(key.toString(), config);
    return ok(undefined);
  }

  async deleteConfiguration(key: ConfigurationKey): Promise<Result<void, ConfigurationError>> {
    const deleted = this.mockConfigs.delete(key.toString());
    if (deleted) {
      return ok(undefined);
    }
    return err(new ConfigurationNotFoundError(`Configuration not found: ${key}`, key.toString()));
  }

  async existsConfiguration(key: ConfigurationKey): Promise<Result<boolean, ConfigurationError>> {
    return ok(this.mockConfigs.has(key.toString()));
  }

  async getHealthStatus(): Promise<any> {
    return {
      isHealthy: true,
      totalConfigurations: this.mockConfigs.size,
      cacheHitRate: 0.85,
      averageLoadTime: 25,
      lastError: undefined
    };
  }

  getAvailableKeys(): string[] {
    return Array.from(this.mockConfigs.keys());
  }

  registerLoader(key: string, loader: () => Promise<any>): void {
    // Mock implementation
  }

  fetch(key: string): Promise<any> {
    const config = this.mockConfigs.get(key);
    if (config) {
      return Promise.resolve(config);
    }
    return Promise.reject(new Error(`Configuration not found: ${key}`));
  }
}

// Mock validation orchestrator
class MockValidationOrchestrator {
  async validateConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    transformedData?: any;
  }> {
    if (data && typeof data === 'object') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        transformedData: data
      };
    }
    return {
      isValid: false,
      errors: ['Invalid configuration data'],
      warnings: []
    };
  }

  async validatePartialConfiguration(data: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

describe('SystemIntegration', () => {
  let mockRepository: MockConfigurationRepository;
  let mockOrchestrator: MockValidationOrchestrator;
  let systemIntegration: SystemIntegration;

  beforeEach(() => {
    mockRepository = new MockConfigurationRepository();
    mockOrchestrator = new MockValidationOrchestrator();
    systemIntegration = new SystemIntegration(
      mockRepository,
      mockOrchestrator,
      { enableDebug: false }
    );
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const integration = new SystemIntegration(mockRepository, mockOrchestrator);
      const metrics = integration.getMetrics();
      
      expect(metrics.requestCount).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });

    it('should initialize with custom configuration', () => {
      const config: SystemIntegrationConfig = {
        enableMetrics: true,
        cacheTtlMs: 60000,
        timeoutMs: 5000,
        enableDebug: true
      };
      
      const integration = new SystemIntegration(mockRepository, mockOrchestrator, config);
      expect(integration).toBeDefined();
    });
  });

  describe('getConfiguration', () => {
    it('should return successful Result for existing configuration', async () => {
      const result = await systemIntegration.getConfiguration('fashion-women');
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.key).toBe('fashion-women');
        expect(result.value.category).toBe('women');
      }
    });

    it('should return error Result for non-existent configuration', async () => {
      const result = await systemIntegration.getConfiguration('non-existent');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigurationError);
      }
    });

    it('should accept ConfigurationKey instance', async () => {
      const key = new ConfigurationKey('fashion-men');
      const result = await systemIntegration.getConfiguration(key);
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.key).toBe('fashion-men');
      }
    });

    it('should track metrics for successful requests', async () => {
      await systemIntegration.getConfiguration('fashion-women');
      const metrics = systemIntegration.getMetrics();
      
      expect(metrics.requestCount).toBe(1);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
    });

    it('should track metrics for failed requests', async () => {
      await systemIntegration.getConfiguration('non-existent');
      const metrics = systemIntegration.getMetrics();
      
      expect(metrics.requestCount).toBe(1);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(1);
    });
  });

  describe('listAvailableKeys', () => {
    it('should return list of configuration metadata', async () => {
      const result = await systemIntegration.listAvailableKeys();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].key).toBe('fashion-women');
        expect(result.value[1].key).toBe('fashion-men');
      }
    });

    it('should include metadata fields', async () => {
      const result = await systemIntegration.listAvailableKeys();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        const metadata = result.value[0];
        expect(metadata).toHaveProperty('key');
        expect(metadata).toHaveProperty('isActive');
        expect(metadata).toHaveProperty('title');
        expect(metadata).toHaveProperty('sizeBytes');
      }
    });
  });

  describe('reloadConfiguration', () => {
    it('should reload existing configuration', async () => {
      const result = await systemIntegration.reloadConfiguration('fashion-women');
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.key).toBe('fashion-women');
      }
    });

    it('should return error for non-existent configuration', async () => {
      const result = await systemIntegration.reloadConfiguration('non-existent');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigurationError);
      }
    });
  });

  describe('validateConfiguration', () => {
    it('should validate valid configuration data', async () => {
      const configData = {
        key: 'test',
        category: 'test',
        metadata: { title: 'Test' },
        filters: [],
        isActive: true
      };
      
      const result = await systemIntegration.validateConfiguration(configData);
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.key).toBe('test');
      }
    });

    it('should return error for invalid configuration data', async () => {
      const result = await systemIntegration.validateConfiguration(null);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigurationValidationError);
      }
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health information', async () => {
      const result = await systemIntegration.getSystemHealth();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        const health: SystemHealth = result.value;
        expect(health).toHaveProperty('isHealthy');
        expect(health).toHaveProperty('repositoryHealthy');
        expect(health).toHaveProperty('validationHealthy');
        expect(health).toHaveProperty('domainServiceHealthy');
        expect(health).toHaveProperty('totalConfigurations');
        expect(health).toHaveProperty('cacheMetrics');
        expect(health).toHaveProperty('uptimeMs');
      }
    });

    it('should include cache metrics', async () => {
      const result = await systemIntegration.getSystemHealth();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.cacheMetrics).toHaveProperty('hitRate');
        expect(result.value.cacheMetrics).toHaveProperty('averageLoadTime');
      }
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      const result = await systemIntegration.clearCache();
      
      expect(result.ok).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = systemIntegration.getMetrics();
      
      expect(metrics.requestCount).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.successRate).toBe(1);
      expect(metrics.averageResponseTime).toBe(0);
      expect(typeof metrics.uptime).toBe('number');
    });

    it('should calculate metrics correctly after requests', async () => {
      await systemIntegration.getConfiguration('fashion-women');
      await systemIntegration.getConfiguration('non-existent');
      
      const metrics = systemIntegration.getMetrics();
      
      expect(metrics.requestCount).toBe(2);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.successRate).toBe(0.5);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Create a repository that throws errors
      const errorRepository = {
        ...mockRepository,
        async getConfiguration(): Promise<Result<UniversalPageConfiguration, ConfigurationError>> {
          throw new Error('Repository error');
        }
      } as ConfigurationRepository;
      
      const integration = new SystemIntegration(errorRepository, mockOrchestrator);
      const result = await integration.getConfiguration('test');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigurationError);
      }
    });

    it('should handle validation errors gracefully', async () => {
      const errorOrchestrator = {
        ...mockOrchestrator,
        async validateConfiguration() {
          throw new Error('Validation error');
        }
      };
      
      const integration = new SystemIntegration(mockRepository, errorOrchestrator);
      const result = await integration.validateConfiguration({});
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ConfigurationValidationError);
      }
    });
  });

  describe('smoke test integration', () => {
    it('should pass integration smoke test', async () => {
      const integration = new SystemIntegration(mockRepository, mockOrchestrator);
      const result = await integration.getConfiguration('fashion-women');
      
      expect(result.ok).toBe(true);
      if (!result.ok) {
        throw new Error('Expected success for existing key');
      }
      
      expect(result.value.key).toBe('fashion-women');
      expect(result.value.category).toBe('women');
    });

    it('should demonstrate Result pattern usage', async () => {
      const result = await systemIntegration.getConfiguration('fashion-women');
      
      // This demonstrates the Result pattern in action
      if (result.ok) {
        // TypeScript knows result.value is UniversalPageConfiguration
        console.log('Configuration loaded:', result.value.metadata?.title);
      } else {
        // TypeScript knows result.error is ConfigurationError
        console.error('Failed to load configuration:', result.error.message);
      }
      
      expect(result.ok).toBe(true);
    });
  });
});