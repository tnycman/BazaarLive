/**
 * Men's Jackets & Coats Category Configuration
 * Enterprise AOP-compliant modular config extending FashionJacketsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionJacketsTemplate - Inherits jackets-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Jackets & Coats Configuration
 * Extends FashionJacketsTemplate with men's jackets-specific options
 */
export const menJacketsCoatsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'jackets-coats',
  metadata: {
    title: 'Men\'s Jackets & Coats',
    description: 'Professional blazers, casual jackets, and winter coats',
    gradient: 'from-gray-50 via-slate-100 to-gray-200',
    placeholder: 'Search men\'s jackets & coats...'
  },
  filterConfiguration: {
    availableFilters: ['jacket-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'jacket-types',
        name: 'Jacket Types',
        type: 'checkbox',
        options: [
          { id: 'blazers', name: 'Blazers' },
          { id: 'bomber-jackets', name: 'Bomber Jackets' },
          { id: 'denim-jackets', name: 'Denim Jackets' },
          { id: 'down-jackets', name: 'Down Jackets' },
          { id: 'leather-jackets', name: 'Leather Jackets' },
          { id: 'overcoats', name: 'Overcoats' },
          { id: 'parkas', name: 'Parkas' },
          { id: 'peacoats', name: 'Peacoats' },
          { id: 'rain-jackets', name: 'Rain Jackets' },
          { id: 'sport-jackets', name: 'Sport Jackets' },
          { id: 'trench-coats', name: 'Trench Coats' },
          { id: 'windbreakers', name: 'Windbreakers' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'wool', name: 'Wool' },
          { id: 'cotton', name: 'Cotton' },
          { id: 'leather', name: 'Leather' },
          { id: 'denim', name: 'Denim' },
          { id: 'polyester', name: 'Polyester' },
          { id: 'nylon', name: 'Nylon' },
          { id: 'down', name: 'Down' },
          { id: 'suede', name: 'Suede' }
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
      'jacket-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-jackets-1',
      title: 'Classic Wool Blazer',
      brand: 'Brooks Brothers',
      price: '$285',
      originalPrice: '$395',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller291',
        username: 'professional_wear',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T22:15:00Z'
    },
    {
      id: 'men-jackets-2',
      title: 'Leather Bomber Jacket',
      brand: 'Schott NYC',
      price: '$450',
      originalPrice: '$650',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller292',
        username: 'vintage_leather',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 189, comments: 41, shares: 24 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T19:30:00Z'
    }
  ]
}; 