import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryAPIService } from '../InventoryAPIService';
import * as categoryServices from '../../category';

vi.mock('../../category', () => ({
  firearmsService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('InventoryAPIService', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return success response with items', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ];

      vi.mocked(categoryServices.firearmsService.list).mockResolvedValue(mockItems);

      const response = await inventoryAPIService.list('firearms', userId);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockItems);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(categoryServices.firearmsService.list).mockRejectedValue(
        new Error('Database error')
      );

      const response = await inventoryAPIService.list('firearms', userId);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Database error');
    });
  });

  describe('create', () => {
    it('should create item and return success', async () => {
      const itemData = { name: 'New Item' };
      const createdItem = { id: '1', ...itemData };

      vi.mocked(categoryServices.firearmsService.create).mockResolvedValue(createdItem);

      const response = await inventoryAPIService.create('firearms', itemData, userId);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(createdItem);
      expect(response.message).toBe('Item created successfully');
    });
  });

  describe('delete', () => {
    it('should delete item and return success', async () => {
      vi.mocked(categoryServices.firearmsService.delete).mockResolvedValue(undefined);

      const response = await inventoryAPIService.delete('firearms', '1', userId);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Item deleted successfully');
    });
  });
});
