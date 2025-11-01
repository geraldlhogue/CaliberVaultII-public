import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
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

interface StorageLocation {
  id: string;
  name: string;
  description?: string;
  type?: string;
  building?: string;
  room?: string;
  address?: string;
  is_active?: boolean;
  user_id: string;
  created_at?: string;
}

export function StorageLocationManager() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [editingItem, setEditingItem] = useState<StorageLocation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<StorageLocation>>({});

  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  const loadLocations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load locations',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) return;
    
    const dataToSave = { 
      ...formData,
      name: formData.name.trim(),
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('locations')
          .update(dataToSave)
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Location "${formData.name}" updated`
        });
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([dataToSave]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Location "${formData.name}" added`
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      await loadLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save location",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this storage location? This action cannot be undone if the location is not in use.')) {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', id);
          
        if (error) {
          if (error.message.includes('violates foreign key constraint')) {
            toast({
              title: "Cannot Delete",
              description: "This location is being used and cannot be deleted",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          return;
        }
        
        toast({
          title: "Success",
          description: "Location deleted successfully"
        });
        await loadLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
        toast({
          title: "Error",
          description: "Failed to delete location",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (item: StorageLocation) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({
      type: 'Safe',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Storage Locations ({locations.length})</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search locations..."
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
              <TableHead>Building</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.type || 'General'}</TableCell>
                <TableCell>{location.building || '-'}</TableCell>
                <TableCell>{location.room || '-'}</TableCell>
                <TableCell>{location.description || '-'}</TableCell>
                <TableCell>{location.is_active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(location)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)}>
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
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Storage Location</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Gun Safe, Ammo Cabinet"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Safe">Safe</SelectItem>
                  <SelectItem value="Cabinet">Cabinet</SelectItem>
                  <SelectItem value="Room">Room</SelectItem>
                  <SelectItem value="Closet">Closet</SelectItem>
                  <SelectItem value="Garage">Garage</SelectItem>
                  <SelectItem value="Basement">Basement</SelectItem>
                  <SelectItem value="Attic">Attic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Building</Label>
                <Input
                  value={formData.building || ''}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  placeholder="e.g., Main House, Garage"
                />
              </div>
              <div>
                <Label>Room</Label>
                <Input
                  value={formData.room || ''}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="e.g., Master Bedroom, Office"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Optional: Full address if different from primary"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional details about this location"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <Label htmlFor="is_active">Active Location</Label>
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