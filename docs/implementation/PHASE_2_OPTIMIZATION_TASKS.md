# PHASE 2: OPTIMIZATION IMPLEMENTATION TASKS (Week 3-4)

## 🎯 **PHASE 2 OBJECTIVES**
- Implement fashion-specific optimizations and features
- Add AI-powered search and recommendations
- Performance optimization and caching
- Remove legacy schema references
- Enhanced user experience improvements

## 📋 **TASK 2.1: AI-POWERED FASHION SEARCH**

### **Task 2.1.1: Vector Search Implementation**
**Assignee**: Backend Engineer + ML Engineer  
**Estimate**: 5 days  
**Priority**: P0 (Critical)

**Requirements**:
```typescript
// server/services/FashionSearchService.ts
export class FashionSearchService {
  constructor(
    private vectorService: VectorSearchService,
    private database: Database,
    private cacheService: CacheService
  ) {}

  async searchFashionListings(
    query: FashionSearchQuery
  ): Promise<FashionSearchResult> {
    // 1. Generate query embeddings
    const queryEmbedding = await this.vectorService.generateQueryEmbedding({
      searchText: query.text,
      category: query.category,
      filters: query.filters
    });

    // 2. Perform vector similarity search
    const vectorResults = await this.database.execute(sql`
      SELECT 
        fl.*,
        1 - (fl.combined_embedding <=> ${queryEmbedding}) as similarity_score
      FROM fashion_listings fl
      WHERE 
        fl.status = 'active'
        ${query.category ? sql`AND fl.fashion_category = ${query.category}` : sql``}
        ${query.priceRange ? sql`AND fl.price BETWEEN ${query.priceRange.min} AND ${query.priceRange.max}` : sql``}
        AND 1 - (fl.combined_embedding <=> ${queryEmbedding}) > 0.7
      ORDER BY similarity_score DESC
      LIMIT ${query.limit || 20}
    `);

    // 3. Apply business logic filters
    const filteredResults = await this.applyBusinessFilters(vectorResults, query);

    // 4. Enhance with recommendation scores
    const enhancedResults = await this.addRecommendationScores(filteredResults, query);

    // 5. Cache results for performance
    await this.cacheService.set(
      `fashion_search:${this.generateCacheKey(query)}`,
      enhancedResults,
      300 // 5 minutes
    );

    return {
      items: enhancedResults,
      totalCount: enhancedResults.length,
      searchMetadata: {
        similarity_threshold: 0.7,
        processing_time_ms: Date.now() - startTime,
        cache_hit: false
      }
    };
  }

  async getSearchSuggestions(
    partialQuery: string,
    category?: FashionCategory
  ): Promise<SearchSuggestion[]> {
    // Implementation for autocomplete/suggestions
  }

  async getRecommendedItems(
    userId: string,
    context: RecommendationContext
  ): Promise<FashionListing[]> {
    // AI-powered personalized recommendations
  }
}

interface FashionSearchQuery {
  text: string;
  category?: FashionCategory;
  subcategory?: string;
  brand?: string;
  priceRange?: { min: number; max: number };
  condition?: ProductCondition[];
  size?: string;
  color?: string;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'popularity';
  limit?: number;
  offset?: number;
}

interface FashionSearchResult {
  items: FashionListingWithScore[];
  totalCount: number;
  searchMetadata: SearchMetadata;
  suggestions?: SearchSuggestion[];
  filters?: AppliedFilters;
}
```

**Deliverables**:
- [ ] Vector search service implementation
- [ ] Embedding generation optimized for fashion
- [ ] Search result ranking algorithm
- [ ] Autocomplete/suggestion system
- [ ] Performance benchmarking
- [ ] A/B testing framework for search relevance

**Acceptance Criteria**:
- [ ] Search response time < 300ms
- [ ] Relevance score > 85% for fashion queries
- [ ] Vector similarity threshold optimized
- [ ] Autocomplete response time < 100ms
- [ ] Search conversion rate improvement > 15%

### **Task 2.1.2: Fashion-Specific Search API**
**Assignee**: Backend Engineer  
**Estimate**: 3 days  
**Priority**: P1 (High)

