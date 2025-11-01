import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface NewSchemaMigrationToolProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewSchemaMigrationTool({ isOpen, onClose }: NewSchemaMigrationToolProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const createBackup = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const tables = ['inventory', 'firearms_details', 'ammunition_details', 'optics_details'];
      const backup: any = { timestamp, version: '2.0', data: {} };
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backup.data[table] = data;
      }
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_backup_${timestamp}.json`;
      a.click();
      
      toast.success('Backup created successfully');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to create backup');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Schema Migration Tool</DialogTitle>
          <DialogDescription>
            Migrate from old duplicate tables to new normalized inventory schema
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="execute">Execute</TabsTrigger>
            <TabsTrigger value="complete">Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This tool migrates data from old duplicate category tables to the new normalized schema.
                Create a backup before proceeding.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Migration Process</CardTitle>
                <CardDescription>New normalized schema with inventory + detail tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <div className="font-medium">Create Backup</div>
                      <div className="text-sm text-muted-foreground">Export current data</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <div className="font-medium">Execute Migration</div>
                      <div className="text-sm text-muted-foreground">Transfer to normalized schema</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createBackup} variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                  <Button onClick={() => setActiveTab('execute')}>
                    Start Migration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execute">
            <Card>
              <CardHeader>
                <CardTitle>Migration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Migration to new schema completed! All old tables have been dropped.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complete">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Migration completed! Using normalized inventory schema.
              </AlertDescription>
            </Alert>
            <Button onClick={onClose} className="w-full mt-4">Close</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
