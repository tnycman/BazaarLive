/**
 * Minimal working Women Fashion Page - Fixed Version
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
// import { Navigation } from '@/components/Navigation'; // REMOVED: Dropdowns now in Header

export default function WomenPageEnterpriseFixed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch listings data
  const { data: rawListings = [], isLoading } = useQuery({
    queryKey: ['/api/listings', { category: 'fashion', subcategory: 'women' }],
  });

  // Apply search filtering
  const filteredListings = useMemo(() => {
    if (!Array.isArray(rawListings)) return [];
    
    return rawListings.filter((listing: any) => {
      if (!listing) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (listing.title || '').toLowerCase();
        const description = (listing.description || '').toLowerCase();
        const brand = (listing.brand || '').toLowerCase();
        
        if (!title.includes(query) && !description.includes(query) && !brand.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [rawListings, searchQuery]);

  // Apply sorting
  const sortedListings = useMemo(() => {
    if (!Array.isArray(filteredListings)) return [];
    
    return [...filteredListings].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.price?.replace(/[^0-9.-]+/g, '') || '0') - parseFloat(b.price?.replace(/[^0-9.-]+/g, '') || '0');
        case 'price_high':
          return parseFloat(b.price?.replace(/[^0-9.-]+/g, '') || '0') - parseFloat(a.price?.replace(/[^0-9.-]+/g, '') || '0');
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [filteredListings, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Women's Fashion
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover the latest in women's fashion
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search women's fashion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              data-testid="input-search"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            data-testid="select-sort"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedListings.map((listing: any) => (
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
                  </div>
                  
                  {listing.size && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Size: {listing.size}
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
              Try adjusting your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}