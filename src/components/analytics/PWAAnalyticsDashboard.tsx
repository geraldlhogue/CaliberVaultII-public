import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Download, Users, TrendingUp, Smartphone, Wifi, WifiOff } from 'lucide-react';

export function PWAAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [installData, engagementData, featureData, abTestData] = await Promise.all([
        supabase.from('pwa_install_events').select('*'),
        supabase.from('pwa_engagement_metrics').select('*'),
        supabase.from('pwa_feature_adoption').select('*'),
        supabase.from('pwa_ab_test_variants').select('*')
      ]);

      const installs = installData.data || [];
      const engagement = engagementData.data || [];
      const features = featureData.data || [];

      const promptsShown = installs.filter(e => e.event_type === 'prompt_shown').length;
      const promptsAccepted = installs.filter(e => e.event_type === 'prompt_accepted').length;
      const installed = installs.filter(e => e.event_type === 'installed').length;
      
      const pwaUsers = engagement.filter(e => e.is_pwa).length;
      const webUsers = engagement.filter(e => !e.is_pwa).length;
      
      const avgOfflineTime = engagement.reduce((sum, e) => sum + (e.offline_time_seconds || 0), 0) / engagement.length || 0;

      setMetrics({
        installRate: promptsShown > 0 ? ((installed / promptsShown) * 100).toFixed(1) : 0,
        acceptanceRate: promptsShown > 0 ? ((promptsAccepted / promptsShown) * 100).toFixed(1) : 0,
        totalInstalls: installed,
        pwaUsers,
        webUsers,
        avgOfflineTime: Math.round(avgOfflineTime),
        topFeatures: features.slice(0, 5),
        abTests: abTestData.data || []
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">PWA Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Install Rate</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.installRate}%</div>
            <p className="text-xs text-muted-foreground">{metrics?.totalInstalls} total installs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">Prompt to acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PWA vs Web</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pwaUsers}/{metrics?.webUsers}</div>
            <p className="text-xs text-muted-foreground">PWA vs Web users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Offline Time</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgOfflineTime}s</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>A/B Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.abTests.map((test: any) => (
              <div key={test.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{test.variant_name}</div>
                  <div className="text-sm text-muted-foreground">{test.prompt_title}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{test.traffic_percentage}%</div>
                  <div className="text-sm text-muted-foreground">{test.prompt_timing}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
