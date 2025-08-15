/**
 * Women's Tops Category Configuration
 * Enterprise AOP-compliant modular config extending FashionTopsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionTopsTemplate - Inherits tops-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Tops Configuration
 * Extends FashionTopsTemplate with top-specific options
 */
export const womenTopsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'tops',
  metadata: {
    title: 'Women\'s Tops',
    description: 'Stylish blouses, t-shirts, tank tops, and casual tops',
    gradient: 'from-pink-50 via-rose-100 to-red-200',
    placeholder: 'Search women\'s tops...'
  },
  filterConfiguration: {
    availableFilters: ['top-type', 'sleeve-length', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'top-types',
        name: 'Top Types',
        type: 'checkbox',
        options: [
          { id: 'blouses', name: 'Blouses' },
          { id: 't-shirts', name: 'T-Shirts' },
          { id: 'tank-tops', name: 'Tank Tops' },
          { id: 'crop-tops', name: 'Crop Tops' },
          { id: 'tunics', name: 'Tunics' },
          { id: 'camisoles', name: 'Camisoles' },
          { id: 'bodysuits', name: 'Bodysuits' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sleeve-lengths',
        name: 'Sleeve Lengths',
        type: 'checkbox',
        options: [
          { id: 'sleeveless', name: 'Sleeveless' },
          { id: 'short-sleeve', name: 'Short Sleeve' },
          { id: 'long-sleeve', name: 'Long Sleeve' },
          { id: 'three-quarter', name: 'Three-Quarter Sleeve' },
          { id: 'bell-sleeve', name: 'Bell Sleeve' }
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
      'top-type': z.array(z.string()),
      'sleeve-length': z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'tops-1',
      title: 'Silk Blouse',
      brand: 'Equipment',
      price: '$89',
      originalPrice: '$125',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller171',
        username: 'luxury_tops',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 267, comments: 54, shares: 32 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T20:15:00Z'
    },
    {
      id: 'tops-2',
      title: 'Graphic T-Shirt',
      brand: 'Urban Outfitters',
      price: '$28',
      originalPrice: '$42',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller172',
        username: 'casual_fashion',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 31, shares: 18 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T17:30:00Z'
    }
  ]
}; 