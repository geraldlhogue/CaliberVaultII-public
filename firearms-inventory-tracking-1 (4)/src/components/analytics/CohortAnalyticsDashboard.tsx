import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RetentionHeatmap } from './RetentionHeatmap';
import { CohortComparisonChart } from './CohortComparisonChart';
import { LifecycleStageAnalysis } from './LifecycleStageAnalysis';
import { CohortInsightsDashboard } from './CohortInsightsDashboard';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function CohortAnalyticsDashboard() {
  const [exporting, setExporting] = useState(false);

  const exportCohortReport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const { data: metrics } = await supabase
        .from('cohort_metrics')
        .select('*')
        .order('cohort_date', { ascending: false });

      const { data: insights } = await supabase
        .from('cohort_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (format === 'csv') {
        const csv = [
          'Cohort Date,Period Type,Period Number,Total Users,Retained Users,Retention Rate,Avg Engagement,Lifetime Value',
          ...(metrics || []).map(m => 
            `${m.cohort_date},${m.period_type},${m.period_number},${m.total_users},${m.retained_users},${m.retention_rate},${m.avg_engagement_score || 0},${m.lifetime_value || 0}`
          )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cohort-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const report = {
          generated_at: new Date().toISOString(),
          metrics,
          insights,
          summary: {
            total_cohorts: new Set(metrics?.map(m => m.cohort_date)).size,
            avg_retention: metrics?.reduce((sum, m) => sum + m.retention_rate, 0) / (metrics?.length || 1),
            total_insights: insights?.length || 0,
          }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cohort-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cohort Analysis Dashboard</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => exportCohortReport('csv')} disabled={exporting} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportCohortReport('json')} disabled={exporting} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Comprehensive cohort analysis tracking user retention, engagement patterns, and lifetime value across different user segments.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="heatmap">Retention Heatmap</TabsTrigger>
          <TabsTrigger value="comparison">Cohort Comparison</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Stages</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <RetentionHeatmap />
        </TabsContent>

        <TabsContent value="comparison">
          <CohortComparisonChart />
        </TabsContent>

        <TabsContent value="lifecycle">
          <LifecycleStageAnalysis />
        </TabsContent>

        <TabsContent value="insights">
          <CohortInsightsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
