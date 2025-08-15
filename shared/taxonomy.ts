export type VerticalId = 'fashion';
export type CategoryId = 'women' | 'men' | 'kids' | 'home' | 'electronics' | 'pets' | 'beauty' | 'sports';

export interface TaxonomyNode {
  readonly id: string;          // slug (lowercase)
  readonly name: string;        // display name
  readonly children?: readonly TaxonomyNode[];
}

export interface Taxonomy {
  readonly verticals: Record<VerticalId, readonly TaxonomyNode[]>;
}

// Canonical taxonomy source of truth (initial coverage)
export const TAXONOMY: Taxonomy = {
  verticals: {
    fashion: [
      { id: 'women', name: 'Women', children: [
        { id: 'accessories', name: 'Accessories', children: [
          { id: 'belts', name: 'Belts' },
          { id: 'glasses', name: 'Glasses' },
          { id: 'gloves_mittens', name: 'Gloves & Mittens' },
          { id: 'hair_accessories', name: 'Hair Accessories' },
          { id: 'hats', name: 'Hats' },
          { id: 'hosiery_socks', name: 'Hosiery & Socks' },
          { id: 'key_card_holders', name: 'Key & Card Holders' },
          { id: 'laptop_cases', name: 'Laptop Cases' },
          { id: 'phone_cases', name: 'Phone Cases' },
          { id: 'scarves_wraps', name: 'Scarves & Wraps' },
          { id: 'sunglasses', name: 'Sunglasses' },
          { id: 'tablet_cases', name: 'Tablet Cases' },
          { id: 'umbrellas', name: 'Umbrellas' },
          { id: 'watches', name: 'Watches' },
        ]},
        { id: 'bags', name: 'Bags', children: [
          { id: 'backpacks', name: 'Backpacks' },
          { id: 'clutches_wristlets', name: 'Clutches & Wristlets' },
          { id: 'cosmetic_bags', name: 'Cosmetic Bags & Cases' },
          { id: 'crossbody_bags', name: 'Crossbody Bags' },
          { id: 'diaper_bags', name: 'Diaper Bags' },
          { id: 'hobos', name: 'Hobos' },
          { id: 'laptop_bags', name: 'Laptop Bags' },
          { id: 'mini_bags', name: 'Mini Bags' },
          { id: 'satchels', name: 'Satchels' },
          { id: 'shoulder_bags', name: 'Shoulder Bags' },
          { id: 'totes', name: 'Totes' },
          { id: 'travel_bags', name: 'Travel Bags' },
          { id: 'wallets', name: 'Wallets' },
        ]},
        { id: 'clothing', name: 'Clothing', children: [
          { id: 'dresses', name: 'Dresses' },
          { id: 'intimates_sleepwear', name: 'Intimates & Sleepwear' },
          { id: 'jackets_coats', name: 'Jackets & Coats' },
          { id: 'jeans', name: 'Jeans' },
          { id: 'pants_jumpsuits', name: 'Pants & Jumpsuits' },
          { id: 'shorts', name: 'Shorts' },
          { id: 'skirts', name: 'Skirts' },
          { id: 'sweaters', name: 'Sweaters' },
          { id: 'swim', name: 'Swim' },
          { id: 'tops', name: 'Tops' },
        ]},
        { id: 'shoes', name: 'Shoes', children: [
          { id: 'ankle_boots', name: 'Ankle Boots & Booties' },
          { id: 'athletic_shoes', name: 'Athletic Shoes' },
          { id: 'boots', name: 'Boots' },
          { id: 'espadrilles', name: 'Espadrilles' },
          { id: 'flats_loafers', name: 'Flats & Loafers' },
          { id: 'heels', name: 'Heels' },
          { id: 'mules_clogs', name: 'Mules & Clogs' },
          { id: 'platforms', name: 'Platforms' },
          { id: 'sandals', name: 'Sandals' },
          { id: 'slippers', name: 'Slippers' },
          { id: 'sneakers', name: 'Sneakers' },
          { id: 'wedges', name: 'Wedges' },
        ]},
        { id: 'jewelry', name: 'Jewelry', children: [
          { id: 'bracelets', name: 'Bracelets' },
          { id: 'earrings', name: 'Earrings' },
          { id: 'necklaces', name: 'Necklaces' },
          { id: 'rings', name: 'Rings' },
        ]},
        { id: 'makeup', name: 'Makeup', children: [
          { id: 'face_makeup', name: 'Face Makeup' },
          { id: 'eye_makeup', name: 'Eye Makeup' },
          { id: 'lip_makeup', name: 'Lip Makeup' },
        ]},
      ]},
      { id: 'men', name: 'Men', children: [
        { id: 'accessories', name: 'Accessories' },
        { id: 'clothing', name: 'Clothing' },
        { id: 'shoes', name: 'Shoes' },
        { id: 'bags', name: 'Bags' },
      ] },
      { id: 'kids', name: 'Kids', children: [
        { id: 'accessories', name: 'Accessories' },
        { id: 'clothing', name: 'Clothing' },
        { id: 'shoes', name: 'Shoes' },
        { id: 'toys', name: 'Toys' },
      ] },
      { id: 'home', name: 'Home' },
      { id: 'electronics', name: 'Electronics' },
      { id: 'pets', name: 'Pets' },
      { id: 'beauty', name: 'Beauty & Wellness' },
      { id: 'sports', name: 'Sports & Outdoors' },
    ]
  }
};

export function getCategories(vertical: VerticalId): readonly TaxonomyNode[] {
  return TAXONOMY.verticals[vertical] || [];
}

export function getSubcategories(vertical: VerticalId, categoryId: string): readonly TaxonomyNode[] {
  const cat = getCategories(vertical).find((c) => c.id === categoryId);
  return cat?.children || [];
}

export function getLeaves(vertical: VerticalId, categoryId: string, subcategoryId: string): readonly TaxonomyNode[] {
  const subs = getSubcategories(vertical, categoryId);
  const sub = subs.find((s) => s.id === subcategoryId);
  return sub?.children || [];
}


