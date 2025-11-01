import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, PowderDetails } from '@/types/inventory';

export class PowderService extends BaseCategoryServiceEnhanced<PowderDetails> {
  constructor() {
    super('powder_details', 'powder');
  }

  async createPowder(data: Partial<BaseInventoryItem & PowderDetails>): Promise<any> {
    if (!data.name && data.powder_type_id) {
      const powderType = await this.getPowderTypeName(data.powder_type_id);
      data.name = powderType;
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

    const detailData: Partial<PowderDetails> = {
      manufacturer_id: data.manufacturer_id,
      powder_type_id: data.powder_type_id,
      weight: data.weight,
      unit_of_measure_id: data.unit_of_measure_id,
      lot_number: data.lot_number,
    };

    return this.create(baseData, detailData);
  }

  async updatePowder(id: string, data: Partial<BaseInventoryItem & PowderDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<PowderDetails> = {};

    const baseFields = ['name', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['manufacturer_id', 'powder_type_id', 'weight', 'unit_of_measure_id', 'lot_number'];

    Object.entries(data).forEach(([key, value]) => {
      if (baseFields.includes(key)) baseData[key] = value;
      if (detailFields.includes(key)) detailData[key] = value;
    });

    return this.update(id, baseData, detailData);
  }

  private async getPowderTypeName(id?: string): Promise<string> {
    if (!id) return 'Unknown';
    const result = await withDatabaseErrorHandling(
      () => supabase.from('powder_types').select('name').eq('id', id).single(),
      {
        operation: 'getPowderTypeName',
        component: this.logPrefix,
        table: 'powder_types',
        action: 'select',
        recordId: id
      }
    );
    return result.success ? result.data?.name || 'Unknown' : 'Unknown';
  }
}

export const powderService = new PowderService();
