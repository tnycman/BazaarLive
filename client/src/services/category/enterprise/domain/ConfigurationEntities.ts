/**
 * Configuration Entities
 * Domain entities using value objects for full type safety
 * Enterprise-grade implementation with comprehensive business logic
 */

import { z } from 'zod';
import {
  ConfigurationKey,
  FilterDefinition,
  LayoutConfiguration,
  PageMetadata,
  FilterType,
  FilterOption,
  ConfigurationValueObjectSchemas
} from './ConfigurationValueObjects';

/**
 * Filter Configuration Entity
 * Aggregates filter definitions with business rules
 */
export class FilterConfiguration {
  private readonly _availableFilters: FilterDefinition[];
  private readonly _defaultFilters: Map<string, any>;
  private readonly _filterValidationRules: Map<string, z.ZodSchema>;
  private readonly _categorySpecificFilters: FilterDefinition[];

  constructor(params: {
    availableFilters: FilterDefinition[];
    defaultFilters?: Map<string, any>;
    filterValidationRules?: Map<string, z.ZodSchema>;
    categorySpecificFilters?: FilterDefinition[];
  }) {
    this._availableFilters = this.validateAvailableFilters(params.availableFilters);
    this._defaultFilters = params.defaultFilters || new Map();
    this._filterValidationRules = params.filterValidationRules || new Map();
    this._categorySpecificFilters = params.categorySpecificFilters || [];

    // Cross-validation
    this.validateConfiguration();
  }

  private validateAvailableFilters(filters: FilterDefinition[]): FilterDefinition[] {
    if (!Array.isArray(filters)) {
      throw new Error('FilterConfiguration: Available filters must be an array');
    }

    // Check for duplicate filter IDs
    const ids = filters.map(filter => filter.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new Error('FilterConfiguration: Filter IDs must be unique');
    }

    return [...filters];
  }

  private validateConfiguration(): void {
    // Validate default filters exist in available filters
    for (const [filterId] of Array.from(this._defaultFilters.entries())) {
      const filter = this.getFilterById(filterId);
      if (!filter) {
        throw new Error(`FilterConfiguration: Default filter '${filterId}' not found in available filters`);
      }

      // Validate default value against filter's validation
      const defaultValue = this._defaultFilters.get(filterId);
      if (!filter.validateValue(defaultValue)) {
        throw new Error(`FilterConfiguration: Default value for '${filterId}' fails validation`);
      }
    }

    // Validate validation rules reference existing filters
    for (const [filterId] of Array.from(this._filterValidationRules.entries())) {
      if (!this.getFilterById(filterId)) {
        throw new Error(`FilterConfiguration: Validation rule for '${filterId}' references non-existent filter`);
      }
    }

    // Validate category-specific filters don't conflict
    const categoryIds = this._categorySpecificFilters.map(f => f.id);
    const availableIds = this._availableFilters.map(f => f.id);
    const conflicts = categoryIds.filter(id => availableIds.includes(id));
    if (conflicts.length > 0) {
      throw new Error(`FilterConfiguration: Category-specific filters conflict with available filters: ${conflicts.join(', ')}`);
    }
  }

  // Getters
  get availableFilters(): FilterDefinition[] { return [...this._availableFilters]; }
  get defaultFilters(): Map<string, any> { return new Map(this._defaultFilters); }
  get filterValidationRules(): Map<string, z.ZodSchema> { return new Map(this._filterValidationRules); }
  get categorySpecificFilters(): FilterDefinition[] { return [...this._categorySpecificFilters]; }

  // Business methods
  getFilterById(id: string): FilterDefinition | null {
    return this._availableFilters.find(filter => filter.id === id) || 
           this._categorySpecificFilters.find(filter => filter.id === id) || 
           null;
  }

  getAllFilters(): FilterDefinition[] {
    return [...this._availableFilters, ...this._categorySpecificFilters];
  }

  getRequiredFilters(): FilterDefinition[] {
    return this.getAllFilters().filter(filter => filter.required);
  }

  getFiltersByType(type: FilterType): FilterDefinition[] {
    return this.getAllFilters().filter(filter => filter.type === type);
  }

  getDefaultValue(filterId: string): any {
    return this._defaultFilters.get(filterId);
  }

  hasFilter(id: string): boolean {
    return this.getFilterById(id) !== null;
  }

  validateFilterValue(filterId: string, value: any): boolean {
    const filter = this.getFilterById(filterId);
    if (!filter) return false;

    // Use filter's built-in validation
    if (!filter.validateValue(value)) return false;

    // Apply additional validation rules if any
    const additionalRule = this._filterValidationRules.get(filterId);
    if (additionalRule) {
      try {
        additionalRule.parse(value);
      } catch {
        return false;
      }
    }

    return true;
  }

