import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RLSDiagnostic() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any[] = [];

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    diagnostics.push({
      test: 'Authentication',
      status: user ? 'PASS' : 'FAIL',
      details: user ? `User ID: ${user.id}` : 'Not authenticated'
    });

    if (!user) {
      setResults(diagnostics);
      setLoading(false);
      return;
    }

    // Test tables
    const tables = [
      'firearms', 'optics', 'bullets', 'suppressors',
      'manufacturers', 'calibers', 'categories', 'cartridges'
    ];

    for (const table of tables) {
      // Test SELECT
      const { error: selectError } = await supabase.from(table).select('id').limit(1);
      
      // Test INSERT (will fail but we check the error)
      const testData = table === 'firearms' ? 
        { user_id: user.id, name: 'RLS_TEST' } :
        { name: 'RLS_TEST' };
      
      const { error: insertError } = await supabase.from(table).insert(testData);

      diagnostics.push({
        test: `${table} - SELECT`,
        status: selectError ? 'FAIL' : 'PASS',
        details: selectError?.message || 'OK'
      });

      diagnostics.push({
        test: `${table} - INSERT`,
        status: insertError?.message?.includes('RLS') ? 'BLOCKED' : 
                insertError ? 'FAIL' : 'PASS',
        details: insertError?.message || 'OK'
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔒 RLS Policy Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running...' : 'Run RLS Tests'}
        </Button>

        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant={r.status === 'PASS' ? 'default' : 'destructive'}>
                {r.status}
              </Badge>
              <span className="font-medium">{r.test}</span>
              <span className="text-muted-foreground text-xs">{r.details}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
