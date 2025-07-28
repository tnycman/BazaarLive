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
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';

export default function ElectronicsPageEnterprise() {
  const strategy = useMemo(() => {
    return categoryStrategyFactory.createStrategy('fashion', 'electronics');
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'electronics'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Fetch raw listings data with proper error handling
  const { data: rawListings = [], isLoading, error } = useQuery({
    queryKey: ['/api/listings', { category: 'fashion', subcategory: 'electronics' }],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Transform and filter listings
  const processedListings = useMemo(() => {
    if (!rawListings || !Array.isArray(rawListings)) {
      console.warn('[ElectronicsPageEnterprise] Invalid or missing raw listings data');
      return [];
    }

    try {
      let filtered = rawListings;

      // Apply search filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((listing: any) => {
          if (!listing) return false;
          const title = (listing.title || '').toLowerCase();
          const description = (listing.description || '').toLowerCase();
          const brand = (listing.brand || '').toLowerCase();
          return title.includes(query) || description.includes(query) || brand.includes(query);
        });
      }

      // Apply sorting
      if (sortBy === 'newest') {
        filtered.sort((a: any, b: any) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      } else if (sortBy === 'oldest') {
        filtered.sort((a: any, b: any) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      } else if (sortBy === 'price_low') {
        filtered.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
      } else if (sortBy === 'price_high') {
        filtered.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
      }

      return filtered;
    } catch (error) {
      console.error('[ElectronicsPageEnterprise] Error in listing processing:', error);
      return rawListings;
    }
  }, [rawListings, searchQuery, sortBy]);

  // Enterprise search handler with debouncing
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Category selection handler
  const handleCategorySelection = useCallback((selection: CategorySelection) => {
    setCategorySelection(selection);
  }, []);

  // Filter criteria handler
  const handleFilterChange = useCallback((criteria: FilterCriteriaType) => {
    setFilterCriteria(criteria);
  }, []);

  // Sort handler
  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Electronics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load electronics listings. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Electronics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover the latest in technology, gadgets, and electronic devices
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading electronics...</span>
          </div>
        )}

        {/* Content Area */}
        {!isLoading && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search electronics..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  data-testid="search-electronics"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                  data-testid="sort-electronics"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {processedListings.length === 0 ? (
                searchQuery ? `No electronics found for "${searchQuery}"` : 'No electronics available'
              ) : (
                `Showing ${processedListings.length} electronics ${searchQuery ? `for "${searchQuery}"` : ''}`
              )}
            </div>

            {/* Listings Grid */}
            {processedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedListings.map((listing: CategorySpecificListingData, index: number) => (
                  <div
                    key={listing.id || index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    data-testid={`electronics-item-${listing.id || index}`}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Electronics Image</span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                      {listing.title || 'Electronics Item'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                      {listing.description || 'Electronics description'}
                    </p>
                    {listing.price && (
                      <p className="text-purple-600 font-semibold text-sm">
                        ${listing.price}
                      </p>
                    )}
                    {listing.brand && (
                      <p className="text-gray-500 text-xs mt-1">
                        {listing.brand}
                      </p>
                    )}
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
        )}
      </div>
    </div>
  );
}