/**
 * Women's Swim Category Configuration
 * Enterprise AOP-compliant modular config extending FashionSwimTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionSwimTemplate - Inherits swim-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Swim Configuration
 * Extends FashionSwimTemplate with swimwear-specific options
 */
export const womenSwimConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'swim',
  metadata: {
    title: 'Women\'s Swim',
    description: 'Stylish swimsuits, cover-ups, and beach accessories',
    gradient: 'from-blue-50 via-cyan-100 to-teal-200',
    placeholder: 'Search women\'s swim...'
  },
  filterConfiguration: {
    availableFilters: ['swim-type', 'coverage', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'swim-types',
        name: 'Swim Types',
        type: 'checkbox',
        options: [
          { id: 'one-piece', name: 'One-Piece' },
          { id: 'bikini', name: 'Bikini' },
          { id: 'tankini', name: 'Tankini' },
          { id: 'cover-ups', name: 'Cover-Ups' },
          { id: 'beach-accessories', name: 'Beach Accessories' },
          { id: 'swim-shorts', name: 'Swim Shorts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'coverage-levels',
        name: 'Coverage',
        type: 'checkbox',
        options: [
          { id: 'full-coverage', name: 'Full Coverage' },
          { id: 'moderate-coverage', name: 'Moderate Coverage' },
          { id: 'minimal-coverage', name: 'Minimal Coverage' },
          { id: 'high-waisted', name: 'High-Waisted' },
          { id: 'low-rise', name: 'Low-Rise' }
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
      'swim-type': z.array(z.string()),
      coverage: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'swim-1',
      title: 'Floral One-Piece Swimsuit',
      brand: 'Lands\' End',
      price: '$45',
      originalPrice: '$68',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller161',
        username: 'beach_fashion',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 41, shares: 24 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T19:45:00Z'
    },
    {
      id: 'swim-2',
      title: 'High-Waisted Bikini Set',
      brand: 'Victoria\'s Secret',
      price: '$58',
      originalPrice: '$85',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller162',
        username: 'swim_collection',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T16:20:00Z'
    }
  ]
}; 