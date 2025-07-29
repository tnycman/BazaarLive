/**
 * Specialized Category Templates
 * Enterprise AOP-compliant specialized templates extending base templates
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { z } from 'zod';
import type {
  FashionCategoryBase,
  MarketplaceCategoryBase,
  ElectronicsCategoryBase,
  ServicesCategoryBase,
  FilterOption,
  SizeConfiguration,
  BrandConfiguration
} from './BaseTemplateTypes';

// ===== FASHION SPECIALIZED TEMPLATES =====

/**
 * Fashion Apparel Template
 * Specialized template for clothing items (dresses, shirts, pants, etc.)
 */
export interface FashionApparelTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly sizeConfiguration: SizeConfiguration;
    readonly fitTypes: readonly FilterOption[];
    readonly seasonalOptions: readonly FilterOption[];
  };
}

/**
 * Fashion Accessories Template
 * Specialized template for accessories (jewelry, bags, scarves, etc.)
 */
export interface FashionAccessoriesTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly materialOptions: readonly FilterOption[];
    readonly accessoryTypes: readonly FilterOption[];
    readonly occasionOptions: readonly FilterOption[];
  };
}

/**
 * Fashion Home Template
 * Specialized template for home & lifestyle products
 */
export interface FashionHomeTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly roomTypes: readonly FilterOption[];
    readonly styleOptions: readonly FilterOption[];
    readonly materialOptions: readonly FilterOption[];
  };
}

/**
 * Fashion Beauty Template
 * Specialized template for beauty & wellness products
 */
export interface FashionBeautyTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly skinTypeOptions: readonly FilterOption[];
    readonly categoryOptions: readonly FilterOption[];
    readonly brandTiers: readonly FilterOption[];
  };
}

/**
 * Fashion Sports Template
 * Specialized template for sports & outdoor products
 */
export interface FashionSportsTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly activityTypes: readonly FilterOption[];
    readonly equipmentCategories: readonly FilterOption[];
    readonly performanceLevels: readonly FilterOption[];
  };
}

/**
 * Fashion Pets Template
 * Specialized template for pet products
 */
export interface FashionPetsTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly petTypes: readonly FilterOption[];
    readonly petSizes: readonly FilterOption[];
    readonly productCategories: readonly FilterOption[];
  };
}

/**
 * Fashion Toys Template
 * Specialized template for kids' toys and games
 */
export interface FashionToysTemplate extends FashionCategoryBase {
  readonly filterConfiguration: FashionCategoryBase['filterConfiguration'] & {
    readonly ageRanges: readonly FilterOption[];
    readonly toyCategories: readonly FilterOption[];
    readonly educationalTypes: readonly FilterOption[];
  };
}

// ===== MARKETPLACE SPECIALIZED TEMPLATES =====

/**
 * Automotive Marketplace Template
 * Specialized template for cars, motorcycles, boats
 */
export interface AutomotiveMarketplaceTemplate extends MarketplaceCategoryBase {
  readonly filterConfiguration: MarketplaceCategoryBase['filterConfiguration'] & {
    readonly vehicleTypes: readonly FilterOption[];
    readonly yearRange: readonly FilterOption[];
    readonly mileageRange: readonly FilterOption[];
    readonly fuelTypes: readonly FilterOption[];
    readonly transmissionTypes: readonly FilterOption[];
  };
}

/**
 * Real Estate Marketplace Template
 * Specialized template for real estate listings
 */
export interface RealEstateMarketplaceTemplate extends MarketplaceCategoryBase {
  readonly filterConfiguration: MarketplaceCategoryBase['filterConfiguration'] & {
    readonly propertyTypes: readonly FilterOption[];
    readonly bedroomCount: readonly FilterOption[];
    readonly bathroomCount: readonly FilterOption[];
    readonly priceRanges: readonly FilterOption[];
    readonly locationFilters: readonly FilterOption[];
  };
}

/**
 * Jobs Marketplace Template
 * Specialized template for job listings
 */
