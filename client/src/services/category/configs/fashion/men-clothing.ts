/**
 * Men's Clothing Category Configuration
 * Enterprise AOP-compliant modular config extending FashionClothingTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionClothingTemplate - Inherits clothing-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Men's Clothing Configuration
 * Extends FashionClothingTemplate with men's clothing-specific options
 */
export const menClothingConfig: UniversalPageConfiguration = {
  category: 'fashion',
  subcategory: 'men',
  subSubcategory: 'clothing',
  metadata: {
    title: 'Men\'s Clothing',
    description: 'Professional shirts, pants, suits, and casual wear',
    gradient: 'from-green-50 via-emerald-100 to-teal-200',
    placeholder: 'Search men\'s clothing...'
  },
  filterConfiguration: {
    availableFilters: ['clothing-type', 'fit', 'brand', 'color', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'clothing-types',
        name: 'Clothing Types',
        type: 'checkbox',
        options: [
          { id: 'shirts', name: 'Shirts' },
          { id: 'pants', name: 'Pants' },
          { id: 'suits', name: 'Suits & Blazers' },
          { id: 'jackets', name: 'Jackets & Coats' },
          { id: 'sweaters', name: 'Sweaters' },
          { id: 'shorts', name: 'Shorts' },
          { id: 'underwear', name: 'Underwear & Socks' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'shirt-types',
        name: 'Shirt Types',
        type: 'checkbox',
        options: [
          { id: 'dress-shirts', name: 'Dress Shirts' },
          { id: 'casual-shirts', name: 'Casual Shirts' },
          { id: 'polo-shirts', name: 'Polo Shirts' },
          { id: 't-shirts', name: 'T-Shirts' },
          { id: 'button-down', name: 'Button-Down Shirts' }
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
      'clothing-type': z.array(z.string()),
      fit: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'men-clothing-1',
      title: 'Oxford Dress Shirt',
      brand: 'Brooks Brothers',
      price: '$89',
      originalPrice: '$125',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller221',
        username: 'classic_style',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 198, comments: 45, shares: 28 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T16:20:00Z'
    },
    {
      id: 'men-clothing-2',
      title: 'Chino Pants',
      brand: 'J.Crew',
      price: '$65',
      originalPrice: '$89',
      size: '32x32',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller222',
        username: 'casual_fashion',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 145, comments: 32, shares: 19 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T13:45:00Z'
    }
  ]
}; 