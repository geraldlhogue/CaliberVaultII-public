import { describe, it, expect } from 'vitest';
import { parseCSV, validateCSVHeaders, convertToCSV } from '../csvParser';

describe('CSV Parser Tests', () => {
  describe('CSV Parsing', () => {
    it('parses simple CSV', () => {
      const csv = 'name,category\nTest Item,firearms\nTest Ammo,ammunition';
      const result = parseCSV(csv);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Item');
      expect(result[0].category).toBe('firearms');
    });

    it('handles quoted fields', () => {
      const csv = 'name,description\n"Item, with comma","Description with ""quotes"""';
      const result = parseCSV(csv);
      
      expect(result[0].name).toBe('Item, with comma');
      expect(result[0].description).toBe('Description with "quotes"');
    });

    it('handles empty fields', () => {
      const csv = 'name,category,notes\nTest,,Some notes';
      const result = parseCSV(csv);
      
      expect(result[0].category).toBe('');
      expect(result[0].notes).toBe('Some notes');
    });

    it('handles line breaks in quoted fields', () => {
      const csv = 'name,description\n"Test","Line 1\nLine 2"';
      const result = parseCSV(csv);
      
      expect(result[0].description).toContain('\n');
    });
  });

  describe('CSV Header Validation', () => {
    it('validates required headers', () => {
      const headers = ['name', 'category', 'manufacturer'];
      const required = ['name', 'category'];
      
      expect(validateCSVHeaders(headers, required)).toBe(true);
    });

    it('rejects missing headers', () => {
      const headers = ['name'];
      const required = ['name', 'category'];
      
      expect(validateCSVHeaders(headers, required)).toBe(false);
    });
  });

  describe('CSV Generation', () => {
    it('converts objects to CSV', () => {
      const data = [
        { name: 'Item 1', category: 'firearms' },
        { name: 'Item 2', category: 'ammunition' }
      ];
      
      const csv = convertToCSV(data);
      expect(csv).toContain('name,category');
      expect(csv).toContain('Item 1,firearms');
    });

    it('escapes special characters', () => {
      const data = [{ name: 'Item, with comma', notes: 'Has "quotes"' }];
      const csv = convertToCSV(data);
      
      expect(csv).toContain('"Item, with comma"');
      expect(csv).toContain('"Has ""quotes"""');
    });
  });
});
