import React from 'react';
import { NumericInput } from './NumericInput';

interface AttributeFieldsOpticsProps {
  formData: any;
  update: (field: string, value: any) => void;
  setFormData: (data: any) => void;
  magnifications: any[];
  reticleTypes: any[];
  opticTypes: any[];
  turretTypes: any[];
}

export const AttributeFieldsOptics: React.FC<AttributeFieldsOpticsProps> = ({
  formData, update, setFormData, magnifications, reticleTypes, opticTypes, turretTypes
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-slate-300 mb-2">Optic Type</label>
        <select value={formData.opticType || ''} onChange={(e) => update('opticType', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(opticTypes || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Magnification</label>
        <select value={formData.magnification || ''} onChange={(e) => update('magnification', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(magnifications || []).map(m => <option key={m.id} value={m.magnification}>{m.magnification}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <NumericInput label="Objective Lens" value={formData.objectiveLens || ''} unit="mm" 
        units={[{code: 'mm', name: 'millimeters'}]} onChange={(value) => update('objectiveLens', value)} 
        placeholder="40" allowDecimal={true} />
      <div>
        <label className="block text-slate-300 mb-2">Reticle Type</label>
        <select value={formData.reticleType || ''} onChange={(e) => update('reticleType', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(reticleTypes || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-slate-300 mb-2">Turret Type</label>
        <select value={formData.turretType || ''} onChange={(e) => update('turretType', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
          <option value="">Select...</option>
          {(turretTypes || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Field of View</label>
        <input type="text" value={formData.fieldOfView || ''} onChange={(e) => update('fieldOfView', e.target.value)} 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="100 ft @ 100 yds" />
      </div>
    </div>
  </>
);
