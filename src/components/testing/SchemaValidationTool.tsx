import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database, Code } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ValidationResult {
  table: string;
  exists: boolean;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  rlsPolicies: PolicyInfo[];
  issues: string[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
}

interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

interface IndexInfo {
  name: string;
  columns: string[];
}

interface PolicyInfo {
  name: string;
  command: string;
}

const CORE_TABLES = [
  'inventory',
  'firearm_details',
  'ammunition_details',
  'optic_details',
  'magazine_details',
  'accessory_details',
  'suppressor_details',
  'reloading_details',
  'case_details',
  'primer_details',
  'powder_details',
  'calibers',
  'cartridges',
  'action_types',
  'bullet_types',
  'primer_types',
  'powder_types',
  'magnifications',
  'reticle_types',
  'turret_types',
  'suppressor_materials',
];

export function SchemaValidationTool() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const validateSchema = async () => {
    setLoading(true);
    const validationResults: ValidationResult[] = [];

    for (const tableName of CORE_TABLES) {
      const result: ValidationResult = {
        table: tableName,
        exists: false,
        columns: [],
        foreignKeys: [],
        indexes: [],
        rlsPolicies: [],
        issues: []
      };

      try {
        // Check if table exists
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        result.exists = !tableError;

        if (result.exists) {
          // Get column information
          const { data: columnData } = await supabase
            .rpc('get_table_columns', { table_name: tableName })
            .catch(() => ({ data: [] }));

          if (columnData) {
            result.columns = columnData.map((col: any) => ({
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES',
              default: col.column_default
            }));
          }

          // Check for required columns
          if (tableName.includes('_details')) {
            const hasInventoryId = result.columns.some(c => c.name === 'inventory_id');
            if (!hasInventoryId) {
              result.issues.push('Missing inventory_id foreign key');
            }
          }

          // Check for RLS
          const { data: rlsData } = await supabase
            .rpc('check_rls_enabled', { table_name: tableName })
            .catch(() => ({ data: null }));

          if (!rlsData) {
            result.issues.push('RLS may not be enabled');
          }
        } else {
          result.issues.push('Table does not exist');
        }

      } catch (error) {
        result.issues.push(`Validation error: ${error}`);
      }

      validationResults.push(result);
    }

    setResults(validationResults);
    setLoading(false);
  };

  const healthyTables = results.filter(r => r.exists && r.issues.length === 0).length;
  const totalTables = results.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Schema Validation Tool
        </CardTitle>
        <CardDescription>
          Validate database schema against application requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={validateSchema} disabled={loading}>
          {loading ? 'Validating...' : 'Validate Schema'}
        </Button>

        {results.length > 0 && (
          <>
            <div className="flex gap-4">
              <Badge variant="default">
                {healthyTables}/{totalTables} Healthy
              </Badge>
              <Badge variant="destructive">
                {results.filter(r => r.issues.length > 0).length} Issues
              </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2">
                {results.map((result) => (
                  <div key={result.table} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {result.exists && result.issues.length === 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-mono text-sm">{result.table}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.columns.length} columns
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {results.map((result) => (
                  <Card key={result.table}>
                    <CardHeader>
                      <CardTitle className="text-sm font-mono">{result.table}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <strong>Columns:</strong>
                          <div className="mt-1 space-y-1">
                            {result.columns.map((col) => (
                              <div key={col.name} className="font-mono text-xs">
                                {col.name}: {col.type}
                                {!col.nullable && ' NOT NULL'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="issues" className="space-y-2">
                {results.filter(r => r.issues.length > 0).map((result) => (
                  <Alert key={result.table} variant="destructive">
                    <AlertDescription>
                      <strong className="font-mono">{result.table}</strong>
                      <ul className="mt-2 space-y-1">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="text-xs">• {issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ))}
                {results.filter(r => r.issues.length > 0).length === 0 && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>No issues found!</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}