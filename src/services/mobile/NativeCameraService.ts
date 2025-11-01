// Native Camera Service with Barcode Scanning
export interface CameraOptions {
  source?: 'camera' | 'gallery';
  quality?: number;
  allowEditing?: boolean;
}

export interface ScanResult {
  success: boolean;
  barcode?: string;
  format?: string;
  error?: string;
}

class NativeCameraService {
  private isCapacitorAvailable() {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  async checkPermissions() {
    if (!this.isCapacitorAvailable()) return false;
    try {
      const { Camera } = await import('@capacitor/camera');
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch {
      return false;
    }
  }

  async requestPermissions() {
    if (!this.isCapacitorAvailable()) return false;
    try {
      const { Camera } = await import('@capacitor/camera');
      const result = await Camera.requestPermissions();
      return result.camera === 'granted' && result.photos === 'granted';
    } catch {
      return false;
    }
  }

  async takePicture(options: CameraOptions = {}) {
    if (!this.isCapacitorAvailable()) {
      throw new Error('Camera not available on web');
    }

    const hasPermission = await this.checkPermissions() || await this.requestPermissions();
    if (!hasPermission) throw new Error('Camera permission denied');

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const image = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: CameraResultType.DataUrl,
      source: options.source === 'gallery' ? CameraSource.Photos : CameraSource.Camera,
    });

    return image.dataUrl!;
  }

  async scanBarcode(): Promise<ScanResult> {
    if (!this.isCapacitorAvailable()) {
      return { success: false, error: 'Barcode scanner not available on web' };
    }

    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (!status.granted) {
        return { success: false, error: 'Camera permission denied' };
      }

      await BarcodeScanner.prepare();
      document.body.classList.add('scanner-active');
      
      const result = await BarcodeScanner.startScan();
      document.body.classList.remove('scanner-active');

      if (result.hasContent) {
        return { success: true, barcode: result.content, format: result.format };
      }

      return { success: false, error: 'No barcode detected' };
    } catch (error: any) {
      document.body.classList.remove('scanner-active');
      return { success: false, error: error.message };
    }
  }

  async stopScan() {
    if (!this.isCapacitorAvailable()) return;
    try {
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
    } catch {}
  }
}

export const nativeCameraService = new NativeCameraService();
