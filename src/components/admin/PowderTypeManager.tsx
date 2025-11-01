import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PowderType {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  burn_rate?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function PowderTypeManager() {
  const [powderTypes, setPowderTypes] = useState<PowderType[]>([]);
  const [filteredPowderTypes, setFilteredPowderTypes] = useState<PowderType[]>([]);
  const [editingPowder, setEditingPowder] = useState<PowderType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'Rifle',
    burn_rate: 'Medium',
    description: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPowderTypes();
  }, []);

  useEffect(() => {
    const filtered = powderTypes.filter(powder =>
      powder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      powder.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      powder.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPowderTypes(filtered);
  }, [searchTerm, powderTypes]);

  const loadPowderTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('powder_types')
        .select('*')
        .order('brand', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPowderTypes(data || []);
    } catch (error) {
      console.error('Error loading powder types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load powder types',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPowder) {
        const { error } = await supabase
          .from('powder_types')
          .update({
            name: formData.name,
            brand: formData.brand,
            type: formData.type,
            burn_rate: formData.burn_rate,
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPowder.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Powder type updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('powder_types')
          .insert([{
            name: formData.name,
            brand: formData.brand,
            type: formData.type,
            burn_rate: formData.burn_rate,
            description: formData.description || null
          }]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Powder type added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingPowder(null);
      setFormData({
        name: '',
        brand: '',
        type: 'Rifle',
        burn_rate: 'Medium',
        description: ''
      });
      loadPowderTypes();
    } catch (error) {
      console.error('Error saving powder type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save powder type',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (powder: PowderType) => {
    setEditingPowder(powder);
    setFormData({
      name: powder.name,
      brand: powder.brand || '',
      type: powder.type || 'Rifle',
      burn_rate: powder.burn_rate || 'Medium',
      description: powder.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this powder type? This action cannot be undone if the powder type is not in use.')) return;
    
    try {
      const { error } = await supabase
        .from('powder_types')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('Cannot delete')) {
          toast({
            title: 'Cannot Delete',
            description: 'This powder type is being used and cannot be deleted',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Powder type deleted successfully',
      });
      loadPowderTypes();
    } catch (error) {
      console.error('Error deleting powder type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete powder type',
        variant: 'destructive',
      });
    }
  };

  const openNewDialog = () => {
    setEditingPowder(null);
    setFormData({
      name: '',
      brand: '',
      type: 'Rifle',
      burn_rate: 'Medium',
      description: ''
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Powder Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search powder types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Burn Rate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPowderTypes.map((powder) => (
                <TableRow key={powder.id}>
                  <TableCell className="font-medium">{powder.brand}</TableCell>
                  <TableCell>{powder.name}</TableCell>
                  <TableCell>{powder.type || '-'}</TableCell>
                  <TableCell>{powder.burn_rate || '-'}</TableCell>
                  <TableCell>{powder.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(powder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(powder.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPowder ? 'Edit' : 'Add'} Powder Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand *</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Hodgdon, Alliant"
                      required
                    />
                  </div>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., H4350, Varget"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rifle">Rifle</SelectItem>
                        <SelectItem value="Pistol">Pistol</SelectItem>
                        <SelectItem value="Shotgun">Shotgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Burn Rate</Label>
                    <Select value={formData.burn_rate} onValueChange={(v) => setFormData({...formData, burn_rate: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fast">Fast</SelectItem>
                        <SelectItem value="Medium-Fast">Medium-Fast</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Medium-Slow">Medium-Slow</SelectItem>
                        <SelectItem value="Slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPowder ? 'Update' : 'Add'} Powder Type
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}