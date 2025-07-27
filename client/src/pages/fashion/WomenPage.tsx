import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { ProductGrid } from '@/components/filters/ProductGrid';
import { filterService, type FilterCriteriaType } from '@/services/filtering/FilterService';

export default function WomenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('just_shared');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Fetch women's listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/listings', 'fashion', 'women', searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'women');
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
      <Navigation />
      
      <div className="flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          onFilterChange={handleFilterChange}
          appliedFiltersCount={appliedFiltersCount}
          isLoading={isLoading}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  data-testid="input-main-search"
                />
              </div>
            </form>
          </div>

          {/* Product Grid */}
          <ProductGrid
            listings={filteredListings}
            isLoading={isLoading}
            appliedFiltersCount={appliedFiltersCount}
            onSortChange={handleSortChange}
            currentSort={sortBy}
          />
        </div>
      </div>
    </div>
  );
}