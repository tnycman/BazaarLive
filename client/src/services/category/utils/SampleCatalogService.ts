/**
 * SampleCatalogService
 * Deterministic preview sample generator for universal category pages.
 * Used only when preview mode is enabled to visualize layouts without backend data.
 */

import type { ProductItem } from '@/components/grid/EnterpriseProductGrid';

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const FALLBACK_BRANDS = [
  'Generic', 'Acme', 'Zenith', 'Contoso', 'Nimbus', 'Apex', 'Vertex', 'Summit', 'Nova', 'Pioneer'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function buildImageUrl(topic: string, idx: number): string {
  // Unsplash with deterministic query; avoid tracking params
  const q = encodeURIComponent(`${topic} product ${idx}`);
  return `https://images.unsplash.com/photo-152-${(idx % 90) + 10}00000-000000000000?w=600&h=600&fit=crop&auto=format&q=80&query=${q}`;
}

export function generatePreviewProducts(key: string, desiredCount: number = 16): ProductItem[] {
  const seed = hashString(key);
  const rand = seededRandom(seed);

  const [vertical, maybeCat, maybeSub] = key.split('-');
  const topicBase = [vertical, maybeCat, maybeSub].filter(Boolean).join(' ');

  const products: ProductItem[] = [];
  for (let i = 0; i < desiredCount; i++) {
    const r = rand();
    const brand = FALLBACK_BRANDS[Math.floor(r * FALLBACK_BRANDS.length)];
    const price = (Math.floor(rand() * 90) + 10).toFixed(0);
    const size = SIZES[Math.floor(rand() * SIZES.length)];
    const id = `${key}-preview-${i + 1}`;
    const title = `${brand} ${topicBase || 'Item'} #${i + 1}`;
    const image = buildImageUrl(topicBase || 'product', i + 1);

    products.push({
      id,
      title,
      brand,
      price: `$${price}`,
      size,
      images: [image],
      seller: {
        id: `seller-${(i % 7) + 1}`,
        username: `user_${(seed + i) % 10000}`,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
      },
      stats: {
        likes: Math.floor(rand() * 500),
        comments: Math.floor(rand() * 50),
        shares: Math.floor(rand() * 25)
      },
      badges: (i % 5 === 0) ? [{ type: 'featured', text: 'Featured', color: 'purple' }] : undefined,
      condition: 'excellent',
      isLiked: rand() > 0.7,
      createdAt: new Date(Date.now() - Math.floor(rand() * 14) * 86400000).toISOString()
    });
  }

  return products;
}


