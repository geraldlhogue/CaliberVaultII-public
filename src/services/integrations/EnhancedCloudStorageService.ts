import { supabase } from '@/lib/supabase';

export interface CloudConnection {
  id: string;
  user_id: string;
  provider: 'google_drive' | 'dropbox' | 'onedrive' | 'box' | 'icloud' | 'aws_s3';
  account_email: string;
  account_id?: string;
  folder_id?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  auto_sync_enabled: boolean;
  sync_status: 'idle' | 'syncing' | 'paused' | 'error';
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  selective_sync_enabled: boolean;
  selective_folders: string[];
  storage_quota_total?: number;
  storage_quota_used?: number;
  last_sync_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncSchedule {
  id: string;
  connection_id: string;
  schedule_type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cron_expression?: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  selective_folders: string[];
  file_filters: Record<string, any>;
}

export interface FileVersion {
  id: string;
  connection_id: string;
  file_path: string;
  file_name: string;
  version_number: number;
  file_size: number;
  file_hash: string;
  cloud_file_id: string;
  is_current: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

export interface SyncConflict {
  id: string;
  connection_id: string;
  file_path: string;
  conflict_type: 'modified_both' | 'deleted_local' | 'deleted_remote' | 'type_mismatch';
  local_version: Record<string, any>;
  remote_version: Record<string, any>;
  resolution_strategy?: 'keep_local' | 'keep_remote' | 'keep_both' | 'manual';
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface BandwidthSettings {
  id: string;
  user_id: string;
  connection_id: string;
  max_upload_mbps?: number;
  max_download_mbps?: number;
  throttle_enabled: boolean;
  schedule_throttling: any[];
}

export class EnhancedCloudStorageService {
  // OAuth Methods
  static async initiateOAuth(provider: string): Promise<{ authUrl: string }> {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'get_auth_url', provider }
    });
    if (error) throw error;
    return data;
  }

  static async handleOAuthCallback(provider: string, tokenData: any, email: string) {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('cloud_storage_connections')
      .insert({
        provider,
        account_email: email,
        account_id: tokenData.account_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        auto_sync_enabled: true,
        sync_frequency: 'daily'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Connection Management
  static async getConnections(): Promise<CloudConnection[]> {
    const { data, error } = await supabase
      .from('cloud_storage_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateConnection(id: string, updates: Partial<CloudConnection>) {
    const { data, error } = await supabase
      .from('cloud_storage_connections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteConnection(id: string) {
    const { error } = await supabase
      .from('cloud_storage_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // File Operations
  static async uploadFiles(connectionId: string, files: any[], options?: any) {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'upload_files', connectionId, files, options }
    });
    if (error) throw error;
    return data;
  }

  static async downloadFiles(connectionId: string, files: any[], options?: any) {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'download_files', connectionId, files, options }
    });
    if (error) throw error;
    return data;
  }

  static async listFiles(connectionId: string, options?: any) {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'list_files', connectionId, options }
    });
    if (error) throw error;
    return data;
  }

  // Sync Schedules
  static async createSchedule(schedule: Partial<SyncSchedule>) {
    const { data, error } = await supabase
      .from('sync_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSchedules(connectionId: string): Promise<SyncSchedule[]> {
    const { data, error } = await supabase
      .from('sync_schedules')
      .select('*')
      .eq('connection_id', connectionId);

    if (error) throw error;
    return data || [];
  }

  static async updateSchedule(id: string, updates: Partial<SyncSchedule>) {
    const { data, error } = await supabase
      .from('sync_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // File Versions
  static async getFileVersions(connectionId: string, filePath: string): Promise<FileVersion[]> {
    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('connection_id', connectionId)
      .eq('file_path', filePath)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Conflict Resolution
  static async getConflicts(connectionId?: string): Promise<SyncConflict[]> {
    let query = supabase
      .from('sync_conflicts')
      .select('*')
      .eq('resolved', false);

    if (connectionId) {
      query = query.eq('connection_id', connectionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async resolveConflict(conflictId: string, strategy: string) {
    const { data: funcData, error: funcError } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'resolve_conflict', options: { conflictId, strategy } }
    });

    if (funcError) throw funcError;

    const { data, error } = await supabase
      .from('sync_conflicts')
      .update({ 
        resolved: true, 
        resolution_strategy: strategy,
        resolved_at: new Date().toISOString()
      })
      .eq('id', conflictId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bandwidth Settings
  static async getBandwidthSettings(connectionId: string): Promise<BandwidthSettings | null> {
    const { data, error } = await supabase
      .from('bandwidth_settings')
      .select('*')
      .eq('connection_id', connectionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateBandwidthSettings(connectionId: string, settings: Partial<BandwidthSettings>) {
    const { data, error } = await supabase
      .from('bandwidth_settings')
      .upsert({ connection_id: connectionId, ...settings })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Storage Quota
  static async checkQuota(connectionId: string) {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'check_quota', connectionId }
    });
    if (error) throw error;
    return data;
  }
}
