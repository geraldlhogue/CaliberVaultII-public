import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firearmsService } from '../category/FirearmsService';
import { ammunitionService } from '../category/AmmunitionService';
import { opticsService } from '../category/OpticsService';
import { magazinesService } from '../category/MagazinesService';
import { accessoriesService } from '../category/AccessoriesService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: '123', name: 'Test Item' }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: '123', name: 'Updated Item' }, 
              error: null 
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('FirearmsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a firearm with all fields', async () => {
    const firearmData = {
      name: 'Test Rifle',
      manufacturer: 'Test Mfg',
      model: 'Model X',
      serialNumber: '123456',
      caliber: '.308',
      action: 'Bolt Action',
      barrelLength: '24"',
      capacity: 5
    };

    const result = await firearmsService.create(firearmData, 'user123');
    expect(result).toBeDefined();
  });

  it('should validate required fields', async () => {
    const invalidData = {
      manufacturer: 'Test Mfg'
    };

    await expect(
      firearmsService.create(invalidData as any, 'user123')
    ).rejects.toThrow();
  });
});

describe('AmmunitionService', () => {
  it('should create ammunition with round count', async () => {
    const ammoData = {
      name: 'Test Ammo',
      manufacturer: 'Federal',
      caliber: '.308',
      bulletType: 'FMJ',
      grainWeight: '150gr',
      roundCount: 500
    };

    const result = await ammunitionService.create(ammoData, 'user123');
    expect(result).toBeDefined();
  });
});
