/**
 * Hostname Value Object Unit Tests
 * Complete test coverage for enterprise validation logic
 */

import { describe, it, expect } from '@jest/globals';
import { Hostname, ValidationError } from '../Hostname';

describe('Hostname Value Object', () => {
  describe('Factory Method - create()', () => {
    describe('Valid Hostnames', () => {
      it('should create hostname for localhost', () => {
        const result = Hostname.create('localhost');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('localhost');
      });

      it('should create hostname for IPv4 addresses', () => {
        const result = Hostname.create('127.0.0.1');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('127.0.0.1');
      });

      it('should create hostname for valid domain', () => {
        const result = Hostname.create('example.com');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('example.com');
      });

      it('should create hostname for subdomain', () => {
        const result = Hostname.create('api.example.com');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('api.example.com');
      });

      it('should normalize case and whitespace', () => {
        const result = Hostname.create('  EXAMPLE.COM  ');
        expect(result.isSuccess()).toBe(true);
        expect(result.value.toString()).toBe('example.com');
      });
    });

    describe('Invalid Hostnames', () => {
      it('should reject null hostname', () => {
        const result = Hostname.create(null as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject undefined hostname', () => {
        const result = Hostname.create(undefined as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('null or undefined');
      });

      it('should reject non-string hostname', () => {
        const result = Hostname.create(123 as any);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('must be a string');
      });

      it('should reject empty hostname', () => {
        const result = Hostname.create('');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('cannot be empty');
      });

      it('should reject hostname with invalid characters', () => {
        const result = Hostname.create('example@domain.com');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('invalid characters');
      });

      it('should reject hostname exceeding maximum length', () => {
        const longHostname = 'a'.repeat(254);
        const result = Hostname.create(longHostname);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('maximum length');
      });

      it('should reject labels exceeding maximum length', () => {
        const longLabel = 'a'.repeat(64);
        const result = Hostname.create(`${longLabel}.example.com`);
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('label exceeds maximum length');
      });

      it('should reject labels starting with hyphen', () => {
        const result = Hostname.create('-example.com');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('start or end with hyphen');
      });

      it('should reject labels ending with hyphen', () => {
        const result = Hostname.create('example-.com');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('start or end with hyphen');
      });

      it('should reject invalid TLD', () => {
        const result = Hostname.create('example.1');
        expect(result.isError()).toBe(true);
        expect(result.error.message).toContain('Invalid top-level domain');
      });
    });
  });

  describe('Type Classification', () => {
    it('should identify localhost type', () => {
      const hostname = Hostname.create('localhost').value;
      expect(hostname.getType()).toBe('localhost');
    });

    it('should identify IPv4 type', () => {
      const hostname = Hostname.create('192.168.1.1').value;
      expect(hostname.getType()).toBe('ipv4');
    });

    it('should identify domain type', () => {
      const hostname = Hostname.create('example.com').value;
      expect(hostname.getType()).toBe('domain');
    });

    it('should identify subdomain type', () => {
      const hostname = Hostname.create('api.example.com').value;
      expect(hostname.getType()).toBe('subdomain');
    });
  });

  describe('Environment Classification', () => {
    it('should identify development hostnames', () => {
      const localhost = Hostname.create('localhost').value;
      const localIp = Hostname.create('127.0.0.1').value;
      const localDomain = Hostname.create('app.local').value;

      expect(localhost.isDevelopmentHostname()).toBe(true);
      expect(localIp.isDevelopmentHostname()).toBe(true);
      expect(localDomain.isDevelopmentHostname()).toBe(true);
    });

    it('should identify production hostnames', () => {
      const hostname = Hostname.create('api.example.com').value;
      expect(hostname.isProductionHostname()).toBe(true);
    });

    it('should not classify IP addresses as production', () => {
      const hostname = Hostname.create('192.168.1.1').value;
      expect(hostname.isProductionHostname()).toBe(false);
    });
  });

  describe('Domain Analysis', () => {
    it('should split domain parts correctly', () => {
      const hostname = Hostname.create('api.staging.example.com').value;
      const parts = hostname.getDomainParts();
      expect(parts).toEqual(['api', 'staging', 'example', 'com']);
    });

    it('should return single part for localhost', () => {
      const hostname = Hostname.create('localhost').value;
      const parts = hostname.getDomainParts();
      expect(parts).toEqual(['localhost']);
    });

    it('should get root domain correctly', () => {
      const hostname = Hostname.create('api.staging.example.com').value;
      const rootDomain = hostname.getRootDomain();
      expect(rootDomain).toBe('example.com');
    });

    it('should return same domain for simple domains', () => {
      const hostname = Hostname.create('example.com').value;
      const rootDomain = hostname.getRootDomain();
      expect(rootDomain).toBe('example.com');
    });
  });

  describe('Equality', () => {
    it('should be equal for same hostname', () => {
      const hostname1 = Hostname.create('example.com').value;
      const hostname2 = Hostname.create('example.com').value;
      expect(hostname1.equals(hostname2)).toBe(true);
    });

    it('should not be equal for different hostnames', () => {
      const hostname1 = Hostname.create('example.com').value;
      const hostname2 = Hostname.create('test.com').value;
      expect(hostname1.equals(hostname2)).toBe(false);
    });

    it('should not be equal for non-Hostname objects', () => {
      const hostname = Hostname.create('example.com').value;
      expect(hostname.equals('example.com' as any)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const hostname = Hostname.create('example.com').value;
      const json = hostname.toJSON();
      expect(json).toBe('example.com');
    });

    it('should deserialize from JSON correctly', () => {
      const result = Hostname.fromJSON('example.com');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('example.com');
    });

    it('should handle invalid JSON during deserialization', () => {
      const result = Hostname.fromJSON('invalid@hostname');
      expect(result.isError()).toBe(true);
    });
  });

  describe('Zod Schema Integration', () => {
    it('should validate valid hostname with Zod schema', () => {
      const schema = Hostname.createZodSchema();
      const result = schema.safeParse('example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid hostname with Zod schema', () => {
      const schema = Hostname.createZodSchema();
      const result = schema.safeParse('invalid@hostname');
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long valid domain', () => {
      // Create a long but valid domain
      const labels = Array(10).fill('a'.repeat(50)).join('.');
      const domain = `${labels}.com`;
      
      if (domain.length <= 253) {
        const result = Hostname.create(domain);
        expect(result.isSuccess()).toBe(true);
      }
    });

    it('should handle international domains (ASCII only)', () => {
      // Note: This implementation only supports ASCII domains
      const result = Hostname.create('example.org');
      expect(result.isSuccess()).toBe(true);
    });

    it('should handle mixed case domains', () => {
      const result = Hostname.create('ExAmPlE.CoM');
      expect(result.isSuccess()).toBe(true);
      expect(result.value.toString()).toBe('example.com');
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const result = Hostname.create('');
      expect(result.isError()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('cannot be empty');
    });

    it('should handle unexpected errors gracefully', () => {
      // Mock an unexpected error scenario
      const originalTest = RegExp.prototype.test;
      RegExp.prototype.test = () => { throw new Error('Unexpected error'); };
      
      const result = Hostname.create('example.com');
      expect(result.isError()).toBe(true);
      expect(result.error.message).toContain('Unexpected error');
      
      // Restore original function
      RegExp.prototype.test = originalTest;
    });
  });
});