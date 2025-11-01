import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MagazinesFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const MagazinesForm: React.FC<MagazinesFormProps> = ({ formData, onChange, referenceData }) => {
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
          <Label>Capacity</Label>
          <Input type="number" value={formData.capacity || ''} onChange={(e) => onChange('capacity', e.target.value)} placeholder="e.g., 30" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <Input value={formData.material || ''} onChange={(e) => onChange('material', e.target.value)} placeholder="e.g., Steel, Polymer" />
        </div>
        <div>
          <Label>Finish</Label>
          <Input value={formData.finish || ''} onChange={(e) => onChange('finish', e.target.value)} placeholder="e.g., Black Oxide" />
        </div>
      </div>
      <div>
        <Label>Compatible Firearms</Label>
        <Input value={formData.compatible_firearms || ''} onChange={(e) => onChange('compatible_firearms', e.target.value)} placeholder="e.g., AR-15, M4" />
      </div>
    </div>
  );
};
