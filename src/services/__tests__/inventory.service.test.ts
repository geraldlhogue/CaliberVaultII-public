import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';

// Mock categories with proper capitalization
const mockCategories = [
  { id: 'cat-1', name: 'Firearms' },
  { id: 'cat-2', name: 'Ammunition' },
  { id: 'cat-3', name: 'Optics' },
];

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn((field, value) => ({
              single: vi.fn(() => {
                const cat = mockCategories.find(c => c.name.toLowerCase() === value.toLowerCase());
                return Promise.resolve({ data: cat || null, error: null });
              })
            }))
          }))
        };
      }
      return {
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
      };
    })
  }
}));

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save firearm item', async () => {
    const item = {
      category: 'Firearms',
      name: 'Test Firearm',
      manufacturer: 'Test Mfg',
      quantity: 1
    };

    const result = await inventoryService.saveItem(item, 'user123');
    expect(result).toBeDefined();
    expect(result.id).toBe('123');
  });

  it('should handle lowercase category names', async () => {
    const item = {
      category: 'firearms',
      name: 'Test Firearm',
      manufacturer: 'Test Mfg',
      quantity: 1
    };

    const result = await inventoryService.saveItem(item, 'user123');
    expect(result).toBeDefined();
  });
});
