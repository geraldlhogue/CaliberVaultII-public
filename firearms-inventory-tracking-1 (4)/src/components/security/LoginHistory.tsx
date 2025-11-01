import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Monitor } from 'lucide-react';
import { SecurityService, LoginAttempt } from '@/services/security/SecurityService';
import { formatDistanceToNow } from 'date-fns';

export function LoginHistory() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    const { data } = await SecurityService.getLoginAttempts();
    setAttempts(data || []);
    setLoading(false);
  };

  if (loading) return <div>Loading login history...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login History</CardTitle>
        <CardDescription>Recent login attempts to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex gap-4">
                <div className="mt-1">
                  {attempt.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{attempt.email}</span>
                    <Badge variant={attempt.success ? 'default' : 'destructive'}>
                      {attempt.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {attempt.ip_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {attempt.ip_address}
                        {attempt.location && ` • ${attempt.location}`}
                      </div>
                    )}
                    {attempt.user_agent && (
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {attempt.user_agent.substring(0, 60)}...
                      </div>
                    )}
                    <div className="text-xs">
                      {formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!attempt.success && attempt.failure_reason && (
                    <div className="text-sm text-red-500">
                      Reason: {attempt.failure_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No login attempts found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
