import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableData {
  table: string;
  count: number;
  data: any[];
  error?: string;
  columns?: string[];
}

interface LookupData {
  manufacturers: Map<string, string>;
  calibers: Map<string, string>;
  bulletTypes: Map<string, string>;
  locations: Map<string, string>;
  categories: Map<string, string>;
  actions: Map<string, string>;
  ammoTypes: Map<string, string>;
}

export function EnhancedDatabaseViewer() {
  const [results, setResults] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');

  const [lookupData, setLookupData] = useState<LookupData>({
    manufacturers: new Map(),
    calibers: new Map(),
    bulletTypes: new Map(),
    locations: new Map(),
    categories: new Map(),
    actions: new Map(),
    ammoTypes: new Map(),
  });

  const tables = [
    // NEW SCHEMA - Base inventory table
    { name: 'inventory', label: 'Inventory (Base)' },
    // Detail tables
    { name: 'firearm_details', label: 'Firearm Details' },
    { name: 'optic_details', label: 'Optic Details' },
    { name: 'suppressor_details', label: 'Suppressor Details' },
    { name: 'ammunition_details', label: 'Ammunition Details' },
    { name: 'primer_details', label: 'Primer Details' },
    { name: 'bullet_details', label: 'Bullet Details' },
    { name: 'powder_details', label: 'Powder Details' },
    { name: 'case_details', label: 'Case Details' },
    { name: 'magazine_details', label: 'Magazine Details' },
    { name: 'accessory_details', label: 'Accessory Details' },
    { name: 'reloading_details', label: 'Reloading Details' },
    // Reference tables
    { name: 'categories', label: 'Categories' },
    { name: 'manufacturers', label: 'Manufacturers' },
    { name: 'calibers', label: 'Calibers' },
    { name: 'actions', label: 'Actions' },
    { name: 'firearm_types', label: 'Firearm Types' },
    { name: 'optic_types', label: 'Optic Types' },
    { name: 'bullet_types', label: 'Bullet Types' },
    { name: 'storage_locations', label: 'Storage Locations' },
  ];


  const loadLookupData = async () => {
    const [mfg, cal, bullet, loc, cat, act, ammo] = await Promise.all([
      supabase.from('manufacturers').select('id, name'),
      supabase.from('calibers').select('id, name'),
      supabase.from('bullet_types').select('id, name'),
      supabase.from('locations').select('id, name'),
      supabase.from('categories').select('id, name'),
      supabase.from('actions').select('id, name'),
      supabase.from('ammo_types').select('id, name'),
    ]);

    setLookupData({
      manufacturers: new Map(mfg.data?.map(m => [m.id, m.name]) || []),
      calibers: new Map(cal.data?.map(c => [c.id, c.name]) || []),
      bulletTypes: new Map(bullet.data?.map(b => [b.id, b.name]) || []),
      locations: new Map(loc.data?.map(l => [l.id, l.name]) || []),
      categories: new Map(cat.data?.map(c => [c.id, c.name]) || []),
      actions: new Map(act.data?.map(a => [a.id, a.name]) || []),
      ammoTypes: new Map(ammo.data?.map(a => [a.id, a.name]) || []),
    });
  };

  const queryAllTables = async () => {
    setLoading(true);
    await loadLookupData();
    const newResults: TableData[] = [];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(100);

        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        
        newResults.push({
          table: table.name,
          count: count || 0,
          data: data || [],
          columns,
          error: error?.message
        });
      } catch (err: any) {
        newResults.push({
          table: table.name,
          count: 0,
          data: [],
          columns: [],
          error: err.message
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const resolveLookup = (key: string, value: any): string => {
    if (!value) return '-';
    if (key.includes('manufacturer')) return lookupData.manufacturers.get(value) || value;
    if (key.includes('caliber')) return lookupData.calibers.get(value) || value;
    if (key.includes('bullet_type')) return lookupData.bulletTypes.get(value) || value;
    if (key.includes('location')) return lookupData.locations.get(value) || value;
    if (key.includes('category')) return lookupData.categories.get(value) || value;
    if (key.includes('action')) return lookupData.actions.get(value) || value;
    if (key.includes('ammo_type')) return lookupData.ammoTypes.get(value) || value;
    return value;
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'object') return JSON.stringify(value);
    if (key.includes('_at')) return new Date(value).toLocaleString();
    if (key.includes('price') || key.includes('cost') || key.includes('value')) {
      return `$${parseFloat(value).toFixed(2)}`;
    }
    return String(value);
  };

  useEffect(() => {
    queryAllTables();
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-full mx-auto">
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {result.columns?.map(col => (
                              <TableHead key={col} className="font-bold whitespace-nowrap">
                                {col.replace(/_/g, ' ').toUpperCase()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.data.map((row, idx) => (
                            <TableRow key={idx}>
                              {result.columns?.map(col => (
                                <TableCell key={col} className="whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {formatValue(col, row[col])}
                                    </span>
                                    {col.includes('_id') && row[col] && (
                                      <span className="text-xs text-slate-500">
                                        {resolveLookup(col, row[col])}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
