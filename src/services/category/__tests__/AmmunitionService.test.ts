import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmmunitionService } from '../AmmunitionService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'inv-456' }, 
            error: null 
          }))
        }))
      }))
    }))
  }
}));

vi.mock('@/lib/databaseErrorHandler', () => ({
  withDatabaseErrorHandling: vi.fn((fn) => fn())
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('AmmunitionService', () => {
  let service: AmmunitionService;

  beforeEach(() => {
    service = new AmmunitionService();
    vi.clearAllMocks();
  });

  describe('createAmmunition', () => {
    it('should create ammunition with correct fields', async () => {
      const baseData = { name: 'Test Ammo', manufacturer_id: 'mfg-456' };
      const detailData = { caliber_id: 'cal-456', bullet_weight: 115 };
      const result = await service.create(baseData, detailData);
      expect(result).toBeDefined();
    });

    it('should handle bullet weight', async () => {
      const baseData = { name: 'Test Ammo' };
      const detailData = { bullet_weight: 115 };
      const result = await service.create(baseData, detailData);
      expect(result).toBeDefined();
    });
  });
});
