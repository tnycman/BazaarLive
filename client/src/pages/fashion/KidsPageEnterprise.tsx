/**
 * Enterprise Kids Fashion Page
 * Domain-driven design implementation for kids' fashion category
 * Uses AOP aspects and strategy pattern for maintainable, scalable architecture
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { categoryStrategyFactory } from '@/services/category/CategoryStrategyFactory';
import { KidsCategoryStrategy } from '@/services/category/strategies/KidsCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection } from '@/services/category/CategoryDomainTypes';

export default function KidsPageEnterprise() {
  const strategy = useMemo(() => {
    return categoryStrategyFactory.createStrategy('fashion', 'kids') as KidsCategoryStrategy;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'kids'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  const { 
    data: rawListings, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'kids', searchQuery, sortBy, categorySelection],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'kids');
      
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      if (categorySelection.level2) params.append('subsubcategory', categorySelection.level2);
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kids' listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const transformedListings = useMemo(() => {
    if (!rawListings || !Array.isArray(rawListings)) return [];
    try {
      const result = strategy.transformListingData(rawListings);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error transforming listings:', error);
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
        listing.brand?.toLowerCase().includes(query) ||
        listing.domainSpecificData?.characterTheme?.some((theme: string) => 
          theme.toLowerCase().includes(query)
        )
      );
    }
    
    if (categorySelection.level2) {
      filtered = filtered.filter(listing => 
        listing.subcategory === categorySelection.level2 ||
        listing.domainSpecificData?.inferredAgeGroup === categorySelection.level2
      );
    }
    
    return filtered;
  }, [transformedListings, searchQuery, categorySelection]);

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Kids' Fashion</h1>
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
                    level1: 'kids',
                    level2: subcategory.id
                  })}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    categorySelection.level2 === subcategory.id
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
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
                    data-testid="input-kids-search"
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
                data-testid="select-kids-sort"
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
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {listing.price}
                        </span>
                        
                        {listing.domainSpecificData?.genderClassification && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            listing.domainSpecificData.genderClassification === 'boys'
                              ? 'bg-blue-100 text-blue-800'
                              : listing.domainSpecificData.genderClassification === 'girls'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.domainSpecificData.genderClassification}
                          </span>
                        )}
                      </div>
                      
                      {listing.size && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Size: {listing.size} ({listing.domainSpecificData?.inferredAgeGroup})
                        </div>
                      )}
                      
                      {listing.domainSpecificData?.characterTheme?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {listing.domainSpecificData.characterTheme.slice(0, 2).map((theme: string) => (
                            <span key={theme} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && sortedListings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">👶</div>
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