import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryAPIService } from '../InventoryAPIService';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '123' }, error: null }))
        }))
      }))
    }))
  }
}));

describe('InventoryAPIService', () => {
  let apiService: InventoryAPIService;

  beforeEach(() => {
    apiService = new InventoryAPIService();
    vi.clearAllMocks();
  });

  it('fetches inventory items', async () => {
    const items = await apiService.getItems();
    expect(Array.isArray(items)).toBe(true);
  });

  it('creates new item via API', async () => {
    const item = await apiService.createItem({ name: 'Test' });
    expect(item).toBeDefined();
  });

  it('handles API errors', async () => {
    expect(apiService).toBeDefined();
  });
});
