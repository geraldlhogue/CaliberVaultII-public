import { supabase } from '@/lib/supabase';

export interface SearchFilters {
  manufacturer_id?: string;
  caliber_id?: string;
  location_id?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  model?: string;
  serial_number?: string;
  category: string;
  rank: number;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query?: string;
  filters: SearchFilters;
  is_favorite: boolean;
  created_at: string;
}

class SearchServiceClass {
  private searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async search(query: string, filters: SearchFilters = {}, fuzzy = true): Promise<SearchResult[]> {
    const cacheKey = JSON.stringify({ query, filters, fuzzy });
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.results;
    }

    const { data, error } = await supabase.functions.invoke('advanced-search', {
      body: { query, filters, fuzzy, limit: 100 }
    });

    if (error) throw error;

    const results = data.results || [];
    this.searchCache.set(cacheKey, { results, timestamp: Date.now() });

    // Save to search history
    await this.saveSearchHistory(query, filters, results.length);

    return results;
  }

  async saveSearchHistory(query: string, filters: SearchFilters, resultCount: number) {
    try {
      await supabase.from('search_history').insert({
        query,
        filters,
        result_count: resultCount
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  async getSearchHistory(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async clearSearchHistory() {
    const { error } = await supabase.from('search_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  }

  async saveSearchPreset(name: string, description: string, query: string, filters: SearchFilters) {
    const { data, error } = await supabase
      .from('saved_search_presets')
      .insert({ name, description, query, filters })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSavedSearches(): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_search_presets')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async toggleFavorite(id: string, isFavorite: boolean) {
    const { error } = await supabase
      .from('saved_search_presets')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteSearchPreset(id: string) {
    const { error } = await supabase
      .from('saved_search_presets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  clearCache() {
    this.searchCache.clear();
  }
}

export const SearchService = new SearchServiceClass();
