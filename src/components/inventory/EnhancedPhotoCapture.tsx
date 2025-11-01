import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logError } from '@/lib/errorHandler';

interface EnhancedPhotoCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  allowMultiple?: boolean;
}

export const EnhancedPhotoCapture: React.FC<EnhancedPhotoCaptureProps> = ({ 
  onCapture, 
  onClose, 
  allowMultiple = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS/iPad
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        const errorMsg = 'Camera not supported in this browser';
        setError(errorMsg);
        logError(new Error(errorMsg), { component: 'EnhancedPhotoCapture', action: 'startCamera' });
        toast.error(errorMsg);
        return;
      }

      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // iOS requires play() to be called
        await videoRef.current.play();
        setStream(mediaStream);
        setCameraActive(true);
        setError(null);
        toast.success('Camera ready');
      }
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access in your browser settings.' 
        : 'Camera unavailable. Please check your device settings.';
      setError(errorMsg);
      logError(err, { 
        component: 'EnhancedPhotoCapture', 
        action: 'startCamera',
        errorName: err.name 
      });
      toast.error(errorMsg);
    }
  };

  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video or canvas not available');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ensure video is playing
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        toast.error('Camera not ready. Please wait a moment.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPreview(dataUrl);
      stopCamera();
      toast.success('Photo captured');
    } catch (err: any) {
      logError(err, { component: 'EnhancedPhotoCapture', action: 'capturePhoto' });
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraActive(false);
  };

  const handleSave = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
      startCamera();
      toast.success('Photo saved');
    }
  };

  const handleSaveAndExit = () => {
    if (preview) {
      onCapture(preview);
      toast.success('Photo saved');
      onClose();
    }
  };

  const handleRetake = () => {
    setPreview(null);
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700">
        <h2 className="text-white text-lg font-bold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Capture Photo
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-2">{error}</p>
            <Button onClick={startCamera} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain" 
          />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="max-w-full max-h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* iOS-specific instructions */}
            {isIOS && cameraActive && (
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-white bg-black/70 px-4 py-2 rounded inline-block">
                  Tap the button below to take photo
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        {preview ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleRetake} 
              variant="outline" 
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            {allowMultiple && (
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Save & Continue
              </Button>
            )}
            <Button 
              onClick={handleSaveAndExit} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {allowMultiple ? 'Save & Exit' : 'Save'}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={capturePhoto} 
            disabled={!cameraActive}
            className="w-full h-16 text-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700"
          >
            <Camera className="w-6 h-6 mr-2" />
            Take Photo
          </Button>
        )}
      </div>
    </div>
  );
};
