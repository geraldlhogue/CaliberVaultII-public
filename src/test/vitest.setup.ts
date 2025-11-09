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

/**
 * Supabase: robust, fully-chainable mock
 * - Covers typical PostgREST chain, filters, and terminators.
 * - Provides auth + storage shapes commonly used in apps.
 */
const createMockSupabaseClient = () => {
  const mockData = [{ id: 'mock-id', created_at: new Date().toISOString() }]
  const mockError = null

  // Chainable query builder
  const qb: any = {
    // Data operations
    select: vi.fn(() => qb),
    insert: vi.fn(() => qb),
    update: vi.fn(() => qb),
    delete: vi.fn(() => qb),
    from:   vi.fn(() => qb),
    rpc:    vi.fn(() => qb),

    // Filters
    eq: vi.fn(() => qb),
    neq: vi.fn(() => qb),
    gt: vi.fn(() => qb),
    gte: vi.fn(() => qb),
    lt: vi.fn(() => qb),
    lte: vi.fn(() => qb),
    like: vi.fn(() => qb),
    ilike: vi.fn(() => qb),
    in: vi.fn(() => qb),
    is: vi.fn(() => qb),
    filter: vi.fn(() => qb),
    or: vi.fn(() => qb),
    not: vi.fn(() => qb),

    // Ordering / pagination
    order: vi.fn(() => qb),
    limit: vi.fn(() => qb),
    range: vi.fn(() => qb),

    // Terminators
    single: vi.fn(() => Promise.resolve({ data: mockData[0], error: mockError })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: mockData[0], error: mockError })),

    // Promise-like behavior for bare .select() calls without terminators
    then: (onFulfilled: any, onRejected: any) =>
      Promise.resolve({ data: mockData, error: mockError }).then(onFulfilled, onRejected),
  }

  return {
    from: vi.fn(() => qb),
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
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

// Intercept supabase client creation
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(createMockSupabaseClient),
}))
