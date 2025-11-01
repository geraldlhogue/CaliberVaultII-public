import JSZip from 'jszip';
import { InventoryItem } from '../types/inventory';
import { photoStorage } from '../lib/photoStorage';
export interface PhotoExportOptions {
  includeMetadata: boolean;
  metadataInFilename: boolean;
  generateManifest: boolean;
}

export interface PhotoExportProgress {
  current: number;
  total: number;
  itemName: string;
}

const sanitizeFilename = (str: string): string => {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const fetchPhotoAsBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.blob();
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const exportPhotosAsZip = async (
  items: InventoryItem[],
  options: PhotoExportOptions,
  onProgress?: (progress: PhotoExportProgress) => void
): Promise<void> => {
  const zip = new JSZip();
  const manifest: any[] = [];
  let photoCount = 0;

  for (const item of items) {
    try {
      const localPhotos = await photoStorage.getPhotosByItemId(item.id);
      const allPhotoUrls = [...(item.images || [])];
      
      if (!allPhotoUrls.length) continue;
      
      const itemFolder = sanitizeFilename(item.name);
      let photoIndex = 1;

      for (const photoUrl of allPhotoUrls) {
        try {
          onProgress?.({ current: photoCount, total: items.length * 3, itemName: item.name });
          
          let blob: Blob;
          if (photoUrl.startsWith('data:')) {
            blob = dataUrlToBlob(photoUrl);
          } else {
            blob = await fetchPhotoAsBlob(photoUrl);
          }

          const ext = blob.type.split('/')[1] || 'jpg';
          let filename = options.metadataInFilename
            ? `${itemFolder}_${sanitizeFilename(item.serialNumber || 'no_sn')}_${photoIndex}.${ext}`
            : `photo_${photoIndex}.${ext}`;

          zip.folder(itemFolder)?.file(filename, blob);

          if (options.generateManifest) {
            manifest.push({
              item_name: item.name,
              serial_number: item.serialNumber || '',
              photo_filename: `${itemFolder}/${filename}`,
              photo_index: photoIndex,
              date_captured: new Date().toISOString()
            });
          }

          photoIndex++;
          photoCount++;
        } catch (error) {
          console.error(`Failed to export photo for ${item.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to process item ${item.name}:`, error);
    }
  }

  if (options.generateManifest && manifest.length > 0) {
    const csv = generateManifestCSV(manifest);
    zip.file('manifest.csv', csv);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_photos_${new Date().toISOString().split('T')[0]}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};

const generateManifestCSV = (manifest: any[]): string => {
  const headers = ['Item Name', 'Serial Number', 'Photo Filename', 'Photo Index', 'Date Captured'];
  const rows = manifest.map(m => [
    m.item_name, m.serial_number, m.photo_filename, m.photo_index, m.date_captured
  ].map(v => `"${v}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
};
