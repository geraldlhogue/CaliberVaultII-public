import { supabase } from '@/lib/supabase';

export interface UploadResult {
  path: string;
  url: string;
}

export interface UploadOptions {
  bucket: 'avatars' | 'documents' | 'exports' | 'firearm-images';
  folder?: string;
  fileName?: string;
  upsert?: boolean;
}

class StorageService {
  async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {

    const { bucket, folder, fileName, upsert = false } = options;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Generate file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const userFolder = folder || user.id;
    const filePath = `${userFolder}/${timestamp}-${sanitizedFileName}`;

    console.log(`[StorageService] Uploading to ${bucket}/${filePath}`);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert });

    if (error) {
      console.error(`[StorageService] Upload error:`, error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`[StorageService] Upload successful: ${publicUrl}`);

    return {
      path: data.path,
      url: publicUrl
    };
  }

  async uploadAvatar(file: File): Promise<UploadResult> {
    return this.uploadFile(file, { 
      bucket: 'avatars',
      upsert: true 
    });
  }

  async uploadDocument(file: File, folder?: string): Promise<UploadResult> {
    return this.uploadFile(file, { 
      bucket: 'documents',
      folder 
    });
  }

  async uploadExport(file: File): Promise<UploadResult> {
    return this.uploadFile(file, { 
      bucket: 'exports' 
    });
  }

  async uploadFirearmImage(file: File): Promise<UploadResult> {
    return this.uploadFile(file, { 
      bucket: 'firearm-images' 
    });
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error(`[StorageService] Delete error:`, error);
      throw error;
    }
  }

  async listFiles(bucket: string, folder?: string): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error(`[StorageService] List error:`, error);
      throw error;
    }

    return data || [];
  }
}

export const storageService = new StorageService();
export default storageService;

