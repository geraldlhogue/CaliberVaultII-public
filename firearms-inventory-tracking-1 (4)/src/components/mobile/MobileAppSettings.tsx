import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Bell, Fingerprint, Camera, Wifi, Download } from 'lucide-react';
import { capacitorBridge } from '@/lib/capacitorBridge';
import { biometricAuthService } from '@/services/mobile/BiometricAuthService';
import { pushNotificationService } from '@/services/mobile/PushNotificationService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function MobileAppSettings() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState('web');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkMobileFeatures();
  }, []);

  const checkMobileFeatures = async () => {
    const native = capacitorBridge.isNative();
    setIsNative(native);
    setPlatform(capacitorBridge.getPlatform());

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const available = await biometricAuthService.isAvailable();
      setBiometricAvailable(available);
      
      const enabled = await biometricAuthService.isEnabled(user.id);
      setBiometricEnabled(enabled);
    }
  };

  const toggleBiometric = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (biometricEnabled) {
        await biometricAuthService.disable(user.id);
        setBiometricEnabled(false);
        toast.success('Biometric authentication disabled');
      } else {
        const result = await biometricAuthService.enable(user.id, user.email || '');
        if (result.success) {
          setBiometricEnabled(true);
          toast.success('Biometric authentication enabled');
        } else {
          toast.error(result.error || 'Failed to enable biometric');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePushNotifications = async () => {
    setLoading(true);
    try {
      if (pushEnabled) {
        setPushEnabled(false);
        toast.success('Push notifications disabled');
      } else {
        await pushNotificationService.initialize();
        setPushEnabled(true);
        toast.success('Push notifications enabled');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile App Settings
          </CardTitle>
          <CardDescription>
            Configure native mobile app features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>App Platform</Label>
              <p className="text-sm text-muted-foreground">
                {isNative ? `Native ${platform}` : 'Web Browser'}
              </p>
            </div>
            <Badge variant={isNative ? 'default' : 'secondary'}>
              {platform.toUpperCase()}
            </Badge>
          </div>

          {biometricAvailable && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="biometric" className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  Biometric Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use Face ID or Touch ID to login
                </p>
              </div>
              <Switch
                id="biometric"
                checked={biometricEnabled}
                onCheckedChange={toggleBiometric}
                disabled={loading}
              />
            </div>
          )}

          {isNative && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="push" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts and updates
                </p>
              </div>
              <Switch
                id="push"
                checked={pushEnabled}
                onCheckedChange={togglePushNotifications}
                disabled={loading}
              />
            </div>
          )}

          <div className="pt-4 border-t space-y-4">
            <h4 className="font-medium">Available Features</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4 text-green-500" />
                <span>Native Camera</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="w-4 h-4 text-green-500" />
                <span>Offline Mode</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Download className="w-4 h-4 text-green-500" />
                <span>Background Sync</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-green-500" />
                <span>Local Notifications</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
