import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types/inventory';
import { manufacturers } from '../../data/manufacturers';
import { ImageUpload } from './ImageUpload';
import { PhotoGallery } from './PhotoGallery';
import { photoStorage, StoredPhoto } from '@/lib/photoStorage';
import { supabase } from '@/lib/supabase';
import { QrCode, MapPin, Sparkles } from 'lucide-react';
import QRCodeGenerator from '../locations/QRCodeGenerator';
import LocationCheckInOut from './LocationCheckInOut';
import { formatCurrency } from '@/lib/formatters';


import { InsuranceDocuments } from '../insurance/InsuranceDocuments';
import { MaintenanceRecords } from '../maintenance/MaintenanceRecords';
import { RangeSessionTracker } from '../range/RangeSessionTracker';
import { ComplianceDocuments } from '../compliance/ComplianceDocuments';
import { AIValuationModal } from '../valuation/AIValuationModal';
import ValuationHistory from '../valuation/ValuationHistory';
import PriceAlertManager from '../valuation/PriceAlertManager';
import { FeatureGuard } from '../subscription/FeatureGuard';



interface ItemDetailModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate?: (item: InventoryItem) => void;
  onEdit?: () => void;
  onShowLocationScanner?: () => void;
}



type TabType = 'details' | 'financial' | 'photos' | 'location' | 'insurance' | 'maintenance' | 'range' | 'compliance';
export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onUpdate, onEdit, onShowLocationScanner }) => {

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [newAppraisal, setNewAppraisal] = useState('');
  const [localPhotos, setLocalPhotos] = useState<StoredPhoto[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showLocationTransfer, setShowLocationTransfer] = useState(false);
  const [showAIValuation, setShowAIValuation] = useState(false);



  // Determine item type for maintenance/compliance
  const getItemType = () => {
    if (item.category === 'Firearms') return 'firearm';
    if (item.category === 'Optics') return 'optic';
    if (item.category === 'Suppressors') return 'suppressor';
    return 'firearm';
  };



  useEffect(() => {
    loadLocalPhotos();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [item.id]);

  const loadLocalPhotos = async () => {
    const photos = await photoStorage.getPhotosByItemId(item.id);
    setLocalPhotos(photos);
  };

  const handlePhotoCapture = async (dataUrl: string) => {
    const photo: StoredPhoto = {
      id: crypto.randomUUID(),
      itemId: item.id,
      dataUrl,
      timestamp: Date.now(),
      synced: false
    };
    await photoStorage.addPhoto(photo);
    setLocalPhotos([...localPhotos, photo]);
    
    if (isOnline) {
      uploadPhotoToCloud(photo);
    }
  };


  const uploadPhotoToCloud = async (photo: StoredPhoto) => {
    try {
      const blob = await fetch(photo.dataUrl).then(r => r.blob());
      const fileName = `${item.id}/${photo.id}.jpg`;
      const { data, error } = await supabase.storage.from('firearm-images').upload(fileName, blob);
      
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
        photo.cloudUrl = urlData.publicUrl;
        photo.synced = true;
        await photoStorage.updatePhoto(photo);
        
        const updated = { ...item, images: [...(item.images || []), urlData.publicUrl] };
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
    }
  };

  const deleteLocalPhoto = async (photoId: string) => {
    await photoStorage.deletePhoto(photoId);
    setLocalPhotos(localPhotos.filter(p => p.id !== photoId));
  };

  const manufacturerData = manufacturers[item.category]?.find(m => m.id === item.manufacturer);
  const latestValue = item.currentValue || item.purchasePrice;

  const handleAddAppraisal = () => {
    if (newAppraisal && parseFloat(newAppraisal) > 0) {
      const updated = {
        ...item,
        currentValue: parseFloat(newAppraisal)
      };
      onUpdate(updated);
      setNewAppraisal('');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    const updated = { ...item, images: newImages };
    onUpdate(updated);
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split('/').pop();
      if (path) {
        await supabase.storage.from('firearm-images').remove([path]);
      }
      const updated = { ...item, images: (item.images || []).filter(img => img !== imageUrl) };
      onUpdate(updated);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-slate-400">{item.category}</p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                ✏️ Edit
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">×</button>
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-slate-700 overflow-x-auto">
          {['details', 'financial', 'photos', 'location', 'insurance', 'maintenance', 'range', 'compliance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-3 py-2 text-sm font-medium capitalize whitespace-nowrap ${
                activeTab === tab ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>


        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm">Manufacturer</label>
                <p className="text-white font-medium">{item.manufacturer}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Storage Location</label>
                <p className="text-white font-medium">{item.storageLocation}</p>
              </div>
              {item.modelNumber && (
                <div>
                  <label className="text-slate-400 text-sm">Model Number</label>
                  <p className="text-white font-medium">{item.modelNumber}</p>
                </div>
              )}
              {item.serialNumber && (
                <div>
                  <label className="text-slate-400 text-sm">Serial Number</label>
                  <p className="text-white font-medium">{item.serialNumber}</p>
                </div>
              )}
              {item.lotNumber && (
                <div>
                  <label className="text-slate-400 text-sm">Lot Number</label>
                  <p className="text-white font-medium">{item.lotNumber}</p>
                </div>
              )}
              {item.upc && (
                <div>
                  <label className="text-slate-400 text-sm">UPC Code</label>
                  <p className="text-white font-medium">{item.upc}</p>
                </div>
              )}
              {item.caliber && (
                <div>
                  <label className="text-slate-400 text-sm">Caliber</label>
                  <p className="text-white font-medium">{item.caliber}</p>
                </div>
              )}
              {item.firearmSubcategory && (
                <div>
                  <label className="text-slate-400 text-sm">Firearm Type</label>
                  <p className="text-white font-medium capitalize">{item.firearmSubcategory.replace('-', ' ')}</p>
                </div>
              )}
              {item.barrelLength && (
                <div>
                  <label className="text-slate-400 text-sm">Barrel Length</label>
                  <p className="text-white font-medium">{item.barrelLength}</p>
                </div>
              )}
              {item.action && (
                <div>
                  <label className="text-slate-400 text-sm">Action</label>
                  <p className="text-white font-medium">{item.action}</p>
                </div>
              )}
              {item.magnification && (
                <div>
                  <label className="text-slate-400 text-sm">Magnification</label>
                  <p className="text-white font-medium">{item.magnification}</p>
                </div>
              )}
              {item.objectiveLens && (
                <div>
                  <label className="text-slate-400 text-sm">Objective Lens</label>
                  <p className="text-white font-medium">{item.objectiveLens}</p>
                </div>
              )}
              {item.reticleType && (
                <div>
                  <label className="text-slate-400 text-sm">Reticle Type</label>
                  <p className="text-white font-medium">{item.reticleType}</p>
                </div>
              )}
              {item.capacity && (
                <div>
                  <label className="text-slate-400 text-sm">Capacity</label>
                  <p className="text-white font-medium">{item.capacity} rounds</p>
                </div>
              )}
              {item.ammoType && (
                <div>
                  <label className="text-slate-400 text-sm">Ammunition Type</label>
                  <p className="text-white font-medium">{item.ammoType}</p>
                </div>
              )}
              {item.grainWeight && (
                <div>
                  <label className="text-slate-400 text-sm">Grain Weight</label>
                  <p className="text-white font-medium">{item.grainWeight}</p>
                </div>
              )}
              {item.roundCount && (
                <div>
                  <label className="text-slate-400 text-sm">Round Count</label>
                  <p className="text-white font-medium">{item.roundCount}</p>
                </div>
              )}
              {item.componentType && (
                <div>
                  <label className="text-slate-400 text-sm">Component Type</label>
                  <p className="text-white font-medium">{item.componentType}</p>
                </div>
              )}
              {item.compatibility && (
                <div>
                  <label className="text-slate-400 text-sm">Compatibility</label>
                  <p className="text-white font-medium">{item.compatibility}</p>
                </div>
              )}
              {item.quantity && (
                <div>
                  <label className="text-slate-400 text-sm">Quantity</label>
                  <p className="text-white font-medium">{item.quantity}</p>
                </div>
              )}
              <div>
                <label className="text-slate-400 text-sm">Current Value</label>
                <p className="text-yellow-600 font-bold text-xl">{formatCurrency(latestValue || 0)}</p>

              </div>
            </div>
            {item.description && (
              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-slate-300">{item.description}</p>
              </div>
            )}
            {item.notes && (
              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Notes</h3>
                <p className="text-slate-300">{item.notes}</p>
              </div>
            )}

            {manufacturerData && (
              <div className="bg-slate-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Manufacturer Contact</h3>
                <p className="text-slate-300">{manufacturerData.name}</p>
                {manufacturerData.phone && <p className="text-slate-400 text-sm">📞 {manufacturerData.phone}</p>}
                {manufacturerData.website && (
                  <a href={manufacturerData.website} target="_blank" rel="noopener noreferrer" className="text-yellow-600 text-sm hover:underline block mt-1">
                    🌐 Visit Website
                  </a>
                )}
                {manufacturerData.customerService && (
                  <p className="text-slate-400 text-sm mt-1">✉️ {manufacturerData.customerService}</p>
                )}
              </div>
            )}
          </div>
        )}



        {activeTab === 'financial' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Purchase Price</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(item.purchasePrice || 0)}</p>

                <p className="text-slate-500 text-sm">{item.purchaseDate}</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Current Value</p>
                <p className="text-yellow-600 text-2xl font-bold">{formatCurrency(latestValue || 0)}</p>

                <p className={`text-sm ${latestValue >= item.purchasePrice ? 'text-green-500' : 'text-red-500'}`}>
                  {latestValue >= item.purchasePrice ? '+' : ''}{((latestValue - item.purchasePrice) / item.purchasePrice * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* AI Valuation Button */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                AI-Powered Valuation
              </h3>
              <p className="text-slate-300 text-sm mb-3">Get an instant market valuation using advanced AI analysis</p>
              <button
                onClick={() => setShowAIValuation(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Get AI Valuation
              </button>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Update Value</h3>
              <div className="bg-slate-900 p-3 rounded mb-4">
                <p className="text-slate-400 text-sm">Current Value</p>
                <p className="text-yellow-600 font-bold text-xl">{formatCurrency(latestValue || 0)}</p>

              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  value={newAppraisal}
                  onChange={(e) => setNewAppraisal(e.target.value)}
                  placeholder="New appraisal value"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={handleAddAppraisal}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Valuation History */}
            <ValuationHistory itemId={item.id} />

            {/* Price Alerts */}
            <PriceAlertManager 
              itemId={item.id} 
              itemType={item.category}
              itemName={item.name}
              currentValue={latestValue}
            />

          </div>
        )}





        {activeTab === 'photos' && (
          <div className="space-y-4">
            {((item.images && item.images.length > 0) || localPhotos.length > 0) && (
              <PhotoGallery 
                photos={[...(item.images || []), ...localPhotos.map(p => p.dataUrl)]} 
                onDelete={(idx) => {
                  const itemImages = item.images || [];
                  if (idx < itemImages.length) {
                    handleDeleteImage(itemImages[idx]);
                  } else {
                    const localIdx = idx - itemImages.length;
                    deleteLocalPhoto(localPhotos[localIdx].id);
                  }
                }}
              />
            )}
            
            <div>
              <ImageUpload images={item.images || []} onImagesChange={handleImagesChange} maxImages={10} />
            </div>


            {localPhotos.some(p => !p.synced) && (
              <div className="bg-slate-900 p-3 rounded-lg text-slate-300 text-sm">
                ⚠️ {localPhotos.filter(p => !p.synced).length} photo(s) pending sync
              </div>
            )}
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">QR Code Management</h3>
              <p className="text-slate-400 text-sm mb-4">Generate and print a QR code to attach to this item for quick scanning</p>
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Generate QR Code
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Location Transfer</h3>
              <p className="text-slate-400 text-sm mb-4">Check this item in/out of a location or transfer between locations</p>
              <button
                onClick={() => setShowLocationTransfer(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Manage Location
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Current Location</h3>
              <p className="text-white">{item.storageLocation || 'Not assigned to a location'}</p>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="space-y-4">
            <InsuranceDocuments itemId={item.id} itemName={item.name} />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceRecords itemId={item.id} itemType={getItemType()} />
        )}

        {activeTab === 'range' && item.category === 'Firearms' && (
          <RangeSessionTracker firearmId={item.id} />
        )}

        {activeTab === 'compliance' && (
          <ComplianceDocuments itemId={item.id} itemType={getItemType()} />
        )}


        {showQRCode && (
          <QRCodeGenerator
            isOpen={showQRCode}
            onClose={() => setShowQRCode(false)}
            data={item.id}
            type="item"
          />
        )}


        {showLocationTransfer && (
          <LocationCheckInOut
            isOpen={showLocationTransfer}
            onClose={() => setShowLocationTransfer(false)}
            item={item}
            currentLocationId={item.locationId}
            onTransferComplete={() => {
              setShowLocationTransfer(false);
              // Refresh item data if needed
            }}
          />
        )}

        {showAIValuation && (
          <FeatureGuard 
            feature="ai_valuation" 
            featureName="AI Valuation" 
            requiredTier="Pro"
          >
            <AIValuationModal
              isOpen={showAIValuation}
              onClose={() => setShowAIValuation(false)}
              item={item}
            />
          </FeatureGuard>
        )}



      </div>
    </div>
  );
};

export default ItemDetailModal;
