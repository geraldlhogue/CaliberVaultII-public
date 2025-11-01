import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Package, TrendingDown, AlertTriangle, ShoppingCart, Clock } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StockAlert {
  item_id: string;
  item_name: string;
  current_stock: number;
  threshold: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

interface ReorderSuggestion {
  item_id: string;
  current_stock: number;
  suggested_quantity: number;
  avg_daily_usage: number;
  lead_time_days: number;
  urgency: string;
}

export function StockAlertDashboard() {
  const { inventory, user } = useAppContext();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && inventory.length > 0) {
      checkStockAlerts();
    }
  }, [user, inventory]);

  const checkStockAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-stock-alerts', {
        body: { userId: user?.id, items: inventory }
      });

      if (error) throw error;

      setAlerts(data.alerts || []);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = (itemId: string, quantity: number) => {
    toast.success(`Reorder initiated for ${quantity} units`);
    // In a real app, this would create a purchase order
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Stock Alert Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Checking stock levels...</div>
          ) : alerts.length === 0 ? (
            <Alert>
              <AlertDescription>
                All items are adequately stocked. No alerts at this time.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Critical Alerts</p>
                        <p className="text-2xl font-bold text-red-600">
                          {alerts.filter(a => a.urgency === 'critical').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {alerts.filter(a => a.urgency === 'high').length}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Reorders</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {suggestions.length}
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => {
                  const suggestion = suggestions.find(s => s.item_id === alert.item_id);
                  return (
                    <Card key={alert.item_id} className="border-l-4" style={{ borderLeftColor: `var(--${alert.urgency})` }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{alert.item_name}</h3>
                              <Badge className={getUrgencyColor(alert.urgency)}>
                                {alert.urgency.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Current Stock: {alert.current_stock}</span>
                              <span>Min Threshold: {alert.threshold}</span>
                              {suggestion && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Lead Time: {suggestion.lead_time_days} days
                                  </span>
                                  <span>Avg Daily Usage: {suggestion.avg_daily_usage.toFixed(1)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {suggestion && (
                            <Button
                              onClick={() => handleQuickReorder(alert.item_id, suggestion.suggested_quantity)}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Reorder {suggestion.suggested_quantity} units
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}