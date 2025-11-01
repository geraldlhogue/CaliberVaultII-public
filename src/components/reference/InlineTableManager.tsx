import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Settings, Trash2 } from 'lucide-react';

interface InlineTableManagerProps {
  tableName: string;
  displayName: string;
  value?: string;
  onChange: (value: string) => void;
  filterField?: string;
  filterValue?: any;
}

export const InlineTableManager: React.FC<InlineTableManagerProps> = ({
  tableName,
  displayName,
  value,
  onChange,
  filterField,
  filterValue
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [tableName, filterField, filterValue]);

  const fetchItems = async () => {
    try {
      let query = supabase.from(tableName).select('*');
      
      // Apply filter if provided (e.g., for manufacturers by product type)
      if (filterField && filterValue) {
        query = query.eq(filterField, filterValue);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    
    setLoading(true);
    try {
      const newItem: any = { name: newItemName };
      
      // Add filter field value if applicable
      if (filterField && filterValue) {
        newItem[filterField] = filterValue;
      }
      
      const { error } = await supabase
        .from(tableName)
        .insert(newItem);
      
      if (error) throw error;
      
      toast.success(`${displayName} added successfully`);
      setNewItemName('');
      fetchItems();
      onChange(newItemName); // Select the newly added item
    } catch (error: any) {
      toast.error(`Failed to add ${displayName}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error: any) {
      toast.error(`Failed to delete item: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Select {displayName}</option>
        {items.map(item => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {displayName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={`New ${displayName}`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={loading}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{item.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};