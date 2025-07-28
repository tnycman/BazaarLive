/**
 * Enterprise Home & Garden Category Strategy
 * Domain-driven design implementation with AOP architecture
 * Uses comprehensive validation and business logic for home category
 * Zero shortcuts implementation with 100% best practices
 */

import { CategoryStrategyInterface } from './CategoryStrategyInterface';
import { RawListingData, CategorySpecificListingData, CategorySelection } from '../CategoryDomainTypes';
import { FilterConfiguration } from '../../filtering/FilterService';
import { AnalyticsConfiguration } from '../CategoryAnalyticsTypes';

// ===== DOMAIN TYPES =====
interface HomeCategoryDomain {
  readonly metadata: {
    readonly gradient: string;
    readonly title: string;
    readonly description: string;
    readonly placeholder: string;
  };
  readonly vertical: 'home';
  readonly category: 'home';
  readonly subcategories: readonly HomeSubcategory[];
  readonly roomTypes: readonly RoomType[];
}

interface HomeSubcategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly roomCompatibility: readonly string[];
}

interface RoomType {
  readonly id: string;
  readonly name: string;
  readonly commonItems: readonly string[];
  readonly styleTypes: readonly string[];
}

interface HomeSpecificData {
  readonly roomType?: string;
  readonly homeStyle?: string;
  readonly dimensions?: string;
  readonly material?: string;
  readonly color?: string;
  readonly brand?: string;
  readonly condition?: string;
  readonly assemblyRequired?: boolean;
}

// ===== ENTERPRISE HOME CATEGORY STRATEGY =====
export class HomeCategoryStrategy implements CategoryStrategyInterface {
  readonly domain: HomeCategoryDomain;
  
  constructor() {
    this.domain = {
      metadata: {
        gradient: 'from-amber-50 to-orange-100',
        title: 'Home & Garden',
        description: 'Discover beautiful home decor, furniture, and garden essentials',
        placeholder: 'Search home & garden items...'
      },
      vertical: 'home',
      category: 'home',
      subcategories: [
        {
          id: 'accents',
          name: 'Accents',
          description: 'Decorative items and accent pieces',
          roomCompatibility: ['living-room', 'bedroom', 'dining-room', 'office']
        },
        {
          id: 'bath',
          name: 'Bath',
          description: 'Bathroom essentials and decor',
          roomCompatibility: ['bathroom', 'powder-room']
        },
        {
          id: 'bedding',
          name: 'Bedding',
          description: 'Sheets, comforters, and bedroom textiles',
          roomCompatibility: ['bedroom', 'guest-room']
        },
        {
          id: 'dining',
          name: 'Dining',
          description: 'Dinnerware and dining essentials',
          roomCompatibility: ['dining-room', 'kitchen']
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          description: 'Kitchen tools and appliances',
          roomCompatibility: ['kitchen', 'pantry']
        },
        {
          id: 'furniture',
          name: 'Furniture',
          description: 'Tables, chairs, and storage solutions',
          roomCompatibility: ['living-room', 'bedroom', 'dining-room', 'office']
        },
        {
          id: 'garden',
          name: 'Garden',
          description: 'Outdoor plants and garden tools',
          roomCompatibility: ['garden', 'patio', 'balcony']
        },
        {
          id: 'lighting',
          name: 'Lighting',
          description: 'Lamps and lighting fixtures',
          roomCompatibility: ['living-room', 'bedroom', 'kitchen', 'office']
        }
      ],
      roomTypes: [
        {
          id: 'living-room',
          name: 'Living Room',
          commonItems: ['sofa', 'coffee table', 'tv stand', 'rug', 'cushions'],
          styleTypes: ['modern', 'traditional', 'minimalist', 'bohemian']
        },
        {
          id: 'bedroom',
          name: 'Bedroom',
          commonItems: ['bed frame', 'mattress', 'dresser', 'nightstand', 'bedding'],
          styleTypes: ['contemporary', 'rustic', 'scandinavian', 'vintage']
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          commonItems: ['cookware', 'appliances', 'storage', 'dinnerware'],
          styleTypes: ['modern', 'farmhouse', 'industrial', 'traditional']
        },
        {
          id: 'bathroom',
          name: 'Bathroom',
          commonItems: ['towels', 'shower curtain', 'bath mat', 'organizers'],
          styleTypes: ['spa', 'modern', 'vintage', 'minimalist']
        },
        {
          id: 'garden',
          name: 'Garden',
          commonItems: ['plants', 'planters', 'tools', 'outdoor furniture'],
          styleTypes: ['cottage', 'modern', 'tropical', 'zen']
        }
      ]
    };
  }

