/**
 * Universal Category Page Component
 * Enterprise AOP-compliant universal page template for ALL categories
 * 100% best practices, zero shortcuts, complete separation of concerns
 */

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';
import EnterpriseFilterSidebar from '@/components/filters/EnterpriseFilterSidebar';
import EnterpriseProductGrid from '@/components/grid/EnterpriseProductGrid';
import EnterpriseRightSidebar from '@/components/sidebar/EnterpriseRightSidebar';
import { universalCategoryPageFactory, UniversalPageConfiguration } from '@/services/category/UniversalCategoryPageFactory';
import { layoutSpacingAspect } from '@/services/aop/LayoutSpacingAspect';
import { ProductSizeComparison } from '@/debug/ProductSizeComparison';
import { Result } from '../../types/Result';
import { z } from 'zod';
import type { FilterState } from '@/components/filters/EnterpriseFilterSidebar';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface UniversalCategoryPageProps {
  readonly category: string;
  readonly subcategory?: string;
  readonly subSubcategory?: string;
  readonly className?: string;
}

interface CategoryPageState {
  readonly searchQuery: string;
  readonly sortBy: string;
  readonly filterState: FilterState;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly pageConfiguration: UniversalPageConfiguration | null;
}

// ===== VALIDATION SCHEMAS =====
const UniversalCategoryPagePropsSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  subSubcategory: z.string().optional(),
  className: z.string().optional()
});

const CategoryPageStateSchema = z.object({
  searchQuery: z.string(),
  sortBy: z.string(),
  filterState: z.object({
    selectedCategories: z.array(z.string()),
    selectedBrands: z.array(z.string()),
    selectedSizes: z.array(z.string()),
    selectedColors: z.array(z.string()),
    selectedPrices: z.array(z.string()),
    selectedAvailability: z.array(z.string()),
    selectedTypes: z.array(z.string()),
    brandSearchQuery: z.string(),
    expandedSections: z.array(z.string())
  }),
  isLoading: z.boolean(),
  error: z.any().nullable()
});

