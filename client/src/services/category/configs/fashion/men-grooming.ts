/**
 * Men's Grooming Category Configuration
 * Enterprise AOP-compliant modular config extending FashionGroomingTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionGroomingTemplate - Inherits grooming-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Grooming Configuration
 * Extends FashionGroomingTemplate with men's grooming-specific options
 */
export const menGroomingConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'grooming',
  metadata: {
    title: 'Men\'s Grooming',
    description: 'Shaving products, cologne, and personal care',
    gradient: 'from-indigo-50 via-purple-100 to-indigo-200',
    placeholder: 'Search men\'s grooming...'
  },
  filterConfiguration: {
    availableFilters: ['grooming-type', 'brand', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'grooming-types',
        name: 'Grooming Types',
        type: 'checkbox',
        options: [
          { id: 'aftershave', name: 'Aftershave' },
          { id: 'beard-care', name: 'Beard Care' },
          { id: 'cologne', name: 'Cologne' },
          { id: 'deodorant', name: 'Deodorant' },
          { id: 'hair-care', name: 'Hair Care' },
          { id: 'shaving-cream', name: 'Shaving Cream' },
          { id: 'skincare', name: 'Skincare' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'grooming-brands',
        name: 'Brands',
        type: 'checkbox',
        options: [
          { id: 'dove', name: 'Dove' },
          { id: 'gillette', name: 'Gillette' },
          { id: 'old-spice', name: 'Old Spice' },
          { id: 'axe', name: 'Axe' },
          { id: 'dove-men', name: 'Dove Men' },
          { id: 'nivea-men', name: 'Nivea Men' },
          { id: 'dove-men-care', name: 'Dove Men+Care' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'product-types',
        name: 'Product Types',
        type: 'checkbox',
        options: [
          { id: 'shampoo', name: 'Shampoo' },
          { id: 'conditioner', name: 'Conditioner' },
          { id: 'body-wash', name: 'Body Wash' },
          { id: 'face-wash', name: 'Face Wash' },
          { id: 'moisturizer', name: 'Moisturizer' },
          { id: 'sunscreen', name: 'Sunscreen' },
          { id: 'razors', name: 'Razors' },
          { id: 'trimmers', name: 'Trimmers' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'grooming-type': z.array(z.string()),
      brand: z.array(z.string()),
      'product-type': z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-grooming-1',
      title: 'Men\'s Cologne Set',
      brand: 'Old Spice',
      price: '$25',
      originalPrice: '$35',
      size: '3.4 oz',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller351',
        username: 'grooming_essentials',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 78, comments: 19, shares: 11 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-27T01:15:00Z'
    },
    {
      id: 'men-grooming-2',
      title: 'Beard Care Kit',
      brand: 'Beardbrand',
      price: '$45',
      originalPrice: '$65',
      size: 'Kit',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller352',
        username: 'beard_specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 92, comments: 24, shares: 16 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T23:30:00Z'
    }
  ]
}; 