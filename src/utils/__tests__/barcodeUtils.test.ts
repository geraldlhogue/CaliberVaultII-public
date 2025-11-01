import { describe, it, expect } from 'vitest';
import { 
  validateUPC, 
  validateEAN, 
  calculateCheckDigit,
  formatBarcode 
} from '../barcodeUtils';

describe('Barcode Utilities Tests', () => {
  describe('UPC Validation', () => {
    it('validates correct UPC-A', () => {
      expect(validateUPC('012345678905')).toBe(true);
    });

    it('rejects invalid UPC length', () => {
      expect(validateUPC('12345')).toBe(false);
    });

    it('rejects non-numeric UPC', () => {
      expect(validateUPC('abcdefghijkl')).toBe(false);
    });

    it('validates UPC check digit', () => {
      expect(validateUPC('012345678905')).toBe(true);
      expect(validateUPC('012345678904')).toBe(false);
    });
  });

  describe('EAN Validation', () => {
    it('validates correct EAN-13', () => {
      expect(validateEAN('5901234123457')).toBe(true);
    });

    it('rejects invalid EAN length', () => {
      expect(validateEAN('123456')).toBe(false);
    });
  });

  describe('Check Digit Calculation', () => {
    it('calculates UPC check digit', () => {
      expect(calculateCheckDigit('01234567890')).toBe('5');
    });

    it('calculates EAN check digit', () => {
      expect(calculateCheckDigit('590123412345')).toBe('7');
    });
  });

  describe('Barcode Formatting', () => {
    it('formats UPC with spaces', () => {
      expect(formatBarcode('012345678905', 'UPC')).toBe('0 12345 67890 5');
    });

    it('formats EAN with dashes', () => {
      expect(formatBarcode('5901234123457', 'EAN')).toBe('590-1234-12345-7');
    });
  });
});
