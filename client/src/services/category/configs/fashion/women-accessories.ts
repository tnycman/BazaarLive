/**
 * Women's Accessories Category Configuration
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
 * Women's Accessories Configuration
 * Extends FashionAccessoriesTemplate with jewelry and accessory-specific options
 */
export const womenAccessoriesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'accessories',
  metadata: {
    title: 'Women\'s Accessories',
    description: 'Elegant jewelry, handbags, scarves, and fashion accessories',
    gradient: 'from-purple-50 via-pink-100 to-rose-200',
    placeholder: 'Search women\'s accessories...'
  },
  filterConfiguration: {
    availableFilters: ['accessory-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'accessory-types',
        name: 'Accessory Types',
        type: 'checkbox',
        options: [
          { id: 'jewelry', name: 'Jewelry' },
          { id: 'handbags', name: 'Handbags' },
          { id: 'scarves', name: 'Scarves' },
          { id: 'belts', name: 'Belts' },
          { id: 'sunglasses', name: 'Sunglasses' },
          { id: 'hats', name: 'Hats' },
          { id: 'watches', name: 'Watches' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'jewelry-types',
        name: 'Jewelry Types',
        type: 'checkbox',
        options: [
          { id: 'necklaces', name: 'Necklaces' },
          { id: 'earrings', name: 'Earrings' },
          { id: 'bracelets', name: 'Bracelets' },
          { id: 'rings', name: 'Rings' },
          { id: 'brooches', name: 'Brooches' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'gold', name: 'Gold' },
          { id: 'silver', name: 'Silver' },
          { id: 'leather', name: 'Leather' },
          { id: 'silk', name: 'Silk' },
          { id: 'cotton', name: 'Cotton' },
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
      id: 'accessories-1',
      title: 'Pearl Drop Earrings',
      brand: 'Tiffany & Co.',
      price: '$285',
      originalPrice: '$420',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller31',
        username: 'luxury_jewelry',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 48, shares: 29 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T17:20:00Z'
    },
    {
      id: 'accessories-2',
      title: 'Designer Leather Handbag',
      brand: 'Coach',
      price: '$189',
      originalPrice: '$295',
      size: 'Medium',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller32',
        username: 'handbag_heaven',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 178, comments: 35, shares: 22 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T11:45:00Z'
    }
  ]
};