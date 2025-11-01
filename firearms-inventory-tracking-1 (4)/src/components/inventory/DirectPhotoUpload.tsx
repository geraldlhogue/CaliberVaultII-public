import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DirectPhotoUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function DirectPhotoUpload({ images, onImagesChange, maxImages = 10 }: DirectPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.info('Uploading photo...');

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('firearm-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
      
      onImagesChange([...images, data.publicUrl]);
      toast.success('✅ Photo saved successfully!');
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url: string) => {
    const path = url.split('/').pop();
    if (path) {
      await supabase.storage.from('firearm-images').remove([path]);
    }
    onImagesChange(images.filter(img => img !== url));
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-4">
      <div className="border-4 border-dashed border-blue-500 rounded-lg p-8 bg-blue-950/30">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          id="direct-camera-input"
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="direct-camera-input" className="block">
          <Button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-xl font-bold"
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span className="cursor-pointer flex items-center justify-center gap-3">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-8 w-8" />
                  📸 Take Photo ({images.length}/{maxImages})
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="text-center text-sm text-slate-400 mt-3">
          Tap button → Take/Select photo → Photo auto-saves
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Saved Photos ({images.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group border-2 border-green-500 rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Photo ${idx + 1}`} 
                  className="w-full h-24 object-cover bg-slate-900" 
                />

                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs py-1 text-center">
                  ✓ Saved
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
