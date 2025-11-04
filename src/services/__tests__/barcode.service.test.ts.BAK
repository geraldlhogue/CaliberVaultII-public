import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies BEFORE imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(() => Promise.resolve({ 
        data: { success: false, error: 'Not found' }, 
        error: null 
      }))
    }
  }
}));

vi.mock('@/lib/barcodeCache', () => ({
  barcodeCache: {
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve()),
    getStats: vi.fn(() => Promise.resolve({
      totalCached: 0,
      totalHits: 0,
      mostUsed: [],
      recentlyUsed: []
    })),
    clear: vi.fn(() => Promise.resolve())
  },
  BarcodeData: {}
}));

// Import actual BarcodeService after mocks
vi.mock('@/services/barcode/BarcodeService', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    BarcodeService: actual.BarcodeService,
    barcodeService: new actual.BarcodeService()
  };
});

import { BarcodeService } from '../barcode/BarcodeService';

describe('BarcodeService', () => {
  let service: BarcodeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BarcodeService();
  });

  it('should validate UPC format', () => {
    expect(service.isValidUPC('012345678905')).toBe(true);
    expect(service.isValidUPC('0123456789012')).toBe(true);
    expect(service.isValidUPC('invalid')).toBe(false);
    expect(service.isValidUPC('123')).toBe(false);
  });

  it('should validate EAN format', () => {
    expect(service.isValidEAN('5901234123457')).toBe(true);
    expect(service.isValidEAN('123')).toBe(false);
    expect(service.isValidEAN('12345678')).toBe(false);
  });

  it('should detect barcode type', () => {
    expect(service.detectBarcodeType('012345678905')).toBe('UPC');
    expect(service.detectBarcodeType('5901234123457')).toBe('EAN');
    expect(service.detectBarcodeType('12345678')).toBe('EAN-8');
    expect(service.detectBarcodeType('invalid')).toBe('UNKNOWN');
  });

  it('should track API usage', () => {
    const usage = service.getApiUsage();
    expect(usage.callsToday).toBe(0);
    expect(usage.limit).toBe(90);
    expect(usage.remaining).toBe(90);
  });

  it('should reset API counter', () => {
    service.resetApiCounter();
    const usage = service.getApiUsage();
    expect(usage.callsToday).toBe(0);
  });
});
