import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueryResult {
  table: string;
  count: number;
  data: any[];
  error?: string;
}

export function SimpleDatabaseViewer() {
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('firearms');

  const tables = [
    { name: 'firearms', label: 'Firearms' },
    { name: 'bullets', label: 'Ammunition' },
    { name: 'optics', label: 'Optics' },
    { name: 'suppressors', label: 'Suppressors' },
    { name: 'manufacturers', label: 'Manufacturers' },
    { name: 'calibers', label: 'Calibers' },
    { name: 'bullet_types', label: 'Bullet Types' },
    { name: 'locations', label: 'Locations' },
  ];

  const queryAllTables = async () => {
    setLoading(true);
    const newResults: QueryResult[] = [];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact' })
          .limit(100);

        newResults.push({
          table: table.name,
          count: count || 0,
          data: data || [],
          error: error?.message
        });
      } catch (err: any) {
        newResults.push({
          table: table.name,
          count: 0,
          data: [],
          error: err.message
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    queryAllTables();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Database Viewer
        </h2>
        <Button onClick={queryAllTables} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max">
            {tables.map(table => {
              const result = results.find(r => r.table === table.name);
              return (
                <TabsTrigger key={table.name} value={table.name}>
                  {table.label} ({result?.count || 0})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </ScrollArea>

        {tables.map(table => {
          const result = results.find(r => r.table === table.name);
          return (
            <TabsContent key={table.name} value={table.name} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{table.label} - {result?.count || 0} records</CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Error: {result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result?.data && result.data.length > 0 ? (
                    <ScrollArea className="h-[600px] w-full rounded-md border">
                      <pre className="text-xs p-4 bg-slate-50 dark:bg-slate-900">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>No records found in {table.label}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
