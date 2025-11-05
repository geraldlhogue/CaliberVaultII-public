// Offline Indicator Component
import { useEffect, useState } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { offlineDB } from '@/lib/offlineFirstDB';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queue count
    const updateQueue = async () => {
      const queue = await offlineDB.getQueue();
      setQueueCount(queue.length);
    };

    updateQueue();
    const interval = setInterval(updateQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && queueCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isOnline ? 'default' : 'destructive'}
        className="flex items-center gap-2 px-3 py-2"
      >
        {isOnline ? (
          <>
            <Cloud className="h-4 w-4" />
            Syncing {queueCount} changes
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            Offline - {queueCount} pending
          </>
        )}
      </Badge>
    </div>
  );
}
