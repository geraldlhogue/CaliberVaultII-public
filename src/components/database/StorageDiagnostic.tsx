import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { storageService } from '@/services/storage.service';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function StorageDiagnostic() {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test: string, success: boolean, message: string) => {
    setResults(prev => [...prev, { test, success, message, time: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: Check authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        addResult('Authentication', false, 'Not logged in');
      } else {
        addResult('Authentication', true, `Logged in as ${user.email}`);
      }
    } catch (error: any) {
      addResult('Authentication', false, error.message);
    }

    // Test 2: List buckets
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      addResult('List Buckets', true, `Found ${data.length} buckets: ${data.map(b => b.name).join(', ')}`);
    } catch (error: any) {
      addResult('List Buckets', false, error.message);
    }

    // Test 3: Test avatar upload
    try {
      const testBlob = new Blob(['test'], { type: 'image/png' });
      const testFile = new File([testBlob], 'test.png', { type: 'image/png' });
      const result = await storageService.uploadAvatar(testFile);
      addResult('Avatar Upload', true, `Uploaded to ${result.url}`);
    } catch (error: any) {
      addResult('Avatar Upload', false, error.message);
    }

    setTesting(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Storage Diagnostic</h2>
      <Button onClick={runTests} disabled={testing} className="mb-4">
        {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : 'Run Tests'}
      </Button>
      
      <div className="space-y-2">
        {results.map((result, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded">
            {result.success ? 
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /> : 
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            }
            <div className="flex-1">
              <div className="font-semibold">{result.test}</div>
              <div className="text-sm text-muted-foreground">{result.message}</div>
              <div className="text-xs text-muted-foreground">{result.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
