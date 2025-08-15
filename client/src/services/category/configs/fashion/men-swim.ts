/**
 * Men's Swim Category Configuration
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
 * Men's Swim Configuration
 * Extends FashionSwimTemplate with men's swim-specific options
 */
export const menSwimConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'swim',
  metadata: {
    title: 'Men\'s Swim',
    description: 'Swim trunks, board shorts, and swimwear',
    gradient: 'from-blue-50 via-cyan-100 to-blue-200',
    placeholder: 'Search men\'s swim...'
  },
  filterConfiguration: {
    availableFilters: ['swim-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'swim-types',
        name: 'Swim Types',
        type: 'checkbox',
        options: [
          { id: 'board-shorts-swim', name: 'Board Shorts' },
          { id: 'rashguards', name: 'Rashguards' },
          { id: 'swim-briefs', name: 'Swim Briefs' },
          { id: 'swim-shorts', name: 'Swim Shorts' },
          { id: 'swim-trunks', name: 'Swim Trunks' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'swim-materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'polyester', name: 'Polyester' },
          { id: 'nylon', name: 'Nylon' },
          { id: 'spandex', name: 'Spandex' },
          { id: 'lycra', name: 'Lycra' },
          { id: 'quick-dry', name: 'Quick-Dry' },
          { id: 'uv-protection', name: 'UV Protection' }
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
          { id: 'xxl', name: 'XXL' },
          { id: 'xxxl', name: 'XXXL' }
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
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-swim-1',
      title: 'Board Shorts',
      brand: 'Quiksilver',
      price: '$45',
      originalPrice: '$65',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller331',
        username: 'surf_gear',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 32, shares: 18 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-27T00:15:00Z'
    },
    {
      id: 'men-swim-2',
      title: 'Swim Trunks',
      brand: 'Speedo',
      price: '$35',
      originalPrice: '$50',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller332',
        username: 'swim_specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 123, comments: 28, shares: 15 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T22:30:00Z'
    }
  ]
}; 