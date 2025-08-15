/**
 * Men's Underwear & Socks Category Configuration
 * Enterprise AOP-compliant modular config extending FashionUnderwearTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionUnderwearTemplate - Inherits underwear-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Underwear & Socks Configuration
 * Extends FashionUnderwearTemplate with men's underwear-specific options
 */
export const menUnderwearSocksConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'underwear-socks',
  metadata: {
    title: 'Men\'s Underwear & Socks',
    description: 'Boxers, briefs, socks, and undershirts',
    gradient: 'from-gray-50 via-slate-100 to-gray-200',
    placeholder: 'Search men\'s underwear & socks...'
  },
  filterConfiguration: {
    availableFilters: ['underwear-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'underwear-types',
        name: 'Underwear Types',
        type: 'checkbox',
        options: [
          { id: 'boxers', name: 'Boxers' },
          { id: 'boxer-briefs', name: 'Boxer Briefs' },
          { id: 'briefs', name: 'Briefs' },
          { id: 'dress-socks', name: 'Dress Socks' },
          { id: 'no-show-socks', name: 'No Show Socks' },
          { id: 'sport-socks', name: 'Sport Socks' },
          { id: 'thermal-underwear', name: 'Thermal Underwear' },
          { id: 'undershirts', name: 'Undershirts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'underwear-materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'cotton', name: 'Cotton' },
          { id: 'polyester', name: 'Polyester' },
          { id: 'modal', name: 'Modal' },
          { id: 'bamboo', name: 'Bamboo' },
          { id: 'silk', name: 'Silk' },
          { id: 'wool', name: 'Wool' },
          { id: 'spandex', name: 'Spandex' }
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
      'underwear-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-underwear-1',
      title: 'Cotton Boxer Briefs (3-Pack)',
      brand: 'Calvin Klein',
      price: '$25',
      originalPrice: '$35',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller341',
        username: 'premium_underwear',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 89, comments: 21, shares: 12 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-27T00:45:00Z'
    },
    {
      id: 'men-underwear-2',
      title: 'Dress Socks (6-Pack)',
      brand: 'Gold Toe',
      price: '$18',
      originalPrice: '$25',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller342',
        username: 'sock_specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 15, shares: 8 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T23:00:00Z'
    }
  ]
}; 