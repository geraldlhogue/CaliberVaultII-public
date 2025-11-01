import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Package, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory';

interface LocationCheckInOutProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  currentLocationId?: string;
  onTransferComplete: () => void;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

export default function LocationCheckInOut({ 
  isOpen, 
  onClose, 
  item, 
  currentLocationId,
  onTransferComplete 
}: LocationCheckInOutProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [transferType, setTransferType] = useState<'check_in' | 'check_out' | 'transfer'>('check_in');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, type')
      .eq('is_active', true)
      .order('name');
    
    if (!error && data) {
      setLocations(data);
    }
  };

  const handleTransfer = async () => {
    if (!selectedLocation && transferType !== 'check_out') {
      toast({ title: 'Please select a location', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const transferData = {
      user_id: user.id,
      item_id: item.id,
      from_location_id: transferType === 'check_in' ? null : currentLocationId,
      to_location_id: transferType === 'check_out' ? null : selectedLocation,
      transfer_type: transferType,
      notes,
      quantity: 1
    };

    const { error } = await supabase
      .from('inventory_transfers')
      .insert([transferData]);

    if (error) {
      toast({ title: 'Transfer failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Transfer successful', 
        description: `Item ${transferType.replace('_', ' ')} completed` 
      });
      onTransferComplete();
      onClose();
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Location Transfer - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span className="font-medium">{item.name}</span>
            </div>
            {item.serialNumber && (
              <div className="text-xs text-muted-foreground mt-1">
                Serial: {item.serialNumber}
              </div>
            )}
          </div>

          <div>
            <Label>Transfer Type</Label>
            <Select value={transferType} onValueChange={(v) => setTransferType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check_in">Check In to Location</SelectItem>
                <SelectItem value="check_out">Check Out from Location</SelectItem>
                <SelectItem value="transfer">Transfer Between Locations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferType !== 'check_out' && (
            <div>
              <Label>{transferType === 'transfer' ? 'Transfer To' : 'Check In To'}</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {loc.name} ({loc.type})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this transfer..."
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTransfer} 
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : 'Complete Transfer'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}