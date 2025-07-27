/**
 * HierarchicalCategoryData.ts - 3-Level Category Hierarchy Data
 * 
 * Defines the Poshmark-style 3-level category structure:
 * Level 1: Main Categories (Women, Men, Kids)
 * Level 2: Subcategories (Accessories, Clothing, Shoes, etc.)
 * Level 3: Item Categories (Belts, Bags, Boots, etc.)
 */

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
  parentId?: string;
  level: number;
  isPopular?: boolean;
  trending?: boolean;
}

export interface CategoryHierarchyData {
  [key: string]: {
    name: string;
    count: number;
    level: number;
    subcategories: {
      [key: string]: {
        name: string;
        count: number;
        level: number;
        items: CategoryItem[];
      };
    };
  };
}

// ============================================================================
// WOMEN'S FASHION HIERARCHY
// ============================================================================

const WOMENS_ACCESSORIES_ITEMS: CategoryItem[] = [
  { id: 'belts', name: 'Belts', count: 1234, parentId: 'accessories', level: 3, isPopular: true },
  { id: 'glasses', name: 'Glasses', count: 567, parentId: 'accessories', level: 3 },
  { id: 'gloves_mittens', name: 'Gloves & Mittens', count: 234, parentId: 'accessories', level: 3 },
  { id: 'hair_accessories', name: 'Hair Accessories', count: 890, parentId: 'accessories', level: 3 },
  { id: 'hats', name: 'Hats', count: 456, parentId: 'accessories', level: 3 },
  { id: 'hosiery_socks', name: 'Hosiery & Socks', count: 345, parentId: 'accessories', level: 3 },
  { id: 'key_card_holders', name: 'Key & Card Holders', count: 123, parentId: 'accessories', level: 3 },
  { id: 'laptop_cases', name: 'Laptop Cases', count: 89, parentId: 'accessories', level: 3 },
  { id: 'phone_cases', name: 'Phone Cases', count: 678, parentId: 'accessories', level: 3 },
  { id: 'scarves_wraps', name: 'Scarves & Wraps', count: 789, parentId: 'accessories', level: 3 },
  { id: 'sunglasses', name: 'Sunglasses', count: 901, parentId: 'accessories', level: 3, isPopular: true },
  { id: 'tablet_cases', name: 'Tablet Cases', count: 45, parentId: 'accessories', level: 3 },
  { id: 'umbrellas', name: 'Umbrellas', count: 67, parentId: 'accessories', level: 3 },
  { id: 'watches', name: 'Watches', count: 1345, parentId: 'accessories', level: 3, isPopular: true }
];

const WOMENS_BAGS_ITEMS: CategoryItem[] = [
  { id: 'backpacks', name: 'Backpacks', count: 678, parentId: 'bags', level: 3 },
  { id: 'clutches_wristlets', name: 'Clutches & Wristlets', count: 456, parentId: 'bags', level: 3 },
  { id: 'cosmetic_bags', name: 'Cosmetic Bags & Cases', count: 234, parentId: 'bags', level: 3 },
  { id: 'crossbody_bags', name: 'Crossbody Bags', count: 1234, parentId: 'bags', level: 3, isPopular: true },
  { id: 'diaper_bags', name: 'Diaper Bags', count: 123, parentId: 'bags', level: 3 },
  { id: 'hobos', name: 'Hobos', count: 345, parentId: 'bags', level: 3 },
  { id: 'laptop_bags', name: 'Laptop Bags', count: 89, parentId: 'bags', level: 3 },
  { id: 'mini_bags', name: 'Mini Bags', count: 567, parentId: 'bags', level: 3, trending: true },
  { id: 'satchels', name: 'Satchels', count: 789, parentId: 'bags', level: 3 },
  { id: 'shoulder_bags', name: 'Shoulder Bags', count: 1456, parentId: 'bags', level: 3, isPopular: true },
  { id: 'totes', name: 'Totes', count: 1678, parentId: 'bags', level: 3, isPopular: true },
  { id: 'travel_bags', name: 'Travel Bags', count: 234, parentId: 'bags', level: 3 },
  { id: 'wallets', name: 'Wallets', count: 890, parentId: 'bags', level: 3 }
];

