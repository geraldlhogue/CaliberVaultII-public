import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SyncTask {
  id: string;
  type: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  timestamp: number;
  data: any;
}

export function BackgroundSyncManager() {
  const [tasks, setTasks] = useState<SyncTask[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const allTasks = await store.getAll();
    setTasks(allTasks);
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      if ('serviceWorker' in navigator && 'sync' in (navigator.serviceWorker as any)) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-inventory');
        toast.success('Background sync started');
      } else {
        await manualSync();
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const manualSync = async () => {
    // Manual sync implementation
    for (const task of tasks.filter(t => t.status === 'pending')) {
      try {
        // Process task
        task.status = 'completed';
      } catch (error) {
        task.status = 'failed';
      }
    }
    await loadPendingTasks();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Background Sync
          </span>
          <Badge variant={tasks.some(t => t.status === 'pending') ? 'destructive' : 'default'}>
            {tasks.filter(t => t.status === 'pending').length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={syncNow} disabled={syncing} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
        <div className="space-y-2">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{task.type}</span>
              {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {task.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {task.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('CaliberVault', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
