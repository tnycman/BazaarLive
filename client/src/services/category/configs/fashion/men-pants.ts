/**
 * Men's Pants Category Configuration
 * Enterprise AOP-compliant modular config extending FashionPantsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionPantsTemplate - Inherits pants-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Pants Configuration
 * Extends FashionPantsTemplate with men's pants-specific options
 */
export const menPantsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'pants',
  metadata: {
    title: 'Men\'s Pants',
    description: 'Professional dress pants, chinos, and casual trousers',
    gradient: 'from-gray-50 via-slate-100 to-gray-200',
    placeholder: 'Search men\'s pants...'
  },
  filterConfiguration: {
    availableFilters: ['pants-type', 'fit', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'pants-types',
        name: 'Pants Types',
        type: 'checkbox',
        options: [
          { id: 'dress-pants', name: 'Dress Pants' },
          { id: 'chinos', name: 'Chinos' },
          { id: 'khakis', name: 'Khakis' },
          { id: 'cargo-pants', name: 'Cargo Pants' },
          { id: 'joggers', name: 'Joggers' },
          { id: 'sweatpants', name: 'Sweatpants' },
          { id: 'track-pants', name: 'Track Pants' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'pants-fits',
        name: 'Pants Fits',
        type: 'checkbox',
        options: [
          { id: 'slim-fit', name: 'Slim Fit' },
          { id: 'straight-fit', name: 'Straight Fit' },
          { id: 'relaxed-fit', name: 'Relaxed Fit' },
          { id: 'tapered-fit', name: 'Tapered Fit' },
          { id: 'wide-leg', name: 'Wide Leg' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '28x30', name: '28x30' },
          { id: '30x30', name: '30x30' },
          { id: '30x32', name: '30x32' },
          { id: '32x30', name: '32x30' },
          { id: '32x32', name: '32x32' },
          { id: '32x34', name: '32x34' },
          { id: '34x30', name: '34x30' },
          { id: '34x32', name: '34x32' },
          { id: '34x34', name: '34x34' },
          { id: '36x30', name: '36x30' },
          { id: '36x32', name: '36x32' },
          { id: '36x34', name: '36x34' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'pants-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-pants-1',
      title: 'Classic Chino Pants',
      brand: 'J.Crew',
      price: '$65',
      originalPrice: '$89',
      size: '32x32',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller271',
        username: 'casual_fashion',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 178, comments: 38, shares: 22 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T21:00:00Z'
    },
    {
      id: 'men-pants-2',
      title: 'Dress Pants',
      brand: 'Brooks Brothers',
      price: '$125',
      originalPrice: '$165',
      size: '34x32',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller272',
        username: 'professional_wear',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 32, shares: 19 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T18:15:00Z'
    }
  ]
}; 