/**
 * Women's Fashion Category Configuration
 * Enterprise AOP-compliant modular config extending FashionCategoryBase template
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionCategoryBase - Inherits fashion-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Fashion Configuration
 * Extends FashionCategoryBase with women-specific size and style options
 */
export const womenFashionConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Women\'s Fashion',
    description: 'Discover the latest in women\'s fashion, accessories, and style',
    gradient: 'from-pink-50 via-rose-100 to-pink-200',
    placeholder: 'Search women\'s fashion...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'women-sizes',
        name: 'Women\'s Sizes',
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
      size: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    // Row 1
    {
      id: 'women-1',
      title: 'Designer Silk Blouse',
      brand: 'Theory',
      price: '$89',
      originalPrice: '$165',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller1',
        username: 'fashionista_jane',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 24, comments: 8, shares: 3 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T10:30:00Z'
    },
    {
      id: 'women-2',
      title: 'Vintage Denim Jacket',
      brand: 'Levi\'s',
      price: '$65',
      originalPrice: '$98',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller2',
        username: 'vintage_vibes',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 15, shares: 9 },
      condition: 'good',
      isLiked: true,
      createdAt: '2024-01-24T14:20:00Z'
    },
    {
      id: 'women-3',
      title: 'Cashmere Sweater',
      brand: 'Everlane',
      price: '$118',
      originalPrice: '$168',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller3',
        username: 'cozy_closet',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
      },
      stats: { likes: 89, comments: 21, shares: 12 },
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-25T14:20:00Z'
    },
    {
      id: 'women-4',
      title: 'Midi Floral Dress',
      brand: 'Reformation',
      price: '$148',
      originalPrice: '$218',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller4',
        username: 'spring_styles',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop'
      },
      stats: { likes: 134, comments: 29, shares: 18 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-25T14:20:00Z'
    }
  ]
};