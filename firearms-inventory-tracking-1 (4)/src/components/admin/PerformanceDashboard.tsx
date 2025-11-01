import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { coreWebVitals, CoreWebVitalsMetrics } from '@/lib/coreWebVitals';
import { performanceMonitor } from '@/lib/performanceMonitoring';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

export function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<CoreWebVitalsMetrics>({});
  const [perfSummary, setPerfSummary] = useState<any>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setWebVitals(coreWebVitals.getMetrics());
      setPerfSummary(performanceMonitor.getSummary());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating?: string) => {
    if (!rating) return 'bg-gray-500';
    if (rating === 'good') return 'bg-green-500';
    if (rating === 'needs-improvement') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValue = (name: string, value?: number) => {
    if (!value) return 'N/A';
    if (name === 'CLS') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'].map((metric) => {
          const data = webVitals[metric as keyof CoreWebVitalsMetrics];
          return (
            <Card key={metric}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{metric}</span>
                  <Badge className={getRatingColor(data?.rating)}>
                    {data?.rating || 'pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metric, data?.value)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Operation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Operation Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(perfSummary).slice(0, 10).map(([op, data]: [string, any]) => (
              <div key={op} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{op}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">Avg: {data.average?.toFixed(0)}ms</span>
                  <span className="text-slate-400">Count: {data.count}</span>
                  <Badge variant={data.average > 1000 ? 'destructive' : 'secondary'}>
                    {data.average > 1000 ? 'Slow' : 'Fast'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• LCP should be under 2.5s for good user experience</li>
            <li>• FID should be under 100ms for responsive interactions</li>
            <li>• CLS should be under 0.1 to avoid layout shifts</li>
            <li>• Enable browser caching and compression</li>
            <li>• Use lazy loading for images and components</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