const WOMENS_CLOTHING_ITEMS: CategoryItem[] = [
  { id: 'dresses', name: 'Dresses', count: 2345, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'intimates_sleepwear', name: 'Intimates & Sleepwear', count: 1234, parentId: 'clothing', level: 3 },
  { id: 'jackets_coats', name: 'Jackets & Coats', count: 1567, parentId: 'clothing', level: 3 },
  { id: 'jeans', name: 'Jeans', count: 1890, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'pants_jumpsuits', name: 'Pants & Jumpsuits', count: 1456, parentId: 'clothing', level: 3 },
  { id: 'shorts', name: 'Shorts', count: 678, parentId: 'clothing', level: 3 },
  { id: 'skirts', name: 'Skirts', count: 789, parentId: 'clothing', level: 3 },
  { id: 'sweaters', name: 'Sweaters', count: 1123, parentId: 'clothing', level: 3 },
  { id: 'swim', name: 'Swim', count: 567, parentId: 'clothing', level: 3 },
  { id: 'tops', name: 'Tops', count: 2890, parentId: 'clothing', level: 3, isPopular: true }
];

const WOMENS_SHOES_ITEMS: CategoryItem[] = [
  { id: 'ankle_boots', name: 'Ankle Boots & Booties', count: 789, parentId: 'shoes', level: 3 },
  { id: 'athletic_shoes', name: 'Athletic Shoes', count: 1234, parentId: 'shoes', level: 3, isPopular: true },
  { id: 'boots', name: 'Boots', count: 567, parentId: 'shoes', level: 3 },
  { id: 'espadrilles', name: 'Espadrilles', count: 234, parentId: 'shoes', level: 3 },
  { id: 'flats_loafers', name: 'Flats & Loafers', count: 1456, parentId: 'shoes', level: 3, isPopular: true },
  { id: 'heels', name: 'Heels', count: 1678, parentId: 'shoes', level: 3, isPopular: true },
  { id: 'mules_clogs', name: 'Mules & Clogs', count: 345, parentId: 'shoes', level: 3 },
  { id: 'platforms', name: 'Platforms', count: 123, parentId: 'shoes', level: 3 },
  { id: 'sandals', name: 'Sandals', count: 890, parentId: 'shoes', level: 3 },
  { id: 'slippers', name: 'Slippers', count: 89, parentId: 'shoes', level: 3 },
  { id: 'sneakers', name: 'Sneakers', count: 1567, parentId: 'shoes', level: 3, isPopular: true },
  { id: 'wedges', name: 'Wedges', count: 456, parentId: 'shoes', level: 3 }
];

// ============================================================================
// MEN'S FASHION HIERARCHY
// ============================================================================

const MENS_ACCESSORIES_ITEMS: CategoryItem[] = [
  { id: 'belts_suspenders', name: 'Belts & Suspenders', count: 567, parentId: 'accessories', level: 3 },
  { id: 'cufflinks', name: 'Cufflinks', count: 89, parentId: 'accessories', level: 3 },
  { id: 'glasses', name: 'Glasses', count: 234, parentId: 'accessories', level: 3 },
  { id: 'gloves_mittens', name: 'Gloves & Mittens', count: 123, parentId: 'accessories', level: 3 },
  { id: 'hats', name: 'Hats', count: 345, parentId: 'accessories', level: 3 },
  { id: 'jewelry', name: 'Jewelry', count: 678, parentId: 'accessories', level: 3 },
  { id: 'money_clips', name: 'Money Clips', count: 45, parentId: 'accessories', level: 3 },
  { id: 'pocket_watches', name: 'Pocket Watches', count: 23, parentId: 'accessories', level: 3 },
  { id: 'scarves', name: 'Scarves', count: 156, parentId: 'accessories', level: 3 },
  { id: 'sunglasses', name: 'Sunglasses', count: 456, parentId: 'accessories', level: 3 },
  { id: 'ties', name: 'Ties', count: 789, parentId: 'accessories', level: 3 },
  { id: 'watches', name: 'Watches', count: 1234, parentId: 'accessories', level: 3, isPopular: true },
  { id: 'wallets', name: 'Wallets', count: 890, parentId: 'accessories', level: 3 }
];

