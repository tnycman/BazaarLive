# Development Guide

## Overview

This guide covers the development workflow, architectural principles, and best practices for contributing to the BazaarLive marketplace platform.

## Development Environment Setup

### Prerequisites

- **Node.js 18+** with npm package manager
- **PostgreSQL** database access (provided via Replit)
- **Git** for version control
- **VS Code** or similar TypeScript-enabled IDE

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd bazaarlive

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Development Scripts

```bash
# Development
npm run dev              # Start development server (frontend + backend)
npm run dev:client       # Start only frontend development server
npm run dev:server       # Start only backend development server

# Building
npm run build            # Build production bundle
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Database
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate database types
npm run db:studio        # Open database studio

# Testing
npm run test:regression  # Run comprehensive regression tests
npm run test:quick       # Run quick validation tests
npm run test:categories  # Test specific categories

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
npm run format           # Format code with Prettier
```

## Project Architecture

### Core Principles

1. **AOP (Aspect-Oriented Programming)**: Complete separation of concerns with aspect weaving
2. **Universal Layout System**: Identical three-column layout across all category pages
3. **Dynamic Configuration Loading**: On-demand loading with intelligent caching
4. **Type Safety**: 100% TypeScript with comprehensive type definitions
5. **Performance Optimization**: Bundle size reduction and memory efficiency

### Directory Structure

```
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # Business logic services
│   │   │   └── category/    # Category configuration system
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   └── types/           # TypeScript type definitions
├── server/                   # Backend application
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── auth/                # Authentication logic
│   └── storage.ts           # Database abstraction layer
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema definitions
├── docs/                     # Documentation
└── package.json             # Project configuration
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-category-system

# Implement feature following AOP principles
# - Create interfaces and types first
# - Implement core logic with aspects
# - Add comprehensive tests
# - Update documentation

# Run tests
npm run test:regression

# Commit changes
git add .
git commit -m "feat: implement new category system with AOP compliance"

# Push and create PR
git push origin feature/new-category-system
```

### 2. Adding New Categories

#### Step 1: Define Configuration

```typescript
// client/src/services/category/configs/fashion/new-category.ts
import { UniversalPageConfiguration } from '../../types/UniversalPageTypes';

export const newCategoryConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'New Category',
    description: 'Discover new category items',
    gradient: 'from-emerald-50 via-teal-100 to-emerald-200',
    placeholder: 'Search new category items...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'brand', 'price', 'condition'],
    categorySpecificFilters: [],
    defaultFilters: { condition: ['new_with_tags', 'excellent'] },
    filterValidationRules: {}
  },
  sampleProducts: []
};
```

#### Step 2: Register Configuration

```typescript
// client/src/services/category/loaders/DynamicConfigurationLoader.ts
private readonly configPathMap: Record<string, string> = {
  // ... existing configurations
  'fashion-new-category': '../configs/fashion/new-category'
};
```

#### Step 3: Add Route

```typescript
// client/src/App.tsx
<Route path="/fashion/new-category" component={UniversalCategoryPage} />
```

#### Step 4: Update Navigation

```typescript
// Add navigation link in HeaderNavigation.tsx or appropriate component
<Link href="/fashion/new-category">New Category</Link>
```

#### Step 5: Test Configuration

```bash
# Test the new configuration
npm run test:categories fashion-new-category

# Run full regression tests
npm run test:regression
```

### 3. Modifying Existing Categories

#### Configuration Updates

```typescript
// Update existing configuration
const updatedConfig = ConfigurationMergeUtility.mergeConfigurations(
  existingConfig,
  {
    filterConfiguration: {
      availableFilters: [...existingConfig.filterConfiguration.availableFilters, 'newFilter']
    }
  }
);
```

#### Testing Changes

```bash
# Test specific category after changes
npm run test:categories fashion-women

# Verify no regressions
npm run test:regression
```

## Code Quality Standards

### TypeScript Guidelines

1. **Strict Type Safety**: No `any` types without explicit justification
2. **Interface Definitions**: Define interfaces for all data structures
3. **Generic Types**: Use generics for reusable components
4. **Type Guards**: Implement type guards for runtime type checking

```typescript
// Good: Strict typing
interface CategoryConfiguration {
  readonly category: string;
  readonly metadata: CategoryMetadata;
}

// Bad: Using any
const config: any = { category: 'fashion' };

// Good: Type guard
function isValidConfiguration(obj: unknown): obj is CategoryConfiguration {
  return typeof obj === 'object' && obj !== null && 'category' in obj;
}
```

### AOP Compliance

1. **Separation of Concerns**: Each aspect handles a single concern
2. **Aspect Weaving**: Use aspect managers for cross-cutting concerns
3. **Result Pattern**: Use Result<T, E> for error handling
4. **Zero Shortcuts**: No lazy coding or cutting corners

```typescript
// Good: AOP compliant
class CategoryService {
  constructor(
    private readonly aspectManager: AspectManager,
    private readonly repository: CategoryRepository
  ) {}

  @LoggingAspect()
  @PerformanceAspect()
  @ValidationAspect()
  async loadCategory(id: string): Promise<Result<Category, CategoryError>> {
    return this.repository.findById(id);
  }
}

// Bad: Mixing concerns
class CategoryService {
  async loadCategory(id: string) {
    console.log('Loading category:', id); // Logging mixed with business logic
    const start = Date.now(); // Performance tracking mixed in
    // ... business logic
  }
}
```

