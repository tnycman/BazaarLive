/**
 * Men Category Strategy Implementation
 * Enterprise-grade strategy pattern implementation for men's fashion category
 * Implements domain-specific business logic with AOP compliance
 */

import { 
  CategoryStrategy, 
  MenFashionDomain,
  FilterConfiguration,
  CategorySelection,
  ValidationResult,
  RawListingData,
  CategorySpecificListingData,
  AnalyticsConfiguration,
  SubcategoryDefinition,
  MenSizeChart
} from '../CategoryDomainTypes';

export class MenCategoryStrategy implements CategoryStrategy {
  readonly domain: MenFashionDomain;

  constructor() {
    this.domain = {
      vertical: 'fashion',
      category: 'men',
      metadata: {
        title: "Men's Fashion",
        description: "Discover the latest trends in men's clothing, shoes, and accessories",
        gradient: "from-blue-600 via-indigo-600 to-purple-700",
        placeholder: "Search men's fashion...",
        icon: "👔",
        seoKeywords: ["men's fashion", "clothing", "shirts", "pants", "shoes", "accessories"]
      },
      sizeChart: MenSizeChart,
      subcategories: [
        {
          id: 'shirts',
          name: 'Shirts',
          description: 'Dress shirts, casual shirts, and polos',
          filterTags: ['shirt', 'polo', 'button-down', 'dress shirt', 'casual shirt', 't-shirt']
        },
        {
          id: 'pants',
          name: 'Pants',
          description: 'Jeans, chinos, dress pants, and shorts',
          filterTags: ['jeans', 'chinos', 'pants', 'trousers', 'shorts', 'khakis']
        },
        {
          id: 'suits',
          name: 'Suits & Blazers',
          description: 'Formal wear and business attire',
          filterTags: ['suit', 'blazer', 'jacket', 'formal', 'tuxedo', 'sport coat']
        },
        {
          id: 'shoes',
          name: 'Shoes',
          description: 'Dress shoes, sneakers, and boots',
          filterTags: ['shoes', 'sneakers', 'boots', 'dress shoes', 'loafers', 'oxfords']
        },
        {
          id: 'accessories',
          name: 'Accessories',
          description: 'Ties, watches, belts, and bags',
          filterTags: ['tie', 'watch', 'belt', 'bag', 'wallet', 'cufflinks']
        },
        {
          id: 'activewear',
          name: 'Activewear',
          description: 'Athletic wear and workout clothes',
          filterTags: ['activewear', 'athletic', 'workout', 'sports', 'gym', 'running']
        }
      ],
      preferredBrands: [
        'Nike', 'Adidas', 'Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein',
        'Hugo Boss', 'Armani', 'Brooks Brothers', 'J.Crew', 'Banana Republic',
        'Levi\'s', 'Dockers', 'Under Armour', 'Polo Ralph Lauren', 'Lacoste'
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
        'fit',
        'style',
        'material'
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'new_without_tags', 'excellent'],
        priceRange: { min: 0, max: 1500 }
      },
      filterValidationRules: {
        size: {
          required: false,
          type: 'array',
          validator: (sizes: string[]) => sizes.every(size => 
            this.domain.sizeChart.sizes.includes(size)
          ),
          errorMessage: 'Invalid size selection for men\'s clothing'
        },
        subcategory: {
          required: false,
          type: 'array',
          validator: (subcategories: string[]) => subcategories.every(sub =>
            this.domain.subcategories.some(sc => sc.id === sub)
          ),
          errorMessage: 'Invalid subcategory selection for men\'s fashion'
        },
        fit: {
          required: false,
          type: 'array',
          validator: (fits: string[]) => {
            const validFits = ['slim', 'regular', 'relaxed', 'athletic', 'tailored'];
            return fits.every(fit => validFits.includes(fit));
          },
          errorMessage: 'Invalid fit selection'
        }
      }
    };
  }

  validateSelection(selection: CategorySelection): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selection.level1 && selection.level1 !== 'men') {
      errors.push('Level 1 selection must be "men" for men\'s fashion');
    }

    if (selection.level2) {
      const validSubcategories = this.domain.subcategories.map(sc => sc.id);
      if (!validSubcategories.includes(selection.level2)) {
        errors.push(`Invalid subcategory: ${selection.level2}`);
      }
    }

    if (selection.metadata?.fit) {
      const validFits = ['slim', 'regular', 'relaxed', 'athletic', 'tailored'];
      if (!validFits.includes(selection.metadata.fit as string)) {
        errors.push(`Invalid fit: ${selection.metadata.fit}`);
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
      const domainSpecificData: Record<string, any> = {};

      // Size normalization for men
      if (listing.size) {
        domainSpecificData.normalizedSize = this.normalizeSizeForMen(listing.size);
      }

      // Fit inference
      domainSpecificData.inferredFit = this.inferFit(listing);

      // Style classification
      domainSpecificData.styleClassification = this.classifyMenStyle(listing);

      // Professional vs casual classification
      domainSpecificData.occasionType = this.classifyOccasion(listing);

      const categoryValidation = this.validateListingForMen(listing);
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
        'men_category_view',
        'men_subcategory_select',
        'men_size_filter',
        'men_fit_filter',
        'men_brand_filter',
        'men_style_filter',
        'men_listing_click'
      ],
      conversionGoals: [
        'men_listing_view',
        'men_professional_wear_interest',
        'men_casual_wear_interest',
        'men_purchase_intent'
      ],
      segmentationRules: {
        size_preference: 'Track most used size filters',
        fit_preference: 'Track preferred fit types',
        style_preference: 'Track casual vs professional preferences',
        brand_loyalty: 'Track brand affinity patterns'
      }
    };
  }

  private normalizeSizeForMen(size: string): string {
    const sizeMap: Record<string, string> = {
      'Extra Small': 'XS',
      'Small': 'S',
      'Medium': 'M',
      'Large': 'L',
      'Extra Large': 'XL',
      'XX-Large': 'XXL'
    };
    
    return sizeMap[size] || size.toUpperCase();
  }

  private inferFit(listing: RawListingData): string {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    if (text.includes('slim') || text.includes('fitted')) return 'slim';
    if (text.includes('relaxed') || text.includes('loose')) return 'relaxed';
    if (text.includes('athletic') || text.includes('muscle')) return 'athletic';
    if (text.includes('tailored') || text.includes('custom')) return 'tailored';
    
    return 'regular';
  }

  private classifyMenStyle(listing: RawListingData): string[] {
    const styles: string[] = [];
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    const styleKeywords = {
      business: ['business', 'professional', 'office', 'formal', 'dress'],
      casual: ['casual', 'everyday', 'weekend', 'relaxed'],
      streetwear: ['streetwear', 'urban', 'hip-hop', 'trendy'],
      preppy: ['preppy', 'ivy league', 'classic', 'traditional'],
      athletic: ['athletic', 'sport', 'performance', 'workout'],
      rugged: ['rugged', 'outdoor', 'workwear', 'utility']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        styles.push(style);
      }
    }
    
    return styles.length > 0 ? styles : ['general'];
  }

  private classifyOccasion(listing: RawListingData): string {
    const text = (listing.title + ' ' + listing.description).toLowerCase();
    
    const businessKeywords = ['business', 'office', 'professional', 'formal', 'dress', 'suit'];
    const casualKeywords = ['casual', 'weekend', 'everyday', 'relaxed'];
    
    if (businessKeywords.some(keyword => text.includes(keyword))) {
      return 'professional';
    }
    if (casualKeywords.some(keyword => text.includes(keyword))) {
      return 'casual';
    }
    
    return 'versatile';
  }

  private validateListingForMen(listing: RawListingData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!listing.title) errors.push('Title is required');
    if (!listing.price) errors.push('Price is required');

    if (listing.size && !this.domain.sizeChart.sizes.includes(listing.size)) {
      warnings.push(`Size "${listing.size}" may not be standard for men's clothing`);
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
    
    // Add fit if inferable
    const inferredFit = this.inferFit(listing);
    if (inferredFit !== 'regular') {
      recommended.push('fit');
    }

    return recommended;
  }
}