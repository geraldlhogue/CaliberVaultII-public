// Mobile Enhancements Component
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { backgroundSyncService } from '@/services/mobile/BackgroundSyncService';
import { pushNotificationService } from '@/services/mobile/PushNotificationService';
import { useToast } from '@/hooks/use-toast';

export function MobileEnhancements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    initializeMobileFeatures();
    const cleanup = setupListeners();
    return cleanup;
  }, [user]);

  const initializeMobileFeatures = async () => {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      const { Keyboard } = await import('@capacitor/keyboard');

      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      Keyboard.setAccessoryBarVisible({ isVisible: true });

      if (user) {
        await pushNotificationService.initialize(user.id);
        pushNotificationService.onNotification((notification) => {
          toast({ title: notification.title, description: notification.body });
        });
        await backgroundSyncService.startBackgroundSync(user.id);
      }
    } catch (error) {
      console.error('Mobile initialization failed:', error);
    }
  };

  const setupListeners = () => {
    const listeners: Array<() => void> = [];

    (async () => {
      try {
        const { Network } = await import('@capacitor/network');
        const { App } = await import('@capacitor/app');

        Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
          toast({
            title: status.connected ? 'Back online' : 'Offline',
            description: status.connected ? 'Syncing data...' : 'Changes will sync when back online',
          });
        });

        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive && user) {
            backgroundSyncService.startBackgroundSync(user.id);
          }
        });

        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          }
        });
      } catch {}
    })();

    return () => {
      listeners.forEach(cleanup => cleanup());
      backgroundSyncService.stopBackgroundSync();
    };
  };

  return null;
}
