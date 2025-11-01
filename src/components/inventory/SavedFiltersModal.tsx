import React, { useState } from 'react';
import { FilterPreset } from '@/types/filters';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Trash2 } from 'lucide-react';

interface SavedFiltersModalProps {
  presets: FilterPreset[];
  onClose: () => void;
  onApply: (preset: FilterPreset) => void;
  onDelete: (id: string) => void;
  onSave: (name: string) => void;
  currentFilters: any;
}

export function SavedFiltersModal({ presets, onClose, onApply, onDelete, onSave, currentFilters }: SavedFiltersModalProps) {
  const [newPresetName, setNewPresetName] = useState('');

  const handleSave = () => {
    if (newPresetName.trim()) {
      onSave(newPresetName.trim());
      setNewPresetName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Saved Filters</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Save Current Filters */}
          <div className="bg-slate-900 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-3">Save Current Filters</h3>
            <div className="flex gap-2">
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="flex-1"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>

          {/* Saved Presets */}
          <div>
            <h3 className="text-white font-semibold mb-3">Your Presets</h3>
            {presets.length === 0 ? (
              <p className="text-slate-400">No saved presets yet</p>
            ) : (
              <div className="space-y-2">
                {presets.map(preset => (
                  <div key={preset.id} className="bg-slate-900 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{preset.name}</h4>
                      <p className="text-slate-400 text-sm">
                        {preset.categories.length > 0 && `${preset.categories.length} categories`}
                        {preset.priceMin && ` • $${preset.priceMin}-${preset.priceMax}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => onApply(preset)} size="sm">Apply</Button>
                      <Button onClick={() => onDelete(preset.id)} variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
