# BazaarLive - Enterprise Marketplace Platform

[![Dynamic Configuration Loading](https://img.shields.io/badge/Dynamic%20Loading-Enabled-brightgreen)](./client/src/services/category/loaders/)
[![AOP Architecture](https://img.shields.io/badge/Architecture-AOP%20Compliant-blue)](./AOP_INTEGRATION_DOCUMENTATION.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](./tsconfig.json)
[![Testing](https://img.shields.io/badge/Regression%20Tests-Automated-green)](./client/src/services/category/testing/)

## Overview

BazaarLive is a sophisticated e-commerce marketplace platform built with enterprise-grade Aspect-Oriented Programming (AOP) principles. The platform features a universal three-column layout system that scales across all category pages, with advanced dynamic configuration loading for optimal performance.

### Key Features

- **Universal Layout System**: Identical three-column architecture (header + left filters + center grid + right sidebar) across all categories
- **Dynamic Configuration Loading**: On-demand loading with 70-80% bundle size reduction
- **Enterprise AOP Architecture**: Complete separation of concerns with comprehensive aspect weaving
- **Multi-Category Support**: Fashion, Electronics, Home, Pets, Beauty & Wellness, Sports & Outdoors
- **Performance Optimized**: Intelligent caching, lazy loading, and memory optimization
- **Comprehensive Testing**: Automated regression testing with performance benchmarking

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Wouter** for lightweight client-side routing
- **Shadcn/UI** components built on Radix UI primitives
- **Tailwind CSS** with custom design system
- **TanStack Query** for server state management
- **Vite** for optimized development and production builds

### Backend Stack
- **Node.js** with Express.js framework
- **TypeScript** with ES modules throughout
- **PostgreSQL** with Neon Database and pgvector extension
- **Drizzle ORM** for type-safe database operations
- **Replit Auth** with OpenID Connect integration

### Dynamic Configuration System
- **ES6 Dynamic Imports** for optimal code splitting
- **HTTP API Fallback** for reliable configuration delivery
- **LRU Caching** with TTL management and performance monitoring
- **Multiple Loading Strategies** with automatic fallback mechanisms

## Getting Started

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL database (provided via Replit)
- Environment variables configured (see `.env` example)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd bazaarlive

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Workflow
```bash
# Start the application (frontend + backend)
npm run dev

# Run database migrations
npm run db:push

# Execute regression tests
npm run test:regression

# Build for production
npm run build
```

### Documentation
- Configuration workflow: `docs/config-workflow.md`
- Troubleshooting: `docs/troubleshooting.md`
- Engineering policies: `docs/policies.md`

## Dynamic Configuration System

### Overview
The dynamic configuration loading system enables on-demand loading of category configurations, reducing initial bundle size by 70-80% while maintaining optimal performance through intelligent caching.

### How It Works

#### 1. Configuration Structure
```typescript
interface UniversalPageConfiguration {
  category: string;
  metadata: {
    title: string;
    description: string;
    gradient: string;
    placeholder: string;
  };
  filterConfiguration: {
    availableFilters: string[];
    categorySpecificFilters: any[];
    defaultFilters: Record<string, any>;
    filterValidationRules: Record<string, any>;
  };
  sampleProducts: any[];
}
```

#### 2. Loading Strategies
- **Dynamic Import**: ES6 `import()` for optimal performance
- **API Endpoint**: HTTP-based loading at `/api/configurations/:configKey`
- **Hybrid**: Automatic fallback between strategies
- **Static Fallback**: Guaranteed configuration availability

#### 3. Cache Management
- **LRU Cache**: Memory-efficient storage with intelligent eviction
- **TTL Management**: 5-minute default expiration with configurable policies
- **Performance Tracking**: Load time monitoring and cache hit rate analysis
- **Health Monitoring**: Real-time cache statistics and optimization insights

### Adding New Categories

#### Step 1: Create Configuration File
```typescript
// client/src/services/category/configs/fashion/new-category.ts
import { UniversalPageConfiguration } from '../../../types/UniversalPageTypes';

export const newCategoryConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'New Category',
    description: 'Discover new category items',
    gradient: 'from-blue-50 via-indigo-100 to-blue-200',
    placeholder: 'Search new category...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'brand', 'price', 'condition'],
    categorySpecificFilters: [],
    defaultFilters: { condition: ['new', 'excellent'] },
    filterValidationRules: {}
  },
  sampleProducts: [
    // Add sample products here
  ]
};
```

#### Step 2: Register in Dynamic Loader
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
// Add navigation link in appropriate component
<Link href="/fashion/new-category">New Category</Link>
```

### Configuration Inheritance and Merging

#### Base Template System
```typescript
// Configurations can inherit from base templates
const baseTemplate = {
  filterConfiguration: {
    availableFilters: ['subcategory', 'brand', 'price'],
    defaultFilters: { condition: ['new', 'excellent'] }
  }
};

// Specific configurations extend the base
const specificConfig = mergeConfigurations(baseTemplate, {
  metadata: { title: 'Specific Category' },
  filterConfiguration: {
    availableFilters: [...baseTemplate.filterConfiguration.availableFilters, 'color']
  }
});
```

#### Merge Utility Usage
```typescript
import { ConfigurationMergeUtility } from '../utils/ConfigurationMergeUtility';

// Deep merge configurations with inheritance
const mergedConfig = ConfigurationMergeUtility.mergeConfigurations(
  baseConfig,
  specificConfig,
  { enableInheritance: true, validateResult: true }
);
```

## Testing System

### Regression Testing
The automated regression testing system ensures all category configurations load correctly and perform optimally.

#### Running Tests
```bash
# Execute full regression test suite
npm run test:regression

# Quick validation test
npm run test:quick

# Test specific categories
npm run test:categories fashion-women,fashion-men
```

#### Browser Console Testing
```javascript
// Available in browser console for manual testing
task32RegressionTests()    // Full regression test suite
task32QuickTest()          // Quick validation test
task32SpecificTests(['fashion-women']) // Test specific categories
```

#### Test Coverage
- **Cold Load Testing**: Configuration loading without cache
- **Hot Load Testing**: Configuration loading with cache hits
- **Edge Case Testing**: Invalid configs, API errors, TTL expiration
- **Performance Benchmarking**: Load times, cache efficiency, memory usage
- **API Endpoint Testing**: HTTP fallback behavior verification

### Performance Monitoring
```typescript
// Performance metrics tracked automatically
interface PerformanceBenchmark {
  configKey: string;
  coldLoadTime: number;     // Initial load time
  hotLoadTime: number;      // Cached load time
  cacheEfficiencyRatio: number; // Performance improvement ratio
  performanceImprovement: number; // Percentage improvement
}
```

## Error Handling and Fallback System

### Fallback Hierarchy
1. **Primary**: Dynamic ES6 import from configuration files
2. **Secondary**: HTTP API endpoint (`/api/configurations/:configKey`)
3. **Tertiary**: Static fallback configurations with basic structure
4. **Final**: Error boundary with user-friendly messaging

### Error Extension Points
```typescript
// Custom error handling
class ConfigurationError extends Error {
  constructor(
    public configKey: string,
    public strategy: LoadStrategy,
    public originalError?: Error
  ) {
    super(`Configuration loading failed: ${configKey}`);
  }
}

// Error recovery strategies
const errorRecoveryStrategies = {
  TIMEOUT: 'retry_with_api',
  NETWORK_ERROR: 'use_static_fallback',
  INVALID_CONFIG: 'show_error_boundary'
};
```

### Extending Error Handling
```typescript
// Add custom error recovery
const customErrorHandler = (error: ConfigurationError): Promise<UniversalPageConfiguration> => {
  switch (error.strategy) {
    case LoadStrategy.DYNAMIC_IMPORT:
      return loadViaAPI(error.configKey);
    case LoadStrategy.API_ENDPOINT:
      return loadStaticFallback(error.configKey);
    default:
      throw new Error('All loading strategies exhausted');
  }
};

// Register custom handler
dynamicConfigurationLoader.registerErrorHandler(customErrorHandler);
```

## Development Guidelines

### Code Quality Standards
- **100% TypeScript**: No `any` types without explicit justification
- **AOP Compliance**: Complete separation of concerns with aspect weaving
- **Zero Shortcuts**: No lazy coding, cutting corners, or assumptions
- **Comprehensive Testing**: All features covered by automated tests
- **Performance Monitoring**: Real-time metrics and optimization tracking

### File Organization
```
client/src/services/category/
├── configs/                 # Configuration files by category
│   ├── fashion/            # Fashion category configurations
│   └── templates/          # Base template definitions
├── loaders/                # Dynamic loading infrastructure
│   └── DynamicConfigurationLoader.ts
├── testing/                # Regression testing framework
│   ├── RegressionTestSuite.ts
│   ├── TestRunner.ts
│   └── AutomatedTestRunner.ts
├── utils/                  # Utility functions
│   └── ConfigurationMergeUtility.ts
└── types/                  # TypeScript type definitions
    └── UniversalPageTypes.ts
```

### Naming Conventions
- **Configuration Keys**: `{vertical}-{category}` (e.g., `fashion-women`)
- **File Names**: `{category}-{subcategory}.ts` (e.g., `women-accessories.ts`)
- **Component Names**: `{Category}PageEnterprise` (e.g., `WomenPageEnterprise`)
- **Test Names**: `{TestType}: {ConfigKey}` (e.g., `Cold Load: fashion-women`)

## Performance Optimization

### Bundle Size Reduction
- **Dynamic Loading**: Configurations loaded only when needed
- **Code Splitting**: ES6 dynamic imports enable automatic code splitting
- **Tree Shaking**: Unused configurations eliminated from bundle
- **Lazy Loading**: Components and configurations loaded on demand

### Memory Management
- **LRU Cache**: Intelligent eviction of unused configurations
- **TTL Management**: Automatic cleanup of expired cache entries
- **Memory Monitoring**: Real-time tracking of JavaScript heap usage
- **Garbage Collection**: Optimized memory release for inactive categories

### Cache Optimization
```typescript
// Cache configuration
const cacheConfig = {
  maxSize: 50,              // Maximum cached configurations
  ttl: 5 * 60 * 1000,      // 5-minute expiration
  enableStatistics: true,   // Performance tracking
  enableHealthMonitoring: true // Health checks
};
```

## Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# Verify build integrity
npm run build:verify

# Deploy to production
npm run deploy
```

### Environment Configuration
```bash
# Required environment variables
DATABASE_URL=postgresql://...
REPLIT_DOMAIN=your-domain.replit.app
NODE_ENV=production

# Optional optimization flags
ENABLE_DYNAMIC_LOADING=true
CACHE_TTL_MINUTES=5
PERFORMANCE_MONITORING=true
```

### Performance Monitoring
- **Load Time Tracking**: Monitor configuration loading performance
- **Cache Hit Rate**: Optimize cache efficiency and hit rates
- **Error Rate Monitoring**: Track and alert on configuration loading failures
- **Memory Usage**: Monitor JavaScript heap and optimize memory consumption

## Contributing

### Development Process
1. **Feature Branch**: Create feature branch from `main`
2. **Implementation**: Follow AOP principles and coding standards
3. **Testing**: Run regression tests and verify performance
4. **Documentation**: Update relevant documentation
5. **Code Review**: Submit PR with comprehensive test coverage
6. **CI/CD**: Automated testing and deployment pipeline

### Pull Request Requirements
- **All tests passing**: Regression tests must pass with 95%+ success rate
- **Performance benchmarks**: No performance regressions allowed
- **TypeScript compliance**: Zero compilation errors or warnings
- **Documentation updates**: All new features documented
- **AOP compliance**: Architecture follows enterprise patterns

## Support and Maintenance

### Monitoring Dashboard
- **Configuration Load Performance**: Real-time load time tracking
- **Cache Efficiency Metrics**: Cache hit rates and optimization insights
- **Error Rate Monitoring**: Configuration loading failure tracking
- **Memory Usage Analytics**: JavaScript heap and memory optimization

### Troubleshooting
- **Configuration not loading**: Check dynamic loader logs and fallback behavior
- **Performance degradation**: Review cache hit rates and optimize TTL settings
- **Memory leaks**: Monitor cache size and enable automatic cleanup
- **Test failures**: Run regression tests and verify configuration integrity

### Getting Help
- **Documentation**: Comprehensive guides in `/docs` directory
- **Testing Framework**: Automated regression testing with detailed reporting
- **Error Logs**: Structured logging with performance and error tracking
- **Performance Metrics**: Real-time monitoring and optimization recommendations

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with enterprise-grade AOP architecture principles
- Optimized for performance with dynamic configuration loading
- Comprehensive testing framework with automated regression testing
- Production-ready with monitoring and error handling capabilities