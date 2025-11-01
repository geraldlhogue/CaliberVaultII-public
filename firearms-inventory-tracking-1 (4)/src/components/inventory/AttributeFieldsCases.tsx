import React from 'react';
import { NumericInput } from './NumericInput';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  calibers: any[];
}

export const AttributeFieldsCases: React.FC<Props> = ({ formData, setFormData, calibers }) => {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const conditions = ['New', 'Once-Fired', 'Twice-Fired', 'Multiple Times', 'Unknown'];

  const units = [
    { code: 'ea', name: 'Each' },
    { code: 'box', name: 'Box' },
    { code: 'bag', name: 'Bag' }
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="block text-slate-300 mb-2">Condition</label>
          <select value={formData.caseCondition || ''} onChange={(e) => update('caseCondition', e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="">Select...</option>
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumericInput label="Quantity" value={formData.quantity || ''} unit={formData.unitOfMeasure || 'ea'}
          units={units} onChange={(value, unit) => setFormData({...formData, quantity: value, unitOfMeasure: unit})}
          placeholder="100" />
        <div>
          <label className="block text-slate-300 mb-2">Primed</label>
          <select value={formData.primed ? 'yes' : 'no'} onChange={(e) => update('primed', e.target.value === 'yes')} 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
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