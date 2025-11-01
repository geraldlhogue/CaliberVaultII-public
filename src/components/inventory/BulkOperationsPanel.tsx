/**
 * Bulk Operations Panel Component
 * UI for batch operations on inventory items
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { batchOperationsService } from '@/services/inventory/BatchOperationsService';
import { ItemCategory } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { Loader2, Copy, Trash2, MapPin, Edit } from 'lucide-react';

interface BulkOperationsPanelProps {
  selectedIds: string[];
  category: ItemCategory;
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedIds,
  category,
  userId,
  onComplete,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<string>('');

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;
    
    setLoading(true);
    setOperation('delete');
    
    try {
      const result = await batchOperationsService.bulkDelete(category, selectedIds, userId);
      
      toast({
        title: 'Bulk Delete Complete',
        description: `${result.successCount} deleted, ${result.failureCount} failed`,
        variant: result.success ? 'default' : 'destructive'
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Bulk Delete Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setOperation('');
    }
  };

  const handleBulkDuplicate = async () => {
    setLoading(true);
    setOperation('duplicate');
    
    try {
      const result = await batchOperationsService.bulkDuplicate(category, selectedIds, userId);
      
      toast({
        title: 'Bulk Duplicate Complete',
        description: `${result.successCount} duplicated, ${result.failureCount} failed`
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Bulk Duplicate Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setOperation('');
    }
  };

  const handleBulkMove = async () => {
    const locationId = prompt('Enter storage location ID:');
    if (!locationId) return;
    
    setLoading(true);
    setOperation('move');
    
    try {
      const result = await batchOperationsService.bulkMoveToLocation(
        category, 
        selectedIds, 
        locationId, 
        userId
      );
      
      toast({
        title: 'Bulk Move Complete',
        description: `${result.successCount} moved, ${result.failureCount} failed`
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Bulk Move Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setOperation('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 shadow-lg z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="text-white">
          <span className="font-bold">{selectedIds.length}</span> items selected
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleBulkDuplicate}
            disabled={loading}
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && operation === 'duplicate' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Duplicate
          </Button>
          
          <Button
            onClick={handleBulkMove}
            disabled={loading}
            variant="outline"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading && operation === 'move' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Move
          </Button>
          
          <Button
            onClick={handleBulkDelete}
            disabled={loading}
            variant="destructive"
          >
            {loading && operation === 'delete' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete
          </Button>
          
          <Button onClick={onCancel} variant="ghost" className="text-white">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
