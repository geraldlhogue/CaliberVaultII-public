import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { TrendingUp, DollarSign, Package, Activity, Users, Calendar } from 'lucide-react';

interface ComprehensiveMetrics {
  totalValue: number;
  totalItems: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
  monthlyTrends: { month: string; items: number; value: number }[];
  topManufacturers: { name: string; count: number }[];
  recentActivity: { action: string; timestamp: Date; item: string }[];
}

export function ComprehensiveAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ComprehensiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      const { data: inventory } = await supabase.from('inventory').select('*');
      
      if (!inventory) return;

      const totalValue = inventory.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
      const totalItems = inventory.length;

      const categoryBreakdown = inventory.reduce((acc: any[], item) => {
        const existing = acc.find(c => c.category === item.category);
        if (existing) {
          existing.count++;
          existing.value += item.purchase_price || 0;
        } else {
          acc.push({ category: item.category, count: 1, value: item.purchase_price || 0 });
        }
        return acc;
      }, []);

      setMetrics({
        totalValue,
        totalItems,
        categoryBreakdown,
        monthlyTrends: [],
        topManufacturers: [],
        recentActivity: [],
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Analytics</h2>
          <p className="text-muted-foreground">Advanced insights and reporting</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Portfolio valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Item Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.totalItems ? Math.round(metrics.totalValue / metrics.totalItems) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per item average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.categoryBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.categoryBreakdown.map(cat => (
              <div key={cat.category} className="flex items-center justify-between p-2 border rounded">
                <div className="font-medium">{cat.category}</div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{cat.count} items</span>
                  <span className="font-semibold">${cat.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComprehensiveAnalyticsDashboard;
