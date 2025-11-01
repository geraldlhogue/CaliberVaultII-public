import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhotoCapture } from './PhotoCapture';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan?: (code: string) => void;
  onPhotoCapture?: (dataUrl: string) => void;
  mode?: 'barcode' | 'photo';
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onClose, 
  onScan, 
  onPhotoCapture,
  mode: initialMode = 'barcode' 
}) => {
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<'barcode' | 'photo'>(initialMode);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (mode === 'barcode' && scanning) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [scanning, mode]);

  const startScanning = async () => {
    try {
      setError('');
      
      // First, explicitly request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        // Stop the stream immediately - we just needed to trigger permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error('Camera permission denied:', permissionError);
        setError('Camera permission denied. Please allow camera access and try again.');
        setScanning(false);
        return;
      }
      
      // Now initialize the scanner
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.7777778,
          // Add these options to ensure camera permission is requested
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true
        },
        false
      );
      
      scanner.render(
        (decodedText) => {
          if (decodedText && decodedText !== lastScanned) {
            setLastScanned(decodedText);
            if (onScan) {
              onScan(decodedText);
            }
          }
        },
        (errorMessage) => {
          // Only log non-trivial errors
          if (!errorMessage.includes('NotFoundException')) {
            console.log('Scan error:', errorMessage);
          }
        }
      );
      
      scannerRef.current = scanner;
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please ensure camera permissions are enabled.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim() && onScan) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const handlePhotoCapture = (dataUrl: string) => {
    if (onPhotoCapture) {
      onPhotoCapture(dataUrl);
    }
    setShowCamera(false);
  };

  if (showCamera && mode === 'photo') {
    return <PhotoCapture onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'barcode' ? 'Scan Barcode' : 'Capture Photo'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        
        {mode === 'barcode' ? (
          <>
            <div className="bg-slate-900 rounded-lg mb-4 overflow-hidden">
              {scanning ? (
                <div id="reader" className="w-full"></div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-slate-400 mb-4">Position barcode in camera view</p>
                  <button 
                    onClick={() => setScanning(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg"
                  >
                    Start Camera
                  </button>
                </div>
              )}
              {error && (
                <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 text-sm">
                  {error}
                </div>
              )}
            </div>
            {scanning && (
              <button 
                onClick={() => { setScanning(false); stopScanning(); }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg mb-4"
              >
                Stop Camera
              </button>
            )}
            <form onSubmit={handleManualSubmit}>
              <label className="block text-slate-300 mb-2 font-medium">Manual UPC Entry</label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter barcode number"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4"
              />
              <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg">
                Add Item
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => setShowCamera(true)} 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
            >
              📷 Open Camera
            </button>
            <p className="text-slate-400 text-sm text-center">Take photos of your firearm for documentation</p>
          </div>
        )}
      </div>
    </div>
  );
};
