// Push Notification Service
import { supabase } from '@/lib/supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}

class PushNotificationService {
  private token: string | null = null;
  private listeners: Array<(notification: any) => void> = [];

  private isCapacitorAvailable() {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  async initialize(userId: string) {
    if (!this.isCapacitorAvailable()) return false;

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { Capacitor } = await import('@capacitor/core');
      
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      await PushNotifications.register();

      await PushNotifications.addListener('registration', async (token: any) => {
        this.token = token.value;
        await this.saveToken(userId, token.value, Capacitor.getPlatform());
      });

      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        this.listeners.forEach(listener => listener(notification));
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('Push action performed:', action);
      });

      return true;
    } catch (error) {
      console.error('Push notification initialization failed:', error);
      return false;
    }
  }

  private async saveToken(userId: string, token: string, platform: string) {
    try {
      await supabase.from('push_tokens').upsert({
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  onNotification(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async getDeliveredNotifications() {
    if (!this.isCapacitorAvailable()) return [];
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications;
    } catch {
      return [];
    }
  }

  async removeAllDeliveredNotifications() {
    if (!this.isCapacitorAvailable()) return;
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.removeAllDeliveredNotifications();
    } catch {}
  }
}

export const pushNotificationService = new PushNotificationService();
