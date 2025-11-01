import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttributeFieldsAccessoriesProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function AttributeFieldsAccessories({ formData, setFormData }: AttributeFieldsAccessoriesProps) {
  const accessoryCategories = [
    'Holsters',
    'Slings',
    'Cases',
    'Cleaning Kits',
    'Tools',
    'Bipods',
    'Grips',
    'Stocks',
    'Lights',
    'Lasers',
    'Rail Systems',
    'Mounts',
    'Bags',
    'Safes',
    'Other'
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label>Accessory Type</Label>
        <Select
          value={formData.category || ''}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select accessory type" />
          </SelectTrigger>
          <SelectContent>
            {accessoryCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
