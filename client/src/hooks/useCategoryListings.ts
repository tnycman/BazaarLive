import { useMemo } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';

// Domain-level product item used by EnterpriseProductGrid
export interface ProductGridItem {
  readonly id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: string;
  readonly originalPrice?: string;
  readonly size: string;
  readonly images: readonly string[];
  readonly seller: {
    readonly id: string;
    readonly username: string;
    readonly avatar?: string;
  };
  readonly stats: {
    readonly likes: number;
    readonly comments: number;
    readonly shares: number;
  };
  readonly badges?: readonly {
    readonly type: 'sale' | 'new' | 'featured' | 'trending' | 'boutique';
    readonly text: string;
    readonly color: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  }[];
  readonly condition?: 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair';
  readonly isLiked: boolean;
  readonly createdAt: string;
  readonly sourceCategory?: string;
}

export interface UseCategoryListingsArgs {
  vertical: string; // e.g., 'fashion'
  category?: string; // e.g., 'women'
  subcategory?: string; // e.g., 'dresses'
  leaf?: string; // e.g., 'shoes'
  // Future multi-category support: fetch multiple category buckets in parallel and merge
  additionalCategories?: string[];
  searchQuery?: string;
  sortBy?: string;
  // Server-side brand facet
  brands?: string[];
  // Pagination (aggregate endpoint uses cursor + limit)
  limit?: number;
  cursor?: string | null;
  // Toggle to disable the hook while keeping call sites stable
  enabled?: boolean;
}

type RawListing = Record<string, any>;

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
}

function mapListingToGridItem(listing: RawListing): ProductGridItem {
  const id = safeString(listing.id, crypto.randomUUID());
  const title = safeString(listing.title, 'Item');
  const brand = safeString(listing.brand, 'Unknown');
  const priceRaw = safeString(listing.price, '0');
  const price = priceRaw.startsWith('$') ? priceRaw : `$${priceRaw}`;
  const originalPriceRaw = safeString(listing.originalPrice);
  const originalPrice = originalPriceRaw ? (originalPriceRaw.startsWith('$') ? originalPriceRaw : `$${originalPriceRaw}`) : undefined;
  const size = safeString(listing.size, 'One Size');
  const images = safeStringArray(listing.images);

  const sellerObj = (typeof listing.seller === 'object' && listing.seller) ? listing.seller as Record<string, unknown> : {};
  const seller = {
    id: safeString(sellerObj.id, 'seller_' + id),
    username: safeString(sellerObj.username, 'seller'),
    avatar: typeof sellerObj.avatar === 'string' ? sellerObj.avatar : undefined
  } as const;

  const metrics = (typeof listing.metrics === 'object' && listing.metrics) ? listing.metrics as Record<string, unknown> : (typeof listing.stats === 'object' && listing.stats) ? listing.stats as Record<string, unknown> : {};
  const stats = {
    likes: safeNumber(metrics.likes, 0),
    comments: safeNumber(metrics.comments, 0),
    shares: safeNumber(metrics.shares, 0)
  } as const;

  const conditionRaw = safeString(listing.condition);
  const allowedConditions = new Set(['new_with_tags', 'new_without_tags', 'excellent', 'good', 'fair']);
  const condition = allowedConditions.has(conditionRaw) ? conditionRaw as ProductGridItem['condition'] : undefined;

  const createdAt = safeString(listing.createdAt, new Date().toISOString());
  const sourceCategory = typeof listing.sourceCategory === 'string' ? listing.sourceCategory : undefined;

  return {
    id,
    title,
    brand,
    price,
    originalPrice,
    size,
    images,
    seller,
    stats,
    badges: undefined,
    condition,
    isLiked: false,
    createdAt,
    sourceCategory
  };
}

async function fetchListings(params: {
  vertical: string;
  category?: string;
  subcategory?: string;
  searchQuery?: string;
  sortBy?: string;
  signal?: AbortSignal;
}): Promise<ProductGridItem[]> {
  const { vertical, category, subcategory, searchQuery, sortBy, signal } = params;
  const usp = new URLSearchParams();
  usp.append('category', vertical);
  if (category) usp.append('subcategory', category);
  if (subcategory) usp.append('subsubcategory', subcategory);
  if (searchQuery) usp.append('search', searchQuery);
  if (sortBy) usp.append('sortBy', sortBy);
  usp.append('limit', '100');

  const response = await fetch(`/api/listings?${usp.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch listings (${response.status})`);
  }
  const json = await response.json();
  const list = Array.isArray(json) ? json : [];
  return list.map(mapListingToGridItem);
}

