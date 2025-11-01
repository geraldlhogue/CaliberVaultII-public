import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulletsFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const BulletsForm: React.FC<BulletsFormProps> = ({ formData, onChange, referenceData }) => {
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
          <Label>Bullet Type</Label>
          <Select value={formData.bullet_type_id || ''} onValueChange={(v) => onChange('bullet_type_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {referenceData.bulletTypes?.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Weight (grains)</Label>
          <Input type="number" value={formData.weight || ''} onChange={(e) => onChange('weight', e.target.value)} />
        </div>
        <div>
          <Label>Diameter (inches)</Label>
          <Input type="number" step="0.001" value={formData.diameter || ''} onChange={(e) => onChange('diameter', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Box Quantity</Label>
        <Input type="number" value={formData.box_quantity || ''} onChange={(e) => onChange('box_quantity', e.target.value)} placeholder="e.g., 100" />
      </div>
    </div>
  );
};
