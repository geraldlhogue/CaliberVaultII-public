import React from 'react';
import { NumericInput } from './NumericInput';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  powderTypes: any[];
}

export const AttributeFieldsPowder: React.FC<Props> = ({ formData, setFormData, powderTypes }) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const burnRates = ['Fast', 'Medium-Fast', 'Medium', 'Medium-Slow', 'Slow', 'Very Slow'];

  const units = [
    { code: 'lb', name: 'Pounds' },
    { code: 'oz', name: 'Ounces' },
    { code: 'g', name: 'Grams' },
    { code: 'kg', name: 'Kilograms' }
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Powder Type</label>
          <select value={formData.powderType || ''} onChange={(e) => update('powderType', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {powderTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Burn Rate</label>
          <select value={formData.burnRate || ''} onChange={(e) => update('burnRate', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {burnRates.map(rate => (
              <option key={rate} value={rate}>{rate}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumericInput label="Quantity" value={formData.quantity || ''} unit={formData.unitOfMeasure || 'lb'}
          units={units} onChange={(value, unit) => setFormData({...formData, quantity: value, unitOfMeasure: unit})}
          placeholder="1" allowDecimal={true} />
        <div>
          <label className="block text-slate-300 mb-2">Lot Number</label>
          <input type="text" value={formData.lotNumber || ''} onChange={(e) => update('lotNumber', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" 
            placeholder="LOT-12345" />
        </div>
      </div>
    </>
  );
};