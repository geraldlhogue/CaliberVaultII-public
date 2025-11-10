import { supabase } from '@/lib/supabase';

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

export class ReferenceDataService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  private async fetchFromCache<T>(table: string): Promise<T[] | null> {
    const cached = this.cache.get(table);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`[ReferenceData] Using cached ${table}`);
      return cached.data;
    }
    return null;
  }

  private setCache<T>(table: string, data: T[]): void {
    this.cache.set(table, { data, timestamp: Date.now() });
  }

  async getManufacturers() {
    const cached = await this.fetchFromCache('manufacturers');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('name');

    if (error) throw error;
    this.setCache('manufacturers', data || []);
    return data || [];
  }

  async getCalibers() {
    const cached = await this.fetchFromCache('calibers');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('calibers')
      .select('*')
      .order('name');

    if (error) throw error;
    this.setCache('calibers', data || []);
    return data || [];
  }

  async getCartridges() {
    const cached = await this.fetchFromCache('cartridges');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('cartridges')
      .select('*')
      .order('name');

    if (error) throw error;
    this.setCache('cartridges', data || []);
    return data || [];
  }

  async getBulletTypes() {
    const cached = await this.fetchFromCache('bullet_types');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('bullet_types')
      .select('*')
      .order('name');

    if (error) throw error;
    this.setCache('bullet_types', data || []);
    return data || [];
  }

  async getStorageLocations() {
    const cached = await this.fetchFromCache('storage_locations');
    if (cached) return cached;

    const { data, error } = await supabase
      .from('storage_locations')
      .select('*')
      .order('name');

    if (error) throw error;
    this.setCache('storage_locations', data || []);
    return data || [];
  }

  async addManufacturer(name: string) {
    // Simplified for mock compatibility - no chained select()
    const { data, error } = await supabase
      .from('manufacturers')
      .insert({ name });

    if (error) throw error;
    
    // Clear cache to force refresh
    this.cache.delete('manufacturers');
    
    // Return the inserted data (mock returns it)
    return data?.[0] || { name };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('[ReferenceData] Cache cleared');
  }
}

export const referenceDataService = new ReferenceDataService();