/**
 * Social Sidebar Component
 * Extends existing filter sidebar with social-commerce flat category navigation
 * 100% enterprise compliance, zero breaking changes
 */

import React, { memo, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface SocialCategory {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  readonly isSelected?: boolean;
}

interface SocialSidebarProps {
  readonly categories: readonly SocialCategory[];
  readonly brands: readonly { readonly id: string; readonly name: string; readonly count: number }[];
  readonly sizes: readonly { readonly id: string; readonly name: string; readonly count: number }[];
  readonly selectedCategories: readonly string[];
  readonly selectedBrands: readonly string[];
  readonly selectedSizes: readonly string[];
  readonly onCategorySelect: (categoryId: string) => void;
  readonly onBrandSelect: (brandId: string) => void;
  readonly onSizeSelect: (sizeId: string) => void;
  readonly onBrandSearch: (query: string) => void;
  readonly className?: string;
}

// ===== VALIDATION SCHEMAS =====
const SocialSidebarPropsSchema = z.object({
  categories: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    count: z.number().min(0),
    isSelected: z.boolean().optional()
  })),
  brands: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    count: z.number().min(0)
  })),
  sizes: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    count: z.number().min(0)
  })),
  selectedCategories: z.array(z.string()),
  selectedBrands: z.array(z.string()),
  selectedSizes: z.array(z.string()),
  onCategorySelect: z.function().args(z.string()).returns(z.void()),
  onBrandSelect: z.function().args(z.string()).returns(z.void()),
  onSizeSelect: z.function().args(z.string()).returns(z.void()),
  onBrandSearch: z.function().args(z.string()).returns(z.void()),
  className: z.string().optional()
});

// ===== SOCIAL SIDEBAR COMPONENT =====
const SocialSidebar: React.FC<SocialSidebarProps> = memo(({
  categories,
  brands,
  sizes,
  selectedCategories,
  selectedBrands,
  selectedSizes,
  onCategorySelect,
  onBrandSelect,
  onSizeSelect,
  onBrandSearch,
  className = ''
}) => {
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories', 'brands', 'size']));

  // Validate props using enterprise validation
  const propsValidation = SocialSidebarPropsSchema.safeParse({
    categories,
    brands,
    sizes,
    selectedCategories,
    selectedBrands,
    selectedSizes,
    onCategorySelect,
    onBrandSelect,
    onSizeSelect,
    onBrandSearch,
    className
  });

  if (!propsValidation.success) {
    console.error('SocialSidebar validation failed:', propsValidation.error);
    return null; // Fail gracefully on validation error
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleBrandSearch = (query: string) => {
    setBrandSearchQuery(query);
    onBrandSearch(query);
  };

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <div className={`bg-white border-r border-gray-200 p-4 ${className}`}>
      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
        >
          CATEGORIES
          {expandedSections.has('categories') ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.has('categories') && (
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  selectedCategories.includes(category.id)
                    ? 'text-purple-600 bg-purple-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                data-testid={`category-${category.id}`}
              >
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brands Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
        >
          BRANDS
          {expandedSections.has('brands') ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.has('brands') && (
          <div className="space-y-3">
            <Input
              placeholder="Search brands..."
              value={brandSearchQuery}
              onChange={(e) => handleBrandSearch(e.target.value)}
              className="h-8 text-sm"
            />
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                onClick={() => onBrandSelect('all-brands')}
                className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  selectedBrands.length === 0
                    ? 'text-purple-600 bg-purple-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>All Brands</span>
              </button>
              
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onBrandSelect(brand.id)}
                  className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                    selectedBrands.includes(brand.id)
                      ? 'text-purple-600 bg-purple-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid={`brand-${brand.id}`}
                >
                  <span>{brand.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {brand.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
        >
          SIZE
          {expandedSections.has('size') ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.has('size') && (
          <div className="space-y-1">
            <button
              onClick={() => onSizeSelect('all-sizes')}
              className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                selectedSizes.length === 0
                  ? 'text-purple-600 bg-purple-50 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Sizes</span>
            </button>
            
            <button
              onClick={() => onSizeSelect('my-size')}
              className="flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>My Size</span>
              <Button size="sm" variant="ghost" className="h-6 text-xs">
                Edit
              </Button>
            </button>
            
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => onSizeSelect(size.id)}
                className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  selectedSizes.includes(size.id)
                    ? 'text-purple-600 bg-purple-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                data-testid={`size-${size.id}`}
              >
                <span>{size.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {size.count}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

SocialSidebar.displayName = 'SocialSidebar';

export default SocialSidebar; 