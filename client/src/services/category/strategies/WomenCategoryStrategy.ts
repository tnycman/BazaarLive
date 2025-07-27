/**
 * Women Category Strategy Implementation
 * Enterprise-grade strategy pattern implementation for women's fashion category
 * Implements domain-specific business logic with AOP compliance
 */

import { 
  CategoryStrategy, 
  WomenFashionDomain,
  FilterConfiguration,
  CategorySelection,
  ValidationResult,
  RawListingData,
  CategorySpecificListingData,
  AnalyticsConfiguration,
  SubcategoryDefinition,
  WomenSizeChart
} from '../CategoryDomainTypes';

export class WomenCategoryStrategy implements CategoryStrategy {
  readonly domain: WomenFashionDomain;

  constructor() {
    this.domain = {
      vertical: 'fashion',
      category: 'women',
      metadata: {
        title: "Women's Fashion",
        description: "Discover the latest trends in women's clothing, shoes, and accessories",
        gradient: "from-pink-500 via-purple-500 to-indigo-600",
        placeholder: "Search women's fashion...",
        icon: "👗",
        seoKeywords: ["women's fashion", "clothing", "dresses", "shoes", "accessories"]
      },
      sizeChart: WomenSizeChart,
      subcategories: [
        {
          id: 'tops',
          name: 'Tops',
          description: 'Blouses, shirts, sweaters, and more',
          filterTags: ['blouse', 'shirt', 'sweater', 'tank', 'tee', 'cardigan']
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          description: 'Pants, jeans, skirts, and shorts',
          filterTags: ['jeans', 'pants', 'skirt', 'shorts', 'leggings', 'trousers']
        },
        {
          id: 'dresses',
          name: 'Dresses',
          description: 'Casual, formal, and special occasion dresses',
          filterTags: ['dress', 'gown', 'cocktail', 'maxi', 'mini', 'midi']
        },
        {
          id: 'shoes',
          name: 'Shoes',
          description: 'Heels, flats, sneakers, and boots',
          filterTags: ['heels', 'flats', 'sneakers', 'boots', 'sandals', 'pumps']
        },
        {
          id: 'accessories',
          name: 'Accessories',
          description: 'Bags, jewelry, scarves, and more',
          filterTags: ['bag', 'purse', 'jewelry', 'scarf', 'belt', 'watch']
        },
        {
          id: 'activewear',
          name: 'Activewear',
          description: 'Workout clothes and athleisure',
          filterTags: ['activewear', 'workout', 'yoga', 'athletic', 'sports', 'gym']
        }
      ],
      preferredBrands: [
        'Zara', 'H&M', 'Forever 21', 'Nike', 'Adidas', 'Lululemon',
        'Kate Spade', 'Michael Kors', 'Coach', 'Tory Burch', 'Free People',
        'Anthropologie', 'J.Crew', 'Banana Republic', 'Ann Taylor'
      ]
    };
  }

