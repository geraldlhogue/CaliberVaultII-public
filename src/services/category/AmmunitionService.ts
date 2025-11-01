import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, AmmunitionDetails } from '@/types/inventory';

export class AmmunitionService extends BaseCategoryServiceEnhanced<AmmunitionDetails> {

  constructor() {
    super('ammunition_details', 'ammunition');
  }

  async createAmmunition(data: Partial<BaseInventoryItem & AmmunitionDetails>): Promise<any> {
    if (!data.name && data.caliber_id) {
      const caliber = await this.getCaliberName(data.caliber_id);
      data.name = `${caliber} Ammunition`;
    }
    if (!data.quantity) data.quantity = 1;

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

    const detailData: Partial<AmmunitionDetails> = {
      caliber_id: data.caliber_id,
      cartridge_id: data.cartridge_id,
      bullet_type_id: data.bullet_type_id,
      bullet_weight: data.bullet_weight,
      muzzle_velocity: data.muzzle_velocity,
      rounds_per_box: data.rounds_per_box,
      is_reloaded: data.is_reloaded,
      brass_condition: data.brass_condition,
    };

    return this.create(baseData, detailData);
  }

  async updateAmmunition(id: string, data: Partial<BaseInventoryItem & AmmunitionDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<AmmunitionDetails> = {};

    const baseFields = ['name', 'manufacturer_id', 'model', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['caliber_id', 'cartridge_id', 'bullet_type_id', 'bullet_weight', 'muzzle_velocity', 'rounds_per_box', 'is_reloaded', 'brass_condition'];

    Object.entries(data).forEach(([key, value]) => {
      if (baseFields.includes(key)) baseData[key] = value;
      if (detailFields.includes(key)) detailData[key] = value;
    });

    return this.update(id, baseData, detailData);
  }

  private async getCaliberName(id?: string): Promise<string> {
    if (!id) return 'Unknown';
    const result = await withDatabaseErrorHandling(
      () => supabase.from('calibers').select('name').eq('id', id).single(),
      {
        operation: 'getCaliberName',
        component: this.logPrefix,
        table: 'calibers',
        action: 'select',
        recordId: id
      }
    );
    return result.success ? result.data?.name || 'Unknown' : 'Unknown';
  }

}

export const ammunitionService = new AmmunitionService();
