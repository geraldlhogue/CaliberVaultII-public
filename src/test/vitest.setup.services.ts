import { vi } from 'vitest';

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
  BarcodeService: class {
    isValidUPC(code: string) { return code.length === 12; }
    isValidEAN(code: string) { return code.length === 13; }
    detectBarcodeType(code: string) { 
      if (code.length === 12) return 'UPC';
      if (code.length === 13) return 'EAN';
      return 'UNKNOWN';
    }
    async lookup() { return { success: true, data: {} }; }
    static getInstance() { return new this(); }
  },
  barcodeService: {
    isValidUPC: vi.fn((code: string) => code.length === 12),
    isValidEAN: vi.fn((code: string) => code.length === 13),
    detectBarcodeType: vi.fn((code: string) => code.length === 12 ? 'UPC' : 'EAN'),
  }
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