**Requirements**:
```typescript
// server/routes/fashion-search.ts
export function registerFashionSearchRoutes(app: Express) {
  // Advanced fashion search
  app.get('/api/fashion/search',
    validateRequest(FashionSearchQuerySchema),
    cacheMiddleware({ ttl: 300, varyBy: ['query', 'category', 'filters'] }),
    async (req, res) => {
      try {
        const searchQuery = FashionSearchQuerySchema.parse(req.query);
        
        const results = await fashionSearchService.searchFashionListings(searchQuery);
        
        // Track search analytics
        await analyticsService.trackEvent('fashion_search', {
          query: searchQuery.text,
          category: searchQuery.category,
          results_count: results.totalCount,
          user_id: req.user?.claims.sub
        });

        res.json(results);
      } catch (error) {
        console.error('Fashion search error:', error);
        res.status(500).json({ message: 'Search failed' });
      }
    }
  );

  // Search suggestions/autocomplete
  app.get('/api/fashion/search/suggestions',
    validateRequest(z.object({
      q: z.string().min(1).max(100),
      category: z.enum(FASHION_CATEGORIES).optional(),
      limit: z.coerce.number().min(1).max(10).default(5)
    })),
    cacheMiddleware({ ttl: 600 }),
    async (req, res) => {
      try {
        const { q, category, limit } = req.query;
        
        const suggestions = await fashionSearchService.getSearchSuggestions(
          q as string,
          category as FashionCategory,
          limit as number
        );

        res.json({ suggestions });
      } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({ message: 'Failed to get suggestions' });
      }
    }
  );

  // Personalized recommendations
  app.get('/api/fashion/recommendations',
    authMiddleware,
    validateRequest(z.object({
      type: z.enum(['similar', 'trending', 'personalized']).default('personalized'),
      category: z.enum(FASHION_CATEGORIES).optional(),
      limit: z.coerce.number().min(1).max(20).default(10)
    })),
    cacheMiddleware({ ttl: 300, varyBy: ['user_id', 'type', 'category'] }),
    async (req: AuthenticatedRequest, res) => {
      try {
        const userId = req.user.claims.sub;
        const { type, category, limit } = req.query;

        const recommendations = await fashionSearchService.getRecommendedItems(
          userId,
          {
            type: type as RecommendationType,
            category: category as FashionCategory,
            limit: limit as number
          }
        );

        res.json({ recommendations });
      } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ message: 'Failed to get recommendations' });
      }
    }
  );
}
```

**Deliverables**:
- [ ] Search API endpoints with advanced filtering
- [ ] Autocomplete/suggestions API
- [ ] Personalized recommendations API
- [ ] Analytics tracking integration
- [ ] Caching strategy implementation
- [ ] Rate limiting configuration

**Acceptance Criteria**:
- [ ] All endpoints properly validated and secured
- [ ] Response times meet performance targets
- [ ] Caching reduces database load by 60%
- [ ] Analytics properly tracked
- [ ] API documentation complete

## 📋 **TASK 2.2: ADVANCED FASHION FILTERS**

### **Task 2.2.1: Enhanced Filter System**
**Assignee**: Frontend Engineer + Backend Engineer  
**Estimate**: 4 days  
**Priority**: P1 (High)

