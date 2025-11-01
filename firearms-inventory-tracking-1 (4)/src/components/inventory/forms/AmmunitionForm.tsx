import React from 'react';
import { NumericInput } from '../NumericInput';

interface AmmunitionFormProps {
  formData: any;
  setFormData: (data: any) => void;
  cartridges: any[];
  bulletTypes: any[];
  primerTypes: any[];
  units: any[];
}

export const AmmunitionForm: React.FC<AmmunitionFormProps> = ({
  formData, setFormData, cartridges, bulletTypes, primerTypes, units
}) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const weightUnits = units.filter(u => u.category === 'weight');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Cartridge</label>
          <select 
            value={formData.cartridge || ''} 
            onChange={(e) => update('cartridge', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select Cartridge...</option>
            {cartridges.map(c => (
              <option key={c.id} value={c.cartridge}>{c.cartridge}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Bullet Type</label>
          <select 
            value={formData.bulletType || ''} 
            onChange={(e) => update('bulletType', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select Type...</option>
            {bulletTypes.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumericInput 
          label="Grain Weight" 
          value={formData.grainWeightValue || ''} 
          unit={formData.grainWeightUom || 'gr'}
          units={weightUnits.map(u => ({ code: u.unit_code, name: u.unit_name }))}
          onChange={(value, unit) => setFormData({...formData, grainWeightValue: value, grainWeightUom: unit})}
          placeholder="55"
          allowDecimal={true}
        />
        <NumericInput 
          label="Round Count" 
          value={formData.roundCount || ''} 
          unit="rds"
          units={[{code: 'rds', name: 'rounds'}]}
          onChange={(value) => update('roundCount', value)}
          placeholder="500"
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Primer Type</label>
        <select 
          value={formData.primerType || ''} 
          onChange={(e) => update('primerType', e.target.value)}
          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
        >
          <option value="">Select Primer...</option>
          {primerTypes.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
