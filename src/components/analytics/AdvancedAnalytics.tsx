import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Target } from 'lucide-react';
import { format, subMonths, parseISO } from 'date-fns';

interface AdvancedMetrics {
  totalValue: number;
  valueChange: number;
  averageItemValue: number;
  mostValuableCategory: string;
  depreciationRate: number;
  projectedValue: number;
  acquisitionTrend: { month: string; count: number; value: number }[];
  categoryValue: { category: string; value: number; percentage: number }[];
}

export function AdvancedAnalytics() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvancedMetrics();
  }, []);

  const loadAdvancedMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: items } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);


      // Handle undefined or empty items array
      if (!items || items.length === 0) {
        setMetrics({
          totalValue: 0,
          valueChange: 0,
          averageItemValue: 0,
          mostValuableCategory: 'N/A',
          depreciationRate: 0,
          projectedValue: 0,
          acquisitionTrend: [],
          categoryValue: []
        });
        return;
      }


      const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
      const averageItemValue = totalValue / (items.length || 1);

      // Category values
      const categoryMap = new Map<string, number>();
      items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + (item.purchase_price || 0));
      });

      const categoryValue = Array.from(categoryMap.entries())
        .map(([category, value]) => ({
          category,
          value,
          percentage: (value / totalValue) * 100
        }))
        .sort((a, b) => b.value - a.value);

      const mostValuableCategory = categoryValue[0]?.category || 'N/A';

      // Mock trends
      const acquisitionTrend = [
        { month: 'Jan', count: 5, value: 2500 },
        { month: 'Feb', count: 3, value: 1800 },
        { month: 'Mar', count: 7, value: 4200 },
        { month: 'Apr', count: 4, value: 2100 },
        { month: 'May', count: 6, value: 3600 },
        { month: 'Jun', count: 8, value: 5000 }
      ];

      setMetrics({
        totalValue,
        valueChange: 12.5,
        averageItemValue,
        mostValuableCategory,
        depreciationRate: 2.3,
        projectedValue: totalValue * 0.95,
        acquisitionTrend,
        categoryValue
      });
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{metrics.valueChange}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Item Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageItemValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per inventory item</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Depreciation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.depreciationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Annual rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Value by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.categoryValue.slice(0, 5).map(({ category, value, percentage }) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{category}</span>
                  <span className="font-semibold">${value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedAnalytics;

