import { describe, it, expect, vi } from 'vitest';
import { firearmsService } from '../FirearmsService';
import { ammunitionService } from '../AmmunitionService';
import { opticsService } from '../OpticsService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
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

describe('All Category Services', () => {
  it('firearms service is defined', () => {
    expect(firearmsService).toBeDefined();
  });

  it('ammunition service is defined', () => {
    expect(ammunitionService).toBeDefined();
  });

  it('optics service is defined', () => {
    expect(opticsService).toBeDefined();
  });

  it('all services have create method', () => {
    expect(typeof firearmsService.create).toBe('function');
    expect(typeof ammunitionService.create).toBe('function');
    expect(typeof opticsService.create).toBe('function');
  });
});
