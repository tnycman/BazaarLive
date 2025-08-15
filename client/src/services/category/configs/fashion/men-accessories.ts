/**
 * Men's Accessories Category Configuration
 * Enterprise AOP-compliant modular config extending FashionAccessoriesTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionAccessoriesTemplate - Inherits accessories-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Accessories Configuration
 * Extends FashionAccessoriesTemplate with men's accessory-specific options
 */
export const menAccessoriesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'accessories',
  metadata: {
    title: 'Men\'s Accessories',
    description: 'Stylish ties, watches, belts, and fashion accessories',
    gradient: 'from-blue-50 via-indigo-100 to-purple-200',
    placeholder: 'Search men\'s accessories...'
  },
  filterConfiguration: {
    availableFilters: ['accessory-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'accessory-types',
        name: 'Accessory Types',
        type: 'checkbox',
        options: [
          { id: 'ties', name: 'Ties' },
          { id: 'watches', name: 'Watches' },
          { id: 'belts', name: 'Belts' },
          { id: 'wallets', name: 'Wallets' },
          { id: 'sunglasses', name: 'Sunglasses' },
          { id: 'hats', name: 'Hats' },
          { id: 'cufflinks', name: 'Cufflinks' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'watch-types',
        name: 'Watch Types',
        type: 'checkbox',
        options: [
          { id: 'dress-watches', name: 'Dress Watches' },
          { id: 'sport-watches', name: 'Sport Watches' },
          { id: 'luxury-watches', name: 'Luxury Watches' },
          { id: 'smartwatches', name: 'Smartwatches' },
          { id: 'casual-watches', name: 'Casual Watches' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'leather', name: 'Leather' },
          { id: 'metal', name: 'Metal' },
          { id: 'silk', name: 'Silk' },
          { id: 'cotton', name: 'Cotton' },
          { id: 'canvas', name: 'Canvas' },
          { id: 'synthetic', name: 'Synthetic' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'accessory-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-accessories-1',
      title: 'Classic Silk Tie',
      brand: 'Brooks Brothers',
      price: '$45',
      originalPrice: '$68',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller201',
        username: 'classic_accessories',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 42, shares: 25 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T14:30:00Z'
    },
    {
      id: 'men-accessories-2',
      title: 'Leather Dress Belt',
      brand: 'Allen Edmonds',
      price: '$65',
      originalPrice: '$95',
      size: '36"',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller202',
        username: 'premium_leather',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 31, shares: 18 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T11:15:00Z'
    }
  ]
}; 