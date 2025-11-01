import React from 'react';
import { NumericInput } from './NumericInput';

interface AttributeFieldsAmmoProps {
  formData: any;
  update: (field: string, value: any) => void;
  setFormData: (data: any) => void;
  bulletTypes: any[];
  cartridges: any[];
  primerTypes: any[];
  powderTypes: any[];
}

export const AttributeFieldsAmmo: React.FC<AttributeFieldsAmmoProps> = ({
  formData, update, setFormData, bulletTypes, cartridges, primerTypes, powderTypes
}) => {
  // Calculate total rounds when boxes or rounds per box changes
  React.useEffect(() => {
    const boxes = parseInt(formData.numBoxes) || 0;
    const roundsPerBox = parseInt(formData.roundsPerBox) || 0;
    
    // Only auto-calculate if both values are present
    if (boxes > 0 && roundsPerBox > 0) {
      const totalRounds = boxes * roundsPerBox;
      
      // Only update if different to avoid infinite loops
      if (totalRounds !== parseInt(formData.roundCount)) {
        setFormData(prev => ({ ...prev, roundCount: totalRounds }));
      }
    }
  }, [formData.numBoxes, formData.roundsPerBox]);
  
  // Auto-populate caliber when cartridge is selected
  React.useEffect(() => {
    if (formData.cartridge && cartridges && cartridges.length > 0) {
      const selectedCartridge = cartridges.find(c => c.cartridge === formData.cartridge);
      console.log('🔍 Cartridge selected in ammo:', formData.cartridge);
      console.log('🔍 Found cartridge data:', selectedCartridge);
      console.log('🔍 All cartridges:', cartridges);
      
      if (selectedCartridge && selectedCartridge.caliber) {
        console.log('✅ Updating caliber from', formData.caliber, 'to', selectedCartridge.caliber);
        // Use setFormData to properly update the entire form state
        setFormData((prev: any) => ({ 
          ...prev, 
          caliber: selectedCartridge.caliber 
        }));
      } else if (selectedCartridge) {
        console.warn('⚠️ Cartridge found but no caliber field:', selectedCartridge);
      }
    }
  }, [formData.cartridge, cartridges, setFormData]);


  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Cartridge <span className="text-red-500">*</span></label>
          <select 
            value={formData.cartridge || ''} 
            onChange={(e) => {
              console.log('Cartridge dropdown changed to:', e.target.value);
              update('cartridge', e.target.value);
            }} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base" 
            required
          >
            <option value="">Select Cartridge...</option>
            {(cartridges || []).map(c => (
              <option key={c.id} value={c.cartridge}>{c.cartridge}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Caliber</label>
          <input 
            type="text" 
            value={formData.caliber || ''} 
            readOnly
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-slate-400 text-base cursor-not-allowed"
            placeholder="Auto-filled from cartridge"
          />
          <p className="text-xs text-slate-400 mt-1">✨ Auto-populated from cartridge selection</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Bullet Type</label>
          <select 
            value={formData.bulletType || ''} 
            onChange={(e) => update('bulletType', e.target.value)} 
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-3 text-white text-base"
          >
            <option value="">Select Bullet Type...</option>
            {bulletTypes && bulletTypes.length > 0 ? (
              bulletTypes.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} {t.description ? `- ${t.description}` : ''}
                </option>
              ))
            ) : (
              <option disabled>No bullet types available</option>
            )}
          </select>
        </div>
        <NumericInput 
          label="Grain Weight" 
          value={formData.grainWeight || ''} 
          unit="gr" 
          units={[{code: 'gr', name: 'grains'}]} 
          onChange={(value) => update('grainWeight', value)} 
          placeholder="124" 
          allowDecimal={true} 
        />
      </div>

      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h4 className="text-slate-300 font-semibold mb-3">📦 Quantity Calculation</h4>
        <div className="grid grid-cols-3 gap-4">
          <NumericInput 
            label="Boxes" 
            value={formData.numBoxes || ''} 
            unit="boxes" 
            units={[{code: 'boxes', name: 'boxes'}]} 
            onChange={(value) => update('numBoxes', value)} 
            placeholder="1" 
          />
          <NumericInput 
            label="Rounds/Box" 
            value={formData.roundsPerBox || ''} 
            unit="rds" 
            units={[{code: 'rds', name: 'rounds'}]} 
            onChange={(value) => update('roundsPerBox', value)} 
            placeholder="50" 
          />
          <NumericInput 
            label="Total Rounds" 
            value={formData.roundCount || ''} 
            unit="rds" 
            units={[{code: 'rds', name: 'rounds'}]} 
            onChange={(value) => update('roundCount', value)} 
            placeholder="50" 
            disabled={!!(formData.numBoxes && formData.roundsPerBox)}
          />
        </div>

        <p className="text-xs text-slate-400 mt-2">
          💡 Enter boxes and rounds/box to auto-calculate total, or enter total directly
        </p>
      </div>
    </>
  );
};