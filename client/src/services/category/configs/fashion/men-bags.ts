/**
 * Men's Bags Category Configuration
 * Enterprise AOP-compliant modular config extending FashionBagsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionBagsTemplate - Inherits bag-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Bags Configuration
 * Extends FashionBagsTemplate with men's bag-specific options
 */
export const menBagsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'bags',
  metadata: {
    title: 'Men\'s Bags',
    description: 'Professional briefcases, backpacks, and travel bags',
    gradient: 'from-gray-50 via-slate-100 to-gray-200',
    placeholder: 'Search men\'s bags...'
  },
  filterConfiguration: {
    availableFilters: ['bag-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'bag-types',
        name: 'Bag Types',
        type: 'checkbox',
        options: [
          { id: 'briefcases', name: 'Briefcases' },
          { id: 'backpacks', name: 'Backpacks' },
          { id: 'messenger-bags', name: 'Messenger Bags' },
          { id: 'duffel-bags', name: 'Duffel Bags' },
          { id: 'laptop-bags', name: 'Laptop Bags' },
          { id: 'travel-bags', name: 'Travel Bags' },
          { id: 'crossbody-bags', name: 'Crossbody Bags' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'bag-sizes',
        name: 'Bag Sizes',
        type: 'checkbox',
        options: [
          { id: 'small', name: 'Small' },
          { id: 'medium', name: 'Medium' },
          { id: 'large', name: 'Large' },
          { id: 'oversized', name: 'Oversized' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'leather', name: 'Leather' },
          { id: 'canvas', name: 'Canvas' },
          { id: 'nylon', name: 'Nylon' },
          { id: 'polyester', name: 'Polyester' },
          { id: 'suede', name: 'Suede' },
          { id: 'fabric', name: 'Fabric' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'bag-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-bags-1',
      title: 'Leather Briefcase',
      brand: 'Tumi',
      price: '$285',
      originalPrice: '$395',
      size: 'Large',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller211',
        username: 'professional_bags',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T15:45:00Z'
    },
    {
      id: 'men-bags-2',
      title: 'Canvas Backpack',
      brand: 'Herschel',
      price: '$65',
      originalPrice: '$89',
      size: 'Medium',
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller212',
        username: 'casual_bags',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 178, comments: 38, shares: 22 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T12:20:00Z'
    }
  ]
}; 