import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestQualityAnalyzer } from './TestQualityAnalyzer';
import { QualityGateConfig } from './QualityGateConfig';
import { TestCoverageDashboard } from './TestCoverageDashboard';
import { AutomatedTestRunner } from './AutomatedTestRunner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Shield, 
  FileCode2, 
  Zap,
  BarChart3
} from 'lucide-react';

export function AdminTestingPanel() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">QA Testing Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive testing and quality assurance management
        </p>
      </div>

      <Tabs defaultValue="runner" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="runner" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Runner</span>
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4" />
            <span className="hidden sm:inline">Coverage</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Quality</span>
          </TabsTrigger>
          <TabsTrigger value="gates" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Gates</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runner">
          <AutomatedTestRunner />
        </TabsContent>

        <TabsContent value="coverage">
          <TestCoverageDashboard />
        </TabsContent>

        <TabsContent value="quality">
          <TestQualityAnalyzer />
        </TabsContent>

        <TabsContent value="gates">
          <QualityGateConfig />
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-6">
            {/* Test Metrics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Testing Metrics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-600">Test Execution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Tests</span>
                        <span className="font-semibold">247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Duration</span>
                        <span className="font-semibold">12.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Flaky Tests</span>
                        <span className="font-semibold text-orange-600">3</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-600">Code Quality</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Complexity</span>
                        <span className="font-semibold">7.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Duplication</span>
                        <span className="font-semibold">2.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tech Debt</span>
                        <span className="font-semibold">3.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-600">CI/CD Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Build Time</span>
                        <span className="font-semibold">3m 45s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deploy Time</span>
                        <span className="font-semibold">1m 20s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-semibold text-green-600">98.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Test Runs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { branch: 'main', status: 'passed', coverage: 87, time: '2m ago' },
                    { branch: 'feature/qa-pipeline', status: 'passed', coverage: 85, time: '15m ago' },
                    { branch: 'develop', status: 'failed', coverage: 82, time: '1h ago' },
                    { branch: 'bugfix/test-fix', status: 'passed', coverage: 86, time: '2h ago' }
                  ].map((run, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {run.status === 'passed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{run.branch}</p>
                          <p className="text-sm text-gray-500">{run.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{run.coverage}%</p>
                        <p className="text-sm text-gray-500">coverage</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}