import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Server,
  Database,
  Cloud,
  Activity
} from 'lucide-react';

interface Deployment {
  id: string;
  deployment_id: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  commit_hash: string;
  deployed_at: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  metadata?: any;
}

export function DeploymentDashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    fetchDeployments();
    fetchMetrics();
  }, [selectedEnvironment]);

  const fetchDeployments = async () => {
    try {
      let query = supabase
        .from('deployment_history')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(50);

      if (selectedEnvironment !== 'all') {
        query = query.eq('environment', selectedEnvironment);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDeployments(data || []);
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('deployment_metrics')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Process metrics
      const processed = data?.reduce((acc, metric) => {
        if (!acc[metric.metric_type]) {
          acc[metric.metric_type] = [];
        }
        acc[metric.metric_type].push(metric);
        return acc;
      }, {});
      
      setMetrics(processed || {});
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'destructive';
      case 'staging':
        return 'warning';
      case 'development':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Deployment Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage application deployments</p>
      </div>

      {/* Deployment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments.length > 0
                ? Math.round((deployments.filter(d => d.status === 'success').length / deployments.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Supabase, Vercel, GitHub</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Deploy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {deployments[0] 
                ? new Date(deployments[0].deployed_at).toLocaleString()
                : 'No deployments'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <Tabs value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="staging">Staging</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">Loading deployments...</div>
            ) : deployments.length === 0 ? (
              <Alert>
                <AlertDescription>No deployments found</AlertDescription>
              </Alert>
            ) : (
              deployments.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{deployment.version}</span>
                        <Badge variant={getEnvironmentColor(deployment.environment)}>
                          {deployment.environment}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deployment.commit_hash?.substring(0, 7)} • {new Date(deployment.deployed_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={deployment.status === 'success' ? 'default' : 'destructive'}>
                    {deployment.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}