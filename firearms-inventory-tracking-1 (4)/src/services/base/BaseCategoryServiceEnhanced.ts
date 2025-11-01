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

  async create(baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>): Promise<any> {
    console.log(`${this.logPrefix} Creating:`, { baseData, detailData });
    
    // Insert base inventory record with error handling
    const invResult = await withDatabaseErrorHandling(
      () => supabase
        .from('inventory')
        .insert({ ...baseData, category_id: this.categoryId })
        .select()
        .single(),
      {
        operation: 'create',
        component: this.logPrefix,
        table: 'inventory',
        action: 'insert',
        data: baseData
      }
    );

    if (!invResult.success) {
      throw new Error(`Failed to create inventory item: ${invResult.userMessage}`);
    }

    const inventoryItem = invResult.data;

    // Insert detail record with error handling
    const detailResult = await withDatabaseErrorHandling(
      () => supabase
        .from(this.detailTableName)
        .insert({ ...detailData, inventory_id: inventoryItem.id })
        .select()
        .single(),
      {
        operation: 'create',
        component: this.logPrefix,
        table: this.detailTableName,
        action: 'insert',
        data: { ...detailData, inventory_id: inventoryItem.id }
      }
    );

    if (!detailResult.success) {
      // Rollback: delete inventory item
      await supabase.from('inventory').delete().eq('id', inventoryItem.id);
      throw new Error(`Failed to create ${this.categoryId} details: ${detailResult.userMessage}`);
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} created successfully`
    });

    return { ...inventoryItem, ...detailResult.data };
  }

  async update(id: string, baseData: Partial<BaseInventoryItem>, detailData: Partial<TDetail>): Promise<any> {
    // Update base inventory
    if (Object.keys(baseData).length > 0) {
      const invResult = await withDatabaseErrorHandling(
        () => supabase.from('inventory').update(baseData).eq('id', id),
        {
          operation: 'update',
          component: this.logPrefix,
          table: 'inventory',
          action: 'update',
          recordId: id,
          data: baseData
        }
      );

      if (!invResult.success) {
        throw new Error(`Failed to update inventory: ${invResult.userMessage}`);
      }
    }

    // Update detail record
    if (Object.keys(detailData).length > 0) {
      const detailResult = await withDatabaseErrorHandling(
        () => supabase.from(this.detailTableName).update(detailData).eq('inventory_id', id),
        {
          operation: 'update',
          component: this.logPrefix,
          table: this.detailTableName,
          action: 'update',
          recordId: id,
          data: detailData
        }
      );

      if (!detailResult.success) {
        throw new Error(`Failed to update ${this.categoryId} details: ${detailResult.userMessage}`);
      }
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} updated successfully`
    });

    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    const result = await withDatabaseErrorHandling(
      () => supabase.from('inventory').delete().eq('id', id),
      {
        operation: 'delete',
        component: this.logPrefix,
        table: 'inventory',
        action: 'delete',
        recordId: id
      }
    );

    if (!result.success) {
      throw new Error(`Failed to delete: ${result.userMessage}`);
    }

    toast({
      title: 'Success',
      description: `${this.categoryId} deleted successfully`
    });
  }

  async get(id: string): Promise<any | null> {
    const result = await withDatabaseErrorHandling(
      () => supabase
        .from('inventory')
        .select(`*, ${this.detailTableName}(*)`)
        .eq('id', id)
        .eq('category_id', this.categoryId)
        .single(),
      {
        operation: 'get',
        component: this.logPrefix,
        table: 'inventory',
        action: 'select',
        recordId: id
      }
    );

    if (!result.success) return null;
    return this.flattenResult(result.data);
  }

  async list(filters?: Record<string, any>): Promise<any[]> {
    const result = await withDatabaseErrorHandling(
      async () => {
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

        return query;
      },
      {
        operation: 'list',
        component: this.logPrefix,
        table: 'inventory',
        action: 'select',
        data: filters
      }
    );

    if (!result.success) return [];
    return (result.data || []).map(item => this.flattenResult(item));
  }

  private flattenResult(item: any): any {
    const detail = item[this.detailTableName]?.[0] || {};
    delete item[this.detailTableName];
    return { ...item, ...detail };
  }
}
