import { describe, it, expect, vi, beforeEach } from 'vitest';
import { barcodeService } from '../barcode/BarcodeService';

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

describe('BarcodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    barcodeService.resetApiCounter();
  });

  it('should validate UPC format', () => {
    expect(barcodeService.isValidUPC('012345678905')).toBe(true);
    expect(barcodeService.isValidUPC('invalid')).toBe(false);
    expect(barcodeService.isValidUPC('123')).toBe(false);
  });

  it('should validate EAN format', () => {
    expect(barcodeService.isValidEAN('5901234123457')).toBe(true);
    expect(barcodeService.isValidEAN('123')).toBe(false);
    expect(barcodeService.isValidEAN('12345678')).toBe(false);
  });

  it('should detect barcode type', () => {
    expect(barcodeService.detectBarcodeType('012345678905')).toBe('UPC');
    expect(barcodeService.detectBarcodeType('5901234123457')).toBe('EAN');
    expect(barcodeService.detectBarcodeType('12345678')).toBe('EAN-8');
    expect(barcodeService.detectBarcodeType('invalid')).toBe('UNKNOWN');
  });

  it('should track API usage', () => {
    const usage = barcodeService.getApiUsage();
    expect(usage.callsToday).toBe(0);
    expect(usage.limit).toBe(90);
    expect(usage.remaining).toBe(90);
  });

  it('should reset API counter', () => {
    barcodeService.resetApiCounter();
    const usage = barcodeService.getApiUsage();
    expect(usage.callsToday).toBe(0);
  });
});
