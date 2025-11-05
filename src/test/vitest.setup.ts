import { vi } from 'vitest'

// --- Browser polyfills (jsdom gaps) ---
if (typeof window.matchMedia !== 'function') {
  // @ts-ignore
  window.matchMedia = (q) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false
  })
}
if (!('ResizeObserver' in globalThis)) {
  // @ts-ignore
  globalThis.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} }
}
if (typeof window.localStorage === 'undefined') {
  const store = new Map<string,string>()
  // @ts-ignore
  window.localStorage = {
    getItem: (k) => store.has(k) ? store.get(k)! : null,
    setItem: (k,v) => { store.set(k,String(v)) },
    removeItem: (k) => { store.delete(k) },
    clear: () => { store.clear() },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length(){ return store.size }
  }
}

// --- Mock @supabase/supabase-js (package) ---
vi.mock('@supabase/supabase-js', async () => {
  const mockSelectResult = { data: [], error: null }
  const chain = () => ({
    select: () => mockSelectResult,
    insert: () => ({ select: () => mockSelectResult }),
    update: () => ({ select: () => mockSelectResult }),
    delete: () => ({ select: () => mockSelectResult }),
    eq: () => chain(),
    limit: () => mockSelectResult,
    single: () => ({ data: null, error: null }),
  })
  const mockClient = {
    from: () => chain(),
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } }, error: null }),
    },
  }
  return { createClient: () => mockClient }
})

// --- Mock path alias modules used in app code under tests ---
vi.mock('@/lib/supabase', async () => {
  const mockSelectResult = { data: [], error: null }
  const chain = () => ({
    select: () => mockSelectResult,
    insert: () => ({ select: () => mockSelectResult }),
    update: () => ({ select: () => mockSelectResult }),
    delete: () => ({ select: () => mockSelectResult }),
    eq: () => chain(),
    limit: () => mockSelectResult,
    single: () => ({ data: null, error: null }),
  })
  return {
    supabase: {
      from: () => chain(),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } }, error: null }),
      },
    }
  }
})

vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal()
  return { ...mod, useNavigate: () => () => {} }
})

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}))
