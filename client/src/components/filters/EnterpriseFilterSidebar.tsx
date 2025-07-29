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
  {
    id: 'men',
    name: 'Men',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'men-accessories',
        name: 'Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-belts', name: 'Belts', level: 2, isExpandable: false },
          { id: 'men-cufflinks', name: 'Cufflinks', level: 2, isExpandable: false },
          { id: 'men-gloves-mittens', name: 'Gloves & Mittens', level: 2, isExpandable: false },
          { id: 'men-hats', name: 'Hats', level: 2, isExpandable: false },
          { id: 'men-keychains', name: 'Keychains', level: 2, isExpandable: false },
          { id: 'men-scarves', name: 'Scarves', level: 2, isExpandable: false },
          { id: 'men-sunglasses', name: 'Sunglasses', level: 2, isExpandable: false },
          { id: 'men-ties', name: 'Ties', level: 2, isExpandable: false },
          { id: 'men-wallets', name: 'Wallets', level: 2, isExpandable: false },
          { id: 'men-watches', name: 'Watches', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-bags',
        name: 'Bags',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-backpacks', name: 'Backpacks', level: 2, isExpandable: false },
          { id: 'men-briefcases', name: 'Briefcases', level: 2, isExpandable: false },
          { id: 'men-crossbody-bags', name: 'Crossbody Bags', level: 2, isExpandable: false },
          { id: 'men-duffel-bags', name: 'Duffel Bags', level: 2, isExpandable: false },
          { id: 'men-laptop-bags', name: 'Laptop Bags', level: 2, isExpandable: false },
          { id: 'men-messenger-bags', name: 'Messenger Bags', level: 2, isExpandable: false },
          { id: 'men-tote-bags', name: 'Tote Bags', level: 2, isExpandable: false },
          { id: 'men-travel-bags', name: 'Travel Bags', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-jackets-coats',
        name: 'Jackets & Coats',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-blazers', name: 'Blazers', level: 2, isExpandable: false },
          { id: 'men-bomber-jackets', name: 'Bomber Jackets', level: 2, isExpandable: false },
          { id: 'men-denim-jackets', name: 'Denim Jackets', level: 2, isExpandable: false },
          { id: 'men-down-jackets', name: 'Down Jackets', level: 2, isExpandable: false },
          { id: 'men-leather-jackets', name: 'Leather Jackets', level: 2, isExpandable: false },
          { id: 'men-overcoats', name: 'Overcoats', level: 2, isExpandable: false },
          { id: 'men-parkas', name: 'Parkas', level: 2, isExpandable: false },
          { id: 'men-peacoats', name: 'Peacoats', level: 2, isExpandable: false },
          { id: 'men-rain-jackets', name: 'Rain Jackets', level: 2, isExpandable: false },
          { id: 'men-sport-jackets', name: 'Sport Jackets', level: 2, isExpandable: false },
          { id: 'men-trench-coats', name: 'Trench Coats', level: 2, isExpandable: false },
          { id: 'men-windbreakers', name: 'Windbreakers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-jeans',
        name: 'Jeans',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-bootcut-jeans', name: 'Bootcut', level: 2, isExpandable: false },
          { id: 'men-distressed-jeans', name: 'Distressed', level: 2, isExpandable: false },
          { id: 'men-relaxed-jeans', name: 'Relaxed', level: 2, isExpandable: false },
          { id: 'men-skinny-jeans', name: 'Skinny', level: 2, isExpandable: false },
          { id: 'men-slim-jeans', name: 'Slim', level: 2, isExpandable: false },
          { id: 'men-straight-jeans', name: 'Straight', level: 2, isExpandable: false },
          { id: 'men-tapered-jeans', name: 'Tapered', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-pants',
        name: 'Pants',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-cargo-pants', name: 'Cargo Pants', level: 2, isExpandable: false },
          { id: 'men-chinos', name: 'Chinos', level: 2, isExpandable: false },
          { id: 'men-dress-pants', name: 'Dress Pants', level: 2, isExpandable: false },
          { id: 'men-joggers', name: 'Joggers', level: 2, isExpandable: false },
          { id: 'men-khakis', name: 'Khakis', level: 2, isExpandable: false },
          { id: 'men-leather-pants', name: 'Leather Pants', level: 2, isExpandable: false },
          { id: 'men-sweatpants', name: 'Sweatpants', level: 2, isExpandable: false },
          { id: 'men-track-pants', name: 'Track Pants', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-shirts',
        name: 'Shirts',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-button-down-shirts', name: 'Button Down Shirts', level: 2, isExpandable: false },
          { id: 'men-dress-shirts', name: 'Dress Shirts', level: 2, isExpandable: false },
          { id: 'men-flannel-shirts', name: 'Flannel Shirts', level: 2, isExpandable: false },
          { id: 'men-henley-shirts', name: 'Henley Shirts', level: 2, isExpandable: false },
          { id: 'men-polo-shirts', name: 'Polo Shirts', level: 2, isExpandable: false },
          { id: 'men-tank-tops', name: 'Tank Tops', level: 2, isExpandable: false },
          { id: 'men-tees-long-sleeve', name: 'Tees - Long Sleeve', level: 2, isExpandable: false },
          { id: 'men-tees-short-sleeve', name: 'Tees - Short Sleeve', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-shoes',
        name: 'Shoes',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-athletic-shoes', name: 'Athletic Shoes', level: 2, isExpandable: false },
          { id: 'men-boots', name: 'Boots', level: 2, isExpandable: false },
          { id: 'men-dress-shoes', name: 'Dress Shoes', level: 2, isExpandable: false },
          { id: 'men-loafers', name: 'Loafers', level: 2, isExpandable: false },
          { id: 'men-oxfords', name: 'Oxfords', level: 2, isExpandable: false },
          { id: 'men-sandals', name: 'Sandals', level: 2, isExpandable: false },
          { id: 'men-slip-ons', name: 'Slip Ons', level: 2, isExpandable: false },
          { id: 'men-sneakers', name: 'Sneakers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-shorts',
        name: 'Shorts',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-athletic-shorts', name: 'Athletic Shorts', level: 2, isExpandable: false },
          { id: 'men-board-shorts', name: 'Board Shorts', level: 2, isExpandable: false },
          { id: 'men-cargo-shorts', name: 'Cargo Shorts', level: 2, isExpandable: false },
          { id: 'men-chino-shorts', name: 'Chino Shorts', level: 2, isExpandable: false },
          { id: 'men-denim-shorts', name: 'Denim Shorts', level: 2, isExpandable: false },
          { id: 'men-dress-shorts', name: 'Dress Shorts', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-suits-blazers',
        name: 'Suits & Blazers',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-blazers-sport-coats', name: 'Blazers & Sport Coats', level: 2, isExpandable: false },
          { id: 'men-suit-jackets', name: 'Suit Jackets', level: 2, isExpandable: false },
          { id: 'men-suit-separates', name: 'Suit Separates', level: 2, isExpandable: false },
          { id: 'men-suits', name: 'Suits', level: 2, isExpandable: false },
          { id: 'men-tuxedos', name: 'Tuxedos', level: 2, isExpandable: false },
          { id: 'men-vests', name: 'Vests', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-sweaters',
        name: 'Sweaters',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-cardigans', name: 'Cardigans', level: 2, isExpandable: false },
          { id: 'men-crew-necks', name: 'Crew Necks', level: 2, isExpandable: false },
          { id: 'men-hoodies', name: 'Hoodies', level: 2, isExpandable: false },
          { id: 'men-pullovers', name: 'Pullovers', level: 2, isExpandable: false },
          { id: 'men-sweatshirts', name: 'Sweatshirts', level: 2, isExpandable: false },
          { id: 'men-turtlenecks', name: 'Turtlenecks', level: 2, isExpandable: false },
          { id: 'men-v-necks', name: 'V-Necks', level: 2, isExpandable: false },
          { id: 'men-zip-ups', name: 'Zip-Ups', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-swim',
        name: 'Swim',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-board-shorts-swim', name: 'Board Shorts', level: 2, isExpandable: false },
          { id: 'men-rashguards', name: 'Rashguards', level: 2, isExpandable: false },
          { id: 'men-swim-briefs', name: 'Swim Briefs', level: 2, isExpandable: false },
          { id: 'men-swim-shorts', name: 'Swim Shorts', level: 2, isExpandable: false },
          { id: 'men-swim-trunks', name: 'Swim Trunks', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-underwear-socks',
        name: 'Underwear & Socks',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-boxers', name: 'Boxers', level: 2, isExpandable: false },
          { id: 'men-boxer-briefs', name: 'Boxer Briefs', level: 2, isExpandable: false },
          { id: 'men-briefs', name: 'Briefs', level: 2, isExpandable: false },
          { id: 'men-dress-socks', name: 'Dress Socks', level: 2, isExpandable: false },
          { id: 'men-no-show-socks', name: 'No Show Socks', level: 2, isExpandable: false },
          { id: 'men-sport-socks', name: 'Sport Socks', level: 2, isExpandable: false },
          { id: 'men-thermal-underwear', name: 'Thermal Underwear', level: 2, isExpandable: false },
          { id: 'men-undershirts', name: 'Undershirts', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'men-grooming',
        name: 'Grooming',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'men-aftershave', name: 'Aftershave', level: 2, isExpandable: false },
          { id: 'men-beard-care', name: 'Beard Care', level: 2, isExpandable: false },
          { id: 'men-cologne', name: 'Cologne', level: 2, isExpandable: false },
          { id: 'men-deodorant', name: 'Deodorant', level: 2, isExpandable: false },
          { id: 'men-hair-care', name: 'Hair Care', level: 2, isExpandable: false },
          { id: 'men-shaving-cream', name: 'Shaving Cream', level: 2, isExpandable: false },
          { id: 'men-skincare', name: 'Skincare', level: 2, isExpandable: false }
        ]
      },
      { id: 'men-global-traditional', name: 'Global & Traditional Wear', level: 1, isExpandable: false }
    ]
  },
  {
    id: 'kids',
    name: 'Kids',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'kids-accessories',
        name: 'Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-belts', name: 'Belts', level: 2, isExpandable: false },
          { id: 'kids-glasses', name: 'Glasses', level: 2, isExpandable: false },
          { id: 'kids-gloves-mittens', name: 'Gloves & Mittens', level: 2, isExpandable: false },
          { id: 'kids-hair-accessories', name: 'Hair Accessories', level: 2, isExpandable: false },
          { id: 'kids-hats-caps', name: 'Hats & Caps', level: 2, isExpandable: false },
          { id: 'kids-jewelry', name: 'Jewelry', level: 2, isExpandable: false },
          { id: 'kids-scarves', name: 'Scarves', level: 2, isExpandable: false },
          { id: 'kids-sunglasses', name: 'Sunglasses', level: 2, isExpandable: false },
          { id: 'kids-ties-bow-ties', name: 'Ties & Bow Ties', level: 2, isExpandable: false },
          { id: 'kids-watches', name: 'Watches', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-bottoms',
        name: 'Bottoms',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-jeans', name: 'Jeans', level: 2, isExpandable: false },
          { id: 'kids-leggings', name: 'Leggings', level: 2, isExpandable: false },
          { id: 'kids-pants', name: 'Pants', level: 2, isExpandable: false },
          { id: 'kids-shorts', name: 'Shorts', level: 2, isExpandable: false },
          { id: 'kids-skirts', name: 'Skirts', level: 2, isExpandable: false },
          { id: 'kids-sweatpants', name: 'Sweatpants', level: 2, isExpandable: false },
          { id: 'kids-tights', name: 'Tights', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-dresses',
        name: 'Dresses',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-casual-dresses', name: 'Casual Dresses', level: 2, isExpandable: false },
          { id: 'kids-formal-dresses', name: 'Formal Dresses', level: 2, isExpandable: false },
          { id: 'kids-holiday-dresses', name: 'Holiday Dresses', level: 2, isExpandable: false },
          { id: 'kids-maxi-dresses', name: 'Maxi Dresses', level: 2, isExpandable: false },
          { id: 'kids-party-dresses', name: 'Party Dresses', level: 2, isExpandable: false },
          { id: 'kids-sundresses', name: 'Sundresses', level: 2, isExpandable: false },
          { id: 'kids-tunic-dresses', name: 'Tunic Dresses', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-jackets-coats',
        name: 'Jackets & Coats',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-blazers', name: 'Blazers', level: 2, isExpandable: false },
          { id: 'kids-bomber-jackets', name: 'Bomber Jackets', level: 2, isExpandable: false },
          { id: 'kids-denim-jackets', name: 'Denim Jackets', level: 2, isExpandable: false },
          { id: 'kids-down-jackets', name: 'Down Jackets', level: 2, isExpandable: false },
          { id: 'kids-fleece-jackets', name: 'Fleece Jackets', level: 2, isExpandable: false },
          { id: 'kids-hooded-jackets', name: 'Hooded Jackets', level: 2, isExpandable: false },
          { id: 'kids-parkas', name: 'Parkas', level: 2, isExpandable: false },
          { id: 'kids-rain-jackets', name: 'Rain Jackets', level: 2, isExpandable: false },
          { id: 'kids-varsity-jackets', name: 'Varsity Jackets', level: 2, isExpandable: false },
          { id: 'kids-windbreakers', name: 'Windbreakers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-matching-sets',
        name: 'Matching Sets',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-athletic-sets', name: 'Athletic Sets', level: 2, isExpandable: false },
          { id: 'kids-dress-sets', name: 'Dress Sets', level: 2, isExpandable: false },
          { id: 'kids-outfit-sets', name: 'Outfit Sets', level: 2, isExpandable: false },
          { id: 'kids-pajama-sets', name: 'Pajama Sets', level: 2, isExpandable: false },
          { id: 'kids-school-sets', name: 'School Sets', level: 2, isExpandable: false },
          { id: 'kids-twin-sets', name: 'Twin Sets', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-one-pieces',
        name: 'One Pieces',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-bodysuits', name: 'Bodysuits', level: 2, isExpandable: false },
          { id: 'kids-jumpsuits', name: 'Jumpsuits', level: 2, isExpandable: false },
          { id: 'kids-onesies', name: 'Onesies', level: 2, isExpandable: false },
          { id: 'kids-overalls', name: 'Overalls', level: 2, isExpandable: false },
          { id: 'kids-rompers', name: 'Rompers', level: 2, isExpandable: false },
          { id: 'kids-sleepers', name: 'Sleepers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-pajamas',
        name: 'Pajamas',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-nightgowns', name: 'Nightgowns', level: 2, isExpandable: false },
          { id: 'kids-pajama-bottoms', name: 'Pajama Bottoms', level: 2, isExpandable: false },
          { id: 'kids-pajama-tops', name: 'Pajama Tops', level: 2, isExpandable: false },
          { id: 'kids-robes', name: 'Robes', level: 2, isExpandable: false },
          { id: 'kids-sleep-sets', name: 'Sleep Sets', level: 2, isExpandable: false },
          { id: 'kids-slippers', name: 'Slippers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-shirts-tops',
        name: 'Shirts & Tops',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-blouses', name: 'Blouses', level: 2, isExpandable: false },
          { id: 'kids-button-down-shirts', name: 'Button Down Shirts', level: 2, isExpandable: false },
          { id: 'kids-graphic-tees', name: 'Graphic Tees', level: 2, isExpandable: false },
          { id: 'kids-hoodies', name: 'Hoodies', level: 2, isExpandable: false },
          { id: 'kids-polo-shirts', name: 'Polo Shirts', level: 2, isExpandable: false },
          { id: 'kids-sweatshirts', name: 'Sweatshirts', level: 2, isExpandable: false },
          { id: 'kids-tank-tops', name: 'Tank Tops', level: 2, isExpandable: false },
          { id: 'kids-tees-long-sleeve', name: 'Tees - Long Sleeve', level: 2, isExpandable: false },
          { id: 'kids-tees-short-sleeve', name: 'Tees - Short Sleeve', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-shoes',
        name: 'Shoes',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-athletic-shoes', name: 'Athletic Shoes', level: 2, isExpandable: false },
          { id: 'kids-boots', name: 'Boots', level: 2, isExpandable: false },
          { id: 'kids-dress-shoes', name: 'Dress Shoes', level: 2, isExpandable: false },
          { id: 'kids-flats', name: 'Flats', level: 2, isExpandable: false },
          { id: 'kids-mary-janes', name: 'Mary Janes', level: 2, isExpandable: false },
          { id: 'kids-rain-boots', name: 'Rain Boots', level: 2, isExpandable: false },
          { id: 'kids-sandals', name: 'Sandals', level: 2, isExpandable: false },
          { id: 'kids-slip-ons', name: 'Slip Ons', level: 2, isExpandable: false },
          { id: 'kids-sneakers', name: 'Sneakers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-swim',
        name: 'Swim',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-bikinis', name: 'Bikinis', level: 2, isExpandable: false },
          { id: 'kids-board-shorts', name: 'Board Shorts', level: 2, isExpandable: false },
          { id: 'kids-one-piece-swimsuits', name: 'One Piece Swimsuits', level: 2, isExpandable: false },
          { id: 'kids-rashguards', name: 'Rashguards', level: 2, isExpandable: false },
          { id: 'kids-swim-coverups', name: 'Swim Coverups', level: 2, isExpandable: false },
          { id: 'kids-swim-trunks', name: 'Swim Trunks', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-costumes',
        name: 'Costumes',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-character-costumes', name: 'Character Costumes', level: 2, isExpandable: false },
          { id: 'kids-dress-up-clothes', name: 'Dress-Up Clothes', level: 2, isExpandable: false },
          { id: 'kids-halloween-costumes', name: 'Halloween Costumes', level: 2, isExpandable: false },
          { id: 'kids-holiday-costumes', name: 'Holiday Costumes', level: 2, isExpandable: false },
          { id: 'kids-pretend-play', name: 'Pretend Play', level: 2, isExpandable: false },
          { id: 'kids-school-play-costumes', name: 'School Play Costumes', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-bath-skin-hair',
        name: 'Bath, Skin & Hair',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-bath-toys', name: 'Bath Toys', level: 2, isExpandable: false },
          { id: 'kids-body-wash', name: 'Body Wash', level: 2, isExpandable: false },
          { id: 'kids-hair-accessories-care', name: 'Hair Accessories & Care', level: 2, isExpandable: false },
          { id: 'kids-lotion-moisturizer', name: 'Lotion & Moisturizer', level: 2, isExpandable: false },
          { id: 'kids-shampoo-conditioner', name: 'Shampoo & Conditioner', level: 2, isExpandable: false },
          { id: 'kids-sunscreen', name: 'Sunscreen', level: 2, isExpandable: false },
          { id: 'kids-toothbrush-toothpaste', name: 'Toothbrush & Toothpaste', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'kids-toys',
        name: 'Toys',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'kids-action-figures', name: 'Action Figures', level: 2, isExpandable: false },
          { id: 'kids-arts-crafts', name: 'Arts & Crafts', level: 2, isExpandable: false },
          { id: 'kids-building-blocks', name: 'Building Blocks', level: 2, isExpandable: false },
          { id: 'kids-dolls', name: 'Dolls', level: 2, isExpandable: false },
          { id: 'kids-educational-toys', name: 'Educational Toys', level: 2, isExpandable: false },
          { id: 'kids-electronic-toys', name: 'Electronic Toys', level: 2, isExpandable: false },
          { id: 'kids-games-puzzles', name: 'Games & Puzzles', level: 2, isExpandable: false },
          { id: 'kids-outdoor-toys', name: 'Outdoor Toys', level: 2, isExpandable: false },
          { id: 'kids-plush-toys', name: 'Plush Toys', level: 2, isExpandable: false },
          { id: 'kids-vehicles', name: 'Vehicles', level: 2, isExpandable: false }
        ]
      }
    ]
  },
  {
    id: 'home',
    name: 'Home',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'home-accents',
        name: 'Accents',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-candles', name: 'Candles', level: 2, isExpandable: false },
          { id: 'home-decorative-bowls', name: 'Decorative Bowls', level: 2, isExpandable: false },
          { id: 'home-figurines', name: 'Figurines', level: 2, isExpandable: false },
          { id: 'home-picture-frames', name: 'Picture Frames', level: 2, isExpandable: false },
          { id: 'home-sculptures', name: 'Sculptures', level: 2, isExpandable: false },
          { id: 'home-throw-pillows', name: 'Throw Pillows', level: 2, isExpandable: false },
          { id: 'home-vases', name: 'Vases', level: 2, isExpandable: false },
          { id: 'home-decorative-objects', name: 'Decorative Objects', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-art',
        name: 'Art',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-canvas-art', name: 'Canvas Art', level: 2, isExpandable: false },
          { id: 'home-framed-prints', name: 'Framed Prints', level: 2, isExpandable: false },
          { id: 'home-metal-art', name: 'Metal Art', level: 2, isExpandable: false },
          { id: 'home-photography', name: 'Photography', level: 2, isExpandable: false },
          { id: 'home-posters', name: 'Posters', level: 2, isExpandable: false },
          { id: 'home-wall-art', name: 'Wall Art', level: 2, isExpandable: false },
          { id: 'home-watercolor-art', name: 'Watercolor Art', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-bath',
        name: 'Bath',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-bath-mats', name: 'Bath Mats', level: 2, isExpandable: false },
          { id: 'home-bath-towels', name: 'Bath Towels', level: 2, isExpandable: false },
          { id: 'home-hand-towels', name: 'Hand Towels', level: 2, isExpandable: false },
          { id: 'home-shower-curtains', name: 'Shower Curtains', level: 2, isExpandable: false },
          { id: 'home-soap-dispensers', name: 'Soap Dispensers', level: 2, isExpandable: false },
          { id: 'home-toilet-paper-holders', name: 'Toilet Paper Holders', level: 2, isExpandable: false },
          { id: 'home-toothbrush-holders', name: 'Toothbrush Holders', level: 2, isExpandable: false },
          { id: 'home-washcloths', name: 'Washcloths', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-bedding',
        name: 'Bedding',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-bed-sheets', name: 'Bed Sheets', level: 2, isExpandable: false },
          { id: 'home-blankets', name: 'Blankets', level: 2, isExpandable: false },
          { id: 'home-comforters', name: 'Comforters', level: 2, isExpandable: false },
          { id: 'home-duvet-covers', name: 'Duvet Covers', level: 2, isExpandable: false },
          { id: 'home-mattress-pads', name: 'Mattress Pads', level: 2, isExpandable: false },
          { id: 'home-pillow-cases', name: 'Pillow Cases', level: 2, isExpandable: false },
          { id: 'home-pillows', name: 'Pillows', level: 2, isExpandable: false },
          { id: 'home-quilts', name: 'Quilts', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-design',
        name: 'Design',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-area-rugs', name: 'Area Rugs', level: 2, isExpandable: false },
          { id: 'home-curtains', name: 'Curtains', level: 2, isExpandable: false },
          { id: 'home-furniture', name: 'Furniture', level: 2, isExpandable: false },
          { id: 'home-lamps', name: 'Lamps', level: 2, isExpandable: false },
          { id: 'home-lighting', name: 'Lighting', level: 2, isExpandable: false },
          { id: 'home-mirrors', name: 'Mirrors', level: 2, isExpandable: false },
          { id: 'home-window-treatments', name: 'Window Treatments', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-dining',
        name: 'Dining',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-dinnerware', name: 'Dinnerware', level: 2, isExpandable: false },
          { id: 'home-drinkware', name: 'Drinkware', level: 2, isExpandable: false },
          { id: 'home-flatware', name: 'Flatware', level: 2, isExpandable: false },
          { id: 'home-placemats', name: 'Placemats', level: 2, isExpandable: false },
          { id: 'home-serving-dishes', name: 'Serving Dishes', level: 2, isExpandable: false },
          { id: 'home-table-linens', name: 'Table Linens', level: 2, isExpandable: false },
          { id: 'home-table-runners', name: 'Table Runners', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-games',
        name: 'Games',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-board-games', name: 'Board Games', level: 2, isExpandable: false },
          { id: 'home-card-games', name: 'Card Games', level: 2, isExpandable: false },
          { id: 'home-chess-sets', name: 'Chess Sets', level: 2, isExpandable: false },
          { id: 'home-party-games', name: 'Party Games', level: 2, isExpandable: false },
          { id: 'home-puzzle-games', name: 'Puzzle Games', level: 2, isExpandable: false },
          { id: 'home-strategy-games', name: 'Strategy Games', level: 2, isExpandable: false },
          { id: 'home-trivia-games', name: 'Trivia Games', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-holiday',
        name: 'Holiday',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-christmas-decor', name: 'Christmas Decor', level: 2, isExpandable: false },
          { id: 'home-easter-decor', name: 'Easter Decor', level: 2, isExpandable: false },
          { id: 'home-halloween-decor', name: 'Halloween Decor', level: 2, isExpandable: false },
          { id: 'home-holiday-lights', name: 'Holiday Lights', level: 2, isExpandable: false },
          { id: 'home-ornaments', name: 'Ornaments', level: 2, isExpandable: false },
          { id: 'home-seasonal-decor', name: 'Seasonal Decor', level: 2, isExpandable: false },
          { id: 'home-thanksgiving-decor', name: 'Thanksgiving Decor', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-kitchen',
        name: 'Kitchen',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-appliances', name: 'Appliances', level: 2, isExpandable: false },
          { id: 'home-bakeware', name: 'Bakeware', level: 2, isExpandable: false },
          { id: 'home-cookware', name: 'Cookware', level: 2, isExpandable: false },
          { id: 'home-cutting-boards', name: 'Cutting Boards', level: 2, isExpandable: false },
          { id: 'home-kitchen-gadgets', name: 'Kitchen Gadgets', level: 2, isExpandable: false },
          { id: 'home-kitchen-linens', name: 'Kitchen Linens', level: 2, isExpandable: false },
          { id: 'home-kitchen-tools', name: 'Kitchen Tools', level: 2, isExpandable: false },
          { id: 'home-storage-containers', name: 'Storage Containers', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-office',
        name: 'Office',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-desk-accessories', name: 'Desk Accessories', level: 2, isExpandable: false },
          { id: 'home-filing-systems', name: 'Filing Systems', level: 2, isExpandable: false },
          { id: 'home-notebooks', name: 'Notebooks', level: 2, isExpandable: false },
          { id: 'home-office-chairs', name: 'Office Chairs', level: 2, isExpandable: false },
          { id: 'home-office-decor', name: 'Office Decor', level: 2, isExpandable: false },
          { id: 'home-pen-holders', name: 'Pen Holders', level: 2, isExpandable: false },
          { id: 'home-stationery', name: 'Stationery', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-party-supplies',
        name: 'Party Supplies',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-balloons', name: 'Balloons', level: 2, isExpandable: false },
          { id: 'home-banners', name: 'Banners', level: 2, isExpandable: false },
          { id: 'home-disposable-tableware', name: 'Disposable Tableware', level: 2, isExpandable: false },
          { id: 'home-party-decorations', name: 'Party Decorations', level: 2, isExpandable: false },
          { id: 'home-party-favors', name: 'Party Favors', level: 2, isExpandable: false },
          { id: 'home-streamers', name: 'Streamers', level: 2, isExpandable: false },
          { id: 'home-table-decorations', name: 'Table Decorations', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-storage-organization',
        name: 'Storage & Organization',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-baskets', name: 'Baskets', level: 2, isExpandable: false },
          { id: 'home-bins', name: 'Bins', level: 2, isExpandable: false },
          { id: 'home-closet-organizers', name: 'Closet Organizers', level: 2, isExpandable: false },
          { id: 'home-drawer-organizers', name: 'Drawer Organizers', level: 2, isExpandable: false },
          { id: 'home-hooks', name: 'Hooks', level: 2, isExpandable: false },
          { id: 'home-shelving', name: 'Shelving', level: 2, isExpandable: false },
          { id: 'home-storage-boxes', name: 'Storage Boxes', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'home-wall-decor',
        name: 'Wall Decor',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'home-clocks', name: 'Clocks', level: 2, isExpandable: false },
          { id: 'home-floating-shelves', name: 'Floating Shelves', level: 2, isExpandable: false },
          { id: 'home-photo-displays', name: 'Photo Displays', level: 2, isExpandable: false },
          { id: 'home-wall-hangings', name: 'Wall Hangings', level: 2, isExpandable: false },
          { id: 'home-wall-sconces', name: 'Wall Sconces', level: 2, isExpandable: false },
          { id: 'home-wall-stickers', name: 'Wall Stickers', level: 2, isExpandable: false },
          { id: 'home-wallpaper', name: 'Wallpaper', level: 2, isExpandable: false }
        ]
      }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'pets-dog',
        name: 'Dog',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-dog-beds', name: 'Beds', level: 2, isExpandable: false },
          { id: 'pets-dog-bowls', name: 'Bowls', level: 2, isExpandable: false },
          { id: 'pets-dog-carriers', name: 'Carriers', level: 2, isExpandable: false },
          { id: 'pets-dog-collars', name: 'Collars', level: 2, isExpandable: false },
          { id: 'pets-dog-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-dog-grooming', name: 'Grooming', level: 2, isExpandable: false },
          { id: 'pets-dog-leashes', name: 'Leashes', level: 2, isExpandable: false },
          { id: 'pets-dog-toys', name: 'Toys', level: 2, isExpandable: false },
          { id: 'pets-dog-treats', name: 'Treats', level: 2, isExpandable: false },
          { id: 'pets-dog-clothing', name: 'Clothing', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pets-cat',
        name: 'Cat',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-cat-beds', name: 'Beds', level: 2, isExpandable: false },
          { id: 'pets-cat-bowls', name: 'Bowls', level: 2, isExpandable: false },
          { id: 'pets-cat-carriers', name: 'Carriers', level: 2, isExpandable: false },
          { id: 'pets-cat-collars', name: 'Collars', level: 2, isExpandable: false },
          { id: 'pets-cat-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-cat-grooming', name: 'Grooming', level: 2, isExpandable: false },
          { id: 'pets-cat-litter', name: 'Litter', level: 2, isExpandable: false },
          { id: 'pets-cat-litter-boxes', name: 'Litter Boxes', level: 2, isExpandable: false },
          { id: 'pets-cat-scratching-posts', name: 'Scratching Posts', level: 2, isExpandable: false },
          { id: 'pets-cat-toys', name: 'Toys', level: 2, isExpandable: false },
          { id: 'pets-cat-treats', name: 'Treats', level: 2, isExpandable: false },
          { id: 'pets-cat-trees', name: 'Trees', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pets-bird',
        name: 'Bird',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-bird-cages', name: 'Cages', level: 2, isExpandable: false },
          { id: 'pets-bird-cage-accessories', name: 'Cage Accessories', level: 2, isExpandable: false },
          { id: 'pets-bird-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-bird-perches', name: 'Perches', level: 2, isExpandable: false },
          { id: 'pets-bird-toys', name: 'Toys', level: 2, isExpandable: false },
          { id: 'pets-bird-treats', name: 'Treats', level: 2, isExpandable: false },
          { id: 'pets-bird-water-feeders', name: 'Water & Feeders', level: 2, isExpandable: false },
          { id: 'pets-bird-supplements', name: 'Supplements', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pets-fish',
        name: 'Fish',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-fish-aquariums', name: 'Aquariums', level: 2, isExpandable: false },
          { id: 'pets-fish-decorations', name: 'Decorations', level: 2, isExpandable: false },
          { id: 'pets-fish-filters', name: 'Filters', level: 2, isExpandable: false },
          { id: 'pets-fish-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-fish-gravel-substrate', name: 'Gravel & Substrate', level: 2, isExpandable: false },
          { id: 'pets-fish-heaters', name: 'Heaters', level: 2, isExpandable: false },
          { id: 'pets-fish-lighting', name: 'Lighting', level: 2, isExpandable: false },
          { id: 'pets-fish-plants', name: 'Plants', level: 2, isExpandable: false },
          { id: 'pets-fish-pumps', name: 'Pumps', level: 2, isExpandable: false },
          { id: 'pets-fish-water-treatment', name: 'Water Treatment', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pets-reptile',
        name: 'Reptile',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-reptile-terrariums', name: 'Terrariums', level: 2, isExpandable: false },
          { id: 'pets-reptile-heating', name: 'Heating', level: 2, isExpandable: false },
          { id: 'pets-reptile-lighting', name: 'Lighting', level: 2, isExpandable: false },
          { id: 'pets-reptile-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-reptile-substrate', name: 'Substrate', level: 2, isExpandable: false },
          { id: 'pets-reptile-decorations', name: 'Decorations', level: 2, isExpandable: false },
          { id: 'pets-reptile-supplements', name: 'Supplements', level: 2, isExpandable: false },
          { id: 'pets-reptile-humidity-control', name: 'Humidity Control', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'pets-small-pet',
        name: 'Small Pet',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'pets-small-pet-cages', name: 'Cages', level: 2, isExpandable: false },
          { id: 'pets-small-pet-bedding', name: 'Bedding', level: 2, isExpandable: false },
          { id: 'pets-small-pet-food', name: 'Food', level: 2, isExpandable: false },
          { id: 'pets-small-pet-toys', name: 'Toys', level: 2, isExpandable: false },
          { id: 'pets-small-pet-treats', name: 'Treats', level: 2, isExpandable: false },
          { id: 'pets-small-pet-water-bottles', name: 'Water Bottles', level: 2, isExpandable: false },
          { id: 'pets-small-pet-exercise-equipment', name: 'Exercise Equipment', level: 2, isExpandable: false },
          { id: 'pets-small-pet-grooming', name: 'Grooming', level: 2, isExpandable: false },
          { id: 'pets-small-pet-carriers', name: 'Carriers', level: 2, isExpandable: false }
        ]
      }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    level: 0,
    isExpandable: true,
    subcategories: [
      {
        id: 'electronics-cameras-photo-video',
        name: 'Cameras, Photo & Video',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-digital-cameras', name: 'Digital Cameras', level: 2, isExpandable: false },
          { id: 'electronics-dslr-cameras', name: 'DSLR Cameras', level: 2, isExpandable: false },
          { id: 'electronics-mirrorless-cameras', name: 'Mirrorless Cameras', level: 2, isExpandable: false },
          { id: 'electronics-action-cameras', name: 'Action Cameras', level: 2, isExpandable: false },
          { id: 'electronics-instant-cameras', name: 'Instant Cameras', level: 2, isExpandable: false },
          { id: 'electronics-camcorders', name: 'Camcorders', level: 2, isExpandable: false },
          { id: 'electronics-camera-lenses', name: 'Camera Lenses', level: 2, isExpandable: false },
          { id: 'electronics-camera-accessories', name: 'Camera Accessories', level: 2, isExpandable: false },
          { id: 'electronics-tripods', name: 'Tripods', level: 2, isExpandable: false },
          { id: 'electronics-lighting-equipment', name: 'Lighting Equipment', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-computers-laptops-parts',
        name: 'Computers, Laptops & Parts',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-desktop-computers', name: 'Desktop Computers', level: 2, isExpandable: false },
          { id: 'electronics-laptops', name: 'Laptops', level: 2, isExpandable: false },
          { id: 'electronics-gaming-laptops', name: 'Gaming Laptops', level: 2, isExpandable: false },
          { id: 'electronics-monitors', name: 'Monitors', level: 2, isExpandable: false },
          { id: 'electronics-keyboards', name: 'Keyboards', level: 2, isExpandable: false },
          { id: 'electronics-mice', name: 'Mice', level: 2, isExpandable: false },
          { id: 'electronics-computer-speakers', name: 'Computer Speakers', level: 2, isExpandable: false },
          { id: 'electronics-computer-parts', name: 'Computer Parts', level: 2, isExpandable: false },
          { id: 'electronics-hard-drives', name: 'Hard Drives', level: 2, isExpandable: false },
          { id: 'electronics-memory-ram', name: 'Memory (RAM)', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-cell-phones-accessories',
        name: 'Cell Phones & Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-smartphones', name: 'Smartphones', level: 2, isExpandable: false },
          { id: 'electronics-phone-cases', name: 'Phone Cases', level: 2, isExpandable: false },
          { id: 'electronics-screen-protectors', name: 'Screen Protectors', level: 2, isExpandable: false },
          { id: 'electronics-phone-chargers', name: 'Phone Chargers', level: 2, isExpandable: false },
          { id: 'electronics-power-banks', name: 'Power Banks', level: 2, isExpandable: false },
          { id: 'electronics-wireless-chargers', name: 'Wireless Chargers', level: 2, isExpandable: false },
          { id: 'electronics-phone-stands', name: 'Phone Stands', level: 2, isExpandable: false },
          { id: 'electronics-car-phone-mounts', name: 'Car Phone Mounts', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-car-audio-video-gps',
        name: 'Car Audio, Video & GPS',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-car-stereos', name: 'Car Stereos', level: 2, isExpandable: false },
          { id: 'electronics-car-speakers', name: 'Car Speakers', level: 2, isExpandable: false },
          { id: 'electronics-car-amplifiers', name: 'Car Amplifiers', level: 2, isExpandable: false },
          { id: 'electronics-gps-navigation', name: 'GPS Navigation', level: 2, isExpandable: false },
          { id: 'electronics-dash-cameras', name: 'Dash Cameras', level: 2, isExpandable: false },
          { id: 'electronics-backup-cameras', name: 'Backup Cameras', level: 2, isExpandable: false },
          { id: 'electronics-car-video-players', name: 'Car Video Players', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-wearables',
        name: 'Wearables',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-smartwatches', name: 'Smartwatches', level: 2, isExpandable: false },
          { id: 'electronics-fitness-trackers', name: 'Fitness Trackers', level: 2, isExpandable: false },
          { id: 'electronics-smart-rings', name: 'Smart Rings', level: 2, isExpandable: false },
          { id: 'electronics-smart-glasses', name: 'Smart Glasses', level: 2, isExpandable: false },
          { id: 'electronics-watch-bands', name: 'Watch Bands', level: 2, isExpandable: false },
          { id: 'electronics-wearable-accessories', name: 'Wearable Accessories', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-tablets-accessories',
        name: 'Tablets & Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-tablets', name: 'Tablets', level: 2, isExpandable: false },
          { id: 'electronics-ipad', name: 'iPad', level: 2, isExpandable: false },
          { id: 'electronics-android-tablets', name: 'Android Tablets', level: 2, isExpandable: false },
          { id: 'electronics-tablet-cases', name: 'Tablet Cases', level: 2, isExpandable: false },
          { id: 'electronics-tablet-keyboards', name: 'Tablet Keyboards', level: 2, isExpandable: false },
          { id: 'electronics-stylus-pens', name: 'Stylus Pens', level: 2, isExpandable: false },
          { id: 'electronics-tablet-stands', name: 'Tablet Stands', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-video-games-consoles',
        name: 'Video Games & Consoles',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-gaming-consoles', name: 'Gaming Consoles', level: 2, isExpandable: false },
          { id: 'electronics-playstation', name: 'PlayStation', level: 2, isExpandable: false },
          { id: 'electronics-xbox', name: 'Xbox', level: 2, isExpandable: false },
          { id: 'electronics-nintendo', name: 'Nintendo', level: 2, isExpandable: false },
          { id: 'electronics-video-games', name: 'Video Games', level: 2, isExpandable: false },
          { id: 'electronics-gaming-controllers', name: 'Gaming Controllers', level: 2, isExpandable: false },
          { id: 'electronics-gaming-headsets', name: 'Gaming Headsets', level: 2, isExpandable: false },
          { id: 'electronics-gaming-accessories', name: 'Gaming Accessories', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-vr-ar-accessories',
        name: 'VR, AR & Accessories',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-vr-headsets', name: 'VR Headsets', level: 2, isExpandable: false },
          { id: 'electronics-ar-glasses', name: 'AR Glasses', level: 2, isExpandable: false },
          { id: 'electronics-vr-controllers', name: 'VR Controllers', level: 2, isExpandable: false },
          { id: 'electronics-vr-accessories', name: 'VR Accessories', level: 2, isExpandable: false },
          { id: 'electronics-vr-games', name: 'VR Games', level: 2, isExpandable: false },
          { id: 'electronics-motion-tracking', name: 'Motion Tracking', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-media',
        name: 'Media',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-streaming-devices', name: 'Streaming Devices', level: 2, isExpandable: false },
          { id: 'electronics-smart-tv-boxes', name: 'Smart TV Boxes', level: 2, isExpandable: false },
          { id: 'electronics-media-players', name: 'Media Players', level: 2, isExpandable: false },
          { id: 'electronics-dvd-players', name: 'DVD Players', level: 2, isExpandable: false },
          { id: 'electronics-blu-ray-players', name: 'Blu-ray Players', level: 2, isExpandable: false },
          { id: 'electronics-projectors', name: 'Projectors', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-networking',
        name: 'Networking',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-routers', name: 'Routers', level: 2, isExpandable: false },
          { id: 'electronics-modems', name: 'Modems', level: 2, isExpandable: false },
          { id: 'electronics-wifi-extenders', name: 'WiFi Extenders', level: 2, isExpandable: false },
          { id: 'electronics-network-switches', name: 'Network Switches', level: 2, isExpandable: false },
          { id: 'electronics-ethernet-cables', name: 'Ethernet Cables', level: 2, isExpandable: false },
          { id: 'electronics-network-adapters', name: 'Network Adapters', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-headphones',
        name: 'Headphones',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-wireless-headphones', name: 'Wireless Headphones', level: 2, isExpandable: false },
          { id: 'electronics-wired-headphones', name: 'Wired Headphones', level: 2, isExpandable: false },
          { id: 'electronics-earbuds', name: 'Earbuds', level: 2, isExpandable: false },
          { id: 'electronics-noise-cancelling', name: 'Noise Cancelling', level: 2, isExpandable: false },
          { id: 'electronics-over-ear-headphones', name: 'Over-Ear Headphones', level: 2, isExpandable: false },
          { id: 'electronics-on-ear-headphones', name: 'On-Ear Headphones', level: 2, isExpandable: false },
          { id: 'electronics-sports-headphones', name: 'Sports Headphones', level: 2, isExpandable: false }
        ]
      },
      {
        id: 'electronics-portable-audio-video',
        name: 'Portable Audio & Video',
        level: 1,
        isExpandable: true,
        subcategories: [
          { id: 'electronics-bluetooth-speakers', name: 'Bluetooth Speakers', level: 2, isExpandable: false },
          { id: 'electronics-portable-speakers', name: 'Portable Speakers', level: 2, isExpandable: false },
          { id: 'electronics-mp3-players', name: 'MP3 Players', level: 2, isExpandable: false },
          { id: 'electronics-portable-radios', name: 'Portable Radios', level: 2, isExpandable: false },
          { id: 'electronics-voice-recorders', name: 'Voice Recorders', level: 2, isExpandable: false },
          { id: 'electronics-boomboxes', name: 'Boomboxes', level: 2, isExpandable: false }
        ]
      }
    ]
  }
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