import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { vi, afterEach } from 'vitest'
import { TextEncoder, TextDecoder } from 'node:util'

// globals
;(globalThis as any).TextEncoder = TextEncoder
;(globalThis as any).TextDecoder = TextDecoder as any
if (!(globalThis as any).window) (globalThis as any).window = globalThis as any

// simple storage shims
const __store = new Map<string, string>()
const mkStorage = () => ({
  getItem: (k: string) => (__store.has(k) ? (__store.get(k) as string) : null),
  setItem: (k: string, v: string) => { __store.set(k, String(v)) },
  removeItem: (k: string) => { __store.delete(k) },
  clear: () => { __store.clear() },
})
;(globalThis as any).localStorage = mkStorage()
;(globalThis as any).sessionStorage = mkStorage()

// observers
;(globalThis as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
;(globalThis as any).IntersectionObserver = class { constructor(){} observe(){} unobserve(){} disconnect(){} }

// router
vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal()
  return { ...mod, useNavigate: () => () => {} }
})

// icons
const Icon = () => null
const iconProxy: any = new Proxy({}, { get: () => Icon })
vi.mock('lucide-react', () => ({ __esModule: true, ...iconProxy }))

// supabase: augment existing mock if present; otherwise provide minimal
vi.mock('@/lib/supabase', async (importOriginal) => {
  const ok = (data: any) => ({ data, error: null })
  const addChain = (q: any) => {
    if (!q) return q
    if (!q.select) q.select = vi.fn(() => q)
    if (!q.order)  q.order  = vi.fn(() => q)
    if (!q.limit)  q.limit  = vi.fn(() => q)
    if (!q.eq)     q.eq     = vi.fn(() => q)
    if (!q.single) q.single = vi.fn(async () => ok(null))
    return q
  }

  const mod: any  = await importOriginal().catch(() => ({}))
  const base      = { ...(mod?.supabase ?? {}) }

  const fromImpl  = base.from ? base.from.bind(base) : ((_: string) => ({}))
  const from      = (table: string) => addChain(fromImpl(table))

  const channel   = base.channel ?? vi.fn(() => ({ on: () => ({ subscribe: () => ({ unsubscribe(){} }) }) }))
  const auth      = base.auth    ?? { getSession: async () => ok({ session: { user: { id: 'test-user' } } }),
                                      getUser:    async () => ok({ user: { id: 'test-user' } }) }
  const storage   = base.storage ?? { from: vi.fn(() => ({ upload: vi.fn(async () => ok(null)),
                                                          download: vi.fn(async () => ok(null)) })) }

  return { __esModule: true, supabase: { ...base, from, channel, auth, storage } }
})

// BarcodeService.getInstance: only add if missing
vi.mock('@/services/barcode/BarcodeService', async (importOriginal) => {
  const mod: any = await importOriginal().catch(() => ({}))
  if (mod?.BarcodeService?.getInstance) return mod
  const instance = {
    getTypeFromValue: vi.fn(() => 'UPC'),
    validate:         vi.fn(() => ({ valid: true })),
    getStats:         vi.fn(() => ({ calls: 0 })),
    reset:            vi.fn(),
  }
  return { __esModule: true, BarcodeService: { ...(mod?.BarcodeService ?? {}), getInstance: () => instance } }
})

// keep test isolation
afterEach(() => { vi.clearAllMocks() })

export {}
