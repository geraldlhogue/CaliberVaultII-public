import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { EmailService, EmailDeliveryLog } from '@/services/email/EmailService';
import { toast } from '@/hooks/use-toast';

export function EmailDeliveryDashboard() {
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await EmailService.getDeliveryLogs();
      setLogs(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load delivery logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    delivered: logs.filter(l => l.status === 'delivered').length,
    opened: logs.filter(l => l.opened_at).length,
    clicked: logs.filter(l => l.clicked_at).length,
    bounced: logs.filter(l => l.status === 'bounced').length
  };

  const openRate = stats.delivered > 0 
    ? ((stats.opened / stats.delivered) * 100).toFixed(1)
    : '0';
  
  const clickRate = stats.opened > 0
    ? ((stats.clicked / stats.opened) * 100).toFixed(1)
    : '0';

  if (loading) {
    return <div>Loading delivery logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Delivery Analytics</h2>
        <p className="text-muted-foreground">
          Track email delivery, opens, and engagement
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Opened
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.opened}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {openRate}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicked}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clickRate}% click rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Bounced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bounced}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.slice(0, 20).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.to_email}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.trigger_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'delivered' ? 'default' :
                        log.status === 'bounced' ? 'destructive' : 'secondary'
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(log.delivered_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.opened_at ? (
                      <span className="text-green-600">
                        {new Date(log.opened_at).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.clicked_at ? (
                      <span className="text-blue-600">
                        {new Date(log.clicked_at).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
