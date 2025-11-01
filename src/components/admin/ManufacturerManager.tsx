import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Manufacturer {
  id: string;
  name: string;
  firearm_indicator: boolean;
  optics_indicator: boolean;
  primer_indicator: boolean;
  powder_indicator: boolean;
  makes_ammunition: boolean;
  makes_casings: boolean;
  makes_bullets: boolean;
  makes_magazines: boolean;
  makes_accessories: boolean;
  country?: string;
}

export function ManufacturerManager() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [editingItem, setEditingItem] = useState<Manufacturer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Manufacturer>>({});

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setManufacturers(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return;
    
    const dataToSave = { 
      name: formData.name.trim(),
      country: formData.country?.trim() || null,
      firearm_indicator: formData.firearm_indicator || false,
      optics_indicator: formData.optics_indicator || false,
      primer_indicator: formData.primer_indicator || false,
      powder_indicator: formData.powder_indicator || false,
      makes_ammunition: formData.makes_ammunition || false,
      makes_casings: formData.makes_casings || false,
      makes_bullets: formData.makes_bullets || false,
      makes_magazines: formData.makes_magazines || false,
      makes_accessories: formData.makes_accessories || false
    };

    if (editingItem) {
      await supabase
        .from('manufacturers')
        .update(dataToSave)
        .eq('id', editingItem.id);
    } else {
      await supabase
        .from('manufacturers')
        .insert([dataToSave]);
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({});
    await loadManufacturers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this manufacturer?')) {
      await supabase.from('manufacturers').delete().eq('id', id);
      await loadManufacturers();
    }
  };

  const filteredManufacturers = manufacturers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">Manufacturers</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-48 h-8 text-sm"
            />
          </div>
          <Button onClick={() => {setEditingItem(null); setFormData({}); setIsDialogOpen(true);}} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />Add
          </Button>
        </div>
      </div>

      
      {/* Scrollable table container - FIXED HEIGHT */}
      <div className="flex-1 overflow-auto border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-background border-b">
            <tr>
              <th className="text-left p-2 font-medium">Name</th>
              <th className="text-center p-2 font-medium">🔫</th>
              <th className="text-center p-2 font-medium">🎯</th>
              <th className="text-center p-2 font-medium">👁️</th>
              <th className="text-center p-2 font-medium">🔥</th>
              <th className="text-center p-2 font-medium">💥</th>
              <th className="text-center p-2 font-medium">📦</th>
              <th className="text-center p-2 font-medium">💊</th>
              <th className="text-center p-2 font-medium">📰</th>
              <th className="text-center p-2 font-medium">🎒</th>
              <th className="text-left p-2 font-medium">Country</th>
              <th className="text-right p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredManufacturers.map((m) => (
              <tr key={m.id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium">{m.name}</td>
                <td className="p-2 text-center">{m.firearm_indicator ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.makes_bullets ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.optics_indicator ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.primer_indicator ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.powder_indicator ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.makes_casings ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.makes_ammunition ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.makes_magazines ? '✓' : '✗'}</td>
                <td className="p-2 text-center">{m.makes_accessories ? '✓' : '✗'}</td>
                <td className="p-2 text-xs">{m.country || '-'}</td>
                <td className="p-2 text-right">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {setEditingItem(m); setFormData(m); setIsDialogOpen(true);}}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Manufacturer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={formData.country || ''}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {key: 'firearm_indicator', label: 'Firearms'},
                {key: 'makes_bullets', label: 'Bullets'},
                {key: 'optics_indicator', label: 'Optics'},
                {key: 'primer_indicator', label: 'Primers'},
                {key: 'powder_indicator', label: 'Powder'},
                {key: 'makes_casings', label: 'Casings'},
                {key: 'makes_ammunition', label: 'Ammunition'},
                {key: 'makes_magazines', label: 'Magazines'},
                {key: 'makes_accessories', label: 'Accessories'}
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData[item.key as keyof Manufacturer] as boolean || false}
                    onCheckedChange={(c) => setFormData({...formData, [item.key]: !!c})}
                  />
                  <Label>{item.label}</Label>
                </div>
              ))}
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