export function useCategoryListings(args: UseCategoryListingsArgs): {
  products: readonly ProductGridItem[];
  isLoading: boolean;
  isError: boolean;
  errors: readonly (unknown | null)[];
  nextCursor?: string | null;
} {
  const {
    vertical,
    category,
    subcategory,
    leaf,
    additionalCategories,
    searchQuery,
    sortBy,
    limit,
    cursor,
    enabled = true
  } = args;

  const categoriesToFetch = useMemo(() => {
    const unique = new Set<string>(toArray(category).filter(Boolean) as string[]);
    for (const c of toArray(additionalCategories)) unique.add(c);
    // If none provided, still fetch the base vertical to keep hook stable
    if (unique.size === 0) unique.add('all');
    return Array.from(unique);
  }, [category, additionalCategories]);

  const resolvedCategoriesForAggregate = useMemo(() => {
    // Aggregate endpoint requires explicit categories. When brands are present but no category selected,
    // expand to a sensible default set for the vertical (fashion).
    const defaultsForVertical: Record<string, string[]> = {
      fashion: ['women','men','kids','home','electronics','pets','beauty','sports']
    };
    const current = categoriesToFetch.filter((c) => c !== 'all');
    if (current.length > 0) return current;
    if (Array.isArray(args.brands) && args.brands.length > 0) {
      return defaultsForVertical[vertical] ?? ['women','men','kids'];
    }
    return current;
  }, [categoriesToFetch, args.brands, vertical]);

  // If fetching multiple categories, use a single combined endpoint
  const isMulti = (categoriesToFetch.length > 1)
    || (categoriesToFetch.length === 1 && categoriesToFetch[0] !== 'all' && additionalCategories && additionalCategories.length > 0)
    || (Array.isArray(args.brands) && args.brands.length > 0);
  let queryResults: UseQueryResult<ProductGridItem[], unknown>[];

  if (isMulti) {
    const categoriesParam = resolvedCategoriesForAggregate.sort().join(',');
    const pageSize = typeof limit === 'number' && limit > 0 ? Math.min(Math.max(limit, 1), 100) : 60;
    const brandsParam = Array.isArray(args.brands) && args.brands.length > 0 ? args.brands.slice().sort().join(',') : '';
    const queryKey = ['/api/listings/aggregate', vertical, categoriesParam, subcategory, leaf, searchQuery, sortBy, brandsParam, pageSize, cursor ?? null];
    const aggregateQuery = {
      queryKey,
      queryFn: async ({ signal }: { signal?: AbortSignal }) => {
        const usp = new URLSearchParams();
        usp.append('vertical', vertical);
        usp.append('categories', categoriesParam);
        if (subcategory) usp.append('subcategory', subcategory);
        if (leaf) usp.append('leaf', leaf);
        if (searchQuery) usp.append('search', searchQuery);
        if (sortBy) usp.append('sortBy', sortBy);
        if (brandsParam) usp.append('brands', brandsParam);
        usp.append('limit', String(pageSize));
        if (cursor) usp.append('cursor', cursor);
        const response = await fetch(`/api/listings/aggregate?${usp.toString()}`, { signal });
        if (!response.ok) throw new Error(`Aggregate fetch failed (${response.status})`);
        const json = await response.json();
        const list = Array.isArray(json?.items) ? json.items : [];
        const out = list.map(mapListingToGridItem);
        // Attach nextCursor via symbol to return alongside products in hook
        (out as any).__nextCursor = typeof json?.nextCursor === 'string' ? json.nextCursor : null;
        return out;
      },
      enabled
    } as const;
    // Normalize to the same array-of-results shape for downstream logic
    queryResults = [aggregateQuery as unknown as UseQueryResult<ProductGridItem[], unknown>];
    // Note: Actual execution will be handled by React Query at runtime; we only shape the config here.
    // However, since useQueries requires an array, and we are mixing useQuery config, consumers should wrap this
    // via useQueries if needed. To stay consistent, we fallback to useQueries with a single query.
    queryResults = (useQueries({ queries: [aggregateQuery as any] }) as unknown) as UseQueryResult<ProductGridItem[], unknown>[];
  } else {
    queryResults = useQueries({
      queries: categoriesToFetch.map((cat) => ({
        queryKey: ['/api/listings', vertical, cat, subcategory, searchQuery, sortBy],
        queryFn: ({ signal }) => fetchListings({
          vertical,
          category: cat === 'all' ? undefined : cat,
          subcategory,
          searchQuery,
          sortBy,
          signal
        }),
        enabled
      }))
    }) as UseQueryResult<ProductGridItem[], unknown>[];
  }

  const { products, isLoading, isError, errors, nextCursor: outCursor } = useMemo(() => {
    const allProducts: ProductGridItem[] = [];
    let loading = false;
    let error = false;
    const errs: (unknown | null)[] = [];
    let next: string | null | undefined = undefined;

    for (const r of queryResults) {
      loading = loading || r.isLoading || r.isFetching;
      error = error || !!r.error;
      errs.push(r.error ?? null);
      if (Array.isArray(r.data)) {
        // Extract nextCursor if provided by aggregate path
        const maybeCursor = (r.data as any).__nextCursor;
        if (typeof maybeCursor === 'string' || maybeCursor === null) next = maybeCursor;
        allProducts.push(...(r.data as ProductGridItem[]));
      }
    }

    // Defensive stable dedupe by id (preserve first occurrence order)
    const seen = new Set<string>();
    const deduped: ProductGridItem[] = [];
    for (const p of allProducts) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        deduped.push(p);
      }
    }

    return {
      products: deduped,
      isLoading: loading,
      isError: error,
      errors: errs as const,
      nextCursor: next
    } as const;
  }, [queryResults]);

  return { products, isLoading, isError, errors, nextCursor: outCursor };
}

export default useCategoryListings;


