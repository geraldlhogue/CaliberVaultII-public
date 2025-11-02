import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarcodeService } from '../barcode/BarcodeService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('BarcodeService', () => {
  let barcodeService: BarcodeService;

  beforeEach(() => {
    barcodeService = new BarcodeService();
    vi.clearAllMocks();
  });

  it('should validate UPC format', () => {
    expect(barcodeService.isValidUPC('012345678905')).toBe(true);
    expect(barcodeService.isValidUPC('invalid')).toBe(false);
  });

  it('should validate EAN format', () => {
    expect(barcodeService.isValidEAN('5901234123457')).toBe(true);
    expect(barcodeService.isValidEAN('123')).toBe(false);
  });

  it('should detect barcode type', () => {
    expect(barcodeService.detectBarcodeType('012345678905')).toBe('UPC');
    expect(barcodeService.detectBarcodeType('5901234123457')).toBe('EAN');
  });
});
