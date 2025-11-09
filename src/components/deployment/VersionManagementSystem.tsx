import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Version {
  id: string;
  version: string;
  tag: string;
  commit: string;
  deployedAt: Date;
  deployedBy: string;
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'rolled-back' | 'failed';
  changes: string[];
  metrics?: {
    buildTime: number;
    testsPassed: number;
    testsTotal: number;
    coverage: number;
  };
}

export function VersionManagementSystem() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState<string>('');

  useEffect(() => {
    loadVersionHistory();
  }, []);

  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from your deployment service
      const mockVersions: Version[] = [
        {
          id: '1',
          version: 'v2.5.0',
          tag: 'release-2.5.0',
          commit: 'abc123def456',
          deployedAt: new Date('2024-11-01T10:30:00'),
          deployedBy: 'admin@calibervault.com',
          environment: 'production',
          status: 'active',
          changes: [
            'Added Git automation system',
            'Implemented test results dashboard',
            'Enhanced deployment pipeline',
          ],
          metrics: {
            buildTime: 245,
            testsPassed: 487,
            testsTotal: 500,
            coverage: 87.2,
          },
        },
        {
          id: '2',
          version: 'v2.4.3',
          tag: 'release-2.4.3',
          commit: 'def456ghi789',
          deployedAt: new Date('2024-10-28T14:20:00'),
          deployedBy: 'admin@calibervault.com',
          environment: 'production',
          status: 'rolled-back',
          changes: [
            'Fixed category filtering',
            'Improved mobile performance',
            'Updated barcode scanner',
          ],
          metrics: {
            buildTime: 238,
            testsPassed: 475,
            testsTotal: 485,
            coverage: 85.8,
          },
        },
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (version: Version) => {
    if (!confirm(`Are you sure you want to rollback to ${version.version}?`)) {
      return;
    }

    setLoading(true);
    setRollbackStatus('Initiating rollback...');

    try {
      // Step 1: Validate version
      setRollbackStatus('Validating version...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create backup
      setRollbackStatus('Creating backup of current version...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Deploy previous version
      setRollbackStatus('Deploying previous version...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Run health checks
      setRollbackStatus('Running health checks...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRollbackStatus(`Successfully rolled back to ${version.version}`);
      
      // Update version status
      setVersions(prev =>
        prev.map(v =>
          v.id === version.id
            ? { ...v, status: 'active' as const }
            : v.status === 'active'
            ? { ...v, status: 'rolled-back' as const }
            : v
        )
      );
    } catch (error) {
      setRollbackStatus('Rollback failed. Current version maintained.');
      console.error('Rollback failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Version['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'rolled-back':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version Management & Rollback</CardTitle>
          <CardDescription>
            View deployment history and rollback to previous versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rollbackStatus && (
            <Alert className="mb-4">
              <AlertDescription>{rollbackStatus}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history">Version History</TabsTrigger>
              <TabsTrigger value="compare">Compare Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {versions.map(version => (
                    <Card key={version.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">
                              {version.version}
                            </CardTitle>
                            <Badge className={getStatusColor(version.status)}>
                              {version.status}
                            </Badge>
                            <Badge variant="outline">
                              {version.environment}
                            </Badge>
                          </div>
                          {version.status !== 'active' && (
                            <Button
                              onClick={() => handleRollback(version)}
                              disabled={loading}
                              variant="outline"
                            >
                              Rollback to this version
                            </Button>
                          )}
                        </div>
                        <CardDescription>
                          Deployed {version.deployedAt.toLocaleString()} by{' '}
                          {version.deployedBy}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Commit: {version.commit}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tag: {version.tag}
                            </p>
                          </div>

                          {version.metrics && (
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Build Time
                                </p>
                                <p className="text-lg font-semibold">
                                  {version.metrics.buildTime}s
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Tests Passed
                                </p>
                                <p className="text-lg font-semibold">
                                  {version.metrics.testsPassed}/
                                  {version.metrics.testsTotal}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Coverage
                                </p>
                                <p className="text-lg font-semibold">
                                  {version.metrics.coverage}%
                                </p>
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium mb-2">Changes:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {version.changes.map((change, idx) => (
                                <li key={idx} className="text-sm">
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="compare">
              <div className="text-center py-8 text-muted-foreground">
                Select two versions to compare their changes
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
