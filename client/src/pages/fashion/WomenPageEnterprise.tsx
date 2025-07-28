/**
 * Enterprise Women Fashion Page
 * Domain-driven design implementation with proper separation of concerns
 * Uses AOP aspects and strategy pattern for maintainable, scalable architecture
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { categoryStrategyFactory } from '@/services/category/CategoryStrategyFactory';
import { WomenCategoryStrategy } from '@/services/category/strategies/WomenCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection } from '@/services/category/CategoryDomainTypes';
import { DomainSafetyService } from '@/services/domain/DomainSafetyService';
import { DataValidationAspect } from '@/aspects/DataValidationAspect';

// Enterprise page component with proper domain separation
export default function WomenPageEnterprise() {
  // Early return for safety during development
  if (typeof window === 'undefined') return null;
  
  // AOP aspect initialization
  const dataValidationAspect = useMemo(() => DataValidationAspect.getInstance(), []);
  
  // Domain strategy initialization with error handling
  const strategy = useMemo(() => {
    try {
      const strategyInstance = categoryStrategyFactory.createStrategy('fashion', 'women') as WomenCategoryStrategy;
      if (!strategyInstance) {
        console.error('[WomenPageEnterprise] Failed to create strategy instance');
        throw new Error('Strategy creation failed');
      }
      return strategyInstance;
    } catch (error) {
      console.error('[WomenPageEnterprise] Strategy initialization error:', error);
      // Return a minimal fallback strategy to prevent crashes
      return {
        transformListingData: (data: any[]) => Array.isArray(data) ? data : [],
        validateSelection: () => ({ isValid: true, errors: [] }),
        getFilterConfiguration: () => ({
          availableFilters: [],
          defaultFilters: {},
          filterValidationRules: {}
        }),
        getAnalyticsConfiguration: () => ({ events: [], metrics: [] }),
        normalizeSizeForWomen: (size: string) => size,
        inferSubcategory: (listing: any) => 'general',
        classifyStyle: (listing: any) => 'casual',
        domain: { 
          metadata: { 
            gradient: 'from-pink-50 to-rose-100',
            title: 'Women\'s Fashion',
            description: 'Discover women\'s fashion',
            placeholder: 'Search women\'s fashion...'
          },
          vertical: 'fashion',
          category: 'women',
          subcategories: [],
          sizeChart: { sizes: ['XS', 'S', 'M', 'L', 'XL'] }
        }
      } as unknown as WomenCategoryStrategy;
    }
  }, []);

  // Component state with type safety
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'women'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Enterprise data fetching with proper error handling
  const { 
    data: rawListings, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'women', searchQuery, sortBy, categorySelection],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'women');
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery);
      }
      
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      
      if (categorySelection.level2) {
        params.append('subsubcategory', categorySelection.level2);
      }
      
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch women's listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Transform raw listings using domain strategy with error handling
  const transformedListings = useMemo(() => {
    if (!rawListings || !Array.isArray(rawListings)) {
      return [];
    }
    
    try {
      if (!strategy || typeof strategy.transformListingData !== 'function') {
        console.warn('[WomenPageEnterprise] Strategy or transformListingData method unavailable');
        return rawListings; // Return raw data as fallback
      }
      
      const transformed = strategy.transformListingData(rawListings);
      return Array.isArray(transformed) ? transformed : [];
    } catch (error) {
      console.error('[WomenPageEnterprise] Data transformation error:', error);
      return rawListings; // Return raw data as fallback
    }
  }, [rawListings, strategy]);

  // Apply enterprise filtering with AOP validation
  const filteredListings = useMemo(() => {
    if (!transformedListings || !Array.isArray(transformedListings)) {
      return [];
    }
    
    const context = dataValidationAspect.createContext('WomenPageEnterprise', 'filteredListings');
    
    return dataValidationAspect.validateFilteringOperation(
      transformedListings,
      (listing) => {
        // Apply search query filtering with enterprise safety
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          
          // AOP-validated string operations
          const titleMatch = DomainSafetyService.safeStringIncludes(listing.title, query);
          const descMatch = DomainSafetyService.safeStringIncludes(listing.description, query);
          const brandMatch = DomainSafetyService.safeStringIncludes(listing.brand, query);
          
          // AOP-validated style classification access
          const styleMatch = DomainSafetyService.safeStringIncludes(
            (listing as any).style || '',
            query
          );
          
          if (!(titleMatch || descMatch || brandMatch || styleMatch)) {
            return false;
          }
        }
        
        // Apply category selection filtering with AOP validation
        if (categorySelection.level2) {
          const subcategoryMatch = listing.subcategory === categorySelection.level2;
          const inferredMatch = DomainSafetyService.safePropertyAccess(
            listing,
            'inferredSubcategory',
            ''
          ) === categorySelection.level2;
          
          if (!(subcategoryMatch || inferredMatch)) {
            return false;
          }
        }
        
        // Apply additional filter criteria with AOP validation
        if (filterCriteria?.sizes?.length && Array.isArray(filterCriteria.sizes)) {
          const listingSize = DomainSafetyService.safePropertyAccess(listing, 'size', '');
          if (listingSize && filterCriteria.sizes.includes && !filterCriteria.sizes.includes(listingSize)) {
            return false;
          }
        }
        
        if (filterCriteria?.brands?.length && Array.isArray(filterCriteria.brands)) {
          const listingBrand = DomainSafetyService.safePropertyAccess(listing, 'brand', '');
          if (listingBrand && filterCriteria.brands.includes && !filterCriteria.brands.includes(listingBrand)) {
            return false;
          }
        }
        
        if (filterCriteria.priceRange) {
          const { min, max } = filterCriteria.priceRange;
          const priceStr = DomainSafetyService.safePropertyAccess(listing, 'price', '0');
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
          
          if ((min && price < min) || (max && price > max)) {
            return false;
          }
        }
        
        if (filterCriteria?.condition?.length && Array.isArray(filterCriteria.condition)) {
          const listingCondition = DomainSafetyService.safePropertyAccess(listing, 'condition', 'good');
          if (listingCondition && filterCriteria.condition.includes && !filterCriteria.condition.includes(listingCondition as any)) {
            return false;
          }
        }
        
        return true;
      },
      context
    );
  }, [transformedListings, searchQuery, categorySelection, filterCriteria, dataValidationAspect]);

  // Sort filtered listings with AOP validation
  const sortedListings = useMemo(() => {
    if (!Array.isArray(filteredListings)) return [];
    
    const sorted = [...filteredListings];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.metadata?.createdAt || 0).getTime() - 
          new Date(a.metadata?.createdAt || 0).getTime()
        );
      case 'price_low':
        return sorted.sort((a, b) => 
          parseFloat(a.price.replace(/[^0-9.]/g, '')) - 
          parseFloat(b.price.replace(/[^0-9.]/g, ''))
        );
      case 'price_high':
        return sorted.sort((a, b) => 
          parseFloat(b.price.replace(/[^0-9.]/g, '')) - 
          parseFloat(a.price.replace(/[^0-9.]/g, ''))
        );
      case 'most_liked':
        return sorted.sort((a, b) => 
          (b.metadata?.likesCount || 0) - (a.metadata?.likesCount || 0)
        );
      default:
        return sorted;
    }
  }, [filteredListings, sortBy]);

  // Event handlers with enterprise validation
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate search query length
    if (searchQuery.length > 100) {
      console.warn('Search query too long, truncating');
      setSearchQuery(searchQuery.substring(0, 100));
    }
  }, [searchQuery]);

  const handleCategorySelection = useCallback((selection: CategorySelection) => {
    // Validate selection using domain strategy
    const validationResult = strategy.validateSelection(selection);
    
    if (!validationResult.isValid) {
      console.error('Invalid category selection:', validationResult.errors);
      return;
    }
    
    if (validationResult.warnings.length > 0) {
      console.warn('Category selection warnings:', validationResult.warnings);
    }
    
    setCategorySelection(selection);
  }, [strategy]);

  const handleFilterChange = useCallback((newFilters: FilterCriteriaType) => {
    // Validate filters using domain strategy
    const filterConfig = strategy.getFilterConfiguration();
    
    const validatedFilters: FilterCriteriaType = {};
    
    // Validate each filter against configuration rules
    for (const [key, value] of Object.entries(newFilters)) {
      const rule = filterConfig.filterValidationRules[key];
      
      if (rule && !rule.validator(value)) {
        console.warn(`Invalid filter ${key}:`, rule.errorMessage);
        continue;
      }
      
      (validatedFilters as any)[key] = value;
    }
    
    setFilterCriteria(validatedFilters);
  }, [strategy]);

  const handleSortChange = useCallback((newSort: string) => {
    const validSorts = ['newest', 'price_low', 'price_high', 'most_liked', 'trending'];
    
    if (validSorts && validSorts.includes && !validSorts.includes(newSort)) {
      console.warn('Invalid sort option:', newSort);
      return;
    }
    
    setSortBy(newSort);
  }, []);

  // Get domain metadata with safe access
  const domainMetadata = strategy?.domain?.metadata || { 
    gradient: 'from-pink-50 to-rose-100',
    title: 'Women\'s Fashion',
    description: 'Discover women\'s fashion',
    placeholder: 'Search women\'s fashion...'
  };
  const filterConfig = strategy?.getFilterConfiguration ? strategy.getFilterConfiguration() : {
    availableFilters: [],
    defaultFilters: {},
    filterValidationRules: {}
  };

  // Analytics tracking
  useEffect(() => {
    const analyticsConfig = strategy.getAnalyticsConfiguration();
    
    // Track page view
    console.log('Analytics: Women category page view', {
      domain: strategy.domain.category,
      timestamp: new Date().toISOString()
    });
  }, [strategy]);

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Women's Fashion</h1>
          <p className="text-red-500 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${domainMetadata.gradient}`}>
      <Header />
      <Navigation />
      
      <div className="flex">
        {/* Enterprise Hierarchical Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {domainMetadata.title}
            </h2>
            
            {/* Category Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Categories
              </h3>
              
              {strategy.domain.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleCategorySelection({
                    level1: 'women',
                    level2: subcategory.id
                  })}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    categorySelection.level2 === subcategory.id
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  data-testid={`button-category-${subcategory.id}`}
                >
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subcategory.description}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Filter Configuration */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Filters
              </h3>
              
              {/* Size Filter */}
              {filterConfig?.availableFilters?.includes && filterConfig.availableFilters.includes('size') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {strategy.domain.sizeChart.sizes.slice(0, 12).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          const currentSizes = filterCriteria.sizes || [];
                          const newSizes = currentSizes?.includes && currentSizes.includes(size)
                            ? currentSizes.filter(s => s !== size)
                            : [...currentSizes, size];
                          
                          handleFilterChange({
                            ...filterCriteria,
                            sizes: newSizes.length > 0 ? newSizes : undefined
                          });
                        }}
                        className={`p-2 text-xs border rounded ${
                          filterCriteria.sizes?.includes && filterCriteria.sizes.includes(size)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }`}
                        data-testid={`button-size-${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Search Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {domainMetadata.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {domainMetadata.description}
              </p>
              
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={domainMetadata.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    data-testid="input-women-search"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {sortedListings.length} items found
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                data-testid="select-women-sort"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="most_liked">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    data-testid={`card-listing-${listing.id}`}
                  >
                    {listing.images && listing.images[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {listing.price}
                        </span>
                        
                        {(listing as any).priceTier && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            (listing as any).priceTier === 'luxury'
                              ? 'bg-gold-100 text-gold-800'
                              : (listing as any).priceTier === 'premium'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(listing as any).priceTier}
                          </span>
                        )}
                      </div>
                      
                      {listing.size && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Size: {(listing as any).normalizedSize || listing.size}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && sortedListings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">👗</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No items found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}