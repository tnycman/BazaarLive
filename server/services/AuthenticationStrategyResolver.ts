/**
 * Authentication Strategy Resolver Service - Enterprise AOP Implementation
 * Complete hostname-to-strategy mapping with aspect-oriented programming
 */

import { Result, ValidationError } from '../domain/Hostname';
import { Hostname } from '../domain/Hostname';
import { StrategyName } from '../domain/StrategyName';
import { Environment } from '../domain/Environment';
import { AuthenticationStrategy, ValidationResult } from '../domain/AuthenticationStrategy';
import { AuthenticationDomain } from '../domain/AuthenticationDomain';
import {
  AuthenticationConfiguration,
  HostnameMappingConfiguration,
  ConfigurationError
} from '../config/ConfigurationSource';

// Resolution Domain Types
export interface StrategyResolutionRequest {
  readonly hostname: string;
  readonly environment: string;
  readonly userAgent?: string;
  readonly sourceIP?: string;
  readonly requestId: string;
  readonly timestamp: Date;
  readonly additionalContext?: Record<string, any>;
}

export interface StrategyResolutionResult {
  readonly strategy: AuthenticationStrategy | null;
  readonly confidence: ResolutionConfidence;
  readonly matchedMapping: HostnameMappingConfiguration | null;
  readonly alternativeStrategies: AuthenticationStrategy[];
  readonly resolutionPath: ResolutionStep[];
  readonly warnings: ResolutionWarning[];
  readonly metadata: ResolutionMetadata;
}

export enum ResolutionConfidence {
  EXACT_MATCH = 'exact_match',
  DOMAIN_MATCH = 'domain_match',
  FALLBACK_MATCH = 'fallback_match',
  DEVELOPMENT_MATCH = 'development_match',
  NO_MATCH = 'no_match'
}

export interface ResolutionStep {
  readonly step: string;
  readonly description: string;
  readonly input: any;
  readonly output: any;
  readonly duration: number;
  readonly success: boolean;
}

export interface ResolutionWarning {
  readonly code: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high';
  readonly recommendation?: string;
}

export interface ResolutionMetadata {
  readonly totalDuration: number;
  readonly cacheHit: boolean;
  readonly strategyCount: number;
  readonly mappingCount: number;
  readonly environmentType: string;
  readonly resolutionTimestamp: Date;
}

// Resolution Error Types
export class StrategyResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'RESOLUTION_ERROR',
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'StrategyResolutionError';
  }
}

export class HostnameValidationError extends StrategyResolutionError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'HOSTNAME_VALIDATION_ERROR', context);
    this.name = 'HostnameValidationError';
  }
}

export class StrategyNotFoundError extends StrategyResolutionError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STRATEGY_NOT_FOUND', context);
    this.name = 'StrategyNotFoundError';
  }
}

// Resolution Strategy Interface
export interface IResolutionStrategy {
  readonly name: string;
  readonly priority: number;
  readonly supportsEnvironment: (environment: Environment) => boolean;
  
  resolve(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<Result<StrategyResolutionResult, StrategyResolutionError>>;
}

// Resolution Cache Interface
export interface IResolutionCache {
  get(key: string): Promise<StrategyResolutionResult | null>;
  set(key: string, result: StrategyResolutionResult, ttlSeconds?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  getStats(): Promise<{
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  }>;
}

// Resolution Aspect Interface (AOP)
export interface IResolutionAspect {
  beforeResolution(request: StrategyResolutionRequest): Promise<void>;
  afterResolution(request: StrategyResolutionRequest, result: StrategyResolutionResult): Promise<void>;
  onResolutionError(request: StrategyResolutionRequest, error: StrategyResolutionError): Promise<void>;
  beforeStrategyValidation(strategy: AuthenticationStrategy, hostname: Hostname): Promise<void>;
  afterStrategyValidation(strategy: AuthenticationStrategy, validation: ValidationResult): Promise<void>;
}

// Exact Hostname Resolution Strategy
export class ExactHostnameResolutionStrategy implements IResolutionStrategy {
  readonly name = 'exact-hostname';
  readonly priority = 100;

