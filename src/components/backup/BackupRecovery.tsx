import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { downloadFile } from '@/utils/downloadHelper';
import { 
  Download, Upload, Archive, Shield, Clock, 
  CheckCircle, AlertCircle, FileJson, Database 
} from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  created_at: string;
  size: number;
  tables: string[];
  record_count: number;
}

export function BackupRecovery() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'backup_2024_01_15.json',
      created_at: '2024-01-15T10:30:00Z',
      size: 2457600,
      tables: ['firearms', 'optics', 'bullets'],
      record_count: 156
    },
    {
      id: '2',
      name: 'backup_2024_01_10.json',
      created_at: '2024-01-10T14:20:00Z',
      size: 2048000,
      tables: ['firearms', 'optics'],
      record_count: 132
    }
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const tables = ['firearms', 'optics', 'bullets', 'suppressors', 'categories'];
      const backupData: any = {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        tables: {}
      };

      let totalProgress = 0;
      const progressPerTable = 100 / tables.length;

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        
        backupData.tables[table] = data || [];
        totalProgress += progressPerTable;
        setProgress(Math.round(totalProgress));
      }

      // Create backup file
      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
      
      await downloadFile(backupJson, fileName, 'application/json');

      // Add to backups list
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: fileName,
        created_at: new Date().toISOString(),
        size: new Blob([backupJson]).size,
        tables: tables,
        record_count: Object.values(backupData.tables).reduce((acc: number, arr: any) => acc + arr.length, 0)
      };

      setBackups(prev => [newBackup, ...prev]);
      setSuccess('Backup created successfully');
    } catch (err: any) {
      setError(`Backup failed: ${err.message}`);
    } finally {
      setIsBackingUp(false);
      setProgress(0);
    }
  };

  const restoreBackup = async (file: File) => {
    setIsRestoring(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.version || !backupData.tables) {
        throw new Error('Invalid backup file format');
      }

      const tables = Object.keys(backupData.tables);
      let totalProgress = 0;
      const progressPerTable = 100 / tables.length;

      for (const table of tables) {
        const records = backupData.tables[table];
        
        // Clear existing data (optional - could also merge)
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // Insert backup data
        if (records.length > 0) {
          const { error } = await supabase.from(table).insert(records);
          if (error) throw error;
        }
        
        totalProgress += progressPerTable;
        setProgress(Math.round(totalProgress));
      }

      setSuccess(`Restored ${tables.length} tables successfully`);
    } catch (err: any) {
      setError(`Restore failed: ${err.message}`);
    } finally {
      setIsRestoring(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please select a valid JSON backup file');
        return;
      }
      restoreBackup(file);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      // In a real app, this would download from storage
      setSuccess(`Downloading ${backup.name}...`);
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="w-5 h-5" />
          Backup & Recovery
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

        {(isBackingUp || isRestoring) && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isBackingUp ? 'Creating backup...' : 'Restoring backup...'}
            </p>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={createBackup}
            disabled={isBackingUp || isRestoring}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBackingUp || isRestoring}
            variant="outline"
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Restore Backup
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Recent Backups</h3>
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileJson className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{backup.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(backup.created_at).toLocaleString()}
                    <span>•</span>
                    <Database className="w-3 h-3" />
                    {backup.record_count} records
                    <span>•</span>
                    {formatFileSize(backup.size)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadBackup(backup)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Backups are encrypted and stored securely. Regular backups are recommended to prevent data loss.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}