import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StorageDiagnostic } from './database/StorageDiagnostic';
import { EnhancedDatabaseViewer } from './database/EnhancedDatabaseViewer';



export function DiagnosticScreen() {
  const [checks, setChecks] = useState<Array<{name: string; status: string; details: string}>>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = [];

    // Check 1: React is working
    results.push({ name: 'React', status: '✅', details: 'React is rendering' });

    // Check 2: Environment variables
    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.push({ 
      name: 'Environment', 
      status: hasSupabaseUrl && hasSupabaseKey ? '✅' : '❌', 
      details: `URL: ${hasSupabaseUrl}, Key: ${hasSupabaseKey}` 
    });

    // Check 3: Supabase connection
    try {
      const { data, error } = await supabase.from('manufacturers').select('count').limit(1);
      results.push({ 
        name: 'Supabase', 
        status: error ? '❌' : '✅', 
        details: error ? error.message : 'Connected' 
      });
    } catch (err: any) {
      results.push({ name: 'Supabase', status: '❌', details: err.message });
    }

    // Check 4: Auth
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      results.push({ 
        name: 'Auth', 
        status: error ? '❌' : '✅', 
        details: session ? 'Authenticated' : 'Not authenticated' 
      });
    } catch (err: any) {
      results.push({ name: 'Auth', status: '❌', details: err.message });
    }

    setChecks(results);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Diagnostic Screen</h1>
      <div className="space-y-4">
        {checks.map((check, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{check.status}</span>
              <div>
                <div className="font-bold">{check.name}</div>
                <div className="text-sm text-slate-400">{check.details}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <StorageDiagnostic />
      </div>
      
      <div className="mt-8">
        <EnhancedDatabaseViewer />

      </div>

      
      <div className="mt-8 bg-slate-800 p-4 rounded-lg">
        <h2 className="font-bold mb-2">How to View Console Logs:</h2>
        <ul className="text-sm space-y-2 text-slate-300">
          <li><strong>Chrome/Edge:</strong> Press F12 or Ctrl+Shift+I, click "Console" tab</li>
          <li><strong>Firefox:</strong> Press F12 or Ctrl+Shift+K, click "Console" tab</li>
          <li><strong>Safari:</strong> Press Cmd+Option+C (Mac)</li>
          <li><strong>Mobile:</strong> Use desktop browser with device emulation (F12 → Device Toolbar)</li>
        </ul>
      </div>
      
      <div className="mt-4 bg-slate-800 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Troubleshooting Steps:</h2>
        <ul className="text-sm space-y-1 text-slate-300">
          <li>1. Check browser console (F12) for errors</li>
          <li>2. Run Storage Diagnostic above to test bucket access</li>
          <li>3. Try hard refresh (Ctrl+Shift+R)</li>
          <li>4. Clear browser cache</li>
        </ul>
      </div>
    </div>
  );
}
