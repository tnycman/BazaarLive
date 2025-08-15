// Vitest Configuration - Enterprise-grade testing setup
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Global test setup
    globals: true,
    
    // Setup files
    setupFiles: [
      './server/tests/setup/globalSetup.ts',
      './server/tests/setup/vitestJestShim.ts',
      './server/tests/setup/mocks.ts'
    ],
    
    // Test patterns
    include: [
      'server/tests/**/*.test.ts',
      'client/src/tests/**/*.test.ts'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.e2e.test.ts' // E2E tests run separately with Playwright
    ],
    
    // Test timeout
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'server/**/*.ts',
        'client/src/**/*.{ts,tsx}',
        'shared/**/*.ts'
      ],
      exclude: [
        'server/tests/**',
        'client/src/tests/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.config.ts',
        '**/*.config.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Stricter thresholds for critical components
        'server/services/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'shared/validation/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    },
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // Retry configuration
    retry: 2,
    
    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/unit-tests.json',
      html: './test-results/unit-tests.html'
    },
    
    // Watch mode
    watch: false,
    
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server')
    }
  },
  
  // Define configuration
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.DATABASE_URL': '"postgresql://test:test@localhost:5432/bazaarlive_test"'
  }
});
