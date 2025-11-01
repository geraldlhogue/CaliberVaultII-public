import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface PriceAlertManagerProps {
  itemId?: string;
  itemType?: string;
  itemName?: string;
  currentValue?: number;
}

export default function PriceAlertManager({ itemId, itemType, itemName, currentValue }: PriceAlertManagerProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    alertType: 'increase',
    thresholdPercentage: 10,
    thresholdValue: 0
  });

  useEffect(() => {
    fetchAlerts();
    subscribeToAlerts();
  }, [itemId]);

  const fetchAlerts = async () => {
    try {
      const query = supabase.from('price_alerts').select('*').order('created_at', { ascending: false });
      if (itemId) query.eq('item_id', itemId);
      
      const { data, error } = await query;
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel('price_alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_alerts' }, fetchAlerts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const createAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('price_alerts').insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        item_name: itemName,
        alert_type: formData.alertType,
        threshold_percentage: formData.thresholdPercentage,
        threshold_value: formData.thresholdValue,
        current_value: currentValue,
        last_checked_value: currentValue
      });

      if (error) throw error;
      toast.success('Price alert created');
      setShowForm(false);
      fetchAlerts();
    } catch (error: any) {
      toast.error(`Failed to create alert: ${error.message}`);
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('price_alerts').update({ is_active: !isActive }).eq('id', id);
      if (error) throw error;
      toast.success(`Alert ${!isActive ? 'activated' : 'deactivated'}`);
      fetchAlerts();
    } catch (error: any) {
      toast.error(`Failed to update alert: ${error.message}`);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from('price_alerts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (error: any) {
      toast.error(`Failed to delete alert: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Price Alerts
            </span>
            {itemId && <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" />New Alert</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <Label>Alert Type</Label>
                <Select value={formData.alertType} onValueChange={(v) => setFormData({...formData, alertType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Price Increase</SelectItem>
                    <SelectItem value="decrease">Price Decrease</SelectItem>
                    <SelectItem value="threshold">Threshold Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.alertType !== 'threshold' && (
                <div>
                  <Label>Threshold Percentage (%)</Label>
                  <Input type="number" value={formData.thresholdPercentage} onChange={(e) => setFormData({...formData, thresholdPercentage: Number(e.target.value)})} />
                </div>
              )}
              {formData.alertType === 'threshold' && (
                <div>
                  <Label>Threshold Value ($)</Label>
                  <Input type="number" value={formData.thresholdValue} onChange={(e) => setFormData({...formData, thresholdValue: Number(e.target.value)})} />
                </div>
              )}
              <Button onClick={createAlert} className="w-full">Create Alert</Button>
            </div>
          )}

          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No price alerts configured</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {alert.alert_type === 'increase' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                  <div>
                    <p className="font-medium text-sm">{alert.item_name || 'All Items'}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.alert_type === 'threshold' ? `Alert at $${alert.threshold_value}` : `Alert on ${alert.threshold_percentage}% ${alert.alert_type}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={alert.is_active} onCheckedChange={() => toggleAlert(alert.id, alert.is_active)} />
                  <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
