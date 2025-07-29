import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
// import { Navigation } from '@/components/Navigation'; // REMOVED: Dropdowns now in Header
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { ProductGrid } from '@/components/filters/ProductGrid';
import { filterService, type FilterCriteriaType } from '@/services/filtering/FilterService';

export default function MenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('just_shared');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Fetch men's listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'men', searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'men');
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    }
  });

  const rawListings = Array.isArray(listings) ? listings : [];

  // Apply filters using the FilterService
  const filteredListings = filterService.applyFilters(rawListings.filter(listing => {
    // Additional search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.brand?.toLowerCase().includes(query) ||
        listing.category?.toLowerCase().includes(query)
      );
    }
    return true;
  }));

  const appliedFiltersCount = filterService.getAppliedFiltersCount();

  // Handle filter changes
  const handleFilterChange = useCallback((criteria: FilterCriteriaType) => {
    filterService.updateCriteria(criteria);
    setFilterCriteria(criteria);
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
    filterService.updateCriteria({ sortBy: newSortBy as any });
  }, []);

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    filterService.updateCriteria({ searchQuery });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          onFilterChange={handleFilterChange}
          appliedFiltersCount={appliedFiltersCount}
          isLoading={isLoading}
          category="men"
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Men's Fashion
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Discover the latest in men's clothing, shoes, and accessories
              </p>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search men's fashion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    data-testid="input-men-search"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            listings={filteredListings}
            isLoading={isLoading}
            appliedFiltersCount={appliedFiltersCount}
            onSortChange={handleSortChange}
            currentSort={sortBy}
            category="men"
          />
        </div>
      </div>
    </div>
  );
}