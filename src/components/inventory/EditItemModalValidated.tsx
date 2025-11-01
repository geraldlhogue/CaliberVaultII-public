import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { AttributeFields } from './AttributeFields';
import { ImageUpload } from './ImageUpload';
import { useUpdateInventoryItem } from '@/hooks/useInventoryQuery';
import { useFormValidation } from '@/hooks/useFormValidation';
import { inventoryItemSchema } from '@/lib/validation/inventorySchemas';
import { supabase } from '@/lib/supabase';

interface EditItemModalValidatedProps {
  item: InventoryItem;
  onClose: () => void;
}

export const EditItemModalValidated: React.FC<EditItemModalValidatedProps> = ({ item, onClose }) => {
  const [category, setCategory] = useState<ItemCategory>(item.category);
  const [images, setImages] = useState<string[]>(item.images || []);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  
  const updateMutation = useUpdateInventoryItem();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useFormValidation({
    schema: inventoryItemSchema,
    defaultValues: {
      name: item.name || '',
      manufacturer: item.manufacturer || '',
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      storageLocation: item.storageLocation || '',
      purchasePrice: item.purchasePrice || 0,
      currentValue: item.currentValue || 0,
      quantity: item.quantity || 1,
      description: item.description || '',
      notes: item.notes || '',
      upc: item.upc || '',
      lotNumber: item.lotNumber || '',
      purchaseDate: item.purchaseDate || '',
      // Firearms
      caliber: item.caliber || '',
      cartridge: item.cartridge || '',
      action: item.action || '',
      barrelLengthValue: item.barrelLengthValue || '',
      capacity: item.capacity || '',
      // Ammunition
      ammoType: item.ammoType || '',
      grainWeight: item.grainWeightValue || '',
      roundCount: item.roundCount || 0,
      numBoxes: item.numBoxes || 0,
      roundsPerBox: item.roundsPerBox || 0,
      bulletType: item.bulletType || '',
      caseType: item.caseType || '',
      primerType: item.primerType || '',
      powderType: item.powderType || '',
      powderCharge: item.powderCharge || '',
      // Optics
      magnification: item.magnification || '',
      objectiveLens: item.objectiveLensValue || '',
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
    }
  });

  // Reset form with item data when item changes
  useEffect(() => {
    reset({
      name: item.name || '',
      manufacturer: item.manufacturer || '',
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      storageLocation: item.storageLocation || '',
      purchasePrice: item.purchasePrice || 0,
      currentValue: item.currentValue || 0,
      quantity: item.quantity || 1,
      description: item.description || '',
      notes: item.notes || '',
      upc: item.upc || '',
      lotNumber: item.lotNumber || '',
      purchaseDate: item.purchaseDate || '',
      // Firearms
      caliber: item.caliber || '',
      cartridge: item.cartridge || '',
      action: item.action || '',
      barrelLengthValue: item.barrelLengthValue || '',
      capacity: item.capacity || '',
      // Ammunition
      ammoType: item.ammoType || '',
      grainWeight: item.grainWeightValue || '',
      roundCount: item.roundCount || 0,
      numBoxes: item.numBoxes || 0,
      roundsPerBox: item.roundsPerBox || 0,
      bulletType: item.bulletType || '',
      caseType: item.caseType || '',
      primerType: item.primerType || '',
      powderType: item.powderType || '',
      powderCharge: item.powderCharge || '',
      // Optics
      magnification: item.magnification || '',
      objectiveLens: item.objectiveLensValue || '',
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
    });
    setCategory(item.category);
    setImages(item.images || []);
  }, [item, reset]);

  useEffect(() => {
    const fetchManufacturers = async () => {
      const { data } = await supabase.from('manufacturers').select('*').order('name');
      if (data) setManufacturers(data);
    };
    fetchManufacturers();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        updates: { ...data, category, images }
      });
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AttributeFields 
            category={category}
            formData={watch()}
            setFormData={(data) => Object.keys(data).forEach(k => setValue(k as any, data[k]))}
            setCategory={setCategory}
            categoryManufacturers={manufacturers}
          />
          <div>
            <label className="block text-slate-300 mb-2">Images</label>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg">
              {updateMutation.isPending ? 'Updating...' : 'Update Item'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

