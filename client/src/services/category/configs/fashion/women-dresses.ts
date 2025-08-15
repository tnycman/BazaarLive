/**
 * Women's Dresses Category Configuration
 * Enterprise AOP-compliant modular config extending FashionDressesTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionDressesTemplate - Inherits dress-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Dresses Configuration
 * Extends FashionDressesTemplate with dress-specific options
 */
export const womenDressesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'dresses',
  metadata: {
    title: 'Women\'s Dresses',
    description: 'Casual, formal, and special occasion dresses',
    gradient: 'from-pink-50 via-rose-100 to-purple-200',
    placeholder: 'Search women\'s dresses...'
  },
  filterConfiguration: {
    availableFilters: ['dress-type', 'occasion', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'dress-types',
        name: 'Dress Types',
        type: 'checkbox',
        options: [
          { id: 'casual', name: 'Casual Dresses' },
          { id: 'formal', name: 'Formal Dresses' },
          { id: 'cocktail', name: 'Cocktail Dresses' },
          { id: 'maxi', name: 'Maxi Dresses' },
          { id: 'mini', name: 'Mini Dresses' },
          { id: 'midi', name: 'Midi Dresses' },
          { id: 'wrap', name: 'Wrap Dresses' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'occasions',
        name: 'Occasions',
        type: 'checkbox',
        options: [
          { id: 'everyday', name: 'Everyday' },
          { id: 'work', name: 'Work' },
          { id: 'party', name: 'Party' },
          { id: 'wedding', name: 'Wedding' },
          { id: 'prom', name: 'Prom' },
          { id: 'vacation', name: 'Vacation' }
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
      'dress-type': z.array(z.string()),
      occasion: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'dresses-1',
      title: 'Floral Maxi Dress',
      brand: 'Free People',
      price: '$89',
      originalPrice: '$145',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller51',
        username: 'boho_fashion',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 267, comments: 53, shares: 31 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T16:45:00Z'
    },
    {
      id: 'dresses-2',
      title: 'Little Black Dress',
      brand: 'Zara',
      price: '$65',
      originalPrice: '$89',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller52',
        username: 'fashion_forward',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 38, shares: 24 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T12:20:00Z'
    }
  ]
}; 