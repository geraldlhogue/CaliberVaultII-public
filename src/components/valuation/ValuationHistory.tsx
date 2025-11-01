import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface ValuationHistoryProps {
  itemId: string;
}

export default function ValuationHistory({ itemId }: ValuationHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [itemId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('valuation_history')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = history
    .slice()
    .reverse()
    .map(h => ({
      date: format(new Date(h.created_at), 'MMM dd'),
      value: h.estimated_value
    }));

  const latestValue = history[0]?.estimated_value || 0;
  const previousValue = history[1]?.estimated_value || latestValue;
  const change = latestValue - previousValue;
  const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(2) : '0';

  if (loading) return <div>Loading history...</div>;
  if (history.length === 0) return <div className="text-sm text-muted-foreground">No valuation history available</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Value Trend</span>
            <div className="flex items-center gap-2">
              {change >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {change >= 0 ? '+' : ''}{changePercent}%
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="font-medium">History</h4>
        {history.map((h) => (
          <Card key={h.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">${h.estimated_value.toLocaleString()}</span>
                    <Badge variant="outline">{h.confidence_level}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(h.created_at), 'PPp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
