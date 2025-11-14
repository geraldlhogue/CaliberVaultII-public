/**
 * Simple in-memory barcode cache used by tests.
 *
 * Tests expect:
 *  - `BarcodeCacheManager` to be a constructor (class).
 *  - `cacheManager.set(testData)` where `testData` is an object:
 *      { barcode, title, cachedAt, hitCount, lastAccessed }
 *  - `cacheManager.get('123456')` to return that same object (or null).
 *  - `cacheManager.clear()` to remove all cached entries.
 *  - `nukeBarcodeDb()` to be an async function that clears all cached data.
 */

export interface BarcodeRecord {
  barcode: string;
  title: string;
  cachedAt: string;
  hitCount: number;
  lastAccessed: string;
}

interface CachedEntry {
  record: BarcodeRecord;
  expiresAt: number;
}

const TEST_TTL_MS = 5;
const DEFAULT_TTL_MS = 10_000;

const TTL_MS =
  typeof process !== 'undefined' &&
  (process as any).env &&
  (process as any).env.NODE_ENV === 'test'
    ? TEST_TTL_MS
    : DEFAULT_TTL_MS;

// Shared in-memory store backing the cache
const barcodeStore: Map<string, CachedEntry> = new Map();

function nowMs(): number {
  return Date.now();
}

function isExpired(entry: CachedEntry, ts: number): boolean {
  return entry.expiresAt <= ts;
}

export class BarcodeCacheManager {
  private disposed = false;

  async init(): Promise<void> {
    this.ensureNotDisposed();
    // No-op; tests just await this to ensure async readiness.
  }

  async dispose(): Promise<void> {
    this.disposed = true;
  }

  private ensureNotDisposed(): void {
    if (this.disposed) {
      throw new Error('BarcodeCacheManager has been disposed');
    }
  }

  /**
   * Store a full barcode record. Tests pass the entire object, not
   * `(barcode, payload)`, so we mirror that signature.
   */
  async set(record: BarcodeRecord): Promise<void> {
    this.ensureNotDisposed();
    const ts = nowMs();
    barcodeStore.set(record.barcode, {
      record: { ...record },
      expiresAt: ts + TTL_MS,
    });
  }

  /**
   * Retrieve the barcode record for a given code, or null if missing/expired.
   */
  async get(barcode: string): Promise<BarcodeRecord | null> {
    this.ensureNotDisposed();
    const ts = nowMs();
    const entry = barcodeStore.get(barcode);
    if (!entry) return null;
    if (isExpired(entry, ts)) {
      barcodeStore.delete(barcode);
      return null;
    }
    // Return a shallow clone so callers can't mutate internal state by accident.
    return { ...entry.record };
  }

  /**
   * Remove all entries from the cache.
   */
  async clearAll(): Promise<void> {
    this.ensureNotDisposed();
    barcodeStore.clear();
  }

  // Names the tests use:
  async clear(): Promise<void> {
    await this.clearAll();
  }

  async clearCache(): Promise<void> {
    await this.clearAll();
  }
}

/**
 * Test helper used to completely reset the backing store.
 * Tests call `await nukeBarcodeDb()` in `beforeEach` / `afterAll`.
 */
export async function nukeBarcodeDb(): Promise<void> {
  barcodeStore.clear();
}
