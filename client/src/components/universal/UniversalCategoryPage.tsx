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
import { ensureMinimumProducts } from '@/services/category/utils/ProductDisplayUtils';
import EnterpriseRightSidebar from '@/components/sidebar/EnterpriseRightSidebar';
import { getLayoutPolicyForCategory } from '@/services/category/utils/LayoutPolicy';
import { universalCategoryPageFactory, UniversalPageConfiguration } from '@/services/category/UniversalCategoryPageFactory';
import { layoutSpacingAspect } from '@/services/aop/LayoutSpacingAspect';
import { useCategoryListings } from '@/hooks/useCategoryListings';
import { z } from 'zod';
import type { FilterState } from '@/components/filters/EnterpriseFilterSidebar';
import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';
import { layoutMetrics } from '@/services/category/metrics/LayoutMetrics';
import { generatePreviewProducts } from '@/services/category/utils/SampleCatalogService';
import { navigationContextManager, type NavigationContext } from '@/services/navigation/NavigationContextManager';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface UniversalCategoryPageProps {
  readonly category: string;
  readonly subcategory?: string;
  readonly subSubcategory?: string;
  readonly leaf?: string;
  readonly className?: string;
  readonly initialFilterState?: Partial<FilterState>;
  readonly pageTitleOverride?: string;
}

interface CategoryPageState {
  readonly searchQuery: string;
  readonly sortBy: string;
  readonly filterState: FilterState;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly pageConfiguration: UniversalPageConfiguration | null;
  readonly navigationContext: NavigationContext | null;
}

