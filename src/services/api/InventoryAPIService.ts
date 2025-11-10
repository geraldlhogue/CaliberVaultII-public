/**
 * Inventory API Service
 * REST API layer for inventory operations
 */

import { ItemCategory } from '@/types/inventory';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export class InventoryAPIService {
  /**
   * GET /api/inventory/:category
   */
  async list(category: ItemCategory, userId: string, params?: ListParams): Promise<APIResponse> {
    try {
      const service = await this.getService(category);
      const items = await service.list(userId);
      
      // Apply pagination and sorting
      let result = items;
      
      if (params?.search) {
        result = this.filterBySearch(result, params.search);
      }
      
      if (params?.sort) {
        result = this.sortItems(result, params.sort, params.order);
      }
      
      if (params?.page && params?.limit) {
        result = this.paginate(result, params.page, params.limit);
      }
      
      return {
        success: true,
        data: result,
        message: `Retrieved ${result.length} items`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * GET /api/inventory/:category/:id
   */
  async getById(category: ItemCategory, id: string, userId: string): Promise<APIResponse> {
    try {
      const service = await this.getService(category);
      const item = await service.getById(id, userId);
      
      return {
        success: true,
        data: item
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * POST /api/inventory/:category
   */
  async create(category: ItemCategory, data: any, userId: string): Promise<APIResponse> {
    try {
      const service = await this.getService(category);
      const item = await service.create(data, userId);
      
      return {
        success: true,
        data: item,
        message: 'Item created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * PUT /api/inventory/:category/:id
   */
  async update(category: ItemCategory, id: string, data: any, userId: string): Promise<APIResponse> {
    try {
      const service = await this.getService(category);
      const item = await service.update(id, data, userId);
      
      return {
        success: true,
        data: item,
        message: 'Item updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * DELETE /api/inventory/:category/:id
   */
  async delete(category: ItemCategory, id: string, userId: string): Promise<APIResponse> {
    try {
      const service = await this.getService(category);
      await service.delete(id, userId);
      
      return {
        success: true,
        message: 'Item deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods
  private async getService(category: ItemCategory) {
    const categoryModule = await import('../category');
    
    const services: Record<ItemCategory, any> = {
      firearms: categoryModule.firearmsService,
      ammunition: categoryModule.ammunitionService,
      optics: categoryModule.opticsService,
      magazines: categoryModule.magazinesService,
      accessories: categoryModule.accessoriesService,
      suppressors: categoryModule.suppressorsService,
      reloading: categoryModule.reloadingService,
      cases: categoryModule.casesService,
      primers: categoryModule.primersService,
      powder: categoryModule.powderService,
      other: categoryModule.firearmsService
    };
    
    return services[category] || categoryModule.firearmsService;
  }

  private filterBySearch(items: any[], search: string): any[] {
    const lowerSearch = search.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(lowerSearch) ||
      item.model?.toLowerCase().includes(lowerSearch) ||
      item.manufacturer?.toLowerCase().includes(lowerSearch)
    );
  }

  private sortItems(items: any[], field: string, order: 'asc' | 'desc' = 'asc'): any[] {
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private paginate(items: any[], page: number, limit: number): any[] {
    const start = (page - 1) * limit;
    const end = start + limit;
    return items.slice(start, end);
  }
}

export const inventoryAPIService = new InventoryAPIService();