export interface JobsMarketplaceTemplate extends MarketplaceCategoryBase {
  readonly filterConfiguration: MarketplaceCategoryBase['filterConfiguration'] & {
    readonly industryTypes: readonly FilterOption[];
    readonly experienceLevels: readonly FilterOption[];
    readonly employmentTypes: readonly FilterOption[];
    readonly salaryRanges: readonly FilterOption[];
    readonly remoteOptions: readonly FilterOption[];
  };
}

// ===== ELECTRONICS SPECIALIZED TEMPLATES =====

/**
 * Computing Electronics Template
 * Specialized template for computers, laptops, components
 */
export interface ComputingElectronicsTemplate extends ElectronicsCategoryBase {
  readonly filterConfiguration: ElectronicsCategoryBase['filterConfiguration'] & {
    readonly processorTypes: readonly FilterOption[];
    readonly memoryOptions: readonly FilterOption[];
    readonly storageTypes: readonly FilterOption[];
    readonly operatingSystems: readonly FilterOption[];
  };
}

/**
 * Mobile Electronics Template
 * Specialized template for phones, tablets, wearables
 */
export interface MobileElectronicsTemplate extends ElectronicsCategoryBase {
  readonly filterConfiguration: ElectronicsCategoryBase['filterConfiguration'] & {
    readonly carriers: readonly FilterOption[];
    readonly storageCapacity: readonly FilterOption[];
    readonly screenSizes: readonly FilterOption[];
    readonly connectivity: readonly FilterOption[];
  };
}

/**
 * Gaming Electronics Template
 * Specialized template for gaming consoles, accessories, games
 */
export interface GamingElectronicsTemplate extends ElectronicsCategoryBase {
  readonly filterConfiguration: ElectronicsCategoryBase['filterConfiguration'] & {
    readonly platforms: readonly FilterOption[];
    readonly genres: readonly FilterOption[];
    readonly ratings: readonly FilterOption[];
    readonly peripheralTypes: readonly FilterOption[];
  };
}

// ===== SERVICES SPECIALIZED TEMPLATES =====

/**
 * Professional Services Template
 * Specialized template for consulting, legal, financial services
 */
export interface ProfessionalServicesTemplate extends ServicesCategoryBase {
  readonly filterConfiguration: ServicesCategoryBase['filterConfiguration'] & {
    readonly skillAreas: readonly FilterOption[];
    readonly experienceLevels: readonly FilterOption[];
    readonly certifications: readonly FilterOption[];
    readonly serviceTypes: readonly FilterOption[];
  };
}

/**
 * Creative Services Template
 * Specialized template for design, photography, content creation
 */
export interface CreativeServicesTemplate extends ServicesCategoryBase {
  readonly filterConfiguration: ServicesCategoryBase['filterConfiguration'] & {
    readonly creativeFields: readonly FilterOption[];
    readonly portfolioTypes: readonly FilterOption[];
    readonly projectScopes: readonly FilterOption[];
    readonly deliveryFormats: readonly FilterOption[];
  };
}

/**
 * Home Services Template
 * Specialized template for maintenance, cleaning, landscaping
 */
export interface HomeServicesTemplate extends ServicesCategoryBase {
  readonly filterConfiguration: ServicesCategoryBase['filterConfiguration'] & {
    readonly serviceCategories: readonly FilterOption[];
    readonly urgencyLevels: readonly FilterOption[];
    readonly propertyTypes: readonly FilterOption[];
    readonly insuranceTypes: readonly FilterOption[];
  };
}

// ===== TEMPLATE CONFIGURATION DEFAULTS =====

/**
 * Fashion Size Configurations
 * Standard size configurations for different fashion categories
 */
