import { InventoryItem } from '@/types/inventory';

const DB_NAME = 'FirearmsInventoryDB';
const DB_VERSION = 1;
const STORE_NAME = 'inventory';

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = true;

  async init(): Promise<void> {
    // Check if IndexedDB is available and working
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      this.isSupported = false;
      return;
    }

    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('IndexedDB error:', request.error);
          this.isSupported = false;
          // Don't reject - allow app to work without IndexedDB
          resolve();
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          this.isSupported = true;
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('category', 'category', { unique: false });
            store.createIndex('manufacturer', 'manufacturer', { unique: false });
            store.createIndex('storageLocation', 'storageLocation', { unique: false });
          }
        };
      });
    } catch (error) {
      console.error('IndexedDB initialization failed:', error);
      this.isSupported = false;
    }
  }

  async getAllItems(): Promise<InventoryItem[]> {
    if (!this.isSupported) return [];
    if (!this.db) await this.init();
    if (!this.db) return [];
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error('Error getting items:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.error('getAllItems failed:', error);
      return [];
    }
  }

  async addItem(item: InventoryItem): Promise<void> {
    if (!this.isSupported) return;
    if (!this.db) await this.init();
    if (!this.db) return;
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(item);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error adding item:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('addItem failed:', error);
    }
  }

  async updateItem(item: InventoryItem): Promise<void> {
    if (!this.isSupported) return;
    if (!this.db) await this.init();
    if (!this.db) return;
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(item);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error updating item:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('updateItem failed:', error);
    }
  }

  async deleteItem(id: string): Promise<void> {
    if (!this.isSupported) return;
    if (!this.db) await this.init();
    if (!this.db) return;
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error deleting item:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('deleteItem failed:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isSupported) return;
    if (!this.db) await this.init();
    if (!this.db) return;
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error clearing store:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('clear failed:', error);
    }
  }
}

export const indexedDB = new IndexedDBManager();
