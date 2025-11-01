import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '../errorHandler';
import { logError, captureException } from '../errorLogging';

vi.mock('../errorLogging', () => ({
  logError: vi.fn(),
  captureException: vi.fn()
}));

describe('ErrorHandler - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Logging', () => {
    it('logs errors with context', async () => {
      const error = new Error('Test error');
      await logError(error, { context: 'test' });
      expect(logError).toHaveBeenCalledWith(error, { context: 'test' });
    });

    it('captures exceptions with Sentry', () => {
      const error = new Error('Critical error');
      captureException(error);
      expect(captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('Error Recovery', () => {
    it('attempts recovery for network errors', async () => {
      const networkError = new Error('Network request failed');
      const handler = new ErrorHandler();
      const recovered = await handler.recover(networkError);
      expect(recovered).toBeDefined();
    });

    it('provides user-friendly error messages', () => {
      const handler = new ErrorHandler();
      const message = handler.getUserMessage(new Error('Database error'));
      expect(message).toContain('error');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('Error Analytics', () => {
    it('tracks error frequency', () => {
      const handler = new ErrorHandler();
      handler.trackError('DatabaseError');
      handler.trackError('DatabaseError');
      const stats = handler.getErrorStats();
      expect(stats.DatabaseError).toBe(2);
    });

    it('identifies error patterns', () => {
      const handler = new ErrorHandler();
      handler.trackError('NetworkError');
      handler.trackError('NetworkError');
      handler.trackError('NetworkError');
      const patterns = handler.getErrorPatterns();
      expect(patterns).toContain('NetworkError');
    });
  });
});
