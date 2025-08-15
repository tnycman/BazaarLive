/**
 * Women's Makeup Category Configuration
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
 * Women's Makeup Configuration
 * Extends FashionBeautyTemplate with makeup-specific options
 */
export const womenMakeupConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'makeup',
  metadata: {
    title: 'Women\'s Makeup',
    description: 'Professional makeup and beauty products',
    gradient: 'from-pink-50 via-rose-100 to-red-200',
    placeholder: 'Search women\'s makeup...'
  },
  filterConfiguration: {
    availableFilters: ['makeup-type', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'makeup-types',
        name: 'Makeup Types',
        type: 'checkbox',
        options: [
          { id: 'face-makeup', name: 'Face Makeup' },
          { id: 'eye-makeup', name: 'Eye Makeup' },
          { id: 'lip-makeup', name: 'Lip Makeup' },
          { id: 'nail-polish', name: 'Nail Polish' },
          { id: 'makeup-tools', name: 'Makeup Tools' },
          { id: 'skincare', name: 'Skincare' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'face-products',
        name: 'Face Products',
        type: 'checkbox',
        options: [
          { id: 'foundation', name: 'Foundation' },
          { id: 'concealer', name: 'Concealer' },
          { id: 'powder', name: 'Powder' },
          { id: 'blush', name: 'Blush' },
          { id: 'bronzer', name: 'Bronzer' },
          { id: 'highlighter', name: 'Highlighter' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'eye-products',
        name: 'Eye Products',
        type: 'checkbox',
        options: [
          { id: 'eyeshadow', name: 'Eyeshadow' },
          { id: 'eyeliner', name: 'Eyeliner' },
          { id: 'mascara', name: 'Mascara' },
          { id: 'eyebrows', name: 'Eyebrows' },
          { id: 'false-lashes', name: 'False Lashes' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'makeup-type': z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'makeup-1',
      title: 'Naked Palette Eyeshadow',
      brand: 'Urban Decay',
      price: '$54',
      originalPrice: '$75',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller101',
        username: 'beauty_expert',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 45, shares: 28 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T16:10:00Z'
    },
    {
      id: 'makeup-2',
      title: 'Better Than Sex Mascara',
      brand: 'Too Faced',
      price: '$26',
      originalPrice: '$35',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller102',
        username: 'makeup_lover',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 156, comments: 32, shares: 19 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T12:45:00Z'
    }
  ]
}; 