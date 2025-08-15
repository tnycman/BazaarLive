/**
 * Centralized Configuration Service
 * Enterprise-grade configuration management for filter system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { EventEmitter } from 'events';
import { z } from 'zod';
import { FilterErrorHandler, FilterErrorType, FilterErrorSeverity, FilterErrorContext } from '@/services/error/FilterErrorHandler';

// ===== CONFIGURATION SCHEMAS =====

const FilterConfigurationSchema = z.object({
  enableAdvancedFilters: z.boolean().default(true),
  enablePriceRange: z.boolean().default(true),
  enableBrandSearch: z.boolean().default(true),
  enableSizeFilter: z.boolean().default(true),
  enableColorFilter: z.boolean().default(true),
  enableConditionFilter: z.boolean().default(true),
  enableAvailabilityFilter: z.boolean().default(true),
  maxVisibleFilters: z.number().default(10),
  filterDebounceDelay: z.number().default(300),
  enableFilterPresets: z.boolean().default(true),
  enableFilterAnalytics: z.boolean().default(true),
  enableFilterHistory: z.boolean().default(true),
  enableFilterUndo: z.boolean().default(true),
  maxFilterHistory: z.number().default(50),
  enableFilterValidation: z.boolean().default(true),
  enableFilterCaching: z.boolean().default(true),
  cacheExpiryTime: z.number().default(300000), // 5 minutes
  enableFilterPerformanceMonitoring: z.boolean().default(true),
  performanceThreshold: z.number().default(100),
  enableFilterErrorRecovery: z.boolean().default(true),
  enableFilterMemoryManagement: z.boolean().default(true),
  maxMemoryUsage: z.number().default(50 * 1024 * 1024), // 50MB
  enableFilterAccessibility: z.boolean().default(true),
  enableFilterKeyboardNavigation: z.boolean().default(true),
  enableFilterScreenReader: z.boolean().default(true),
  enableFilterFocusManagement: z.boolean().default(true)
});

const NavigationConfigurationSchema = z.object({
  enableBreadcrumbs: z.boolean().default(true),
  enableNavigationHistory: z.boolean().default(true),
  maxNavigationHistory: z.number().default(50),
  enableCategoryTree: z.boolean().default(true),
  enableCategorySearch: z.boolean().default(true),
  enableCategoryExpansion: z.boolean().default(true),
  enableCategoryCollapse: z.boolean().default(true),
  enableCategoryHighlighting: z.boolean().default(true),
  enableCategoryCounts: z.boolean().default(true),
  enableCategoryDescriptions: z.boolean().default(true),
  enableCategoryImages: z.boolean().default(true),
  enableCategorySorting: z.boolean().default(true),
  defaultCategorySort: z.enum(['name', 'count', 'level']).default('name'),
  enableCategoryCaching: z.boolean().default(true),
  categoryCacheExpiry: z.number().default(600000), // 10 minutes
  enableCategoryValidation: z.boolean().default(true),
  enableCategoryErrorRecovery: z.boolean().default(true)
});

const PerformanceConfigurationSchema = z.object({
  enablePerformanceMonitoring: z.boolean().default(true),
  enablePerformanceMetrics: z.boolean().default(true),
  enablePerformanceAlerts: z.boolean().default(true),
  performanceAlertThreshold: z.number().default(1000), // 1 second
  enableComponentMemoization: z.boolean().default(true),
  enableEventDebouncing: z.boolean().default(true),
  debounceDelay: z.number().default(300),
  enableLazyLoading: z.boolean().default(true),
  enableVirtualScrolling: z.boolean().default(true),
  virtualScrollThreshold: z.number().default(100),
  enableImageOptimization: z.boolean().default(true),
  enableCodeSplitting: z.boolean().default(true),
  enableBundleOptimization: z.boolean().default(true),
  enableCaching: z.boolean().default(true),
  cacheStrategy: z.enum(['memory', 'localStorage', 'sessionStorage']).default('memory'),
  enableCompression: z.boolean().default(true),
  enableMinification: z.boolean().default(true)
});

const ErrorHandlingConfigurationSchema = z.object({
  enableErrorHandling: z.boolean().default(true),
  enableErrorRecovery: z.boolean().default(true),
  enableErrorReporting: z.boolean().default(true),
  enableErrorLogging: z.boolean().default(true),
  enableErrorMonitoring: z.boolean().default(true),
  enableErrorAlerts: z.boolean().default(true),
  errorAlertThreshold: z.number().default(10),
  enableErrorValidation: z.boolean().default(true),
  enableErrorCategorization: z.boolean().default(true),
  enableErrorSeverityLevels: z.boolean().default(true),
  enableErrorContext: z.boolean().default(true),
  enableErrorStackTraces: z.boolean().default(true),
  enableErrorUserFeedback: z.boolean().default(true),
  enableErrorRetry: z.boolean().default(true),
  maxErrorRetries: z.number().default(3),
  errorRetryDelay: z.number().default(1000),
  enableErrorRateLimiting: z.boolean().default(true),
  maxErrorsPerMinute: z.number().default(100)
});

const MemoryConfigurationSchema = z.object({
  enableMemoryManagement: z.boolean().default(true),
  enableMemoryMonitoring: z.boolean().default(true),
  enableMemoryAlerts: z.boolean().default(true),
  memoryAlertThreshold: z.number().default(50 * 1024 * 1024), // 50MB
  enableMemoryCleanup: z.boolean().default(true),
  memoryCleanupInterval: z.number().default(300000), // 5 minutes
  enableSubscriptionTracking: z.boolean().default(true),
  maxSubscriptions: z.number().default(1000),
  enableMemoryOptimization: z.boolean().default(true),
  enableGarbageCollection: z.boolean().default(true),
  enableMemoryLeakDetection: z.boolean().default(true),
  enableMemoryProfiling: z.boolean().default(true),
  enableMemoryReporting: z.boolean().default(true)
});

const AccessibilityConfigurationSchema = z.object({
  enableAccessibility: z.boolean().default(true),
  enableARIA: z.boolean().default(true),
  enableKeyboardNavigation: z.boolean().default(true),
  enableScreenReader: z.boolean().default(true),
  enableFocusManagement: z.boolean().default(true),
  enableHighContrast: z.boolean().default(true),
  enableReducedMotion: z.boolean().default(true),
  enableLargeText: z.boolean().default(true),
  enableColorBlindSupport: z.boolean().default(true),
  enableVoiceControl: z.boolean().default(true),
  enableGestureControl: z.boolean().default(true),
  enableTouchOptimization: z.boolean().default(true),
  enableMobileAccessibility: z.boolean().default(true),
  enableDesktopAccessibility: z.boolean().default(true),
  enableTabletAccessibility: z.boolean().default(true)
});

const ConfigurationSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  version: z.string().default('1.0.0'),
  filters: FilterConfigurationSchema,
  navigation: NavigationConfigurationSchema,
  performance: PerformanceConfigurationSchema,
  errorHandling: ErrorHandlingConfigurationSchema,
  memory: MemoryConfigurationSchema,
  accessibility: AccessibilityConfigurationSchema,
  custom: z.record(z.unknown()).default({})
});

export interface FilterConfiguration extends z.infer<typeof FilterConfigurationSchema> {}
export interface NavigationConfiguration extends z.infer<typeof NavigationConfigurationSchema> {}
export interface PerformanceConfiguration extends z.infer<typeof PerformanceConfigurationSchema> {}
export interface ErrorHandlingConfiguration extends z.infer<typeof ErrorHandlingConfigurationSchema> {}
export interface MemoryConfiguration extends z.infer<typeof MemoryConfigurationSchema> {}
export interface AccessibilityConfiguration extends z.infer<typeof AccessibilityConfigurationSchema> {}

export interface Configuration {
  environment: 'development' | 'staging' | 'production';
  version: string;
  filters: FilterConfiguration;
  navigation: NavigationConfiguration;
  performance: PerformanceConfiguration;
  errorHandling: ErrorHandlingConfiguration;
  memory: MemoryConfiguration;
  accessibility: AccessibilityConfiguration;
  custom: Record<string, unknown>;
}

// ===== CONFIGURATION SERVICE =====

export class CentralizedConfigurationService extends EventEmitter {
  private static instance: CentralizedConfigurationService;
  private configuration: Configuration;
  private errorHandler: FilterErrorHandler;
  private isInitialized: boolean = false;
  private configurationHistory: Configuration[] = [];
  private maxHistorySize: number = 10;

  private constructor() {
    super();
    this.errorHandler = FilterErrorHandler.getInstance();
    this.configuration = this.getDefaultConfiguration();
    this.initializeConfiguration();
  }

  static getInstance(): CentralizedConfigurationService {
    if (!CentralizedConfigurationService.instance) {
      CentralizedConfigurationService.instance = new CentralizedConfigurationService();
    }
    return CentralizedConfigurationService.instance;
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): Configuration {
    try {
      const validation = ConfigurationSchema.safeParse(this.configuration);
      if (!validation.success) {
        this.errorHandler.handleError(
          FilterErrorType.CONFIGURATION_ERROR,
          FilterErrorSeverity.HIGH,
          FilterErrorContext.CONFIGURATION,
          'Invalid configuration detected',
          'CONFIGURATION_VALIDATION_FAILED',
          { errors: validation.error.errors }
        );
        return this.getDefaultConfiguration();
      }
      return validation.data;
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.CRITICAL,
        FilterErrorContext.CONFIGURATION,
        'Failed to get configuration',
        'GET_CONFIGURATION_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return this.getDefaultConfiguration();
    }
  }

  /**
   * Update configuration with validation
   */
  public updateConfiguration(updates: Partial<Configuration>): void {
    try {
      const newConfiguration: Configuration = {
        ...this.configuration,
        ...updates
      };

      const validation = ConfigurationSchema.safeParse(newConfiguration);
      if (!validation.success) {
        this.errorHandler.handleError(
          FilterErrorType.CONFIGURATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CONFIGURATION,
          'Configuration update validation failed',
          'CONFIGURATION_UPDATE_VALIDATION_FAILED',
          { errors: validation.error.errors, updates }
        );
        return;
      }

      // Store previous configuration in history
      this.addToHistory(this.configuration);

      // Update configuration
      this.configuration = validation.data;

      // Emit configuration changed event
      this.emit('configurationChanged', {
        previousConfiguration: this.configurationHistory[this.configurationHistory.length - 1],
        currentConfiguration: this.configuration,
        updates,
        timestamp: Date.now()
      });

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.CONFIGURATION,
        'Configuration update failed',
        'CONFIGURATION_UPDATE_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error', updates }
      );
    }
  }

  /**
   * Get specific configuration section
   */
  public getFilterConfiguration(): FilterConfiguration {
    return this.configuration.filters;
  }

  public getNavigationConfiguration(): NavigationConfiguration {
    return this.configuration.navigation;
  }

  public getPerformanceConfiguration(): PerformanceConfiguration {
    return this.configuration.performance;
  }

  public getErrorHandlingConfiguration(): ErrorHandlingConfiguration {
    return this.configuration.errorHandling;
  }

  public getMemoryConfiguration(): MemoryConfiguration {
    return this.configuration.memory;
  }

  public getAccessibilityConfiguration(): AccessibilityConfiguration {
    return this.configuration.accessibility;
  }

  /**
   * Update specific configuration section
   */
  public updateFilterConfiguration(updates: Partial<FilterConfiguration>): void {
    this.updateConfiguration({
      filters: {
        ...this.configuration.filters,
        ...updates
      }
    });
  }

  public updateNavigationConfiguration(updates: Partial<NavigationConfiguration>): void {
    this.updateConfiguration({
      navigation: {
        ...this.configuration.navigation,
        ...updates
      }
    });
  }

  public updatePerformanceConfiguration(updates: Partial<PerformanceConfiguration>): void {
    this.updateConfiguration({
      performance: {
        ...this.configuration.performance,
        ...updates
      }
    });
  }

  public updateErrorHandlingConfiguration(updates: Partial<ErrorHandlingConfiguration>): void {
    this.updateConfiguration({
      errorHandling: {
        ...this.configuration.errorHandling,
        ...updates
      }
    });
  }

  public updateMemoryConfiguration(updates: Partial<MemoryConfiguration>): void {
    this.updateConfiguration({
      memory: {
        ...this.configuration.memory,
        ...updates
      }
    });
  }

  public updateAccessibilityConfiguration(updates: Partial<AccessibilityConfiguration>): void {
    this.updateConfiguration({
      accessibility: {
        ...this.configuration.accessibility,
        ...updates
      }
    });
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfiguration(): void {
    try {
      const defaultConfig = this.getDefaultConfiguration();
      this.updateConfiguration(defaultConfig);
      
      this.emit('configurationReset', {
        timestamp: Date.now()
      });

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CONFIGURATION,
        'Configuration reset failed',
        'CONFIGURATION_RESET_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get configuration history
   */
  public getConfigurationHistory(): Configuration[] {
    return [...this.configurationHistory];
  }

  /**
   * Undo last configuration change
   */
  public undoConfigurationChange(): boolean {
    try {
      if (this.configurationHistory.length === 0) {
        return false;
      }

      const previousConfiguration = this.configurationHistory.pop();
      if (previousConfiguration) {
        this.configuration = previousConfiguration;
        
        this.emit('configurationUndone', {
          currentConfiguration: this.configuration,
          timestamp: Date.now()
        });
        
        return true;
      }
      
      return false;

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CONFIGURATION,
        'Configuration undo failed',
        'CONFIGURATION_UNDO_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Load configuration from external source
   */
  public async loadConfiguration(source: string): Promise<boolean> {
    try {
      let configurationData: Partial<Configuration>;

      if (source.startsWith('http')) {
        // Load from remote URL
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch configuration from ${source}: ${response.statusText}`);
        }
        configurationData = await response.json();
      } else {
        // Load from local storage or file
        configurationData = JSON.parse(source);
      }

      const validation = ConfigurationSchema.safeParse(configurationData);
      if (!validation.success) {
        this.errorHandler.handleError(
          FilterErrorType.CONFIGURATION_ERROR,
          FilterErrorSeverity.MEDIUM,
          FilterErrorContext.CONFIGURATION,
          'Loaded configuration validation failed',
          'LOADED_CONFIGURATION_VALIDATION_FAILED',
          { errors: validation.error.errors, source }
        );
        return false;
      }

      this.updateConfiguration(validation.data);
      
      this.emit('configurationLoaded', {
        source,
        timestamp: Date.now()
      });

      return true;

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.CONFIGURATION,
        'Load configuration failed',
        'LOAD_CONFIGURATION_FAILED',
        { source, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return false;
    }
  }

  /**
   * Export current configuration
   */
  public exportConfiguration(): string {
    try {
      return JSON.stringify(this.configuration, null, 2);
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CONFIGURATION,
        'Export configuration failed',
        'EXPORT_CONFIGURATION_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return '';
    }
  }

  // ===== PRIVATE METHODS =====

  private initializeConfiguration(): void {
    try {
      // Load environment-specific configuration
      const environment = process.env.NODE_ENV || 'development';
      const version = process.env.APP_VERSION || '1.0.0';

      this.configuration.environment = environment as 'development' | 'staging' | 'production';
      this.configuration.version = version;

      // Apply environment-specific overrides
      this.applyEnvironmentOverrides(environment);

      this.isInitialized = true;
      this.emit('configurationInitialized', { timestamp: Date.now() });

    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.HIGH,
        FilterErrorContext.CONFIGURATION,
        'Configuration initialization failed',
        'CONFIGURATION_INIT_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  private applyEnvironmentOverrides(environment: string): void {
    try {
      switch (environment) {
        case 'production':
          this.configuration.performance.enablePerformanceMonitoring = true;
          this.configuration.errorHandling.enableErrorReporting = true;
          this.configuration.memory.enableMemoryMonitoring = true;
          this.configuration.filters.enableFilterAnalytics = true;
          break;

        case 'staging':
          this.configuration.performance.enablePerformanceMonitoring = true;
          this.configuration.errorHandling.enableErrorReporting = true;
          this.configuration.memory.enableMemoryMonitoring = true;
          this.configuration.filters.enableFilterAnalytics = true;
          break;

        case 'development':
        default:
          this.configuration.performance.enablePerformanceMonitoring = true;
          this.configuration.errorHandling.enableErrorReporting = false;
          this.configuration.memory.enableMemoryMonitoring = true;
          this.configuration.filters.enableFilterAnalytics = true;
          break;
      }
    } catch (error) {
      this.errorHandler.handleError(
        FilterErrorType.CONFIGURATION_ERROR,
        FilterErrorSeverity.MEDIUM,
        FilterErrorContext.CONFIGURATION,
        'Environment overrides failed',
        'ENVIRONMENT_OVERRIDES_FAILED',
        { environment, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  private addToHistory(configuration: Configuration): void {
    this.configurationHistory.push({ ...configuration });
    if (this.configurationHistory.length > this.maxHistorySize) {
      this.configurationHistory.shift();
    }
  }

  private getDefaultConfiguration(): Configuration {
    return {
      environment: 'development',
      version: '1.0.0',
      filters: {
        enableAdvancedFilters: true,
        enablePriceRange: true,
        enableBrandSearch: true,
        enableSizeFilter: true,
        enableColorFilter: true,
        enableConditionFilter: true,
        enableAvailabilityFilter: true,
        maxVisibleFilters: 10,
        filterDebounceDelay: 300,
        enableFilterPresets: true,
        enableFilterAnalytics: true,
        enableFilterHistory: true,
        enableFilterUndo: true,
        maxFilterHistory: 50,
        enableFilterValidation: true,
        enableFilterCaching: true,
        cacheExpiryTime: 300000,
        enableFilterPerformanceMonitoring: true,
        performanceThreshold: 100,
        enableFilterErrorRecovery: true,
        enableFilterMemoryManagement: true,
        maxMemoryUsage: 50 * 1024 * 1024,
        enableFilterAccessibility: true,
        enableFilterKeyboardNavigation: true,
        enableFilterScreenReader: true,
        enableFilterFocusManagement: true
      },
      navigation: {
        enableBreadcrumbs: true,
        enableNavigationHistory: true,
        maxNavigationHistory: 50,
        enableCategoryTree: true,
        enableCategorySearch: true,
        enableCategoryExpansion: true,
        enableCategoryCollapse: true,
        enableCategoryHighlighting: true,
        enableCategoryCounts: true,
        enableCategoryDescriptions: true,
        enableCategoryImages: true,
        enableCategorySorting: true,
        defaultCategorySort: 'name',
        enableCategoryCaching: true,
        categoryCacheExpiry: 600000,
        enableCategoryValidation: true,
        enableCategoryErrorRecovery: true
      },
      performance: {
        enablePerformanceMonitoring: true,
        enablePerformanceMetrics: true,
        enablePerformanceAlerts: true,
        performanceAlertThreshold: 1000,
        enableComponentMemoization: true,
        enableEventDebouncing: true,
        debounceDelay: 300,
        enableLazyLoading: true,
        enableVirtualScrolling: true,
        virtualScrollThreshold: 100,
        enableImageOptimization: true,
        enableCodeSplitting: true,
        enableBundleOptimization: true,
        enableCaching: true,
        cacheStrategy: 'memory',
        enableCompression: true,
        enableMinification: true
      },
      errorHandling: {
        enableErrorHandling: true,
        enableErrorRecovery: true,
        enableErrorReporting: true,
        enableErrorLogging: true,
        enableErrorMonitoring: true,
        enableErrorAlerts: true,
        errorAlertThreshold: 10,
        enableErrorValidation: true,
        enableErrorCategorization: true,
        enableErrorSeverityLevels: true,
        enableErrorContext: true,
        enableErrorStackTraces: true,
        enableErrorUserFeedback: true,
        enableErrorRetry: true,
        maxErrorRetries: 3,
        errorRetryDelay: 1000,
        enableErrorRateLimiting: true,
        maxErrorsPerMinute: 100
      },
      memory: {
        enableMemoryManagement: true,
        enableMemoryMonitoring: true,
        enableMemoryAlerts: true,
        memoryAlertThreshold: 50 * 1024 * 1024,
        enableMemoryCleanup: true,
        memoryCleanupInterval: 300000,
        enableSubscriptionTracking: true,
        maxSubscriptions: 1000,
        enableMemoryOptimization: true,
        enableGarbageCollection: true,
        enableMemoryLeakDetection: true,
        enableMemoryProfiling: true,
        enableMemoryReporting: true
      },
      accessibility: {
        enableAccessibility: true,
        enableARIA: true,
        enableKeyboardNavigation: true,
        enableScreenReader: true,
        enableFocusManagement: true,
        enableHighContrast: true,
        enableReducedMotion: true,
        enableLargeText: true,
        enableColorBlindSupport: true,
        enableVoiceControl: true,
        enableGestureControl: true,
        enableTouchOptimization: true,
        enableMobileAccessibility: true,
        enableDesktopAccessibility: true,
        enableTabletAccessibility: true
      },
      custom: {}
    };
  }
} 