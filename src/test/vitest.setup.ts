import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { vi, afterEach } from 'vitest'
import { TextEncoder, TextDecoder } from 'node:util'

(globalThis as any).TextEncoder = TextEncoder
(globalThis as any).TextDecoder = TextDecoder as any
if (!(globalThis as any).window) (globalThis as any).window = globalThis as any

const __store = new Map<string,string>()
const mkStorage = () => ({
  getItem: (k:string) => (__store.has(k) ? __store.get(k)! : null),
  setItem: (k:string, v:string) => { __store.set(k, String(v)) },
  removeItem: (k:string) => { __store.delete(k) },
  clear: () => { __store.clear() }
})
(globalThis as any).localStorage = mkStorage()
(globalThis as any).sessionStorage = mkStorage()

vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal();
  return { ...mod, useNavigate: () => () => {} }
})

const ok = (data:any) => ({ data, error: null })
const chain = () => ({
  select: vi.fn(() => chain()),
  order:  vi.fn(() => chain()),
  limit:  vi.fn(() => chain()),
  eq:     vi.fn(() => chain()),
  single: vi.fn(async () => ok(null))
})
const from = vi.fn(() => ({
  select: vi.fn(() => chain()),
  order:  vi.fn(() => chain()),
  limit:  vi.fn(() => chain()),
  eq:     vi.fn(() => chain()),
  insert: vi.fn(async () => ok(null)),
  update: vi.fn(async () => ok(null)),
  delete: vi.fn(async () => ok(null))
}))
const supabase = {
  from,
  channel: vi.fn(() => ({ on: () => ({ subscribe: () => ({ unsubscribe(){} }) }) })),
  auth: {
    getSession: async () => ok({ session: { user: { id: 'test-user' } } }),
    getUser:    async () => ok({ user: { id: 'test-user' } })
  },
  storage: { from: vi.fn(() => ({ upload: vi.fn(async()=>ok(null)), download: vi.fn(async()=>ok(null)) })) }
}
vi.mock('@/lib/supabase', () => ({ __esModule: true, supabase }))

const Icon = () => null
const iconProxy: any = new Proxy({}, { get: () => Icon })
vi.mock('lucide-react', () => ({ __esModule: true, ...iconProxy }))

vi.mock('@/services/barcode/BarcodeService', () => {
  const instance = {
    getTypeFromValue: vi.fn(()=>'UPC'),
    validate: vi.fn(() => ({ valid: true })),
    getStats: vi.fn(() => ({ calls: 0 })),
    reset: vi.fn()
  }
  return { __esModule: true, BarcodeService: { getInstance: () => instance } }
})

vi.mock('@/services/category', async (importOriginal) => {
  const mod: any = await importOriginal().catch(()=>({}))
  const noop = new Proxy({}, { get: () => vi.fn() })
  return { __esModule: true, ...(mod||{}), ammunitionService: mod?.ammunitionService ?? noop, reloadingService: mod?.reloadingService ?? noop }
})

(globalThis as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
(globalThis as any).IntersectionObserver = class { constructor(){} observe(){} unobserve(){} disconnect(){} }

afterEach(() => { vi.clearAllMocks() })

export {}