  getFilterConfiguration(): FilterConfiguration {
    return {
      availableFilters: [
        'subcategory',
        'size',
        'brand',
        'color',
        'priceRange',
        'condition',
        'occasion',
        'style',
        'material'
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'new_without_tags', 'excellent'],
        priceRange: { min: 0, max: 1000 }
      },
      filterValidationRules: {
        size: {
          required: false,
          type: 'array',
          validator: (sizes: string[]) => sizes.every(size => 
            this.domain.sizeChart.sizes.includes(size)
          ),
          errorMessage: 'Invalid size selection for women\'s clothing'
        },
        subcategory: {
          required: false,
          type: 'array',
          validator: (subcategories: string[]) => subcategories.every(sub =>
            this.domain.subcategories.some(sc => sc.id === sub)
          ),
          errorMessage: 'Invalid subcategory selection for women\'s fashion'
        },
        brand: {
          required: false,
          type: 'array',
          validator: (brands: string[]) => brands.length <= 10,
          errorMessage: 'Too many brands selected (maximum 10)'
        },
        priceRange: {
          required: false,
          type: 'object',
          validator: (range: { min?: number; max?: number }) => {
            if (range.min && range.max) {
              return range.min <= range.max && range.min >= 0;
            }
            return true;
          },
          errorMessage: 'Invalid price range'
        }
      }
    };
  }

  validateSelection(selection: CategorySelection): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate hierarchical selection
    if (selection.level1 && selection.level1 !== 'women') {
      errors.push('Level 1 selection must be "women" for women\'s fashion');
    }

    if (selection.level2) {
      const validSubcategories = this.domain.subcategories.map(sc => sc.id);
      if (!validSubcategories.includes(selection.level2)) {
        errors.push(`Invalid subcategory: ${selection.level2}`);
      }
    }

    if (selection.level3) {
      // Level 3 could be specific items within subcategories
      if (!selection.level2) {
        warnings.push('Level 3 selection without Level 2 may not filter properly');
      }
    }

    // Validate metadata
    if (selection.metadata) {
      if (selection.metadata.size && !this.domain.sizeChart.sizes.includes(selection.metadata.size as string)) {
        errors.push(`Invalid size: ${selection.metadata.size}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  transformListingData(rawData: RawListingData[]): CategorySpecificListingData[] {
    return rawData.map(listing => {
      // Women-specific data transformation
      const domainSpecificData: Record<string, any> = {};

      // Size normalization
      if (listing.size) {
        domainSpecificData.normalizedSize = this.normalizeSizeForWomen(listing.size);
      }

      // Subcategory inference
      if (!listing.subcategory && listing.title && listing.description) {
        domainSpecificData.inferredSubcategory = this.inferSubcategory(
          listing.title + ' ' + listing.description
        );
      }

      // Style classification
      domainSpecificData.styleClassification = this.classifyStyle(listing);

      // Price tier
      domainSpecificData.priceTier = this.calculatePriceTier(listing.price);

      // Validation
      const categoryValidation = this.validateListingForWomen(listing);

      // Recommended filters
      const recommendedFilters = this.generateRecommendedFilters(listing);

      return {
        ...listing,
        domainSpecificData,
        categoryValidation,
        recommendedFilters
      };
    });
  }

  getAnalyticsConfiguration(): AnalyticsConfiguration {
    return {
      trackingEvents: [
        'women_category_view',
        'women_subcategory_select',
        'women_size_filter',
        'women_brand_filter',
        'women_price_filter',
        'women_listing_click',
        'women_listing_like',
        'women_listing_share'
      ],
      conversionGoals: [
        'women_listing_view',
        'women_listing_favorite',
        'women_inquiry_sent',
        'women_purchase_intent'
      ],
      segmentationRules: {
        size_preference: 'Track most used size filters',
        brand_affinity: 'Track preferred brands',
        price_sensitivity: 'Track price range interactions',
        style_preference: 'Track subcategory preferences'
      }
    };
  }

  // Private helper methods for women-specific logic
  private normalizeSizeForWomen(size: string): string {
    const sizeMap: Record<string, string> = {
      'XSmall': 'XS',
      'Small': 'S',
      'Medium': 'M',
      'Large': 'L',
      'XLarge': 'XL',
      'Extra Small': 'XS',
      'Extra Large': 'XL'
    };
    
    return sizeMap[size] || size.toUpperCase();
  }

  private inferSubcategory(text: string): string {
    const textLower = text.toLowerCase();
    
    for (const subcategory of this.domain.subcategories) {
      for (const tag of subcategory.filterTags) {
        if (textLower.includes(tag)) {
          return subcategory.id;
        }
      }
    }
    
    return 'other';
  }

  private classifyStyle(listing: RawListingData): string[] {
    const styles: string[] = [];
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    const styleKeywords = {
      casual: ['casual', 'everyday', 'relaxed', 'comfortable'],
      formal: ['formal', 'business', 'professional', 'office'],
      party: ['party', 'cocktail', 'evening', 'night out'],
      bohemian: ['boho', 'bohemian', 'hippie', 'free spirit'],
      vintage: ['vintage', 'retro', 'classic', 'timeless'],
      trendy: ['trendy', 'fashionable', 'current', 'modern']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        styles.push(style);
      }
    }
    
    return styles.length > 0 ? styles : ['general'];
  }

  private calculatePriceTier(price: string): string {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    
    if (numericPrice <= 25) return 'budget';
    if (numericPrice <= 75) return 'moderate';
    if (numericPrice <= 200) return 'premium';
    return 'luxury';
  }

  private validateListingForWomen(listing: RawListingData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required fields
    if (!listing.title) errors.push('Title is required');
    if (!listing.price) errors.push('Price is required');

    // Women-specific validations
    if (listing.size && !this.domain.sizeChart.sizes.includes(listing.size)) {
      warnings.push(`Size "${listing.size}" may not be standard for women's clothing`);
    }

    if (listing.brand && !this.domain.preferredBrands.includes(listing.brand)) {
      // Not an error, just noting it's not a preferred brand
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private generateRecommendedFilters(listing: RawListingData): string[] {
    const recommended: string[] = [];

    if (listing.brand) recommended.push('brand');
    if (listing.size) recommended.push('size');
    if (listing.subcategory) recommended.push('subcategory');
    
    // Add color if mentioned in title/description
    const colorKeywords = ['red', 'blue', 'black', 'white', 'pink', 'green', 'yellow', 'purple'];
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    if (colorKeywords.some(color => text.includes(color))) {
      recommended.push('color');
    }

    return recommended;
  }
}