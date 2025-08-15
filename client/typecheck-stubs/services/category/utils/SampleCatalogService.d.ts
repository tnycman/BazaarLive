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


