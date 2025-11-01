import React, { useRef, useState } from 'react';

interface PhotoCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  allowMultiple?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onClose, allowMultiple = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera unavailable');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setPreview(canvas.toDataURL('image/jpeg', 0.8));
      stopCamera();
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
    }
  };

  const handleSaveAndExit = () => {
    if (preview) {
      onCapture(preview);
      onClose();
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 bg-slate-900 border-b-2 border-green-500">
        <h2 className="text-white text-lg font-bold">📸 Capture Photo [v2.0 UPDATED]</h2>
        <button onClick={onClose} className="text-white text-2xl font-bold hover:text-red-500">×</button>


      </div>
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white text-center p-4">
            <p className="text-xl mb-2">⚠️</p>
            <p>{error}</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full object-contain" />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>
      <div className="p-3 bg-slate-900 flex gap-2">
        {preview ? (
          <>
            <button onClick={() => { setPreview(null); startCamera(); }} className="flex-1 bg-slate-700 text-white py-2 rounded font-semibold">
              Retake
            </button>
            {allowMultiple && (
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold">
                Save
              </button>
            )}
            <button onClick={handleSaveAndExit} className="flex-1 bg-yellow-600 text-white py-2 rounded font-semibold">
              {allowMultiple ? 'Save & Exit' : 'OK'}
            </button>
          </>
        ) : (
          <button onClick={capturePhoto} disabled={!cameraActive} className="flex-1 bg-yellow-600 disabled:bg-slate-700 text-white py-2 rounded font-semibold">
            📷 Capture
          </button>
        )}
      </div>
    </div>
  );
};
