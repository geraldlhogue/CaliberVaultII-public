import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OpticsFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const OpticsForm: React.FC<OpticsFormProps> = ({ formData, onChange, referenceData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Magnification</Label>
          <Select value={formData.magnification || ''} onValueChange={(v) => onChange('magnification', v)}>
            <SelectTrigger><SelectValue placeholder="Select magnification" /></SelectTrigger>
            <SelectContent>
              {referenceData.magnifications?.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Reticle Type</Label>
          <Select value={formData.reticle_type || ''} onValueChange={(v) => onChange('reticle_type', v)}>
            <SelectTrigger><SelectValue placeholder="Select reticle" /></SelectTrigger>
            <SelectContent>
              {referenceData.reticleTypes?.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Objective Diameter (mm)</Label>
          <Input type="number" value={formData.objective_diameter || ''} onChange={(e) => onChange('objective_diameter', e.target.value)} />
        </div>
        <div>
          <Label>Tube Diameter (mm)</Label>
          <Input type="number" value={formData.tube_diameter || ''} onChange={(e) => onChange('tube_diameter', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Illuminated Reticle</Label>
        <Select value={formData.illuminated ? 'yes' : 'no'} onValueChange={(v) => onChange('illuminated', v === 'yes')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