  getFilterValidationSchema(): z.ZodSchema {
    const schemaObject: Record<string, z.ZodSchema> = {};

    for (const filter of this.getAllFilters()) {
      let schema = filter.validation;
      
      // Apply additional rules if any
      const additionalRule = this._filterValidationRules.get(filter.id);
      if (additionalRule) {
        schema = additionalRule;
      }

      schemaObject[filter.id] = filter.required ? schema : schema.optional();
    }

    return z.object(schemaObject);
  }

  // Static factory methods
  static forCategory(category: string): FilterConfiguration {
    const commonFilters = FilterConfiguration.getCommonFilters();
    const categoryFilters = FilterConfiguration.getCategorySpecificFilters(category);

    return new FilterConfiguration({
      availableFilters: commonFilters,
      categorySpecificFilters: categoryFilters,
      defaultFilters: FilterConfiguration.getDefaultFiltersForCategory(category)
    });
  }

  private static getCommonFilters(): FilterDefinition[] {
    return [
      FilterDefinition.select('sortBy', 'Sort By', [
        { id: 'newest', name: 'Newest First' },
        { id: 'oldest', name: 'Oldest First' },
        { id: 'price-low', name: 'Price: Low to High' },
        { id: 'price-high', name: 'Price: High to Low' },
        { id: 'popular', name: 'Most Popular' }
      ]),
      
      FilterDefinition.range('priceRange', 'Price Range', 0, 1000),
      
      FilterDefinition.checkbox('condition', 'Condition', [
        { id: 'new', name: 'New' },
        { id: 'like-new', name: 'Like New' },
        { id: 'good', name: 'Good' },
        { id: 'fair', name: 'Fair' }
      ]),
      
      FilterDefinition.checkbox('brands', 'Brands', [
        { id: 'nike', name: 'Nike' },
        { id: 'adidas', name: 'Adidas' },
        { id: 'puma', name: 'Puma' },
        { id: 'other', name: 'Other' }
      ])
    ];
  }

  private static getCategorySpecificFilters(category: string): FilterDefinition[] {
    switch (category.toLowerCase()) {
      case 'women':
      case 'men':
      case 'kids':
        return [
          FilterDefinition.checkbox('sizes', 'Sizes', [
            { id: 'xs', name: 'XS' },
            { id: 's', name: 'S' },
            { id: 'm', name: 'M' },
            { id: 'l', name: 'L' },
            { id: 'xl', name: 'XL' },
            { id: 'xxl', name: 'XXL' }
          ]),
          
          FilterDefinition.checkbox('colors', 'Colors', [
            { id: 'black', name: 'Black' },
            { id: 'white', name: 'White' },
            { id: 'red', name: 'Red' },
            { id: 'blue', name: 'Blue' },
            { id: 'green', name: 'Green' }
          ])
        ];

      case 'electronics':
        return [
          FilterDefinition.checkbox('categories', 'Categories', [
            { id: 'phones', name: 'Smartphones' },
            { id: 'laptops', name: 'Laptops' },
            { id: 'tablets', name: 'Tablets' },
            { id: 'accessories', name: 'Accessories' }
          ])
        ];

      case 'home':
        return [
          FilterDefinition.checkbox('rooms', 'Rooms', [
            { id: 'living-room', name: 'Living Room' },
            { id: 'bedroom', name: 'Bedroom' },
            { id: 'kitchen', name: 'Kitchen' },
            { id: 'bathroom', name: 'Bathroom' }
          ])
        ];

      default:
        return [];
    }
  }

  private static getDefaultFiltersForCategory(category: string): Map<string, any> {
    const defaults = new Map();
    defaults.set('sortBy', 'newest');
    defaults.set('condition', ['new', 'like-new']);

    // Category-specific defaults
    switch (category.toLowerCase()) {
      case 'women':
      case 'men':
      case 'kids':
        defaults.set('sizes', ['m', 'l']);
        break;
    }

    return defaults;
  }
}

/**
 * Theme Configuration Entity
 * Visual theme and styling configuration
 */
export class ThemeConfiguration {
  private readonly _primaryGradient: string;
  private readonly _secondaryGradient: string;
  private readonly _accentColor: string;
  private readonly _textColor: string;
  private readonly _backgroundColor: string;
  private readonly _borderRadius: string;
  private readonly _customCSS?: string;

