import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirearmsService } from '../FirearmsService';
import { OpticsService } from '../OpticsService';
import { SuppressorsService } from '../SuppressorsService';
import { MagazinesService } from '../MagazinesService';
import { AccessoriesService } from '../AccessoriesService';
import { AmmunitionService } from '../AmmunitionService';
import { CasesService } from '../CasesService';
import { PowderService } from '../PowderService';
import { PrimersService } from '../PrimersService';
import { ReloadingService } from '../ReloadingService';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('All Category Services', () => {
  const userId = 'test-user-123';
  const services = [
    { name: 'Firearms', service: new FirearmsService(), category: 'firearms' },
    { name: 'Optics', service: new OpticsService(), category: 'optics' },
    { name: 'Suppressors', service: new SuppressorsService(), category: 'suppressors' },
    { name: 'Magazines', service: new MagazinesService(), category: 'magazines' },
    { name: 'Accessories', service: new AccessoriesService(), category: 'accessories' },
    { name: 'Ammunition', service: new AmmunitionService(), category: 'ammunition' },
    { name: 'Cases', service: new CasesService(), category: 'cases' },
    { name: 'Powder', service: new PowderService(), category: 'powder' },
    { name: 'Primers', service: new PrimersService(), category: 'primers' },
    { name: 'Reloading', service: new ReloadingService(), category: 'reloading' },
  ];

  services.forEach(({ name, service, category }) => {
    describe(`${name}Service`, () => {
      it('should create item with inventory + detail tables', async () => {
        const item = {
          name: `Test ${name}`,
          manufacturer: 'Test Mfg',
          model: 'Test Model',
          category,
        };

        await expect(service.create(item, userId)).resolves.not.toThrow();
      });

      it('should get items by user', async () => {
        const items = await service.getByUser(userId);
        expect(Array.isArray(items)).toBe(true);
      });

      it('should update item', async () => {
        const updates = { name: `Updated ${name}` };
        await expect(service.update('test-id', updates, userId)).resolves.not.toThrow();
      });

      it('should delete item', async () => {
        await expect(service.delete('test-id', userId)).resolves.not.toThrow();
      });
    });
  });
});
