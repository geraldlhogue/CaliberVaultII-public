// Robust IndexedDB teardown for Vitest. Use jsdom's built-in indexedDB.
import { afterAll, afterEach } from 'vitest'

let disposeBarcodeDb: null | (() => Promise<void>) = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  disposeBarcodeDb = require('../../barcodeDb').disposeBarcodeDb
} catch {}

const DB_NAME = 'barcode-cache'

async function closeOpenDb() {
  try {
    if (disposeBarcodeDb) await disposeBarcodeDb()
  } catch {
    // ignore
  }
}

async function nukeDb(name: string, timeoutMs = 1500) {
  await closeOpenDb()
  await new Promise<void>((resolve) => {
    let done = false
    const finish = () => { if (!done) { done = true; resolve() } }
    const req = indexedDB.deleteDatabase(name)
    req.onsuccess = finish
    req.onerror = finish
    req.onblocked = () => setTimeout(finish, 200)
    setTimeout(finish, timeoutMs)
  })
}

afterEach(async () => { await closeOpenDb() })
afterAll(async () => { await nukeDb(DB_NAME) })

