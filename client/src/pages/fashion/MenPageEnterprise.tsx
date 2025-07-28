/**
 * Enterprise Men Fashion Page
 * Domain-driven design implementation for men's fashion category
 * Uses AOP aspects and strategy pattern for maintainable, scalable architecture
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { categoryStrategyFactory } from '@/services/category/CategoryStrategyFactory';
import { MenCategoryStrategy } from '@/services/category/strategies/MenCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';

export default function MenPageEnterprise() {
  const strategy = useMemo(() => {
    return categoryStrategyFactory.createStrategy('fashion', 'men') as MenCategoryStrategy;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'men'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  const { 
    data: rawListings, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'men', searchQuery, sortBy, categorySelection],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'men');
      
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      if (categorySelection.level2) params.append('subsubcategory', categorySelection.level2);
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch men's listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const transformedListings = useMemo(() => {
    const processDataWithAOP = async () => {
      if (!rawListings) {
        console.log('[MenPageEnterprise] No raw listings data available');
        return [];
      }

      try {
        console.log('[MenPageEnterprise] Starting AOP-compliant data validation and transformation');
        
        const validationResult = await listingValidationOrchestrator.validateCategorySpecificData(
          rawListings,
          strategy,
          'MenPageEnterprise',
          'standard'
        );

        if (!validationResult.success) {
          console.error('[MenPageEnterprise] Validation failed:', validationResult.validationReport.errors);
          return [];
        }

        console.log('[MenPageEnterprise] AOP validation completed successfully:', {
          totalItems: validationResult.validationReport.totalItems,
          validItems: validationResult.validationReport.validItems,
          warnings: validationResult.validationReport.warnings.length,
          executionTime: validationResult.performanceMetrics.totalExecutionTime
        });

        return validationResult.data;
      } catch (error) {
        console.error('[MenPageEnterprise] Critical error in AOP data processing:', error);
        return [];
      }
    };

    // Since we can't use async in useMemo, we'll handle this differently
    if (!rawListings || !Array.isArray(rawListings)) {
      console.warn('[MenPageEnterprise] Invalid or missing raw listings data');
      return [];
    }

    try {
      // Use direct aspect access for synchronous validation
      const context = listingValidationOrchestrator.dataIntegrityAspect.createContext(
        'transformedListings',
        'MenPageEnterprise',
        'RawListingData[]'
      );
      
      const integrityResult = listingValidationOrchestrator.dataIntegrityAspect.validateDataIntegrity(rawListings, context);

      if (!integrityResult?.success) {
        console.error('[MenPageEnterprise] Data integrity validation failed');
        return [];
      }

      const transformedResult = strategy.transformListingData(integrityResult.value as RawListingData[]);
      
      if (!Array.isArray(transformedResult)) {
        console.error('[MenPageEnterprise] Strategy transformation returned non-array data');
        return [];
      }

      console.log('[MenPageEnterprise] Data transformation completed successfully:', {
        rawCount: rawListings.length,
        validatedCount: integrityResult.value.length,
        transformedCount: transformedResult.length
      });

      return transformedResult;
    } catch (error) {
      console.error('[MenPageEnterprise] Error in data transformation:', error);
      return [];
    }
  }, [rawListings, strategy]);

  const filteredListings = useMemo(() => {
    if (!Array.isArray(transformedListings)) return [];
    let filtered = transformedListings;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.brand?.toLowerCase().includes(query)
      );
    }
    
    if (categorySelection.level2) {
      filtered = filtered.filter(listing => 
        listing.subcategory === categorySelection.level2 ||
        listing.domainSpecificData?.inferredSubcategory === categorySelection.level2
      );
    }
    
    if (filterCriteria.sizes?.length) {
      filtered = filtered.filter(listing => 
        filterCriteria.sizes!.includes(listing.size || '')
      );
    }
    
    return filtered;
  }, [transformedListings, searchQuery, categorySelection, filterCriteria]);

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Men's Fashion</h1>
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
                    level1: 'men',
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
                    data-testid="input-men-search"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {sortedListings.length} items found
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                data-testid="select-men-sort"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

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
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {listing.price}
                        </span>
                        
                        {listing.domainSpecificData?.occasionType && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            listing.domainSpecificData.occasionType === 'professional'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.domainSpecificData.occasionType}
                          </span>
                        )}
                      </div>
                      
                      {listing.size && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Size: {listing.domainSpecificData?.normalizedSize || listing.size}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && sortedListings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">👔</div>
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