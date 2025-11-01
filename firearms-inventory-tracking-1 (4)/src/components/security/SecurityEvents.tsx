import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { SecurityService, SecurityEvent } from '@/services/security/SecurityService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function SecurityEvents() {
  const [unresolvedEvents, setUnresolvedEvents] = useState<SecurityEvent[]>([]);
  const [resolvedEvents, setResolvedEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const [unresolved, resolved] = await Promise.all([
      SecurityService.getSecurityEvents(false),
      SecurityService.getSecurityEvents(true)
    ]);
    setUnresolvedEvents(unresolved.data || []);
    setResolvedEvents(resolved.data || []);
    setLoading(false);
  };

  const handleResolve = async (eventId: string) => {
    try {
      await SecurityService.resolveSecurityEvent(eventId);
      toast.success('Event resolved');
      loadEvents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const EventList = ({ events, showResolve }: { events: SecurityEvent[], showResolve: boolean }) => (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex gap-4">
            {getSeverityIcon(event.severity)}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{event.event_type}</span>
                <Badge variant={getSeverityColor(event.severity) as any}>
                  {event.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              {event.ip_address && (
                <p className="text-xs text-muted-foreground">IP: {event.ip_address}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {showResolve && (
            <Button size="sm" onClick={() => handleResolve(event.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No {showResolve ? 'unresolved' : 'resolved'} events
        </div>
      )}
    </div>
  );

  if (loading) return <div>Loading events...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events</CardTitle>
        <CardDescription>Monitor and manage security alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unresolved">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unresolved">
              Unresolved ({unresolvedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedEvents.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unresolved" className="mt-4">
            <EventList events={unresolvedEvents} showResolve={true} />
          </TabsContent>
          <TabsContent value="resolved" className="mt-4">
            <EventList events={resolvedEvents} showResolve={false} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
