// Offline-First Hook with Full CRUD
import { useState, useEffect } from 'react';
import { offlineDB } from '@/lib/offlineFirstDB';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export function useOfflineFirst<T>(table: string, category?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOnline(true);
      syncWithServer();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [table, category]);

  const loadData = async () => {
    try {
      // Try offline first
      const offlineData = await offlineDB.readAll(category);
      setData(offlineData as T[]);
      setLoading(false);

      // Then sync with server if online
      if (navigator.onLine) {
        await syncWithServer();
      }
    } catch (error) {
      console.error('Load error:', error);
      setLoading(false);
    }
  };

  const syncWithServer = async () => {
    if (!user) return;

    try {
      let query = supabase.from(table).select('*').eq('user_id', user.id);
      if (category) query = query.eq('category', category);

      const { data: serverData, error } = await query;
      if (error) throw error;

      setData(serverData as T[]);
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const create = async (item: Partial<T>) => {
    try {
      const newItem = await offlineDB.create({ ...item, user_id: user?.id });
      setData(prev => [...prev, newItem as T]);
      
      if (isOnline) {
        await syncWithServer();
      } else {
        toast({ title: 'Saved offline', description: 'Will sync when online' });
      }
      
      return newItem;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const updated = await offlineDB.update(id, updates);
      setData(prev => prev.map(item => (item as any).id === id ? updated : item));
      
      if (isOnline) {
        await syncWithServer();
      }
      
      return updated;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await offlineDB.delete(id);
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      if (isOnline) {
        await syncWithServer();
      }
      
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      throw error;
    }
  };

  return {
    data,
    loading,
    isOnline,
    create,
    update,
    remove,
    refresh: loadData,
  };
}
