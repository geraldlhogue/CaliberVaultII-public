import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { offlineQueue, QueueOperation } from '@/lib/enhancedOfflineQueue';
import { syncService, SyncStatus } from '@/services/sync/SyncService';
import { useAuth } from '@/components/auth/AuthProvider';

export function SyncStatusDashboard() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<QueueOperation[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle', progress: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadOperations();
    const unsubscribe = syncService.subscribe(setSyncStatus);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOperations = async () => {
    const ops = await offlineQueue.getAll();
    setOperations(ops);
  };

  const handleSync = async () => {
    if (!user) return;
    await syncService.processQueue(user.id);
    await loadOperations();
  };

  const handleClear = async () => {
    await offlineQueue.clear();
    await loadOperations();
  };

  const pending = operations.filter(op => op.status === 'pending').length;
  const failed = operations.filter(op => op.status === 'failed').length;
  const completed = operations.filter(op => op.status === 'completed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sync Status</span>
          {isOnline ? (
            <Badge variant="outline" className="gap-1">
              <Wifi className="h-3 w-3" /> Online
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" /> Offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus.status === 'syncing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Syncing...</span>
              <span>{Math.round(syncStatus.progress)}%</span>
            </div>
            <Progress value={syncStatus.progress} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{pending}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{completed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{failed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={!isOnline || syncStatus.status === 'syncing'} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
