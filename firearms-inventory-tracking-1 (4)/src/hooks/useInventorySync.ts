import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types/inventory';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { indexedDB } from '@/lib/indexedDB';
import { syncQueue } from '@/lib/syncQueue';
import { photoStorage } from '@/lib/photoStorage';
import { inventoryService } from '@/services/inventory.service';


export function useInventorySync() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast({ title: 'Online', description: 'Connection restored. Syncing data...' });
      await syncWithCloud();
      await syncUnsyncedPhotos();
      await triggerBackgroundSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: 'Offline', description: 'Working offline. Changes will sync when online.' });
    };

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        toast({ title: 'Sync Complete', description: `${event.data.count} operations synced` });
        fetchItems();
      } else if (event.data?.type === 'PHOTO_SYNC_COMPLETE') {
        toast({ title: 'Photos Synced', description: `${event.data.count} photos uploaded` });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleSyncMessage);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleSyncMessage);
    };
  }, [user]);

  const syncUnsyncedPhotos = async () => {
    if (!user || !isOnline) return;
    const unsyncedPhotos = await photoStorage.getUnsyncedPhotos();
    
    for (const photo of unsyncedPhotos) {
      try {
        const blob = await fetch(photo.dataUrl).then(r => r.blob());
        const fileName = `${photo.itemId}/${photo.id}.jpg`;
        const { data, error } = await supabase.storage.from('firearm-images').upload(fileName, blob);
        
        if (!error && data) {
          const { data: urlData } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
          photo.cloudUrl = urlData.publicUrl;
          photo.synced = true;
          await photoStorage.updatePhoto(photo);
        }
      } catch (error) {
        console.error('Photo sync error:', error);
      }
    }
  };



  useEffect(() => {
    fetchItems();
    if (user && isOnline) {
      const subscription = supabase
        .channel('inventory_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items', filter: `user_id=eq.${user.id}` }, handleRealtimeUpdate)
        .subscribe();
      return () => { subscription.unsubscribe(); };
    }
  }, [user, isOnline]);
  const dbItemToInventoryItem = (dbItem: any): InventoryItem => ({
    id: dbItem.id,
    name: dbItem.name || '',
    category: dbItem.category || 'firearms',
    firearmType: dbItem.firearm_type || '',
    caliber: dbItem.caliber || '',
    ammoType: dbItem.ammo_type || '',
    manufacturer: dbItem.manufacturer || '',
    model: dbItem.model || '',
    serialNumber: dbItem.serial_number || '',
    quantity: dbItem.quantity || 1,
    purchaseDate: dbItem.purchase_date || '',
    purchasePrice: dbItem.purchase_price || 0,
    currentValue: dbItem.current_value || 0,
    storageLocation: dbItem.location || '',
    condition: dbItem.condition || 'excellent',
    notes: dbItem.notes || '',
    images: dbItem.image_urls || [],
    modelNumber: dbItem.model_number || '',
    lotNumber: dbItem.lot_number || '',
    barrelLength: dbItem.barrel_length || '',
    action: dbItem.action || '',
    magnification: dbItem.magnification || '',
    objectiveLens: dbItem.objective_lens || '',
    reticleType: dbItem.reticle_type || '',
    capacity: dbItem.capacity || 0,
    grainWeight: dbItem.grain_weight || '',
    roundCount: dbItem.round_count || 0,
    componentType: dbItem.component_type || '',
    compatibility: dbItem.compatibility || '',
    description: dbItem.description || '',
    modelDescriptionId: dbItem.model_description_id || null,
    appraisals: [],
    lastModified: dbItem.last_modified || new Date().toISOString(),
    createdAt: dbItem.created_at || new Date().toISOString(),
    synced: dbItem.synced || false
  });

  const inventoryItemToDb = (item: any) => {
    const dbItem: any = {
      name: item.name,
      category: item.category,
      firearm_type: item.firearmType,
      caliber: item.caliber,
      ammo_type: item.ammoType,
      manufacturer: item.manufacturer,
      model: item.model,
      serial_number: item.serialNumber,
      quantity: item.quantity,
      purchase_date: item.purchaseDate,
      purchase_price: item.purchasePrice,
      current_value: item.currentValue,
      location: item.storageLocation,
      condition: item.condition,
      notes: item.notes,
      image_urls: item.images,
      model_number: item.modelNumber,
      lot_number: item.lotNumber,
      barrel_length: item.barrelLength,
      action: item.action,
      magnification: item.magnification,
      objective_lens: item.objectiveLens,
      reticle_type: item.reticleType,
      capacity: item.capacity,
      grain_weight: item.grainWeight,
      round_count: item.roundCount,
      component_type: item.componentType,
      compatibility: item.compatibility,
      description: item.description,
      model_description_id: item.modelDescriptionId,
      last_modified: item.lastModified || new Date().toISOString(),
      created_at: item.createdAt || new Date().toISOString(),
      synced: item.synced
    };
    
    // Remove undefined values
    Object.keys(dbItem).forEach(key => {
      if (dbItem[key] === undefined) {
        delete dbItem[key];
      }
    });
    
    return dbItem;
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-inventory');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  };

  const syncWithCloud = async () => {
    if (!user || !isOnline) return;
    setSyncing(true);
    const localItems = await indexedDB.getAllItems();
    const { data: cloudItems } = await supabase.from('inventory_items').select('*').eq('user_id', user.id);
    
    if (cloudItems) {
      for (const cloudItem of cloudItems) {
        await indexedDB.updateItem(dbItemToInventoryItem(cloudItem));
      }
    }
    setSyncing(false);
  };

  const fetchItems = async () => {
    setLoading(true);
    if (user && isOnline) {
      try {
        // Import the fetch service dynamically to avoid circular dependencies
        const { inventoryFetchService } = await import('@/services/inventory-fetch.service');
        const fetchedItems = await inventoryFetchService.fetchAllItems(user.id);
        setItems(fetchedItems);
        
        // Also cache locally
        for (const item of fetchedItems) {
          await indexedDB.updateItem(item);
        }
      } catch (error) {
        console.error('[useInventorySync] Fetch error:', error);
        // Fallback to local items
        const localItems = await indexedDB.getAllItems();
        setItems(localItems);
      }
    } else {
      const localItems = await indexedDB.getAllItems();
      setItems(localItems);
    }
    setLoading(false);
  };


  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newItem = dbItemToInventoryItem(payload.new);
      setItems((prev) => [...prev, newItem]);
      indexedDB.updateItem(newItem);
    } else if (payload.eventType === 'UPDATE') {
      const updatedItem = dbItemToInventoryItem(payload.new);
      setItems((prev) => prev.map((item) => (item.id === payload.new.id ? updatedItem : item)));
      indexedDB.updateItem(updatedItem);
    } else if (payload.eventType === 'DELETE') {
      setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
      indexedDB.deleteItem(payload.old.id);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    setSyncing(true);
    
    console.log('[useInventorySync] addItem called with:', item);
    
    // Relaxed validation - only check for manufacturer
    if (!item.manufacturer) {
      console.error('[useInventorySync] Missing manufacturer');
      toast({ title: 'Error', description: 'Manufacturer is required', variant: 'destructive' });
      setSyncing(false);
      return null;
    }

    const newItem: InventoryItem = { 
      ...item, 
      id: crypto.randomUUID(),
      images: item.images || [],
      appraisals: item.appraisals || [],
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
      name: item.name || `${item.manufacturer} ${item.model || 'Item'}`,
    };
    
    console.log('[useInventorySync] Created newItem:', newItem);
    
    await indexedDB.addItem(newItem);
    setItems((prev) => [...prev, newItem]);

    if (!isOnline) {
      await syncQueue.addOperation({ type: 'add', itemId: newItem.id, data: newItem });
      toast({ title: 'Saved Offline', description: 'Item will sync when online' });
      setSyncing(false);
      return newItem;
    }

    if (user && isOnline) {
      try {
        console.log('[useInventorySync] Saving to database via inventoryService');
        const savedData = await inventoryService.saveItem(newItem, user.id);
        console.log('[useInventorySync] Save successful:', savedData);
        toast({ title: 'Success', description: 'Item added successfully' });
        setSyncing(false);
        return savedData;
      } catch (error: any) {
        console.error('[useInventorySync] Save error:', error);
        await syncQueue.addOperation({ type: 'add', itemId: newItem.id, data: newItem });
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to save. Queued for sync.', 
          variant: 'destructive' 
        });
        setSyncing(false);
        return newItem;
      }
    }
    setSyncing(false);
    return newItem;
  };




  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    setSyncing(true);
    const updatedItem = items.find(i => i.id === id);
    if (updatedItem) {
      const merged = { ...updatedItem, ...updates };
      await indexedDB.updateItem(merged);
      setItems((prev) => prev.map((item) => (item.id === id ? merged : item)));
    }

    if (!isOnline) {
      await syncQueue.addOperation({ type: 'update', itemId: id, data: updates });
      setSyncing(false);
      return;
    }

    if (user && isOnline) {
      const dbUpdates = inventoryItemToDb(updates);
      const { error } = await supabase.from('inventory_items').update(dbUpdates).eq('id', id);
      if (error) {
        await syncQueue.addOperation({ type: 'update', itemId: id, data: updates });
        toast({ title: 'Error', description: 'Queued for sync', variant: 'destructive' });
      }
    }
    setSyncing(false);
  };

  const deleteItem = async (id: string) => {
    setSyncing(true);
    await indexedDB.deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));

    if (!isOnline) {
      await syncQueue.addOperation({ type: 'delete', itemId: id });
      setSyncing(false);
      return;
    }

    if (user && isOnline) {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) {
        await syncQueue.addOperation({ type: 'delete', itemId: id });
        toast({ title: 'Error', description: 'Queued for sync', variant: 'destructive' });
      }
    }
    setSyncing(false);
  };

  return { items, loading, syncing, isOnline, addItem, updateItem, deleteItem, refetch: fetchItems };
}
