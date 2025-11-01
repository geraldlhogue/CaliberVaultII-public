import React, { useState } from 'react';
import { CameraUPCScanner } from './CameraUPCScanner';

interface UniversalFieldsProps {
  formData: any;
  update: (field: string, value: any) => void;
  onProductDataReceived?: (productData: any) => void;
}

export const UniversalFields: React.FC<UniversalFieldsProps> = ({ formData, update, onProductDataReceived }) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleCodeDetected = (code: string, productData?: any) => {
    update('upc', code);
    if (productData && onProductDataReceived) {
      onProductDataReceived(productData);
    }
    setShowScanner(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Serial Number</label>
          <input type="text" value={formData.serialNumber || ''} onChange={(e) => update('serialNumber', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" placeholder="Enter serial number" />
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Lot Number</label>
          <input type="text" value={formData.lotNumber || ''} onChange={(e) => update('lotNumber', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" placeholder="Optional" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">UPC Code</label>
          <input type="text" value={formData.upc || ''} onChange={(e) => update('upc', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" placeholder="Enter UPC or scan with camera" />
        </div>
        {showScanner ? (
          <CameraUPCScanner onCodeDetected={handleCodeDetected} onClose={() => setShowScanner(false)} />
        ) : (
          <button type="button" onClick={() => setShowScanner(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
            📷 Scan UPC with Camera
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Purchase Price</label>
          <input type="number" step="0.01" value={formData.purchasePrice || ''} onChange={(e) => update('purchasePrice', e.target.value)} 
            placeholder="850.00" className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" />
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Current Value</label>
          <input type="number" step="0.01" value={formData.currentValue || ''} onChange={(e) => update('currentValue', e.target.value)} 
            placeholder="1000.00" className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Purchase Date</label>
          <input type="date" value={formData.purchaseDate || ''} onChange={(e) => update('purchaseDate', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" />
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Quantity</label>
          <input type="number" min="1" value={formData.quantity || 1} onChange={(e) => update('quantity', parseInt(e.target.value) || 1)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" placeholder="1" />
        </div>
      </div>
      
      <div>
        <label className="block text-slate-300 mb-2 font-medium">Condition</label>
        <select value={formData.condition || 'excellent'} onChange={(e) => update('condition', e.target.value)} 
          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base">
          <option value="new">New</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-300 mb-2 font-medium">Notes</label>
        <textarea value={formData.notes || ''} onChange={(e) => update('notes', e.target.value)} rows={3} 
          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" placeholder="Any additional notes..." />
      </div>
    </>
  );
};
