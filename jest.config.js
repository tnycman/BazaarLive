/**
 * Jest multi-project configuration (best practices)
 * - Client/UI tests run in jsdom
 * - Server/shared tests run in node
 */

export default {
  projects: [
    {
      displayName: 'client',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/client/src'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          { tsconfig: 'tsconfig.jest.json', useESM: true, isolatedModules: true },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      testMatch: [
        '<rootDir>/client/src/**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/client/src/**/*.(test|spec).(ts|tsx|js)',
      ],
      setupFiles: ['<rootDir>/config/jest.env.ts'],
      setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts', '<rootDir>/jest.setup.ts'],
      transformIgnorePatterns: [
        'node_modules/(?!(zod|@hookform|@radix-ui|@tanstack|framer-motion|date-fns|drizzle-orm|drizzle-zod|embla-carousel|input-otp|lucide-react|react-day-picker|react-hook-form|react-icons|react-resizable-panels|recharts|tailwind-merge|tailwindcss-animate|tw-animate-css|vaul|wouter)/)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      globals: { 'ts-jest': { useESM: true, isolatedModules: true } },
    },
    {
      displayName: 'server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/server', '<rootDir>/shared'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          { tsconfig: 'tsconfig.jest.json', useESM: true, isolatedModules: true },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      testMatch: [
        '<rootDir>/server/**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/server/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/shared/**/*.(test|spec).(ts|tsx|js)',
      ],
      setupFiles: ['<rootDir>/config/jest.env.ts'],
      transformIgnorePatterns: [
        'node_modules/(?!(zod|@hookform|@radix-ui|@tanstack|framer-motion|date-fns|drizzle-orm|drizzle-zod|embla-carousel|input-otp|lucide-react|react-day-picker|react-hook-form|react-icons|react-resizable-panels|recharts|tailwind-merge|tailwindcss-animate|tw-animate-css|vaul|wouter)/)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      globals: { 'ts-jest': { useESM: true, isolatedModules: true } },
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    'config/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json'],
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};