/**
 * Modal Integration Service
 * Bridges modal components with category services
 */

import { ItemCategory } from '@/types/inventory';

export class ModalIntegrationService {
  /**
   * Save item from modal form data
   */
  async saveItem(formData: any, userId: string): Promise<any> {
    const categoryModule = await import('../category');
    const category = formData.category as ItemCategory;
    
    // Route to appropriate service
    switch (category) {
      case 'firearms':
        return categoryModule.firearmsService.create(this.mapFormToFirearm(formData), userId);
      case 'ammunition':
        return categoryModule.ammunitionService.create(this.mapFormToAmmunition(formData), userId);
      case 'optics':
        return categoryModule.opticsService.create(this.mapFormToOptics(formData), userId);
      case 'magazines':
        return categoryModule.magazinesService.create(this.mapFormToMagazine(formData), userId);
      case 'accessories':
        return categoryModule.accessoriesService.create(this.mapFormToAccessory(formData), userId);
      case 'suppressors':
        return categoryModule.suppressorsService.create(this.mapFormToSuppressor(formData), userId);
      case 'reloading':
        return categoryModule.reloadingService.create(this.mapFormToReloading(formData), userId);
      case 'cases':
        return categoryModule.casesService.create(this.mapFormToCase(formData), userId);
      case 'primers':
        return categoryModule.primersService.create(this.mapFormToPrimer(formData), userId);
      case 'powder':
        return categoryModule.powderService.create(this.mapFormToPowder(formData), userId);
      default:
        throw new Error(`Unsupported category: ${category}`);
    }
  }

  /**
   * Update item from modal form data
   */
  async updateItem(id: string, formData: any, userId: string): Promise<any> {
    const categoryModule = await import('../category');
    const category = formData.category as ItemCategory;
    
    switch (category) {
      case 'firearms':
        return categoryModule.firearmsService.update(id, this.mapFormToFirearm(formData), userId);
      case 'ammunition':
        return categoryModule.ammunitionService.update(id, this.mapFormToAmmunition(formData), userId);
      case 'optics':
        return categoryModule.opticsService.update(id, this.mapFormToOptics(formData), userId);
      case 'magazines':
        return categoryModule.magazinesService.update(id, this.mapFormToMagazine(formData), userId);
      case 'accessories':
        return categoryModule.accessoriesService.update(id, this.mapFormToAccessory(formData), userId);
      case 'suppressors':
        return categoryModule.suppressorsService.update(id, this.mapFormToSuppressor(formData), userId);
      case 'reloading':
        return categoryModule.reloadingService.update(id, this.mapFormToReloading(formData), userId);
      case 'cases':
        return categoryModule.casesService.update(id, this.mapFormToCase(formData), userId);
      case 'primers':
        return categoryModule.primersService.update(id, this.mapFormToPrimer(formData), userId);
      case 'powder':
        return categoryModule.powderService.update(id, this.mapFormToPowder(formData), userId);
      default:
        throw new Error(`Unsupported category: ${category}`);
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