const MENS_CLOTHING_ITEMS: CategoryItem[] = [
  { id: 'activewear', name: 'Activewear', count: 678, parentId: 'clothing', level: 3 },
  { id: 'jackets_coats', name: 'Jackets & Coats', count: 1234, parentId: 'clothing', level: 3 },
  { id: 'jeans', name: 'Jeans', count: 1567, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'pants', name: 'Pants', count: 1345, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'shirts', name: 'Shirts', count: 2134, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'shorts', name: 'Shorts', count: 789, parentId: 'clothing', level: 3 },
  { id: 'suits_blazers', name: 'Suits & Blazers', count: 456, parentId: 'clothing', level: 3 },
  { id: 'sweaters', name: 'Sweaters', count: 890, parentId: 'clothing', level: 3 },
  { id: 'swim', name: 'Swim', count: 234, parentId: 'clothing', level: 3 },
  { id: 'underwear_socks', name: 'Underwear & Socks', count: 567, parentId: 'clothing', level: 3 }
];

const MENS_SHOES_ITEMS: CategoryItem[] = [
  { id: 'athletic_shoes', name: 'Athletic Shoes', count: 1456, parentId: 'shoes', level: 3, isPopular: true },
  { id: 'boots', name: 'Boots', count: 789, parentId: 'shoes', level: 3 },
  { id: 'dress_shoes', name: 'Dress Shoes', count: 567, parentId: 'shoes', level: 3 },
  { id: 'loafers_slip_ons', name: 'Loafers & Slip-Ons', count: 456, parentId: 'shoes', level: 3 },
  { id: 'oxfords_derbys', name: 'Oxfords & Derbys', count: 234, parentId: 'shoes', level: 3 },
  { id: 'sandals_flip_flops', name: 'Sandals & Flip-Flops', count: 345, parentId: 'shoes', level: 3 },
  { id: 'slippers', name: 'Slippers', count: 123, parentId: 'shoes', level: 3 },
  { id: 'sneakers', name: 'Sneakers', count: 1678, parentId: 'shoes', level: 3, isPopular: true }
];

// ============================================================================
// KIDS FASHION HIERARCHY
// ============================================================================

const KIDS_ACCESSORIES_ITEMS: CategoryItem[] = [
  { id: 'backpacks_bags', name: 'Backpacks & Bags', count: 456, parentId: 'accessories', level: 3 },
  { id: 'belts', name: 'Belts', count: 123, parentId: 'accessories', level: 3 },
  { id: 'gloves_mittens', name: 'Gloves & Mittens', count: 89, parentId: 'accessories', level: 3 },
  { id: 'hair_accessories', name: 'Hair Accessories', count: 567, parentId: 'accessories', level: 3 },
  { id: 'hats', name: 'Hats', count: 234, parentId: 'accessories', level: 3 },
  { id: 'jewelry', name: 'Jewelry', count: 345, parentId: 'accessories', level: 3 },
  { id: 'lunch_boxes', name: 'Lunch Boxes', count: 178, parentId: 'accessories', level: 3 },
  { id: 'sunglasses', name: 'Sunglasses', count: 67, parentId: 'accessories', level: 3 },
  { id: 'umbrellas', name: 'Umbrellas', count: 45, parentId: 'accessories', level: 3 },
  { id: 'watches', name: 'Watches', count: 89, parentId: 'accessories', level: 3 }
];

const KIDS_CLOTHING_ITEMS: CategoryItem[] = [
  { id: 'bottoms', name: 'Bottoms', count: 1234, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'dresses', name: 'Dresses', count: 890, parentId: 'clothing', level: 3 },
  { id: 'jackets_coats', name: 'Jackets & Coats', count: 567, parentId: 'clothing', level: 3 },
  { id: 'matching_sets', name: 'Matching Sets', count: 456, parentId: 'clothing', level: 3 },
  { id: 'one_pieces_rompers', name: 'One Pieces & Rompers', count: 345, parentId: 'clothing', level: 3 },
  { id: 'pajamas', name: 'Pajamas', count: 678, parentId: 'clothing', level: 3 },
  { id: 'shirts_tops', name: 'Shirts & Tops', count: 1567, parentId: 'clothing', level: 3, isPopular: true },
  { id: 'swim', name: 'Swim', count: 234, parentId: 'clothing', level: 3 },
  { id: 'underwear_socks', name: 'Underwear & Socks', count: 123, parentId: 'clothing', level: 3 }
];

