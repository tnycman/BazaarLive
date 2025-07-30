/**
 * Enterprise Women's Fashion Configuration
 * Migrated to strict enterprise schemas with zero z.any() violations
 * 100% type-safe, zero shortcuts, complete AOP compliance
 */

import { z } from 'zod';
import { 
  UniversalPageConfigurationSchema,
  type UniversalPageConfiguration,
  type DefaultFiltersConfig,
  type CategoryFilter,
  ConditionTypeSchema,
  AvailabilityTypeSchema,
  ColorTypeSchema
} from '../schemas/ConfigurationSchemas';

// ===== WOMEN'S SPECIFIC FILTER SCHEMAS =====

const WomensSizeSchema = z.enum(['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18']);

const WomensSubcategorySchema = z.enum([
  'dresses', 'tops', 'sweaters', 'jeans', 'pants', 'skirts', 'shorts', 
  'jackets', 'coats', 'activewear', 'intimates', 'sleepwear', 'swimwear',
  'shoes', 'bags', 'accessories', 'jewelry', 'makeup'
]);

// ===== WOMEN'S FILTER CONFIGURATION =====

const womensFilterValidationRules = {
  size: {
    fieldName: 'size',
    validationType: 'array' as const,
    schema: z.array(WomensSizeSchema),
    required: false,
    errorMessage: 'Invalid women\'s size selection'
  },
  brand: {
    fieldName: 'brand',
    validationType: 'array' as const,
    schema: z.array(z.string().min(1)),
    required: false,
    errorMessage: 'Invalid brand selection'
  },
  color: {
    fieldName: 'color',
    validationType: 'array' as const,
    schema: z.array(ColorTypeSchema),
    required: false,
    errorMessage: 'Invalid color selection'
  },
  condition: {
    fieldName: 'condition',
    validationType: 'array' as const,
    schema: z.array(ConditionTypeSchema),
    required: false,
    errorMessage: 'Invalid condition selection'
  },
  subcategory: {
    fieldName: 'subcategory',
    validationType: 'array' as const,
    schema: z.array(WomensSubcategorySchema),
    required: false,
    errorMessage: 'Invalid subcategory selection'
  },
  priceRange: {
    fieldName: 'priceRange',
    validationType: 'object' as const,
    schema: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }),
    required: false,
    errorMessage: 'Invalid price range'
  }
};

const womensDefaultFilters: DefaultFiltersConfig = {
  condition: ['new_with_tags', 'excellent'],
  availability: ['all-items'],
  colors: [],
  brands: [],
  sizes: []
};

const womensCategorySpecificFilters: CategoryFilter[] = [
  {
    id: 'women-sizes',
    name: 'Women\'s Sizes',
    type: 'checkbox',
    options: [
      { id: 'xxs', name: 'XXS' },
      { id: 'xs', name: 'XS' },
      { id: 's', name: 'S' },
      { id: 'm', name: 'M' },
      { id: 'l', name: 'L' },
      { id: 'xl', name: 'XL' },
      { id: 'xxl', name: 'XXL' }
    ],
    validation: z.array(WomensSizeSchema),
    required: false,
    displayOrder: 1,
    grouping: 'sizing',
    placeholder: 'Select sizes...',
    helpText: 'Choose one or more sizes'
  },
  {
    id: 'women-subcategories',
    name: 'Category',
    type: 'checkbox',
    options: [
      { id: 'dresses', name: 'Dresses', count: 1250 },
      { id: 'tops', name: 'Tops', count: 2840 },
      { id: 'sweaters', name: 'Sweaters', count: 980 },
      { id: 'jeans', name: 'Jeans', count: 1560 },
      { id: 'pants', name: 'Pants', count: 1120 },
      { id: 'skirts', name: 'Skirts', count: 670 },
      { id: 'shoes', name: 'Shoes', count: 3200 },
      { id: 'bags', name: 'Bags', count: 1890 },
      { id: 'accessories', name: 'Accessories', count: 2340 },
      { id: 'jewelry', name: 'Jewelry', count: 1450 }
    ],
    validation: z.array(WomensSubcategorySchema),
    required: false,
    displayOrder: 0,
    grouping: 'category',
    placeholder: 'Select categories...',
    helpText: 'Filter by clothing and accessory types'
  }
];

