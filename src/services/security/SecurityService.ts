import { supabase } from '@/lib/supabase';

export interface TwoFactorAuth {
  id: string;
  user_id: string;
  is_enabled: boolean;
  created_at: string;
  enabled_at?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location?: string;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
  location?: string;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface IPWhitelist {
  id: string;
  api_key_id: string;
  ip_address: string;
  description?: string;
  created_at: string;
  created_by?: string;
}

export class SecurityService {
  // 2FA Methods
  static async setup2FA() {
    const { data, error } = await supabase.functions.invoke('setup-2fa', {
      body: { action: 'setup' }
    });
    if (error) throw error;
    return data;
  }

  static async verify2FA(code: string, secret: string) {
    const { data, error } = await supabase.functions.invoke('setup-2fa', {
      body: { action: 'verify', code, secret }
    });
    if (error) throw error;
    return data;
  }

  static async disable2FA() {
    const { data, error } = await supabase.functions.invoke('setup-2fa', {
      body: { action: 'disable' }
    });
    if (error) throw error;
    return data;
  }

  static async get2FAStatus() {
    const { data, error } = await supabase
      .from('two_factor_auth')
      .select('*')
      .single();
    return { data, error };
  }

  // Session Methods
  static async createSession() {
    const { data, error } = await supabase.functions.invoke('session-manager', {
      body: { action: 'create' }
    });
    if (error) throw error;
    return data;
  }

  static async getSessions() {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true)
      .order('last_activity', { ascending: false });
    return { data, error };
  }

  static async revokeSession(sessionId: string) {
    const { data, error } = await supabase.functions.invoke('session-manager', {
      body: { action: 'revoke', sessionId }
    });
    if (error) throw error;
    return data;
  }

  static async revokeAllSessions(currentSessionId: string) {
    const { data, error } = await supabase.functions.invoke('session-manager', {
      body: { action: 'revoke-all', sessionId: currentSessionId }
    });
    if (error) throw error;
    return data;
  }

  // Login Attempts
  static async getLoginAttempts(limit = 50) {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  // Security Events
  static async getSecurityEvents(resolved = false) {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('is_resolved', resolved)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async resolveSecurityEvent(eventId: string) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('security_events')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.user?.id
      })
      .eq('id', eventId)
      .select()
      .single();
    return { data, error };
  }

  // IP Whitelist
  static async getIPWhitelist(apiKeyId: string) {
    const { data, error } = await supabase
      .from('api_key_whitelist')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async addIPToWhitelist(apiKeyId: string, ipAddress: string, description?: string) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('api_key_whitelist')
      .insert({
        api_key_id: apiKeyId,
        ip_address: ipAddress,
        description,
        created_by: user?.user?.id
      })
      .select()
      .single();
    return { data, error };
  }

  static async removeIPFromWhitelist(whitelistId: string) {
    const { error } = await supabase
      .from('api_key_whitelist')
      .delete()
      .eq('id', whitelistId);
    return { error };
  }

  // GDPR Compliance
  static async exportUserData() {
    const { data, error } = await supabase.functions.invoke('gdpr-compliance', {
      body: { action: 'export' }
    });
    if (error) throw error;
    return data;
  }

  static async deleteUserAccount() {
    const { data, error } = await supabase.functions.invoke('gdpr-compliance', {
      body: { action: 'delete' }
    });
    if (error) throw error;
    return data;
    return data;
  }

  // Instance methods for tests
  async logSecurityEvent(event: Partial<SecurityEvent>): Promise<boolean> {
    const { error } = await supabase
      .from('security_events')
      .insert([event]);
    return !error;
  }

  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('permission', permission)
      .single();
    return !!data && !error;
  }

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }
}

export const service = new SecurityService();
