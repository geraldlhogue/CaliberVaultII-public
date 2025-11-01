import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface Insight {
  id: string;
  insight_type: string;
  cohort_date?: string;
  segment?: string;
  metric_name: string;
  metric_value: number;
  comparison_value?: number;
  insight_text: string;
  confidence_score: number;
  created_at: string;
}

export function CohortInsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const { data } = await supabase
      .from('cohort_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    setInsights(data || []);
  };

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Fetch cohort data
      const { data: metrics } = await supabase
        .from('cohort_metrics')
        .select('*')
        .order('cohort_date', { ascending: false });

      const newInsights: any[] = [];

      // Best performing cohort
      const bestRetention = metrics?.reduce((best, curr) => 
        curr.retention_rate > (best?.retention_rate || 0) ? curr : best
      );

      if (bestRetention) {
        newInsights.push({
          insight_type: 'best_cohort',
          cohort_date: bestRetention.cohort_date,
          metric_name: 'retention_rate',
          metric_value: bestRetention.retention_rate,
          insight_text: `Cohort from ${bestRetention.cohort_date} shows highest retention at ${bestRetention.retention_rate.toFixed(1)}%`,
          confidence_score: 0.95,
        });
      }

      // Highest lifetime value
      const bestLTV = metrics?.reduce((best, curr) => 
        (curr.lifetime_value || 0) > (best?.lifetime_value || 0) ? curr : best
      );

      if (bestLTV && bestLTV.lifetime_value) {
        newInsights.push({
          insight_type: 'highest_ltv',
          cohort_date: bestLTV.cohort_date,
          metric_name: 'lifetime_value',
          metric_value: bestLTV.lifetime_value,
          insight_text: `Cohort from ${bestLTV.cohort_date} has highest LTV at $${bestLTV.lifetime_value.toFixed(2)}`,
          confidence_score: 0.90,
        });
      }

      // At-risk cohorts
      const atRisk = metrics?.filter(m => m.retention_rate < 30 && m.period_number > 4);
      if (atRisk && atRisk.length > 0) {
        newInsights.push({
          insight_type: 'at_risk',
          metric_name: 'retention_rate',
          metric_value: atRisk.length,
          insight_text: `${atRisk.length} cohorts showing concerning retention rates below 30%`,
          confidence_score: 0.85,
        });
      }

      await supabase.from('cohort_insights').insert(newInsights);
      await loadInsights();
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'best_cohort': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'highest_ltv': return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'at_risk': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Automated Insights</CardTitle>
          <Button onClick={generateInsights} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map(insight => (
            <div key={insight.id} className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50">
              {getIcon(insight.insight_type)}
              <div className="flex-1">
                <p className="font-medium">{insight.insight_text}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Confidence: {(insight.confidence_score * 100).toFixed(0)}%</span>
                  <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
