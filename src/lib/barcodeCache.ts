// src/lib/barcodeCache.ts
import { awaitTxDone } from './idbTxDone';

const DB_NAME = 'BarcodeCacheDB';
const STORE_NAME = 'barcodes';
const VERSION = 1;

export class BarcodeCacheManager {
  async init(): Promise<void> {
    const db = await this.openOnce();
    try {} finally { try { db.close(); } catch {} }
  }

  private async openOnce(): Promise<IDBDatabase> {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);

      req.onupgradeneeded = () => {
        const udb = req.result;
        if (!udb.objectStoreNames.contains(STORE_NAME)) {
          udb.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
    });

    db.onversionchange = () => { try { db.close(); } catch {} };
    return db;
  }

  // Accepts either (barcode, data) or (dataObject)
  async set(barcodeOrData: any, maybeData?: any): Promise<void> {
    const db = await this.openOnce();
    try {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      let record: any;
      let key: string;

      if (maybeData === undefined && typeof barcodeOrData === 'object') {
        // called as set(dataObject)
        record = { ...barcodeOrData };
        key = (record.barcode ?? '').toString();
      } else {
        // called as set(barcode, data)
        key = (barcodeOrData ?? '').toString();
        record =
          maybeData && typeof maybeData === 'object'
            ? { barcode: key, ...maybeData }
            : { barcode: key, title: String(maybeData) };
      }

      if (!key) throw new Error('Missing barcode key for cache record');

      const req = store.put(record, key);
      await new Promise<void>((res, rej) => {
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error ?? new Error('put failed'));
      });

      await awaitTxDone(tx);
    } finally {
      try { db.close(); } catch {}
    }
  }

  async get(barcode: string): Promise<any | null> {
    const key = (barcode ?? '').toString();
    const db = await this.openOnce();
    try {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const req = store.get(key);
      const result = await new Promise<any | undefined>((res, rej) => {
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error ?? new Error('get failed'));
      });

      await awaitTxDone(tx);
      return result ?? null;
    } finally {
      try { db.close(); } catch {}
    }
  }

  async delete(barcode: string): Promise<void> {
    const key = (barcode ?? '').toString();
    const db = await this.openOnce();
    try {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      await new Promise<void>((res, rej) => {
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error ?? new Error('delete failed'));
      });
      await awaitTxDone(tx);
    } finally {
      try { db.close(); } catch {}
    }
  }

  async clear(): Promise<void> {
    const db = await this.openOnce();
    try {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      await new Promise<void>((res, rej) => {
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error ?? new Error('clear failed'));
      });
      await awaitTxDone(tx);
    } finally {
      try { db.close(); } catch {}
    }
  }
}

export const barcodeCache = new BarcodeCacheManager();
