import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarcodeService } from '../barcode/BarcodeService';

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
