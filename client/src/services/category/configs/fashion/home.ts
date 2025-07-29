/**
 * Fashion Home Category Configuration
 * Enterprise AOP-compliant modular config extending FashionHomeTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionHomeTemplate - Inherits home-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Fashion Home Configuration
 * Extends FashionHomeTemplate with room-type and style-specific options
 */
export const fashionHomeConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Home & Lifestyle',
    description: 'Stylish home decor, furniture, and lifestyle essentials',
    gradient: 'from-green-50 via-emerald-100 to-teal-200',
    placeholder: 'Search home & lifestyle...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'room', 'style', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'room-types',
        name: 'Room Types',
        type: 'checkbox',
        options: [
          { id: 'living-room', name: 'Living Room' },
          { id: 'bedroom', name: 'Bedroom' },
          { id: 'kitchen', name: 'Kitchen' },
          { id: 'bathroom', name: 'Bathroom' },
          { id: 'dining-room', name: 'Dining Room' },
          { id: 'office', name: 'Home Office' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'home-styles',
        name: 'Home Styles',
        type: 'checkbox',
        options: [
          { id: 'modern', name: 'Modern' },
          { id: 'bohemian', name: 'Bohemian' },
          { id: 'scandinavian', name: 'Scandinavian' },
          { id: 'industrial', name: 'Industrial' },
          { id: 'farmhouse', name: 'Farmhouse' },
          { id: 'minimalist', name: 'Minimalist' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      room: z.array(z.string()),
      style: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'home-1',
      title: 'Scandinavian Throw Pillow',
      brand: 'West Elm',
      price: '$32',
      originalPrice: '$48',
      size: '18x18',
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller19',
        username: 'home_stylist',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 78, comments: 16, shares: 9 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T14:30:00Z'
    },
    {
      id: 'home-2',
      title: 'Ceramic Vase Set',
      brand: 'CB2',
      price: '$45',
      originalPrice: '$72',
      size: 'Set of 3',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller20',
        username: 'ceramic_lover',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 92, comments: 21, shares: 13 },
      condition: 'new_with_tags',
      isLiked: false,
      createdAt: '2024-01-25T10:15:00Z'
    },
    {
      id: 'home-3',
      title: 'Vintage Wooden Mirror',
      brand: 'Urban Outfitters',
      price: '$68',
      originalPrice: '$98',
      size: '24x36',
      images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller21',
        username: 'vintage_home',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
      },
      stats: { likes: 134, comments: 28, shares: 17 },
      condition: 'good',
      isLiked: true,
      createdAt: '2024-01-24T16:45:00Z'
    },
    {
      id: 'home-4',
      title: 'Boho Macrame Wall Hanging',
      brand: 'Anthropologie',
      price: '$58',
      originalPrice: '$85',
      size: '30x24',
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller22',
        username: 'boho_decor',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 15, shares: 8 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-23T12:30:00Z'
    }
  ]
};