// Global test setup for Vitest – minimal, deterministic configuration

// Ensure test environment
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Provide a default test database URL if not already defined
process.env.DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://test:test@localhost:5432/bazaarlive_test';

// Optional: reduce noisy logs during tests
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

// Node 18 has global fetch; no additional polyfills required

export {};


