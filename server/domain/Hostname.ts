/**
 * Hostname Value Object - Enterprise Implementation
 * Zero assumptions, complete validation, immutable design
 */

import { z } from 'zod';

// Validation Error Types
export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Result Pattern for Error Handling
export class Result<T, E extends Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isSuccess: boolean = false
  ) {}

  static ok<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }

  static error<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isError(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot access error of successful result');
    }
    return this._error!;
  }
}

// Hostname Value Object
export class Hostname {
  private static readonly VALIDATION_PATTERNS = {
    localhost: /^localhost$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/,
    domain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    subdomain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  } as const;

  private static readonly MAX_HOSTNAME_LENGTH = 253;
  private static readonly MAX_LABEL_LENGTH = 63;

  private constructor(private readonly value: string) {
    // Private constructor enforces factory method usage
  }

  /**
   * Factory method to create Hostname with complete validation
   */
  static create(value: string): Result<Hostname, ValidationError> {
    try {
      const validationResult = this.validateHostname(value);
      if (validationResult.isError()) {
        return Result.error(validationResult.error);
      }

      return Result.ok(new Hostname(value.toLowerCase().trim()));
    } catch (error) {
      return Result.error(new ValidationError(
        `Unexpected error creating hostname: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    }
  }

  /**
   * Comprehensive hostname validation with enterprise-grade checks
   */
  private static validateHostname(value: string): Result<void, ValidationError> {
    // Basic null/undefined/type checks
    if (value === null || value === undefined) {
      return Result.error(new ValidationError('Hostname cannot be null or undefined'));
    }

    if (typeof value !== 'string') {
      return Result.error(new ValidationError('Hostname must be a string'));
    }

    // Trim and normalize
    const normalized = value.toLowerCase().trim();

    // Empty string check
    if (normalized.length === 0) {
      return Result.error(new ValidationError('Hostname cannot be empty'));
    }

    // Length validation
    if (normalized.length > this.MAX_HOSTNAME_LENGTH) {
      return Result.error(new ValidationError(
        `Hostname exceeds maximum length of ${this.MAX_HOSTNAME_LENGTH} characters`
      ));
    }

    // Check for invalid characters
    if (/[^a-zA-Z0-9.-]/.test(normalized)) {
      return Result.error(new ValidationError(
        'Hostname contains invalid characters. Only letters, numbers, dots, and hyphens are allowed'
      ));
    }

    // Validate against patterns
    const isValid = Object.values(this.VALIDATION_PATTERNS).some(pattern => 
      pattern.test(normalized)
    );

    if (!isValid) {
      return Result.error(new ValidationError(
        `Hostname format is invalid: ${normalized}`
      ));
    }

    // Additional domain-specific validations
    if (normalized.includes('.')) {
      const labels = normalized.split('.');
      
      // Check each label length
      for (const label of labels) {
        if (label.length > this.MAX_LABEL_LENGTH) {
          return Result.error(new ValidationError(
            `Domain label exceeds maximum length of ${this.MAX_LABEL_LENGTH} characters: ${label}`
          ));
        }

        // Labels cannot start or end with hyphens
        if (label.startsWith('-') || label.endsWith('-')) {
          return Result.error(new ValidationError(
            `Domain label cannot start or end with hyphen: ${label}`
          ));
        }

        // Labels cannot be empty
        if (label.length === 0) {
          return Result.error(new ValidationError('Domain labels cannot be empty'));
        }
      }

      // TLD validation for non-IP addresses
      const tld = labels[labels.length - 1];
      if (!/^[a-zA-Z]{2,}$/.test(tld) && !this.VALIDATION_PATTERNS.ipv4.test(normalized)) {
        return Result.error(new ValidationError(
          `Invalid top-level domain: ${tld}. Must be at least 2 alphabetic characters`
        ));
      }
    }

    return Result.ok(undefined);
  }

  /**
   * Get the string representation of the hostname
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check equality with another hostname
   */
  equals(other: Hostname): boolean {
    if (!(other instanceof Hostname)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Get hostname type classification
   */
  getType(): 'localhost' | 'ipv4' | 'ipv6' | 'domain' | 'subdomain' {
    if (Hostname.VALIDATION_PATTERNS.localhost.test(this.value)) {
      return 'localhost';
    }
    if (Hostname.VALIDATION_PATTERNS.ipv4.test(this.value)) {
      return 'ipv4';
    }
    if (Hostname.VALIDATION_PATTERNS.ipv6.test(this.value)) {
      return 'ipv6';
    }
    if (this.value.includes('.') && this.value.split('.').length > 2) {
      return 'subdomain';
    }
    return 'domain';
  }

  /**
   * Check if hostname is suitable for development environment
   */
  isDevelopmentHostname(): boolean {
    const devPatterns = ['localhost', '127.0.0.1', '::1'];
    return devPatterns.includes(this.value) || this.value.endsWith('.local');
  }

  /**
   * Check if hostname is suitable for production environment
   */
  isProductionHostname(): boolean {
    return !this.isDevelopmentHostname() && 
           this.getType() !== 'ipv4' && 
           this.getType() !== 'ipv6';
  }

  /**
   * Get domain parts for analysis
   */
  getDomainParts(): string[] {
    if (this.getType() === 'localhost' || this.getType() === 'ipv4' || this.getType() === 'ipv6') {
      return [this.value];
    }
    return this.value.split('.');
  }

  /**
   * Get root domain (for subdomains)
   */
  getRootDomain(): string {
    const parts = this.getDomainParts();
    if (parts.length <= 2) {
      return this.value;
    }
    return parts.slice(-2).join('.');
  }

  /**
   * Create Zod schema for validation
   */
  static createZodSchema() {
    return z.string().refine(
      (value) => Hostname.create(value).isSuccess(),
      (value) => ({
        message: Hostname.create(value).isError() 
          ? Hostname.create(value).error.message 
          : 'Invalid hostname'
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
  static fromJSON(json: string): Result<Hostname, ValidationError> {
    return Hostname.create(json);
  }
}

// Export validation schema for use with other validation libraries
export const hostnameValidationSchema = Hostname.createZodSchema();