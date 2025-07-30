/**
 * Configuration Validation Orchestrator
 * 
 * Enterprise-grade validation orchestrator that converts raw configuration objects
 * into fully type-safe Zod schemas and orchestrates filter-rule validation.
 * 
 * @fileoverview Core validation engine for configuration transformation
 * @version 1.0.0
 * @author BazaarLive Enterprise Team
 */

import { z } from 'zod';
import {
  UniversalPageConfiguration,
  FilterConfiguration,
  ThemeConfiguration,
  SearchConfiguration,
  ValidationConfiguration
} from '../domain/ConfigurationEntities';
import {
  ConfigurationKey,
  FilterDefinition,
  LayoutConfiguration,
  PageMetadata
} from '../domain/ConfigurationValueObjects';
import { 
  SchemaTransformationEngine, 
  FilterDefinitionRaw, 
  SchemaTransformationError 
} from './SchemaTransformationEngine';

/**
 * Configuration validation error with detailed context
 */
export class ConfigurationValidationError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly severity: 'error' | 'warning';
  public readonly validationPath: string[];

  constructor(
    message: string,
    code: string,
    details: Record<string, any> = {},
    severity: 'error' | 'warning' = 'error',
    validationPath: string[] = []
  ) {
    super(message);
    this.name = 'ConfigurationValidationError';
    this.code = code;
    this.details = details;
    this.severity = severity;
    this.validationPath = validationPath;
  }

  /**
   * Creates a validation error for schema violations
   */
  static schemaViolation(
    field: string,
    expected: string,
    received: any,
    path: string[] = []
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(
      `Schema validation failed for field '${field}': expected ${expected}, received ${typeof received}`,
      'SCHEMA_VALIDATION_FAILED',
      { field, expected, received, value: received },
      'error',
      path
    );
  }

  /**
   * Creates a validation error for missing required fields
   */
  static missingRequired(
    field: string,
    path: string[] = []
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(
      `Required field '${field}' is missing`,
      'REQUIRED_FIELD_MISSING',
      { field, path: path.join('.') },
      'error',
      path
    );
  }

  /**
   * Creates a validation error for filter definition failures
   */
  static filterValidation(
    filterName: string,
    reason: string,
    details: Record<string, any> = {}
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(
      `Filter validation failed for '${filterName}': ${reason}`,
      'FILTER_VALIDATION_FAILED',
      { filterName, reason, ...details },
      'error',
      ['filters', filterName]
    );
  }

  /**
   * Creates a validation error for transformation failures
   */
  static transformationFailed(
    stage: string,
    reason: string,
    originalError?: Error
  ): ConfigurationValidationError {
    return new ConfigurationValidationError(
      `Configuration transformation failed at stage '${stage}': ${reason}`,
      'TRANSFORMATION_FAILED',
      {
        stage,
        reason,
        originalError: originalError?.message,
        stack: originalError?.stack
      },
      'error'
    );
  }
}

/**
 * Raw configuration schema for initial validation
 */
const RawConfigurationSchema = z.object({
  // Core identification
  category: z.string().min(1, 'Category cannot be empty'),
  domain: z.string().min(1, 'Domain cannot be empty').default('fashion'),
  
  // Metadata configuration
  metadata: z.object({
    title: z.string()
      .min(10, 'Title must be at least 10 characters')
      .max(60, 'Title must not exceed 60 characters'),
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(160, 'Description must not exceed 160 characters'),
    keywords: z.array(z.string()).optional().default([]),
    canonicalUrl: z.string().url().optional(),
    ogImage: z.string().url().optional(),
    structuredData: z.record(z.any()).optional()
  }),

  // Filter definitions (raw format)
  filters: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['checkbox', 'radio', 'range', 'select', 'multiselect']),
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      value: z.any().optional()
    })).optional(),
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    pattern: z.string().optional(),
    customValidator: z.string().optional(),
    defaultValue: z.any().optional(),
    helpText: z.string().optional(),
    nested: z.array(z.any()).optional()
  })).optional().default([]),

  // Layout configuration
  layout: z.object({
    columns: z.number().min(1).max(12).default(3),
    gap: z.string().default('1rem'),
    containerMaxWidth: z.string().default('1200px'),
    breakpoints: z.record(z.string()).optional(),
    gridTemplate: z.string().optional()
  }).optional(),

  // Theme configuration
  theme: z.object({
    primaryGradient: z.string().optional(),
    secondaryGradient: z.string().optional(),
    accentColor: z.string().optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.string().optional(),
    customCSS: z.string().optional()
  }).optional(),

  // Search configuration
  search: z.object({
    enabled: z.boolean().default(true),
    placeholder: z.string().optional(),
    searchFields: z.array(z.string()).optional(),
    minQueryLength: z.number().min(1).default(2),
    maxResults: z.number().min(1).default(50),
    debounceMs: z.number().min(0).default(300)
  }).optional(),

  // Validation rules
  validation: z.object({
    strictMode: z.boolean().default(true),
    allowEmptyFilters: z.boolean().default(false),
    maxFilterValues: z.number().min(1).default(100),
    customRules: z.array(z.string()).optional()
  }).optional(),

  // System properties
  isActive: z.boolean().default(true),
  version: z.string().default('1.0.0'),
  priority: z.number().min(0).default(0),
  tags: z.array(z.string()).optional().default([])
});

