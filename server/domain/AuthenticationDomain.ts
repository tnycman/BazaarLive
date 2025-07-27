/**
 * AuthenticationDomain Entity - Enterprise Implementation
 * Root aggregate for authentication domain with complete bootstrap logic
 */

import { ValidationError, Result } from './Hostname';
import { Hostname } from './Hostname';
import { StrategyName } from './StrategyName';
import { Environment, EnvironmentType } from './Environment';
import { 
  AuthenticationStrategy, 
  StrategyConfiguration,
  ValidationResult,
  AuthenticationContext,
  AuthenticationCapability
} from './AuthenticationStrategy';

// Domain Error Types
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ConfigurationError extends DomainError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

export class HostnameMappingError extends DomainError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'HOSTNAME_MAPPING_ERROR', context);
    this.name = 'HostnameMappingError';
  }
}

// Configuration Source Interface
export interface ConfigurationSource {
  load(environment: Environment): Promise<Result<AuthenticationConfiguration, ConfigurationError>>;
  validate(): Promise<ValidationResult>;
  getRequiredVariables(): string[];
}

// Authentication Configuration
export interface AuthenticationConfiguration {
  readonly environment: Environment;
  readonly domains: string[];
  readonly strategies: StrategyConfiguration[];
  readonly mappings: HostnameMappingConfiguration[];
  readonly security: SecurityConfiguration;
  readonly monitoring: MonitoringConfiguration;
}

export interface HostnameMappingConfiguration {
  readonly hostname: string;
  readonly strategyName: string;
  readonly environment: EnvironmentType;
  readonly priority: number;
}

export interface SecurityConfiguration {
  readonly enforceHTTPS: boolean;
  readonly allowedOrigins: string[];
  readonly sessionTimeout: number;
  readonly maxRetryAttempts: number;
  readonly rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface MonitoringConfiguration {
  readonly enableMetrics: boolean;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly alerting: {
    enabled: boolean;
    thresholds: {
      errorRate: number;
      responseTime: number;
    };
  };
}

// Hostname Mapping Registry
export class HostnameMappingRegistry {
  private readonly mappings: Map<string, HostnameMappingConfiguration> = new Map();
  private readonly prioritizedMappings: HostnameMappingConfiguration[] = [];

  private constructor(mappings: HostnameMappingConfiguration[]) {
    // Sort by priority (higher priority first)
    this.prioritizedMappings = mappings.sort((a, b) => b.priority - a.priority);
    
    // Create lookup map
    for (const mapping of mappings) {
      this.mappings.set(mapping.hostname.toLowerCase(), mapping);
    }
  }

