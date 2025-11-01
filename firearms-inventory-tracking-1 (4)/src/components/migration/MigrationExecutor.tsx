import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MigrationResult {
  itemId: string;
  itemName: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  newId?: string;
}

interface MigrationExecutorProps {
  mappings: any[];
  onComplete: () => void;
  onRollback: () => void;
}

export function MigrationExecutor({ mappings, onComplete, onRollback }: MigrationExecutorProps) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [currentItem, setCurrentItem] = useState<string>('');
  const [migrationId, setMigrationId] = useState<string>('');

  const startMigration = async () => {
    setMigrating(true);
    setProgress(0);
    setResults([]);
    
    const migId = `migration_${Date.now()}`;
    setMigrationId(migId);
    
    // Create migration backup record
    await createBackup(migId);
    
    const totalItems = mappings.length;
    let processed = 0;
    
    for (const mapping of mappings) {
      setCurrentItem(mapping.originalData.name);
      
      try {
        const result = await migrateItem(mapping, migId);
        setResults(prev => [...prev, result]);
        
        if (result.status === 'error') {
          // Continue with other items even if one fails
          console.error(`Failed to migrate ${mapping.originalData.name}:`, result.message);
        }
      } catch (error) {
        console.error('Migration error:', error);
        setResults(prev => [...prev, {
          itemId: mapping.itemId,
          itemName: mapping.originalData.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }]);
      }
      
      processed++;
      setProgress((processed / totalItems) * 100);
    }
    
    setMigrating(false);
    setCurrentItem('');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (successCount > 0) {
      toast.success(`Migration completed: ${successCount} items migrated successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} items failed to migrate`);
    }
  };

  const createBackup = async (migrationId: string) => {
    try {
      // Store original data for rollback
      const { error } = await supabase
        .from('migration_backups')
        .insert({
          migration_id: migrationId,
          original_data: mappings,
          created_at: new Date().toISOString()
        });
      
      if (error) console.error('Backup creation error:', error);
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const migrateItem = async (mapping: any, migrationId: string): Promise<MigrationResult> => {
    const { targetCategory, originalData, fieldMappings } = mapping;
    
    try {
      let result: any;
      
      switch (targetCategory) {
        case 'firearms':
          result = await migrateFirearm(originalData, fieldMappings);
          break;
        case 'optics':
          result = await migrateOptic(originalData, fieldMappings);
          break;
        case 'bullets':
          result = await migrateBullets(originalData, fieldMappings);
          break;
        case 'casings':
          result = await migrateCasings(originalData, fieldMappings);
          break;
        case 'powder':
          result = await migratePowder(originalData, fieldMappings);
          break;
        case 'primers':
          result = await migratePrimers(originalData, fieldMappings);
          break;
        default:
          return {
            itemId: originalData.id,
            itemName: originalData.name,
            status: 'skipped',
            message: 'No target category specified'
          };
      }
      
      // Mark original item as migrated
      await supabase
        .from('inventory_items')
        .update({ 
          migrated: true, 
          migration_id: migrationId,
          migrated_to: targetCategory,
          migrated_at: new Date().toISOString()
        })
        .eq('id', originalData.id);
      
      return {
        itemId: originalData.id,
        itemName: originalData.name,
        status: 'success',
        newId: result.data?.[0]?.id
      };
    } catch (error) {
      return {
        itemId: originalData.id,
        itemName: originalData.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Migration failed'
      };
    }
  };

  const migrateFirearm = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('firearms')
      .insert({
        manufacturer: mappings.manufacturer,
        model: mappings.model,
        serial_number: mappings.serial_number,
        caliber_gauge: mappings.caliber_gauge,
        purchase_date: mappings.purchase_date,
        cost: mappings.cost,
        current_value: mappings.current_value,
        round_count: mappings.round_count || 0,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const migrateOptic = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('optics')
      .insert({
        manufacturer: mappings.manufacturer,
        model: mappings.model,
        serial_number: mappings.serial_number,
        purchase_date: mappings.purchase_date,
        cost: mappings.cost,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const migrateBullets = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('bullets')
      .insert({
        manufacturer: mappings.manufacturer,
        name_model: item.model || item.name,
        quantity: mappings.quantity,
        lot_number: mappings.lot_number,
        cost_per_box: mappings.cost,
        purchase_date: mappings.purchase_date,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const migrateCasings = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('casings')
      .insert({
        manufacturer: mappings.manufacturer,
        caliber: item.caliber,
        quantity: mappings.quantity,
        lot_number: mappings.lot_number,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const migratePowder = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('powder')
      .insert({
        manufacturer: mappings.manufacturer,
        name: item.model || item.name,
        lot_number: mappings.lot_number,
        size_lbs: 1,
        remaining_lbs: 1,
        purchase_date: mappings.purchase_date,
        cost: mappings.cost,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const migratePrimers = async (item: any, mappings: any) => {
    const { data, error } = await supabase
      .from('primers')
      .insert({
        manufacturer: mappings.manufacturer,
        model: item.model || item.name,
        lot_number: mappings.lot_number,
        quantity: mappings.quantity,
        purchase_date: mappings.purchase_date,
        cost: mappings.cost,
        notes: mappings.notes,
        user_id: item.user_id
      })
      .select();
    
    if (error) throw error;
    return { data };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Migrating: {currentItem}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="flex gap-2">
              <Badge variant="default">
                Success: {successCount}
              </Badge>
              <Badge variant="destructive">
                Errors: {errorCount}
              </Badge>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="flex-1">{result.itemName}</span>
                    {result.message && (
                      <span className="text-sm text-muted-foreground">
                        {result.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <div className="flex gap-2">
          {!migrating && results.length === 0 && (
            <Button onClick={startMigration}>
              Start Migration
            </Button>
          )}
          
          {migrating && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </Button>
          )}
          
          {!migrating && results.length > 0 && (
            <>
              {errorCount > 0 && (
                <Button variant="destructive" onClick={onRollback}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rollback
                </Button>
              )}
              <Button onClick={onComplete}>
                Complete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}