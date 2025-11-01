import { supabase } from '@/lib/supabase';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger_type: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  trigger_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface EmailQueueItem {
  id: string;
  user_id: string;
  to_email: string;
  subject: string;
  body: string;
  template_id?: string;
  trigger_type: string;
  trigger_data: Record<string, any>;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  scheduled_for: string;
  sent_at?: string;
  created_at: string;
}

export interface EmailDeliveryLog {
  id: string;
  email_queue_id: string;
  user_id: string;
  to_email: string;
  subject: string;
  trigger_type: string;
  status: string;
  delivered_at: string;
  opened_at?: string;
  clicked_at?: string;
}

export class EmailService {
  // Template Management
  static async getTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({ ...template, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Notification Preferences
  static async getPreferences(): Promise<NotificationPreference[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  }

  static async updatePreference(
    triggerType: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        trigger_type: triggerType,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Email Queue Management
  static async getQueue(): Promise<EmailQueueItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  static async queueEmail(email: {
    to: string;
    subject: string;
    body: string;
    triggerType: string;
    triggerData?: Record<string, any>;
    templateId?: string;
  }): Promise<EmailQueueItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        user_id: user.id,
        to_email: email.to,
        subject: email.subject,
        body: email.body,
        trigger_type: email.triggerType,
        trigger_data: email.triggerData || {},
        template_id: email.templateId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async retryEmail(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_queue')
      .update({
        status: 'pending',
        scheduled_for: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Delivery Logs
  static async getDeliveryLogs(): Promise<EmailDeliveryLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('email_delivery_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('delivered_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }

  // Send Email via Edge Function
  static async sendEmail(email: {
    to: string;
    subject: string;
    body: string;
    triggerType: string;
    triggerData?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await supabase.functions.invoke('email-processor', {
      body: {
        action: 'send',
        data: email
      }
    });

    if (error) throw error;
  }
}
