module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // ===== ENTERPRISE AOP COMPLIANCE RULES =====
    
    // TypeScript Strict Rules
    '@typescript-eslint/no-any': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // AOP Architecture Enforcement
    'no-console': 'warn', // Prefer structured logging
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-expressions': 'error',
    'no-duplicate-imports': 'error',
    
    // Configuration Naming Convention Rules
    'naming-convention': 'off', // Handled by custom rules below
    
    // Performance and Best Practices
    'no-await-in-loop': 'error',
    'require-await': 'error',
    'no-return-await': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // Code Quality
    'complexity': ['error', { max: 15 }],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['error', { max: 100 }],
    'max-params': ['error', 5],
    
    // Import Organization
    'sort-imports': ['error', {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    }],
  },
  overrides: [
    {
      // Configuration Files Specific Rules
      files: ['**/configs/**/*.ts', '**/configurations/**/*.ts'],
      rules: {
        // Enforce configuration naming conventions
        'file-naming-convention': 'error',
        // Ensure proper export naming
        'export-naming-convention': 'error',
      },
    },
    {
      // Test Files Specific Rules
      files: ['**/*.test.ts', '**/*.spec.ts', '**/testing/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests for mocking
        'max-lines-per-function': 'off', // Test functions can be longer
      },
    },
    {
      // Dynamic Loader Specific Rules
      files: ['**/loaders/**/*.ts'],
      rules: {
        'no-dynamic-require': 'error',
        'import/no-dynamic-require': 'error',
      },
    },
  ],
  // ===== CUSTOM RULES FOR CONFIGURATION VALIDATION =====
  settings: {
    'custom-rules': {
      'config-key-format': {
        pattern: '^[a-z]+-[a-z]+(-[a-z]+)*$',
        message: 'Configuration keys must follow kebab-case pattern: vertical-category(-subcategory)',
      },
      'config-file-naming': {
        pattern: '^[a-z]+(-[a-z]+)*\\.ts$',
        message: 'Configuration files must be kebab-case with .ts extension',
      },
      'export-naming': {
        pattern: '^[a-z]+([A-Z][a-z]*)*Config$',
        message: 'Configuration exports must end with "Config" in camelCase',
      },
    },
  },
};