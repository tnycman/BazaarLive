/**
 * StrategyName Value Object - Enterprise Implementation
 * Authentication strategy naming with complete validation
 */

import { z } from 'zod';
import { ValidationError, Result } from './Hostname';

export class StrategyName {
  private static readonly VALID_STRATEGY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
  private static readonly MAX_STRATEGY_NAME_LENGTH = 128;
  private static readonly MIN_STRATEGY_NAME_LENGTH = 5;
  private static readonly RESERVED_PREFIXES = ['system:', 'internal:', 'admin:', 'root:'] as const;
  private static readonly ALLOWED_PREFIXES = ['replitauth:', 'oauth:', 'saml:', 'ldap:', 'test:'] as const;

  private constructor(private readonly value: string) {
    // Private constructor enforces factory method usage
  }

  /**
   * Factory method to create StrategyName with complete validation
   */
  static create(value: string): Result<StrategyName, ValidationError> {
    try {
      const validationResult = this.validateStrategyName(value);
      if (validationResult.isError()) {
        return Result.error(validationResult.error);
      }

      return Result.ok(new StrategyName(value.toLowerCase().trim()));
    } catch (error) {
      return Result.error(new ValidationError(
        `Unexpected error creating strategy name: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Comprehensive strategy name validation
   */
  private static validateStrategyName(value: string): Result<void, ValidationError> {
    // Basic null/undefined/type checks
    if (value === null || value === undefined) {
      return Result.error(new ValidationError('Strategy name cannot be null or undefined'));
    }

    if (typeof value !== 'string') {
      return Result.error(new ValidationError('Strategy name must be a string'));
    }

    // Trim and normalize
    const normalized = value.toLowerCase().trim();

    // Empty string check
    if (normalized.length === 0) {
      return Result.error(new ValidationError('Strategy name cannot be empty'));
    }

    // Length validation
    if (normalized.length < this.MIN_STRATEGY_NAME_LENGTH) {
      return Result.error(new ValidationError(
        `Strategy name must be at least ${this.MIN_STRATEGY_NAME_LENGTH} characters long`
      ));
    }

    if (normalized.length > this.MAX_STRATEGY_NAME_LENGTH) {
      return Result.error(new ValidationError(
        `Strategy name exceeds maximum length of ${this.MAX_STRATEGY_NAME_LENGTH} characters`
      ));
    }

    // Pattern validation (must include colon separator)
    if (!this.VALID_STRATEGY_PATTERN.test(normalized)) {
      return Result.error(new ValidationError(
        'Strategy name must follow format "prefix:identifier" with valid characters'
      ));
    }

    // Check for reserved prefixes
    const hasReservedPrefix = this.RESERVED_PREFIXES.some(prefix => 
      normalized.startsWith(prefix)
    );

    if (hasReservedPrefix) {
      return Result.error(new ValidationError(
        `Strategy name cannot use reserved prefix. Reserved prefixes: ${this.RESERVED_PREFIXES.join(', ')}`
      ));
    }

    // Validate prefix is in allowed list for production use
    const prefix = normalized.split(':')[0] + ':';
    const isAllowedPrefix = this.ALLOWED_PREFIXES.some(allowedPrefix => 
      prefix === allowedPrefix
    );

    if (!isAllowedPrefix) {
      return Result.error(new ValidationError(
        `Strategy name prefix not recognized. Allowed prefixes: ${this.ALLOWED_PREFIXES.join(', ')}`
      ));
    }

    // Validate identifier part
    const identifier = normalized.split(':')[1];
    if (!identifier || identifier.length === 0) {
      return Result.error(new ValidationError(
        'Strategy name must have a non-empty identifier after the colon'
      ));
    }

    // Identifier cannot start with special characters
    if (/^[._-]/.test(identifier)) {
      return Result.error(new ValidationError(
        'Strategy identifier cannot start with dot, underscore, or hyphen'
      ));
    }

    // Identifier cannot end with special characters
    if (/[._-]$/.test(identifier)) {
      return Result.error(new ValidationError(
        'Strategy identifier cannot end with dot, underscore, or hyphen'
      ));
    }

    return Result.ok(undefined);
  }

  /**
   * Create strategy name from prefix and identifier
   */
  static fromParts(prefix: string, identifier: string): Result<StrategyName, ValidationError> {
    if (!prefix || !identifier) {
      return Result.error(new ValidationError('Both prefix and identifier are required'));
    }

    // Ensure prefix ends with colon
    const normalizedPrefix = prefix.endsWith(':') ? prefix : `${prefix}:`;
    const strategyName = `${normalizedPrefix}${identifier}`;

    return this.create(strategyName);
  }

  /**
   * Get the string representation of the strategy name
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality with another strategy name
   */
  equals(other: StrategyName): boolean {
    if (!(other instanceof StrategyName)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Get the prefix part of the strategy name
   */
  getPrefix(): string {
    return this.value.split(':')[0];
  }

  /**
   * Get the identifier part of the strategy name
   */
  getIdentifier(): string {
    return this.value.split(':')[1];
  }

  /**
   * Check if strategy is for development environment
   */
  isDevelopmentStrategy(): boolean {
    const devIdentifiers = ['localhost', '127.0.0.1', 'dev', 'development', 'local'];
    const identifier = this.getIdentifier();
    return devIdentifiers.some(devId => identifier.includes(devId));
  }

  /**
   * Check if strategy is for production environment
   */
  isProductionStrategy(): boolean {
    return !this.isDevelopmentStrategy() && !this.isTestStrategy();
  }

  /**
   * Check if strategy is for testing
   */
  isTestStrategy(): boolean {
    const identifier = this.getIdentifier();
    return identifier.includes('test') || 
           identifier.includes('staging') || 
           this.getPrefix() === 'test';
  }

  /**
   * Get strategy type based on prefix
   */
  getStrategyType(): 'replitauth' | 'oauth' | 'saml' | 'ldap' | 'test' | 'unknown' {
    const prefix = this.getPrefix();
    
    switch (prefix) {
      case 'replitauth':
        return 'replitauth';
      case 'oauth':
        return 'oauth';
      case 'saml':
        return 'saml';
      case 'ldap':
        return 'ldap';
      case 'test':
        return 'test';
      default:
        return 'unknown';
    }
  }

  /**
   * Create a development variant of this strategy
   */
  createDevelopmentVariant(): Result<StrategyName, ValidationError> {
    const prefix = this.getPrefix();
    const originalIdentifier = this.getIdentifier();
    
    // If already a development strategy, return as-is
    if (this.isDevelopmentStrategy()) {
      return Result.ok(this);
    }

    // Create development identifier
    const devIdentifier = `dev-${originalIdentifier}`;
    return StrategyName.fromParts(prefix, devIdentifier);
  }

  /**
   * Create a production variant of this strategy
   */
  createProductionVariant(): Result<StrategyName, ValidationError> {
    const prefix = this.getPrefix();
    let identifier = this.getIdentifier();
    
    // Remove development indicators
    identifier = identifier.replace(/^(dev-|development-|local-|test-)/, '');
    
    return StrategyName.fromParts(prefix, identifier);
  }

  /**
   * Validate compatibility with hostname
   */
  isCompatibleWithHostname(hostname: string): boolean {
    const identifier = this.getIdentifier();
    
    // Direct match
    if (identifier === hostname) {
      return true;
    }

    // Domain matching for production strategies
    if (this.isProductionStrategy() && hostname.includes('.')) {
      return identifier.includes(hostname) || hostname.includes(identifier);
    }

    // Development hostname matching
    if (this.isDevelopmentStrategy()) {
      const devHostnames = ['localhost', '127.0.0.1'];
      return devHostnames.includes(hostname);
    }

    return false;
  }

  /**
   * Create Zod schema for validation
   */
  static createZodSchema() {
    return z.string().refine(
      (value) => StrategyName.create(value).isSuccess(),
      (value) => ({
        message: StrategyName.create(value).isError() 
          ? StrategyName.create(value).error.message 
          : 'Invalid strategy name'
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
  static fromJSON(json: string): Result<StrategyName, ValidationError> {
    return StrategyName.create(json);
  }
}

// Export validation schema
export const strategyNameValidationSchema = StrategyName.createZodSchema();