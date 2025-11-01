import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { InventoryItem, ItemCategory, FirearmBuild } from '@/types/inventory';
import { inventoryService } from '@/services/inventory.service';
import { mockInventory } from '@/data/mockInventory';

interface ReferenceData {
  manufacturers: Array<{ id: string; name: string }>;
  calibers: Array<{ id: string; name: string }>;
  actions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string; description?: string }>;
  barrelLengthUnits: Array<{ id: string; name: string; abbreviation?: string }>;
  categories: Array<{ id: string; name: string; icon?: string; description?: string }>;
}

interface AppContextType {
  inventory: InventoryItem[];
  localInventory: InventoryItem[];
  setLocalInventory: (items: InventoryItem[]) => void;
  selectedCategory: ItemCategory | null;
  setSelectedCategory: (category: ItemCategory | null) => void;
  builds: FirearmBuild[];
  setBuilds: (builds: FirearmBuild[]) => void;
  referenceData: ReferenceData;
  refreshReferenceData: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  addCloudItem: (item: Partial<InventoryItem>) => Promise<void>;
  updateCloudItem: (id: string, item: InventoryItem) => Promise<void>;
  deleteCloudItem: (id: string) => Promise<void>;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const defaultContext: AppContextType = {
  inventory: [],
  localInventory: [],
  setLocalInventory: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  builds: [],
  setBuilds: () => {},
  referenceData: { manufacturers: [], calibers: [], actions: [], locations: [], barrelLengthUnits: [], categories: [] },
  refreshReferenceData: async () => {},
  refreshInventory: async () => {},
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  addCloudItem: async () => {},
  updateCloudItem: async () => {},
  deleteCloudItem: async () => {},
  sidebarOpen: false,
  toggleSidebar: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);
export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudInventory, setCloudInventory] = useState<InventoryItem[]>([]);
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>(mockInventory);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [builds, setBuilds] = useState<FirearmBuild[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    manufacturers: [], calibers: [], actions: [], locations: [], barrelLengthUnits: [], categories: []
  });

  const fetchReferenceData = async () => {
    try {
      const [mfg, cal, act, loc, units, cat] = await Promise.allSettled([
        supabase.from('manufacturers').select('id, name').order('name'),
        supabase.from('calibers').select('id, name').order('name'),
        supabase.from('action_types').select('id, name').order('name'),
        supabase.from('locations').select('id, name, description').order('name'),
        supabase.from('units_of_measure').select('id, name, abbreviation').eq('type', 'length').order('name'),
        supabase.from('categories').select('id, name, icon, description').order('name'),
      ]);
      setReferenceData({
        manufacturers: mfg.status === 'fulfilled' && mfg.value.data ? mfg.value.data : [],
        calibers: cal.status === 'fulfilled' && cal.value.data ? cal.value.data : [],
        actions: act.status === 'fulfilled' && act.value.data ? act.value.data : [],
        locations: loc.status === 'fulfilled' && loc.value.data ? loc.value.data : [],
        barrelLengthUnits: units.status === 'fulfilled' && units.value.data ? units.value.data : [],
        categories: cat.status === 'fulfilled' && cat.value.data ? cat.value.data : [],
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchInventory = async (userId: string) => {
    try {
      const items = await inventoryService.getItems(userId);
      setCloudInventory(items as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchReferenceData();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await fetchInventory(session.user.id);
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchInventory(session.user.id);
      else setCloudInventory([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory', filter: `user_id=eq.${user.id}` },
        async () => await fetchInventory(user.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('user_profiles').insert({ id: data.user.id, email, full_name: fullName });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const addCloudItem = async (item: Partial<InventoryItem>) => {
    if (!user) throw new Error('Not authenticated');
    await inventoryService.saveItem(item, user.id);
    await fetchInventory(user.id);
    toast.success('Item added successfully');
  };

  const updateCloudItem = async (id: string, item: InventoryItem) => {
    if (!user) return;
    await inventoryService.updateItem(id, item, user.id);
    await fetchInventory(user.id);
    toast.success('Item updated');
  };

  const deleteCloudItem = async (id: string) => {
    if (!user) return;
    await supabase.from('inventory').delete().eq('id', id).eq('user_id', user.id);
    await fetchInventory(user.id);
    toast.success('Item deleted');
  };

  const inventory = user ? cloudInventory : localInventory;

  return (
    <AppContext.Provider value={{
      inventory, localInventory, setLocalInventory, selectedCategory, setSelectedCategory, builds, setBuilds, referenceData,
      refreshReferenceData: fetchReferenceData, refreshInventory: () => user ? fetchInventory(user.id) : Promise.resolve(),
      user, loading, signIn, signUp, signOut, addCloudItem, updateCloudItem, deleteCloudItem,
      sidebarOpen, toggleSidebar: () => setSidebarOpen(prev => !prev)
    }}>
      {children}
    </AppContext.Provider>
  );
};