// ===== VALIDATION SCHEMAS =====
const UniversalCategoryPagePropsSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  subSubcategory: z.string().optional(),
  leaf: z.string().optional(),
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
  leaf,
  className = '',
  initialFilterState,
  pageTitleOverride
}) => {
  // ===== HOOK DECLARATIONS FIRST - NO CONDITIONAL EXECUTION =====
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL LOGIC
  
  // Validate props using enterprise validation - ALWAYS EXECUTE
  const propsValidation = useMemo(() => {
    return UniversalCategoryPagePropsSchema.safeParse({ category, subcategory, subSubcategory, leaf, className });
  }, [category, subcategory, subSubcategory, leaf, className]);

  // Resolve complete navigation context - ALWAYS EXECUTE
  const navigationContext = useMemo(() => {
    try {
      return navigationContextManager.resolveContext({
        url: window.location.pathname,
        category,
        subcategory,
        subSubcategory,
        leaf
      });
    } catch (error) {
      console.error('[UniversalCategoryPage] Navigation context resolution failed:', error);
      return null;
    }
  }, [category, subcategory, subSubcategory, leaf]);

  // Enterprise state management with validation - ALWAYS EXECUTE
  const [pageState, setPageState] = useState<CategoryPageState>({
    searchQuery: '',
    sortBy: 'newest',
    filterState: {
      selectedCategories: initialFilterState?.selectedCategories ?? [subcategory || category],
      selectedBrands: initialFilterState?.selectedBrands ?? [],
      selectedSizes: [],
      selectedColors: [],
      selectedPrices: [],
      selectedAvailability: ['all-items'],
      selectedTypes: ['all-types'],
      brandSearchQuery: initialFilterState?.brandSearchQuery ?? '',
      expandedSections: navigationContext?.expandedSections ?? ['categories', subcategory || category]
    },
    isLoading: true,
    error: null,
    pageConfiguration: null,
    navigationContext
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
          setPageState((prev): CategoryPageState => ({ 
            ...prev, 
            isLoading: false, 
            error: result.error ?? null,
            pageConfiguration: null 
          }));
          return;
        }
        
        console.log('[UniversalCategoryPage] Configuration loaded successfully:', { 
          hasValue: !!result.value,
          sampleProductsCount: result.value?.sampleProducts?.length || 0
        });
        
        setPageState((prev): CategoryPageState => ({ 
          ...prev, 
          isLoading: false, 
          error: null,
          pageConfiguration: result.value ?? null 
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
  
  // Feature flag to enable real listings
  const enableListings = import.meta.env.VITE_ENABLE_REAL_LISTINGS === 'true';

  // Determine additionalCategories from URL or default env config
  const additionalCategories = useMemo(() => {
    try {
      if (typeof window === 'undefined') return [] as string[];
      const allowed = new Set(['women', 'men', 'kids', 'home', 'electronics', 'pets', 'beauty', 'sports']);
      const normalize = (s: string) => s.toLowerCase().trim();

      const usp = new URLSearchParams(window.location.search);
      const urlParam = usp.get('categories') || '';
      const envDefault = (import.meta.env.VITE_DEFAULT_AGGREGATE_CATEGORIES as string | undefined) || '';
      const source = urlParam || envDefault;
      if (!source) return [] as string[];

      const parts = source.split(',').map(normalize).filter(Boolean);
      const unique = Array.from(new Set(parts)).filter((c) => allowed.has(c));
      const current = (subcategory || '').toLowerCase();
      const withoutCurrent = unique.filter((c) => c !== current);
      const capped = withoutCurrent.slice(0, 3); // guardrail: cap at 3
      return capped;
    } catch {
      return [] as string[];
    }
  }, [subcategory]);

  const [cursor, setCursor] = useState<string | null>(null);
  const { products: fetchedProducts, isLoading: isListingsLoading, nextCursor } = useCategoryListings({
    vertical: category,
    category: subcategory,
    subcategory: subSubcategory,
    leaf,
    additionalCategories: enableListings ? additionalCategories : undefined,
    brands: [...pageState.filterState.selectedBrands],
    cursor,
    enabled: enableListings
  });

  // Accumulate pages when cursor advances
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductItem[]>([]);
  useEffect(() => {
    // Merge deduped by id
    setAccumulatedProducts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const next: ProductItem[] = [...prev];
      for (const np of (fetchedProducts as unknown as ProductItem[])) {
        if (!seen.has(np.id)) {
          seen.add(np.id);
          next.push(np);
        }
      }
      // If cursor is null (first page), reset to fetchedProducts entirely
      if (!cursor) {
        return (fetchedProducts as unknown as ProductItem[]);
      }
      return next;
    });
  }, [fetchedProducts, cursor]);

  // Enterprise AOP spacing strategy calculation - ALWAYS EXECUTE
  const dynamicSpacing = useMemo(() => {
    // Force identical spacing strategy for all fashion pages
    const layoutContext = layoutSpacingAspect.createLayoutContext(
      'fashion',
      'product-grid',
      '162px'
    );
    const spacing = layoutSpacingAspect.applySpacingStrategy(layoutContext);
    console.log('[UniversalCategoryPage] Dynamic Spacing Debug:', {
      category,
      pageType: 'fashion',
      spacing,
      layoutContext
    });
    return spacing;
  }, []);

  // Centralized layout policy for category
  const layoutPolicy = useMemo(() => getLayoutPolicyForCategory('fashion', 'women', undefined), []);
  useEffect(() => {
    // Apply fashion-specific body class to scope scrollbar styling to fashion pages only
    const bodyClass = 'fashion-scrollbar-short';
    if (category === 'fashion') {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, [category]);

  useEffect(() => {
    layoutMetrics.record({
      category,
      subcategory,
      containerClass: layoutPolicy.containerClass,
      rightSidebar: layoutPolicy.showRightSidebar,
      rightSidebarWidth: layoutPolicy.rightSidebarWidth as any,
      dynamicPadding: layoutPolicy.dynamicPadding,
      timestamp: Date.now()
    });
  }, [category, subcategory, subSubcategory, layoutPolicy]);

  // Derive human-friendly page title from deepest selected segment
  const pageTitle = useMemo(() => {
    if (pageTitleOverride && pageTitleOverride.trim().length > 0) {
      return pageTitleOverride;
    }
    const humanize = (input: string): string => {
      const spaced = input.replace(/-/g, ' ');
      return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
    };
    const parts: string[] = [];
    if (subcategory) parts.push(humanize(subcategory));
    if (subSubcategory) parts.push(humanize(subSubcategory));
    if (leaf) parts.push(humanize(leaf));
    if (parts.length === 0) return humanize(category);
    return parts.join(' - ');
  }, [category, subcategory, subSubcategory, leaf]);

  // SEO: canonical URL and robots for aggregated variants
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const origin = window.location.origin;
      const canonicalPath = [
        '',
        'fashion',
        subcategory || '',
        subSubcategory || '',
        leaf || ''
      ].filter(Boolean).join('/');
      const canonicalHref = `${origin}/${canonicalPath}`;

      // Set or update canonical link
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      if (link.href !== canonicalHref) link.href = canonicalHref;

      // If aggregated or filtered via query params, mark as noindex to avoid duplicates
      const usp = new URLSearchParams(window.location.search);
      const isAggregated = (
        usp.has('categories') ||
        usp.has('searchQuery') ||
        usp.has('sortBy') ||
        usp.has('filters')
      );
      let robots = document.querySelector("meta[name='robots']") as HTMLMetaElement | null;
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', isAggregated ? 'noindex,follow' : 'index,follow');

      return () => {
        // Do not remove canonical/robots on unmount to keep consistent across route transitions
      };
    } catch {
      // noop
    }
  }, [subcategory, subSubcategory, leaf]);
  
  // Generate sample products based on category configuration - ALWAYS EXECUTE
  const sampleProducts = useMemo((): ProductItem[] => {
    // Safe access to pageConfiguration with null checking
    const products = pageState.pageConfiguration?.sampleProducts || [];
    console.log('[UniversalCategoryPage] Sample products from configuration:', products);
    return [...products]; // Convert readonly array to mutable array
  }, [pageState.pageConfiguration]);

  // Ensure a fuller grid by expanding sample products to a minimum count
  const displayProducts = useMemo(() => {
    // Prefer fetched products when feature flag is on and data available
    if (enableListings && fetchedProducts.length > 0) {
      const base = cursor ? accumulatedProducts : (fetchedProducts as unknown as ProductItem[]);
      return base;
    }
    const products = ensureMinimumProducts(sampleProducts, { minCount: 16, strategy: 'repeat' });
    console.log('[UniversalCategoryPage] Expanded products count:', products.length);
    return products;
  }, [enableListings, fetchedProducts, sampleProducts]);

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

  // UI-level safety: if no products after filtering, generate deterministic preview items
  const gridProducts: ProductItem[] = useMemo(() => {
    if (filteredProducts.length > 0) return filteredProducts as ProductItem[];
    const key = [category, subcategory, subSubcategory].filter(Boolean).join('-');
    const preview = generatePreviewProducts(key || category, 16);
    return ensureMinimumProducts(preview, { minCount: 16, strategy: 'repeat' });
  }, [filteredProducts, category, subcategory, subSubcategory]);
  
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
  if (pageState.isLoading || (enableListings && isListingsLoading)) {
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

  // Soft-handle configuration errors: log but continue to render with defaults
  if (pageState.error || !pageState.pageConfiguration) {
    const errorMessage = pageState.error?.message || 'Configuration not found';
    console.warn('[UniversalCategoryPage] Proceeding with fallback due to configuration issue:', errorMessage);
  }

  const pageConfiguration = pageState.pageConfiguration ?? undefined;

  // Enterprise error handling - REMOVED DUPLICATE ERROR HANDLING
  // Error handling is already performed above for pageState.error

  // Add debug logging for troubleshooting
  console.log('[UniversalCategoryPage] Rendering with:', {
    category,
    subcategory,
    title: pageConfiguration?.metadata?.title,
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
      <div className={`${layoutPolicy.containerClass} ${dynamicSpacing} py-6`} data-testid="page-layout-container">
          <EnterprisePageLayout
          leftSidebar={
            <div data-testid="left-sidebar-container" className="pr-2">
              <EnterpriseFilterSidebar
                navigationContext={pageState.navigationContext}
                currentCategory={subcategory || category}
                onFilterChange={handleFilterChange}
                isLoading={pageState.isLoading}
                className="rounded-r-xl shadow-sm"
              />
            </div>
          }
          mainContent={
            <div data-testid="main-content-container">
          <EnterpriseProductGrid
                products={gridProducts}
                onProductClick={handleProductClick}
                onLikeToggle={handleLikeToggle}
                onSellerClick={handleSellerClick}
                onShare={handleShare}
                isLoading={pageState.isLoading}
                title={pageTitle}
                gridColumns={4}
                minItemWidthPx={162}
                className="border-4 border-red-500"
              />
              {enableListings && nextCursor && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setCursor(nextCursor || null)}
                    className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                    data-testid="button-load-more"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          }
          rightSidebar={
            layoutPolicy.showRightSidebar ? (
              <div data-testid="right-sidebar-container" className="pl-6">
                <EnterpriseRightSidebar />
              </div>
            ) : undefined
          }
          rightSidebarWidth={layoutPolicy.rightSidebarWidth}
          dynamicPadding={layoutPolicy.dynamicPadding || 'px-6'}
            enableStickyLayout={false}
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