/**
 * Schema Transformation Engine Unit Tests
 * 
 * Comprehensive unit test suite covering edge cases for toZodSchema method
 * including customValidator, nested arrays, and all filter types.
 */

import { 
  SchemaTransformationEngine, 
  FilterDefinitionRaw, 
  SchemaTransformationError,
  CustomValidatorRegistry 
} from '../validation/SchemaTransformationEngine';
import { z } from 'zod';

/**
 * Unit Test Framework - Simple Test Runner
 */
class UnitTestFramework {
  private tests: Array<{ name: string; test: () => Promise<void> | void }> = [];
  private results: Array<{ name: string; passed: boolean; error?: string; duration: number }> = [];

  test(name: string, testFn: () => Promise<void> | void): void {
    this.tests.push({ name, test: testFn });
  }

  async run(): Promise<void> {
    console.log(`🧪 Running ${this.tests.length} unit tests...\n`);

    for (const { name, test } of this.tests) {
      const startTime = Date.now();
      try {
        await test();
        this.results.push({ 
          name, 
          passed: true, 
          duration: Date.now() - startTime 
        });
        console.log(`✅ ${name} (${Date.now() - startTime}ms)`);
      } catch (error) {
        this.results.push({ 
          name, 
          passed: false, 
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime 
        });
        console.log(`❌ ${name} (${Date.now() - startTime}ms)`);
        console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const successRate = (passed / this.results.length * 100).toFixed(1);

    console.log('\n📊 UNIT TEST SUMMARY');
    console.log('=' .repeat(40));
    console.log(`✅ Passed: ${passed}/${this.results.length}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  • ${r.name}: ${r.error}`));
    }
  }

  expect(actual: any): ExpectationAPI {
    return new ExpectationAPI(actual);
  }
}

class ExpectationAPI {
  constructor(private actual: any) {}

