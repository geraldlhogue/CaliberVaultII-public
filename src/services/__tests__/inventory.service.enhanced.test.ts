import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '../inventory.service';

// Mock data
const mockInventoryItems = [
  { id: '1', name: 'Item 1', category: 'firearms', user_id: 'user123' },
  { id: '2', name: 'Item 2', category: 'ammunition', user_id: 'user123' }
];

const mockValuationHistory = [
  { id: 'val1', estimated_value: 1500, created_at: '2024-01-01' },
  { id: 'val2', estimated_value: 1600, created_at: '2024-02-01' }
];

// Mock Supabase with complete chain
vi.mock('@/lib/supabase', () => {
  let currentTable = '';
  
  const supabase = {
    from: vi.fn((table: string) => {
      currentTable = table;
      const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        ilike: vi.fn(() => chain),
        order: vi.fn(() => chain),
        insert: vi.fn(() => {
          // For insert operations, return a chain that resolves with the inserted data
          return {
            select: vi.fn(() => ({
              single: vi.fn(() => {
                if (currentTable === 'inventory_base') {
                  return Promise.resolve({ 
                    data: { id: 'inv123', name: 'Test Item', category: 'firearms' }, 
                    error: null 
                  });
                }
                return Promise.resolve({ data: { id: 'inv123' }, error: null });
              })
            }))
          };
        }),
        update: vi.fn(() => chain),
        single: vi.fn(() => {
          if (currentTable === 'inventory_base') {
            return Promise.resolve({ 
              data: { id: 'inv123', name: 'Test Item', category: 'firearms' }, 
              error: null 
            });
          }
          if (currentTable === 'valuation_history') {
            return Promise.resolve({ 
              data: { id: 'val123', estimated_value: 1500 }, 
              error: null 
            });
          }
          return Promise.resolve({ data: { id: 'inv123' }, error: null });
        }),
        then: (resolve: any) => {
          if (currentTable === 'inventory_base') {
            return Promise.resolve({ data: mockInventoryItems, error: null }).then(resolve);
          }
          if (currentTable === 'valuation_history') {
            return Promise.resolve({ data: mockValuationHistory, error: null }).then(resolve);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve);
        }
      };
      return chain;
    })
  };
  
  return { supabase };
});


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
      expect(result.id).toBe('inv123');
    });

    it('throws error for invalid category', async () => {
      const item = {
        category: 'invalid_category',
        name: 'Test Item'
      };

      await expect(inventoryService.saveItem(item, 'user123')).rejects.toThrow();
    });
  });

  describe('getItems', () => {
    it('retrieves all items for user', async () => {
      const result = await inventoryService.getItems('user123');
      expect(result).toEqual(mockInventoryItems);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no items found', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve)
            })
          })
        })
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
      const result = await inventoryService.saveValuation('inv123', 'user123', 1500, 'high', 'Test notes');
      expect(result).toBeDefined();
      expect(result.estimated_value).toBe(1500);
    });

    it('gets valuation history', async () => {
      const result = await inventoryService.getValuationHistory('inv123');
      expect(result).toEqual(mockValuationHistory);
      expect(result).toHaveLength(2);
    });
  });
});
