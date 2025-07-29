/**
 * Universal Category Page Factory
 * Enterprise AOP-compliant factory for creating category pages with identical layouts
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import { z } from 'zod';
import { Result } from '../../types/Result';
import { CategoryMetadata } from './CategoryDomainTypes';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface UniversalPageConfiguration {
  readonly category: string;
  readonly subcategory?: string;
  readonly metadata: CategoryMetadata;
  readonly filterConfiguration: FilterConfiguration;
  readonly sampleProducts: readonly ProductItem[];
}

interface FilterConfiguration {
  readonly availableFilters: readonly string[];
  readonly categorySpecificFilters: readonly CategoryFilter[];
  readonly defaultFilters: Record<string, any>;
  readonly filterValidationRules: Record<string, z.ZodSchema>;
}

interface CategoryFilter {
  readonly id: string;
  readonly name: string;
  readonly type: 'checkbox' | 'select' | 'range' | 'search';
  readonly options?: readonly FilterOption[];
  readonly validation: z.ZodSchema;
}

interface FilterOption {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
  readonly subcategories?: readonly FilterOption[];
}

// ===== VALIDATION SCHEMAS =====
const UniversalPageConfigurationSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  metadata: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    gradient: z.string().min(1),
    placeholder: z.string().min(1),
    icon: z.string().optional(),
    seoKeywords: z.array(z.string()).optional()
  }),
  filterConfiguration: z.object({
    availableFilters: z.array(z.string()),
    categorySpecificFilters: z.array(z.any()),
    defaultFilters: z.record(z.any()),
    filterValidationRules: z.record(z.any())
  }),
  sampleProducts: z.array(z.any())
});

// ===== ENTERPRISE CATEGORY CONFIGURATIONS =====
const UNIVERSAL_CATEGORY_CONFIGURATIONS: Record<string, UniversalPageConfiguration> = {
  women: {
    category: 'women',
    metadata: {
      title: 'Women\'s Fashion',
      description: 'Discover the latest in women\'s fashion, accessories, and style',
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      placeholder: 'Search women\'s fashion...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
      categorySpecificFilters: [
        {
          id: 'women-sizes',
          name: 'Women\'s Sizes',
          type: 'checkbox',
          options: [
            { id: 'xs', name: 'XS' },
            { id: 's', name: 'S' },
            { id: 'm', name: 'M' },
            { id: 'l', name: 'L' },
            { id: 'xl', name: 'XL' },
            { id: 'xxl', name: 'XXL' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        size: z.array(z.string()),
        brand: z.array(z.string()),
        color: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  men: {
    category: 'men',
    metadata: {
      title: 'Men\'s Fashion',
      description: 'Explore men\'s clothing, accessories, and contemporary style',
      gradient: 'from-blue-50 via-indigo-100 to-blue-200',
      placeholder: 'Search men\'s fashion...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
      categorySpecificFilters: [
        {
          id: 'men-sizes',
          name: 'Men\'s Sizes',
          type: 'checkbox',
          options: [
            { id: 'xs', name: 'XS' },
            { id: 's', name: 'S' },
            { id: 'm', name: 'M' },
            { id: 'l', name: 'L' },
            { id: 'xl', name: 'XL' },
            { id: 'xxl', name: 'XXL' },
            { id: 'xxxl', name: 'XXXL' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        size: z.array(z.string()),
        brand: z.array(z.string()),
        color: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  kids: {
    category: 'kids',
    metadata: {
      title: 'Kids\' Fashion',
      description: 'Adorable and comfortable clothing for children of all ages',
      gradient: 'from-yellow-50 via-orange-100 to-red-100',
      placeholder: 'Search kids\' fashion...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability', 'age-group'],
      categorySpecificFilters: [
        {
          id: 'kids-sizes',
          name: 'Kids\' Sizes',
          type: 'checkbox',
          options: [
            { id: '2t', name: '2T' },
            { id: '3t', name: '3T' },
            { id: '4t', name: '4T' },
            { id: '5t', name: '5T' },
            { id: '6', name: '6' },
            { id: '7', name: '7' },
            { id: '8', name: '8' },
            { id: '10', name: '10' },
            { id: '12', name: '12' },
            { id: '14', name: '14' },
            { id: '16', name: '16' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'age-groups',
          name: 'Age Groups',
          type: 'checkbox',
          options: [
            { id: 'baby', name: 'Baby (0-2)' },
            { id: 'toddler', name: 'Toddler (2-5)' },
            { id: 'kids', name: 'Kids (5-12)' },
            { id: 'teen', name: 'Teen (12+)' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        size: z.array(z.string()),
        brand: z.array(z.string()),
        color: z.array(z.string()),
        ageGroup: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  home: {
    category: 'home',
    metadata: {
      title: 'Home & Garden',
      description: 'Beautiful home decor, furniture, and garden essentials',
      gradient: 'from-green-50 via-emerald-100 to-teal-100',
      placeholder: 'Search home & garden...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'brand', 'color', 'price', 'condition', 'availability', 'room', 'style'],
      categorySpecificFilters: [
        {
          id: 'rooms',
          name: 'Room',
          type: 'checkbox',
          options: [
            { id: 'living-room', name: 'Living Room' },
            { id: 'bedroom', name: 'Bedroom' },
            { id: 'kitchen', name: 'Kitchen' },
            { id: 'bathroom', name: 'Bathroom' },
            { id: 'dining-room', name: 'Dining Room' },
            { id: 'office', name: 'Office' },
            { id: 'outdoor', name: 'Outdoor' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'styles',
          name: 'Style',
          type: 'checkbox',
          options: [
            { id: 'modern', name: 'Modern' },
            { id: 'contemporary', name: 'Contemporary' },
            { id: 'traditional', name: 'Traditional' },
            { id: 'rustic', name: 'Rustic' },
            { id: 'industrial', name: 'Industrial' },
            { id: 'scandinavian', name: 'Scandinavian' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        room: z.array(z.string()),
        style: z.array(z.string()),
        brand: z.array(z.string()),
        color: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  electronics: {
    category: 'electronics',
    metadata: {
      title: 'Electronics',
      description: 'Latest technology, gadgets, and electronic devices',
      gradient: 'from-purple-50 via-violet-100 to-indigo-100',
      placeholder: 'Search electronics...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'brand', 'price', 'condition', 'availability', 'category-type'],
      categorySpecificFilters: [
        {
          id: 'electronic-types',
          name: 'Category',
          type: 'checkbox',
          options: [
            { id: 'smartphones', name: 'Smartphones' },
            { id: 'computers', name: 'Computers' },
            { id: 'tablets', name: 'Tablets' },
            { id: 'gaming', name: 'Gaming' },
            { id: 'audio', name: 'Audio' },
            { id: 'wearables', name: 'Wearables' },
            { id: 'accessories', name: 'Accessories' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        categoryType: z.array(z.string()),
        brand: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  pets: {
    category: 'pets',
    metadata: {
      title: 'Pet Supplies',
      description: 'Everything your furry friends need for a happy, healthy life',
      gradient: 'from-amber-50 via-yellow-100 to-orange-100',
      placeholder: 'Search pet supplies...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'brand', 'price', 'condition', 'availability', 'pet-type', 'pet-size'],
      categorySpecificFilters: [
        {
          id: 'pet-types',
          name: 'Pet Type',
          type: 'checkbox',
          options: [
            { id: 'dogs', name: 'Dogs' },
            { id: 'cats', name: 'Cats' },
            { id: 'birds', name: 'Birds' },
            { id: 'fish', name: 'Fish' },
            { id: 'reptiles', name: 'Reptiles' },
            { id: 'small-animals', name: 'Small Animals' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'pet-sizes',
          name: 'Pet Size',
          type: 'checkbox',
          options: [
            { id: 'small', name: 'Small' },
            { id: 'medium', name: 'Medium' },
            { id: 'large', name: 'Large' },
            { id: 'extra-large', name: 'Extra Large' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        petType: z.array(z.string()),
        petSize: z.array(z.string()),
        brand: z.array(z.string())
      }
    },
    sampleProducts: []
  },
  beauty: {
    category: 'beauty',
    metadata: {
      title: 'Beauty & Wellness',
      description: 'Premium beauty products, skincare, and wellness essentials',
      gradient: 'from-pink-50 via-rose-100 to-purple-100',
      placeholder: 'Search beauty & wellness...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'brand', 'price', 'condition', 'availability', 'product-type', 'skin-type'],
      categorySpecificFilters: [
        {
          id: 'beauty-types',
          name: 'Product Type',
          type: 'checkbox',
          options: [
            { id: 'skincare', name: 'Skincare' },
            { id: 'makeup', name: 'Makeup' },
            { id: 'haircare', name: 'Hair Care' },
            { id: 'fragrance', name: 'Fragrance' },
            { id: 'wellness', name: 'Wellness' },
            { id: 'tools', name: 'Beauty Tools' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'skin-types',
          name: 'Skin Type',
          type: 'checkbox',
          options: [
            { id: 'normal', name: 'Normal' },
            { id: 'dry', name: 'Dry' },
            { id: 'oily', name: 'Oily' },
            { id: 'combination', name: 'Combination' },
            { id: 'sensitive', name: 'Sensitive' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        productType: z.array(z.string()),
        skinType: z.array(z.string()),
        brand: z.array(z.string())
      }
    },
    sampleProducts: []
  }
};

// ===== ENTERPRISE UNIVERSAL CATEGORY PAGE FACTORY =====
export class UniversalCategoryPageFactory {
  private readonly configurationCache: Map<string, UniversalPageConfiguration> = new Map();

  /**
   * Get configuration for any category using universal architecture
   */
  public getConfiguration(category: string, subcategory?: string): Result<UniversalPageConfiguration, Error> {
    try {
      // Validate input parameters
      const validationResult = this.validateCategoryInput(category, subcategory);
      if (validationResult.isError()) {
        return Result.failure(validationResult.error);
      }

      // Check cache first
      const cacheKey = `${category}${subcategory ? `-${subcategory}` : ''}`;
      if (this.configurationCache.has(cacheKey)) {
        const cachedConfig = this.configurationCache.get(cacheKey)!;
        return Result.success(cachedConfig);
      }

      // Get base configuration
      const baseConfig = UNIVERSAL_CATEGORY_CONFIGURATIONS[category];
      if (!baseConfig) {
        return Result.failure(new Error(`Configuration not found for category: ${category}`));
      }

      // Apply subcategory modifications if needed
      const finalConfig = subcategory ? 
        this.applySubcategoryModifications(baseConfig, subcategory) : 
        baseConfig;

      // Validate final configuration
      const configValidation = UniversalPageConfigurationSchema.safeParse(finalConfig);
      if (!configValidation.success) {
        return Result.failure(new Error(`Invalid configuration: ${configValidation.error.message}`));
      }

      // Cache the configuration
      this.configurationCache.set(cacheKey, finalConfig);

      return Result.success(finalConfig);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown error in getConfiguration'));
    }
  }

  /**
   * Get all available categories
   */
  public getAvailableCategories(): Result<readonly string[], Error> {
    try {
      const categories = Object.keys(UNIVERSAL_CATEGORY_CONFIGURATIONS);
      return Result.success(categories);
    } catch (error) {
      return Result.failure(error instanceof Error ? error : new Error('Unknown error in getAvailableCategories'));
    }
  }

  /**
   * Validate category input parameters
   */
  private validateCategoryInput(category: string, subcategory?: string): Result<void, Error> {
    if (!category || typeof category !== 'string') {
      return Result.failure(new Error('Category must be a non-empty string'));
    }

    if (subcategory && typeof subcategory !== 'string') {
      return Result.failure(new Error('Subcategory must be a string if provided'));
    }

    return Result.success(undefined);
  }

  /**
   * Apply subcategory-specific modifications to base configuration
   */
  private applySubcategoryModifications(
    baseConfig: UniversalPageConfiguration,
    subcategory: string
  ): UniversalPageConfiguration {
    // Create modified configuration for subcategory
    return {
      ...baseConfig,
      subcategory,
      metadata: {
        ...baseConfig.metadata,
        title: `${baseConfig.metadata.title} - ${this.capitalizeString(subcategory)}`,
        description: `${baseConfig.metadata.description} in ${subcategory}`,
        placeholder: `Search ${subcategory}...`
      },
      filterConfiguration: {
        ...baseConfig.filterConfiguration,
        defaultFilters: {
          ...baseConfig.filterConfiguration.defaultFilters,
          subcategory: [subcategory]
        }
      }
    };
  }

  /**
   * Utility function to capitalize strings
   */
  private capitalizeString(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
  }

  /**
   * Clear configuration cache
   */
  public clearCache(): void {
    this.configurationCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStatistics(): { size: number; keys: readonly string[] } {
    return {
      size: this.configurationCache.size,
      keys: Array.from(this.configurationCache.keys())
    };
  }
}

// ===== SINGLETON INSTANCE =====
export const universalCategoryPageFactory = new UniversalCategoryPageFactory();

// ===== EXPORTS =====
export type {
  UniversalPageConfiguration,
  FilterConfiguration,
  CategoryFilter,
  FilterOption
};