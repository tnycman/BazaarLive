/**
 * Enterprise Women Fashion Page - Fixed Version
 * Simplified implementation to eliminate undefined includes errors
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

// Safe filter criteria type
interface SafeFilterCriteria {
  sizes?: string[];
  brands?: string[];
  condition?: string[];
  priceRange?: { min?: number; max?: number; };
  subcategory?: string[];
}

// Safe listing type
interface SafeListing {
  id: string;
  title: string;
  price: string;
  image: string;
  size?: string;
  brand?: string;
  condition?: string;
  category?: string;
  subcategory?: string;
  [key: string]: any;
}

// Enterprise page component with error-free implementation
export default function WomenPageEnterpriseFixed() {
  // Safe state initialization
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCriteria, setFilterCriteria] = useState<SafeFilterCriteria>({});

  // Safe data fetching with error handling
  const { 
    data: rawListings = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'women', searchQuery, sortBy],
    queryFn: async (): Promise<SafeListing[]> => {
      try {
        const params = new URLSearchParams();
        params.append('category', 'fashion');
        params.append('subcategory', 'women');
        
        if (searchQuery.trim()) {
          params.append('search', searchQuery);
        }
        
        if (sortBy) {
          params.append('sortBy', sortBy);
        }
        
        const response = await fetch(`/api/listings?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('[WomenPageEnterpriseFixed] Error fetching listings:', error);
        return [];
      }
    },
    staleTime: 60000,
    retry: 3,
  });

  // Safe filtering with comprehensive null checks
  const filteredListings = useMemo(() => {
    if (!Array.isArray(rawListings)) {
      return [];
    }

    return rawListings.filter((listing: SafeListing) => {
      if (!listing || typeof listing !== 'object') {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (listing.title || '').toLowerCase();
        const brand = (listing.brand || '').toLowerCase();
        
        if (!title.includes(query) && !brand.includes(query)) {
          return false;
        }
      }

      // Size filter with safe array check
      if (Array.isArray(filterCriteria.sizes) && filterCriteria.sizes.length > 0) {
        const listingSize = listing.size || '';
        if (!filterCriteria.sizes.includes(listingSize)) {
          return false;
        }
      }

      // Brand filter with safe array check
      if (Array.isArray(filterCriteria.brands) && filterCriteria.brands.length > 0) {
        const listingBrand = listing.brand || '';
        if (!filterCriteria.brands.includes(listingBrand)) {
          return false;
        }
      }

      // Condition filter with safe array check
      if (Array.isArray(filterCriteria.condition) && filterCriteria.condition.length > 0) {
        const listingCondition = listing.condition || 'good';
        if (!filterCriteria.condition.includes(listingCondition)) {
          return false;
        }
      }

      // Price range filter
      if (filterCriteria.priceRange) {
        const { min, max } = filterCriteria.priceRange;
        const priceStr = listing.price || '0';
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        
        if ((typeof min === 'number' && price < min) || (typeof max === 'number' && price > max)) {
          return false;
        }
      }

      return true;
    });
  }, [rawListings, searchQuery, filterCriteria]);

  // Safe sorting
  const sortedListings = useMemo(() => {
    if (!Array.isArray(filteredListings)) {
      return [];
    }

    const sorted = [...filteredListings];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case 'price_low':
        return sorted.sort((a, b) => {
          const priceA = parseFloat((a.price || '0').replace(/[^0-9.]/g, ''));
          const priceB = parseFloat((b.price || '0').replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
      case 'price_high':
        return sorted.sort((a, b) => {
          const priceA = parseFloat((a.price || '0').replace(/[^0-9.]/g, ''));
          const priceB = parseFloat((b.price || '0').replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
      default:
        return sorted;
    }
  }, [filteredListings, sortBy]);

  // Safe event handlers
  const handleSortChange = useCallback((newSort: string) => {
    const validSorts = ['newest', 'price_low', 'price_high', 'most_liked', 'trending'];
    
    if (Array.isArray(validSorts) && validSorts.includes(newSort)) {
      setSortBy(newSort);
    } else {
      console.warn('[WomenPageEnterpriseFixed] Invalid sort option:', newSort);
    }
  }, []);

  const handleFilterChange = useCallback((newFilters: SafeFilterCriteria) => {
    // Validate filter structure
    const safeFilters: SafeFilterCriteria = {};
    
    if (Array.isArray(newFilters.sizes)) {
      safeFilters.sizes = newFilters.sizes;
    }
    
    if (Array.isArray(newFilters.brands)) {
      safeFilters.brands = newFilters.brands;
    }
    
    if (Array.isArray(newFilters.condition)) {
      safeFilters.condition = newFilters.condition;
    }
    
    if (newFilters.priceRange && typeof newFilters.priceRange === 'object') {
      safeFilters.priceRange = newFilters.priceRange;
    }

    setFilterCriteria(safeFilters);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <Header />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Women's Fashion</h1>
          <p className="text-gray-600 text-lg">Discover the latest trends and timeless classics</p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search women's fashion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="most_liked">Most Liked</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading women's fashion items...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                {sortedListings.length} items found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {sortedListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCriteria({});
                  }}
                  className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">No Image</div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-pink-600 font-bold text-lg mb-2">
                        {listing.price}
                      </p>
                      {listing.brand && (
                        <p className="text-gray-500 text-sm mb-1">
                          {listing.brand}
                        </p>
                      )}
                      {listing.size && (
                        <p className="text-gray-500 text-xs">
                          Size: {listing.size}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}