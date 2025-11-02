import { describe, it, expect } from 'vitest';
import { validateCSVRow, validateCSVHeaders, getValidationErrors } from '../csvValidator';

describe('csvValidator', () => {
  describe('validateCSVRow', () => {
    it('validates row with all required fields', () => {
      const row = { name: 'Test', quantity: '5', category: 'firearms' };
      const result = validateCSVRow(row, ['name', 'quantity', 'category']);
      expect(result.valid).toBe(true);
    });

    it('rejects row with missing required fields', () => {
      const row = { name: 'Test' };
      const result = validateCSVRow(row, ['name', 'quantity']);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: quantity');
    });

    it('validates numeric fields', () => {
      const row = { name: 'Test', quantity: 'abc' };
      const result = validateCSVRow(row, ['name', 'quantity'], { quantity: 'number' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCSVHeaders', () => {
    it('validates correct headers', () => {
      const headers = ['name', 'quantity', 'category'];
      const result = validateCSVHeaders(headers, ['name', 'quantity']);
      expect(result.valid).toBe(true);
    });

    it('rejects missing required headers', () => {
      const headers = ['name'];
      const result = validateCSVHeaders(headers, ['name', 'quantity']);
      expect(result.valid).toBe(false);
    });
  });
});