### Performance Guidelines

1. **Dynamic Loading**: Load configurations only when needed
2. **Caching Strategy**: Implement intelligent caching with TTL
3. **Memory Management**: Monitor and optimize memory usage
4. **Bundle Optimization**: Use code splitting and tree shaking

```typescript
// Good: Dynamic loading with caching
const config = await dynamicConfigurationLoader.loadConfiguration(
  'fashion-women',
  { cacheEnabled: true, loadStrategy: LoadStrategy.DYNAMIC_IMPORT }
);

// Bad: Loading all configurations at startup
import * as allConfigs from './all-configurations';
```

## Testing Guidelines

### Test Categories

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **Regression Tests**: Test full system behavior
4. **Performance Tests**: Test load times and memory usage

### Writing Tests

```typescript
// Good: Comprehensive test
describe('DynamicConfigurationLoader', () => {
  it('should load configuration with caching', async () => {
    // Arrange
    const loader = new DynamicConfigurationLoader();
    const configKey = 'fashion-women';

    // Act
    const result = await loader.loadConfiguration(configKey);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.value.configuration.category).toBe('fashion');
  });

  it('should handle load errors gracefully', async () => {
    // Test error scenarios
  });

  it('should optimize cache performance', async () => {
    // Test cache behavior
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- --testPathPattern=DynamicConfigurationLoader

# Run tests in watch mode
npm run test:watch

# Run regression tests
npm run test:regression
```

## Performance Optimization

### Bundle Size Optimization

1. **Dynamic Imports**: Use ES6 dynamic imports for code splitting
2. **Tree Shaking**: Eliminate unused code from bundles
3. **Lazy Loading**: Load components and configurations on demand
4. **Compression**: Enable gzip compression for production

```typescript
// Good: Dynamic import
const component = React.lazy(() => import('./HeavyComponent'));

// Good: Code splitting by route
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
```

### Memory Management

1. **Cache Limits**: Set appropriate cache size limits
2. **TTL Management**: Implement time-to-live for cached items
3. **Memory Monitoring**: Track memory usage and optimize
4. **Garbage Collection**: Ensure proper cleanup of unused objects

```typescript
// Good: Cache with limits
const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 50;

function setCacheEntry(key: string, value: any) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { value, timestamp: Date.now() });
}
```

### Load Time Optimization

1. **Critical Path**: Optimize critical rendering path
2. **Prefetching**: Prefetch likely-needed resources
3. **Caching Strategy**: Implement multi-level caching
4. **CDN Usage**: Use CDN for static assets

## Error Handling

### Error Types

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  CONFIGURATION_ERROR = 'configuration_error',
  PERFORMANCE_ERROR = 'performance_error'
}

class ApplicationError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
  }
}
```

### Error Recovery

```typescript
// Good: Comprehensive error handling with recovery
async function loadConfigurationWithRecovery(configKey: string): Promise<Result<Configuration, ConfigurationError>> {
  try {
    return await primaryLoadStrategy(configKey);
  } catch (error) {
    console.warn('Primary load failed, trying fallback:', error);
    try {
      return await fallbackLoadStrategy(configKey);
    } catch (fallbackError) {
      return Result.failure(new ConfigurationError('All load strategies failed', configKey));
    }
  }
}
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Dynamic Configuration Loader
 * 
 * Provides enterprise-grade configuration loading with multiple strategies,
 * intelligent caching, and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * const loader = new DynamicConfigurationLoader();
 * const result = await loader.loadConfiguration('fashion-women');
 * 
 * if (result.isSuccess()) {
 *   const config = result.value.configuration;
 *   // Use configuration
 * }
 * ```
 */
class DynamicConfigurationLoader {
  /**
   * Load configuration with specified context
   * 
   * @param configKey - Unique configuration identifier
   * @param context - Loading context with strategy and options
   * @returns Promise resolving to configuration result
   */
  async loadConfiguration(
    configKey: string,
    context?: ConfigurationLoadContext
  ): Promise<Result<ConfigurationLoadResult, ConfigurationError>> {
    // Implementation
  }
}
```

### API Documentation

```typescript
/**
 * @api {get} /api/configurations/:configKey Load Configuration
 * @apiName LoadConfiguration
 * @apiGroup Configuration
 * 
 * @apiParam {String} configKey Unique configuration identifier
 * @apiQuery {Boolean} [cacheEnabled=true] Enable cache usage
 * @apiQuery {Boolean} [includeMetadata=false] Include performance metadata
 * 
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Configuration data
 * @apiSuccess {Object} data.configuration Loaded configuration object
 * @apiSuccess {Object} [data.metadata] Performance metadata
 * 
 * @apiError {Boolean} success=false Operation failed
 * @apiError {String} error Error message
 */
```

## Deployment Guidelines

### Environment Configuration

