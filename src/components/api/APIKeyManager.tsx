import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { APIService, APIKey } from '@/services/api/APIService';
import { Key, Copy, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

export function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ name: string; scopes: string[]; rateLimit: number }>({
    name: '',
    scopes: ['read'],
    rateLimit: 1000
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const keys = await APIService.getAPIKeys();
      setApiKeys(keys);
    } catch (error: any) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const result = await APIService.createAPIKey(
        newKeyData.name,
        newKeyData.scopes,
        newKeyData.rateLimit
      );
      setGeneratedKey(result.plainKey);
      await loadAPIKeys();
      toast.success('API key created successfully');
    } catch (error: any) {
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await APIService.deleteAPIKey(id);
      await loadAPIKeys();
      toast.success('API key deleted');
    } catch (error: any) {
      toast.error('Failed to delete API key');
    }
  };

  const handleToggleKey = async (id: string, isActive: boolean) => {
    try {
      await APIService.toggleAPIKey(id, !isActive);
      await loadAPIKeys();
      toast.success(`API key ${!isActive ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Failed to update API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">Manage your API keys for programmatic access</p>
        </div>
        <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    Save this key! It won't be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded text-xs break-all">
                      {generatedKey}
                    </code>
                    <Button size="sm" onClick={() => copyToClipboard(generatedKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={() => {
                  setShowNewKey(false);
                  setGeneratedKey(null);
                  setNewKeyData({ name: '', scopes: ['read'], rateLimit: 1000 });
                }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Key Name</Label>
                  <Input
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                    placeholder="My API Key"
                  />
                </div>
                <div>
                  <Label>Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    value={newKeyData.rateLimit}
                    onChange={(e) => setNewKeyData({ ...newKeyData, rateLimit: parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={handleCreateKey} disabled={!newKeyData.name}>
                  Create Key
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{key.name}</CardTitle>
                    <CardDescription>
                      {key.key_prefix}... • Created {new Date(key.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.is_active ? 'default' : 'secondary'}>
                    {key.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleKey(key.id, key.is_active)}
                  >
                    {key.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rate Limit</p>
                  <p className="font-medium">{key.rate_limit}/hour</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Used</p>
                  <p className="font-medium">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Scopes</p>
                  <p className="font-medium">{key.scopes.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
