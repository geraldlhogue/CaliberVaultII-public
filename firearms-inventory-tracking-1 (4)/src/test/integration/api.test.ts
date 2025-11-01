import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryAPIService } from '../../services/api/InventoryAPIService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('API Integration Tests', () => {
  let apiService: InventoryAPIService;

  beforeEach(() => {
    apiService = new InventoryAPIService();
    vi.clearAllMocks();
  });

  describe('REST API Endpoints', () => {
    it('fetches inventory items via API', async () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null })
      } as any);

      const result = await apiService.getAll();
      expect(result).toEqual(mockData);
    });

    it('creates item via API', async () => {
      const newItem = { name: 'New Item', category: 'firearms' };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: newItem, error: null }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newItem, error: null })
      } as any);

      const result = await apiService.create(newItem);
      expect(result).toEqual(newItem);
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'API Error' } 
        })
      } as any);

      await expect(apiService.getAll()).rejects.toThrow();
    });
  });

  describe('Real-time Subscriptions', () => {
    it('subscribes to inventory changes', async () => {
      const callback = vi.fn();
      
      const mockSubscription = {
        subscribe: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          subscribe: vi.fn()
        })
      };

      vi.mocked(supabase.channel).mockReturnValue(mockSubscription as any);

      await apiService.subscribeToChanges(callback);
      expect(mockSubscription.subscribe).toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('performs batch insert', async () => {
      const items = [
        { name: 'Item 1', category: 'firearms' },
        { name: 'Item 2', category: 'ammunition' }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: items, error: null })
      } as any);

      const result = await apiService.batchCreate(items);
      expect(result).toHaveLength(2);
    });
  });
});
