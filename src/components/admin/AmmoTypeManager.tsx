import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';

interface AmmoType {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
}

export const AmmoTypeManager: React.FC = () => {
  const [ammoTypes, setAmmoTypes] = useState<AmmoType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: ''
  });

  useEffect(() => {
    fetchAmmoTypes();
  }, []);

  const fetchAmmoTypes = async () => {
    const { data, error } = await supabase
      .from('ammo_types')
      .select('*')
      .order('name');
    
    
    if (error) {
      toast.error(`Error fetching ammo types: ${error.message}`);
    } else {
      setAmmoTypes(data || []);
    }

  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('ammo_types')
        .update(formData)
        .eq('id', editingId);
      
      if (error) {
        toast.error(`Error updating ammo type: ${error.message}`);
      } else {
        toast.success('Ammo type updated successfully');
        setEditingId(null);
      }
    } else {
      const { error } = await supabase
        .from('ammo_types')
        .insert([formData]);
      
      if (error) {
        toast.error(`Error adding ammo type: ${error.message}`);
      } else {
        toast.success('Ammo type added successfully');
        setIsAdding(false);
      }
    }

    setFormData({ name: '', abbreviation: '', description: '' });
    fetchAmmoTypes();
  };


  const handleEdit = (type: AmmoType) => {
    setFormData({
      name: type.name,
      abbreviation: type.abbreviation || '',
      description: type.description || ''
    });
    setEditingId(type.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ammo type?')) return;

    const { error } = await supabase
      .from('ammo_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(`Error deleting ammo type: ${error.message}`);
    } else {
      toast.success('Ammo type deleted successfully');
      fetchAmmoTypes();
    }

  };

  const filteredTypes = ammoTypes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Ammo Type Management</h3>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', abbreviation: '', description: '' }); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Ammo Type
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search ammo types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {(isAdding || editingId) && (
        <div className="bg-slate-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Name (e.g., Full Metal Jacket)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Abbreviation (e.g., FMJ)"
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-3 text-slate-300">Name</th>
              <th className="text-left p-3 text-slate-300">Abbreviation</th>
              <th className="text-left p-3 text-slate-300">Description</th>
              <th className="text-right p-3 text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((type) => (
              <tr key={type.id} className="border-t border-slate-700">
                <td className="p-3 text-white">{type.name}</td>
                <td className="p-3 text-slate-300">{type.abbreviation}</td>
                <td className="p-3 text-slate-300">{type.description}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(type)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(type.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};