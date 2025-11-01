import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Database, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BackupSchedule {
  id: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface BackupRecord {
  id: string;
  timestamp: Date;
  size: number;
  status: 'success' | 'failed';
  type: 'full' | 'incremental';
}

export function AutomatedBackupScheduler() {
  const [schedule, setSchedule] = useState<BackupSchedule>({
    id: '1',
    frequency: 'daily',
    enabled: false,
  });
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const runBackup = async (type: 'full' | 'incremental' = 'full') => {
    setIsBackingUp(true);
    try {
      // Backup all tables
      const tables = ['inventory', 'firearms', 'optics', 'suppressors', 'ammunition'];
      const backupData: any = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backupData[table] = data;
      }

      // Create backup record
      const backup: BackupRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        size: JSON.stringify(backupData).length,
        status: 'success',
        type,
      };

      setBackups(prev => [backup, ...prev]);
      
      // Download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calibervault-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Backup completed successfully');
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Backup failed');
    } finally {
      setIsBackingUp(false);
    }
  };

  const toggleSchedule = () => {
    setSchedule(prev => ({ ...prev, enabled: !prev.enabled }));
    toast.success(schedule.enabled ? 'Backup schedule disabled' : 'Backup schedule enabled');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Backup Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={schedule.frequency} onValueChange={(v: any) => setSchedule(prev => ({ ...prev, frequency: v }))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={toggleSchedule} variant={schedule.enabled ? 'destructive' : 'default'}>
              <Clock className="mr-2 h-4 w-4" />
              {schedule.enabled ? 'Disable' : 'Enable'} Schedule
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => runBackup('full')} disabled={isBackingUp}>
              <Database className="mr-2 h-4 w-4" />
              Run Full Backup
            </Button>
            <Button onClick={() => runBackup('incremental')} variant="outline" disabled={isBackingUp}>
              Run Incremental Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backups.map(backup => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {backup.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{backup.type} Backup</div>
                    <div className="text-sm text-muted-foreground">
                      {backup.timestamp.toLocaleString()} • {(backup.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <Badge variant={backup.status === 'success' ? 'default' : 'destructive'}>
                  {backup.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AutomatedBackupScheduler;
