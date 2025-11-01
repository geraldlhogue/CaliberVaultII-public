import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Database, Play, CheckCircle, XCircle, AlertCircle, RefreshCw, History, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { MigrationExecutor, MigrationFile } from './MigrationExecutor';

interface Migration {
  id: string;
  name: string;
  description: string;
  applied: boolean;
  appliedAt?: string;
}

const AVAILABLE_MIGRATIONS: MigrationFile[] = [
  { id: '001', name: 'Initial Schema', description: 'Base inventory tables', sql: '' },
  { id: '002', name: 'RLS Policies', description: 'Row level security', sql: '' },
  { id: '003', name: 'Audit Logs', description: 'Activity tracking', sql: '' },
  { id: '004', name: 'Missing Fields', description: 'Add manufacturer, model, barcode', sql: '' },
  { id: '014', name: 'Realtime', description: 'Enable realtime subscriptions', sql: '' },
];

export function DatabaseMigrationSystem() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    setLoading(true);
    try {
      const appliedIds = await MigrationExecutor.getAppliedMigrations();
      
      const migrationList: Migration[] = AVAILABLE_MIGRATIONS.map(m => ({
        ...m,
        applied: appliedIds.includes(m.id)
      }));

      setMigrations(migrationList);
      toast.success(`Found ${appliedIds.length} applied migrations`);
    } catch (error: any) {
      toast.error('Failed to check migrations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    setRunning(true);
    const pending = migrations.filter(m => !m.applied);
    
    for (let i = 0; i < pending.length; i++) {
      setProgress(((i + 1) / pending.length) * 100);
      const success = await MigrationExecutor.executeMigration(
        AVAILABLE_MIGRATIONS.find(m => m.id === pending[i].id)!
      );
      if (!success) break;
    }
    
    toast.success('Migration execution completed');
    setRunning(false);
    setProgress(0);
    checkMigrationStatus();
  };

  const exportMigrationReport = () => {
    const report = migrations.map(m => 
      `${m.id} - ${m.name}: ${m.applied ? 'Applied' : 'Pending'}`
    ).join('\n');
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migration-report.txt';
    a.click();
    toast.success('Report exported');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Migration System
        </CardTitle>
        <CardDescription>
          Execute and track database schema migrations with real SQL execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkMigrationStatus} disabled={loading} variant="outline">
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
            Check Status
          </Button>
          <Button onClick={runMigrations} disabled={running || loading || migrations.every(m => m.applied)}>
            {running ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run Pending
          </Button>
          <Button onClick={exportMigrationReport} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {running && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">{Math.round(progress)}% complete</p>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {migrations.filter(m => m.applied).length} of {migrations.length} migrations applied
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {migrations.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{m.id}</span>
                  <span className="font-medium">{m.name}</span>
                  <Badge variant={m.applied ? 'default' : 'secondary'}>
                    {m.applied ? 'Applied' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
              </div>
              {m.applied ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

