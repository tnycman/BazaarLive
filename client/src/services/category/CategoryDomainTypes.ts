/**
 * Enterprise Category Domain Types
 * Domain-Driven Design implementation for category-specific business logic
 * Maintains strict type safety and separation of concerns
 */

import { z } from 'zod';

// Base Domain Entity
export interface CategoryDomain {
  readonly vertical: string;
  readonly category: string;
  readonly metadata: CategoryMetadata;
}

// Category Metadata Schema
export const CategoryMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  gradient: z.string(),
  placeholder: z.string(),
  icon: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});

export type CategoryMetadata = z.infer<typeof CategoryMetadataSchema>;

// Size Chart Definitions
export interface SizeChart {
  readonly type: 'women' | 'men' | 'kids' | 'unisex';
  readonly sizes: readonly string[];
  readonly sizeGuide: Record<string, string>;
}

export const WomenSizeChart: SizeChart = {
  type: 'women',
  sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '0', '2', '4', '6', '8', '10', '12', '14', '16'],
  sizeGuide: {
    'XXS': 'US 0-2',
    'XS': 'US 2-4',
    'S': 'US 4-6',
    'M': 'US 8-10',
    'L': 'US 12-14',
    'XL': 'US 16-18',
    'XXL': 'US 20-22'
  }
};

export const MenSizeChart: SizeChart = {
  type: 'men',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42'],
  sizeGuide: {
    'XS': 'Chest 32-34"',
    'S': 'Chest 34-36"',
    'M': 'Chest 36-38"',
    'L': 'Chest 40-42"',
    'XL': 'Chest 44-46"',
    'XXL': 'Chest 48-50"',
    'XXXL': 'Chest 52-54"'
  }
};

export const KidsSizeChart: SizeChart = {
  type: 'kids',
  sizes: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'],
  sizeGuide: {
    '2T': 'Age 2-3',
    '3T': 'Age 3-4',
    '4T': 'Age 4-5',
    '5T': 'Age 5-6',
    '6': 'Age 6-7',
    '8': 'Age 7-8',
    '10': 'Age 9-10',
    '12': 'Age 11-12',
    '14': 'Age 13-14',
    '16': 'Age 15-16'
  }
};

// Subcategory Definitions
export interface SubcategoryDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly filterTags: readonly string[];
}

// Women Fashion Domain
export interface WomenFashionDomain extends CategoryDomain {
  readonly vertical: 'fashion';
  readonly category: 'women';
  readonly sizeChart: typeof WomenSizeChart;
  readonly subcategories: readonly SubcategoryDefinition[];
  readonly preferredBrands: readonly string[];
}

// Men Fashion Domain
export interface MenFashionDomain extends CategoryDomain {
  readonly vertical: 'fashion';
  readonly category: 'men';
  readonly sizeChart: typeof MenSizeChart;
  readonly subcategories: readonly SubcategoryDefinition[];
  readonly preferredBrands: readonly string[];
}

// Kids Fashion Domain
export interface KidsFashionDomain extends CategoryDomain {
  readonly vertical: 'fashion';
  readonly category: 'kids';
  readonly sizeChart: typeof KidsSizeChart;
  readonly subcategories: readonly SubcategoryDefinition[];
  readonly preferredBrands: readonly string[];
}

// Domain Factory Pattern
export abstract class CategoryDomainFactory {
  abstract createDomain(vertical: string, category: string): CategoryDomain;
  abstract validateDomain(domain: CategoryDomain): boolean;
  abstract getDomainMetadata(vertical: string, category: string): CategoryMetadata;
}

// Type Guards for Domain Validation
export function isWomenFashionDomain(domain: CategoryDomain): domain is WomenFashionDomain {
  return domain.vertical === 'fashion' && domain.category === 'women';
}

export function isMenFashionDomain(domain: CategoryDomain): domain is MenFashionDomain {
  return domain.vertical === 'fashion' && domain.category === 'men';
}

export function isKidsFashionDomain(domain: CategoryDomain): domain is KidsFashionDomain {
  return domain.vertical === 'fashion' && domain.category === 'kids';
}

// Category Strategy Interface
export interface CategoryStrategy {
  readonly domain: CategoryDomain;
  getFilterConfiguration(): FilterConfiguration;
  validateSelection(selection: CategorySelection): ValidationResult;
  transformListingData(rawData: RawListingData[]): CategorySpecificListingData[];
  getAnalyticsConfiguration(): AnalyticsConfiguration;
}

// Supporting Types
export interface FilterConfiguration {
  readonly availableFilters: readonly string[];
  readonly defaultFilters: Record<string, any>;
  readonly filterValidationRules: Record<string, ValidationRule>;
}

export interface CategorySelection {
  readonly level1?: string;
  readonly level2?: string;
  readonly level3?: string;
  readonly metadata?: Record<string, any>;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ValidationRule {
  readonly required: boolean;
  readonly type: string;
  readonly validator: (value: any) => boolean;
  readonly errorMessage: string;
}

export interface RawListingData {
  readonly id?: string;
  readonly title?: string;
  readonly description?: string;
  readonly price?: string;
  readonly category?: string;
  readonly subcategory?: string;
  readonly brand?: string;
  readonly size?: string;
  readonly condition?: string;
  readonly images?: readonly string[];
  readonly userId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly metadata?: Record<string, any>;
}

export interface CategorySpecificListingData extends RawListingData {
  readonly domainSpecificData: Record<string, any>;
  readonly categoryValidation: ValidationResult;
  readonly recommendedFilters: readonly string[];
}

export interface AnalyticsConfiguration {
  readonly trackingEvents: readonly string[];
  readonly conversionGoals: readonly string[];
  readonly segmentationRules: Record<string, any>;
}

// Export all domain types for use in strategies
export type FashionDomain = WomenFashionDomain | MenFashionDomain | KidsFashionDomain;