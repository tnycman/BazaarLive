/**
 * Women's Shorts Category Configuration
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
 * Women's Shorts Configuration
 * Extends FashionBottomsTemplate with shorts-specific options
 */
export const womenShortsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'shorts',
  metadata: {
    title: 'Women\'s Shorts',
    description: 'Comfortable and stylish shorts for every season',
    gradient: 'from-orange-50 via-yellow-100 to-amber-200',
    placeholder: 'Search women\'s shorts...'
  },
  filterConfiguration: {
    availableFilters: ['short-type', 'length', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'short-types',
        name: 'Short Types',
        type: 'checkbox',
        options: [
          { id: 'denim-shorts', name: 'Denim Shorts' },
          { id: 'casual-shorts', name: 'Casual Shorts' },
          { id: 'dressy-shorts', name: 'Dressy Shorts' },
          { id: 'athletic-shorts', name: 'Athletic Shorts' },
          { id: 'high-waisted', name: 'High-Waisted Shorts' },
          { id: 'bermuda', name: 'Bermuda Shorts' },
          { id: 'bike-shorts', name: 'Bike Shorts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'lengths',
        name: 'Lengths',
        type: 'checkbox',
        options: [
          { id: 'mini', name: 'Mini (2-4")' },
          { id: 'short', name: 'Short (4-6")' },
          { id: 'mid', name: 'Mid (6-8")' },
          { id: 'long', name: 'Long (8"+)' }
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
      'short-type': z.array(z.string()),
      length: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'shorts-1',
      title: 'High-Waisted Denim Shorts',
      brand: 'Levi\'s',
      price: '$45',
      originalPrice: '$68',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller131',
        username: 'denim_lover',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 178, comments: 38, shares: 22 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T16:45:00Z'
    },
    {
      id: 'shorts-2',
      title: 'Athletic Shorts',
      brand: 'Nike',
      price: '$32',
      originalPrice: '$45',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller132',
        username: 'fitness_fashion',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 31, shares: 18 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T11:30:00Z'
    }
  ]
}; 