// ===== ENTERPRISE WOMEN'S CONFIGURATION =====

export const enterpriseWomenConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  metadata: {
    title: 'Women\'s Fashion',
    description: 'Discover the latest in women\'s fashion, accessories, and style trends',
    gradient: 'from-pink-50 via-rose-100 to-pink-200',
    placeholder: 'Search women\'s fashion...',
    icon: '👗',
    seoKeywords: ['women fashion', 'designer clothing', 'women accessories', 'fashion trends'],
    seoDescription: 'Shop curated women\'s fashion from top designers and brands. Find dresses, tops, shoes, bags, and accessories.',
    canonicalUrl: '/fashion/women',
    openGraphImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&h=630&fit=crop'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: womensCategorySpecificFilters,
    defaultFilters: womensDefaultFilters,
    filterValidationRules: womensFilterValidationRules,
    maxFiltersPerQuery: 15,
    enableAdvancedFiltering: true
  },
  sampleProducts: [
    {
      id: 'women-premium-1',
      title: 'Designer Silk Blouse',
      brand: 'Theory',
      price: '$89',
      originalPrice: '$165',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-enterprise-1',
        username: 'fashionista_jane',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 4.8,
        totalSales: 342,
        verificationStatus: 'verified'
      },
      stats: { likes: 24, comments: 8, shares: 3, views: 156, saves: 12 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T10:30:00Z',
      updatedAt: '2024-01-26T14:20:00Z',
      category: 'fashion',
      subcategory: 'tops',
      tags: ['silk', 'professional', 'designer'],
      availability: 'available-now'
    },
    {
      id: 'women-premium-2',
      title: 'Vintage Denim Jacket',
      brand: 'Levi\'s',
      price: '$65',
      originalPrice: '$98',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-enterprise-2',
        username: 'vintage_vibes',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop',
        rating: 4.6,
        totalSales: 189,
        verificationStatus: 'verified'
      },
      stats: { likes: 67, comments: 15, shares: 9, views: 234, saves: 28 },
      condition: 'good',
      isLiked: true,
      createdAt: '2024-01-24T14:20:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
      category: 'fashion',
      subcategory: 'jackets',
      tags: ['vintage', 'denim', 'classic'],
      availability: 'available-now'
    },
    {
      id: 'women-premium-3',
      title: 'Cashmere Sweater',
      brand: 'Everlane',
      price: '$118',
      originalPrice: '$168',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-enterprise-3',
        username: 'cozy_closet',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        rating: 4.9,
        totalSales: 567,
        verificationStatus: 'verified'
      },
      stats: { likes: 43, comments: 12, shares: 6, views: 189, saves: 35 },
      condition: 'new_with_tags',
      isLiked: false,
      createdAt: '2024-01-23T16:45:00Z',
      updatedAt: '2024-01-24T11:30:00Z',
      category: 'fashion',
      subcategory: 'sweaters',
      tags: ['cashmere', 'luxury', 'warm'],
      availability: 'available-now'
    }
  ],
  version: '2.0.0',
  lastUpdated: new Date().toISOString(),
  configurationId: crypto.randomUUID(),
  isActive: true
};

// ===== VALIDATION AND EXPORT =====

// Validate the configuration against the enterprise schema
const validationResult = UniversalPageConfigurationSchema.safeParse(enterpriseWomenConfig);

if (!validationResult.success) {
  console.error('Enterprise Women\'s Configuration Validation Failed:', validationResult.error);
  throw new Error('Configuration validation failed - check console for details');
}

export { enterpriseWomenConfig as default };