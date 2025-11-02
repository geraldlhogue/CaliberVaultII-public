import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'cat123', name: 'firearms' }, error: null }))
        })),
        ilike: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'mfg123', name: 'Test Mfg' }, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'inv123' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('InventoryService - Enhanced Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveItem', () => {
    it('saves firearm item successfully', async () => {
      const item = {
        category: 'firearms',
        name: 'Test Rifle',
        manufacturer: 'Test Mfg',
        model: 'TR-15',
        quantity: 1,
        serialNumber: '123456',
        caliber: '5.56mm'
      };

      const result = await inventoryService.saveItem(item, 'user123');
      expect(result).toBeDefined();
      expect(result.id).toBe('inv123');
    });

    it('saves ammunition item successfully', async () => {
      const item = {
        category: 'ammunition',
        name: 'Test Ammo',
        manufacturer: 'Ammo Co',
        caliber: '9mm',
        quantity: 1000,
        roundCount: 1000
      };

      const result = await inventoryService.saveItem(item, 'user123');
      expect(result).toBeDefined();
    });

    it('throws error for invalid category', async () => {
      const item = {
        category: 'invalid_category',
        name: 'Test Item'
      };

      // Mock category lookup to return null
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      } as any);

      await expect(inventoryService.saveItem(item, 'user123')).rejects.toThrow();
    });
  });

  describe('getItems', () => {
    it('retrieves all items for user', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', category: 'firearms' },
        { id: '2', name: 'Item 2', category: 'ammunition' }
      ];

      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockItems, error: null }))
          }))
        }))
      } as any);

      const result = await inventoryService.getItems('user123');
      expect(result).toEqual(mockItems);
    });

    it('returns empty array when no items found', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      const result = await inventoryService.getItems('user123');
      expect(result).toEqual([]);
    });
  });

  describe('updateItem', () => {
    it('updates item successfully', async () => {
      const item = {
        category: 'firearms',
        name: 'Updated Rifle',
        manufacturer: 'Test Mfg',
        model: 'TR-16',
        quantity: 1
      };

      await expect(inventoryService.updateItem('inv123', item, 'user123')).resolves.not.toThrow();
    });
  });

  describe('valuation methods', () => {
    it('saves valuation successfully', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'val123', estimated_value: 1500 }, 
              error: null 
            }))
          }))
        }))
      } as any);

      const result = await inventoryService.saveValuation('inv123', 'user123', 1500, 'high', 'Test notes');
      expect(result).toBeDefined();
      expect(result.estimated_value).toBe(1500);
    });

    it('gets valuation history', async () => {
      const mockHistory = [
        { id: 'val1', estimated_value: 1500, created_at: '2024-01-01' },
        { id: 'val2', estimated_value: 1600, created_at: '2024-02-01' }
      ];

      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockHistory, error: null }))
          }))
        }))
      } as any);

      const result = await inventoryService.getValuationHistory('inv123');
      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(2);
    });
  });
});
