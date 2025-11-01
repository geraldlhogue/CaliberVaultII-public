import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Gauge, Upload, Download, Clock, Save } from 'lucide-react';
import { EnhancedCloudStorageService, BandwidthSettings } from '@/services/integrations/EnhancedCloudStorageService';
import { toast } from 'sonner';

interface Props {
  connectionId: string;
}

export function BandwidthController({ connectionId }: Props) {
  const [settings, setSettings] = useState<BandwidthSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLimit, setUploadLimit] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(10);
  const [throttleEnabled, setThrottleEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [connectionId]);

  const loadSettings = async () => {
    try {
      const data = await EnhancedCloudStorageService.getBandwidthSettings(connectionId);
      if (data) {
        setSettings(data);
        setUploadLimit(data.max_upload_mbps || 10);
        setDownloadLimit(data.max_download_mbps || 10);
        setThrottleEnabled(data.throttle_enabled);
      }
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await EnhancedCloudStorageService.updateBandwidthSettings(connectionId, {
        max_upload_mbps: uploadLimit,
        max_download_mbps: downloadLimit,
        throttle_enabled: throttleEnabled
      });
      toast.success('Bandwidth settings saved');
      loadSettings();
    } catch (error: any) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Bandwidth Control
        </CardTitle>
        <CardDescription>
          Control upload and download speeds to manage network usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Bandwidth Throttling</Label>
            <p className="text-sm text-muted-foreground">
              Limit sync speeds to reduce network impact
            </p>
          </div>
          <Switch
            checked={throttleEnabled}
            onCheckedChange={setThrottleEnabled}
          />
        </div>

        {throttleEnabled && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Speed Limit
                </Label>
                <span className="text-sm font-medium">{uploadLimit} Mbps</span>
              </div>
              <Slider
                value={[uploadLimit]}
                onValueChange={([value]) => setUploadLimit(value)}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum upload speed: {uploadLimit} Mbps ({(uploadLimit / 8).toFixed(1)} MB/s)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Speed Limit
                </Label>
                <span className="text-sm font-medium">{downloadLimit} Mbps</span>
              </div>
              <Slider
                value={[downloadLimit]}
                onValueChange={([value]) => setDownloadLimit(value)}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum download speed: {downloadLimit} Mbps ({(downloadLimit / 8).toFixed(1)} MB/s)
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled Throttling
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure different speed limits for specific times (coming soon)
              </p>
              <Button variant="outline" size="sm" disabled>
                Add Schedule
              </Button>
            </div>
          </>
        )}

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Current Network Usage</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Upload</p>
              <p className="text-lg font-semibold">0.0 MB/s</p>
            </div>
            <div>
              <p className="text-muted-foreground">Download</p>
              <p className="text-lg font-semibold">0.0 MB/s</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
