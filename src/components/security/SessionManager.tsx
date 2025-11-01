import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, MapPin, Calendar, X } from 'lucide-react';
import { SecurityService, UserSession } from '@/services/security/SecurityService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function SessionManager() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    const { data } = await SecurityService.getSessions();
    setSessions(data || []);
    setLoading(false);
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      await SecurityService.revokeSession(sessionId);
      toast.success('Session revoked');
      loadSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Revoke all other sessions? You will remain logged in on this device.')) return;
    try {
      const currentSession = sessions[0]?.id;
      await SecurityService.revokeAllSessions(currentSession);
      toast.success('All other sessions revoked');
      loadSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage devices with access to your account</CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" onClick={handleRevokeAll}>
              Revoke All Others
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex gap-4">
                <div className="mt-1">
                  {session.device_type === 'mobile' ? (
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {session.browser} on {session.os}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary">Current Session</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {session.ip_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.ip_address}
                        {session.location && ` • ${session.location}`}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last active {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
              {index !== 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRevoke(session.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active sessions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
