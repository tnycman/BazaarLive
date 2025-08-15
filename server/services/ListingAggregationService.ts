import { storage } from '../storage';
import { createCacheStore } from './cache/CacheStore';

export type SortBy = 'newest' | 'price_low' | 'price_high' | 'most_liked';

export interface AggregateParams {
  traceId: string;
  vertical: string;
  categories: string[];
  subcategory?: string;
  leaf?: string;
  sortBy: SortBy;
  limit: number;
  cursor?: string | null;
  searchQuery?: string;
  filters?: {
    brands?: string[];
    sizes?: string[];
    minPrice?: number;
    maxPrice?: number;
    conditions?: string[];
  };
}

interface ListingLike {
  id: string | number;
  price?: string;
  createdAt?: string;
  metadata?: { createdAt?: string };
  stats?: { likes?: number };
  metrics?: { likes?: number };
  subcategory?: string;
  [key: string]: any;
}

function parseCursorForSort(sortBy: SortBy, cursor: string | null | undefined): { key: number; id: string } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [keyStr, id] = decoded.split('|');
    const key = Number(keyStr);
    if (!Number.isFinite(key) || !id) return null;
    return { key, id };
  } catch {
    return null;
  }
}

function encodeCursorForSort(sortBy: SortBy, key: number, id: string): string {
  return Buffer.from(`${key}|${id}`, 'utf8').toString('base64');
}

function getCreatedAtMs(item: ListingLike): number {
  const value = item.metadata?.createdAt || item.createdAt || 0;
  const t = new Date(String(value)).getTime();
  return Number.isFinite(t) ? t : 0;
}

function getLikes(item: ListingLike): number {
  return Number(item.metrics?.likes ?? item.stats?.likes ?? 0) || 0;
}

function getPrice(item: ListingLike): number {
  const raw = String(item.price ?? '0');
  return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
}

function getSortKey(item: ListingLike, sortBy: SortBy): number {
  switch (sortBy) {
    case 'price_low':
    case 'price_high':
      return getPrice(item);
    case 'most_liked':
      return getLikes(item);
    case 'newest':
    default:
      return getCreatedAtMs(item);
  }
}

export async function aggregateListings(params: AggregateParams): Promise<{
  items: ListingLike[];
  nextCursor: string | null;
  apiVersion: string;
}> {
  const { vertical, categories, subcategory, leaf, sortBy, limit, cursor, searchQuery, filters } = params;

  // Cache hot queries for a brief period (canonical key)
  const cache = (aggregateListings as any)._cache as ReturnType<typeof createCacheStore<{ items: ListingLike[]; nextCursor: string | null; apiVersion: string }>>
    || createCacheStore<{ items: ListingLike[]; nextCursor: string | null; apiVersion: string }>();
  (aggregateListings as any)._cache = cache;
  const cacheKey = JSON.stringify({ vertical, categories, subcategory, sortBy, limit, cursor, searchQuery, filters });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch per-category with slight overfetch to compensate dedupe
  const perCategory = await Promise.all(
    categories.map(async (cat) => {
      // Basic retry with backoff for storage calls
      const maxAttempts = 3;
      let attempt = 0;
      // @ts-ignore simple exponential backoff
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      let halfOpen = false;
      while (true) {
        try {
          if (halfOpen) throw new Error('circuit_open');
          const list = await storage.getListings({
            category: cat,
            search: vertical || searchQuery,
            limit: limit * 2
          });
          return (list as ListingLike[]).map((i) => ({ ...i, sourceCategory: cat }));
        } catch (err) {
          attempt++;
          if ((err as any)?.message === 'circuit_open' || attempt >= maxAttempts) throw err;
          if (attempt === maxAttempts - 1) halfOpen = true;
          await sleep(Math.min(1000 * 2 ** (attempt - 1), 4000));
        }
      }
    })
  );

  const merged: ListingLike[] = [];
  const seen = new Set<string>();
  for (const arr of perCategory) {
    for (const item of arr) {
      const id = String(item.id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(item);
      }
    }
  }

  // Filter by subcategory if provided
  let scoped = subcategory
    ? merged.filter((i) => String(i.subcategory || '').toLowerCase() === subcategory.toLowerCase())
    : merged;

  if (leaf) {
    scoped = scoped.filter((i) => String((i as any).leaf || '').toLowerCase() === leaf.toLowerCase()
      || String((i as any).type || '').toLowerCase() === leaf.toLowerCase()
      || String((i as any).category || '').toLowerCase() === leaf.toLowerCase());
  }

  // Apply filters
  if (filters) {
    const brandSet = new Set((filters.brands || []).map((b) => String(b).toLowerCase()));
    const sizeSet = new Set((filters.sizes || []).map((s) => String(s).toLowerCase()));
    const condSet = new Set((filters.conditions || []).map((c) => String(c).toLowerCase()));
    const minP = typeof filters.minPrice === 'number' ? filters.minPrice : undefined;
    const maxP = typeof filters.maxPrice === 'number' ? filters.maxPrice : undefined;

    scoped = scoped.filter((i) => {
      // brand
      if (brandSet.size > 0) {
        const brand = String((i as any).brand || '').toLowerCase();
        if (!brand || !brandSet.has(brand)) return false;
      }
      // size
      if (sizeSet.size > 0) {
        const size = String((i as any).size || '').toLowerCase();
        if (!size || !sizeSet.has(size)) return false;
      }
      // price
      if (typeof minP === 'number' || typeof maxP === 'number') {
        const p = getPrice(i);
        if (typeof minP === 'number' && p < minP) return false;
        if (typeof maxP === 'number' && p > maxP) return false;
      }
      // condition
      if (condSet.size > 0) {
        const condition = String((i as any).condition || '').toLowerCase();
        if (!condition || !condSet.has(condition)) return false;
      }
      return true;
    });
  }

  // Apply cursor windowing (keyset) before final slice, based on active sort
  const cursorTuple = parseCursorForSort(sortBy, cursor);

  const sorted = scoped.sort((a, b) => {
    const ka = getSortKey(a, sortBy);
    const kb = getSortKey(b, sortBy);
    if (sortBy === 'price_low') {
      if (ka !== kb) return ka - kb; // asc
    } else {
      if (kb !== ka) return kb - ka; // desc for newest, price_high, most_liked
    }
    return String(b.id).localeCompare(String(a.id));
  });

  const windowed = cursorTuple
    ? sorted.filter((i) => {
        const key = getSortKey(i, sortBy);
        if (sortBy === 'price_low') {
          if (key > cursorTuple.key) return false;
          if (key < cursorTuple.key) return true;
          return String(i.id) < cursorTuple.id;
        } else {
          if (key < cursorTuple.key) return false;
          if (key > cursorTuple.key) return true;
          return String(i.id) < cursorTuple.id;
        }
      })
    : sorted;

  const slice = windowed.slice(0, limit);
  const hasNextPage = windowed.length > limit;
  const last = slice[slice.length - 1];
  const lastKey = last ? getSortKey(last, sortBy) : 0;
  const next = hasNextPage && last ? encodeCursorForSort(sortBy, lastKey, String(last.id)) : null;

  const result = { items: slice, nextCursor: next, apiVersion: '1.0.0' };
  cache.set(cacheKey, result);
  return result;
}


