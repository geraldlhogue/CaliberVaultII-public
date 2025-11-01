import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Trash2, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SimpleBarcodeScanner } from './SimpleBarcodeScanner';

interface ScannedItem {
  barcode: string;
  timestamp: Date;
  status: 'pending' | 'processed' | 'error';
}

export function BarcodeBatchScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleScan = (barcode: string) => {
    const exists = scannedItems.find(item => item.barcode === barcode);
    if (exists) {
      toast.warning('Barcode already scanned');
      return;
    }

    const newItem: ScannedItem = {
      barcode,
      timestamp: new Date(),
      status: 'pending'
    };

    setScannedItems(prev => [...prev, newItem]);
    toast.success(`Scanned: ${barcode}`);
  };

  const processAll = async () => {
    setProcessing(true);
    
    for (let i = 0; i < scannedItems.length; i++) {
      if (scannedItems[i].status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setScannedItems(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'processed' as const } : item
        ));
      }
    }
    
    setProcessing(false);
    toast.success('All items processed');
  };

  const clearAll = () => {
    setScannedItems([]);
    toast.info('Cleared all scans');
  };

  const exportData = () => {
    const csv = scannedItems.map(item => 
      `${item.barcode},${item.timestamp.toISOString()},${item.status}`
    ).join('\n');
    
    const blob = new Blob([`Barcode,Timestamp,Status\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-scan-${Date.now()}.csv`;
    a.click();
    toast.success('Exported batch scan data');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Batch Barcode Scanner</span>
          <div className="flex gap-2">
            <Button onClick={() => setScanning(!scanning)} variant={scanning ? 'destructive' : 'default'}>
              <Scan className="w-4 h-4 mr-2" />
              {scanning ? 'Stop' : 'Start'} Scanning
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning && (
          <SimpleBarcodeScanner
            onScan={handleScan}
            onClose={() => setScanning(false)}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {scannedItems.length} items scanned
          </div>
          <div className="flex gap-2">
            <Button onClick={processAll} disabled={processing || scannedItems.length === 0} size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Process All
            </Button>
            <Button onClick={exportData} disabled={scannedItems.length === 0} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={clearAll} disabled={scannedItems.length === 0} size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {scannedItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-mono font-semibold">{item.barcode}</div>
                <div className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <Badge variant={
                item.status === 'processed' ? 'default' :
                item.status === 'error' ? 'destructive' : 'secondary'
              }>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
