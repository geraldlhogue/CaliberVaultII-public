/**
 * Mock Service Registry
 * Centralized registry for all service mocks to ensure consistency
 */
import { vi } from 'vitest';

export class MockServiceRegistry {
  private static instance: MockServiceRegistry;
  private mocks: Map<string, any> = new Map();

  static getInstance(): MockServiceRegistry {
    if (!this.instance) {
      this.instance = new MockServiceRegistry();
    }
    return this.instance;
  }

  register(serviceName: string, mockImplementation: any) {
    this.mocks.set(serviceName, mockImplementation);
  }

  get(serviceName: string) {
    return this.mocks.get(serviceName);
  }

  reset() {
    this.mocks.clear();
  }

  resetAll() {
    this.mocks.forEach(mock => {
      if (mock && typeof mock.mockReset === 'function') {
        mock.mockReset();
      }
    });
  }
}

// Singleton instance
export const mockRegistry = MockServiceRegistry.getInstance();

// Standard mock implementations
export const standardMocks = {
  barcodeService: {
    isValidUPC: vi.fn((code: string) => code.length === 12),
    isValidEAN: vi.fn((code: string) => code.length === 13),
    detectBarcodeType: vi.fn((code: string) => {
      if (code.length === 12) return 'UPC';
      if (code.length === 13) return 'EAN';
      return 'UNKNOWN';
    }),
    lookup: vi.fn(async () => ({ success: true, data: {} })),
  },
  
  inventoryService: {
    getItems: vi.fn(async () => []),
    createItem: vi.fn(async (item: any) => ({ id: '1', ...item })),
    updateItem: vi.fn(async (id: string, item: any) => ({ id, ...item })),
    deleteItem: vi.fn(async () => true),
  },
};
