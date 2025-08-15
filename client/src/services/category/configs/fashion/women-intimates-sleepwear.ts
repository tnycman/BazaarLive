/**
 * Women's Intimates & Sleepwear Category Configuration
 * Enterprise AOP-compliant modular config extending FashionIntimatesTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionIntimatesTemplate - Inherits intimates-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Intimates & Sleepwear Configuration
 * Extends FashionIntimatesTemplate with intimates and sleepwear-specific options
 */
export const womenIntimatesSleepwearConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'intimates-sleepwear',
  metadata: {
    title: 'Women\'s Intimates & Sleepwear',
    description: 'Comfortable intimates, lingerie, and sleepwear',
    gradient: 'from-indigo-50 via-purple-100 to-pink-200',
    placeholder: 'Search intimates & sleepwear...'
  },
  filterConfiguration: {
    availableFilters: ['intimate-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'intimate-types',
        name: 'Intimate Types',
        type: 'checkbox',
        options: [
          { id: 'bras', name: 'Bras' },
          { id: 'panties', name: 'Panties' },
          { id: 'lingerie', name: 'Lingerie' },
          { id: 'shapewear', name: 'Shapewear' },
          { id: 'sleepwear', name: 'Sleepwear' },
          { id: 'loungewear', name: 'Loungewear' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'bra-types',
        name: 'Bra Types',
        type: 'checkbox',
        options: [
          { id: 't-shirt', name: 'T-Shirt Bras' },
          { id: 'push-up', name: 'Push-Up Bras' },
          { id: 'sports', name: 'Sports Bras' },
          { id: 'strapless', name: 'Strapless Bras' },
          { id: 'wireless', name: 'Wireless Bras' }
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
      'intimate-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'intimates-1',
      title: 'Silk Pajama Set',
      brand: 'Victoria\'s Secret',
      price: '$78',
      originalPrice: '$120',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller61',
        username: 'luxury_intimates',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 32, shares: 18 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T13:15:00Z'
    },
    {
      id: 'intimates-2',
      title: 'Comfortable T-Shirt Bra',
      brand: 'Calvin Klein',
      price: '$45',
      originalPrice: '$68',
      size: '34B',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller62',
        username: 'comfort_essentials',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 98, comments: 21, shares: 12 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T10:45:00Z'
    }
  ]
}; 