```bash
# Development
NODE_ENV=development
ENABLE_DEBUG_LOGGING=true
CACHE_TTL_MINUTES=1

# Production
NODE_ENV=production
ENABLE_DEBUG_LOGGING=false
CACHE_TTL_MINUTES=5
ENABLE_COMPRESSION=true
```

### Build Process

```bash
# Production build
npm run build

# Verify build
npm run build:verify

# Test production build locally
npm run start:prod
```

### Performance Monitoring

1. **Load Time Tracking**: Monitor configuration load performance
2. **Cache Efficiency**: Track cache hit rates and optimization
3. **Error Rates**: Monitor configuration loading failures
4. **Memory Usage**: Track JavaScript heap and memory consumption

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline that automatically validates code quality, runs tests, and ensures performance standards on every pull request and deployment.

#### Pipeline Stages

1. **Lint & Type Check**: ESLint validation and TypeScript compilation
2. **Configuration Validation**: Category configuration structure and naming validation
3. **Regression Tests**: Comprehensive test suite with cold/hot load testing
4. **Performance Budget**: Bundle size, load time, and cache efficiency validation
5. **Integration Tests**: API endpoint testing and end-to-end validation
6. **Security & Compliance**: Dependency auditing and AOP compliance checks

#### Running CI Tests Locally

```bash
# Run full CI test suite
node scripts/ci-test-runner.js

# Run specific test types
node scripts/ci-test-runner.js quick          # Quick validation
node scripts/ci-test-runner.js regression    # Regression tests
node scripts/ci-test-runner.js config        # Configuration validation
node scripts/ci-test-runner.js performance   # Performance budget
node scripts/ci-test-runner.js lint          # Lint and type check
```

#### Performance Budgets

The CI pipeline enforces strict performance budgets:

- **Bundle Size**: Maximum 500KB total bundle
- **Cold Load Time**: Maximum 100ms initial load
- **Hot Load Time**: Maximum 15ms cached load
- **Cache Hit Rate**: Minimum 85% efficiency
- **Memory Usage**: Maximum 50MB delta per operation

#### Configuration Validation

Automated validation ensures:

- **Naming Conventions**: kebab-case configuration keys and file names
- **Structure Validation**: Required fields and proper data types
- **Export Naming**: Consistent export naming with "Config" suffix
- **Dynamic Loading**: Proper path mapping and import accessibility

### Automation Scripts

#### Configuration Validation Script

```bash
# Validate all configurations
node scripts/validate-configs.js

# Features:
# - File naming convention validation
# - Configuration structure validation
# - Export naming validation
# - Dynamic loader path validation
```

#### Performance Budget Script

```bash
# Validate performance budgets
node scripts/performance-budget.js

# Features:
# - Bundle size analysis
# - Load time measurement
# - Cache efficiency validation
# - Memory usage monitoring
```

#### CI Test Runner

```bash
# Complete CI pipeline execution
node scripts/ci-test-runner.js

# Features:
# - Multi-phase test execution
# - Comprehensive reporting
# - Performance benchmarking
# - Quality gate enforcement
```

## Contributing Guidelines

### Pull Request Process

1. **Branch Naming**: Use descriptive branch names (`feature/new-category`, `fix/cache-issue`)
2. **Commit Messages**: Follow conventional commit format
3. **Code Review**: All code must be reviewed before merging
4. **CI Pipeline**: All CI tests must pass with 95%+ success rate
5. **Performance**: No performance regressions allowed
6. **Documentation**: Update documentation for new features

### Pre-commit Requirements

Before submitting a pull request:

```bash
# 1. Run lint and type checking
npm run type-check

# 2. Validate configurations
node scripts/validate-configs.js

# 3. Run quick tests
node scripts/ci-test-runner.js quick

# 4. Run full regression tests (optional but recommended)
node scripts/ci-test-runner.js regression
```

### Code Review Checklist

- [ ] TypeScript compliance with zero compilation errors
- [ ] AOP architecture principles followed
- [ ] All CI tests passing (95%+ success rate)
- [ ] Configuration validation passed
- [ ] Performance budgets met (no regressions)
- [ ] Comprehensive test coverage
- [ ] Security considerations addressed
- [ ] Documentation updated for new features
- [ ] No breaking changes without version bump

### Quality Gates

The CI pipeline enforces these quality gates:

1. **Code Quality**: ESLint rules and TypeScript compilation
2. **Configuration Standards**: Naming conventions and structure validation
3. **Performance Standards**: Load times and bundle size limits
4. **Test Coverage**: Regression tests with 95%+ pass rate
5. **Security Standards**: Dependency auditing and vulnerability checks

### Deployment Process

1. **Feature Branch**: Create from `main` branch
2. **Development**: Implement feature with CI-compliant code
3. **Local Testing**: Run CI tests locally before pushing
4. **Pull Request**: Create PR with comprehensive description
5. **CI Validation**: Automated CI pipeline validation
6. **Code Review**: Manual review by team members
7. **Merge**: Merge after CI success and review approval
8. **Deployment**: Automated deployment on merge to `main`

This development guide ensures consistent, high-quality development practices across the entire BazaarLive platform with comprehensive CI/CD integration.