import React from 'react';
import { NumericInput } from './NumericInput';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  calibers: any[];
}

export const AttributeFieldsReloading: React.FC<Props> = ({ formData, setFormData, calibers }) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const componentTypes = [
    'Bullet', 'Case', 'Primer', 'Powder', 'Dies', 'Shell Holder', 'Powder Measure', 
    'Case Trimmer', 'Chamfer Tool', 'Deburring Tool', 'Primer Pocket Cleaner', 'Other'
  ];

  const units = [
    { code: 'ea', name: 'Each' },
    { code: 'box', name: 'Box' },
    { code: 'lb', name: 'Pounds' },
    { code: 'oz', name: 'Ounces' },
    { code: 'g', name: 'Grams' }
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Component Type</label>
          <select value={formData.componentType || ''} onChange={(e) => update('componentType', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {componentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Caliber</label>
          <select value={formData.caliber || ''} onChange={(e) => update('caliber', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {calibers.map(c => (
              <option key={c.id} value={c.name || c.caliber_decimal}>
                {c.name || `.${c.caliber_decimal}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumericInput label="Quantity" value={formData.quantity || ''} unit={formData.unitOfMeasure || 'ea'}
          units={units} onChange={(value, unit) => setFormData({...formData, quantity: value, unitOfMeasure: unit})}
          placeholder="100" />
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