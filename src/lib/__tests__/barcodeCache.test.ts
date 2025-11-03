import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BarcodeCacheManager } from '../barcodeCache';

// Properly mock IndexedDB with immediate resolution
const createMockIDBRequest = (result: any = null) => {
  const request = {
    result,
    error: null,
    onsuccess: null as any,
    onerror: null as any,
  };
  // Immediately trigger success
  setTimeout(() => request.onsuccess?.({ target: request }), 0);
  return request;
};

const mockObjectStore = {
  get: vi.fn((key) => createMockIDBRequest({ barcode: key, hitCount: 0, cachedAt: new Date().toISOString(), lastAccessed: new Date().toISOString() })),
  put: vi.fn(() => createMockIDBRequest()),
  delete: vi.fn(() => createMockIDBRequest()),
  getAll: vi.fn(() => createMockIDBRequest([])),
  clear: vi.fn(() => createMockIDBRequest()),
  createIndex: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
};

const mockDB = {
  transaction: vi.fn(() => mockTransaction),
  objectStoreNames: { contains: vi.fn(() => false) },
  createObjectStore: vi.fn(() => mockObjectStore),
};

global.indexedDB = {
  open: vi.fn((name, version) => {
    const request = createMockIDBRequest(mockDB);
    setTimeout(() => request.onupgradeneeded?.({ target: request }), 0);
    return request;
  }),
} as any;

describe('BarcodeCacheManager', () => {
  let cacheManager: BarcodeCacheManager;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheManager = new BarcodeCacheManager();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('initializes cache manager', () => {
    expect(cacheManager).toBeDefined();
  });

  it('caches barcode data', async () => {
    await cacheManager.init();
    await cacheManager.set({ barcode: '123456', title: 'Test', cachedAt: new Date().toISOString(), hitCount: 0, lastAccessed: new Date().toISOString() });
    expect(mockObjectStore.put).toHaveBeenCalled();
  });

  it('retrieves cached data', async () => {
    await cacheManager.init();
    const data = await cacheManager.get('123456');
    expect(mockObjectStore.get).toHaveBeenCalledWith('123456');
  });
});
