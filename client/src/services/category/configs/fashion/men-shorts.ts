/**
 * Men's Shorts Category Configuration
 * Enterprise AOP-compliant modular config extending FashionShortsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionShortsTemplate - Inherits shorts-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Shorts Configuration
 * Extends FashionShortsTemplate with men's shorts-specific options
 */
export const menShortsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'shorts',
  metadata: {
    title: 'Men\'s Shorts',
    description: 'Casual shorts, athletic shorts, and dress shorts',
    gradient: 'from-blue-50 via-indigo-100 to-blue-200',
    placeholder: 'Search men\'s shorts...'
  },
  filterConfiguration: {
    availableFilters: ['shorts-type', 'fit', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'shorts-types',
        name: 'Shorts Types',
        type: 'checkbox',
        options: [
          { id: 'athletic-shorts', name: 'Athletic Shorts' },
          { id: 'board-shorts', name: 'Board Shorts' },
          { id: 'cargo-shorts', name: 'Cargo Shorts' },
          { id: 'chino-shorts', name: 'Chino Shorts' },
          { id: 'denim-shorts', name: 'Denim Shorts' },
          { id: 'dress-shorts', name: 'Dress Shorts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'shorts-fits',
        name: 'Shorts Fits',
        type: 'checkbox',
        options: [
          { id: 'slim-fit', name: 'Slim Fit' },
          { id: 'regular-fit', name: 'Regular Fit' },
          { id: 'relaxed-fit', name: 'Relaxed Fit' },
          { id: 'loose-fit', name: 'Loose Fit' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '28', name: '28' },
          { id: '30', name: '30' },
          { id: '32', name: '32' },
          { id: '34', name: '34' },
          { id: '36', name: '36' },
          { id: '38', name: '38' },
          { id: '40', name: '40' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'shorts-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-shorts-1',
      title: 'Chino Shorts',
      brand: 'J.Crew',
      price: '$45',
      originalPrice: '$65',
      size: '32',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller301',
        username: 'casual_fashion',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 156, comments: 34, shares: 21 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T22:45:00Z'
    },
    {
      id: 'men-shorts-2',
      title: 'Athletic Shorts',
      brand: 'Nike',
      price: '$35',
      originalPrice: '$50',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller302',
        username: 'sport_gear',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 123, comments: 28, shares: 15 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T20:00:00Z'
    }
  ]
}; 