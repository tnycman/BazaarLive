/**
 * Enterprise Filter Sidebar Component
 * AOP-compliant implementation of Poshmark-style filtering system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { withEnterpriseInterceptors } from '@/services/aop/ComponentInterceptorFramework';
import { z } from 'zod';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface FilterCategory {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
  readonly subcategories?: readonly FilterCategory[];
  readonly isExpandable: boolean;
  readonly level: number;
}

interface FilterBrand {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
  readonly isSelected: boolean;
}

interface FilterSize {
  readonly id: string;
  readonly name: string;
  readonly isSelected: boolean;
  readonly category: 'all' | 'my-size' | 'specific';
}

interface FilterAvailability {
  readonly id: string;
  readonly name: string;
  readonly isSelected: boolean;
  readonly description?: string;
}

interface FilterType {
  readonly id: string;
  readonly name: string;
  readonly isSelected: boolean;
  readonly description?: string;
}

interface FilterColor {
  readonly id: string;
  readonly name: string;
  readonly hexCode: string;
  readonly isSelected: boolean;
}

interface FilterPrice {
  readonly id: string;
  readonly name: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly isSelected: boolean;
}

interface FilterState {
  readonly selectedCategories: readonly string[];
  readonly selectedBrands: readonly string[];
  readonly selectedSizes: readonly string[];
  readonly selectedColors: readonly string[];
  readonly selectedPrices: readonly string[];
  readonly selectedAvailability: readonly string[];
  readonly selectedTypes: readonly string[];
  readonly brandSearchQuery: string;
  readonly expandedSections: readonly string[];
}

interface FilterSidebarProps {
  readonly currentCategory?: string;
  readonly onFilterChange: (filters: FilterState) => void;
  readonly className?: string;
  readonly isLoading?: boolean;
}

// ===== VALIDATION SCHEMAS =====
const FilterStateSchema = z.object({
  selectedCategories: z.array(z.string()),
  selectedBrands: z.array(z.string()),
  selectedSizes: z.array(z.string()),
  selectedColors: z.array(z.string()),
  selectedPrices: z.array(z.string()),
  selectedAvailability: z.array(z.string()),
  selectedTypes: z.array(z.string()),
  brandSearchQuery: z.string(),
  expandedSections: z.array(z.string())
});

const FilterSidebarPropsSchema = z.object({
  currentCategory: z.string().optional(),
  onFilterChange: z.function(),
  className: z.string().optional(),
  isLoading: z.boolean().optional()
});

// ===== ENTERPRISE DATA STRUCTURES =====
const CATEGORIES_DATA: readonly FilterCategory[] = [
  {
    id: 'women',
    name: 'Women',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'accessories',
        name: 'Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'belts', name: 'Belts', level: 2, isExpandable: false },
          { id: 'face-masks', name: 'Face Masks', level: 2, isExpandable: false },
          { id: 'glasses', name: 'Glasses', level: 2, isExpandable: false },
          { id: 'gloves-mittens', name: 'Gloves & Mittens', level: 2, isExpandable: false },
          { id: 'hair-accessories', name: 'Hair Accessories', level: 2, isExpandable: false },
          { id: 'hats', name: 'Hats', level: 2, isExpandable: false },
          { id: 'hosiery-socks', name: 'Hosiery & Socks', level: 2, isExpandable: false },
          { id: 'key-card-holders', name: 'Key & Card Holders', level: 2, isExpandable: false },
          { id: 'laptop-cases', name: 'Laptop Cases', level: 2, isExpandable: false },
          { id: 'phone-cases', name: 'Phone Cases', level: 2, isExpandable: false },
          { id: 'scarves-wraps', name: 'Scarves & Wraps', level: 2, isExpandable: false },
          { id: 'sunglasses', name: 'Sunglasses', level: 2, isExpandable: false },
          { id: 'tablet-cases', name: 'Tablet Cases', level: 2, isExpandable: false },
          { id: 'umbrellas', name: 'Umbrellas', level: 2, isExpandable: false },
          { id: 'watches', name: 'Watches', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'bags',
        name: 'Bags',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'baby-bags', name: 'Baby Bags', level: 2, isExpandable: false },
          { id: 'backpacks', name: 'Backpacks', level: 2, isExpandable: false },
          { id: 'clutches-wristlets', name: 'Clutches & Wristlets', level: 2, isExpandable: false },
          { id: 'cosmetic-bags-cases', name: 'Cosmetic Bags & Cases', level: 2, isExpandable: false },
          { id: 'crossbody-bags', name: 'Crossbody Bags', level: 2, isExpandable: false },
          { id: 'hobos', name: 'Hobos', level: 2, isExpandable: false },
          { id: 'laptop-bags', name: 'Laptop Bags', level: 2, isExpandable: false },
          { id: 'mini-bags', name: 'Mini Bags', level: 2, isExpandable: false },
          { id: 'satchels', name: 'Satchels', level: 2, isExpandable: false },
          { id: 'shoulder-bags', name: 'Shoulder Bags', level: 2, isExpandable: false },
          { id: 'totes', name: 'Totes', level: 2, isExpandable: false },
          { id: 'travel-bags', name: 'Travel Bags', level: 2, isExpandable: false },
          { id: 'wallets', name: 'Wallets', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'dresses',
        name: 'Dresses',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'asymmetrical', name: 'Asymmetrical', level: 2, isExpandable: false },
          { id: 'backless', name: 'Backless', level: 2, isExpandable: false },
          { id: 'high-low', name: 'High Low', level: 2, isExpandable: false },
          { id: 'long-sleeve', name: 'Long Sleeve', level: 2, isExpandable: false },
          { id: 'maxi', name: 'Maxi', level: 2, isExpandable: false },
          { id: 'midi', name: 'Midi', level: 2, isExpandable: false },
          { id: 'mini', name: 'Mini', level: 2, isExpandable: false },
          { id: 'one-shoulder', name: 'One Shoulder', level: 2, isExpandable: false },
          { id: 'prom', name: 'Prom', level: 2, isExpandable: false },
          { id: 'strapless', name: 'Strapless', level: 2, isExpandable: false },
          { id: 'wedding', name: 'Wedding', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'intimates-sleepwear',
        name: 'Intimates & Sleepwear',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'bandeaus', name: 'Bandeaus', level: 2, isExpandable: false },
          { id: 'bras', name: 'Bras', level: 2, isExpandable: false },
          { id: 'chemises-slips', name: 'Chemises & Slips', level: 2, isExpandable: false },
          { id: 'pajamas', name: 'Pajamas', level: 2, isExpandable: false },
          { id: 'panties', name: 'Panties', level: 2, isExpandable: false },
          { id: 'robes', name: 'Robes', level: 2, isExpandable: false },
          { id: 'shapewear', name: 'Shapewear', level: 2, isExpandable: false },
          { id: 'sports-bras', name: 'Sports Bras', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'jackets-coats',
        name: 'Jackets & Coats',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'blazers-suit-jackets', name: 'Blazers & Suit Jackets', level: 2, isExpandable: false },
          { id: 'bomber-jackets', name: 'Bomber Jackets', level: 2, isExpandable: false },
          { id: 'capes', name: 'Capes', level: 2, isExpandable: false },
          { id: 'jean-jackets', name: 'Jean Jackets', level: 2, isExpandable: false },
          { id: 'leather-jackets', name: 'Leather Jackets', level: 2, isExpandable: false },
          { id: 'pea-coats', name: 'Pea Coats', level: 2, isExpandable: false },
          { id: 'puffers', name: 'Puffers', level: 2, isExpandable: false },
          { id: 'ski-snow-jackets', name: 'Ski & Snow Jackets', level: 2, isExpandable: false },
          { id: 'teddy-jackets', name: 'Teddy Jackets', level: 2, isExpandable: false },
          { id: 'trench-coats', name: 'Trench Coats', level: 2, isExpandable: false },
          { id: 'utility-jackets', name: 'Utility Jackets', level: 2, isExpandable: false },
          { id: 'varsity-jackets', name: 'Varsity Jackets', level: 2, isExpandable: false },
          { id: 'vests', name: 'Vests', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'jeans',
        name: 'Jeans',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'ankle-cropped', name: 'Ankle & Cropped', level: 2, isExpandable: false },
          { id: 'boot-cut', name: 'Boot Cut', level: 2, isExpandable: false },
          { id: 'boyfriend', name: 'Boyfriend', level: 2, isExpandable: false },
          { id: 'flare-wide-leg', name: 'Flare & Wide Leg', level: 2, isExpandable: false },
          { id: 'high-rise', name: 'High Rise', level: 2, isExpandable: false },
          { id: 'jeggings', name: 'Jeggings', level: 2, isExpandable: false },
          { id: 'overalls', name: 'Overalls', level: 2, isExpandable: false },
          { id: 'skinny', name: 'Skinny', level: 2, isExpandable: false },
          { id: 'straight-leg', name: 'Straight Leg', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'jewelry',
        name: 'Jewelry',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'bracelets', name: 'Bracelets', level: 2, isExpandable: false },
          { id: 'brooches', name: 'Brooches', level: 2, isExpandable: false },
          { id: 'earrings', name: 'Earrings', level: 2, isExpandable: false },
          { id: 'necklaces', name: 'Necklaces', level: 2, isExpandable: false },
          { id: 'rings', name: 'Rings', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'makeup',
        name: 'Makeup',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'blush', name: 'Blush', level: 2, isExpandable: false },
          { id: 'bronzer-contour', name: 'Bronzer & Contour', level: 2, isExpandable: false },
          { id: 'brows', name: 'Brows', level: 2, isExpandable: false },
          { id: 'brushes-tools', name: 'Brushes & Tools', level: 2, isExpandable: false },
          { id: 'concealer', name: 'Concealer', level: 2, isExpandable: false },
          { id: 'eye-primer', name: 'Eye Primer', level: 2, isExpandable: false },
          { id: 'eyeliner', name: 'Eyeliner', level: 2, isExpandable: false },
          { id: 'eyeshadow', name: 'Eyeshadow', level: 2, isExpandable: false },
          { id: 'foundation', name: 'Foundation', level: 2, isExpandable: false },
          { id: 'highlighter', name: 'Highlighter', level: 2, isExpandable: false },
          { id: 'lashes', name: 'Lashes', level: 2, isExpandable: false },
          { id: 'lip-balm-gloss', name: 'Lip Balm & Gloss', level: 2, isExpandable: false },
          { id: 'lip-liner', name: 'Lip Liner', level: 2, isExpandable: false },
          { id: 'lipstick', name: 'Lipstick', level: 2, isExpandable: false },
          { id: 'mascara', name: 'Mascara', level: 2, isExpandable: false },
          { id: 'nail-tools', name: 'Nail Tools', level: 2, isExpandable: false },
          { id: 'press-on-nails', name: 'Press-On Nails', level: 2, isExpandable: false },
          { id: 'primer', name: 'Primer', level: 2, isExpandable: false },
          { id: 'setting-powder-spray', name: 'Setting Powder & Spray', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pants-jumpsuits',
        name: 'Pants & Jumpsuits',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'ankle-cropped-pants', name: 'Ankle & Cropped', level: 2, isExpandable: false },
          { id: 'boot-cut-flare', name: 'Boot Cut & Flare', level: 2, isExpandable: false },
          { id: 'capris', name: 'Capris', level: 2, isExpandable: false },
          { id: 'jumpsuits-rompers', name: 'Jumpsuits & Rompers', level: 2, isExpandable: false },
          { id: 'leggings', name: 'Leggings', level: 2, isExpandable: false },
          { id: 'pantsuits', name: 'Pantsuits', level: 2, isExpandable: false },
          { id: 'skinny-pants', name: 'Skinny', level: 2, isExpandable: false },
          { id: 'straight-leg-pants', name: 'Straight Leg', level: 2, isExpandable: false },
          { id: 'track-pants-joggers', name: 'Track Pants & Joggers', level: 2, isExpandable: false },
          { id: 'trousers', name: 'Trousers', level: 2, isExpandable: false },
          { id: 'wide-leg-pants', name: 'Wide Leg', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'shoes',
        name: 'Shoes',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'ankle-boots-booties', name: 'Ankle Boots & Booties', level: 2, isExpandable: false },
          { id: 'athletic-shoes', name: 'Athletic Shoes', level: 2, isExpandable: false },
          { id: 'combat-moto-boots', name: 'Combat & Moto Boots', level: 2, isExpandable: false },
          { id: 'espadrilles', name: 'Espadrilles', level: 2, isExpandable: false },
          { id: 'flats-loafers', name: 'Flats & Loafers', level: 2, isExpandable: false },
          { id: 'heeled-boots', name: 'Heeled Boots', level: 2, isExpandable: false },
          { id: 'heels', name: 'Heels', level: 2, isExpandable: false },
          { id: 'lace-up-boots', name: 'Lace Up Boots', level: 2, isExpandable: false },
          { id: 'moccasins', name: 'Moccasins', level: 2, isExpandable: false },
          { id: 'mules-clogs', name: 'Mules & Clogs', level: 2, isExpandable: false },
          { id: 'over-knee-boots', name: 'Over the Knee Boots', level: 2, isExpandable: false },
          { id: 'platforms', name: 'Platforms', level: 2, isExpandable: false },
          { id: 'sandals', name: 'Sandals', level: 2, isExpandable: false },
          { id: 'slippers', name: 'Slippers', level: 2, isExpandable: false },
          { id: 'sneakers', name: 'Sneakers', level: 2, isExpandable: false },
          { id: 'wedges', name: 'Wedges', level: 2, isExpandable: false },
          { id: 'winter-rain-boots', name: 'Winter & Rain Boots', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'shorts',
        name: 'Shorts',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'athletic-shorts', name: 'Athletic Shorts', level: 2, isExpandable: false },
          { id: 'bermudas', name: 'Bermudas', level: 2, isExpandable: false },
          { id: 'bike-shorts', name: 'Bike Shorts', level: 2, isExpandable: false },
          { id: 'cargos', name: 'Cargos', level: 2, isExpandable: false },
          { id: 'high-waist', name: 'High Waist', level: 2, isExpandable: false },
          { id: 'jean-shorts', name: 'Jean Shorts', level: 2, isExpandable: false },
          { id: 'skorts', name: 'Skorts', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'skirts',
        name: 'Skirts',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'a-line-full', name: 'A-Line or Full', level: 2, isExpandable: false },
          { id: 'asymmetrical', name: 'Asymmetrical', level: 2, isExpandable: false },
          { id: 'circle-skater', name: 'Circle & Skater', level: 2, isExpandable: false },
          { id: 'high-low', name: 'High Low', level: 2, isExpandable: false },
          { id: 'maxi', name: 'Maxi', level: 2, isExpandable: false },
          { id: 'midi', name: 'Midi', level: 2, isExpandable: false },
          { id: 'mini', name: 'Mini', level: 2, isExpandable: false },
          { id: 'pencil', name: 'Pencil', level: 2, isExpandable: false },
          { id: 'skirt-sets', name: 'Skirt Sets', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'sweaters',
        name: 'Sweaters',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'cardigans', name: 'Cardigans', level: 2, isExpandable: false },
          { id: 'cowl-turtlenecks', name: 'Cowl & Turtlenecks', level: 2, isExpandable: false },
          { id: 'crew-scoop-necks', name: 'Crew & Scoop Necks', level: 2, isExpandable: false },
          { id: 'off-shoulder-sweaters', name: 'Off-the-Shoulder Sweaters', level: 2, isExpandable: false },
          { id: 'shrugs-ponchos', name: 'Shrugs & Ponchos', level: 2, isExpandable: false },
          { id: 'v-necks', name: 'V-Necks', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'swim',
        name: 'Swim',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'bikinis', name: 'Bikinis', level: 2, isExpandable: false },
          { id: 'coverups', name: 'Coverups', level: 2, isExpandable: false },
          { id: 'one-pieces', name: 'One Pieces', level: 2, isExpandable: false },
          { id: 'sarongs', name: 'Sarongs', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'tops',
        name: 'Tops',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'blouses', name: 'Blouses', level: 2, isExpandable: false },
          { id: 'bodysuits', name: 'Bodysuits', level: 2, isExpandable: false },
          { id: 'button-down-shirts', name: 'Button Down Shirts', level: 2, isExpandable: false },
          { id: 'camisoles', name: 'Camisoles', level: 2, isExpandable: false },
          { id: 'crop-tops', name: 'Crop Tops', level: 2, isExpandable: false },
          { id: 'jerseys', name: 'Jerseys', level: 2, isExpandable: false },
          { id: 'muscle-tees', name: 'Muscle Tees', level: 2, isExpandable: false },
          { id: 'sweatshirts-hoodies', name: 'Sweatshirts & Hoodies', level: 2, isExpandable: false },
          { id: 'tank-tops', name: 'Tank Tops', level: 2, isExpandable: false },
          { id: 'tees-long-sleeve', name: 'Tees - Long Sleeve', level: 2, isExpandable: false },
          { id: 'tees-short-sleeve', name: 'Tees - Short Sleeve', level: 2, isExpandable: false },
          { id: 'tunics', name: 'Tunics', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'skincare',
        name: 'Skincare',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'acne-blemish', name: 'Acne & Blemish', level: 2, isExpandable: false },
          { id: 'cleanser-exfoliant', name: 'Cleanser & Exfoliant', level: 2, isExpandable: false },
          { id: 'eye-cream', name: 'Eye Cream', level: 2, isExpandable: false },
          { id: 'makeup-remover', name: 'Makeup Remover', level: 2, isExpandable: false },
          { id: 'mask', name: 'Mask', level: 2, isExpandable: false },
          { id: 'moisturizer', name: 'Moisturizer', level: 2, isExpandable: false },
          { id: 'peel', name: 'Peel', level: 2, isExpandable: false },
          { id: 'serum-face-oil', name: 'Serum & Face Oil', level: 2, isExpandable: false },
          { id: 'suncare', name: 'Suncare', level: 2, isExpandable: false },
          { id: 'toner', name: 'Toner', level: 2, isExpandable: false },
          { id: 'tools', name: 'Tools', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'hair',
        name: 'Hair',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'color', name: 'Color', level: 2, isExpandable: false },
          { id: 'conditioner', name: 'Conditioner', level: 2, isExpandable: false },
          { id: 'hairspray', name: 'Hairspray', level: 2, isExpandable: false },
          { id: 'heat-protectant', name: 'Heat Protectant', level: 2, isExpandable: false },
          { id: 'shampoo', name: 'Shampoo', level: 2, isExpandable: false },
          { id: 'styling', name: 'Styling', level: 2, isExpandable: false },
          { id: 'hair-tools', name: 'Tools', level: 2, isExpandable: false },
          { id: 'treatment-mask', name: 'Treatment & Mask', level: 2, isExpandable: false },
          { id: 'wigs-extensions', name: 'Wigs & Extensions', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'bath-body',
        name: 'Bath & Body',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'bath-soak-bubbles', name: 'Bath Soak & Bubbles', level: 2, isExpandable: false },
          { id: 'body-wash', name: 'Body Wash', level: 2, isExpandable: false },
          { id: 'exfoliant-scrub', name: 'Exfoliant & Scrub', level: 2, isExpandable: false },
          { id: 'hair-removal', name: 'Hair Removal', level: 2, isExpandable: false },
          { id: 'hand-foot-care', name: 'Hand & Foot Care', level: 2, isExpandable: false },
          { id: 'hand-soap', name: 'Hand Soap', level: 2, isExpandable: false },
          { id: 'moisturizer-body-oil', name: 'Moisturizer & Body Oil', level: 2, isExpandable: false },
          { id: 'suncare-tanning', name: 'Suncare & Tanning', level: 2, isExpandable: false },
          { id: 'bath-tools', name: 'Tools', level: 2, isExpandable: false }
        ]
      },
      { id: 'global-traditional', name: 'Global & Traditional Wear', level: 1, isExpandable: false }
    ]
  },
  { id: 'men', name: 'Men', level: 0, isExpandable: false },
  { id: 'kids', name: 'Kids', level: 0, isExpandable: false },
  { id: 'home', name: 'Home', level: 0, isExpandable: false },
  { id: 'pets', name: 'Pets', level: 0, isExpandable: false },
  { id: 'electronics', name: 'Electronics', level: 0, isExpandable: false }
] as const;

const BRANDS_DATA: readonly FilterBrand[] = [
  { id: 'all-brands', name: 'All Brands', isSelected: false },
  { id: 'for-all-mankind', name: '7 For All Mankind', isSelected: false },
  { id: 'new-day', name: 'a new day', isSelected: false },
  { id: 'ana', name: 'a.n.a', isSelected: false },
  { id: 'abercrombie-fitch', name: 'Abercrombie & Fitch', isSelected: false },
  { id: 'adidas', name: 'adidas', isSelected: false },
  { id: 'adrianna-papell', name: 'Adrianna Papell', isSelected: false },
  { id: 'aerie', name: 'aerie', isSelected: false },
  { id: 'aeropostale', name: 'Aeropostale', isSelected: false },
  { id: 'ag-adriano-goldschmied', name: 'Ag Adriano Goldschmied', isSelected: false }
] as const;

const SIZES_DATA: readonly FilterSize[] = [
  { id: 'all-sizes', name: 'All Sizes', category: 'all', isSelected: false },
  { id: 'my-size', name: 'My Size', category: 'my-size', isSelected: false }
] as const;

const AVAILABILITY_DATA: readonly FilterAvailability[] = [
  { id: 'all-items', name: 'All Items', isSelected: true },
  { id: 'available-items', name: 'Available Items', isSelected: false },
  { id: 'available-dropping-soon', name: 'Available + Dropping Soon Items', isSelected: false },
  { id: 'dropping-soon', name: 'Dropping Soon Items', isSelected: false },
  { id: 'sold-items', name: 'Sold Items', isSelected: false }
] as const;

const CONDITION_DATA: readonly FilterType[] = [
  { id: 'all-conditions', name: 'All Conditions', isSelected: true },
  { id: 'new-with-tags', name: 'New With Tags', isSelected: false },
  { id: 'like-new', name: 'Like New', isSelected: false },
  { id: 'used', name: 'Used', isSelected: false }
] as const;

const COLORS_DATA: readonly FilterColor[] = [
  { id: 'all-colors', name: 'All Colors', hexCode: '#ffffff', isSelected: false },
  { id: 'black', name: 'Black', hexCode: '#000000', isSelected: false },
  { id: 'blue', name: 'Blue', hexCode: '#0066cc', isSelected: false },
  { id: 'pink', name: 'Pink', hexCode: '#ff6b9d', isSelected: false },
  { id: 'yellow', name: 'Yellow', hexCode: '#ffd700', isSelected: false },
  { id: 'brown', name: 'Brown', hexCode: '#8b4513', isSelected: false },
  { id: 'red', name: 'Red', hexCode: '#dc2626', isSelected: false },
  { id: 'gray', name: 'Gray', hexCode: '#6b7280', isSelected: false },
  { id: 'green', name: 'Green', hexCode: '#16a34a', isSelected: false },
  { id: 'tan', name: 'Tan', hexCode: '#d2b48c', isSelected: false },
  { id: 'purple', name: 'Purple', hexCode: '#9333ea', isSelected: false },
  { id: 'orange', name: 'Orange', hexCode: '#ea580c', isSelected: false }
] as const;

const PRICE_DATA: readonly FilterPrice[] = [
  { id: 'all-prices', name: 'All Prices', isSelected: false },
  { id: 'under-25', name: 'Under $25', maxPrice: 25, isSelected: false },
  { id: '25-50', name: '$25 - $50', minPrice: 25, maxPrice: 50, isSelected: false },
  { id: '50-100', name: '$50 - $100', minPrice: 50, maxPrice: 100, isSelected: false },
  { id: '100-250', name: '$100 - $250', minPrice: 100, maxPrice: 250, isSelected: false },
  { id: '250-500', name: '$250 - $500', minPrice: 250, maxPrice: 500, isSelected: false },
  { id: 'over-500', name: 'Over $500', minPrice: 500, isSelected: false }
] as const;

// ===== ENTERPRISE COMPONENT IMPLEMENTATION =====
const EnterpriseFilterSidebar: React.FC<FilterSidebarProps> = memo(({
  currentCategory = 'women',
  onFilterChange,
  className = '',
  isLoading = false
}) => {
  // ===== STATE MANAGEMENT =====
  const [filterState, setFilterState] = useState<FilterState>({
    selectedCategories: [currentCategory],
    selectedBrands: [],
    selectedSizes: [],
    selectedColors: [],
    selectedPrices: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-conditions'],
    brandSearchQuery: '',
    expandedSections: ['categories', currentCategory]
  });

  const [filteredBrands, setFilteredBrands] = useState<readonly FilterBrand[]>(BRANDS_DATA);

  // ===== CATEGORY SYNCHRONIZATION =====
  // Update expanded sections when currentCategory changes (page navigation)
  useEffect(() => {
    setFilterState(prev => ({
      ...prev,
      selectedCategories: [currentCategory],
      expandedSections: ['categories', currentCategory] // Only expand current category
    }));
  }, [currentCategory]);

  // ===== ENTERPRISE MEMOIZED VALUES =====
  const sectionConfig = useMemo(() => ({
    categories: {
      id: 'categories',
      title: 'CATEGORIES',
      isCollapsible: true,
      defaultExpanded: true
    },
    brands: {
      id: 'brands',
      title: 'BRANDS',
      isCollapsible: true,
      defaultExpanded: false
    },
    size: {
      id: 'size',
      title: 'SIZE',
      isCollapsible: true,
      defaultExpanded: false
    },
    color: {
      id: 'color',
      title: 'COLOR',
      isCollapsible: true,
      defaultExpanded: false
    },
    price: {
      id: 'price',
      title: 'PRICE',
      isCollapsible: true,
      defaultExpanded: false
    },
    shipping: {
      id: 'shipping',
      title: 'SHIPPING',
      isCollapsible: true,
      defaultExpanded: false
    },
    availability: {
      id: 'availability',
      title: 'AVAILABILITY',
      isCollapsible: true,
      defaultExpanded: false
    },
    condition: {
      id: 'condition',
      title: 'CONDITION',
      isCollapsible: true,
      defaultExpanded: false
    }
  }), []);

  // ===== ENTERPRISE EVENT HANDLERS =====
  const handleSectionToggle = useCallback((sectionId: string) => {
    setFilterState(prev => {
      const isExpanded = prev.expandedSections.includes(sectionId);
      const newExpandedSections = isExpanded
        ? prev.expandedSections.filter(id => id !== sectionId)
        : [...prev.expandedSections, sectionId];

      return {
        ...prev,
        expandedSections: newExpandedSections
      };
    });
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    // Handle navigation categories (ALL top-level categories that should navigate to different pages)
    const navigationCategories = ['women', 'men', 'kids', 'home', 'pets', 'electronics'];
    
    if (navigationCategories.includes(categoryId)) {
      // Prevent unnecessary navigation if already on the same page
      if (categoryId === currentCategory) {
        return; // Do nothing - already on this page
      }
      // Navigate to the category page only if it's different from current page
      window.location.href = `/fashion/${categoryId}`;
      return;
    }

    // Handle filter categories (subcategories that should filter the current page)
    setFilterState(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId);
      const newSelectedCategories = isSelected
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId];

      return {
        ...prev,
        selectedCategories: newSelectedCategories
      };
    });
  }, [currentCategory]);

  const handleBrandToggle = useCallback((brandId: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedBrands.includes(brandId);
      const newSelectedBrands = isSelected
        ? prev.selectedBrands.filter(id => id !== brandId)
        : [...prev.selectedBrands, brandId];

      return {
        ...prev,
        selectedBrands: newSelectedBrands
      };
    });
  }, []);

  const handleBrandSearch = useCallback((query: string) => {
    setFilterState(prev => ({
      ...prev,
      brandSearchQuery: query
    }));

    const filtered = BRANDS_DATA.filter(brand =>
      brand.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, []);

  const handleSizeToggle = useCallback((sizeId: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedSizes.includes(sizeId);
      const newSelectedSizes = isSelected
        ? prev.selectedSizes.filter(id => id !== sizeId)
        : [...prev.selectedSizes, sizeId];

      return {
        ...prev,
        selectedSizes: newSelectedSizes
      };
    });
  }, []);

  const handleAvailabilityToggle = useCallback((availabilityId: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedAvailability: [availabilityId] // Single selection
    }));
  }, []);

  const handleTypeToggle = useCallback((typeId: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTypes: [typeId] // Single selection
    }));
  }, []);

  const handleColorToggle = useCallback((colorId: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedColors.includes(colorId);
      const newSelectedColors = isSelected
        ? prev.selectedColors.filter(id => id !== colorId)
        : [...prev.selectedColors, colorId];

      return {
        ...prev,
        selectedColors: newSelectedColors
      };
    });
  }, []);

  const handlePriceToggle = useCallback((priceId: string) => {
    setFilterState(prev => {
      const isSelected = prev.selectedPrices.includes(priceId);
      const newSelectedPrices = isSelected
        ? prev.selectedPrices.filter(id => id !== priceId)
        : [...prev.selectedPrices, priceId];

      return {
        ...prev,
        selectedPrices: newSelectedPrices
      };
    });
  }, []);

  // ===== ENTERPRISE EFFECTS =====
  useEffect(() => {
    const validatedState = FilterStateSchema.parse(filterState);
    onFilterChange(validatedState);
  }, [filterState, onFilterChange]);

  // ===== ENTERPRISE RENDER HELPERS =====
  const renderCategoryItem = useCallback((category: FilterCategory, isSelected: boolean) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = filterState.expandedSections.includes(category.id);
    const indentLevel = category.level * 16;
    const isCurrentCategory = category.id === currentCategory;
    const navigationCategories = ['women', 'men', 'kids', 'home', 'pets', 'electronics'];
    const isNavigationCategory = navigationCategories.includes(category.id);

    return (
      <div key={category.id} className="w-full" data-testid={`category-item-${category.id}`}>
        <div 
          className={`flex items-center py-1 pl-${indentLevel > 0 ? `[${indentLevel}px]` : '0'} pr-2 cursor-pointer transition-colors duration-150 ${
            isCurrentCategory && isNavigationCategory
              ? 'bg-purple-50 border-l-4 border-purple-500'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => {
            handleCategoryToggle(category.id);
            if (hasSubcategories) {
              handleSectionToggle(category.id);
            }
          }}
        >
          <div className="flex items-center flex-1 min-w-0">
            <span 
              className={`text-sm truncate ${
                isCurrentCategory && isNavigationCategory
                  ? 'text-purple-700 font-bold'
                  : isSelected 
                    ? 'text-purple-700 font-semibold' 
                    : category.level === 0 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-700'
              }`}
            >
              {category.name}
            </span>
            {category.count && (
              <span className="ml-auto text-xs text-gray-500 flex-shrink-0">
                {category.count}
              </span>
            )}
          </div>
        </div>

        {hasSubcategories && isExpanded && category.subcategories && (
          <div className="ml-2">
            {category.subcategories.map(subcategory => 
              renderCategoryItem(subcategory, filterState.selectedCategories.includes(subcategory.id))
            )}
          </div>
        )}
      </div>
    );
  }, [filterState.selectedCategories, filterState.expandedSections, handleCategoryToggle, handleSectionToggle, currentCategory]);

  const renderCollapsibleSection = useCallback((
    sectionKey: keyof typeof sectionConfig,
    children: React.ReactNode
  ) => {
    const section = sectionConfig[sectionKey];
    const isExpanded = filterState.expandedSections.includes(section.id);

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={() => handleSectionToggle(section.id)}
        className="w-full"
        data-testid={`section-${section.id}`}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full justify-between p-3 h-auto font-semibold text-sm text-gray-900 hover:bg-gray-50"
            data-testid={`section-toggle-${section.id}`}
          >
            {section.title}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }, [filterState.expandedSections, handleSectionToggle, sectionConfig]);

  // ===== ENTERPRISE MAIN RENDER =====
  return (
    <div 
      className={`w-64 bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col ${className}`}
      data-testid="enterprise-filter-sidebar"
    >
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          
          {/* Categories Section */}
          {renderCollapsibleSection('categories', (
            <div className="space-y-1">
              {CATEGORIES_DATA.map(category => 
                renderCategoryItem(category, filterState.selectedCategories.includes(category.id))
              )}
            </div>
          ))}

          <Separator />

          {/* Brands Section */}
          {renderCollapsibleSection('brands', (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search brands"
                  value={filterState.brandSearchQuery}
                  onChange={(e) => handleBrandSearch(e.target.value)}
                  className="pl-10 h-9 text-sm"
                  data-testid="brand-search-input"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredBrands.map(brand => (
                  <div key={brand.id} className="flex items-center space-x-2" data-testid={`brand-item-${brand.id}`}>
                    <Checkbox
                      id={brand.id}
                      checked={filterState.selectedBrands.includes(brand.id)}
                      onCheckedChange={() => handleBrandToggle(brand.id)}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      data-testid={`brand-checkbox-${brand.id}`}
                    />
                    <label
                      htmlFor={brand.id}
                      className="text-sm text-gray-700 cursor-pointer flex-1 truncate"
                    >
                      {brand.name}
                    </label>
                    {brand.count && (
                      <span className="text-xs text-gray-500">{brand.count}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          {/* Size Section */}
          {renderCollapsibleSection('size', (
            <div className="space-y-2">
              {SIZES_DATA.map(size => (
                <div key={size.id} className="flex items-center space-x-2" data-testid={`size-item-${size.id}`}>
                  <Checkbox
                    id={size.id}
                    checked={filterState.selectedSizes.includes(size.id)}
                    onCheckedChange={() => handleSizeToggle(size.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    data-testid={`size-checkbox-${size.id}`}
                  />
                  <label
                    htmlFor={size.id}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {size.name}
                  </label>
                </div>
              ))}
              <div className="pt-2 text-xs text-gray-500">
                Get better results and search faster.
              </div>
            </div>
          ))}

          <Separator />

          {/* Color Section */}
          {renderCollapsibleSection('color', (
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-2">
                {COLORS_DATA.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorToggle(color.id)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110
                      ${filterState.selectedColors.includes(color.id) 
                        ? 'border-purple-600 ring-2 ring-purple-200' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: color.hexCode === '#ffffff' ? '#f8f9fa' : color.hexCode }}
                    title={color.name}
                    data-testid={`color-swatch-${color.id}`}
                  >
                    {color.hexCode === '#ffffff' && (
                      <div className="w-full h-full rounded-full border border-gray-200" />
                    )}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Select colors to filter results
              </div>
            </div>
          ))}

          <Separator />

          {/* Price Section */}
          {renderCollapsibleSection('price', (
            <div className="space-y-2">
              {PRICE_DATA.map(price => (
                <div key={price.id} className="flex items-center space-x-2" data-testid={`price-item-${price.id}`}>
                  <Checkbox
                    id={price.id}
                    checked={filterState.selectedPrices.includes(price.id)}
                    onCheckedChange={() => handlePriceToggle(price.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    data-testid={`price-checkbox-${price.id}`}
                  />
                  <label
                    htmlFor={price.id}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {price.name}
                  </label>
                </div>
              ))}
              <div className="pt-2 text-xs text-gray-500">
                Choose your price range
              </div>
            </div>
          ))}

          <Separator />

          {/* Availability Section */}
          {renderCollapsibleSection('availability', (
            <div className="space-y-2">
              {AVAILABILITY_DATA.map(availability => (
                <div key={availability.id} className="flex items-center space-x-2" data-testid={`availability-item-${availability.id}`}>
                  <Checkbox
                    id={availability.id}
                    checked={filterState.selectedAvailability.includes(availability.id)}
                    onCheckedChange={() => handleAvailabilityToggle(availability.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    data-testid={`availability-checkbox-${availability.id}`}
                  />
                  <label
                    htmlFor={availability.id}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {availability.name}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <Separator />

          {/* Shipping Section */}
          {renderCollapsibleSection('shipping', (
            <div className="space-y-2">
              <div className="flex items-center space-x-2" data-testid="shipping-item-all-items">
                <Checkbox
                  id="all-items-shipping"
                  checked={true}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  data-testid="shipping-checkbox-all-items"
                />
                <label
                  htmlFor="all-items-shipping"
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  All Items
                </label>
              </div>
              <div className="flex items-center space-x-2" data-testid="shipping-item-free">
                <Checkbox
                  id="free-shipping"
                  checked={false}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  data-testid="shipping-checkbox-free"
                />
                <label
                  htmlFor="free-shipping"
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  Free
                </label>
              </div>
              <div className="flex items-center space-x-2" data-testid="shipping-item-discounted">
                <Checkbox
                  id="discounted-free"
                  checked={false}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  data-testid="shipping-checkbox-discounted"
                />
                <label
                  htmlFor="discounted-free"
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  Discounted + Free
                </label>
              </div>
            </div>
          ))}

          <Separator />

          {/* Condition Section */}
          {renderCollapsibleSection('condition', (
            <div className="space-y-2">
              {CONDITION_DATA.map(type => (
                <div key={type.id} className="flex items-center space-x-2" data-testid={`condition-item-${type.id}`}>
                  <Checkbox
                    id={type.id}
                    checked={filterState.selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    data-testid={`condition-checkbox-${type.id}`}
                  />
                  <label
                    htmlFor={type.id}
                    className="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          ))}

          <Separator />

          {/* More Ways to Shop Section */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">MORE WAYS TO SHOP</h3>
            <div className="space-y-2">
              <button className="text-sm text-purple-700 hover:text-purple-800 transition-colors block">
                Shop all Brands
              </button>
              <button className="text-sm text-purple-700 hover:text-purple-800 transition-colors block">
                Today's trends
              </button>
            </div>
          </div>

        </div>
      </ScrollArea>

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
});

EnterpriseFilterSidebar.displayName = 'EnterpriseFilterSidebar';

// ===== AOP ENHANCEMENT =====
const EnhancedEnterpriseFilterSidebar = withEnterpriseInterceptors(EnterpriseFilterSidebar, {
  enablePerformanceMonitoring: true,
  enablePropsValidation: true,
  enableErrorBoundary: true
});

// ===== EXPORTS =====
export default EnhancedEnterpriseFilterSidebar;
export type { FilterState, FilterSidebarProps, FilterCategory, FilterBrand, FilterColor, FilterPrice };
export { FilterStateSchema, FilterSidebarPropsSchema };