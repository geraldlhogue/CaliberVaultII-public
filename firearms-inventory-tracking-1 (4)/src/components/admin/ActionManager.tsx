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

interface FirearmAction {
  id: string;
  name: string;
  description?: string;
}

export function ActionManager() {
  const { toast } = useToast();
  const [actions, setActions] = useState<FirearmAction[]>([]);
  const [editingItem, setEditingItem] = useState<FirearmAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<FirearmAction>>({});

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('name');

    
    if (error) {
      console.error('Error loading actions:', error);
    } else if (data) {
      setActions(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Action name is required",
        variant: "destructive"
      });
      return;
    }
    
    const dataToSave = { 
      name: formData.name.trim(),
      description: formData.description?.trim() || null
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('actions')
          .update(dataToSave)
          .eq('id', editingItem.id);

          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Action "${formData.name}" updated`
        });
      } else {
        const { error } = await supabase
          .from('actions')
          .insert([dataToSave]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Action "${formData.name}" added`
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      await loadActions();
    } catch (error: any) {
      console.error('Error saving action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save action",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this firearm action?')) {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting action:', error);
        toast({
          title: "Error",
          description: "Failed to delete action",
          variant: "destructive"
        });
      } else {
        await loadActions();
      }
    }
  };

  const openEditDialog = (item: FirearmAction) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const filteredActions = actions.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Firearm Actions ({actions.length})</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search actions..."
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
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.name}</TableCell>
                <TableCell>{action.description || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(action)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(action.id)}>
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
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Firearm Action</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Semi-Auto, Bolt Action, Lever Action"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional description"
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