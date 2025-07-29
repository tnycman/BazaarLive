import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, FilterIcon, GridIcon, ListIcon, SlidersIcon } from 'lucide-react';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { ProductGrid } from '@/components/filters/ProductGrid';
import { FashionCategoryButton } from '@/components/ui/CategorySelectionButton';
import { ListingCard } from '@/components/ListingCard';
import { filterService, type FilterCriteriaType } from '@/services/filtering/FilterService';
import { categoryConfigService, type CategoryConfig } from '@/services/category/CategoryConfigService';



const sortOptions = [
  { value: 'newest', label: 'Just Shared' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'trending', label: 'Trending' },
];

interface DynamicCategoryPageProps {
  vertical?: string;
  category?: string;
  subcategory?: string;
}

export default function DynamicCategoryPage({ vertical = 'fashion', category, subcategory }: DynamicCategoryPageProps) {
  const params = useParams();
  const actualVertical = params?.vertical || vertical;
  const actualCategory = params?.category || category;
  const actualSubcategory = params?.subcategory || subcategory;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Get category configuration using enterprise service
  const categoryConfig = useMemo(() => {
    return categoryConfigService.getConfigWithFallback(actualVertical, actualCategory);
  }, [actualVertical, actualCategory]);

  // Fetch listings with dynamic parameters
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/listings', actualVertical, actualCategory, actualSubcategory, searchQuery, sortBy, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('category', actualVertical);
      if (actualCategory !== 'all') params.append('subcategory', actualCategory);
      if (actualSubcategory) params.append('subsubcategory', actualSubcategory);
      if (selectedCategory !== 'all') params.append('categoryFilter', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    }
  });

  const rawListings = Array.isArray(listings) ? listings : [];

  // Apply additional filtering using enterprise FilterService with AOP compliance
  const filteredListings = useMemo(() => {
    // Update filter criteria in service state first
    filterService.updateCriteria({
      searchQuery,
      categories: selectedCategory === 'all' ? undefined : [selectedCategory],
      ...filterCriteria
    });
    // Then apply filters using the correct single-parameter signature
    return filterService.applyFilters(rawListings);
  }, [rawListings, searchQuery, selectedCategory, filterCriteria]);

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchQuery) count++;
    if (filterCriteria.priceRange) count++;
    if (filterCriteria.condition && filterCriteria.condition.length > 0) count++;
    if (filterCriteria.sizes && filterCriteria.sizes.length > 0) count++;
    if (filterCriteria.brands && filterCriteria.brands.length > 0) count++;
    return count;
  }, [selectedCategory, searchQuery, filterCriteria]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterCriteriaType) => {
    setFilterCriteria(newFilters);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${categoryConfig.gradient}`}>
      <Header />
      <Navigation />
      
      <div className="flex">
        {/* Sidebar */}
        {showFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            appliedFiltersCount={appliedFiltersCount}
            category={actualCategory}
            isLoading={isLoading}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {categoryConfig.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {categoryConfig.description}
              </p>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={categoryConfig.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    data-testid={`input-${actualCategory}-search`}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={categoryConfig.placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]" data-testid="select-sort">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      data-testid="button-filters"
                    >
                      <FilterIcon className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryConfig.categories.map((categoryItem: any) => (
                <FashionCategoryButton
                  key={categoryItem.id}
                  categoryId={categoryItem.id}
                  categoryName={categoryItem.name}
                  count={categoryItem.count}
                  isSelected={selectedCategory === categoryItem.id}
                  onClick={() => setSelectedCategory(categoryItem.id)}
                  data-testid={`button-category-${categoryItem.id}`}
                />
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            listings={filteredListings}
            isLoading={isLoading}
            appliedFiltersCount={appliedFiltersCount}
            onSortChange={handleSortChange}
            currentSort={sortBy}
            category={actualCategory}
          />
        </div>
      </div>
    </div>
  );
}