  static async create(
    configuration: AuthenticationConfiguration
  ): Promise<Result<HostnameMappingRegistry, DomainError>> {
    try {
      // Validate all mappings
      const validationResults = await Promise.all(
        configuration.mappings.map(mapping => this.validateMapping(mapping))
      );

      const combinedValidation = ValidationResult.combine(validationResults);
      if (!combinedValidation.isValid) {
        return Result.error(new HostnameMappingError(
          `Mapping validation failed: ${combinedValidation.errors.map(e => e.message).join(', ')}`
        ));
      }

      return Result.ok(new HostnameMappingRegistry(configuration.mappings));
    } catch (error) {
      return Result.error(new HostnameMappingError(
        `Failed to create hostname mapping registry: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  private static async validateMapping(
    mapping: HostnameMappingConfiguration
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate hostname
    const hostnameResult = Hostname.create(mapping.hostname);
    if (hostnameResult.isError()) {
      errors.push(new ValidationError(`Invalid hostname in mapping: ${hostnameResult.error.message}`));
    }

    // Validate strategy name
    const strategyNameResult = StrategyName.create(mapping.strategyName);
    if (strategyNameResult.isError()) {
      errors.push(new ValidationError(`Invalid strategy name in mapping: ${strategyNameResult.error.message}`));
    }

    // Validate priority
    if (mapping.priority < 0 || mapping.priority > 100) {
      errors.push(new ValidationError('Mapping priority must be between 0 and 100'));
    }

    return errors.length > 0 
      ? ValidationResult.failure(errors)
      : ValidationResult.success();
  }

  async getStrategyForHostname(hostname: Hostname): Promise<Result<string, DomainError>> {
    const hostnameString = hostname.toString().toLowerCase();

    // Direct lookup first
    const directMapping = this.mappings.get(hostnameString);
    if (directMapping) {
      return Result.ok(directMapping.strategyName);
    }

    // Pattern matching for wildcards and subdomains
    for (const mapping of this.prioritizedMappings) {
      if (this.matchesPattern(hostnameString, mapping.hostname)) {
        return Result.ok(mapping.strategyName);
      }
    }

    return Result.error(new HostnameMappingError(
      `No strategy mapping found for hostname: ${hostnameString}`
    ));
  }

  private matchesPattern(hostname: string, pattern: string): boolean {
    // Support wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(hostname);
    }

    // Subdomain matching
    if (pattern.startsWith('.')) {
      return hostname.endsWith(pattern);
    }

    return hostname === pattern;
  }

  async isRegisteredDomain(hostname: Hostname): Promise<boolean> {
    const result = await this.getStrategyForHostname(hostname);
    return result.isSuccess();
  }

  async isDomainVerified(hostname: Hostname): Promise<boolean> {
    // In a real implementation, this would check domain verification status
    // For now, assume registered domains are verified
    return this.isRegisteredDomain(hostname);
  }

  getAllMappings(): HostnameMappingConfiguration[] {
    return [...this.prioritizedMappings];
  }
}

// Strategy Registry
export class StrategyRegistry {
  private readonly strategies: Map<string, AuthenticationStrategy> = new Map();
  private readonly fallbackStrategies: Map<EnvironmentType, AuthenticationStrategy[]> = new Map();

  private constructor() {}

  static async create(
    strategies: AuthenticationStrategy[]
  ): Promise<Result<StrategyRegistry, DomainError>> {
    try {
      const registry = new StrategyRegistry();
      
      for (const strategy of strategies) {
        registry.registerStrategy(strategy);
      }

      // Organize fallback strategies by environment
      await registry.organizeFallbackStrategies(strategies);

      return Result.ok(registry);
    } catch (error) {
      return Result.error(new DomainError(
        `Failed to create strategy registry: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STRATEGY_REGISTRY_ERROR'
      ));
    }
  }

  private registerStrategy(strategy: AuthenticationStrategy): void {
    const strategyName = strategy.getName().toString();
    this.strategies.set(strategyName, strategy);
  }

  private async organizeFallbackStrategies(strategies: AuthenticationStrategy[]): Promise<void> {
    for (const envType of Object.values(EnvironmentType)) {
      const envStrategies = strategies.filter(strategy => 
        strategy.getEnvironment().getType() === envType
      );
      this.fallbackStrategies.set(envType, envStrategies);
    }
  }

  getStrategy(strategyName: string): AuthenticationStrategy | undefined {
    return this.strategies.get(strategyName);
  }

  async getFallbackStrategies(environment: Environment): Promise<AuthenticationStrategy[]> {
    return this.fallbackStrategies.get(environment.getType()) || [];
  }

  getAllStrategies(): AuthenticationStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// Domain Registry
export class DomainRegistry {
  private readonly registeredDomains: Set<string> = new Set();
  private readonly verifiedDomains: Set<string> = new Set();

  private constructor(domains: string[]) {
    for (const domain of domains) {
      this.registeredDomains.add(domain.toLowerCase());
      // For now, assume all registered domains are verified
      this.verifiedDomains.add(domain.toLowerCase());
    }
  }

  static async create(configuration: AuthenticationConfiguration): Promise<DomainRegistry> {
    return new DomainRegistry(configuration.domains);
  }

