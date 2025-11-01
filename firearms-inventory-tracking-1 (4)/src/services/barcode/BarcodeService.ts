import { supabase } from '@/lib/supabase';
import { barcodeCache, BarcodeData } from '@/lib/barcodeCache';

export interface BarcodeLookupResult {
  success: boolean;
  data?: BarcodeData;
  error?: string;
  source?: 'cache' | 'api';
  apiSource?: string;
}

export interface BatchLookupResult {
  barcode: string;
  result: BarcodeLookupResult;
}

export class BarcodeService {
  private static instance: BarcodeService;
  private apiCallCount = 0;
  private readonly MAX_API_CALLS_PER_DAY = 90; // Conservative limit

  private constructor() {}

  static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  /**
   * Lookup a single barcode with intelligent caching
   */
  async lookup(barcode: string, forceRefresh = false): Promise<BarcodeLookupResult> {
    console.log('[BarcodeService] Looking up barcode:', barcode);

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await barcodeCache.get(barcode);
      if (cached) {
        console.log('[BarcodeService] Cache hit for:', barcode);
        return {
          success: true,
          data: cached,
          source: 'cache'
        };
      }
    }

    // Check API rate limit
    if (this.apiCallCount >= this.MAX_API_CALLS_PER_DAY) {
      console.warn('[BarcodeService] API rate limit reached');
      return {
        success: false,
        error: 'Daily API limit reached. Try again tomorrow or use cached data.',
        source: 'api'
      };
    }

    // Call API
    try {
      this.apiCallCount++;
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      });

      if (error) throw error;

      if (data.success && data.data) {
        // Cache the result
        const cacheData: BarcodeData = {
          barcode: data.data.barcode,
          title: data.data.name,
          description: data.data.description,
          brand: data.data.manufacturer,
          category: data.data.category,
          images: data.data.images,
          msrp: data.data.msrp,
          cachedAt: new Date().toISOString(),
          hitCount: 0,
          lastAccessed: new Date().toISOString()
        };

        await barcodeCache.set(cacheData);

        return {
          success: true,
          data: cacheData,
          source: 'api',
          apiSource: data.source
        };
      }

      return {
        success: false,
        error: data.error || 'Product not found',
        source: 'api'
      };
    } catch (error) {
      console.error('[BarcodeService] Lookup error:', error);
      return {
        success: false,
        error: error.message || 'Lookup failed',
        source: 'api'
      };
    }
  }

  /**
   * Batch lookup multiple barcodes
   */
  async batchLookup(barcodes: string[]): Promise<BatchLookupResult[]> {
    console.log('[BarcodeService] Batch lookup for', barcodes.length, 'barcodes');

    const results: BatchLookupResult[] = [];
    const uncachedBarcodes: string[] = [];

    // Check cache for all barcodes first
    for (const barcode of barcodes) {
      const cached = await barcodeCache.get(barcode);
      if (cached) {
        results.push({
          barcode,
          result: {
            success: true,
            data: cached,
            source: 'cache'
          }
        });
      } else {
        uncachedBarcodes.push(barcode);
      }
    }

    // Batch API call for uncached barcodes
    if (uncachedBarcodes.length > 0) {
      try {
        const { data, error } = await supabase.functions.invoke('barcode-lookup', {
          body: { batch: true, barcodes: uncachedBarcodes }
        });

        if (error) throw error;

        if (data.success && data.results) {
          for (let i = 0; i < uncachedBarcodes.length; i++) {
            const apiResult = data.results[i];
            const barcode = uncachedBarcodes[i];

            if (apiResult.success && apiResult.data) {
              const cacheData: BarcodeData = {
                barcode: apiResult.data.barcode,
                title: apiResult.data.name,
                description: apiResult.data.description,
                brand: apiResult.data.manufacturer,
                category: apiResult.data.category,
                images: apiResult.data.images,
                msrp: apiResult.data.msrp,
                cachedAt: new Date().toISOString(),
                hitCount: 0,
                lastAccessed: new Date().toISOString()
              };

              await barcodeCache.set(cacheData);

              results.push({
                barcode,
                result: {
                  success: true,
                  data: cacheData,
                  source: 'api',
                  apiSource: apiResult.source
                }
              });
            } else {
              results.push({
                barcode,
                result: {
                  success: false,
                  error: apiResult.error || 'Not found',
                  source: 'api'
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('[BarcodeService] Batch lookup error:', error);
        // Add failed results for uncached barcodes
        for (const barcode of uncachedBarcodes) {
          results.push({
            barcode,
            result: {
              success: false,
              error: 'Batch lookup failed',
              source: 'api'
            }
          });
        }
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await barcodeCache.getStats();
  }

  /**
   * Clear cache
   */
  async clearCache() {
    await barcodeCache.clear();
  }

  /**
   * Get API usage stats
   */
  getApiUsage() {
    return {
      callsToday: this.apiCallCount,
      limit: this.MAX_API_CALLS_PER_DAY,
      remaining: this.MAX_API_CALLS_PER_DAY - this.apiCallCount,
      percentUsed: (this.apiCallCount / this.MAX_API_CALLS_PER_DAY) * 100
    };
  }

  /**
   * Reset API counter (call this daily)
   */
  resetApiCounter() {
    this.apiCallCount = 0;
  }
}

export const barcodeService = BarcodeService.getInstance();
