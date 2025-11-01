import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  pendingChanges: number;
  syncErrors: string[];
}

export function RealtimeSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: localStorage.getItem('lastSyncTime'),
    pendingChanges: 0,
    syncErrors: []
  });
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      performSync();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: 'Connection Lost',
        description: 'Working in offline mode. Changes will sync when reconnected.',
        variant: 'destructive'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (user) {
      setupRealtimeSubscriptions();
      checkPendingChanges();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupSubscriptions();
    };
  }, [user]);

  const setupRealtimeSubscriptions = async () => {
    if (!user) return;

    const tables = ['inventory_items', 'locations', 'audit_logs'];
    const channels: string[] = [];

    for (const table of tables) {
      const channel = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          handleRealtimeChange(table, payload);
        })
        .subscribe();

      channels.push(`${table}_changes`);
    }

    setSubscriptions(channels);
  };

  const cleanupSubscriptions = () => {
    subscriptions.forEach(channel => {
      supabase.removeChannel(supabase.channel(channel));
    });
  };

  const handleRealtimeChange = (table: string, payload: any) => {
    const action = payload.eventType;
    toast({
      title: 'Real-time Update',
      description: `${action} on ${table}`,
      duration: 2000
    });

    // Update last sync time
    const now = new Date().toISOString();
    localStorage.setItem('lastSyncTime', now);
    setStatus(prev => ({ ...prev, lastSync: now }));
  };

  const checkPendingChanges = async () => {
    try {
      const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
      setStatus(prev => ({ ...prev, pendingChanges: queue.length }));
    } catch (error) {
      console.error('Error checking pending changes:', error);
    }
  };

  const performSync = async () => {
    if (!user || !status.isOnline || status.isSyncing) return;

    setStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      // Process sync queue
      const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
      const errors: string[] = [];

      for (const operation of queue) {
        try {
          await processSyncOperation(operation);
        } catch (error: any) {
          errors.push(`Failed to sync ${operation.type} for ${operation.itemId}: ${error.message}`);
        }
      }

      // Clear successful operations
      if (errors.length === 0) {
        localStorage.setItem('syncQueue', '[]');
        setStatus(prev => ({ ...prev, pendingChanges: 0 }));
      } else {
        setStatus(prev => ({ ...prev, syncErrors: errors }));
      }

      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      setStatus(prev => ({ ...prev, lastSync: now }));

      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${queue.length - errors.length} operations`,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Unable to complete sync. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const processSyncOperation = async (operation: any) => {
    const { type, itemId, data } = operation;

    switch (type) {
      case 'add':
        await supabase.from('inventory_items').insert({ ...data, user_id: user?.id });
        break;
      case 'update':
        await supabase.from('inventory_items').update(data).eq('id', itemId);
        break;
      case 'delete':
        await supabase.from('inventory_items').delete().eq('id', itemId);
        break;
    }
  };

  const forceSync = () => {
    if (status.isOnline) {
      performSync();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Real-time Sync Status
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={forceSync}
            disabled={!status.isOnline || status.isSyncing}
          >
            {status.isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync Now
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status</span>
          <Badge variant={status.isOnline ? 'default' : 'destructive'}>
            {status.isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sync Status</span>
          <Badge variant={status.isSyncing ? 'secondary' : 'outline'}>
            {status.isSyncing ? 'Syncing...' : 'Idle'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Subscriptions</span>
          <Badge>{subscriptions.length} tables</Badge>
        </div>

        {status.pendingChanges > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {status.pendingChanges} changes pending sync
            </AlertDescription>
          </Alert>
        )}

        {status.lastSync && (
          <div className="text-xs text-muted-foreground">
            Last synced: {new Date(status.lastSync).toLocaleString()}
          </div>
        )}

        {status.syncErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {status.syncErrors.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status.isSyncing && (
          <Progress value={66} className="w-full" />
        )}
      </CardContent>
    </Card>
  );
}