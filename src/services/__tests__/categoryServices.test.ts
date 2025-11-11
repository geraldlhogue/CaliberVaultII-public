import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firearmsService } from '../category/FirearmsService';
import { ammunitionService } from '../category/AmmunitionService';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test Item' }, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Test Item' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '123', name: 'Updated Item' }, error: null }))
          }))
        }))
      }))
    }))
  }
}));

vi.mock('@/lib/databaseErrorHandler', () => ({
  withDatabaseErrorHandling: vi.fn((fn) => fn())
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

describe('FirearmsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a firearm using createFirearm method', async () => {
    const data = { 
      name: 'Test Rifle', 
      manufacturer_id: 'mfg123',
      model: 'TR-15',
      serial_number: '123456', 
      caliber_id: 'cal123',
      quantity: 1
    };
    const result = await firearmsService.createFirearm(data);
    expect(result).toBeDefined();
  });

  it('should update a firearm using updateFirearm method', async () => {
    const data = {
      name: 'Updated Rifle',
      model: 'TR-16'
    };
    const result = await firearmsService.updateFirearm('123', data);
    expect(result).toBeDefined();
  });
});

describe('AmmunitionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create ammunition using createAmmunition method', async () => {
    const data = { 
      name: 'Test Ammo', 
      manufacturer_id: 'mfg123',
      caliber_id: 'cal123', 
      round_count: 500,
      quantity: 1
    };
    const result = await ammunitionService.createAmmunition(data);
    expect(result).toBeDefined();
  });
});