**Requirements**:
```typescript
// client/src/components/fashion/FashionFilterSidebar.tsx
interface FashionFilterSidebarProps {
  category: FashionCategory;
  appliedFilters: FashionFilters;
  onFiltersChange: (filters: FashionFilters) => void;
  availableFilters: AvailableFilters;
  isLoading?: boolean;
}

export function FashionFilterSidebar({
  category,
  appliedFilters,
  onFiltersChange,
  availableFilters,
  isLoading = false
}: FashionFilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FashionFilters>(appliedFilters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'price', 'condition'])
  );

  // Debounced filter application
  const debouncedFilterChange = useMemo(
    () => debounce((filters: FashionFilters) => {
      onFiltersChange(filters);
    }, 300),
    [onFiltersChange]
  );

  useEffect(() => {
    if (!isEqual(localFilters, appliedFilters)) {
      debouncedFilterChange(localFilters);
    }
  }, [localFilters, appliedFilters, debouncedFilterChange]);

  const handleFilterChange = useCallback(<T extends keyof FashionFilters>(
    filterType: T,
    value: FashionFilters[T]
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: FashionFilters = {
      subcategories: [],
      brands: [],
      priceRange: { min: 0, max: 10000 },
      conditions: [],
      sizes: [],
      colors: [],
      materials: [],
      styleTags: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  return (
    <div className="fashion-filter-sidebar space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={isLoading}
        >
          Clear All
        </Button>
      </div>

      {/* Active Filters */}
      <ActiveFiltersDisplay
        filters={localFilters}
        onRemoveFilter={handleFilterChange}
      />

      {/* Subcategory Filter */}
      <FilterSection
        title="Category"
        isExpanded={expandedSections.has('category')}
        onToggle={() => toggleSection('category')}
      >
        <SubcategoryFilter
          category={category}
          selectedSubcategories={localFilters.subcategories}
          availableSubcategories={availableFilters.subcategories}
          onChange={(subcategories) => handleFilterChange('subcategories', subcategories)}
          disabled={isLoading}
        />
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price"
        isExpanded={expandedSections.has('price')}
        onToggle={() => toggleSection('price')}
      >
        <PriceRangeFilter
          value={localFilters.priceRange}
          min={availableFilters.priceRange.min}
          max={availableFilters.priceRange.max}
          onChange={(priceRange) => handleFilterChange('priceRange', priceRange)}
          disabled={isLoading}
        />
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection
        title="Brand"
        isExpanded={expandedSections.has('brand')}
        onToggle={() => toggleSection('brand')}
      >
        <BrandFilter
          selectedBrands={localFilters.brands}
          availableBrands={availableFilters.brands}
          onChange={(brands) => handleFilterChange('brands', brands)}
          disabled={isLoading}
        />
      </FilterSection>

      {/* Size Filter (category-specific) */}
      {CATEGORY_SIZE_MAPPINGS[category] && (
        <FilterSection
          title="Size"
          isExpanded={expandedSections.has('size')}
          onToggle={() => toggleSection('size')}
        >
          <SizeFilter
            category={category}
            selectedSizes={localFilters.sizes}
            availableSizes={availableFilters.sizes}
            onChange={(sizes) => handleFilterChange('sizes', sizes)}
            disabled={isLoading}
          />
        </FilterSection>
      )}

      {/* Condition Filter */}
      <FilterSection
        title="Condition"
        isExpanded={expandedSections.has('condition')}
        onToggle={() => toggleSection('condition')}
      >
        <ConditionFilter
          selectedConditions={localFilters.conditions}
          onChange={(conditions) => handleFilterChange('conditions', conditions)}
          disabled={isLoading}
        />
      </FilterSection>

      {/* Color Filter */}
      <FilterSection
        title="Color"
        isExpanded={expandedSections.has('color')}
        onToggle={() => toggleSection('color')}
      >
        <ColorFilter
          selectedColors={localFilters.colors}
          availableColors={availableFilters.colors}
          onChange={(colors) => handleFilterChange('colors', colors)}
          disabled={isLoading}
        />
      </FilterSection>

      {/* Material Filter (for applicable categories) */}
      {CATEGORIES_WITH_MATERIALS.includes(category) && (
        <FilterSection
          title="Material"
          isExpanded={expandedSections.has('material')}
          onToggle={() => toggleSection('material')}
        >
          <MaterialFilter
            selectedMaterials={localFilters.materials}
            availableMaterials={availableFilters.materials}
            onChange={(materials) => handleFilterChange('materials', materials)}
            disabled={isLoading}
          />
        </FilterSection>
      )}

      {/* Style Tags Filter */}
      <FilterSection
        title="Style"
        isExpanded={expandedSections.has('style')}
        onToggle={() => toggleSection('style')}
      >
        <StyleTagsFilter
          selectedStyleTags={localFilters.styleTags}
          availableStyleTags={availableFilters.styleTags}
          onChange={(styleTags) => handleFilterChange('styleTags', styleTags)}
          disabled={isLoading}
        />
      </FilterSection>
    </div>
  );
}
```

**Deliverables**:
- [ ] Advanced filter sidebar component
- [ ] Category-specific filter options
- [ ] Real-time filter application with debouncing
- [ ] Filter state management
- [ ] Mobile-responsive filter interface
- [ ] Accessibility compliance

**Acceptance Criteria**:
- [ ] Filters update results in real-time
- [ ] Performance optimized with debouncing
- [ ] Mobile interface is user-friendly
- [ ] Filters persist across navigation
- [ ] Clear visual feedback for applied filters
- [ ] WCAG 2.1 AA compliance

### **Task 2.2.2: Filter Analytics and Optimization**
**Assignee**: Data Engineer + Frontend Engineer  
**Estimate**: 2 days  
**Priority**: P2 (Medium)

