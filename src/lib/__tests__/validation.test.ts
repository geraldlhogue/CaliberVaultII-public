import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateURL, validateRequired } from '../validation/schemas';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('validates US phone number', () => {
      expect(validatePhone('555-123-4567')).toBe(true);
      expect(validatePhone('(555) 123-4567')).toBe(true);
    });

    it('rejects invalid phone', () => {
      expect(validatePhone('123')).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('validates correct URL', () => {
      expect(validateURL('https://example.com')).toBe(true);
    });

    it('rejects invalid URL', () => {
      expect(validateURL('not a url')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('validates non-empty value', () => {
      expect(validateRequired('test')).toBe(true);
    });

    it('rejects empty value', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
    });
  });
});
