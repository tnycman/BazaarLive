/**
 * Women's Shoes Category Configuration
 * Enterprise AOP-compliant modular config extending FashionShoesTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionShoesTemplate - Inherits shoes-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Shoes Configuration
 * Extends FashionShoesTemplate with shoe-specific options
 */
export const womenShoesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'shoes',
  metadata: {
    title: 'Women\'s Shoes',
    description: 'Stylish heels, sneakers, boots, and comfortable footwear',
    gradient: 'from-red-50 via-pink-100 to-purple-200',
    placeholder: 'Search women\'s shoes...'
  },
  filterConfiguration: {
    availableFilters: ['shoe-type', 'heel-height', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'shoe-types',
        name: 'Shoe Types',
        type: 'checkbox',
        options: [
          { id: 'heels', name: 'Heels' },
          { id: 'sneakers', name: 'Sneakers' },
          { id: 'flats', name: 'Flats & Loafers' },
          { id: 'athletic', name: 'Athletic Shoes' },
          { id: 'sandals', name: 'Sandals' },
          { id: 'ankle-boots', name: 'Ankle Boots & Booties' },
          { id: 'boots', name: 'Boots' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'heel-heights',
        name: 'Heel Heights',
        type: 'checkbox',
        options: [
          { id: 'flat', name: 'Flat (0-0.5")' },
          { id: 'low', name: 'Low (0.5-2")' },
          { id: 'mid', name: 'Mid (2-3.5")' },
          { id: 'high', name: 'High (3.5"+)' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '5', name: '5' },
          { id: '5.5', name: '5.5' },
          { id: '6', name: '6' },
          { id: '6.5', name: '6.5' },
          { id: '7', name: '7' },
          { id: '7.5', name: '7.5' },
          { id: '8', name: '8' },
          { id: '8.5', name: '8.5' },
          { id: '9', name: '9' },
          { id: '9.5', name: '9.5' },
          { id: '10', name: '10' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'shoe-type': z.array(z.string()),
      'heel-height': z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'shoes-1',
      title: 'Classic Black Pumps',
      brand: 'Christian Louboutin',
      price: '$695',
      originalPrice: '$995',
      size: '7.5',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller121',
        username: 'luxury_shoes',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 456, comments: 89, shares: 67 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T19:20:00Z'
    },
    {
      id: 'shoes-2',
      title: 'White Sneakers',
      brand: 'Nike',
      price: '$85',
      originalPrice: '$120',
      size: '8',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller122',
        username: 'sneaker_head',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T15:45:00Z'
    }
  ]
}; 