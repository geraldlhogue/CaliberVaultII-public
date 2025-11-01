import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventory.service';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface ManualValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  currentValue?: number;
  userId: string;
}

export const ManualValuationModal: React.FC<ManualValuationModalProps> = ({
  isOpen, onClose, itemId, itemName, currentValue, userId
}) => {
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (currentValue) {
        setEstimatedValue(currentValue.toString());
      }
    }
  }, [isOpen, itemId]);

  const loadHistory = async () => {
    try {
      const data = await inventoryService.getValuationHistory(itemId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load valuation history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estimatedValue || parseFloat(estimatedValue) <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid estimated value",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await inventoryService.saveValuation(
        itemId,
        userId,
        parseFloat(estimatedValue),
        confidenceLevel,
        notes
      );

      toast({
        title: "Valuation Saved",
        description: `New valuation of $${estimatedValue} has been recorded`
      });

      await loadHistory();
      setNotes('');
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save valuation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Manual Valuation - {itemName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Estimated Value *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="confidence">Confidence Level</Label>
            <select
              id="confidence"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this valuation..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Valuation'}
          </Button>
        </form>

        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Valuation History
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((val) => (
                <div key={val.id} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">
                        ${parseFloat(val.estimated_value).toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-600">
                        Confidence: {val.confidence_level}
                      </div>
                      {val.notes && (
                        <div className="text-sm text-slate-700 mt-1">{val.notes}</div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(val.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
