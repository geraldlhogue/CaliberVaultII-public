import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface BulletType {
  id: string;
  name: string;
  description: string | null;
}

export function BulletTypeManager() {
  const [bulletTypes, setBulletTypes] = useState<BulletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [editItem, setEditItem] = useState({ name: '', description: '' });

  useEffect(() => { loadBulletTypes(); }, []);

  const loadBulletTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('bullet_types')
        .select('*')
        .order('name');
      if (error) throw error;
      setBulletTypes(data || []);
    } catch (error: any) {
      console.error('Error loading bullet types:', error);
      toast.error('Failed to load bullet types');
    } finally {
      setLoading(false);
    }
  };

  const addBulletType = async () => {
    if (!newItem.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const { error } = await supabase
        .from('bullet_types')
        .insert([{
          name: newItem.name.trim(),
          description: newItem.description.trim() || null
        }]);
      if (error) throw error;
      toast.success('Bullet type added');
      setNewItem({ name: '', description: '' });
      loadBulletTypes();
    } catch (error: any) {
      console.error('Error adding bullet type:', error);
      toast.error(error.message || 'Failed to add bullet type');
    }
  };

  const updateBulletType = async (id: string) => {
    if (!editItem.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const { error } = await supabase
        .from('bullet_types')
        .update({
          name: editItem.name.trim(),
          description: editItem.description.trim() || null
        })
        .eq('id', id);
      if (error) throw error;
      toast.success('Bullet type updated');
      setEditingId(null);
      loadBulletTypes();
    } catch (error: any) {
      console.error('Error updating bullet type:', error);
      toast.error(error.message || 'Failed to update bullet type');
    }
  };

  const deleteBulletType = async (id: string) => {
    if (!confirm('Delete this bullet type?')) return;
    try {
      const { error } = await supabase
        .from('bullet_types')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Bullet type deleted');
      loadBulletTypes();
    } catch (error: any) {
      console.error('Error deleting bullet type:', error);
      toast.error('Failed to delete - may be in use');
    }
  };

  if (loading) return <div className="p-4">Loading bullet types...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input 
          placeholder="Bullet Type Name (e.g., FMJ, HP)" 
          value={newItem.name} 
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
        />
        <Input 
          placeholder="Description (optional)" 
          value={newItem.description} 
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
        />
        <Button onClick={addBulletType} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Bullet Type
        </Button>
      </div>
      
      <div className="space-y-2">
        {bulletTypes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No bullet types found. Add one above.
          </div>
        ) : (
          bulletTypes.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">
              {editingId === item.id ? (
                <>
                  <Input 
                    value={editItem.name} 
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} 
                    placeholder="Name"
                    className="flex-1"
                  />
                  <Input 
                    value={editItem.description || ''} 
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} 
                    placeholder="Description"
                    className="flex-1"
                  />
                  <Button onClick={() => updateBulletType(item.id)} size="sm" variant="ghost">
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button onClick={() => setEditingId(null)} size="sm" variant="ghost">
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium min-w-[100px]">{item.name}</span>
                  <span className="text-sm text-slate-400 flex-1">{item.description || 'No description'}</span>
                  <Button 
                    onClick={() => { 
                      setEditingId(item.id); 
                      setEditItem({ 
                        name: item.name, 
                        description: item.description || '' 
                      }); 
                    }} 
                    size="sm" 
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => deleteBulletType(item.id)} 
                    size="sm" 
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}