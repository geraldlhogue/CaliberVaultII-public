// Capacitor Native Bridge for iOS and Android
// Gracefully handles missing Capacitor dependencies

class CapacitorBridge {
  private static instance: CapacitorBridge;
  private capacitorAvailable = false;

  private constructor() {
    this.checkCapacitorAvailability();
  }

  static getInstance(): CapacitorBridge {
    if (!CapacitorBridge.instance) {
      CapacitorBridge.instance = new CapacitorBridge();
    }
    return CapacitorBridge.instance;
  }

  private checkCapacitorAvailability() {
    try {
      this.capacitorAvailable = !!(window as any).Capacitor;
    } catch {
      this.capacitorAvailable = false;
    }
  }

  isNative(): boolean {
    return this.capacitorAvailable && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  getPlatform(): string {
    if (!this.capacitorAvailable) return 'web';
    return (window as any).Capacitor?.getPlatform?.() || 'web';
  }

  async takePicture(source: 'camera' | 'gallery' = 'camera'): Promise<string | null> {
    if (!this.capacitorAvailable) {
      console.warn('Capacitor not available');
      return null;
    }
    try {
      const Camera = (window as any).Capacitor?.Plugins?.Camera;
      if (!Camera) return null;
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'DataUrl',
        source: source === 'camera' ? 'CAMERA' : 'PHOTOS'
      });
      return image.dataUrl;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  async saveFile(filename: string, data: string): Promise<string | null> {
    if (!this.capacitorAvailable) return null;
    try {
      const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;
      if (!Filesystem) return null;
      
      const result = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: 'DOCUMENTS',
        encoding: 'UTF8'
      });
      return result.uri;
    } catch (error) {
      console.error('Save file error:', error);
      return null;
    }
  }

  async readFile(filename: string): Promise<string | null> {
    if (!this.capacitorAvailable) return null;
    try {
      const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;
      if (!Filesystem) return null;
      
      const result = await Filesystem.readFile({
        path: filename,
        directory: 'DOCUMENTS',
        encoding: 'UTF8'
      });
      return result.data;
    } catch (error) {
      console.error('Read file error:', error);
      return null;
    }
  }

  async vibrate(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isNative()) return;
    try {
      const Haptics = (window as any).Capacitor?.Plugins?.Haptics;
      if (!Haptics) return;
      
      await Haptics.impact({ style: style.toUpperCase() });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }

  async registerPushNotifications(): Promise<string | null> {
    if (!this.isNative()) return null;
    try {
      const PushNotifications = (window as any).Capacitor?.Plugins?.PushNotifications;
      if (!PushNotifications) return null;

      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token: any) => {
          resolve(token.value);
        });
      });
    } catch (error) {
      console.error('Push notification error:', error);
      return null;
    }
  }

  async setStatusBarStyle(dark: boolean): Promise<void> {
    if (!this.isNative()) return;
    try {
      const StatusBar = (window as any).Capacitor?.Plugins?.StatusBar;
      if (!StatusBar) return;
      
      await StatusBar.setStyle({ style: dark ? 'DARK' : 'LIGHT' });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  }

  hideKeyboard(): void {
    if (!this.isNative()) return;
    try {
      const Keyboard = (window as any).Capacitor?.Plugins?.Keyboard;
      if (!Keyboard) return;
      
      Keyboard.hide();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  }
}

export const capacitorBridge = CapacitorBridge.getInstance();
