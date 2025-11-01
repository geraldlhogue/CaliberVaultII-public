import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Database, Download, Upload, Clock, CheckCircle2, AlertCircle, Archive, FileDown, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { downloadFile } from '@/utils/downloadHelper';

export function BackupRestore() {
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const { toast } = useToast();

  const performBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupStatus('Collecting inventory data...');

    try {
      // Collect all data from all tables
      setBackupProgress(10);
      const { data: items } = await supabase.from('inventory_items').select('*');
      
      setBackupProgress(20);
      setBackupStatus('Collecting categories...');
      const { data: categories } = await supabase.from('categories').select('*');
      
      setBackupProgress(30);
      setBackupStatus('Collecting manufacturers...');
      const { data: manufacturers } = await supabase.from('manufacturers').select('*');
      
      setBackupProgress(40);
      setBackupStatus('Collecting calibers...');
      const { data: calibers } = await supabase.from('calibers').select('*');
      
      setBackupProgress(50);
      setBackupStatus('Collecting actions...');
      const { data: actions } = await supabase.from('actions').select('*');
      
      setBackupProgress(60);
      setBackupStatus('Collecting ammo types...');
      const { data: ammoTypes } = await supabase.from('ammo_types').select('*');
      
      setBackupProgress(70);
      setBackupStatus('Collecting cartridges...');
      const { data: cartridges } = await supabase.from('cartridges').select('*');
      
      setBackupProgress(80);
      setBackupStatus('Collecting documents and logs...');
      const { data: documents } = await supabase.from('insurance_documents').select('*');
      const { data: permissions } = await supabase.from('user_permissions').select('*');
      const { data: auditLogs } = await supabase.from('audit_logs').select('*');

      setBackupProgress(90);
      setBackupStatus('Creating backup file...');

      const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
          inventory_items: items || [],
          categories: categories || [],
          manufacturers: manufacturers || [],
          calibers: calibers || [],
          actions: actions || [],
          ammo_types: ammoTypes || [],
          cartridges: cartridges || [],
          insurance_documents: documents || [],
          user_permissions: permissions || [],
          audit_logs: auditLogs || []
        },
        metadata: {
          itemCount: items?.length || 0,
          categoryCount: categories?.length || 0,
          manufacturerCount: manufacturers?.length || 0,
          caliberCount: calibers?.length || 0
        }
      };
      // Create filename with timestamp
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `firearms_backup_${timestamp}.json`;

      // Convert to JSON string
      const jsonStr = JSON.stringify(backupData, null, 2);
      
      setBackupStatus('Downloading backup file...');

      // Use the downloadFile function
      await downloadFile(jsonStr, filename, 'application/json');

      setBackupProgress(100);
      setLastBackup(new Date());
      setBackupStatus('Backup complete!');
      
      toast({
        title: 'Backup Complete',
        description: `Filename: ${filename} - Check your Downloads folder or selected location`
      });
      // Log the backup
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'create_backup',
          entity_type: 'system',
          entity_id: null,
          changes: { 
            filename, 
            itemCount: backupData.metadata.itemCount,
            timestamp: backupData.timestamp 
          }
        });
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Backup Failed',
        description: 'An error occurred while creating the backup',
        variant: 'destructive'
      });
      setBackupStatus('Backup failed');
    } finally {
      setIsBackingUp(false);
      setTimeout(() => {
        setBackupProgress(0);
        setBackupStatus('');
      }, 3000);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      setRestoreProgress(25);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setRestoreProgress(50);

      // Here you would implement the actual restore logic
      // For now, we'll just show what would be restored
      const itemsToRestore = {
        'Inventory Items': backupData.data.inventory_items?.length || 0,
        'Categories': backupData.data.categories?.length || 0,
        'Manufacturers': backupData.data.manufacturers?.length || 0,
        'Calibers': backupData.data.calibers?.length || 0,
        'Actions': backupData.data.actions?.length || 0,
        'Ammo Types': backupData.data.ammo_types?.length || 0,
        'Cartridges': backupData.data.cartridges?.length || 0
      };

      setRestoreProgress(75);

      // Log the restore operation
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'restore_backup',
        entity_type: 'system',
        entity_id: null,
        changes: { 
          backup_timestamp: backupData.timestamp,
          filename: file.name,
          items_restored: itemsToRestore
        }
      });

      setRestoreProgress(100);

      const details = Object.entries(itemsToRestore)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      toast({
        title: 'Restore Analysis Complete',
        description: `Backup from ${format(new Date(backupData.timestamp), 'PPP')} contains: ${details}`
      });

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: 'Restore Failed',
        description: 'Invalid backup file or restore error',
        variant: 'destructive'
      });
    } finally {
      setIsRestoring(false);
      setTimeout(() => setRestoreProgress(0), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Restore System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Backups will be downloaded to your default Downloads folder. Keep backup files in a safe location.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Create Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download a complete backup of all your data including inventory, categories, manufacturers, and settings.
                </p>
                <Button 
                  onClick={performBackup} 
                  disabled={isBackingUp}
                  className="w-full"
                  size="lg"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isBackingUp ? 'Creating Backup...' : 'Download Backup Now'}
                </Button>
                {backupProgress > 0 && (
                  <>
                    <Progress value={backupProgress} className="w-full" />
                    {backupStatus && (
                      <p className="text-xs text-muted-foreground text-center">{backupStatus}</p>
                    )}
                  </>
                )}
                {lastBackup && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Last backup: {format(lastBackup, 'PPp')}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Restore from Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select a backup file from your computer to analyze or restore your data.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={isRestoring}
                  className="hidden"
                  id="restore-file"
                />
                <label htmlFor="restore-file">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer"
                    disabled={isRestoring}
                    size="lg"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isRestoring ? 'Analyzing Backup...' : 'Choose Backup File'}
                    </span>
                  </Button>
                </label>
                {restoreProgress > 0 && (
                  <Progress value={restoreProgress} className="w-full" />
                )}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Note: Full restore functionality coming soon. Currently shows backup contents only.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backup Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">What's included in backups:</p>
                    <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                      <li>• All inventory items and details</li>
                      <li>• Categories, manufacturers, calibers</li>
                      <li>• Actions, ammo types, cartridges</li>
                      <li>• Insurance documents</li>
                      <li>• Audit logs and history</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Download className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Where backups are saved:</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Files are downloaded to your browser's default Downloads folder
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}