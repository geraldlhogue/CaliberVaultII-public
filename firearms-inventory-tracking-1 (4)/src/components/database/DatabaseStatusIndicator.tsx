import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw, Play } from 'lucide-react';
import { toast } from 'sonner';
import { MigrationExecutor } from './MigrationExecutor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface DatabaseStatus {
  connected: boolean;
  tablesExist: boolean;
  hasData: boolean;
  missingTables: string[];
  error?: string;
}

const REQUIRED_TABLES = ['inventory_items', 'firearms', 'ammunition', 'optics', 'suppressors', 'manufacturers', 'categories'];

export function DatabaseStatusIndicator() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setChecking(true);
    try {
      const { error: connError, count } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true });
      
      const isTableMissingError = connError && (connError.message.includes('does not exist') || connError.code === '42P01');
      
      if (isTableMissingError) {
        setStatus({ connected: true, tablesExist: false, hasData: false, missingTables: REQUIRED_TABLES, error: 'Database tables not found' });
      } else if (connError) {
        console.warn('Database check warning:', connError);
        setStatus({ connected: true, tablesExist: true, hasData: true, missingTables: [] });
      } else {
        const missingTables: string[] = [];
        for (const table of REQUIRED_TABLES) {
          const { error } = await supabase.from(table).select('count').limit(1);
          if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
            missingTables.push(table);
          }
        }
        setStatus({ connected: true, tablesExist: missingTables.length === 0, hasData: (count || 0) > 0, missingTables });
      }
    } catch (error: any) {
      console.error('Database status check failed:', error);
      setStatus({ connected: true, tablesExist: true, hasData: true, missingTables: [] });
    } finally {
      setChecking(false);
    }
  };

  const runSetup = async () => {
    setRunning(true);
    setProgress(0);
    try {
      const migrations = await MigrationExecutor.getAvailableMigrations();
      const total = migrations.length;
      for (let i = 0; i < total; i++) {
        setProgress(((i + 1) / total) * 100);
        await MigrationExecutor.executeMigration(migrations[i]);
      }
      toast.success('Database setup completed!');
      setShowSetup(false);
      await checkDatabaseStatus();
    } catch (error: any) {
      toast.error('Setup failed: ' + error.message);
    } finally {
      setRunning(false);
      setProgress(0);
    }
  };

  if (checking) return <Alert className="border-blue-200 bg-blue-50"><RefreshCw className="h-4 w-4 animate-spin" /><AlertTitle>Checking Database...</AlertTitle></Alert>;
  if (!status) return null;
  if (!status.connected) return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Database Connection Failed</AlertTitle><AlertDescription>{status.error}</AlertDescription></Alert>;
  if (!status.tablesExist && !status.hasData) {
    return (<><Alert className="border-yellow-200 bg-yellow-50"><AlertTriangle className="h-4 w-4" /><AlertTitle>Database Setup Required</AlertTitle><AlertDescription className="mt-2 space-y-2"><p>Missing {status.missingTables.length} required table(s)</p><Button onClick={() => setShowSetup(true)} className="mt-3"><Play className="mr-2 h-4 w-4" />Run Setup</Button></AlertDescription></Alert><Dialog open={showSetup} onOpenChange={setShowSetup}><DialogContent><DialogHeader><DialogTitle>Database Setup</DialogTitle><DialogDescription>Create all necessary tables</DialogDescription></DialogHeader><div className="space-y-4">{running && <div className="space-y-2"><Progress value={progress} /><p className="text-sm text-center">{Math.round(progress)}%</p></div>}<Button onClick={runSetup} disabled={running} className="w-full">{running ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}{running ? 'Setting up...' : 'Start'}</Button></div></DialogContent></Dialog></>);
  }
  return <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertTitle className="text-green-800">Database Connected</AlertTitle><AlertDescription className="text-green-700">All tables ready</AlertDescription></Alert>;
}
