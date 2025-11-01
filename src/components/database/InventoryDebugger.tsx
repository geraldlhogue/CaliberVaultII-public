import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { RefreshCw, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const InventoryDebugger: React.FC = () => {
  const { user, inventory } = useAppContext();
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const tables = [
    'firearms',
    'optics',
    'ammunition',
    'suppressors',
    'magazines',
    'accessories',
    'bullets',
    'reloading_components'
  ];

  const checkDatabase = async () => {
    if (!user) return;
    
    setLoading(true);
    console.log('🔍 STARTING DATABASE CHECK');
    console.log('User ID:', user.id);
    
    const counts: Record<string, number> = {};
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: false })
          .eq('user_id', user.id);
        
        console.log(`📊 ${table}:`, {
          count: data?.length || 0,
          error: error?.message,
          sampleData: data?.[0]
        });
        
        counts[table] = data?.length || 0;
      } catch (err) {
        console.error(`❌ Error checking ${table}:`, err);
        counts[table] = -1;
      }
    }
    
    setDbCounts(counts);
    setLastCheck(new Date());
    setLoading(false);
    
    console.log('✅ DATABASE CHECK COMPLETE');
    console.log('Total counts:', counts);
  };

  useEffect(() => {
    if (user) {
      checkDatabase();
    }
  }, [user]);

  const getCategoryCount = (category: string) => {
    return inventory.filter(item => item.category === category).length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Inventory Debugger
          </CardTitle>
          <Button onClick={checkDatabase} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastCheck && (
          <p className="text-sm text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          <div className="text-center py-8 text-muted-foreground">
            Please sign in to view debug information
          </div>
        ) : (
          <>
            {tables.map(table => {
              const dbCount = dbCounts[table] ?? 0;
              const appCount = getCategoryCount(table);
              const isMatch = dbCount === appCount;
              const hasIssue = dbCount > 0 && appCount === 0;
              
              return (
                <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {isMatch ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : hasIssue ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{table.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        DB: {dbCount} | App: {appCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={isMatch ? 'default' : hasIssue ? 'destructive' : 'secondary'}>
                      {isMatch ? 'OK' : hasIssue ? 'MISMATCH' : 'Empty'}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <p className="font-semibold">Legend:</p>
              <div className="space-y-1 text-sm">
                <p><CheckCircle className="inline h-4 w-4 text-green-500 mr-2" />
                  Data in DB matches App (working correctly)</p>
                <p><XCircle className="inline h-4 w-4 text-red-500 mr-2" />
                  Data in DB but NOT in App (fetch issue)</p>
                <p><AlertCircle className="inline h-4 w-4 text-yellow-500 mr-2" />
                  No data in either (empty or not tested)</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
