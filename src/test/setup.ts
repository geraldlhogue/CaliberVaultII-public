import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';


// Mock Supabase FIRST before any other imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      updateUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

// Mock lucide-react icons - return simple div elements
vi.mock('lucide-react', () => {
  const mockIcon = () => null;
  return new Proxy({}, {
    get: () => mockIcon,
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Capacitor plugins
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    getInfo: vi.fn(() => Promise.resolve({ version: '1.0.0', build: '1', id: 'test' })),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: vi.fn(() => Promise.resolve({ 
      dataUrl: 'data:image/png;base64,mock', 
      format: 'png',
      saved: false 
    })),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(() => Promise.resolve({ uri: 'file://mock-uri' })),
    readFile: vi.fn(() => Promise.resolve({ data: 'mock-data' })),
    deleteFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve({ files: [] })),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(() => Promise.resolve()),
    notification: vi.fn(() => Promise.resolve()),
    vibrate: vi.fn(() => Promise.resolve()),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
    message: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  LineChart: () => null,
  BarChart: () => null,
  PieChart: () => null,
  AreaChart: () => null,
  ComposedChart: () => null,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ZAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
  ReferenceLine: () => null,
}));

// Browser API mocks
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

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
} as any;

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any;

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

const storageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};

global.localStorage = storageMock as any;
global.sessionStorage = storageMock as any;

// Mock window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: vi.fn(),
  replace: vi.fn(),
  assign: vi.fn(),
} as any;
