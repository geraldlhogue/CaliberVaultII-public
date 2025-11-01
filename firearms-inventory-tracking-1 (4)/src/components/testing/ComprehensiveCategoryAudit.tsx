import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuditResult {
  category: string;
  service: string;
  baseTable: boolean;
  detailTable: boolean;
  foreignKeys: string[];
  missingColumns: string[];
  extraColumns: string[];
  rlsPolicies: boolean;
  status: 'pass' | 'fail' | 'warning';
}

const CATEGORIES = [
  { name: 'Firearms', service: 'FirearmsService', detailTable: 'firearm_details', requiredColumns: ['caliber_id', 'cartridge_id', 'serial_number', 'barrel_length', 'capacity', 'action_id', 'round_count'] },
  { name: 'Ammunition', service: 'AmmunitionService', detailTable: 'ammunition_details', requiredColumns: ['caliber_id', 'cartridge_id', 'bullet_type_id', 'grain_weight', 'round_count', 'primer_type_id'] },
  { name: 'Optics', service: 'OpticsService', detailTable: 'optic_details', requiredColumns: ['magnification_id', 'objective_diameter', 'reticle_type_id', 'turret_type_id'] },
  { name: 'Magazines', service: 'MagazinesService', detailTable: 'magazine_details', requiredColumns: ['caliber_id', 'capacity', 'material'] },
  { name: 'Accessories', service: 'AccessoriesService', detailTable: 'accessory_details', requiredColumns: ['accessory_type', 'compatibility'] },
  { name: 'Suppressors', service: 'SuppressorsService', detailTable: 'suppressor_details', requiredColumns: ['caliber_id', 'serial_number', 'length', 'weight', 'material_id'] },
  { name: 'Reloading', service: 'ReloadingService', detailTable: 'reloading_details', requiredColumns: ['equipment_type', 'compatibility'] },
  { name: 'Cases', service: 'CasesService', detailTable: 'case_details', requiredColumns: ['caliber_id', 'quantity', 'condition'] },
  { name: 'Primers', service: 'PrimersService', detailTable: 'primer_details', requiredColumns: ['primer_type_id', 'quantity', 'size'] },
  { name: 'Powder', service: 'PowderService', detailTable: 'powder_details', requiredColumns: ['powder_type_id', 'weight', 'burn_rate'] },
];

export function ComprehensiveCategoryAudit() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    const auditResults: AuditResult[] = [];

    for (const category of CATEGORIES) {
      const result: AuditResult = {
        category: category.name,
        service: category.service,
        baseTable: false,
        detailTable: false,
        foreignKeys: [],
        missingColumns: [],
        extraColumns: [],
        rlsPolicies: false,
        status: 'pass'
      };

      try {
        // Check base inventory table
        const { error: baseError } = await supabase.from('inventory').select('id').limit(1);
        result.baseTable = !baseError;

        // Check detail table exists and get columns
        const { data: columns, error: detailError } = await supabase
          .rpc('get_table_columns', { table_name: category.detailTable })
          .catch(() => ({ data: null, error: true }));

        result.detailTable = !detailError && columns !== null;

        if (result.detailTable && columns) {
          const actualColumns = columns.map((c: any) => c.column_name);
          
          // Check for missing required columns
          result.missingColumns = category.requiredColumns.filter(
            col => !actualColumns.includes(col)
          );

          // Check foreign keys
          const fkColumns = actualColumns.filter((col: string) => col.endsWith('_id'));
          result.foreignKeys = fkColumns;
        }

        // Determine status
        if (!result.baseTable || !result.detailTable) {
          result.status = 'fail';
        } else if (result.missingColumns.length > 0) {
          result.status = 'warning';
        }

      } catch (error) {
        result.status = 'fail';
      }

      auditResults.push(result);
    }

    setResults(auditResults);
    setLoading(false);
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Audit</CardTitle>
        <CardDescription>Validate all 11 categories against database schema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAudit} disabled={loading}>
          <Play className="w-4 h-4 mr-2" />
          {loading ? 'Running Audit...' : 'Run Audit'}
        </Button>

        {results.length > 0 && (
          <>
            <div className="flex gap-4">
              <Badge variant="default">{passCount} Passed</Badge>
              <Badge variant="destructive">{failCount} Failed</Badge>
              <Badge variant="secondary">{warningCount} Warnings</Badge>
            </div>

            <div className="space-y-2">
              {results.map((result) => (
                <Alert key={result.category} variant={result.status === 'fail' ? 'destructive' : 'default'}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {result.status === 'pass' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {result.status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
                        {result.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        <strong>{result.category}</strong>
                      </div>
                      <AlertDescription>
                        <div className="text-xs space-y-1">
                          <div>Service: {result.service}</div>
                          <div>Base Table: {result.baseTable ? '✓' : '✗'}</div>
                          <div>Detail Table: {result.detailTable ? '✓' : '✗'}</div>
                          {result.foreignKeys.length > 0 && (
                            <div>Foreign Keys: {result.foreignKeys.join(', ')}</div>
                          )}
                          {result.missingColumns.length > 0 && (
                            <div className="text-red-500">Missing: {result.missingColumns.join(', ')}</div>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}