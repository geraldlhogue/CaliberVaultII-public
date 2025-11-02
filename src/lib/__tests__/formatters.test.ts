import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles negative values', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      const date = '2024-01-15T12:00:00Z';
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
    });

    it('handles invalid date', () => {
      expect(formatDate('invalid')).toBe('Invalid Date');
    });
  });

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('handles decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
    });
  });
});
