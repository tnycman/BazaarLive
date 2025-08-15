/**
 * Men's Activewear Category Configuration
 * Enterprise AOP-compliant modular config extending FashionActivewearTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionActivewearTemplate - Inherits activewear-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Activewear Configuration
 * Extends FashionActivewearTemplate with men's activewear-specific options
 */
export const menActivewearConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'activewear',
  metadata: {
    title: 'Men\'s Activewear',
    description: 'Performance athletic wear and workout clothing',
    gradient: 'from-red-50 via-orange-100 to-yellow-200',
    placeholder: 'Search men\'s activewear...'
  },
  filterConfiguration: {
    availableFilters: ['activewear-type', 'activity', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'activewear-types',
        name: 'Activewear Types',
        type: 'checkbox',
        options: [
          { id: 'shirts', name: 'Shirts & Tops' },
          { id: 'pants', name: 'Pants & Shorts' },
          { id: 'jackets', name: 'Jackets' },
          { id: 'hoodies', name: 'Hoodies' },
          { id: 'compression', name: 'Compression Wear' },
          { id: 'athletic-shoes', name: 'Athletic Shoes' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'activities',
        name: 'Activities',
        type: 'checkbox',
        options: [
          { id: 'running', name: 'Running' },
          { id: 'gym', name: 'Gym & Weightlifting' },
          { id: 'yoga', name: 'Yoga' },
          { id: 'cycling', name: 'Cycling' },
          { id: 'basketball', name: 'Basketball' },
          { id: 'soccer', name: 'Soccer' },
          { id: 'general-fitness', name: 'General Fitness' }
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
      'activewear-type': z.array(z.string()),
      activity: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-activewear-1',
      title: 'Performance Running Shirt',
      brand: 'Nike',
      price: '$45',
      originalPrice: '$65',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller251',
        username: 'performance_gear',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 267, comments: 54, shares: 32 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T19:15:00Z'
    },
    {
      id: 'men-activewear-2',
      title: 'Athletic Shorts',
      brand: 'Under Armour',
      price: '$35',
      originalPrice: '$50',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller252',
        username: 'athletic_wear',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 41, shares: 24 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T16:45:00Z'
    }
  ]
}; 