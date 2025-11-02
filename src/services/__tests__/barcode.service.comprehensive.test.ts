import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarcodeService } from '../barcode/BarcodeService';

// Mock barcodeCache
vi.mock('@/lib/barcodeCache', () => ({
  barcodeCache: {
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
    getStats: vi.fn(() => Promise.resolve({ totalEntries: 0, totalSize: 0 }))
  }
}));

// Mock Supabase
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

describe('BarcodeService - Comprehensive Tests', () => {
  let service: BarcodeService;

  beforeEach(() => {
    service = BarcodeService.getInstance();
    vi.clearAllMocks();
  });

  describe('Barcode Validation', () => {
    it('validates UPC-A format (12 digits)', () => {
      expect(service.isValidUPC('012345678905')).toBe(true);
      expect(service.isValidUPC('123456789012')).toBe(true);
    });

    it('validates UPC-E format (13 digits)', () => {
      expect(service.isValidUPC('0123456789012')).toBe(true);
    });

    it('rejects invalid UPC formats', () => {
      expect(service.isValidUPC('12345')).toBe(false);
      expect(service.isValidUPC('abcdefghijkl')).toBe(false);
      expect(service.isValidUPC('')).toBe(false);
    });

    it('validates EAN-13 format', () => {
      expect(service.isValidEAN('5901234123457')).toBe(true);
      expect(service.isValidEAN('1234567890123')).toBe(true);
    });

    it('rejects invalid EAN formats', () => {
      expect(service.isValidEAN('123456')).toBe(false);
      expect(service.isValidEAN('12345678901234')).toBe(false);
      expect(service.isValidEAN('')).toBe(false);
    });

    it('detects barcode types correctly', () => {
      expect(service.detectBarcodeType('012345678905')).toBe('UPC');
      expect(service.detectBarcodeType('5901234123457')).toBe('EAN');
      expect(service.detectBarcodeType('12345678')).toBe('EAN-8');
      expect(service.detectBarcodeType('12345678901234')).toBe('ITF-14');
      expect(service.detectBarcodeType('CODE128')).toBe('UNKNOWN');
      expect(service.detectBarcodeType('')).toBe('UNKNOWN');
    });
  });

  describe('Offline Mode', () => {
    it('handles offline barcode lookup gracefully', async () => {
      const result = await service.lookup('012345678905');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('source');
    });

    it('returns cache miss when barcode not cached', async () => {
      const result = await service.lookup('999999999999');
      expect(result.success).toBe(false);
    });
  });

  describe('API Usage Tracking', () => {
    it('tracks API call count', () => {
      const usage = service.getApiUsage();
      expect(usage).toHaveProperty('callsToday');
      expect(usage).toHaveProperty('limit');
      expect(usage).toHaveProperty('remaining');
      expect(usage).toHaveProperty('percentUsed');
    });

    it('resets API counter', () => {
      service.resetApiCounter();
      const usage = service.getApiUsage();
      expect(usage.callsToday).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('gets cache statistics', async () => {
      const stats = await service.getCacheStats();
      expect(stats).toBeDefined();
    });

    it('clears cache', async () => {
      await expect(service.clearCache()).resolves.not.toThrow();
    });
  });
});
