// Mobile App Bridge for communication between web and mobile apps
interface MobileBridgeMessage {
  type: string;
  payload: any;
  timestamp: number;
}

class MobileBridge {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isNativeApp: boolean = false;
  private messageQueue: MobileBridgeMessage[] = [];

  constructor() {
    // Check if running in a mobile app context
    this.isNativeApp = this.checkNativeApp();
    this.setupBridge();
  }

  private checkNativeApp(): boolean {
    // Check for native app indicators
    return !!(
      (window as any).ReactNativeWebView ||
      (window as any).webkit?.messageHandlers ||
      (window as any).Android
    );
  }

  private setupBridge() {
    // Listen for messages from native app
    window.addEventListener('message', this.handleNativeMessage.bind(this));
    
    // For React Native WebView
    if ((window as any).ReactNativeWebView) {
      console.log('React Native WebView detected');
    }
    
    // For iOS WKWebView
    if ((window as any).webkit?.messageHandlers) {
      console.log('iOS WKWebView detected');
    }
    
    // For Android WebView
    if ((window as any).Android) {
      console.log('Android WebView detected');
    }
  }

  private handleNativeMessage(event: MessageEvent) {
    try {
      // Ignore empty or invalid messages
      if (!event.data || event.data === '') {
        return;
      }

      // Only process messages in native app context
      if (!this.isNativeApp) {
        return;
      }

      let message;
      if (typeof event.data === 'string') {
        // Validate JSON string before parsing
        const trimmed = event.data.trim();
        if (!trimmed || trimmed.length === 0) {
          return;
        }
        message = JSON.parse(trimmed);
      } else {
        message = event.data;
      }

      // Validate message structure
      if (message && typeof message === 'object' && message.type && message.payload !== undefined) {
        this.emit(message.type, message.payload);
      }
    } catch (error) {
      // Silently ignore parsing errors in non-native contexts
      if (this.isNativeApp) {
        console.error('Error handling native message:', error);
      }
    }
  }


  // Send message to native app
  public sendToNative(type: string, payload: any) {
    const message: MobileBridgeMessage = {
      type,
      payload,
      timestamp: Date.now()
    };

    if (!this.isNativeApp) {
      this.messageQueue.push(message);
      console.log('Message queued (not in native app):', message);
      return;
    }

    const messageString = JSON.stringify(message);

    // React Native WebView
    if ((window as any).ReactNativeWebView?.postMessage) {
      (window as any).ReactNativeWebView.postMessage(messageString);
    }
    
    // iOS WKWebView
    else if ((window as any).webkit?.messageHandlers?.appBridge) {
      (window as any).webkit.messageHandlers.appBridge.postMessage(message);
    }
    
    // Android WebView
    else if ((window as any).Android?.receiveMessage) {
      (window as any).Android.receiveMessage(messageString);
    }
  }

  // Subscribe to messages from native
  public on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  // Unsubscribe from messages
  public off(type: string, callback: (data: any) => void) {
    this.listeners.get(type)?.delete(callback);
  }

  // Emit event to all listeners
  private emit(type: string, data: any) {
    this.listeners.get(type)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${type}:`, error);
      }
    });
  }

  // Check if running in native app
  public get isNative(): boolean {
    return this.isNativeApp;
  }

  // Get queued messages (for debugging)
  public getQueuedMessages(): MobileBridgeMessage[] {
    return [...this.messageQueue];
  }

  // Clear message queue
  public clearQueue() {
    this.messageQueue = [];
  }

  // Native app capabilities
  public async requestCameraPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isNativeApp) {
        resolve(true); // In web, permission handled by browser
        return;
      }

      const requestId = Date.now().toString();
      
      this.on(`camera-permission-${requestId}`, (granted: boolean) => {
        this.off(`camera-permission-${requestId}`, () => {});
        resolve(granted);
      });

      this.sendToNative('request-camera-permission', { requestId });
    });
  }

  public async scanBarcode(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.isNativeApp) {
        resolve(null); // Use web scanner
        return;
      }

      const requestId = Date.now().toString();
      
      this.on(`barcode-result-${requestId}`, (barcode: string | null) => {
        this.off(`barcode-result-${requestId}`, () => {});
        resolve(barcode);
      });

      this.sendToNative('scan-barcode', { requestId });
    });
  }

  public async shareData(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!this.isNativeApp && navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();
      
      this.on(`share-result-${requestId}`, (success: boolean) => {
        this.off(`share-result-${requestId}`, () => {});
        resolve(success);
      });

      this.sendToNative('share', { ...data, requestId });
    });
  }

  public vibrate(pattern: number | number[] = 200) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    } else if (this.isNativeApp) {
      this.sendToNative('vibrate', { pattern });
    }
  }

  public setStatusBarColor(color: string) {
    if (this.isNativeApp) {
      this.sendToNative('set-status-bar', { color });
    }
  }

  public enableOfflineMode(enabled: boolean) {
    this.sendToNative('offline-mode', { enabled });
  }
}

// Create singleton instance
export const mobileBridge = new MobileBridge();

// Export types for TypeScript
export type { MobileBridgeMessage };