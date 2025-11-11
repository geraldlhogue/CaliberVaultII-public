import { describe, it, expect, vi, beforeEach } from 'vitest';
import { batchOperationsService } from '../BatchOperationsService';
import * as categoryServices from '../../category';

vi.mock('../../category', () => ({
  firearmsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn()
  },
  ammunitionService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn()
  }
}));

describe('BatchOperationsService', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bulkCreate', () => {
    it('should create multiple items successfully', async () => {
      const items = [
        { name: 'Item 1' },
        { name: 'Item 2' }
      ];

      vi.mocked(categoryServices.firearmsService.create)
        .mockResolvedValueOnce({ id: '1', ...items[0] })
        .mockResolvedValueOnce({ id: '2', ...items[1] });

      const result = await batchOperationsService.bulkCreate('firearms', items, userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.items).toHaveLength(2);
    });

    it('should handle partial failures', async () => {
      const items = [
        { name: 'Item 1' },
        { name: 'Item 2' }
      ];

      vi.mocked(categoryServices.firearmsService.create)
        .mockResolvedValueOnce({ id: '1', ...items[0] })
        .mockRejectedValueOnce(new Error('Creation failed'));

      const result = await batchOperationsService.bulkCreate('firearms', items, userId);

      expect(result.success).toBe(false);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple items', async () => {
      vi.mocked(categoryServices.firearmsService.delete).mockResolvedValue(undefined);

      const result = await batchOperationsService.bulkDelete('firearms', ['1', '2'], userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(categoryServices.firearmsService.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkDuplicate', () => {
    it('should duplicate items', async () => {
      const original = { id: '1', name: 'Original', created_at: '2024-01-01', updated_at: '2024-01-01' };
      
      vi.mocked(categoryServices.firearmsService.getById).mockResolvedValue(original);
      vi.mocked(categoryServices.firearmsService.create).mockResolvedValue({ 
        id: '2', 
        name: 'Original (Copy)' 
      });

      const result = await batchOperationsService.bulkDuplicate('firearms', ['1'], userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(categoryServices.firearmsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Original (Copy)' }),
        userId
      );
    });
  });
});
