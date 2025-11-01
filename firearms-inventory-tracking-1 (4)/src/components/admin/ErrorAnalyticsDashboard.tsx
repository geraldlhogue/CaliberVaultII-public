import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Clock, Activity } from 'lucide-react';
import { getErrorLogs } from '@/lib/errorHandler';

export const ErrorAnalyticsDashboard: React.FC = () => {
  const logs = getErrorLogs();

  const analytics = useMemo(() => {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;

    const recent24h = logs.filter(l => l.timestamp > last24h);
    const recent7d = logs.filter(l => l.timestamp > last7d);

    // Group by component
    const byComponent = logs.reduce((acc, log) => {
      const comp = log.context?.component || 'Unknown';
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by severity
    const bySeverity = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most common errors
    const byMessage = logs.reduce((acc, log) => {
      acc[log.message] = (acc[log.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(byMessage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      total: logs.length,
      last24h: recent24h.length,
      last7d: recent7d.length,
      byComponent,
      bySeverity,
      topErrors
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.last24h}</div>
            <p className="text-xs text-muted-foreground">Recent errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.last7d}</div>
            <p className="text-xs text-muted-foreground">Weekly total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {analytics.bySeverity.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topErrors.map(([message, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                <span className="text-sm truncate flex-1">{message}</span>
                <Badge variant="secondary">{count}x</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Component */}
      <Card>
        <CardHeader>
          <CardTitle>Errors by Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.byComponent)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([component, count]) => (
                <div key={component} className="flex items-center justify-between">
                  <span className="text-sm">{component}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(count / analytics.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
