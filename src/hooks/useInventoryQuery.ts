import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getUserFriendlyError, logError } from '@/lib/errorMessages';

interface InventoryItem {
  id: string;
  user_id: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface PaginatedResponse {
  data: InventoryItem[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// New schema uses single inventory table with category field
// No need for category-specific tables anymore


// Helper to resolve manufacturer name to ID
async function resolveManufacturerId(name: string | undefined): Promise<string | null> {
  if (!name) return null;
  const { data } = await supabase.from('manufacturers').select('id').eq('name', name).single();
  return data?.id || null;
}

// Helper to resolve caliber name to ID
async function resolveCaliberId(name: string | undefined): Promise<string | null> {
  if (!name) return null;
  const { data } = await supabase.from('calibers').select('id').eq('name', name).single();
  return data?.id || null;
}

export function useInventoryItems(userId?: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['inventory', userId, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse> => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from('inventory')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .range(start, end)
        .order('created_at', { ascending: false });
      
      if (error) {
        logError(error, 'useInventoryItems');
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    enabled: !!userId,
  });
}


export function useAddInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      console.log('🔵 [ADD ITEM] Starting mutation...');
      console.log('📦 Raw item:', JSON.stringify(item, null, 2));
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 User check:', { userId: user?.id, email: user?.email, authError: authError?.message });
      
      if (!user) {
        throw new Error('❌ User not authenticated');
      }
      
      console.log('📋 Using inventory table (new schema)');
      
      const itemToInsert = {
        user_id: user.id,
        category: item.category || 'firearms',
        name: item.name || `${item.manufacturer || ''} ${item.model || ''}`.trim() || 'Unnamed Item',
        manufacturer: item.manufacturer,
        model: item.model || item.modelNumber,
        serial_number: item.serialNumber,
        caliber: item.caliber,
        barrel_length: item.barrelLength,
        purchase_price: item.purchasePrice,
        current_value: item.currentValue,
        purchase_date: item.purchaseDate,
        quantity: item.quantity || 1,
        images: item.images || [],
        notes: item.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('💾 Final insert object:', JSON.stringify(itemToInsert, null, 2));
      
      const { data, error } = await supabase
        .from('inventory')
        .insert([itemToInsert])
        .select()
        .single();
      
      if (error) {
        console.error('❌ INSERT ERROR:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('✅ INSERT SUCCESS:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item added successfully');
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
      const errorDetails = getUserFriendlyError(error);
      toast.error(errorDetails.title, { description: errorDetails.message });
    },
  });
}


export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logError(error, 'useUpdateInventoryItem');
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item updated successfully');
    },
    onError: (error: any) => {
      const errorDetails = getUserFriendlyError(error);
      toast.error(errorDetails.title, { description: errorDetails.message });
    },
  });
}


export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }: { id: string; category?: string }) => {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) {
        logError(error, 'useDeleteInventoryItem');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      const errorDetails = getUserFriendlyError(error);
      toast.error(errorDetails.title, { description: errorDetails.message });
    },
  });
}

