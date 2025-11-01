import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemCategory } from '../../types/inventory';
import { AttributeFields } from './AttributeFields';
import { DirectPhotoUpload } from './DirectPhotoUpload';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { EnhancedPhotoCapture } from './EnhancedPhotoCapture';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { logError } from '@/lib/errorHandler';


interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: any) => void;
  initialData?: Partial<any>;
}
export const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAdd, initialData }) => {
  const subscription = useSubscription();
  const navigate = useNavigate();
  const isEditMode = !!initialData?.id;

  // DEFAULT TO FIREARMS if no category is set
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
  const [loadingFromCache, setLoadingFromCache] = useState(false);
  // Simple barcode cache type
  interface BarcodeData {
    title?: string;
    brand?: string;
    model?: string;
    barcode?: string;
    images?: string[];
  }
  
  const [cachedData, setCachedData] = useState<BarcodeData | null>(null);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const handlePhotoCapture = (dataUrl: string) => {
    setImages([...images, dataUrl]);
    toast({ title: "Photo Added", description: "Photo captured successfully" });
  };


  // Fetch manufacturers from database
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
    if (category === 'reloading') return m.powder_indicator || m.primer_indicator;
    return true;
  });
  // Check cache when barcode is provided
  React.useEffect(() => {
    const checkCache = async () => {
      if (initialData?.barcode) {
        setLoadingFromCache(true);
        try {
          const cached = await barcodeCache.get(initialData.barcode);
          if (cached) {
            setCachedData(cached);
            // Pre-fill form with cached data
            setFormData((prev: any) => ({
              ...prev,
              name: cached.title || prev.name,
              manufacturer: cached.brand || prev.manufacturer,
              model: cached.model || prev.model,
              barcode: cached.barcode,
            }));
            if (cached.images && cached.images.length > 0) {
              setImages(cached.images);
            }
            toast({
              title: "Loaded from Cache",
              description: "Product information loaded from local cache",
            });
          }
        } catch (error) {
          console.error('Cache lookup failed:', error);
        } finally {
          setLoadingFromCache(false);
        }
      }
    };
    checkCache();
  }, [initialData?.barcode]);
  
  // Import missing barcodeCache
  const barcodeCache = {
    get: async (barcode: string): Promise<BarcodeData | null> => {
      // Simple cache implementation - could be enhanced
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check item limit before adding (skip check in edit mode)
    if (!isEditMode && !subscription.canAddItem()) {
      toast({
        title: "Item Limit Reached",
        description: `You've reached your limit of ${subscription.itemLimit} items. Upgrade to add more.`,
        variant: "destructive"
      });
      return;
    }
    
    console.log('🔵 === FORM SUBMITTED ===');
    console.log('📦 Category:', category || 'firearms');
    console.log('📝 FormData:', formData);
    
    // Validate required fields with user-friendly messages
    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a category for this item",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.manufacturer) {
      toast({
        title: "Manufacturer Required",
        description: "Please select or enter a manufacturer",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.model && !formData.modelNumber) {
      toast({
        title: "Model Required",
        description: "Please enter a model name or number",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a name from manufacturer and model if not provided
      const modelValue = formData.model || formData.modelNumber || '';
      const itemName = formData.name || 
                       (formData.manufacturer && modelValue ? 
                        `${formData.manufacturer} ${modelValue}` : 
                        formData.manufacturer || 'New Item');
      
      // Helper to clean numeric values - be very lenient
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
      
      // Build item with all fields - ensure model and modelNumber are synced
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
        action: formData.action || undefined,
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
      

      
      console.log('💾 === CALLING onAdd WITH ITEM ===', itemToAdd);
      
      // Call onAdd and WAIT for it to complete
      await onAdd(itemToAdd);
      
      console.log('✅ === onAdd COMPLETED SUCCESSFULLY ===');
      
      // Show success message
      toast({
        title: "Item Saved",
        description: `${itemName} has been added to your inventory`,
      });
      
      // Only close modal after successful save
      onClose();
    } catch (error: any) {
      console.error('❌ === ERROR IN handleSubmit ===', error);
      
      // Log error with full context
      logError(error, {
        component: 'AddItemModal',
        action: 'handleSubmit',
        category,
        formData: { ...formData, images: `[${images.length} images]` }
      });
      
      toast({
        title: "Save Failed",
        description: error?.message || "Failed to save item. Please try again.",
        variant: "destructive"
      });
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
            {isEditMode ? '✏️ Edit Item' : '➕ Add New Item'}
          </h2>
          {cachedData && (
            <Badge className="bg-blue-600 text-white px-2 py-1 text-xs">📦 Cache</Badge>
          )}
        </div>

        
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <AttributeFields 
            category={category}
            formData={formData}
            setFormData={setFormData}
            setCategory={setCategory}
            categoryManufacturers={categoryManufacturers}
            onProductDataReceived={(productData) => {
              // Auto-populate fields from barcode lookup
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
            <label className="block text-slate-300 mb-2 font-medium text-lg">
              📝 Item Description
            </label>
            <textarea
              className="w-full p-4 bg-slate-900 text-white rounded-lg border-2 border-slate-700 focus:border-yellow-500 text-base"
              rows={4}
              placeholder="Enter a detailed description for this item..."
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="border-t border-slate-700 pt-6">
            <label className="block text-slate-300 mb-3 font-medium text-lg">
              📷 Photos (Optional)
            </label>
            <div className="flex gap-3 mb-3">
              <button 
                type="button"
                onClick={() => setShowPhotoCapture(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
              >
                📸 Take Photo with Camera
              </button>
            </div>
            <DirectPhotoUpload images={images} onImagesChange={setImages} maxImages={10} />


          </div>

          
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              {isEditMode ? '💾 Update Item' : '✅ Add Item'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all text-lg"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

