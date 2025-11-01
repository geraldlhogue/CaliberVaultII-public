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

interface PrimerType {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  size?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function PrimerTypeManager() {
  const [primerTypes, setPrimerTypes] = useState<PrimerType[]>([]);
  const [filteredPrimerTypes, setFilteredPrimerTypes] = useState<PrimerType[]>([]);
  const [editingPrimer, setEditingPrimer] = useState<PrimerType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'Standard',
    size: 'Large Rifle',
    description: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPrimerTypes();
  }, []);

  useEffect(() => {
    const filtered = primerTypes.filter(primer =>
      primer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primer.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primer.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      primer.size?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrimerTypes(filtered);
  }, [searchTerm, primerTypes]);

  const loadPrimerTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('primer_types')
        .select('*')
        .order('brand', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPrimerTypes(data || []);
    } catch (error) {
      console.error('Error loading primer types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load primer types',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPrimer) {
        const { error } = await supabase
          .from('primer_types')
          .update({
            name: formData.name,
            brand: formData.brand,
            type: formData.type,
            size: formData.size,
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPrimer.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Primer type updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('primer_types')
          .insert([{
            name: formData.name,
            brand: formData.brand,
            type: formData.type,
            size: formData.size,
            description: formData.description || null
          }]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Primer type added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingPrimer(null);
      setFormData({
        name: '',
        brand: '',
        type: 'Standard',
        size: 'Large Rifle',
        description: ''
      });
      loadPrimerTypes();
    } catch (error) {
      console.error('Error saving primer type:', error);
      toast({
        title: 'Error',
        description: 'Failed to save primer type',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (primer: PrimerType) => {
    setEditingPrimer(primer);
    setFormData({
      name: primer.name,
      brand: primer.brand || '',
      type: primer.type || 'Standard',
      size: primer.size || 'Large Rifle',
      description: primer.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this primer type? This action cannot be undone if the primer type is not in use.')) return;
    
    try {
      const { error } = await supabase
        .from('primer_types')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('Cannot delete')) {
          toast({
            title: 'Cannot Delete',
            description: 'This primer type is being used and cannot be deleted',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Primer type deleted successfully',
      });
      loadPrimerTypes();
    } catch (error) {
      console.error('Error deleting primer type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete primer type',
        variant: 'destructive',
      });
    }
  };

  const openNewDialog = () => {
    setEditingPrimer(null);
    setFormData({
      name: '',
      brand: '',
      type: 'Standard',
      size: 'Large Rifle',
      description: ''
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primer Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search primer types..."
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
                <TableHead>Size</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrimerTypes.map((primer) => (
                <TableRow key={primer.id}>
                  <TableCell className="font-medium">{primer.brand}</TableCell>
                  <TableCell>{primer.name}</TableCell>
                  <TableCell>{primer.type || '-'}</TableCell>
                  <TableCell>{primer.size || '-'}</TableCell>
                  <TableCell>{primer.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(primer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(primer.id)}>
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
              <DialogTitle>{editingPrimer ? 'Edit' : 'Add'} Primer Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand *</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., CCI, Federal"
                      required
                    />
                  </div>
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., BR-2, 210M"
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
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Magnum">Magnum</SelectItem>
                        <SelectItem value="Match">Match</SelectItem>
                        <SelectItem value="Benchrest">Benchrest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Select value={formData.size} onValueChange={(v) => setFormData({...formData, size: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small Rifle">Small Rifle</SelectItem>
                        <SelectItem value="Large Rifle">Large Rifle</SelectItem>
                        <SelectItem value="Small Pistol">Small Pistol</SelectItem>
                        <SelectItem value="Large Pistol">Large Pistol</SelectItem>
                        <SelectItem value="Small Rifle Magnum">Small Rifle Magnum</SelectItem>
                        <SelectItem value="Large Rifle Magnum">Large Rifle Magnum</SelectItem>
                        <SelectItem value="Small Pistol Magnum">Small Pistol Magnum</SelectItem>
                        <SelectItem value="Large Pistol Magnum">Large Pistol Magnum</SelectItem>
                        <SelectItem value="209 Shotshell">209 Shotshell</SelectItem>
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
                  {editingPrimer ? 'Update' : 'Add'} Primer Type
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}