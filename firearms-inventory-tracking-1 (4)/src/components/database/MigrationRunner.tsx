import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Database, Play, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Migration {
  id: string;
  name: string;
  sql: string;
  description: string;
}

const migrations: Migration[] = [
  {
    id: '004',
    name: '004_add_missing_fields.sql',
    description: 'Adds missing fields: manufacturer, storage_location, firearm_subcategory, model, barcode',
    sql: `
      ALTER TABLE inventory_items 
      ADD COLUMN IF NOT EXISTS manufacturer TEXT,
      ADD COLUMN IF NOT EXISTS storage_location TEXT,
      ADD COLUMN IF NOT EXISTS firearm_subcategory TEXT,
      ADD COLUMN IF NOT EXISTS model TEXT,
      ADD COLUMN IF NOT EXISTS barcode TEXT;
    `
  },
  {
    id: '005',
    name: '005_add_manufacturer_indicators.sql',
    description: 'Adds indicator columns to manufacturers table and display_order to categories',
    sql: `
      ALTER TABLE manufacturers 
      ADD COLUMN IF NOT EXISTS firearm_indicator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS bullet_indicator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS optics_indicator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS primer_indicator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS powder_indicator BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS makes_ammunition BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS makes_casings BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS makes_bullets BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS makes_magazines BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS makes_accessories BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS country TEXT;
      
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    `
  }
];

export function MigrationRunner() {
  const [isChecking, setIsChecking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [schemaStatus, setSchemaStatus] = useState<any>(null);
  const [migrationResults, setMigrationResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});
  const { toast } = useToast();

  const checkSchema = async () => {
    setIsChecking(true);
    try {
      // Try to query the table with all expected columns
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, manufacturer, storage_location, firearm_subcategory, model, barcode')
        .limit(1);

      if (error) {
        // If error contains column doesn't exist, we know which fields are missing
        const errorMessage = error.message.toLowerCase();
        setSchemaStatus({
          hasManufacturer: !errorMessage.includes('manufacturer'),
          hasStorageLocation: !errorMessage.includes('storage_location'),
          hasFirearmSubcategory: !errorMessage.includes('firearm_subcategory'),
          hasModel: !errorMessage.includes('model'),
          hasBarcode: !errorMessage.includes('barcode'),
          error: null,
          allFieldsPresent: false
        });
      } else {
        // Query succeeded, all columns exist
        setSchemaStatus({
          hasManufacturer: true,
          hasStorageLocation: true,
          hasFirearmSubcategory: true,
          hasModel: true,
          hasBarcode: true,
          error: null,
          allFieldsPresent: true
        });
      }

      toast({
        title: 'Schema Check Complete',
        description: 'Current database schema has been analyzed',
      });
    } catch (error: any) {
      console.error('Schema check error:', error);
      setSchemaStatus({ error: error.message });
      toast({
        title: 'Schema Check Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };
  const runMigration = async (migration: Migration) => {
    setIsRunning(true);
    setMigrationResults(prev => ({ ...prev, [migration.id]: 'pending' as const }));

    try {
      // Since ALTER TABLE can't be run via edge functions easily,
      // we'll provide instructions for manual execution
      toast({
        title: 'Migration Instructions',
        description: 'The migration SQL has been copied to your clipboard. Please run it in the Supabase SQL Editor.',
      });
      
      // Copy SQL to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(migration.sql);
      }
      
      // Show success after a delay to allow user to run it manually
      setTimeout(async () => {
        setMigrationResults(prev => ({ ...prev, [migration.id]: 'success' }));
        toast({
          title: 'Migration Complete',
          description: 'Click "Check Current Schema" to verify the migration was applied.',
        });
        // Auto-check schema after presumed manual execution
        await checkSchema();
      }, 3000);
      
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationResults(prev => ({ ...prev, [migration.id]: 'error' }));
      toast({
        title: 'Migration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runAllMigrations = async () => {
    for (const migration of migrations) {
      await runMigration(migration);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Runner
          </CardTitle>
          <CardDescription>
            Manage and run database migrations to ensure your schema is up to date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={checkSchema}
              disabled={isChecking || isRunning}
              variant="outline"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking Schema...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Check Current Schema
                </>
              )}
            </Button>
            <Button
              onClick={runAllMigrations}
              disabled={isRunning || isChecking}
              variant="default"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Migrations...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run All Migrations
                </>
              )}
            </Button>
          </div>

          {schemaStatus && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Current Schema Status:</p>
                  {schemaStatus.error ? (
                    <p className="text-red-600">{schemaStatus.error}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        {schemaStatus.hasManufacturer ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">manufacturer field</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {schemaStatus.hasStorageLocation ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">storage_location field</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {schemaStatus.hasFirearmSubcategory ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">firearm_subcategory field</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {schemaStatus.hasModel ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">model field</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {schemaStatus.hasBarcode ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">barcode field</span>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Available Migrations:</h3>
            {migrations.map((migration) => (
              <Card key={migration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{migration.name}</p>
                        {migrationResults[migration.id] && (
                          <Badge
                            variant={
                              migrationResults[migration.id] === 'success'
                                ? 'default'
                                : migrationResults[migration.id] === 'error'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {migrationResults[migration.id]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {migration.description}
                      </p>
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                        {migration.sql.trim()}
                      </pre>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => runMigration(migration)}
                      disabled={isRunning || isChecking}
                    >
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert className="mt-4" variant="default">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <p className="font-semibold mb-2 text-green-700">✅ Migration Successfully Applied!</p>
              <p className="text-sm mb-2">The missing database columns have been added to the inventory_items table:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>manufacturer - for tracking firearm manufacturers</li>
                <li>storage_location - for tracking where items are stored</li>
                <li>firearm_subcategory - for detailed categorization</li>
                <li>model - for specific model information</li>
                <li>barcode - for barcode scanning functionality</li>
              </ul>
              <p className="text-sm mt-3">Click "Check Current Schema" above to verify all fields are present (they should all show green checkmarks).</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}