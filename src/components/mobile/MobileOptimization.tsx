import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Wifi, Camera, Share2, Vibrate, CheckCircle } from 'lucide-react';
import { mobileBridge } from '@/lib/mobileBridge';
import { toast } from 'sonner';

export function MobileOptimization() {
  const [isNative, setIsNative] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    notifications: false,
  });

  useEffect(() => {
    setIsNative(mobileBridge.isNative);
    
    // Check permissions
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then(result => {
        setPermissions(prev => ({ ...prev, camera: result.state === 'granted' }));
      }).catch(() => {});
    }
  }, []);

  const handleRequestCamera = async () => {
    const granted = await mobileBridge.requestCameraPermission();
    setPermissions(prev => ({ ...prev, camera: granted }));
    toast.success(granted ? 'Camera permission granted' : 'Camera permission denied');
  };

  const handleScanBarcode = async () => {
    const barcode = await mobileBridge.scanBarcode();
    if (barcode) {
      toast.success(`Scanned: ${barcode}`);
    } else {
      toast.info('Scan cancelled or failed');
    }
  };

  const handleShare = async () => {
    const success = await mobileBridge.shareData({
      title: 'Arsenal Command',
      text: 'Check out my firearms inventory!',
      url: window.location.href,
    });
    toast.success(success ? 'Shared successfully' : 'Share cancelled');
  };

  const handleVibrate = () => {
    mobileBridge.vibrate([100, 50, 100]);
    toast.info('Vibration triggered');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Mobile App Features
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enhanced mobile capabilities and optimizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={isNative ? 'bg-green-900/20 border-green-700' : 'bg-blue-900/20 border-blue-700'}>
            <CheckCircle className={`h-4 w-4 ${isNative ? 'text-green-400' : 'text-blue-400'}`} />
            <AlertDescription className="text-slate-300">
              {isNative ? (
                <strong>Running in Native Mobile App</strong>
              ) : (
                <strong>Running in Web Browser (PWA Mode)</strong>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera & Barcode Scanner
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Native camera integration for barcode scanning
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRequestCamera}
                  variant="outline"
                  size="sm"
                  disabled={permissions.camera}
                >
                  {permissions.camera ? '✓ Granted' : 'Request Permission'}
                </Button>
                <Button 
                  onClick={handleScanBarcode}
                  size="sm"
                  disabled={!permissions.camera}
                >
                  Scan Barcode
                </Button>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Native Share
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Share inventory data using native share sheet
              </p>
              <Button onClick={handleShare} size="sm">
                Test Share
              </Button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Vibrate className="h-5 w-5" />
                Haptic Feedback
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Vibration feedback for user interactions
              </p>
              <Button onClick={handleVibrate} size="sm">
                Test Vibration
              </Button>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Offline Mode
              </h4>
              <p className="text-slate-400 text-sm mb-3">
                Full offline functionality with automatic sync
              </p>
              <Badge variant="outline" className="text-green-400 border-green-400">
                ✓ Enabled
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-white font-semibold mb-2">Mobile Optimizations</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <span>Touch-optimized UI with larger tap targets</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <span>Responsive grid layouts for all screen sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <span>Gesture support (swipe, pinch-to-zoom)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <span>Battery-efficient background sync</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                <span>Reduced data usage with smart caching</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
