import { vi } from 'vitest';

// ----- Browser polyfills for jsdom -----
if (typeof window.matchMedia !== 'function') {
  // minimal matchMedia
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},         // deprecated
    removeListener: () => {},      // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!('ResizeObserver' in globalThis)) {
  // minimal ResizeObserver
  // @ts-ignore
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window.localStorage === 'undefined') {
  // simple in-memory localStorage
  const store = new Map<string, string>();
  // @ts-ignore
  window.localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; }
  };
}

// ----- Mock Supabase client for unit tests -----
vi.mock('@supabase/supabase-js', async () => {
  const mockSelectResult = { data: [], error: null };
  const chain = () => ({
    select: () => mockSelectResult,
    insert: () => ({ select: () => mockSelectResult }),
    update: () => ({ select: () => mockSelectResult }),
    delete: () => ({ select: () => mockSelectResult }),
    eq: () => chain(),
    limit: () => mockSelectResult,
    single: () => ({ data: null, error: null }),
  });
  const mockClient = {
    from: () => chain(),
    auth: {
      // Make tests see a real user so code paths that read user.id work
      getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } }, error: null }),
    },
  };
  return {
    createClient: () => mockClient,
  };
});

// ----- Router stub for tests not wrapped in <Router> -----
vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    useNavigate: () => () => {}, // no-op navigate
  };
});
