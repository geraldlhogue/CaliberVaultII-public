import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { 
  Cloud, CloudOff, RefreshCw, Upload, Download, 
  CheckCircle, AlertCircle, Wifi, WifiOff 
} from 'lucide-react';

interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: number;
  syncInProgress: boolean;
  syncProgress: number;
}

export function OfflineDataSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: localStorage.getItem('lastSyncTime'),
    pendingChanges: 0,
    syncInProgress: false,
    syncProgress: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { syncQueue, processSyncQueue, clearSyncQueue } = useOfflineSync();

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Auto-sync when coming back online
      if (syncQueue.length > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending changes
    const checkPendingChanges = () => {
      setSyncStatus(prev => ({ ...prev, pendingChanges: syncQueue.length }));
    };

    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncQueue]);

  const handleSync = async () => {
    if (!syncStatus.isOnline) {
      setError('Cannot sync while offline');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, syncProgress: 0 }));
    setError(null);
    setSuccess(null);

    try {
      const totalItems = syncQueue.length;
      let processed = 0;

      // Process sync queue
      for (const item of syncQueue) {
        await processSyncQueue();
        processed++;
        setSyncStatus(prev => ({ 
          ...prev, 
          syncProgress: (processed / totalItems) * 100 
        }));
      }

      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: now,
        pendingChanges: 0,
        syncInProgress: false,
        syncProgress: 100
      }));

      setSuccess(`Successfully synced ${totalItems} changes`);
    } catch (err: any) {
      setError(`Sync failed: ${err.message}`);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      setError('Cannot sync while offline');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
    setError(null);
    setSuccess(null);

    try {
      // Force download all data from server
      const tables = ['firearms', 'optics', 'bullets', 'suppressors'];
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        
        // Store in local cache
        localStorage.setItem(`cache_${table}`, JSON.stringify(data));
      }

      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: now,
        syncInProgress: false
      }));

      setSuccess('Force sync completed successfully');
    } catch (err: any) {
      setError(`Force sync failed: ${err.message}`);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const clearOfflineData = () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      clearSyncQueue();
      localStorage.removeItem('lastSyncTime');
      
      // Clear cached data
      const tables = ['firearms', 'optics', 'bullets', 'suppressors'];
      tables.forEach(table => localStorage.removeItem(`cache_${table}`));
      
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: null,
        pendingChanges: 0 
      }));
      
      setSuccess('Offline data cleared successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Cloud className="w-5 h-5 text-green-500" />
            ) : (
              <CloudOff className="w-5 h-5 text-red-500" />
            )}
            Offline Data Sync
          </div>
          <Badge variant={syncStatus.isOnline ? 'default' : 'destructive'}>
            {syncStatus.isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connection Status:</span>
            <span className={syncStatus.isOnline ? 'text-green-500' : 'text-red-500'}>
              {syncStatus.isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Sync:</span>
            <span>
              {syncStatus.lastSync 
                ? new Date(syncStatus.lastSync).toLocaleString()
                : 'Never'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending Changes:</span>
            <span className={syncStatus.pendingChanges > 0 ? 'text-orange-500' : ''}>
              {syncStatus.pendingChanges}
            </span>
          </div>
        </div>

        {syncStatus.syncInProgress && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Syncing data...</p>
            <Progress value={syncStatus.syncProgress} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSync}
            disabled={!syncStatus.isOnline || syncStatus.syncInProgress || syncStatus.pendingChanges === 0}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Sync Pending Changes ({syncStatus.pendingChanges})
          </Button>

          <Button
            onClick={handleForceSync}
            disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Force Download All Data
          </Button>

          <Button
            onClick={clearOfflineData}
            disabled={syncStatus.syncInProgress}
            variant="destructive"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Offline Data
          </Button>
        </div>

        {!syncStatus.isOnline && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Changes will be saved locally and synced when you reconnect.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}