  async isRegisteredDomain(hostname: Hostname): Promise<boolean> {
    const hostnameString = hostname.toString().toLowerCase();
    
    // Direct match
    if (this.registeredDomains.has(hostnameString)) {
      return true;
    }

    // Check if hostname is subdomain of registered domain
    for (const registeredDomain of this.registeredDomains) {
      if (hostnameString.endsWith('.' + registeredDomain)) {
        return true;
      }
    }

    return false;
  }

  async isDomainVerified(hostname: Hostname): Promise<boolean> {
    const hostnameString = hostname.toString().toLowerCase();
    return this.verifiedDomains.has(hostnameString);
  }

  getRegisteredDomains(): string[] {
    return [...this.registeredDomains];
  }
}

// Main Authentication Domain Aggregate Root
export class AuthenticationDomain {
  private constructor(
    private readonly strategies: StrategyRegistry,
    private readonly hostnameMappings: HostnameMappingRegistry,
    private readonly domainRegistry: DomainRegistry,
    private readonly environment: Environment,
    private readonly configuration: AuthenticationConfiguration
  ) {}

  /**
   * Bootstrap the entire authentication domain from configuration
   */
  static async bootstrap(
    configurationSource: ConfigurationSource
  ): Promise<Result<AuthenticationDomain, DomainError>> {
    try {
      // Detect environment
      const environmentResult = await Environment.detect();
      if (environmentResult.isError()) {
        return Result.error(new ConfigurationError(
          `Environment detection failed: ${environmentResult.error.message}`
        ));
      }

      const environment = environmentResult.value;

      // Validate configuration source
      const configValidation = await configurationSource.validate();
      if (!configValidation.isValid) {
        return Result.error(new ConfigurationError(
          `Configuration validation failed: ${configValidation.errors.map(e => e.message).join(', ')}`
        ));
      }

      // Load configuration
      const configResult = await configurationSource.load(environment);
      if (configResult.isError()) {
        return Result.error(configResult.error);
      }

      const configuration = configResult.value;

      // Create authentication strategies
      const strategiesResult = await this.createStrategies(configuration, environment);
      if (strategiesResult.isError()) {
        return Result.error(strategiesResult.error);
      }

      // Create strategy registry
      const strategyRegistryResult = await StrategyRegistry.create(strategiesResult.value);
      if (strategyRegistryResult.isError()) {
        return Result.error(strategyRegistryResult.error);
      }

      // Create hostname mapping registry
      const mappingRegistryResult = await HostnameMappingRegistry.create(configuration);
      if (mappingRegistryResult.isError()) {
        return Result.error(mappingRegistryResult.error);
      }

      // Create domain registry
      const domainRegistry = await DomainRegistry.create(configuration);

      return Result.ok(new AuthenticationDomain(
        strategyRegistryResult.value,
        mappingRegistryResult.value,
        domainRegistry,
        environment,
        configuration
      ));
    } catch (error) {
      return Result.error(new DomainError(
        `Domain bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BOOTSTRAP_ERROR'
      ));
    }
  }

  /**
   * Create authentication strategies from configuration
   */
  private static async createStrategies(
    configuration: AuthenticationConfiguration,
    environment: Environment
  ): Promise<Result<AuthenticationStrategy[], DomainError>> {
    try {
      const strategies: AuthenticationStrategy[] = [];

      for (const strategyConfig of configuration.strategies) {
        // Generate strategy name from configuration
        const strategyName = `replitauth:${strategyConfig.clientId}`;
        
        const strategyResult = await AuthenticationStrategy.create(
          strategyName,
          strategyConfig,
          environment
        );

        if (strategyResult.isError()) {
          return Result.error(new DomainError(
            `Failed to create strategy ${strategyName}: ${strategyResult.error.message}`,
            'STRATEGY_CREATION_ERROR'
          ));
        }

        strategies.push(strategyResult.value);
      }

      if (strategies.length === 0) {
        return Result.error(new DomainError(
          'No valid authentication strategies could be created',
          'NO_STRATEGIES_ERROR'
        ));
      }

      return Result.ok(strategies);
    } catch (error) {
      return Result.error(new DomainError(
        `Strategy creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STRATEGY_CREATION_ERROR'
      ));
    }
  }

