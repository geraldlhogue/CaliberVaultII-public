import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RLSDiagnostic } from './RLSDiagnostic';

export function SimpleDatabaseTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to test');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
    console.log(msg);
  };

  const testSave = async () => {
    setLogs([]);
    setStatus('🔵 Running tests...');
    
    try {
      // 1. Check auth
      addLog('🔵 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(`Auth error: ${authError.message}`);
      if (!user) throw new Error('Not authenticated');
      addLog(`✅ User authenticated: ${user.email}`);
      
      // 2. Check manufacturers
      addLog('🔵 Fetching manufacturers...');
      const { data: mfgs, error: mfgError } = await supabase
        .from('manufacturers')
        .select('id, name')
        .limit(5);
      if (mfgError) throw new Error(`Manufacturer error: ${mfgError.message}`);
      addLog(`✅ Found ${mfgs?.length || 0} manufacturers`);
      if (mfgs && mfgs.length > 0) {
        addLog(`   First: ${mfgs[0].name} (${mfgs[0].id})`);
      }
      
      // 3. Try to insert a test inventory item (new schema)
      addLog('🔵 Attempting to insert test inventory item...');
      const testItem = {
        user_id: user.id,
        category: 'firearms',
        name: 'Test Firearm ' + Date.now(),
        manufacturer: mfgs?.[0]?.name || 'Test Mfg',
        model: 'Test Model',
        serial_number: 'TEST' + Date.now(),
        quantity: 1
      };
      
      addLog(`   Data: ${JSON.stringify(testItem, null, 2)}`);
      
      const { data: inserted, error: insertError } = await supabase
        .from('inventory')
        .insert([testItem])
        .select()
        .single();
      
      if (insertError) {
        addLog(`❌ INSERT FAILED: ${insertError.message}`);
        addLog(`   Code: ${insertError.code}`);
        addLog(`   Details: ${insertError.details}`);
        addLog(`   Hint: ${insertError.hint}`);
        throw insertError;
      }
      
      addLog(`✅ INSERT SUCCESS! ID: ${inserted.id}`);
      
      // 4. Clean up
      addLog('🔵 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', inserted.id);
      
      if (deleteError) {
        addLog(`⚠️ Cleanup failed: ${deleteError.message}`);
      } else {
        addLog('✅ Test data cleaned up');
      }

      
      setStatus('✅ All tests passed!');
    } catch (error: any) {
      addLog(`❌ TEST FAILED: ${error.message}`);
      setStatus('❌ Test failed - see logs');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-bold mb-4">💾 Database Save Test</h3>
        <div className="mb-4">
          <Button onClick={testSave} className="w-full">
            Run Database Test
          </Button>
        </div>
        <div className="mb-2 font-semibold text-sm">{status}</div>
        <div className="bg-slate-900 rounded p-3 max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-xs font-mono mb-1 text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </Card>
      
      <RLSDiagnostic />
    </div>
  );
}
