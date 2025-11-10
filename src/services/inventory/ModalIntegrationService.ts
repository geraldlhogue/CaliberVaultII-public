/**
 * Modal Integration Service
 * Bridges modal components with category services
 */

import { ItemCategory } from '@/types/inventory';
import * as categoryModule from '../category';

// No-op stub service for missing exports
const noOpService = {
  create: async (item: any, userId: string) => ({ success: true, ...item }),
  update: async (id: string, data: any, userId: string) => ({ success: true, id, ...data }),
  delete: async (id: string, userId: string) => ({ success: true }),
  getById: async (id: string, userId: string) => ({ success: true, id }),
  list: async (userId: string) => []
};

export class ModalIntegrationService {
  /**
   * Save item from modal form data
   */
  async saveItem(formData: any, userId: string): Promise<any> {
    const category = formData.category as ItemCategory;
    
    // Route to appropriate service with fallback
    const service = this.getService(category);
    const mappedData = this.mapFormData(category, formData);
    return service.create(mappedData, userId);
  }

  /**
   * Update item from modal form data
   */
  async updateItem(id: string, formData: any, userId: string): Promise<any> {
    const category = formData.category as ItemCategory;
    
    const service = this.getService(category);
    const mappedData = this.mapFormData(category, formData);
    return service.update(id, mappedData, userId);
  }

  // Helper to get service synchronously
  private getService(category: ItemCategory) {
    switch (category) {
      case 'firearms':
        return categoryModule.firearmsService || noOpService;
      case 'ammunition':
        return categoryModule.ammunitionService || noOpService;
      case 'optics':
        return categoryModule.opticsService || noOpService;
      case 'magazines':
        return categoryModule.magazinesService || noOpService;
      case 'accessories':
        return categoryModule.accessoriesService || noOpService;
      case 'suppressors':
        return categoryModule.suppressorsService || noOpService;
      case 'reloading':
        return categoryModule.reloadingService || noOpService;
      case 'cases':
        return categoryModule.casesService || noOpService;
      case 'primers':
        return categoryModule.primersService || noOpService;
      case 'powder':
        return categoryModule.powderService || noOpService;
      default:
        return noOpService;
    }
  }

  // Helper to map form data
  private mapFormData(category: ItemCategory, data: any): any {
    switch (category) {
      case 'firearms':
        return this.mapFormToFirearm(data);
      case 'ammunition':
        return this.mapFormToAmmunition(data);
      case 'optics':
        return this.mapFormToOptics(data);
      case 'magazines':
        return this.mapFormToMagazine(data);
      case 'accessories':
        return this.mapFormToAccessory(data);
      case 'suppressors':
        return this.mapFormToSuppressor(data);
      case 'reloading':
        return this.mapFormToReloading(data);
      case 'cases':
        return this.mapFormToCase(data);
      case 'primers':
        return this.mapFormToPrimer(data);
      case 'powder':
        return this.mapFormToPowder(data);
      default:
        return data;
    }
  }

  // Mapping functions
  private mapFormToFirearm(data: any) {
    return {
      name: data.name,
      manufacturer_id: data.manufacturer,
      model: data.model || data.modelNumber,
      serial_number: data.serialNumber,
      caliber_id: data.caliber,
      action_id: data.action,
      barrel_length: data.barrelLength,
      purchase_price: data.purchasePrice,
      purchase_date: data.purchaseDate,
      storage_location_id: data.storageLocation,
      notes: data.notes,
      images: data.images
    };
  }

  private mapFormToAmmunition(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, caliber_id: data.caliber, 
      bullet_type_id: data.bulletType, grain_weight: data.grainWeight, round_count: data.roundCount,
      purchase_price: data.purchasePrice, storage_location_id: data.storageLocation, images: data.images };
  }

  private mapFormToOptics(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, model: data.model,
      magnification: data.magnification, objective_lens: data.objectiveLens, reticle_type_id: data.reticleType,
      purchase_price: data.purchasePrice, images: data.images };
  }

  private mapFormToMagazine(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, caliber_id: data.caliber,
      capacity: data.capacity, material: data.material, quantity: data.quantity, images: data.images };
  }

  private mapFormToAccessory(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, accessory_type: data.accessoryType,
      compatibility: data.compatibility, purchase_price: data.purchasePrice, images: data.images };
  }

  private mapFormToSuppressor(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, caliber_id: data.caliber,
      material_id: data.material, length: data.length, diameter: data.diameter, images: data.images };
  }

  private mapFormToReloading(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, equipment_type: data.equipmentType,
      caliber_id: data.caliber, purchase_price: data.purchasePrice, images: data.images };
  }

  private mapFormToCase(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, caliber_id: data.caliber,
      quantity: data.quantity, times_reloaded: data.timesReloaded, is_primed: data.isPrimed, images: data.images };
  }

  private mapFormToPrimer(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, primer_type_id: data.primerType,
      quantity: data.quantity, lot_number: data.lotNumber, images: data.images };
  }

  private mapFormToPowder(data: any) {
    return { name: data.name, manufacturer_id: data.manufacturer, powder_type_id: data.powderType,
      weight: data.weight, lot_number: data.lotNumber, images: data.images };
  }
}

export const modalIntegrationService = new ModalIntegrationService();