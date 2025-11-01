import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReloadingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const ReloadingForm: React.FC<ReloadingFormProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Component Type</Label>
        <Input 
          value={formData.component_type || ''} 
          onChange={(e) => onChange('component_type', e.target.value)} 
          placeholder="e.g., Dies, Press, Scale, Trimmer" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Caliber/Size</Label>
          <Input 
            value={formData.caliber_size || ''} 
            onChange={(e) => onChange('caliber_size', e.target.value)} 
            placeholder="e.g., .308 Win, Universal" 
          />
        </div>
        <div>
          <Label>Model Number</Label>
          <Input value={formData.model_number || ''} onChange={(e) => onChange('model_number', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Compatibility</Label>
        <Input 
          value={formData.compatibility || ''} 
          onChange={(e) => onChange('compatibility', e.target.value)} 
          placeholder="Compatible calibers or systems" 
        />
      </div>
      <div>
        <Label>Specifications</Label>
        <Textarea 
          value={formData.specifications || ''} 
          onChange={(e) => onChange('specifications', e.target.value)} 
          placeholder="Additional specifications and features"
          rows={3}
        />
      </div>
    </div>
  );
};
