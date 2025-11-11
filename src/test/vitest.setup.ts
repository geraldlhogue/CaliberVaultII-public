import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/**
 * Minimal browser/env shims used by the app/tests
 */

/* 1) PWA install prompt */
class MockBeforeInstallPromptEvent extends Event {
  preventDefault: () => void
  prompt: () => void
  constructor() {
    super('beforeinstallprompt')
    this.preventDefault = vi.fn()
    this.prompt = vi.fn()
  }
}
vi.stubGlobal('BeforeInstallPromptEvent', MockBeforeInstallPromptEvent)

/* 2) matchMedia */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/* 3) localStorage */
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

/* 4) ResizeObserver polyfill */
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

/**
 * Supabase: robust, fully-chainable mock
 */
const createMockSupabaseClient = () => {
  const mockCategories = [
    { id: '1', name: 'Firearms' },
    { id: '2', name: 'Ammunition' },
    { id: '3', name: 'Bullets' },
    { id: '4', name: 'Magazines' },
    { id: '5', name: 'Accessories' },
    { id: '6', name: 'Optics' },
    { id: '7', name: 'Suppressors' },
    { id: '8', name: 'Reloading' },
    { id: '9', name: 'Cases' },
    { id: '10', name: 'Primers' },
    { id: '11', name: 'Powder' },
    { id: '12', name: 'Parts' },
  ]
  
  const mockData = [{ id: 'mock-id', created_at: new Date().toISOString() }]
  const mockError = null

  const qb: any = {
    select: vi.fn(function(this: any) { return this }),
    insert: vi.fn(function(this: any, data: any) { 
      this._insertData = data
      return this 
    }),
    update: vi.fn(function(this: any) { return this }),
    delete: vi.fn(function(this: any) { return this }),
    from: vi.fn(function(this: any, table: string) { 
      this._table = table
      return this 
    }),
    rpc: vi.fn(function(this: any) { return this }),
    eq: vi.fn(function(this: any) { return this }),
    neq: vi.fn(function(this: any) { return this }),
    gt: vi.fn(function(this: any) { return this }),
    gte: vi.fn(function(this: any) { return this }),
    lt: vi.fn(function(this: any) { return this }),
    lte: vi.fn(function(this: any) { return this }),
    like: vi.fn(function(this: any) { return this }),
    ilike: vi.fn(function(this: any) { return this }),
    in: vi.fn(function(this: any) { return this }),
    is: vi.fn(function(this: any) { return this }),
    filter: vi.fn(function(this: any) { return this }),
    or: vi.fn(function(this: any) { return this }),
    not: vi.fn(function(this: any) { return this }),
    order: vi.fn(function(this: any) { return this }),
    limit: vi.fn(function(this: any) { return this }),
    range: vi.fn(function(this: any) { return this }),
    single: vi.fn(function(this: any) { 
      const data = this._table === 'categories' ? mockCategories[0] : 
                   this._insertData ? { id: 'mock-id', ...this._insertData } : mockData[0]
      return Promise.resolve({ data, error: mockError })
    }),
    maybeSingle: vi.fn(function(this: any) { 
      const data = this._table === 'categories' ? mockCategories[0] : mockData[0]
      return Promise.resolve({ data, error: mockError })
    }),
    then: function(this: any, onFulfilled: any, onRejected: any) {
      let data = this._table === 'categories' ? mockCategories : mockData
      if (this._insertData) {
        data = Array.isArray(this._insertData) 
          ? this._insertData.map((d: any, i: number) => ({ id: `mock-id-${i}`, ...d }))
          : [{ id: 'mock-id', ...this._insertData }]
      }
      return Promise.resolve({ data, error: mockError }).then(onFulfilled, onRejected)
    },
  }

  return {
    from: vi.fn((table: string) => { 
      const newQb = Object.create(qb)
      newQb._table = table
      return newQb
    }),
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-1' } } }, error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock/path.jpg' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://mock.url/path.jpg' } })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(createMockSupabaseClient),
}))
