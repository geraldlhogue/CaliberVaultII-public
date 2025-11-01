import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { WhereClauseBuilder } from './WhereClauseBuilder';
import { JoinBuilder, JoinConfig } from './JoinBuilder';
import { QueryResultsGrid } from './QueryResultsGrid';
import { ExportQueryModal } from './ExportQueryModal';
import { ScheduleQueryModal } from './ScheduleQueryModal';
import { Play, Save, History, Code, Trash2, Star, Download, Clock, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';


interface TableColumn {
  table: string;
  column: string;
  selected: boolean;
}

interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  favorite: boolean;
  timestamp: number;
}

export function VisualQueryBuilder() {
  const [tables, setTables] = useState<Array<{ name: string; columns: string[] }>>([]);
  const [selectedColumns, setSelectedColumns] = useState<TableColumn[]>([]);
  const [whereConditions, setWhereConditions] = useState<any[]>([]);
  const [joins, setJoins] = useState<JoinConfig[]>([]);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [queryHistory, setQueryHistory] = useState<SavedQuery[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [limit, setLimit] = useState('100');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');


  useEffect(() => {
    loadTables();
    loadQueryHistory();
    loadSavedQueries();
  }, []);

  const loadTables = async () => {
    try {
      const { data, error } = await supabase.rpc('get_table_columns');
      if (error) throw error;
      
      const tableMap = new Map<string, string[]>();
      data?.forEach((row: any) => {
        if (!tableMap.has(row.table_name)) {
          tableMap.set(row.table_name, []);
        }
        tableMap.get(row.table_name)?.push(row.column_name);
      });

      const tableList = Array.from(tableMap.entries()).map(([name, columns]) => ({
        name,
        columns
      }));
      setTables(tableList);
    } catch (err: any) {
      toast.error('Failed to load tables');
    }
  };

  const loadQueryHistory = () => {
    const history = localStorage.getItem('queryHistory');
    if (history) setQueryHistory(JSON.parse(history));
  };

  const loadSavedQueries = () => {
    const saved = localStorage.getItem('savedQueries');
    if (saved) setSavedQueries(JSON.parse(saved));
  };

  const toggleColumn = (table: string, column: string) => {
    const existing = selectedColumns.find(c => c.table === table && c.column === column);
    if (existing) {
      setSelectedColumns(selectedColumns.filter(c => !(c.table === table && c.column === column)));
    } else {
      setSelectedColumns([...selectedColumns, { table, column, selected: true }]);
    }
  };

  const generateSQL = () => {
    if (selectedColumns.length === 0) return '';

    const selectCols = selectedColumns.map(c => `${c.table}.${c.column}`).join(', ');
    const mainTable = selectedColumns[0]?.table || '';
    
    let sql = `SELECT ${selectCols}\nFROM ${mainTable}`;

    joins.forEach(join => {
      sql += `\n${join.type} JOIN ${join.table} ON ${mainTable}.${join.leftColumn} = ${join.table}.${join.rightColumn}`;
    });

    if (whereConditions.length > 0) {
      const whereClauses = whereConditions.map((c, idx) => {
        const prefix = idx > 0 ? ` ${c.logicalOp} ` : '';
        const value = c.operator.includes('NULL') ? '' : ` '${c.value}'`;
        return `${prefix}${c.column} ${c.operator}${value}`;
      }).join('');
      sql += `\nWHERE ${whereClauses}`;
    }

    sql += `\nLIMIT ${limit}`;
    setGeneratedSQL(sql);
    return sql;
  };

  useEffect(() => {
    generateSQL();
  }, [selectedColumns, joins, whereConditions, limit]);

  const executeQuery = async () => {
    const sql = generateSQL();
    if (!sql) {
      toast.error('Please select at least one column');
      return;
    }

    setIsExecuting(true);
    setQueryError('');
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.rpc('execute_query', { query_text: sql });
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (error) throw error;
      
      setQueryResults(data || []);
      addToHistory(sql);
      toast.success('Query executed successfully');
    } catch (err: any) {
      setQueryError(err.message);
      toast.error('Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const addToHistory = (sql: string) => {
    const newHistory = [{
      id: Date.now().toString(),
      name: `Query ${queryHistory.length + 1}`,
      sql,
      favorite: false,
      timestamp: Date.now()
    }, ...queryHistory.slice(0, 19)];
    setQueryHistory(newHistory);
    localStorage.setItem('queryHistory', JSON.stringify(newHistory));
  };

  const saveQuery = () => {
    const name = prompt('Enter query name:');
    if (!name) return;

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name,
      sql: generatedSQL,
      favorite: false,
      timestamp: Date.now()
    };
    const updated = [newQuery, ...savedQueries];
    setSavedQueries(updated);
    localStorage.setItem('savedQueries', JSON.stringify(updated));
    toast.success('Query saved');
  };

  const toggleFavorite = (id: string) => {
    const updated = savedQueries.map(q => q.id === id ? { ...q, favorite: !q.favorite } : q);
    setSavedQueries(updated);
    localStorage.setItem('savedQueries', JSON.stringify(updated));
  };

  const loadQuery = (sql: string) => {
    // Parse SQL and populate builder (simplified)
    setGeneratedSQL(sql);
    toast.info('Query loaded - manual editing may be needed');
  };

  const createShareLink = async () => {
    try {
      const shareToken = Math.random().toString(36).substring(2, 15);
      const { error } = await supabase.from('shared_queries').insert({
        share_token: shareToken,
        name: 'Shared Query',
        query_config: { selectedColumns, whereConditions, joins, limit },
        sql_query: generatedSQL,
        is_public: true
      });

      if (error) throw error;

      const link = `${window.location.origin}/query/${shareToken}`;
      setShareLink(link);
      setShowShareModal(true);
      toast.success('Share link created');
    } catch (error: any) {
      toast.error('Failed to create share link: ' + error.message);
    }
  };

  const allColumns = selectedColumns.map(c => `${c.table}.${c.column}`);
  const selectedTablesList = Array.from(new Set(selectedColumns.map(c => c.table)))
    .map(tableName => ({
      table: tableName,
      columns: tables.find(t => t.name === tableName)?.columns || []
    }));


  return (
    <div className="space-y-4">
      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Tables & Columns</h3>
              <ScrollArea className="h-[400px]">
                {tables.map(table => (
                  <div key={table.name} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{table.name}</h4>
                    {table.columns.map(col => (
                      <div key={col} className="flex items-center gap-2 mb-1">
                        <Checkbox
                          checked={selectedColumns.some(c => c.table === table.name && c.column === col)}
                          onCheckedChange={() => toggleColumn(table.name, col)}
                        />
                        <span className="text-sm">{col}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </ScrollArea>
            </Card>

            <Card className="p-4 col-span-2 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Selected Columns</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedColumns.map((c, idx) => (
                    <Badge key={idx} variant="secondary">{c.table}.{c.column}</Badge>
                  ))}
                </div>
              </div>

              {selectedTablesList.length > 1 && (
                <JoinBuilder
                  joins={joins}
                  availableTables={tables.map(t => t.name)}
                  selectedTables={selectedTablesList}
                  onChange={setJoins}
                />
              )}

              {allColumns.length > 0 && (
                <WhereClauseBuilder
                  conditions={whereConditions}
                  columns={allColumns}
                  onChange={setWhereConditions}
                />
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm">LIMIT:</span>
                <Input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={executeQuery} disabled={isExecuting}>
                  <Play className="w-4 h-4 mr-2" />Execute
                </Button>
                <Button variant="outline" onClick={saveQuery}>
                  <Save className="w-4 h-4 mr-2" />Save
                </Button>
                <Button variant="outline" onClick={() => setShowExportModal(true)} disabled={queryResults.length === 0}>
                  <Download className="w-4 h-4 mr-2" />Export
                </Button>
                <Button variant="outline" onClick={() => setShowScheduleModal(true)}>
                  <Clock className="w-4 h-4 mr-2" />Schedule
                </Button>
                <Button variant="outline" onClick={createShareLink}>
                  <Share2 className="w-4 h-4 mr-2" />Share
                </Button>
              </div>
            </Card>
          </div>


          <Card className="p-4">
            <QueryResultsGrid
              data={queryResults}
              error={queryError}
              isLoading={isExecuting}
              executionTime={executionTime}
            />
          </Card>
        </TabsContent>

        <TabsContent value="sql">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated SQL</h3>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedSQL)}>
                <Code className="w-4 h-4 mr-2" />Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              {generatedSQL || 'No query generated yet'}
            </pre>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Query History</h3>
            <ScrollArea className="h-[500px]">
              {queryHistory.map(query => (
                <div key={query.id} className="p-3 border rounded-lg mb-2 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{query.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(query.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded mb-2">{query.sql}</pre>
                  <Button size="sm" variant="outline" onClick={() => loadQuery(query.sql)}>
                    Load Query
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Saved Queries</h3>
            <ScrollArea className="h-[500px]">
              {savedQueries.map(query => (
                <div key={query.id} className="p-3 border rounded-lg mb-2 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFavorite(query.id)}
                      >
                        <Star className={`w-4 h-4 ${query.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <span className="font-medium">{query.name}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const updated = savedQueries.filter(q => q.id !== query.id);
                        setSavedQueries(updated);
                        localStorage.setItem('savedQueries', JSON.stringify(updated));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded mb-2">{query.sql}</pre>
                  <Button size="sm" variant="outline" onClick={() => loadQuery(query.sql)}>
                    Load Query
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      <ExportQueryModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        results={queryResults}
        sqlQuery={generatedSQL}
      />

      <ScheduleQueryModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        queryConfig={{ selectedColumns, whereConditions, joins, limit }}
        sqlQuery={generatedSQL}
      />

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <h3 className="font-semibold mb-4">Share Query</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this link to allow others to view and execute this query:
            </p>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly />
              <Button onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Link copied to clipboard');
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
