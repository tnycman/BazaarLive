/**
 * Men's Fashion Category Configuration
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
 * Men's Fashion Configuration
 * Extends FashionCategoryBase with men-specific size and style options
 */
export const menFashionConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Men\'s Fashion',
    description: 'Explore men\'s clothing, accessories, and contemporary style',
    gradient: 'from-blue-50 via-indigo-100 to-blue-200',
    placeholder: 'Search men\'s fashion...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'men-sizes',
        name: 'Men\'s Sizes',
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
      size: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    // Row 1
    {
      id: 'men-1',
      title: 'Classic Oxford Shirt',
      brand: 'Brooks Brothers',
      price: '$79',
      originalPrice: '$120',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller3',
        username: 'classic_style',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 15, comments: 3, shares: 1 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-23T12:15:00Z'
    },
    {
      id: 'men-2',
      title: 'Wool Blend Blazer',
      brand: 'Hugo Boss',
      price: '$145',
      originalPrice: '$285',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller4',
        username: 'business_pro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 22, comments: 6, shares: 4 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-22T16:30:00Z'
    },
    {
      id: 'men-3',
      title: 'Leather Dress Shoes',
      brand: 'Cole Haan',
      price: '$180',
      originalPrice: '$295',
      size: '10',
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller13',
        username: 'shoe_expert',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 16, shares: 9 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T09:45:00Z'
    },
    {
      id: 'men-4',
      title: 'Wool Sweater',
      brand: 'Patagonia',
      price: '$89',
      originalPrice: '$145',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller14',
        username: 'outdoor_gear',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
      },
      stats: { likes: 43, comments: 11, shares: 7 },
      condition: 'good',
      isLiked: true,
      createdAt: '2024-01-24T08:20:00Z'
    }
  ]
};