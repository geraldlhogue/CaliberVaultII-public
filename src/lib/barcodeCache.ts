// src/lib/barcodeCache.ts
// Raw IndexedDB implementation with deterministic transaction closing.
// IMPORTANT: We always await transaction completion to avoid open handles in tests.

import { awaitTxDone } from './idbTxDone';

const DB_NAME = 'BarcodeCacheDB';
const STORE_NAME = 'barcodes';
const VERSION = 1;

// The tests import this class and call set/get/clear/delete.
export class BarcodeCacheManager {
  private db: IDBDatabase | null = null;

  // Open (or reuse) the DB
  private async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Key path 'barcode' so store.put(data) will work if data.barcode exists.
          db.createObjectStore(STORE_NAME, { keyPath: 'barcode' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
      req.onblocked = () => {
        // Let tests proceed; they also try to delete DB during teardown.
        // If blocked, still resolve onsuccess/onerror above.
      };
    });

    // When the DB connection closes (e.g., version change), clear our reference.
    this.db.onclose = () => { this.db = null; };
    return this.db;
  }

  // Insert or replace a single barcode record.
  // Expects an object with at least { barcode: string, ... }.
  async set(data: any): Promise<void> {
    const db = await this.open();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const req = store.put(data);
    await new Promise<void>((res, rej) => {
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error ?? new Error('put failed'));
    });

    await awaitTxDone(tx); // <<< critical: wait for commit
  }

  // Fetch a record by barcode; return null if not found.
  async get(barcode: string): Promise<any | null> {
    const db = await this.open();
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(barcode);
    const result = await new Promise<any | undefined>((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error ?? new Error('get failed'));
    });

    // readonly transactions auto-complete, but we can still let them finish cleanly
    await awaitTxDone(tx);
    return result ?? null;
  }

  // Remove a single barcode
  async delete(barcode: string): Promise<void> {
    const db = await this.open();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const req = store.delete(barcode);
    await new Promise<void>((res, rej) => {
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error ?? new Error('delete failed'));
    });

    await awaitTxDone(tx);
  }

  // Clear the entire cache
  async clear(): Promise<void> {
    const db = await this.open();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const req = store.clear();
    await new Promise<void>((res, rej) => {
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error ?? new Error('clear failed'));
    });

    await awaitTxDone(tx);
  }
}

// Keep the exported singleton if your app uses it elsewhere.
export const barcodeCache = new BarcodeCacheManager();

