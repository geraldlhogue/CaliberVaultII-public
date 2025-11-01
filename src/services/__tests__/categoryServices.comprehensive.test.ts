import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { firearmsService } from '../category/FirearmsService';
import { ammunitionService } from '../category/AmmunitionService';
import { opticsService } from '../category/OpticsService';
import { magazinesService } from '../category/MagazinesService';
import { accessoriesService } from '../category/AccessoriesService';
import { suppressorsService } from '../category/SuppressorsService';
import { reloadingService } from '../category/ReloadingService';
import { casesService } from '../category/CasesService';
import { primersService } from '../category/PrimersService';
import { powderService } from '../category/PowderService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test' }, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Updated' }, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('Category Services - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FirearmsService', () => {
    it('should create firearm with required fields', async () => {
      const data = { name: 'Test Rifle', user_id: 'user123' };
      const result = await firearmsService.create(data, 'user123');
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });

    it('should update firearm', async () => {
      const result = await firearmsService.update('123', { name: 'Updated' }, 'user123');
      expect(result.name).toBe('Updated');
    });

    it('should delete firearm', async () => {
      await expect(firearmsService.delete('123', 'user123')).resolves.not.toThrow();
    });

    it('should list firearms', async () => {
      const result = await firearmsService.list('user123');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('AmmunitionService', () => {
    it('should create ammunition', async () => {
      const data = { name: 'Test Ammo', user_id: 'user123', caliber_id: 'cal123' };
      const result = await ammunitionService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('OpticsService', () => {
    it('should create optic', async () => {
      const data = { name: 'Test Scope', user_id: 'user123' };
      const result = await opticsService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('MagazinesService', () => {
    it('should create magazine', async () => {
      const data = { name: 'Test Mag', user_id: 'user123' };
      const result = await magazinesService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('AccessoriesService', () => {
    it('should create accessory', async () => {
      const data = { name: 'Test Accessory', user_id: 'user123' };
      const result = await accessoriesService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('SuppressorsService', () => {
    it('should create suppressor', async () => {
      const data = { name: 'Test Suppressor', user_id: 'user123' };
      const result = await suppressorsService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('ReloadingService', () => {
    it('should create reloading component', async () => {
      const data = { name: 'Test Component', user_id: 'user123' };
      const result = await reloadingService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('CasesService', () => {
    it('should create case', async () => {
      const data = { name: 'Test Case', user_id: 'user123' };
      const result = await casesService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('PrimersService', () => {
    it('should create primer', async () => {
      const data = { name: 'Test Primer', user_id: 'user123' };
      const result = await primersService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });

  describe('PowderService', () => {
    it('should create powder', async () => {
      const data = { name: 'Test Powder', user_id: 'user123' };
      const result = await powderService.create(data, 'user123');
      expect(result).toBeDefined();
    });
  });
});
