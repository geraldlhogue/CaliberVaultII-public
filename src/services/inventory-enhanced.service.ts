import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import type { BaseInventoryItem, InventoryItem } from '@/types/inventory';

export class InventoryServiceEnhanced {
  private logPrefix = '[InventoryServiceEnhanced]';

  async saveItem(item: any, userId: string) {
    const categoryId = await this.getCategoryId(item.category);
    if (!categoryId) {
      throw new Error(`Category "${item.category}" not found`);
    }

    const manufacturerId = await this.getManufacturerId(item.manufacturer);
    const locationId = await this.getLocationId(item.storageLocation, userId);

    const inventoryData: any = {
      user_id: userId,
      category_id: categoryId,
      name: item.name,
      manufacturer_id: manufacturerId || null,
      model: item.model,
      description: item.description,
      quantity: parseInt(item.quantity) || 1,
      location_id: locationId || null,
      purchase_price: parseFloat(item.purchasePrice) || null,
      purchase_date: item.purchaseDate,
      current_value: parseFloat(item.currentValue) || null,
      barcode: item.barcode,
      upc: item.upc,
      photos: item.images || [],
      notes: item.notes,
      status: 'active'
    };

    const result = await withDatabaseErrorHandling(
      () => supabase.from('inventory').insert(inventoryData).select().single(),
      {
        operation: 'saveItem',
        component: this.logPrefix,
        table: 'inventory',
        action: 'insert',
        data: inventoryData
      }
    );

    if (!result.success) throw new Error(result.userMessage);
    await this.saveDetails(item.category, result.data.id, item, userId);
    return result.data;
  }

  private async saveDetails(category: string, inventoryId: string, item: any, userId: string) {
    const caliberId = item.caliber ? await this.getCaliberId(item.caliber) : null;
    const cartridgeId = item.cartridge ? await this.getCartridgeId(item.cartridge) : null;
    
    const detailsMap: Record<string, any> = {
      firearms: {
        table: 'firearm_details',
        data: {
          inventory_id: inventoryId,
          caliber_id: caliberId,
          cartridge_id: cartridgeId,
          serial_number: item.serialNumber || null,
          barrel_length: parseFloat(item.barrelLengthValue) || null,
          capacity: parseInt(item.capacity) || null,
          action_id: item.action ? await this.getActionId(item.action) : null,
          round_count: parseInt(item.roundCount) || 0
        }
      },
      ammunition: {
        table: 'ammunition_details',
        data: {
          inventory_id: inventoryId,
          caliber_id: caliberId,
          cartridge_id: cartridgeId,
          bullet_type_id: item.bulletType ? await this.getBulletTypeId(item.bulletType) : null,
          grain_weight: parseFloat(item.grainWeightValue) || null,
          round_count: parseInt(item.roundCount) || null,
          primer_type_id: item.primerType ? await this.getPrimerTypeId(item.primerType) : null
        }
      }
    };

    const config = detailsMap[category.toLowerCase()];
    if (config) {
      const result = await withDatabaseErrorHandling(
        () => supabase.from(config.table).insert(config.data),
        {
          operation: 'saveDetails',
          component: this.logPrefix,
          table: config.table,
          action: 'insert',
          data: config.data
        }
      );
      if (!result.success) throw new Error(result.userMessage);
    }
  }

  async getItems(userId: string): Promise<InventoryItem[]> {
    const result = await withDatabaseErrorHandling(
      () => supabase.from('inventory').select(`*,categories(name),manufacturers(name)`).eq('user_id', userId).eq('status', 'active'),
      {
        operation: 'getItems',
        component: this.logPrefix,
        table: 'inventory',
        action: 'select'
      }
    );
    return result.success ? result.data || [] : [];
  }

  private async getCategoryId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('categories').select('id').ilike('name', name).single(),
      { operation: 'getCategoryId', component: this.logPrefix, table: 'categories', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getManufacturerId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('manufacturers').select('id').ilike('name', name).single(),
      { operation: 'getManufacturerId', component: this.logPrefix, table: 'manufacturers', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getLocationId(name: string, userId: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('locations').select('id').eq('name', name).eq('user_id', userId).single(),
      { operation: 'getLocationId', component: this.logPrefix, table: 'locations', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getCaliberId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('calibers').select('id').ilike('name', name).single(),
      { operation: 'getCaliberId', component: this.logPrefix, table: 'calibers', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getCartridgeId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('cartridges').select('id').eq('cartridge', name).single(),
      { operation: 'getCartridgeId', component: this.logPrefix, table: 'cartridges', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getActionId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('action_types').select('id').ilike('name', name).single(),
      { operation: 'getActionId', component: this.logPrefix, table: 'action_types', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getBulletTypeId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('bullet_types').select('id').ilike('name', name).single(),
      { operation: 'getBulletTypeId', component: this.logPrefix, table: 'bullet_types', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }

  private async getPrimerTypeId(name: string): Promise<string | null> {
    if (!name) return null;
    const result = await withDatabaseErrorHandling(
      () => supabase.from('primer_types').select('id').ilike('name', name).single(),
      { operation: 'getPrimerTypeId', component: this.logPrefix, table: 'primer_types', action: 'select' }
    );
    return result.success ? result.data?.id || null : null;
  }
}

export const inventoryServiceEnhanced = new InventoryServiceEnhanced();
