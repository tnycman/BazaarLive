type CacheValue<T> = { value: T; expiresAt: number };

export class SimpleCache<T = unknown> {
  private store = new Map<string, CacheValue<T>>();

  constructor(private defaultTtlMs: number = 30_000) {}

  public get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (typeof ttlMs === 'number' ? ttlMs : this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }
}


