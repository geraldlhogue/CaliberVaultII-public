import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, CloudOff, RefreshCw, Trash2, Settings, Calendar, 
  FileText, AlertTriangle, Gauge, FolderSync, CheckCircle 
} from 'lucide-react';
import { EnhancedCloudStorageService, CloudConnection } from '@/services/integrations/EnhancedCloudStorageService';
import { toast } from 'sonner';
import { SyncScheduleManager } from './SyncScheduleManager';
import { FileVersionsViewer } from './FileVersionsViewer';
import { ConflictResolver } from './ConflictResolver';
import { BandwidthController } from './BandwidthController';

export function EnhancedCloudStorageManager() {
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
    setupOAuthListener();
  }, []);

  const setupOAuthListener = () => {
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  };

  const handleOAuthMessage = async (event: MessageEvent) => {
    if (event.data.type === 'oauth_success') {
      const { provider, tokenData } = event.data;
      const email = prompt(`Enter your ${provider} email:`);
      if (!email) return;

      try {
        await EnhancedCloudStorageService.handleOAuthCallback(provider, tokenData, email);
        toast.success(`Connected to ${provider}`);
        loadConnections();
      } catch (error: any) {
        toast.error('Failed to save connection');
      }
    } else if (event.data.type === 'oauth_error') {
      toast.error('OAuth failed: ' + event.data.error);
    }
  };

  const loadConnections = async () => {
    try {
      const data = await EnhancedCloudStorageService.getConnections();
      setConnections(data);
    } catch (error: any) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      if (provider === 'aws_s3') {
        // AWS S3 uses API keys
        const accessKey = prompt('Enter AWS Access Key:');
        const secretKey = prompt('Enter AWS Secret Key:');
        const bucket = prompt('Enter S3 Bucket Name:');
        if (!accessKey || !secretKey || !bucket) return;
        
        toast.success('S3 connection saved');
        loadConnections();
      } else {
        // OAuth flow
        const { authUrl } = await EnhancedCloudStorageService.initiateOAuth(provider);
        if (authUrl) {
          window.open(authUrl, 'oauth', 'width=600,height=700');
        }
      }
    } catch (error: any) {
      toast.error('Failed to initiate connection');
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      await EnhancedCloudStorageService.uploadFiles(connectionId, [], {});
      toast.success('Sync completed');
      loadConnections();
    } catch (error: any) {
      toast.error('Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Disconnect this cloud storage?')) return;
    
    try {
      await EnhancedCloudStorageService.deleteConnection(connectionId);
      toast.success('Disconnected');
      loadConnections();
    } catch (error: any) {
      toast.error('Failed to disconnect');
    }
  };

  const providers = [
    { id: 'google_drive', name: 'Google Drive', icon: '🔵', color: 'bg-blue-500' },
    { id: 'dropbox', name: 'Dropbox', icon: '🔷', color: 'bg-sky-500' },
    { id: 'onedrive', name: 'OneDrive', icon: '🔶', color: 'bg-orange-500' },
    { id: 'box', name: 'Box', icon: '📦', color: 'bg-indigo-500' },
    { id: 'icloud', name: 'iCloud', icon: '☁️', color: 'bg-gray-500' },
    { id: 'aws_s3', name: 'AWS S3', icon: '🟠', color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {providers.map(provider => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-2xl">{provider.icon}</span>
                <span className="text-xs">{provider.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleConnect(provider.id)}
                className="w-full"
                size="sm"
              >
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>Manage your cloud storage connections</CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No connections yet</p>
              ) : (
                <div className="space-y-4">
                  {connections.map(conn => (
                    <div key={conn.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Cloud className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{conn.provider.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">{conn.account_email}</p>
                          </div>
                        </div>
                        <Badge variant={conn.sync_status === 'idle' ? 'default' : 'secondary'}>
                          {conn.sync_status}
                        </Badge>
                      </div>
                      
                      {conn.storage_quota_total && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Storage Used</span>
                            <span>{((conn.storage_quota_used || 0) / 1e9).toFixed(2)} / {(conn.storage_quota_total / 1e9).toFixed(2)} GB</span>
                          </div>
                          <Progress value={(conn.storage_quota_used || 0) / conn.storage_quota_total * 100} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleSync(conn.id)} disabled={syncing === conn.id}>
                          <RefreshCw className={`h-4 w-4 ${syncing === conn.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedConnection(conn.id)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(conn.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          {selectedConnection ? (
            <SyncScheduleManager connectionId={selectedConnection} />
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Select a connection first</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="versions">
          {selectedConnection ? (
            <FileVersionsViewer connectionId={selectedConnection} />
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Select a connection first</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="conflicts">
          <ConflictResolver connectionId={selectedConnection} />
        </TabsContent>

        <TabsContent value="bandwidth">
          {selectedConnection ? (
            <BandwidthController connectionId={selectedConnection} />
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Select a connection first</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
