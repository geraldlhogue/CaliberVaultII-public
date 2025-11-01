import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function ComprehensiveDatabaseDiagnostic() {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test: string, success: boolean, details: any) => {
    setResults(prev => [...prev, { test, success, details, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('manufacturers').select('count');
      addResult('Supabase Connection', !error, { data, error: error?.message });
    } catch (e: any) {
      addResult('Supabase Connection', false, { error: e.message });
    }

    // Test 2: Authentication Status
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      addResult('Authentication', !!user, { userId: user?.id, email: user?.email, error: error?.message });
    } catch (e: any) {
      addResult('Authentication', false, { error: e.message });
    }

    // Test 3: Read Permissions (manufacturers)
    try {
      const { data, error } = await supabase.from('manufacturers').select('*').limit(1);
      addResult('Read Manufacturers', !error, { count: data?.length, error: error?.message });
    } catch (e: any) {
      addResult('Read Manufacturers', false, { error: e.message });
    }

    // Test 4: Write Test to Inventory (New Schema)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const testItem = {
          user_id: user.id,
          name: 'TEST ITEM - DELETE ME',
          category: 'firearms',
          manufacturer: 'Test Mfg',
          model: 'Test Model',
          quantity: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('inventory').insert([testItem]).select().single();
        addResult('Insert Inventory Item', !error, { data, error: error?.message, hint: error?.hint, details: error?.details });
        
        if (data?.id) {
          const { error: delError } = await supabase.from('inventory').delete().eq('id', data.id);
          addResult('Cleanup Test Item', !delError, { deleted: true });
        }
      }
    } catch (e: any) {
      addResult('Insert Inventory Item', false, { error: e.message, stack: e.stack });
    }


    setTesting(false);
  };

  return (
    <Card className="p-6 bg-slate-800 text-white">
      <h2 className="text-xl font-bold mb-4">Database Diagnostic Tool</h2>
      <Button onClick={runTests} disabled={testing} className="mb-4">
        {testing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</> : 'Run All Tests'}
      </Button>
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="border border-slate-700 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              {r.success ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              <span className="font-semibold">{r.test}</span>
            </div>
            <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto">{JSON.stringify(r.details, null, 2)}</pre>
          </div>
        ))}
      </div>
    </Card>
  );
}
