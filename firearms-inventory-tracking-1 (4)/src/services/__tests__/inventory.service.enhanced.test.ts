import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../inventory.service';
import { supabase } from '../../lib/supabase';
import { mockFirearm, mockAmmunition } from '../../test/fixtures/inventory.fixtures';

vi.mock('../../lib/supabase');

describe('InventoryService - Enhanced Tests', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    vi.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('creates new inventory item', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: mockFirearm, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFirearm, error: null })
      } as any);

      const result = await service.create(mockFirearm);
      expect(result).toEqual(mockFirearm);
      expect(mockInsert).toHaveBeenCalledWith(mockFirearm);
    });

    it('retrieves inventory item by id', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockFirearm, error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      } as any);

      const result = await service.getById('firearm-1');
      expect(result).toEqual(mockFirearm);
    });

    it('updates inventory item', async () => {
      const updates = { name: 'Updated Name' };
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: { ...mockFirearm, ...updates }, error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq
      } as any);

      const result = await service.update('firearm-1', updates);
      expect(result.name).toBe('Updated Name');
    });

    it('deletes inventory item', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq
      } as any);

      await expect(service.delete('firearm-1')).resolves.not.toThrow();
    });
  });

  describe('Querying', () => {
    it('filters by category', async () => {
      const mockData = [mockFirearm];
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await service.getByCategory('firearms');
      expect(result).toEqual(mockData);
    });
  });
});
