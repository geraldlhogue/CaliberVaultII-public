import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { AttributeFields } from './AttributeFields';
import { DirectPhotoUpload } from './DirectPhotoUpload';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { EnhancedPhotoCapture } from './EnhancedPhotoCapture';
import { useSubscription } from '@/hooks/useSubscription';
import { logError } from '@/lib/errorHandler';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: any) => void;
  initialData?: Partial<any>;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAdd, initialData }) => {
  const subscription = useSubscription();
  const isEditMode = !!initialData?.id;
  const [category, setCategory] = useState<ItemCategory | ''>(initialData?.category || 'firearms');
  const [formData, setFormData] = useState<any>({
    firearmSubcategory: 'centerfire-rifle',
    quantity: '1',
    storageLocation: initialData?.storageLocation || '',
    serialNumber: initialData?.serialNumber || '',
    purchasePrice: initialData?.purchasePrice || '',
    cartridge: initialData?.cartridge || '',
    caliber: initialData?.caliber || '',
    action: initialData?.action || '',
    barrelLength: initialData?.barrelLength || '',
    ...initialData,
  });
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const handlePhotoCapture = (dataUrl: string) => {
    setImages([...images, dataUrl]);
    toast.success("Photo captured successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditMode && !subscription.canAddItem()) {
      toast.error(`Item Limit Reached - Upgrade to add more than ${subscription.itemLimit} items`);
      return;
    }
    
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    
    if (!formData.manufacturer) {
      toast.error("Please select a manufacturer");
      return;
    }
    
    if (!formData.model && !formData.modelNumber) {
      toast.error("Please enter a model");
      return;
    }

    try {
      const modelValue = formData.model || formData.modelNumber || '';
      const itemName = formData.name || 
                       (formData.manufacturer && modelValue ? 
                        `${formData.manufacturer} ${modelValue}` : 
                        formData.manufacturer || 'New Item');
      
      const cleanNumeric = (value: any) => {
        if (value === '' || value === null || value === undefined) return undefined;
        if (typeof value === 'number') return value;
        const num = parseFloat(String(value));
        return isNaN(num) ? undefined : num;
      };
      
      const cleanInteger = (value: any) => {
        if (value === '' || value === null || value === undefined) return undefined;
        if (typeof value === 'number') return Math.floor(value);
        const num = parseInt(String(value), 10);
        return isNaN(num) ? undefined : num;
      };
      
      const itemToAdd = {
        name: itemName,
        category: category || 'firearms',
        storageLocation: formData.storageLocation || undefined,
        manufacturer: formData.manufacturer || undefined,
        model: modelValue || undefined,
        modelNumber: modelValue || undefined,
        serialNumber: formData.serialNumber || undefined,
        purchasePrice: cleanNumeric(formData.purchasePrice),
        currentValue: cleanNumeric(formData.currentValue || formData.purchasePrice),
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        quantity: cleanInteger(formData.quantity) || 1,
        cartridge: formData.cartridge || undefined,
        caliber: formData.caliber || undefined,
        action_id: formData.action_id && formData.action_id !== '' ? formData.action_id : null,
        barrelLength: formData.barrelLength || undefined,


        barrelLengthValue: cleanNumeric(formData.barrelLengthValue),
        barrelLengthUom: formData.barrelLengthUom || undefined,
        firearmSubcategory: formData.firearmSubcategory || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        barcode: formData.barcode || undefined,
        upc: formData.upc || undefined,
        lotNumber: formData.lotNumber || undefined,
        images: images || [],
        roundCount: cleanInteger(formData.roundCount),
        bulletType: formData.bulletType || undefined,
        grainWeight: formData.grainWeight || undefined,
        grainWeightValue: cleanNumeric(formData.grainWeightValue),
        grainWeightUom: formData.grainWeightUom || undefined,
        magnification: formData.magnification || undefined,
        objectiveLens: formData.objectiveLens || undefined,
        objectiveLensValue: cleanNumeric(formData.objectiveLensValue),
        objectiveLensUom: formData.objectiveLensUom || undefined,
        reticleType: formData.reticleType || undefined,
        componentType: formData.componentType || undefined,
        compatibility: formData.compatibility || undefined,
      };
      
      await onAdd(itemToAdd);
      toast.success(`${itemName} added to inventory`);
      onClose();
    } catch (error: any) {
      console.error('Error in AddItemModal:', error);
      logError(error, {
        component: 'AddItemModal',
        action: 'handleSubmit',
        category,
        formData: { ...formData, images: `[${images.length} images]` }
      });
      toast.error(error?.message || "Failed to save item");
    }
  };

  if (showPhotoCapture) {
    return <EnhancedPhotoCapture onCapture={handlePhotoCapture} onClose={() => setShowPhotoCapture(false)} allowMultiple={true} />;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full p-4 my-4 max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Item' : 'Add New Item'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <AttributeFields 
            category={category}
            formData={formData}
            setFormData={setFormData}
            setCategory={setCategory}
            categoryManufacturers={[]}
            onProductDataReceived={(productData) => {
              setFormData({
                ...formData,
                manufacturer: productData.manufacturer || formData.manufacturer,
                model: productData.model || formData.model,
                modelNumber: productData.model || formData.modelNumber,
                name: productData.name || formData.name,
                description: productData.description || formData.description,
                purchasePrice: productData.purchasePrice || formData.purchasePrice,
                caliber: productData.caliber || formData.caliber,
              });
              if (productData.category) {
                setCategory(productData.category as ItemCategory);
              }
              if (productData.images && productData.images.length > 0) {
                setImages([...images, ...productData.images]);
              }
            }}
          />
          
          <div className="border-t border-slate-700 pt-6">
            <label className="block text-slate-300 mb-2 font-medium text-lg">Item Description</label>
            <textarea
              className="w-full p-4 bg-slate-900 text-white rounded-lg border-2 border-slate-700 focus:border-yellow-500 text-base"
              rows={4}
              placeholder="Enter a detailed description..."
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="border-t border-slate-700 pt-6">
            <label className="block text-slate-300 mb-3 font-medium text-lg">Photos (Optional)</label>
            <div className="flex gap-3 mb-3">
              <button 
                type="button"
                onClick={() => setShowPhotoCapture(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Take Photo
              </button>
            </div>
            <DirectPhotoUpload images={images} onImagesChange={setImages} maxImages={10} />
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              {isEditMode ? 'Update Item' : 'Add Item'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
