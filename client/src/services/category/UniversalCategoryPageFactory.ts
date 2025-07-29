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
  'fashion-women': {
    category: 'fashion',
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
    sampleProducts: [
      // Row 1
      {
        id: 'women-1',
        title: 'Designer Silk Blouse',
        brand: 'Theory',
        price: '$89',
        originalPrice: '$165',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller1',
          username: 'fashionista_jane',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 24, comments: 8, shares: 3 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T10:30:00Z'
      },
      {
        id: 'women-2',
        title: 'Vintage Denim Jacket',
        brand: 'Levi\'s',
        price: '$65',
        originalPrice: '$98',
        size: 'S',
        images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller2',
          username: 'vintage_lover',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 18, comments: 5, shares: 2 },
        condition: 'good',
        isLiked: true,
        createdAt: '2024-01-24T15:45:00Z'
      },
      {
        id: 'women-3',
        title: 'Cashmere Sweater',
        brand: 'Everlane',
        price: '$128',
        originalPrice: '$198',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller3',
          username: 'cozy_closet',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 45, comments: 12, shares: 7 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T08:15:00Z'
      },
      {
        id: 'women-4',
        title: 'Floral Midi Dress',
        brand: 'Reformation',
        price: '$148',
        originalPrice: '$228',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller4',
          username: 'summer_style',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 15, shares: 9 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T14:20:00Z'
      },
      // Row 2
      {
        id: 'women-5',
        title: 'Leather Ankle Boots',
        brand: 'Sam Edelman',
        price: '$95',
        originalPrice: '$150',
        size: '8',
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller5',
          username: 'shoe_collector',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 32, comments: 6, shares: 4 },
        condition: 'good',
        isLiked: false,
        createdAt: '2024-01-23T16:30:00Z'
      },
      {
        id: 'women-6',
        title: 'Silk Scarf Collection',
        brand: 'Hermès',
        price: '$320',
        originalPrice: '$450',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller6',
          username: 'luxury_finds',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 22, shares: 15 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T12:45:00Z'
      },
      {
        id: 'women-7',
        title: 'High-Waisted Jeans',
        brand: 'Madewell',
        price: '$78',
        originalPrice: '$128',
        size: '28',
        images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller7',
          username: 'denim_queen',
          avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop'
        },
        stats: { likes: 41, comments: 9, shares: 5 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T09:10:00Z'
      },
      {
        id: 'women-8',
        title: 'Blazer Jacket',
        brand: 'Zara',
        price: '$59',
        originalPrice: '$89',
        size: 'S',
        images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller8',
          username: 'office_chic',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop'
        },
        stats: { likes: 28, comments: 7, shares: 3 },
        condition: 'good',
        isLiked: true,
        createdAt: '2024-01-25T11:25:00Z'
      },
      // Row 3
      {
        id: 'women-9',
        title: 'Statement Earrings',
        brand: 'Kate Spade',
        price: '$45',
        originalPrice: '$78',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller9',
          username: 'jewelry_box',
          avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop'
        },
        stats: { likes: 56, comments: 14, shares: 8 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T15:50:00Z'
      },
      {
        id: 'women-10',
        title: 'Wool Coat',
        brand: 'J.Crew',
        price: '$195',
        originalPrice: '$298',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller10',
          username: 'winter_wardrobe',
          avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop'
        },
        stats: { likes: 73, comments: 18, shares: 11 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-23T13:40:00Z'
      },
      {
        id: 'women-11',
        title: 'Designer Handbag',
        brand: 'Coach',
        price: '$185',
        originalPrice: '$295',
        size: 'Medium',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller11',
          username: 'bag_boutique',
          avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop'
        },
        stats: { likes: 92, comments: 25, shares: 16 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T17:35:00Z'
      },
      {
        id: 'women-12',
        title: 'Knit Cardigan',
        brand: 'Anthropologie',
        price: '$88',
        originalPrice: '$138',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller12',
          username: 'boho_style',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
        },
        stats: { likes: 37, comments: 10, shares: 6 },
        condition: 'good',
        isLiked: true,
        createdAt: '2024-01-24T20:15:00Z'
      }
    ]
  },
  'fashion-men': {
    category: 'fashion',
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
    sampleProducts: [
      {
        id: 'men-1',
        title: 'Classic Oxford Shirt',
        brand: 'Brooks Brothers',
        price: '$79',
        originalPrice: '$120',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller3',
          username: 'classic_style',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 15, comments: 3, shares: 1 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-23T12:15:00Z'
      },
      {
        id: 'men-2',
        title: 'Wool Blend Blazer',
        brand: 'Hugo Boss',
        price: '$145',
        originalPrice: '$285',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller4',
          username: 'business_pro',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 22, comments: 6, shares: 4 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-22T16:30:00Z'
      }
    ]
  },
  'fashion-kids': {
    category: 'fashion',
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
    sampleProducts: [
      {
        id: 'kids-1',
        title: 'Rainbow Unicorn Dress',
        brand: 'Disney',
        price: '$25',
        originalPrice: '$45',
        size: '4T',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller5',
          username: 'kids_fashion',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 32, comments: 12, shares: 8 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-25T09:00:00Z'
      },
      {
        id: 'kids-2',
        title: 'Superhero Cape Set',
        brand: 'DC Comics',
        price: '$18',
        originalPrice: '$32',
        size: '6',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller6',
          username: 'superhero_mom',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 28, comments: 9, shares: 5 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-24T11:20:00Z'
      }
    ]
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

      // Create configuration key
      const configKey = subcategory ? `${category}-${subcategory}` : category;
      
      // Get base configuration
      const baseConfig = UNIVERSAL_CATEGORY_CONFIGURATIONS[configKey];
      if (!baseConfig) {
        return Result.failure(new Error(`Configuration not found for category: ${configKey}`));
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