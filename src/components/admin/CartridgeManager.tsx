import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';

export const CartridgeManager: React.FC = () => {
  const [cartridges, setCartridges] = useState<any[]>([]);
  const [filteredCartridges, setFilteredCartridges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cartridge: '',
    bullet_diameter: '',
    case_length: '',
    oal: '',
    primer_size: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCartridges();
  }, []);

  useEffect(() => {
    const filtered = cartridges.filter(c => 
      c.cartridge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primer_size?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCartridges(filtered);
  }, [searchTerm, cartridges]);

  const fetchCartridges = async () => {
    const { data, error } = await supabase
      .from('cartridges')
      .select('*')
      .order('cartridge');
    
    if (error) {
      toast({ title: 'Error fetching cartridges', variant: 'destructive' });
    } else {
      setCartridges(data || []);
      setFilteredCartridges(data || []);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'You must be logged in to add cartridges', variant: 'destructive' });
      return;
    }

    // Validate required field
    if (!formData.cartridge.trim()) {
      toast({ title: 'Cartridge name is required', variant: 'destructive' });
      return;
    }

    const payload = {
      cartridge: formData.cartridge.trim(),
      bullet_diameter: formData.bullet_diameter ? parseFloat(formData.bullet_diameter) : null,
      case_length: formData.case_length ? parseFloat(formData.case_length) : null,
      oal: formData.oal ? parseFloat(formData.oal) : null,
      primer_size: formData.primer_size.trim() || null,
      user_id: user.id
    };

    console.log('Saving cartridge:', payload);

    if (editingId) {
      const { error } = await supabase
        .from('cartridges')
        .update(payload)
        .eq('id', editingId);
      
      if (error) {
        console.error('Error updating cartridge:', error);
        toast({ 
          title: 'Error updating cartridge', 
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Cartridge updated successfully' });
        setEditingId(null);
        setFormData({ cartridge: '', bullet_diameter: '', case_length: '', oal: '', primer_size: '' });
        await fetchCartridges();
      }
    } else {
      const { data, error } = await supabase
        .from('cartridges')
        .insert(payload)
        .select();
      
      if (error) {
        console.error('Error adding cartridge:', error);
        toast({ 
          title: 'Error adding cartridge', 
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        console.log('Cartridge added successfully:', data);
        toast({ title: 'Cartridge added successfully' });
        setIsAdding(false);
        setFormData({ cartridge: '', bullet_diameter: '', case_length: '', oal: '', primer_size: '' });
        await fetchCartridges();
      }
    }
  };

  const handleEdit = (cartridge: any) => {
    setEditingId(cartridge.id);
    setFormData({
      cartridge: cartridge.cartridge,
      bullet_diameter: cartridge.bullet_diameter?.toString() || '',
      case_length: cartridge.case_length?.toString() || '',
      oal: cartridge.oal?.toString() || '',
      primer_size: cartridge.primer_size || ''
    });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('cartridges')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error deleting cartridge', variant: 'destructive' });
    } else {
      toast({ title: 'Cartridge deleted successfully' });
      fetchCartridges();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cartridge Manager</h3>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Cartridge
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-slate-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cartridge Name</Label>
              <Input
                value={formData.cartridge}
                onChange={(e) => setFormData({...formData, cartridge: e.target.value})}
                placeholder="e.g., .308 Winchester"
              />
            </div>
            <div>
              <Label>Bullet Diameter (inches)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.bullet_diameter}
                onChange={(e) => setFormData({...formData, bullet_diameter: e.target.value})}
                placeholder="0.308"
              />
            </div>
            <div>
              <Label>Case Length (inches)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.case_length}
                onChange={(e) => setFormData({...formData, case_length: e.target.value})}
                placeholder="2.015"
              />
            </div>
            <div>
              <Label>OAL (inches)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.oal}
                onChange={(e) => setFormData({...formData, oal: e.target.value})}
                placeholder="2.810"
              />
            </div>
            <div>
              <Label>Primer Size</Label>
              <Input
                value={formData.primer_size}
                onChange={(e) => setFormData({...formData, primer_size: e.target.value})}
                placeholder="Large Rifle"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ cartridge: '', bullet_diameter: '', case_length: '', oal: '', primer_size: '' });
              }} 
              variant="outline" 
              size="sm"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search cartridges..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filteredCartridges.map((cartridge) => (
          <div key={cartridge.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
            <div>
              <div className="font-semibold">{cartridge.cartridge}</div>
              <div className="text-sm text-slate-400">
                Diameter: {cartridge.bullet_diameter}" | 
                Case: {cartridge.case_length}" | 
                OAL: {cartridge.oal}" | 
                Primer: {cartridge.primer_size}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(cartridge)} size="sm" variant="outline">
                <Edit className="w-4 h-4" />
              </Button>
              <Button onClick={() => handleDelete(cartridge.id)} size="sm" variant="destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};