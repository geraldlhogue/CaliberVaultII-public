import { supabase } from '@/lib/supabase';
import { BaseInventoryItem } from '@/types/inventory';

export abstract class BaseCategoryService<TDetail> {
  protected detailTableName: string;
  protected categoryId: string;
  protected logPrefix: string;

  constructor(detailTableName: string, categoryId: string) {
    this.detailTableName = detailTableName;
    this.categoryId = categoryId;
    this.logPrefix = `[${detailTableName}Service]`;
  }

  async create(baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>): Promise<any> {
    console.log(`${this.logPrefix} Creating:`, { baseData, detailData });
    
    // Insert base inventory record
    const { data: inventoryItem, error: invError } = await supabase
      .from('inventory')
      .insert({ ...baseData, category_id: this.categoryId })
      .select()
      .single();

    if (invError) throw invError;

    // Insert detail record
    const { data: detailItem, error: detailError } = await supabase
      .from(this.detailTableName)
      .insert({ ...detailData, inventory_id: inventoryItem.id })
      .select()
      .single();

    if (detailError) throw detailError;

    return { ...inventoryItem, ...detailItem };
  }

  async update(id: string, baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>): Promise<any> {
    // Update base inventory
    if (Object.keys(baseData).length > 0) {
      const { error: invError } = await supabase
        .from('inventory')
        .update(baseData)
        .eq('id', id);
      if (invError) throw invError;
    }

    // Update detail record
    if (Object.keys(detailData).length > 0) {
      const { error: detailError } = await supabase
        .from(this.detailTableName)
        .update(detailData)
        .eq('inventory_id', id);
      if (detailError) throw detailError;
    }

    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) throw error;
  }

  async get(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`*, ${this.detailTableName}(*)`)
      .eq('id', id)
      .eq('category_id', this.categoryId)
      .single();

    if (error) return null;
    return this.flattenResult(data);
  }

  async list(filters?: Record<string, any>): Promise<any[]> {
    let query = supabase
      .from('inventory')
      .select(`*, ${this.detailTableName}(*)`)
      .eq('category_id', this.categoryId);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(item => this.flattenResult(item));
  }

  private flattenResult(item: any): any {
    const detail = item[this.detailTableName]?.[0] || {};
    delete item[this.detailTableName];
    return { ...item, ...detail };
  }
}
