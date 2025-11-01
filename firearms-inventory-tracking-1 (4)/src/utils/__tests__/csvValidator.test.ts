import { describe, it, expect } from 'vitest';
import { 
  validateCSVRow, 
  validateCategory, 
  validateNumericField,
  validateDateField 
} from '../csvValidator';

describe('CSV Validator Tests', () => {
  describe('Row Validation', () => {
    it('validates complete row', () => {
      const row = {
        name: 'Test Item',
        category: 'firearms',
        quantity: '1',
        purchase_price: '100.00'
      };
      
      const result = validateCSVRow(row);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const row = {
        category: 'firearms'
      };
      
      const result = validateCSVRow(row);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('validates field types', () => {
      const row = {
        name: 'Test',
        category: 'firearms',
        quantity: 'not a number'
      };
      
      const result = validateCSVRow(row);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('quantity'))).toBe(true);
    });
  });

  describe('Category Validation', () => {
    it('accepts valid categories', () => {
      expect(validateCategory('firearms')).toBe(true);
      expect(validateCategory('ammunition')).toBe(true);
      expect(validateCategory('optics')).toBe(true);
    });

    it('rejects invalid categories', () => {
      expect(validateCategory('invalid')).toBe(false);
      expect(validateCategory('')).toBe(false);
    });
  });

  describe('Numeric Field Validation', () => {
    it('validates numeric values', () => {
      expect(validateNumericField('100')).toBe(true);
      expect(validateNumericField('100.50')).toBe(true);
    });

    it('rejects non-numeric values', () => {
      expect(validateNumericField('abc')).toBe(false);
      expect(validateNumericField('$100')).toBe(false);
    });
  });

  describe('Date Field Validation', () => {
    it('validates ISO date format', () => {
      expect(validateDateField('2024-01-01')).toBe(true);
    });

    it('rejects invalid dates', () => {
      expect(validateDateField('invalid')).toBe(false);
      expect(validateDateField('13/32/2024')).toBe(false);
    });
  });
});
