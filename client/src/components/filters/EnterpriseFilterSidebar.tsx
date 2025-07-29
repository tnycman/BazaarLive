/**
 * Enterprise Filter Sidebar Component
 * AOP-compliant implementation of Poshmark-style filtering system
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { ChevronDown, ChevronUp, Search, Minus, Plus } from 'lucide-react';
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

interface FilterState {
  readonly selectedCategories: readonly string[];
  readonly selectedBrands: readonly string[];
  readonly selectedSizes: readonly string[];
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
      { id: 'bags', name: 'Bags', level: 1, isExpandable: false },
      { id: 'dresses', name: 'Dresses', level: 1, isExpandable: false },
      { id: 'intimates-sleepwear', name: 'Intimates & Sleepwear', level: 1, isExpandable: false },
      { id: 'jackets-coats', name: 'Jackets & Coats', level: 1, isExpandable: false },
      { id: 'jeans', name: 'Jeans', level: 1, isExpandable: false },
      { id: 'jewelry', name: 'Jewelry', level: 1, isExpandable: false },
      { id: 'makeup', name: 'Makeup', level: 1, isExpandable: false },
      { id: 'pants-jumpsuits', name: 'Pants & Jumpsuits', level: 1, isExpandable: false },
      { id: 'shoes', name: 'Shoes', level: 1, isExpandable: false },
      { id: 'shorts', name: 'Shorts', level: 1, isExpandable: false },
      { id: 'skirts', name: 'Skirts', level: 1, isExpandable: false },
      { id: 'sweaters', name: 'Sweaters', level: 1, isExpandable: false },
      { id: 'swim', name: 'Swim', level: 1, isExpandable: false },
      { id: 'tops', name: 'Tops', level: 1, isExpandable: false },
      { id: 'skincare', name: 'Skincare', level: 1, isExpandable: false },
      { id: 'hair', name: 'Hair', level: 1, isExpandable: false },
      { id: 'bath-body', name: 'Bath & Body', level: 1, isExpandable: false },
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

const TYPE_DATA: readonly FilterType[] = [
  { id: 'all-types', name: 'All Types', isSelected: true },
  { id: 'closet', name: 'Closet', isSelected: false },
  { id: 'boutique', name: 'Boutique', isSelected: false }
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
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-types'],
    brandSearchQuery: '',
    expandedSections: ['categories', 'women', 'accessories']
  });

  const [filteredBrands, setFilteredBrands] = useState<readonly FilterBrand[]>(BRANDS_DATA);

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
    availability: {
      id: 'availability',
      title: 'AVAILABILITY',
      isCollapsible: true,
      defaultExpanded: false
    },
    type: {
      id: 'type',
      title: 'TYPE',
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
  }, []);

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

    return (
      <div key={category.id} className="w-full" data-testid={`category-item-${category.id}`}>
        <div 
          className={`flex items-center py-1 pl-${indentLevel > 0 ? `[${indentLevel}px]` : '0'} pr-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150`}
          onClick={() => {
            handleCategoryToggle(category.id);
            if (hasSubcategories) {
              handleSectionToggle(category.id);
            }
          }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasSubcategories && (
              <button
                className="flex-shrink-0 p-1 mr-1 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSectionToggle(category.id);
                }}
                data-testid={`category-toggle-${category.id}`}
              >
                {isExpanded ? (
                  <Minus className="w-3 h-3 text-gray-600" />
                ) : (
                  <Plus className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}
            <span 
              className={`text-sm truncate ${
                isSelected 
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
  }, [filterState.selectedCategories, filterState.expandedSections, handleCategoryToggle, handleSectionToggle]);

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

          {/* Type Section */}
          {renderCollapsibleSection('type', (
            <div className="space-y-2">
              {TYPE_DATA.map(type => (
                <div key={type.id} className="flex items-center space-x-2" data-testid={`type-item-${type.id}`}>
                  <Checkbox
                    id={type.id}
                    checked={filterState.selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    data-testid={`type-checkbox-${type.id}`}
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
export type { FilterState, FilterSidebarProps, FilterCategory, FilterBrand };
export { FilterStateSchema, FilterSidebarPropsSchema };