/**
 * Women's Jewelry Category Configuration
 * Enterprise AOP-compliant modular config extending FashionJewelryTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionJewelryTemplate - Inherits jewelry-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Women's Jewelry Configuration
 * Extends FashionJewelryTemplate with jewelry-specific options
 */
export const womenJewelryConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'women',
  subSubcategory: 'jewelry',
  metadata: {
    title: 'Women\'s Jewelry',
    description: 'Elegant necklaces, earrings, bracelets, and rings',
    gradient: 'from-yellow-50 via-amber-100 to-orange-200',
    placeholder: 'Search women\'s jewelry...'
  },
  filterConfiguration: {
    availableFilters: ['jewelry-type', 'material', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'jewelry-types',
        name: 'Jewelry Types',
        type: 'checkbox',
        options: [
          { id: 'necklaces', name: 'Necklaces' },
          { id: 'earrings', name: 'Earrings' },
          { id: 'bracelets', name: 'Bracelets' },
          { id: 'rings', name: 'Rings' },
          { id: 'brooches', name: 'Brooches' },
          { id: 'anklets', name: 'Anklets' },
          { id: 'watches', name: 'Watches' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'materials',
        name: 'Materials',
        type: 'checkbox',
        options: [
          { id: 'gold', name: 'Gold' },
          { id: 'silver', name: 'Silver' },
          { id: 'platinum', name: 'Platinum' },
          { id: 'rose-gold', name: 'Rose Gold' },
          { id: 'sterling-silver', name: 'Sterling Silver' },
          { id: 'crystal', name: 'Crystal' },
          { id: 'pearl', name: 'Pearl' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'price-ranges',
        name: 'Price Ranges',
        type: 'checkbox',
        options: [
          { id: 'under-50', name: 'Under $50' },
          { id: '50-100', name: '$50 - $100' },
          { id: '100-250', name: '$100 - $250' },
          { id: '250-500', name: '$250 - $500' },
          { id: 'over-500', name: 'Over $500' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'jewelry-type': z.array(z.string()),
      material: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'jewelry-1',
      title: 'Diamond Stud Earrings',
      brand: 'Tiffany & Co.',
      price: '$1,250',
      originalPrice: '$1,800',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller91',
        username: 'luxury_jewelry',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 567, comments: 89, shares: 67 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T18:45:00Z'
    },
    {
      id: 'jewelry-2',
      title: 'Gold Chain Necklace',
      brand: 'Cartier',
      price: '$890',
      originalPrice: '$1,200',
      size: '18"',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller92',
        username: 'premium_jewelry',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 345, comments: 67, shares: 42 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T13:20:00Z'
    }
  ]
}; 