**Requirements**:
```typescript
// server/services/FilterAnalyticsService.ts
export class FilterAnalyticsService {
  constructor(
    private database: Database,
    private analyticsService: AnalyticsService
  ) {}

  async trackFilterUsage(
    userId: string | null,
    filters: FashionFilters,
    resultsCount: number
  ): Promise<void> {
    await this.analyticsService.trackEvent('fashion_filter_applied', {
      user_id: userId,
      filters: filters,
      results_count: resultsCount,
      timestamp: new Date()
    });
  }

  async getPopularFilters(
    category: FashionCategory,
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<PopularFilters> {
    // Analyze most commonly used filters for optimization
  }

  async generateFilterRecommendations(
    userId: string,
    currentFilters: FashionFilters
  ): Promise<FilterRecommendation[]> {
    // Suggest additional filters based on user behavior
  }
}
```

**Deliverables**:
- [ ] Filter usage analytics tracking
- [ ] Popular filters analysis
- [ ] Filter recommendation system
- [ ] Performance metrics dashboard
- [ ] A/B testing for filter UI

**Acceptance Criteria**:
- [ ] All filter interactions tracked
- [ ] Analytics dashboard functional
- [ ] Filter recommendations improve conversion
- [ ] Performance metrics within targets

## 📋 **TASK 2.3: PERFORMANCE OPTIMIZATION**

### **Task 2.3.1: Database Query Optimization**
**Assignee**: Database Engineer  
**Estimate**: 3 days  
**Priority**: P0 (Critical)

**Requirements**:
```sql
-- Optimized indexes for fashion listings
CREATE INDEX CONCURRENTLY idx_fashion_listings_category_status 
ON fashion_listings(fashion_category, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_fashion_listings_price_range 
ON fashion_listings(price) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_fashion_listings_created_desc 
ON fashion_listings(created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_fashion_listings_seller_status 
ON fashion_listings(seller_id, status);

-- Composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY idx_fashion_listings_category_brand_condition 
ON fashion_listings(fashion_category, brand, condition) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_fashion_listings_category_price_created 
ON fashion_listings(fashion_category, price, created_at DESC) 
WHERE status = 'active';

-- Vector search optimization
CREATE INDEX CONCURRENTLY idx_fashion_listings_embedding_cosine 
ON fashion_listings USING ivfflat(combined_embedding vector_cosine_ops) 
WITH (lists = 1000);

-- Partial indexes for performance
CREATE INDEX CONCURRENTLY idx_fashion_listings_promoted 
ON fashion_listings(fashion_category, created_at DESC) 
WHERE status = 'active' AND is_promoted = true;
```

**Performance Targets**:
```typescript
// server/services/FashionListingService.ts (Optimized)
export class OptimizedFashionListingService {
  async getFashionListingsOptimized(
    filters: FashionFilters,
    pagination: PaginationOptions,
    sortBy: SortOption = 'newest'
  ): Promise<PaginatedResponse<FashionListing>> {
    // Query optimization with proper index usage
    const queryBuilder = this.database
      .select({
        id: fashionListings.id,
        title: fashionListings.title,
        price: fashionListings.price,
        images: fashionListings.images,
        fashionCategory: fashionListings.fashionCategory,
        brand: fashionListings.brand,
        condition: fashionListings.condition,
        createdAt: fashionListings.createdAt,
        // Selective field loading for performance
      })
      .from(fashionListings)
      .where(eq(fashionListings.status, 'active'));

    // Apply filters with optimized conditions
    if (filters.fashionCategory) {
      queryBuilder.where(eq(fashionListings.fashionCategory, filters.fashionCategory));
    }

    if (filters.priceRange) {
      queryBuilder.where(
        and(
          gte(fashionListings.price, filters.priceRange.min),
          lte(fashionListings.price, filters.priceRange.max)
        )
      );
    }

    if (filters.brands?.length > 0) {
      queryBuilder.where(
        inArray(fashionListings.brand, filters.brands)
      );
    }

    // Optimized sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder.orderBy(desc(fashionListings.createdAt));
        break;
      case 'price_low':
        queryBuilder.orderBy(asc(fashionListings.price));
        break;
      case 'price_high':
        queryBuilder.orderBy(desc(fashionListings.price));
        break;
      case 'popularity':
        queryBuilder.orderBy(desc(fashionListings.likesCount));
        break;
    }

    // Pagination with LIMIT/OFFSET optimization
    const items = await queryBuilder
      .limit(pagination.limit)
      .offset(pagination.offset);

    // Efficient count query
    const totalCount = await this.getCachedCount(filters);

    return {
      items,
      total: totalCount,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalCount / pagination.limit)
    };
  }

  private async getCachedCount(filters: FashionFilters): Promise<number> {
    const cacheKey = `fashion_count:${JSON.stringify(filters)}`;
    
    let count = await this.cacheService.get(cacheKey);
    if (count === null) {
      const result = await this.database
        .select({ count: sql<number>`count(*)` })
        .from(fashionListings)
        .where(this.buildFilterConditions(filters));
      
      count = result[0].count;
      await this.cacheService.set(cacheKey, count, 300); // Cache for 5 minutes
    }
    
    return count;
  }
}
```

