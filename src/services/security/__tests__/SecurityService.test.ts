import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityService } from '../SecurityService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(() => {
    service = new SecurityService();
    vi.clearAllMocks();
  });

  describe('logSecurityEvent', () => {
    it('logs security event successfully', async () => {
      await expect(
        service.logSecurityEvent('user123', 'login', { ip: '127.0.0.1' })
      ).resolves.not.toThrow();
    });
  });

  describe('checkPermission', () => {
    it('checks user permission', async () => {
      const hasPermission = await service.checkPermission('user123', 'read');
      expect(typeof hasPermission).toBe('boolean');
    });
  });
});
