import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { CloudStorageService, CloudConnection } from '@/services/integrations/CloudStorageService';
import { toast } from 'sonner';

export function CloudStorageManager() {
  const [connections, setConnections] = useState<CloudConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await CloudStorageService.getConnections();
      setConnections(data);
    } catch (error: any) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      const email = prompt(`Enter your ${provider} email:`);
      if (!email) return;

      await CloudStorageService.connectProvider(provider, email);
      toast.success(`Connected to ${provider}`);
      loadConnections();
    } catch (error: any) {
      toast.error('Failed to connect');
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      await CloudStorageService.syncNow(connectionId);
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
      await CloudStorageService.deleteConnection(connectionId);
      toast.success('Disconnected');
      loadConnections();
    } catch (error: any) {
      toast.error('Failed to disconnect');
    }
  };

  const providers = [
    { id: 'google_drive', name: 'Google Drive', icon: '🔵' },
    { id: 'dropbox', name: 'Dropbox', icon: '🔷' },
    { id: 'onedrive', name: 'OneDrive', icon: '🔶' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map(provider => (
          <Card key={provider.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{provider.icon}</span>
                {provider.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleConnect(provider.id)}
                className="w-full"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Cloud className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{conn.provider}</p>
                      <p className="text-sm text-muted-foreground">{conn.account_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(conn.id)}
                      disabled={syncing === conn.id}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing === conn.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(conn.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
