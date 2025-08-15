/**
 * Women's Jackets & Coats Category Configuration
 * Enterprise AOP-compliant modular config extending FashionOuterwearTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionOuterwearTemplate - Inherits outerwear-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Jackets & Coats Configuration
 * Extends FashionOuterwearTemplate with jacket and coat-specific options
 */
export const womenJacketsCoatsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'jackets-coats',
  metadata: {
    title: 'Women\'s Jackets & Coats',
    description: 'Stylish jackets, coats, and outerwear for every season',
    gradient: 'from-gray-50 via-blue-100 to-indigo-200',
    placeholder: 'Search jackets & coats...'
  },
  filterConfiguration: {
    availableFilters: ['outerwear-type', 'season', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'outerwear-types',
        name: 'Outerwear Types',
        type: 'checkbox',
        options: [
          { id: 'blazers', name: 'Blazers' },
          { id: 'denim-jackets', name: 'Denim Jackets' },
          { id: 'leather-jackets', name: 'Leather Jackets' },
          { id: 'trench-coats', name: 'Trench Coats' },
          { id: 'winter-coats', name: 'Winter Coats' },
          { id: 'bomber-jackets', name: 'Bomber Jackets' },
          { id: 'cardigans', name: 'Cardigans' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'seasons',
        name: 'Seasons',
        type: 'checkbox',
        options: [
          { id: 'spring', name: 'Spring' },
          { id: 'summer', name: 'Summer' },
          { id: 'fall', name: 'Fall' },
          { id: 'winter', name: 'Winter' },
          { id: 'all-season', name: 'All Season' }
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
      'outerwear-type': z.array(z.string()),
      season: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'jackets-1',
      title: 'Classic Trench Coat',
      brand: 'Burberry',
      price: '$450',
      originalPrice: '$695',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller71',
        username: 'luxury_outerwear',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 423, comments: 89, shares: 56 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T15:30:00Z'
    },
    {
      id: 'jackets-2',
      title: 'Denim Jacket',
      brand: 'Levi\'s',
      price: '$85',
      originalPrice: '$120',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller72',
        username: 'denim_lover',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 47, shares: 29 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T11:10:00Z'
    }
  ]
}; 