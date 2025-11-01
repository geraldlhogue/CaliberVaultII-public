import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Camera, Search, History, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ScanHistory {
  code: string;
  timestamp: string;
  product?: any;
}

export const MobileBarcodeScanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    loadHistory();
    if (scanning) startScanner();
    return () => stopScanner();
  }, [scanning]);

  const loadHistory = () => {
    const saved = localStorage.getItem('scan_history');
    if (saved) setHistory(JSON.parse(saved));
  };

  const saveToHistory = (code: string, product?: any) => {
    const newHistory = [{ code, timestamp: new Date().toISOString(), product }, ...history.slice(0, 19)];
    setHistory(newHistory);
    localStorage.setItem('scan_history', JSON.stringify(newHistory));
  };

  const lookupProduct = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('barcode', code)
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentProduct(data);
        saveToHistory(code, data);
        toast.success('Product found!');
      } else {
        saveToHistory(code);
        toast.error('Product not in inventory');
      }
    } catch (error: any) {
      saveToHistory(code);
      toast.error('Lookup failed: ' + error.message);
    }
  };

  const startScanner = async () => {
    try {
      const scanner = new Html5QrcodeScanner(
        "mobile-scanner",
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
        false
      );

      scanner.render(
        (decodedText) => {
          lookupProduct(decodedText);
          stopScanner();
          setScanning(false);
        },
        (error) => console.log('Scanning...', error)
      );

      scannerRef.current = scanner;
    } catch (err) {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      lookupProduct(manualCode.trim());
      setManualCode('');
    }
  };

  const addToInventory = () => {
    if (currentProduct) {
      toast.success('Added to inventory');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <Card className="min-h-screen rounded-none border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mobile Barcode Scanner</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>Scan or enter barcodes to lookup products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanning ? (
            <>
              <div id="mobile-scanner" className="w-full rounded-lg overflow-hidden"></div>
              <Button variant="destructive" className="w-full" onClick={() => { setScanning(false); stopScanner(); }}>
                Stop Camera
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => setScanning(true)}>
              <Camera className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-sm font-medium">Manual Entry</label>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode"
                className="text-lg"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {currentProduct && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg">{currentProduct.name}</h3>
                <p className="text-sm text-muted-foreground">{currentProduct.category}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addToInventory} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" /> Add to Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => setShowHistory(!showHistory)}>
              <History className="mr-2 h-4 w-4" />
              Scan History ({history.length})
            </Button>
            
            {showHistory && (
              <div className="space-y-2 max-h-64 overflow-auto">
                {history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-mono text-sm">{item.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {item.product && <Badge>Found</Badge>}
                  </div>
                ))}
                {history.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={() => { setHistory([]); localStorage.removeItem('scan_history'); }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear History
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
