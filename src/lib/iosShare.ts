// iOS Share Sheet Integration for PWA

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export const canShare = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

export const shareContent = async (data: ShareData): Promise<boolean> => {
  if (!canShare()) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User cancelled the share
      return false;
    }
    console.error('Share failed:', error);
    return false;
  }
};

export const shareInventoryReport = async (
  reportData: Blob,
  filename: string
): Promise<boolean> => {
  if (!canShare()) {
    // Fallback to download
    const url = URL.createObjectURL(reportData);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  try {
    const file = new File([reportData], filename, { type: reportData.type });
    await navigator.share({
      files: [file],
      title: 'Inventory Report',
      text: 'Arsenal Command Inventory Report',
    });
    return true;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return false;
    }
    console.error('Share failed:', error);
    // Fallback to download
    const url = URL.createObjectURL(reportData);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
};
