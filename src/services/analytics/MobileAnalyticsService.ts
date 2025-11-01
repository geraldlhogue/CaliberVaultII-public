import { supabase } from '@/lib/supabase';

export interface MobileSessionMetrics {
  session_id: string;
  user_id: string;
  device_type: 'ios' | 'android' | 'web';
  app_version: string;
  session_start: string;
  session_end?: string;
  duration_seconds?: number;
  screens_viewed: string[];
  actions_performed: string[];
  crashes: number;
  errors: number;
}

export interface MobileAnalyticsData {
  daily_active_users: number;
  monthly_active_users: number;
  avg_session_duration: number;
  retention_rate_day_1: number;
  retention_rate_day_7: number;
  retention_rate_day_30: number;
  top_screens: { screen: string; views: number }[];
  top_actions: { action: string; count: number }[];
  crash_rate: number;
  error_rate: number;
}

export class MobileAnalyticsService {
  static async trackSession(data: Partial<MobileSessionMetrics>) {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error tracking session:', error);
      throw error;
    }
  }

  static async endSession(sessionId: string) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          session_end: new Date().toISOString(),
          duration_seconds: supabase.raw('EXTRACT(EPOCH FROM (now() - session_start))')
        })
        .eq('session_id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  static async getAnalytics(startDate: string, endDate: string): Promise<MobileAnalyticsData> {
    try {
      const { data, error } = await supabase.rpc('get_mobile_analytics', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
}
