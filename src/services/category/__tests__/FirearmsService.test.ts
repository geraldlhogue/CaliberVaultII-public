import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FirearmsService } from '../FirearmsService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { name: 'Test Mfg' }, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
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
  let service: FirearmsService;

  beforeEach(() => {
    service = new FirearmsService();
    vi.clearAllMocks();
  });

  it('should create firearm with correct fields', async () => {
    const baseData = { name: 'Test Rifle', manufacturer_id: 'mfg-123' };
    const detailData = { serial_number: '123456', caliber_id: 'cal-123' };
    const result = await service.create(baseData, detailData);
    expect(result).toBeDefined();
  });

  it('should handle serial numbers', async () => {
    const baseData = { name: 'Test Pistol' };
    const detailData = { serial_number: 'ABC123' };
    const result = await service.create(baseData, detailData);
    expect(result).toBeDefined();
  });
});
