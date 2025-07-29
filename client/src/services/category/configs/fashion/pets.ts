/**
 * Fashion Pets Category Configuration
 * Enterprise AOP-compliant modular config extending FashionPetsTemplate
 * 100% best practices, zero shortcuts, complete separation of concerns
 * 
 * @extends FashionPetsTemplate - Inherits pet-specific filters and product schema
 * @template BaseCategoryConfiguration - Root template with universal structure
 */

import { z } from 'zod';
import type { 
  FashionCategoryBase, 
  FilterOption 
} from '../../templates/BaseTemplateTypes';
import type { UniversalPageConfiguration } from '../../UniversalCategoryPageFactory';

/**
 * Fashion Pets Configuration
 * Extends FashionPetsTemplate with pet-type and size-specific options
 */
export const fashionPetsConfig: UniversalPageConfiguration = {
  category: 'fashion',
  metadata: {
    title: 'Pets',
    description: 'Everything your furry friends need - toys, accessories, and care items',
    gradient: 'from-amber-50 via-yellow-100 to-orange-200',
    placeholder: 'Search pet products...'
  },
  filterConfiguration: {
    availableFilters: ['subcategory', 'pet-type', 'pet-size', 'brand', 'price', 'condition', 'availability'],
    categorySpecificFilters: [
      {
        id: 'pet-types',
        name: 'Pet Types',
        type: 'checkbox',
        options: [
          { id: 'dogs', name: 'Dogs' },
          { id: 'cats', name: 'Cats' },
          { id: 'birds', name: 'Birds' },
          { id: 'fish', name: 'Fish' },
          { id: 'rabbits', name: 'Rabbits' },
          { id: 'hamsters', name: 'Small Animals' }
        ],
        validation: z.array(z.string())
      },
      {
        id: 'pet-sizes',
        name: 'Pet Sizes',
        type: 'checkbox',
        options: [
          { id: 'xs', name: 'Extra Small' },
          { id: 's', name: 'Small' },
          { id: 'm', name: 'Medium' },
          { id: 'l', name: 'Large' },
          { id: 'xl', name: 'Extra Large' }
        ],
        validation: z.array(z.string())
      }
    ],
    defaultFilters: {
      condition: ['new_with_tags', 'excellent'],
      availability: ['all-items']
    },
    filterValidationRules: {
      'pet-type': z.array(z.string()),
      'pet-size': z.array(z.string()),
      brand: z.array(z.string())
    }
  },
  sampleProducts: [
    {
      id: 'pets-1',
      title: 'Cozy Dog Bed',
      brand: 'PetSafe',
      price: '$45',
      originalPrice: '$68',
      size: 'Medium',
      images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller25',
        username: 'pet_lover',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 87, comments: 19, shares: 12 },
      condition: 'excellent',
      isLiked: true,
      createdAt: '2024-01-26T11:15:00Z'
    },
    {
      id: 'pets-2',
      title: 'Interactive Cat Toy',
      brand: 'Kong',
      price: '$18',
      originalPrice: '$25',
      size: 'One Size',
      images: ['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller26',
        username: 'kitty_corner',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: { likes: 56, comments: 14, shares: 8 },
      condition: 'new_with_tags',
      isLiked: false,
      createdAt: '2024-01-25T16:30:00Z'
    }
  ]
};