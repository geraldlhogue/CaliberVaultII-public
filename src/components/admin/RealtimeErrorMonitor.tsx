import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Activity, TrendingUp, Clock } from 'lucide-react';
import { getErrorLogs } from '@/lib/errorHandler';

export const RealtimeErrorMonitor: React.FC = () => {
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [errorRate, setErrorRate] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const updateErrors = () => {
      const logs = getErrorLogs();
      const last5Minutes = Date.now() - 5 * 60 * 1000;
      const recent = logs.filter(log => log.timestamp > last5Minutes);
      
      setRecentErrors(recent.slice(-10));
      setErrorRate(recent.length);
    };

    updateErrors();
    const interval = setInterval(updateErrors, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'error': return 'bg-orange-600';
      case 'warning': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          Real-Time Error Monitor
          <Badge variant={errorRate > 10 ? 'destructive' : 'default'}>
            {errorRate} errors/5min
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No errors detected</p>
              <p className="text-sm">System running smoothly</p>
            </div>
          ) : (
            recentErrors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700"
              >
                <AlertCircle className={`w-4 h-4 mt-0.5 ${
                  error.severity === 'critical' ? 'text-red-500' :
                  error.severity === 'error' ? 'text-orange-500' :
                  'text-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {error.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {error.context?.component} • {new Date(error.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={getSeverityColor(error.severity)}>
                  {error.severity}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
