import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, PrimerDetails } from '@/types/inventory';

export class PrimersService extends BaseCategoryServiceEnhanced<PrimerDetails> {
  constructor() {
    super('primer_details', 'primers');
  }

  async createPrimer(data: Partial<BaseInventoryItem & PrimerDetails>): Promise<any> {
    if (!data.name && data.primer_type_id) {
      const primerType = await this.getPrimerTypeName(data.primer_type_id);
      data.name = primerType;
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

    const detailData: Partial<PrimerDetails> = {
      manufacturer_id: data.manufacturer_id,
      primer_type_id: data.primer_type_id,
      count: data.count,
      lot_number: data.lot_number,
    };

    return this.create(baseData, detailData);
  }

  async updatePrimer(id: string, data: Partial<BaseInventoryItem & PrimerDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<PrimerDetails> = {};

    const baseFields = ['name', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['manufacturer_id', 'primer_type_id', 'count', 'lot_number'];

    Object.entries(data).forEach(([key, value]) => {
      if (baseFields.includes(key)) baseData[key] = value;
      if (detailFields.includes(key)) detailData[key] = value;
    });

    return this.update(id, baseData, detailData);
  }

  private async getPrimerTypeName(id?: string): Promise<string> {
    if (!id) return 'Unknown';
    const result = await withDatabaseErrorHandling(
      () => supabase.from('primer_types').select('name').eq('id', id).single(),
      {
        operation: 'getPrimerTypeName',
        component: this.logPrefix,
        table: 'primer_types',
        action: 'select',
        recordId: id
      }
    );
    return result.success ? result.data?.name || 'Unknown' : 'Unknown';
  }
}

export const primersService = new PrimersService();
