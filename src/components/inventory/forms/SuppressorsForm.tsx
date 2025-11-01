import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SuppressorsFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const SuppressorsForm: React.FC<SuppressorsFormProps> = ({ formData, onChange, referenceData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Caliber</Label>
          <Select value={formData.caliber_id || ''} onValueChange={(v) => onChange('caliber_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select caliber" /></SelectTrigger>
            <SelectContent>
              {referenceData.calibers?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Material</Label>
          <Select value={formData.material || ''} onValueChange={(v) => onChange('material', v)}>
            <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
            <SelectContent>
              {referenceData.suppressorMaterials?.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Length (inches)</Label>
          <Input type="number" step="0.1" value={formData.length || ''} onChange={(e) => onChange('length', e.target.value)} />
        </div>
        <div>
          <Label>Diameter (inches)</Label>
          <Input type="number" step="0.1" value={formData.diameter || ''} onChange={(e) => onChange('diameter', e.target.value)} />
        </div>
        <div>
          <Label>Weight (oz)</Label>
          <Input type="number" step="0.1" value={formData.weight || ''} onChange={(e) => onChange('weight', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Thread Pitch</Label>
        <Input value={formData.thread_pitch || ''} onChange={(e) => onChange('thread_pitch', e.target.value)} placeholder="e.g., 1/2x28" />
      </div>
    </div>
  );
};
