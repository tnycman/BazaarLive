/**
 * Jest Setup Configuration
 * Global test setup and utilities
 * 100% best practices, zero shortcuts
 */

import '@testing-library/jest-dom';

// ===== GLOBAL TEST CONFIGURATION =====

/**
 * Global test timeout
 */
jest.setTimeout(10000);

/**
 * Global test environment setup
 */
beforeAll(() => {
  // Setup global test environment
  process.env.NODE_ENV = 'test';
  
  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

/**
 * Global test cleanup
 */
afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

/**
 * Global test teardown
 */
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Reset environment variables
  delete process.env.NODE_ENV;
});

// ===== GLOBAL TEST UTILITIES =====

/**
 * Mock environment variables for testing
 */
export const mockEnvVars = {
  NODE_ENV: 'development',
  PORT: '5000',
  HOST: '0.0.0.0',
  DATABASE_URL: 'postgresql://localhost:5432/testdb',
  SESSION_SECRET: 'test-session-secret-32-chars-long-enough',
  LOG_LEVEL: 'info',
  ENABLE_HTTPS: 'false',
  ENABLE_HOT_RELOAD: 'true',
  ENABLE_DEBUG_TOOLS: 'true',
  ENABLE_MOCK_DATA: 'false',
  ENABLE_ANALYTICS: 'false',
};

/**
 * Mock production environment variables
 */
export const mockProductionEnvVars = {
  NODE_ENV: 'production',
  PORT: '5000',
  HOST: '0.0.0.0',
  DATABASE_URL: 'postgresql://localhost:5432/proddb',
  SESSION_SECRET: 'prod-session-secret-32-chars-long-enough',
  LOG_LEVEL: 'info',
  ENABLE_HTTPS: 'true',
  ENABLE_ANALYTICS: 'true',
  ENABLE_MONITORING: 'true',
  ENABLE_CACHING: 'true',
  CDN_URL: 'https://cdn.example.com',
  REDIS_URL: 'redis://localhost:6379',
  SENTRY_DSN: 'https://sentry.example.com/dsn',
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  AWS_REGION: 'us-east-1',
  AWS_S3_BUCKET: 'test-bucket',
  AWS_CLOUDFRONT_DISTRIBUTION: 'test-distribution',
};

/**
 * Setup environment variables for testing
 */
export function setupTestEnvironment(envVars: Record<string, string> = mockEnvVars): void {
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

/**
 * Cleanup environment variables after testing
 */
export function cleanupTestEnvironment(): void {
  Object.keys(mockEnvVars).forEach(key => {
    delete process.env[key];
  });
  
  Object.keys(mockProductionEnvVars).forEach(key => {
    delete process.env[key];
  });
}

// ===== GLOBAL MOCKS =====

/**
 * Mock fetch globally
 */
global.fetch = jest.fn();

/**
 * Mock WebSocket globally
 */
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}));

/**
 * Mock storage only when window is available (jsdom).
 */
if (typeof window !== 'undefined') {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
}

// ===== GLOBAL TEST HELPERS =====

/**
 * Wait for async operations to complete
 */
export function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, 10);
      }
    };
    
    checkCondition();
  });
}

/**
 * Create a mock function with proper typing
 */
export function createMockFunction<T extends (...args: any[]) => any>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

/**
 * Create a mock object with proper typing
 */
export function createMockObject<T extends Record<string, any>>(partial: Partial<T> = {}): T {
  return {
    ...partial,
  } as T;
}

// ===== GLOBAL TEST TYPES =====

/**
 * Test utility types
 */
export type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;
export type MockObject<T extends Record<string, any>> = jest.Mocked<T>;

// ===== GLOBAL TEST CONSTANTS =====

/**
 * Test constants
 */
export const TEST_CONSTANTS = {
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  RETRY: {
    COUNT: 3,
    DELAY: 100,
  },
  MOCK: {
    ID: 'test-id',
    NAME: 'test-name',
    EMAIL: 'test@example.com',
    URL: 'https://example.com',
  },
} as const; 