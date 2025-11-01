import React, { useState } from 'react';
import { ItemCategory } from '../../types/inventory';
import { Button } from '../ui/button';
import { X, Trash2, FolderEdit, MapPin, Download, Images, Edit, Undo, Redo, Printer, Sparkles } from 'lucide-react';



interface SelectionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkUpdateCategory: (category: ItemCategory) => void;
  onBulkUpdateLocation: (location: string) => void;
  onExportSelected: () => void;
  onExportPhotos: () => void;
  onBulkEdit: () => void;
  onPrintLabels?: () => void;
  onBatchValuation?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}




export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkUpdateCategory,
  onBulkUpdateLocation,
  onExportSelected,
  onExportPhotos,
  onBulkEdit,
  onPrintLabels,
  onBatchValuation,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {



  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const categories: { id: ItemCategory; label: string }[] = [
    { id: 'firearms', label: 'Firearms' },
    { id: 'optics', label: 'Optics' },
    { id: 'magazines', label: 'Magazines' },
    { id: 'ammunition', label: 'Ammunition' },
    { id: 'reloading', label: 'Reloading' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const handleLocationSubmit = () => {
    if (newLocation.trim()) {
      onBulkUpdateLocation(newLocation.trim());
      setNewLocation('');
      setShowLocationInput(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-600 border-t-4 border-yellow-500 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-white hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onUndo && (
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                className="bg-white text-yellow-600 hover:bg-slate-100 disabled:opacity-50"
                size="sm"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
            )}

            {onRedo && (
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                className="bg-white text-yellow-600 hover:bg-slate-100 disabled:opacity-50"
                size="sm"
              >
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </Button>
            )}
            {onPrintLabels && (
              <Button
                onClick={onPrintLabels}
                className="bg-white text-yellow-600 hover:bg-slate-100"
                size="sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Labels
              </Button>
            )}

            {onBatchValuation && (
              <Button
                onClick={onBatchValuation}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Valuation
              </Button>
            )}

            <Button
              onClick={onBulkEdit}
              className="bg-white text-yellow-600 hover:bg-slate-100"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Bulk Edit
            </Button>



            <Button
              onClick={onBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionToolbar;

