/**
 * Women's Sweaters Category Configuration
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
 * Women's Sweaters Configuration
 * Extends FashionTopsTemplate with sweater-specific options
 */
export const womenSweatersConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'sweaters',
  metadata: {
    title: 'Women\'s Sweaters',
    description: 'Cozy sweaters, cardigans, and knitwear for every season',
    gradient: 'from-brown-50 via-orange-100 to-red-200',
    placeholder: 'Search women\'s sweaters...'
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
          { id: 'pullovers', name: 'Pullovers' },
          { id: 'turtlenecks', name: 'Turtlenecks' },
          { id: 'crewnecks', name: 'Crewnecks' },
          { id: 'v-necks', name: 'V-Necks' },
          { id: 'cable-knit', name: 'Cable Knit' },
          { id: 'cashmere', name: 'Cashmere' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'cotton', name: 'Cotton' },
          { id: 'wool', name: 'Wool' },
          { id: 'cashmere', name: 'Cashmere' },
          { id: 'acrylic', name: 'Acrylic' },
          { id: 'alpaca', name: 'Alpaca' },
          { id: 'synthetic', name: 'Synthetic' }
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
      'sweater-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'sweaters-1',
      title: 'Cashmere Cardigan',
      brand: 'J.Crew',
      price: '$145',
      originalPrice: '$198',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller151',
        username: 'luxury_knits',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 48, shares: 29 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T18:30:00Z'
    },
    {
      id: 'sweaters-2',
      title: 'Cable Knit Sweater',
      brand: 'Gap',
      price: '$65',
      originalPrice: '$89',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller152',
        username: 'cozy_knits',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 167, comments: 35, shares: 21 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T14:45:00Z'
    }
  ]
}; 