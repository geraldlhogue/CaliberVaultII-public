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

// Core API interface
export interface BarcodeApi {
  isValidUPC(s: string): boolean;
  isValidEAN(s: string): boolean;
  detectBarcodeType(s: string): 'UPC' | 'EAN' | 'EAN-8' | 'ITF-14' | 'UNKNOWN';
  resetApiCounter(): void;
  getApiCounter(): number;
  lookup(barcode: string, forceRefresh?: boolean): Promise<BarcodeLookupResult>;
  batchLookup(barcodes: string[]): Promise<BatchLookupResult[]>;
  getCacheStats(): Promise<any>;
  clearCache(): Promise<void>;
  getApiUsage(): any;
}

export class BarcodeService implements BarcodeApi {
  private static instance: BarcodeService;
  private apiCallCount = 0;
  private readonly MAX_API_CALLS_PER_DAY = 90;

  // Singleton pattern
  static getInstance(): BarcodeService {
    if (!BarcodeService.instance) {
      BarcodeService.instance = new BarcodeService();
    }
    return BarcodeService.instance;
  }

  isValidUPC(barcode: string): boolean {
    if (!barcode) return false;
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length === 12 || cleaned.length === 13;
  }

  isValidEAN(barcode: string): boolean {
    if (!barcode) return false;
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length === 13;
  }

  detectBarcodeType(barcode: string): 'UPC' | 'EAN' | 'EAN-8' | 'ITF-14' | 'UNKNOWN' {
    if (!barcode) return 'UNKNOWN';
    const cleaned = barcode.replace(/\D/g, '');
    if (cleaned.length === 12) return 'UPC';
    if (cleaned.length === 13) return 'EAN';
    if (cleaned.length === 8) return 'EAN-8';
    if (cleaned.length === 14) return 'ITF-14';
    return 'UNKNOWN';
  }

  getApiCounter(): number {
    return this.apiCallCount;
  }

  resetApiCounter(): void {
    this.apiCallCount = 0;
  }

  async lookup(barcode: string, forceRefresh = false): Promise<BarcodeLookupResult> {
    if (!forceRefresh) {
      const cached = await barcodeCache.get(barcode);
      if (cached) return { success: true, data: cached, source: 'cache' };
    }

    if (this.apiCallCount >= this.MAX_API_CALLS_PER_DAY) {
      return { success: false, error: 'Daily API limit reached', source: 'api' };
    }

    try {
      this.apiCallCount++;
      const { data, error } = await supabase.functions.invoke('barcode-lookup', { body: { barcode } });
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
        return { success: true, data: cacheData, source: 'api', apiSource: data.source };
      }
      return { success: false, error: data.error || 'Product not found', source: 'api' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Lookup failed', source: 'api' };
    }
  }

  async batchLookup(barcodes: string[]): Promise<BatchLookupResult[]> {
    const results: BatchLookupResult[] = [];
    for (const barcode of barcodes) {
      results.push({ barcode, result: await this.lookup(barcode) });
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
}

// Export singleton instance
export const BarcodeServiceSingleton = BarcodeService.getInstance();
export const BarcodeServiceFactory = { getInstance: () => BarcodeServiceSingleton };

// For compatibility with tests
export default { getInstance: () => BarcodeServiceSingleton };
export const getInstance = () => BarcodeServiceSingleton;

// Also export the instance directly as barcodeService
export const barcodeService = BarcodeServiceSingleton;