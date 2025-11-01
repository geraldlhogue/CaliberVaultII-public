import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { exportPhotosAsZip, PhotoExportProgress } from '../../utils/photoExport';
import { Download, FileText, Image, CheckCircle2 } from 'lucide-react';

interface PhotoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

export const PhotoExportModal: React.FC<PhotoExportModalProps> = ({ isOpen, onClose, items }) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<ItemCategory>>(new Set());
  const [metadataInFilename, setMetadataInFilename] = useState(true);
  const [generateManifest, setGenerateManifest] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<PhotoExportProgress | null>(null);
  const [exportComplete, setExportComplete] = useState(false);

  const categories: { id: ItemCategory; label: string }[] = [
    { id: 'firearms', label: 'Firearms' },
    { id: 'optics', label: 'Optics' },
    { id: 'magazines', label: 'Magazines' },
    { id: 'ammunition', label: 'Ammunition' },
    { id: 'reloading', label: 'Reloading' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const toggleCategory = (cat: ItemCategory) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setSelectedCategories(newSet);
  };

  const filteredItems = selectedCategories.size > 0
    ? items.filter(item => selectedCategories.has(item.category))
    : items;

  const totalPhotos = filteredItems.reduce((sum, item) => sum + (item.images?.length || 0), 0);

  const handleExport = async () => {
    if (filteredItems.length === 0) return;
    
    setIsExporting(true);
    setExportComplete(false);
    
    try {
      await exportPhotosAsZip(
        filteredItems,
        { includeMetadata: true, metadataInFilename, generateManifest },
        setProgress
      );
      setExportComplete(true);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Download className="w-6 h-6 text-yellow-500" />
            Export Photos as ZIP
          </DialogTitle>
        </DialogHeader>

        {!isExporting && !exportComplete && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Filter by Category</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategories.has(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <Label htmlFor={cat.id} className="cursor-pointer">{cat.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold">Export Options</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={metadataInFilename}
                  onCheckedChange={(checked) => setMetadataInFilename(!!checked)}
                />
                <Label htmlFor="metadata" className="cursor-pointer">
                  Include metadata in filenames (item name, serial number)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manifest"
                  checked={generateManifest}
                  onCheckedChange={(checked) => setGenerateManifest(!!checked)}
                />
                <Label htmlFor="manifest" className="cursor-pointer">
                  Generate CSV manifest file
                </Label>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items to export:</span>
                <span className="font-bold">{filteredItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total photos:</span>
                <span className="font-bold">{totalPhotos}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleExport} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                <Download className="w-4 h-4 mr-2" />
                Export ZIP
              </Button>
              <Button onClick={onClose} variant="outline">Cancel</Button>
            </div>
          </div>
        )}

        {isExporting && progress && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-pulse" />
              <p className="text-lg font-semibold mb-2">Exporting photos...</p>
              <p className="text-sm text-slate-400">{progress.itemName}</p>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-center text-sm text-slate-400">
              {progress.current} of {progress.total} photos
            </p>
          </div>
        )}

        {exportComplete && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl font-bold">Export Complete!</h3>
            <p className="text-slate-400">Your photos have been downloaded as a ZIP file.</p>
            <Button onClick={onClose} className="bg-yellow-600 hover:bg-yellow-700">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
