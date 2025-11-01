import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BatchValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: any[];
  onComplete: () => void;
}

export default function BatchValuationModal({ isOpen, onClose, selectedItems, onComplete }: BatchValuationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const handleBatchValuation = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const items = selectedItems.map(item => ({
        itemId: item.id,
        itemType: item.category,
        manufacturer: item.manufacturer,
        model: item.model,
        condition: item.condition,
        yearManufactured: item.year_manufactured,
        caliber: item.caliber,
        accessories: item.accessories
      }));

      const { data, error } = await supabase.functions.invoke('ai-valuation', {
        body: { items, saveHistory: true }
      });

      if (error) throw error;

      setResults(data.results);
      setProgress(100);
      toast.success(`Successfully valued ${selectedItems.length} items`);
      onComplete();
    } catch (error: any) {
      toast.error(`Batch valuation failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Batch AI Valuation - {selectedItems.length} Items
          </DialogTitle>
        </DialogHeader>

        {!isProcessing && results.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run AI valuation on {selectedItems.length} selected items. This will generate market value estimates and save them to history.
            </p>
            <Button onClick={handleBatchValuation} className="w-full">
              Start Batch Valuation
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <Progress value={progress} />
            <p className="text-sm text-center">Processing valuations...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedItems[idx]?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedItems[idx]?.model}</p>
                  </div>
                  <Badge variant={result.valuation.confidenceLevel === 'high' ? 'default' : 'secondary'}>
                    {result.valuation.confidenceLevel} confidence
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold">${result.valuation.estimatedValue.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">
                    (${result.valuation.valueRange.min.toLocaleString()} - ${result.valuation.valueRange.max.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
