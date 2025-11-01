import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCode2, 
  GitBranch, 
  TrendingUp, 
  TrendingDown,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CoverageData {
  file: string;
  lines: number;
  covered: number;
  percentage: number;
  uncoveredLines: number[];
  branches: number;
  functions: number;
}

interface CoverageSummary {
  total: number;
  covered: number;
  skipped: number;
  percentage: number;
}

export function TestCoverageDashboard() {
  const [coverage, setCoverage] = useState<CoverageData[]>([]);
  const [summary, setSummary] = useState<CoverageSummary>({
    total: 0,
    covered: 0,
    skipped: 0,
    percentage: 0
  });
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    loadCoverageData();
  }, []);

  const loadCoverageData = () => {
    // Simulated coverage data
    const mockData: CoverageData[] = [
      {
        file: 'src/services/inventory.service.ts',
        lines: 250,
        covered: 225,
        percentage: 90,
        uncoveredLines: [45, 67, 89, 123, 156],
        branches: 85,
        functions: 92
      },
      {
        file: 'src/components/inventory/ItemCard.tsx',
        lines: 180,
        covered: 162,
        percentage: 90,
        uncoveredLines: [23, 45, 67],
        branches: 88,
        functions: 95
      },
      {
        file: 'src/hooks/useInventorySync.ts',
        lines: 120,
        covered: 96,
        percentage: 80,
        uncoveredLines: [12, 34, 56, 78],
        branches: 75,
        functions: 82
      },
      {
        file: 'src/lib/validation.ts',
        lines: 95,
        covered: 90,
        percentage: 95,
        uncoveredLines: [15],
        branches: 92,
        functions: 98
      }
    ];

    setCoverage(mockData);
    
    const totalLines = mockData.reduce((sum, d) => sum + d.lines, 0);
    const coveredLines = mockData.reduce((sum, d) => sum + d.covered, 0);
    
    setSummary({
      total: totalLines,
      covered: coveredLines,
      skipped: totalLines - coveredLines,
      percentage: (coveredLines / totalLines) * 100
    });

    // Determine trend
    const previousPercentage = 85; // Mock previous value
    if (summary.percentage > previousPercentage) setTrend('up');
    else if (summary.percentage < previousPercentage) setTrend('down');
    else setTrend('stable');
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (percentage >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Coverage</p>
                <p className={`text-2xl font-bold ${getCoverageColor(summary.percentage)}`}>
                  {summary.percentage.toFixed(1)}%
                </p>
              </div>
              {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
              {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500">Lines Covered</p>
              <p className="text-2xl font-bold">{summary.covered.toLocaleString()}</p>
              <p className="text-xs text-gray-400">of {summary.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500">Uncovered Lines</p>
              <p className="text-2xl font-bold text-orange-600">{summary.skipped}</p>
              <p className="text-xs text-gray-400">needs attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-500">Test Files</p>
              <p className="text-2xl font-bold">{coverage.length}</p>
              <p className="text-xs text-gray-400">analyzed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5" />
            File Coverage Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="low">Low Coverage</TabsTrigger>
              <TabsTrigger value="uncovered">Uncovered Lines</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {coverage.map((file) => (
                <div key={file.file} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCoverageIcon(file.percentage)}
                      <span className="font-medium text-sm">{file.file}</span>
                    </div>
                    <Badge className={getCoverageColor(file.percentage).replace('text-', 'bg-').replace('600', '100')}>
                      {file.percentage}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Line Coverage</span>
                        <span>{file.covered}/{file.lines}</span>
                      </div>
                      <Progress value={file.percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Branch Coverage</span>
                          <span>{file.branches}%</span>
                        </div>
                        <Progress value={file.branches} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Function Coverage</span>
                          <span>{file.functions}%</span>
                        </div>
                        <Progress value={file.functions} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="low">
              {coverage.filter(f => f.percentage < 80).map((file) => (
                <div key={file.file} className="border border-red-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{file.file}</span>
                    <Badge variant="destructive">{file.percentage}%</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Missing coverage on {file.uncoveredLines.length} lines
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="uncovered">
              {coverage.map((file) => (
                <div key={file.file} className="border rounded-lg p-4 mb-3">
                  <p className="font-medium mb-2">{file.file}</p>
                  <div className="flex flex-wrap gap-2">
                    {file.uncoveredLines.map((line) => (
                      <Badge key={line} variant="outline" className="text-xs">
                        Line {line}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}