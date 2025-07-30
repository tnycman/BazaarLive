/**
 * Configuration Value Objects
 * Immutable value objects with enforced invariants for configuration domain
 * Enterprise-grade implementation with comprehensive validation and type safety
 */

import { z } from 'zod';

/**
 * Configuration Key Value Object
 * Enforces valid key format and business rules
 */
export class ConfigurationKey {
  private readonly _value: string;

  constructor(value: string) {
    this._value = this.validate(value);
  }

  private validate(value: string): string {
    // Business rules for configuration keys
    if (!value || typeof value !== 'string') {
      throw new Error('ConfigurationKey: Value must be a non-empty string');
    }

    if (value.length < 3 || value.length > 100) {
      throw new Error('ConfigurationKey: Key length must be between 3 and 100 characters');
    }

    // Must follow kebab-case pattern
    const kebabCasePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabCasePattern.test(value)) {
      throw new Error('ConfigurationKey: Key must follow kebab-case pattern (lowercase letters, numbers, hyphens only)');
    }

    // Business domain validation
    const validPrefixes = ['fashion', 'jobs', 'real-estate', 'cars', 'boats', 'services', 'electronics', 'home', 'pets', 'beauty', 'sports', 'brands'];
    const hasValidPrefix = validPrefixes.some(prefix => value.startsWith(prefix));
    
    if (!hasValidPrefix) {
      throw new Error(`ConfigurationKey: Key must start with valid domain prefix: ${validPrefixes.join(', ')}`);
    }

    return value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ConfigurationKey): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Static factory methods
  static fromString(value: string): ConfigurationKey {
    return new ConfigurationKey(value);
  }

  static forCategory(domain: string, category: string): ConfigurationKey {
    return new ConfigurationKey(`${domain}-${category}`);
  }

  // Extract domain and category
  getDomain(): string {
    return this._value.split('-')[0];
  }

  getCategory(): string | null {
    const parts = this._value.split('-');
    return parts.length > 1 ? parts[1] : null;
  }

  // Validation schema for external use
  static readonly schema = z.string()
    .min(3, 'Key must be at least 3 characters')
    .max(100, 'Key must not exceed 100 characters')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Key must follow kebab-case pattern');
}

/**
 * Filter Definition Value Object
 * Immutable filter configuration with type safety
 */
export class FilterDefinition {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _type: FilterType;
  private readonly _options: FilterOption[];
  private readonly _validation: z.ZodSchema;
  private readonly _required: boolean;
  private readonly _defaultValue: any;

  constructor(params: {
    id: string;
    name: string;
    type: FilterType;
    options: FilterOption[];
    validation: z.ZodSchema;
    required?: boolean;
    defaultValue?: any;
  }) {
    this._id = this.validateId(params.id);
    this._name = this.validateName(params.name);
    this._type = params.type;
    this._options = this.validateOptions(params.options, params.type);
    this._validation = params.validation;
    this._required = params.required ?? false;
    this._defaultValue = params.defaultValue;

    // Cross-validation
    this.validateConsistency();
  }

  private validateId(id: string): string {
    if (!id || typeof id !== 'string') {
      throw new Error('FilterDefinition: ID must be a non-empty string');
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) {
      throw new Error('FilterDefinition: ID must start with letter and contain only letters, numbers, underscores, hyphens');
    }
    return id;
  }

