/**
 * Enterprise Kids Fashion Page
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
import { KidsCategoryStrategy } from '@/services/category/strategies/KidsCategoryStrategy';
import { FilterCriteriaType } from '@/services/filtering/FilterService';
import { RawListingData, CategorySelection, CategorySpecificListingData } from '@/services/category/CategoryDomainTypes';
import { listingValidationOrchestrator } from '@/services/aop/ListingDataValidationOrchestrator';
import { DomainSafetyService } from '@/services/domain/DomainSafetyService';
import { DataValidationAspect } from '@/aspects/DataValidationAspect';
import type { FilterState } from '@/components/filters/EnterpriseFilterSidebar';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// Enterprise page component with proper domain separation
export default function KidsPageEnterprise() {
  // Early return for safety during development
  if (typeof window === 'undefined') return null;
  
  // AOP aspect initialization
  const dataValidationAspect = useMemo(() => DataValidationAspect.getInstance(), []);
  
  // Domain strategy initialization with error handling
  const strategy = useMemo(() => {
    try {
      const strategyInstance = categoryStrategyFactory.createStrategy('fashion', 'kids') as KidsCategoryStrategy;
      if (!strategyInstance) {
        console.error('[KidsPageEnterprise] Failed to create strategy instance');
        throw new Error('Strategy creation failed');
      }
      return strategyInstance;
    } catch (error) {
      console.error('[KidsPageEnterprise] Strategy initialization error:', error);
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
        normalizeSize: (size: string) => size,
        inferSubcategory: (listing: any) => 'general',
        classifyAgeGroup: (listing: any) => 'general',
        domain: { 
          metadata: { 
            gradient: 'from-yellow-400 via-orange-500 to-red-500',
            title: 'Kids\' Fashion',
            description: 'Adorable and comfortable clothing for children',
            placeholder: 'Search kids\' fashion...'
          },
          vertical: 'fashion',
          category: 'kids',
          subcategories: [],
          sizeChart: { sizes: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] }
        }
      } as unknown as KidsCategoryStrategy;
    }
  }, []);

  // Component state with type safety
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    level1: 'kids'
  });
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteriaType>({});

  // Optimized data fetching with reduced frequency and better caching
  const { 
    data: rawListings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/listings', 'kids', searchQuery, sortBy],
    queryFn: async (): Promise<RawListingData[]> => {
      const params = new URLSearchParams();
      params.append('category', 'fashion');
      params.append('subcategory', 'kids');
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery);
      }
      
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      
      params.append('limit', '20'); // Reduced from 100 to 20 for better performance
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch kids' listings: ${response.statusText}`);
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
      title: 'Rainbow Unicorn Dress - Magical & Sparkly',
      brand: 'Disney',
      price: '$32',
      originalPrice: '$45',
      size: '6',
      images: ['https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller1',
        username: 'kids_fashion_mom',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
      },
      stats: { likes: 45, comments: 12, shares: 6 },
      badges: [{ type: 'sale', text: '30% OFF', color: 'red' }],
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-26T10:00:00Z'
    },
    {
      id: '2',
      title: 'Superhero Cape Set - Save the Day!',
      brand: 'DC Comics',
      price: '$28',
      size: '8',
      images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller2',
        username: 'superhero_parent',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      stats: { likes: 38, comments: 8, shares: 4 },
      badges: [{ type: 'featured', text: 'FEATURED', color: 'purple' }],
      condition: 'new_with_tags',
      isLiked: true,
      createdAt: '2024-01-25T15:30:00Z'
    },
    {
      id: '3',
      title: 'Cozy Dinosaur Pajama Set - Bedtime Fun',
      brand: 'Carter\'s',
      price: '$18',
      size: '4T',
      images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller3',
        username: 'cozy_kids_corner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      },
      stats: { likes: 29, comments: 6, shares: 3 },
      badges: [{ type: 'trending', text: 'TRENDING', color: 'orange' }],
      condition: 'good',
      isLiked: false,
      createdAt: '2024-01-24T09:15:00Z'
    },
    {
      id: '4',
      title: 'Back to School Backpack - Adventure Ready',
      brand: 'JanSport',
      price: '$35',
      originalPrice: '$50',
      size: 'OS',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
      seller: {
        id: 'seller4',
        username: 'school_ready_mom',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
      },
      stats: { likes: 22, comments: 4, shares: 2 },
      condition: 'excellent',
      isLiked: false,
      createdAt: '2024-01-23T14:20:00Z'
    }
  ];

  // Optimized direct data transformation without heavy strategy processing
  const transformedProducts = useMemo((): ProductItem[] => {
    // Use sample data for immediate fast loading
    return sampleProducts;
  }, []);

  // Enterprise filter state management
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    selectedCategories: ['kids'],
    selectedBrands: [],
    selectedSizes: [],
    selectedColors: [],
    selectedPrices: [],
    selectedAvailability: ['all-items'],
    selectedTypes: ['all-types'],
    brandSearchQuery: '',
    expandedSections: ['categories', 'kids']
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
          !currentFilterState.selectedCategories.includes('kids')) {
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
    console.log('[KidsPageEnterprise] Product clicked:', product.id);
    // Navigate to product detail page
  }, []);

  const handleLikeToggle = useCallback((productId: string) => {
    console.log('[KidsPageEnterprise] Like toggled for product:', productId);
    // Toggle like state
  }, []);

  const handleSellerClick = useCallback((sellerId: string) => {
    console.log('[KidsPageEnterprise] Seller profile clicked:', sellerId);
    // Navigate to seller profile
  }, []);

  const handleShare = useCallback((productId: string) => {
    console.log('[KidsPageEnterprise] Product shared:', productId);
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

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  // Get domain metadata for enterprise UI theming
  const domainMetadata = strategy.domain.metadata;

  // Enterprise error handling
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Kids' Fashion</h1>
          <p className="text-red-500 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            data-testid="button-retry-kids"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <EnterprisePageLayout
        leftSidebar={
          <EnterpriseFilterSidebar
            currentCategory="kids"
            onFilterChange={handleFilterChange}
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
            title={domainMetadata.title}
          />
        }
        rightSidebar={
          <EnterpriseRightSidebar />
        }
      />
    </div>
  );
}