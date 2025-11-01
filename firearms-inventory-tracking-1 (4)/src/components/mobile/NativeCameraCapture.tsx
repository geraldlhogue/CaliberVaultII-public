import { useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { nativeCameraService } from '@/services/mobile/NativeCameraService';
import { capacitorBridge } from '@/lib/capacitorBridge';
import { toast } from 'sonner';

interface NativeCameraCaptureProps {
  onPhotoCapture: (dataUrl: string) => void;
  itemId?: string;
  autoUpload?: boolean;
}

export function NativeCameraCapture({ onPhotoCapture, itemId, autoUpload = false }: NativeCameraCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);

  const handleCapture = async (source: 'camera' | 'gallery') => {
    setShowSourceDialog(false);
    setLoading(true);

    try {
      await capacitorBridge.vibrate('light');

      if (autoUpload && itemId) {
        const url = await nativeCameraService.captureAndUpload(itemId, source);
        onPhotoCapture(url);
        toast.success('Photo uploaded successfully');
      } else {
        const photo = await nativeCameraService.capturePhoto(source);
        onPhotoCapture(photo.dataUrl);
        toast.success('Photo captured');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to capture photo');
    } finally {
      setLoading(false);
    }
  };

  const openSourceDialog = () => {
    if (capacitorBridge.isNative()) {
      setShowSourceDialog(true);
    } else {
      // Fallback to web camera
      handleCapture('camera');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={openSourceDialog}
        disabled={loading}
      >
        <Camera className="w-4 h-4 mr-2" />
        {loading ? 'Capturing...' : 'Take Photo'}
      </Button>

      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Photo Source</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={() => handleCapture('camera')}
              className="h-24 flex flex-col gap-2"
            >
              <Camera className="w-8 h-8" />
              <span>Camera</span>
            </Button>
            <Button
              onClick={() => handleCapture('gallery')}
              variant="outline"
              className="h-24 flex flex-col gap-2"
            >
              <ImagePlus className="w-8 h-8" />
              <span>Gallery</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
