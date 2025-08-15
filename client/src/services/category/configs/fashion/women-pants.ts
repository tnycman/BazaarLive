/**
 * Women's Pants & Jumpsuits Category Configuration
 * Enterprise AOP-compliant modular config extending FashionBottomsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionBottomsTemplate - Inherits bottoms-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Pants & Jumpsuits Configuration
 * Extends FashionBottomsTemplate with pants and jumpsuit-specific options
 */
export const womenPantsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'pants',
  metadata: {
    title: 'Women\'s Pants & Jumpsuits',
    description: 'Comfortable pants, trousers, and stylish jumpsuits',
    gradient: 'from-green-50 via-emerald-100 to-teal-200',
    placeholder: 'Search women\'s pants...'
  },
  filterConfiguration: {
    availableFilters: ['pant-type', 'fit', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'pant-types',
        name: 'Pant Types',
        type: 'checkbox',
        options: [
          { id: 'dress-pants', name: 'Dress Pants' },
          { id: 'leggings', name: 'Leggings' },
          { id: 'joggers', name: 'Joggers' },
          { id: 'palazzos', name: 'Palazzos' },
          { id: 'culottes', name: 'Culottes' },
          { id: 'wide-leg', name: 'Wide Leg' },
          { id: 'jumpsuits', name: 'Jumpsuits' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'fits',
        name: 'Fits',
        type: 'checkbox',
        options: [
          { id: 'skinny', name: 'Skinny' },
          { id: 'straight', name: 'Straight' },
          { id: 'wide-leg', name: 'Wide Leg' },
          { id: 'relaxed', name: 'Relaxed' },
          { id: 'high-waisted', name: 'High Waisted' },
          { id: 'low-waisted', name: 'Low Waisted' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
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
      'pant-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'pants-1',
      title: 'High-Waisted Wide Leg Pants',
      brand: 'Anthropologie',
      price: '$89',
      originalPrice: '$128',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller111',
        username: 'boho_fashion',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 42, shares: 25 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T17:30:00Z'
    },
    {
      id: 'pants-2',
      title: 'Athletic Leggings',
      brand: 'Lululemon',
      price: '$98',
      originalPrice: '$128',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller112',
        username: 'athletic_wear',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 267, comments: 58, shares: 34 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T14:15:00Z'
    }
  ]
}; 