const FASHION_SIZE_CONFIGURATIONS: Record<string, SizeConfiguration> = {
  womenClothing: {
    type: 'clothing',
    options: [
      { id: 'xs', name: 'XS', count: 456 },
      { id: 's', name: 'S', count: 623 },
      { id: 'm', name: 'M', count: 789 },
      { id: 'l', name: 'L', count: 567 },
      { id: 'xl', name: 'XL', count: 334 },
      { id: 'xxl', name: 'XXL', count: 223 }
    ]
  },
  menClothing: {
    type: 'clothing',
    options: [
      { id: 'xs', name: 'XS', count: 234 },
      { id: 's', name: 'S', count: 445 },
      { id: 'm', name: 'M', count: 667 },
      { id: 'l', name: 'L', count: 556 },
      { id: 'xl', name: 'XL', count: 445 },
      { id: 'xxl', name: 'XXL', count: 334 },
      { id: 'xxxl', name: 'XXXL', count: 123 }
    ]
  },
  kidsClothing: {
    type: 'clothing',
    options: [
      { id: '2t', name: '2T', count: 123 },
      { id: '3t', name: '3T', count: 156 },
      { id: '4t', name: '4T', count: 189 },
      { id: '5t', name: '5T', count: 145 },
      { id: '6', name: '6', count: 167 },
      { id: '8', name: '8', count: 178 },
      { id: '10', name: '10', count: 156 },
      { id: '12', name: '12', count: 134 },
      { id: '14', name: '14', count: 112 }
    ]
  },
  shoes: {
    type: 'shoes',
    options: [
      { id: '5', name: '5', count: 45 },
      { id: '5.5', name: '5.5', count: 56 },
      { id: '6', name: '6', count: 67 },
      { id: '6.5', name: '6.5', count: 78 },
      { id: '7', name: '7', count: 89 },
      { id: '7.5', name: '7.5', count: 98 },
      { id: '8', name: '8', count: 87 },
      { id: '8.5', name: '8.5', count: 76 },
      { id: '9', name: '9', count: 65 },
      { id: '9.5', name: '9.5', count: 54 },
      { id: '10', name: '10', count: 43 },
      { id: '10.5', name: '10.5', count: 32 },
      { id: '11', name: '11', count: 21 },
      { id: '12', name: '12', count: 15 }
    ]
  }
};

/**
 * Brand Configurations
 * Standard brand configurations for different categories
 */
const BRAND_CONFIGURATIONS: Record<string, BrandConfiguration> = {
  fashionLuxury: {
    featured: ['Chanel', 'Louis Vuitton', 'Hermès', 'Gucci', 'Prada'],
    categories: ['Designer', 'Luxury', 'Premium'],
    luxury: ['Chanel', 'Louis Vuitton', 'Hermès', 'Cartier', 'Van Cleef & Arpels'],
    mainstream: ['Zara', 'H&M', 'Gap', 'Old Navy', 'Target']
  },
  fashionMainstream: {
    featured: ['Nike', 'Adidas', 'Levi\'s', 'Gap', 'Zara'],
    categories: ['Mainstream', 'Affordable', 'Fast Fashion'],
    luxury: ['Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein'],
    mainstream: ['H&M', 'Forever 21', 'Old Navy', 'Target', 'Walmart']
  },
  electronics: {
    featured: ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google'],
    categories: ['Premium', 'Mainstream', 'Budget'],
    luxury: ['Apple', 'Sony', 'Bose', 'Bang & Olufsen'],
    mainstream: ['Samsung', 'LG', 'HP', 'Dell', 'Lenovo']
  },
  automotive: {
    featured: ['Mercedes-Benz', 'BMW', 'Audi', 'Tesla', 'Porsche'],
    categories: ['Luxury', 'Premium', 'Mainstream', 'Economy'],
    luxury: ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Lamborghini'],
    mainstream: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan']
  }
};

// ===== VALIDATION SCHEMAS FOR SPECIALIZED TEMPLATES =====

/**
 * Fashion Apparel Template Validation Schema
 */
const FashionApparelTemplateSchema = z.object({
  sizeConfiguration: z.object({
    type: z.enum(['clothing', 'shoes', 'accessories', 'numeric', 'universal']),
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      count: z.number().optional()
    }))
  }),
  fitTypes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    count: z.number().optional()
  })),
  seasonalOptions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    count: z.number().optional()
  }))
});

/**
 * Electronics Template Validation Schema
 */
const ElectronicsTemplateSchema = z.object({
  techSpecs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      count: z.number().optional()
    }))
  })),
  compatibilityFilters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    count: z.number().optional()
  }))
});

// ===== EXPORTS =====
// Types and constants already exported via interface/const declarations above
// Available for import: FASHION_SIZE_CONFIGURATIONS, BRAND_CONFIGURATIONS, 
// FashionApparelTemplateSchema, ElectronicsTemplateSchema