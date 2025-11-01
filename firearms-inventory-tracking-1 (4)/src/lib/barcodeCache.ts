// Barcode cache management with IndexedDB

export interface BarcodeData {
  barcode: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  images?: string[];
  msrp?: number;
  cachedAt: string;
  hitCount: number;
  lastAccessed: string;
}

const DB_NAME = 'BarcodeCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'barcodes';
const MAX_CACHE_SIZE = 1000; // Maximum number of cached items
const CACHE_EXPIRY_DAYS = 30; // Cache expires after 30 days

export class BarcodeCacheManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'barcode' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('hitCount', 'hitCount', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });
  }

  async get(barcode: string): Promise<BarcodeData | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(barcode);

      request.onsuccess = async () => {
        const data = request.result;
        if (!data) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const cachedDate = new Date(data.cachedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > CACHE_EXPIRY_DAYS) {
          // Remove expired cache
          await this.delete(barcode);
          resolve(null);
          return;
        }

        // Update hit count and last accessed
        data.hitCount++;
        data.lastAccessed = new Date().toISOString();
        store.put(data);

        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(data: BarcodeData): Promise<void> {
    if (!this.db) await this.init();

    // Ensure cache size limit
    await this.enforceMaxSize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Initialize metadata
      data.cachedAt = data.cachedAt || new Date().toISOString();
      data.hitCount = data.hitCount || 0;
      data.lastAccessed = new Date().toISOString();
      
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(barcode: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(barcode);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<BarcodeData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<{
    totalCached: number;
    totalHits: number;
    mostUsed: BarcodeData[];
    recentlyUsed: BarcodeData[];
  }> {
    const allData = await this.getAll();
    
    const totalHits = allData.reduce((sum, item) => sum + item.hitCount, 0);
    const mostUsed = [...allData]
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10);
    const recentlyUsed = [...allData]
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 10);

    return {
      totalCached: allData.length,
      totalHits,
      mostUsed,
      recentlyUsed
    };
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async enforceMaxSize(): Promise<void> {
    const allData = await this.getAll();
    
    if (allData.length >= MAX_CACHE_SIZE) {
      // Remove least recently used items
      const sorted = allData.sort((a, b) => 
        new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
      );
      
      const toRemove = sorted.slice(0, Math.floor(MAX_CACHE_SIZE * 0.1)); // Remove 10%
      
      for (const item of toRemove) {
        await this.delete(item.barcode);
      }
    }
  }

  async exportCache(): Promise<string> {
    const data = await this.getAll();
    return JSON.stringify(data, null, 2);
  }

  async importCache(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData) as BarcodeData[];
    for (const item of data) {
      await this.set(item);
    }
    // Return the count for the caller to show a toast if needed
    return;
  }
}

export const barcodeCache = new BarcodeCacheManager();