import { supabase } from '@/lib/supabase';

interface BatchRequest {
  id: string;
  table: string;
  filters?: Record<string, any>;
  select?: string;
  limit?: number;
}

interface BatchResult {
  id: string;
  data: any[];
  error?: string;
  cached: boolean;
}

// In-memory cache with TTL
class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  getCacheKey(request: BatchRequest): string {
    return JSON.stringify(request);
  }
}

export const cacheManager = new CacheManager();

export class InventoryFetchService {
  static async batchFetch(requests: BatchRequest[]): Promise<Record<string, BatchResult>> {
    const results: Record<string, BatchResult> = {};
    const uncachedRequests: BatchRequest[] = [];

    // Check cache first
    requests.forEach(request => {
      const cacheKey = cacheManager.getCacheKey(request);
      const cached = cacheManager.get(cacheKey);
      
      if (cached) {
        results[request.id] = {
          id: request.id,
          data: cached,
          cached: true
        };
      } else {
        uncachedRequests.push(request);
      }
    });

    // Fetch uncached data
    if (uncachedRequests.length > 0) {
      try {
        const { data, error } = await supabase.functions.invoke('batch-fetch', {
          body: { requests: uncachedRequests }
        });

        if (error) throw error;

        data.results.forEach((result: BatchResult) => {
          results[result.id] = result;
          
          // Cache the result
          const request = uncachedRequests.find(r => r.id === result.id);
          if (request && result.data) {
            const cacheKey = cacheManager.getCacheKey(request);
            cacheManager.set(cacheKey, result.data);
          }
        });
      } catch (error) {
        console.error('Batch fetch error:', error);
        throw error;
      }
    }

    return results;
  }

  static async refreshAnalytics(): Promise<void> {
    const { error } = await supabase.rpc('refresh_analytics_views');
    if (error) throw error;
  }

  static async getInventoryAnalytics(userId?: string) {
    const { data, error } = await supabase.rpc('get_inventory_analytics', {
      p_user_id: userId || null
    });
    
    if (error) throw error;
    return data?.[0] || null;
  }

  static async getCategoryAnalytics(userId?: string) {
    const { data, error } = await supabase.rpc('get_category_analytics', {
      p_user_id: userId || null
    });
    
    if (error) throw error;
    return data || [];
  }
}
