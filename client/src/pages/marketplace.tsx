import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  SearchIcon, 
  FilterIcon, 
  GridIcon, 
  ListIcon,
  SlidersIcon,
  ShirtIcon,
  BriefcaseIcon,
  HomeIcon,
  CarIcon,
  ShipIcon,
  WrenchIcon,
  MonitorIcon,
  SofaIcon
} from "lucide-react";

const categories = [
  { id: 'all', name: 'All Categories', icon: GridIcon, count: '150K+' },
  { id: 'fashion', name: 'Fashion', icon: ShirtIcon, count: '45K+' },
  { id: 'jobs', name: 'Jobs', icon: BriefcaseIcon, count: '12K+' },
  { id: 'real_estate', name: 'Real Estate', icon: HomeIcon, count: '8K+' },
  { id: 'cars', name: 'Cars', icon: CarIcon, count: '15K+' },
  { id: 'boats', name: 'Boats', icon: ShipIcon, count: '2K+' },
  { id: 'services', name: 'Services', icon: WrenchIcon, count: '18K+' },
  { id: 'electronics', name: 'Electronics', icon: MonitorIcon, count: '25K+' },
  { id: 'home', name: 'Home & Garden', icon: SofaIcon, count: '10K+' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'trending', label: 'Trending' }
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings, isLoading } = useQuery({
    queryKey: ["/api/listings", { 
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery || undefined,
      limit: 50 
    }],
  });

  const filteredListings = listings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-marketplace-title">
                Marketplace
              </h1>
              <p className="text-gray-600" data-testid="text-marketplace-subtitle">
                Discover amazing finds from our community of sellers
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                data-testid="button-grid-view"
              >
                <GridIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                data-testid="button-list-view"
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6" data-testid="card-search-filters">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    className="pl-10"
                    placeholder="Search for items, brands, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
                
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <SlidersIcon className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" className="text-sm" data-testid="input-price-min" />
                        <Input placeholder="Max" className="text-sm" data-testid="input-price-max" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <Select>
                        <SelectTrigger data-testid="select-condition">
                          <SelectValue placeholder="Any condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_with_tags">New with Tags</SelectItem>
                          <SelectItem value="new_without_tags">New without Tags</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <Input placeholder="Any brand" data-testid="input-brand" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <Input placeholder="Any size" data-testid="input-size" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24" data-testid="card-categories">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-categories-title">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      data-testid={`button-category-${category.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge 
                        variant={selectedCategory === category.id ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {category.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900" data-testid="text-results-title">
                  {selectedCategory === 'all' 
                    ? 'All Items' 
                    : categories.find(c => c.id === selectedCategory)?.name
                  }
                </h2>
                <p className="text-gray-600" data-testid="text-results-count">
                  {filteredListings.length} items found
                </p>
              </div>
              
              {/* Mobile Category Filter */}
              <div className="lg:hidden">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40" data-testid="select-category-mobile">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-0">
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-no-results">
                <CardContent>
                  <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-no-results-title">
                    No items found
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid="text-no-results-description">
                    Try adjusting your search criteria or browse different categories
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredListings.map((listing: any) => (
                  <ListingCard 
                    key={listing.id}
                    listing={listing}
                    data-testid={`card-listing-${listing.id}`}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredListings.length > 0 && (
              <div className="mt-12 text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8"
                  data-testid="button-load-more"
                >
                  Load More Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
