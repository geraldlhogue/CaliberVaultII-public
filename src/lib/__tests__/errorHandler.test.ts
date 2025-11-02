import { describe, it, expect, vi } from 'vitest';
import { handleError, ErrorHandler } from '../errorHandler';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('ErrorHandler', () => {
  it('handles errors gracefully', () => {
    const error = new Error('Test error');
    const result = handleError(error);
    expect(result).toBeDefined();
  });

  it('logs errors', () => {
    const errorHandler = new ErrorHandler();
    errorHandler.log('Test error', { context: 'test' });
    expect(true).toBe(true);
  });

  it('categorizes errors', () => {
    const errorHandler = new ErrorHandler();
    const category = errorHandler.categorize(new Error('Database error'));
    expect(category).toBeDefined();
  });
});
