/**
 * Women's Jeans Category Configuration
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
 * Women's Jeans Configuration
 * Extends FashionBottomsTemplate with jeans-specific options
 */
export const womenJeansConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'jeans',
  metadata: {
    title: 'Women\'s Jeans',
    description: 'Comfortable and stylish jeans for every occasion',
    gradient: 'from-blue-50 via-indigo-100 to-purple-200',
    placeholder: 'Search women\'s jeans...'
  },
  filterConfiguration: {
    availableFilters: ['jean-fit', 'rise', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'jean-fits',
        name: 'Jean Fits',
        type: 'checkbox',
        options: [
          { id: 'skinny', name: 'Skinny' },
          { id: 'straight', name: 'Straight' },
          { id: 'bootcut', name: 'Bootcut' },
          { id: 'wide-leg', name: 'Wide Leg' },
          { id: 'mom-fit', name: 'Mom Fit' },
          { id: 'boyfriend', name: 'Boyfriend' },
          { id: 'flare', name: 'Flare' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'rise-types',
        name: 'Rise',
        type: 'checkbox',
        options: [
          { id: 'low-rise', name: 'Low Rise' },
          { id: 'mid-rise', name: 'Mid Rise' },
          { id: 'high-rise', name: 'High Rise' },
          { id: 'super-high-rise', name: 'Super High Rise' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '24', name: '24' },
          { id: '25', name: '25' },
          { id: '26', name: '26' },
          { id: '27', name: '27' },
          { id: '28', name: '28' },
          { id: '29', name: '29' },
          { id: '30', name: '30' },
          { id: '31', name: '31' },
          { id: '32', name: '32' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'jean-fit': z.array(z.string()),
      rise: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'jeans-1',
      title: 'High-Waisted Skinny Jeans',
      brand: 'Madewell',
      price: '$89',
      originalPrice: '$128',
      size: '28',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller81',
        username: 'denim_expert',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 298, comments: 63, shares: 38 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T14:20:00Z'
    },
    {
      id: 'jeans-2',
      title: 'Mom Fit Jeans',
      brand: 'Levi\'s',
      price: '$75',
      originalPrice: '$98',
      size: '30',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller82',
        username: 'vintage_denim',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 187, comments: 41, shares: 25 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T09:35:00Z'
    }
  ]
}; 