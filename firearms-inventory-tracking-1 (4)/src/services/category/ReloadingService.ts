import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, ReloadingComponentDetails } from '@/types/inventory';

export class ReloadingService extends BaseCategoryServiceEnhanced<ReloadingComponentDetails> {
  constructor() {
    super('reloading_component_details', 'reloading_components');
  }

  async createReloadingComponent(data: Partial<BaseInventoryItem & ReloadingComponentDetails>): Promise<any> {
    if (!data.name && data.component_type) {
      data.name = data.component_type;
    }
    if (!data.quantity) data.quantity = 1;

    const baseData: Partial<BaseInventoryItem> = {
      name: data.name,
      quantity: data.quantity,
      purchase_date: data.purchase_date,
      purchase_price: data.purchase_price,
      current_value: data.current_value,
      storage_location_id: data.storage_location_id,
      notes: data.notes,
      image_url: data.image_url,
    };

    const detailData: Partial<ReloadingComponentDetails> = {
      manufacturer_id: data.manufacturer_id,
      component_type: data.component_type,
      caliber_id: data.caliber_id,
      weight: data.weight,
      unit_of_measure_id: data.unit_of_measure_id,
    };

    return this.create(baseData, detailData);
  }

  async updateReloadingComponent(id: string, data: Partial<BaseInventoryItem & ReloadingComponentDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<ReloadingComponentDetails> = {};

    const baseFields = ['name', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['manufacturer_id', 'component_type', 'caliber_id', 'weight', 'unit_of_measure_id'];

    Object.entries(data).forEach(([key, value]) => {
      if (baseFields.includes(key)) baseData[key] = value;
      if (detailFields.includes(key)) detailData[key] = value;
    });

    return this.update(id, baseData, detailData);
  }
}

export const reloadingService = new ReloadingService();
