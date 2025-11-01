import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Database, Key, Link, Index, Shield, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableDataInspectorProps {
  tableName: string | null;
  onClose: () => void;
}

export const TableDataInspector: React.FC<TableDataInspectorProps> = ({ tableName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState<number>(0);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [indexes, setIndexes] = useState<any[]>([]);
  const [constraints, setConstraints] = useState<any[]>([]);

  useEffect(() => {
    if (tableName) {
      fetchTableInfo();
    }
  }, [tableName]);

  const fetchTableInfo = async () => {
    if (!tableName) return;
    setLoading(true);
    try {
      // Fetch row count
      const { count } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
      setRowCount(count || 0);

      // Fetch sample data (first 10 rows)
      const { data } = await supabase.from(tableName).select('*').limit(10);
      setSampleData(data || []);

      // Fetch column info
      const { data: colData } = await supabase.rpc('get_table_columns', { table_name: tableName }).catch(() => ({ data: null }));
      
      // Fallback: get columns from information_schema
      const { data: schemaColumns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      setColumns(colData || schemaColumns || []);

      // Fetch indexes
      const { data: indexData } = await supabase
        .rpc('get_table_indexes', { table_name: tableName })
        .catch(() => ({ data: [] }));
      setIndexes(indexData || []);

      // Fetch constraints
      const { data: constraintData } = await supabase
        .rpc('get_table_constraints', { table_name: tableName })
        .catch(() => ({ data: [] }));
      setConstraints(constraintData || []);
    } catch (error) {
      console.error('Error fetching table info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tableName) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[600px] bg-white dark:bg-gray-900 border-l shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">{tableName}</h2>
          <Badge variant="secondary">{rowCount} rows</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchTableInfo}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Columns Section */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Columns ({columns.length})
          </h3>
          <div className="space-y-2">
            {columns.map((col: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                <span className="font-mono">{col.column_name}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{col.data_type}</Badge>
                  {col.is_nullable === 'NO' && <Badge variant="destructive">NOT NULL</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sample Data Section */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Sample Data (10 rows)</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : sampleData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(sampleData[0]).slice(0, 5).map((key) => (
                      <TableHead key={key} className="text-xs">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).slice(0, 5).map((val: any, i) => (
                        <TableCell key={i} className="text-xs max-w-[150px] truncate">
                          {val === null ? <span className="text-gray-400">NULL</span> : String(val)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </Card>
      </ScrollArea>
    </div>
  );
};
