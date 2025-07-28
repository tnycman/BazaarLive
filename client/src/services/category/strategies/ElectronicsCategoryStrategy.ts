/**
 * Electronics Category Strategy Implementation
 * Enterprise-grade strategy pattern implementation for electronics category
 * Implements domain-specific business logic with AOP compliance
 */

import { 
  CategoryStrategy, 
  CategoryDomain,
  FilterConfiguration,
  CategorySelection,
  ValidationResult,
  RawListingData,
  CategorySpecificListingData,
  AnalyticsConfiguration,
  SubcategoryDefinition
} from '../CategoryDomainTypes';

// Electronics domain interface
export interface ElectronicsDomain extends CategoryDomain {
  readonly vertical: 'fashion';
  readonly category: 'electronics';
  readonly subcategories: readonly SubcategoryDefinition[];
  readonly preferredBrands: readonly string[];
}

export class ElectronicsCategoryStrategy implements CategoryStrategy {
  readonly domain: ElectronicsDomain;

  constructor() {
    this.domain = {
      vertical: 'fashion',
      category: 'electronics',
      metadata: {
        title: "Electronics",
        description: "Discover the latest in technology, gadgets, and electronic devices",
        gradient: "from-indigo-600 via-blue-600 to-cyan-700",
        placeholder: "Search electronics...",
        icon: "📱",
        seoKeywords: ["electronics", "technology", "gadgets", "phones", "computers", "cameras"]
      },
      subcategories: [
        {
          id: 'phones',
          name: 'Cell Phones & Accessories',
          description: 'Smartphones, cases, chargers, and accessories',
          filterTags: ['phone', 'smartphone', 'cell phone', 'case', 'charger', 'screen protector']
        },
        {
          id: 'computers',
          name: 'Computers & Tablets',
          description: 'Laptops, desktops, tablets, and computer accessories',
          filterTags: ['laptop', 'desktop', 'tablet', 'computer', 'keyboard', 'mouse', 'monitor']
        },
        {
          id: 'cameras',
          name: 'Camera & Photo',
          description: 'Digital cameras, lenses, and photography equipment',
          filterTags: ['camera', 'lens', 'photography', 'digital camera', 'video camera', 'tripod']
        },
        {
          id: 'audio',
          name: 'Audio & Headphones',
          description: 'Headphones, speakers, and audio equipment',
          filterTags: ['headphones', 'speakers', 'audio', 'earbuds', 'sound system', 'wireless']
        },
        {
          id: 'gaming',
          name: 'Video Games & Consoles',
          description: 'Gaming consoles, video games, and gaming accessories',
          filterTags: ['gaming', 'console', 'video games', 'controller', 'xbox', 'playstation']
        },
        {
          id: 'smart-home',
          name: 'Smart Home & IoT',
          description: 'Smart home devices and Internet of Things products',
          filterTags: ['smart home', 'iot', 'smart device', 'alexa', 'google home', 'automation']
        }
      ],
      preferredBrands: [
        'Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'HP', 'Dell', 
        'Canon', 'Nikon', 'LG', 'Bose', 'JBL', 'Nintendo', 'Xbox', 'PlayStation'
      ]
    };
  }

