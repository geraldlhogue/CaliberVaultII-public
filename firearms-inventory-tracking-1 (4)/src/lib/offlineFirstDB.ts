// Offline-First Database with Full CRUD Operations
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDBSchema extends DBSchema {
  inventory: {
    key: string;
    value: any;
    indexes: { 'by-category': string; 'by-updated': number };
  };
  queue: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
      retries: number;
    };
  };
  metadata: {
    key: string;
    value: { lastSync: number; version: number };
  };
}

class OfflineFirstDB {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private readonly DB_NAME = 'calibervault-offline';
  private readonly VERSION = 1;

  async init() {
    if (this.db) return;
    
    this.db = await openDB<OfflineDBSchema>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('inventory')) {
          const store = db.createObjectStore('inventory', { keyPath: 'id' });
          store.createIndex('by-category', 'category');
          store.createIndex('by-updated', 'updated_at');
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata');
        }
      },
    });
  }

  // CRUD Operations
  async create(item: any) {
    await this.init();
    const id = item.id || crypto.randomUUID();
    const record = { ...item, id, created_at: Date.now(), updated_at: Date.now() };
    await this.db!.put('inventory', record);
    await this.queueSync('create', 'inventory', record);
    return record;
  }

  async read(id: string) {
    await this.init();
    return await this.db!.get('inventory', id);
  }

  async readAll(category?: string) {
    await this.init();
    if (category) {
      return await this.db!.getAllFromIndex('inventory', 'by-category', category);
    }
    return await this.db!.getAll('inventory');
  }

  async update(id: string, updates: any) {
    await this.init();
    const existing = await this.read(id);
    if (!existing) throw new Error('Item not found');
    
    const updated = { ...existing, ...updates, updated_at: Date.now() };
    await this.db!.put('inventory', updated);
    await this.queueSync('update', 'inventory', updated);
    return updated;
  }

  async delete(id: string) {
    await this.init();
    await this.db!.delete('inventory', id);
    await this.queueSync('delete', 'inventory', { id });
    return true;
  }

  // Queue Management
  private async queueSync(type: 'create' | 'update' | 'delete', table: string, data: any) {
    await this.init();
    const queueItem = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    };
    await this.db!.put('queue', queueItem);
  }

  async getQueue() {
    await this.init();
    return await this.db!.getAll('queue');
  }

  async clearQueueItem(id: string) {
    await this.init();
    await this.db!.delete('queue', id);
  }

  async updateLastSync() {
    await this.init();
    await this.db!.put('metadata', { lastSync: Date.now(), version: this.VERSION }, 'sync');
  }

  async getLastSync() {
    await this.init();
    const meta = await this.db!.get('metadata', 'sync');
    return meta?.lastSync || 0;
  }
}

export const offlineDB = new OfflineFirstDB();
