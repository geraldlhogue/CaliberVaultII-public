import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { AttributeFields } from './AttributeFields';
import { DirectPhotoUpload } from './DirectPhotoUpload';

import { useAppContext } from '@/contexts/AppContext';

import { toast } from 'sonner';

interface EditItemModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate?: (id: string, item: InventoryItem) => Promise<void>;
}


export const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose, onUpdate }) => {
  const { updateCloudItem, user } = useAppContext();
  const [formData, setFormData] = useState<any>({});
  const [category, setCategory] = useState<ItemCategory>(item.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) {
      setError('No item data provided');
      return;
    }

    // Initialize form with item data - ensure all fields have values
    setFormData({
      name: item.name || '',
      manufacturer: item.manufacturer || '',
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      storageLocation: item.storageLocation || '',
      purchasePrice: item.purchasePrice ?? '',
      purchaseDate: item.purchaseDate || '',
      currentValue: item.currentValue ?? '',
      description: item.description || '',
      notes: item.notes || '',
      upc: item.upc || '',
      lotNumber: item.lotNumber || '',
      // Firearms
      caliber: item.caliber || '',
      cartridge: item.cartridge || '',
      action: item.action || '',
      barrelLengthValue: item.barrelLength ? parseFloat(item.barrelLength) : '',
      barrelLengthUom: 'in',
      capacity: item.capacity || '',
      // Ammunition
      ammoType: item.ammoType || '',
      grainWeight: item.grainWeight ? parseFloat(item.grainWeight) : '',
      roundCount: item.roundCount || '',
      numBoxes: item.numBoxes || '',
      roundsPerBox: item.roundsPerBox || '',
      bulletType: item.bulletType || '',
      caseType: item.caseType || '',
      primerType: item.primerType || '',
      powderType: item.powderType || '',
      powderCharge: item.powderCharge || '',
      // Optics
      magnification: item.magnification || '',
      objectiveLens: item.objectiveLens ? parseFloat(item.objectiveLens) : '',
      reticleType: item.reticleType || '',
      opticType: item.opticType || '',
      turretType: item.turretType || '',
      fieldOfView: item.fieldOfView || '',
      // Suppressors
      mountingType: item.mountingType || '',
      threadPitch: item.threadPitch || '',
      length: item.length ? parseFloat(item.length) : '',
      weight: item.weight ? parseFloat(item.weight) : '',
      material: item.material || '',
      soundReduction: item.soundReduction || '',
      fullAutoRated: item.fullAutoRated || false,
      modular: item.modular || false,
      // Accessories
      compatibility: item.compatibility || '',
      quantity: item.quantity || 1,
      images: Array.isArray(item.images) ? item.images : []
    });
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Build updated item object
      const updatedItem: InventoryItem = {
        ...item,
        name: formData.name.trim(),
        manufacturer: formData.manufacturer?.trim() || '',
        modelNumber: formData.modelNumber?.trim() || '',
        serialNumber: formData.serialNumber?.trim() || '',
        storageLocation: formData.storageLocation?.trim() || '',
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        purchaseDate: formData.purchaseDate || '',
        currentValue: parseFloat(formData.currentValue) || parseFloat(formData.purchasePrice) || 0,
        description: formData.description?.trim() || '',
        notes: formData.notes?.trim() || '',
        upc: formData.upc?.trim() || '',
        lotNumber: formData.lotNumber?.trim() || '',
        images: formData.images || [],
        category,
        // Category-specific fields
        caliber: formData.caliber || '',
        cartridge: formData.cartridge || '',
        action: formData.action || '',
        barrelLength: formData.barrelLengthValue ? `${formData.barrelLengthValue}` : '',
        barrelLengthValue: formData.barrelLengthValue || undefined,
        capacity: formData.capacity || '',
        ammoType: formData.ammoType || '',
        grainWeight: formData.grainWeight ? `${formData.grainWeight}gr` : '',
        grainWeightValue: formData.grainWeight || undefined,
        roundCount: formData.roundCount || 0,
        numBoxes: formData.numBoxes || 0,
        roundsPerBox: formData.roundsPerBox || 0,
        bulletType: formData.bulletType || '',
        caseType: formData.caseType || '',
        primerType: formData.primerType || '',
        powderType: formData.powderType || '',
        powderCharge: formData.powderCharge || '',
        magnification: formData.magnification || '',
        objectiveLens: formData.objectiveLens ? `${formData.objectiveLens}mm` : '',
        objectiveLensValue: formData.objectiveLens || undefined,
        reticleType: formData.reticleType || '',
        opticType: formData.opticType || '',
        turretType: formData.turretType || '',
        fieldOfView: formData.fieldOfView || '',
        mountingType: formData.mountingType || '',
        threadPitch: formData.threadPitch || '',
        length: formData.length ? `${formData.length}"` : '',
        weight: formData.weight ? `${formData.weight}oz` : '',
        material: formData.material || '',
        soundReduction: formData.soundReduction || '',
        fullAutoRated: formData.fullAutoRated || false,
        modular: formData.modular || false,
        compatibility: formData.compatibility || '',
        quantity: formData.quantity || 1,
      };

      if (user) {
        // Update in cloud
        await updateCloudItem(item.id, updatedItem);
      } else if (onUpdate) {
        // Update locally
        await onUpdate(item.id, updatedItem);
      }

      
      toast.success('Item updated successfully');
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update item');
      toast.error(err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">×</button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AttributeFields 
            category={category}
            formData={formData}
            setFormData={setFormData}
            setCategory={setCategory}
            categoryManufacturers={[]}
          />

          <div>
            <label className="block text-slate-300 mb-2 text-lg font-medium">📷 Photos</label>
            <DirectPhotoUpload 
              images={formData.images || []} 
              onImagesChange={(images) => setFormData({...formData, images})}
              maxImages={10}
            />

          </div>


          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
