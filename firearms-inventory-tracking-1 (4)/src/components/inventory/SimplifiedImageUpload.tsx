import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SimplifiedImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function SimplifiedImageUpload({ images, onImagesChange, maxImages = 10 }: SimplifiedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and Save button
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!pendingFile) return;
    
    setUploading(true);
    try {
      const fileExt = pendingFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('firearm-images')
        .upload(fileName, pendingFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
      
      onImagesChange([...images, data.publicUrl]);
      toast.success('Photo saved!');
      
      // Clear preview
      setPreviewImage(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to save photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPhoto = () => {
    setPreviewImage(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      {/* Preview with Save/Cancel */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <img src={previewImage} alt="Preview" className="max-h-[60vh] w-auto rounded-lg mb-4" />
          <div className="flex gap-4">
            <Button
              onClick={handleSavePhoto}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-xl"
            >
              <Check className="mr-2 h-6 w-6" />
              {uploading ? 'Saving...' : 'Save Photo'}
            </Button>
            <Button
              onClick={handleCancelPhoto}
              disabled={uploading}
              variant="destructive"
              className="px-8 py-6 text-xl"
            >
              <X className="mr-2 h-6 w-6" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Take Photo Button */}
      <div className="border-2 border-dashed border-yellow-500 rounded-lg p-6 bg-slate-900">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          id="camera-input"
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="camera-input">
          <Button
            type="button"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-6 text-lg"
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span className="cursor-pointer flex items-center justify-center">
              <Camera className="mr-2 h-6 w-6" />
              Take Photo ({images.length}/{maxImages})
            </span>
          </Button>
        </label>
      </div>

      {/* Saved Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-32 object-contain rounded-lg bg-slate-900 border-2 border-slate-700" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
