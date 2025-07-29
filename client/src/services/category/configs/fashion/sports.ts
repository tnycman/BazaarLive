/**
 * Fashion Sports Category Configuration
 * Enterprise AOP-compliant modular config extending FashionSportsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionSportsTemplate - Inherits sports-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Fashion Sports Configuration
 * Extends FashionSportsTemplate with activity-type and equipment-specific options
 */
export const fashionSportsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Sports & Outdoors', 
    description: 'Athletic wear, outdoor gear, and sports equipment for active lifestyles',
    gradient: 'from-cyan-50 via-blue-100 to-indigo-200',
    placeholder: 'Search sports & outdoors...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'activity-type', 'equipment-category', 'brand', 'size', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'activity-types',
        name: 'Activity Types',
        type: 'checkbox',
        options: [
          { id: 'running', name: 'Running' },
          { id: 'yoga', name: 'Yoga' },
          { id: 'hiking', name: 'Hiking' },
          { id: 'cycling', name: 'Cycling' },
          { id: 'swimming', name: 'Swimming' },
          { id: 'gym', name: 'Gym & Fitness' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'equipment-categories',
        name: 'Equipment Categories',
        type: 'checkbox',
        options: [
          { id: 'apparel', name: 'Athletic Apparel' },
          { id: 'footwear', name: 'Athletic Footwear' },
          { id: 'equipment', name: 'Sports Equipment' },
          { id: 'accessories', name: 'Accessories' },
          { id: 'outdoor-gear', name: 'Outdoor Gear' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'activity-type': z.array(z.string()),
      'equipment-category': z.array(z.string()),
      brand: z.array(z.string()),
      size: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'sports-1',
      title: 'Nike Air Max Running Shoes',
      brand: 'Nike',
      price: '$89',
      originalPrice: '$130',
      size: '9',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller29',
        username: 'runner_life',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 167, comments: 34, shares: 21 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T15:30:00Z'
    },
    {
      id: 'sports-2',
      title: 'Yoga Mat Premium',
      brand: 'Lululemon',
      price: '$58',
      originalPrice: '$88',
      size: '6mm',
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller30',
        username: 'zen_warrior',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 98, comments: 22, shares: 14 },
      condition: 'good',
      isLiked: false,
      createdAt: '2024-01-25T09:45:00Z'
    }
  ]
};