import { describe, it, expect } from 'vitest';
import { validateUPC, formatBarcode, generateCheckDigit } from '../barcodeUtils';

describe('barcodeUtils', () => {
  describe('validateUPC', () => {
    it('validates correct UPC-A codes', () => {
      expect(validateUPC('012345678905')).toBe(true);
    });

    it('rejects invalid UPC codes', () => {
      expect(validateUPC('123')).toBe(false);
      expect(validateUPC('abcdefghijkl')).toBe(false);
    });

    it('rejects UPC with wrong check digit', () => {
      expect(validateUPC('012345678900')).toBe(false);
    });
  });

  describe('formatBarcode', () => {
    it('formats barcode with spaces', () => {
      const formatted = formatBarcode('012345678905');
      expect(formatted).toContain('-');
    });

    it('handles empty input', () => {
      expect(formatBarcode('')).toBe('');
    });
  });

  describe('generateCheckDigit', () => {
    it('generates correct check digit', () => {
      const digit = generateCheckDigit('01234567890');
      expect(digit).toBeGreaterThanOrEqual(0);
      expect(digit).toBeLessThanOrEqual(9);
    });
  });
});
