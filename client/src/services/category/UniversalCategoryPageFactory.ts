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
  readonly subSubcategory?: string;
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
  subSubcategory: z.string().optional(),
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
      // Row 1
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
      },
      {
        id: 'men-3',
        title: 'Leather Dress Shoes',
        brand: 'Cole Haan',
        price: '$180',
        originalPrice: '$295',
        size: '10',
        images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller13',
          username: 'shoe_expert',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 16, shares: 9 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T09:45:00Z'
      },
      {
        id: 'men-4',
        title: 'Wool Sweater',
        brand: 'Patagonia',
        price: '$89',
        originalPrice: '$145',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller14',
          username: 'outdoor_gear',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3847ae946b67?w=100&h=100&fit=crop'
        },
        stats: { likes: 34, comments: 8, shares: 4 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T16:20:00Z'
      },
      // Row 2
      {
        id: 'men-5',
        title: 'Denim Jeans',
        brand: 'Levi\'s',
        price: '$78',
        originalPrice: '$118',
        size: '32',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller15',
          username: 'denim_collector',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop'
        },
        stats: { likes: 28, comments: 6, shares: 3 },
        condition: 'good',
        isLiked: false,
        createdAt: '2024-01-24T14:10:00Z'
      },
      {
        id: 'men-6',
        title: 'Winter Parka',
        brand: 'Canada Goose',
        price: '$485',
        originalPrice: '$695',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1551105719-999ad3b22db8?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller16',
          username: 'winter_wear',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 24, shares: 15 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T11:30:00Z'
      },
      {
        id: 'men-7',
        title: 'Polo Shirt',
        brand: 'Ralph Lauren',
        price: '$68',
        originalPrice: '$98',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller17',
          username: 'preppy_style',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 22, comments: 5, shares: 2 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T08:45:00Z'
      },
      {
        id: 'men-8',
        title: 'Sports Watch',
        brand: 'Seiko',
        price: '$195',
        originalPrice: '$285',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller18',
          username: 'watch_collector',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 56, comments: 14, shares: 8 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T13:15:00Z'
      },
      // Row 3
      {
        id: 'men-9',
        title: 'Leather Belt',
        brand: 'Coach',
        price: '$125',
        originalPrice: '$195',
        size: '34',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller19',
          username: 'leather_goods',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
        },
        stats: { likes: 41, comments: 9, shares: 5 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T19:50:00Z'
      },
      {
        id: 'men-10',
        title: 'Casual Sneakers',
        brand: 'Adidas',
        price: '$85',
        originalPrice: '$125',
        size: '11',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller20',
          username: 'sneaker_head',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 73, comments: 18, shares: 11 },
        condition: 'good',
        isLiked: true,
        createdAt: '2024-01-23T15:25:00Z'
      },
      {
        id: 'men-11',
        title: 'Business Briefcase',
        brand: 'Tumi',
        price: '$295',
        originalPrice: '$450',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller21',
          username: 'business_pro',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 38, comments: 7, shares: 4 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T10:40:00Z'
      },
      {
        id: 'men-12',
        title: 'Cashmere Scarf',
        brand: 'Burberry',
        price: '$245',
        originalPrice: '$395',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller22',
          username: 'luxury_mens',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop'
        },
        stats: { likes: 64, comments: 13, shares: 7 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T17:05:00Z'
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
      // Row 1
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
      },
      {
        id: 'kids-3',
        title: 'Cozy Dinosaur Pajamas',
        brand: 'Carter\'s',
        price: '$22',
        originalPrice: '$36',
        size: '3T',
        images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller23',
          username: 'sleepy_time',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 47, comments: 15, shares: 9 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T07:30:00Z'
      },
      {
        id: 'kids-4',
        title: 'School Backpack',
        brand: 'JanSport',
        price: '$35',
        originalPrice: '$55',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller24',
          username: 'back_to_school',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 19, comments: 4, shares: 2 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T13:45:00Z'
      },
      // Row 2
      {
        id: 'kids-5',
        title: 'Princess Tutu Skirt',
        brand: 'Melissa & Doug',
        price: '$28',
        originalPrice: '$42',
        size: '5T',
        images: ['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller25',
          username: 'princess_play',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 41, comments: 11, shares: 6 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T16:20:00Z'
      },
      {
        id: 'kids-6',
        title: 'Soccer Cleats',
        brand: 'Nike',
        price: '$45',
        originalPrice: '$75',
        size: '2Y',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller26',
          username: 'sports_kid',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 23, comments: 6, shares: 3 },
        condition: 'good',
        isLiked: true,
        createdAt: '2024-01-25T10:15:00Z'
      },
      {
        id: 'kids-7',
        title: 'Winter Snow Jacket',
        brand: 'Columbia',
        price: '$68',
        originalPrice: '$98',
        size: '8',
        images: ['https://images.unsplash.com/photo-1551105719-999ad3b22db8?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller27',
          username: 'winter_kids',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 56, comments: 14, shares: 8 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T12:00:00Z'
      },
      {
        id: 'kids-8',
        title: 'Art Supply Set',
        brand: 'Crayola',
        price: '$32',
        originalPrice: '$48',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller28',
          username: 'creative_kids',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 38, comments: 9, shares: 5 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T14:30:00Z'
      },
      // Row 3
      {
        id: 'kids-9',
        title: 'Light-Up Sneakers',
        brand: 'Skechers',
        price: '$42',
        originalPrice: '$65',
        size: '1Y',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller29',
          username: 'fun_shoes',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 18, shares: 12 },
        condition: 'good',
        isLiked: false,
        createdAt: '2024-01-23T18:45:00Z'
      },
      {
        id: 'kids-10',
        title: 'Denim Overalls',
        brand: 'OshKosh B\'gosh',
        price: '$38',
        originalPrice: '$58',
        size: '6',
        images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller30',
          username: 'classic_kids',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 29, comments: 7, shares: 4 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-24T08:20:00Z'
      },
      {
        id: 'kids-11',
        title: 'Swimming Goggles',
        brand: 'Speedo',
        price: '$15',
        originalPrice: '$25',
        size: 'Youth',
        images: ['https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller31',
          username: 'swim_coach',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 21, comments: 5, shares: 2 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T09:10:00Z'
      },
      {
        id: 'kids-12',
        title: 'Plush Teddy Bear',
        brand: 'Build-A-Bear',
        price: '$28',
        originalPrice: '$42',
        size: 'Medium',
        images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller32',
          username: 'teddy_collection',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 84, comments: 22, shares: 15 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T19:55:00Z'
      }
    ]
  },

  // ===== FASHION HOME SUBCATEGORY CONFIGURATION =====
  'fashion-home': {
    category: 'fashion',
    subcategory: 'home',
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
    sampleProducts: [
      // Row 1
      {
        id: 'home-1',
        title: 'Modern Throw Pillows',
        brand: 'West Elm',
        price: '$39',
        originalPrice: '$65',
        size: '18x18',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller33',
          username: 'home_stylist',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 45, comments: 12, shares: 7 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T08:15:00Z'
      },
      {
        id: 'home-2',
        title: 'Vintage Coffee Table',
        brand: 'CB2',
        price: '$295',
        originalPrice: '$450',
        size: '48x24',
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller34',
          username: 'vintage_home',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 78, comments: 19, shares: 12 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T14:30:00Z'
      },
      {
        id: 'home-3',
        title: 'Ceramic Dinnerware Set',
        brand: 'Williams Sonoma',
        price: '$189',
        originalPrice: '$285',
        size: '12-piece',
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller35',
          username: 'kitchen_essentials',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 52, comments: 14, shares: 8 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T11:45:00Z'
      },
      {
        id: 'home-4',
        title: 'Floor Standing Mirror',
        brand: 'Urban Outfitters',
        price: '$158',
        originalPrice: '$245',
        size: '60x20',
        images: ['https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller36',
          username: 'mirror_collection',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 63, comments: 16, shares: 10 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T16:20:00Z'
      },
      // Row 2
      {
        id: 'home-5',
        title: 'Scented Candle Collection',
        brand: 'Yankee Candle',
        price: '$48',
        originalPrice: '$75',
        size: 'Set of 3',
        images: ['https://images.unsplash.com/photo-1602874801006-8a4d9aa5bb77?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller37',
          username: 'candle_lover',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 34, comments: 8, shares: 5 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-24T13:10:00Z'
      },
      {
        id: 'home-6',
        title: 'Bamboo Kitchen Utensils',
        brand: 'Crate & Barrel',
        price: '$35',
        originalPrice: '$55',
        size: '7-piece',
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller38',
          username: 'eco_kitchen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 27, comments: 6, shares: 3 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T09:30:00Z'
      },
      {
        id: 'home-7',
        title: 'Indoor Plant Collection',
        brand: 'The Sill',
        price: '$125',
        originalPrice: '$185',
        size: '3 plants',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller39',
          username: 'plant_parent',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 23, shares: 15 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T15:45:00Z'
      },
      {
        id: 'home-8',
        title: 'Velvet Accent Chair',
        brand: 'Article',
        price: '$389',
        originalPrice: '$595',
        size: '32x30',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller40',
          username: 'furniture_find',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 95, comments: 25, shares: 18 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T12:15:00Z'
      },
      // Row 3
      {
        id: 'home-9',
        title: 'Persian Area Rug',
        brand: 'Rugs USA',
        price: '$245',
        originalPrice: '$395',
        size: '8x10',
        images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller41',
          username: 'rug_gallery',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 17, shares: 11 },
        condition: 'good',
        isLiked: false,
        createdAt: '2024-01-24T18:25:00Z'
      },
      {
        id: 'home-10',
        title: 'Smart LED Light Strips',
        brand: 'Philips Hue',
        price: '$89',
        originalPrice: '$135',
        size: '6.5 feet',
        images: ['https://images.unsplash.com/photo-1602874801006-8a4d9aa5bb77?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller42',
          username: 'smart_home',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 43, comments: 11, shares: 7 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T10:50:00Z'
      },
      {
        id: 'home-11',
        title: 'Marble Cutting Board',
        brand: 'Sur La Table',
        price: '$68',
        originalPrice: '$98',
        size: '12x16',
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller43',
          username: 'kitchen_marble',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 38, comments: 9, shares: 5 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T07:40:00Z'
      },
      {
        id: 'home-12',
        title: 'Luxury Bath Towel Set',
        brand: 'Pottery Barn',
        price: '$95',
        originalPrice: '$145',
        size: '6-piece',
        images: ['https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller44',
          username: 'luxury_bath',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 51, comments: 13, shares: 8 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T19:30:00Z'
      }
    ]
  },

  // ===== FASHION ELECTRONICS SUBCATEGORY CONFIGURATION =====
  'fashion-electronics': {
    category: 'fashion',
    subcategory: 'electronics',
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
    sampleProducts: [
      // Row 1
      {
        id: 'electronics-1',
        title: 'iPhone 15 Pro Max',
        brand: 'Apple',
        price: '$899',
        originalPrice: '$1199',
        size: '256GB',
        images: ['https://images.unsplash.com/photo-1592286872002-2d2d2e4b3b5b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller45',
          username: 'tech_guru',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 34, shares: 28 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T14:20:00Z'
      },
      {
        id: 'electronics-2',
        title: 'MacBook Air M3',
        brand: 'Apple',
        price: '$1299',
        originalPrice: '$1599',
        size: '13-inch',
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller46',
          username: 'laptop_deals',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 203, comments: 45, shares: 32 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T11:45:00Z'
      },
      {
        id: 'electronics-3',
        title: 'Sony WH-1000XM5',
        brand: 'Sony',
        price: '$299',
        originalPrice: '$399',
        size: 'Over-ear',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller47',
          username: 'audio_expert',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 19, shares: 12 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T16:30:00Z'
      },
      {
        id: 'electronics-4',
        title: 'Samsung 4K Smart TV',
        brand: 'Samsung',
        price: '$649',
        originalPrice: '$899',
        size: '55-inch',
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller48',
          username: 'home_theater',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
        },
        stats: { likes: 134, comments: 28, shares: 19 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T09:15:00Z'
      },
      // Row 2
      {
        id: 'electronics-5',
        title: 'Nintendo Switch OLED',
        brand: 'Nintendo',
        price: '$289',
        originalPrice: '$349',
        size: 'Console',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller49',
          username: 'gaming_zone',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3847ae946b67?w=100&h=100&fit=crop'
        },
        stats: { likes: 198, comments: 42, shares: 31 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-24T19:45:00Z'
      },
      {
        id: 'electronics-6',
        title: 'Canon EOS R6 Mark II',
        brand: 'Canon',
        price: '$1999',
        originalPrice: '$2499',
        size: 'Body Only',
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller50',
          username: 'photo_pro',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
        },
        stats: { likes: 145, comments: 31, shares: 22 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T13:20:00Z'
      },
      {
        id: 'electronics-7',
        title: 'iPad Pro 12.9"',
        brand: 'Apple',
        price: '$899',
        originalPrice: '$1199',
        size: '512GB',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller51',
          username: 'tablet_trader',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 167, comments: 38, shares: 25 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T15:10:00Z'
      },
      {
        id: 'electronics-8',
        title: 'Dyson V15 Detect',
        brand: 'Dyson',
        price: '$599',
        originalPrice: '$749',
        size: 'Cordless',
        images: ['https://images.unsplash.com/photo-1558618666-7a28b2a4b228?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller52',
          username: 'clean_tech',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 78, comments: 16, shares: 11 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T08:45:00Z'
      },
      // Row 3
      {
        id: 'electronics-9',
        title: 'Apple Watch Series 9',
        brand: 'Apple',
        price: '$329',
        originalPrice: '$429',
        size: '45mm',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller53',
          username: 'watch_world',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 112, comments: 24, shares: 17 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T12:30:00Z'
      },
      {
        id: 'electronics-10',
        title: 'Tesla Powerwall',
        brand: 'Tesla',
        price: '$8999',
        originalPrice: '$11500',
        size: '13.5 kWh',
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller54',
          username: 'solar_solutions',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 56, shares: 41 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T17:25:00Z'
      },
      {
        id: 'electronics-11',
        title: 'Bose SoundLink Max',
        brand: 'Bose',
        price: '$199',
        originalPrice: '$279',
        size: 'Portable',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller55',
          username: 'sound_system',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 14, shares: 9 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T11:15:00Z'
      },
      {
        id: 'electronics-12',
        title: 'DJI Mini 4 Pro Drone',
        brand: 'DJI',
        price: '$759',
        originalPrice: '$999',
        size: 'Mini Size',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller56',
          username: 'drone_pilot',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 189, comments: 41, shares: 29 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T20:40:00Z'
      }
    ]
  },

  // ===== FASHION PETS SUBCATEGORY CONFIGURATION =====
  'fashion-pets': {
    category: 'fashion',
    subcategory: 'pets',
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
    sampleProducts: [
      // Row 1
      {
        id: 'pets-1',
        title: 'Premium Dog Food',
        brand: 'Blue Buffalo',
        price: '$58',
        originalPrice: '$78',
        size: '24 lbs',
        images: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller57',
          username: 'pet_nutrition',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 18, shares: 12 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T09:30:00Z'
      },
      {
        id: 'pets-2',
        title: 'Interactive Cat Tower',
        brand: 'PetSafe',
        price: '$125',
        originalPrice: '$189',
        size: '6 feet',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller58',
          username: 'cat_kingdom',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 32, shares: 24 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T13:45:00Z'
      },
      {
        id: 'pets-3',
        title: 'Dog Leash & Harness Set',
        brand: 'Ruffwear',
        price: '$45',
        originalPrice: '$68',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller59',
          username: 'adventure_pup',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 14, shares: 9 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T15:20:00Z'
      },
      {
        id: 'pets-4',
        title: 'Aquarium Starter Kit',
        brand: 'Fluval',
        price: '$189',
        originalPrice: '$275',
        size: '20 gallon',
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller60',
          username: 'aquatic_world',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 98, comments: 21, shares: 15 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T11:10:00Z'
      },
      // Row 2
      {
        id: 'pets-5',
        title: 'Bird Cage Deluxe',
        brand: 'Prevue Pet',
        price: '$245',
        originalPrice: '$359',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller61',
          username: 'feathered_friends',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 134, comments: 28, shares: 18 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T16:35:00Z'
      },
      {
        id: 'pets-6',
        title: 'Pet Camera with Treats',
        brand: 'Furbo',
        price: '$159',
        originalPrice: '$229',
        size: 'Wireless',
        images: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller62',
          username: 'smart_pet_tech',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 187, comments: 39, shares: 27 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T08:50:00Z'
      },
      {
        id: 'pets-7',
        title: 'Grooming Kit Professional',
        brand: 'Wahl',
        price: '$89',
        originalPrice: '$135',
        size: 'Complete Set',
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller63',
          username: 'pet_groomer',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 76, comments: 16, shares: 11 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T19:25:00Z'
      },
      {
        id: 'pets-8',
        title: 'Puzzle Feeder for Dogs',
        brand: 'Nina Ottosson',
        price: '$32',
        originalPrice: '$48',
        size: 'Medium',
        images: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller64',
          username: 'brain_games',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 43, comments: 9, shares: 6 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T12:40:00Z'
      },
      // Row 3
      {
        id: 'pets-9',
        title: 'Heated Pet Bed',
        brand: 'K&H Pet Products',
        price: '$78',
        originalPrice: '$115',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller65',
          username: 'cozy_pets',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 112, comments: 23, shares: 16 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T14:15:00Z'
      },
      {
        id: 'pets-10',
        title: 'Reptile Terrarium Kit',
        brand: 'Exo Terra',
        price: '$234',
        originalPrice: '$329',
        size: '40 gallon',
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller66',
          username: 'reptile_habitat',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 19, shares: 13 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T17:30:00Z'
      },
      {
        id: 'pets-11',
        title: 'Automatic Water Fountain',
        brand: 'PetSafe Drinkwell',
        price: '$65',
        originalPrice: '$95',
        size: '50 oz',
        images: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller67',
          username: 'fresh_water',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 91, comments: 18, shares: 12 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T10:05:00Z'
      },
      {
        id: 'pets-12',
        title: 'Small Animal Playpen',
        brand: 'Tespo',
        price: '$42',
        originalPrice: '$65',
        size: '12 panels',
        images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller68',
          username: 'small_pets',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 14, shares: 9 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T21:45:00Z'
      }
    ]
  },

  // ===== FASHION BEAUTY SUBCATEGORY CONFIGURATION =====
  'fashion-beauty': {
    category: 'fashion',
    subcategory: 'beauty',
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
    sampleProducts: [
      // Row 1
      {
        id: 'beauty-1',
        title: 'Vitamin C Serum',
        brand: 'The Ordinary',
        price: '$28',
        originalPrice: '$42',
        size: '30ml',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller69',
          username: 'skincare_guru',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 203, comments: 45, shares: 32 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-26T14:25:00Z'
      },
      {
        id: 'beauty-2',
        title: 'Eyeshadow Palette',
        brand: 'Urban Decay',
        price: '$45',
        originalPrice: '$65',
        size: '12 shades',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller70',
          username: 'makeup_artist',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 34, shares: 24 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T16:40:00Z'
      },
      {
        id: 'beauty-3',
        title: 'Hair Straightener Pro',
        brand: 'GHD',
        price: '$189',
        originalPrice: '$265',
        size: 'Professional',
        images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller71',
          username: 'hair_stylist',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 19, shares: 13 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T11:15:00Z'
      },
      {
        id: 'beauty-4',
        title: 'Premium Perfume Set',
        brand: 'Chanel',
        price: '$298',
        originalPrice: '$425',
        size: '100ml',
        images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller72',
          username: 'fragrance_lover',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 52, shares: 38 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T13:30:00Z'
      },
      // Row 2
      {
        id: 'beauty-5',
        title: 'Face Mask Collection',
        brand: 'Laneige',
        price: '$68',
        originalPrice: '$95',
        size: '5-pack',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller73',
          username: 'spa_at_home',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 167, comments: 35, shares: 26 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-24T18:20:00Z'
      },
      {
        id: 'beauty-6',
        title: 'Makeup Brush Set',
        brand: 'Real Techniques',
        price: '$35',
        originalPrice: '$55',
        size: '12 brushes',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller74',
          username: 'beauty_tools',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 98, comments: 21, shares: 15 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T09:45:00Z'
      },
      {
        id: 'beauty-7',
        title: 'Essential Oil Diffuser',
        brand: 'Young Living',
        price: '$89',
        originalPrice: '$125',
        size: 'Ultrasonic',
        images: ['https://images.unsplash.com/photo-1555955018-70d04acc3833?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller75',
          username: 'wellness_life',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 134, comments: 28, shares: 19 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-25T15:55:00Z'
      },
      {
        id: 'beauty-8',
        title: 'Anti-Aging Night Cream',
        brand: 'Olay',
        price: '$42',
        originalPrice: '$65',
        size: '50ml',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller76',
          username: 'age_gracefully',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 112, comments: 24, shares: 17 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T12:10:00Z'
      },
      // Row 3
      {
        id: 'beauty-9',
        title: 'Luxury Lipstick Set',
        brand: 'MAC',
        price: '$78',
        originalPrice: '$115',
        size: '4 shades',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller77',
          username: 'lip_queen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 189, comments: 41, shares: 29 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-24T20:35:00Z'
      },
      {
        id: 'beauty-10',
        title: 'Jade Facial Roller',
        brand: 'Gua Sha',
        price: '$25',
        originalPrice: '$38',
        size: 'Natural Stone',
        images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller78',
          username: 'natural_beauty',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 145, comments: 31, shares: 22 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T08:25:00Z'
      },
      {
        id: 'beauty-11',
        title: 'Professional Hair Dryer',
        brand: 'Dyson',
        price: '$329',
        originalPrice: '$429',
        size: 'Supersonic',
        images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller79',
          username: 'salon_quality',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 267, comments: 58, shares: 41 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T17:50:00Z'
      },
      {
        id: 'beauty-12',
        title: 'Meditation Crystal Set',
        brand: 'Healing Crystals',
        price: '$48',
        originalPrice: '$72',
        size: '7 stones',
        images: ['https://images.unsplash.com/photo-1555955018-70d04acc3833?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller80',
          username: 'zen_wellness',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 87, comments: 18, shares: 12 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T19:15:00Z'
      }
    ]
  },

  // ===== FASHION SPORTS SUBCATEGORY CONFIGURATION =====
  'fashion-sports': {
    category: 'fashion',
    subcategory: 'sports',
    metadata: {
      title: 'Sports & Outdoors',
      description: 'Athletic gear, outdoor equipment, and fitness essentials for your active lifestyle',
      gradient: 'from-emerald-50 via-green-100 to-blue-100',
      placeholder: 'Search sports & outdoors...'
    },
    filterConfiguration: {
      availableFilters: ['subcategory', 'brand', 'price', 'condition', 'availability', 'sport-type', 'activity-level'],
      categorySpecificFilters: [
        {
          id: 'sport-types',
          name: 'Sport Type',
          type: 'checkbox',
          options: [
            { id: 'fitness', name: 'Fitness' },
            { id: 'outdoor', name: 'Outdoor' },
            { id: 'team-sports', name: 'Team Sports' },
            { id: 'water-sports', name: 'Water Sports' },
            { id: 'winter-sports', name: 'Winter Sports' },
            { id: 'cycling', name: 'Cycling' },
            { id: 'running', name: 'Running' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'activity-levels',
          name: 'Activity Level',
          type: 'checkbox',
          options: [
            { id: 'beginner', name: 'Beginner' },
            { id: 'intermediate', name: 'Intermediate' },
            { id: 'advanced', name: 'Advanced' },
            { id: 'professional', name: 'Professional' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        sportType: z.array(z.string()),
        activityLevel: z.array(z.string()),
        brand: z.array(z.string())
      }
    },
    sampleProducts: [
      // Row 1
      {
        id: 'sports-1',
        title: 'Nike Air Max Running Shoes',
        brand: 'Nike',
        price: '$89',
        originalPrice: '$130',
        size: '10.5',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller81',
          username: 'running_pro',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 45, shares: 32 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T14:30:00Z'
      },
      {
        id: 'sports-2',
        title: 'Premium Yoga Mat',
        brand: 'Lululemon',
        price: '$68',
        originalPrice: '$98',
        size: '6mm thick',
        images: ['https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller82',
          username: 'yoga_zen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 178, comments: 34, shares: 24 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T16:45:00Z'
      },
      {
        id: 'sports-3',
        title: 'Mountain Bike Helmet',
        brand: 'Giro',
        price: '$125',
        originalPrice: '$185',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1558618666-7a28b2a4b228?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller83',
          username: 'mountain_rider',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 98, comments: 19, shares: 13 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T11:20:00Z'
      },
      {
        id: 'sports-4',
        title: 'Professional Tennis Racket',
        brand: 'Wilson',
        price: '$189',
        originalPrice: '$275',
        size: 'Grip 4 3/8',
        images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller84',
          username: 'tennis_ace',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 28, shares: 19 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T13:15:00Z'
      },
      // Row 2
      {
        id: 'sports-5',
        title: 'Camping Backpack 50L',
        brand: 'The North Face',
        price: '$245',
        originalPrice: '$350',
        size: '50 Liter',
        images: ['https://images.unsplash.com/photo-1551524164-5cf5ac2bfe2d?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller85',
          username: 'outdoor_explorer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 267, comments: 52, shares: 38 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T18:40:00Z'
      },
      {
        id: 'sports-6',
        title: 'Basketball Official Size',
        brand: 'Spalding',
        price: '$35',
        originalPrice: '$55',
        size: 'Size 7',
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller86',
          username: 'hoop_dreams',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 16, shares: 11 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T09:25:00Z'
      },
      {
        id: 'sports-7',
        title: 'Fishing Rod Combo',
        brand: 'Penn',
        price: '$158',
        originalPrice: '$225',
        size: '7 foot',
        images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller87',
          username: 'fishing_master',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
        },
        stats: { likes: 134, comments: 24, shares: 17 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T15:30:00Z'
      },
      {
        id: 'sports-8',
        title: 'Adjustable Dumbbells',
        brand: 'Bowflex',
        price: '$389',
        originalPrice: '$549',
        size: '5-52.5 lbs',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller88',
          username: 'home_gym',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 298, comments: 58, shares: 42 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T12:50:00Z'
      },
      // Row 3
      {
        id: 'sports-9',
        title: 'Swimming Goggles Pro',
        brand: 'Speedo',
        price: '$45',
        originalPrice: '$68',
        size: 'Adult',
        images: ['https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller89',
          username: 'swim_coach',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        },
        stats: { likes: 67, comments: 13, shares: 9 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T20:15:00Z'
      },
      {
        id: 'sports-10',
        title: 'Golf Club Set',
        brand: 'Callaway',
        price: '$789',
        originalPrice: '$1200',
        size: 'Right Handed',
        images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller90',
          username: 'golf_pro_shop',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 47, shares: 33 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-25T08:45:00Z'
      },
      {
        id: 'sports-11',
        title: 'Snowboard with Bindings',
        brand: 'Burton',
        price: '$456',
        originalPrice: '$650',
        size: '158cm',
        images: ['https://images.unsplash.com/photo-1551524164-6cf7aa72bdf1?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller91',
          username: 'powder_rider',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 189, comments: 36, shares: 26 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T17:20:00Z'
      },
      {
        id: 'sports-12',
        title: 'Resistance Band Set',
        brand: 'Bodylastics',
        price: '$28',
        originalPrice: '$45',
        size: '5 bands',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller92',
          username: 'fitness_gear',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 112, comments: 22, shares: 15 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T19:35:00Z'
      }
    ]
  },

  // ===== WOMEN'S SUBCATEGORY CONFIGURATIONS =====
  'fashion-women-dresses': {
    category: 'fashion',
    subcategory: 'women',
    subSubcategory: 'dresses',
    metadata: {
      title: 'Women\'s Dresses',
      description: 'Elegant dresses for every occasion - casual, formal, and party wear',
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      placeholder: 'Search women\'s dresses...',
      seoKeywords: ['women dresses', 'party dresses', 'casual dresses', 'formal wear']
    },
    filterConfiguration: {
      availableFilters: ['size', 'brand', 'color', 'price', 'condition', 'occasion', 'dress-length'],
      categorySpecificFilters: [
        {
          id: 'dress-occasions',
          name: 'Occasion',
          type: 'checkbox',
          options: [
            { id: 'casual', name: 'Casual' },
            { id: 'party', name: 'Party' },
            { id: 'formal', name: 'Formal' },
            { id: 'wedding', name: 'Wedding' },
            { id: 'work', name: 'Work' }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'dress-length',
          name: 'Length',
          type: 'checkbox',
          options: [
            { id: 'mini', name: 'Mini' },
            { id: 'knee', name: 'Knee Length' },
            { id: 'midi', name: 'Midi' },
            { id: 'maxi', name: 'Maxi' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        occasion: z.array(z.string()),
        length: z.array(z.string())
      }
    },
    sampleProducts: [
      {
        id: 'dress-1',
        title: 'Floral Midi Dress',
        brand: 'Free People',
        price: '$89',
        originalPrice: '$128',
        size: 'M',
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-dress1',
          username: 'boho_chic',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 28, shares: 18 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T14:30:00Z'
      },
      {
        id: 'dress-2',
        title: 'Black Cocktail Dress',
        brand: 'Theory',
        price: '$195',
        originalPrice: '$298',
        size: 'S',
        images: ['https://images.unsplash.com/photo-1566479179817-0c49dab7e0eb?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-dress2',
          username: 'elegant_style',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 243, comments: 45, shares: 32 },
        condition: 'new_with_tags',
        isLiked: false,
        createdAt: '2024-01-25T11:15:00Z'
      }
    ]
  },

  'fashion-women-handbags': {
    category: 'fashion',
    subcategory: 'women',
    subSubcategory: 'handbags',
    metadata: {
      title: 'Women\'s Handbags',
      description: 'Designer handbags, purses, and luxury accessories',
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      placeholder: 'Search women\'s handbags...',
      seoKeywords: ['designer handbags', 'luxury purses', 'women bags', 'designer accessories']
    },
    filterConfiguration: {
      availableFilters: ['brand', 'color', 'price', 'condition', 'bag-type', 'material'],
      categorySpecificFilters: [
        {
          id: 'bag-types',
          name: 'Bag Type',
          type: 'checkbox',
          options: [
            { id: 'tote', name: 'Tote' },
            { id: 'crossbody', name: 'Crossbody' },
            { id: 'shoulder', name: 'Shoulder Bag' },
            { id: 'clutch', name: 'Clutch' },
            { id: 'backpack', name: 'Backpack' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        bagType: z.array(z.string()),
        material: z.array(z.string())
      }
    },
    sampleProducts: [
      {
        id: 'bag-1',
        title: 'Coach Leather Tote',
        brand: 'Coach',
        price: '$245',
        originalPrice: '$398',
        size: 'Large',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-bag1',
          username: 'luxury_finds',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 189, comments: 34, shares: 25 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-26T09:45:00Z'
      }
    ]
  },

  // ===== MEN'S SUBCATEGORY CONFIGURATIONS =====
  'fashion-men-shirts': {
    category: 'fashion',
    subcategory: 'men',
    subSubcategory: 'shirts',
    metadata: {
      title: 'Men\'s Shirts',
      description: 'Dress shirts, casual shirts, and designer tops for men',
      gradient: 'from-blue-50 via-indigo-100 to-blue-200',
      placeholder: 'Search men\'s shirts...',
      seoKeywords: ['men shirts', 'dress shirts', 'casual shirts', 'designer tops']
    },
    filterConfiguration: {
      availableFilters: ['size', 'brand', 'color', 'price', 'condition', 'shirt-type', 'collar-style'],
      categorySpecificFilters: [
        {
          id: 'shirt-types',
          name: 'Shirt Type',
          type: 'checkbox',
          options: [
            { id: 'dress', name: 'Dress Shirt' },
            { id: 'casual', name: 'Casual' },
            { id: 'polo', name: 'Polo' },
            { id: 'tshirt', name: 'T-Shirt' },
            { id: 'henley', name: 'Henley' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent']
      },
      filterValidationRules: {
        shirtType: z.array(z.string())
      }
    },
    sampleProducts: [
      {
        id: 'shirt-1',
        title: 'Brooks Brothers Dress Shirt',
        brand: 'Brooks Brothers',
        price: '$85',
        originalPrice: '$135',
        size: 'L',
        images: ['https://images.unsplash.com/photo-1602810318383-e8efb6d09f6e?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-shirt1',
          username: 'professional_wear',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 124, comments: 19, shares: 12 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-25T16:20:00Z'
      }
    ]
  },

  // ===== KIDS SUBCATEGORY CONFIGURATIONS =====
  'fashion-kids-toys': {
    category: 'fashion',
    subcategory: 'kids',
    subSubcategory: 'toys',
    metadata: {
      title: 'Kids\' Toys',
      description: 'Educational toys, games, and playthings for children of all ages',
      gradient: 'from-yellow-50 via-orange-100 to-red-100',
      placeholder: 'Search kids\' toys...',
      seoKeywords: ['kids toys', 'educational toys', 'children games', 'learning toys']
    },
    filterConfiguration: {
      availableFilters: ['age-range', 'brand', 'price', 'condition', 'toy-type', 'educational'],
      categorySpecificFilters: [
        {
          id: 'age-ranges',
          name: 'Age Range',
          type: 'checkbox',
          options: [
            { id: '0-2', name: '0-2 years' },
            { id: '3-5', name: '3-5 years' },
            { id: '6-8', name: '6-8 years' },
            { id: '9-12', name: '9-12 years' },
            { id: '13+', name: '13+ years' }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent']
      },
      filterValidationRules: {
        ageRange: z.array(z.string())
      }
    },
    sampleProducts: [
      {
        id: 'toy-1',
        title: 'LEGO Creator Set',
        brand: 'LEGO',
        price: '$45',
        originalPrice: '$65',
        size: '354 pieces',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-toy1',
          username: 'toy_collector',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 89, comments: 16, shares: 11 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-26T13:10:00Z'
      }
    ]
  },

  // ===== WOMEN'S ACCESSORIES SUBCATEGORY CONFIGURATION =====
  'fashion-women-accessories': {
    category: 'fashion',
    subcategory: 'women',
    subSubcategory: 'accessories',
    metadata: {
      title: 'Women\'s Accessories',
      description: 'Complete your look with designer jewelry, scarves, belts, and fashion accessories from top brands',
      gradient: 'from-pink-50 via-rose-100 to-pink-200',
      placeholder: 'Search women\'s accessories...',
      seoKeywords: ['women accessories', 'designer jewelry', 'luxury scarves', 'designer belts', 'fashion accessories', 'handbags', 'sunglasses', 'watches']
    },
    filterConfiguration: {
      availableFilters: ['brand', 'color', 'price', 'condition', 'accessory-type', 'material', 'size'],
      categorySpecificFilters: [
        {
          id: 'accessory-types',
          name: 'Accessory Type',
          type: 'checkbox',
          options: [
            { id: 'jewelry', name: 'Jewelry', count: 1245 },
            { id: 'scarves', name: 'Scarves', count: 892 },
            { id: 'belts', name: 'Belts', count: 756 },
            { id: 'hats', name: 'Hats', count: 634 },
            { id: 'sunglasses', name: 'Sunglasses', count: 523 },
            { id: 'watches', name: 'Watches', count: 445 },
            { id: 'hair-accessories', name: 'Hair Accessories', count: 387 },
            { id: 'gloves', name: 'Gloves', count: 234 },
            { id: 'ties', name: 'Ties & Bowties', count: 189 }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'materials',
          name: 'Material',
          type: 'checkbox',
          options: [
            { id: 'gold', name: 'Gold', count: 567 },
            { id: 'silver', name: 'Silver', count: 432 },
            { id: 'leather', name: 'Leather', count: 1203 },
            { id: 'silk', name: 'Silk', count: 345 },
            { id: 'cotton', name: 'Cotton', count: 289 },
            { id: 'metal', name: 'Metal', count: 234 },
            { id: 'plastic', name: 'Plastic', count: 156 },
            { id: 'cashmere', name: 'Cashmere', count: 123 },
            { id: 'wool', name: 'Wool', count: 198 }
          ],
          validation: z.array(z.string())
        },
        {
          id: 'jewelry-types',
          name: 'Jewelry Type',
          type: 'checkbox',
          options: [
            { id: 'necklaces', name: 'Necklaces', count: 456 },
            { id: 'earrings', name: 'Earrings', count: 389 },
            { id: 'bracelets', name: 'Bracelets', count: 267 },
            { id: 'rings', name: 'Rings', count: 234 },
            { id: 'brooches', name: 'Brooches', count: 123 },
            { id: 'anklets', name: 'Anklets', count: 89 }
          ],
          validation: z.array(z.string())
        }
      ],
      defaultFilters: {
        condition: ['new_with_tags', 'excellent'],
        availability: ['all-items']
      },
      filterValidationRules: {
        accessoryType: z.array(z.string()),
        material: z.array(z.string()),
        jewelryType: z.array(z.string()),
        size: z.array(z.string())
      }
    },
    sampleProducts: [
      {
        id: 'accessories-1',
        title: 'Tiffany & Co. Return to Tiffany Heart Tag Necklace',
        brand: 'Tiffany & Co.',
        price: '$295',
        originalPrice: '$450',
        size: '16"',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc1',
          username: 'luxury_jewelry_co',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 189, comments: 28, shares: 15 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-26T16:20:00Z'
      },
      {
        id: 'accessories-2',
        title: 'Hermès Twilly Silk Scarf - Zebra Pegasus Print',
        brand: 'Hermès',
        price: '$185',
        originalPrice: '$290',
        size: '86cm x 5cm',
        images: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc2',
          username: 'designer_resale_boutique',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 42, shares: 28 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-25T11:45:00Z'
      },
      {
        id: 'accessories-3',
        title: 'Gucci GG Marmont Leather Belt - Black',
        brand: 'Gucci',
        price: '$320',
        originalPrice: '$490',
        size: '85cm',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc3',
          username: 'authentic_designer_goods',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 156, comments: 23, shares: 18 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-24T14:30:00Z'
      },
      {
        id: 'accessories-4',
        title: 'Ray-Ban Aviator Classic Sunglasses - Gold Frame',
        brand: 'Ray-Ban',
        price: '$89',
        originalPrice: '$154',
        size: '58mm',
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc4',
          username: 'sunglass_warehouse',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 98, comments: 15, shares: 8 },
        condition: 'very_good',
        isLiked: true,
        createdAt: '2024-01-23T09:15:00Z'
      },
      {
        id: 'accessories-5',
        title: 'Apple Watch Series 9 - Gold Stainless Steel',
        brand: 'Apple',
        price: '$425',
        originalPrice: '$749',
        size: '41mm',
        images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc5',
          username: 'tech_accessories_pro',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 267, comments: 45, shares: 32 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-22T18:45:00Z'
      },
      {
        id: 'accessories-6',
        title: 'Chanel Camellia Flower Hair Clip - Pearl White',
        brand: 'Chanel',
        price: '$145',
        originalPrice: '$220',
        size: '7cm',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc6',
          username: 'vintage_chanel_collection',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 123, comments: 19, shares: 12 },
        condition: 'very_good',
        isLiked: true,
        createdAt: '2024-01-21T13:20:00Z'
      },
      {
        id: 'accessories-7',
        title: 'Louis Vuitton Cashmere Monogram Scarf - Brown',
        brand: 'Louis Vuitton',
        price: '$235',
        originalPrice: '$365',
        size: '140cm x 140cm',
        images: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc7',
          username: 'luxury_scarves_boutique',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 178, comments: 31, shares: 22 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-20T16:10:00Z'
      },
      {
        id: 'accessories-8',
        title: 'Cartier Love Bracelet - Rose Gold',
        brand: 'Cartier',
        price: '$1,250',
        originalPrice: '$1,890',
        size: '17cm',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc8',
          username: 'fine_jewelry_authenticated',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9fe3e23?w=100&h=100&fit=crop'
        },
        stats: { likes: 345, comments: 67, shares: 48 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-19T12:35:00Z'
      },
      {
        id: 'accessories-9',
        title: 'Burberry Check Pattern Wool Beret - Beige',
        brand: 'Burberry',
        price: '$89',
        originalPrice: '$145',
        size: 'One Size',
        images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc9',
          username: 'british_fashion_house',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
        },
        stats: { likes: 92, comments: 14, shares: 9 },
        condition: 'very_good',
        isLiked: false,
        createdAt: '2024-01-18T10:25:00Z'
      },
      {
        id: 'accessories-10',
        title: 'Prada Saffiano Leather Gloves - Black',
        brand: 'Prada',
        price: '$125',
        originalPrice: '$195',
        size: 'Size 7',
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc10',
          username: 'italian_leather_goods',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
        },
        stats: { likes: 76, comments: 11, shares: 6 },
        condition: 'excellent',
        isLiked: true,
        createdAt: '2024-01-17T15:50:00Z'
      },
      {
        id: 'accessories-11',
        title: 'Van Cleef & Arpels Alhambra Pearl Earrings',
        brand: 'Van Cleef & Arpels',
        price: '$895',
        originalPrice: '$1,350',
        size: '1.2cm',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc11',
          username: 'haute_joaillerie',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        stats: { likes: 234, comments: 38, shares: 25 },
        condition: 'excellent',
        isLiked: false,
        createdAt: '2024-01-16T14:15:00Z'
      },
      {
        id: 'accessories-12',
        title: 'Hermès Oran Sandals Charm Bag Accessory',
        brand: 'Hermès',
        price: '$165',
        originalPrice: '$250',
        size: '5cm',
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop'],
        seller: {
          id: 'seller-acc12',
          username: 'hermes_collector',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
        },
        stats: { likes: 145, comments: 22, shares: 16 },
        condition: 'new_with_tags',
        isLiked: true,
        createdAt: '2024-01-15T11:40:00Z'
      }
    ]
  }
};

// ===== ENTERPRISE UNIVERSAL CATEGORY PAGE FACTORY =====
export class UniversalCategoryPageFactory {
  private readonly configurationCache: Map<string, UniversalPageConfiguration> = new Map();

  /**
   * Get configuration for any category using universal architecture
   * Enhanced to support subcategory and subSubcategory parameters
   */
  public getConfiguration(category: string, subcategory?: string, subSubcategory?: string): Result<UniversalPageConfiguration, Error> {
    try {
      // Validate input parameters
      const validationResult = this.validateCategoryInput(category, subcategory, subSubcategory);
      if (validationResult.isError()) {
        return Result.failure(validationResult.error);
      }

      // Build configuration key with proper hierarchy
      const cacheKey = this.buildConfigurationKey(category, subcategory, subSubcategory);
      
      // Check cache first
      if (this.configurationCache.has(cacheKey)) {
        const cachedConfig = this.configurationCache.get(cacheKey)!;
        return Result.success(cachedConfig);
      }

      // Get configuration directly from the configurations map
      const baseConfig = UNIVERSAL_CATEGORY_CONFIGURATIONS[cacheKey];
      if (!baseConfig) {
        return Result.failure(new Error(`Configuration not found for category: ${cacheKey}`));
      }

      const finalConfig = baseConfig;

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
  private validateCategoryInput(category: string, subcategory?: string, subSubcategory?: string): Result<void, Error> {
    if (!category || typeof category !== 'string') {
      return Result.failure(new Error('Category must be a non-empty string'));
    }

    if (subcategory && typeof subcategory !== 'string') {
      return Result.failure(new Error('Subcategory must be a string if provided'));
    }

    if (subSubcategory && typeof subSubcategory !== 'string') {
      return Result.failure(new Error('SubSubcategory must be a string if provided'));
    }

    return Result.success(undefined);
  }

  /**
   * Build configuration key with proper hierarchy
   */
  private buildConfigurationKey(category: string, subcategory?: string, subSubcategory?: string): string {
    if (subSubcategory && subcategory) {
      return `${category}-${subcategory}-${subSubcategory}`;
    } else if (subcategory) {
      return `${category}-${subcategory}`;
    } else {
      return category;
    }
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