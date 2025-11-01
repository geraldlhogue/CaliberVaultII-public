import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CohortMetric {
  cohort_date: string;
  period_number: number;
  retention_rate: number;
}

export function CohortComparisonChart() {
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohorts.length > 0) {
      loadComparisonData();
    }
  }, [selectedCohorts]);

  const loadCohorts = async () => {
    const { data } = await supabase
      .from('cohort_metrics')
      .select('cohort_date')
      .order('cohort_date', { ascending: false })
      .limit(10);

    const uniqueCohorts = [...new Set(data?.map(d => d.cohort_date) || [])];
    setCohorts(uniqueCohorts);
    setSelectedCohorts(uniqueCohorts.slice(0, 3));
  };

  const loadComparisonData = async () => {
    const { data } = await supabase
      .from('cohort_metrics')
      .select('*')
      .in('cohort_date', selectedCohorts)
      .eq('period_type', 'week')
      .order('period_number');

    const chartData: any[] = [];
    const maxPeriod = Math.max(...(data?.map(d => d.period_number) || [0]));

    for (let i = 0; i <= maxPeriod; i++) {
      const point: any = { week: i };
      selectedCohorts.forEach(cohort => {
        const metric = data?.find(d => d.cohort_date === cohort && d.period_number === i);
        point[cohort] = metric?.retention_rate || 0;
      });
      chartData.push(point);
    }

    setData(chartData);
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Comparison</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {cohorts.map(cohort => (
            <label key={cohort} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCohorts.includes(cohort)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCohorts([...selectedCohorts, cohort]);
                  } else {
                    setSelectedCohorts(selectedCohorts.filter(c => c !== cohort));
                  }
                }}
              />
              <span className="text-sm">{cohort}</span>
            </label>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" label={{ value: 'Weeks Since Cohort', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {selectedCohorts.map((cohort, i) => (
              <Line
                key={cohort}
                type="monotone"
                dataKey={cohort}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
