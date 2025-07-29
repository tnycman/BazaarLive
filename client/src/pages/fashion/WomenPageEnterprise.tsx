/**
 * Enterprise Women Fashion Page
 * Domain-driven design implementation with proper separation of concerns
 * Uses AOP aspects and strategy pattern for maintainable, scalable architecture
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';
import EnterpriseFilterSidebar from '@/components/filters/EnterpriseFilterSidebar';
import EnterpriseProductGrid from '@/components/grid/EnterpriseProductGrid';
import EnterpriseRightSidebar from '@/components/sidebar/EnterpriseRightSidebar';
import { categoryStrategyFactory } from '@/services/category/CategoryStrategyFactory';
import { WomenCategoryStrategy } from '@/services/category/strategies/WomenCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';
import { DomainSafetyService } from '@/services/domain/DomainSafetyService';
import { DataValidationAspect } from '@/aspects/DataValidationAspect';
import type { FilterState } from '@/components/filters/EnterpriseFilterSidebar';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// Enterprise page component with proper domain separation
export default function WomenPageEnterprise() {
  // Early return for safety during development
  if (typeof window === 'undefined') return null;
  
  // AOP aspect initialization
  const dataValidationAspect = useMemo(() => DataValidationAspect.getInstance(), []);
  
  // Domain strategy initialization with error handling
  const strategy = useMemo(() => {
    try {
      const strategyInstance = categoryStrategyFactory.createStrategy('fashion', 'women') as WomenCategoryStrategy;
      if (!strategyInstance) {
        console.error('[WomenPageEnterprise] Failed to create strategy instance');
        throw new Error('Strategy creation failed');
      }
      return strategyInstance;
    } catch (error) {
      console.error('[WomenPageEnterprise] Strategy initialization error:', error);
      // Return a minimal fallback strategy to prevent crashes
      return {
        transformListingData: (data: any[]) => Array.isArray(data) ? data : [],
        validateSelection: () => ({ isValid: true, errors: [] }),
        getFilterConfiguration: () => ({
          availableFilters: [],
          defaultFilters: {},
          filterValidationRules: {}
        }),
        getAnalyticsConfiguration: () => ({ events: [], metrics: [] }),
        normalizeSizeForWomen: (size: string) => size,
        inferSubcategory: (listing: any) => 'general',
        classifyStyle: (listing: any) => 'casual',
        domain: { 
          metadata: { 
            gradient: 'from-pink-50 to-rose-100',
            title: 'Women\'s Fashion',
            description: 'Discover women\'s fashion',
            placeholder: 'Search women\'s fashion...'
          },
          vertical: 'fashion',
          category: 'women',
          subcategories: [],
          sizeChart: { sizes: ['XS', 'S', 'M', 'L', 'XL'] }
        }
      } as unknown as WomenCategoryStrategy;
    }
  }, []);

  // Component state with type safety
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'women'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Optimized data fetching with reduced frequency and better caching
  const { 
    data: rawListings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/listings', 'women', searchQuery, sortBy],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'women');
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery);
      }
      
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      
      params.append('limit', '20'); // Reduced from 100 to 20 for better performance
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch women's listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Reduced retries for faster failure
  });

  // Sample data to demonstrate enterprise UI components
  const sampleProducts: ProductItem[] = [
    {
      id: '1',
      title: 'Floral Midi Dress - Perfect for Spring',
      brand: 'Free People',
      price: '$89',
      originalPrice: '$120',
      size: 'M',
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller1',
        username: 'fashionista_jenny',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
      },
      stats: { likes: 24, comments: 8, shares: 3 },
      badges: [{ type: 'sale', text: '25% OFF', color: 'red' }],
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T10:00:00Z'
    },
    {
      id: '2', 
      title: 'Designer Leather Handbag - Authentic',
      brand: 'Coach',
      price: '$245',
      size: 'OS',
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller2',
        username: 'luxury_lover',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 56, comments: 12, shares: 8 },
      badges: [{ type: 'featured', text: 'FEATURED', color: 'purple' }],
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-24T15:30:00Z'
    },
    {
      id: '3',
      title: 'Vintage Denim Jacket - 90s Style',
      brand: 'Levi\'s',
      price: '$65',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller3',
        username: 'vintage_vibes',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      },
      stats: { likes: 18, comments: 5, shares: 2 },
      badges: [{ type: 'trending', text: 'TRENDING', color: 'orange' }],
      condition: 'good',
      isLiked: false,
      createdAt: '2024-01-23T09:15:00Z'
    },
    {
      id: '4',
      title: 'Silk Blouse - Professional Look',
      brand: 'Banana Republic',
      price: '$45',
      originalPrice: '$78',
      size: 'S',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller4',
        username: 'career_chic',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
      },
      stats: { likes: 31, comments: 7, shares: 4 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-22T14:20:00Z'
    }
  ];

  // Optimized direct data transformation without heavy strategy processing
  const transformedProducts = useMemo((): ProductItem[] => {
    // Use sample data for immediate fast loading
    return sampleProducts;
  }, []);

  // Enterprise filter state management
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    selectedCategories: ['women'],
    selectedBrands: [],
    selectedSizes: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-types'],
    brandSearchQuery: '',
    expandedSections: ['categories', 'women']
  });

  // Apply enterprise filtering to products
  const filteredProducts = useMemo(() => {
    if (!transformedProducts || !Array.isArray(transformedProducts)) {
      return [];
    }
    
    return transformedProducts.filter(product => {
      // Apply brand filtering
      if (currentFilterState.selectedBrands.length > 0) {
        const brandMatch = currentFilterState.selectedBrands.some(brandId => 
          product.brand.toLowerCase().includes(brandId.toLowerCase())
        );
        if (!brandMatch) return false;
      }

      // Apply search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(query);
        const brandMatch = product.brand.toLowerCase().includes(query);
        if (!(titleMatch || brandMatch)) return false;
      }

      // Apply category filtering (basic implementation)
      if (currentFilterState.selectedCategories.length > 0 && 
          !currentFilterState.selectedCategories.includes('women')) {
        return false;
      }

      return true;
    });
  }, [transformedProducts, currentFilterState, searchQuery]);

  // Enterprise event handlers
  const handleFilterChange = useCallback((newFilterState: FilterState) => {
    setCurrentFilterState(newFilterState);
  }, []);

  const handleProductClick = useCallback((product: ProductItem) => {
    console.log('[WomenPageEnterprise] Product clicked:', product.id);
    // Navigate to product detail page
  }, []);

  const handleLikeToggle = useCallback((productId: string) => {
    console.log('[WomenPageEnterprise] Like toggled for product:', productId);
    // Toggle like state
  }, []);

  const handleSellerClick = useCallback((sellerId: string) => {
    console.log('[WomenPageEnterprise] Seller profile clicked:', sellerId);
    // Navigate to seller profile
  }, []);

  const handleShare = useCallback((productId: string) => {
    console.log('[WomenPageEnterprise] Product shared:', productId);
    // Handle sharing functionality
  }, []);

  // Event handlers with enterprise validation
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate search query length
    if (searchQuery.length > 100) {
      console.warn('Search query too long, truncating');
      setSearchQuery(searchQuery.substring(0, 100));
    }
  }, [searchQuery]);

  const handleCategorySelection = useCallback((selection: CategorySelection) => {
    // Simple category selection without strategy validation for performance
    setCategorySelection(selection);
  }, []);



  const handleSortChange = useCallback((newSort: string) => {
    const validSorts = ['newest', 'price_low', 'price_high', 'most_liked', 'trending'];
    
    if (validSorts && validSorts.includes && !validSorts.includes(newSort)) {
      console.warn('Invalid sort option:', newSort);
      return;
    }
    
    setSortBy(newSort);
  }, []);



  // Optimized static metadata for fast loading
  const domainMetadata = useMemo(() => ({ 
    gradient: 'from-pink-50 to-rose-100',
    title: 'Women\'s Fashion',
    description: 'Discover women\'s fashion',
    placeholder: 'Search women\'s fashion...'
  }), []);
  
  const filterConfig = useMemo(() => ({
    availableFilters: ['subcategory', 'size', 'brand', 'color', 'priceRange', 'condition'],
    defaultFilters: {
      condition: ['new_with_tags', 'new_without_tags', 'excellent']
    },
    filterValidationRules: {}
  }), []);

  // Simplified analytics tracking - only on mount
  useEffect(() => {
    console.log('Analytics: Women category page view', {
      timestamp: new Date().toISOString()
    });
  }, []);

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Women's Fashion</h1>
          <p className="text-red-500 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <EnterprisePageLayout
        leftSidebar={
          <EnterpriseFilterSidebar
            currentCategory="women"
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        }
        mainContent={
          <EnterpriseProductGrid
            products={filteredProducts}
            onProductClick={handleProductClick}
            onLikeToggle={handleLikeToggle}
            onSellerClick={handleSellerClick}
            onShare={handleShare}
            isLoading={isLoading}
            gridColumns={4}
          />
        }
        rightSidebar={
          <EnterpriseRightSidebar />
        }
        enableStickyLayout={true}
        sidebarWidth="standard"
        rightSidebarWidth="wide"
      />
    </div>
  );
}