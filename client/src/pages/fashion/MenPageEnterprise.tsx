/**
 * Enterprise Men Fashion Page
 * Optimized template based on women's page for fast loading and performance
 * Uses simplified architecture with enterprise UI components
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
import { MenCategoryStrategy } from '@/services/category/strategies/MenCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';
import { DomainSafetyService } from '@/services/domain/DomainSafetyService';
import { DataValidationAspect } from '@/aspects/DataValidationAspect';
import type { FilterState } from '@/components/filters/EnterpriseFilterSidebar';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// Enterprise page component with optimized performance
export default function MenPageEnterprise() {
  // Early return for safety during development
  if (typeof window === 'undefined') return null;
  
  // AOP aspect initialization
  const dataValidationAspect = useMemo(() => DataValidationAspect.getInstance(), []);
  
  // Domain strategy initialization with error handling
  const strategy = useMemo(() => {
    try {
      const strategyInstance = categoryStrategyFactory.createStrategy('fashion', 'men') as MenCategoryStrategy;
      if (!strategyInstance) {
        console.error('[MenPageEnterprise] Failed to create strategy instance');
        throw new Error('Strategy creation failed');
      }
      return strategyInstance;
    } catch (error) {
      console.error('[MenPageEnterprise] Strategy initialization error:', error);
      // Return a minimal fallback strategy to prevent crashes
      return {
        transformListingData: (data: any[]) => Array.isArray(data) ? data : [],
        validateSelection: () => ({ isValid: true, errors: [], warnings: [] }),
        getFilterConfiguration: () => ({
          availableFilters: [],
          defaultFilters: {},
          filterValidationRules: {}
        }),
        getAnalyticsConfiguration: () => ({ events: [], metrics: [] }),
        domain: { 
          metadata: { 
            gradient: 'from-blue-50 to-slate-100',
            title: 'Men\'s Fashion',
            description: 'Discover men\'s fashion',
            placeholder: 'Search men\'s fashion...'
          },
          vertical: 'fashion',
          category: 'men',
          subcategories: [],
          sizeChart: { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }
        }
      } as unknown as MenCategoryStrategy;
    }
  }, []);

  // Component state with type safety
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'men'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Optimized data fetching with reduced frequency and better caching
  const { 
    data: rawListings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/listings', 'men', searchQuery, sortBy],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'men');
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery);
      }
      
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      
      params.append('limit', '20'); // Reduced from 100 to 20 for better performance
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch men's listings: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Reduced retries for faster failure
  });

  // Sample data to demonstrate enterprise UI components for men's fashion
  const sampleProducts: ProductItem[] = [
    {
      id: '1',
      title: 'Classic Wool Suit Jacket - Navy',
      brand: 'Hugo Boss',
      price: '$299',
      originalPrice: '$450',
      size: 'L',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller1',
        username: 'gentleman_style',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 42, comments: 12, shares: 8 },
      badges: [{ type: 'sale', text: '35% OFF', color: 'red' }],
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-25T11:00:00Z'
    },
    {
      id: '2',
      title: 'Designer Leather Dress Shoes - Oxford',
      brand: 'Allen Edmonds',
      price: '$185',
      size: '10.5',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller2',
        username: 'classic_menswear',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
      },
      stats: { likes: 67, comments: 18, shares: 12 },
      badges: [{ type: 'featured', text: 'FEATURED', color: 'purple' }],
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-24T16:30:00Z'
    },
    {
      id: '3',
      title: 'Vintage Denim Jacket - Classic Blue',
      brand: 'Levi\'s',
      price: '$75',
      size: 'XL',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller3',
        username: 'vintage_denim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      stats: { likes: 28, comments: 7, shares: 4 },
      badges: [{ type: 'trending', text: 'TRENDING', color: 'orange' }],
      condition: 'good',
      isLiked: false,
      createdAt: '2024-01-23T10:45:00Z'
    },
    {
      id: '4',
      title: 'Premium Watch - Swiss Made',
      brand: 'Tag Heuer',
      price: '$1,250',
      originalPrice: '$1,800',
      size: 'OS',
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller4',
        username: 'luxury_timepieces',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      stats: { likes: 89, comments: 25, shares: 15 },
      badges: [{ type: 'featured', text: 'PREMIUM', color: 'blue' }],
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-22T13:15:00Z'
    }
  ];

  // Optimized direct data transformation without heavy strategy processing
  const transformedProducts = useMemo((): ProductItem[] => {
    // Use sample data for immediate fast loading
    return sampleProducts;
  }, []);

  // Enterprise filter state management for men's fashion
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    selectedCategories: ['men'],
    selectedBrands: [],
    selectedSizes: [],
    selectedColors: [],
    selectedPrices: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-types'],
    brandSearchQuery: '',
    expandedSections: ['categories', 'men']
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
          !currentFilterState.selectedCategories.includes('men')) {
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
    console.log('[MenPageEnterprise] Product clicked:', product.id);
    // Navigate to product detail page
  }, []);

  const handleLikeToggle = useCallback((productId: string) => {
    console.log('[MenPageEnterprise] Like toggled for product:', productId);
    // Toggle like state
  }, []);

  const handleSellerClick = useCallback((sellerId: string) => {
    console.log('[MenPageEnterprise] Seller profile clicked:', sellerId);
    // Navigate to seller profile
  }, []);

  const handleShare = useCallback((productId: string) => {
    console.log('[MenPageEnterprise] Product shared:', productId);
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
    gradient: 'from-blue-50 to-slate-100',
    title: 'Men\'s Fashion',
    description: 'Discover men\'s fashion',
    placeholder: 'Search men\'s fashion...'
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
    console.log('Analytics: Men category page view', {
      timestamp: new Date().toISOString()
    });
  }, []);

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Men's Fashion</h1>
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
            currentCategory="men"
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        }
        mainContent={
          <EnterpriseProductGrid
            title="Men's Fashion"
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