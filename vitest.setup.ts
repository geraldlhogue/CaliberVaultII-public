import { vi } from 'vitest';

// 1. PWA install prompt
class MockBeforeInstallPromptEvent extends Event {
  constructor() {
    super('beforeinstallprompt');
    this.preventDefault = vi.fn();
    this.prompt = vi.fn();
  }
}
vi.stubGlobal('BeforeInstallPromptEvent', MockBeforeInstallPromptEvent);

// 2. window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 3. IndexedDB + all IDB globals
const mockRequest = {
  result: null,
  error: null,
  source: null,
  transaction: null,
  readyState: 'done',
  onsuccess: vi.fn(),
  onerror: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

vi.stubGlobal('indexedDB', {
  open: vi.fn(() => ({ ...mockRequest, result: { createObjectStore: vi.fn() } })),
  deleteDatabase: vi.fn(() => mockRequest),
});
vi.stubGlobal('IDBRequest', class {});
vi.stubGlobal('IDBDatabase', class {});
vi.stubGlobal('IDBTransaction', class {});
vi.stubGlobal('IDBObjectStore', class {});
vi.stubGlobal('IDBIndex', class {});
vi.stubGlobal('IDBCursor', class {});

// 4. localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

// 5. Supabase — full chain support
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => {
    const chain = {
      insert: vi.fn(() => chain),
      select: vi.fn(() => chain),
      eq: vi.fn(() => ({ ...chain, then: vi.fn() })),
      order: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: { id: 'mock-id' }, error: null })),
      data: [{ id: 'mock-id' }],
      error: null,
    };
    return { from: vi.fn(() => chain) };
  }),
}));
