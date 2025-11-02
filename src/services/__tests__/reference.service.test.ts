import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferenceDataService } from '../reference/ReferenceDataService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ 
        data: [{ id: '1', name: 'Test' }], 
        error: null 
      }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('ReferenceDataService', () => {
  let service: ReferenceDataService;

  beforeEach(() => {
    service = new ReferenceDataService();
    vi.clearAllMocks();
  });

  describe('getManufacturers', () => {
    it('fetches manufacturers', async () => {
      const result = await service.getManufacturers();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCalibers', () => {
    it('fetches calibers', async () => {
      const result = await service.getCalibers();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('addManufacturer', () => {
    it('adds new manufacturer', async () => {
      await expect(
        service.addManufacturer({ name: 'Test Mfg' })
      ).resolves.not.toThrow();
    });
  });
});
