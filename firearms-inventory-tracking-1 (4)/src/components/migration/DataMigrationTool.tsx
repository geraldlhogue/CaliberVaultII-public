import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, CheckCircle, Info } from 'lucide-react';
import { MigrationMapping } from './MigrationMapping';
import { MigrationExecutor } from './MigrationExecutor';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DataMigrationToolProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataMigrationTool({ isOpen, onClose }: DataMigrationToolProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mappings, setMappings] = useState<any[]>([]);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const handleMappingComplete = (completedMappings: any[]) => {
    setMappings(completedMappings);
    setActiveTab('execute');
  };

  const handleMigrationComplete = () => {
    setMigrationComplete(true);
    setActiveTab('complete');
    toast.success('Migration completed successfully!');
  };

  const handleRollback = async () => {
    try {
      // Implement rollback logic here
      const { error } = await supabase.rpc('rollback_migration', {
        migration_id: 'latest'
      });
      
      if (error) throw error;
      
      toast.success('Migration rolled back successfully');
      setActiveTab('overview');
      setMappings([]);
    } catch (error) {
      console.error('Rollback error:', error);
      toast.error('Failed to rollback migration');
    }
  };

  const createBackup = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Export current data
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*');
      
      if (error) throw error;
      
      // Create backup file
      const backup = {
        timestamp,
        version: '1.0',
        items: items
      };
      
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
          <DialogTitle>Data Migration Tool</DialogTitle>
          <DialogDescription>
            Migrate your existing inventory items to the new category-specific structure
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mapping" disabled={migrationComplete}>Mapping</TabsTrigger>
            <TabsTrigger value="execute" disabled={mappings.length === 0 || migrationComplete}>Execute</TabsTrigger>
            <TabsTrigger value="complete" disabled={!migrationComplete}>Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This tool will help you migrate your existing inventory data to the new category-specific tables.
                It's recommended to create a backup before proceeding.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Migration Process</CardTitle>
                <CardDescription>
                  Follow these steps to migrate your data safely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <div className="font-medium">Create Backup</div>
                      <div className="text-sm text-muted-foreground">
                        Export your current data as a safety measure
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <div className="font-medium">Review & Map Items</div>
                      <div className="text-sm text-muted-foreground">
                        Categorize items for migration to appropriate tables
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">3</Badge>
                    <div>
                      <div className="font-medium">Execute Migration</div>
                      <div className="text-sm text-muted-foreground">
                        Transfer data to new category-specific tables
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Badge className="mt-1">4</Badge>
                    <div>
                      <div className="font-medium">Verify Results</div>
                      <div className="text-sm text-muted-foreground">
                        Review migration results and rollback if needed
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createBackup} variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                  <Button onClick={() => setActiveTab('mapping')}>
                    Start Migration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping">
            <MigrationMapping onMappingComplete={handleMappingComplete} />
          </TabsContent>

          <TabsContent value="execute">
            <MigrationExecutor 
              mappings={mappings}
              onComplete={handleMigrationComplete}
              onRollback={handleRollback}
            />
          </TabsContent>

          <TabsContent value="complete" className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Migration completed successfully! Your data has been transferred to the new structure.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    Your original data has been preserved and marked as migrated.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    You can now use the new category-specific interfaces to manage your inventory.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    If you encounter any issues, you can restore from your backup.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={onClose} className="w-full">
              Close Migration Tool
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}