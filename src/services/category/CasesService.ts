import { BaseCategoryServiceEnhanced } from '../base/BaseCategoryServiceEnhanced';
import { supabase } from '@/lib/supabase';
import { withDatabaseErrorHandling } from '@/lib/databaseErrorHandler';
import { BaseInventoryItem, CaseDetails } from '@/types/inventory';

export class CasesService extends BaseCategoryServiceEnhanced<CaseDetails> {
  constructor() {
    super('case_details', 'cases');
  }

  async createCase(data: Partial<BaseInventoryItem & CaseDetails>): Promise<any> {
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

    const detailData: Partial<CaseDetails> = {
      manufacturer_id: data.manufacturer_id,
      model: data.model,
      case_type: data.case_type,
      material: data.material,
      capacity: data.capacity,
    };

    return this.create(baseData, detailData);
  }

  async updateCase(id: string, data: Partial<BaseInventoryItem & CaseDetails>): Promise<any> {
    const baseData: Partial<BaseInventoryItem> = {};
    const detailData: Partial<CaseDetails> = {};

    const baseFields = ['name', 'quantity', 'purchase_date', 'purchase_price', 'current_value', 'storage_location_id', 'notes', 'image_url'];
    const detailFields = ['manufacturer_id', 'model', 'case_type', 'material', 'capacity'];

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

export const casesService = new CasesService();