  // ===== CORE TRANSFORMATION METHODS =====
  transformListingData(data: RawListingData[]): CategorySpecificListingData[] {
    if (!Array.isArray(data)) {
      console.warn('[HomeCategoryStrategy] Invalid data provided for transformation');
      return [];
    }

    return data
      .filter(listing => this.isHomeRelated(listing))
      .map((listing, index) => ({
        ...listing,
        id: listing.id || `home-${index}-${Date.now()}`,
        title: listing.title || 'Home Item',
        description: listing.description || '',
        price: listing.price || '$0.00',
        category: 'home',
        subcategory: this.inferSubcategory(listing),
        userId: listing.userId || 'unknown',
        createdAt: listing.createdAt || new Date().toISOString(),
        domainSpecificData: this.extractHomeSpecificData(listing),
        categoryValidation: {
          isValid: true,
          confidence: this.calculateConfidence(listing),
          validationRules: ['home_category_rules'],
          errors: [],
          warnings: []
        },
        recommendedFilters: this.getRecommendedFilters(listing)
      }));
  }

  validateSelection(selection: CategorySelection): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!selection.level1 || selection.level1 !== 'home') {
      errors.push('Primary category must be "home"');
    }

    if (selection.level2) {
      const validSubcategories = this.domain.subcategories.map(sub => sub.id);
      if (!validSubcategories.includes(selection.level2)) {
        errors.push(`Invalid subcategory: ${selection.level2}`);
      }
    }

    if (selection.level3) {
      const roomTypes = this.domain.roomTypes.map(room => room.id);
      if (!roomTypes.includes(selection.level3)) {
        errors.push(`Invalid room type: ${selection.level3}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getFilterConfiguration(): FilterConfiguration {
    return {
      availableFilters: [
        {
          key: 'subcategory',
          label: 'Category',
          type: 'select',
          options: this.domain.subcategories.map(sub => ({ value: sub.id, label: sub.name }))
        },
        {
          key: 'roomType',
          label: 'Room',
          type: 'select',
          options: this.domain.roomTypes.map(room => ({ value: room.id, label: room.name }))
        },
        {
          key: 'condition',
          label: 'Condition',
          type: 'select',
          options: [
            { value: 'new', label: 'New' },
            { value: 'like-new', label: 'Like New' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' }
          ]
        },
        {
          key: 'material',
          label: 'Material',
          type: 'select',
          options: [
            { value: 'wood', label: 'Wood' },
            { value: 'metal', label: 'Metal' },
            { value: 'fabric', label: 'Fabric' },
            { value: 'glass', label: 'Glass' },
            { value: 'ceramic', label: 'Ceramic' },
            { value: 'plastic', label: 'Plastic' }
          ]
        },
        {
          key: 'assemblyRequired',
          label: 'Assembly',
          type: 'select',
          options: [
            { value: 'true', label: 'Assembly Required' },
            { value: 'false', label: 'Ready to Use' }
          ]
        }
      ],
      defaultFilters: {
        sortBy: 'newest',
        condition: 'all'
      },
      filterValidationRules: {
        subcategory: { required: false },
        roomType: { required: false },
        condition: { required: false }
      }
    };
  }

  getAnalyticsConfiguration(): AnalyticsConfiguration {
    return {
      events: [
        'home_category_view',
        'home_subcategory_filter',
        'home_room_filter',
        'home_item_click',
        'home_search_query',
        'home_filter_applied'
      ],
      metrics: [
        'home_engagement_rate',
        'home_conversion_rate',
        'popular_home_subcategories',
        'home_search_success_rate',
        'home_filter_usage'
      ],
      conversionGoals: [
        'home_item_view',
        'home_contact_seller',
        'home_save_item'
      ]
    };
  }

  // ===== DOMAIN-SPECIFIC METHODS =====
  inferSubcategory(listing: RawListingData): string {
    const title = (listing.title || '').toLowerCase();
    const description = (listing.description || '').toLowerCase();
    const text = `${title} ${description}`;

    // Kitchen items
    if (this.matchesKeywords(text, ['cook', 'kitchen', 'utensil', 'appliance', 'pot', 'pan', 'knife', 'blender'])) {
      return 'kitchen';
    }

    // Bathroom items
    if (this.matchesKeywords(text, ['bath', 'towel', 'shower', 'toilet', 'bathroom', 'vanity'])) {
      return 'bath';
    }

    // Bedding items
    if (this.matchesKeywords(text, ['bed', 'sheet', 'pillow', 'comforter', 'duvet', 'blanket', 'mattress'])) {
      return 'bedding';
    }

    // Dining items
    if (this.matchesKeywords(text, ['dining', 'plate', 'bowl', 'cup', 'glass', 'silverware', 'table setting'])) {
      return 'dining';
    }

    // Furniture items
    if (this.matchesKeywords(text, ['chair', 'table', 'sofa', 'couch', 'dresser', 'cabinet', 'shelf', 'desk'])) {
      return 'furniture';
    }

    // Garden items
    if (this.matchesKeywords(text, ['garden', 'plant', 'flower', 'outdoor', 'patio', 'landscaping', 'lawn'])) {
      return 'garden';
    }

    // Lighting items
    if (this.matchesKeywords(text, ['lamp', 'light', 'lighting', 'chandelier', 'bulb', 'fixture'])) {
      return 'lighting';
    }

    // Default to accents
    return 'accents';
  }

  classifyRoomType(listing: RawListingData): string {
    const title = (listing.title || '').toLowerCase();
    const description = (listing.description || '').toLowerCase();
    const text = `${title} ${description}`;

    if (this.matchesKeywords(text, ['living', 'family room', 'lounge', 'sitting'])) {
      return 'living-room';
    }

    if (this.matchesKeywords(text, ['bedroom', 'bed', 'sleep', 'master', 'guest room'])) {
      return 'bedroom';
    }

    if (this.matchesKeywords(text, ['kitchen', 'cook', 'culinary', 'chef'])) {
      return 'kitchen';
    }

    if (this.matchesKeywords(text, ['bathroom', 'bath', 'shower', 'toilet', 'powder room'])) {
      return 'bathroom';
    }

    if (this.matchesKeywords(text, ['garden', 'outdoor', 'patio', 'yard', 'landscaping'])) {
      return 'garden';
    }

    return 'living-room'; // Default
  }

  classifyHomeStyle(listing: RawListingData): string {
    const title = (listing.title || '').toLowerCase();
    const description = (listing.description || '').toLowerCase();
    const text = `${title} ${description}`;

    if (this.matchesKeywords(text, ['modern', 'contemporary', 'sleek', 'minimalist'])) {
      return 'modern';
    }

    if (this.matchesKeywords(text, ['traditional', 'classic', 'vintage', 'antique'])) {
      return 'traditional';
    }

    if (this.matchesKeywords(text, ['rustic', 'farmhouse', 'country', 'barn'])) {
      return 'rustic';
    }

    if (this.matchesKeywords(text, ['industrial', 'metal', 'concrete', 'urban'])) {
      return 'industrial';
    }

    if (this.matchesKeywords(text, ['bohemian', 'boho', 'eclectic', 'artistic'])) {
      return 'bohemian';
    }

    if (this.matchesKeywords(text, ['scandinavian', 'nordic', 'clean', 'simple'])) {
      return 'scandinavian';
    }

    return 'modern'; // Default
  }

  // ===== PRIVATE HELPER METHODS =====
  private isHomeRelated(listing: RawListingData): boolean {
    if (listing.category === 'home') return true;

    const title = (listing.title || '').toLowerCase();
    const description = (listing.description || '').toLowerCase();
    const text = `${title} ${description}`;

    const homeKeywords = [
      'furniture', 'decor', 'kitchen', 'bathroom', 'bedroom', 'living room',
      'dining', 'home', 'house', 'garden', 'plant', 'lamp', 'rug', 'curtain',
      'pillow', 'blanket', 'towel', 'cookware', 'appliance'
    ];

    return homeKeywords.some(keyword => text.includes(keyword));
  }

  private extractHomeSpecificData(listing: RawListingData): HomeSpecificData {
    const title = (listing.title || '').toLowerCase();
    const description = (listing.description || '').toLowerCase();

    return {
      roomType: this.classifyRoomType(listing),
      homeStyle: this.classifyHomeStyle(listing),
      dimensions: this.extractDimensions(listing),
      material: this.extractMaterial(listing),
      color: this.extractColor(listing),
      brand: listing.brand || 'Unknown',
      condition: (listing as any).condition || 'used',
      assemblyRequired: this.checkAssemblyRequired(listing)
    };
  }

  private extractDimensions(listing: RawListingData): string {
    const text = `${listing.title || ''} ${listing.description || ''}`;
    const dimensionRegex = /(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)(\s*[x×]\s*(\d+\.?\d*))?\s*(in|inch|ft|feet|cm|mm)?/i;
    const match = text.match(dimensionRegex);
    return match ? match[0] : '';
  }

  private extractMaterial(listing: RawListingData): string {
    const text = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
    const materials = ['wood', 'metal', 'fabric', 'glass', 'ceramic', 'plastic', 'leather', 'cotton', 'polyester'];
    return materials.find(material => text.includes(material)) || '';
  }

  private extractColor(listing: RawListingData): string {
    const text = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
    const colors = ['white', 'black', 'brown', 'gray', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'orange', 'beige', 'navy', 'silver', 'gold'];
    return colors.find(color => text.includes(color)) || '';
  }

  private checkAssemblyRequired(listing: RawListingData): boolean {
    const text = `${listing.title || ''} ${listing.description || ''}`.toLowerCase();
    return text.includes('assembly') || text.includes('ikea') || text.includes('assemble');
  }

  private calculateConfidence(listing: RawListingData): number {
    let confidence = 0.5; // Base confidence

    if (listing.category === 'home') confidence += 0.3;
    if (listing.subcategory) confidence += 0.1;
    if (listing.images && listing.images.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getRecommendedFilters(listing: RawListingData): string[] {
    const filters = ['subcategory', 'condition'];
    
    if (this.extractMaterial(listing)) filters.push('material');
    if (this.classifyRoomType(listing)) filters.push('roomType');
    
    return filters;
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}