/**
 * Download helper utilities for cross-browser file downloads
 */

/**
 * Check if we're in an iframe or cross-origin context
 */
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // Cross-origin iframe will throw an error
    return true;
  }
}

/**
 * Download a file using the most appropriate method for the current context
 */
export async function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string = 'text/plain'
): Promise<void> {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  
  // Check if we're in an iframe or if File System Access API is not available
  if (isInIframe() || !('showSaveFilePicker' in window)) {
    // Use traditional download method
    downloadWithAnchor(blob, filename);
    return;
  }
  
  // Try to use File System Access API
  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: 'Files',
        accept: { [mimeType]: [`.${filename.split('.').pop()}`] }
      }]
    });
    
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error: any) {
    // Fall back to anchor download if user cancels or API fails
    if (error?.name !== 'AbortError') {
      console.warn('File System Access API failed, using fallback:', error);
    }
    downloadWithAnchor(blob, filename);
  }
}

/**
 * Traditional download method using anchor element
 */
function downloadWithAnchor(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy content to clipboard as fallback
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * Check if browser supports downloads
 */
export function canDownload(): boolean {
  return !!(document.createElement('a').download !== undefined);
}