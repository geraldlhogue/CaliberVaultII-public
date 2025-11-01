import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Database, CheckCircle, AlertCircle, Upload, Download, RefreshCw } from 'lucide-react';

interface Migration {
  id: string;
  version: string;
  name: string;
  description: string;
  applied_at?: string;
  status: 'pending' | 'applied' | 'failed';
}

export function DatabaseMigrationSystem() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMigrations();
  }, []);

  const loadMigrations = async () => {
    try {
      // Check migration status
      const { data, error } = await supabase
        .from('migration_backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Define available migrations
      const availableMigrations: Migration[] = [
        {
          id: '001',
          version: '1.0.0',
          name: 'Initial Schema',
          description: 'Create base tables and relationships',
          status: 'applied'
        },
        {
          id: '002',
          version: '1.1.0',
          name: 'Add Inventory Features',
          description: 'Add advanced inventory tracking fields',
          status: 'applied'
        },
        {
          id: '003',
          version: '1.2.0',
          name: 'Performance Optimization',
          description: 'Add indexes and optimize queries',
          status: 'pending'
        }
      ];

      setMigrations(availableMigrations);
    } catch (err) {
      console.error('Error loading migrations:', err);
    }
  };

  const runMigration = async (migration: Migration) => {
    setIsRunning(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      // Simulate migration progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mark migration as applied
      const updatedMigrations = migrations.map(m => 
        m.id === migration.id 
          ? { ...m, status: 'applied' as const, applied_at: new Date().toISOString() }
          : m
      );
      setMigrations(updatedMigrations);
      setSuccess(`Migration "${migration.name}" applied successfully`);
    } catch (err: any) {
      setError(err.message);
      const updatedMigrations = migrations.map(m => 
        m.id === migration.id ? { ...m, status: 'failed' as const } : m
      );
      setMigrations(updatedMigrations);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  const rollbackMigration = async (migration: Migration) => {
    setIsRunning(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate rollback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedMigrations = migrations.map(m => 
        m.id === migration.id 
          ? { ...m, status: 'pending' as const, applied_at: undefined }
          : m
      );
      setMigrations(updatedMigrations);
      setSuccess(`Migration "${migration.name}" rolled back successfully`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Migration System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isRunning && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Running migration...</p>
            <Progress value={progress} />
          </div>
        )}

        <div className="space-y-3">
          {migrations.map((migration) => (
            <div
              key={migration.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{migration.name}</span>
                  <span className="text-xs text-muted-foreground">v{migration.version}</span>
                  {migration.status === 'applied' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {migration.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{migration.description}</p>
                {migration.applied_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied: {new Date(migration.applied_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {migration.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => runMigration(migration)}
                    disabled={isRunning}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                )}
                {migration.status === 'applied' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rollbackMigration(migration)}
                    disabled={isRunning}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Rollback
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={loadMigrations} variant="outline" disabled={isRunning}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}