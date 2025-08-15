/**
 * Men's Jeans Category Configuration
 * Enterprise AOP-compliant modular config extending FashionJeansTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionJeansTemplate - Inherits jeans-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Jeans Configuration
 * Extends FashionJeansTemplate with men's jeans-specific options
 */
export const menJeansConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'jeans',
  metadata: {
    title: 'Men\'s Jeans',
    description: 'Classic denim jeans in various fits and styles',
    gradient: 'from-blue-50 via-indigo-100 to-blue-200',
    placeholder: 'Search men\'s jeans...'
  },
  filterConfiguration: {
    availableFilters: ['jeans-fit', 'wash', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'jeans-fits',
        name: 'Jeans Fits',
        type: 'checkbox',
        options: [
          { id: 'skinny', name: 'Skinny' },
          { id: 'slim', name: 'Slim' },
          { id: 'straight', name: 'Straight' },
          { id: 'relaxed', name: 'Relaxed' },
          { id: 'bootcut', name: 'Bootcut' },
          { id: 'tapered', name: 'Tapered' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'jeans-washes',
        name: 'Jeans Washes',
        type: 'checkbox',
        options: [
          { id: 'dark-wash', name: 'Dark Wash' },
          { id: 'medium-wash', name: 'Medium Wash' },
          { id: 'light-wash', name: 'Light Wash' },
          { id: 'distressed', name: 'Distressed' },
          { id: 'acid-wash', name: 'Acid Wash' },
          { id: 'raw-denim', name: 'Raw Denim' }
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
      'jeans-fit': z.array(z.string()),
      wash: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-jeans-1',
      title: 'Classic Straight Leg Jeans',
      brand: 'Levi\'s',
      price: '$89',
      originalPrice: '$120',
      size: '32x32',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller261',
        username: 'denim_expert',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T20:15:00Z'
    },
    {
      id: 'men-jeans-2',
      title: 'Slim Fit Dark Wash Jeans',
      brand: 'J.Crew',
      price: '$95',
      originalPrice: '$135',
      size: '30x32',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller262',
        username: 'premium_denim',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 41, shares: 24 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T17:30:00Z'
    }
  ]
}; 