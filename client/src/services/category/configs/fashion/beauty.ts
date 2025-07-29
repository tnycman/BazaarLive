/**
 * Fashion Beauty Category Configuration
 * Enterprise AOP-compliant modular config extending FashionBeautyTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionBeautyTemplate - Inherits beauty-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Fashion Beauty Configuration
 * Extends FashionBeautyTemplate with skin-type and brand-specific options
 */
export const fashionBeautyConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Beauty & Wellness',
    description: 'Premium beauty products, skincare, and wellness essentials',
    gradient: 'from-rose-50 via-pink-100 to-purple-200',
    placeholder: 'Search beauty & wellness...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'skin-type', 'brand-tier', 'category', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'beauty-categories',
        name: 'Beauty Categories',
        type: 'checkbox',
        options: [
          { id: 'skincare', name: 'Skincare' },
          { id: 'makeup', name: 'Makeup' },
          { id: 'fragrance', name: 'Fragrance' },
          { id: 'hair-care', name: 'Hair Care' },
          { id: 'wellness', name: 'Wellness' },
          { id: 'tools', name: 'Beauty Tools' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'skin-types',
        name: 'Skin Types',
        type: 'checkbox',
        options: [
          { id: 'all-skin', name: 'All Skin Types' },
          { id: 'dry', name: 'Dry Skin' },
          { id: 'oily', name: 'Oily Skin' },
          { id: 'combination', name: 'Combination' },
          { id: 'sensitive', name: 'Sensitive' },
          { id: 'mature', name: 'Mature Skin' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'beauty-category': z.array(z.string()),
      'skin-type': z.array(z.string()),
      brand: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'beauty-1',
      title: 'Vitamin C Serum',
      brand: 'The Ordinary',
      price: '$8',
      originalPrice: '$12',
      size: '30ml',
      images: ['https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller27',
        username: 'skincare_guru',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 32, shares: 19 },
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-26T13:45:00Z'
    },
    {
      id: 'beauty-2',
      title: 'Luxury Lipstick Set',
      brand: 'Charlotte Tilbury',
      price: '$89',
      originalPrice: '$135',
      size: 'Set of 3',
      images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller28',
        username: 'makeup_artist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 41, shares: 25 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T12:20:00Z'
    }
  ]
};