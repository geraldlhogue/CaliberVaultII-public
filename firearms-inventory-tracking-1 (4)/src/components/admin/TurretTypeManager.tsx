import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

export const TurretTypeManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('turret_types').select('*').order('name');
    if (data) setItems(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('turret_types').update(formData).eq('id', editing.id);
      toast({ title: 'Updated turret type' });
    } else {
      await supabase.from('turret_types').insert([formData]);
      toast({ title: 'Added turret type' });
    }
    setFormData({ name: '', description: '' });
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this turret type?')) {
      await supabase.from('turret_types').delete().eq('id', id);
      toast({ title: 'Deleted turret type' });
      fetchItems();
    }
  };

  const filtered = items.filter(i => 
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Name" value={formData.name} required
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-slate-700 text-white px-3 py-2 rounded" />
          <input placeholder="Description" value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="bg-slate-700 text-white px-3 py-2 rounded" />
        </div>
        <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">
          {editing ? 'Update' : 'Add'} Turret Type
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setFormData({ name: '', description: '' }); }}
          className="ml-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded">Cancel</button>}
      </form>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input placeholder="Search turret types..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg" />
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-3 text-slate-300">Name</th>
              <th className="text-left p-3 text-slate-300">Description</th>
              <th className="text-right p-3 text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t border-slate-700 hover:bg-slate-750">
                <td className="p-3 text-white">{item.name}</td>
                <td className="p-3 text-slate-300">{item.description || '-'}</td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing(item); setFormData(item); }}
                    className="text-blue-400 hover:text-blue-300 mr-2"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
