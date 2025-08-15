/**
 * Men's Watches Category Configuration
 * Enterprise AOP-compliant modular config extending FashionWatchesTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionWatchesTemplate - Inherits watch-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Watches Configuration
 * Extends FashionWatchesTemplate with men's watch-specific options
 */
export const menWatchesConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'watches',
  metadata: {
    title: 'Men\'s Watches',
    description: 'Luxury timepieces, sport watches, and classic designs',
    gradient: 'from-slate-50 via-gray-100 to-zinc-200',
    placeholder: 'Search men\'s watches...'
  },
  filterConfiguration: {
    availableFilters: ['watch-type', 'brand', 'material', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'watch-types',
        name: 'Watch Types',
        type: 'checkbox',
        options: [
          { id: 'dress-watches', name: 'Dress Watches' },
          { id: 'sport-watches', name: 'Sport Watches' },
          { id: 'luxury-watches', name: 'Luxury Watches' },
          { id: 'smartwatches', name: 'Smartwatches' },
          { id: 'casual-watches', name: 'Casual Watches' },
          { id: 'dive-watches', name: 'Dive Watches' },
          { id: 'chronograph', name: 'Chronograph' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'stainless-steel', name: 'Stainless Steel' },
          { id: 'gold', name: 'Gold' },
          { id: 'titanium', name: 'Titanium' },
          { id: 'ceramic', name: 'Ceramic' },
          { id: 'leather', name: 'Leather' },
          { id: 'rubber', name: 'Rubber' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'price-ranges',
        name: 'Price Ranges',
        type: 'checkbox',
        options: [
          { id: 'under-100', name: 'Under $100' },
          { id: '100-500', name: '$100 - $500' },
          { id: '500-1000', name: '$500 - $1,000' },
          { id: '1000-5000', name: '$1,000 - $5,000' },
          { id: 'over-5000', name: 'Over $5,000' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'watch-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-watches-1',
      title: 'Automatic Dress Watch',
      brand: 'Seiko',
      price: '$285',
      originalPrice: '$395',
      size: '42mm',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller241',
        username: 'luxury_timepieces',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 456, comments: 89, shares: 67 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T18:45:00Z'
    },
    {
      id: 'men-watches-2',
      title: 'Sport Chronograph Watch',
      brand: 'Casio',
      price: '$125',
      originalPrice: '$180',
      size: '44mm',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller242',
        username: 'sport_watches',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 234, comments: 52, shares: 31 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T15:30:00Z'
    }
  ]
}; 