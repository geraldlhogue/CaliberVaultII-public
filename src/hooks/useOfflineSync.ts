// Hook for offline-first data operations with automatic sync
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { offlineQueue } from '@/lib/enhancedOfflineQueue';
import { syncService } from '@/services/sync/SyncService';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queuedChanges, setQueuedChanges] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast({ title: 'Back online', description: 'Syncing pending changes...' });
      
      if (user) {
        setIsSyncing(true);
        const result = await syncService.processQueue(user.id);
        setIsSyncing(false);
        
        if (result.success > 0) {
          toast({ 
            title: 'Sync complete', 
            description: `${result.success} changes synced successfully` 
          });
        }
        
        if (result.failed > 0) {
          toast({ 
            title: 'Sync issues', 
            description: `${result.failed} changes failed to sync`,
            variant: 'destructive'
          });
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({ 
        title: 'Offline mode', 
        description: 'Changes will sync when back online',
        variant: 'default'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-sync on mount if online
    if (isOnline && user) {
      syncService.processQueue(user.id);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, toast]);

  const queueOperation = async (
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    const opId = await offlineQueue.enqueue({ type, table, data });
    setQueuedChanges(prev => [...prev, { type, table, data, opId }]);
    
    if (isOnline && user) {
      // Try to sync immediately if online
      syncService.processQueue(user.id);
    }
    
    return opId;
  };

  const syncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    const result = await syncService.processQueue(user.id);
    setIsSyncing(false);
    setQueuedChanges([]);
    return result;
  };

  return {
    isOnline,
    isSyncing,
    queuedChanges,
    queueOperation,
    syncNow,
  };
}

export default useOfflineSync;

