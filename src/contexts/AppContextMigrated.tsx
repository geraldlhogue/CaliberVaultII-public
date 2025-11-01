import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { InventoryItem, ItemCategory, FirearmBuild } from '@/types/inventory';
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
  referenceData: {
    manufacturers: [],
    calibers: [],
    actions: [],
    locations: [],
    barrelLengthUnits: [],
    categories: [],
  },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>(mockInventory);
  const [cloudInventory, setCloudInventory] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [builds, setBuilds] = useState<FirearmBuild[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    manufacturers: [],
    calibers: [],
    actions: [],
    locations: [],
    barrelLengthUnits: [],
    categories: [],
  });

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const [manufacturers, calibers, actions, locations, units, categories] = await Promise.allSettled([
        supabase.from('manufacturers').select('id, name').order('name'),
        supabase.from('calibers').select('id, name').order('name'),
        supabase.from('action_types').select('id, name').order('name'),
        supabase.from('locations').select('id, name, description').order('name'),
        supabase.from('units_of_measure').select('id, name, abbreviation').eq('type', 'length').order('name'),
        supabase.from('categories').select('id, name, icon, description').order('name'),
      ]);

      setReferenceData({
        manufacturers: manufacturers.status === 'fulfilled' && manufacturers.value.data ? manufacturers.value.data : [],
        calibers: calibers.status === 'fulfilled' && calibers.value.data ? calibers.value.data : [],
        actions: actions.status === 'fulfilled' && actions.value.data ? actions.value.data : [],
        locations: locations.status === 'fulfilled' && locations.value.data ? locations.value.data : [],
        barrelLengthUnits: units.status === 'fulfilled' && units.value.data ? units.value.data : [],
        categories: categories.status === 'fulfilled' && categories.value.data ? categories.value.data : [],
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  // Initialize auth
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchReferenceData().catch(err => console.error('Failed to fetch reference data:', err));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('Auth session error:', error);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          await fetchCloudInventory(session.user.id).catch(err => console.error('Failed to fetch inventory:', err));
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setLoading(false);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchCloudInventory(session.user.id).catch(err => console.error('Failed to fetch inventory:', err));
      } else {
        setCloudInventory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory', filter: `user_id=eq.${user.id}` },
        async () => await fetchCloudInventory(user.id)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchCloudInventory = async (userId: string) => {
    // Implementation will be added in next file due to size
    console.log('Fetching inventory for user:', userId);
    setCloudInventory([]);
  };

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
    // Implementation in separate file
    console.log('Adding item:', item);
  };

  const updateCloudItem = async (id: string, item: InventoryItem) => {
    // Implementation in separate file
    console.log('Updating item:', id, item);
  };

  const deleteCloudItem = async (id: string) => {
    // Implementation in separate file
    console.log('Deleting item:', id);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const refreshInventory = async () => { if (user) await fetchCloudInventory(user.id); };
  const inventory = user ? cloudInventory : localInventory;

  return (
    <AppContext.Provider value={{
      inventory, localInventory, setLocalInventory, selectedCategory, setSelectedCategory,
      builds, setBuilds, referenceData, refreshReferenceData: fetchReferenceData, refreshInventory,
      user, loading, signIn, signUp, signOut, addCloudItem, updateCloudItem, deleteCloudItem,
      sidebarOpen, toggleSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
};
