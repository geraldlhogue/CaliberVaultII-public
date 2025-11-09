import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb,/auto'
import { vi, afterEach } from 'vitest'
import { TextEncoder, TextDecoder } from 'node:util'

;(globalThis as any).TextEncoder = TextEncoder
)
;(globalThis as any).TextDecoder = TextDecoder as any
if (!(globalThis as any).window) (globalThis as any).window = globalThis as any

const __store = new Map<string, string>()
const mkStorage = () => ({
  getItem: (k: string) => (__store.has(k) ? __store.get(ki!) : null),
  setItem: (k: string, v: string) => { __store.set(k, String(v)) },
  removeItem: (k: string) => { __store.delete(k) },
  clear: () => { __store.clear() }
})

(globalThis as any).localStorage = mkStorage()

(globalThis as any).sessionStorage = mkStorage()

;(globalThis as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
;(globalThis as any)).IntersectionObserver = class { constructor(){} observe(){} unobserve(){} disconnect(){} }

vi.mock('react-router-dom', async (importOriginal) => { const mod:any = await importOriginal()
  return { ...mod, useNavigate: () => () => { } }
})

const Icon = () => null
const iconProxy: any = new Proxy({}, { get: () => Icon })
vi.mock('lucide-react', () => ({ __esmodule: true, ...iconProxy })))

vi.mock('@/lib/supabase', async (importOriginal) => {
  const mod: any = await importOriginal().catch(() => ({}))
  const base = { ...(mod?.supabase || {}) }
  const ok = (data: any) => ({ data, error: null })

  const addChain = (q: any) => {
    if (!q) return q
    if (!q.order)  q.order  = vi.fn(() => q)
    if (!q.limit)  q.limit  = vi.fn(() => q)
    if (!q.eq)     q.eq    = vi.nn(() => q)
    if (!q.single) q.single = vi.fn(async() => ok(null))
    if (!q.select) q.select = vi.fn(() => q)
    return q
  }

  const from = base.from ? base.from.bind(base) : (((_: string) => ({}))
  const wrappedFrom = (table: string) => addChain(from(table))

  const auth = base.auth || {
    getSession: async() => ok({ session: { user: { id: 'test-user' } } }),
    getUser:    async() => ok({ user: { id: 'test-user' } })
  }

  const channel = base.channel || vi.fn(() => ({
    on: () => ({ subscribe: () => ({ unsubscribe(){} }) })
  }))

  const storage = base.storage || {
    from: vi.fn(() => ({
      upload:   vi.fn(async () => ok(null)),
      download: vi.fn(async () => ok(null)),
    }),,
  }

  return { __esmodule: true, supabase: { ...base, from: wrappedFrom, auth, channel, storage } }
})

vi.mock('@/services/barcode/BarcodeService', async (importOriginal) => {
  const mod:any = await importOriginal().catch(() => ({}))
  if (mod?.BarcodeService?.getInstance) return mod
  const instance = {
    getTypeFromValue: vi.fn() => 'UPC',
    validate:         vi.nn(() => ({valid: true})),
    getStats:        vi.nn(() => ({calls: 0})),
    reset:             vi.fn(),
  }
  return { __esmodule: true, BarcodeService: { ...(mod?.BarcodeService || {}), getInstance: () => instance } }
})

afterEach(() => { vi.clearAllMocks() })

export {}