  getFilterConfiguration(): FilterConfiguration {
    return {
      availableFilters: [
        'subcategory',
        'brand',
        'color',
        'priceRange',
        'condition',
        'storage',
        'connectivity',
        'features'
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'new_without_tags', 'excellent'],
        priceRange: { min: 0, max: 5000 }
      },
      filterValidationRules: {
        brand: {
          required: false,
          type: 'array',
          validator: (brands: string[]) => brands.every(brand => 
            this.domain.preferredBrands.includes(brand)
          ),
          errorMessage: 'Invalid brand selection'
        },
        subcategory: {
          required: false,
          type: 'array',
          validator: (subcategories: string[]) => subcategories.every(sub => 
            this.domain.subcategories.some(category => category.id === sub)
          ),
          errorMessage: 'Invalid subcategory selection'
        },
        priceRange: {
          required: false,
          type: 'object',
          validator: (range: any) => 
            typeof range.min === 'number' && 
            typeof range.max === 'number' && 
            range.min >= 0 && 
            range.max <= 10000 &&
            range.min <= range.max,
          errorMessage: 'Invalid price range'
        }
      },

    };
  }

  validateSelection(selection: CategorySelection): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required level1
    if (!selection.level1 || selection.level1 !== 'electronics') {
      errors.push('Electronics category selection is required');
    }

    // Validate subcategory if provided
    if (selection.level2) {
      const validSubcategories = this.domain.subcategories.map(sub => sub.id);
      if (!validSubcategories.includes(selection.level2)) {
        errors.push(`Invalid electronics subcategory: ${selection.level2}`);
      }
    }

    // Validate additional selections
    if (selection.level3) {
      warnings.push('Level 3 selections are not commonly used for electronics');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,

    };
  }

  transformListingData(rawData: RawListingData[]): CategorySpecificListingData[] {
    return rawData.map((raw, index) => {
      return {
        id: raw.id || `electronics-${index}`,
        title: raw.title || 'Electronics Item',
        description: raw.description || '',
        price: raw.price || '0',
        images: raw.images || [],
        brand: raw.brand || '',
        condition: raw.condition || 'used',
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
        domainSpecificData: {
          subcategory: this.inferSubcategory(raw),
          relevanceScore: this.calculateRelevanceScore(raw)
        },
        categoryValidation: {
          isValid: true,
          errors: [],
          warnings: []
        },
        recommendedFilters: ['brand', 'subcategory', 'priceRange']
      };
    });
  }

  getAnalyticsConfiguration(): AnalyticsConfiguration {
    return {
      trackingEvents: [
        'electronics_view',
        'electronics_search',
        'electronics_filter_applied',
        'electronics_subcategory_selected',
        'electronics_brand_clicked',
        'electronics_price_filter_used'
      ],
      conversionGoals: [
        'electronics_listing_contact',
        'electronics_listing_favorite',
        'electronics_listing_share'
      ],
      segmentationRules: {
        'brand_segment': 'brand',
        'price_segment': 'priceRange',
        'condition_segment': 'condition'
      }
    };
  }

  private inferSubcategory(raw: RawListingData): string {
    const title = (raw.title || '').toLowerCase();
    const description = (raw.description || '').toLowerCase();
    const combined = `${title} ${description}`;

    // Check each subcategory's filter tags
    for (const subcategory of this.domain.subcategories) {
      for (const tag of subcategory.filterTags) {
        if (combined.includes(tag.toLowerCase())) {
          return subcategory.id;
        }
      }
    }

    return 'other';
  }

  private calculateRelevanceScore(raw: RawListingData): number {
    let score = 0;

    // Base score
    score += 50;

    // Title quality
    if (raw.title && raw.title.length > 10) score += 10;
    if (raw.title && raw.title.length > 30) score += 5;

    // Description quality  
    if (raw.description && raw.description.length > 50) score += 10;
    if (raw.description && raw.description.length > 200) score += 5;

    // Images
    if (raw.images && raw.images.length > 0) score += 15;
    if (raw.images && raw.images.length > 2) score += 5;

    // Brand recognition
    if (raw.brand && this.domain.preferredBrands.includes(raw.brand)) {
      score += 20;
    }

    // Condition
    if (raw.condition === 'new_with_tags') score += 10;
    if (raw.condition === 'new_without_tags') score += 8;
    if (raw.condition === 'excellent') score += 5;

    // Recent listings get bonus
    if (raw.createdAt) {
      const daysSinceCreated = (Date.now() - new Date(raw.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 10;
      if (daysSinceCreated < 30) score += 5;
    }

    return Math.min(score, 100);
  }
}