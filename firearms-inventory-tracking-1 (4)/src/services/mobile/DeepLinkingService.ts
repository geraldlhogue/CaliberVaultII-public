import { App } from '@capacitor/app';

export interface DeepLinkData {
  url: string;
  path: string;
  params: Record<string, string>;
}

export class DeepLinkingService {
  private static listeners: ((data: DeepLinkData) => void)[] = [];

  static initialize() {
    if (typeof window === 'undefined') return;

    try {
      App.addListener('appUrlOpen', (event: any) => {
        const url = event.url;
        const parsed = this.parseDeepLink(url);
        this.notifyListeners(parsed);
      });
    } catch (error) {
      console.warn('Deep linking not available (web mode):', error);
    }
  }

  static parseDeepLink(url: string): DeepLinkData {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const params: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return { url, path, params };
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return { url, path: '/', params: {} };
    }
  }

  static addListener(callback: (data: DeepLinkData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static notifyListeners(data: DeepLinkData) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in deep link listener:', error);
      }
    });
  }

  static createDeepLink(path: string, params?: Record<string, string>): string {
    const base = 'calibervault://';
    const searchParams = new URLSearchParams(params);
    return `${base}${path}${params ? '?' + searchParams.toString() : ''}`;
  }

  static async openExternalUrl(url: string) {
    try {
      await App.openUrl({ url });
    } catch (error) {
      console.error('Error opening URL:', error);
      window.open(url, '_blank');
    }
  }
}
