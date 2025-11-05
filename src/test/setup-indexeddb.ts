import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('fake-indexeddb/auto')
if (!(globalThis as any).indexedDB) {
  throw new Error('fake-indexeddb failed to install global indexedDB')
}