const KIDS_SHOES_ITEMS: CategoryItem[] = [
  { id: 'baby_walker', name: 'Baby & Walker', count: 345, parentId: 'shoes', level: 3 },
  { id: 'boots', name: 'Boots', count: 234, parentId: 'shoes', level: 3 },
  { id: 'dress_shoes', name: 'Dress Shoes', count: 156, parentId: 'shoes', level: 3 },
  { id: 'flats', name: 'Flats', count: 123, parentId: 'shoes', level: 3 },
  { id: 'moccasins', name: 'Moccasins', count: 89, parentId: 'shoes', level: 3 },
  { id: 'rain_snow_boots', name: 'Rain & Snow Boots', count: 178, parentId: 'shoes', level: 3 },
  { id: 'sandals', name: 'Sandals', count: 267, parentId: 'shoes', level: 3 },
  { id: 'slippers', name: 'Slippers', count: 67, parentId: 'shoes', level: 3 },
  { id: 'sneakers', name: 'Sneakers', count: 789, parentId: 'shoes', level: 3, isPopular: true }
];

const KIDS_TOYS_ITEMS: CategoryItem[] = [
  { id: 'action_figures', name: 'Action Figures', count: 234, parentId: 'toys', level: 3 },
  { id: 'art_crafts', name: 'Art & Crafts', count: 345, parentId: 'toys', level: 3 },
  { id: 'board_games', name: 'Board Games', count: 123, parentId: 'toys', level: 3 },
  { id: 'building_blocks', name: 'Building Blocks', count: 456, parentId: 'toys', level: 3 },
  { id: 'dolls_dollhouses', name: 'Dolls & Dollhouses', count: 567, parentId: 'toys', level: 3 },
  { id: 'educational_toys', name: 'Educational Toys', count: 678, parentId: 'toys', level: 3 },
  { id: 'electronic_toys', name: 'Electronic Toys', count: 234, parentId: 'toys', level: 3 },
  { id: 'outdoor_toys', name: 'Outdoor Toys', count: 345, parentId: 'toys', level: 3 },
  { id: 'plush_toys', name: 'Plush Toys', count: 789, parentId: 'toys', level: 3, isPopular: true },
  { id: 'puzzles', name: 'Puzzles', count: 123, parentId: 'toys', level: 3 },
  { id: 'toy_vehicles', name: 'Toy Vehicles', count: 456, parentId: 'toys', level: 3 }
];

// ============================================================================
// COMPLETE HIERARCHY DEFINITION
// ============================================================================