/**
 * Configuration Validation Orchestrator
 * 
 * Orchestrates the complete validation pipeline from raw configuration objects
 * to fully validated UniversalPageConfiguration entities with type-safe Zod schemas.
 */
export class ConfigurationValidationOrchestrator {
  private readonly schemaEngine: SchemaTransformationEngine;
  private readonly validationMetrics: {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    averageValidationTime: number;
    lastValidationTime: number;
  };

  /**
   * Creates a new validation orchestrator instance
   */
  constructor() {
    this.schemaEngine = new SchemaTransformationEngine();
    this.validationMetrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      averageValidationTime: 0,
      lastValidationTime: 0
    };
  }

  /**
   * Transforms raw configuration object into fully validated UniversalPageConfiguration
   * 
   * This is the main orchestration method that:
   * 1. Validates raw configuration against base schema
   * 2. Transforms filter definitions into Zod schemas
   * 3. Assembles the final UniversalPageConfiguration entity
   * 
   * @param raw - Raw configuration object from external source
   * @returns Promise resolving to validated UniversalPageConfiguration
   * @throws ConfigurationValidationError for validation failures
   */
  async transform(raw: unknown): Promise<UniversalPageConfiguration> {
    const startTime = Date.now();
    this.validationMetrics.totalValidations++;

    try {
      // Stage 1: Initial raw validation
      const validatedRaw = await this._validateRawConfiguration(raw);
      
      // Stage 2: Transform filter definitions to Zod schemas
      const filterConfiguration = await this._transformFilterConfiguration(validatedRaw);
      
      // Stage 3: Create value objects
      const valueObjects = await this._createValueObjects(validatedRaw);
      
      // Stage 4: Create additional entities
      const additionalEntities = await this._createAdditionalEntities(validatedRaw);
      
      // Stage 5: Assemble final configuration
      const configuration = await this._assembleFinalConfiguration(
        validatedRaw,
        valueObjects,
        filterConfiguration,
        additionalEntities
      );

      // Stage 6: Final validation
      await this._performFinalValidation(configuration);

      // Update success metrics
      const validationTime = Date.now() - startTime;
      this._updateSuccessMetrics(validationTime);

      return configuration;

    } catch (error) {
      // Update failure metrics
      this.validationMetrics.failedValidations++;
      this.validationMetrics.lastValidationTime = Date.now() - startTime;

      if (error instanceof ConfigurationValidationError) {
        throw error;
      }

      // Wrap unexpected errors
      throw ConfigurationValidationError.transformationFailed(
        'validation_orchestration',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validates multiple raw configurations in batch
   * 
   * @param rawConfigurations - Array of raw configuration objects
   * @returns Promise resolving to array of validated configurations
   */
  async transformBatch(rawConfigurations: unknown[]): Promise<UniversalPageConfiguration[]> {
    const results: UniversalPageConfiguration[] = [];
    const errors: ConfigurationValidationError[] = [];

    for (let i = 0; i < rawConfigurations.length; i++) {
      try {
        const result = await this.transform(rawConfigurations[i]);
        results.push(result);
      } catch (error) {
        if (error instanceof ConfigurationValidationError) {
          errors.push(error);
        } else {
          errors.push(ConfigurationValidationError.transformationFailed(
            `batch_item_${i}`,
            error instanceof Error ? error.message : String(error),
            error instanceof Error ? error : undefined
          ));
        }
      }
    }

    if (errors.length > 0) {
      throw new ConfigurationValidationError(
        `Batch validation failed: ${errors.length} out of ${rawConfigurations.length} configurations failed`,
        'BATCH_VALIDATION_FAILED',
        { errors: errors.map(e => e.message), totalCount: rawConfigurations.length, failedCount: errors.length }
      );
    }

    return results;
  }

  /**
   * Gets validation metrics and performance statistics
   * 
   * @returns Current validation metrics
   */
  getValidationMetrics(): {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    successRate: number;
    averageValidationTime: number;
    lastValidationTime: number;
  } {
    const successRate = this.validationMetrics.totalValidations > 0
      ? (this.validationMetrics.successfulValidations / this.validationMetrics.totalValidations) * 100
      : 0;

    return {
      ...this.validationMetrics,
      successRate
    };
  }

  /**
   * Validates raw configuration against base schema
   */
  private async _validateRawConfiguration(raw: unknown): Promise<z.infer<typeof RawConfigurationSchema>> {
    try {
      return RawConfigurationSchema.parse(raw);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ConfigurationValidationError.schemaViolation(
          firstError.path.join('.'),
          'valid value',
          firstError.code,
          firstError.path.map(String)
        );
      }
      throw ConfigurationValidationError.transformationFailed(
        'raw_validation',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Transforms filter definitions using schema transformation engine
   */
  private async _transformFilterConfiguration(
    validatedRaw: z.infer<typeof RawConfigurationSchema>
  ): Promise<FilterConfiguration> {
    try {
      const transformedFilters: FilterDefinition[] = [];

      for (const rawFilter of validatedRaw.filters) {
        try {
          // Transform to Zod schema using transformation engine
          const zodSchema = this.schemaEngine.toZodSchema(rawFilter as FilterDefinitionRaw);
          
          // Create FilterDefinition from raw filter
          const filterDefinition = this._createFilterDefinition(rawFilter, zodSchema);
          transformedFilters.push(filterDefinition);

        } catch (error) {
          throw ConfigurationValidationError.filterValidation(
            rawFilter.id,
            error instanceof Error ? error.message : String(error),
            { filterType: rawFilter.type, required: rawFilter.required }
          );
        }
      }

      return new FilterConfiguration({
        availableFilters: transformedFilters,
        categorySpecificFilters: transformedFilters.filter(f => f.required),
        defaultFilters: new Map(),
        filterValidationRules: new Map()
      });

    } catch (error) {
      if (error instanceof ConfigurationValidationError) {
        throw error;
      }
      throw ConfigurationValidationError.transformationFailed(
        'filter_transformation',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Creates value objects from validated raw configuration
   */
  private async _createValueObjects(
    validatedRaw: z.infer<typeof RawConfigurationSchema>
  ): Promise<{
    configurationKey: ConfigurationKey;
    pageMetadata: PageMetadata;
    layoutConfiguration: LayoutConfiguration;
  }> {
    try {
      // Create configuration key
      const configurationKey = new ConfigurationKey(`${validatedRaw.domain}-${validatedRaw.category}`);

      // Create page metadata
      const pageMetadata = new PageMetadata({
        title: validatedRaw.metadata.title,
        description: validatedRaw.metadata.description,
        keywords: validatedRaw.metadata.keywords || [],
        canonicalUrl: validatedRaw.metadata.canonicalUrl,
        openGraphImage: validatedRaw.metadata.ogImage,
        structuredData: validatedRaw.metadata.structuredData
      });

      // Create layout configuration
      const layoutConfiguration = validatedRaw.layout
        ? new LayoutConfiguration({
            columns: validatedRaw.layout.columns,
            gridGap: validatedRaw.layout.gap,
            responsive: { 
              mobile: { columns: 1 }, 
              tablet: { columns: 2 }, 
              desktop: { columns: validatedRaw.layout.columns } 
            },
            sidebar: { position: 'left', width: '250px', collapsible: true }
          })
        : LayoutConfiguration.default();

      return {
        configurationKey,
        pageMetadata,
        layoutConfiguration
      };

    } catch (error) {
      throw ConfigurationValidationError.transformationFailed(
        'value_object_creation',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Creates additional entity configurations
   */
  private async _createAdditionalEntities(
    validatedRaw: z.infer<typeof RawConfigurationSchema>
  ): Promise<{
    themeConfiguration: ThemeConfiguration;
    searchConfiguration: SearchConfiguration;
    validationConfiguration: ValidationConfiguration;
  }> {
    try {
      // Create theme configuration
      const themeConfiguration = validatedRaw.theme
        ? new ThemeConfiguration({
            primaryGradient: validatedRaw.theme.primaryGradient || 'linear-gradient(135deg, #667eea, #764ba2)',
            secondaryGradient: validatedRaw.theme.secondaryGradient || 'linear-gradient(135deg, #f093fb, #f5576c)',
            accentColor: validatedRaw.theme.accentColor || '#667eea',
            textColor: validatedRaw.theme.textColor || '#2d3436',
            backgroundColor: validatedRaw.theme.backgroundColor || '#ffffff',
            borderRadius: validatedRaw.theme.borderRadius || '8px',
            customCSS: validatedRaw.theme.customCSS
          })
        : ThemeConfiguration.forCategory(validatedRaw.category);

      // Create search configuration
      const searchConfiguration = validatedRaw.search
        ? new SearchConfiguration({
            enabled: validatedRaw.search.enabled,
            placeholder: validatedRaw.search.placeholder || `Search ${validatedRaw.category}...`,
            searchFields: validatedRaw.search.searchFields || ['title', 'description'],
            minQueryLength: validatedRaw.search.minQueryLength,
            debounceMs: validatedRaw.search.debounceMs
          })
        : SearchConfiguration.default();

      // Create validation configuration
      const validationConfiguration = validatedRaw.validation
        ? new ValidationConfiguration({
            strictMode: validatedRaw.validation.strictMode,
            validateOnMount: true,
            showValidationErrors: true,
            validationTimeout: 5000
          })
        : ValidationConfiguration.default();

      return {
        themeConfiguration,
        searchConfiguration,
        validationConfiguration
      };

    } catch (error) {
      throw ConfigurationValidationError.transformationFailed(
        'entity_creation',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Assembles the final UniversalPageConfiguration
   */
  private async _assembleFinalConfiguration(
    validatedRaw: z.infer<typeof RawConfigurationSchema>,
    valueObjects: {
      configurationKey: ConfigurationKey;
      pageMetadata: PageMetadata;
      layoutConfiguration: LayoutConfiguration;
    },
    filterConfiguration: FilterConfiguration,
    additionalEntities: {
      themeConfiguration: ThemeConfiguration;
      searchConfiguration: SearchConfiguration;
      validationConfiguration: ValidationConfiguration;
    }
  ): Promise<UniversalPageConfiguration> {
    try {
      return new UniversalPageConfiguration({
        key: valueObjects.configurationKey,
        category: validatedRaw.category,
        metadata: valueObjects.pageMetadata,
        filterConfiguration,
        layoutConfiguration: valueObjects.layoutConfiguration,
        themeConfiguration: additionalEntities.themeConfiguration,
        searchConfiguration: additionalEntities.searchConfiguration,
        validationConfiguration: additionalEntities.validationConfiguration,
        isActive: validatedRaw.isActive,
        version: validatedRaw.version
      });

    } catch (error) {
      throw ConfigurationValidationError.transformationFailed(
        'final_assembly',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Performs final validation on assembled configuration
   */
  private async _performFinalValidation(configuration: UniversalPageConfiguration): Promise<void> {
    try {
      // Validate configuration integrity
      if (!configuration.isValidForCategory(configuration.category)) {
        throw new ConfigurationValidationError(
          `Configuration is not valid for category '${configuration.category}'`,
          'FINAL_VALIDATION_FAILED',
          { category: configuration.category }
        );
      }

      // Validate required fields
      if (!configuration.metadata.title) {
        throw ConfigurationValidationError.missingRequired('metadata.title');
      }

      if (!configuration.metadata.description) {
        throw ConfigurationValidationError.missingRequired('metadata.description');
      }

      // Validate filter configuration
      if (!configuration.filterConfiguration) {
        throw ConfigurationValidationError.missingRequired('filterConfiguration');
      }

    } catch (error) {
      if (error instanceof ConfigurationValidationError) {
        throw error;
      }
      throw ConfigurationValidationError.transformationFailed(
        'final_validation',
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Creates FilterDefinition from raw filter and Zod schema
   */
  private _createFilterDefinition(rawFilter: any, zodSchema: z.ZodSchema): FilterDefinition {
    const options = rawFilter.options || [];
    
    switch (rawFilter.type) {
      case 'checkbox':
        return FilterDefinition.checkbox(rawFilter.id, rawFilter.name, options);
      case 'radio':
        return FilterDefinition.checkbox(rawFilter.id, rawFilter.name, options); // Use checkbox for radio in this implementation
      case 'range':
        return FilterDefinition.range(
          rawFilter.id,
          rawFilter.name,
          rawFilter.min || 0,
          rawFilter.max || 100
        );
      case 'select':
        return FilterDefinition.checkbox(rawFilter.id, rawFilter.name, options); // Use checkbox for select in this implementation
      case 'multiselect':
        return FilterDefinition.checkbox(rawFilter.id, rawFilter.name, options); // Use checkbox for multiselect in this implementation
      default:
        throw new ConfigurationValidationError(
          `Unsupported filter type: ${rawFilter.type}`,
          'UNSUPPORTED_FILTER_TYPE',
          { filterType: rawFilter.type, filterId: rawFilter.id }
        );
    }
  }

  /**
   * Updates success metrics
   */
  private _updateSuccessMetrics(validationTime: number): void {
    this.validationMetrics.successfulValidations++;
    this.validationMetrics.lastValidationTime = validationTime;
    
    // Update rolling average
    const totalTime = this.validationMetrics.averageValidationTime * (this.validationMetrics.successfulValidations - 1) + validationTime;
    this.validationMetrics.averageValidationTime = totalTime / this.validationMetrics.successfulValidations;
  }
}

export { RawConfigurationSchema };