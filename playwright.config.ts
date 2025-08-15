// Playwright Configuration - Enterprise-grade E2E testing
import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './client/src/tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './test-results/e2e-report' }],
    ['json', { outputFile: './test-results/e2e-results.json' }],
    ['junit', { outputFile: './test-results/e2e-junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Browser configuration
    headless: process.env.CI ? true : false,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Videos
    video: 'retain-on-failure',
    
    // Traces
    trace: 'retain-on-failure',
    
    // Context options
    contextOptions: {
      // Permissions
      permissions: ['geolocation', 'camera', 'microphone'],
    },
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000
  },
  
  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },
  
  // Global setup
  globalSetup: './client/src/tests/setup/global-setup.ts',
  globalTeardown: './client/src/tests/setup/global-teardown.ts',
  
  // Configure projects for major browsers
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    },
    
    // Tablet
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        storageState: './test-results/auth/user.json'
      },
      dependencies: ['setup']
    }
  ],
  
  // Run local dev server before starting tests
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  
  // Output directory
  outputDir: './test-results/e2e-artifacts'
});
