import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { errorHandler } from '@/lib/errorHandler';
import { AlertCircle, Trash2, Download } from 'lucide-react';

export function ErrorLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLogs(errorHandler.getErrorLogs());
  };

  const clearLogs = () => {
    if (confirm('Clear all error logs?')) {
      errorHandler.clearErrorLogs();
      setLogs([]);
    }
  };

  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `error-logs-${new Date().toISOString()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Logs ({logs.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={downloadLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={clearLogs} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No errors logged</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <Card key={idx} className="border-destructive/50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="destructive" className="mb-2">
                            {log.operation}
                          </Badge>
                          <p className="font-medium">{log.error.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      {log.error.code && (
                        <p className="text-sm text-muted-foreground">
                          Error Code: {log.error.code}
                        </p>
                      )}
                      
                      {log.component && (
                        <p className="text-sm text-muted-foreground">
                          Component: {log.component}
                        </p>
                      )}
                      
                      {log.dataState && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            Data State
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(log.dataState, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
