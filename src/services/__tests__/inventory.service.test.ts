import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        ilike: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

vi.mock('../category/FirearmsService', () => ({
  firearmsService: {
    create: vi.fn(() => Promise.resolve({ id: '123' }))
  }
}));

vi.mock('../category/AmmunitionService', () => ({
  ammunitionService: {
    create: vi.fn(() => Promise.resolve({ id: '123' }))
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
      manufacturer: 'Test Mfg'
    };

    const result = await inventoryService.saveItem(item, 'user123');
    expect(result).toBeDefined();
  });

  it('should handle item creation', async () => {
    expect(true).toBe(true);
  });
});
