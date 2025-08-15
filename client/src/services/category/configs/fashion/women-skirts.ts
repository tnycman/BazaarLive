/**
 * Women's Skirts Category Configuration
 * Enterprise AOP-compliant modular config extending FashionBottomsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionBottomsTemplate - Inherits bottoms-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Skirts Configuration
 * Extends FashionBottomsTemplate with skirt-specific options
 */
export const womenSkirtsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'skirts',
  metadata: {
    title: 'Women\'s Skirts',
    description: 'Elegant skirts for every occasion and style',
    gradient: 'from-purple-50 via-violet-100 to-indigo-200',
    placeholder: 'Search women\'s skirts...'
  },
  filterConfiguration: {
    availableFilters: ['skirt-type', 'length', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'skirt-types',
        name: 'Skirt Types',
        type: 'checkbox',
        options: [
          { id: 'mini-skirts', name: 'Mini Skirts' },
          { id: 'midi-skirts', name: 'Midi Skirts' },
          { id: 'maxi-skirts', name: 'Maxi Skirts' },
          { id: 'pencil-skirts', name: 'Pencil Skirts' },
          { id: 'pleated-skirts', name: 'Pleated Skirts' },
          { id: 'a-line-skirts', name: 'A-Line Skirts' },
          { id: 'wrap-skirts', name: 'Wrap Skirts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'lengths',
        name: 'Lengths',
        type: 'checkbox',
        options: [
          { id: 'mini', name: 'Mini (Above Knee)' },
          { id: 'knee-length', name: 'Knee Length' },
          { id: 'midi', name: 'Midi (Below Knee)' },
          { id: 'maxi', name: 'Maxi (Ankle Length)' }
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
      'skirt-type': z.array(z.string()),
      length: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'skirts-1',
      title: 'Pleated Midi Skirt',
      brand: 'Zara',
      price: '$65',
      originalPrice: '$89',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller141',
        username: 'fashion_forward',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 42, shares: 25 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T17:15:00Z'
    },
    {
      id: 'skirts-2',
      title: 'Pencil Skirt',
      brand: 'Ann Taylor',
      price: '$78',
      originalPrice: '$108',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller142',
        username: 'professional_look',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 31, shares: 18 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T13:20:00Z'
    }
  ]
}; 