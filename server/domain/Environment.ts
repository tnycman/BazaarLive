/**
 * Environment Value Object - Enterprise Implementation
 * Environment detection and validation with complete type safety
 */

import { z } from 'zod';
import { ValidationError, Result } from './Hostname';

export enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

export class Environment {
  private static readonly ENVIRONMENT_INDICATORS = {
    [EnvironmentType.DEVELOPMENT]: [
      'NODE_ENV=development',
      'development',
      'dev',
      'local',
      'localhost'
    ],
    [EnvironmentType.STAGING]: [
      'NODE_ENV=staging',
      'staging',
      'stage',
      'preview'
    ],
    [EnvironmentType.PRODUCTION]: [
      'NODE_ENV=production',
      'production',
      'prod',
      'live'
    ],
    [EnvironmentType.TEST]: [
      'NODE_ENV=test',
      'test',
      'testing',
      'ci',
      'jest'
    ]
  } as const;

  private constructor(private readonly value: EnvironmentType) {
    // Private constructor enforces factory method usage
  }

  /**
   * Factory method to create Environment with validation
   */
  static create(value: string | EnvironmentType): Result<Environment, ValidationError> {
    try {
      const validationResult = this.validateEnvironment(value);
      if (validationResult.isError()) {
        return Result.error(validationResult.error);
      }

      const normalizedValue = this.normalizeEnvironment(value);
      return Result.ok(new Environment(normalizedValue));
    } catch (error) {
      return Result.error(new ValidationError(
        `Unexpected error creating environment: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Auto-detect environment from current system state
   */
  static async detect(): Promise<Result<Environment, ValidationError>> {
    try {
      // Check NODE_ENV first (highest priority)
      const nodeEnv = process.env.NODE_ENV;
      if (nodeEnv) {
        const envResult = this.create(nodeEnv);
        if (envResult.isSuccess()) {
          return envResult;
        }
      }

      // Check Replit-specific indicators
      const replitDeployment = process.env.REPLIT_DEPLOYMENT;
      const replitId = process.env.REPL_ID;

      if (replitDeployment) {
        return this.create(EnvironmentType.PRODUCTION);
      }

      if (replitId && !replitDeployment) {
        return this.create(EnvironmentType.DEVELOPMENT);
      }

      // Check CI/CD indicators
      const ciIndicators = ['CI', 'CONTINUOUS_INTEGRATION', 'GITHUB_ACTIONS', 'GITLAB_CI'];
      const isCI = ciIndicators.some(indicator => process.env[indicator]);

      if (isCI) {
        return this.create(EnvironmentType.TEST);
      }

      // Check hostname indicators
      const hostname = process.env.HOSTNAME || require('os').hostname();
      for (const [envType, indicators] of Object.entries(this.ENVIRONMENT_INDICATORS)) {
        const matches = indicators.some(indicator => 
          hostname.toLowerCase().includes(indicator.toLowerCase())
        );
        if (matches) {
          return this.create(envType as EnvironmentType);
        }
      }

      // Default fallback
      return this.create(EnvironmentType.DEVELOPMENT);
    } catch (error) {
      return Result.error(new ValidationError(
        `Failed to detect environment: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Validate environment value
   */
  private static validateEnvironment(value: string | EnvironmentType): Result<void, ValidationError> {
    if (value === null || value === undefined) {
      return Result.error(new ValidationError('Environment cannot be null or undefined'));
    }

    if (typeof value !== 'string') {
      return Result.error(new ValidationError('Environment must be a string'));
    }

    const normalized = value.toLowerCase().trim();
    if (normalized.length === 0) {
      return Result.error(new ValidationError('Environment cannot be empty'));
    }

    // Check if it's a valid environment type
    const isValidEnum = Object.values(EnvironmentType).includes(normalized as EnvironmentType);
    
    // Check if it matches any indicators
    const hasIndicator = Object.values(this.ENVIRONMENT_INDICATORS).some(indicators =>
      indicators.some(indicator => 
        indicator.toLowerCase().includes(normalized) || 
        normalized.includes(indicator.toLowerCase())
      )
    );

    if (!isValidEnum && !hasIndicator) {
      return Result.error(new ValidationError(
        `Invalid environment: ${value}. Must be one of: ${Object.values(EnvironmentType).join(', ')}`
      ));
    }

    return Result.ok(undefined);
  }

  /**
   * Normalize environment string to EnvironmentType
   */
  private static normalizeEnvironment(value: string | EnvironmentType): EnvironmentType {
    if (Object.values(EnvironmentType).includes(value as EnvironmentType)) {
      return value as EnvironmentType;
    }

    const normalized = value.toLowerCase().trim();

    // Find matching environment type
    for (const [envType, indicators] of Object.entries(this.ENVIRONMENT_INDICATORS)) {
      const matches = indicators.some(indicator => 
        indicator.toLowerCase().includes(normalized) || 
        normalized.includes(indicator.toLowerCase())
      );
      if (matches) {
        return envType as EnvironmentType;
      }
    }

    // Default fallback
    return EnvironmentType.DEVELOPMENT;
  }

  /**
   * Get the environment type
   */
  getType(): EnvironmentType {
    return this.value;
  }

  /**
   * Get string representation
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality with another environment
   */
  equals(other: Environment): boolean {
    if (!(other instanceof Environment)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Check if this is a development environment
   */
  isDevelopment(): boolean {
    return this.value === EnvironmentType.DEVELOPMENT;
  }

  /**
   * Check if this is a production environment
   */
  isProduction(): boolean {
    return this.value === EnvironmentType.PRODUCTION;
  }

  /**
   * Check if this is a staging environment
   */
  isStaging(): boolean {
    return this.value === EnvironmentType.STAGING;
  }

  /**
   * Check if this is a test environment
   */
  isTest(): boolean {
    return this.value === EnvironmentType.TEST;
  }

  /**
   * Check if environment requires strict security
   */
  requiresStrictSecurity(): boolean {
    return this.isProduction() || this.isStaging();
  }

  /**
   * Check if environment allows debug features
   */
  allowsDebugFeatures(): boolean {
    return this.isDevelopment() || this.isTest();
  }

  /**
   * Get environment-specific configuration
   */
  getConfiguration(): EnvironmentConfiguration {
    switch (this.value) {
      case EnvironmentType.DEVELOPMENT:
        return {
          debugMode: true,
          strictValidation: false,
          allowedHosts: ['localhost', '127.0.0.1', '*.local'],
          logLevel: 'debug',
          enableMetrics: false,
          requireHTTPS: false
        };

      case EnvironmentType.STAGING:
        return {
          debugMode: false,
          strictValidation: true,
          allowedHosts: ['*.staging.*'],
          logLevel: 'info',
          enableMetrics: true,
          requireHTTPS: true
        };

      case EnvironmentType.PRODUCTION:
        return {
          debugMode: false,
          strictValidation: true,
          allowedHosts: [], // Must be explicitly configured
          logLevel: 'warn',
          enableMetrics: true,
          requireHTTPS: true
        };

      case EnvironmentType.TEST:
        return {
          debugMode: true,
          strictValidation: true,
          allowedHosts: ['localhost', '127.0.0.1', '*.test'],
          logLevel: 'error',
          enableMetrics: false,
          requireHTTPS: false
        };

      default:
        throw new Error(`Unknown environment type: ${this.value}`);
    }
  }

  /**
   * Create Zod schema for validation
   */
  static createZodSchema() {
    return z.string().refine(
      (value) => Environment.create(value).isSuccess(),
      (value) => ({
        message: Environment.create(value).isError() 
          ? Environment.create(value).error.message 
          : 'Invalid environment'
      })
    );
  }

  /**
   * Serialize for JSON
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: string): Result<Environment, ValidationError> {
    return Environment.create(json);
  }
}

// Environment configuration interface
export interface EnvironmentConfiguration {
  debugMode: boolean;
  strictValidation: boolean;
  allowedHosts: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  requireHTTPS: boolean;
}

// Export validation schema
export const environmentValidationSchema = Environment.createZodSchema();

// Export constants for easy access
export const DEVELOPMENT = () => Environment.create(EnvironmentType.DEVELOPMENT).value;
export const STAGING = () => Environment.create(EnvironmentType.STAGING).value;
export const PRODUCTION = () => Environment.create(EnvironmentType.PRODUCTION).value;
export const TEST = () => Environment.create(EnvironmentType.TEST).value;