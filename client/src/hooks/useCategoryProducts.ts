import { useQuery, type UseQueryOptions, type QueryKey, useQueryClient, QueryClient } from "@tanstack/react-query";
import type { ProductItem } from "@/components/grid/EnterpriseProductGrid";

export interface CategoryRouteParams {
  vertical: string; // expected 'fashion' for now
  section?: string;
  subsection?: string;
  leaf?: string;
}

export type CategoryProductsFetcher = (params: CategoryRouteParams) => Promise<readonly ProductItem[]>;

export function buildCategoryProductsKey(params: CategoryRouteParams): QueryKey {
  const { vertical, section, subsection, leaf } = params;
  return ["products", vertical, section ?? null, subsection ?? null, leaf ?? null];
}

export function prefetchCategoryProducts(
  queryClient: QueryClient,
  params: CategoryRouteParams,
  fetcher?: CategoryProductsFetcher,
  options?: { staleTime?: number }
): Promise<void> {
  const queryKey = buildCategoryProductsKey(params);
  const queryFn = async () => {
    if (fetcher) return await fetcher(params);
    // Safe default: no-op dataset to avoid accidental network calls at this stage
    return Promise.resolve<ProductItem[]>([]);
  };
  return queryClient
    .prefetchQuery({ queryKey, queryFn, staleTime: options?.staleTime ?? 60_000 })
    .then(() => void 0);
}

interface UseCategoryProductsOptions {
  fetcher?: CategoryProductsFetcher;
  enabled?: boolean;
  staleTimeMs?: number;
}

export function useCategoryProducts(
  params: CategoryRouteParams,
  options?: UseCategoryProductsOptions
) {
  const { fetcher, enabled = true, staleTimeMs = 60_000 } = options ?? {};
  const queryKey = buildCategoryProductsKey(params);

  return useQuery<readonly ProductItem[]>({
    queryKey,
    enabled,
    staleTime: staleTimeMs,
    retry: false,
    queryFn: async () => {
      if (fetcher) {
        return await fetcher(params);
      }
      // Default behavior: return empty until a backend is wired or a fetcher is supplied
      return [];
    },
  });
}




