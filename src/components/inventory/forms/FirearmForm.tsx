import React from 'react';
import { NumericInput } from '../NumericInput';

interface FirearmFormProps {
  formData: any;
  setFormData: (data: any) => void;
  cartridges: any[];
  calibers: any[];
  actions: any[];
  units: any[];
}

export const FirearmForm: React.FC<FirearmFormProps> = ({
  formData, setFormData, cartridges, calibers, actions, units
}) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const lengthUnits = units.filter(u => u.category === 'length');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">
            Cartridge <span className="text-red-500">*</span>
          </label>
          <select 
            value={formData.cartridge || ''} 
            onChange={(e) => update('cartridge', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
            required
          >
            <option value="">Select Cartridge...</option>
            {cartridges.map(c => (
              <option key={c.id} value={c.cartridge}>{c.cartridge}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">
            Caliber <span className="text-red-500">*</span>
          </label>
          <select 
            value={formData.caliber || ''} 
            onChange={(e) => update('caliber', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
            required
          >
            <option value="">Select Caliber...</option>
            {calibers.map(c => (
              <option key={c.id} value={c.name || c.caliber_decimal}>
                {c.name || `.${c.caliber_decimal}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Action Type</label>
          <select 
            value={formData.action || ''} 
            onChange={(e) => update('action', e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-500 rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select Action...</option>
            {actions.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <NumericInput 
          label="Barrel Length" 
          value={formData.barrelLengthValue || ''} 
          unit={formData.barrelLengthUom || 'in'}
          units={lengthUnits.map(u => ({ code: u.unit_code, name: u.unit_name }))}
          onChange={(value, unit) => setFormData({...formData, barrelLengthValue: value, barrelLengthUom: unit})}
          placeholder="16"
          allowDecimal={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumericInput 
          label="Capacity" 
          value={formData.capacity || ''} 
          unit="rds"
          units={[{code: 'rds', name: 'rounds'}]}
          onChange={(value) => update('capacity', value)}
          placeholder="30"
        />
        <NumericInput 
          label="Round Count" 
          value={formData.roundCount || ''} 
          unit="rds"
          units={[{code: 'rds', name: 'rounds'}]}
          onChange={(value) => update('roundCount', value)}
          placeholder="0"
        />
      </div>
    </div>
  );
};
