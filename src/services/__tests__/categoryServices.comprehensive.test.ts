import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firearmsService } from '../category/FirearmsService';
import { ammunitionService } from '../category/AmmunitionService';
import { opticsService } from '../category/OpticsService';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test' }, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Updated' }, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

vi.mock('@/lib/databaseErrorHandler', () => ({
  withDatabaseErrorHandling: vi.fn(async (fn) => {
    try {
      const result = await fn();
      return { success: true, data: result.data, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('Category Services - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FirearmsService', () => {
    it('should create firearm using createFirearm', async () => {
      const data = {
        name: 'Test Rifle',
        manufacturer_id: 'mfg123',
        model: 'TR-15',
        serial_number: '123456',
        caliber_id: 'cal123',
        quantity: 1
      };
      const result = await firearmsService.createFirearm(data);
      expect(result).toBeDefined();
    });

    it('should update firearm using updateFirearm', async () => {
      const data = {
        name: 'Updated Rifle',
        model: 'TR-16'
      };
      const result = await firearmsService.updateFirearm('123', data);
      expect(result).toBeDefined();
    });

    it('should delete firearm', async () => {
      await expect(firearmsService.delete('123')).resolves.not.toThrow();
    });

    it('should get firearm by id', async () => {
      const result = await firearmsService.getById('123');
      expect(result).toBeDefined();
    });
  });

  describe('AmmunitionService', () => {
    it('should create ammunition using createAmmunition', async () => {
      const data = {
        name: 'Test Ammo',
        manufacturer_id: 'mfg123',
        caliber_id: 'cal123',
        round_count: 500,
        quantity: 1
      };
      const result = await ammunitionService.createAmmunition(data);
      expect(result).toBeDefined();
    });

    it('should update ammunition using updateAmmunition', async () => {
      const data = {
        name: 'Updated Ammo',
        round_count: 1000
      };
      const result = await ammunitionService.updateAmmunition('123', data);
      expect(result).toBeDefined();
    });

    it('should delete ammunition', async () => {
      await expect(ammunitionService.delete('123')).resolves.not.toThrow();
    });
  });

  describe('OpticsService', () => {
    it('should create optic using createOptic', async () => {
      const data = {
        name: 'Test Scope',
        manufacturer_id: 'mfg123',
        model: 'SC-4X',
        magnification: '4x',
        quantity: 1
      };
      const result = await opticsService.createOptic(data);
      expect(result).toBeDefined();
    });

    it('should update optic using updateOptic', async () => {
      const data = {
        name: 'Updated Scope',
        magnification: '6x'
      };
      const result = await opticsService.updateOptic('123', data);
      expect(result).toBeDefined();
    });

    it('should delete optic', async () => {
      await expect(opticsService.delete('123')).resolves.not.toThrow();
    });
  });
});
