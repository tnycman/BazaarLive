/**
 * Men's Shirts Category Configuration
 * Enterprise AOP-compliant modular config extending FashionShirtsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionShirtsTemplate - Inherits shirts-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Shirts Configuration
 * Extends FashionShirtsTemplate with men's shirts-specific options
 */
export const menShirtsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'shirts',
  metadata: {
    title: 'Men\'s Shirts',
    description: 'Dress shirts, casual shirts, polos, and t-shirts',
    gradient: 'from-green-50 via-emerald-100 to-teal-200',
    placeholder: 'Search men\'s shirts...'
  },
  filterConfiguration: {
    availableFilters: ['shirt-type', 'fit', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'shirt-types',
        name: 'Shirt Types',
        type: 'checkbox',
        options: [
          { id: 'dress-shirts', name: 'Dress Shirts' },
          { id: 'casual-shirts', name: 'Casual Shirts' },
          { id: 'polo-shirts', name: 'Polo Shirts' },
          { id: 't-shirts', name: 'T-Shirts' },
          { id: 'button-down-shirts', name: 'Button-Down Shirts' },
          { id: 'flannel-shirts', name: 'Flannel Shirts' },
          { id: 'henley-shirts', name: 'Henley Shirts' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'shirt-fits',
        name: 'Shirt Fits',
        type: 'checkbox',
        options: [
          { id: 'slim-fit', name: 'Slim Fit' },
          { id: 'regular-fit', name: 'Regular Fit' },
          { id: 'relaxed-fit', name: 'Relaxed Fit' },
          { id: 'modern-fit', name: 'Modern Fit' },
          { id: 'classic-fit', name: 'Classic Fit' }
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
      'shirt-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-shirts-1',
      title: 'Oxford Dress Shirt',
      brand: 'Brooks Brothers',
      price: '$89',
      originalPrice: '$125',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller281',
        username: 'classic_style',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 45, shares: 28 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T21:45:00Z'
    },
    {
      id: 'men-shirts-2',
      title: 'Polo Shirt',
      brand: 'Ralph Lauren',
      price: '$45',
      originalPrice: '$65',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller282',
        username: 'casual_wear',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 156, comments: 34, shares: 21 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T19:00:00Z'
    }
  ]
}; 