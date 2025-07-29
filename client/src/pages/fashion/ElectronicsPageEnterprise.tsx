/**
 * Enterprise Electronics Page
 * Domain-driven design implementation for electronics category
 * Uses AOP aspects and strategy pattern for maintainable, scalable architecture
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { categoryStrategyFactory } from '@/services/category/CategoryStrategyFactory';
import { ElectronicsCategoryStrategy } from '@/services/category/strategies/ElectronicsCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';
import { DomainSafetyService } from '@/services/domain/DomainSafetyService';
import { DataValidationAspect } from '@/aspects/DataValidationAspect';

export default function ElectronicsPageEnterprise() {
  const strategy = useMemo(() => {
    return categoryStrategyFactory.createStrategy('fashion', 'electronics') as ElectronicsCategoryStrategy;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'electronics'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Enterprise data fetching with proper error handling
  const { 
    data: rawListings, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'electronics', searchQuery, sortBy, categorySelection],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'electronics');
      
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
        throw new Error(`Failed to fetch electronics listings: ${response.statusText}`);
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
        console.warn('[ElectronicsPageEnterprise] Strategy or transformListingData method unavailable');
        return rawListings; // Return raw data as fallback
      }
      
      const transformed = strategy.transformListingData(rawListings);
      return Array.isArray(transformed) ? transformed : [];
    } catch (error) {
      console.error('[ElectronicsPageEnterprise] Data transformation error:', error);
      return rawListings; // Return raw data as fallback
    }
  }, [rawListings, strategy]);

  // Apply enterprise filtering with AOP validation
  const filteredListings = useMemo(() => {
    if (!transformedListings || !Array.isArray(transformedListings)) {
      return [];
    }
    
    let filtered = transformedListings;
    
    // Apply search query filtering with enterprise safety
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => {
        const titleMatch = DomainSafetyService.safeStringIncludes(listing.title, query);
        const descMatch = DomainSafetyService.safeStringIncludes(listing.description, query);
        const brandMatch = DomainSafetyService.safeStringIncludes(listing.brand, query);
        
        return titleMatch || descMatch || brandMatch;
      });
    }
    
    // Apply category selection filtering with AOP validation
    if (categorySelection.level2) {
      filtered = filtered.filter(listing => 
        listing.subcategory === categorySelection.level2 ||
        listing.domainSpecificData?.subcategory === categorySelection.level2
      );
    }
    
    // Apply additional filter criteria with AOP validation
    if (filterCriteria?.brands?.length && Array.isArray(filterCriteria.brands)) {
      filtered = filtered.filter(listing => 
        filterCriteria.brands!.includes(listing.brand || '')
      );
    }
    
    if (filterCriteria.priceRange) {
      const { min, max } = filterCriteria.priceRange;
      filtered = filtered.filter(listing => {
        const priceStr = DomainSafetyService.safePropertyAccess(listing, 'price', '0');
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        return (!min || price >= min) && (!max || price <= max);
      });
    }
    
    if (filterCriteria?.condition?.length && Array.isArray(filterCriteria.condition)) {
      filtered = filtered.filter(listing => 
        filterCriteria.condition!.includes(listing.condition || 'used')
      );
    }
    
    return filtered;
  }, [transformedListings, searchQuery, categorySelection, filterCriteria]);

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
      default:
        return sorted;
    }
  }, [filteredListings, sortBy]);

  // Enterprise callback handlers
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  const handleCategorySelection = useCallback((selection: CategorySelection) => {
    const validationResult = strategy.validateSelection(selection);
    if (!validationResult.isValid) {
      console.error('Invalid category selection:', validationResult.errors);
      return;
    }
    setCategorySelection(selection);
  }, [strategy]);

  const domainMetadata = strategy.domain.metadata;

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Electronics</h1>
          <p className="text-red-500 mb-4">{(error as Error).message}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded">
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
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {domainMetadata.title}
            </h2>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Categories
              </h3>
              
              {strategy.domain.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleCategorySelection({
                    level1: 'electronics',
                    level2: subcategory.id
                  })}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    categorySelection.level2 === subcategory.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
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
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
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
                    data-testid="input-search-electronics"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    data-testid="select-sort-electronics"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {sortedListings.length} items
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading electronics...</span>
              </div>
            ) : sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedListings.map((listing, index) => (
                  <div
                    key={listing.id || index}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    data-testid={`card-electronics-${listing.id || index}`}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl">📱</div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                        {listing.title || 'Electronics Item'}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                        {listing.description || 'Electronics description'}
                      </p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${listing.price || '0'}
                        </span>
                        
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {listing.condition || 'used'}
                        </span>
                      </div>
                      
                      {listing.brand && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Brand: {listing.brand}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Electronics Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {searchQuery 
                    ? `We couldn't find any electronics matching "${searchQuery}". Try adjusting your search terms.`
                    : 'No electronics are currently available. Check back later for new listings.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}