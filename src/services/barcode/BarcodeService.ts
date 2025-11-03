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

// Type definition for the singleton API
export type BarcodeApi = {
  isValidUPC: (code: string) => boolean;
  isValidEAN: (code: string) => boolean;
  detectBarcodeType: (code: string) => 'UPC' | 'EAN' | 'EAN-8' | 'ITF-14' | 'UNKNOWN';
  resetApiCounter: () => void;
  getApiCounter: () => number;
  lookup: (barcode: string, forceRefresh?: boolean) => Promise<BarcodeLookupResult>;
  batchLookup: (barcodes: string[]) => Promise<BatchLookupResult[]>;
  getCacheStats: () => Promise<any>;
  clearCache: () => Promise<void>;
  getApiUsage: () => { callsToday: number; limit: number; remaining: number; percentUsed: number };
};

export class BarcodeService {
  private static instance: BarcodeService;
  private apiCallCount = 0;
  private readonly MAX_API_CALLS_PER_DAY = 90;

  private constructor() {}

  static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  /**
   * Validate UPC barcode format (12 or 13 digits)
   */
  isValidUPC(barcode: string): boolean {
    if (!barcode) return false;
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length === 12 || cleaned.length === 13;
  }

  /**
   * Validate EAN barcode format (13 digits)
   */
  isValidEAN(barcode: string): boolean {
    if (!barcode) return false;
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length === 13;
  }

  /**
   * Detect barcode type based on format
   */
  detectBarcodeType(barcode: string): string {
    if (!barcode) return 'UNKNOWN';
    const cleaned = barcode.replace(/\D/g, '');
    
    if (cleaned.length === 12) return 'UPC';
    if (cleaned.length === 13) return 'EAN';
    if (cleaned.length === 8) return 'EAN-8';
    if (cleaned.length === 14) return 'ITF-14';
    
    return 'UNKNOWN';
  }

  async lookup(barcode: string, forceRefresh = false): Promise<BarcodeLookupResult> {
    console.log('[BarcodeService] Looking up barcode:', barcode);

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

    if (this.apiCallCount >= this.MAX_API_CALLS_PER_DAY) {
      console.warn('[BarcodeService] API rate limit reached');
      return {
        success: false,
        error: 'Daily API limit reached. Try again tomorrow or use cached data.',
        source: 'api'
      };
    }

    try {
      this.apiCallCount++;
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      });

      if (error) throw error;

      if (data.success && data.data) {
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
    } catch (error: any) {
      console.error('[BarcodeService] Lookup error:', error);
      return {
        success: false,
        error: error.message || 'Lookup failed',
        source: 'api'
      };
    }
  }

  async batchLookup(barcodes: string[]): Promise<BatchLookupResult[]> {
    console.log('[BarcodeService] Batch lookup for', barcodes.length, 'barcodes');

    const results: BatchLookupResult[] = [];
    const uncachedBarcodes: string[] = [];

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
      } catch (error: any) {
        console.error('[BarcodeService] Batch lookup error:', error);
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

  async getCacheStats() {
    return await barcodeCache.getStats();
  }

  async clearCache() {
    await barcodeCache.clear();
  }

  getApiUsage() {
    return {
      callsToday: this.apiCallCount,
      limit: this.MAX_API_CALLS_PER_DAY,
      remaining: this.MAX_API_CALLS_PER_DAY - this.apiCallCount,
      percentUsed: (this.apiCallCount / this.MAX_API_CALLS_PER_DAY) * 100
    };
  }

  getApiCounter(): number {
    return this.apiCallCount;
  }

  resetApiCounter() {
    this.apiCallCount = 0;
  }
}

// Export singleton instance with full API conforming to BarcodeApi type
export const barcodeService: BarcodeApi = {
  isValidUPC: (code: string) => BarcodeService.getInstance().isValidUPC(code),
  isValidEAN: (code: string) => BarcodeService.getInstance().isValidEAN(code),
  detectBarcodeType: (code: string) => BarcodeService.getInstance().detectBarcodeType(code) as 'UPC' | 'EAN' | 'EAN-8' | 'ITF-14' | 'UNKNOWN',
  resetApiCounter: () => BarcodeService.getInstance().resetApiCounter(),
  getApiCounter: () => BarcodeService.getInstance().getApiCounter(),
  lookup: (barcode: string, forceRefresh?: boolean) => BarcodeService.getInstance().lookup(barcode, forceRefresh),
  batchLookup: (barcodes: string[]) => BarcodeService.getInstance().batchLookup(barcodes),
  getCacheStats: () => BarcodeService.getInstance().getCacheStats(),
  clearCache: () => BarcodeService.getInstance().clearCache(),
  getApiUsage: () => BarcodeService.getInstance().getApiUsage()
};

export default barcodeService;