export const HIERARCHICAL_CATEGORY_DATA: CategoryHierarchyData = {
  women: {
    name: 'Women',
    count: 15234,
    level: 1,
    subcategories: {
      accessories: {
        name: 'Accessories',
        count: 8542,
        level: 2,
        items: WOMENS_ACCESSORIES_ITEMS
      },
      bags: {
        name: 'Bags',
        count: 6234,
        level: 2,
        items: WOMENS_BAGS_ITEMS
      },
      clothing: {
        name: 'Clothing',
        count: 12456,
        level: 2,
        items: WOMENS_CLOTHING_ITEMS
      },
      shoes: {
        name: 'Shoes',
        count: 7890,
        level: 2,
        items: WOMENS_SHOES_ITEMS
      },
      jewelry: {
        name: 'Jewelry',
        count: 5678,
        level: 2,
        items: [
          { id: 'bracelets', name: 'Bracelets', count: 1234, parentId: 'jewelry', level: 3 },
          { id: 'earrings', name: 'Earrings', count: 2345, parentId: 'jewelry', level: 3, isPopular: true },
          { id: 'necklaces', name: 'Necklaces', count: 1567, parentId: 'jewelry', level: 3, isPopular: true },
          { id: 'rings', name: 'Rings', count: 532, parentId: 'jewelry', level: 3 }
        ]
      },
      makeup: {
        name: 'Makeup',
        count: 3456,
        level: 2,
        items: [
          { id: 'face_makeup', name: 'Face Makeup', count: 1234, parentId: 'makeup', level: 3 },
          { id: 'eye_makeup', name: 'Eye Makeup', count: 1567, parentId: 'makeup', level: 3 },
          { id: 'lip_makeup', name: 'Lip Makeup', count: 655, parentId: 'makeup', level: 3 }
        ]
      }
    }
  },
  men: {
    name: 'Men',
    count: 9876,
    level: 1,
    subcategories: {
      accessories: {
        name: 'Accessories',
        count: 4521,
        level: 2,
        items: MENS_ACCESSORIES_ITEMS
      },
      clothing: {
        name: 'Clothing',
        count: 8456,
        level: 2,
        items: MENS_CLOTHING_ITEMS
      },
      shoes: {
        name: 'Shoes',
        count: 5890,
        level: 2,
        items: MENS_SHOES_ITEMS
      },
      bags: {
        name: 'Bags',
        count: 3234,
        level: 2,
        items: [
          { id: 'backpacks', name: 'Backpacks', count: 1234, parentId: 'bags', level: 3 },
          { id: 'briefcases', name: 'Briefcases', count: 567, parentId: 'bags', level: 3 },
          { id: 'messenger_bags', name: 'Messenger Bags', count: 789, parentId: 'bags', level: 3 },
          { id: 'travel_bags', name: 'Travel Bags', count: 644, parentId: 'bags', level: 3 }
        ]
      }
    }
  },
  kids: {
    name: 'Kids',
    count: 7654,
    level: 1,
    subcategories: {
      accessories: {
        name: 'Accessories',
        count: 2134,
        level: 2,
        items: KIDS_ACCESSORIES_ITEMS
      },
      clothing: {
        name: 'Clothing',
        count: 4567,
        level: 2,
        items: KIDS_CLOTHING_ITEMS
      },
      shoes: {
        name: 'Shoes',
        count: 2890,
        level: 2,
        items: KIDS_SHOES_ITEMS
      },
      toys: {
        name: 'Toys',
        count: 3456,
        level: 2,
        items: KIDS_TOYS_ITEMS
      }
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getAllCategoriesFlat(): CategoryItem[] {
  const allCategories: CategoryItem[] = [];
  
  for (const [verticalId, verticalData] of Object.entries(HIERARCHICAL_CATEGORY_DATA)) {
    // Add main category
    allCategories.push({
      id: verticalId,
      name: verticalData.name,
      count: verticalData.count,
      level: verticalData.level
    });
    
    // Add subcategories and items
    for (const [subcatId, subcatData] of Object.entries(verticalData.subcategories)) {
      allCategories.push({
        id: subcatId,
        name: subcatData.name,
        count: subcatData.count,
        level: subcatData.level,
        parentId: verticalId
      });
      
      // Add items
      allCategories.push(...subcatData.items);
    }
  }
  
  return allCategories;
}

export function getCategoryPath(categoryId: string): CategoryItem[] {
  const allCategories = getAllCategoriesFlat();
  const categoryMap = new Map<string, CategoryItem>();
  
  for (const category of allCategories) {
    categoryMap.set(category.id, category);
  }
  
  const path: CategoryItem[] = [];
  let currentCategory = categoryMap.get(categoryId);
  
  while (currentCategory) {
    path.unshift(currentCategory);
    currentCategory = currentCategory.parentId ? categoryMap.get(currentCategory.parentId) : undefined;
  }
  
  return path;
}

export function getPopularCategories(vertical?: string): CategoryItem[] {
  const allCategories = getAllCategoriesFlat();
  
  let filtered = allCategories.filter(cat => cat.isPopular);
  
  if (vertical) {
    // Get categories under the specified vertical
    const verticalCategories = getCategoriesUnderVertical(vertical);
    const verticalIds = new Set(verticalCategories.map(c => c.id));
    filtered = filtered.filter(cat => verticalIds.has(cat.id));
  }
  
  return filtered.sort((a, b) => b.count - a.count);
}

export function getTrendingCategories(vertical?: string): CategoryItem[] {
  const allCategories = getAllCategoriesFlat();
  
  let filtered = allCategories.filter(cat => cat.trending);
  
  if (vertical) {
    const verticalCategories = getCategoriesUnderVertical(vertical);
    const verticalIds = new Set(verticalCategories.map(c => c.id));
    filtered = filtered.filter(cat => verticalIds.has(cat.id));
  }
  
  return filtered.sort((a, b) => b.count - a.count);
}

export function getCategoriesUnderVertical(verticalId: string): CategoryItem[] {
  const verticalData = HIERARCHICAL_CATEGORY_DATA[verticalId];
  if (!verticalData) return [];
  
  const categories: CategoryItem[] = [];
  
  // Add main category
  categories.push({
    id: verticalId,
    name: verticalData.name,
    count: verticalData.count,
    level: verticalData.level
  });
  
  // Add subcategories and items
  for (const [subcatId, subcatData] of Object.entries(verticalData.subcategories)) {
    categories.push({
      id: subcatId,
      name: subcatData.name,
      count: subcatData.count,
      level: subcatData.level,
      parentId: verticalId
    });
    
    categories.push(...subcatData.items);
  }
  
  return categories;
}