import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { BarcodeCacheManager } from '../barcodeCache';

describe('BarcodeCacheManager', () => {
  let cacheManager: BarcodeCacheManager;

  beforeEach(async () => {
    // Delete the specific database we use
    try {
      indexedDB.deleteDatabase('BarcodeCacheDB');
    } catch (e) {
      // Ignore errors
    }
    
    // Small delay to ensure deletion completes
    await new Promise(resolve => setTimeout(resolve, 10));
    
    cacheManager = new BarcodeCacheManager();
    await cacheManager.init();
  });

  afterEach(async () => {
    // Clear and cleanup
    try {
      await cacheManager.clear();
    } catch (e) {
      // Ignore errors
    }
    
    // Small delay for cleanup
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('initializes cache manager', () => {
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
    const retrieved = await cacheManager.get('123456');
    
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
    const data = await cacheManager.get('789012');
    
    expect(data).toBeDefined();
    expect(data?.barcode).toBe('789012');
  });

  it('returns null for non-existent barcode', async () => {
    const data = await cacheManager.get('nonexistent');
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
    
    await cacheManager.clear();
    const data = await cacheManager.get('111111');
    
    expect(data).toBeNull();
  });
});
