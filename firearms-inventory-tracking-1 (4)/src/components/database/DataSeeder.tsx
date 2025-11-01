import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function DataSeeder() {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const seedTestData = async () => {
    if (!user) {
      setResult({ success: false, message: 'You must be signed in to seed test data' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-test-data', {
        body: { userId: user.id }
      });

      if (error) {
        setResult({ success: false, message: `Error: ${error.message}` });
      } else {
        setResult({ success: true, message: 'Test data seeded successfully! Please refresh the page to see the new items.' });
      }
    } catch (error: any) {
      setResult({ success: false, message: `Failed to seed data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test Data Seeder
        </CardTitle>
        <CardDescription>
          Populate your inventory with sample data for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={seedTestData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Test Data
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will add 9 sample items to your inventory including firearms, optics, and ammunition.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}