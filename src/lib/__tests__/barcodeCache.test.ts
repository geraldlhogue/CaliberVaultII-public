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
    await cacheManager.init();
    
    // Flush any pending timers from init
    await vi.runAllTimersAsync();
  });

  afterEach(async () => {
    await vi.runAllTimersAsync();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes cache manager', async () => {
    expect(cacheManager).toBeDefined();
  });

  it('caches barcode data', async () => {
    const testData = {
      barcode: '123456',
      title: 'Test Product',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    };
    
    await cacheManager.set(testData);
    await vi.runAllTimersAsync();
    
    const retrieved = await cacheManager.get('123456');
    await vi.runAllTimersAsync();
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Test Product');
  });

  it('retrieves cached data', async () => {
    const testData = {
      barcode: '789012',
      title: 'Another Product',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    };
    
    await cacheManager.set(testData);
    await vi.runAllTimersAsync();
    
    const data = await cacheManager.get('789012');
    await vi.runAllTimersAsync();
    
    expect(data).toBeDefined();
    expect(data?.barcode).toBe('789012');
  });

  it('returns null for non-existent barcode', async () => {
    const data = await cacheManager.get('nonexistent');
    await vi.runAllTimersAsync();
    
    expect(data).toBeNull();
  });

  it('clears all cache', async () => {
    await cacheManager.set({
      barcode: '111111',
      title: 'Test',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    });
    await vi.runAllTimersAsync();
    
    await cacheManager.clear();
    await vi.runAllTimersAsync();
    
    const data = await cacheManager.get('111111');
    await vi.runAllTimersAsync();
    
    expect(data).toBeNull();
  });
});
