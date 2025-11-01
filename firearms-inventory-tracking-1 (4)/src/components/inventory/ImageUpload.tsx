import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('firearm-images')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleFiles = async (files: FileList) => {
    if (images.length >= maxImages) {
      toast({ title: 'Maximum images reached', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
      try {
        const url = await uploadImage(files[i]);
        newImages.push(url);
      } catch (error) {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    }
    onImagesChange([...images, ...newImages]);
    setUploading(false);
  };

  useEffect(() => {
    let dragCounter = 0;
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) setIsDragging(false);
    };
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    };
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const removeImage = async (url: string) => {
    const path = url.split('/').pop();
    if (path) await supabase.storage.from('firearm-images').remove([path]);
    onImagesChange(images.filter(img => img !== url));
  };

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg p-8 m-4 max-w-md text-center">
            <Upload className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <p className="text-lg font-semibold">Drop your images here</p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Drag and drop images or</p>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            id="file-upload"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading || images.length >= maxImages}
          />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" className="mt-2" disabled={uploading || images.length >= maxImages} asChild>
              <span className="cursor-pointer">{uploading ? 'Uploading...' : 'Select Files / Take Photo'}</span>
            </Button>
          </label>
          <p className="mt-1 text-xs text-gray-500">{images.length}/{maxImages} images</p>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-20 object-contain rounded-lg bg-slate-900" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
