import { beforeEach } from 'vitest'

// Promise-wrapped deleteDatabase so we can await it reliably.
function deleteDb(name: string) {
  return new Promise<void>((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(name)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()   // don't hang the suite on error
      req.onblocked = () => setTimeout(() => resolve(), 50)
    } catch {
      // Synchronous throw in some environments — keep flowing.
      setTimeout(() => resolve(), 0)
    }
  })
}

const DB_NAME = 'BarcodeCacheDB'

beforeEach(async () => {
  await deleteDb(DB_NAME)
})

