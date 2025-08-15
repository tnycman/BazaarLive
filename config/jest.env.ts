/**
 * Jest Environment Setup
 * Test environment variables and configuration
 * 100% best practices, zero shortcuts
 */

// ===== TEST ENVIRONMENT VARIABLES =====

/**
 * Set test environment variables
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.HOST = '0.0.0.0';
process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb';
process.env.SESSION_SECRET = 'test-session-secret-32-chars-long-enough';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
process.env.ENABLE_HTTPS = 'false';
process.env.ENABLE_HOT_RELOAD = 'false';
process.env.ENABLE_DEBUG_TOOLS = 'false';
process.env.ENABLE_MOCK_DATA = 'true';
process.env.ENABLE_ANALYTICS = 'false';
process.env.ENABLE_MONITORING = 'false';
process.env.ENABLE_CACHING = 'false';

// ===== TEST CONSTANTS =====

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  DATABASE: {
    URL: 'postgresql://localhost:5432/testdb',
    POOL_SIZE: 1,
    TIMEOUT: 5000,
  },
  SERVER: {
    PORT: 5000,
    HOST: '0.0.0.0',
    TIMEOUT: 10000,
  },
  SESSION: {
    SECRET: 'test-session-secret-32-chars-long-enough',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },
  LOGGING: {
    LEVEL: 'error',
    ENABLE_CONSOLE: false,
    ENABLE_FILE: false,
  },
  FEATURES: {
    ENABLE_HTTPS: false,
    ENABLE_HOT_RELOAD: false,
    ENABLE_DEBUG_TOOLS: false,
    ENABLE_MOCK_DATA: true,
    ENABLE_ANALYTICS: false,
    ENABLE_MONITORING: false,
    ENABLE_CACHING: false,
  },
} as const;

// ===== TEST UTILITIES =====

/**
 * Reset test environment
 */
export function resetTestEnvironment(): void {
  // Reset to test defaults
  Object.entries(TEST_CONFIG).forEach(([category, config]) => {
    if (typeof config === 'object' && config !== null) {
      Object.entries(config).forEach(([key, value]) => {
        const envKey = `${category.toUpperCase()}_${key.toUpperCase()}`;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          process.env[envKey] = String(value);
        }
      });
    }
  });
}

/**
 * Setup test environment with custom values
 */
export function setupTestEnvironment(customEnv: Record<string, string> = {}): void {
  resetTestEnvironment();
  
  // Apply custom environment variables
  Object.entries(customEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

/**
 * Cleanup test environment
 */
export function cleanupTestEnvironment(): void {
  // Remove test-specific environment variables
  const testEnvKeys = [
    'NODE_ENV',
    'PORT',
    'HOST',
    'DATABASE_URL',
    'SESSION_SECRET',
    'LOG_LEVEL',
    'ENABLE_HTTPS',
    'ENABLE_HOT_RELOAD',
    'ENABLE_DEBUG_TOOLS',
    'ENABLE_MOCK_DATA',
    'ENABLE_ANALYTICS',
    'ENABLE_MONITORING',
    'ENABLE_CACHING',
  ];
  
  testEnvKeys.forEach(key => {
    delete process.env[key];
  });
} 