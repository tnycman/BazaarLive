/**
 * Men's Global & Traditional Wear Category Configuration
 * Enterprise AOP-compliant modular config extending FashionGlobalTraditionalTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionGlobalTraditionalTemplate - Inherits global traditional-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Global & Traditional Wear Configuration
 * Extends FashionGlobalTraditionalTemplate with men's traditional wear-specific options
 */
export const menGlobalTraditionalConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'global-traditional',
  metadata: {
    title: 'Men\'s Global & Traditional Wear',
    description: 'Traditional clothing from around the world, cultural attire, and heritage wear',
    gradient: 'from-amber-50 via-orange-100 to-amber-200',
    placeholder: 'Search men\'s global & traditional wear...'
  },
  filterConfiguration: {
    availableFilters: ['traditional-type', 'region', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'traditional-types',
        name: 'Traditional Types',
        type: 'checkbox',
        options: [
          { id: 'kurtas', name: 'Kurtas' },
          { id: 'sherwanis', name: 'Sherwanis' },
          { id: 'dhotis', name: 'Dhotis' },
          { id: 'kimonos', name: 'Kimonos' },
          { id: 'yukatas', name: 'Yukatas' },
          { id: 'thobes', name: 'Thobes' },
          { id: 'dashikis', name: 'Dashikis' },
          { id: 'kente-cloth', name: 'Kente Cloth' },
          { id: 'kilts', name: 'Kilts' },
          { id: 'lederhosen', name: 'Lederhosen' },
          { id: 'ponchos', name: 'Ponchos' },
          { id: 'serapes', name: 'Serapes' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'regions',
        name: 'Regions',
        type: 'checkbox',
        options: [
          { id: 'south-asia', name: 'South Asia' },
          { id: 'east-asia', name: 'East Asia' },
          { id: 'middle-east', name: 'Middle East' },
          { id: 'africa', name: 'Africa' },
          { id: 'europe', name: 'Europe' },
          { id: 'latin-america', name: 'Latin America' },
          { id: 'north-america', name: 'North America' },
          { id: 'pacific-islands', name: 'Pacific Islands' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'traditional-materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'silk', name: 'Silk' },
          { id: 'cotton', name: 'Cotton' },
          { id: 'wool', name: 'Wool' },
          { id: 'linen', name: 'Linen' },
          { id: 'cashmere', name: 'Cashmere' },
          { id: 'bamboo', name: 'Bamboo' },
          { id: 'hemp', name: 'Hemp' },
          { id: 'jute', name: 'Jute' }
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
          { id: 'xxxl', name: 'XXXL' },
          { id: 'one-size', name: 'One Size' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'traditional-type': z.array(z.string()),
      region: z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-global-1',
      title: 'Silk Kurta Set',
      brand: 'Ethnic Traditions',
      price: '$85',
      originalPrice: '$120',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller361',
        username: 'cultural_heritage',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 56, shares: 34 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-27T01:45:00Z'
    },
    {
      id: 'men-global-2',
      title: 'Traditional Kimono',
      brand: 'Japanese Heritage',
      price: '$145',
      originalPrice: '$200',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller362',
        username: 'eastern_traditions',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 42, shares: 28 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T23:45:00Z'
    }
  ]
}; 