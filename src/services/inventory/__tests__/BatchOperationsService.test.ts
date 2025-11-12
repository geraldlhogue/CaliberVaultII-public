import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all category services with proper exports - MUST be before imports
vi.mock('../../category', () => {
  const createMockService = () => ({
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn()
  });

  return {
    firearmsService: createMockService(),
    ammunitionService: createMockService(),
    opticsService: createMockService(),
    magazinesService: createMockService(),
    accessoriesService: createMockService(),
    suppressorsService: createMockService(),
    reloadingService: createMockService(),
    casesService: createMockService(),
    primersService: createMockService(),
    powderService: createMockService()
  };
});

import { batchOperationsService } from '../BatchOperationsService';




describe('BatchOperationsService', () => {
  const userId = 'test-user-123';

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('bulkCreate', () => {
    it('should create multiple items successfully', async () => {
      const { firearmsService } = await import('../../category');
      const items = [
        { name: 'Item 1' },
        { name: 'Item 2' }
      ];

      vi.mocked(firearmsService.create)
        .mockResolvedValueOnce({ id: '1', ...items[0] })
        .mockResolvedValueOnce({ id: '2', ...items[1] });

      const result = await batchOperationsService.bulkCreate('firearms', items, userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.items).toHaveLength(2);
    });

    it('should handle partial failures', async () => {
      const { firearmsService } = await import('../../category');
      const items = [
        { name: 'Item 1' },
        { name: 'Item 2' }
      ];

      vi.mocked(firearmsService.create)
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
      const { firearmsService } = await import('../../category');
      vi.mocked(firearmsService.delete).mockResolvedValue(undefined);

      const result = await batchOperationsService.bulkDelete('firearms', ['1', '2'], userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(firearmsService.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkDuplicate', () => {
    it('should duplicate items', async () => {
      const { firearmsService } = await import('../../category');
      const original = { id: '1', name: 'Original', created_at: '2024-01-01', updated_at: '2024-01-01' };
      
      vi.mocked(firearmsService.getById).mockResolvedValue(original);
      vi.mocked(firearmsService.create).mockResolvedValue({ 
        id: '2', 
        name: 'Original (Copy)' 
      });

      const result = await batchOperationsService.bulkDuplicate('firearms', ['1'], userId);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(firearmsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Original (Copy)' }),
        userId
      );
    });
  });
});