  constructor(params: {
    primaryGradient: string;
    secondaryGradient: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    borderRadius: string;
    customCSS?: string;
  }) {
    this._primaryGradient = this.validateGradient(params.primaryGradient);
    this._secondaryGradient = this.validateGradient(params.secondaryGradient);
    this._accentColor = this.validateColor(params.accentColor);
    this._textColor = this.validateColor(params.textColor);
    this._backgroundColor = this.validateColor(params.backgroundColor);
    this._borderRadius = this.validateBorderRadius(params.borderRadius);
    this._customCSS = params.customCSS;
  }

  private validateGradient(gradient: string): string {
    if (!gradient || typeof gradient !== 'string') {
      throw new Error('ThemeConfiguration: Gradient must be a non-empty string');
    }
    // Basic gradient validation - should start with linear-gradient, radial-gradient, etc.
    if (!/^(linear|radial|conic)-gradient\(/.test(gradient)) {
      throw new Error('ThemeConfiguration: Invalid gradient format');
    }
    return gradient;
  }

  private validateColor(color: string): string {
    if (!color || typeof color !== 'string') {
      throw new Error('ThemeConfiguration: Color must be a non-empty string');
    }
    // Basic color validation - hex, rgb, hsl, named colors
    const colorRegex = /^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|\w+).*$/i;
    if (!colorRegex.test(color)) {
      throw new Error('ThemeConfiguration: Invalid color format');
    }
    return color;
  }

  private validateBorderRadius(radius: string): string {
    if (!radius || typeof radius !== 'string') {
      throw new Error('ThemeConfiguration: Border radius must be a non-empty string');
    }
    if (!/^\d+(\.\d+)?(px|rem|em|%)$/.test(radius)) {
      throw new Error('ThemeConfiguration: Border radius must be valid CSS unit');
    }
    return radius;
  }

  // Getters
  get primaryGradient(): string { return this._primaryGradient; }
  get secondaryGradient(): string { return this._secondaryGradient; }
  get accentColor(): string { return this._accentColor; }
  get textColor(): string { return this._textColor; }
  get backgroundColor(): string { return this._backgroundColor; }
  get borderRadius(): string { return this._borderRadius; }
  get customCSS(): string | undefined { return this._customCSS; }

  // Business methods
  generateCSS(): string {
    let css = `
      :root {
        --primary-gradient: ${this._primaryGradient};
        --secondary-gradient: ${this._secondaryGradient};
        --accent-color: ${this._accentColor};
        --text-color: ${this._textColor};
        --background-color: ${this._backgroundColor};
        --border-radius: ${this._borderRadius};
      }
    `;

    if (this._customCSS) {
      css += '\n' + this._customCSS;
    }

    return css;
  }

  equals(other: ThemeConfiguration): boolean {
    return this._primaryGradient === other._primaryGradient &&
           this._secondaryGradient === other._secondaryGradient &&
           this._accentColor === other._accentColor &&
           this._textColor === other._textColor &&
           this._backgroundColor === other._backgroundColor &&
           this._borderRadius === other._borderRadius &&
           this._customCSS === other._customCSS;
  }

  // Static factory methods
  static forCategory(category: string): ThemeConfiguration {
    const themes: Record<string, { primaryGradient: string; secondaryGradient: string; accentColor: string }> = {
      women: {
        primaryGradient: 'linear-gradient(135deg, #ff6b9d, #c44569)',
        secondaryGradient: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
        accentColor: '#e84393'
      },
      men: {
        primaryGradient: 'linear-gradient(135deg, #74b9ff, #0984e3)',
        secondaryGradient: 'linear-gradient(135deg, #81ecec, #00cec9)',
        accentColor: '#0984e3'
      },
      kids: {
        primaryGradient: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
        secondaryGradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
        accentColor: '#fd79a8'
      },
      electronics: {
        primaryGradient: 'linear-gradient(135deg, #636e72, #2d3436)',
        secondaryGradient: 'linear-gradient(135deg, #74b9ff, #0984e3)',
        accentColor: '#0984e3'
      },
      home: {
        primaryGradient: 'linear-gradient(135deg, #00b894, #00a085)',
        secondaryGradient: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
        accentColor: '#00b894'
      }
    };

    const theme = themes[category.toLowerCase()] || themes.women;
    
    return new ThemeConfiguration({
      primaryGradient: theme.primaryGradient || 'linear-gradient(135deg, #667eea, #764ba2)',
      secondaryGradient: theme.secondaryGradient || 'linear-gradient(135deg, #f093fb, #f5576c)',
      accentColor: theme.accentColor || '#667eea',
      textColor: '#2d3436',
      backgroundColor: '#ffffff',
      borderRadius: '8px'
    });
  }
}