  /**
   * Resolve strategy for hostname
   */
  async resolveStrategyForHostname(hostname: Hostname): Promise<Result<AuthenticationStrategy, DomainError>> {
    try {
      // Get strategy name from hostname mapping
      const strategyNameResult = await this.hostnameMappings.getStrategyForHostname(hostname);
      if (strategyNameResult.isError()) {
        return Result.error(strategyNameResult.error);
      }

      // Get strategy from registry
      const strategy = this.strategies.getStrategy(strategyNameResult.value);
      if (!strategy) {
        return Result.error(new DomainError(
          `Strategy not found in registry: ${strategyNameResult.value}`,
          'STRATEGY_NOT_FOUND'
        ));
      }

      // Verify strategy can handle hostname
      const capability = await strategy.canAuthenticate(hostname);
      if (!capability.canAuthenticate()) {
        return Result.error(new DomainError(
          `Strategy cannot authenticate hostname: ${capability.getRestrictions().join(', ')}`,
          'STRATEGY_CANNOT_AUTHENTICATE'
        ));
      }

      return Result.ok(strategy);
    } catch (error) {
      return Result.error(new DomainError(
        `Strategy resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STRATEGY_RESOLUTION_ERROR'
      ));
    }
  }

  /**
   * Get authentication capability for hostname
   */
  async getAuthenticationCapability(hostname: Hostname): Promise<AuthenticationCapability> {
    const strategyResult = await this.resolveStrategyForHostname(hostname);
    
    if (strategyResult.isError()) {
      // Return empty capability with error
      const strategyName = StrategyName.create('unknown:unknown').value;
      return new AuthenticationCapability(
        strategyName,
        hostname,
        ValidationResult.failure([new ValidationError(strategyResult.error.message)])
      );
    }

    return strategyResult.value.canAuthenticate(hostname);
  }

  /**
   * Validate authentication context
   */
  async validateAuthenticationContext(context: AuthenticationContext): Promise<ValidationResult> {
    const strategyResult = await this.resolveStrategyForHostname(context.hostname);
    
    if (strategyResult.isError()) {
      return ValidationResult.failure([
        new ValidationError(`Cannot resolve strategy: ${strategyResult.error.message}`)
      ]);
    }

    return strategyResult.value.validate(context);
  }

  // Getters
  getEnvironment(): Environment {
    return this.environment;
  }

  getConfiguration(): AuthenticationConfiguration {
    return { ...this.configuration };
  }

  getStrategies(): AuthenticationStrategy[] {
    return this.strategies.getAllStrategies();
  }

  getHostnameMappings(): HostnameMappingConfiguration[] {
    return this.hostnameMappings.getAllMappings();
  }

  getRegisteredDomains(): string[] {
    return this.domainRegistry.getRegisteredDomains();
  }

  /**
   * Health check for the authentication domain
   */
  async performHealthCheck(): Promise<{
    healthy: boolean;
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message?: string;
    }>;
  }> {
    const checks = [
      {
        name: 'environment_detection',
        status: 'pass' as const,
        message: `Environment: ${this.environment.toString()}`
      },
      {
        name: 'strategy_count',
        status: this.strategies.getAllStrategies().length > 0 ? 'pass' as const : 'fail' as const,
        message: `${this.strategies.getAllStrategies().length} strategies loaded`
      },
      {
        name: 'hostname_mappings',
        status: this.hostnameMappings.getAllMappings().length > 0 ? 'pass' as const : 'fail' as const,
        message: `${this.hostnameMappings.getAllMappings().length} hostname mappings loaded`
      },
      {
        name: 'domain_registry',
        status: this.domainRegistry.getRegisteredDomains().length > 0 ? 'pass' as const : 'fail' as const,
        message: `${this.domainRegistry.getRegisteredDomains().length} domains registered`
      }
    ];

    const healthy = checks.every(check => check.status === 'pass');

    return { healthy, checks };
  }
}