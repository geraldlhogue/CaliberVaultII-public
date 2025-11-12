import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/* PWA, matchMedia, localStorage, ResizeObserver shims */
class MockBeforeInstallPromptEvent extends Event {
  preventDefault = vi.fn()
  prompt = vi.fn()
  constructor() { super('beforeinstallprompt') }
}
vi.stubGlobal('BeforeInstallPromptEvent', MockBeforeInstallPromptEvent)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
  }))
})
vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() })
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as any

/* Supabase mock - fully chainable */
const createMockSupabaseClient = () => {
  const mockCategories = [
    { id: '1', name: 'Firearms' }, { id: '2', name: 'Ammunition' },
    { id: '3', name: 'Bullets' }, { id: '4', name: 'Magazines' }
  ]
  
  const createQB = () => {
    const qb: any = {
      _table: '', _insertData: null, _filters: [],
      select: vi.fn(function(this: any) { return this }),
      insert: vi.fn(function(this: any, d: any) { this._insertData = d; return this }),
      update: vi.fn(function(this: any) { return this }),
      delete: vi.fn(function(this: any) { return this }),
      eq: vi.fn(function(this: any, col: string, val: any) { this._filters.push({col,val}); return this }),
      neq: vi.fn(function(this: any) { return this }),
      single: vi.fn(function(this: any) {
        const data = this._insertData ? { id: 'inv123', ...this._insertData } : { id: 'inv123' }
        return Promise.resolve({ data, error: null })
      }),
      then: function(this: any, onF: any) {
        let data = this._table === 'categories' ? mockCategories : []
        if (this._insertData) {
          data = Array.isArray(this._insertData)
            ? this._insertData.map((d: any, i: number) => ({ id: `inv${i}`, ...d }))
            : [{ id: 'inv123', ...this._insertData }]
        }
        return Promise.resolve({ data, error: null }).then(onF)
      }
    }
    return qb
  }

  return {
    from: vi.fn((table: string) => { const qb = createQB(); qb._table = table; return qb }),
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-1' } } }, error: null }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock/path.jpg' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://mock.url/path.jpg' } }))
      }))
    },
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }))
  }
}

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(createMockSupabaseClient) }))
