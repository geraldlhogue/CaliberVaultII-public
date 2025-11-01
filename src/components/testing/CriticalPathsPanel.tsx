import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Zap, Shield, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticalFile {
  path: string;
  coverage: number;
  category: 'auth' | 'database' | 'service' | 'core' | 'security';
  priority: 'high' | 'medium' | 'low';
}

interface CriticalPathsPanelProps {
  files: Record<string, any>;
  onGenerateTest: (path: string) => void;
}

export function CriticalPathsPanel({ files, onGenerateTest }: CriticalPathsPanelProps) {
  const identifyCriticalPaths = (): CriticalFile[] => {
    const critical: CriticalFile[] = [];
    
    Object.entries(files).forEach(([path, data]) => {
      const coverage = data.lines?.pct || 0;
      
      // Identify critical files
      if (path.includes('/auth/') || path.includes('Auth')) {
        critical.push({ path, coverage, category: 'auth', priority: 'high' });
      } else if (path.includes('/database/') || path.includes('Database')) {
        critical.push({ path, coverage, category: 'database', priority: 'high' });
      } else if (path.includes('.service.') || path.includes('/services/')) {
        critical.push({ path, coverage, category: 'service', priority: 'medium' });
      } else if (path.includes('/security/') || path.includes('Security')) {
        critical.push({ path, coverage, category: 'security', priority: 'high' });
      } else if (path.includes('/lib/') || path.includes('/utils/')) {
        critical.push({ path, coverage, category: 'core', priority: 'medium' });
      }
    });
    
    return critical
      .filter(f => f.coverage < 70)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.coverage - b.coverage;
      })
      .slice(0, 10);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'service': return <Zap className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const criticalFiles = identifyCriticalPaths();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Critical Paths Needing Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">All critical paths have adequate coverage!</p>
        ) : (
          criticalFiles.map((file) => (
            <div key={file.path} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">{getIcon(file.category)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.path.split('/').pop()}</div>
                <div className="text-xs text-muted-foreground truncate">{file.path}</div>
              </div>
              <Badge variant={getPriorityColor(file.priority)} className="flex-shrink-0">
                {file.coverage.toFixed(0)}%
              </Badge>
              <Button size="sm" onClick={() => onGenerateTest(file.path)}>
                Generate Test
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}