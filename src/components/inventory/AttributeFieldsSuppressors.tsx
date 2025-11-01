import React from 'react';
import { NumericInput } from './NumericInput';

interface AttributeFieldsSuppressorsProps {
  formData: any;
  update: (field: string, value: any) => void;
  setFormData: (data: any) => void;
  mountingTypes: any[];
  suppressorMaterials: any[];
  cartridges: any[];
}

export const AttributeFieldsSuppressors: React.FC<AttributeFieldsSuppressorsProps> = ({
  formData, update, setFormData, mountingTypes, suppressorMaterials, cartridges
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-slate-300 mb-2">Cartridge</label>
        <select value={formData.cartridge || ''} onChange={(e) => update('cartridge', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(cartridges || []).map(c => <option key={c.id} value={c.cartridge}>{c.cartridge}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Mounting Type</label>
        <select value={formData.mountingType || ''} onChange={(e) => update('mountingType', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(mountingTypes || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-slate-300 mb-2">Thread Pitch</label>
        <input type="text" value={formData.threadPitch || ''} onChange={(e) => update('threadPitch', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="1/2x28" />
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Material</label>
        <select value={formData.material || ''} onChange={(e) => update('material', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(suppressorMaterials || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <NumericInput label="Length" value={formData.length || ''} unit="in" 
        units={[{code: 'in', name: 'inches'}]} onChange={(value) => update('length', value)} 
        placeholder="7.5" allowDecimal={true} />
      <NumericInput label="Weight" value={formData.weight || ''} unit="oz" 
        units={[{code: 'oz', name: 'ounces'}]} onChange={(value) => update('weight', value)} 
        placeholder="12" allowDecimal={true} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="flex items-center text-slate-300">
          <input type="checkbox" checked={formData.fullAutoRated || false} 
            onChange={(e) => update('fullAutoRated', e.target.checked)} className="mr-2" />
          Full Auto Rated
        </label>
      </div>
      <div>
        <label className="flex items-center text-slate-300">
          <input type="checkbox" checked={formData.modular || false} 
            onChange={(e) => update('modular', e.target.checked)} className="mr-2" />
          Modular
        </label>
      </div>
    </div>
  </>
);