/**
 * Universal Page Configuration Entity
 * Root aggregate combining all configuration value objects
 */
export class UniversalPageConfiguration {
  private readonly _key: ConfigurationKey;
  private readonly _category: string;
  private readonly _metadata: PageMetadata;
  private readonly _filterConfiguration: FilterConfiguration;
  private readonly _layoutConfiguration: LayoutConfiguration;
  private readonly _themeConfiguration: ThemeConfiguration;
  private readonly _searchConfiguration: SearchConfiguration;
  private readonly _validationConfiguration: ValidationConfiguration;
  private readonly _isActive: boolean;
  private readonly _version: string;
  private readonly _lastModified: Date;

  constructor(params: {
    key: ConfigurationKey;
    category: string;
    metadata: PageMetadata;
    filterConfiguration: FilterConfiguration;
    layoutConfiguration: LayoutConfiguration;
    themeConfiguration: ThemeConfiguration;
    searchConfiguration: SearchConfiguration;
    validationConfiguration: ValidationConfiguration;
    isActive?: boolean;
    version?: string;
    lastModified?: Date;
  }) {
    this._key = params.key;
    this._category = this.validateCategory(params.category);
    this._metadata = params.metadata;
    this._filterConfiguration = params.filterConfiguration;
    this._layoutConfiguration = params.layoutConfiguration;
    this._themeConfiguration = params.themeConfiguration;
    this._searchConfiguration = params.searchConfiguration;
    this._validationConfiguration = params.validationConfiguration;
    this._isActive = params.isActive ?? true;
    this._version = params.version || '1.0.0';
    this._lastModified = params.lastModified || new Date();

    // Cross-validation
    this.validateConfiguration();
  }

  private validateCategory(category: string): string {
    if (!category || typeof category !== 'string') {
      throw new Error('UniversalPageConfiguration: Category is required');
    }
    
    const validCategories = [
      'women', 'men', 'kids', 'home', 'electronics', 
      'pets', 'beauty', 'sports', 'brands', 'jobs', 
      'real-estate', 'cars', 'boats', 'services'
    ];
    
    if (!validCategories.includes(category.toLowerCase())) {
      throw new Error(`UniversalPageConfiguration: Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}`);
    }
    
    return category.toLowerCase();
  }

