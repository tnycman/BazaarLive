/**
 * Enterprise Men's Fashion Configuration
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

// ===== MEN'S SPECIFIC FILTER SCHEMAS =====

const MensSizeSchema = z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', '28', '30', '32', '34', '36', '38', '40', '42']);

const MensSubcategorySchema = z.enum([
  'shirts', 'pants', 'jeans', 'shorts', 'suits', 'blazers', 'sweaters', 'hoodies',
  'jackets', 'coats', 'activewear', 'underwear', 'socks', 'swimwear',
  'shoes', 'sneakers', 'boots', 'accessories', 'bags', 'watches', 'ties'
]);

// ===== MEN'S FILTER CONFIGURATION =====

const mensFilterValidationRules = {
  size: {
    fieldName: 'size',
    validationType: 'array' as const,
    schema: z.array(MensSizeSchema),
    required: false,
    errorMessage: 'Invalid men\'s size selection'
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
    schema: z.array(MensSubcategorySchema),
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

const mensDefaultFilters: DefaultFiltersConfig = {
  condition: ['new_with_tags', 'excellent'],
  availability: ['all-items'],
  colors: [],
  brands: [],
  sizes: []
};

const mensCategorySpecificFilters: CategoryFilter[] = [
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
    validation: z.array(MensSizeSchema),
    required: false,
    displayOrder: 1,
    grouping: 'sizing',
    placeholder: 'Select sizes...',
    helpText: 'Choose one or more sizes'
  },
  {
    id: 'men-subcategories',
    name: 'Category',
    type: 'checkbox',
    options: [
      { id: 'shirts', name: 'Shirts', count: 1890 },
      { id: 'pants', name: 'Pants', count: 1456 },
      { id: 'jeans', name: 'Jeans', count: 1234 },
      { id: 'suits', name: 'Suits & Blazers', count: 678 },
      { id: 'sweaters', name: 'Sweaters', count: 890 },
      { id: 'jackets', name: 'Jackets & Coats', count: 1120 },
      { id: 'shoes', name: 'Shoes', count: 2340 },
      { id: 'sneakers', name: 'Sneakers', count: 1567 },
      { id: 'accessories', name: 'Accessories', count: 1890 },
      { id: 'watches', name: 'Watches', count: 567 }
    ],
    validation: z.array(MensSubcategorySchema),
    required: false,
    displayOrder: 0,
    grouping: 'category',
    placeholder: 'Select categories...',
    helpText: 'Filter by clothing and accessory types'
  }
];

// ===== ENTERPRISE MEN'S CONFIGURATION =====

export const enterpriseMenConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  metadata: {
    title: 'Men\'s Fashion',
    description: 'Explore men\'s clothing, accessories, and contemporary style trends',
    gradient: 'from-blue-50 via-indigo-100 to-blue-200',
    placeholder: 'Search men\'s fashion...',
    icon: '👔',
    seoKeywords: ['men fashion', 'menswear', 'men accessories', 'style trends'],
    seoDescription: 'Shop premium men\'s fashion from top brands. Find shirts, pants, suits, shoes, and accessories.',
    canonicalUrl: '/fashion/men',
    openGraphImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&h=630&fit=crop'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: mensCategorySpecificFilters,
    defaultFilters: mensDefaultFilters,
    filterValidationRules: mensFilterValidationRules,
    maxFiltersPerQuery: 15,
    enableAdvancedFiltering: true
  },
  sampleProducts: [
    {
      id: 'men-premium-1',
      title: 'Classic Oxford Shirt',
      brand: 'Brooks Brothers',
      price: '$79',
      originalPrice: '$120',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-men-1',
        username: 'classic_style',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 4.7,
        totalSales: 289,
        verificationStatus: 'verified'
      },
      stats: { likes: 15, comments: 3, shares: 1, views: 89, saves: 8 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T08:15:00Z',
      updatedAt: '2024-01-26T10:30:00Z',
      category: 'fashion',
      subcategory: 'shirts',
      tags: ['oxford', 'classic', 'professional'],
      availability: 'available-now'
    },
    {
      id: 'men-premium-2',
      title: 'Tailored Wool Blazer',
      brand: 'Hugo Boss',
      price: '$245',
      originalPrice: '$450',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-men-2',
        username: 'sharp_dresser',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        rating: 4.9,
        totalSales: 156,
        verificationStatus: 'verified'
      },
      stats: { likes: 38, comments: 7, shares: 4, views: 145, saves: 22 },
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-24T11:45:00Z',
      updatedAt: '2024-01-25T15:20:00Z',
      category: 'fashion',
      subcategory: 'blazers',
      tags: ['wool', 'tailored', 'formal'],
      availability: 'available-now'
    },
    {
      id: 'men-premium-3',
      title: 'Premium Denim Jeans',
      brand: 'AG Jeans',
      price: '$98',
      originalPrice: '$158',
      size: '32',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller-men-3',
        username: 'denim_expert',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 4.8,
        totalSales: 423,
        verificationStatus: 'verified'
      },
      stats: { likes: 29, comments: 9, shares: 3, views: 167, saves: 18 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-23T13:30:00Z',
      updatedAt: '2024-01-24T16:45:00Z',
      category: 'fashion',
      subcategory: 'jeans',
      tags: ['premium', 'denim', 'slim-fit'],
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
const validationResult = UniversalPageConfigurationSchema.safeParse(enterpriseMenConfig);

if (!validationResult.success) {
  console.error('Enterprise Men\'s Configuration Validation Failed:', validationResult.error);
  throw new Error('Configuration validation failed - check console for details');
}

export { enterpriseMenConfig as default };