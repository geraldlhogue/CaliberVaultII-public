import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface SimpleBarcodeScannerProps {
  onClose: () => void;
  onScan?: (code: string) => void;
}

export const SimpleBarcodeScanner: React.FC<SimpleBarcodeScannerProps> = ({
  onClose,
  onScan
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkPermissions();
    return () => {
      stopCamera();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if permissions API is available
      if (!navigator.permissions) {
        console.log('Permissions API not supported');
        return;
      }
      
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
      
      result.addEventListener('change', () => {
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
      });
    } catch (err) {
      console.log('Permission query not supported:', err);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setPermissionStatus('granted');
    } catch (err: any) {
      console.error('Camera error:', err);
      const errorMsg = err?.message || 'Failed to access camera';
      setError(`${errorMsg}. Please ensure camera permissions are enabled.`);
      setIsScanning(false);
      setPermissionStatus('denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim() && onScan) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Scan Barcode</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {permissionStatus === 'denied' && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Camera Permission Denied</p>
            <p className="text-sm">Please enable camera permissions in your browser settings to use the barcode scanner.</p>
          </div>
        )}

        <div className="bg-slate-900 rounded-lg mb-4 overflow-hidden">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-yellow-400 w-64 h-40 rounded-lg"></div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Camera size={64} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-400 mb-4">
                {permissionStatus === 'prompt' 
                  ? 'Click to request camera permission'
                  : 'Position barcode in camera view'}
              </p>
              <button
                onClick={startCamera}
                disabled={permissionStatus === 'denied'}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Start Camera
              </button>
            </div>
          )}
        </div>

        {isScanning && (
          <button
            onClick={stopCamera}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg mb-4 transition-colors"
          >
            Stop Camera
          </button>
        )}

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="border-t border-slate-700 pt-4">
          <form onSubmit={handleManualSubmit}>
            <label className="block text-slate-300 mb-2 font-medium">
              Manual Entry (Fallback)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode number"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-yellow-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-slate-500 text-center">
          Note: For actual barcode scanning, integrate with a barcode scanning library like QuaggaJS or ZXing
        </div>
      </div>
    </div>
  );
};
