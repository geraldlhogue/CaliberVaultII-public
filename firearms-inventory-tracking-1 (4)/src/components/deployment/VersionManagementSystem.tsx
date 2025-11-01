import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { GitBranch, Tag, Package, Upload, Download, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Version {
  id: string;
  version: string;
  environment: string;
  commit_hash: string;
  deployed_at: string;
  status: string;
  release_notes?: string;
}

export function VersionManagementSystem() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVersion, setNewVersion] = useState({
    version: '',
    environment: 'development',
    commit_hash: '',
    release_notes: ''
  });
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('deployment_history')
        .select('*')
        .order('deployed_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch version history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deployVersion = async () => {
    setIsDeploying(true);
    try {
      const deploymentId = `deploy-${Date.now()}`;
      
      const { error } = await supabase
        .from('deployment_history')
        .insert({
          deployment_id: deploymentId,
          version: newVersion.version,
          environment: newVersion.environment,
          commit_hash: newVersion.commit_hash,
          status: 'in_progress',
          metadata: { release_notes: newVersion.release_notes }
        });

      if (error) throw error;

      // Trigger deployment via edge function
      const { data: deployResult, error: deployError } = await supabase.functions.invoke('inventory-sync', {
        body: {
          action: 'deploy',
          version: newVersion.version,
          environment: newVersion.environment
        }
      });

      if (deployError) throw deployError;

      // Update deployment status
      await supabase
        .from('deployment_history')
        .update({ status: 'success' })
        .eq('deployment_id', deploymentId);

      toast({
        title: 'Success',
        description: `Version ${newVersion.version} deployed to ${newVersion.environment}`
      });

      fetchVersions();
      setNewVersion({
        version: '',
        environment: 'development',
        commit_hash: '',
        release_notes: ''
      });
    } catch (error) {
      console.error('Deployment error:', error);
      toast({
        title: 'Deployment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const rollbackVersion = async (versionId: string) => {
    try {
      const { error } = await supabase
        .from('deployment_history')
        .update({ status: 'rolled_back' })
        .eq('id', versionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Version rolled back successfully'
      });

      fetchVersions();
    } catch (error) {
      console.error('Rollback error:', error);
      toast({
        title: 'Rollback Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'production':
        return <Package className="h-4 w-4" />;
      case 'staging':
        return <Tag className="h-4 w-4" />;
      case 'development':
        return <GitBranch className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Version Management</h1>
        <p className="text-muted-foreground">Deploy and manage application versions</p>
      </div>

      {/* Deploy New Version */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Deploy New Version</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., 1.2.3"
                value={newVersion.version}
                onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={newVersion.environment}
                onValueChange={(value) => setNewVersion({ ...newVersion, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="commit">Commit Hash</Label>
              <Input
                id="commit"
                placeholder="e.g., abc123def"
                value={newVersion.commit_hash}
                onChange={(e) => setNewVersion({ ...newVersion, commit_hash: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Release Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe changes in this version..."
                value={newVersion.release_notes}
                onChange={(e) => setNewVersion({ ...newVersion, release_notes: e.target.value })}
              />
            </div>
          </div>
          <Button 
            className="mt-4" 
            onClick={deployVersion}
            disabled={!newVersion.version || isDeploying}
          >
            {isDeploying ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Deploy Version
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading versions...</div>
          ) : versions.length === 0 ? (
            <Alert>
              <AlertDescription>No versions deployed yet</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEnvironmentIcon(version.environment)}
                      <span className="font-semibold text-lg">{version.version}</span>
                      <Badge variant={version.status === 'success' ? 'default' : 'secondary'}>
                        {version.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {version.status === 'success' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rollbackVersion(version.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Environment: {version.environment}</div>
                    <div>Commit: {version.commit_hash?.substring(0, 7)}</div>
                    <div>Deployed: {new Date(version.deployed_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}