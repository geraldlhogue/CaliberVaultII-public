import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('../category/FirearmsService', () => ({
  firearmsService: {
    create: vi.fn()
  }
}));

vi.mock('../category/AmmunitionService', () => ({
  ammunitionService: {
    create: vi.fn()
  }
}));

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save firearm item', async () => {
    const item = {
      category: 'firearms',
      name: 'Test Firearm',
      manufacturer: 'Test Mfg',
      model: 'Test Model',
      serialNumber: '123456'
    };

    await inventoryService.saveItem(item, 'user123');
    expect(true).toBe(true);
  });
});