  private validateName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new Error('FilterDefinition: Name must be a non-empty string');
    }
    if (name.length < 2 || name.length > 50) {
      throw new Error('FilterDefinition: Name must be between 2 and 50 characters');
    }
    return name;
  }

  private validateOptions(options: FilterOption[], type: FilterType): FilterOption[] {
    if (!Array.isArray(options)) {
      throw new Error('FilterDefinition: Options must be an array');
    }

    // Type-specific validation
    switch (type) {
      case FilterType.CHECKBOX:
      case FilterType.RADIO:
      case FilterType.SELECT:
        if (options.length === 0) {
          throw new Error(`FilterDefinition: ${type} filter must have at least one option`);
        }
        break;
      case FilterType.RANGE:
        if (options.length !== 2) {
          throw new Error('FilterDefinition: Range filter must have exactly two options (min, max)');
        }
        break;
      case FilterType.TEXT:
      case FilterType.NUMBER:
        // These types don't require options
        break;
    }

    // Validate each option
    options.forEach((option, index) => {
      if (!option.id || !option.name) {
        throw new Error(`FilterDefinition: Option ${index} must have id and name`);
      }
    });

    // Check for duplicate IDs
    const ids = options.map(opt => opt.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new Error('FilterDefinition: Options must have unique IDs');
    }

    return [...options]; // Return copy to maintain immutability
  }

  private validateConsistency(): void {
    // Validate default value against validation schema
    if (this._defaultValue !== undefined) {
      try {
        this._validation.parse(this._defaultValue);
      } catch (error) {
        throw new Error(`FilterDefinition: Default value fails validation: ${error}`);
      }
    }

    // Required filters should have no default value or explicit default
    if (this._required && this._defaultValue === undefined) {
      // This is OK - required fields can have no default
    }
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get type(): FilterType { return this._type; }
  get options(): FilterOption[] { return [...this._options]; }
  get validation(): z.ZodSchema { return this._validation; }
  get required(): boolean { return this._required; }
  get defaultValue(): any { return this._defaultValue; }

  // Business methods
  validateValue(value: any): boolean {
    try {
      this._validation.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  getOptionById(id: string): FilterOption | null {
    return this._options.find(opt => opt.id === id) || null;
  }

  hasOption(id: string): boolean {
    return this._options.some(opt => opt.id === id);
  }

  equals(other: FilterDefinition): boolean {
    return this._id === other._id &&
           this._name === other._name &&
           this._type === other._type &&
           JSON.stringify(this._options) === JSON.stringify(other._options);
  }

  // Static factory methods
  static checkbox(id: string, name: string, options: FilterOption[]): FilterDefinition {
    return new FilterDefinition({
      id,
      name,
      type: FilterType.CHECKBOX,
      options,
      validation: z.array(z.string())
    });
  }

  static select(id: string, name: string, options: FilterOption[], required = false): FilterDefinition {
    return new FilterDefinition({
      id,
      name,
      type: FilterType.SELECT,
      options,
      validation: required ? z.string().min(1) : z.string().optional(),
      required
    });
  }

  static range(id: string, name: string, min: number, max: number): FilterDefinition {
    return new FilterDefinition({
      id,
      name,
      type: FilterType.RANGE,
      options: [
        { id: 'min', name: 'Minimum', value: min },
        { id: 'max', name: 'Maximum', value: max }
      ],
      validation: z.object({
        min: z.number().min(min).max(max),
        max: z.number().min(min).max(max)
      })
    });
  }
}

/**
 * Layout Configuration Value Object
 * Defines page layout parameters with validation
 */
export class LayoutConfiguration {
  private readonly _columns: number;
  private readonly _gridGap: string;
  private readonly _responsive: ResponsiveConfig;
  private readonly _sidebar: SidebarConfig;

  constructor(params: {
    columns: number;
    gridGap: string;
    responsive: ResponsiveConfig;
    sidebar: SidebarConfig;
  }) {
    this._columns = this.validateColumns(params.columns);
    this._gridGap = this.validateGridGap(params.gridGap);
    this._responsive = this.validateResponsive(params.responsive);
    this._sidebar = params.sidebar;
  }

  private validateColumns(columns: number): number {
    if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
      throw new Error('LayoutConfiguration: Columns must be integer between 1 and 12');
    }
    return columns;
  }

  private validateGridGap(gap: string): string {
    // Validate CSS gap value (rem, px, etc.)
    if (!gap || typeof gap !== 'string') {
      throw new Error('LayoutConfiguration: Grid gap must be a valid CSS value');
    }
    if (!/^\d+(\.\d+)?(px|rem|em|%)$/.test(gap)) {
      throw new Error('LayoutConfiguration: Grid gap must be valid CSS unit (px, rem, em, %)');
    }
    return gap;
  }

  private validateResponsive(responsive: ResponsiveConfig): ResponsiveConfig {
    if (!responsive || typeof responsive !== 'object') {
      throw new Error('LayoutConfiguration: Responsive config is required');
    }
    
    // Validate breakpoints
    const breakpoints = ['mobile', 'tablet', 'desktop'] as const;
    for (const bp of breakpoints) {
      if (responsive[bp] && (responsive[bp].columns < 1 || responsive[bp].columns > 12)) {
        throw new Error(`LayoutConfiguration: ${bp} columns must be between 1 and 12`);
      }
    }

    return responsive;
  }

  // Getters
  get columns(): number { return this._columns; }
  get gridGap(): string { return this._gridGap; }
  get responsive(): ResponsiveConfig { return this._responsive; }
  get sidebar(): SidebarConfig { return this._sidebar; }

  // Business methods
  getColumnsForBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): number {
    return this._responsive[breakpoint]?.columns || this._columns;
  }

  equals(other: LayoutConfiguration): boolean {
    return this._columns === other._columns &&
           this._gridGap === other._gridGap &&
           JSON.stringify(this._responsive) === JSON.stringify(other._responsive) &&
           JSON.stringify(this._sidebar) === JSON.stringify(other._sidebar);
  }

  // Static factory
  static default(): LayoutConfiguration {
    return new LayoutConfiguration({
      columns: 3,
      gridGap: '1rem',
      responsive: {
        mobile: { columns: 1 },
        tablet: { columns: 2 },
        desktop: { columns: 3 }
      },
      sidebar: {
        position: 'left',
        width: '250px',
        collapsible: true
      }
    });
  }
}

