import React from 'react';
import { NumericInput } from './NumericInput';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  primerTypes: any[];
}

export const AttributeFieldsPrimers: React.FC<Props> = ({ formData, setFormData, primerTypes }) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const primerSizes = ['Small Pistol', 'Large Pistol', 'Small Rifle', 'Large Rifle', 'Magnum Pistol', 'Magnum Rifle'];
  const sensitivities = ['Standard', 'Magnum', 'Match', 'Benchrest'];

  const units = [
    { code: 'ea', name: 'Each' },
    { code: 'box', name: 'Box' },
    { code: 'tray', name: 'Tray' }
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Primer Type</label>
          <select value={formData.primerType || ''} onChange={(e) => update('primerType', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {primerTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Primer Size</label>
          <select value={formData.primerSize || ''} onChange={(e) => update('primerSize', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {primerSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Sensitivity</label>
          <select value={formData.primerSensitivity || ''} onChange={(e) => update('primerSensitivity', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {sensitivities.map(sens => (
              <option key={sens} value={sens}>{sens}</option>
            ))}
          </select>
        </div>
        <NumericInput label="Quantity" value={formData.quantity || ''} unit={formData.unitOfMeasure || 'ea'}
          units={units} onChange={(value, unit) => setFormData({...formData, quantity: value, unitOfMeasure: unit})}
          placeholder="1000" />
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Lot Number</label>
        <input type="text" value={formData.lotNumber || ''} onChange={(e) => update('lotNumber', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" 
          placeholder="LOT-12345" />
      </div>
    </>
  );
};