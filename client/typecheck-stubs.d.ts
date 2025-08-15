declare module '@/components/filters/EnterpriseFilterSidebar' {
  export interface FilterState {
    selectedCategories: string[];
    selectedBrands: string[];
    selectedSizes: string[];
    selectedColors: string[];
    selectedPrices: string[];
    selectedAvailability: string[];
    selectedTypes: string[];
    brandSearchQuery: string;
    expandedSections: string[];
  }
  const Component: any;
  export default Component;
}



declare module '@/services/category/metrics/LayoutMetrics' {
  export const layoutMetrics: { record: (args: any) => void; startDevReporter?: (ms: number) => void };
}

declare module '@/services/category/utils/SampleCatalogService' {
  export interface ProductItem {
    readonly id: string;
    readonly title: string;
    readonly brand: string;
    readonly price: string;
    readonly size: string;
    readonly images: readonly string[];
    readonly seller: { readonly id: string; readonly username: string; readonly avatar?: string };
    readonly stats: { readonly likes: number; readonly comments: number; readonly shares: number };
    readonly badges?: readonly { readonly type: 'sale' | 'new' | 'featured' | 'trending' | 'boutique'; readonly text: string; readonly color: 'red' | 'blue' | 'green' | 'purple' | 'orange' }[];
    readonly condition?: 'new_with_tags' | 'new_without_tags' | 'excellent' | 'good' | 'fair';
    readonly isLiked?: boolean;
    readonly createdAt?: string;
  }
  export function generatePreviewProducts(key: string, desiredCount?: number): readonly ProductItem[];
}

