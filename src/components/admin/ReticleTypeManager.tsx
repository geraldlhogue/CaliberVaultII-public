import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReticleType {
  id: string;
  name: string;
  type: string;
  subtensions?: string;
  description?: string;
}

export function ReticleTypeManager() {
  const { toast } = useToast();
  const [reticleTypes, setReticleTypes] = useState<ReticleType[]>([]);
  const [editingItem, setEditingItem] = useState<ReticleType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<ReticleType>>({});

  useEffect(() => {
    loadReticleTypes();
  }, []);

  const loadReticleTypes = async () => {
    const { data, error } = await supabase
      .from('reticle_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading reticle types:', error);
    } else if (data) {
      setReticleTypes(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Reticle name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('reticle_types')
          .update(formData)
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Reticle type "${formData.name}" updated`
        });
      } else {
        const { error } = await supabase
          .from('reticle_types')
          .insert([formData]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Reticle type "${formData.name}" added`
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      await loadReticleTypes();
    } catch (error: any) {
      console.error('Error saving reticle type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save reticle type",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this reticle type?')) {
      const { error } = await supabase
        .from('reticle_types')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting reticle type:', error);
        toast({
          title: "Error",
          description: "Failed to delete reticle type",
          variant: "destructive"
        });
      } else {
        await loadReticleTypes();
      }
    }
  };

  const openEditDialog = (item: ReticleType) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const filteredReticleTypes = reticleTypes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Reticle Types ({reticleTypes.length})</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search reticle types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subtensions</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReticleTypes.map((reticle) => (
              <TableRow key={reticle.id}>
                <TableCell className="font-medium">{reticle.name}</TableCell>
                <TableCell>{reticle.type || '-'}</TableCell>
                <TableCell>{reticle.subtensions || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {reticle.description || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(reticle)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(reticle.id)}>
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
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Reticle Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., EBR-7C, TMR, BDC"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Duplex">Duplex</SelectItem>
                  <SelectItem value="Mil-Dot">Mil-Dot</SelectItem>
                  <SelectItem value="BDC">BDC</SelectItem>
                  <SelectItem value="MOA">MOA</SelectItem>
                  <SelectItem value="Illuminated">Illuminated</SelectItem>
                  <SelectItem value="FFP">First Focal Plane</SelectItem>
                  <SelectItem value="SFP">Second Focal Plane</SelectItem>
                  <SelectItem value="Christmas Tree">Christmas Tree</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subtensions</Label>
              <Input
                value={formData.subtensions || ''}
                onChange={(e) => setFormData({...formData, subtensions: e.target.value})}
                placeholder="e.g., 0.1 mil, 0.25 MOA"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional details about this reticle"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}