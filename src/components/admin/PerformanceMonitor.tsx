import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Activity, Zap, Database, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PerformanceMonitor() {
  const { stats, clearMetrics } = usePerformanceMetrics();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Force re-render to update stats
      setAutoRefresh(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (time: number) => {
    if (time < 100) return 'text-green-500';
    if (time < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Performance Monitor</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={clearMetrics}>
            Clear Metrics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg API Time</CardTitle>
            <Database className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(stats.avgApiTime)}`}>
              {stats.avgApiTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Database queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Render Time</CardTitle>
            <Eye className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(stats.avgRenderTime)}`}>
              {stats.avgRenderTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Component rendering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalRequests}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracked operations
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.slowestRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Slowest Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{stats.slowestRequest.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(stats.slowestRequest.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="destructive">
                {stats.slowestRequest.duration.toFixed(0)}ms
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.recentMetrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {metric.type}
                  </Badge>
                  <span className={getStatusColor(metric.duration)}>
                    {metric.duration.toFixed(0)}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
