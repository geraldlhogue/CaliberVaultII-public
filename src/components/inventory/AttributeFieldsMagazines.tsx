import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttributeFieldsMagazinesProps {
  formData: any;
  setFormData: (data: any) => void;
  calibers: any[];
}

export function AttributeFieldsMagazines({ formData, setFormData, calibers }: AttributeFieldsMagazinesProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Caliber</Label>
        <Select
          value={formData.caliber_id || ''}
          onValueChange={(value) => setFormData({ ...formData, caliber_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select caliber" />
          </SelectTrigger>
          <SelectContent>
            {calibers.map((cal) => (
              <SelectItem key={cal.id} value={cal.id}>
                {cal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Capacity (rounds)</Label>
        <Input
          type="number"
          value={formData.capacity || ''}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
          placeholder="e.g., 30"
        />
      </div>

      <div>
        <Label>Material</Label>
        <Select
          value={formData.material || ''}
          onValueChange={(value) => setFormData({ ...formData, material: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Steel">Steel</SelectItem>
            <SelectItem value="Aluminum">Aluminum</SelectItem>
            <SelectItem value="Polymer">Polymer</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Finish</Label>
        <Input
          value={formData.finish || ''}
          onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
          placeholder="e.g., Blued, Parkerized, Cerakote"
        />
      </div>
    </div>
  );
}
