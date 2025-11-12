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
 * Supabase: robust, fully-chainable mock with proper factory pattern
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

  const mockInventoryItems = [
    { id: 'inv123', name: 'Test Item 1', user_id: 'user-1', category_id: '1' },
    { id: 'inv124', name: 'Test Item 2', user_id: 'user-1', category_id: '2' },
  ]

  // Factory function to create fresh query builder instances
  const createQueryBuilder = (table?: string) => {
    const builder: any = {
      _table: table,
      _insertData: null,
      _filters: [],
    }

    builder.select = vi.fn(function(this: any) {
      return createQueryBuilder(this._table)
    })
    
    builder.insert = vi.fn(function(this: any, data: any) {
      const newBuilder = createQueryBuilder(this._table)
      newBuilder._insertData = data
      return newBuilder
    })
    
    builder.update = vi.fn(function(this: any, data: any) {
      const newBuilder = createQueryBuilder(this._table)
      newBuilder._updateData = data
      return newBuilder
    })
    
    builder.delete = vi.fn(function(this: any) {
      return createQueryBuilder(this._table)
    })
    
    builder.from = vi.fn(function(this: any, tableName: string) {
      return createQueryBuilder(tableName)
    })
    
    builder.rpc = vi.fn(function(this: any) {
      return createQueryBuilder(this._table)
    })

    // All filter methods return fresh builders
    builder.eq = vi.fn(function(this: any, col: string, val: any) {
      const newBuilder = createQueryBuilder(this._table)
      newBuilder._insertData = this._insertData
      newBuilder._filters = [...(this._filters || []), { type: 'eq', col, val }]
      return newBuilder
    })
    
    builder.neq = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.gt = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.gte = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.lt = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.lte = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.like = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.ilike = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.in = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.is = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.filter = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.or = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.not = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.order = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.limit = vi.fn(function(this: any) { return createQueryBuilder(this._table) })
    builder.range = vi.fn(function(this: any) { return createQueryBuilder(this._table) })

    builder.single = vi.fn(function(this: any) {
      let data
      if (this._table === 'categories') {
        data = mockCategories[0]
      } else if (this._insertData) {
        data = { id: 'inv123', ...this._insertData }
      } else {
        data = mockInventoryItems[0]
      }
      return Promise.resolve({ data, error: null })
    })

    builder.maybeSingle = vi.fn(function(this: any) {
      const data = this._table === 'categories' ? mockCategories[0] : mockInventoryItems[0]
      return Promise.resolve({ data, error: null })
    })

    builder.then = function(this: any, onFulfilled: any, onRejected: any) {
      let data
      let error = null

      // Check for invalid category (error path)
      if (this._insertData && this._insertData.category_id === 'invalid') {
        error = { message: 'Invalid category' }
        return Promise.resolve({ data: null, error }).then(onFulfilled, onRejected)
      }

      if (this._table === 'categories') {
        data = mockCategories
      } else if (this._insertData) {
        data = Array.isArray(this._insertData)
          ? this._insertData.map((d: any, i: number) => ({ id: `inv${123 + i}`, ...d }))
          : [{ id: 'inv123', ...this._insertData }]
      } else {
        data = mockInventoryItems
      }

      return Promise.resolve({ data, error }).then(onFulfilled, onRejected)
    }

    return builder
  }

  return {
    from: vi.fn((table: string) => createQueryBuilder(table)),
    auth: {
      signInWithPassword: vi.fn(() => 
        Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn((callback) => {
        // Call callback immediately with signed in state
        callback('SIGNED_IN', { user: { id: 'user-1' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      getUser: vi.fn(() => 
        Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })
      ),
      getSession: vi.fn(() => 
        Promise.resolve({ 
          data: { session: { user: { id: 'user-1' } } }, 
          error: null 
        })
      ),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => 
          Promise.resolve({ data: { path: 'mock/path.jpg' }, error: null })
        ),
        download: vi.fn(() => 
          Promise.resolve({ data: new Blob(), error: null })
        ),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'http://mock.url/path.jpg' } 
        })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(function(this: any) { return this }),
      subscribe: vi.fn(() => Promise.resolve()),
    })),
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(createMockSupabaseClient),
}))
