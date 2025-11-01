// Enhanced offline queue with exponential backoff and retry logic
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface QueueOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  lastAttempt?: number;
  error?: string;
}

interface QueueDB extends DBSchema {
  operations: {
    key: string;
    value: QueueOperation;
    indexes: { 'status': string; 'timestamp': number };
  };
}

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000; // 1 second

class EnhancedOfflineQueue {
  private db: IDBPDatabase<QueueDB> | null = null;
  private syncInProgress = false;

  async init() {
    this.db = await openDB<QueueDB>('CaliberVaultQueue', 1, {
      upgrade(db) {
        const store = db.createObjectStore('operations', { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('timestamp', 'timestamp');
      },
    });
  }

  async enqueue(op: Omit<QueueOperation, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    if (!this.db) await this.init();
    const operation: QueueOperation = {
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };
    await this.db!.put('operations', operation);
    console.log('[OfflineQueue] Enqueued:', operation);
    return operation.id;
  }

  async getPending(): Promise<QueueOperation[]> {
    if (!this.db) await this.init();
    const all = await this.db!.getAllFromIndex('operations', 'status', 'pending');
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getAll(): Promise<QueueOperation[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('operations');
  }

  async update(id: string, updates: Partial<QueueOperation>) {
    if (!this.db) await this.init();
    const op = await this.db!.get('operations', id);
    if (op) {
      await this.db!.put('operations', { ...op, ...updates });
    }
  }

  async remove(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('operations', id);
  }

  async clear() {
    if (!this.db) await this.init();
    await this.db!.clear('operations');
  }

  calculateBackoff(retries: number): number {
    return Math.min(INITIAL_BACKOFF * Math.pow(2, retries), 60000); // Max 1 minute
  }

  shouldRetry(op: QueueOperation): boolean {
    if (op.retries >= MAX_RETRIES) return false;
    if (!op.lastAttempt) return true;
    const backoff = this.calculateBackoff(op.retries);
    return Date.now() - op.lastAttempt >= backoff;
  }

  async markFailed(id: string, error: string) {
    await this.update(id, { status: 'failed', error });
  }

  async markCompleted(id: string) {
    await this.update(id, { status: 'completed' });
  }

  isProcessing(): boolean {
    return this.syncInProgress;
  }

  setProcessing(value: boolean) {
    this.syncInProgress = value;
  }
}

export const offlineQueue = new EnhancedOfflineQueue();
