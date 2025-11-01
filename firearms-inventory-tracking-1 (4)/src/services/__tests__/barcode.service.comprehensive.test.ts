import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BarcodeService } from '../barcode/BarcodeService';
import { BarcodeCacheManager } from '../../lib/barcodeCache';

// Mock IndexedDB
const mockIDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

global.indexedDB = mockIDB as any;

describe('BarcodeService - Comprehensive Tests', () => {
  let service: BarcodeService;

  beforeEach(() => {
    service = new BarcodeService();
    vi.clearAllMocks();
  });

  describe('Barcode Validation', () => {
    it('validates UPC-A format (12 digits)', () => {
      expect(service.isValidUPC('012345678905')).toBe(true);
      expect(service.isValidUPC('123456789012')).toBe(true);
    });

    it('rejects invalid UPC formats', () => {
      expect(service.isValidUPC('12345')).toBe(false);
      expect(service.isValidUPC('abcdefghijkl')).toBe(false);
      expect(service.isValidUPC('')).toBe(false);
    });

    it('validates EAN-13 format', () => {
      expect(service.isValidEAN('5901234123457')).toBe(true);
    });

    it('detects barcode types correctly', () => {
      expect(service.detectBarcodeType('012345678905')).toBe('UPC');
      expect(service.detectBarcodeType('5901234123457')).toBe('EAN');
      expect(service.detectBarcodeType('CODE128')).toBe('CODE128');
    });
  });

  describe('Offline Mode', () => {
    it('handles offline barcode lookup gracefully', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      const result = await service.lookup('012345678905');
      expect(result).toBeDefined();
    });
  });
});
