import { supabase } from '@/lib/supabase';

export interface APIKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  attempt_number: number;
  delivered_at: string | null;
  created_at: string;
}

export class APIService {
  static async createAPIKey(name: string, scopes: string[], rateLimit: number = 1000, expiresAt?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate API key
    const apiKey = `cv_${this.generateRandomString(32)}`;
    const keyHash = await this.hashKey(apiKey);
    const keyPrefix = apiKey.substring(0, 10);

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes,
        rate_limit: rateLimit,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, plainKey: apiKey };
  }

  static async getAPIKeys(): Promise<APIKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async deleteAPIKey(id: string) {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleAPIKey(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  }

  static async createWebhook(webhook: Partial<Webhook>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const secret = this.generateRandomString(32);

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        ...webhook,
        user_id: user.id,
        secret
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWebhooks(): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateWebhook(id: string, updates: Partial<Webhook>) {
    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteWebhook(id: string) {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getWebhookLogs(webhookId: string): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  }

  static async testWebhook(webhookId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('webhook-dispatcher', {
      body: {
        eventType: 'test',
        payload: { message: 'Test webhook', timestamp: new Date().toISOString() },
        userId: user.id
      }
    });

    if (error) throw error;
    return data;
  }

  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
