import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { BarcodeCacheManager } from '../barcodeCache';

describe('BarcodeCacheManager', () => {
  let cacheManager: BarcodeCacheManager;

  beforeEach(async () => {
    // Delete existing database
    const deleteRequest = indexedDB.deleteDatabase('BarcodeCacheDB');
    await new Promise<void>((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve(); // Continue even if delete fails
      deleteRequest.onblocked = () => resolve();
    });
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create new instance and initialize
    cacheManager = new BarcodeCacheManager();
    await cacheManager.init();
    
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    try {
      await cacheManager.clear();
    } catch (e) {
      // Ignore cleanup errors
    }
    await new Promise(resolve => setTimeout(resolve, 100));
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
    await new Promise(resolve => setTimeout(resolve, 50));
    
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
    await new Promise(resolve => setTimeout(resolve, 50));
    
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
    
    await new Promise(resolve => setTimeout(resolve, 50));
    await cacheManager.clear();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const data = await cacheManager.get('111111');
    expect(data).toBeNull();
  });
});
