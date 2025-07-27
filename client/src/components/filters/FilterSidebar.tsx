import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  SearchIcon,
  XIcon,
  SlidersIcon
} from 'lucide-react';
import { FILTER_OPTIONS, FILTER_UI_CONFIG, FILTER_MESSAGES } from '@/services/filtering/FilterConstants';
import { filterService, type FilterCriteriaType } from '@/services/filtering/FilterService';

interface FilterSidebarProps {
  onFilterChange: (criteria: FilterCriteriaType) => void;
  appliedFiltersCount: number;
  isLoading?: boolean;
}

interface CollapsibleState {
  [key: string]: boolean;
}

export function FilterSidebar({ onFilterChange, appliedFiltersCount, isLoading = false }: FilterSidebarProps) {
  const [criteria, setCriteria] = useState<FilterCriteriaType>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsibleState>(() => {
    const initialState: CollapsibleState = {};
    FILTER_UI_CONFIG.collapsibleSections.forEach(section => {
      initialState[section] = !FILTER_UI_CONFIG.defaultCollapsed.includes(section);
    });
    return initialState;
  });
  
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [customPriceRange, setCustomPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    onFilterChange(criteria);
  }, [criteria, onFilterChange]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateCriteria = (updates: Partial<FilterCriteriaType>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayFilter = (key: keyof FilterCriteriaType, value: string) => {
    const current = (criteria[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    
    updateCriteria({ [key]: updated.length > 0 ? updated : undefined });
  };

  const clearAllFilters = () => {
    setCriteria({});
    setBrandSearchQuery('');
    setCustomPriceRange({ min: '', max: '' });
  };

  const applyCustomPriceRange = () => {
    const min = customPriceRange.min ? parseFloat(customPriceRange.min) : undefined;
    const max = customPriceRange.max ? parseFloat(customPriceRange.max) : undefined;
    
    if (min !== undefined || max !== undefined) {
      updateCriteria({ priceRange: { min, max } });
    }
  };

  const filteredBrands = FILTER_OPTIONS.popularBrands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  const renderSectionHeader = (title: string, section: string, count?: number) => (
    <CollapsibleTrigger
      className="flex items-center justify-between w-full py-2 text-left hover:text-gray-600 transition-colors"
      onClick={() => toggleSection(section)}
      data-testid={`toggle-${section}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-gray-900 dark:text-white">{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
      </div>
      {collapsedSections[section] ? (
        <ChevronUpIcon className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      )}
    </CollapsibleTrigger>
  );

  const renderCheckboxList = (items: any[], filterKey: keyof FilterCriteriaType, showSearch = false) => {
    const selectedItems = (criteria[filterKey] as string[]) || [];
    
    return (
      <div className="space-y-2">
        {showSearch && (
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={FILTER_MESSAGES.filterHints.brandSearch}
              value={brandSearchQuery}
              onChange={(e) => setBrandSearchQuery(e.target.value)}
              className="pl-10 h-8 text-sm"
              data-testid="input-brand-search"
            />
          </div>
        )}
        
        <div className="max-h-48 overflow-y-auto space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${filterKey}-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => toggleArrayFilter(filterKey, item.id)}
                className="h-4 w-4"
                data-testid={`checkbox-${filterKey}-${item.id}`}
              />
              <label
                htmlFor={`${filterKey}-${item.id}`}
                className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer flex items-center justify-between"
              >
                <span>{item.name}</span>
                {item.count && (
                  <span className="text-xs text-gray-500">({item.count})</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderColorPicker = () => {
    const selectedColors = (criteria.colors as string[]) || [];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-colors"
            checked={selectedColors.length === 0}
            onCheckedChange={() => updateCriteria({ colors: [] })}
            className="h-4 w-4"
            data-testid="checkbox-all-colors"
          />
          <label htmlFor="all-colors" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            All Colors
          </label>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {FILTER_OPTIONS.colors.slice(1).map((color) => (
            <button
              key={color.id}
              onClick={() => toggleArrayFilter('colors', color.id)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.id)
                  ? 'border-gray-900 ring-2 ring-gray-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              data-testid={`color-${color.id}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPriceRange = () => {
    const selectedRange = criteria.priceRange;
    
    return (
      <div className="space-y-3">
        {/* Predefined Price Ranges */}
        <div className="space-y-1">
          {FILTER_OPTIONS.priceRanges.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${range.id}`}
                checked={
                  range.id === 'all_prices' 
                    ? !selectedRange
                    : selectedRange?.min === range.min && selectedRange?.max === range.max
                }
                onCheckedChange={() => {
                  if (range.id === 'all_prices') {
                    updateCriteria({ priceRange: undefined });
                  } else {
                    updateCriteria({ 
                      priceRange: { min: range.min, max: range.max }
                    });
                  }
                }}
                className="h-4 w-4"
                data-testid={`checkbox-price-${range.id}`}
              />
              <label
                htmlFor={`price-${range.id}`}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {range.name}
              </label>
            </div>
          ))}
        </div>
        
        <Separator />
        
        {/* Custom Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom</label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={customPriceRange.min}
              onChange={(e) => setCustomPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-price-min"
            />
            <span className="text-sm text-gray-500">to</span>
            <Input
              type="number"
              placeholder="Max Price"
              value={customPriceRange.max}
              onChange={(e) => setCustomPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="h-8 text-sm"
              data-testid="input-price-max"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={applyCustomPriceRange}
            className="w-full h-8 text-sm"
            data-testid="button-apply-custom-price"
          >
            Apply
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto relative z-50">
      <div className="p-4 space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersIcon className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Filters</h2>
          </div>
          {appliedFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {appliedFiltersCount}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
                data-testid="button-clear-filters"
              >
                <XIcon className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Categories Section - Poshmark Style */}
        <Collapsible open={collapsedSections.categories}>
          {renderSectionHeader('CATEGORIES', 'categories')}
          <CollapsibleContent className="pt-2">
            {/* Women Expandable Section */}
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left group">
                <span className="font-medium text-purple-600 dark:text-purple-400 text-sm">Women</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 group-data-[state=open]:rotate-180 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-2 space-y-1 mt-1">
                {FILTER_OPTIONS.categories.women.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`categories-${category.id}`}
                      checked={(criteria.categories as string[])?.includes(category.id) || false}
                      onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                      className="h-4 w-4"
                      data-testid={`checkbox-categories-${category.id}`}
                    />
                    <label
                      htmlFor={`categories-${category.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300 flex-1 cursor-pointer flex items-center justify-between hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <span>{category.name}</span>
                      {category.count && (
                        <span className="text-xs text-gray-500">{category.count.toLocaleString()}</span>
                      )}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
            
            {/* Other Category Groups */}
            <div className="mt-3 space-y-1">
              {['Men', 'Kids', 'Home', 'Pets', 'Electronics'].map((categoryGroup) => (
                <div key={categoryGroup} className="py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {categoryGroup}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Brands Section */}
        <Collapsible open={collapsedSections.brands}>
          {renderSectionHeader('BRANDS', 'brands')}
          <CollapsibleContent className="pt-2">
            {renderCheckboxList(filteredBrands, 'brands', true)}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Size Section */}
        <Collapsible open={collapsedSections.size}>
          {renderSectionHeader('SIZE', 'size')}
          <CollapsibleContent className="pt-2">
            <div className="space-y-3">
              {renderCheckboxList(FILTER_OPTIONS.sizes.all, 'sizes')}
              <div className="text-xs text-gray-500 italic">
                {FILTER_MESSAGES.filterHints.mySize}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {FILTER_OPTIONS.sizes.standard.map((size) => (
                  <Button
                    key={size.id}
                    size="sm"
                    variant={(criteria.sizes as string[])?.includes(size.id) ? "default" : "outline"}
                    onClick={() => toggleArrayFilter('sizes', size.id)}
                    className="h-8 text-xs"
                    data-testid={`button-size-${size.id}`}
                  >
                    {size.name}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Color Section */}
        <Collapsible open={collapsedSections.color}>
          {renderSectionHeader('COLOR', 'color')}
          <CollapsibleContent className="pt-2">
            {renderColorPicker()}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Price Section */}
        <Collapsible open={collapsedSections.price}>
          {renderSectionHeader('PRICE', 'price')}
          <CollapsibleContent className="pt-2">
            {renderPriceRange()}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Shipping Section */}
        <Collapsible open={collapsedSections.shipping}>
          {renderSectionHeader('SHIPPING', 'shipping')}
          <CollapsibleContent className="pt-2">
            {renderCheckboxList(FILTER_OPTIONS.shipping, 'shipping')}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Condition Section */}
        <Collapsible open={collapsedSections.condition}>
          {renderSectionHeader('CONDITION', 'condition')}
          <CollapsibleContent className="pt-2">
            {renderCheckboxList(FILTER_OPTIONS.conditions, 'condition')}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Availability Section */}
        <Collapsible open={collapsedSections.availability}>
          {renderSectionHeader('AVAILABILITY', 'availability')}
          <CollapsibleContent className="pt-2">
            {renderCheckboxList(FILTER_OPTIONS.availability, 'availability')}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Type Section */}
        <Collapsible open={collapsedSections.type}>
          {renderSectionHeader('TYPE', 'type')}
          <CollapsibleContent className="pt-2">
            {renderCheckboxList(FILTER_OPTIONS.type, 'type')}
          </CollapsibleContent>
        </Collapsible>

        <Separator />
        
        {/* More Ways to Shop */}
        <div className="pt-4">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">MORE WAYS TO SHOP</h3>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-sm text-gray-600">
              Shop all Brands →
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-sm text-gray-600">
              Today's trends →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}