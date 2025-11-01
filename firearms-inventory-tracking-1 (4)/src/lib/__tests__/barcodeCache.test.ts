import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarcodeCacheManager, BarcodeData } from '../barcodeCache';

// Mock IndexedDB
const createMockIDB = () => {
  const store = new Map();
  return {
    open: vi.fn().mockImplementation(() => ({
      result: {
        transaction: () => ({
          objectStore: () => ({
            get: (key: string) => ({ 
              result: store.get(key),
              onsuccess: null,
              onerror: null
            }),
            put: (data: any) => {
              store.set(data.barcode, data);
              return { onsuccess: null, onerror: null };
            },
            delete: (key: string) => {
              store.delete(key);
              return { onsuccess: null, onerror: null };
            },
            getAll: () => ({ 
              result: Array.from(store.values()),
              onsuccess: null,
              onerror: null
            }),
            clear: () => {
              store.clear();
              return { onsuccess: null, onerror: null };
            }
          })
        }),
        objectStoreNames: { contains: () => false }
      },
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    }))
  };
};

describe('BarcodeCacheManager', () => {
  let cache: BarcodeCacheManager;

  beforeEach(() => {
    global.indexedDB = createMockIDB() as any;
    cache = new BarcodeCacheManager();
  });

  it('initializes cache', async () => {
    await expect(cache.init()).resolves.not.toThrow();
  });

  it('stores and retrieves barcode data', async () => {
    const data: BarcodeData = {
      barcode: '012345678905',
      title: 'Test Product',
      cachedAt: new Date().toISOString(),
      hitCount: 0,
      lastAccessed: new Date().toISOString()
    };
    
    await cache.set(data);
    const result = await cache.get('012345678905');
    expect(result?.title).toBe('Test Product');
  });
});
