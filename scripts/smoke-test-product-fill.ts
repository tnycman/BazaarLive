import { ensureMinimumProducts } from '../client/src/services/category/utils/ProductDisplayUtils';

type ProductItem = {
  id: string;
  title: string;
  brand: string;
  price: string;
  size: string;
  images: string[];
  seller: { id: string; username: string; avatar?: string };
  stats: { likes: number; comments: number; shares: number };
  isLiked: boolean;
  createdAt: string;
};

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const base: ProductItem = {
  id: 'p1',
  title: 'Item',
  brand: 'Brand',
  price: '$10',
  size: 'M',
  images: ['https://example.com/1.jpg'],
  seller: { id: 's1', username: 'user' },
  stats: { likes: 0, comments: 0, shares: 0 },
  isLiked: false,
  createdAt: new Date().toISOString(),
};

const input: ProductItem[] = [
  base,
  { ...base, id: 'p2', title: 'Item 2' },
  { ...base, id: 'p3', title: 'Item 3' },
];

const out = ensureMinimumProducts(input, { minCount: 16, strategy: 'repeat' });
assert(out.length >= 16, 'should fill to at least 16 items');

// IDs should be unique (utility appends suffixes)
const ids = new Set(out.map(p => p.id));
assert(ids.size === out.length, 'all product ids should be unique after fill');

console.log('[smoke] Product fill OK');



