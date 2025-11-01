import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, OpticDetails } from '@/types/inventory';

export class OpticsService extends BaseCategoryServiceEnhanced<OpticDetails> {

  constructor() {
    super('optic_details', 'optics');
  }

  async createOptic(data: Partial<BaseInventoryItem & OpticDetails>): Promise<any> {
    if (!data.name && data.model) {
      const manufacturer = await this.getManufacturerName(data.manufacturer_id);
      data.name = `${manufacturer} ${data.model}`;
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

    const detailData: Partial<OpticDetails> = {
      manufacturer_id: data.manufacturer_id,
      model: data.model,
      magnification: data.magnification,
      objective_lens: data.objective_lens,
      reticle_type_id: data.reticle_type_id,
      turret_type_id: data.turret_type_id,
      mounting_type_id: data.mounting_type_id,
      fov_id: data.fov_id,
    };

    return this.create(baseData, detailData);
  }

  async updateOptic(id: string, data: Partial<BaseInventoryItem & OpticDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<OpticDetails> = {};

    const baseFields = ['name', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['manufacturer_id', 'model', 'magnification', 'objective_lens', 'reticle_type_id', 'turret_type_id', 'mounting_type_id', 'fov_id'];

    Object.entries(data).forEach(([key, value]) => {
      if (baseFields.includes(key)) baseData[key] = value;
      if (detailFields.includes(key)) detailData[key] = value;
    });

    return this.update(id, baseData, detailData);
  }

  private async getManufacturerName(id?: string): Promise<string> {
    if (!id) return 'Unknown';
    const result = await withDatabaseErrorHandling(
      () => supabase.from('manufacturers').select('name').eq('id', id).single(),
      {
        operation: 'getManufacturerName',
        component: this.logPrefix,
        table: 'manufacturers',
        action: 'select',
        recordId: id
      }
    );
    return result.success ? result.data?.name || 'Unknown' : 'Unknown';
  }

}

export const opticsService = new OpticsService();
