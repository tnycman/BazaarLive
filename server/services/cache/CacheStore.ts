export interface CacheStore<T = unknown> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs?: number): void;
  delete(key: string): void;
  clear(): void;
}

export class InMemoryCacheStore<T = unknown> implements CacheStore<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();
  constructor(private defaultTtlMs: number = 20_000) {}
  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }
  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }
  delete(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

export function createCacheStore<T = unknown>(): CacheStore<T> {
  // Future: swap to a distributed cache (e.g., Redis) based on env configuration
  const ttl = Math.max(5000, Math.min(120_000, Number(process.env.AGGREGATE_CACHE_TTL_MS ?? 20_000)));
  return new InMemoryCacheStore<T>(ttl);
}


