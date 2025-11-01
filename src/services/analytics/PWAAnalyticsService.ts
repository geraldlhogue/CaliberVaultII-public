import { supabase } from '@/lib/supabase';

export interface InstallEvent {
  eventType: 'prompt_shown' | 'prompt_accepted' | 'prompt_dismissed' | 'installed' | 'uninstalled';
  promptVariant?: string;
  promptTiming?: string;
  timeOnSiteSeconds?: number;
  pagesVisited?: number;
  actionsTaken?: number;
}

export interface EngagementMetrics {
  sessionId: string;
  isPWA: boolean;
  isStandalone: boolean;
  sessionDurationSeconds: number;
  pagesViewed: number;
  featuresUsed: string[];
  offlineTimeSeconds?: number;
  syncEvents?: number;
  pushNotificationsReceived?: number;
}

export interface FeatureAdoption {
  featureName: string;
  isPWA: boolean;
}

export class PWAAnalyticsService {
  private static sessionId = crypto.randomUUID();
  private static sessionStart = Date.now();
  private static pagesViewed = 0;
  private static featuresUsed = new Set<string>();
  private static actionsTaken = 0;
  private static offlineStart: number | null = null;
  private static offlineTimeSeconds = 0;

  static async trackInstallEvent(event: InstallEvent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('pwa_install_events').insert({
        user_id: user?.id,
        session_id: this.sessionId,
        event_type: event.eventType,
        prompt_variant: event.promptVariant,
        prompt_timing: event.promptTiming,
        time_on_site_seconds: event.timeOnSiteSeconds || this.getSessionDuration(),
        pages_visited: event.pagesVisited || this.pagesViewed,
        actions_taken: event.actionsTaken || this.actionsTaken,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track install event:', error);
    }
  }

  static async trackEngagement() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const metrics: EngagementMetrics = {
        sessionId: this.sessionId,
        isPWA: this.isPWA(),
        isStandalone: this.isStandalone(),
        sessionDurationSeconds: this.getSessionDuration(),
        pagesViewed: this.pagesViewed,
        featuresUsed: Array.from(this.featuresUsed),
        offlineTimeSeconds: this.offlineTimeSeconds,
        syncEvents: 0,
        pushNotificationsReceived: 0
      };

      const { error } = await supabase.from('pwa_engagement_metrics').insert({
        user_id: user.id,
        session_id: metrics.sessionId,
        is_pwa: metrics.isPWA,
        is_standalone: metrics.isStandalone,
        session_duration_seconds: metrics.sessionDurationSeconds,
        pages_viewed: metrics.pagesViewed,
        features_used: metrics.featuresUsed,
        offline_time_seconds: metrics.offlineTimeSeconds,
        sync_events: metrics.syncEvents,
        push_notifications_received: metrics.pushNotificationsReceived
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }

  static async trackFeatureUsage(feature: FeatureAdoption) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      this.featuresUsed.add(feature.featureName);

      const { error } = await supabase.from('pwa_feature_adoption').upsert({
        user_id: user.id,
        feature_name: feature.featureName,
        is_pwa: feature.isPWA,
        usage_count: 1,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name',
        ignoreDuplicates: false
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track feature usage:', error);
    }
  }

  static trackPageView() {
    this.pagesViewed++;
  }

  static trackAction() {
    this.actionsTaken++;
  }

  static startOfflineTracking() {
    if (!this.offlineStart) {
      this.offlineStart = Date.now();
    }
  }

  static stopOfflineTracking() {
    if (this.offlineStart) {
      this.offlineTimeSeconds += Math.floor((Date.now() - this.offlineStart) / 1000);
      this.offlineStart = null;
    }
  }

  private static getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }

  private static isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  private static isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  private static getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private static getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private static getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Other';
  }

  static async getABTestVariant(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('pwa_ab_test_variants')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      const random = Math.random() * 100;
      let cumulative = 0;

      for (const variant of data) {
        cumulative += variant.traffic_percentage;
        if (random <= cumulative) {
          return variant;
        }
      }

      return data[0];
    } catch (error) {
      console.error('Failed to get AB test variant:', error);
      return null;
    }
  }
}