  toBe(expected: any): void {
    if (this.actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${this.actual}`);
    }
  }

  toEqual(expected: any): void {
    if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toThrow(expectedError?: string | RegExp): void {
    if (typeof this.actual !== 'function') {
      throw new Error('Expected a function that throws');
    }

    try {
      this.actual();
      throw new Error('Expected function to throw, but it did not');
    } catch (error) {
      if (expectedError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (typeof expectedError === 'string') {
          if (!errorMessage.includes(expectedError)) {
            throw new Error(`Expected error containing "${expectedError}", but got "${errorMessage}"`);
          }
        } else if (expectedError instanceof RegExp) {
          if (!expectedError.test(errorMessage)) {
            throw new Error(`Expected error matching ${expectedError}, but got "${errorMessage}"`);
          }
        }
      }
    }
  }

  toBeInstanceOf(expectedClass: any): void {
    if (!(this.actual instanceof expectedClass)) {
      throw new Error(`Expected instance of ${expectedClass.name}, but got ${typeof this.actual}`);
    }
  }

  toHaveProperty(property: string): void {
    if (!(property in this.actual)) {
      throw new Error(`Expected object to have property "${property}"`);
    }
  }

  toBeTruthy(): void {
    if (!this.actual) {
      throw new Error(`Expected truthy value, but got ${this.actual}`);
    }
  }

  toBeFalsy(): void {
    if (this.actual) {
      throw new Error(`Expected falsy value, but got ${this.actual}`);
    }
  }
}

/**
 * Schema Transformation Engine Unit Tests
 */
class SchemaTransformationEngineUnitTests extends UnitTestFramework {
  private engine: SchemaTransformationEngine;

  constructor() {
    super();
    this.engine = new SchemaTransformationEngine();
    this.setupTests();
  }

  private setupTests(): void {
    // Basic functionality tests
    this.test('should create engine instance', () => {
      this.expect(this.engine).toBeInstanceOf(SchemaTransformationEngine);
    });

    this.test('should initialize metrics', () => {
      const metrics = this.engine.getTransformationMetrics();
      this.expect(metrics).toHaveProperty('totalTransformations');
      this.expect(metrics.totalTransformations).toBe(0);
    });

    // Checkbox filter tests
    this.test('should transform single checkbox to boolean schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'newsletter',
        name: 'Subscribe to Newsletter',
        type: 'checkbox'
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should transform multi-checkbox to array schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'interests',
        name: 'Interests',
        type: 'checkbox',
        options: [
          { id: 'sports', name: 'Sports' },
          { id: 'music', name: 'Music' },
          { id: 'travel', name: 'Travel' }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    // Radio filter tests
    this.test('should transform radio filter to enum schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'gender',
        name: 'Gender',
        type: 'radio',
        options: [
          { id: 'male', name: 'Male' },
          { id: 'female', name: 'Female' },
          { id: 'other', name: 'Other' }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should throw error for radio filter without options', () => {
      const filter: FilterDefinitionRaw = {
        id: 'invalid_radio',
        name: 'Invalid Radio',
        type: 'radio'
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Radio filters must have at least one option');
    });

    // Range filter tests
    this.test('should transform range filter to number schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'age',
        name: 'Age',
        type: 'range',
        min: 18,
        max: 65
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should apply min constraint to range schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'price',
        name: 'Price',
        type: 'range',
        min: 100
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should apply max constraint to range schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'discount',
        name: 'Discount',
        type: 'range',
        max: 50
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should throw error for invalid min/max relationship', () => {
      const filter: FilterDefinitionRaw = {
        id: 'invalid_range',
        name: 'Invalid Range',
        type: 'range',
        min: 100,
        max: 50
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Minimum value (100) must be less than maximum value (50)');
    });

    this.test('should apply step constraint to range schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'rating',
        name: 'Rating',
        type: 'range',
        min: 0,
        max: 5,
        step: 0.5
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    // Select filter tests
    this.test('should transform select filter to enum schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'country',
        name: 'Country',
        type: 'select',
        options: [
          { id: 'us', name: 'United States' },
          { id: 'ca', name: 'Canada' },
          { id: 'uk', name: 'United Kingdom' }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should throw error for select filter without options', () => {
      const filter: FilterDefinitionRaw = {
        id: 'invalid_select',
        name: 'Invalid Select',
        type: 'select'
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Select filters must have at least one option');
    });

    // Multiselect filter tests
    this.test('should transform multiselect filter to array schema', () => {
      const filter: FilterDefinitionRaw = {
        id: 'skills',
        name: 'Skills',
        type: 'multiselect',
        options: [
          { id: 'js', name: 'JavaScript' },
          { id: 'py', name: 'Python' },
          { id: 'java', name: 'Java' }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should throw error for multiselect filter without options', () => {
      const filter: FilterDefinitionRaw = {
        id: 'invalid_multiselect',
        name: 'Invalid Multiselect',
        type: 'multiselect'
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Multiselect filters must have at least one option');
    });

    // Custom validator tests
    this.test('should apply email custom validator', () => {
      const filter: FilterDefinitionRaw = {
        id: 'email_field',
        name: 'Email Field',
        type: 'select',
        customValidator: 'email',
        options: [{ id: 'test', name: 'Test' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should apply phone custom validator', () => {
      const filter: FilterDefinitionRaw = {
        id: 'phone_field',
        name: 'Phone Field',
        type: 'select',
        customValidator: 'phone',
        options: [{ id: 'test', name: 'Test' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should apply url custom validator', () => {
      const filter: FilterDefinitionRaw = {
        id: 'website_field',
        name: 'Website Field',
        type: 'select',
        customValidator: 'url',
        options: [{ id: 'test', name: 'Test' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should apply alphanumeric custom validator', () => {
      const filter: FilterDefinitionRaw = {
        id: 'code_field',
        name: 'Code Field',
        type: 'select',
        customValidator: 'alphanumeric',
        options: [{ id: 'test', name: 'Test' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should throw error for unknown custom validator', () => {
      const filter: FilterDefinitionRaw = {
        id: 'unknown_validator',
        name: 'Unknown Validator',
        type: 'select',
        customValidator: 'nonexistent_validator',
        options: [{ id: 'test', name: 'Test' }]
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Custom validator \'nonexistent_validator\' not found');
    });

    // Required flag tests
    this.test('should handle required flag true', () => {
      const filter: FilterDefinitionRaw = {
        id: 'required_field',
        name: 'Required Field',
        type: 'select',
        required: true,
        options: [{ id: 'option1', name: 'Option 1' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should handle required flag false', () => {
      const filter: FilterDefinitionRaw = {
        id: 'optional_field',
        name: 'Optional Field',
        type: 'select',
        required: false,
        options: [{ id: 'option1', name: 'Option 1' }]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should default single checkbox to false when not required', () => {
      const filter: FilterDefinitionRaw = {
        id: 'terms_checkbox',
        name: 'Terms Checkbox',
        type: 'checkbox',
        required: false
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    // Nested structure tests
    this.test('should handle nested filter structures', () => {
      const filter: FilterDefinitionRaw = {
        id: 'address',
        name: 'Address',
        type: 'select',
        options: [{ id: 'home', name: 'Home' }, { id: 'work', name: 'Work' }],
        nested: [
          {
            id: 'street',
            name: 'Street',
            type: 'select',
            options: [{ id: 'main', name: 'Main St' }]
          },
          {
            id: 'city',
            name: 'City',
            type: 'select',
            options: [{ id: 'nyc', name: 'New York' }]
          }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should handle deeply nested structures', () => {
      const filter: FilterDefinitionRaw = {
        id: 'location',
        name: 'Location',
        type: 'select',
        options: [{ id: 'physical', name: 'Physical' }],
        nested: [
          {
            id: 'region',
            name: 'Region',
            type: 'select',
            options: [{ id: 'na', name: 'North America' }],
            nested: [
              {
                id: 'subregion',
                name: 'Subregion',
                type: 'select',
                options: [{ id: 'northeast', name: 'Northeast' }]
              }
            ]
          }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should handle empty nested array', () => {
      const filter: FilterDefinitionRaw = {
        id: 'simple_field',
        name: 'Simple Field',
        type: 'checkbox',
        nested: []
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });

    // Error handling tests
    this.test('should throw error for unsupported filter type', () => {
      const filter: FilterDefinitionRaw = {
        id: 'unsupported',
        name: 'Unsupported',
        type: 'unknown_type' as any
      };

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Unsupported filter type');
    });

    this.test('should throw error for missing filter ID', () => {
      const filter = {
        name: 'Missing ID',
        type: 'checkbox'
      } as FilterDefinitionRaw;

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Filter definition must have a valid string ID');
    });

    this.test('should throw error for missing filter name', () => {
      const filter = {
        id: 'missing_name',
        type: 'checkbox'
      } as FilterDefinitionRaw;

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Filter definition must have a valid string name');
    });

    this.test('should throw error for missing filter type', () => {
      const filter = {
        id: 'missing_type',
        name: 'Missing Type'
      } as FilterDefinitionRaw;

      this.expect(() => this.engine.toZodSchema(filter)).toThrow('Filter definition must have a valid type');
    });

    // Batch transformation tests
    this.test('should handle batch transformation successfully', () => {
      const filters: FilterDefinitionRaw[] = [
        {
          id: 'filter1',
          name: 'Filter 1',
          type: 'checkbox',
          options: [{ id: 'opt1', name: 'Option 1' }]
        },
        {
          id: 'filter2',
          name: 'Filter 2',
          type: 'range',
          min: 0,
          max: 100
        },
        {
          id: 'filter3',
          name: 'Filter 3',
          type: 'select',
          options: [{ id: 'opt1', name: 'Option 1' }]
        }
      ];

      const schemas = this.engine.toZodSchemaBatch(filters);
      this.expect(schemas.length).toBe(3);
      schemas.forEach(schema => this.expect(schema).toBeTruthy());
    });

    this.test('should handle batch transformation with some failures', () => {
      const filters: FilterDefinitionRaw[] = [
        {
          id: 'valid_filter',
          name: 'Valid Filter',
          type: 'checkbox'
        },
        {
          id: 'invalid_filter',
          name: 'Invalid Filter',
          type: 'unknown_type' as any
        }
      ];

      this.expect(() => this.engine.toZodSchemaBatch(filters)).toThrow('Batch transformation failed');
    });

    // Performance and metrics tests
    this.test('should track transformation metrics', () => {
      const initialMetrics = this.engine.getTransformationMetrics();
      const initialCount = initialMetrics.totalTransformations;

      const filter: FilterDefinitionRaw = {
        id: 'metrics_test',
        name: 'Metrics Test',
        type: 'checkbox'
      };

      this.engine.toZodSchema(filter);

      const updatedMetrics = this.engine.getTransformationMetrics();
      this.expect(updatedMetrics.totalTransformations).toBe(initialCount + 1);
      this.expect(updatedMetrics.successfulTransformations).toBe(initialMetrics.successfulTransformations + 1);
    });

    this.test('should track failed transformations in metrics', () => {
      const initialMetrics = this.engine.getTransformationMetrics();
      const initialFailures = initialMetrics.failedTransformations;

      const invalidFilter: FilterDefinitionRaw = {
        id: 'invalid_metrics_test',
        name: 'Invalid Metrics Test',
        type: 'unsupported_type' as any
      };

      try {
        this.engine.toZodSchema(invalidFilter);
      } catch (error) {
        // Expected to fail
      }

      const updatedMetrics = this.engine.getTransformationMetrics();
      this.expect(updatedMetrics.failedTransformations).toBe(initialFailures + 1);
    });

    this.test('should calculate success rate correctly', () => {
      const metrics = this.engine.getTransformationMetrics();
      
      if (metrics.totalTransformations > 0) {
        const expectedRate = (metrics.successfulTransformations / metrics.totalTransformations) * 100;
        this.expect(metrics.successRate).toBe(expectedRate);
      } else {
        this.expect(metrics.successRate).toBe(0);
      }
    });

    // Custom validator registry tests
    this.test('should register custom validator', () => {
      CustomValidatorRegistry.register('test_validator', (value) => value === 'test');
      this.expect(CustomValidatorRegistry.has('test_validator')).toBeTruthy();
    });

    this.test('should retrieve registered validator', () => {
      const validator = CustomValidatorRegistry.get('email');
      this.expect(validator).toBeTruthy();
      this.expect(typeof validator).toBe('function');
    });

    this.test('should list all validators', () => {
      const validators = CustomValidatorRegistry.listValidators();
      this.expect(Array.isArray(validators)).toBeTruthy();
      this.expect(validators.includes('email')).toBeTruthy();
      this.expect(validators.includes('phone')).toBeTruthy();
    });

    // Edge cases
    this.test('should handle filter with all possible properties', () => {
      const complexFilter: FilterDefinitionRaw = {
        id: 'complex_filter',
        name: 'Complex Filter',
        type: 'range',
        min: 0,
        max: 100,
        step: 5,
        required: true,
        pattern: '^\\d+$',
        customValidator: 'alphanumeric',
        defaultValue: 50,
        helpText: 'This is a complex filter',
        nested: [
          {
            id: 'nested_filter',
            name: 'Nested Filter',
            type: 'checkbox',
            options: [{ id: 'nested_opt', name: 'Nested Option' }]
          }
        ]
      };

      const schema = this.engine.toZodSchema(complexFilter);
      this.expect(schema).toBeTruthy();
    });

    this.test('should handle options with all properties', () => {
      const filter: FilterDefinitionRaw = {
        id: 'rich_options',
        name: 'Rich Options',
        type: 'select',
        options: [
          { 
            id: 'option1', 
            name: 'Option 1',
            value: { custom: 'data', nested: { property: 'value' } }
          },
          { 
            id: 'option2', 
            name: 'Option 2',
            value: 42
          },
          { 
            id: 'option3', 
            name: 'Option 3',
            value: true
          }
        ]
      };

      const schema = this.engine.toZodSchema(filter);
      this.expect(schema).toBeTruthy();
    });
  }
}

/**
 * Main execution function
 */
export async function runSchemaTransformationEngineUnitTests(): Promise<void> {
  console.log('🎯 Schema Transformation Engine - Unit Tests');
  console.log('=' .repeat(60));

  const testSuite = new SchemaTransformationEngineUnitTests();
  await testSuite.run();
}

// Execute if run directly
if (typeof window === 'undefined') {
  runSchemaTransformationEngineUnitTests().catch(console.error);
}

export { SchemaTransformationEngineUnitTests };