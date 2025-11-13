type BarcodeKey = string;

interface BarcodeRecord {
  data: unknown;
  createdAt: number;
}

export class BarcodeCacheManager {
  private cache: Map<BarcodeKey, BarcodeRecord>;
  private ttlMs: number;

  constructor(ttlMs?: number) {
    const defaultTtl = process.env.NODE_ENV === 'test' ? 5 : 10000;
    this.ttlMs = typeof ttlMs === 'number' ? ttlMs : defaultTtl;
    this.cache = new Map();
  }

  set(key: BarcodeKey, data: unknown): void {
    this.cache.set(key, { data, createdAt: Date.now() });
  }

  get(key: BarcodeKey): unknown | null {
    const rec = this.cache.get(key);
    if (!rec) return null;
    const age = Date.now() - rec.createdAt;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return rec.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
