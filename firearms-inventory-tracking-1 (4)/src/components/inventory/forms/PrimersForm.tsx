import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrimersFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const PrimersForm: React.FC<PrimersFormProps> = ({ formData, onChange, referenceData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Primer Type</Label>
          <Select value={formData.primer_type_id || ''} onValueChange={(v) => onChange('primer_type_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {referenceData.primerTypes?.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Size</Label>
          <Select value={formData.size || ''} onValueChange={(v) => onChange('size', v)}>
            <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small_pistol">Small Pistol</SelectItem>
              <SelectItem value="large_pistol">Large Pistol</SelectItem>
              <SelectItem value="small_rifle">Small Rifle</SelectItem>
              <SelectItem value="large_rifle">Large Rifle</SelectItem>
              <SelectItem value="shotgun">Shotgun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Box Quantity</Label>
          <Input type="number" value={formData.box_quantity || ''} onChange={(e) => onChange('box_quantity', e.target.value)} placeholder="e.g., 1000" />
        </div>
        <div>
          <Label>Magnum</Label>
          <Select value={formData.magnum ? 'yes' : 'no'} onValueChange={(v) => onChange('magnum', v === 'yes')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
