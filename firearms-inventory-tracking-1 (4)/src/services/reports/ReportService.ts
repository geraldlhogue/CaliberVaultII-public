import { supabase } from '@/lib/supabase';

export interface CustomReport {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  report_type: 'inventory' | 'valuation' | 'acquisition' | 'category' | 'custom';
  config: any;
  widgets?: any[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  user_id: string;
  report_id?: string;
  name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  schedule_config: any;
  email_recipients: string[];
  format: 'pdf' | 'excel' | 'both';
  is_active: boolean;
  last_sent_at?: string;
  next_scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  metadata: {
    reportId?: string;
    generatedAt: string;
    dateRange?: any;
    userId: string;
  };
  data: {
    summary: {
      totalItems: number;
      totalValue: number;
      averageValue: number;
      categories: number;
    };
    categoryBreakdown: Record<string, { count: number; value: number }>;
    items: any[];
    trends: any;
  };
}

export class ReportService {
  static async generateReport(config: {
    reportId?: string;
    reportConfig?: any;
    dateRange?: any;
    format?: string;
  }): Promise<ReportData> {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: config
    });

    if (error) throw error;
    return data;
  }

  static async saveCustomReport(report: Partial<CustomReport>): Promise<CustomReport> {
    const { data, error } = await supabase
      .from('custom_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCustomReport(id: string, updates: Partial<CustomReport>): Promise<CustomReport> {
    const { data, error } = await supabase
      .from('custom_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCustomReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getCustomReports(): Promise<CustomReport[]> {
    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getScheduledReports(): Promise<ScheduledReport[]> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createScheduledReport(report: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
