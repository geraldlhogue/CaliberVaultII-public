import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Wrench, Plus, Trash2, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory';

interface AutoBuildConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: InventoryItem[];
}

interface BuildComponent {
  category: string;
  itemId: string;
  itemName: string;
  quantity: number;
}

const COMPONENT_CATEGORIES = [
  'Upper Receiver', 'Lower Receiver', 'Barrel', 'Bolt Carrier Group',
  'Trigger', 'Stock', 'Handguard', 'Muzzle Device', 'Optic', 'Sights',
  'Light', 'Sling', 'Magazine', 'Grip', 'Other'
];

export default function AutoBuildConfigurator({ isOpen, onClose, availableItems }: AutoBuildConfiguratorProps) {
  const [buildName, setBuildName] = useState('');
  const [components, setComponents] = useState<BuildComponent[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const autoDetectComponents = () => {
    const detected: BuildComponent[] = [];
    
    selectedItems.forEach(itemId => {
      const item = availableItems.find(i => i.id === itemId);
      if (!item) return;

      const category = detectCategory(item);
      detected.push({
        category,
        itemId: item.id,
        itemName: item.name,
        quantity: 1
      });
    });

    setComponents(detected);
    toast({ title: 'Components auto-detected', description: `Found ${detected.length} components` });
  };

  const detectCategory = (item: InventoryItem): string => {
    const name = item.name.toLowerCase();
    if (name.includes('upper')) return 'Upper Receiver';
    if (name.includes('lower')) return 'Lower Receiver';
    if (name.includes('barrel')) return 'Barrel';
    if (name.includes('bcg') || name.includes('bolt')) return 'Bolt Carrier Group';
    if (name.includes('trigger')) return 'Trigger';
    if (name.includes('stock')) return 'Stock';
    if (name.includes('handguard') || name.includes('rail')) return 'Handguard';
    if (name.includes('muzzle') || name.includes('brake')) return 'Muzzle Device';
    if (name.includes('optic') || name.includes('scope')) return 'Optic';
    if (name.includes('sight')) return 'Sights';
    if (name.includes('light') || name.includes('flashlight')) return 'Light';
    if (name.includes('sling')) return 'Sling';
    if (name.includes('magazine') || name.includes('mag')) return 'Magazine';
    if (name.includes('grip')) return 'Grip';
    return 'Other';
  };

  const saveBuild = async () => {
    if (!buildName || components.length === 0) {
      toast({ title: 'Missing information', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('firearm_builds')
      .insert({
        user_id: user.id,
        name: buildName,
        components,
        created_at: new Date().toISOString()
      });

    if (error) {
      toast({ title: 'Failed to save build', variant: 'destructive' });
    } else {
      toast({ title: 'Build saved successfully' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Auto Build Configurator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Build Name</Label>
            <Input 
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="My Custom Build"
            />
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Select Items</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableItems.map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                  />
                  <span className="text-sm">{item.name}</span>
                </label>
              ))}
            </div>
          </Card>

          <Button onClick={autoDetectComponents} className="w-full" variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-Detect Components
          </Button>

          {components.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Build Components ({components.length})</h3>
              <div className="space-y-2">
                {components.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="text-sm font-medium">{comp.category}</div>
                      <div className="text-xs text-muted-foreground">{comp.itemName}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setComponents(components.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={saveBuild} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Build
            </Button>
            <Button onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
