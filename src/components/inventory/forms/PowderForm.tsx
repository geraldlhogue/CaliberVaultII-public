import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PowderFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const PowderForm: React.FC<PowderFormProps> = ({ formData, onChange, referenceData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Powder Type</Label>
          <Select value={formData.powder_type_id || ''} onValueChange={(v) => onChange('powder_type_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {referenceData.powderTypes?.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Burn Rate</Label>
          <Input value={formData.burn_rate || ''} onChange={(e) => onChange('burn_rate', e.target.value)} placeholder="e.g., Fast, Medium, Slow" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Container Size</Label>
          <Input value={formData.container_size || ''} onChange={(e) => onChange('container_size', e.target.value)} placeholder="e.g., 1 lb, 8 lb" />
        </div>
        <div>
          <Label>Unit of Measure</Label>
          <Select value={formData.unit_of_measure_id || ''} onValueChange={(v) => onChange('unit_of_measure_id', v)}>
            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>
              {referenceData.unitsOfMeasure?.map((u: any) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Lot Number</Label>
        <Input value={formData.lot_number || ''} onChange={(e) => onChange('lot_number', e.target.value)} />
      </div>
    </div>
  );
};