  supportsEnvironment(environment: Environment): boolean {
    return true; // Supports all environments
  }

  async resolve(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<Result<StrategyResolutionResult, StrategyResolutionError>> {
    const startTime = Date.now();
    const resolutionPath: ResolutionStep[] = [];

    try {
      // Step 1: Find exact hostname mapping
      const exactMapping = configuration.mappings.find(mapping => 
        mapping.hostname.toLowerCase() === request.hostname.toLowerCase() &&
        mapping.environment === request.environment
      );

      resolutionPath.push({
        step: 'exact-mapping-search',
        description: 'Search for exact hostname mapping',
        input: { hostname: request.hostname, environment: request.environment },
        output: { found: !!exactMapping, mapping: exactMapping },
        duration: Date.now() - startTime,
        success: !!exactMapping
      });

      if (!exactMapping) {
        return Result.ok(this.createNoMatchResult(resolutionPath, startTime));
      }

      // Step 2: Find corresponding strategy
      const strategyName = StrategyName.create(exactMapping.strategyName);
      if (strategyName.isError()) {
        return Result.error(new StrategyResolutionError(
          `Invalid strategy name: ${strategyName.error.message}`,
          'INVALID_STRATEGY_NAME',
          { strategyName: exactMapping.strategyName }
        ));
      }
      
      const strategies = domain.getStrategies();
      const strategy = strategies.find(s => s.getName().equals(strategyName.value));
      
      resolutionPath.push({
        step: 'strategy-lookup',
        description: 'Lookup strategy by name',
        input: { strategyName: exactMapping.strategyName },
        output: { found: !!strategy },
        duration: Date.now() - startTime,
        success: !!strategy
      });

      if (!strategy) {
        return Result.error(new StrategyNotFoundError(
          `Strategy not found: ${exactMapping.strategyName}`,
          { strategyName: exactMapping.strategyName, hostname: request.hostname }
        ));
      }

      // Step 3: Validate strategy compatibility
      const hostnameObj = Hostname.create(request.hostname);
      if (hostnameObj.isError()) {
        return Result.error(new HostnameValidationError(
          `Invalid hostname: ${hostnameObj.error.message}`,
          { hostname: request.hostname }
        ));
      }

      const capability = await strategy.canAuthenticate(hostnameObj.value);
      
      resolutionPath.push({
        step: 'strategy-validation',
        description: 'Validate strategy compatibility',
        input: { hostname: request.hostname, strategy: strategy.getName().toString() },
        output: { canAuthenticate: capability.canAuthenticate(), restrictions: capability.getRestrictions() },
        duration: Date.now() - startTime,
        success: capability.canAuthenticate()
      });

      const warnings: ResolutionWarning[] = [];
      if (!capability.canAuthenticate()) {
        warnings.push({
          code: 'STRATEGY_INCOMPATIBLE',
          message: `Strategy ${strategy.getName().toString()} cannot authenticate hostname ${request.hostname}`,
          severity: 'high',
          recommendation: 'Use a compatible strategy or update hostname configuration'
        });
      }

      return Result.ok({
        strategy: capability.canAuthenticate() ? strategy : null,
        confidence: ResolutionConfidence.EXACT_MATCH,
        matchedMapping: exactMapping,
        alternativeStrategies: [],
        resolutionPath,
        warnings,
        metadata: {
          totalDuration: Date.now() - startTime,
          cacheHit: false,
          strategyCount: 1,
          mappingCount: configuration.mappings.length,
          environmentType: request.environment,
          resolutionTimestamp: new Date()
        }
      });

    } catch (error) {
      return Result.error(new StrategyResolutionError(
        `Exact hostname resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXACT_RESOLUTION_ERROR',
        { hostname: request.hostname, environment: request.environment }
      ));
    }
  }

  private createNoMatchResult(resolutionPath: ResolutionStep[], startTime: number): StrategyResolutionResult {
    return {
      strategy: null,
      confidence: ResolutionConfidence.NO_MATCH,
      matchedMapping: null,
      alternativeStrategies: [],
      resolutionPath,
      warnings: [{
        code: 'NO_EXACT_MATCH',
        message: 'No exact hostname mapping found',
        severity: 'medium',
        recommendation: 'Consider using domain-based or fallback resolution'
      }],
      metadata: {
        totalDuration: Date.now() - startTime,
        cacheHit: false,
        strategyCount: 0,
        mappingCount: 0,
        environmentType: '',
        resolutionTimestamp: new Date()
      }
    };
  }
}

// Domain-Based Resolution Strategy
export class DomainBasedResolutionStrategy implements IResolutionStrategy {
  readonly name = 'domain-based';
  readonly priority = 80;

  supportsEnvironment(environment: Environment): boolean {
    return !environment.isDevelopment(); // Skip for development (localhost doesn't have domains)
  }

  async resolve(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<Result<StrategyResolutionResult, StrategyResolutionError>> {
    const startTime = Date.now();
    const resolutionPath: ResolutionStep[] = [];

    try {
      // Step 1: Extract root domain
      const hostnameObj = Hostname.create(request.hostname);
      if (hostnameObj.isError()) {
        return Result.error(new HostnameValidationError(
          `Invalid hostname: ${hostnameObj.error.message}`,
          { hostname: request.hostname }
        ));
      }

      const rootDomain = hostnameObj.value.getRootDomain();
      
      resolutionPath.push({
        step: 'root-domain-extraction',
        description: 'Extract root domain from hostname',
        input: { hostname: request.hostname },
        output: { rootDomain },
        duration: Date.now() - startTime,
        success: !!rootDomain
      });

      // Step 2: Find domain-based mappings
      const domainMappings = configuration.mappings.filter(mapping => {
        const mappingHostname = Hostname.create(mapping.hostname);
        if (mappingHostname.isError()) return false;
        
        const mappingRoot = mappingHostname.value.getRootDomain();
        return mappingRoot === rootDomain && mapping.environment === request.environment;
      });

      resolutionPath.push({
        step: 'domain-mapping-search',
        description: 'Search for domain-based mappings',
        input: { rootDomain, environment: request.environment },
        output: { found: domainMappings.length > 0, count: domainMappings.length },
        duration: Date.now() - startTime,
        success: domainMappings.length > 0
      });

      if (domainMappings.length === 0) {
        return Result.ok(this.createNoMatchResult(resolutionPath, startTime, rootDomain));
      }

      // Step 3: Select highest priority mapping
      const selectedMapping = domainMappings.reduce((best, current) => 
        current.priority > best.priority ? current : best
      );

      // Step 4: Find corresponding strategy
      const strategyNameResult = StrategyName.create(selectedMapping.strategyName);
      if (strategyNameResult.isError()) {
        return Result.error(new StrategyResolutionError(
          `Invalid strategy name: ${strategyNameResult.error.message}`,
          'INVALID_STRATEGY_NAME',
          { strategyName: selectedMapping.strategyName }
        ));
      }
      
      const strategies = domain.getStrategies();
      const strategy = strategies.find(s => s.getName().equals(strategyNameResult.value));
      
      resolutionPath.push({
        step: 'strategy-lookup',
        description: 'Lookup strategy by name',
        input: { strategyName: selectedMapping.strategyName },
        output: { found: !!strategy },
        duration: Date.now() - startTime,
        success: !!strategy
      });

      if (!strategy) {
        return Result.error(new StrategyNotFoundError(
          `Strategy not found: ${selectedMapping.strategyName}`,
          { strategyName: selectedMapping.strategyName, hostname: request.hostname }
        ));
      }

      // Step 5: Validate strategy compatibility
      const capability = await strategy.canAuthenticate(hostnameObj.value);
      
      resolutionPath.push({
        step: 'strategy-validation',
        description: 'Validate strategy compatibility',
        input: { hostname: request.hostname, strategy: strategy.getName().toString() },
        output: { canAuthenticate: capability.canAuthenticate(), restrictions: capability.getRestrictions() },
        duration: Date.now() - startTime,
        success: capability.canAuthenticate()
      });

      const warnings: ResolutionWarning[] = [];
      if (!capability.canAuthenticate()) {
        warnings.push({
          code: 'DOMAIN_STRATEGY_INCOMPATIBLE',
          message: `Domain-based strategy ${strategy.getName().toString()} cannot authenticate hostname ${request.hostname}`,
          severity: 'medium',
          recommendation: 'Check domain configuration or use exact hostname mapping'
        });
      }

      // Find alternative strategies for the same domain
      const alternativeStrategies = await this.findAlternativeStrategies(
        domainMappings.filter(m => m !== selectedMapping),
        domain,
        hostnameObj.value
      );

      return Result.ok({
        strategy: capability.canAuthenticate() ? strategy : null,
        confidence: ResolutionConfidence.DOMAIN_MATCH,
        matchedMapping: selectedMapping,
        alternativeStrategies,
        resolutionPath,
        warnings,
        metadata: {
          totalDuration: Date.now() - startTime,
          cacheHit: false,
          strategyCount: 1,
          mappingCount: domainMappings.length,
          environmentType: request.environment,
          resolutionTimestamp: new Date()
        }
      });

    } catch (error) {
      return Result.error(new StrategyResolutionError(
        `Domain-based resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DOMAIN_RESOLUTION_ERROR',
        { hostname: request.hostname, environment: request.environment }
      ));
    }
  }

  private async findAlternativeStrategies(
    mappings: HostnameMappingConfiguration[],
    domain: AuthenticationDomain,
    hostname: Hostname
  ): Promise<AuthenticationStrategy[]> {
    const alternatives: AuthenticationStrategy[] = [];

    for (const mapping of mappings) {
      const strategyNameResult = StrategyName.create(mapping.strategyName);
      if (strategyNameResult.isError()) continue;

      const strategies = domain.getStrategies();
      const strategy = strategies.find(s => s.getName().equals(strategyNameResult.value));
      if (!strategy) continue;

      const capability = await strategy.canAuthenticate(hostname);
      if (capability.canAuthenticate()) {
        alternatives.push(strategy);
      }
    }

    return alternatives.sort((a, b) => b.getConfiguration().securityLevel.localeCompare(a.getConfiguration().securityLevel));
  }

  private createNoMatchResult(resolutionPath: ResolutionStep[], startTime: number, rootDomain: string): StrategyResolutionResult {
    return {
      strategy: null,
      confidence: ResolutionConfidence.NO_MATCH,
      matchedMapping: null,
      alternativeStrategies: [],
      resolutionPath,
      warnings: [{
        code: 'NO_DOMAIN_MATCH',
        message: `No domain-based mapping found for ${rootDomain}`,
        severity: 'medium',
        recommendation: 'Add domain-based mapping or use fallback resolution'
      }],
      metadata: {
        totalDuration: Date.now() - startTime,
        cacheHit: false,
        strategyCount: 0,
        mappingCount: 0,
        environmentType: '',
        resolutionTimestamp: new Date()
      }
    };
  }
}

// Development Fallback Resolution Strategy
export class DevelopmentFallbackResolutionStrategy implements IResolutionStrategy {
  readonly name = 'development-fallback';
  readonly priority = 60;

