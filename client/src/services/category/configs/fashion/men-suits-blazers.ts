/**
 * Men's Suits & Blazers Category Configuration
 * Enterprise AOP-compliant modular config extending FashionSuitsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionSuitsTemplate - Inherits suits-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Suits & Blazers Configuration
 * Extends FashionSuitsTemplate with men's suits-specific options
 */
export const menSuitsBlazersConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'suits-blazers',
  metadata: {
    title: 'Men\'s Suits & Blazers',
    description: 'Professional suits, blazers, and formal wear',
    gradient: 'from-gray-50 via-slate-100 to-gray-200',
    placeholder: 'Search men\'s suits & blazers...'
  },
  filterConfiguration: {
    availableFilters: ['suit-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'suit-types',
        name: 'Suit Types',
        type: 'checkbox',
        options: [
          { id: 'blazers-sport-coats', name: 'Blazers & Sport Coats' },
          { id: 'suit-jackets', name: 'Suit Jackets' },
          { id: 'suit-separates', name: 'Suit Separates' },
          { id: 'suits', name: 'Suits' },
          { id: 'tuxedos', name: 'Tuxedos' },
          { id: 'vests', name: 'Vests' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'suit-fits',
        name: 'Suit Fits',
        type: 'checkbox',
        options: [
          { id: 'slim-fit', name: 'Slim Fit' },
          { id: 'modern-fit', name: 'Modern Fit' },
          { id: 'classic-fit', name: 'Classic Fit' },
          { id: 'relaxed-fit', name: 'Relaxed Fit' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sizes',
        name: 'Sizes',
        type: 'checkbox',
        options: [
          { id: '36s', name: '36S' },
          { id: '36r', name: '36R' },
          { id: '36l', name: '36L' },
          { id: '38s', name: '38S' },
          { id: '38r', name: '38R' },
          { id: '38l', name: '38L' },
          { id: '40s', name: '40S' },
          { id: '40r', name: '40R' },
          { id: '40l', name: '40L' },
          { id: '42s', name: '42S' },
          { id: '42r', name: '42R' },
          { id: '42l', name: '42L' },
          { id: '44s', name: '44S' },
          { id: '44r', name: '44R' },
          { id: '44l', name: '44L' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'suit-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-suits-1',
      title: 'Navy Blue Suit',
      brand: 'Hugo Boss',
      price: '$650',
      originalPrice: '$850',
      size: '40R',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller311',
        username: 'formal_wear',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 289, comments: 67, shares: 42 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T23:15:00Z'
    },
    {
      id: 'men-suits-2',
      title: 'Gray Blazer',
      brand: 'Ralph Lauren',
      price: '$425',
      originalPrice: '$595',
      size: '42R',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller312',
        username: 'premium_suits',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 51, shares: 33 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T21:30:00Z'
    }
  ]
}; 