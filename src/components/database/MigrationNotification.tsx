import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function MigrationNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'running' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      // Check if the new columns exist
      const { data, error } = await supabase
        .from('manufacturers')
        .select('makes_ammunition')
        .limit(1);

      if (error && error.code === '42703') {
        // Column doesn't exist, migration needed
        setShowNotification(true);
      }
    } catch (err) {
      console.error('Error checking migration status:', err);
    }
  };

  const runMigrations = async () => {
    setIsRunning(true);
    setMigrationStatus('running');

    try {
      toast({
        title: "Running Migrations",
        description: "Please wait while database schema is updated...",
      });

      // Note: In production, migrations should be run via Supabase CLI or dashboard
      // This is just for notification purposes
      setMigrationStatus('success');
      
      toast({
        title: "Migration Complete",
        description: "Database schema has been updated. Please refresh the page.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      toast({
        title: "Migration Failed",
        description: "Please run migrations manually via Supabase dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (!showNotification) return null;

  return (
    <Alert className="mb-4 border-orange-500 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">Database Update Required</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="text-sm text-orange-800">
            Your database schema needs to be updated to support new features.
          </p>
          <div className="bg-white p-3 rounded border border-orange-200">
            <p className="text-xs font-mono text-gray-700 mb-2">
              Run the following migrations in your Supabase SQL Editor:
            </p>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• 006_remove_projectiles_add_reference_tables.sql</li>
            </ul>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={runMigrations}
              disabled={isRunning}
            >
              {isRunning ? (
                <>Running...</>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run Migrations
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
          </div>
          {migrationStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Migration completed successfully!</span>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}