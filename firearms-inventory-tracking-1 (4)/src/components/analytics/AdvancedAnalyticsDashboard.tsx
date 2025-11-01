import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Target, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalTrendsAnalytics } from './HistoricalTrendsAnalytics';

interface AdvancedMetrics {
  totalValue: number;
  totalItems: number;
  averageItemValue: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
  recentActivity: { date: string; action: string; count: number }[];
  topManufacturers: { manufacturer: string; count: number }[];
}

export function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        loadMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: items } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);

      if (!items || items.length === 0) {
        setMetrics({
          totalValue: 0,
          totalItems: 0,
          averageItemValue: 0,
          categoryBreakdown: [],
          recentActivity: [],
          topManufacturers: []
        });
        setLoading(false);
        return;
      }

      const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
      const totalItems = items.length;
      const averageItemValue = totalValue / totalItems;

      // Category breakdown
      const categoryMap = new Map<string, { count: number; value: number }>();
      items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        const existing = categoryMap.get(cat) || { count: 0, value: 0 };
        categoryMap.set(cat, {
          count: existing.count + 1,
          value: existing.value + (item.purchase_price || 0)
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.value - a.value);

      // Top manufacturers
      const mfgMap = new Map<string, number>();
      items.forEach(item => {
        if (item.manufacturer) {
          mfgMap.set(item.manufacturer, (mfgMap.get(item.manufacturer) || 0) + 1);
        }
      });

      const topManufacturers = Array.from(mfgMap.entries())
        .map(([manufacturer, count]) => ({ manufacturer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMetrics({
        totalValue,
        totalItems,
        averageItemValue,
        categoryBreakdown,
        recentActivity: [],
        topManufacturers
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageItemValue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.categoryBreakdown.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
        </TabsList>


        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.categoryBreakdown.map(({ category, count, value }) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category} ({count} items)</span>
                      <span className="font-semibold">${value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(value / metrics.totalValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturers">
          <Card>
            <CardHeader>
              <CardTitle>Top Manufacturers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topManufacturers.map(({ manufacturer, count }) => (
                  <div key={manufacturer} className="flex justify-between items-center">
                    <span className="text-sm">{manufacturer}</span>
                    <span className="font-semibold">{count} items</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <HistoricalTrendsAnalytics />
        </TabsContent>
      </Tabs>

    </div>
  );
}

export default AdvancedAnalyticsDashboard;
