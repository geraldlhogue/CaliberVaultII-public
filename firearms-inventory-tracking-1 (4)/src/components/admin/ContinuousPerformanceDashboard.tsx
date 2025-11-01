import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { continuousMonitor, PerformanceAlert } from '@/lib/continuousPerformanceMonitoring';
import { Activity, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export function ContinuousPerformanceDashboard() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const unsubscribe = continuousMonitor.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50));
    });

    return unsubscribe;
  }, []);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      continuousMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      continuousMonitor.startMonitoring(30000);
      setIsMonitoring(true);
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Continuous Performance Monitoring</h2>
          <p className="text-muted-foreground">Real-time performance tracking and alerts</p>
        </div>
        <Button onClick={toggleMonitoring} variant={isMonitoring ? 'destructive' : 'default'}>
          <Activity className="mr-2 h-4 w-4" />
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedAlerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.slice(0, 10).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {alert.resolved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className={`h-5 w-5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                  )}
                  <div>
                    <div className="font-medium">{alert.metric}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.value.toFixed(2)}ms (threshold: {alert.threshold}ms)
                    </div>
                  </div>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContinuousPerformanceDashboard;
