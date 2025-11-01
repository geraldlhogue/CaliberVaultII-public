import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { Activity, Zap, Database, Eye, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function EnhancedPerformanceMonitor() {
  const { stats, clearMetrics } = usePerformanceMetrics();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dbStats, setDbStats] = useState<any>(null);
  const [queryPerformance, setQueryPerformance] = useState<any[]>([]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDatabaseStats();
      setAutoRefresh(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchDatabaseStats = async () => {
    try {
      // Get table sizes and row counts
      const { data: inventory } = await supabase.from('inventory').select('id', { count: 'exact', head: true });
      const { data: firearms } = await supabase.from('firearms_details').select('id', { count: 'exact', head: true });
      const { data: ammo } = await supabase.from('ammunition_details').select('id', { count: 'exact', head: true });
      
      setDbStats({
        inventoryCount: inventory?.length || 0,
        firearmsCount: firearms?.length || 0,
        ammoCount: ammo?.length || 0,
        totalRecords: (inventory?.length || 0) + (firearms?.length || 0) + (ammo?.length || 0)
      });
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  };

  const getStatusColor = (time: number) => {
    if (time < 100) return 'text-green-500';
    if (time < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = () => {
    if (stats.avgApiTime < 100) return { label: 'Excellent', color: 'bg-green-500' };
    if (stats.avgApiTime < 300) return { label: 'Good', color: 'bg-blue-500' };
    if (stats.avgApiTime < 500) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Enhanced Performance Monitor</h2>
          <p className="text-sm text-slate-400">Real-time database and application metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={clearMetrics}>Clear Metrics</Button>
        </div>
      </div>

      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          System Health: <Badge className={health.color}>{health.label}</Badge>
          {stats.avgApiTime > 500 && ' - Consider optimizing slow queries'}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg API Time</CardTitle>
            <Database className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(stats.avgApiTime)}`}>
              {stats.avgApiTime.toFixed(0)}ms
            </div>
            <Progress value={Math.min((stats.avgApiTime / 1000) * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Render</CardTitle>
            <Eye className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(stats.avgRenderTime)}`}>
              {stats.avgRenderTime.toFixed(0)}ms
            </div>
            <Progress value={Math.min((stats.avgRenderTime / 500) * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalRequests}</div>
            <p className="text-xs text-slate-500 mt-1">Tracked operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">DB Records</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dbStats?.totalRecords || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Total in inventory</p>
          </CardContent>
        </Card>
      </div>

      {dbStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Database Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Inventory Items</span>
              <Badge>{dbStats.inventoryCount}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Firearms Details</span>
              <Badge>{dbStats.firearmsCount}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ammunition Details</span>
              <Badge>{dbStats.ammoCount}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.slowestRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Slowest Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{stats.slowestRequest.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(stats.slowestRequest.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="destructive">{stats.slowestRequest.duration.toFixed(0)}ms</Badge>
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
                  <Badge variant="outline" className="text-xs">{metric.type}</Badge>
                  <span className={getStatusColor(metric.duration)}>{metric.duration.toFixed(0)}ms</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
