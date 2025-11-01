import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface UnitOfMeasure {
  id: string;
  category: string;
  unit_code: string;
  unit_name: string;
  conversion_factor?: number;
  is_base_unit?: boolean;
}

export function UnitOfMeasureManager() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitOfMeasure | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units_of_measure')
        .select('*')
        .order('category', { ascending: true })
        .order('unit_name', { ascending: true });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error loading units:', error);
      toast({
        title: 'Error',
        description: 'Failed to load units',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('units_of_measure')
          .update({
            category: formData.category,
            unit_code: formData.unit_code,
            unit_name: formData.unit_name,
            conversion_factor: formData.conversion_factor,
            is_base_unit: formData.is_base_unit,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Unit "${formData.unit_name}" updated`
        });
      } else {
        const { error } = await supabase
          .from('units_of_measure')
          .insert([{
            category: formData.category,
            unit_code: formData.unit_code,
            unit_name: formData.unit_name,
            conversion_factor: formData.conversion_factor,
            is_base_unit: formData.is_base_unit
          }]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Unit "${formData.unit_name}" added`
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      await loadUnits();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save unit",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this unit of measure? This action cannot be undone if the unit is not in use.')) {
      try {
        const { error } = await supabase
          .from('units_of_measure')
          .delete()
          .eq('id', id);
          
        if (error) {
          if (error.message.includes('violates foreign key constraint')) {
            toast({
              title: "Cannot Delete",
              description: "This unit is being used and cannot be deleted",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          return;
        }
        
        toast({
          title: "Success",
          description: "Unit deleted successfully"
        });
        await loadUnits();
      } catch (error) {
        console.error('Error deleting unit:', error);
        toast({
          title: "Error",
          description: "Failed to delete unit",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (item: UnitOfMeasure) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({
      category: 'Length',
      is_base_unit: false
    });
    setIsDialogOpen(true);
  };

  const filteredUnits = units.filter(u => 
    u.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.unit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Units of Measure ({units.length})</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search units..."
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
              <TableHead>Category</TableHead>
              <TableHead>Unit Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Base Unit</TableHead>
              <TableHead>Conversion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.category}</TableCell>
                <TableCell>{unit.unit_name}</TableCell>
                <TableCell>{unit.unit_code}</TableCell>
                <TableCell>{unit.is_base_unit ? 'Yes' : 'No'}</TableCell>
                <TableCell>{unit.conversion_factor || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(unit)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id)}>
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
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Unit of Measure</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Length">Length</SelectItem>
                  <SelectItem value="Weight">Weight</SelectItem>
                  <SelectItem value="Volume">Volume</SelectItem>
                  <SelectItem value="Pressure">Pressure</SelectItem>
                  <SelectItem value="Velocity">Velocity</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Temperature">Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit Name *</Label>
                <Input
                  value={formData.unit_name || ''}
                  onChange={(e) => setFormData({...formData, unit_name: e.target.value})}
                  placeholder="e.g., Inches, Grains"
                />
              </div>
              <div>
                <Label>Unit Code *</Label>
                <Input
                  value={formData.unit_code || ''}
                  onChange={(e) => setFormData({...formData, unit_code: e.target.value})}
                  placeholder="e.g., in, gr"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Conversion Factor</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.conversion_factor || ''}
                  onChange={(e) => setFormData({...formData, conversion_factor: parseFloat(e.target.value)})}
                  placeholder="e.g., 0.0254"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="is_base_unit"
                  checked={formData.is_base_unit || false}
                  onChange={(e) => setFormData({...formData, is_base_unit: e.target.checked})}
                />
                <Label htmlFor="is_base_unit">Is Base Unit</Label>
              </div>
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