/**
 * Metadata Value Object
 * SEO and page metadata with validation
 */
export class PageMetadata {
  private readonly _title: string;
  private readonly _description: string;
  private readonly _keywords: string[];
  private readonly _canonicalUrl?: string;
  private readonly _openGraphImage?: string;
  private readonly _structuredData?: Record<string, any>;

  constructor(params: {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    openGraphImage?: string;
    structuredData?: Record<string, any>;
  }) {
    this._title = this.validateTitle(params.title);
    this._description = this.validateDescription(params.description);
    this._keywords = this.validateKeywords(params.keywords || []);
    this._canonicalUrl = this.validateUrl(params.canonicalUrl);
    this._openGraphImage = this.validateUrl(params.openGraphImage);
    this._structuredData = params.structuredData;
  }

  private validateTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      throw new Error('PageMetadata: Title is required');
    }
    if (title.length < 10 || title.length > 60) {
      throw new Error('PageMetadata: Title must be between 10 and 60 characters for SEO');
    }
    return title;
  }

  private validateDescription(description: string): string {
    if (!description || typeof description !== 'string') {
      throw new Error('PageMetadata: Description is required');
    }
    if (description.length < 50 || description.length > 160) {
      throw new Error('PageMetadata: Description must be between 50 and 160 characters for SEO');
    }
    return description;
  }

  private validateKeywords(keywords: string[]): string[] {
    if (!Array.isArray(keywords)) {
      throw new Error('PageMetadata: Keywords must be an array');
    }
    if (keywords.length > 10) {
      throw new Error('PageMetadata: Maximum 10 keywords recommended for SEO');
    }
    return [...keywords];
  }

  private validateUrl(url?: string): string | undefined {
    if (!url) return undefined;
    
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error('PageMetadata: Invalid URL format');
    }
  }

  // Getters
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get keywords(): string[] { return [...this._keywords]; }
  get canonicalUrl(): string | undefined { return this._canonicalUrl; }
  get openGraphImage(): string | undefined { return this._openGraphImage; }
  get structuredData(): Record<string, any> | undefined { return this._structuredData; }

  // Business methods
  generateMetaTags(): Record<string, string> {
    const tags: Record<string, string> = {
      title: this._title,
      description: this._description,
      keywords: this._keywords.join(', ')
    };

    if (this._canonicalUrl) {
      tags['canonical'] = this._canonicalUrl;
    }

    if (this._openGraphImage) {
      tags['og:image'] = this._openGraphImage;
      tags['og:title'] = this._title;
      tags['og:description'] = this._description;
    }

    return tags;
  }

  equals(other: PageMetadata): boolean {
    return this._title === other._title &&
           this._description === other._description &&
           JSON.stringify(this._keywords) === JSON.stringify(other._keywords) &&
           this._canonicalUrl === other._canonicalUrl &&
           this._openGraphImage === other._openGraphImage;
  }
}

// Supporting Types and Enums

export enum FilterType {
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  RANGE = 'range',
  TEXT = 'text',
  NUMBER = 'number'
}

export interface FilterOption {
  id: string;
  name: string;
  value?: any;
  disabled?: boolean;
}

export interface ResponsiveConfig {
  mobile?: { columns: number };
  tablet?: { columns: number };
  desktop?: { columns: number };
}

export interface SidebarConfig {
  position: 'left' | 'right';
  width: string;
  collapsible: boolean;
}

// Validation schemas for external use
export const ConfigurationValueObjectSchemas = {
  configurationKey: ConfigurationKey.schema,
  
  filterDefinition: z.object({
    id: z.string().min(1),
    name: z.string().min(2).max(50),
    type: z.nativeEnum(FilterType),
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      value: z.any().optional(),
      disabled: z.boolean().optional()
    })),
    required: z.boolean().optional(),
    defaultValue: z.any().optional()
  }),

  layoutConfiguration: z.object({
    columns: z.number().int().min(1).max(12),
    gridGap: z.string().regex(/^\d+(\.\d+)?(px|rem|em|%)$/),
    responsive: z.object({
      mobile: z.object({ columns: z.number().int().min(1).max(12) }).optional(),
      tablet: z.object({ columns: z.number().int().min(1).max(12) }).optional(),
      desktop: z.object({ columns: z.number().int().min(1).max(12) }).optional()
    }),
    sidebar: z.object({
      position: z.enum(['left', 'right']),
      width: z.string(),
      collapsible: z.boolean()
    })
  }),

  pageMetadata: z.object({
    title: z.string().min(10).max(60),
    description: z.string().min(50).max(160),
    keywords: z.array(z.string()).max(10).optional(),
    canonicalUrl: z.string().url().optional(),
    openGraphImage: z.string().url().optional(),
    structuredData: z.record(z.any()).optional()
  })
};