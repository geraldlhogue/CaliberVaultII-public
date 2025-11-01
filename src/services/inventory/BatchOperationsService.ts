/**
 * Batch Operations Service
 * Handles bulk create, update, and delete operations
 */

import { 
  firearmsService, 
  ammunitionService,
  opticsService,
  magazinesService,
  accessoriesService,
  suppressorsService,
  reloadingService,
  casesService,
  primersService,
  powderService
} from '../category';
import { ItemCategory } from '@/types/inventory';

interface BatchResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{ index: number; error: string; item?: any }>;
  items?: any[];
}

export class BatchOperationsService {
  /**
   * Bulk create items
   */
  async bulkCreate(category: ItemCategory, items: any[], userId: string): Promise<BatchResult> {
    const result: BatchResult = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [],
      items: []
    };

    const service = this.getService(category);

    for (let i = 0; i < items.length; i++) {
      try {
        const created = await service.create(items[i], userId);
        result.items!.push(created);
        result.successCount++;
      } catch (error: any) {
        result.failureCount++;
        result.errors.push({
          index: i,
          error: error.message,
          item: items[i]
        });
      }
    }

    result.success = result.failureCount === 0;
    return result;
  }

  /**
   * Bulk update items
   */
  async bulkUpdate(
    category: ItemCategory, 
    updates: Array<{ id: string; data: any }>, 
    userId: string
  ): Promise<BatchResult> {
    const result: BatchResult = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [],
      items: []
    };

    const service = this.getService(category);

    for (let i = 0; i < updates.length; i++) {
      try {
        const updated = await service.update(updates[i].id, updates[i].data, userId);
        result.items!.push(updated);
        result.successCount++;
      } catch (error: any) {
        result.failureCount++;
        result.errors.push({
          index: i,
          error: error.message,
          item: updates[i]
        });
      }
    }

    result.success = result.failureCount === 0;
    return result;
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(category: ItemCategory, ids: string[], userId: string): Promise<BatchResult> {
    const result: BatchResult = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: []
    };

    const service = this.getService(category);

    for (let i = 0; i < ids.length; i++) {
      try {
        await service.delete(ids[i], userId);
        result.successCount++;
      } catch (error: any) {
        result.failureCount++;
        result.errors.push({
          index: i,
          error: error.message,
          item: { id: ids[i] }
        });
      }
    }

    result.success = result.failureCount === 0;
    return result;
  }

  /**
   * Bulk update single field across multiple items
   */
  async bulkUpdateField(
    category: ItemCategory,
    ids: string[],
    field: string,
    value: any,
    userId: string
  ): Promise<BatchResult> {
    const updates = ids.map(id => ({
      id,
      data: { [field]: value }
    }));

    return this.bulkUpdate(category, updates, userId);
  }

  /**
   * Move items to different storage location
   */
  async bulkMoveToLocation(
    category: ItemCategory,
    ids: string[],
    locationId: string,
    userId: string
  ): Promise<BatchResult> {
    return this.bulkUpdateField(category, ids, 'storage_location_id', locationId, userId);
  }

  /**
   * Bulk duplicate items
   */
  async bulkDuplicate(
    category: ItemCategory,
    ids: string[],
    userId: string
  ): Promise<BatchResult> {
    const result: BatchResult = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [],
      items: []
    };

    const service = this.getService(category);

    for (let i = 0; i < ids.length; i++) {
      try {
        const original = await service.getById(ids[i], userId);
        const { id, created_at, updated_at, ...duplicateData } = original;
        
        const duplicate = await service.create({
          ...duplicateData,
          name: `${duplicateData.name} (Copy)`
        }, userId);
        
        result.items!.push(duplicate);
        result.successCount++;
      } catch (error: any) {
        result.failureCount++;
        result.errors.push({
          index: i,
          error: error.message,
          item: { id: ids[i] }
        });
      }
    }

    result.success = result.failureCount === 0;
    return result;
  }

  // Helper methods
  private getService(category: ItemCategory) {
    const services: Record<ItemCategory, any> = {
      firearms: firearmsService,
      ammunition: ammunitionService,
      optics: opticsService,
      magazines: magazinesService,
      accessories: accessoriesService,
      suppressors: suppressorsService,
      reloading: reloadingService,
      cases: casesService,
      primers: primersService,
      powder: powderService,
      other: firearmsService
    };
    
    return services[category] || firearmsService;
  }
}

export const batchOperationsService = new BatchOperationsService();
