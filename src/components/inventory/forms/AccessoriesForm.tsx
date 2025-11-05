import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AccessoriesFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const AccessoriesForm: React.FC<AccessoriesFormProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Accessory Type</Label>
        <Input 
          value={formData.accessory_type || ''} 
          onChange={(e) => onChange('accessory_type', e.target.value)} 
          placeholder="e.g., Sling, Bipod, Light, Laser" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Color</Label>
          <Input value={formData.color || ''} onChange={(e) => onChange('color', e.target.value)} placeholder="e.g., Black, FDE" />
        </div>
        <div>
          <Label>Material</Label>
          <Input value={formData.material || ''} onChange={(e) => onChange('material', e.target.value)} placeholder="e.g., Aluminum, Polymer" />
        </div>
      </div>
      <div>
        <Label>Mounting System</Label>
        <Input 
          value={formData.mounting_system || ''} 
          onChange={(e) => onChange('mounting_system', e.target.value)} 
          placeholder="e.g., Picatinny, M-LOK, KeyMod" 
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
