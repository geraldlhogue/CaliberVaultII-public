import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmmunitionService } from '../AmmunitionService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('AmmunitionService', () => {
  let service: AmmunitionService;
  const mockInventoryId = 'inv-456';
  const mockAmmoData = {
    name: 'Test Ammo',
    manufacturer_id: 'mfg-456',
    model: '9mm FMJ',
    quantity: 100,
    caliber_id: 'cal-456',
    cartridge_id: 'cart-456',
    bullet_type_id: 'bt-456',
    bullet_weight: 115,
    muzzle_velocity: 1200,
    rounds_per_box: 50,
  };

  beforeEach(() => {
    service = new AmmunitionService();
    vi.clearAllMocks();
  });

  describe('createAmmunition', () => {
    it('should create ammunition with correct field mapping', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId, ...mockAmmoData },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createAmmunition(mockAmmoData);

      expect(supabase.from).toHaveBeenCalledWith('inventory');
      expect(supabase.from).toHaveBeenCalledWith('ammunition_details');
    });

    it('should use bullet_weight not grain_weight', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createAmmunition(mockAmmoData);

      const detailCall = mockInsert.mock.calls.find(
        call => call[0]?.bullet_weight !== undefined
      );
      
      expect(detailCall).toBeDefined();
      expect(detailCall[0].bullet_weight).toBe(115);
      expect(detailCall[0].grain_weight).toBeUndefined();
    });

    it('should include cartridge_id in detail data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createAmmunition(mockAmmoData);

      const detailCall = mockInsert.mock.calls.find(
        call => call[0]?.cartridge_id !== undefined
      );
      
      expect(detailCall).toBeDefined();
      expect(detailCall[0].cartridge_id).toBe('cart-456');
    });

    it('should put manufacturer_id in base data not detail data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockInventoryId },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await service.createAmmunition(mockAmmoData);

      const baseCall = mockInsert.mock.calls.find(
        call => call[0]?.manufacturer_id !== undefined
      );
      
      expect(baseCall).toBeDefined();
      expect(baseCall[0].manufacturer_id).toBe('mfg-456');
    });
  });
});
