import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface MigrationFile {
  id: string;
  name: string;
  sql: string;
  description: string;
}

export class MigrationExecutor {
  private static async createMigrationsTable() {
    // Check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('schema_migrations')
      .select('id')
      .limit(1);
    
    // If table doesn't exist, it should have been created by SQL migration
    // Just log a warning if there's an issue
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('schema_migrations table check:', checkError);
    }
  }


  static async getAppliedMigrations(): Promise<string[]> {
    try {
      await this.createMigrationsTable();
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('id');
      
      if (error) throw error;
      return data?.map(m => m.id) || [];
    } catch (err) {
      console.error('Failed to get migrations:', err);
      return [];
    }
  }

  static async executeMigration(migration: MigrationFile): Promise<boolean> {
    try {
      // Since we can't execute arbitrary SQL from the client,
      // we just record that the migration was "applied"
      // Actual migrations should be run via Supabase dashboard or CLI
      
      // Use upsert to avoid duplicate key errors
      const { error: recordError } = await supabase
        .from('schema_migrations')
        .upsert(
          { id: migration.id, name: migration.name },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      
      if (recordError) {
        // If it's a duplicate key error, just log it as already applied
        if (recordError.code === '23505') {
          console.log(`Migration ${migration.name} already applied`);
          return true;
        }
        throw recordError;
      }

      toast.success(`Migration ${migration.name} marked as applied`);
      return true;
    } catch (err: any) {
      console.error('Migration error:', err);
      toast.error(`Migration failed: ${err.message}`);
      return false;
    }
  }



  static async rollbackMigration(migrationId: string, rollbackSql?: string): Promise<boolean> {
    try {
      // Note: Actual rollback SQL should be executed via Supabase dashboard
      // This just removes the migration record
      
      const { error } = await supabase
        .from('schema_migrations')
        .delete()
        .eq('id', migrationId);
      
      if (error) throw error;
      
      toast.success(`Migration ${migrationId} record removed`);
      return true;
    } catch (err: any) {
      toast.error(`Rollback failed: ${err.message}`);
      return false;
    }
  }

  static async getMigrationHistory(): Promise<any[]> {
    try {
      await this.createMigrationsTable();
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('*')
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to get migration history:', err);
      return [];
    }
  }

  static async getAvailableMigrations(): Promise<MigrationFile[]> {
    // Return list of all available migrations
    return [
      { id: '001', name: 'Initial Schema', description: 'Base inventory tables', sql: 'SELECT 1;' },
      { id: '002', name: 'RLS Policies', description: 'Row level security', sql: 'SELECT 1;' },
      { id: '003', name: 'Audit Logs', description: 'Activity tracking', sql: 'SELECT 1;' },
    ];
  }
}
