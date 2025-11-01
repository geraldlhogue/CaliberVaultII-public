import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestTemplateGenerator } from './TestTemplateGenerator';
import { CoverageFileTree } from './CoverageFileTree';
import { CriticalPathsPanel } from './CriticalPathsPanel';
import { toast } from 'sonner';

interface CoverageData {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

interface FileCoverage {
  [key: string]: CoverageData;
}

export function EnhancedTestCoverageDashboard() {
  const [totalCoverage, setTotalCoverage] = useState<CoverageData | null>(null);
  const [fileCoverage, setFileCoverage] = useState<FileCoverage>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [untestedFiles, setUntestedFiles] = useState<string[]>([]);

  useEffect(() => {
    loadCoverage();
  }, []);

  const loadCoverage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/coverage/coverage-summary.json');
      if (response.ok) {
        const data = await response.json();
        setTotalCoverage(data.total);
        
        const files = { ...data };
        delete files.total;
        setFileCoverage(files);
        
        const untested = Object.entries(files)
          .filter(([_, coverage]: [string, any]) => coverage.lines.pct === 0)
          .map(([path]) => path);
        setUntestedFiles(untested);
        
        toast.success('Coverage data loaded successfully');
      }
    } catch (error) {
      toast.error('Failed to load coverage data');
    } finally {
      setLoading(false);
    }
  };

  const getCoverageIcon = (pct: number) => {
    if (pct >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (pct >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getFileType = (path: string): 'component' | 'service' | 'hook' | 'util' => {
    if (path.includes('/hooks/')) return 'hook';
    if (path.includes('.service.') || path.includes('/services/')) return 'service';
    if (path.includes('/utils/') || path.includes('/lib/')) return 'util';
    return 'component';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading coverage data...</div>;
  }

  if (!totalCoverage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage Dashboard</CardTitle>
          <CardDescription>Run tests to generate coverage data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Run: <code className="bg-muted px-2 py-1 rounded">npm run test:coverage</code>
          </p>
          <Button onClick={loadCoverage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Coverage Dashboard</h1>
          <p className="text-muted-foreground">Interactive coverage analysis and test generation</p>
        </div>
        <Button onClick={loadCoverage} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Lines', data: totalCoverage.lines },
          { label: 'Statements', data: totalCoverage.statements },
          { label: 'Functions', data: totalCoverage.functions },
          { label: 'Branches', data: totalCoverage.branches }
        ].map(({ label, data }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getCoverageIcon(data.pct)}
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pct.toFixed(1)}%</div>
              <Progress value={data.pct} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {data.covered} / {data.total}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">Critical Paths</TabsTrigger>
          <TabsTrigger value="untested">Untested Files</TabsTrigger>
          <TabsTrigger value="files">All Files</TabsTrigger>
          <TabsTrigger value="generate">Generate Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <CriticalPathsPanel 
            files={fileCoverage} 
            onGenerateTest={setSelectedFile}
          />
        </TabsContent>

        <TabsContent value="untested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Untested Files ({untestedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {untestedFiles.map(path => (
                  <div key={path} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate flex-1">{path}</span>
                    <Button size="sm" onClick={() => setSelectedFile(path)}>
                      Generate Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <CoverageFileTree files={fileCoverage} onFileSelect={setSelectedFile} />
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          {selectedFile ? (
            <TestTemplateGenerator 
              filePath={selectedFile} 
              fileType={getFileType(selectedFile)}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Select a file from other tabs to generate a test template
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}