import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scan, Loader2, CheckCircle2, XCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { barcodeService } from '@/services/barcode/BarcodeService';
import { toast } from 'sonner';
import { SimpleBarcodeScanner } from './SimpleBarcodeScanner';

interface EnhancedBarcodeScannerProps {
  onProductFound: (data: any) => void;
  onClose: () => void;
}

export function EnhancedBarcodeScanner({ onProductFound, onClose }: EnhancedBarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const loadStats = async () => {
    const cacheStats = await barcodeService.getCacheStats();
    const apiUsage = barcodeService.getApiUsage();
    setStats({ cache: cacheStats, api: apiUsage });
  };

  const handleScan = async (barcode: string) => {
    setLoading(true);
    try {
      const result = await barcodeService.lookup(barcode);
      setLastResult(result);

      if (result.success && result.data) {
        toast.success(`Product found via ${result.source}`, {
          description: result.data.title
        });
        onProductFound(result.data);
        await loadStats();
      } else {
        toast.error('Product not found', {
          description: result.error || 'Try entering details manually'
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Scan failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Enhanced Barcode Scanner</h3>
          <Button variant="ghost" size="sm" onClick={loadStats}>
            <Database className="h-4 w-4 mr-2" />
            Stats
          </Button>
        </div>

        {stats && (
          <div className="space-y-3 mb-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">API Usage Today</span>
                <span className="font-medium">
                  {stats.api.callsToday} / {stats.api.limit}
                </span>
              </div>
              <Progress value={stats.api.percentUsed} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cached Products</span>
              <Badge variant="secondary">{stats.cache.totalCached}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cache Hits</span>
              <Badge variant="secondary">{stats.cache.totalHits}</Badge>
            </div>
          </div>
        )}

        {lastResult && (
          <div className="mb-4 p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {lastResult.success ? 'Found' : 'Not Found'}
              </span>
              {lastResult.source === 'cache' ? (
                <Badge variant="outline">
                  <Database className="h-3 w-3 mr-1" />
                  Cached
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Wifi className="h-3 w-3 mr-1" />
                  API
                </Badge>
              )}
            </div>
            {lastResult.data && (
              <p className="text-sm text-muted-foreground">{lastResult.data.title}</p>
            )}
          </div>
        )}

        {!scanning ? (
          <Button onClick={() => setScanning(true)} className="w-full">
            <Scan className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        ) : (
          <SimpleBarcodeScanner
            onScan={handleScan}
            onClose={() => setScanning(false)}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Looking up product...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