// ===== ENTERPRISE UNIVERSAL CATEGORY PAGE COMPONENT =====
const UniversalCategoryPage: React.FC<UniversalCategoryPageProps> = memo(({
  category,
  subcategory,
  subSubcategory,
  className = ''
}) => {
  // ===== HOOK DECLARATIONS FIRST - NO CONDITIONAL EXECUTION =====
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL LOGIC
  
  // Validate props using enterprise validation - ALWAYS EXECUTE
  const propsValidation = useMemo(() => {
    return UniversalCategoryPagePropsSchema.safeParse({ category, subcategory, subSubcategory, className });
  }, [category, subcategory, subSubcategory, className]);

  // Enterprise state management with validation - ALWAYS EXECUTE
  const [pageState, setPageState] = useState<CategoryPageState>({
    searchQuery: '',
    sortBy: 'newest',
    filterState: {
      selectedCategories: [category],
      selectedBrands: [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-types'],
      brandSearchQuery: '',
      expandedSections: ['categories', subcategory || category]
    },
    isLoading: true,
    error: null,
    pageConfiguration: null
  });

  // Load configuration asynchronously with enterprise error handling
  useEffect(() => {
    let isMounted = true;
    
    const loadConfiguration = async () => {
      console.log('[UniversalCategoryPage] Loading configuration for:', { category, subcategory, subSubcategory });
      
      try {
        setPageState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await universalCategoryPageFactory.getConfiguration(category, subcategory, subSubcategory);
        
        if (!isMounted) return;
        
        if (result.isError()) {
          console.error('[UniversalCategoryPage] Configuration error:', result.error);
          setPageState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: result.error,
            pageConfiguration: null 
          }));
          return;
        }
        
        console.log('[UniversalCategoryPage] Configuration loaded successfully:', { 
          hasValue: !!result.value,
          sampleProductsCount: result.value?.sampleProducts?.length || 0
        });
        
        setPageState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: null,
          pageConfiguration: result.value 
        }));
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('[UniversalCategoryPage] Unexpected error loading configuration:', error);
        setPageState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error('Unknown configuration error'),
          pageConfiguration: null 
        }));
      }
    };
    
    loadConfiguration();
    
    return () => {
      isMounted = false;
    };
  }, [category, subcategory, subSubcategory]);

  // ===== ALL useMemo HOOKS MUST BE DECLARED HERE - BEFORE CONDITIONAL RETURNS =====
  
  // Enterprise AOP spacing strategy calculation - ALWAYS EXECUTE
  const dynamicSpacing = useMemo(() => {
    const pageType = category === 'fashion' ? 'fashion' : 'general';
    
    const layoutContext = layoutSpacingAspect.createLayoutContext(
      pageType,
      'product-grid',
      '248px'
    );
    
    const spacing = layoutSpacingAspect.applySpacingStrategy(layoutContext);
    
    // DIAGNOSTIC LOG: Verify spacing strategy output
    console.log('[UniversalCategoryPage] Dynamic Spacing Debug:', {
      category,
      pageType,
      spacing,
      layoutContext
    });
    
    return spacing;
  }, [category]);
  
  // Generate sample products based on category configuration - ALWAYS EXECUTE
  const sampleProducts = useMemo((): ProductItem[] => {
    // Safe access to pageConfiguration with null checking
    const products = pageState.pageConfiguration?.sampleProducts || [];
    console.log('[UniversalCategoryPage] Sample products from configuration:', products);
    return [...products]; // Convert readonly array to mutable array
  }, [pageState.pageConfiguration]);

  // Frontend-only: Always use sample products from configuration - ALWAYS EXECUTE
  const displayProducts = useMemo(() => {
    console.log('[UniversalCategoryPage] Frontend-only mode - Using sample products:', sampleProducts);
    console.log('[UniversalCategoryPage] Sample products count:', sampleProducts.length);
    return sampleProducts;
  }, [sampleProducts]);

  // Apply enterprise filtering to products - ALWAYS EXECUTE
  const filteredProducts = useMemo(() => {
    if (!displayProducts || !Array.isArray(displayProducts)) {
      console.log('[UniversalCategoryPage] No displayProducts or not array:', displayProducts);
      return [];
    }
    
    console.log('[UniversalCategoryPage] Filtering products. Initial count:', displayProducts.length);
    console.log('[UniversalCategoryPage] Filter state:', {
      selectedBrands: pageState.filterState.selectedBrands,
      selectedCategories: pageState.filterState.selectedCategories,
      searchQuery: pageState.searchQuery.trim()
    });
    
    const filtered = displayProducts.filter(product => {
      // Apply brand filtering
      if (pageState.filterState.selectedBrands.length > 0) {
        const brandMatch = pageState.filterState.selectedBrands.some(brandId => 
          product.brand.toLowerCase().includes(brandId.toLowerCase())
        );
        if (!brandMatch) {
          console.log('[UniversalCategoryPage] Product filtered out by brand:', product.title, product.brand);
          return false;
        }
      }

      // Apply search query filtering
      if (pageState.searchQuery.trim()) {
        const query = pageState.searchQuery.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(query);
        const brandMatch = product.brand.toLowerCase().includes(query);
        if (!(titleMatch || brandMatch)) {
          console.log('[UniversalCategoryPage] Product filtered out by search:', product.title);
          return false;
        }
      }

      // CRITICAL FIX: Don't filter by category for sample products
      // Apply category filtering (use the correct database category)
      if (pageState.filterState.selectedCategories.length > 0) {
        // For sample products, skip category filtering since they don't have database categories
        // Sample products are category-specific by design and don't need additional filtering
        const hasProductCategory = 'category' in product && product.category !== undefined;
        if (hasProductCategory && !pageState.filterState.selectedCategories.includes(category)) {
          console.log('[UniversalCategoryPage] Product filtered out by category:', product.title);
          return false;
        }
      }

      return true;
    });
    
    console.log('[UniversalCategoryPage] Final filtered count:', filtered.length);
    return filtered;
  }, [displayProducts, pageState.filterState, pageState.searchQuery, category]);

  // ===== ALL useCallback HOOKS MUST BE DECLARED HERE - BEFORE CONDITIONAL RETURNS =====

  // Enterprise event handlers with validation - ALWAYS EXECUTE
  const handleFilterChange = useCallback((newFilterState: FilterState) => {
    // Validate filter state
    const validation = CategoryPageStateSchema.safeParse({
      ...pageState,
      filterState: newFilterState
    });

    if (validation.success) {
      setPageState(prev => ({
        ...prev,
        filterState: newFilterState
      }));
    } else {
      console.warn('[UniversalCategoryPage] Invalid filter state:', validation.error);
    }
  }, [pageState]);

  const handleSearchChange = useCallback((query: string) => {
    // Validate search query
    if (typeof query === 'string' && query.length <= 100) {
      setPageState(prev => ({
        ...prev,
        searchQuery: query
      }));
    } else {
      console.warn('[UniversalCategoryPage] Invalid search query:', query);
    }
  }, []);

  const handleSortChange = useCallback((newSortBy: string) => {
    const validSorts = ['newest', 'price_low', 'price_high', 'most_liked', 'trending'];
    
    if (validSorts.includes(newSortBy)) {
      setPageState(prev => ({
        ...prev,
        sortBy: newSortBy
      }));
    } else {
      console.warn('[UniversalCategoryPage] Invalid sort option:', newSortBy);
    }
  }, []);

  const handleProductClick = useCallback((product: ProductItem) => {
    console.log(`[UniversalCategoryPage] ${category} product clicked:`, product.id);
    // Navigate to product detail page
  }, [category]);

  const handleLikeToggle = useCallback((productId: string) => {
    console.log(`[UniversalCategoryPage] ${category} like toggled:`, productId);
    // Toggle like state
  }, [category]);

  const handleSellerClick = useCallback((sellerId: string) => {
    console.log(`[UniversalCategoryPage] ${category} seller clicked:`, sellerId);
    // Navigate to seller profile
  }, [category]);

  const handleShare = useCallback((productId: string) => {
    console.log(`[UniversalCategoryPage] ${category} product shared:`, productId);
    // Handle sharing functionality
  }, [category]);

  // ===== CONDITIONAL RENDERING LOGIC - AFTER ALL HOOKS =====
  
  // SSR safety check
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  // Props validation error handling
  if (!propsValidation.success) {
    console.error('[UniversalCategoryPage] Invalid props:', propsValidation.error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Page Configuration</h1>
          <p className="text-red-500 mb-4">Invalid category or subcategory provided</p>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (pageState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Category...</h2>
          <p className="text-gray-500">Preparing {category} {subcategory && `- ${subcategory}`}</p>
        </div>
      </div>
    );
  }

  // Handle configuration errors
  if (pageState.error || !pageState.pageConfiguration) {
    const errorMessage = pageState.error?.message || 'Configuration not found';
    console.error('[UniversalCategoryPage] Configuration error:', errorMessage);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            data-testid="button-retry-configuration"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pageConfiguration = pageState.pageConfiguration;

  // Enterprise error handling - REMOVED DUPLICATE ERROR HANDLING
  // Error handling is already performed above for pageState.error

  // Add debug logging for troubleshooting
  console.log('[UniversalCategoryPage] Rendering with:', {
    category,
    subcategory,
    title: pageConfiguration.metadata.title,
    filteredProductsCount: filteredProducts.length,
    isLoading: pageState.isLoading,
    hasPageConfiguration: !!pageConfiguration,
    sampleProductsCount: pageConfiguration?.sampleProducts?.length || 0,
    displayProductsCount: displayProducts.length
  });

  // Debug: Log sample products to console
  if (pageConfiguration?.sampleProducts) {
    console.log('[UniversalCategoryPage] Sample products available:', pageConfiguration.sampleProducts);
  }

  // DIAGNOSTIC: Log render details
  console.log('🔍 [UniversalCategoryPage] Container wrapper:', {
    category,
    subcategory,
    dynamicSpacing,
    containerClass: `max-w-7xl mx-auto ${dynamicSpacing} py-6`,
    timestamp: new Date().toISOString()
  });

  // Render universal three-column layout matching original Women's page structure
  return (
    <div className="min-h-screen bg-gray-50" data-testid="universal-category-page">
      {/* Always render Header and Navigation - not authentication dependent */}
      <Header />
      <Navigation />
      
      {/* Three-column layout with full viewport width for ~248px products */}
      {/* 🚨 AGENT WARNING:
          1. Do NOT modify any other code—this single line only.
          2. If you see any errors or unexpected behavior, STOP immediately and ask for instruction.
          3. No guessing, no lazy fixes—only 100% best practices, enterprise-grade code. */}
      <div className={`max-w-7xl mx-auto ${dynamicSpacing} py-6`} data-testid="page-layout-container">
        <EnterprisePageLayout
          leftSidebar={
            <div data-testid="left-sidebar-container">
              <EnterpriseFilterSidebar
                currentCategory={subcategory || category}
                onFilterChange={handleFilterChange}
                isLoading={pageState.isLoading}
              />
            </div>
          }
          mainContent={
            <div data-testid="main-content-container">
              <ProductSizeComparison />
              <EnterpriseProductGrid
                products={filteredProducts}
                onProductClick={handleProductClick}
                onLikeToggle={handleLikeToggle}
                onSellerClick={handleSellerClick}
                onShare={handleShare}
                isLoading={pageState.isLoading}
                title={pageConfiguration.metadata.title}
                gridColumns={4}
              />
            </div>
          }
          rightSidebar={
            <div data-testid="right-sidebar-container">
              <EnterpriseRightSidebar />
            </div>
          }
          dynamicPadding="px-0"
        />
      </div>
    </div>
  );
});

// Set display name for debugging
UniversalCategoryPage.displayName = 'UniversalCategoryPage';

// ===== EXPORTS =====
export default UniversalCategoryPage;
export type { UniversalCategoryPageProps, CategoryPageState };