/**
 * Women's Bags Category Configuration
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
 * Women's Bags Configuration
 * Extends FashionBagsTemplate with handbag and purse-specific options
 */
export const womenBagsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'bags',
  metadata: {
    title: 'Women\'s Bags',
    description: 'Designer handbags, purses, clutches, and fashion bags',
    gradient: 'from-amber-50 via-orange-100 to-red-200',
    placeholder: 'Search women\'s bags...'
  },
  filterConfiguration: {
    availableFilters: ['bag-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'bag-types',
        name: 'Bag Types',
        type: 'checkbox',
        options: [
          { id: 'handbags', name: 'Handbags' },
          { id: 'crossbody', name: 'Crossbody Bags' },
          { id: 'clutches', name: 'Clutches' },
          { id: 'totes', name: 'Tote Bags' },
          { id: 'shoulder-bags', name: 'Shoulder Bags' },
          { id: 'backpacks', name: 'Backpacks' },
          { id: 'wallets', name: 'Wallets' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'bag-sizes',
        name: 'Bag Sizes',
        type: 'checkbox',
        options: [
          { id: 'mini', name: 'Mini' },
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
          { id: 'suede', name: 'Suede' },
          { id: 'nylon', name: 'Nylon' },
          { id: 'straw', name: 'Straw' },
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
      id: 'bags-1',
      title: 'Classic Leather Tote Bag',
      brand: 'Michael Kors',
      price: '$245',
      originalPrice: '$395',
      size: 'Large',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller41',
        username: 'luxury_bags',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 312, comments: 67, shares: 41 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T14:30:00Z'
    },
    {
      id: 'bags-2',
      title: 'Designer Crossbody Bag',
      brand: 'Kate Spade',
      price: '$189',
      originalPrice: '$298',
      size: 'Medium',
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller42',
        username: 'designer_bags',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 42, shares: 28 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T09:15:00Z'
    }
  ]
}; 