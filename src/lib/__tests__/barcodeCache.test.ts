import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { BarcodeCacheManager } from '../barcodeCache';

describe('BarcodeCacheManager', () => {
  let cacheManager: BarcodeCacheManager;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
    // Clear IndexedDB between tests
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
    cacheManager = new BarcodeCacheManager();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes cache manager', async () => {
    expect(cacheManager).toBeDefined();
    await cacheManager.init();
    vi.runAllTimers();
  });

  it('caches barcode data', async () => {
    await cacheManager.init();
    vi.runAllTimers();
    
    const testData = {
      barcode: '123456',
      title: 'Test Product',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    };
    
    await cacheManager.set(testData);
    vi.runAllTimers();
    
    const retrieved = await cacheManager.get('123456');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Test Product');
  });

  it('retrieves cached data', async () => {
    await cacheManager.init();
    vi.runAllTimers();
    
    const testData = {
      barcode: '789012',
      title: 'Another Product',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    };
    
    await cacheManager.set(testData);
    vi.runAllTimers();
    
    const data = await cacheManager.get('789012');
    expect(data).toBeDefined();
    expect(data?.barcode).toBe('789012');
  });

  it('returns null for non-existent barcode', async () => {
    await cacheManager.init();
    vi.runAllTimers();
    
    const data = await cacheManager.get('nonexistent');
    expect(data).toBeNull();
  });

  it('clears all cache', async () => {
    await cacheManager.init();
    vi.runAllTimers();
    
    await cacheManager.set({
      barcode: '111111',
      title: 'Test',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    });
    vi.runAllTimers();
    
    await cacheManager.clear();
    vi.runAllTimers();
    
    const data = await cacheManager.get('111111');
    expect(data).toBeNull();
  });
});
