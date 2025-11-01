import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CasesFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  referenceData: any;
}

export const CasesForm: React.FC<CasesFormProps> = ({ formData, onChange, referenceData }) => {
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
          <Label>Condition</Label>
          <Select value={formData.condition || ''} onValueChange={(v) => onChange('condition', v)}>
            <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="once_fired">Once Fired</SelectItem>
              <SelectItem value="multiple_fired">Multiple Fired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Material</Label>
          <Input value={formData.material || ''} onChange={(e) => onChange('material', e.target.value)} placeholder="e.g., Brass, Steel" />
        </div>
        <div>
          <Label>Primed</Label>
          <Select value={formData.primed ? 'yes' : 'no'} onValueChange={(v) => onChange('primed', v === 'yes')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Box Quantity</Label>
        <Input type="number" value={formData.box_quantity || ''} onChange={(e) => onChange('box_quantity', e.target.value)} />
      </div>
    </div>
  );
};
