// Sync service with background sync and conflict resolution
import { supabase } from '@/lib/supabase';
import { offlineQueue, QueueOperation } from '@/lib/enhancedOfflineQueue';
import { conflictResolver, DataConflict } from './ConflictResolver';

export class SyncService {
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  async processQueue(userId: string): Promise<SyncResult> {
    if (offlineQueue.isProcessing()) {
      console.log('[SyncService] Sync already in progress');
      return { success: 0, failed: 0, conflicts: 0 };
    }

    offlineQueue.setProcessing(true);
    this.notifyListeners({ status: 'syncing', progress: 0 });

    const pending = await offlineQueue.getPending();
    const results = { success: 0, failed: 0, conflicts: 0 };

    for (let i = 0; i < pending.length; i++) {
      const op = pending[i];
      
      if (!offlineQueue.shouldRetry(op)) {
        console.log('[SyncService] Skipping operation (backoff):', op.id);
        continue;
      }

      try {
        await this.processOperation(op, userId);
        await offlineQueue.markCompleted(op.id);
        results.success++;
      } catch (error: any) {
        console.error('[SyncService] Operation failed:', op.id, error);
        
        await offlineQueue.update(op.id, {
          retries: op.retries + 1,
          lastAttempt: Date.now(),
          error: error.message,
        });

        if (op.retries + 1 >= 5) {
          await offlineQueue.markFailed(op.id, error.message);
          results.failed++;
        }
      }

      this.notifyListeners({ 
        status: 'syncing', 
        progress: ((i + 1) / pending.length) * 100 
      });
    }

    offlineQueue.setProcessing(false);
    this.notifyListeners({ status: 'idle', progress: 100 });

    console.log('[SyncService] Sync complete:', results);
    return results;
  }

  private async processOperation(op: QueueOperation, userId: string) {
    const { type, table, data } = op;

    switch (type) {
      case 'create':
        await supabase.from(table).insert({ ...data, user_id: userId });
        break;
      case 'update':
        await supabase.from(table).update(data).eq('id', data.id).eq('user_id', userId);
        break;
      case 'delete':
        await supabase.from(table).delete().eq('id', data.id).eq('user_id', userId);
        break;
    }
  }

  subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach(cb => cb(status));
  }
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  progress: number;
}

export interface SyncResult {
  success: number;
  failed: number;
  conflicts: number;
}

export const syncService = new SyncService();
