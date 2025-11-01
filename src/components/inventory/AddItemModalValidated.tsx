import React, { useState, useEffect } from 'react';
import { ItemCategory } from '../../types/inventory';
import { ImageUpload } from './ImageUpload';
import { AttributeFields } from './AttributeFields';
import { useAddInventoryItem } from '@/hooks/useInventoryQuery';
import { useFormValidation } from '@/hooks/useFormValidation';
import { inventoryItemSchema } from '@/lib/validation/inventorySchemas';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { barcodeCache, BarcodeData } from '@/lib/barcodeCache';

interface AddItemModalValidatedProps {
  onClose: () => void;
  initialData?: Partial<any>;
}

export const AddItemModalValidated: React.FC<AddItemModalValidatedProps> = ({ onClose, initialData }) => {
  const [category, setCategory] = useState<ItemCategory | ''>(initialData?.category || 'firearms');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [cachedData, setCachedData] = useState<BarcodeData | null>(null);
  
  const addMutation = useAddInventoryItem();
  
  // RESTORE MANDATORY FIELDS - Make the form more useful
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useFormValidation({
    schema: inventoryItemSchema,
    defaultValues: {
      quantity: 1,
      category: category || 'firearms',
      manufacturer: '',
      model: '',
      serialNumber: '',
      ...initialData,
    }
  });

  // Fetch manufacturers
  useEffect(() => {
    const fetchManufacturers = async () => {
      const { data } = await supabase.from('manufacturers').select('*').order('name');
      if (data) setManufacturers(data);
    };
    fetchManufacturers();
  }, [category]);

  const categoryManufacturers = manufacturers.filter(m => {
    if (category === 'firearms') return m.firearm_indicator;
    if (category === 'optics') return m.optics_indicator;
    if (category === 'ammunition') return m.bullet_indicator;
    return true;
  });

  const onSubmit = async (data: any) => {
    console.log('=== AddItemModalValidated onSubmit START ===');
    console.log('Form data:', data);
    console.log('Category:', category);
    console.log('Images:', images);
    
    try {
      const itemToAdd = {
        ...data,
        category: category || 'firearms',
        images,
        name: data.name || `${data.manufacturer || ''} ${data.model || data.modelNumber || ''}`.trim() || 'New Item',
      };
      
      console.log('Item to add:', itemToAdd);
      console.log('Calling addMutation.mutateAsync...');
      
      await addMutation.mutateAsync(itemToAdd);
      console.log('Add mutation completed successfully');
      onClose();
    } catch (error) {
      console.error('=== ADD ITEM ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', (error as any)?.message);
      console.error('Error stack:', (error as any)?.stack);
      // Don't close modal on error so user can retry
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Item</h2>
          {cachedData && <Badge className="bg-blue-600">Cached</Badge>}
        </div>
        <form onSubmit={(e) => {
          console.log('=== FORM SUBMIT EVENT ===');
          console.log('Form errors:', errors);
          console.log('Form values:', watch());
          handleSubmit(onSubmit)(e);
        }} className="space-y-4">
          <AttributeFields 
            category={category}
            formData={watch()}
            setFormData={(data) => Object.keys(data).forEach(k => setValue(k as any, data[k]))}
            setCategory={setCategory}
            categoryManufacturers={categoryManufacturers}
          />
          <div>
            <label className="block text-slate-300 mb-2">Photos</label>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
          </div>
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-200">
              <p className="font-semibold mb-1">Please fix the following errors:</p>
              {Object.entries(errors).map(([key, error]) => (
                <p key={key} className="text-sm">• {key}: {(error as any)?.message || 'Invalid value'}</p>
              ))}
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={addMutation.isPending}
              onClick={() => console.log('Add Item button clicked')}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg"
            >
              {addMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
            <button type="button" onClick={onClose} className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
