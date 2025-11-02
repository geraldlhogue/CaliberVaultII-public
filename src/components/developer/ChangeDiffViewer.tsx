import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, GitCommit, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileChange {
  file: string;
  description: string;
  status: 'modified' | 'created' | 'deleted';
}

interface Session {
  date: string;
  description: string;
  changes: FileChange[];
}

export function ChangeDiffViewer() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangesLog();
  }, []);

  const loadChangesLog = async () => {
    try {
      const response = await fetch('/CHANGES_LOG.md');
      const content = await response.text();
      const parsed = parseChangesLog(content);
      setSessions(parsed);
    } catch (error) {
      console.error('Failed to load changes log:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseChangesLog = (content: string): Session[] => {
    const sessions: Session[] = [];
    let current: Session | null = null;

    content.split('\n').forEach(line => {
      if (line.startsWith('## Session:')) {
        if (current) sessions.push(current);
        current = { date: line.split('Session:')[1].trim(), description: '', changes: [] };
      } else if (line.startsWith('**Description:**') && current) {
        current.description = line.split('**Description:**')[1].trim();
      } else if (line.match(/^\d+\.\s+`(.+?)`/) && current) {
        const match = line.match(/`(.+?)`\s+-\s+(.+)/);
        if (match) {
          current.changes.push({
            file: match[1],
            description: match[2],
            status: match[2].includes('Created') ? 'created' : 'modified'
          });
        }
      }
    });

    if (current) sessions.push(current);
    return sessions;
  };

  const downloadScript = () => {
    const link = document.createElement('a');
    link.href = '/scripts/auto-commit.js';
    link.download = 'auto-commit.js';
    link.click();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading changes...</div>;
  }

  const session = sessions[selectedSession];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Change Diff Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSession.toString()} onValueChange={(v) => setSelectedSession(parseInt(v))}>
            <TabsList className="mb-4">
              {sessions.map((s, i) => (
                <TabsTrigger key={i} value={i.toString()}>
                  Session {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {sessions.map((s, i) => (
              <TabsContent key={i} value={i.toString()}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{s.description}</h3>
                      <p className="text-sm text-muted-foreground">{s.date}</p>
                    </div>
                    <Badge variant="secondary">{s.changes.length} files</Badge>
                  </div>

                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-2">
                      {s.changes.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <FileText className="h-4 w-4 mt-1 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <code className="text-sm font-mono">{change.file}</code>
                            <p className="text-sm text-muted-foreground mt-1">{change.description}</p>
                          </div>
                          <Badge variant={change.status === 'created' ? 'default' : 'secondary'}>
                            {change.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Button onClick={downloadScript} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Auto-Commit Script
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
