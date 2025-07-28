/**
 * Enterprise Home Page
 * Domain-driven design implementation for the main home page
 * Uses AOP aspects and comprehensive data validation for scalable architecture
 * Aggregates content from all verticals with enterprise-grade error handling
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, TrendingUp, Heart, ShoppingBag, Star, Filter, Grid, List } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RawListingData, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';
import { FilterCriteriaType } from '@/services/filtering/FilterService';

// ===== ENTERPRISE HOME PAGE DOMAIN TYPES =====
interface HomePageData {
  readonly featuredListings: CategorySpecificListingData[];
  readonly trendingListings: CategorySpecificListingData[];
  readonly recentListings: CategorySpecificListingData[];
  readonly categoryStats: CategoryStats[];
  readonly performanceMetrics: HomePageMetrics;
}

interface CategoryStats {
  readonly category: string;
  readonly subcategory?: string;
  readonly count: number;
  readonly averagePrice: number;
  readonly trendPercentage: number;
}

interface HomePageMetrics {
  readonly totalListings: number;
  readonly activeBrands: number;
  readonly averageResponseTime: number;
  readonly dataQualityScore: number;
}

interface FeedSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly listings: CategorySpecificListingData[];
  readonly metadata: SectionMetadata;
}

interface SectionMetadata {
  readonly priority: number;
  readonly refreshRate: number;
  readonly cacheKey: string;
  readonly validationLevel: 'strict' | 'standard' | 'lenient';
}

export default function HomePageEnterprise() {
  console.log('[HomePageEnterprise] Initializing enterprise home page with AOP compliance');

  // ===== ENTERPRISE STATE MANAGEMENT =====
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('featured');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // ===== ENTERPRISE DATA FETCHING WITH AOP VALIDATION =====
  const { 
    data: rawHomeData, 
    isLoading: isHomeLoading, 
    error: homeError,
    refetch: refetchHomeData 
  } = useQuery({
    queryKey: ['/api/feed', 'home', searchQuery, sortBy, activeTab],
    queryFn: async (): Promise<{
      forYouListings: RawListingData[];
      followingListings: RawListingData[];
      likedListings: RawListingData[];
      trendingListings: RawListingData[];
    }> => {
      console.log('[HomePageEnterprise] Fetching home feed data');
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('includeMetrics', 'true');
      params.append('limit', '50');
      
      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch home data: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const {
    data: rawListings,
    isLoading: isListingsLoading,
    error: listingsError,
    refetch: refetchListings
  } = useQuery({
    queryKey: ['/api/listings', 'all-categories', searchQuery, sortBy],
    queryFn: async (): Promise<RawListingData[]> => {
      console.log('[HomePageEnterprise] Fetching all listings for home aggregation');
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('limit', '100');
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // ===== ENTERPRISE DATA TRANSFORMATION WITH AOP =====
  const processedHomeData = useMemo(() => {
    const startTime = performance.now();
    console.log('[HomePageEnterprise] Starting AOP-compliant data processing');

    if (!rawHomeData && !rawListings) {
      console.log('[HomePageEnterprise] No data available for processing');
      return {
        featuredListings: [],
        trendingListings: [],
        recentListings: [],
        categoryStats: [],
        performanceMetrics: {
          totalListings: 0,
          activeBrands: 0,
          averageResponseTime: 0,
          dataQualityScore: 0
        }
      } as HomePageData;
    }

    try {
      // Combine all data sources with AOP validation
      const allRawData: RawListingData[] = [
        ...(rawHomeData?.forYouListings || []),
        ...(rawHomeData?.followingListings || []),
        ...(rawHomeData?.likedListings || []),
        ...(rawHomeData?.trendingListings || []),
        ...(rawListings || [])
      ];

      // Apply enterprise data validation
      const validationResult = listingValidationOrchestrator.dataIntegrityAspect.validateDataIntegrity(
        allRawData,
        listingValidationOrchestrator.dataIntegrityAspect.createContext(
          'processedHomeData',
          'HomePageEnterprise',
          'RawListingData[]',
          'standard'
        )
      );

      if (!validationResult.success) {
        console.error('[HomePageEnterprise] Data integrity validation failed:', validationResult.error?.message);
        return {
          featuredListings: [],
          trendingListings: [],
          recentListings: [],
          categoryStats: [],
          performanceMetrics: {
            totalListings: 0,
            activeBrands: 0,
            averageResponseTime: performance.now() - startTime,
            dataQualityScore: 0
          }
        } as HomePageData;
      }

      const validatedData = validationResult.value as RawListingData[];
      
      // Remove duplicates with enterprise-grade deduplication
      const uniqueListings = validatedData.reduce((acc, listing) => {
        const key = listing.id || `${listing.title}-${listing.price}-${listing.userId}`;
        if (!acc.has(key)) {
          acc.set(key, listing);
        }
        return acc;
      }, new Map<string, RawListingData>());

      const deduplicatedListings = Array.from(uniqueListings.values());

      // Transform to category-specific data with proper domain logic
      const transformedListings: CategorySpecificListingData[] = deduplicatedListings.map((listing, index) => ({
        ...listing,
        id: listing.id || `home-${index}-${Date.now()}`,
        title: listing.title || 'Untitled Item',
        description: listing.description || '',
        price: listing.price || '$0.00',
        category: listing.category || 'general',
        userId: listing.userId || 'unknown',
        createdAt: listing.createdAt || new Date().toISOString(),
        domainSpecificData: {
          source: 'home_aggregation',
          priority: index < 10 ? 'high' : index < 30 ? 'medium' : 'low',
          aggregationScore: Math.max(0, 1 - (index / deduplicatedListings.length))
        },
        categoryValidation: {
          isValid: true,
          confidence: 0.8,
          validationRules: ['home_aggregation_rules']
        },
        recommendedFilters: ['category', 'price', 'condition']
      }));

      // Create domain-specific sections with AOP compliance
      const featuredListings = transformedListings
        .filter(listing => (listing.domainSpecificData as any)?.priority === 'high')
        .slice(0, 12);

      const trendingListings = rawHomeData?.trendingListings
        ? transformedListings.filter(listing => 
            rawHomeData.trendingListings.some(trending => trending.id === listing.id)
          ).slice(0, 8)
        : transformedListings.slice(0, 8);

      const recentListings = transformedListings
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);

      // Generate category statistics with enterprise analytics
      const categoryStatsMap = new Map<string, {count: number, totalPrice: number, items: CategorySpecificListingData[]}>();
      
      transformedListings.forEach(listing => {
        const category = listing.category || 'uncategorized';
        const price = parseFloat(listing.price?.replace(/[$,]/g, '') || '0');
        
        if (!categoryStatsMap.has(category)) {
          categoryStatsMap.set(category, { count: 0, totalPrice: 0, items: [] });
        }
        
        const stats = categoryStatsMap.get(category)!;
        stats.count++;
        stats.totalPrice += price;
        stats.items.push(listing);
      });

      const categoryStats: CategoryStats[] = Array.from(categoryStatsMap.entries())
        .map(([category, stats]) => ({
          category,
          count: stats.count,
          averagePrice: stats.count > 0 ? stats.totalPrice / stats.count : 0,
          trendPercentage: Math.random() * 20 - 10 // Placeholder for real trend calculation
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const performanceMetrics: HomePageMetrics = {
        totalListings: transformedListings.length,
        activeBrands: new Set(transformedListings.map(l => l.brand).filter(Boolean)).size,
        averageResponseTime: performance.now() - startTime,
        dataQualityScore: validationResult.metadata.performance.validationChecks > 0 ? 
          (transformedListings.length / validationResult.metadata.performance.validationChecks) * 100 : 0
      };

      console.log('[HomePageEnterprise] Data processing completed successfully:', {
        totalProcessed: deduplicatedListings.length,
        featured: featuredListings.length,
        trending: trendingListings.length,
        recent: recentListings.length,
        categories: categoryStats.length,
        executionTime: performanceMetrics.averageResponseTime
      });

      return {
        featuredListings,
        trendingListings,
        recentListings,
        categoryStats,
        performanceMetrics
      } as HomePageData;

    } catch (error) {
      console.error('[HomePageEnterprise] Critical error in data processing:', error);
      return {
        featuredListings: [],
        trendingListings: [],
        recentListings: [],
        categoryStats: [],
        performanceMetrics: {
          totalListings: 0,
          activeBrands: 0,
          averageResponseTime: performance.now() - startTime,
          dataQualityScore: 0
        }
      } as HomePageData;
    }
  }, [rawHomeData, rawListings]);

  // ===== ENTERPRISE FILTERING WITH AOP VALIDATION =====
  const filteredData = useMemo(() => {
    if (!processedHomeData) return processedHomeData;

    if (!searchQuery.trim()) return processedHomeData;

    const query = searchQuery.toLowerCase();
    
    const filterSection = (listings: CategorySpecificListingData[]) => {
      return listings.filter(listing => {
        return (
          listing.title?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query) ||
          listing.brand?.toLowerCase().includes(query) ||
          listing.category?.toLowerCase().includes(query) ||
          listing.subcategory?.toLowerCase().includes(query)
        );
      });
    };

    return {
      ...processedHomeData,
      featuredListings: filterSection(processedHomeData.featuredListings),
      trendingListings: filterSection(processedHomeData.trendingListings),
      recentListings: filterSection(processedHomeData.recentListings)
    };
  }, [processedHomeData, searchQuery]);

  // ===== EVENT HANDLERS =====
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchHomeData();
    refetchListings();
  }, [refetchHomeData, refetchListings]);

  // ===== RENDER UTILITIES =====
  const renderListingCard = (listing: CategorySpecificListingData, index: number) => (
    <Card key={listing.id || index} className="group hover:shadow-lg transition-all duration-200" data-testid={`card-listing-${listing.id}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${listing.id}`}>
            {listing.category}
          </Badge>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {listing.images && listing.images.length > 0 && (
          <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
              data-testid={`img-listing-${listing.id}`}
            />
          </div>
        )}
        <CardTitle className="line-clamp-2 text-base mb-1" data-testid={`title-listing-${listing.id}`}>
          {listing.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm" data-testid={`description-listing-${listing.id}`}>
          {listing.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between items-center w-full">
          <span className="font-semibold text-lg" data-testid={`price-listing-${listing.id}`}>
            {listing.price}
          </span>
          {listing.brand && (
            <Badge variant="outline" className="text-xs" data-testid={`badge-brand-${listing.id}`}>
              {listing.brand}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  const renderSection = (title: string, listings: CategorySpecificListingData[], description?: string) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" data-testid={`heading-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 mt-1" data-testid={`description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} data-testid={`button-view-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500" data-testid={`empty-state-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No items found in this section</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} data-testid={`grid-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {listings.map((listing, index) => renderListingCard(listing, index))}
        </div>
      )}
    </div>
  );

  // ===== LOADING AND ERROR STATES =====
  const isLoading = isHomeLoading || isListingsLoading;
  const error = homeError || listingsError;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load home page data: {error.message}
              <Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh} data-testid="button-retry">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Search */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="heading-hero">
            Discover Amazing Items
          </h1>
          <p className="text-xl text-gray-600 mb-8" data-testid="text-hero-description">
            Find unique treasures from our community marketplace
          </p>
          
          <div className="max-w-2xl mx-auto flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 py-3 text-lg"
                data-testid="input-search"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" data-testid="option-sort-newest">Newest</SelectItem>
                <SelectItem value="oldest" data-testid="option-sort-oldest">Oldest</SelectItem>
                <SelectItem value="price_low" data-testid="option-sort-price-low">Price: Low to High</SelectItem>
                <SelectItem value="price_high" data-testid="option-sort-price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular" data-testid="option-sort-popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Cards */}
        {filteredData?.performanceMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card data-testid="card-stat-total">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-total-listings">
                  {filteredData.performanceMetrics.totalListings}
                </div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-brands">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="stat-active-brands">
                  {filteredData.performanceMetrics.activeBrands}
                </div>
                <div className="text-sm text-gray-600">Active Brands</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-quality">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-quality-score">
                  {Math.round(filteredData.performanceMetrics.dataQualityScore)}%
                </div>
                <div className="text-sm text-gray-600">Quality Score</div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-response">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600" data-testid="stat-response-time">
                  {Math.round(filteredData.performanceMetrics.averageResponseTime)}ms
                </div>
                <div className="text-sm text-gray-600">Response Time</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Statistics */}
        {filteredData?.categoryStats && filteredData.categoryStats.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" data-testid="heading-categories">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filteredData.categoryStats.map((stat, index) => (
                <Card key={stat.category} className="text-center hover:shadow-md transition-shadow" data-testid={`card-category-${stat.category}`}>
                  <CardContent className="p-4">
                    <div className="font-semibold capitalize" data-testid={`text-category-name-${stat.category}`}>
                      {stat.category}
                    </div>
                    <div className="text-sm text-gray-600" data-testid={`text-category-count-${stat.category}`}>
                      {stat.count} items
                    </div>
                    <div className="text-xs text-green-600" data-testid={`text-category-price-${stat.category}`}>
                      Avg: ${stat.averagePrice.toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-main">
            <TabsTrigger value="featured" data-testid="tab-featured">Featured</TabsTrigger>
            <TabsTrigger value="trending" data-testid="tab-trending">Trending</TabsTrigger>
            <TabsTrigger value="recent" data-testid="tab-recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} data-testid={`skeleton-featured-${i}`}>
                    <CardHeader>
                      <Skeleton className="h-4 w-16" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="aspect-square mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-4 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              renderSection(
                "Featured Items",
                filteredData?.featuredListings || [],
                "Handpicked items from our community"
              )
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} data-testid={`skeleton-trending-${i}`}>
                    <CardHeader>
                      <Skeleton className="h-4 w-16" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="aspect-square mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-4 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              renderSection(
                "Trending Now",
                filteredData?.trendingListings || [],
                "Popular items gaining attention"
              )
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} data-testid={`skeleton-recent-${i}`}>
                    <CardHeader>
                      <Skeleton className="h-4 w-16" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="aspect-square mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-4 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              renderSection(
                "Recently Added",
                filteredData?.recentListings || [],
                "Fresh arrivals from our sellers"
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Performance Footer */}
        {filteredData?.performanceMetrics && (
          <div className="mt-12 text-center text-sm text-gray-500" data-testid="footer-performance">
            Page loaded in {Math.round(filteredData.performanceMetrics.averageResponseTime)}ms • 
            Data quality: {Math.round(filteredData.performanceMetrics.dataQualityScore)}% • 
            AOP validation: Active
          </div>
        )}
      </main>
    </div>
  );
}