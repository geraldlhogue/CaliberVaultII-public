import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Scan, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types/inventory';

interface LocationBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onLocationAssigned: () => void;
}

export default function LocationBarcodeScanner({ 
  isOpen, 
  onClose, 
  item,
  onLocationAssigned 
}: LocationBarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedLocation, setScannedLocation] = useState<any>(null);

  const handleScan = async (code: string) => {
    setScanning(true);
    
    try {
      // Parse QR code data
      const locationData = JSON.parse(code);
      
      // Verify location exists in database
      const { data: location, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationData.id)
        .single();

      if (error || !location) {
        toast({ title: 'Invalid location code', variant: 'destructive' });
        return;
      }

      setScannedLocation(location);
      toast({ title: 'Location scanned successfully', description: location.name });
    } catch (err) {
      toast({ title: 'Invalid QR code format', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const assignLocation = async () => {
    if (!scannedLocation) return;

    const { error } = await supabase
      .from('inventory_items')
      .update({ location_id: scannedLocation.id })
      .eq('id', item.id);

    if (error) {
      toast({ title: 'Failed to assign location', variant: 'destructive' });
    } else {
      toast({ title: 'Location assigned', description: `Item moved to ${scannedLocation.name}` });
      onLocationAssigned();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Location Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.serialNumber}</p>
          </div>

          {!scannedLocation ? (
            <div className="text-center py-8">
              <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Scan a location QR code or barcode
              </p>
              <Button 
                onClick={() => {
                  const code = prompt('Enter location code:');
                  if (code) handleScan(code);
                }}
                className="mt-4"
              >
                Manual Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Location Found</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{scannedLocation.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type: {scannedLocation.type}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={assignLocation} className="flex-1">
                  Assign Location
                </Button>
                <Button onClick={() => setScannedLocation(null)} variant="outline">
                  Scan Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