  private validateConfiguration(): void {
    // Validate key matches category
    const keyCategory = this._key.getCategory();
    if (keyCategory && keyCategory !== this._category) {
      throw new Error(`UniversalPageConfiguration: Key category '${keyCategory}' doesn't match configuration category '${this._category}'`);
    }

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(this._version)) {
      throw new Error('UniversalPageConfiguration: Version must follow semantic versioning (x.y.z)');
    }
  }

  // Getters
  get key(): ConfigurationKey { return this._key; }
  get category(): string { return this._category; }
  get metadata(): PageMetadata { return this._metadata; }
  get filterConfiguration(): FilterConfiguration { return this._filterConfiguration; }
  get layoutConfiguration(): LayoutConfiguration { return this._layoutConfiguration; }
  get themeConfiguration(): ThemeConfiguration { return this._themeConfiguration; }
  get searchConfiguration(): SearchConfiguration { return this._searchConfiguration; }
  get validationConfiguration(): ValidationConfiguration { return this._validationConfiguration; }
  get isActive(): boolean { return this._isActive; }
  get version(): string { return this._version; }
  get lastModified(): Date { return this._lastModified; }

  // Business methods
  isValidForCategory(category: string): boolean {
    return this._category === category.toLowerCase();
  }

  getPageTitle(): string {
    return this._metadata.title;
  }

  getFilterValidationSchema(): z.ZodSchema {
    return this._filterConfiguration.getFilterValidationSchema();
  }

  generateCSS(): string {
    return this._themeConfiguration.generateCSS();
  }

  getMetaTags(): Record<string, string> {
    return this._metadata.generateMetaTags();
  }

  isExpired(ttlHours = 24): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - this._lastModified.getTime()) / (1000 * 60 * 60);
    return diffHours > ttlHours;
  }

  createUpdatedVersion(updates: Partial<UniversalPageConfiguration>): UniversalPageConfiguration {
    return new UniversalPageConfiguration({
      key: this._key,
      category: this._category,
      metadata: updates.metadata || this._metadata,
      filterConfiguration: updates.filterConfiguration || this._filterConfiguration,
      layoutConfiguration: updates.layoutConfiguration || this._layoutConfiguration,
      themeConfiguration: updates.themeConfiguration || this._themeConfiguration,
      searchConfiguration: updates.searchConfiguration || this._searchConfiguration,
      validationConfiguration: updates.validationConfiguration || this._validationConfiguration,
      isActive: updates.isActive ?? this._isActive,
      version: this.incrementVersion(),
      lastModified: new Date()
    });
  }

  private incrementVersion(): string {
    const [major, minor, patch] = this._version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  equals(other: UniversalPageConfiguration): boolean {
    return this._key.equals(other._key) &&
           this._category === other._category &&
           this._version === other._version;
  }

  // Static factory methods
  static forCategory(category: string): UniversalPageConfiguration {
    const key = ConfigurationKey.forCategory('fashion', category);
    
    return new UniversalPageConfiguration({
      key,
      category,
      metadata: new PageMetadata({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Fashion - BazaarLive`,
        description: `Discover the latest ${category} fashion trends and styles on BazaarLive marketplace`,
        keywords: [category, 'fashion', 'clothing', 'style', 'marketplace']
      }),
      filterConfiguration: FilterConfiguration.forCategory(category),
      layoutConfiguration: LayoutConfiguration.default(),
      themeConfiguration: ThemeConfiguration.forCategory(category),
      searchConfiguration: SearchConfiguration.default(),
      validationConfiguration: ValidationConfiguration.default()
    });
  }

  toJSON(): object {
    return {
      key: this._key.value,
      category: this._category,
      metadata: {
        title: this._metadata.title,
        description: this._metadata.description,
        keywords: this._metadata.keywords
      },
      isActive: this._isActive,
      version: this._version,
      lastModified: this._lastModified.toISOString()
    };
  }
}

// Supporting Configuration Entities

export class SearchConfiguration {
  private readonly _enabled: boolean;
  private readonly _placeholder: string;
  private readonly _searchFields: string[];
  private readonly _minQueryLength: number;
  private readonly _debounceMs: number;

  constructor(params: {
    enabled?: boolean;
    placeholder?: string;
    searchFields?: string[];
    minQueryLength?: number;
    debounceMs?: number;
  }) {
    this._enabled = params.enabled ?? true;
    this._placeholder = params.placeholder || 'Search products...';
    this._searchFields = params.searchFields || ['title', 'description', 'brand'];
    this._minQueryLength = params.minQueryLength || 2;
    this._debounceMs = params.debounceMs || 300;
  }

  get enabled(): boolean { return this._enabled; }
  get placeholder(): string { return this._placeholder; }
  get searchFields(): string[] { return [...this._searchFields]; }
  get minQueryLength(): number { return this._minQueryLength; }
  get debounceMs(): number { return this._debounceMs; }

  static default(): SearchConfiguration {
    return new SearchConfiguration({});
  }
}

export class ValidationConfiguration {
  private readonly _strictMode: boolean;
  private readonly _validateOnMount: boolean;
  private readonly _showValidationErrors: boolean;
  private readonly _validationTimeout: number;

  constructor(params: {
    strictMode?: boolean;
    validateOnMount?: boolean;
    showValidationErrors?: boolean;
    validationTimeout?: number;
  }) {
    this._strictMode = params.strictMode ?? true;
    this._validateOnMount = params.validateOnMount ?? true;
    this._showValidationErrors = params.showValidationErrors ?? true;
    this._validationTimeout = params.validationTimeout || 5000;
  }

  get strictMode(): boolean { return this._strictMode; }
  get validateOnMount(): boolean { return this._validateOnMount; }
  get showValidationErrors(): boolean { return this._showValidationErrors; }
  get validationTimeout(): number { return this._validationTimeout; }

  static default(): ValidationConfiguration {
    return new ValidationConfiguration({});
  }
}

// Validation schemas for external use
export const ConfigurationEntitySchemas = {
  filterConfiguration: z.object({
    availableFilters: z.array(ConfigurationValueObjectSchemas.filterDefinition),
    defaultFilters: z.record(z.any()).optional(),
    categorySpecificFilters: z.array(ConfigurationValueObjectSchemas.filterDefinition).optional()
  }),

  themeConfiguration: z.object({
    primaryGradient: z.string(),
    secondaryGradient: z.string(),
    accentColor: z.string(),
    textColor: z.string(),
    backgroundColor: z.string(),
    borderRadius: z.string(),
    customCSS: z.string().optional()
  }),

  universalPageConfiguration: z.object({
    key: ConfigurationValueObjectSchemas.configurationKey,
    category: z.string(),
    metadata: ConfigurationValueObjectSchemas.pageMetadata,
    isActive: z.boolean().optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastModified: z.string().datetime().optional()
  })
};