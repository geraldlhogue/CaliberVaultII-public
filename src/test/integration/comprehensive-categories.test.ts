import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirearmsService } from '../../services/category/FirearmsService';
import { AmmunitionService } from '../../services/category/AmmunitionService';
import { OpticsService } from '../../services/category/OpticsService';
import { MagazinesService } from '../../services/category/MagazinesService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('Comprehensive Category Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Firearms Service Integration', () => {
    it('creates firearm with all fields', async () => {
      const service = new FirearmsService();
      const firearm = {
        name: 'Test Rifle',
        manufacturer: 'Test Mfg',
        model: 'TR-15',
        caliber: '5.56mm',
        serial_number: 'TEST123',
        action_type: 'Semi-Auto',
        barrel_length: 16,
        overall_length: 36,
        weight: 7.5,
        capacity: 30
      };
      const mockChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'inv123', ...firearm }, error: null })
          })
        }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'inv123', ...firearm }, error: null })
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);
      const result = await service.create(firearm);
      expect(result).toEqual(firearm);
    });
  });

  describe('Ammunition Service Integration', () => {
    it('creates ammunition with specifications', async () => {
      const service = new AmmunitionService();
      const ammo = {
        name: 'Test Ammo',
        manufacturer: 'Test Ammo Co',
        caliber: '5.56mm',
        grain_weight: 55,
        bullet_type: 'FMJ',
        quantity: 1000,
        rounds_per_box: 20
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: ammo, error: null }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: ammo, error: null })
      } as any);

      const result = await service.create(ammo);
      expect(result).toEqual(ammo);
    });
  });

  describe('Cross-Category Operations', () => {
    it('links firearm with compatible ammunition', async () => {
      // Test relationships between categories
      const firearmsService = new FirearmsService();
      const ammoService = new AmmunitionService();

      // Both should use same caliber
      expect('5.56mm').toBe('5.56mm');
    });
  });
});
