import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { toast } from '@/hooks/use-toast';
import { lookupBarcode } from '@/utils/barcodeUtils';
import { Camera, X, Loader2 } from 'lucide-react';

interface CameraUPCScannerProps {
  onCodeDetected: (code: string, productData?: any) => void;
  onClose?: () => void;
  continuous?: boolean;
}

export const CameraUPCScanner: React.FC<CameraUPCScannerProps> = ({ 
  onCodeDetected, 
  onClose,
  continuous = false
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get video devices using native API
      let videoInputDevices: MediaDeviceInfo[] = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoInputDevices = devices.filter(device => device.kind === 'videoinput');
      } catch (err) {
        console.warn('Could not enumerate devices:', err);
      }
      
      if (videoInputDevices.length === 0) {
        setError('No camera found. Please ensure camera permissions are granted.');
        setIsScanning(false);
        return;
      }

      // Prefer back camera on mobile
      const backCamera = videoInputDevices.find(device => 
        device.label && device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0];

      const deviceId = backCamera?.deviceId;
      
      // Start decoding
      reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (result, err) => {
          if (result) {
            const code = result.getText();
            console.log('📷 Barcode detected:', code);
            
            if (!continuous) {
              stopScanning();
            }
            
            setIsLookingUp(true);
            
            try {
              const { item, response, fromCache } = await lookupBarcode(code);
              
              setIsLookingUp(false);
              
              if (response.success && item) {
                toast({
                  title: fromCache ? "Product Found (Cached)! ⚡" : "Product Found!",
                  description: `${item.manufacturer} ${item.model || item.name}${fromCache ? ' - Loaded from cache' : ''}`
                });
                onCodeDetected(code, item);
              } else {
                toast({
                  title: "Barcode Scanned",
                  description: "Code: " + code + " (No product data found)"
                });
                onCodeDetected(code);
              }
            } catch (lookupError) {
              console.error('Lookup error:', lookupError);
              setIsLookingUp(false);
              onCodeDetected(code);
            }
            
            if (continuous) {
              setTimeout(() => setIsLookingUp(false), 1000);
            }
          }
        }
      );
    } catch (error: any) {
      console.error('Scanner error:', error);
      const errorMsg = error?.message || 'Failed to start camera';
      setError(errorMsg);
      toast({
        title: "Scanner Error",
        description: errorMsg,
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (e) {
        console.warn('Error resetting scanner:', e);
      }
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-3">
      {!isScanning && !isLookingUp && (
        <button
          type="button"
          onClick={startScanning}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Scan UPC with Camera
        </button>
      )}

      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isScanning || isLookingUp) && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          {isScanning && (
            <>
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
              />
              <button
                type="button"
                onClick={() => {
                  stopScanning();
                  onClose?.();
                }}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-center">
                <p className="text-sm">Position barcode in center of frame</p>
              </div>
            </>
          )}
          
          {isLookingUp && (
            <div className="flex items-center justify-center h-64 bg-slate-900">
              <div className="text-center text-white">
                <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                <p>Looking up product...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
