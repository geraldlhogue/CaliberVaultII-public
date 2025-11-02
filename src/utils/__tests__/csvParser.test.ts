import { describe, it, expect } from 'vitest';
import { parseCSV, generateCSVTemplate } from '../csvParser';

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('parses valid CSV data', () => {
      const csv = 'name,quantity\nTest Item,5\nAnother Item,10';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', 'Test Item');
      expect(result[0]).toHaveProperty('quantity', '5');
    });

    it('handles empty CSV', () => {
      const result = parseCSV('');
      expect(result).toHaveLength(0);
    });

    it('handles CSV with headers only', () => {
      const result = parseCSV('name,quantity');
      expect(result).toHaveLength(0);
    });

    it('handles quoted values', () => {
      const csv = 'name,description\n"Test, Item","Has, commas"';
      const result = parseCSV(csv);
      expect(result[0].name).toBe('Test, Item');
    });
  });

  describe('generateCSVTemplate', () => {
    it('generates template with headers', () => {
      const template = generateCSVTemplate(['name', 'quantity', 'price']);
      expect(template).toContain('name');
      expect(template).toContain('quantity');
      expect(template).toContain('price');
    });
  });
});
