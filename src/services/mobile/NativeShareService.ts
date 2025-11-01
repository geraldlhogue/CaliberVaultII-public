// Native Share Service
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: string[];
  dialogTitle?: string;
}

class NativeShareService {
  private isCapacitorAvailable() {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  async canShare(): Promise<boolean> {
    if (!this.isCapacitorAvailable()) {
      return 'share' in navigator;
    }
    return true;
  }

  async share(options: ShareOptions) {
    try {
      const canShare = await this.canShare();
      if (!canShare) {
        throw new Error('Sharing not supported on this device');
      }

      if (this.isCapacitorAvailable()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Share',
        });
      } else {
        if (navigator.share) {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          });
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async shareInventoryItem(item: any) {
    return this.share({
      title: `${item.name} - CaliberVault`,
      text: `Check out this item: ${item.name}`,
      url: window.location.href,
    });
  }

  async shareReport(reportUrl: string, title: string) {
    return this.share({
      title: `${title} - CaliberVault`,
      text: 'View my inventory report',
      url: reportUrl,
    });
  }

  async shareBackup(backupData: string) {
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return this.share({
      title: 'CaliberVault Backup',
      text: 'My inventory backup',
      url,
    });
  }
}

export const nativeShareService = new NativeShareService();
