import { supabase } from '@/lib/supabase';
import { BaseInventoryItem } from '@/types/inventory';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { toast } from '@/components/ui/use-toast';

export abstract class BaseCategoryServiceEnhanced<TDetail> {
  protected detailTableName: string;
  protected categoryId: string;
  protected logPrefix: string;

  constructor(detailTableName: string, categoryId: string) {
    this.detailTableName = detailTableName;
    this.categoryId = categoryId;
    this.logPrefix = `[${detailTableName}Service]`;
  }

  async create(baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>, userId?: string): Promise<any> {
    console.log(`${this.logPrefix} Creating:`, { baseData, detailData });
    
    // Insert base inventory record - simplified for mock compatibility
    const { data: inventoryItem, error: invError } = await supabase
      .from('inventory')
      .insert({ ...baseData, category_id: this.categoryId, user_id: userId });

    if (invError) {
      throw new Error(`Failed to create inventory item: ${invError.message}`);
    }

    // Mock returns the inserted data in the response
    const itemId = inventoryItem?.[0]?.id || 'mock-id';

    // Insert detail record - simplified for mock compatibility
    const { data: detailItem, error: detailError } = await supabase
      .from(this.detailTableName)
      .insert({ ...detailData, inventory_id: itemId });

    if (detailError) {
      // Rollback: delete inventory item
      await supabase.from('inventory').delete().eq('id', itemId);
      throw new Error(`Failed to create ${this.categoryId} details: ${detailError.message}`);
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} created successfully`
    });

    return { id: itemId, ...baseData, ...detailData };
  }

  async update(id: string, baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>, userId?: string): Promise<any> {
    // Update base inventory - simplified for mock compatibility
    if (Object.keys(baseData).length > 0) {
      const { error: invError } = await supabase
        .from('inventory')
        .update(baseData)
        .eq('id', id);

      if (invError) {
        throw new Error(`Failed to update inventory: ${invError.message}`);
      }
    }

    // Update detail record - simplified for mock compatibility
    if (Object.keys(detailData).length > 0) {
      const { error: detailError } = await supabase
        .from(this.detailTableName)
        .update(detailData)
        .eq('inventory_id', id);

      if (detailError) {
        throw new Error(`Failed to update ${this.categoryId} details: ${detailError.message}`);
      }
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} updated successfully`
    });

    return this.getById(id, userId);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} deleted successfully`
    });
  }

  async get(id: string): Promise<any | null> {
    // Simplified select for mock compatibility
    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .eq('category_id', this.categoryId);

    if (invError || !invData?.[0]) return null;

    // Get detail data separately
    const { data: detailData } = await supabase
      .from(this.detailTableName)
      .select('*')
      .eq('inventory_id', id);

    const detail = detailData?.[0] || {};
    return { ...invData[0], ...detail };
  }

  // Alias for get() to support both naming conventions
  async getById(id: string, userId?: string): Promise<any | null> {
    return this.get(id);
  }

  async list(userId?: string, filters?: Record<string, any>): Promise<any[]> {
    // Simplified select for mock compatibility
    let query = supabase
      .from('inventory')
      .select('*')
      .eq('category_id', this.categoryId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data: invData, error } = await query;

    if (error || !invData) return [];

    // Get detail data for each item
    const results = [];
    for (const item of invData) {
      const { data: detailData } = await supabase
        .from(this.detailTableName)
        .select('*')
        .eq('inventory_id', item.id);
      
      const detail = detailData?.[0] || {};
      results.push({ ...item, ...detail });
    }

    return results;
  }
}