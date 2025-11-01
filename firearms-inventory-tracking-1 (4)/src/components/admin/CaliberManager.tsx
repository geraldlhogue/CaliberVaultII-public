import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Caliber {
  id: string;
  name: string;
  diameter?: number;
  case_length?: number;
  overall_length?: number;
  category?: string;
}

export function CaliberManager() {
  const [calibers, setCalibers] = useState<Caliber[]>([]);
  const [editingItem, setEditingItem] = useState<Caliber | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Caliber>>({});

  useEffect(() => {
    loadCalibers();
  }, []);

  const loadCalibers = async () => {
    const { data } = await supabase.from('calibers').select('*').order('name');
    if (data) setCalibers(data);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return;
    
    if (editingItem) {
      await supabase.from('calibers').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('calibers').insert([formData]);
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({});
    await loadCalibers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this caliber?')) {
      await supabase.from('calibers').delete().eq('id', id);
      await loadCalibers();
    }
  };

  const filtered = calibers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Calibers</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={() => {setEditingItem(null); setFormData({}); setIsDialogOpen(true);}}>
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Diameter</th>
              <th className="text-left p-2">Case Length</th>
              <th className="text-left p-2">Overall Length</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.diameter || '-'}</td>
                <td className="p-2">{c.case_length || '-'}</td>
                <td className="p-2">{c.overall_length || '-'}</td>
                <td className="p-2">{c.category || '-'}</td>
                <td className="p-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => {setEditingItem(c); setFormData(c); setIsDialogOpen(true);}}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Caliber</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Diameter</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.diameter || ''}
                  onChange={(e) => setFormData({...formData, diameter: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Case Length</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.case_length || ''}
                  onChange={(e) => setFormData({...formData, case_length: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Overall Length</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.overall_length || ''}
                  onChange={(e) => setFormData({...formData, overall_length: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}