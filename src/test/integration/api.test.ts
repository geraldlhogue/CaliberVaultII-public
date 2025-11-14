import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryAPIService } from '../../services/api/InventoryAPIService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

// Ensure supabase is available globally and has from/channel mocks
(globalThis as any).supabase = supabase;
(supabase as any).from = vi.fn();
(supabase as any).channel = vi.fn();

describe('API Integration Tests', () => {
  let apiService: InventoryAPIService;

  beforeEach(() => {
    apiService = new InventoryAPIService();
    vi.clearAllMocks();

    (globalThis as any).supabase = supabase;
    (supabase as any).from = vi.fn();
    (supabase as any).channel = vi.fn();
  });

  describe('REST API Endpoints', () => {
    it('fetches inventory items via API', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        then: (onFulfilled: any) =>
          Promise.resolve({ data: mockData, error: null }).then(onFulfilled),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await apiService.getAll();
      expect(result).toEqual(mockData);
    });

    it('creates item via API', async () => {
      const newItem = { name: 'New Item', category: 'firearms' };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(() =>
          Promise.resolve({ data: newItem, error: null }),
        ),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await apiService.create(newItem);
      expect(result).toEqual(newItem);
    });

    it('handles API errors gracefully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        then: (onFulfilled: any) =>
          Promise.resolve({
            data: null,
            error: new Error('API Error'),
          }).then(onFulfilled),
      };

      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      await expect(apiService.getAll()).rejects.toThrow('API Error');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('subscribes to inventory changes', async () => {
      const callback = vi.fn();

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      };

      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      await apiService.subscribeToChanges(callback);
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('performs batch insert', async () => {
      const items = [
        { name: 'Item 1', category: 'firearms' },
        { name: 'Item 2', category: 'ammunition' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: items, error: null }),
      } as any);

      const result = await apiService.batchCreate(items);
      expect(result).toHaveLength(2);
    });
  });
});

