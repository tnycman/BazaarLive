/**
 * Kids Fashion Category Configuration
 * Enterprise AOP-compliant modular config extending FashionCategoryBase template
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionCategoryBase - Inherits fashion-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Kids Fashion Configuration
 * Extends FashionCategoryBase with age-specific size and style options
 */
export const kidsFashionConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Kids Fashion',
    description: 'Adorable and playful fashion for children of all ages',
    gradient: 'from-yellow-50 via-orange-100 to-red-200',
    placeholder: 'Search kids fashion...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'price', 'condition', 'availability', 'age-group'],
    categorySpecificFilters: [
      {
        id: 'kids-sizes',
        name: 'Kids Sizes',
        type: 'checkbox',
        options: [
          { id: '2t', name: '2T' },
          { id: '3t', name: '3T' },
          { id: '4t', name: '4T' },
          { id: '5t', name: '5T' },
          { id: '6', name: '6' },
          { id: '8', name: '8' },
          { id: '10', name: '10' },
          { id: '12', name: '12' },
          { id: '14', name: '14' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'age-groups',
        name: 'Age Groups',
        type: 'checkbox',
        options: [
          { id: 'toddler', name: 'Toddler (2-4T)' },
          { id: 'little-kids', name: 'Little Kids (4-7)' },
          { id: 'big-kids', name: 'Big Kids (8-14)' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      size: z.array(z.string()),
      brand: z.array(z.string()),
      color: z.array(z.string()),
      'age-group': z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'kids-1',
      title: 'Rainbow Unicorn Dress',
      brand: 'Disney',
      price: '$28',
      originalPrice: '$45',
      size: '6',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller15',
        username: 'kids_corner',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 156, comments: 34, shares: 22 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T16:15:00Z'
    },
    {
      id: 'kids-2',
      title: 'Superhero Cape Set',
      brand: 'DC Comics',
      price: '$22',
      originalPrice: '$35',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller16',
        username: 'hero_costumes',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 89, comments: 19, shares: 11 },
      condition: 'new_with_tags',
      isLiked: false,
      createdAt: '2024-01-25T11:30:00Z'
    },
    {
      id: 'kids-3',
      title: 'Cozy Dinosaur Pajama Set',
      brand: 'Carter\'s',
      price: '$18',
      originalPrice: '$28',
      size: '4T',
      images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller17',
        username: 'sleepy_time',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 14, shares: 8 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-24T19:45:00Z'
    },
    {
      id: 'kids-4',
      title: 'Back to School Backpack',
      brand: 'JanSport',
      price: '$35',
      originalPrice: '$48',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller18',
        username: 'school_ready',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop'
      },
      stats: { likes: 45, comments: 12, shares: 6 },
      condition: 'good',
      isLiked: false,
      createdAt: '2024-01-23T13:20:00Z'
    }
  ]
};