// Background Sync Service
import { offlineDB } from '@/lib/offlineFirstDB';
import { supabase } from '@/lib/supabase';

class BackgroundSyncService {
  private syncInterval: number = 15 * 60 * 1000;
  private intervalId: NodeJS.Timeout | null = null;

  private isCapacitorAvailable() {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  async startBackgroundSync(userId: string) {
    if (!this.isCapacitorAvailable()) {
      this.startWebSync(userId);
      return;
    }

    this.intervalId = setInterval(() => {
      this.performSync(userId);
    }, this.syncInterval);

    await this.performSync(userId);
  }

  private async performSync(userId: string) {
    if (!navigator.onLine) return;

    if (this.isCapacitorAvailable()) {
      try {
        const { BackgroundTask } = await import('@capacitor/background-task');
        const taskId = await BackgroundTask.beforeExit(async () => {
          try {
            await this.syncQueuedOperations(userId);
            await this.syncInventoryData(userId);
            BackgroundTask.finish({ taskId });
          } catch (error) {
            console.error('Background sync failed:', error);
            BackgroundTask.finish({ taskId });
          }
        });
      } catch {
        await this.syncQueuedOperations(userId);
        await this.syncInventoryData(userId);
      }
    } else {
      await this.syncQueuedOperations(userId);
      await this.syncInventoryData(userId);
    }
  }

  private async syncQueuedOperations(userId: string) {
    const queue = await offlineDB.getQueue();
    
    for (const item of queue) {
      try {
        const { type, table, data } = item;
        
        switch (type) {
          case 'create':
            await supabase.from(table).insert(data);
            break;
          case 'update':
            await supabase.from(table).update(data).eq('id', data.id);
            break;
          case 'delete':
            await supabase.from(table).delete().eq('id', data.id);
            break;
        }
        
        await offlineDB.clearQueueItem(item.id);
      } catch (error) {
        console.error(`Failed to sync ${item.type} operation:`, error);
      }
    }
  }

  private async syncInventoryData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      for (const item of data || []) {
        await offlineDB.update(item.id, item);
      }

      await offlineDB.updateLastSync();
    } catch (error) {
      console.error('Failed to sync inventory data:', error);
    }
  }

  private startWebSync(userId: string) {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-inventory');
      });
    }
  }

  stopBackgroundSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
