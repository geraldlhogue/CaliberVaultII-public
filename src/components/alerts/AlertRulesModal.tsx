import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface AlertRule {
  id?: string;
  item_id?: string;
  category?: string;
  rule_type: 'item' | 'category';
  min_threshold: number;
  reorder_quantity: number;
  lead_time_days: number;
  is_active: boolean;
  notification_email: boolean;
  notification_push: boolean;
}

interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertRulesModal({ isOpen, onClose }: AlertRulesModalProps) {
  const { inventory, user } = useAppContext();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  const categories = [...new Set(inventory.map(item => item.category))];

  useEffect(() => {
    if (isOpen && user) {
      loadRules();
    }
  }, [isOpen, user]);

  const loadRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_alert_rules')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast.error('Failed to load alert rules');
    } finally {
      setLoading(false);
    }
  };

  const addRule = (type: 'item' | 'category') => {
    const newRule: AlertRule = {
      rule_type: type,
      min_threshold: 10,
      reorder_quantity: 50,
      lead_time_days: 7,
      is_active: true,
      notification_email: true,
      notification_push: false
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<AlertRule>) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    setRules(updatedRules);
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const saveRules = async () => {
    setLoading(true);
    try {
      // Delete existing rules
      await supabase
        .from('stock_alert_rules')
        .delete()
        .eq('user_id', user?.id);

      // Insert new rules
      const rulesToSave = rules.map(rule => ({
        ...rule,
        user_id: user?.id
      }));

      const { error } = await supabase
        .from('stock_alert_rules')
        .insert(rulesToSave);

      if (error) throw error;
      
      toast.success('Alert rules saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error('Failed to save alert rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stock Alert Rules Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Item-Specific Rules</TabsTrigger>
            <TabsTrigger value="categories">Category Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Button onClick={() => addRule('item')} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item Rule
            </Button>
            
            {rules.filter(r => r.rule_type === 'item').map((rule, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Item</Label>
                      <Select
                        value={rule.item_id}
                        onValueChange={(value) => updateRule(index, { item_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Min Stock Threshold</Label>
                      <Input
                        type="number"
                        value={rule.min_threshold}
                        onChange={(e) => updateRule(index, { min_threshold: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Reorder Quantity</Label>
                      <Input
                        type="number"
                        value={rule.reorder_quantity}
                        onChange={(e) => updateRule(index, { reorder_quantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Lead Time (days)</Label>
                      <Input
                        type="number"
                        value={rule.lead_time_days}
                        onChange={(e) => updateRule(index, { lead_time_days: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.notification_email}
                          onCheckedChange={(checked) => updateRule(index, { notification_email: checked })}
                        />
                        <Label>Email Notifications</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.notification_push}
                          onCheckedChange={(checked) => updateRule(index, { notification_push: checked })}
                        />
                        <Label>Push Notifications</Label>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Button onClick={() => addRule('category')} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Category Rule
            </Button>
            
            {rules.filter(r => r.rule_type === 'category').map((rule, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={rule.category}
                        onValueChange={(value) => updateRule(index, { category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Min Stock Threshold</Label>
                      <Input
                        type="number"
                        value={rule.min_threshold}
                        onChange={(e) => updateRule(index, { min_threshold: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Reorder Quantity</Label>
                      <Input
                        type="number"
                        value={rule.reorder_quantity}
                        onChange={(e) => updateRule(index, { reorder_quantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Lead Time (days)</Label>
                      <Input
                        type="number"
                        value={rule.lead_time_days}
                        onChange={(e) => updateRule(index, { lead_time_days: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => updateRule(index, { is_active: checked })}
                        />
                        <Label>Rule Active</Label>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveRules} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Rules
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}