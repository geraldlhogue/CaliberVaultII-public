import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, Plus, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { barcodeService, BatchLookupResult } from '@/services/barcode/BarcodeService';
import { toast } from 'sonner';

interface BatchBarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onProductsFound: (products: any[]) => void;
}

export function BatchBarcodeScannerModal({ 
  open, 
  onClose, 
  onProductsFound 
}: BatchBarcodeScannerModalProps) {
  const [barcodes, setBarcodes] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchLookupResult[]>([]);
  const [progress, setProgress] = useState(0);

  const addBarcode = () => {
    setBarcodes([...barcodes, '']);
  };

  const removeBarcode = (index: number) => {
    setBarcodes(barcodes.filter((_, i) => i !== index));
  };

  const updateBarcode = (index: number, value: string) => {
    const updated = [...barcodes];
    updated[index] = value;
    setBarcodes(updated);
  };

  const handleBatchLookup = async () => {
    const validBarcodes = barcodes.filter(b => b.trim().length > 0);
    
    if (validBarcodes.length === 0) {
      toast.error('Please enter at least one barcode');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const lookupResults = await barcodeService.batchLookup(validBarcodes);
      setResults(lookupResults);
      setProgress(100);

      const successful = lookupResults.filter(r => r.result.success);
      const failed = lookupResults.filter(r => !r.result.success);

      toast.success(`Batch lookup complete`, {
        description: `${successful.length} found, ${failed.length} not found`
      });

      // Pass successful products to parent
      const products = successful
        .map(r => r.result.data)
        .filter(Boolean);
      
      if (products.length > 0) {
        onProductsFound(products);
      }
    } catch (error) {
      console.error('Batch lookup error:', error);
      toast.error('Batch lookup failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.result.success).length;
  const failCount = results.filter(r => !r.result.success).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Barcode Lookup</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {barcodes.map((barcode, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Enter barcode/UPC"
                  value={barcode}
                  onChange={(e) => updateBarcode(index, e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBarcode(index)}
                  disabled={loading || barcodes.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addBarcode}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Barcode
          </Button>

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Looking up products...
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {successCount} Found
                </Badge>
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {failCount} Not Found
                </Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm">{result.barcode}</p>
                        {result.result.success ? (
                          <p className="text-sm text-muted-foreground">
                            {result.result.data?.title}
                          </p>
                        ) : (
                          <p className="text-sm text-red-500">
                            {result.result.error}
                          </p>
                        )}
                      </div>
                      {result.result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleBatchLookup}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Scan className="h-4 w-4 mr-2" />
              )}
              Lookup All
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
