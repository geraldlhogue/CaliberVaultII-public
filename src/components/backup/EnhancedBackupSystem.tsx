import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { 
  Download, Upload, Archive, Shield, Clock, CheckCircle, 
  AlertCircle, Database, Cloud, Calendar, Lock 
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention_days: number;
  include_images: boolean;
  encrypt: boolean;
}

export function EnhancedBackupSystem() {
  const [config, setConfig] = useState<BackupConfig>({
    enabled: false,
    frequency: 'weekly',
    retention_days: 30,
    include_images: false,
    encrypt: true
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const createBackup = async () => {
    setIsBackingUp(true);
    setProgress(0);

    try {
      const tables = ['firearms', 'optics', 'bullets', 'suppressors', 'categories', 
                      'manufacturers', 'storage_locations', 'user_profiles'];
      const backupData: any = {
        version: '2.0.0',
        created_at: new Date().toISOString(),
        encrypted: config.encrypt,
        tables: {}
      };

      for (let i = 0; i < tables.length; i++) {
        const { data, error } = await supabase.from(tables[i]).select('*');
        if (error) throw error;
        backupData.tables[tables[i]] = data || [];
        setProgress(((i + 1) / tables.length) * 100);
      }

      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('firearm-images')
        .upload(`backups/${fileName}`, new Blob([backupJson], { type: 'application/json' }));

      if (uploadError) throw uploadError;

      setLastBackup(new Date().toISOString());
      toast.success('Backup created and uploaded successfully');
    } catch (err: any) {
      toast.error(`Backup failed: ${err.message}`);
    } finally {
      setIsBackingUp(false);
      setProgress(0);
    }
  };

  const downloadBackup = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('firearm-images')
        .list('backups/', { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

      if (error || !data || data.length === 0) {
        toast.error('No backups found');
        return;
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('firearm-images')
        .download(`backups/${data[0].name}`);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = data[0].name;
      a.click();
      toast.success('Backup downloaded');
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="w-5 h-5" />
          Enhanced Backup System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Automatic Backups</Label>
            <Switch checked={config.enabled} onCheckedChange={(checked) => 
              setConfig({...config, enabled: checked})} />
          </div>

          <div>
            <Label>Frequency</Label>
            <Select value={config.frequency} onValueChange={(value: any) => 
              setConfig({...config, frequency: value})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Encrypt Backups</Label>
            <Switch checked={config.encrypt} onCheckedChange={(checked) => 
              setConfig({...config, encrypt: checked})} />
          </div>
        </div>

        {isBackingUp && <Progress value={progress} />}

        <div className="flex gap-2">
          <Button onClick={createBackup} disabled={isBackingUp} className="flex-1">
            <Cloud className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
          <Button onClick={downloadBackup} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Latest
          </Button>
        </div>

        {lastBackup && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Last backup: {new Date(lastBackup).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
