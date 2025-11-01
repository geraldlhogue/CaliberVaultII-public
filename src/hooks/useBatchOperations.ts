import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export function useBatchOperations() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const bulkUpdate = async (itemIds: string[], updates: any) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return { success: false };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-operations', {
        body: {
          operation: 'bulkUpdate',
          itemIds,
          updates
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Updated ${data.updated} items successfully`
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update items',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (itemIds: string[]) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return { success: false };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-operations', {
        body: {
          operation: 'bulkDelete',
          itemIds
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Deleted ${data.deleted} items successfully`
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete items',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const bulkTransfer = async (itemIds: string[], targetLocation: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return { success: false };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-operations', {
        body: {
          operation: 'bulkTransfer',
          itemIds,
          targetLocation
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Transferred ${data.transferred} items to ${targetLocation}`
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transfer items',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    bulkUpdate,
    bulkDelete,
    bulkTransfer
  };
}