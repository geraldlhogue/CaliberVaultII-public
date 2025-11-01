import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import QRCodeGenerator from './QRCodeGenerator';


interface Location {
  id: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
  qr_code?: string;
  is_active: boolean;
}

export default function LocationManager() {
  const subscription = useSubscription();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [qrModalLocation, setQrModalLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'safe',
    address: '',
    description: ''
  });


  useEffect(() => {
    fetchLocations();
  }, []);
  const fetchLocations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please sign in to view locations', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error fetching locations:', error);
      toast({ title: 'Error fetching locations', variant: 'destructive' });
      return;
    }
    
    setLocations(data || []);
  };
  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check location limit before adding (skip in edit mode)
    if (!editingLocation && !subscription.canAddLocation()) {
      toast({ 
        title: 'Location Limit Reached',
        description: `You've reached your limit of ${subscription.locationLimit} locations. Upgrade to add more.`,
        variant: 'destructive' 
      });
      return;
    }

    const locationData = {
      ...formData,
      user_id: user.id,
      qr_code: `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };


    if (editingLocation) {
      const { error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', editingLocation.id);
      
      if (!error) {
        toast({ title: 'Location updated successfully' });
        fetchLocations();
      }
    } else {
      const { error } = await supabase
        .from('locations')
        .insert([locationData]);
      
      if (!error) {
        toast({ title: 'Location added successfully' });
        fetchLocations();
      }
    }

    setIsAddModalOpen(false);
    setEditingLocation(null);
    setFormData({ name: '', type: 'safe', address: '', description: '' });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast({ title: 'Location deleted' });
      fetchLocations();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Location Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {location.name}
                </span>
                <span className="text-sm text-muted-foreground">{location.type}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {location.address && <p className="text-sm mb-2">{location.address}</p>}
              {location.description && <p className="text-sm text-muted-foreground mb-4">{location.description}</p>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setQrModalLocation(location)}>
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingLocation(location);
                  setFormData({
                    name: location.name,
                    type: location.type,
                    address: location.address || '',
                    description: location.description || ''
                  });
                  setIsAddModalOpen(true);
                }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(location.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit' : 'Add'} Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="cupboard">Cupboard</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address (Optional)</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingLocation ? 'Update' : 'Add'} Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {qrModalLocation && (
        <QRCodeGenerator
          isOpen={!!qrModalLocation}
          onClose={() => setQrModalLocation(null)}
          data={qrModalLocation.qr_code || ''}
          label={`Location: ${qrModalLocation.name}`}
          type="location"
        />
      )}
    </div>
  );
}