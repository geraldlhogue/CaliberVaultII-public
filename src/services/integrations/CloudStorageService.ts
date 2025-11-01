import { supabase } from '@/lib/supabase';

export interface CloudConnection {
  id: string;
  user_id: string;
  provider: 'google_drive' | 'dropbox' | 'onedrive';
  account_email: string;
  folder_id?: string;
  auto_sync_enabled: boolean;
  last_sync_at?: string;
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  connection_id: string;
  sync_type: 'backup' | 'restore' | 'auto_sync';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  files_synced: number;
  bytes_transferred: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export class CloudStorageService {
  static async getConnections(): Promise<CloudConnection[]> {
    const { data, error } = await supabase
      .from('cloud_storage_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async connectProvider(provider: string, email: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'connect', provider, email }
    });

    if (error) throw error;
    return data;
  }

  static async syncNow(connectionId: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('cloud-storage-sync', {
      body: { action: 'sync', connectionId }
    });

    if (error) throw error;
    return data;
  }

  static async getSyncLogs(connectionId: string): Promise<SyncLog[]> {
    const { data, error } = await supabase
      .from('cloud_sync_logs')
      .select('*')
      .eq('connection_id', connectionId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  static async deleteConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('cloud_storage_connections')
      .delete()
      .eq('id', connectionId);

    if (error) throw error;
  }
}
