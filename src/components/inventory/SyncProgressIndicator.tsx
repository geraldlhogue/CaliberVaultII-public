import { useEffect, useState } from 'react';
import { syncQueue, SyncOperation } from '@/lib/syncQueue';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export function SyncProgressIndicator() {
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadOperations();
    const interval = setInterval(loadOperations, 2000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOperations = async () => {
    const ops = await syncQueue.getAllOperations();
    setOperations(ops.filter(op => op.status !== 'completed'));
  };

  const triggerSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-inventory');
    }
  };

  const pending = operations.filter(op => op.status === 'pending').length;
  const syncing = operations.filter(op => op.status === 'syncing').length;
  const failed = operations.filter(op => op.status === 'failed').length;
  const total = operations.length;
  const progress = total > 0 ? ((total - pending - failed) / total) * 100 : 100;

  if (total === 0 && isOnline) return null;

  return (
    <Card className="p-4 mb-4 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Cloud className="h-5 w-5 text-green-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-400" />
          )}
          <span className="font-semibold">
            {isOnline ? 'Sync Status' : 'Offline Mode'}
          </span>
        </div>
        {isOnline && total > 0 && (
          <Button size="sm" variant="outline" onClick={triggerSync}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        )}
      </div>

      {total > 0 && (
        <>
          <Progress value={progress} className="mb-3" />
          <div className="flex gap-2 flex-wrap">
            {pending > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {pending} Pending
              </Badge>
            )}
            {syncing > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {syncing} Syncing
              </Badge>
            )}
            {failed > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {failed} Failed
              </Badge>
            )}
            {total > 0 && pending === 0 && syncing === 0 && failed === 0 && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                All Synced
              </Badge>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
