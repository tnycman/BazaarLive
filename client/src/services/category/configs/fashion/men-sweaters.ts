/**
 * Men's Sweaters Category Configuration
 * Enterprise AOP-compliant modular config extending FashionSweatersTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionSweatersTemplate - Inherits sweaters-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Sweaters Configuration
 * Extends FashionSweatersTemplate with men's sweaters-specific options
 */
export const menSweatersConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'sweaters',
  metadata: {
    title: 'Men\'s Sweaters',
    description: 'Cardigans, pullovers, hoodies, and knitwear',
    gradient: 'from-orange-50 via-amber-100 to-orange-200',
    placeholder: 'Search men\'s sweaters...'
  },
  filterConfiguration: {
    availableFilters: ['sweater-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'sweater-types',
        name: 'Sweater Types',
        type: 'checkbox',
        options: [
          { id: 'cardigans', name: 'Cardigans' },
          { id: 'crew-necks', name: 'Crew Necks' },
          { id: 'hoodies', name: 'Hoodies' },
          { id: 'pullovers', name: 'Pullovers' },
          { id: 'sweatshirts', name: 'Sweatshirts' },
          { id: 'turtlenecks', name: 'Turtlenecks' },
          { id: 'v-necks', name: 'V-Necks' },
          { id: 'zip-ups', name: 'Zip-Ups' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'sweater-materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'cotton', name: 'Cotton' },
          { id: 'wool', name: 'Wool' },
          { id: 'cashmere', name: 'Cashmere' },
          { id: 'acrylic', name: 'Acrylic' },
          { id: 'polyester', name: 'Polyester' },
          { id: 'fleece', name: 'Fleece' },
          { id: 'merino-wool', name: 'Merino Wool' }
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
      'sweater-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-sweaters-1',
      title: 'Cashmere Crew Neck Sweater',
      brand: 'Banana Republic',
      price: '$125',
      originalPrice: '$180',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller321',
        username: 'premium_knits',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 45, shares: 28 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T23:45:00Z'
    },
    {
      id: 'men-sweaters-2',
      title: 'Zip-Up Hoodie',
      brand: 'Champion',
      price: '$55',
      originalPrice: '$75',
      size: 'XL',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller322',
        username: 'casual_wear',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 167, comments: 38, shares: 22 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T22:00:00Z'
    }
  ]
}; 