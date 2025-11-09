import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, Wifi, Image, Zap, Download, Settings, 
  CheckCircle, XCircle, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { SyncQueueViewer } from './SyncQueueViewer';
import { OfflineIndicator } from './OfflineIndicator';
import { isWebPSupported } from '@/utils/imageOptimization';

export function MobileOptimizationDashboard() {
  const [metrics, setMetrics] = useState({
    isOnline: navigator.onLine,
    isInstalled: false,
    cacheSize: 0,
    webpSupported: isWebPSupported(),
    serviceWorkerActive: false,
    notificationsEnabled: false
  });

  useEffect(() => {
    checkMetrics();
  }, []);

  const checkMetrics = async () => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const swActive = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    const notifEnabled = 'Notification' in window && Notification.permission === 'granted';

    let cacheSize = 0;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      cacheSize = estimate.usage || 0;
    }

    setMetrics({
      isOnline: navigator.onLine,
      isInstalled,
      cacheSize,
      webpSupported: isWebPSupported(),
      serviceWorkerActive: swActive,
      notificationsEnabled: notifEnabled
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mobile Optimization</h1>
        <OfflineIndicator />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Sync Queue</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Connection</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {metrics.isOnline ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {metrics.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {metrics.isInstalled ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {metrics.isInstalled ? 'Installed' : 'Not Installed'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(metrics.cacheSize)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FeatureStatus label="Service Worker" enabled={metrics.serviceWorkerActive} />
              <FeatureStatus label="WebP Images" enabled={metrics.webpSupported} />
              <FeatureStatus label="Push Notifications" enabled={metrics.notificationsEnabled} />
              <FeatureStatus label="Background Sync" enabled={'sync' in ServiceWorkerRegistration.prototype} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <SyncQueueViewer />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkMetrics} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Metrics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeatureStatus({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    </div>
  );
}