  supportsEnvironment(environment: Environment): boolean {
    return environment.isDevelopment();
  }

  async resolve(
    request: StrategyResolutionRequest,
    configuration: AuthenticationConfiguration,
    domain: AuthenticationDomain
  ): Promise<Result<StrategyResolutionResult, StrategyResolutionError>> {
    const startTime = Date.now();
    const resolutionPath: ResolutionStep[] = [];

    try {
      // Step 1: Check if hostname is development-friendly
      const hostnameObj = Hostname.create(request.hostname);
      if (hostnameObj.isError()) {
        return Result.error(new HostnameValidationError(
          `Invalid hostname: ${hostnameObj.error.message}`,
          { hostname: request.hostname }
        ));
      }

      const isDevelopmentHostname = hostnameObj.value.isDevelopmentHostname();
      
      resolutionPath.push({
        step: 'development-hostname-check',
        description: 'Check if hostname is development-friendly',
        input: { hostname: request.hostname },
        output: { isDevelopmentHostname },
        duration: Date.now() - startTime,
        success: isDevelopmentHostname
      });

      if (!isDevelopmentHostname) {
        return Result.ok(this.createNoMatchResult(resolutionPath, startTime));
      }

      // Step 2: Find first available development strategy
      const developmentMappings = configuration.mappings.filter(mapping => 
        mapping.environment === request.environment
      );

      resolutionPath.push({
        step: 'development-mapping-search',
        description: 'Search for development environment mappings',
        input: { environment: request.environment },
        output: { found: developmentMappings.length > 0, count: developmentMappings.length },
        duration: Date.now() - startTime,
        success: developmentMappings.length > 0
      });

      if (developmentMappings.length === 0) {
        return Result.ok(this.createNoMatchResult(resolutionPath, startTime));
      }

      // Step 3: Select highest priority development mapping
      const selectedMapping = developmentMappings.reduce((best, current) => 
        current.priority > best.priority ? current : best
      );

      // Step 4: Find corresponding strategy
      const strategyNameResult = StrategyName.create(selectedMapping.strategyName);
      if (strategyNameResult.isError()) {
        return Result.error(new StrategyResolutionError(
          `Invalid strategy name: ${strategyNameResult.error.message}`,
          'INVALID_STRATEGY_NAME',
          { strategyName: selectedMapping.strategyName }
        ));
      }
      
      const strategies = domain.getStrategies();
      const strategy = strategies.find(s => s.getName().equals(strategyNameResult.value));
      
      resolutionPath.push({
        step: 'strategy-lookup',
        description: 'Lookup development strategy by name',
        input: { strategyName: selectedMapping.strategyName },
        output: { found: !!strategy },
        duration: Date.now() - startTime,
        success: !!strategy
      });

      if (!strategy) {
        return Result.error(new StrategyNotFoundError(
          `Development strategy not found: ${selectedMapping.strategyName}`,
          { strategyName: selectedMapping.strategyName, hostname: request.hostname }
        ));
      }

      const warnings: ResolutionWarning[] = [{
        code: 'DEVELOPMENT_FALLBACK_USED',
        message: 'Using development fallback resolution',
        severity: 'low',
        recommendation: 'Add explicit hostname mapping for production readiness'
      }];

      return Result.ok({
        strategy,
        confidence: ResolutionConfidence.DEVELOPMENT_MATCH,
        matchedMapping: selectedMapping,
        alternativeStrategies: [],
        resolutionPath,
        warnings,
        metadata: {
          totalDuration: Date.now() - startTime,
          cacheHit: false,
          strategyCount: 1,
          mappingCount: developmentMappings.length,
          environmentType: request.environment,
          resolutionTimestamp: new Date()
        }
      });

    } catch (error) {
      return Result.error(new StrategyResolutionError(
        `Development fallback resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DEVELOPMENT_FALLBACK_ERROR',
        { hostname: request.hostname, environment: request.environment }
      ));
    }
  }

  private createNoMatchResult(resolutionPath: ResolutionStep[], startTime: number): StrategyResolutionResult {
    return {
      strategy: null,
      confidence: ResolutionConfidence.NO_MATCH,
      matchedMapping: null,
      alternativeStrategies: [],
      resolutionPath,
      warnings: [{
        code: 'NO_DEVELOPMENT_FALLBACK',
        message: 'No development fallback strategy available',
        severity: 'high',
        recommendation: 'Configure at least one development strategy mapping'
      }],
      metadata: {
        totalDuration: Date.now() - startTime,
        cacheHit: false,
        strategyCount: 0,
        mappingCount: 0,
        environmentType: '',
        resolutionTimestamp: new Date()
      }
    };
  }
}