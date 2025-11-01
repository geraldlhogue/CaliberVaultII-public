import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { APIService, Webhook, WebhookLog } from '@/services/api/APIService';
import { Webhook as WebhookIcon, Plus, Trash2, Play, Eye } from 'lucide-react';

const AVAILABLE_EVENTS = [
  'item.created',
  'item.updated',
  'item.deleted',
  'firearm.created',
  'firearm.updated',
  'ammunition.created',
  'ammunition.updated'
];

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    retry_count: 3,
    timeout_seconds: 30
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const data = await APIService.getWebhooks();
      setWebhooks(data);
    } catch (error: any) {
      toast.error('Failed to load webhooks');
    }
  };

  const handleCreateWebhook = async () => {
    try {
      await APIService.createWebhook(newWebhook);
      await loadWebhooks();
      setShowNewWebhook(false);
      setNewWebhook({ name: '', url: '', events: [], retry_count: 3, timeout_seconds: 30 });
      toast.success('Webhook created successfully');
    } catch (error: any) {
      toast.error('Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      await APIService.deleteWebhook(id);
      await loadWebhooks();
      toast.success('Webhook deleted');
    } catch (error: any) {
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      await APIService.testWebhook(id);
      toast.success('Test webhook sent');
    } catch (error: any) {
      toast.error('Failed to send test webhook');
    }
  };

  const handleViewLogs = async (webhookId: string) => {
    try {
      const logs = await APIService.getWebhookLogs(webhookId);
      setWebhookLogs(logs);
      setSelectedWebhook(webhookId);
    } catch (error: any) {
      toast.error('Failed to load webhook logs');
    }
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <p className="text-muted-foreground">Configure webhooks to receive real-time notifications</p>
        </div>
        <Dialog open={showNewWebhook} onOpenChange={setShowNewWebhook}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Webhook Name</Label>
                <Input
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="My Webhook"
                />
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div>
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newWebhook.events.includes(event)}
                        onCheckedChange={() => toggleEvent(event)}
                      />
                      <label className="text-sm">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Retry Count</Label>
                  <Input
                    type="number"
                    value={newWebhook.retry_count}
                    onChange={(e) => setNewWebhook({ ...newWebhook, retry_count: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={newWebhook.timeout_seconds}
                    onChange={(e) => setNewWebhook({ ...newWebhook, timeout_seconds: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateWebhook} 
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
              >
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <WebhookIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <CardDescription>{webhook.url}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                    {webhook.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleTestWebhook(webhook.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleViewLogs(webhook.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteWebhook(webhook.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {webhook.events.map((event) => (
                  <Badge key={event} variant="outline">{event}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedWebhook && (
        <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Webhook Logs</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={log.delivered_at ? 'default' : 'destructive'}>
                        {log.delivered_at ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm"><strong>Event:</strong> {log.event_type}</p>
                    <p className="text-sm"><strong>Attempt:</strong> {log.attempt_number}</p>
                    {log.response_status && (
                      <p className="text-sm"><strong>Status:</strong> {log.response_status}</p>
                    )}
                    {log.error_message && (
                      <p className="text-sm text-red-600"><strong>Error:</strong> {log.error_message}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