**Deliverables**:
- [ ] Optimized database indexes
- [ ] Query performance analysis
- [ ] Caching strategy implementation
- [ ] Performance monitoring setup
- [ ] Database connection pooling optimization

**Acceptance Criteria**:
- [ ] Query response time < 100ms for 95% of requests
- [ ] Database CPU usage < 70%
- [ ] Index usage > 95% for all queries
- [ ] Cache hit ratio > 80%
- [ ] Connection pool efficiency > 90%

### **Task 2.3.2: Frontend Performance Optimization**
**Assignee**: Frontend Engineer  
**Estimate**: 3 days  
**Priority**: P1 (High)

**Requirements**:
```typescript
// client/src/components/fashion/OptimizedFashionGrid.tsx
import { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { IntersectionObserver } from 'react-intersection-observer';

// Lazy load heavy components
const FashionListingCard = lazy(() => import('./FashionListingCard'));
const FashionFilterSidebar = lazy(() => import('./FashionFilterSidebar'));

interface OptimizedFashionGridProps {
  listings: FashionListing[];
  onLoadMore: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  gridColumns: number;
  onListingClick: (listing: FashionListing) => void;
}

export const OptimizedFashionGrid = memo<OptimizedFashionGridProps>(({
  listings,
  onLoadMore,
  hasNextPage,
  isLoading,
  gridColumns,
  onListingClick
}) => {
  // Virtualization for large lists
  const { width: containerWidth } = useContainerDimensions();
  const itemWidth = Math.floor(containerWidth / gridColumns);
  const itemHeight = itemWidth * 1.4; // Maintain aspect ratio

  // Memoized item renderer for virtualization
  const ItemRenderer = useCallback(({ columnIndex, rowIndex, style }) => {
    const itemIndex = rowIndex * gridColumns + columnIndex;
    const listing = listings[itemIndex];

    if (!listing) return null;

    return (
      <div style={style}>
        <Suspense fallback={<FashionCardSkeleton />}>
          <FashionListingCard
            listing={listing}
            onClick={() => onListingClick(listing)}
            lazyLoad={true}
            optimized={true}
          />
        </Suspense>
      </div>
    );
  }, [listings, gridColumns, onListingClick]);

  // Infinite scroll with intersection observer
  const { ref: loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasNextPage,
    threshold: 0.1
  });

  // Memoized grid configuration
  const gridConfig = useMemo(() => ({
    columnCount: gridColumns,
    rowCount: Math.ceil(listings.length / gridColumns),
    columnWidth: itemWidth,
    rowHeight: itemHeight,
    height: 600, // Visible height
    width: containerWidth
  }), [gridColumns, listings.length, itemWidth, itemHeight, containerWidth]);

  return (
    <div className="optimized-fashion-grid">
      <Grid
        {...gridConfig}
        itemData={listings}
        overscanRowCount={2} // Pre-render 2 rows for smooth scrolling
      >
        {ItemRenderer}
      </Grid>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isLoading && <GridSkeleton />}
        </div>
      )}
    </div>
  );
});

// Optimized listing card with lazy loading
const FashionListingCard = memo<FashionListingCardProps>(({
  listing,
  onClick,
  lazyLoad = true,
  optimized = false
}) => {
  // Intersection observer for lazy loading images
  const [imageRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: !lazyLoad
  });

  // Memoized click handler
  const handleClick = useCallback(() => {
    onClick(listing);
  }, [onClick, listing.id]);

  // Progressive image loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      className="fashion-listing-card transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden">
        {(inView || !lazyLoad) && (
          <>
            <img
              src={listing.images[0]}
              alt={listing.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {imageError && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">
          {listing.title}
        </h3>
        <p className="text-lg font-bold text-primary">
          ${listing.price}
        </p>
        {listing.originalPrice && listing.originalPrice > listing.price && (
          <p className="text-sm text-gray-500 line-through">
            ${listing.originalPrice}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {listing.condition}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Heart className="w-3 h-3" />
            <span>{listing.likesCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
```

