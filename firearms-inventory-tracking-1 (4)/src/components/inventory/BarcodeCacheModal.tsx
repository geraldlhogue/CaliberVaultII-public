import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Database, Download, Upload, Trash2, TrendingUp } from 'lucide-react';
import { barcodeService } from '@/services/barcode/BarcodeService';
import { barcodeCache } from '@/lib/barcodeCache';
import { toast } from 'sonner';

interface BarcodeCacheModalProps {
  open: boolean;
  onClose: () => void;
}

export function BarcodeCacheModal({ open, onClose }: BarcodeCacheModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadStats();
    }
  }, [open]);

  const loadStats = async () => {
    const cacheStats = await barcodeService.getCacheStats();
    const apiUsage = barcodeService.getApiUsage();
    setStats({ cache: cacheStats, api: apiUsage });
  };

  const handleExport = async () => {
    try {
      const json = await barcodeCache.exportCache();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-cache-${new Date().toISOString()}.json`;
      a.click();
      toast.success('Cache exported successfully');
    } catch (error) {
      toast.error('Export failed', { description: error.message });
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await barcodeCache.importCache(text);
        await loadStats();
        toast.success('Cache imported successfully');
      } catch (error) {
        toast.error('Import failed', { description: error.message });
      }
    };
    input.click();
  };

  const handleClear = async () => {
    if (confirm('Clear all cached barcode data?')) {
      setLoading(true);
      try {
        await barcodeCache.clear();
        await loadStats();
        toast.success('Cache cleared');
      } catch (error) {
        toast.error('Clear failed', { description: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Barcode Cache Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Cache Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Cached</p>
                <p className="text-2xl font-bold">{stats.cache.totalCached}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hits</p>
                <p className="text-2xl font-bold">{stats.cache.totalHits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Calls Today</p>
                <p className="text-2xl font-bold">{stats.api.callsToday}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Remaining</p>
                <p className="text-2xl font-bold">{stats.api.remaining}</p>
              </div>
            </div>
          </Card>

          {stats.cache.mostUsed.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Most Used Products
              </h3>
              <div className="space-y-2">
                {stats.cache.mostUsed.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <Badge variant="secondary">{item.hitCount} hits</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleImport} variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={handleClear} 
              variant="destructive" 
              disabled={loading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
