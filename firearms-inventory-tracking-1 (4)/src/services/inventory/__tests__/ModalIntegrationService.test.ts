import { describe, it, expect, vi, beforeEach } from 'vitest';
import { modalIntegrationService } from '../ModalIntegrationService';
import * as categoryServices from '../../category';

vi.mock('../../category', () => ({
  firearmsService: {
    create: vi.fn(),
    update: vi.fn()
  },
  ammunitionService: {
    create: vi.fn(),
    update: vi.fn()
  },
  opticsService: {
    create: vi.fn(),
    update: vi.fn()
  }
}));

describe('ModalIntegrationService', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveItem', () => {
    it('should route firearms to firearmsService', async () => {
      const formData = {
        category: 'firearms',
        name: 'Test Rifle',
        manufacturer: 'Colt',
        model: 'AR-15'
      };

      vi.mocked(categoryServices.firearmsService.create).mockResolvedValue({ id: '1', ...formData });

      await modalIntegrationService.saveItem(formData, userId);

      expect(categoryServices.firearmsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Rifle' }),
        userId
      );
    });

    it('should route ammunition to ammunitionService', async () => {
      const formData = {
        category: 'ammunition',
        name: 'Test Ammo',
        caliber: '9mm'
      };

      vi.mocked(categoryServices.ammunitionService.create).mockResolvedValue({ id: '1', ...formData });

      await modalIntegrationService.saveItem(formData, userId);

      expect(categoryServices.ammunitionService.create).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update firearms correctly', async () => {
      const formData = {
        category: 'firearms',
        name: 'Updated Rifle'
      };

      vi.mocked(categoryServices.firearmsService.update).mockResolvedValue({ id: '1', ...formData });

      await modalIntegrationService.updateItem('1', formData, userId);

      expect(categoryServices.firearmsService.update).toHaveBeenCalledWith(
        '1',
        expect.any(Object),
        userId
      );
    });
  });
});
