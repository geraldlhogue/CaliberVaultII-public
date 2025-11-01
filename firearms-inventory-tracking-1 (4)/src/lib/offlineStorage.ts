// Enhanced Offline Storage with IndexedDB
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { InventoryItem } from '@/types/inventory';

interface OfflineDB extends DBSchema {
  inventory: {
    key: string;
    value: InventoryItem;
    indexes: { 'by-category': string };
  };
  pendingSync: {
    key: number;
    value: {
      id: number;
      operation: 'add' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

class OfflineStorage {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private isSupported: boolean = true;

  async init() {
    if (this.db) return;

    // Check if IndexedDB is available
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, offline features disabled');
      this.isSupported = false;
      return;
    }

    try {
      this.db = await openDB<OfflineDB>('firearms-offline', 1, {
        upgrade(db) {
          // Inventory store
          if (!db.objectStoreNames.contains('inventory')) {
            const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
            inventoryStore.createIndex('by-category', 'category');
          }

          // Pending sync operations
          if (!db.objectStoreNames.contains('pendingSync')) {
            db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
          }

          // Metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });
      this.isSupported = true;
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      this.isSupported = false;
    }
  }

  async saveInventory(items: InventoryItem[]) {
    if (!this.isSupported) return;
    try {
      await this.init();
      if (!this.db) return;

      const tx = this.db.transaction('inventory', 'readwrite');
      await Promise.all(items.map(item => tx.store.put(item)));
      await tx.done;
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  }

  async getInventory(): Promise<InventoryItem[]> {
    if (!this.isSupported) return [];
    try {
      await this.init();
      if (!this.db) return [];
      return await this.db.getAll('inventory');
    } catch (error) {
      console.error('Failed to get inventory:', error);
      return [];
    }
  }

  async addPendingSync(operation: 'add' | 'update' | 'delete', data: any) {
    if (!this.isSupported) return;
    try {
      await this.init();
      if (!this.db) return;

      await this.db.add('pendingSync', {
        operation,
        data,
        timestamp: Date.now(),
      } as any);
    } catch (error) {
      console.error('Failed to add pending sync:', error);
    }
  }

  async getPendingSync() {
    if (!this.isSupported) return [];
    try {
      await this.init();
      if (!this.db) return [];
      return await this.db.getAll('pendingSync');
    } catch (error) {
      console.error('Failed to get pending sync:', error);
      return [];
    }
  }

  async clearPendingSync() {
    if (!this.isSupported) return;
    try {
      await this.init();
      if (!this.db) return;
      await this.db.clear('pendingSync');
    } catch (error) {
      console.error('Failed to clear pending sync:', error);
    }
  }

  async setMetadata(key: string, value: any) {
    if (!this.isSupported) return;
    try {
      await this.init();
      if (!this.db) return;
      await this.db.put('metadata', value, key);
    } catch (error) {
      console.error('Failed to set metadata:', error);
    }
  }

  async getMetadata(key: string) {
    if (!this.isSupported) return null;
    try {
      await this.init();
      if (!this.db) return null;
      return await this.db.get('metadata', key);
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorage();
