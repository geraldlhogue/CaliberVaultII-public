import { supabase } from '@/lib/supabase';

export interface CohortData {
  cohortDate: string;
  totalUsers: number;
  retentionByPeriod: { [key: number]: number };
  engagementScore: number;
  lifetimeValue: number;
}

export interface RetentionHeatmapData {
  cohorts: string[];
  periods: number[];
  data: number[][];
}

export interface LifecycleStage {
  stage: 'new' | 'active' | 'at_risk' | 'churned';
  userCount: number;
  percentage: number;
}

export class CohortAnalysisService {
  static async trackUserCohort(userId: string, acquisitionSource?: string) {
    const firstSession = new Date();
    const cohortDate = firstSession.toISOString().split('T')[0];
    
    const { error } = await supabase.from('user_cohorts').upsert({
      user_id: userId,
      cohort_date: cohortDate,
      cohort_week: this.getWeekNumber(firstSession),
      cohort_month: firstSession.getMonth() + 1,
      cohort_quarter: Math.floor(firstSession.getMonth() / 3) + 1,
      first_session_date: firstSession.toISOString(),
      acquisition_source: acquisitionSource,
    });

    if (error) throw error;
  }

  static async trackRetentionEvent(userId: string, featureUsage: Record<string, number>) {
    const { data: cohort } = await supabase
      .from('user_cohorts')
      .select('cohort_date, first_session_date')
      .eq('user_id', userId)
      .single();

    if (!cohort) return;

    const now = new Date();
    const cohortDate = new Date(cohort.cohort_date);
    const daysSince = Math.floor((now.getTime() - cohortDate.getTime()) / (1000 * 60 * 60 * 24));

    await supabase.from('cohort_retention_events').insert({
      user_id: userId,
      cohort_date: cohort.cohort_date,
      event_date: now.toISOString().split('T')[0],
      days_since_cohort: daysSince,
      weeks_since_cohort: Math.floor(daysSince / 7),
      months_since_cohort: Math.floor(daysSince / 30),
      feature_usage: featureUsage,
      engagement_score: this.calculateEngagementScore(featureUsage),
    });
  }

  static async getRetentionHeatmap(periodType: 'day' | 'week' | 'month' = 'week'): Promise<RetentionHeatmapData> {
    const { data } = await supabase
      .from('cohort_metrics')
      .select('*')
      .eq('period_type', periodType)
      .order('cohort_date', { ascending: false })
      .limit(12);

    const cohorts = [...new Set(data?.map(d => d.cohort_date) || [])];
    const maxPeriod = Math.max(...(data?.map(d => d.period_number) || [0]));
    const periods = Array.from({ length: maxPeriod + 1 }, (_, i) => i);

    const heatmapData = cohorts.map(cohort => {
      return periods.map(period => {
        const metric = data?.find(d => d.cohort_date === cohort && d.period_number === period);
        return metric?.retention_rate || 0;
      });
    });

    return { cohorts, periods, data: heatmapData };
  }

  static async getLifecycleStages(): Promise<LifecycleStage[]> {
    const { data } = await supabase.rpc('calculate_lifecycle_stages');
    return data || [];
  }

  static async generateInsights() {
    const { data: cohorts } = await supabase.from('cohort_metrics').select('*');
    const insights = [];

    // Best performing cohort
    const bestCohort = cohorts?.reduce((best, current) => 
      current.retention_rate > (best?.retention_rate || 0) ? current : best
    );

    if (bestCohort) {
      insights.push({
        insight_type: 'best_cohort',
        cohort_date: bestCohort.cohort_date,
        metric_name: 'retention_rate',
        metric_value: bestCohort.retention_rate,
        insight_text: `Cohort from ${bestCohort.cohort_date} shows highest retention at ${bestCohort.retention_rate}%`,
        confidence_score: 0.95,
      });
    }

    await supabase.from('cohort_insights').insert(insights);
    return insights;
  }

  private static getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  }

  private static calculateEngagementScore(features: Record<string, number>): number {
    const weights = { inventory: 1.0, reports: 0.8, sharing: 0.6 };
    let score = 0;
    Object.entries(features).forEach(([key, value]) => {
      score += value * (weights[key as keyof typeof weights] || 0.5);
    });
    return Math.min(100, score);
  }
}
