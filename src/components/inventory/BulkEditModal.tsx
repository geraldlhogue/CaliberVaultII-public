import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ItemCategory } from '../../types/inventory';
import { supabase } from '@/lib/supabase';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (updates: BulkEditUpdates) => void;
  selectedCount: number;
  uniqueManufacturers: string[];
}

export interface BulkEditUpdates {
  category?: ItemCategory;
  storageLocation?: string;
  manufacturer?: string;
  currentValue?: number;
  notes?: string;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedCount,
  uniqueManufacturers,
}) => {
  const [updates, setUpdates] = useState<BulkEditUpdates>({});
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData();
    }
  }, [isOpen]);

  const fetchReferenceData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const [locRes, catRes] = await Promise.all([
      user ? supabase.from('locations').select('*').eq('user_id', user.id).order('name') 
           : supabase.from('locations').select('*').order('name'),
      supabase.from('categories').select('*').order('name')
    ]);

    if (locRes.data) setLocations(locRes.data);
    if (catRes.data) setCategories(catRes.data);
  };

  const validateUpdates = (): boolean => {
    const errors: string[] = [];
    
    if (updates.currentValue !== undefined) {
      if (isNaN(updates.currentValue) || updates.currentValue < 0) {
        errors.push('Current value must be a positive number');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleApply = () => {
    if (Object.keys(updates).length === 0) {
      return;
    }
    
    if (!validateUpdates()) {
      return;
    }
    
    // Clean numeric values
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.currentValue !== undefined) {
      cleanedUpdates.currentValue = parseFloat(cleanedUpdates.currentValue.toString()) || 0;
    }
    
    onApply(cleanedUpdates);
    setUpdates({});
    setValidationErrors([]);
    onClose();
  };

  const hasChanges = Object.keys(updates).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Edit {selectedCount} Items</DialogTitle>
        </DialogHeader>
        
        {validationErrors.length > 0 && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg">
            {validationErrors.join(', ')}
          </div>
        )}
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-slate-300 mb-2">Category</Label>
            <Select
              value={updates.category || ''}
              onValueChange={(value) => setUpdates({ ...updates, category: value as ItemCategory })}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Keep current" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2">Storage Location</Label>
            <Select
              value={updates.storageLocation || ''}
              onValueChange={(value) => setUpdates({ ...updates, storageLocation: value })}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Keep current" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2">Manufacturer</Label>
            <Select
              value={updates.manufacturer || ''}
              onValueChange={(value) => setUpdates({ ...updates, manufacturer: value })}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Keep current" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {uniqueManufacturers.map(mfr => (
                  <SelectItem key={mfr} value={mfr}>{mfr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2">Current Value</Label>
            <Input
              type="number"
              step="0.01"
              value={updates.currentValue || ''}
              onChange={(e) => setUpdates({ ...updates, currentValue: parseFloat(e.target.value) || 0 })}
              placeholder="Keep current"
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <div>
            <Label className="text-slate-300 mb-2">Notes</Label>
            <Input
              value={updates.notes || ''}
              onChange={(e) => setUpdates({ ...updates, notes: e.target.value })}
              placeholder="Keep current"
              className="bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleApply} disabled={!hasChanges} className="bg-yellow-600 hover:bg-yellow-700">
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};