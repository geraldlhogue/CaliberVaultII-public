import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  coverage: number;
}

export function AutomatedTestRunner() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suites, setSuites] = useState<TestSuite[]>([
    {
      name: 'Unit Tests',
      tests: [
        { name: 'Inventory Service', status: 'pending' },
        { name: 'Auth Hooks', status: 'pending' },
        { name: 'Validation Utils', status: 'pending' }
      ],
      coverage: 0
    },
    {
      name: 'Integration Tests',
      tests: [
        { name: 'Database Operations', status: 'pending' },
        { name: 'API Endpoints', status: 'pending' },
        { name: 'File Upload', status: 'pending' }
      ],
      coverage: 0
    },
    {
      name: 'E2E Tests',
      tests: [
        { name: 'User Login Flow', status: 'pending' },
        { name: 'Add Item Workflow', status: 'pending' },
        { name: 'Export Data', status: 'pending' }
      ],
      coverage: 0
    }
  ]);

  const runTests = async () => {
    setRunning(true);
    setProgress(0);
    
    const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
    let completed = 0;

    for (let i = 0; i < suites.length; i++) {
      const suite = suites[i];
      
      for (let j = 0; j < suite.tests.length; j++) {
        // Update test to running
        updateTestStatus(i, j, 'running');
        
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        
        // Random test result
        const passed = Math.random() > 0.1;
        updateTestStatus(i, j, passed ? 'passed' : 'failed', Math.random() * 1000 + 100);
        
        completed++;
        setProgress((completed / totalTests) * 100);
      }
      
      // Update suite coverage
      updateSuiteCoverage(i, Math.random() * 30 + 70);
    }
    
    setRunning(false);
  };

  const updateTestStatus = (suiteIdx: number, testIdx: number, status: TestResult['status'], duration?: number) => {
    setSuites(prev => {
      const updated = [...prev];
      updated[suiteIdx].tests[testIdx] = {
        ...updated[suiteIdx].tests[testIdx],
        status,
        duration,
        error: status === 'failed' ? 'Assertion failed: Expected value to be defined' : undefined
      };
      return updated;
    });
  };

  const updateSuiteCoverage = (suiteIdx: number, coverage: number) => {
    setSuites(prev => {
      const updated = [...prev];
      updated[suiteIdx].coverage = coverage;
      return updated;
    });
  };

  const resetTests = () => {
    setSuites(prev => prev.map(suite => ({
      ...suite,
      coverage: 0,
      tests: suite.tests.map(test => ({
        ...test,
        status: 'pending',
        duration: undefined,
        error: undefined
      }))
    })));
    setProgress(0);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStats = () => {
    const allTests = suites.flatMap(s => s.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      pending: allTests.filter(t => t.status === 'pending').length,
      avgCoverage: suites.reduce((sum, s) => sum + s.coverage, 0) / suites.length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Automated Test Runner
            </span>
            <div className="flex gap-2">
              <Button
                onClick={resetTests}
                variant="outline"
                size="sm"
                disabled={running}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={runTests}
                disabled={running}
                size="sm"
              >
                {running ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          {running && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Running tests...</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              <p className="text-sm text-gray-500">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.avgCoverage.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">Coverage</p>
            </div>
          </div>

          {/* Test Suites */}
          <div className="space-y-4">
            {suites.map((suite, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{suite.name}</h3>
                    {suite.coverage > 0 && (
                      <Badge variant="outline">
                        Coverage: {suite.coverage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {suite.tests.map((test, testIdx) => (
                      <div key={testIdx} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <span className="text-sm">{test.name}</span>
                        </div>
                        {test.duration && (
                          <span className="text-xs text-gray-500">
                            {test.duration.toFixed(0)}ms
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {suite.tests.some(t => t.status === 'failed') && (
                    <Alert className="mt-3" variant="destructive">
                      <AlertDescription className="text-sm">
                        {suite.tests.find(t => t.status === 'failed')?.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}