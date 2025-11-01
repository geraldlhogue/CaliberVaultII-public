import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LifecycleData {
  stage: string;
  userCount: number;
  percentage: number;
  avgEngagement: number;
  avgLifetimeValue: number;
}

export function LifecycleStageAnalysis() {
  const [data, setData] = useState<LifecycleData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Calculate lifecycle stages based on recent activity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: cohorts } = await supabase
      .from('user_cohorts')
      .select('user_id, cohort_date');

    const { data: recentActivity } = await supabase
      .from('cohort_retention_events')
      .select('user_id, event_date, engagement_score')
      .gte('event_date', thirtyDaysAgo);

    const stages: Record<string, LifecycleData> = {
      new: { stage: 'New Users', userCount: 0, percentage: 0, avgEngagement: 0, avgLifetimeValue: 0 },
      active: { stage: 'Active Users', userCount: 0, percentage: 0, avgEngagement: 0, avgLifetimeValue: 0 },
      at_risk: { stage: 'At Risk', userCount: 0, percentage: 0, avgEngagement: 0, avgLifetimeValue: 0 },
      churned: { stage: 'Churned', userCount: 0, percentage: 0, avgEngagement: 0, avgLifetimeValue: 0 },
    };

    cohorts?.forEach(cohort => {
      const userActivity = recentActivity?.filter(a => a.user_id === cohort.user_id);
      const cohortAge = (Date.now() - new Date(cohort.cohort_date).getTime()) / (24 * 60 * 60 * 1000);

      if (cohortAge <= 7) {
        stages.new.userCount++;
      } else if (userActivity && userActivity.length > 0) {
        const lastActivity = new Date(userActivity[0].event_date);
        if (lastActivity.getTime() > new Date(sevenDaysAgo).getTime()) {
          stages.active.userCount++;
        } else {
          stages.at_risk.userCount++;
        }
      } else {
        stages.churned.userCount++;
      }
    });

    const total = Object.values(stages).reduce((sum, s) => sum + s.userCount, 0);
    Object.values(stages).forEach(s => {
      s.percentage = total > 0 ? (s.userCount / total) * 100 : 0;
    });

    setData(Object.values(stages));
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Lifecycle Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="userCount"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.percentage.toFixed(1)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            {data.map((stage, i) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[i] }} />
                  <div>
                    <div className="font-medium">{stage.stage}</div>
                    <div className="text-sm text-gray-600">{stage.userCount} users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stage.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
