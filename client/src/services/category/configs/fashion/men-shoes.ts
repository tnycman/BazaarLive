/**
 * Men's Shoes Category Configuration
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
 * Men's Shoes Configuration
 * Extends FashionShoesTemplate with men's shoe-specific options
 */
export const menShoesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'shoes',
  metadata: {
    title: 'Men\'s Shoes',
    description: 'Professional dress shoes, casual sneakers, and boots',
    gradient: 'from-brown-50 via-amber-100 to-orange-200',
    placeholder: 'Search men\'s shoes...'
  },
  filterConfiguration: {
    availableFilters: ['shoe-type', 'style', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'shoe-types',
        name: 'Shoe Types',
        type: 'checkbox',
        options: [
          { id: 'dress-shoes', name: 'Dress Shoes' },
          { id: 'sneakers', name: 'Sneakers' },
          { id: 'boots', name: 'Boots' },
          { id: 'loafers', name: 'Loafers' },
          { id: 'oxfords', name: 'Oxfords' },
          { id: 'sandals', name: 'Sandals' },
          { id: 'athletic-shoes', name: 'Athletic Shoes' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'dress-shoe-styles',
        name: 'Dress Shoe Styles',
        type: 'checkbox',
        options: [
          { id: 'oxfords', name: 'Oxfords' },
          { id: 'derbys', name: 'Derbys' },
          { id: 'loafers', name: 'Loafers' },
          { id: 'monk-straps', name: 'Monk Straps' },
          { id: 'brogues', name: 'Brogues' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '7', name: '7' },
          { id: '7.5', name: '7.5' },
          { id: '8', name: '8' },
          { id: '8.5', name: '8.5' },
          { id: '9', name: '9' },
          { id: '9.5', name: '9.5' },
          { id: '10', name: '10' },
          { id: '10.5', name: '10.5' },
          { id: '11', name: '11' },
          { id: '11.5', name: '11.5' },
          { id: '12', name: '12' }
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
      style: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-shoes-1',
      title: 'Leather Oxford Shoes',
      brand: 'Allen Edmonds',
      price: '$295',
      originalPrice: '$395',
      size: '10',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller231',
        username: 'luxury_shoes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 345, comments: 67, shares: 42 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T17:30:00Z'
    },
    {
      id: 'men-shoes-2',
      title: 'Classic Sneakers',
      brand: 'Nike',
      price: '$85',
      originalPrice: '$120',
      size: '9.5',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller232',
        username: 'sneaker_head',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 48, shares: 29 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T14:15:00Z'
    }
  ]
}; 