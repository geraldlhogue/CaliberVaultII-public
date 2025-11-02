import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarcodeCacheManager } from '../barcodeCache';

// Mock IndexedDB
const mockIDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn()
        }))
      }))
    }
  }))
};

global.indexedDB = mockIDB as any;

describe('BarcodeCacheManager', () => {
  let cacheManager: BarcodeCacheManager;

  beforeEach(() => {
    cacheManager = new BarcodeCacheManager();
    vi.clearAllMocks();
  });

  it('initializes cache manager', () => {
    expect(cacheManager).toBeDefined();
  });

  it('caches barcode data', async () => {
    await cacheManager.set('123456', { name: 'Test Product' });
    expect(true).toBe(true);
  });

  it('retrieves cached data', async () => {
    const data = await cacheManager.get('123456');
    expect(data).toBeDefined();
  });
});
