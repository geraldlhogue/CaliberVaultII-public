import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, CheckCircle, XCircle, Clock, GitBranch, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Deployment {
  id: string;
  environment: 'production' | 'staging' | 'development';
  status: 'success' | 'failed' | 'pending' | 'running';
  branch: string;
  commit: string;
  timestamp: string;
  duration?: number;
  url?: string;
}

export function DeploymentDashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      environment: 'production',
      status: 'success',
      branch: 'main',
      commit: 'abc123f',
      timestamp: '2 hours ago',
      duration: 245,
      url: 'https://app.calibervault.com'
    },
    {
      id: '2',
      environment: 'staging',
      status: 'running',
      branch: 'develop',
      commit: 'def456a',
      timestamp: '5 minutes ago'
    }
  ]);
  const { toast } = useToast();

  const deploy = (environment: string, branch: string) => {
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      environment: environment as any,
      status: 'running',
      branch,
      commit: Math.random().toString(36).substring(7),
      timestamp: 'just now'
    };

    setDeployments([newDeployment, ...deployments]);

    toast({
      title: 'Deployment Started',
      description: `Deploying ${branch} to ${environment}...`
    });

    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { ...d, status: 'success', duration: 180 }
          : d
      ));
      
      toast({
        title: 'Deployment Complete',
        description: `Successfully deployed to ${environment}`
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Deployment Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Production</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => deploy('production', 'main')}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deploy to Production
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Staging</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => deploy('staging', 'develop')}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deploy to Staging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Development</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => deploy('development', 'feature/*')}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deploy to Dev
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments.map(deployment => (
              <div key={deployment.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(deployment.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge>{deployment.environment}</Badge>
                      <span className="text-sm font-medium">{deployment.branch}</span>
                      <span className="text-sm text-muted-foreground">#{deployment.commit}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{deployment.timestamp}</p>
                  </div>
                </div>
                {deployment.url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