**Deliverables**:
- [ ] Virtualized grid component for large datasets
- [ ] Lazy loading implementation for images
- [ ] Infinite scroll optimization
- [ ] Component memoization
- [ ] Bundle size optimization
- [ ] Performance monitoring

**Acceptance Criteria**:
- [ ] Page load time < 2 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Largest Contentful Paint < 2.5 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size reduction > 30%
- [ ] Memory usage optimized for mobile devices

## 📋 **TASK 2.4: LEGACY CLEANUP**

### **Task 2.4.1: Remove Legacy Schema References**
**Assignee**: Backend Engineer  
**Estimate**: 2 days  
**Priority**: P1 (High)

**Requirements**:
```typescript
// Remove legacy category references
// 1. Update all service imports
// 2. Remove old category enums
// 3. Clean up unused API endpoints
// 4. Update documentation

// server/cleanup/LegacySchemaCleanup.ts
export class LegacySchemaCleanup {
  async removeLegacyCategoryReferences(): Promise<void> {
    // 1. Verify no active references to old schema
    const activeReferences = await this.scanForLegacyReferences();
    
    if (activeReferences.length > 0) {
      throw new Error(`Active legacy references found: ${activeReferences.join(', ')}`);
    }

    // 2. Drop old constraints and indexes
    await this.database.execute(`
      ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;
      DROP INDEX IF EXISTS idx_listings_category;
      DROP INDEX IF EXISTS idx_listings_category_status;
    `);

    // 3. Archive old table structure
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS legacy_listings_archive AS 
      SELECT * FROM listings WHERE category != 'fashion' OR category IS NULL;
    `);

    // 4. Clean up old enum values
    await this.database.execute(`
      ALTER TYPE category_enum RENAME TO legacy_category_enum;
    `);

    // 5. Update application configuration
    await this.updateApplicationConfig();
  }

  private async scanForLegacyReferences(): Promise<string[]> {
    // Scan codebase for legacy category references
    const references: string[] = [];
    
    // Check database constraints
    // Check API endpoints
    // Check frontend components
    // Check configuration files
    
    return references;
  }
}
```

**Deliverables**:
- [ ] Legacy schema removal scripts
- [ ] Reference scanning tools
- [ ] Configuration updates
- [ ] Documentation updates
- [ ] Verification tests

**Acceptance Criteria**:
- [ ] No legacy schema references remain
- [ ] All tests pass after cleanup
- [ ] Documentation updated
- [ ] Performance improved with reduced complexity
- [ ] Code maintainability enhanced

### **Task 2.4.2: API Deprecation and Migration**
**Assignee**: Backend Engineer + DevOps  
**Estimate**: 2 days  
**Priority**: P2 (Medium)

**Requirements**:
```typescript
// server/middleware/DeprecationMiddleware.ts
export function createDeprecationMiddleware(
  endpoint: string,
  deprecationDate: Date,
  newEndpoint: string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add deprecation headers
    res.setHeader('Deprecation', deprecationDate.toISOString());
    res.setHeader('Link', `<${newEndpoint}>; rel="successor-version"`);
    res.setHeader('Sunset', deprecationDate.toISOString());

    // Log deprecation usage
    console.warn(`Deprecated endpoint accessed: ${endpoint} -> ${newEndpoint}`, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Track in analytics
    analyticsService.trackEvent('deprecated_api_usage', {
      endpoint,
      newEndpoint,
      userAgent: req.get('User-Agent')
    });

    next();
  };
}

// Apply to legacy endpoints
app.post('/api/listings', 
  createDeprecationMiddleware(
    '/api/listings',
    new Date('2024-12-31'),
    '/api/fashion/listings'
  ),
  // ... existing handler
);
```

**Deliverables**:
- [ ] Deprecation middleware implementation
- [ ] Migration timeline communication
- [ ] Client migration tools
- [ ] Usage analytics tracking
- [ ] Sunset planning

**Acceptance Criteria**:
- [ ] All legacy endpoints properly deprecated
- [ ] Clear migration path documented
- [ ] Usage tracking implemented
- [ ] Client notification system active
- [ ] Sunset timeline established
