import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';


// Mock Supabase FIRST before any other imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      const chainable = {
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
      };
      // Make it thenable so it can be awaited directly
      (chainable as any).then = (resolve: any) => {
        return Promise.resolve({ data: [], error: null }).then(resolve);
      };
      return chainable;
    }),
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

// Mock service APIs
vi.mock('@/services/api/InventoryAPIService', () => ({
  InventoryAPIService: class {
    async getItems() { return []; }
    async createItem() { return { id: '1' }; }
    async updateItem() { return { id: '1' }; }
    async deleteItem() { return true; }
    async list() { return { success: true, data: [] }; }
    async getById() { return { success: true, data: {} }; }
    async create() { return { success: true, data: { id: '1' } }; }
    async update() { return { success: true, data: { id: '1' } }; }
    async delete() { return { success: true }; }
  },
  inventoryAPIService: {
    getItems: vi.fn(async () => []),
    createItem: vi.fn(async () => ({ id: '1' })),
  }
}));

vi.mock('@/services/reports/ReportService', () => ({
  ReportService: class {
    async generateSummaryReport() { return []; }
    async generateCategoryReport() { return {}; }
    async generateValueReport() { return { total: 0 }; }
    static async generateReport() { return { metadata: {}, data: {} }; }
    static async saveCustomReport() { return { id: '1' }; }
    static async getCustomReports() { return []; }
  }
}));

vi.mock('@/services/security/SecurityService', () => ({
  SecurityService: class {
    async logSecurityEvent() { return true; }
    async checkPermission() { return true; }
    async getSecurityEvents() { return []; }
  },
  service: {
    logSecurityEvent: vi.fn(async () => true),
    checkPermission: vi.fn(async () => true),
  }
}));

vi.mock('@/services/barcode/BarcodeService', () => ({
  barcodeService: {
    isValidUPC: vi.fn(() => true),
    isValidEAN: vi.fn(() => true),
    detectBarcodeType: vi.fn(() => 'UPC'),
  },
  service: {
    isValidUPC: vi.fn(() => true),
    isValidEAN: vi.fn(() => true),
    detectBarcodeType: vi.fn(() => 'UPC'),
  },
}));
vi.mock('@/lib/errorHandler', () => {
  const handleError = vi.fn((error: any) => ({ 
    success: false,
    error,
    userMessage: 'Error occurred',
    technicalMessage: error.message,
    context: {}
  }));
  
  class ErrorHandler { 
    log = vi.fn();
    categorize = vi.fn(() => 'general');
    handleOperation = vi.fn(async (op: any) => {
      try {
        const data = await op();
        return { success: true, data };
      } catch (error) {
        return handleError(error);
      }
    });
    getErrorLogs = vi.fn(() => []);
    clearErrorLogs = vi.fn();
  }
  
  return { 
    handleError,
    ErrorHandler,
    errorHandler: new ErrorHandler(),
    withErrorHandling: vi.fn(async (op: any) => {
      try {
        const data = await op();
        return { success: true, data };
      } catch (error) {
        return handleError(error);
      }
    })
  };
});

// Mock browser caches API for barcode cache tests
(globalThis as any).caches = {
  open: vi.fn(async () => ({
    match: vi.fn(async () => undefined),
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => true),
    keys: vi.fn(async () => []),
  }))
} as any;

// Mock IndexedDB for barcode cache
import 'fake-indexeddb/auto';

// --- test env patch START ---
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((q) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// hard mock for @/lib/supabase to unblock tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: vi.fn(async () => ({ data: [], error: null })),
      insert: vi.fn(async () => ({ data: { id: '1' }, error: null })),
      update: vi.fn(async () => ({ data: { id: '1' }, error: null })),
      delete: vi.fn(async () => ({ data: null, error: null })),
    }),
  },
}));

// barcode service & utils stubs to match tests
vi.mock('@/services/barcode/BarcodeService', () => ({
  barcodeService: {
    isValidUPC: vi.fn(() => true),
    isValidEAN: vi.fn(() => true),
    detectBarcodeType: vi.fn(() => 'UPC'),
  },
}));

vi.mock('@/lib/barcodeUtils', () => ({
  validateUPC: vi.fn(() => true),
  validateEAN: vi.fn(() => true),
  calculateCheckDigit: vi.fn(() => 5),
  formatUPC: vi.fn(() => '0 12345 67890 5'),
  formatEAN: vi.fn(() => '590-1234-12345-7'),
}));

// csv validator facade
vi.mock('@/utils/csvValidator', () => ({
  validateCSVRow: vi.fn(() => ({ valid: true })),
  validateCSVHeaders: vi.fn(() => true),
}));

// StorageService shape expected by tests
vi.mock('@/services/storage.service', () => ({
  default: class StorageService {
    async uploadFile() { return true; }
    async deleteFile() { return true; }
    async listFiles() { return []; }
  }
}));

// Cache API + fake timers for barcodeCache
(globalThis as any).caches = {
  open: async () => ({ match: async () => undefined, put: async () => undefined }),
} as any;
try { vi.useFakeTimers(); } catch (_) {}

// --- test env patch END ---
