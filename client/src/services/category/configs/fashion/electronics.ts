/**
 * Fashion Electronics Category Configuration
 * Enterprise AOP-compliant modular config extending ElectronicsCategoryBase template
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends ElectronicsCategoryBase - Inherits electronics-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  ElectronicsCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Fashion Electronics Configuration
 * Extends ElectronicsCategoryBase with tech-specific filters
 */
export const fashionElectronicsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Electronics',
    description: 'Latest tech gadgets and electronic accessories',
    gradient: 'from-purple-50 via-violet-100 to-purple-200',
    placeholder: 'Search electronics...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'brand', 'condition', 'price', 'availability', 'tech-specs'],
    categorySpecificFilters: [
      {
        id: 'device-types',
        name: 'Device Types',
        type: 'checkbox',
        options: [
          { id: 'phones', name: 'Phones' },
          { id: 'tablets', name: 'Tablets' },
          { id: 'laptops', name: 'Laptops' },
          { id: 'headphones', name: 'Headphones' },
          { id: 'speakers', name: 'Speakers' },
          { id: 'accessories', name: 'Accessories' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'tech-brands',
        name: 'Tech Brands',
        type: 'checkbox',
        options: [
          { id: 'apple', name: 'Apple' },
          { id: 'samsung', name: 'Samsung' },
          { id: 'sony', name: 'Sony' },
          { id: 'bose', name: 'Bose' },
          { id: 'google', name: 'Google' },
          { id: 'microsoft', name: 'Microsoft' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'device-type': z.array(z.string()),
      brand: z.array(z.string()),
      'tech-specs': z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'electronics-1',
      title: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: '$899',
      originalPrice: '$1199',
      size: '256GB',
      images: ['https://images.unsplash.com/photo-1512499617640-c4454dcacc0f?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller23',
        username: 'tech_dealer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 45, shares: 28 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T09:30:00Z'
    },
    {
      id: 'electronics-2',
      title: 'MacBook Air M2',
      brand: 'Apple',
      price: '$899',
      originalPrice: '$1199',
      size: '13-inch',
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller24',
        username: 'laptop_pro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 37, shares: 22 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T14:20:00Z'
    }
  ]
};