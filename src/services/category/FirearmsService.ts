import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';

import { BaseInventoryItem, FirearmDetails } from '@/types/inventory';

export class FirearmsService extends BaseCategoryServiceEnhanced<FirearmDetails> {

  constructor() {
    super('firearm_details', 'firearms');
  }

  async createFirearm(data: Partial<BaseInventoryItem & FirearmDetails>): Promise<any> {
    // Auto-generate name if not provided
    if (!data.name && data.model) {
      const manufacturer = await this.getManufacturerName(data.manufacturer_id);
      data.name = `${manufacturer} ${data.model}`;
    }

    // Ensure quantity is set
    if (!data.quantity) {
      data.quantity = 1;
    }

    const baseData: Partial<BaseInventoryItem> = {
      name: data.name,
      manufacturer_id: data.manufacturer_id,
      model: data.model,
      quantity: data.quantity,
      purchase_date: data.purchase_date,
      purchase_price: data.purchase_price,
      current_value: data.current_value,
      storage_location_id: data.storage_location_id,
      notes: data.notes,
      image_url: data.image_url,
    };

    const detailData: Partial<FirearmDetails> = {
      firearm_type_id: data.firearm_type_id,
      serial_number: data.serial_number,
      caliber_id: data.caliber_id,
      cartridge_id: data.cartridge_id,
      barrel_length: data.barrel_length,
      overall_length: data.overall_length,
      weight: data.weight,
      capacity: data.capacity,
      action_id: data.action_id,
      finish: data.finish,
      round_count: data.round_count,
      is_nfa: data.is_nfa,
      nfa_item_type: data.nfa_item_type,
      form_4_approved_date: data.form_4_approved_date,
      tax_stamp_number: data.tax_stamp_number,
    };

    return this.create(baseData, detailData);
  }

  async updateFirearm(id: string, data: Partial<BaseInventoryItem & FirearmDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<FirearmDetails> = {};

    const baseFields = ['name', 'manufacturer_id', 'model', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['firearm_type_id', 'serial_number', 'caliber_id', 'cartridge_id', 'barrel_length', 'overall_length', 'weight', 'capacity', 'action_id', 'finish', 'round_count', 'is_nfa', 'nfa_item_type', 'form_4_approved_date', 'tax_stamp_number'];

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


export const firearmsService = new FirearmsService();
