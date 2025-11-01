import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Save, Eye } from 'lucide-react';
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

interface FieldOfViewRange {
  id: string;
  magnification: string;
  min_fov_feet: number;
  max_fov_feet: number;
  min_fov_meters: number;
  max_fov_meters: number;
  typical_fov_feet: number;
  typical_fov_meters: number;
  description?: string;
}

export function FieldOfViewManager() {
  const { toast } = useToast();
  const [fovRanges, setFovRanges] = useState<FieldOfViewRange[]>([]);
  const [editingItem, setEditingItem] = useState<FieldOfViewRange | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<FieldOfViewRange>>({});

  useEffect(() => {
    loadFOVRanges();
  }, []);

  const loadFOVRanges = async () => {
    const { data, error } = await supabase
      .from('field_of_view_ranges')
      .select('*')
      .order('magnification');
    
    if (error) {
      console.error('Error loading FOV ranges:', error);
    } else if (data) {
      setFovRanges(data);
    }
  };

  const handleSave = async () => {
    if (!formData.magnification?.trim()) {
      toast({
        title: "Error",
        description: "Magnification is required",
        variant: "destructive"
      });
      return;
    }
    
    // Auto-calculate meters from feet if not provided
    const dataToSave = {
      ...formData,
      min_fov_meters: formData.min_fov_meters || (formData.min_fov_feet ? formData.min_fov_feet * 0.3048 : 0),
      max_fov_meters: formData.max_fov_meters || (formData.max_fov_feet ? formData.max_fov_feet * 0.3048 : 0),
      typical_fov_meters: formData.typical_fov_meters || (formData.typical_fov_feet ? formData.typical_fov_feet * 0.3048 : 0)
    };
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('field_of_view_ranges')
          .update(dataToSave)
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `FOV range for ${formData.magnification} updated`
        });
      } else {
        const { error } = await supabase
          .from('field_of_view_ranges')
          .insert([dataToSave]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `FOV range for ${formData.magnification} added`
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      await loadFOVRanges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save FOV range",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this FOV range?')) {
      const { error } = await supabase
        .from('field_of_view_ranges')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete FOV range",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "FOV range deleted"
        });
        await loadFOVRanges();
      }
    }
  };

  const openEditDialog = (item: FieldOfViewRange) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const filteredFOVRanges = fovRanges.filter(f => 
    f.magnification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Field of View Ranges ({fovRanges.length})</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search FOV ranges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Magnification</TableHead>
            <TableHead>Min FOV (ft)</TableHead>
            <TableHead>Typical FOV (ft)</TableHead>
            <TableHead>Max FOV (ft)</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFOVRanges.map((fov) => (
            <TableRow key={fov.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  {fov.magnification}
                </div>
              </TableCell>
              <TableCell>{fov.min_fov_feet}</TableCell>
              <TableCell className="font-semibold">{fov.typical_fov_feet}</TableCell>
              <TableCell>{fov.max_fov_feet}</TableCell>
              <TableCell className="max-w-xs truncate">
                {fov.description || '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(fov)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(fov.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Field of View Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Magnification *</Label>
              <Input
                value={formData.magnification || ''}
                onChange={(e) => setFormData({...formData, magnification: e.target.value})}
                placeholder="e.g., 1x, 4x, 3-9x, 5-25x"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min FOV (feet @ 100yds)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.min_fov_feet || ''}
                  onChange={(e) => setFormData({...formData, min_fov_feet: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Typical FOV (feet @ 100yds)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.typical_fov_feet || ''}
                  onChange={(e) => setFormData({...formData, typical_fov_feet: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Max FOV (feet @ 100yds)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.max_fov_feet || ''}
                  onChange={(e) => setFormData({...formData, max_fov_feet: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Min FOV (meters @ 100m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.min_fov_meters || ''}
                  onChange={(e) => setFormData({...formData, min_fov_meters: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Typical FOV (meters @ 100m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.typical_fov_meters || ''}
                  onChange={(e) => setFormData({...formData, typical_fov_meters: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Max FOV (meters @ 100m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.max_fov_meters || ''}
                  onChange={(e) => setFormData({...formData, max_fov_meters: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional notes about this FOV range"
                rows={2}
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