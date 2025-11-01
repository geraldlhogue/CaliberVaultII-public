import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TableCheck {
  table: string;
  count: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export function DatabaseHealthCheck() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<TableCheck[]>([]);

  const checkDatabase = async () => {
    setChecking(true);
    const checks: TableCheck[] = [];

    const tables = [
      { name: 'action_types', minExpected: 5 },
      { name: 'firearm_types', minExpected: 3 },
      { name: 'optic_types', minExpected: 3 },
      { name: 'bullet_types', minExpected: 5 },
      { name: 'reticle_types', minExpected: 3 },
      { name: 'turret_types', minExpected: 2 },
      { name: 'mounting_types', minExpected: 3 },
      { name: 'suppressor_materials', minExpected: 3 },
      { name: 'calibers', minExpected: 5 },
      { name: 'manufacturers', minExpected: 3 },
      { name: 'categories', minExpected: 4 },
      { name: 'locations', minExpected: 1 },
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });

        if (error) {
          checks.push({
            table: table.name,
            count: 0,
            status: 'error',
            message: `Error: ${error.message}`,
          });
        } else {
          const actualCount = count || 0;
          checks.push({
            table: table.name,
            count: actualCount,
            status: actualCount >= table.minExpected ? 'success' : 'warning',
            message: actualCount === 0 
              ? 'Empty - needs seeding' 
              : actualCount < table.minExpected 
              ? `Low count (expected ${table.minExpected}+)` 
              : 'OK',
          });
        }
      } catch (err: any) {
        checks.push({
          table: table.name,
          count: 0,
          status: 'error',
          message: err.message,
        });
      }
    }

    setResults(checks);
    setChecking(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Database Health Check</h2>
        <Button onClick={checkDatabase} disabled={checking}>
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Run Check'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.table} className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                {getIcon(result.status)}
                <span className="font-medium">{result.table}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">{result.count} records</span>
                <span className={`text-sm ${
                  result.status === 'success' ? 'text-green-500' : 
                  result.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {result.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
